// ===================== KOMPLEKSNI BROJEVI (algebarski oblik) =====================
"use strict";

const CX_TIPS = {
  ipow: "Kod iⁿ je bitan samo ostatak pri dijeljenju n sa 4. Dovoljne su posljednje dvije cifre broja n: 2027 → 27 = 4·6 + 3 ⇒ i²⁰²⁷ = −i. Četiri uzastopna stepena uvijek daju zbir 0 (i − 1 − i + 1).",
  conj: "z·z̄ je uvijek realan broj a² + b² = |z|². Zato ne treba množiti član po član.",
  div: "Dijeljenje je isto što i množenje konjugovanim: z/w = z·w̄ / |w|². Imenilac c² + d² vidiš odmah. Provjera za 5 sekundi: |z/w| = |z| / |w|.",
  pyth: "Pitagorine trojke (3,4,5), (5,12,13), (8,15,17), (7,24,25) i njihove umnoške prepoznaj odmah. Tada modul znaš bez računa.",
  rot: "Množenje sa i je rotacija za 90° oko O: (a + bi)·i = −b + ai. Množenje sa −1 je rotacija za 180°.",
  moivre: "Za veće stepene koristi trigonometrijski oblik i Moavrovu formulu (tab „Trigonometrijski oblik“). Umjesto n množenja zagrada stepenuješ modul i množiš ugao.",
  onePlusI: "Zapamti (1 + i)² = 2i i (1 − i)² = −2i. Tada je npr. (1 + i)¹⁰ = (2i)⁵ = 32i, bez ijednog množenja zagrada.",
};
function tipsHtml(tips) {
  if (!tips || !tips.size) return "";
  return `<div class="insight"><b>💡 Kako bi ovo inženjer vidio odmah</b><ul>${[...tips].map(k => `<li>${CX_TIPS[k]}</li>`).join("")}</ul></div>`;
}

function kompleksniRender() {
  const panel = $("#tab-kompleksni");
  panel.innerHTML = `
  <section class="card">
    <h2>Pojam kompleksnog broja</h2>
    <details class="theory"><summary>📘 Uvod i definicija</summary>
      <p><b>Zašto?</b> Jednačina x² + 1 = 0, tj. x² = −1, nema rješenje u ℝ, jer je kvadrat svakog realnog broja nenegativan. Zato skup brojeva proširujemo.</p>
      <ul>
        <li><b>Imaginarna jedinica</b> i je broj za koji važi <b>i² = −1</b>. Takođe je i³ = −i i i⁴ = 1.</li>
        <li><b>Kompleksni broj</b> je broj oblika <b>z = a + bi</b>, gdje su a, b ∈ ℝ. a = Re(z) je <b>realni dio</b>, b = Im(z) je <b>imaginarni dio</b>. Na primjer, za z = 3 − 5i je Re(z) = 3 i Im(z) = −5 (ne −5i!).</li>
        <li><b>Posebni slučajevi:</b> b = 0 daje realan broj, a = 0 daje čisto imaginaran broj, a = b = 0 daje nulu. Svaki realan broj je i kompleksni: ℝ ⊂ ℂ.</li>
        <li><b>Osobine operacija u ℂ:</b> komutativnost (z₁ + z₂ = z₂ + z₁, z₁z₂ = z₂z₁), asocijativnost, distributivnost z₁(z₂ + z₃) = z₁z₂ + z₁z₃. Neutralni elementi su 0 i 1.</li>
      </ul>
      <div class="insight"><b>💡 Kako razmišljati (a ne samo računati)</b><ul>
        <li>Kompleksni broj je <b>tačka (vektor) u ravni</b>. Sabiranje je slaganje vektora, množenje sa i je rotacija za 90°, konjugovanje je ogledalo preko realne ose.</li>
        <li>iⁿ zavisi samo od ostatka n pri dijeljenju sa 4.</li>
        <li>z·z̄ = |z|² je uvijek realan broj. To je cijeli „trik“ dijeljenja.</li>
        <li>Jedna jednačina u ℂ znači dvije jednačine u ℝ (realni dio = realni dio, imaginarni = imaginarni).</li>
        <li>Provjeri rezultat modulom: |z₁z₂| = |z₁||z₂|, |z₁/z₂| = |z₁|/|z₂|. Ako se moduli ne slažu, negdje je greška.</li>
      </ul></div>
    </details>
  </section>

  <section class="card">
    <h2>Računanje izraza sa kompleksnim brojevima</h2>
    <p class="lead">Upiši izraz. Dobijaš svaki korak (sabiranje, množenje, dijeljenje, stepen) i rezultat u obliku a + bi.</p>
    <details class="theory"><summary>📘 Osnovne operacije</summary>
      <p>Za z₁ = a + bi i z₂ = c + di:</p>
      <ul>
        <li><b>Sabiranje</b> (pokomponentno, realni sa realnim, imaginarni sa imaginarnim): z₁ + z₂ = (a + c) + (b + d)i</li>
        <li><b>Oduzimanje</b>: z₁ − z₂ = (a − c) + (b − d)i</li>
        <li><b>Množenje</b> (distributivnost i i² = −1): (a + bi)(c + di) = (ac − bd) + (ad + bc)i</li>
        <li><b>Dijeljenje</b>: proširimo konjugovanim imeniocem: (a + bi)/(c + di) = (a + bi)(c − di)/((c + di)(c − di)) = (ac + bd)/(c² + d²) + (bc − ad)/(c² + d²)·i, za c + di ≠ 0.</li>
        <li>Primjer: (3 + 2i)/(1 − i) = (3 + 2i)(1 + i)/(1² + (−1)²) = (1 + 5i)/2 = 1/2 + 5/2 i.</li>
      </ul>
    </details>
    <label for="cx-in">Izraz</label>
    ${symbolBar("#cx-in", ["i", "^", "(", ")", "/", "√", "conj(", "|", "·"])}
    <input id="cx-in" class="mono" type="text" autocomplete="off" spellcheck="false" value="(2+i)^2 - (1-2i)(3+i)">
    <p class="hint">Zapis: <span class="mono">3+2i</span>, množenje zagrada <span class="mono">(2+3i)(1-2i)</span>, stepen <span class="mono">i^17</span>, dijeljenje <span class="mono">(3+2i)/(1-i)</span>, konjugovani <span class="mono">conj(3+2i)</span>, modul <span class="mono">|3+4i|</span>, korijen <span class="mono">√3</span> ili <span class="mono">sqrt(-4)</span>.</p>
    <div class="btns"><button class="primary" id="cx-go">Izračunaj</button>
      <span class="ex-label">Iz prezentacije:</span>
      <button class="ex" data-e="i^17 + i^22 + i^31">Primjer 1</button>
      <button class="ex" data-e="(3+2i) + (4-5i)">Sabiranje</button>
      <button class="ex" data-e="(5+3i) - (2-4i)">Oduzimanje</button>
      <button class="ex" data-e="(2+3i)(1-2i)">Množenje</button>
      <button class="ex" data-e="(3+2i)/(1-i)">Dijeljenje</button>
      <button class="ex" data-e="(2+i)^2 - (1-2i)(3+i)">Kombinovano</button>
      <span class="ex-label">Samostalni rad:</span>
      <button class="ex" data-e="i^35 + i^42 - i^17">1</button>
      <button class="ex" data-e="(3+2i) + (5-7i)">3</button>
      <button class="ex" data-e="(2-3i)(1+4i)">4</button>
      <button class="ex" data-e="(2+i)/(1+2i)">5</button>
    </div>
    <div class="out" id="cx-out"></div>
  </section>

  <section class="card">
    <h2>Stepeni imaginarne jedinice</h2>
    <p class="lead">Upiši jedan ili više eksponenata (može i sa znakom: 17, 22, 31 ili 35, 42, −17). Dobijaš svaki stepen i zbir.</p>
    <details class="theory"><summary>📘 Periodičnost stepena broja i</summary>
      <p>i¹ = i, i² = −1, i³ = i²·i = −i, i⁴ = i²·i² = 1, i⁵ = i, i⁶ = −1, … Stepeni se ponavljaju sa periodom 4:</p>
      <p class="mono">i^(4k) = 1, &nbsp; i^(4k+1) = i, &nbsp; i^(4k+2) = −1, &nbsp; i^(4k+3) = −i, &nbsp; k ∈ ℕ₀</p>
      <p>Primjer: i¹⁷ + i²² + i³¹ = i^(4·4+1) + i^(4·5+2) + i^(4·7+3) = i − 1 − i = −1.</p>
    </details>
    <label for="ip-in">Eksponenti (sa znakom ispred stepena)</label>
    <input id="ip-in" class="mono" type="text" value="17, 22, 31">
    <div class="btns"><button class="primary" id="ip-go">Izračunaj</button>
      <button class="ex" data-e="17, 22, 31">Primjer 1</button><button class="ex" data-e="35, 42, -17">Zadatak 1 (+, +, −)</button><button class="ex" data-e="2026">i²⁰²⁶</button><button class="ex" data-e="100, 101, 102, 103">4 uzastopna</button></div>
    <div class="out" id="ip-out"></div>
  </section>

  <section class="card">
    <h2>Jednakost kompleksnih brojeva: odredi x i y (ili z)</h2>
    <p class="lead">Upiši jednačinu linearnu po x i y (realni brojevi) ili po z. Primjer: <span class="mono">(2x-1) + (y+3)i = 5 - 2i</span> ili <span class="mono">z + 2conj(z) = 3 - i</span>.</p>
    <details class="theory"><summary>📘 Teorema o jednakosti</summary>
      <p>Dva kompleksna broja su jednaka <b>ako i samo ako</b> su im jednaki realni i imaginarni dijelovi:</p>
      <p class="mono">a + bi = c + di ⇔ a = c i b = d</p>
      <p>Primjer: (2x − 1) + (y + 3)i = 5 − 2i ⇒ {2x − 1 = 5, y + 3 = −2} ⇒ x = 3, y = −5.</p>
      <p>Ako je nepoznata z, pišemo z = x + yi (x, y ∈ ℝ) i z̄ = x − yi, pa radimo isto.</p>
    </details>
    <label for="eq-in">Jednačina</label>
    ${symbolBar("#eq-in", ["x", "y", "z", "i", "conj(z)", "=", "(", ")"])}
    <input id="eq-in" class="mono" type="text" value="(2x-1) + (y+3)i = 5 - 2i">
    <div class="btns"><button class="primary" id="eq-go">Riješi</button>
      <button class="ex" data-e="(2x-1) + (y+3)i = 5 - 2i">Primjer</button>
      <button class="ex" data-e="(3x-2) + (y+1)i = 7 - 4i">Zadatak 2</button>
      <button class="ex" data-e="(x + yi)(2 - i) = 7 + i">(x+yi)(2−i)</button>
      <button class="ex" data-e="z + 2conj(z) = 3 - i">z + 2z̄</button>
      <button class="ex" data-e="(1+i)z = 3 - i">(1+i)z</button>
    </div>
    <div class="out" id="eq-out"></div>
  </section>

  <section class="card">
    <h2>Modul, konjugovani broj i kompleksna ravan</h2>
    <p class="lead">Upiši z. Dobijaš Re, Im, z̄, −z, |z|, z·z̄, 1/z i crtež u kompleksnoj ravni.</p>
    <details class="theory"><summary>📘 Kompleksna ravan, konjugovani broj, modul</summary>
      <ul>
        <li>Broj z = a + bi predstavljamo <b>tačkom M(a, b)</b>. Horizontalna osa je realna osa, vertikalna osa je imaginarna osa.</li>
        <li><b>Konjugovan broj</b> broja z = a + bi je z̄ = a − bi (mijenjamo znak ispred imaginarnog dijela). Primjeri: 3 + 2i ↦ 3 − 2i, −1 − 4i ↦ −1 + 4i.</li>
        <li><b>Modul</b> (apsolutna vrijednost): |z| = √(a² + b²). To je rastojanje tačke M(a, b) od koordinatnog početka. Primjer: |3 + 2i| = √13.</li>
        <li><b>Veza modula i konjugovanog</b>: z·z̄ = (a + bi)(a − bi) = a² + b² = |z|² (razlika kvadrata). Ovo se koristi pri dijeljenju.</li>
      </ul>
    </details>
    <label for="md-in">z =</label>
    <input id="md-in" class="mono" type="text" value="-3 + 4i">
    <div class="btns"><button class="primary" id="md-go">Prikaži</button>
      <button class="ex" data-e="3 + 2i">3 + 2i</button><button class="ex" data-e="-3 + 4i">Zadatak 6</button><button class="ex" data-e="2 + 2i">2 + 2i</button><button class="ex" data-e="-1 + √3 i">−1 + √3i</button></div>
    <div class="out" id="md-out"></div>
  </section>

  ${drillCard("kd", "Vidi odmah – trening", "Pitanja koja se rješavaju u glavi za par sekundi, ako se razumije šta se dešava. Cilj je ispod 10 s po pitanju. Poslije svakog odgovora vidiš kako se rezultat „vidi“ bez računa.")}`;

  // --- računanje izraza
  const goCx = () => runSafe($("#cx-out"), () => {
    const src = $("#cx-in").value;
    const ast = parseC(src);
    const steps = [], tips = new Set();
    const r = evalC(ast, {}, steps, tips);
    let h = `<div class="step">Izraz: <span class="mono big">${esc(src.trim().replace(/\*/g, "·").replace(/-/g, "−").replace(/\s*([+−=])\s*/g, " $1 ").replace(/\( − /g, "(−").replace(/^ − /, "−"))}</span></div>`;
    if (steps.length) h += `<ol class="steps">${steps.map(s => `<li>${s}</li>`).join("")}</ol>`;
    h += `<div class="verdict ok">Rezultat: <span class="mono">${esc(r)}</span> &nbsp; <span class="hint">(Re = ${esc(r.re)}, Im = ${esc(r.im)})</span></div>`;
    if (r.isZero() === false && !(r.re.isRat() && r.im.isRat() && Math.max(...r.num().map(Math.abs)) > 1e4)) {
      const [x, y] = r.num();
      h += `<div class="plotwrap">${cplane([{ x, y, label: r.toString(), color: CPC.z, vec: true, proj: true }])}</div>`;
    }
    return h + tipsHtml(tips);
  });
  $("#cx-go").onclick = goCx;
  $("#cx-in").addEventListener("keydown", e => { if (e.key === "Enter") goCx(); });
  $$("#cx-go ~ .ex").forEach(b => b.onclick = () => { $("#cx-in").value = b.dataset.e; goCx(); });

  // --- stepeni i
  const goIp = () => runSafe($("#ip-out"), () => {
    const parts = $("#ip-in").value.split(/[,;\s]+/).filter(Boolean);
    if (!parts.length) throw new MathErr("Upiši bar jedan eksponent.");
    if (parts.length > 12) throw new MathErr("Najviše 12 eksponenata.");
    const names = ["1", "i", "−1", "−i"], vals = [new Cx(Sd.of(1)), Cx.I(), new Cx(Sd.of(-1)), new Cx(new Sd(), Sd.of(-1))];
    let sum = new Cx(), rows = "", expr = [], sub = [], hit = new Set();
    parts.forEach((p, idx) => {
      const m = p.match(/^([+−-]?)(\d+)$/);
      if (!m) throw new MathErr(`"${p}" nije cijeli broj (znak ispred znači + ili − ispred stepena).`);
      const neg = m[1] === "-" || m[1] === "−", n = BigInt(m[2]);
      const q = n / 4n, r = Number(n % 4n);
      hit.add(r);
      rows += `<tr><td class="mono">${neg ? "−" : idx ? "+" : ""} i^${n}</td><td class="mono">i^(4·${q} + ${r})</td><td class="mono"><b>${names[r]}</b></td></tr>`;
      expr.push(`${neg ? " − " : idx ? " + " : ""}i^${n}`);
      const v = neg ? vals[r].neg() : vals[r];
      sub.push(idx === 0 ? v.toString() : (v.toString().startsWith("−") ? " − " + v.toString().slice(1) : " + " + v));
      sum = sum.add(v);
    });
    let h = `<table class="res"><tr><th>stepen</th><th>n = 4k + r</th><th>vrijednost</th></tr>${rows}</table>`;
    h += `<div class="verdict ok mono">${esc(expr.join(""))} = ${esc(sub.join(""))} = ${esc(sum)}</div>`;
    // jedinični krug sa 4 vrijednosti
    const P = [[1, 0, "1 (r=0)"], [0, 1, "i (r=1)"], [-1, 0, "−1 (r=2)"], [0, -1, "−i (r=3)"]];
    h += `<div class="plotwrap">${cplane(P.map(([x, y, l], k) => ({ x, y, label: l, color: hit.has(k) ? CPC.w : "var(--fk-ink2,#888)", vec: hit.has(k) })), [], { unit: true })}<p class="hint">Svako množenje sa i okreće broj za 90°, pa se poslije 4 koraka vraćamo na 1.</p></div>`;
    return h + tipsHtml(new Set(["ipow"]));
  });
  $("#ip-go").onclick = goIp;
  $$("#ip-go ~ .ex").forEach(b => b.onclick = () => { $("#ip-in").value = b.dataset.e; goIp(); });

  // --- jednakost
  const goEq = () => runSafe($("#eq-out"), () => kxEquation($("#eq-in").value));
  $("#eq-go").onclick = goEq;
  $$("#eq-go ~ .ex").forEach(b => b.onclick = () => { $("#eq-in").value = b.dataset.e; goEq(); });

  // --- modul
  const goMd = () => runSafe($("#md-out"), () => {
    const z = evalC(parseC($("#md-in").value));
    const m = modulus(z), n2 = z.norm2();
    const [x, y] = z.num();
    let h = `<table class="res">
      <tr><td>z</td><td class="mono"><b>${esc(z)}</b> &nbsp;→ tačka M(${esc(z.re)}, ${esc(z.im)}), ${quadrant(z)}</td></tr>
      <tr><td>Re(z), Im(z)</td><td class="mono">${esc(z.re)}, &nbsp;${esc(z.im)}</td></tr>
      <tr><td>z̄ (konjugovani)</td><td class="mono">${esc(z.conj())}</td></tr>
      <tr><td>−z</td><td class="mono">${esc(z.neg())}</td></tr>
      <tr><td>|z|</td><td class="mono">√(${esc(sqP(z.re))}² + ${esc(sqP(z.im))}²) = √(${esc(n2)}) = <b>${m ? esc(m) : Math.hypot(x, y).toFixed(4)}</b></td></tr>
      <tr><td>z·z̄ = |z|²</td><td class="mono">${esc(n2)}</td></tr>
      ${z.isZero() ? "" : `<tr><td>1/z = z̄ / |z|²</td><td class="mono">${esc(z.conj().paren())} / ${esc(n2.paren())} = ${esc(new Cx(Sd.of(1)).div(z))}</td></tr>`}
    </table>`;
    h += `<div class="plotwrap">${cplane([{ x, y, label: "z", color: CPC.z, vec: true, proj: true }, { x, y: -y, label: "z̄", color: CPC.w, vec: true }, { x: -x, y: -y, label: "−z", color: CPC.o }])}<p class="hint">z̄ je ogledalo tačke z preko realne ose, a −z je simetrična tački z u odnosu na O. |z| je dužina plave strelice.</p></div>`;
    const tips = new Set(["conj"]); if (pythTriple(z)) tips.add("pyth");
    return h + tipsHtml(tips);
  });
  $("#md-go").onclick = goMd;
  $$("#md-go ~ .ex").forEach(b => b.onclick = () => { $("#md-in").value = b.dataset.e; goMd(); });

  drillWire("kd", KX_DRILL);
}

// ---------- rješavanje jednačine L = R (linearno po x, y ili z) ----------
function kxEquation(src) {
  const parts = src.split("=");
  if (parts.length !== 2) throw new MathErr("Jednačina mora imati tačno jedan znak =.");
  const L = parseC(parts[0], ["x", "y", "z"]), R = parseC(parts[1], ["x", "y", "z"]);
  const usesZ = /z/.test(src.replace(/conj/g, "").replace(/sqrt/g, "")) || /conj\(\s*z/.test(src);
  const usesXY = /[xy]/.test(src);
  if (usesZ && usesXY) throw new MathErr("Koristi ili z ili x i y, ne oboje.");
  const env = (x, y) => { const X = new Cx(Sd.of(x)), Y = new Cx(Sd.of(y)); return { x: X, y: Y, z: new Cx(Sd.of(x), Sd.of(y)) }; };
  const F = (ast, x, y) => evalC(ast, env(x, y));
  const lin = ast => { // ast(x,y) = c0 + cx·x + cy·y  (kompleksni koeficijenti)
    const c0 = F(ast, 0, 0), cx = F(ast, 1, 0).sub(c0), cy = F(ast, 0, 1).sub(c0);
    for (const [x, y] of [[1, 1], [2, -3], [-5, 7]]) {
      const exp = c0.add(cx.scale(Sd.of(x))).add(cy.scale(Sd.of(y)));
      if (!F(ast, x, y).eq(exp)) throw new MathErr("Jednačina nije linearna po nepoznatim (npr. sadrži x², xy ili z·z̄). Takav tip nije podržan.");
    }
    return { c0, cx, cy };
  };
  const A = lin(L), B = lin(R);
  const linS = (cx, cy, c0) => joinTerms([[cx, "x"], [cy, "y"], [c0, ""]]);
  let h = "";
  if (usesZ) h += `<div class="step">Neka je <span class="mono">z = x + yi</span> (x, y ∈ ℝ). Tada je <span class="mono">z̄ = x − yi</span>.</div>`;
  const multi = s => /\s[+−]\s/.test(s);
  const side = (S) => {
    const re = linS(S.cx.re, S.cy.re, S.c0.re), im = linS(S.cx.im, S.cy.im, S.c0.im);
    let imS;
    if (multi(im)) imS = ` + (${im})i`;
    else { const neg = im.startsWith("−"), body = neg ? im.slice(1) : im; imS = `${neg ? " − " : " + "}${body === "1" ? "" : body}i`; }
    const reS = multi(re) ? `(${re})` : re;
    return { re, im, str: im === "0" ? re : re === "0" ? imS.replace(/^ \+ /, "").replace(/^ − /, "−") : reS + imS };
  };
  const sl = side(A), sr = side(B);
  h += `<div class="step">Sređimo obje strane na oblik (realni dio) + (imaginarni dio)·i:<div class="eq mono">${esc(sl.str)} = ${esc(sr.str)}</div></div>`;
  h += `<div class="step">Dva kompleksna broja su jednaka ⇔ jednaki su im realni i imaginarni dijelovi:<div class="eq mono">{ ${esc(sl.re)} = ${esc(sr.re)}<br>{ ${esc(sl.im)} = ${esc(sr.im)}</div></div>`;
  // a11 x + a12 y = b1 ; a21 x + a22 y = b2
  const a11 = A.cx.re.sub(B.cx.re), a12 = A.cy.re.sub(B.cy.re), b1 = B.c0.re.sub(A.c0.re);
  const a21 = A.cx.im.sub(B.cx.im), a22 = A.cy.im.sub(B.cy.im), b2 = B.c0.im.sub(A.c0.im);
  const det = a11.mul(a22).sub(a12.mul(a21));
  if (det.isZero()) {
    notify("Sistem nema jedinstveno rješenje.", "warn");
    return h + `<div class="verdict no">Determinanta sistema je 0 – sistem nema jedinstveno rješenje (ili nema rješenja, ili ih ima beskonačno mnogo).</div>`;
  }
  const x = b1.mul(a22).sub(a12.mul(b2)).div(det), y = a11.mul(b2).sub(b1.mul(a21)).div(det);
  const eq1 = linS(a11, a12, new Sd()) + " = " + b1, eq2 = linS(a21, a22, new Sd()) + " = " + b2;
  h += `<div class="step">Prebacimo poznate članove na desnu stranu:<div class="eq mono">{ ${esc(eq1)}<br>{ ${esc(eq2)}</div></div>`;
  const one = (v, b, c) => c.isOne() ? `${v} = ${esc(b)}` : `${v} = ${esc(b)} / ${esc(c.paren())} = ${esc(b.div(c))}`;
  if (a12.isZero() && a21.isZero()) h += `<div class="step">Svaka jednačina ima samo jednu nepoznatu: <span class="mono">${one("x", b1, a11)}</span>, &nbsp;<span class="mono">${one("y", b2, a22)}</span>.</div>`;
  else if (a11.isZero() && a22.isZero()) h += `<div class="step">Svaka jednačina ima samo jednu nepoznatu: <span class="mono">${one("y", b1, a12)}</span>, &nbsp;<span class="mono">${one("x", b2, a21)}</span>.</div>`;
  else h += `<div class="step">Sistem rješavamo (npr. Kramerovim pravilom): D = ${esc(a11.paren())}·${esc(a22.paren())} − ${esc(a12.paren())}·${esc(a21.paren())} = ${esc(det)}, &nbsp; x = D<sub>x</sub>/D = ${esc(x)}, &nbsp; y = D<sub>y</sub>/D = ${esc(y)}.</div>`;
  h += `<div class="verdict ok">x = ${esc(x)}, &nbsp; y = ${esc(y)}${usesZ ? ` &nbsp; ⇒ &nbsp; z = ${esc(new Cx(x, y))}` : ""}</div>`;
  // provjera
  const env2 = { x: new Cx(x), y: new Cx(y), z: new Cx(x, y) };
  const lv = evalC(L, env2), rv = evalC(R, env2);
  h += `<p class="hint">Provjera uvrštavanjem: lijeva strana = ${esc(lv)}, desna strana = ${esc(rv)} ${lv.eq(rv) ? "✔" : "✖"}</p>`;
  h += `<div class="insight"><b>💡 Kako se vidi odmah:</b> jedna jednačina u ℂ daje dvije jednačine u ℝ. ${a12.isZero() && a21.isZero() ? "Ovdje su nepoznate već razdvojene, pa rješenje „čitaš“: realni dio daje x, imaginarni daje y." : usesZ && !/conj/.test(src) ? "Kad je jednačina oblika w·z = u, brže je odmah podijeliti: z = u / w." : "Napiši realni i imaginarni dio odvojeno i dobijaš običan sistem 2×2."}</div>`;
  return h;
}

// ---------- generatori pitanja za „Vidi odmah“ ----------
const cxv = (a, b) => [a, b];
const cs = (a, b) => cxStr(Sd.of(a), Sd.of(b));
const nm = v => String(v).replace("-", "−"), np = v => v < 0 ? `(−${-v})` : String(v);
const KX_DRILL = [
  () => { const n = rnd(20, 2099), r = n % 4; const v = [[1, 0], [0, 1], [-1, 0], [0, -1]][r]; return { q: `i^${n} = ?`, val: v, a: cs(...v), kind: "c", why: `${n} = 4·${Math.floor(n / 4)} + ${r}. Važan je samo ostatak ${r}, pa je i^${n} = i^${r} = ${cs(...v)}. (Dovoljne su posljednje dvije cifre: ${n % 100} daje isti ostatak.)` }; },
  () => { const n = rnd(10, 500); return { q: `i^${n} + i^${n + 1} + i^${n + 2} + i^${n + 3} = ?`, val: [0, 0], a: "0", kind: "c", why: "Četiri uzastopna stepena broja i su, nekim redom, 1, i, −1 i −i. Njihov zbir je uvijek 0, bez računanja ostatka." }; },
  () => { const [p, q, r] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25], [9, 12, 15]]); const sw = Math.random() < .5; const a = (sw ? q : p) * pick([1, -1]), b = (sw ? p : q) * pick([1, -1]); return { q: `|${cs(a, b)}| = ?`, val: [r, 0], a: String(r), kind: "r", why: `(${Math.abs(a)}, ${Math.abs(b)}, ${r}) je Pitagorina trojka, pa je |z| = ${r}. Znakovi ne utiču na modul.` }; },
  () => { const a = rnd(1, 9) * pick([1, -1]), b = rnd(1, 9) * pick([1, -1]); return { q: `(${cs(a, b)})(${cs(a, -b)}) = ?`, val: [a * a + b * b, 0], a: String(a * a + b * b), kind: "c", why: `To je z·z̄ = a² + b² = ${a * a} + ${b * b} = ${a * a + b * b}. Imaginarni dijelovi se uvijek ponište.` }; },
  () => { const k = pick([2, 4, 6, 8, 10]), s = pick([1, -1]); const v = new Cx(Sd.of(1), Sd.of(s)).pow(k).num(); return { q: `(1 ${s > 0 ? "+" : "−"} i)^${k} = ?`, val: v, a: numCxStr(...v), kind: "c", why: `(1 ${s > 0 ? "+" : "−"} i)² = ${s > 0 ? "2i" : "−2i"}, pa je (1 ${s > 0 ? "+" : "−"} i)^${k} = (${s > 0 ? "2i" : "−2i"})^${k / 2} = ${numCxStr(...v)}.` }; },
  () => { const n = rnd(1, 7); const v = Cx.I().pow(-n).num(); return { q: n === 1 ? "1/i = ?" : `1/i^${n} = ?`, val: v, a: numCxStr(...v), kind: "c", why: `1/i = −i (jer je i·(−i) = 1). Zato je 1/i^${n} = (−i)^${n} = ${numCxStr(...v)}.` }; },
  () => { const a = rnd(-9, 9), b = rnd(1, 9) * pick([1, -1]); return { q: `(${cs(a, b)})·i = ?`, val: [-b, a], a: cs(-b, a), kind: "c", why: `Množenje sa i je rotacija za 90°: (a + bi)·i = −b + ai. Realni i imaginarni dio zamijene mjesta, a novi realni dio dobije suprotan znak.` }; },
  () => { const a = rnd(-9, 9), b = rnd(1, 9) * pick([1, -1]); const plus = Math.random() < .5; return { q: `z = ${cs(a, b)}, &nbsp; z ${plus ? "+" : "−"} z̄ = ?`, val: plus ? [2 * a, 0] : [0, 2 * b], a: plus ? nm(2 * a) : cs(0, 2 * b), kind: "c", why: plus ? "z + z̄ = 2·Re(z). Imaginarni dijelovi se poništavaju." : "z − z̄ = 2i·Im(z). Realni dijelovi se poništavaju." }; },
  () => { const [c, d] = pick([[2, 1], [1, 2], [1, 1], [3, 1], [1, 3], [2, 3], [3, 4], [1, -1], [2, -1]]); const n = c * c + d * d; return { q: `${n} / (${cs(c, d)}) = ?`, val: [c, -d], a: cs(c, -d), kind: "c", why: `${n} = |${cs(c, d)}|² = (${cs(c, d)})(${cs(c, -d)}). Zato je ${n}/(${cs(c, d)}) = ${cs(c, -d)}, tj. konjugovani broj.` }; },
  () => { const a = rnd(-6, 6), b = rnd(1, 6) * pick([1, -1]), c = rnd(-6, 6), d = rnd(1, 6) * pick([1, -1]); return { q: `Im[(${cs(a, b)})(${cs(c, d)})] = ?`, val: [a * d + b * c, 0], a: nm(a * d + b * c), kind: "r", why: `Ne treba cijeli proizvod. Imaginarni dio je ad + bc = ${np(a)}·${np(d)} + ${np(b)}·${np(c)} = ${nm(a * d + b * c)}.` }; },
];
