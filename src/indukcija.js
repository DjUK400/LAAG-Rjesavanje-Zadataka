// ===================== MATEMATIČKA INDUKCIJA =====================
"use strict";

const KV = { t: "var", n: "k" };
const K1 = parseExpr("k+1", ["k"]);
const fmtF = v => v.toString().replace("-", "−");

function indukcijaRender() {
  const panel = $("#tab-indukcija");
  panel.innerHTML = `
  <section class="card intro-ind">
    <details class="theory" open><summary>📘 Princip matematičke indukcije</summary>
      <p>Matematička indukcija je metod dokazivanja kojim se utvrđuje da je neki iskaz T(n) tačan za sve prirodne brojeve (ili za sve n ≥ m). Postupak ima dva koraka:</p>
      <ol>
        <li><b>(I) Baza indukcije:</b> dokažemo da je T(1) ⇔ ⊤ (ili T(m) ⇔ ⊤ za fiksiran početni broj m). Računamo lijevu stranu L i desnu stranu D i poredimo.</li>
        <li><b>(II) Induktivni korak:</b> dokažemo implikaciju T(k) ⇒ T(k + 1), k ≥ 1 (ili k ≥ m). Pretpostavimo T(k) ⇔ ⊤ (<b>induktivna hipoteza</b>) i dokažemo da je tada T(k + 1) ⇔ ⊤.</li>
      </ol>
      <p>Tada je, prema Principu matematičke indukcije, tvrđenje tačno za svaki prirodan broj (n ≥ m).</p>
      <p><b>Savjeti:</b> kod zbira, L<sub>k+1</sub> = (zbir do k) + (k+1)-vi sabirak, pa iskoristi hipotezu. Kod djeljivosti m | fₙ pišemo f<sub>k</sub> = m·a<sub>k</sub> i f<sub>k+1</sub> izrazimo preko f<sub>k</sub>. Kod nejednakosti koristimo hipotezu i neku pomoćnu nejednakost koja važi za k ≥ m.</p>
    </details>
  </section>

  <section class="card">
    <h2>Identitet sa zbirom: a(i₀) + … + a(n) = D(n)</h2>
    <p class="lead">Kompletan dokaz se generiše automatski (algebra se radi tačno, sa razlomcima).</p>
    <div class="grid3">
      <div><label>Opšti sabirak a(i)</label><input id="is-a" class="mono" value="i"></div>
      <div><label>Prvi indeks i₀</label><input id="is-i0" type="number" value="1"></div>
      <div><label>Desna strana D(n)</label><input id="is-d" class="mono" value="n(n+1)/2"></div>
      <div><label>Važi za n ≥</label><input id="is-n0" type="number" value="1"></div>
    </div>
    <div class="btns"><button class="primary" id="is-go">Dokaži</button>
      <span class="ex-label">Sa vježbi:</span>
      <button class="ex" data-v='["i",1,"n(n+1)/2",1]'>Zad. 1</button>
      <button class="ex" data-v='["i^2",1,"n(n+1)(2n+1)/6",1]'>Zad. 2</button>
      <button class="ex" data-v='["1/((3i+1)(3i+4))",0,"(n+1)/(3n+4)",1]'>Zad. 8</button>
      <button class="ex" data-v='["i^3",1,"(n(n+1)/2)^2",1]'>1³+…+n³</button>
    </div>
    <div class="out" id="is-out"></div>
  </section>

  <section class="card">
    <h2>Djeljivost: m | f(n)</h2>
    <p class="lead">Podržano: polinom po n (npr. n(n+1)(2n+1), n^7 − n), zbir/razlika dva stepena A^(αn+p) ± B^(βn+q) (npr. 7^(n+2) + 8^(2n+1), 7^n − 2^n) i stepen ± konstanta (npr. 5^n − 1, 3·4^n + 6).</p>
    <div class="grid3">
      <div><label>m</label><input id="id-m" type="number" value="57"></div>
      <div><label>f(n)</label><input id="id-f" class="mono" value="7^(n+2) + 8^(2n+1)"></div>
      <div><label>Važi za n ≥</label><input id="id-n0" type="number" value="1"></div>
    </div>
    <div class="btns"><button class="primary" id="id-go">Dokaži</button>
      <button class="ex" data-v='[57,"7^(n+2) + 8^(2n+1)",1]'>Zad. 5</button>
      <button class="ex" data-v='[6,"n(n+1)(2n+1)",1]'>Zad. 6</button>
      <button class="ex" data-v='[7,"n^7 - n",1]'>Zad. 7</button>
      <button class="ex" data-v='[3,"n^3 + 2n",1]'>3 | n³+2n</button>
      <button class="ex" data-v='[4,"5^n - 1",1]'>4 | 5ⁿ−1</button>
      <button class="ex" data-v='[5,"7^n - 2^n",1]'>5 | 7ⁿ−2ⁿ</button>
    </div>
    <div class="out" id="id-out"></div>
  </section>

  <section class="card">
    <h2>Nejednakost: L(n) &gt; D(n) za n ≥ m</h2>
    <p class="lead">Baza se računa tačno; korak se izvodi automatski kad je L polinom ili oblika Aⁿ, a D polinom.</p>
    <div class="grid3">
      <div><label>L(n)</label><input id="in-l" class="mono" value="2^n"></div>
      <div><label>znak</label><select id="in-op"><option>&gt;</option><option>≥</option></select></div>
      <div><label>D(n)</label><input id="in-d" class="mono" value="n^2"></div>
      <div><label>za n ≥</label><input id="in-n0" type="number" value="5"></div>
    </div>
    <div class="btns"><button class="primary" id="in-go">Dokaži</button>
      <button class="ex" data-v='["n^2",">","2n+1",3]'>Zad. 3</button>
      <button class="ex" data-v='["2^n",">","n^2",5]'>Zad. 4</button>
      <button class="ex" data-v='["3^n",">","n^3",4]'>3ⁿ &gt; n³</button>
    </div>
    <div class="out" id="in-out"></div>
  </section>`;

  const sGo = () => runSafe($("#is-out"), indZbir);
  $("#is-go").onclick = sGo;
  $$("#is-go ~ .ex").forEach(b => b.onclick = () => { const v = JSON.parse(b.dataset.v); ["a", "i0", "d", "n0"].forEach((k, i) => $("#is-" + k).value = v[i]); sGo(); });
  const dGo = () => runSafe($("#id-out"), indDjeljivost);
  $("#id-go").onclick = dGo;
  $$("#id-go ~ .ex").forEach(b => b.onclick = () => { const v = JSON.parse(b.dataset.v); ["m", "f", "n0"].forEach((k, i) => $("#id-" + k).value = v[i]); dGo(); });
  const nGo = () => runSafe($("#in-out"), indNejednakost);
  $("#in-go").onclick = nGo;
  $$("#in-go ~ .ex").forEach(b => b.onclick = () => { const v = JSON.parse(b.dataset.v); $("#in-l").value = v[0]; $("#in-op").value = v[1]; $("#in-d").value = v[2]; $("#in-n0").value = v[3]; nGo(); });
}

function intIn(sel, name) { const v = Number($(sel).value); if (!Number.isInteger(v)) throw new MathErr(`${name} mora biti cijeli broj.`); return v; }

// ---------- zbir ----------
function indZbir() {
  const aSrc = $("#is-a").value, dSrc = $("#is-d").value;
  const i0 = intIn("#is-i0", "i₀"), n0 = intIn("#is-n0", "Početni n");
  const aAst = parseExpr(aSrc, ["i"]), dAst = parseExpr(dSrc, ["n"]);
  const aR = toRat(aAst, "i"), dR = toRat(dAst, "n");
  const a = i => evalExact(aAst, { i }), D = n => evalExact(dAst, { n });
  const Ls = n => { let s = Frac.of(0); for (let i = i0; i <= n; i++) s = s.add(a(i)); return s; };
  if (n0 < i0) throw new MathErr("n mora biti ≥ i₀.");
  // provjera tačnosti
  for (let n = n0; n < n0 + 8; n++) if (!Ls(n).eq(D(n))) {
    notify("Tvrđenje NIJE tačno – nađen kontraprimjer.", "err");
    return `<div class="verdict no">✖ Tvrđenje nije tačno: za n = ${n} je L = ${fmtF(Ls(n))}, a D = ${fmtF(D(n))}. Provjeri unos (sabirak, prvi indeks, desnu stranu).</div>`;
  }
  const termK = astStr(substAst(aAst, "i", KV)), termK1raw = astStr(substAst(aAst, "i", K1));
  const k1Ast = substAst(aAst, "i", K1);
  const termK1 = (k1Ast.t === "op" && (k1Ast.op === "+" || k1Ast.op === "-")) || k1Ast.t === "neg" ? `(${termK1raw})` : termK1raw;
  const dK = astStr(substAst(dAst, "n", KV)), dK1 = astStr(substAst(dAst, "n", K1));
  const first = [i0, i0 + 1, i0 + 2].map(i => fmtF(a(i)));
  const sumStr = (lastTerm) => `${first.join(" + ")} + ⋯ + ${lastTerm}`;
  const nTerms0 = n0 - i0 + 1;
  let h = `<div class="step"><b>Tvrđenje T(n):</b> <span class="mono">${sumStr(astStr(substAst(aAst, "i", { t: "var", n: "n" })))} = ${esc(astStr(dAst))}</span>, n ≥ ${n0}</div>`;
  // (I)
  const base = []; for (let i = i0; i <= n0; i++) base.push(fmtF(a(i)));
  h += `<div class="step"><b>(I) Provjerimo da li je T(${n0}) ⇔ ⊤.</b><br>${nTerms0 > 1 ? `Pažnja: za n = ${n0} na lijevoj strani ima ${nTerms0} sabirka. ` : ""}L<sub>${n0}</sub> = ${base.join(" + ")} = <b>${fmtF(Ls(n0))}</b>, &nbsp; D<sub>${n0}</sub> = ${esc(astStr(substAst(dAst, "n", { t: "num", v: Frac.of(n0) })))} = <b>${fmtF(D(n0))}</b>.<br>Očigledno L<sub>${n0}</sub> = D<sub>${n0}</sub>, pa je T(${n0}) ⇔ ⊤. Kaže se da je zadovoljena baza indukcije.</div>`;
  // (II)
  const Lk1 = dR.compose(new Rat(Poly.x())).add(aR.compose(new Rat(new Poly([1, 1]))));
  const Dk1 = dR.compose(new Rat(new Poly([1, 1])));
  const DkR = dR;
  const sumAfter = DkR.add(aR.compose(new Rat(new Poly([1, 1]))));
  h += `<div class="step"><b>(II) Pretpostavimo da je T(k) ⇔ ⊤, za neko k ≥ ${n0}.</b> To znači da važi<div class="eq mono">${sumStr(esc(termK))} = ${esc(dK)} &nbsp; (H)</div>Dokažimo da je T(k+1) ⇔ ⊤. Imamo<div class="eq mono">L<sub>k+1</sub> = ${sumStr(esc(termK))} + ${esc(termK1)}<br>
   &nbsp;=<sup>(H)</sup> ${esc(dK)} + ${esc(termK1)}<br>
   &nbsp;= ${esc(sumAfter.toNice("k"))}${sumAfter.toFactored("k") !== sumAfter.toNice("k") ? `<br>&nbsp;= ${esc(sumAfter.toFactored("k"))}` : ""}</div>
   Dalje je<div class="eq mono">D<sub>k+1</sub> = ${esc(dK1)}<br>&nbsp;= ${esc(Dk1.toNice("k"))}${Dk1.toFactored("k") !== Dk1.toNice("k") ? `<br>&nbsp;= ${esc(Dk1.toFactored("k"))}` : ""}</div></div>`;
  if (!Lk1.eq(Dk1)) throw new MathErr("Induktivni korak ne prolazi – provjeri unos.");
  h += `<div class="step">pa je očigledno L<sub>k+1</sub> = D<sub>k+1</sub>, što znači da je T(k+1) ⇔ ⊤. Ovim smo dokazali da T(k) ⇒ T(k+1).</div>`;
  return h + `<div class="verdict ok">✔ Sada, prema Principu matematičke indukcije, dato tvrđenje je tačno za svaki prirodan broj n ≥ ${n0}.</div>`;
}

// ---------- djeljivost ----------
function matchExpSum(ast) { // s₁·A^(αn+p) ± s₂·B^(βn+q)  (drugi član može biti i konstanta)
  if (ast.t !== "op" || (ast.op !== "+" && ast.op !== "-")) return null;
  const term = (t, sign) => {
    if (t.t === "neg") return term(t.a, -sign);
    if (t.t === "num") return t.v.isInt() ? { s: t.v.mul(sign), A: Frac.of(1), al: Frac.of(1), p: Frac.of(0), konst: true } : null;
    let coef = Frac.of(sign);
    if (t.t === "op" && t.op === "*" && t.a.t === "num" && t.a.v.isInt()) { coef = coef.mul(t.a.v); t = t.b; }
    if (t.t !== "op" || t.op !== "^" || t.a.t !== "num" || !t.a.v.isInt()) return null;
    try { const [al, p] = linearOf(astStr(t.b).replace(/·/g, "*").replace(/−/g, "-"), "n"); if (!al.isInt() || !p.isInt() || al.sign() <= 0) return null; return { s: coef, A: t.a.v, al, p }; } catch { return null; }
  };
  const a = term(ast.a, 1), b = term(ast.b, ast.op === "-" ? -1 : 1);
  if (!a || !b || (a.konst && b.konst)) return null;
  return [a, b];
}
const expStr = (A, al, p, v) => `${A}^(${linStr(al, p, v)})`;
const powK = (T, shift) => { if (T.konst) return ""; const e = linStr(T.al, shift ? T.p.add(T.al) : T.p, "k"); return `${T.A}^${/^[a-z0-9]+$/.test(e) ? e : "(" + e + ")"}`; };
function sgnTerm(c, body, first) { // c: Frac, body: string ("" = konstanta)
  const ab = c.abs();
  const core = body ? (ab.eq(1) ? body : `${ab}·${body}`) : `${ab}`;
  if (first) return (c.sign() < 0 ? "−" : "") + core;
  return (c.sign() < 0 ? " − " : " + ") + core;
}

function indDjeljivost() {
  const m = BigInt(intIn("#id-m", "m")), n0 = intIn("#id-n0", "Početni n");
  if (m <= 0n) throw new MathErr("m mora biti prirodan broj.");
  const src = $("#id-f").value;
  const ast = parseExpr(src, ["n"]);
  const f = n => evalExact(ast, { n });
  for (let n = n0; n < n0 + 12; n++) {
    const v = f(n);
    if (!v.isInt() || v.n % m !== 0n) { notify("Tvrđenje nije tačno.", "err"); return `<div class="verdict no">✖ Tvrđenje nije tačno: f(${n}) = ${fmtF(v)} nije djeljivo sa ${m}.</div>`; }
  }
  const fb = f(n0);
  let h = `<div class="step">Neka je f<sub>n</sub> := ${esc(astStr(ast))}. Primijetimo da je<div class="eq mono">${m} | f<sub>n</sub> ⇔ ∃a<sub>n</sub> ∈ ℕ : f<sub>n</sub> = ${m}·a<sub>n</sub></div></div>`;
  h += `<div class="step"><b>(I) Provjerimo da li je T(${n0}) ⇔ ⊤.</b> f<sub>${n0}</sub> = ${esc(astStr(substAst(ast, "n", { t: "num", v: Frac.of(n0) })))} = ${fmtF(fb)} = ${m}·${fmtF(fb.div(new Frac(m)))}, pa ∃a<sub>${n0}</sub> = ${fmtF(fb.div(new Frac(m)))} ⇒ T(${n0}) ⇔ ⊤. Kaže se da je zadovoljena baza indukcije.</div>`;
  h += `<div class="step"><b>(II) Pretpostavimo da je T(k) ⇔ ⊤, za neko k ≥ ${n0}.</b> To znači da<div class="eq mono">∃a<sub>k</sub> : f<sub>k</sub> = ${m}·a<sub>k</sub> &nbsp; (H)</div>Dokažimo da je T(k+1) ⇔ ⊤.</div>`;
  const E = matchExpSum(ast);
  let R = null; try { R = toRat(ast, "n"); } catch { }
  if (E) {
    for (const [X, Y] of [[E[0], E[1]], [E[1], E[0]]]) {
      if (X.konst) continue;
      const Aa = X.A.pow(Number(X.al.n)), Bb = Y.konst ? Frac.of(1) : Y.A.pow(Number(Y.al.n)), c = Y.s.mul(Bb.sub(Aa));
      if (!c.isInt() || c.n % m !== 0n) continue;
      if (!X.s.eq(1) && !X.s.eq(-1) && !Y.konst) { /* opšti koeficijenti – i dalje važi */ }
      const xk = powK(X), yk = powK(Y), xk1 = powK(X, true), yk1 = powK(Y, true);
      const fk = sgnTerm(X.s, xk, true) + sgnTerm(Y.s, yk, false);
      const cm = c.div(new Frac(m));
      h += `<div class="eq mono">f<sub>k+1</sub> = ${sgnTerm(X.s, xk1, true)}${sgnTerm(Y.s, yk1, false)}<br>
        &nbsp;= ${sgnTerm(X.s.mul(Aa), xk, true)}${sgnTerm(Y.s.mul(Bb), yk, false)}<br>
        &nbsp;= ${Aa}·(${fk})${sgnTerm(c, yk, false)}<br>
        &nbsp;= ${Aa}·f<sub>k</sub>${sgnTerm(c, yk, false)}<br>
        &nbsp;=<sup>(H)</sup> ${Aa}·${m}·a<sub>k</sub>${c.sign() < 0 ? " − " : " + "}${yk ? m + "·" + (cm.abs().eq(1) ? yk : cm.abs() + "·" + yk) : (cm.abs().eq(1) ? m : m + "·" + cm.abs())}<br>
        &nbsp;= ${m}·(${Aa}a<sub>k</sub>${sgnTerm(cm, yk, false)})<br>
        &nbsp;= ${m}·a<sub>k+1</sub></div>`;
      h += `<div class="step">što znači da je T(k+1) ⇔ ⊤. Ključni trik: f<sub>k+1</sub> smo izrazili kao ${Aa}·f<sub>k</sub> plus ostatak, a koeficijent ostatka ${c} je djeljiv sa ${m}${Y.konst ? "" : ` (${Y.s.eq(1) ? "" : Y.s.eq(-1) ? "−" : Y.s + "·"}${Y.s.eq(1) ? `${Bb} − ${Aa}` : `(${Bb} − ${Aa})`} = ${c})`}. Ovim smo dokazali da T(k) ⇒ T(k+1).</div>`;
      return h + `<div class="verdict ok">✔ Prema Principu matematičke indukcije, ${m} | f<sub>n</sub> za svaki prirodan broj n ≥ ${n0}.</div>`;
    }
    notify("Za ovaj izraz trik „f(k+1) = A·f(k) + (djeljivo)“ ne prolazi direktno – potreban je ručni postupak.", "warn");
    return h + `<div class="verdict no">Automatski korak nije pronađen.</div>`;
  }
  if (R && R.isPoly()) {
    const P = R.num.scale(Frac.of(1).div(R.den.lead()));
    const G = P.compose(new Poly([1, 1])).sub(P);
    const allDiv = G.c.every(c => c.isInt() && c.n % m === 0n);
    h += `<div class="eq mono">f<sub>k</sub> = ${esc(P.toString("k"))}<br>f<sub>k+1</sub> = ${esc(astStr(substAst(substAst(ast, "n", KV), "k", K1)))}<br>&nbsp;= ${esc(P.compose(new Poly([1, 1])).toString("k"))}<br>&nbsp;= f<sub>k</sub> + (${esc(G.toString("k"))})</div>`;
    if (allDiv) {
      const Gm = G.scale(new Frac(1n, m));
      h += `<div class="eq mono">&nbsp;=<sup>(H)</sup> ${m}·a<sub>k</sub> + ${m}·(${esc(Gm.toString("k"))})<br>&nbsp;= ${m}·(a<sub>k</sub> + ${esc(Gm.toString("k"))})<br>&nbsp;= ${m}·a<sub>k+1</sub></div>`;
      h += `<div class="step">Svi koeficijenti razlike f<sub>k+1</sub> − f<sub>k</sub> su djeljivi sa ${m}, pa je T(k+1) ⇔ ⊤. Ovim smo dokazali da T(k) ⇒ T(k+1).</div>`;
      return h + `<div class="verdict ok">✔ Prema Principu matematičke indukcije, ${m} | f<sub>n</sub> za svaki prirodan broj n ≥ ${n0}.</div>`;
    }
    const intCo = G.c.every(c => c.isInt());
    if (intCo) {
      const res = []; for (let r = 0; r < Number(m); r++) res.push(G.eval(r));
      if (res.every(v => v.n % m === 0n)) {
        h += `<div class="step">Razlika g(k) = ${esc(G.toString("k"))} nema sve koeficijente djeljive sa ${m}, ali je g(k) djeljivo sa ${m} za svaki ostatak k mod ${m} (k = 0, …, ${Number(m) - 1}: ${res.map(fmtF).join(", ")}), pa je g(k) = ${m}·b<sub>k</sub>. Tada f<sub>k+1</sub> = ${m}a<sub>k</sub> + ${m}b<sub>k</sub> = ${m}(a<sub>k</sub> + b<sub>k</sub>).</div>`;
        notify("Korak je dokazan preko ostataka; na ispitu se razlika obično rastavi na proizvod uzastopnih brojeva.", "warn");
        return h + `<div class="verdict ok">✔ Prema Principu matematičke indukcije, ${m} | f<sub>n</sub> za svaki n ≥ ${n0}.</div>`;
      }
    }
    notify("Automatski korak nije pronađen – razlika f(k+1) − f(k) nije očigledno djeljiva.", "warn");
    return h + `<div class="verdict no">Korak treba uraditi ručno (npr. faktorisati razliku kao na vježbama, zad. 7).</div>`;
  }
  notify("Podržani su polinomi po n i oblik A^(αn+p) + B^(βn+q). Za ostale izraze ispisana je samo baza i provjera.", "warn");
  return h + `<table class="res">${Array.from({ length: 8 }, (_, i) => n0 + i).map(n => `<tr><td>f(${n})</td><td>${fmtF(f(n))} = ${m}·${fmtF(f(n).div(new Frac(m)))}</td></tr>`).join("")}</table>`;
}

// ---------- nejednakost ----------
function indNejednakost() {
  const lAst = parseExpr($("#in-l").value, ["n"]), dAst = parseExpr($("#in-d").value, ["n"]);
  const strict = $("#in-op").value === ">", op = strict ? ">" : "≥";
  const n0 = intIn("#in-n0", "Početni n");
  const L = n => evalExact(lAst, { n }), D = n => evalExact(dAst, { n });
  const holds = n => strict ? L(n).cmp(D(n)) > 0 : L(n).cmp(D(n)) >= 0;
  for (let n = n0; n < n0 + 30; n++) if (!holds(n)) { notify("Nejednakost nije tačna.", "err"); return `<div class="verdict no">✖ Za n = ${n}: L = ${fmtF(L(n))}, D = ${fmtF(D(n))} – nejednakost ne važi.</div>`; }
  const ls = astStr(lAst), ds = astStr(dAst);
  let h = `<div class="step"><b>T(n):</b> <span class="mono">${esc(ls)} ${op} ${esc(ds)}</span>, n ≥ ${n0}</div>`;
  h += `<div class="step"><b>(I) Provjerimo da li je T(${n0}) ⇔ ⊤.</b> L<sub>${n0}</sub> = ${esc(astStr(substAst(lAst, "n", { t: "num", v: Frac.of(n0) })))} = ${fmtF(L(n0))}, D<sub>${n0}</sub> = ${esc(astStr(substAst(dAst, "n", { t: "num", v: Frac.of(n0) })))} = ${fmtF(D(n0))}, pa je očigledno L<sub>${n0}</sub> ${op} D<sub>${n0}</sub> ⇒ T(${n0}) ⇔ ⊤.${n0 > 1 ? ` (Za manje n tvrđenje ne mora da važi – zato baza počinje od ${n0}.)` : ""}</div>`;
  h += `<div class="step"><b>(II) Pretpostavimo da je T(k) ⇔ ⊤ za neko k ≥ ${n0}:</b> <span class="mono">${esc(astStr(substAst(lAst, "n", KV)))} ${op} ${esc(astStr(substAst(dAst, "n", KV)))}</span> (H). Dokažimo T(k+1).</div>`;
  let Dp; try { const r = toRat(dAst, "n"); if (r.isPoly()) Dp = r.num.scale(Frac.of(1).div(r.den.lead())); } catch { }
  let Lp = null; try { const r = toRat(lAst, "n"); if (r.isPoly()) Lp = r.num.scale(Frac.of(1).div(r.den.lead())); } catch { }
  const isExp = lAst.t === "op" && lAst.op === "^" && lAst.a.t === "num" && lAst.b.t === "var" && lAst.a.v.isInt() && lAst.a.v.cmp(1) > 0;
  const checkNonNeg = (H) => { // pomoćna: H(k) ≥ 0 za k ≥ n0 (provjera)
    if (H.isZero()) return true;
    if (H.lead().sign() < 0) return false;
    for (let k = n0; k < n0 + 3000; k++) if (H.eval(k).sign() < 0) return false;
    return true;
  };
  if (!Dp || (!Lp && !isExp)) {
    notify("Automatski korak radi kad je D polinom, a L polinom ili Aⁿ. Za ostalo je prikazana provjera vrijednosti.", "warn");
    return h + `<table class="res">${Array.from({ length: 8 }, (_, i) => n0 + i).map(n => `<tr><td>n = ${n}</td><td>${fmtF(L(n))} ${op} ${fmtF(D(n))} ✔</td></tr>`).join("")}</table>`;
  }
  const Dk1 = Dp.compose(new Poly([1, 1]));
  if (isExp) {
    const A = lAst.a.v;
    const Hh = Dp.scale(A).sub(Dk1); // A·D(k) − D(k+1) ≥ 0
    if (!checkNonNeg(Hh)) { notify("Pomoćna nejednakost A·D(k) ≥ D(k+1) ne važi za sve k ≥ " + n0 + " – korak treba ručno.", "warn"); return h; }
    h += `<div class="eq mono">L<sub>k+1</sub> = ${A}^(k+1) = ${A}·${A}^k<br>&nbsp;${op}<sup>(H)</sup> ${A}·${Dp.c.filter(c => !c.isZero()).length > 1 ? "(" + esc(Dp.toString("k")) + ")" : esc(Dp.toString("k"))}<br>&nbsp;= ${esc(Dp.scale(A).toString("k"))}<br>&nbsp;= ${esc(Dk1.toString("k"))} + (${esc(Hh.toString("k"))})<br>&nbsp;≥ ${esc(Dk1.toString("k"))} = ${esc(astStr(substAst(dAst, "n", K1)))} = D<sub>k+1</sub></div>`;
    h += `<div class="step">Posljednji korak koristi pomoćnu nejednakost <span class="mono">${esc(Hh.toString("k"))} ≥ 0</span> za k ≥ ${n0} (${Hh.deg() <= 0 ? "konstanta je nenegativna" : `za k = ${n0} vrijednost je ${fmtF(Hh.eval(n0))}; vodeći koeficijent je pozitivan i izraz je ≥ 0 za sve k ≥ ${n0}`}). Dakle L<sub>k+1</sub> ${op} D<sub>k+1</sub> ⇒ T(k+1) ⇔ ⊤.</div>`;
  } else {
    const dL = Lp.compose(new Poly([1, 1])).sub(Lp), dD = Dk1.sub(Dp);
    const Hh = dL.sub(dD); // ΔL − ΔD ≥ 0
    if (!checkNonNeg(Hh)) { notify("Pomoćna nejednakost ΔL ≥ ΔD ne važi za sve k – korak treba ručno.", "warn"); return h; }
    h += `<div class="eq mono">L<sub>k+1</sub> = ${esc(astStr(substAst(lAst, "n", K1)))}<br>&nbsp;= ${esc(Lp.toString("k"))} + (${esc(dL.toString("k"))})<br>&nbsp;${op}<sup>(H)</sup> (${esc(Dp.toString("k"))}) + (${esc(dL.toString("k"))})<br>&nbsp;= ${esc(Dk1.toString("k"))} + (${esc(Hh.toString("k"))})<br>&nbsp;≥ ${esc(Dk1.toString("k"))} = D<sub>k+1</sub></div>`;
    h += `<div class="step">Koristili smo da je <span class="mono">${esc(Hh.toString("k"))} ≥ 0</span> za k ≥ ${n0}. Dakle L<sub>k+1</sub> ${op} D<sub>k+1</sub> ⇒ T(k+1) ⇔ ⊤.</div>`;
  }
  return h + `<div class="verdict ok">✔ Prema Principu matematičke indukcije, tvrđenje je tačno za svaki prirodan broj n ≥ ${n0}.</div>`;
}
