// ===================== JEZGRO: razlomci, notifikacije, pomoćne funkcije =====================
"use strict";

function bgcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a; }

class Frac {
  constructor(n, d = 1n) {
    n = BigInt(n); d = BigInt(d);
    if (d === 0n) throw new MathErr("Dijeljenje nulom.");
    if (d < 0n) { n = -n; d = -d; }
    const g = bgcd(n, d) || 1n;
    this.n = n / g; this.d = d / g;
  }
  static of(x) {
    if (x instanceof Frac) return x;
    if (typeof x === "bigint") return new Frac(x, 1n);
    if (typeof x === "number") {
      if (Number.isInteger(x)) return new Frac(BigInt(x), 1n);
      return Frac.parse(String(x));
    }
    return Frac.parse(String(x));
  }
  static parse(s) {
    s = String(s).trim().replace(",", ".");
    let m = s.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
    if (m) return new Frac(BigInt(m[1]), BigInt(m[2]));
    m = s.match(/^([+-]?)(\d*)\.?(\d*)$/);
    if (!m || (m[2] === "" && m[3] === "")) throw new MathErr("Nije broj: " + s);
    const sign = m[1] === "-" ? -1n : 1n;
    const ip = BigInt(m[2] || "0"), fp = m[3] || "";
    const den = 10n ** BigInt(fp.length);
    return new Frac(sign * (ip * den + BigInt(fp || "0")), den);
  }
  add(o) { o = Frac.of(o); return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = Frac.of(o); return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { o = Frac.of(o); return new Frac(this.n * o.n, this.d * o.d); }
  div(o) { o = Frac.of(o); if (o.n === 0n) throw new MathErr("Dijeljenje nulom."); return new Frac(this.n * o.d, this.d * o.n); }
  neg() { return new Frac(-this.n, this.d); }
  pow(k) {
    k = Number(k);
    if (!Number.isInteger(k)) throw new MathErr("Eksponent mora biti cijeli broj.");
    if (Math.abs(k) > 4000) throw new MathErr("Eksponent je prevelik.");
    if (k < 0) return Frac.of(1).div(this.pow(-k));
    return new Frac(this.n ** BigInt(k), this.d ** BigInt(k));
  }
  cmp(o) { o = Frac.of(o); const a = this.n * o.d, b = o.n * this.d; return a < b ? -1 : a > b ? 1 : 0; }
  eq(o) { return this.cmp(o) === 0; }
  isZero() { return this.n === 0n; }
  isInt() { return this.d === 1n; }
  sign() { return this.n < 0n ? -1 : this.n > 0n ? 1 : 0; }
  abs() { return this.n < 0n ? this.neg() : this; }
  toNumber() { return Number(this.n) / Number(this.d); }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}

class MathErr extends Error {}

// ---------- DOM pomoćnici ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function notify(msg, type = "warn") {
  let box = $("#toasts");
  const t = document.createElement("div");
  t.className = "toast " + type;
  t.innerHTML = `<span class="ti">${type === "err" ? "✖" : type === "ok" ? "✔" : "⚠"}</span><span>${esc(msg)}</span>`;
  t.onclick = () => t.remove();
  box.appendChild(t);
  setTimeout(() => t.classList.add("out"), 6500);
  setTimeout(() => t.remove(), 7000);
}

// Pokreni rješavač, uhvati greške i prikaži ih kao notifikaciju
function runSafe(outEl, fn) {
  try {
    const html = fn();
    if (html !== undefined) outEl.innerHTML = html;
    outEl.classList.add("show");
    outEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (e) {
    outEl.innerHTML = `<div class="bad">✖ ${esc(e.message || e)}</div>`;
    outEl.classList.add("show");
    notify(e.message || String(e), e instanceof MathErr ? "warn" : "err");
    if (!(e instanceof MathErr)) console.error(e);
  }
}

// Ubacivanje simbola na poziciju kursora
function insertAtCursor(input, text) {
  const s = input.selectionStart ?? input.value.length, e = input.selectionEnd ?? s;
  input.value = input.value.slice(0, s) + text + input.value.slice(e);
  input.focus();
  input.selectionStart = input.selectionEnd = s + text.length;
}
function symbolBar(targetSel, symbols) {
  return `<div class="symbar" data-target="${targetSel}">${symbols.map(s => `<button type="button" class="sym" data-s="${esc(s)}">${esc(s)}</button>`).join("")}</div>`;
}
document.addEventListener("click", ev => {
  const b = ev.target.closest(".sym");
  if (!b) return;
  const bar = b.closest(".symbar");
  const inp = $(bar.dataset.target);
  if (inp) insertAtCursor(inp, b.dataset.s);
});

// Lista elemenata skupa: "1, 2, a" ili "{1,2,a}"
function parseList(s) {
  s = String(s).trim().replace(/^\{/, "").replace(/\}$/, "").trim();
  if (!s) return [];
  const out = [];
  for (let x of s.split(/[,;]\s*|\s+/)) { x = x.trim(); if (x && !out.includes(x)) out.push(x); }
  return out;
}
// Parovi: "(1,a),(2,b)" ili "1a 2b"? -> podržavamo (x,y) zapis
function parsePairs(s) {
  const out = [];
  const re = /\(\s*([^,()]+?)\s*,\s*([^,()]+?)\s*\)/g;
  let m, any = false;
  while ((m = re.exec(s))) { any = true; const p = [m[1].trim(), m[2].trim()]; if (!out.some(q => q[0] === p[0] && q[1] === p[1])) out.push(p); }
  const rest = s.replace(re, "").replace(/[\s,;{}.]/g, "");
  if (rest.length) throw new MathErr("Parove upiši u obliku (x,y), npr. (1,a), (2,b). Ne razumijem dio: \"" + rest.slice(0, 20) + "\"");
  if (!any && s.trim()) throw new MathErr("Nisam pronašao nijedan par oblika (x,y).");
  return out;
}
const setStr = arr => "{" + arr.join(", ") + "}";
const pairStr = p => `(${p[0]}, ${p[1]})`;
function sortElems(arr) {
  return arr.slice().sort((a, b) => {
    const na = Number(a), nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return String(a).localeCompare(String(b));
  });
}
const sup = n => String(n).replace(/[-0-9]/g, c => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(c)]);
