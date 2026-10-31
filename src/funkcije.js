// ===================== FUNKCIJE (PRESLIKAVANJA) =====================
"use strict";

function arrowDiagram(X, Y, f, names = ["X", "Y"]) {
  const H = Math.max(X.length, Y.length) * 34 + 60, W = 340;
  const yX = X.map((_, i) => 45 + i * 34 + (Math.max(X.length, Y.length) - X.length) * 17);
  const yY = Y.map((_, i) => 45 + i * 34 + (Math.max(X.length, Y.length) - Y.length) * 17);
  let g = `<svg class="arrows" viewBox="0 0 ${W} ${H}"><defs><marker id="arf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="arrh"/></marker></defs>`;
  g += `<ellipse cx="70" cy="${H / 2 + 6}" rx="48" ry="${H / 2 - 12}" class="oval"/><ellipse cx="270" cy="${H / 2 + 6}" rx="48" ry="${H / 2 - 12}" class="oval"/>`;
  g += `<text x="70" y="18" text-anchor="middle" class="vn">${esc(names[0])}</text><text x="270" y="18" text-anchor="middle" class="vn">${esc(names[1])}</text>`;
  f.forEach(([x, y]) => { const i = X.indexOf(x), j = Y.indexOf(y); if (i < 0 || j < 0) return; g += `<line x1="86" y1="${yX[i]}" x2="250" y2="${yY[j]}" class="edge" marker-end="url(#arf)"/>`; });
  X.forEach((x, i) => g += `<circle cx="70" cy="${yX[i]}" r="3" class="dot"/><text x="60" y="${yX[i] + 4}" text-anchor="end" class="nodet">${esc(x)}</text>`);
  Y.forEach((y, j) => g += `<circle cx="270" cy="${yY[j]}" r="3" class="dot"/><text x="280" y="${yY[j] + 4}" class="nodet">${esc(y)}</text>`);
  return g + "</svg>";
}

function analyzeFinite(X, Y, f, fname = "f") {
  let h = "", isMap = true;
  const notIn = f.filter(([x, y]) => !X.includes(x) || !Y.includes(y));
  if (notIn.length) {
    h += `<div class="verdict no">✖ ${fname} NIJE binarna relacija iz X u Y jer ${notIn.map(pairStr).join(", ")} ∉ X × Y.</div>`;
    return { h, isMap: false };
  }
  h += `<div class="step">✔ ${fname} jeste binarna relacija jer je ${fname} ⊆ X × Y.</div>`;
  const noImg = X.filter(x => !f.some(p => p[0] === x));
  const multi = X.filter(x => f.filter(p => p[0] === x).length > 1);
  if (noImg.length) { isMap = false; h += `<div class="step bad">✖ ${fname} nije preslikavanje jer ${noImg.join(", ")} ∈ X ${noImg.length > 1 ? "nisu" : "nije"} u relaciji ni sa jednim elementom y ∈ Y.</div>`; }
  if (multi.length) { isMap = false; const x = multi[0]; h += `<div class="step bad">✖ ${fname} nije preslikavanje jer ${f.filter(p => p[0] === x).map(pairStr).join(", ")} ∈ ${fname} – elementu ${x} su pridružene različite vrijednosti.</div>`; }
  if (!isMap) return { h, isMap };
  h += `<div class="step">✔ ${fname} jeste preslikavanje: (∀x ∈ X)(∃!y ∈ Y) (x, y) ∈ ${fname}.</div>`;
  const img = x => f.find(p => p[0] === x)[1];
  let inj = true, injWhy = "";
  outer: for (let i = 0; i < X.length; i++) for (let j = i + 1; j < X.length; j++) if (img(X[i]) === img(X[j])) { inj = false; injWhy = `${X[i]} ≠ ${X[j]}, a ${fname}(${X[i]}) = ${fname}(${X[j]}) = ${img(X[i])}`; break outer; }
  const notHit = Y.filter(y => !X.some(x => img(x) === y));
  const surj = !notHit.length;
  h += `<table class="props"><tr class="${inj ? "yes" : "no"}"><td><b>Injektivno (1-1)</b></td><td>${inj ? "✔ DA" : "✖ NE"}</td><td>${inj ? "različiti originali imaju različite slike" : esc(injWhy)}</td></tr>`;
  h += `<tr class="${surj ? "yes" : "no"}"><td><b>Sirjektivno („na“)</b></td><td>${surj ? "✔ DA" : "✖ NE"}</td><td>${surj ? `${fname}(X) = Y` : `${notHit.join(", ")} ∈ Y ${notHit.length > 1 ? "nemaju" : "nema"} original`}</td></tr>`;
  h += `<tr class="${inj && surj ? "yes" : "no"}"><td><b>Bijektivno</b></td><td>${inj && surj ? "✔ DA" : "✖ NE"}</td><td>${inj && surj ? "injekcija i sirjekcija" : "nije istovremeno injekcija i sirjekcija"}</td></tr></table>`;
  if (inj && surj) h += `<div class="verdict ok">${fname}⁻¹ = {${f.map(([x, y]) => `(${y}, ${x})`).join(", ")}} &nbsp; (okrenemo parove)</div>`;
  h += `<div class="step mono">${fname}(X) = ${esc(setStr(sortElems([...new Set(X.map(img))])))}</div>`;
  return { h, isMap, inj, surj, img };
}

// ---------- funkcije po dijelovima ----------
function parseCond(s) { // vraća interval {a, ac, b, bc}
  s = s.replace(/≤/g, "<=").replace(/≥/g, ">=").replace(/−/g, "-").replace(/\s/g, "").replace(/^ako/, "");
  if (/^(x∈ℝ|svex|x∈R)$/i.test(s) || s === "") return { a: -Infinity, ac: false, b: Infinity, bc: false };
  let m = s.match(/^x∈(.+)$/);
  if (m) { const I = IV.parse(m[1]); if (I.length !== 1) throw new MathErr("Uslov mora biti jedan interval."); return I[0]; }
  const parts = s.split(/(<=|>=|<|>)/);
  if (parts.length === 3) {
    const [L, op, R] = parts;
    if (L === "x") { const v = Frac.parse(R); return op[0] === "<" ? { a: -Infinity, ac: false, b: v, bc: op === "<=" } : { a: v, ac: op === ">=", b: Infinity, bc: false }; }
    if (R === "x") { const v = Frac.parse(L); return op[0] === "<" ? { a: v, ac: op === "<=", b: Infinity, bc: false } : { a: -Infinity, ac: false, b: v, bc: op === ">=" }; }
  }
  if (parts.length === 5 && parts[2] === "x" && parts[1][0] === "<" && parts[3][0] === "<") {
    return { a: Frac.parse(parts[0]), ac: parts[1] === "<=", b: Frac.parse(parts[4]), bc: parts[3] === "<=" };
  }
  throw new MathErr(`Ne razumijem uslov "${s}". Primjeri: x<1, 1<=x<=2, x>2, x∈[0,1].`);
}
function parsePiecewise(txt, name) {
  const lines = txt.split("\n").map(s => s.trim()).filter(Boolean);
  if (!lines.length) throw new MathErr(`Funkcija ${name} nije zadata.`);
  return lines.map(l => {
    const [e, c = ""] = l.split(/;|,\s*ako|\bako\b/);
    const [a, b] = linearOf(e.trim());
    return { a, b, I: parseCond(c.trim()), src: l };
  });
}
const ivS = I => IV.str([I]);
function condStr(I) {
  if (I.a === -Infinity && I.b === Infinity) return "x ∈ ℝ";
  if (I.a === -Infinity) return `x ${I.bc ? "≤" : "<"} ${IV.v(I.b)}`;
  if (I.b === Infinity) return `x ${I.ac ? "≥" : ">"} ${IV.v(I.a)}`;
  if (IV.cmp(I.a, I.b) === 0) return `x = ${IV.v(I.a)}`;
  return `${IV.v(I.a)} ${I.ac ? "≤" : "<"} x ${I.bc ? "≤" : "<"} ${IV.v(I.b)}`;
}
function preimageLinear(a, b, J) { // {x : a x + b ∈ J}
  if (a.isZero()) return IV.has([J], b) ? [{ a: -Infinity, ac: false, b: Infinity, bc: false }] : [];
  const t = v => (v === Infinity || v === -Infinity) ? (a.sign() > 0 ? v : -v) : v.sub(b).div(a);
  let lo = t(J.a), hi = t(J.b), lc = J.ac, hc = J.bc;
  if (a.sign() < 0) { [lo, hi] = [hi, lo]; [lc, hc] = [hc, lc]; }
  return [{ a: lo, ac: lc, b: hi, bc: hc }];
}

function funkcijeRender() {
  const panel = $("#tab-funkcije");
  panel.innerHTML = `
  <section class="card">
    <h2>Preslikavanje na konačnim skupovima</h2>
    <p class="lead">Da li je relacija f ⊆ X × Y preslikavanje? Da li je injektivno, sirjektivno, bijektivno? Inverz.</p>
    <details class="theory"><summary>📘 Pravila i teorija</summary>
      <ul>
        <li>Binarna relacija f ⊆ X × Y je <b>preslikavanje (funkcija)</b> iz X u Y ako za <u>svaki</u> x ∈ X postoji <u>tačno po jedan</u> y ∈ Y takav da (x, y) ∈ f: (∀x ∈ X)(∃!y ∈ Y) (x, y) ∈ f.</li>
        <li>Nije preslikavanje ako neki x nema sliku, ili ako neki x ima dvije različite slike.</li>
        <li><b>Injektivno (1-1):</b> (∀x₁, x₂ ∈ X) f(x₁) = f(x₂) ⇒ x₁ = x₂, ekvivalentno x₁ ≠ x₂ ⇒ f(x₁) ≠ f(x₂).</li>
        <li><b>Sirjektivno („na“):</b> (∀y ∈ Y)(∃x ∈ X) y = f(x), tj. f(X) = Y.</li>
        <li><b>Bijektivno</b> = injektivno i sirjektivno. Tada postoji jedinstvena bijekcija f⁻¹: Y → X sa f⁻¹∘f = id<sub>X</sub>, f∘f⁻¹ = id<sub>Y</sub>.</li>
        <li><b>Jednakost:</b> f: A → B i g: C → D su jednaka ako je A = C, B = D i (∀x ∈ A) f(x) = g(x).</li>
        <li><b>Kompozicija:</b> za f: A → B, g: B → C, (g∘f)(x) = g(f(x)). Kompozicija injekcija (sirjekcija, bijekcija) je injekcija (sirjekcija, bijekcija).</li>
      </ul>
    </details>
    <div class="grid2">
      <div><label>X</label><input id="ff-X" class="mono" value="1, 2, 3, 4, 5"></div>
      <div><label>Y</label><input id="ff-Y" class="mono" value="a, b, c"></div>
    </div>
    <label>f =</label><textarea id="ff-f" class="mono" rows="2">(1,c), (2,a), (3,b), (4,a), (5,b)</textarea>
    <div class="btns"><button class="primary" id="ff-go">Ispitaj</button>
      <span class="ex-label">Zadatak 1:</span>
      <button class="ex" data-f="(1,a), (2,b), (3,b), (4,c)">f₁</button>
      <button class="ex" data-f="(1,a), (2,b), (3,c), (4,b), (5,a), (1,c)">f₂</button>
      <button class="ex" data-f="(1,c), (2,a), (3,b), (4,a), (5,b)">f₃</button>
    </div>
    <div class="out" id="ff-out"></div>
  </section>

  <section class="card">
    <h2>Realna funkcija: injektivnost, sirjektivnost, inverz</h2>
    <p class="lead">Podržani tipovi: konstantna, linearna ax + b, razlomljeno-linearna (ax + b)/(cx + d), kvadratna ax² + bx + c. Postupak se ispisuje kao na vježbama.</p>
    <details class="theory"><summary>📘 Postupak</summary>
      <ul>
        <li><b>Injektivnost:</b> pretpostavimo f(x₁) = f(x₂) i algebarski izvedemo x₁ = x₂. Za NE dovoljan je jedan kontraprimjer: x₁ ≠ x₂ sa f(x₁) = f(x₂) (npr. kod x² uzmemo 1 i −1).</li>
        <li><b>Sirjektivnost:</b> za proizvoljno y iz kodomena riješimo y = f(x) po x i provjerimo da x pripada domenu.</li>
        <li><b>Inverz:</b> iz y = f(x) izrazimo x = f⁻¹(y), pa zamijenimo oznake: f⁻¹(x). Domen inverza = kodomen funkcije.</li>
        <li>Kod (ax + b)/(cx + d): domen ℝ \\ {−d/c}, skup vrijednosti ℝ \\ {a/c} (ako je ad − bc ≠ 0).</li>
      </ul>
    </details>
    <label>f(x) =</label>
    ${symbolBar("#fr-in", ["^", "(", ")", "/", "x"])}
    <input id="fr-in" class="mono" value="(2x+1)/(x-1)">
    <div class="btns"><button class="primary" id="fr-go">Analiziraj</button>
      <span class="ex-label">Primjeri:</span>
      <button class="ex" data-f="3">4a) f(x)=3</button>
      <button class="ex" data-f="2x+1">4b) 2x+1</button>
      <button class="ex" data-f="3x^2+1">4c) 3x²+1</button>
      <button class="ex" data-f="(2x+1)/(x-1)">Zadatak 6</button>
    </div>
    <div class="out" id="fr-out"></div>
  </section>

  <section class="card">
    <h2>Smjena: iz f(ax + b) = … odredi f(x) i f(cx + d)</h2>
    <details class="theory"><summary>📘 Postupak</summary><p>Uvedemo smjenu t = ax + b, izrazimo x = (t − b)/a, uvrstimo u desnu stranu i dobijemo f(t), tj. f(x). Zatim u f(x) umjesto x uvrstimo traženi izraz.</p></details>
    <div class="grid3">
      <div><label>Argument lijevo: f( … )</label><input id="fs-arg" class="mono" value="x-1"></div>
      <div><label>= (desna strana)</label><input id="fs-rhs" class="mono" value="x^2"></div>
      <div><label>Traži se f( … )</label><input id="fs-t" class="mono" value="x+1"></div>
    </div>
    <div class="btns"><button class="primary" id="fs-go">Riješi</button><button class="ex" id="fs-ex">Zadatak 3</button></div>
    <div class="out" id="fs-out"></div>
  </section>

  <section class="card">
    <h2>Funkcije zadate po dijelovima: da li je funkcija, i kompozicija g∘f</h2>
    <p class="lead">Svaki red: <span class="mono">izraz ; uslov</span>. Izrazi moraju biti linearni (ax + b).</p>
    <details class="theory"><summary>📘 Postupak za g∘f</summary>
      <p>(g∘f)(x) = g(f(x)). Za svaki dio funkcije f (uslov na x) gledamo u koji dio od g pada <b>vrijednost f(x)</b>: rješavamo uslov iz g u kojem umjesto x stoji f(x), pa ga presiječemo sa uslovom iz f. Na tom dijelu je (g∘f)(x) = g-izraz u koji uvrstimo f(x).</p>
      <p>Ako se dva dijela preklapaju u tački a daju različite vrijednosti (npr. 2x na [0,1] i 3x na [1,2] u x = 1), to NIJE funkcija.</p>
    </details>
    <div class="grid2">
      <div><label>f(x)</label><textarea id="fp-f" class="mono" rows="3">x-1 ; x<1
2x-2 ; 1<=x<=2
3x-4 ; x>2</textarea></div>
      <div><label>g(x)</label><textarea id="fp-g" class="mono" rows="3">x+1 ; x<0
2x+1 ; x>=0</textarea></div>
    </div>
    <div class="btns"><button class="primary" id="fp-go">Odredi g∘f</button><button id="fp-chk">Samo provjeri da li je f funkcija</button>
      <button class="ex" id="fp-ex2">Zadatak 2</button><button class="ex" id="fp-ex5">Zadatak 5</button></div>
    <div class="out" id="fp-out"></div>
  </section>

  <section class="card">
    <h2>Kompozicija na konačnim skupovima</h2>
    <div class="grid2">
      <div><label>f: A → B</label><textarea id="fc-f" class="mono" rows="2">(1,a), (2,b), (3,a)</textarea></div>
      <div><label>g: B → C</label><textarea id="fc-g" class="mono" rows="2">(a,x), (b,y)</textarea></div>
    </div>
    <div class="btns"><button class="primary" id="fc-go">g∘f i f∘g</button></div>
    <div class="out" id="fc-out"></div>
    <p class="hint">⚠ Ovaj alat ne pokriva funkcije tipa ℝ → ℝ³ (Zadatak 9) i inverze eksponencijalnih/korijenskih funkcija (Zadatak 7) – kod njih se postupak radi ručno: y = f(x), izrazi x.</p>
  </section>`;

  const goF = () => runSafe($("#ff-out"), () => {
    const X = parseList($("#ff-X").value), Y = parseList($("#ff-Y").value), f = parsePairs($("#ff-f").value);
    const r = analyzeFinite(X, Y, f);
    return r.h + arrowDiagram(X, Y, f);
  });
  $("#ff-go").onclick = goF;
  $$("#tab-funkcije .ex[data-f]").forEach(b => b.onclick = () => {
    if (b.closest("section").querySelector("#ff-f")) { $("#ff-X").value = "1, 2, 3, 4, 5"; $("#ff-Y").value = "a, b, c"; $("#ff-f").value = b.dataset.f; goF(); }
    else { $("#fr-in").value = b.dataset.f; goR(); }
  });
  const goR = () => runSafe($("#fr-out"), () => realnaAnaliza($("#fr-in").value));
  $("#fr-go").onclick = goR;
  $("#fr-in").addEventListener("keydown", e => { if (e.key === "Enter") goR(); });
  const goS = () => runSafe($("#fs-out"), smjena);
  $("#fs-go").onclick = goS;
  $("#fs-ex").onclick = () => { $("#fs-arg").value = "x-1"; $("#fs-rhs").value = "x^2"; $("#fs-t").value = "x+1"; goS(); };
  $("#fp-go").onclick = () => runSafe($("#fp-out"), () => piecewiseCompose());
  $("#fp-chk").onclick = () => runSafe($("#fp-out"), () => piecewiseCheck(parsePiecewise($("#fp-f").value, "f"), "f").h);
  $("#fp-ex2").onclick = () => { $("#fp-f").value = "2x ; x∈[0,1]\n3x ; x∈[1,2]"; runSafe($("#fp-out"), () => piecewiseCheck(parsePiecewise($("#fp-f").value, "f"), "f").h); };
  $("#fp-ex5").onclick = () => { $("#fp-f").value = "x-1 ; x<1\n2x-2 ; 1<=x<=2\n3x-4 ; x>2"; $("#fp-g").value = "x+1 ; x<0\n2x+1 ; x>=0"; runSafe($("#fp-out"), () => piecewiseCompose()); };
  $("#fc-go").onclick = () => runSafe($("#fc-out"), () => {
    const f = parsePairs($("#fc-f").value), g = parsePairs($("#fc-g").value);
    const comp = (outer, inner, on, ii) => {
      const dom = [...new Set(inner.map(p => p[0]))];
      const res = [];
      for (const x of dom) {
        const ys = inner.filter(p => p[0] === x).map(p => p[1]);
        if (ys.length > 1) throw new MathErr(`${ii} nije funkcija (${x} ima više slika).`);
        const z = outer.find(p => p[0] === ys[0]);
        if (!z) return { err: `${on}∘${ii} nije definisana: ${ii}(${x}) = ${ys[0]} nije u domenu od ${on}.` };
        res.push([x, z[1], ys[0]]);
      }
      return { res };
    };
    let h = "";
    for (const [o, i, on, ii] of [[g, f, "g", "f"], [f, g, "f", "g"]]) {
      const r = comp(o, i, on, ii);
      if (r.err) h += `<div class="step bad">✖ ${esc(r.err)}</div>`;
      else h += `<div class="step"><b>${on}∘${ii}</b>: ${r.res.map(([x, z, y]) => `(${on}∘${ii})(${x}) = ${on}(${ii}(${x})) = ${on}(${y}) = ${z}`).join("; ")}<br><span class="mono">${on}∘${ii} = {${r.res.map(([x, z]) => `(${x}, ${z})`).join(", ")}}</span></div>`;
    }
    return h;
  });
}

function realnaAnaliza(src) {
  const F = toRat(parseExpr(src, ["x"]), "x");
  const fs = F.toString("x");
  let h = `<div class="step">f(x) = <b class="mono">${esc(fs)}</b></div>`;
  const N = F.num, D = F.den;
  const fmt = v => v.toString().replace("-", "−");
  if (D.deg() === 0 && N.deg() <= 0) { // konstanta
    const c = N.co(0);
    h += `<div class="step">f: ℝ → ℝ je konstantna funkcija.</div>`;
    h += `<div class="step bad"><b>NIJE injektivna.</b> Zašto? (∃ x₁ = 1, x₂ = 2 ∈ ℝ, 1 ≠ 2): f(1) = ${fmt(c)} i f(2) = ${fmt(c)} ⇒ f(1) = f(2). Mogli smo uzeti i bilo koja druga dva realna broja.</div>`;
    h += `<div class="step bad"><b>NIJE sirjektivna</b> na ℝ: npr. y = ${fmt(c.add(1))} nema original (f uzima samo vrijednost ${fmt(c)}).</div>`;
    return h + `<div class="verdict no">Nije bijekcija ⇒ nema inverznu funkciju.</div>`;
  }
  if (D.deg() === 0 && N.deg() === 1) { // linearna
    const a = N.co(1), b = N.co(0);
    const ax = (v) => new Poly([b, a]).toString(v);
    h += `<div class="step"><b>Injektivnost.</b> Neka su x₁, x₂ ∈ ℝ takvi da važi f(x₁) = f(x₂):<br><span class="mono">${ax("x₁")} = ${ax("x₂")}</span>${b.isZero() ? "" : `<br><span class="mono">${new Poly([0, a]).toString("x₁")} = ${new Poly([0, a]).toString("x₂")}</span> &nbsp; (oduzmemo ${fmt(b)})`}<br><span class="mono">x₁ = x₂</span> &nbsp; (podijelimo sa ${fmt(a)})<br>Dakle (∀x₁, x₂ ∈ ℝ) f(x₁) = f(x₂) ⇒ x₁ = x₂ ⇒ f <b>JESTE injektivna</b>.</div>`;
    const inv = new Poly([b.neg().div(a), Frac.of(1).div(a)]);
    h += `<div class="step"><b>Sirjektivnost.</b> Neka je y ∈ ℝ proizvoljan. Iz y = ${ax("x")} slijedi x = ${esc(new Rat(inv).toNice("y"))} ∈ ℝ i f(x) = y ⇒ f <b>JESTE sirjektivna</b>.</div>`;
    return h + `<div class="verdict ok">✔ f je bijekcija ℝ → ℝ, pa postoji inverz: &nbsp; <span class="mono">f⁻¹(x) = ${esc(new Rat(inv).toNice("x"))}</span></div>` + plotPair(F, x => inv.eval(Frac.parse(x.toFixed(6))).toNumber());
  }
  if (D.deg() === 0 && N.deg() === 2) { // kvadratna
    const a = N.co(2), b = N.co(1), c = N.co(0);
    const hv = b.neg().div(a.mul(2)), kv = N.eval(hv);
    const x1 = hv.add(1), x2 = hv.sub(1);
    h += `<div class="step bad"><b>NIJE injektivna.</b> Zašto? (∃ x₁ = ${fmt(x1)}, x₂ = ${fmt(x2)} ∈ ℝ, x₁ ≠ x₂): f(${fmt(x1)}) = ${fmt(N.eval(x1))} i f(${fmt(x2)}) = ${fmt(N.eval(x2))} ⇒ f(x₁) = f(x₂). (Tačke simetrične oko tjemena x = ${fmt(hv)}.)</div>`;
    h += `<div class="step bad"><b>NIJE sirjektivna</b> na ℝ: tjeme je T(${fmt(hv)}, ${fmt(kv)}), pa f(x) ${a.sign() > 0 ? "≥" : "≤"} ${fmt(kv)} za svako x; npr. y = ${fmt(a.sign() > 0 ? kv.sub(1) : kv.add(1))} nema original.</div>`;
    const ainv = Frac.of(1).div(a);
    h += `<div class="verdict no">Na ℝ → ℝ nije bijekcija ⇒ nema inverz.</div>`;
    h += `<details class="explain" open><summary>Restrikcija koja jeste bijekcija</summary><p>Svođenjem na potpun kvadrat: y = ${a.eq(1) ? "" : a.eq(-1) ? "−" : fmt(a)}${hv.isZero() ? "x²" : `(x ${hv.sign() > 0 ? "−" : "+"} ${fmt(hv.abs())})²`}${kv.isZero() ? "" : ` ${kv.sign() > 0 ? "+" : "−"} ${fmt(kv.abs())}`}.<br>f: [${fmt(hv)}, +∞) → ${a.sign() > 0 ? `[${fmt(kv)}, +∞)` : `(−∞, ${fmt(kv)}]`} je bijekcija, a inverz je<br><span class="mono">f⁻¹(x) = ${hv.isZero() ? "" : fmt(hv) + " + "}√(${a.sign() > 0 ? (kv.isZero() ? "x" : `(x ${kv.sign() > 0 ? "−" : "+"} ${fmt(kv.abs())})`) : (kv.isZero() ? "−x" : `(${fmt(kv)} − x)`)}${a.abs().eq(1) ? "" : ` / ${fmt(a.abs())}`})</span> &nbsp; (za lijevu granu (−∞, ${fmt(hv)}] ispred korijena ide znak −).</p></details>`;
    return h;
  }
  if (N.deg() <= 1 && D.deg() === 1) { // razlomljeno-linearna
    // F = (a x + b)/(c x + d) – normalizuj na cijele koeficijente
    let a = N.co(1), b = N.co(0), c = D.co(1), d = D.co(0);
    let L = 1n; for (const v of [a, b, c, d]) L = L * v.d / bgcd(L, v.d);
    [a, b, c, d] = [a, b, c, d].map(v => v.mul(new Frac(L)));
    const det = a.mul(d).sub(b.mul(c));
    const p = (x, y) => new Poly([y, x]);
    const numS = v => p(a, b).toString(v), denS = v => p(c, d).toString(v);
    const xs = d.neg().div(c), ys = a.div(c);
    const two = (c1, v1, c2, v2) => { const t = (c, v, first) => { if (c.isZero()) return ""; const s = c.abs().eq(1) ? v : c.abs() + v; return first ? (c.sign() < 0 ? "−" : "") + s : (c.sign() < 0 ? " − " : " + ") + s; }; const a1 = t(c1, v1, true); return (a1 + t(c2, v2, !a1)) || "0"; };
    h += `<div class="step">Domen: c·x + d ≠ 0 ⇒ x ≠ ${fmt(xs)}, &nbsp; f: ℝ \\ {${fmt(xs)}} → ℝ \\ {${fmt(ys)}}.</div>`;
    if (det.isZero()) return h + `<div class="verdict no">ad − bc = 0 ⇒ funkcija je konstantna na domenu, nije injektivna.</div>`;
    h += `<div class="step"><b>Injektivnost.</b> Neka je f(x₁) = f(x₂):<br><span class="mono">(${numS("x₁")}) / (${denS("x₁")}) = (${numS("x₂")}) / (${denS("x₂")})</span><br><span class="mono">(${numS("x₁")})(${denS("x₂")}) = (${numS("x₂")})(${denS("x₁")})</span><br>Nakon množenja, članovi ${fmt(a.mul(c))}x₁x₂ i ${fmt(b.mul(d))} se skrate:<br><span class="mono">${two(a.mul(d), "x₁", b.mul(c), "x₂")} = ${two(a.mul(d), "x₂", b.mul(c), "x₁")}</span><br><span class="mono">${fmt(det)}(x₁ − x₂) = 0 ⇒ x₁ = x₂</span> &nbsp; (jer je ad − bc = ${fmt(det)} ≠ 0)<br>⇒ f <b>JESTE injektivna</b>.</div>`;
    // y = (ax+b)/(cx+d) -> x = (dy - b)/(a - c y)
    const invN = p(d, b.neg()), invD = p(c.neg(), a);
    const inv = new Rat(invN, invD);
    h += `<div class="step"><b>Sirjektivnost.</b> Neka je y ∈ ℝ \\ {${fmt(ys)}}. Rješavamo y = f(x):<br><span class="mono">y(${denS("x")}) = ${numS("x")}</span><br><span class="mono">x(${new Poly([a.neg(), c]).toString("y")}) = ${new Poly([b, d.neg()]).toString("y")}</span><br><span class="mono">x = ${esc(inv.toString("y"))}</span>, što je definisano jer je y ≠ ${fmt(ys)}; i x ≠ ${fmt(xs)} (inače bi bilo ad − bc = 0) ⇒ f <b>JESTE sirjektivna</b>.</div>`;
    return h + `<div class="verdict ok">✔ f je bijekcija, pa je &nbsp; <span class="mono">f⁻¹(x) = ${esc(inv.toString("x"))}</span>, &nbsp; f⁻¹: ℝ \\ {${fmt(ys)}} → ℝ \\ {${fmt(xs)}}</div>` + plotPair(F, x => { try { return inv.eval(Frac.parse(x.toFixed(6))).toNumber(); } catch { return NaN; } }, [xs.toNumber()], [ys.toNumber()]);
  }
  notify("Ovaj tip funkcije nije podržan za automatski postupak (podržane su konstantna, linearna, kvadratna i razlomljeno-linearna).", "warn");
  return h + `<div class="verdict no">Nije podržan tip funkcije – uradi postupak ručno: f(x₁) = f(x₂) ⇒ ?, y = f(x) ⇒ x = ?</div>`;
}

function plotPair(F, inv, vasF = [], vasI = []) {
  const W = 320, H = 320, R = 6, X = x => W / 2 + x / R * (W / 2), Y = y => H / 2 - y / R * (H / 2);
  const path = (fn, vas) => {
    let d = "", pen = false;
    for (let i = 0; i <= 600; i++) {
      const x = -R + 2 * R * i / 600;
      if (vas.some(v => Math.abs(x - v) < 0.03)) { pen = false; continue; }
      let y; try { y = fn(x); } catch { y = NaN; }
      if (!isFinite(y) || Math.abs(y) > 3 * R) { pen = false; continue; }
      d += (pen ? "L" : "M") + X(x).toFixed(1) + "," + Y(y).toFixed(1); pen = true;
    }
    return d;
  };
  let g = `<svg class="plot" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" class="pbg"/>`;
  for (let k = -R; k <= R; k++) g += `<line x1="${X(k)}" y1="0" x2="${X(k)}" y2="${H}" class="grid"/><line x1="0" y1="${Y(k)}" x2="${W}" y2="${Y(k)}" class="grid"/>`;
  g += `<line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" class="axis"/><line x1="${W / 2}" y1="0" x2="${W / 2}" y2="${H}" class="axis"/>`;
  g += `<line x1="0" y1="${H}" x2="${W}" y2="0" class="yx"/>`;
  vasF.forEach(v => g += `<line x1="${X(v)}" y1="0" x2="${X(v)}" y2="${H}" class="asym"/>`);
  vasI.forEach(v => g += `<line x1="${X(v)}" y1="0" x2="${X(v)}" y2="${H}" class="asym2"/>`);
  g += `<path d="${path(x => F.eval(Frac.parse(x.toFixed(6))).toNumber(), vasF)}" class="cf"/><path d="${path(inv, vasI)}" class="ci"/>`;
  g += `<text x="8" y="16" class="lbl" fill="#3e63dd">f(x)</text><text x="8" y="32" class="lbl" fill="#e5484d">f⁻¹(x)</text><text x="${W - 46}" y="16" class="lbl">y = x</text></svg>`;
  return `<div class="plotwrap">${g}<p class="hint">Grafici f i f⁻¹ su simetrični u odnosu na pravu y = x.</p></div>`;
}

function smjena() {
  const [a, b] = linearOf($("#fs-arg").value);
  if (a.isZero()) throw new MathErr("Argument mora zavisiti od x.");
  const P = toRat(parseExpr($("#fs-rhs").value, ["x"]), "x");
  const [c, d] = linearOf($("#fs-t").value);
  const fmt = v => v.toString().replace("-", "−");
  const back = new Rat(new Poly([b.neg().div(a), Frac.of(1).div(a)])); // x = (t-b)/a
  const f = P.compose(back);
  const g = f.compose(new Rat(new Poly([d, c])));
  let h = `<ol class="steps"><li>Uvodimo smjenu <span class="mono">t = ${esc(linStr(a, b))}</span>.</li>`;
  h += `<li>Dobijamo <span class="mono">x = ${esc(back.toString("t"))}</span>, pa je</li>`;
  h += `<li><span class="mono">f(t) = ${esc($("#fs-rhs").value.replace(/x/g, "(" + back.toString("t") + ")"))} = ${esc(f.toString("t"))}</span>, odnosno <b class="mono">f(x) = ${esc(f.toString("x"))}</b>.</li>`;
  h += `<li>Sada lako dobijamo traženo: <span class="mono">f(${esc(linStr(c, d))}) = ${esc(g.toString("x"))}</span>${g.isPoly() && g.num.deg() >= 2 ? ` = <span class="mono">${esc(g.toFactored("x"))}</span>` : ""}.</li></ol>`;
  return h + `<div class="verdict ok mono">f(${esc(linStr(c, d))}) = ${esc(g.toString("x"))}</div>`;
}

function piecewiseCheck(pcs, name) {
  let h = `<div class="step">${name}(x) = { ${pcs.map(p => `${esc(linStr(p.a, p.b))}, ${esc(condStr(p.I))}`).join("; ")} }</div>`;
  let ok = true;
  for (let i = 0; i < pcs.length; i++) for (let j = i + 1; j < pcs.length; j++) {
    const ov = IV.op([[pcs[i].I], [pcs[j].I]], (a, b) => a && b);
    if (!ov.length) continue;
    // isti izraz na preklapanju? provjeri u krajevima/tački
    const pt = ov[0].a === -Infinity ? (ov[0].b === Infinity ? Frac.of(0) : ov[0].b) : ov[0].a;
    const v1 = pcs[i].a.mul(pt).add(pcs[i].b), v2 = pcs[j].a.mul(pt).add(pcs[j].b);
    const same = pcs[i].a.eq(pcs[j].a) && pcs[i].b.eq(pcs[j].b);
    if (!same && (IV.cmp(ov[0].a, ov[0].b) !== 0 || !v1.eq(v2))) {
      ok = false;
      h += `<div class="verdict no">✖ Ovako NIJE zadana funkcija: uslovi „${esc(condStr(pcs[i].I))}“ i „${esc(condStr(pcs[j].I))}“ se preklapaju na ${esc(IV.str(ov))}, pa bi broju ${IV.v(pt)} iz domena bile pridružene dvije različite vrijednosti (${v1} i ${v2}), a to nije dozvoljeno.</div>`;
    }
  }
  if (ok) h += `<div class="verdict ok">✔ Dijelovi se ne preklapaju (ili se poklapaju u zajedničkoj tački) – ovo jeste funkcija. Domen: ${IV.str(IV.op(pcs.map(p => [p.I]), (...v) => v.some(Boolean)))}.</div>`;
  return { h, ok };
}

function piecewiseCompose() {
  const f = parsePiecewise($("#fp-f").value, "f"), g = parsePiecewise($("#fp-g").value, "g");
  const cf = piecewiseCheck(f, "f"), cg = piecewiseCheck(g, "g");
  if (!cf.ok || !cg.ok) return cf.h + cg.h;
  let h = cf.h.replace(/<div class="verdict ok">.*<\/div>/, "") + cg.h.replace(/<div class="verdict ok">.*<\/div>/, "");
  h += `<div class="step">(g∘f)(x) = g(f(x)) = { ${g.map(q => `${esc(linStr(q.a, q.b).replace(/x/g, "f(x)"))}, ako ${esc(condStr(q.I).replace(/x/g, "f(x)"))}`).join("; ")} }</div><ol class="steps">`;
  const res = [];
  for (const p of f) for (const q of g) {
    const pre = preimageLinear(p.a, p.b, q.I);
    const dom = IV.op([[p.I], pre], (a, b) => a && b);
    const fx = linStr(p.a, p.b);
    h += `<li>Za ${esc(condStr(p.I))}: f(x) = ${esc(fx)}; uslov g-dijela „${esc(condStr(q.I).replace("x", "f(x)"))}“ ⇒ ${esc(condStr(q.I).replace("x", "(" + fx + ")"))} ⇔ x ∈ ${esc(IV.str(pre))}. Presjek: ${dom.length ? esc(IV.str(dom)) : "∅ (otpada)"}.`;
    if (dom.length) {
      const A = q.a.mul(p.a), B = q.a.mul(p.b).add(q.b);
      h += ` Tu je (g∘f)(x) = ${esc(linStr(q.a, q.b).replace("x", "(" + fx + ")"))} = <b>${esc(linStr(A, B))}</b>.`;
      dom.forEach(I => res.push({ I, A, B }));
    }
    h += `</li>`;
  }
  h += `</ol>`;
  res.sort((u, v) => IV.cmp(u.I.a, v.I.a));
  // spoji susjedne dijelove sa istim izrazom
  const merged = [];
  for (const r of res) {
    const last = merged[merged.length - 1];
    if (last && last.A.eq(r.A) && last.B.eq(r.B) && IV.cmp(last.I.b, r.I.a) === 0 && (last.I.bc || r.I.ac)) { last.I = { a: last.I.a, ac: last.I.ac, b: r.I.b, bc: r.I.bc }; }
    else merged.push({ ...r, I: { ...r.I } });
  }
  h += `<div class="verdict ok"><div class="piece">(g∘f)(x) = </div><div class="brace">${merged.map(r => `<div><span class="mono">${esc(linStr(r.A, r.B))}</span>, &nbsp; ${esc(condStr(r.I))}</div>`).join("")}</div></div>`;
  return h;
}
