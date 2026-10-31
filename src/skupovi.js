// ===================== SKUPOVI =====================
"use strict";

// ---------- izrazi nad konačnim skupovima ----------
const SET = {
  tokenize(src) {
    const map = { "∪": "∪", "+": "∪", "|": "∪", "∩": "∩", "&": "∩", "*": "∩", "Δ": "Δ", "△": "Δ", "^": "Δ", "\\": "\\", "−": "\\", "-": "\\", "ᶜ": "ᶜ", "'": "ᶜ", "(": "(", ")": ")" };
    const t = []; let i = 0; const s = src;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === "^" && s[i + 1] === "c") { t.push("ᶜ"); i += 2; continue; }
      if (c in map) { t.push(map[c]); i++; continue; }
      if (c === "{") { const j = s.indexOf("}", i); if (j < 0) throw new MathErr("Nedostaje }"); t.push({ lit: parseList(s.slice(i + 1, j)) }); i = j + 1; continue; }
      if (c === "∅") { t.push({ lit: [] }); i++; continue; }
      if (/[A-Z]/.test(c)) { t.push({ name: c }); i++; continue; }
      throw new MathErr(`Nepoznat znak "${c}" u skupovnom izrazu. Skupovi su velika slova A, B, C…, a operacije ∪ ∩ \\ Δ i komplement ᶜ.`);
    }
    return t;
  },
  parse(src) {
    const t = SET.tokenize(src); let p = 0; const warns = new Set();
    function lvl3() { // ∪ \ Δ
      let a = lvl2(), seen = null;
      while (["∪", "\\", "Δ"].includes(t[p])) { const op = t[p++]; if (seen && seen !== op) warns.add("Operacije ∪, \\ i Δ su bez zagrada računate slijeva udesno – stavi zagrade da bude jasno."); seen = op; a = { op, a, b: lvl2() }; }
      return a;
    }
    function lvl2() { let a = lvl1(); while (t[p] === "∩") { p++; a = { op: "∩", a, b: lvl1() }; } return a; }
    function lvl1() {
      let a; const x = t[p++];
      if (x === "(") { a = lvl3(); if (t[p++] !== ")") throw new MathErr("Nedostaje )"); a = { op: "()", a }; }
      else if (x && x.name) a = { name: x.name };
      else if (x && x.lit) a = { lit: x.lit };
      else throw new MathErr("Neispravan skupovni izraz.");
      while (t[p] === "ᶜ") { p++; a = { op: "ᶜ", a }; }
      return a;
    }
    if (!t.length) throw new MathErr("Izraz je prazan.");
    const ast = lvl3(); if (p < t.length) throw new MathErr("Višak znakova u izrazu – provjeri zagrade.");
    return { ast, warns: [...warns] };
  },
  str(n) {
    if (n.name) return n.name; if (n.lit) return setStr(n.lit);
    if (n.op === "()") return `(${SET.str(n.a)})`;
    if (n.op === "ᶜ") return SET.str(n.a) + "ᶜ";
    return `${SET.str(n.a)} ${n.op} ${SET.str(n.b)}`;
  },
  ev(n, env, steps) {
    if (n.name) { if (!(n.name in env)) throw new MathErr(`Skup ${n.name} nije zadat.`); return env[n.name]; }
    if (n.lit) return n.lit;
    if (n.op === "()") return SET.ev(n.a, env, steps);
    let r;
    if (n.op === "ᶜ") {
      if (!env.U) throw new MathErr("Za komplement mora biti zadat univerzalni skup U.");
      const a = SET.ev(n.a, env, steps); r = env.U.filter(x => !a.includes(x));
    } else {
      const a = SET.ev(n.a, env, steps), b = SET.ev(n.b, env, steps);
      r = n.op === "∪" ? [...a, ...b.filter(x => !a.includes(x))] : n.op === "∩" ? a.filter(x => b.includes(x)) :
        n.op === "\\" ? a.filter(x => !b.includes(x)) : [...a.filter(x => !b.includes(x)), ...b.filter(x => !a.includes(x))];
    }
    r = sortElems(r);
    if (steps && !steps.some(s => s[0] === SET.str(n))) steps.push([SET.str(n), r]);
    return r;
  },
};

// ---------- intervali na realnoj pravoj ----------
const IV = {
  parseVal(s) {
    s = s.trim().replace(/\s/g, "").replace(/∞/g, "inf");
    if (/^(-inf|−inf)$/i.test(s)) return -Infinity;
    if (/^\+?inf$/i.test(s)) return Infinity;
    return Frac.parse(s.replace("−", "-"));
  },
  parse(src) {
    let s = src.trim().replace(/−/g, "-");
    if (!s || s === "∅" || s === "{}") return [];
    if (/^(ℝ|R)$/.test(s)) return [{ a: -Infinity, ac: false, b: Infinity, bc: false }];
    const parts = s.split(/∪|\bU\b|\bu\b/);
    const out = [];
    for (let part of parts) {
      part = part.trim();
      let m = part.match(/^([\(\[\]])\s*([^,;]+)\s*[,;]\s*([^,;]+)\s*([\)\]\[])$/);
      if (m) {
        const a = IV.parseVal(m[2]), b = IV.parseVal(m[3]);
        const ac = m[1] === "[", bc = m[4] === "]";
        if ((ac && a === -Infinity) || (bc && b === Infinity)) throw new MathErr("Kod ±∞ zagrada mora biti otvorena.");
        if (IV.cmp(a, b) > 0 || (IV.cmp(a, b) === 0 && !(ac && bc))) throw new MathErr(`Interval ${part} je prazan ili pogrešno zapisan (lijeva granica mora biti manja).`);
        out.push({ a, ac, b, bc }); continue;
      }
      m = part.match(/^\{(.+)\}$/);
      if (m) { for (const x of m[1].split(/[,;]/)) { const v = IV.parseVal(x); out.push({ a: v, ac: true, b: v, bc: true }); } continue; }
      throw new MathErr(`Ne razumijem "${part}". Zapis: (a,b), [a,b], (-inf,a], {a} i unija ∪.`);
    }
    return IV.norm(out);
  },
  cmp(x, y) { if (x === y) return 0; if (x === -Infinity || y === Infinity) return -1; if (x === Infinity || y === -Infinity) return 1; return x.cmp(y); },
  has(set, x) { return set.some(I => { const l = IV.cmp(I.a, x), r = IV.cmp(x, I.b); return (l < 0 || (l === 0 && I.ac)) && (r < 0 || (r === 0 && I.bc)); }); },
  // opšta operacija preko testnih tačaka
  op(sets, f) {
    let E = [];
    sets.forEach(S => S.forEach(I => { for (const v of [I.a, I.b]) if (v !== Infinity && v !== -Infinity && !E.some(e => e.eq(v))) E.push(v); }));
    E.sort((x, y) => x.cmp(y));
    const segs = [];
    const test = x => f(...sets.map(S => IV.has(S, x)));
    if (!E.length) { return test(Frac.of(0)) ? [{ a: -Infinity, ac: false, b: Infinity, bc: false }] : []; }
    segs.push({ a: -Infinity, b: E[0], pt: false, in: test(E[0].sub(1)) });
    E.forEach((e, i) => {
      segs.push({ a: e, b: e, pt: true, in: test(e) });
      const nx = E[i + 1];
      segs.push(nx ? { a: e, b: nx, pt: false, in: test(e.add(nx).div(2)) } : { a: e, b: Infinity, pt: false, in: test(e.add(1)) });
    });
    const res = []; let cur = null;
    for (const s of segs) {
      if (s.in) {
        if (!cur) cur = { a: s.a, ac: s.pt, b: s.b, bc: s.pt };
        else { cur.b = s.b; cur.bc = s.pt; }
      } else if (cur) { res.push(cur); cur = null; }
    }
    if (cur) res.push(cur);
    return res;
  },
  norm(S) { return IV.op([S], a => a); },
  v(x) { return x === Infinity ? "+∞" : x === -Infinity ? "−∞" : x.toString().replace("-", "−"); },
  str(S) {
    if (!S.length) return "∅";
    return S.map(I => (IV.cmp(I.a, I.b) === 0 ? `{${IV.v(I.a)}}` : `${I.ac ? "[" : "("}${IV.v(I.a)}, ${IV.v(I.b)}${I.bc ? "]" : ")"}`)).join(" ∪ ")
      .replace(/^\(−∞, \+∞\)$/, "ℝ = (−∞, +∞)");
  },
  // brojevna prava (SVG)
  svg(layers, allPts) {
    let E = [];
    allPts.forEach(S => S.forEach(I => { for (const v of [I.a, I.b]) if (v !== Infinity && v !== -Infinity && !E.some(e => e.eq(v))) E.push(v); }));
    E.sort((x, y) => x.cmp(y));
    const W = 640, padL = 40, padR = 40, H = 40 + layers.length * 22;
    const nums = E.map(e => e.toNumber());
    let lo = nums.length ? Math.min(...nums) : -1, hi = nums.length ? Math.max(...nums) : 1;
    if (lo === hi) { lo -= 1; hi += 1; }
    const span = hi - lo; lo -= span * 0.25; hi += span * 0.25;
    const X = v => v === -Infinity ? padL - 18 : v === Infinity ? W - padR + 18 : padL + (v.toNumber() - lo) / (hi - lo) * (W - padL - padR);
    const axisY = H - 22;
    let g = `<svg class="nl" viewBox="0 0 ${W} ${H}" role="img"><line x1="10" y1="${axisY}" x2="${W - 10}" y2="${axisY}" class="axis"/>`;
    g += `<text x="12" y="${axisY + 16}" class="lbl">−∞</text><text x="${W - 30}" y="${axisY + 16}" class="lbl">+∞</text>`;
    E.forEach(e => { const x = X(e); g += `<line x1="${x}" y1="${axisY - 4}" x2="${x}" y2="${axisY + 4}" class="axis"/><text x="${x}" y="${axisY + 16}" text-anchor="middle" class="lbl">${IV.v(e)}</text>`; });
    layers.forEach((L, li) => {
      const y = 14 + li * 22;
      g += `<text x="4" y="${y + 4}" class="lbl" fill="${L.color}">${esc(L.label)}</text>`;
      L.set.forEach(I => {
        const x1 = Math.max(X(I.a), 34), x2 = X(I.b);
        if (IV.cmp(I.a, I.b) === 0) { g += `<circle cx="${x1}" cy="${y}" r="4.5" fill="${L.color}"/>`; return; }
        g += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${L.color}" stroke-width="5" stroke-linecap="butt"/>`;
        if (I.a !== -Infinity) g += `<circle cx="${x1}" cy="${y}" r="4.5" fill="${I.ac ? L.color : "var(--bg)"}" stroke="${L.color}" stroke-width="2"/>`;
        if (I.b !== Infinity) g += `<circle cx="${x2}" cy="${y}" r="4.5" fill="${I.bc ? L.color : "var(--bg)"}" stroke="${L.color}" stroke-width="2"/>`;
        [I.a, I.b].forEach(v => { if (v !== Infinity && v !== -Infinity) g += `<line x1="${X(v)}" y1="${y}" x2="${X(v)}" y2="${axisY}" class="guide"/>`; });
      });
    });
    return g + "</svg>";
  },
};

// numeričko rješavanje nejednačine po x (provjera)
function solveIneqNumeric(src) {
  const ast = parseExpr(src, ["x"]);
  if (ast.t !== "cmp") throw new MathErr("Upiši nejednačinu ili jednačinu, npr. |x-1| < 2.");
  // vrijednost: true / false / null (nepouzdano – preveliki brojevi)
  const f0 = x => {
    try {
      if (ast.ops.length === 1) {
        const l = evalNum(ast.items[0], { x }), r = evalNum(ast.items[1], { x });
        if (Number.isNaN(l) || Number.isNaN(r)) return false;
        if (!isFinite(l) || !isFinite(r) || Math.max(Math.abs(l), Math.abs(r)) > 1e12) return null;
      }
      return !!evalNum(ast, { x });
    } catch { return false; }
  };
  let lastKnown = false;
  const f = x => { const v = f0(x); if (v === null) return lastKnown; lastKnown = v; return v; };
  const LO = -200, HI = 200, N = 40000, h = (HI - LO) / N;
  const bounds = [];
  let prev = f(LO);
  for (let i = 1; i <= N; i++) {
    const x = LO + i * h, cur = f(x);
    if (cur !== prev) {
      let a = x - h, b = x;
      for (let k = 0; k < 60; k++) { const m = (a + b) / 2; if (f(m) === prev) a = m; else b = m; }
      bounds.push((a + b) / 2);
    }
    prev = cur;
  }
  // zaokruži na lijep razlomak
  const nice = v => {
    for (let d = 1; d <= 24; d++) { const n = Math.round(v * d); if (Math.abs(n / d - v) < 1e-7) return new Frac(BigInt(n), BigInt(d)); }
    return null;
  };
  const E = []; let approx = false;
  bounds.forEach(b => { const r = nice(b); if (r) { if (!E.some(e => e.eq(r))) E.push(r); } else { approx = true; E.push(Frac.parse(b.toFixed(4))); } });
  E.sort((x, y) => x.cmp(y));
  // izgradi skup ispitivanjem tačaka
  const test = x => f(x.toNumber());
  const segs = [];
  if (!E.length) return { set: f(0) ? [{ a: -Infinity, ac: false, b: Infinity, bc: false }] : [], approx };
  const mid = (a, b) => a.add(b).div(2);
  segs.push({ a: -Infinity, b: E[0], pt: false, in: f(E[0].toNumber() - 0.5 * Math.min(1, E.length > 1 ? E[1].sub(E[0]).toNumber() : 1)) });
  E.forEach((e, i) => { segs.push({ a: e, b: e, pt: true, in: test(e) }); const nx = E[i + 1]; segs.push(nx ? { a: e, b: nx, pt: false, in: test(mid(e, nx)) } : { a: e, b: Infinity, pt: false, in: f(e.toNumber() + 0.5) }); });
  const res = []; let cur = null;
  for (const s of segs) { if (s.in) { if (!cur) cur = { a: s.a, ac: s.pt, b: s.b, bc: s.pt }; else { cur.b = s.b; cur.bc = s.pt; } } else if (cur) { res.push(cur); cur = null; } }
  if (cur) res.push(cur);
  return { set: res, approx };
}

// ---------- Venov dijagram (prebrojavanje) ----------
function vennSvg(names, R, three) {
  const C = ["#e5484d", "#3e63dd", "#30a46c"];
  if (!three) {
    return `<svg class="venn" viewBox="0 0 360 220"><rect x="4" y="4" width="352" height="212" rx="10" class="vbox"/>
      <circle cx="140" cy="112" r="78" fill="${C[0]}" fill-opacity=".14" stroke="${C[0]}" stroke-width="2"/>
      <circle cx="220" cy="112" r="78" fill="${C[1]}" fill-opacity=".14" stroke="${C[1]}" stroke-width="2"/>
      <text x="80" y="38" class="vn" fill="${C[0]}">${esc(names[0])}</text><text x="270" y="38" class="vn" fill="${C[1]}">${esc(names[1])}</text>
      <text x="105" y="118" class="vv">${R.a}</text><text x="180" y="118" class="vv">${R.ab}</text><text x="255" y="118" class="vv">${R.b}</text>
      ${R.none !== null ? `<text x="330" y="205" class="vv sm">${R.none}</text>` : ""}</svg>`;
  }
  return `<svg class="venn" viewBox="0 0 360 330"><rect x="4" y="4" width="352" height="322" rx="10" class="vbox"/>
    <circle cx="140" cy="120" r="82" fill="${C[0]}" fill-opacity=".13" stroke="${C[0]}" stroke-width="2"/>
    <circle cx="220" cy="120" r="82" fill="${C[1]}" fill-opacity=".13" stroke="${C[1]}" stroke-width="2"/>
    <circle cx="180" cy="190" r="82" fill="${C[2]}" fill-opacity=".13" stroke="${C[2]}" stroke-width="2"/>
    <text x="64" y="40" class="vn" fill="${C[0]}">${esc(names[0])}</text><text x="282" y="40" class="vn" fill="${C[1]}">${esc(names[1])}</text><text x="172" y="300" class="vn" fill="${C[2]}">${esc(names[2])}</text>
    <text x="110" y="105" class="vv">${R.a}</text><text x="250" y="105" class="vv">${R.b}</text><text x="180" y="240" class="vv">${R.c}</text>
    <text x="180" y="92" class="vv">${R.ab}</text><text x="138" y="182" class="vv">${R.ac}</text><text x="222" y="182" class="vv">${R.bc}</text>
    <text x="180" y="152" class="vv">${R.abc}</text>
    ${R.none !== null ? `<text x="325" y="315" class="vv sm">${R.none}</text>` : ""}</svg>`;
}

function skupoviRender() {
  const panel = $("#tab-skupovi");
  panel.innerHTML = `
  <section class="card">
    <h2>Operacije sa konačnim skupovima</h2>
    <p class="lead">Zadaj skupove nabrajanjem elemenata i upiši izraz. Dobijaš rezultat korak po korak (svaki međuizraz).</p>
    <details class="theory"><summary>📘 Pravila i teorija</summary>
      <ul>
        <li><b>Skup</b> je osnovni pojam (ne definiše se). a ∈ A – a pripada A; a ∉ A – ne pripada. ∅ – prazan skup.</li>
        <li><b>Podskup:</b> B ⊆ A ako svaki element iz B pripada A. <b>Jednakost:</b> A = B ⇔ A ⊆ B i B ⊆ A. <b>Pravi podskup:</b> B ⊂ A ako B ⊆ A i B ≠ A.</li>
        <li><b>Partitivni skup</b> P(A) = {X : X ⊆ A} – ima 2<sup>|A|</sup> elemenata.</li>
        <li><b>Komplement</b> Aᶜ = {x : x ∈ U ∧ x ∉ A} (U – univerzalni skup).</li>
        <li><b>Unija</b> A ∪ B = {x : x ∈ A ∨ x ∈ B}; <b>presjek</b> A ∩ B = {x : x ∈ A ∧ x ∈ B}.</li>
        <li><b>Razlika</b> A \\ B = {x : x ∈ A ∧ x ∉ B}; <b>simetrična razlika</b> A Δ B = (A \\ B) ∪ (B \\ A).</li>
        <li><b>Dekartov proizvod</b> A × B = {(x, y) : x ∈ A, y ∈ B}; u opštem slučaju A × B ≠ B × A.</li>
        <li>De Morganovi zakoni: (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ, (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ.</li>
      </ul>
    </details>
    <div class="grid2">
      <div><label>U (univerzalni, za komplement)</label><input id="sk-U" class="mono" value="1, 2, 3, 4, 5, 6, 7, 8"></div>
      <div><label>A</label><input id="sk-A" class="mono" value="1, 2, 3, 4"></div>
      <div><label>B</label><input id="sk-B" class="mono" value="3, 4, 5, 6"></div>
      <div><label>C (opciono)</label><input id="sk-C" class="mono" value="2, 4, 6, 8"></div>
    </div>
    <label>Izraz</label>
    ${symbolBar("#sk-expr", ["∪", "∩", "\\", "Δ", "ᶜ", "(", ")", "A", "B", "C", "U"])}
    <input id="sk-expr" class="mono" value="(A ∪ B)ᶜ ∩ C">
    <p class="hint">Komplement: Aᶜ ili A'. Može i: + (∪), * (∩), - (\\), ^ (Δ).</p>
    <div class="btns">
      <button class="primary" id="sk-go">Izračunaj izraz</button>
      <button id="sk-all">Sve osnovne operacije</button>
      <button id="sk-P">P(A)</button>
      <button id="sk-x">A × B i B × A</button>
    </div>
    <div class="out" id="sk-out"></div>
  </section>

  <section class="card">
    <h2>Odredi nepoznati skup X</h2>
    <p class="lead">Npr. „X ⊂ {2,3,4,5} i {1,2,3} ∩ X = {2,3}“. Program ispita sve podskupove i nađe SVA rješenja.</p>
    <details class="theory"><summary>📘 Kako se rješava</summary>
      <p>Nacrtamo Venov dijagram: elementi koji MORAJU biti u X (iz uslova presjeka), elementi koji NE SMIJU biti u X, i elementi „slobodni“ – za njih postoje obje mogućnosti. Zato zadatak često ima više rješenja (2<sup>broj slobodnih</sup>).</p>
    </details>
    <div class="grid2">
      <div><label>X je podskup skupa</label><input id="sx-S" class="mono" value="2, 3, 4, 5"></div>
      <div><label>&nbsp;</label><label class="chk"><input type="checkbox" id="sx-proper"> pravi podskup (X ≠ tog skupa)</label></div>
    </div>
    <label>Uslovi (jedan po redu; „=“, „⊆“)</label>
    <textarea id="sx-cond" class="mono" rows="3">{1, 2, 3} ∩ X = {2, 3}</textarea>
    <div class="btns"><button class="primary" id="sx-go">Nađi sve X</button><button class="ex" id="sx-ex">Priprema K1 – zad. 1</button></div>
    <div class="out" id="sx-out"></div>
  </section>

  <section class="card">
    <h2>Skupovi na realnoj pravoj (intervali)</h2>
    <p class="lead">Upiši A i B kao intervale. Dobijaš A∪B, A∩B, Aᶜ, Bᶜ, A\\B, B\\A, (A∪B)ᶜ, (A∩B)ᶜ, Aᶜ∪Bᶜ, Aᶜ∩Bᶜ sa slikom na brojevnoj pravoj.</p>
    <details class="theory"><summary>📘 Pravila i postupak</summary>
      <ul>
        <li>Prvo riješi nejednačine iz uslova skupova (npr. |x − 1| &lt; 2 ⇔ −2 &lt; x − 1 &lt; 2 ⇔ x ∈ (−1, 3)).</li>
        <li>Kod razlomaka sve prebaci na jednu stranu i ispitaj znak brojioca i imenioca (imenilac ≠ 0).</li>
        <li>Kod logaritma sa bazom iz (0,1) funkcija je opadajuća – znak nejednakosti se OKREĆE; obavezno uslov definisanosti (argument &gt; 0).</li>
        <li>Kod eksponencijalnih nejednačina uvedi smjenu (npr. 3ˣ = t, t &gt; 0).</li>
        <li>Zatim nacrtaj A i B na brojevnoj pravoj i očitaj tražene skupove. Pazi na otvorene (·) i zatvorene [·] krajeve; kod komplementa se zagrade mijenjaju: (−1, 3)ᶜ = (−∞, −1] ∪ [3, +∞).</li>
      </ul>
      <p>Zapis: <span class="mono">(-1,3)</span>, <span class="mono">[2,+inf)</span>, <span class="mono">(-inf,-10) ∪ (6,inf)</span>, tačka <span class="mono">{5}</span>, razlomci <span class="mono">1/2</span>.</p>
    </details>
    <div class="grid2">
      <div><label>A</label><input id="iv-A" class="mono" value="(-1, 3)"></div>
      <div><label>B</label><input id="iv-B" class="mono" value="(2, +inf)"></div>
    </div>
    <div class="btns"><button class="primary" id="iv-go">Izračunaj</button>
      <span class="ex-label">Primjeri:</span>
      <button class="ex" data-a="(-1,3)" data-b="(2,+inf)">Zadatak 1</button>
      <button class="ex" data-a="(-10,-4) ∪ (6,+inf)" data-b="(-inf,1)">Zadatak 2</button>
    </div>
    <div class="out" id="iv-out"></div>
    <h3>Provjera nejednačine (numerički)</h3>
    <p class="hint">Upiši uslov skupa, npr. <span class="mono">|x-1| &lt; 2</span>, <span class="mono">(x-1)/(x-2) &gt; 1</span>, <span class="mono">log(0.5, (x^2-4)/(x+10)) &lt; -1</span>, <span class="mono">9^x &lt; 3 + 2·3^x</span>. Služi za PROVJERU tvog rješenja – postupak se na ispitu piše ručno.</p>
    <input id="iq-in" class="mono" value="(x-1)/(x-2) > 1">
    <div class="btns"><button id="iq-go">Riješi numerički</button><button id="iq-toA">→ upiši u A</button><button id="iq-toB">→ upiši u B</button></div>
    <div class="out" id="iq-out"></div>
  </section>

  <section class="card">
    <h2>Venov dijagram – zadaci sa prebrojavanjem</h2>
    <p class="lead">Tip zadatka „22 učenika svira klavir, 18 violinu…“. Unesi brojeve, program popunjava dijagram od sredine prema van.</p>
    <details class="theory"><summary>📘 Postupak (kao na vježbama)</summary>
      <ol>
        <li>Nacrtaj dijagram tri skupa koja se sijeku.</li>
        <li>U središte (presjek sva tri) upiši broj elemenata koji pripadaju svim trima.</li>
        <li>Za svaki par: (presjek para) − (središte) = elementi samo u ta dva skupa.</li>
        <li>Za svaki skup: |A| − (sve već upisano u A) = elementi samo u A.</li>
        <li>Ukupno = zbir svih dijelova; „samo jedan“ = zbir tri vanjska dijela. Formula: |A∪B∪C| = |A|+|B|+|C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|.</li>
      </ol>
    </details>
    <div class="grid3">
      <div><label>Ime 1. skupa</label><input id="vn-n1" value="K"></div>
      <div><label>Ime 2. skupa</label><input id="vn-n2" value="V"></div>
      <div><label>Ime 3. skupa (prazno = 2 skupa)</label><input id="vn-n3" value="G"></div>
      <div><label>|1|</label><input id="vn-a" type="number" value="22"></div>
      <div><label>|2|</label><input id="vn-b" type="number" value="18"></div>
      <div><label>|3|</label><input id="vn-c" type="number" value="15"></div>
      <div><label>|1 ∩ 2|</label><input id="vn-ab" type="number" value="6"></div>
      <div><label>|1 ∩ 3|</label><input id="vn-ac" type="number" value="4"></div>
      <div><label>|2 ∩ 3|</label><input id="vn-bc" type="number" value="3"></div>
      <div><label>|1 ∩ 2 ∩ 3|</label><input id="vn-abc" type="number" value="2"></div>
      <div><label>Ukupno (ako je zadato)</label><input id="vn-tot" type="number" value=""></div>
    </div>
    <label class="chk"><input type="checkbox" id="vn-only"> brojevi za parove znače „SAMO ta dva“ (bez onih u sva tri)</label>
    <div class="btns"><button class="primary" id="vn-go">Riješi</button>
      <button class="ex" data-v='["K","V","G",22,18,15,6,4,3,2,""]'>Muzička škola</button>
      <button class="ex" data-v='["P","J","R",12,18,9,4,3,1,1,""]'>Rođendan (vježba 2)</button>
      <button class="ex" data-v='["D","H","S",27,32,22,16,8,6,3,70]'>Sekcije (vježba 3)</button>
    </div>
    <div class="out" id="vn-out"></div>
  </section>`;

  const env = () => {
    const e = {};
    for (const k of ["U", "A", "B", "C"]) { const v = $("#sk-" + k).value.trim(); if (v) e[k] = sortElems(parseList(v)); }
    if (e.U) for (const k of ["A", "B", "C"]) if (e[k]) { const bad = e[k].filter(x => !e.U.includes(x)); if (bad.length) notify(`Elementi ${setStr(bad)} iz ${k} nisu u U – komplement neće biti tačan.`, "warn"); }
    return e;
  };
  $("#sk-go").onclick = () => runSafe($("#sk-out"), () => {
    const { ast, warns } = SET.parse($("#sk-expr").value); warns.forEach(w => notify(w));
    const e = env(), steps = [];
    const r = SET.ev(ast, e, steps);
    let h = `<div class="step">Zadato: ${Object.entries(e).map(([k, v]) => `${k} = ${esc(setStr(v))}`).join(", ")}</div><ol class="steps">`;
    steps.forEach(([s, v]) => h += `<li><span class="mono">${esc(s)}</span> = <b class="mono">${esc(setStr(v))}</b></li>`);
    return h + `</ol><div class="verdict ok">${esc(SET.str(ast))} = ${esc(setStr(r))}</div>`;
  });
  $("#sk-all").onclick = () => runSafe($("#sk-out"), () => {
    const e = env(); if (!e.A || !e.B) throw new MathErr("Zadaj bar A i B.");
    const ex = ["A ∪ B", "A ∩ B", "A \\ B", "B \\ A", "A Δ B"].concat(e.U ? ["Aᶜ", "Bᶜ", "(A ∪ B)ᶜ", "(A ∩ B)ᶜ", "Aᶜ ∩ Bᶜ", "Aᶜ ∪ Bᶜ"] : []);
    let h = `<table class="res">`;
    ex.forEach(x => h += `<tr><td class="mono">${esc(x)}</td><td class="mono"><b>${esc(setStr(SET.ev(SET.parse(x).ast, e)))}</b></td></tr>`);
    if (!e.U) notify("Za komplemente upiši univerzalni skup U.", "warn");
    return h + `</table>` + (e.U ? `<p class="hint">Primijeti De Morganove zakone: (A∪B)ᶜ = Aᶜ∩Bᶜ i (A∩B)ᶜ = Aᶜ∪Bᶜ.</p>` : "");
  });
  $("#sk-P").onclick = () => runSafe($("#sk-out"), () => {
    const A = env().A || []; if (A.length > 8) throw new MathErr("Za više od 8 elemenata P(A) je prevelik za ispis.");
    const subs = [];
    for (let m = 0; m < (1 << A.length); m++) subs.push(A.filter((_, i) => m >> i & 1));
    subs.sort((x, y) => x.length - y.length);
    return `<div class="step">A = ${esc(setStr(A))}, |A| = ${A.length} ⇒ |P(A)| = 2<sup>${A.length}</sup> = ${subs.length}</div><div class="verdict ok mono">P(A) = {${subs.map(s => s.length ? setStr(s) : "∅").join(", ")}}</div>`;
  });
  $("#sk-x").onclick = () => runSafe($("#sk-out"), () => {
    const e = env(); const A = e.A || [], B = e.B || [];
    const prod = (X, Y) => X.flatMap(x => Y.map(y => `(${x}, ${y})`));
    return `<div class="step mono">A × B = {${prod(A, B).join(", ")}}</div><div class="step mono">B × A = {${prod(B, A).join(", ")}}</div><p class="hint">|A × B| = |A|·|B| = ${A.length * B.length}. ${A.join() === B.join() ? "" : "Primijeti: A × B ≠ B × A (parovi su uređeni)."}</p>`;
  });

  // nepoznati X
  const solveX = () => runSafe($("#sx-out"), () => {
    const S = sortElems(parseList($("#sx-S").value));
    if (S.length > 14) throw new MathErr("Najviše 14 elemenata (inače je prevelik broj podskupova).");
    const conds = $("#sx-cond").value.split("\n").map(s => s.trim()).filter(Boolean).map(line => {
      const m = line.match(/^(.+?)\s*(=|⊆|⊂|<=)\s*(.+)$/);
      if (!m) throw new MathErr(`Uslov "${line}" mora sadržati =, ⊆ ili ⊂.`);
      return { line, L: SET.parse(m[1]).ast, op: m[2], R: SET.parse(m[3]).ast };
    });
    const sols = [];
    for (let mask = 0; mask < (1 << S.length); mask++) {
      const X = S.filter((_, i) => mask >> i & 1);
      if ($("#sx-proper").checked && X.length === S.length) continue;
      const e = { X, S, U: S };
      if (conds.every(c => {
        const l = SET.ev(c.L, e), r = SET.ev(c.R, e);
        if (c.op === "=") return l.length === r.length && l.every(x => r.includes(x));
        const sub = l.every(x => r.includes(x));
        return c.op === "⊂" ? sub && l.length < r.length : sub;
      })) sols.push(X);
    }
    // analiza: obavezni / zabranjeni / slobodni
    let h = "";
    if (!sols.length) return `<div class="verdict no">✖ Nijedan podskup ne zadovoljava uslove – zadatak nema rješenja.</div>`;
    const must = S.filter(x => sols.every(X => X.includes(x))), never = S.filter(x => sols.every(X => !X.includes(x)));
    const free = S.filter(x => !must.includes(x) && !never.includes(x));
    h += `<div class="step">Elementi koji <b>moraju</b> biti u X: ${esc(setStr(must))}<br>Elementi koji <b>ne smiju</b> biti u X: ${esc(setStr(never))}<br>„Slobodni“ elementi: ${esc(setStr(free))}</div>`;
    h += `<div class="verdict ok">Zadatak ima ${sols.length} ${sols.length === 1 ? "rješenje" : "rješenja"}:<br><span class="mono">${sols.map(X => "X = " + (X.length ? setStr(X) : "∅")).join("<br>")}</span></div>`;
    return h;
  });
  $("#sx-go").onclick = solveX;
  $("#sx-ex").onclick = () => { $("#sx-S").value = "2, 3, 4, 5"; $("#sx-cond").value = "{1, 2, 3} ∩ X = {2, 3}"; solveX(); };

  // intervali
  const ivSolve = () => runSafe($("#iv-out"), () => {
    const A = IV.parse($("#iv-A").value), B = IV.parse($("#iv-B").value);
    const ops = [
      ["A ∪ B", (a, b) => a || b], ["A ∩ B", (a, b) => a && b], ["Aᶜ", a => !a], ["Bᶜ", (a, b) => !b],
      ["A \\ B", (a, b) => a && !b], ["B \\ A", (a, b) => b && !a], ["(A ∪ B)ᶜ", (a, b) => !(a || b)],
      ["(A ∩ B)ᶜ", (a, b) => !(a && b)], ["Aᶜ ∪ Bᶜ", (a, b) => !a || !b], ["Aᶜ ∩ Bᶜ", (a, b) => !a && !b],
    ];
    let h = `<div class="step">A = <b class="mono">${IV.str(A)}</b>, B = <b class="mono">${IV.str(B)}</b></div>`;
    ops.forEach(([name, f]) => {
      const R = IV.op([A, B], f);
      h += `<div class="ivres"><div class="mono"><b>${name}</b> = ${IV.str(R)}</div>${IV.svg([{ set: A, color: "#e5484d", label: "A" }, { set: B, color: "#3e63dd", label: "B" }, { set: R, color: "#30a46c", label: name.length > 3 ? "∗" : name }], [A, B])}</div>`;
    });
    return h + `<p class="hint">Zeleno (∗) = traženi skup. Puni kružić = kraj pripada skupu [ ], prazan = ne pripada ( ).</p>`;
  });
  $("#iv-go").onclick = ivSolve;
  $$("#tab-skupovi .ex[data-a]").forEach(b => b.onclick = () => { $("#iv-A").value = b.dataset.a; $("#iv-B").value = b.dataset.b; ivSolve(); });
  let lastIq = null;
  $("#iq-go").onclick = () => runSafe($("#iq-out"), () => {
    const { set, approx } = solveIneqNumeric($("#iq-in").value);
    lastIq = IV.str(set).replace("ℝ = ", "");
    notify("Ovo je numerička provjera (posmatra se interval [−200, 200]); postupak rješavanja piši ručno.", "warn");
    if (approx) notify("Neke granice nisu lijepi razlomci – prikazane su približno (4 decimale).", "warn");
    return `<div class="verdict ok mono">x ∈ ${IV.str(set)}</div>${IV.svg([{ set, color: "#30a46c", label: "x" }], [set])}`;
  });
  $("#iq-toA").onclick = () => { if (lastIq) $("#iv-A").value = lastIq.replace(/\+∞/g, "+inf").replace(/−∞/g, "-inf").replace(/−/g, "-"); else notify("Prvo riješi nejednačinu."); };
  $("#iq-toB").onclick = () => { if (lastIq) $("#iv-B").value = lastIq.replace(/\+∞/g, "+inf").replace(/−∞/g, "-inf").replace(/−/g, "-"); else notify("Prvo riješi nejednačinu."); };

  // Venn
  const vnSolve = () => runSafe($("#vn-out"), () => {
    const num = id => { const v = $(id).value.trim(); if (v === "") return null; const n = Number(v); if (!Number.isInteger(n) || n < 0) throw new MathErr("Brojevi moraju biti nenegativni cijeli."); return n; };
    const n1 = $("#vn-n1").value || "A", n2 = $("#vn-n2").value || "B", n3 = $("#vn-n3").value.trim();
    const three = !!n3;
    const a = num("#vn-a"), b = num("#vn-b"), c = three ? num("#vn-c") : 0;
    const ab = num("#vn-ab") ?? 0, ac = three ? (num("#vn-ac") ?? 0) : 0, bc = three ? (num("#vn-bc") ?? 0) : 0, abc = three ? (num("#vn-abc") ?? 0) : 0;
    const tot = num("#vn-tot");
    if (a === null || b === null || (three && c === null)) throw new MathErr("Upiši veličine svih skupova.");
    const only = $("#vn-only").checked;
    const R = {};
    let h = `<ol class="steps">`;
    if (three) {
      R.abc = abc;
      h += `<li>Središte (u sva tri): <b>${abc}</b>.</li>`;
      R.ab = only ? ab : ab - abc; R.ac = only ? ac : ac - abc; R.bc = only ? bc : bc - abc;
      if (!only) h += `<li>Samo ${n1} i ${n2}: ${ab} − ${abc} = <b>${R.ab}</b>; samo ${n1} i ${n3}: ${ac} − ${abc} = <b>${R.ac}</b>; samo ${n2} i ${n3}: ${bc} − ${abc} = <b>${R.bc}</b>.</li>`;
      else h += `<li>Parovi su zadati kao „samo ta dva“: ${R.ab}, ${R.ac}, ${R.bc}.</li>`;
      R.a = a - R.ab - R.ac - abc; R.b = b - R.ab - R.bc - abc; R.c = c - R.ac - R.bc - abc;
      h += `<li>Samo ${n1}: ${a} − ${R.ab} − ${R.ac} − ${abc} = <b>${R.a}</b>; samo ${n2}: ${b} − ${R.ab} − ${R.bc} − ${abc} = <b>${R.b}</b>; samo ${n3}: ${c} − ${R.ac} − ${R.bc} − ${abc} = <b>${R.c}</b>.</li>`;
    } else {
      R.ab = ab; R.a = a - ab; R.b = b - ab;
      h += `<li>U presjeku: <b>${ab}</b>. Samo ${n1}: ${a} − ${ab} = <b>${R.a}</b>; samo ${n2}: ${b} − ${ab} = <b>${R.b}</b>.</li>`;
    }
    const parts = three ? [R.a, R.b, R.c, R.ab, R.ac, R.bc, R.abc] : [R.a, R.b, R.ab];
    if (parts.some(x => x < 0)) throw new MathErr("Podaci su kontradiktorni – neki dio dijagrama ispada negativan. Provjeri brojeve (ili opciju „samo ta dva“).");
    const union = parts.reduce((s, x) => s + x, 0);
    R.none = tot === null ? null : tot - union;
    if (R.none !== null && R.none < 0) throw new MathErr(`Ukupno (${tot}) je manje od broja elemenata u uniji (${union}) – podaci su kontradiktorni.`);
    const one = three ? R.a + R.b + R.c : R.a + R.b, two = three ? R.ab + R.ac + R.bc : R.ab;
    h += `<li>U uniji (bar jedan): ${parts.join(" + ")} = <b>${union}</b>.</li>`;
    h += `</ol>${vennSvg([n1, n2, n3], R, three)}`;
    h += `<table class="res"><tr><td>Ukupno u uniji (bar jedno)</td><td><b>${union}</b></td></tr><tr><td>Tačno jedno (samo jedan skup)</td><td><b>${one}</b></td></tr><tr><td>Tačno dva</td><td><b>${two}</b></td></tr>${three ? `<tr><td>Sva tri</td><td><b>${R.abc}</b></td></tr>` : ""}${R.none !== null ? `<tr><td>Ni u jednom (${tot} − ${union})</td><td><b>${R.none}</b></td></tr>` : ""}</table>`;
    if (three && !only) h += `<p class="hint">Provjera formulom: ${a}+${b}+${c} − ${ab} − ${ac} − ${bc} + ${abc} = ${a + b + c - ab - ac - bc + abc}.</p>`;
    return h;
  });
  $("#vn-go").onclick = vnSolve;
  $$("#tab-skupovi .ex[data-v]").forEach(btn => btn.onclick = () => {
    const v = JSON.parse(btn.dataset.v);
    ["n1", "n2", "n3", "a", "b", "c", "ab", "ac", "bc", "abc", "tot"].forEach((k, i) => $("#vn-" + k).value = v[i]);
    // u zadatku "Rođendan": pica-jagnjetina 4, pica-riba 3, jagnjetina-riba 1 → redoslijed ab, ac, bc
    $("#vn-only").checked = false; vnSolve();
  });
}
