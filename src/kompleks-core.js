// ===================== JEZGRO ZA KOMPLEKSNE BROJEVE =====================
// Tačno računanje sa korijenima (npr. 1/2 + √3/2·i), uglovi kao racionalni umnošci od π, crtež kompleksne ravni.
"use strict";

FUNCS.push("conj", "re", "im");

function sqfree(n) { // n = s²·k, k bez kvadrata
  let s = 1n, k = 1n, m = n;
  for (let p = 2n; p * p <= m && p < 20000n; p++) {
    let c = 0; while (m % p === 0n) { m /= p; c++; }
    if (c) { if (c % 2) k *= p; s *= p ** BigInt(c >> 1); }
  }
  return [s, k * m];
}

// Realni broj oblika  q₀ + q₁√k₁ + q₂√k₂ + …  (qᵢ razlomci, kᵢ bez kvadrata)
class Sd {
  constructor(entries = []) { this.t = new Map(); for (const [k, v] of entries) this._add(k, v); }
  _add(k, v) { k = String(k); const c = (this.t.get(k) || Frac.of(0)).add(v); if (c.isZero()) this.t.delete(k); else this.t.set(k, c); }
  static of(x) { return new Sd([["1", Frac.of(x)]]); }
  static sqrtQ(q) {
    q = Frac.of(q);
    if (q.sign() < 0) throw new MathErr("Korijen negativnog broja nije realan.");
    if (q.isZero()) return new Sd();
    const [s, k] = sqfree(q.n * q.d);
    return new Sd([[k, new Frac(s, q.d)]]);
  }
  clone() { return new Sd([...this.t]); }
  add(o) { const r = this.clone(); for (const [k, v] of o.t) r._add(k, v); return r; }
  neg() { return new Sd([...this.t].map(([k, v]) => [k, v.neg()])); }
  sub(o) { return this.add(o.neg()); }
  scale(f) { f = Frac.of(f); return new Sd([...this.t].map(([k, v]) => [k, v.mul(f)])); }
  mul(o) {
    const r = new Sd();
    for (const [k1, c1] of this.t) for (const [k2, c2] of o.t) {
      const a = BigInt(k1), b = BigInt(k2), g = bgcd(a, b);
      r._add(String((a / g) * (b / g)), c1.mul(c2).mul(new Frac(g)));
    }
    return r;
  }
  isZero() { return this.t.size === 0; }
  isRat() { return this.isZero() || (this.t.size === 1 && this.t.has("1")); }
  rat() { return this.t.get("1") || Frac.of(0); }
  terms() { return this.t.size; }
  inv() {
    if (this.isZero()) throw new MathErr("Dijeljenje nulom.");
    const T = [...this.t];
    if (T.length === 1) { const [k, c] = T[0]; const K = BigInt(k); return new Sd([[k, Frac.of(1).div(c.mul(new Frac(K)))]]); }
    if (T.length === 2) { // (x + y)⁻¹ = (x − y) / (x² − y²)
      const x = new Sd([T[0]]), y = new Sd([T[1]]);
      const den = x.mul(x).sub(y.mul(y));
      return x.sub(y).scale(Frac.of(1).div(den.rat()));
    }
    throw new MathErr("Imenilac sa više od dva korijena nije podržan.");
  }
  div(o) { return this.mul(o.inv()); }
  num() { let s = 0; for (const [k, c] of this.t) s += c.toNumber() * Math.sqrt(Number(k)); return s; }
  eq(o) { return this.sub(o).isZero(); }
  sign() { const v = this.num(); return Math.abs(v) < 1e-12 ? 0 : Math.sign(v); }
  isOne() { return this.eq(Sd.of(1)); }
  pow(n) { let r = Sd.of(1); for (let i = 0; i < n; i++) r = r.mul(this); return r; }
  // ispis
  _sorted() { return [...this.t].sort((a, b) => (b[1].sign() > 0) - (a[1].sign() > 0) || (BigInt(a[0]) < BigInt(b[0]) ? -1 : 1)); }
  toString() {
    if (this.isZero()) return "0";
    const T = this._sorted();
    const dens = T.map(([, c]) => c.d);
    const common = T.length > 1 && dens.every(d => d === dens[0]) && dens[0] > 1n;
    const one = ([k, c], first, D) => {
      const n = D ? c.n : c.n, d = D ? 1n : c.d;
      const neg = n < 0n, an = neg ? -n : n;
      let s;
      if (k === "1") s = d === 1n ? `${an}` : `${an}/${d}`;
      else s = `${an === 1n ? "" : an}√${k}${d === 1n ? "" : "/" + d}`;
      return first ? (neg ? "−" : "") + s : (neg ? " − " : " + ") + s;
    };
    if (common) return `(${T.map((t, i) => one(t, i === 0, true)).join("")})/${dens[0]}`;
    return T.map((t, i) => one(t, i === 0, false)).join("");
  }
  isNeg1Term() { return this.terms() === 1 && this.sign() < 0; }
  // za upotrebu kao faktor/dio izraza
  paren() { const s = this.toString(); return this.terms() > 1 || this.sign() < 0 ? `(${s})` : s; }
}
const fS = s => s.toString();

// Kompleksan broj a + bi (a, b ∈ Sd)
class Cx {
  constructor(re = new Sd(), im = new Sd()) { this.re = re instanceof Sd ? re : Sd.of(re); this.im = im instanceof Sd ? im : Sd.of(im); }
  static I() { return new Cx(new Sd(), Sd.of(1)); }
  add(o) { return new Cx(this.re.add(o.re), this.im.add(o.im)); }
  sub(o) { return new Cx(this.re.sub(o.re), this.im.sub(o.im)); }
  neg() { return new Cx(this.re.neg(), this.im.neg()); }
  mul(o) { return new Cx(this.re.mul(o.re).sub(this.im.mul(o.im)), this.re.mul(o.im).add(this.im.mul(o.re))); }
  conj() { return new Cx(this.re, this.im.neg()); }
  norm2() { return this.re.mul(this.re).add(this.im.mul(this.im)); }
  div(o) {
    const n = o.norm2(); if (n.isZero()) throw new MathErr("Dijeljenje nulom (imenilac je 0).");
    const t = this.mul(o.conj()), inv = n.inv();
    return new Cx(t.re.mul(inv), t.im.mul(inv));
  }
  scale(s) { return new Cx(this.re.mul(s), this.im.mul(s)); }
  isZero() { return this.re.isZero() && this.im.isZero(); }
  isReal() { return this.im.isZero(); }
  eq(o) { return this.sub(o).isZero(); }
  num() { return [this.re.num(), this.im.num()]; }
  pow(n) {
    if (n < 0) return new Cx(Sd.of(1)).div(this.pow(-n));
    let r = new Cx(Sd.of(1)), b = this;
    while (n > 0) { if (n & 1) r = r.mul(b); b = b.mul(b); n >>= 1; }
    return r;
  }
  toString() { return cxStr(this.re, this.im); }
  paren() { const s = this.toString(); return (!this.re.isZero() && !this.im.isZero()) || /^−/.test(s) || /[+−]/.test(s.slice(1)) ? `(${s})` : s; }
}
function imPart(im, first) { // ispis imaginarnog dijela
  if (im.isZero()) return "";
  const neg = im.terms() === 1 && im.sign() < 0, a = neg ? im.neg() : im;
  let body;
  if (a.isOne()) body = "i";
  else if (a.terms() > 1) body = `(${a})i`;
  else if (a.isRat()) { const q = a.rat(); body = q.d === 1n ? `${q.n}i` : `${q} i`; }
  else body = /\//.test(a.toString()) ? `${a} i` : `${a}i`;
  if (a.terms() > 1 && !neg) return first ? body : " + " + body;
  return first ? (neg ? "−" : "") + body : (neg ? " − " : " + ") + body;
}
function cxStr(re, im) {
  if (re.isZero() && im.isZero()) return "0";
  if (im.isZero()) return re.toString();
  if (re.isZero()) return imPart(im, true);
  return re.toString() + imPart(im, false);
}

// ---------- uglovi: φ = k·π, k razlomak ----------
const S_ = n => Sd.sqrtQ(n);
const COS12 = [Sd.of(1), S_(6).add(S_(2)).scale(new Frac(1n, 4n)), S_(3).scale(new Frac(1n, 2n)), S_(2).scale(new Frac(1n, 2n)), Sd.of(new Frac(1n, 2n)), S_(6).sub(S_(2)).scale(new Frac(1n, 4n)), new Sd()];
function cos12(j) { j = ((j % 24) + 24) % 24; if (j <= 6) return COS12[j]; if (j <= 12) return COS12[12 - j].neg(); if (j <= 18) return COS12[j - 12].neg(); return COS12[24 - j]; }
const sin12 = j => cos12(6 - j);
function normK(k) { // u (−1, 1]
  k = Frac.of(k);
  let r = new Frac(((k.n % (2n * k.d)) + 2n * k.d) % (2n * k.d), k.d); // [0, 2)
  if (r.cmp(1) > 0) r = r.sub(2);
  return r;
}
function angStr(k) {
  k = Frac.of(k);
  if (k.isZero()) return "0";
  const n = k.n < 0n ? -k.n : k.n, s = k.n < 0n ? "−" : "";
  return `${s}${n === 1n ? "" : n}π${k.d === 1n ? "" : "/" + k.d}`;
}
function angDeg(k) { const d = Frac.of(k).mul(180); return (d.isInt() ? `${d}°` : `${d.toNumber().toFixed(2)}°`).replace("-", "−"); }
const angP = k => { const s = angStr(k); return s.startsWith("−") ? `(${s})` : s; };
const sqP = x => (x.isRat() && x.sign() >= 0) ? x.toString() : `(${x})`;
const denP = x => /^(\d+|√\d+)$/.test(x.toString()) ? x.toString() : `(${x})`;
function isStd(k) { k = Frac.of(k); return (12n % k.d) === 0n; } // umnožak od π/12
function cosK(k) { k = Frac.of(k); return isStd(k) ? cos12(Number(k.mul(12).n)) : null; }
function sinK(k) { k = Frac.of(k); return isStd(k) ? sin12(Number(k.mul(12).n)) : null; }
function modulus(z) { const n = z.norm2(); return n.isRat() ? Sd.sqrtQ(n.rat()) : null; }
function findArg(z) { // tačan glavni argument ako je umnožak od π/12
  const r = modulus(z); if (!r || r.isZero()) return null;
  const c = z.re.div(r), s = z.im.div(r);
  for (let j = -11; j <= 12; j++) if (cos12(j).eq(c) && sin12(j).eq(s)) return new Frac(BigInt(j), 12n);
  return null;
}
function quadrant(z) {
  const a = z.re.sign(), b = z.im.sign();
  if (a > 0 && b > 0) return "u I kvadrantu"; if (a < 0 && b > 0) return "u II kvadrantu";
  if (a < 0 && b < 0) return "u III kvadrantu"; if (a > 0 && b < 0) return "u IV kvadrantu";
  if (b === 0) return a > 0 ? "na pozitivnom dijelu realne ose" : "na negativnom dijelu realne ose";
  return b > 0 ? "na pozitivnom dijelu imaginarne ose" : "na negativnom dijelu imaginarne ose";
}

// ---------- parsiranje i izračunavanje izraza sa i ----------
function prepC(src) {
  return String(src).replace(/√\s*\(/g, "sqrt(").replace(/√\s*([0-9]+(?:\.[0-9]+)?)/g, "sqrt($1)").replace(/\bj\b/g, "i")
    .replace(/z̄|z̅/g, "conj(z)").replace(/·/g, "*");
}
function parseC(src, vars = []) { return parseExpr(prepC(src), ["i", ...vars]); }

// evalC: tačno izračunavanje; steps (opciono) skuplja korake, tips skuplja "brže" savjete
function evalC(n, env = {}, steps = null, tips = null) {
  const rec = (html) => { if (steps) steps.push(html); };
  const tip = (k) => { if (tips) tips.add(k); };
  switch (n.t) {
    case "num": return new Cx(Sd.of(n.v));
    case "var":
      if (n.n === "i") return Cx.I();
      if (n.n in env) return env[n.n];
      throw new MathErr("Nepoznata oznaka " + n.n);
    case "const": throw new MathErr(`Konstanta ${n.n} ovdje nije dozvoljena.`);
    case "neg": return evalC(n.a, env, steps, tips).neg();
    case "op": {
      if (n.op === "^") {
        const e = evalC(n.b, env, null, null);
        if (!e.isReal() || !e.re.isRat() || !e.re.rat().isInt()) throw new MathErr("Eksponent mora biti cijeli broj.");
        const k = Number(e.re.rat().n);
        if (Math.abs(k) > 5000) throw new MathErr("Eksponent je prevelik.");
        const base = evalC(n.a, env, steps, tips);
        return powStep(base, k, rec, tip, n.a);
      }
      const a = evalC(n.a, env, steps, tips), b = evalC(n.b, env, steps, tips);
      if (n.op === "+" || n.op === "-") {
        const r = n.op === "+" ? a.add(b) : a.sub(b);
        const full = x => !x.re.isZero() && !x.im.isZero();
        if (full(a) && full(b)) {
          const o = n.op === "+" ? "+" : "−";
          rec(`<span class="mono">${a.paren()} ${o} ${b.paren()} = (${a.re} ${o} ${b.re.paren()}) + (${a.im} ${o} ${b.im.paren()})i = <b>${r}</b></span> &nbsp;<span class="hint">(${n.op === "+" ? "sabiramo" : "oduzimamo"} realni sa realnim, imaginarni sa imaginarnim)</span>`);
        }
        return r;
      }
      if (n.op === "*") {
        const r = a.mul(b);
        if (!a.isReal() && !b.isReal()) {
          if (a.conj().eq(b)) { tip("conj"); rec(`<span class="mono">${a.paren()}${b.paren()} = ${a.re.paren()}² + ${a.im.paren()}² = <b>${r}</b></span> &nbsp;<span class="hint">(z·z̄ = a² + b²)</span>`); }
          else rec(mulSteps(a, b, r));
        } else if (steps && ((a.isReal() && !b.re.isZero() && !b.im.isZero()) || (b.isReal() && !a.re.isZero() && !a.im.isZero())) && !(a.isReal() && a.re.isOne()) && !(b.isReal() && b.re.isOne())) {
          rec(`<span class="mono">${a.paren()} · ${b.paren()} = <b>${r}</b></span>`);
        }
        const full = x => !x.re.isZero() && !x.im.isZero();
        if ((full(a) && b.eq(Cx.I())) || (full(b) && a.eq(Cx.I()))) tip("rot");
        return r;
      }
      if (n.op === "/") {
        if (b.isZero()) throw new MathErr("Dijeljenje nulom.");
        const r = a.div(b);
        if (!b.isReal()) { rec(divSteps(a, b, r)); tip("div"); }
        else if (steps && !a.isReal()) rec(`<span class="mono">${a.paren()} / ${b.paren()} = <b>${r}</b></span>`);
        return r;
      }
      throw new MathErr("Operacija mod ovdje nije dozvoljena.");
    }
    case "fn": {
      const a = evalC(n.args[0], env, steps, tips);
      if (n.f === "conj") { const r = a.conj(); rec(`<span class="mono">conj(${a}) = ${a} sa promijenjenim znakom imaginarnog dijela = <b>${r}</b></span>`); return r; }
      if (n.f === "re") return new Cx(a.re);
      if (n.f === "im") return new Cx(a.im);
      if (n.f === "abs") {
        const m = modulus(a);
        if (!m) throw new MathErr("Modul se ne može tačno izraziti (a² + b² nije racionalan).");
        rec(`<span class="mono">|${a}| = √(${sqP(a.re)}² + ${sqP(a.im)}²) = √(${a.norm2()}) = <b>${m}</b></span>`);
        if (pythTriple(a)) tip("pyth");
        return new Cx(m);
      }
      if (n.f === "sqrt") {
        if (!a.isReal() || !a.re.isRat()) throw new MathErr("Korijen je podržan samo za racionalan broj (npr. √3, √(−4)).");
        const q = a.re.rat();
        if (q.sign() >= 0) return new Cx(Sd.sqrtQ(q));
        const r = new Cx(new Sd(), Sd.sqrtQ(q.neg()));
        rec(`<span class="mono">√(${q}) = √(${q.neg()})·√(−1) = <b>${r}</b></span> &nbsp;<span class="hint">(√(−1) = i)</span>`);
        return r;
      }
      throw new MathErr(`Funkcija ${n.f} nije podržana u kompleksnom računu.`);
    }
  }
  throw new MathErr("Neispravan izraz (poređenja i logičke operacije ovdje nisu dozvoljene).");
}
function pythTriple(z) { const a = z.re, b = z.im; return a.isRat() && b.isRat() && a.rat().isInt() && b.rat().isInt() && !a.isZero() && !b.isZero() && modulus(z).isRat(); }

function termS(v, suffix, first) { // jedan sabirak sa znakom
  if (v.isZero()) return "";
  const neg = v.terms() === 1 && v.sign() < 0, a = neg ? v.neg() : v;
  const body = a.terms() > 1 ? `(${a})${suffix}` : (a.isOne() && suffix ? suffix : `${a}${suffix}`);
  return first ? (neg ? "−" : "") + body : (neg ? " − " : " + ") + body;
}
function joinTerms(list) { let s = "", first = true; for (const [v, suf] of list) { const t = termS(v, suf, first); if (t) { s += t; first = false; } } return s || "0"; }
function mulSteps(a, b, r) {
  const ac = a.re.mul(b.re), ad = a.re.mul(b.im), bc = a.im.mul(b.re), bd = a.im.mul(b.im);
  const l1 = joinTerms([[ac, ""], [ad, "i"], [bc, "i"], [bd, "i²"]]);
  const l2 = joinTerms([[ac, ""], [ad.add(bc), "i"], [bd.neg(), ""]]);
  return `<span class="mono">${a.paren()}${b.paren()} = ${l1} = ${l2} = <b>${r}</b></span> &nbsp;<span class="hint">(i² = −1)</span>`;
}
function divSteps(a, b, r) {
  const num = a.mul(b.conj()), den = b.norm2();
  return `<span class="mono">${a.paren()} / ${b.paren()} = ${a.paren()}${b.conj().paren()} / (${b.paren()}${b.conj().paren()}) = (${num}) / (${sqP(b.re)}² + ${sqP(b.im)}²) = (${num}) / ${den.paren()} = <b>${r}</b></span> &nbsp;<span class="hint">(proširujemo konjugovanim imeniocem)</span>`;
}
function powStep(base, k, rec, tip, baseAst) {
  // stepen jedinice i (ili ±i)
  if (base.re.isZero() && base.im.terms() === 1 && base.im.isRat() && base.im.rat().abs().eq(1)) {
    const res = base.pow(k);
    const q = Math.floor(k / 4), rr = ((k % 4) + 4) % 4;
    const nm = ["1", "i", "−1", "−i"][rr];
    if (base.im.sign() > 0) rec(`<span class="mono">i^${k} = i^(4·${q} + ${rr}) = (i⁴)^${q}·i^${rr} = 1·i^${rr} = <b>${nm}</b></span>`);
    else rec(`<span class="mono">(−i)^${k} = (−1)^${k}·i^${k} = <b>${res}</b></span>`);
    tip("ipow");
    return res;
  }
  const res = base.pow(k);
  if (base.isReal() || k === 0 || k === 1) return res;
  if (k < 0) { rec(`<span class="mono">${base.paren()}^(${k}) = 1 / ${base.paren()}^${-k} = <b>${res}</b></span>`); return res; }
  if (k === 2) {
    const a = base.re, b = base.im;
    rec(`<span class="mono">${base.paren()}² = ${joinTerms([[a.mul(a), ""], [a.mul(b).scale(2), "i"], [b.mul(b), "i²"]])} = <b>${res}</b></span> &nbsp;<span class="hint">((a+bi)² = a² + 2abi − b²)</span>`);
  } else if (k === 3) {
    const sq = base.pow(2);
    rec(`<span class="mono">${base.paren()}³ = ${base.paren()}²·${base.paren()} = ${sq.paren()}·${base.paren()} = <b>${res}</b></span>`);
  } else {
    const sq = base.pow(2);
    rec(`<span class="mono">${base.paren()}^${k}: ${base.paren()}² = ${sq} ⇒ ${base.paren()}^${k} = <b>${res}</b></span>`);
    tip("moivre");
  }
  if (base.re.isRat() && base.im.isRat() && base.re.rat().abs().eq(base.im.rat().abs())) tip("onePlusI");
  return res;
}

// ---------- jedan broj u algebarskom ILI trigonometrijskom obliku ----------
// vraća { z: Cx | null, r: Sd | null, k: Frac | null (ugao/π), rNum, phiNum, trig: bool, src }
function parseAngle(src) {
  const s = String(src).trim().replace(/π|pi/gi, "p").replace(/°/g, "*p/180").replace(/^\((.*)\)$/, "$1");
  try {
    const [a, b] = linearOf(s.replace(/(\d)\s*p/g, "$1*p"), "p");
    if (b.isZero()) return { k: a, num: a.toNumber() * Math.PI };
  } catch { }
  const v = evalNum(parseExpr(String(src).replace(/π/g, "pi").replace(/°/g, "*pi/180"), ["x"]), {});
  if (!isFinite(v)) throw new MathErr(`Ne razumijem ugao "${src}". Primjer: π/6, 2π/3, -π/4.`);
  return { k: null, num: v };
}
function parseZ(src) {
  const s = String(src).trim();
  const m = s.match(/^(.*?)\s*\*?\s*\(\s*cos\s*\(?\s*([^()]*?(?:\([^()]*\))?[^()]*?)\s*\)?\s*\+\s*i\s*\*?\s*sin\s*\(?\s*([^()]*?(?:\([^()]*\))?[^()]*?)\s*\)?\s*\)\s*$/i);
  if (m) {
    const rTxt = m[1].trim() || "1";
    const rz = evalC(parseC(rTxt));
    if (!rz.isReal() || rz.re.sign() < 0) throw new MathErr("Modul r mora biti nenegativan realan broj.");
    const A1 = parseAngle(m[2]), A2 = parseAngle(m[3]);
    if (Math.abs(A1.num - A2.num) > 1e-9) throw new MathErr("U trigonometrijskom obliku uglovi kod cos i sin moraju biti isti.");
    const r = rz.re;
    let z = null;
    if (A1.k && isStd(A1.k)) z = new Cx(r.mul(cosK(A1.k)), r.mul(sinK(A1.k)));
    return { z, r, k: A1.k, rNum: r.num(), phiNum: A1.num, trig: true, src: s };
  }
  const z = evalC(parseC(s));
  return { z, r: modulus(z), k: findArg(z), rNum: Math.hypot(...z.num()), phiNum: Math.atan2(z.num()[1], z.num()[0]), trig: false, src: s };
}
function trigStr(r, k, phiNum, rNum) {
  const rs = r ? (r.isOne() ? "" : r.paren()) : (rNum !== undefined ? (+rNum).toFixed(4) : "");
  const a = k !== null && k !== undefined ? angP(k) : `${(+phiNum).toFixed(4)}`;
  return `${rs}(cos ${a} + i sin ${a})`;
}
function numCxStr(x, y) { const f = v => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(4)).replace("-", "−"); if (Math.abs(y) < 1e-12) return f(x); return `${Math.abs(x) < 1e-12 ? "" : f(x)}${Math.abs(x) < 1e-12 ? (y < 0 ? "−" : "") : (y < 0 ? " − " : " + ")}${f(Math.abs(y))}i`; }

// ---------- crtež kompleksne ravni ----------
// pts: [{x, y, label, color, vec, proj}], arcs: [{phi, color, label, rr}], opts: {unit: bool}
function cplane(pts, arcs = [], opts = {}) {
  const W = 340, H = 340, pad = 26;
  let M = Math.max(1, ...pts.map(p => Math.max(Math.abs(p.x), Math.abs(p.y))));
  M *= 1.22;
  const raw = M / 4, p10 = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 5, 10].map(m => m * p10).find(s => s >= raw) || raw;
  const X = x => W / 2 + x / M * (W / 2 - pad), Y = y => H / 2 - y / M * (H / 2 - pad);
  let g = `<svg class="cplane" viewBox="0 0 ${W} ${H}" role="img" aria-label="Kompleksna ravan">`;
  g += `<defs><marker id="cpa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>`;
  for (let v = -Math.floor(M / step) * step; v <= M; v += step) {
    if (Math.abs(v) < 1e-12) continue;
    g += `<line x1="${X(v)}" y1="${pad / 2}" x2="${X(v)}" y2="${H - pad / 2}" class="grid"/><line x1="${pad / 2}" y1="${Y(v)}" x2="${W - pad / 2}" y2="${Y(v)}" class="grid"/>`;
    const lab = (+v.toFixed(6)).toString().replace("-", "−");
    g += `<text x="${X(v)}" y="${H / 2 + 13}" text-anchor="middle" class="tick">${lab}</text><text x="${W / 2 - 5}" y="${Y(v) + 4}" text-anchor="end" class="tick">${lab}${"i"}</text>`;
  }
  g += `<line x1="${pad / 2}" y1="${H / 2}" x2="${W - pad / 2}" y2="${H / 2}" class="axis" marker-end="url(#cpa)"/><line x1="${W / 2}" y1="${H - pad / 2}" x2="${W / 2}" y2="${pad / 2}" class="axis" marker-end="url(#cpa)"/>`;
  g += `<text x="${W - 8}" y="${H / 2 - 7}" text-anchor="end" class="axl">Re</text><text x="${W / 2 + 7}" y="${pad / 2 + 10}" class="axl">Im</text>`;
  if (opts.unit) g += `<circle cx="${X(0)}" cy="${Y(0)}" r="${X(1) - X(0)}" class="ucirc"/>`;
  arcs.forEach((a, i) => {
    const rr = a.rr || (22 + i * 14), ph = a.phi;
    const x1 = X(0) + rr, y1 = Y(0), x2 = X(0) + rr * Math.cos(ph), y2 = Y(0) - rr * Math.sin(ph);
    const large = Math.abs(ph) > Math.PI ? 1 : 0, sweep = ph > 0 ? 0 : 1;
    if (Math.abs(ph) > 1e-9) g += `<path d="M${x1},${y1} A${rr},${rr} 0 ${large} ${sweep} ${x2},${y2}" fill="none" stroke="${a.color}" stroke-width="1.6"/>`;
    const mid = ph / 2;
    if (a.label) g += `<text x="${X(0) + (rr + 9) * Math.cos(mid)}" y="${Y(0) - (rr + 9) * Math.sin(mid) + 4}" class="arcl" fill="${a.color}" text-anchor="middle">${esc(a.label)}</text>`;
  });
  pts.forEach(p => {
    const px = X(p.x), py = Y(p.y);
    if (p.proj) g += `<line x1="${px}" y1="${py}" x2="${px}" y2="${Y(0)}" class="proj"/><line x1="${px}" y1="${py}" x2="${X(0)}" y2="${py}" class="proj"/>`;
    if (p.vec) g += `<line x1="${X(0)}" y1="${Y(0)}" x2="${px}" y2="${py}" stroke="${p.color}" stroke-width="2" style="color:${p.color}" marker-end="url(#cpa)"/>`;
    g += `<circle cx="${px}" cy="${py}" r="4.2" fill="${p.color}"/>`;
    const right = p.x >= 0;
    g += `<text x="${px + (right ? 7 : -7)}" y="${py - 8}" text-anchor="${right ? "start" : "end"}" class="ptl" fill="${p.color}">${esc(p.label)}</text>`;
  });
  return g + `</svg>`;
}
const CPC = { z: "var(--fk-h,#1d5fae)", w: "var(--fk-f,#bb3a2b)", r: "var(--fk-p,#1f774a)", o: "var(--fk-o,#7a40b8)", n: "var(--fk-n,#b86e00)" };

// ---------- „Vidi odmah“ – trening brzog razmišljanja ----------
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function drillCard(id, title, lead) {
  return `<section class="card drill" id="${id}">
    <h2>⚡ ${title}</h2>
    <p class="lead">${lead}</p>
    <div class="drill-q" id="${id}-q"></div>
    <div class="drill-opts" id="${id}-opts"></div>
    <div class="drill-inwrap" id="${id}-inwrap"><label for="${id}-in">Tvoj odgovor</label>
    <input id="${id}-in" class="mono" type="text" autocomplete="off" spellcheck="false"></div>
    <div class="btns"><button class="primary" id="${id}-ok">Provjeri</button><button id="${id}-next">Sljedeće →</button><button id="${id}-show">Pokaži rješenje</button><span class="drill-score" id="${id}-score"></span></div>
    <div class="out" id="${id}-out"></div>
  </section>`;
}
const DRILL_PH = {
  ang: "ugao, npr. 2π/3 ili −π/4", r: "broj, npr. 5, −3 ili 2√2", c: "npr. −1, 2i, 3 − 4i, −√3/2 + 1/2 i",
  set: "skup, npr. {1, 3} ili ∅", iv: "npr. (−1, 3], [2, +inf), ∅ ili R", fx: "izraz po x, npr. (x − 6)/2",
};
// normalizovan zapis konačnog skupa
function setKey(v) {
  const t = String(v).trim();
  if (/^(∅|\{\s*\}|prazan( skup)?)$/i.test(t)) return "";
  return sortElems(parseList(t).map(x => x.replace(/−/g, "-")).map(x => (isNaN(Number(x)) ? x : String(Number(x))))).join(",");
}
function ivKey(v) {
  const t = String(v).trim().replace(/−/g, "-").replace(/∞/g, "inf");
  if (/^(∅|\{\s*\}|prazan( skup)?)$/i.test(t)) return "∅";
  if (/^(ℝ|R|\(-inf,\s*\+?inf\))$/.test(t)) return IV.str([{ a: -Infinity, ac: false, b: Infinity, bc: false }]);
  return IV.str(IV.parse(t));
}
function drillWire(id, gens) {
  let cur = null, t0 = 0, ok = 0, tot = 0, streak = 0, done = false;
  const q = $(`#${id}-q`), inp = $(`#${id}-in`), out = $(`#${id}-out`), sc = $(`#${id}-score`), opts = $(`#${id}-opts`), inw = $(`#${id}-inwrap`), okb = $(`#${id}-ok`);
  const next = () => {
    cur = pick(gens)(); t0 = performance.now(); done = false;
    q.innerHTML = `<div class="${cur.kind === "mc" ? "" : "mono "}big">${cur.q}</div>${cur.hint ? `<div class="hint">${cur.hint}</div>` : ""}`;
    inp.value = ""; out.classList.remove("show"); out.innerHTML = "";
    const mc = cur.kind === "mc";
    inw.hidden = mc; okb.hidden = mc;
    opts.innerHTML = mc ? cur.opts.map((o, k) => `<button type="button" class="opt" data-k="${k}">${o}</button>`).join("") : "";
    if (!mc) inp.placeholder = DRILL_PH[cur.kind] || DRILL_PH.c;
  };
  const reveal = (good, sec, chosen) => {
    done = true;
    if (cur.kind === "mc") $$(".opt", opts).forEach(b => { const k = +b.dataset.k; b.disabled = true; b.classList.toggle("right", k === cur.ans); b.classList.toggle("wrong", k === chosen && k !== cur.ans); });
    const sp = sec !== null ? ` &nbsp;·&nbsp; ${sec.toFixed(1)} s${good && sec <= 10 ? " ⚡" : ""}` : "";
    const ans = cur.kind === "mc" ? cur.opts[cur.ans] : (cur.disp || cur.a);
    out.innerHTML = `<div class="verdict ${good ? "ok" : "no"}">${good ? "✔ Tačno" : sec === null ? "Rješenje" : "✖ Nije tačno"}: <span class="mono">${ans}</span>${sp}</div><div class="insight"><b>💡 Kako se vidi odmah:</b> ${cur.why}</div>`;
    out.classList.add("show");
    sc.textContent = `${ok}/${tot} tačno · niz ${streak}`;
  };
  const score = good => { tot++; if (good) { ok++; streak++; } else streak = 0; };
  const check = () => {
    if (!cur) return;
    if (done) { next(); return; }
    const v = inp.value.trim();
    if (!v) { notify("Upiši odgovor (ili klikni „Pokaži rješenje“)."); return; }
    let good = false;
    try {
      if (cur.kind === "ang") { const A = parseAngle(v); const d = (A.num - cur.val) / (2 * Math.PI); good = Math.abs(d - Math.round(d)) < 1e-7; }
      else if (cur.kind === "set") good = setKey(v) === setKey(cur.a);
      else if (cur.kind === "iv") good = ivKey(v) === ivKey(cur.a);
      else if (cur.kind === "fx") {
        const U = parseExpr(v, ["x"]), E = parseExpr(cur.a.replace(/−/g, "-"), ["x"]);
        good = [-2.3, -0.7, 0.4, 1.9, 3.1, 5.6].every(x => { const a = evalNum(U, { x }), b = evalNum(E, { x }); return (isNaN(a) && isNaN(b)) || Math.abs(a - b) < 1e-7 * Math.max(1, Math.abs(b)); });
      } else {
        const Z = parseZ(v); const [x, y] = Z.z ? Z.z.num() : [Z.rNum * Math.cos(Z.phiNum), Z.rNum * Math.sin(Z.phiNum)];
        good = Math.abs(x - cur.val[0]) < 1e-7 && Math.abs(y - cur.val[1]) < 1e-7;
      }
    } catch (e) { notify("Ne razumijem odgovor: " + e.message); return; }
    score(good); reveal(good, (performance.now() - t0) / 1000);
  };
  okb.onclick = check;
  inp.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
  opts.addEventListener("click", e => {
    const b = e.target.closest(".opt"); if (!b || done) return;
    const k = +b.dataset.k, good = k === cur.ans; score(good); reveal(good, (performance.now() - t0) / 1000, k);
  });
  $(`#${id}-next`).onclick = next;
  $(`#${id}-show`).onclick = () => { if (cur && !done) { tot++; streak = 0; reveal(false, null); } };
  next();
}
// mc pitanje: opcije se miješaju, ans = indeks tačne
function mcQ(q, right, wrongs, why, hint) {
  const all = [right, ...wrongs].map((t, k) => ({ t, k })).sort(() => Math.random() - .5);
  return { kind: "mc", q, opts: all.map(o => o.t), ans: all.findIndex(o => o.k === 0), why, hint };
}
