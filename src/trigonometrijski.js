// ===================== TRIGONOMETRIJSKI OBLIK KOMPLEKSNOG BROJA =====================
"use strict";

const TG_TIPS = {
  ref: "Ugao čitaš iz trougla, a ne iz formule. Odnos |b| : |a| = 1 daje π/4, √3 daje π/3, 1/√3 daje π/6. Kvadrant samo kaže gdje taj ugao „stoji“: II → π − α, III → −(π − α), IV → −α.",
  mul: "Množenje u ravni = istezanje i rotacija. Moduli se množe, uglovi sabiraju. Zato je trigonometrijski oblik brži od množenja zagrada.",
  div: "Dijeljenje = skupljanje i rotacija unazad. Moduli se dijele, uglovi oduzimaju.",
  moivre: "Moavrova formula pretvara n množenja u dvije sitnice: rⁿ i n·φ. Prvo pogledaj ugao n·φ: ako je umnožak od π/2, rezultat je realan ili čisto imaginaran i vidi se odmah.",
  period: "Ugao je određen do na 2π. Od n·φ oduzmi koliko god punih krugova (2π) treba da dođeš u (−π, π].",
  reduce: "Ugao svedi na prvi kvadrant: npr. 5π/6 = π − π/6, pa je cos 5π/6 = −cos π/6 i sin 5π/6 = sin π/6. Znak određuje kvadrant.",
};
const tgTips = set => !set.size ? "" : `<div class="insight"><b>💡 Kako bi ovo inženjer vidio odmah</b><ul>${[...set].map(k => `<li>${TG_TIPS[k]}</li>`).join("")}</ul></div>`;

function reduceK(k) { // vraća [kNorm, html objašnjenja ili ""]
  const n = normK(k);
  if (n.eq(k)) return [n, ""];
  const m = Frac.of(k).sub(n).div(2); // broj punih krugova
  return [n, ` = ${angStr(n)} ${m.sign() > 0 ? "+" : "−"} ${m.abs().eq(1) ? "" : m.abs() + "·"}2π ≡ <b>${angStr(n)}</b>`];
}
const rS = (r, rN) => r ? r.toString() : (+rN).toFixed(4);
const kS = (k, ph) => k ? angStr(k) : `${(+ph).toFixed(4)} rad`;
const kP = (k, ph) => { const s = kS(k, ph); return s.startsWith("−") || s.startsWith("-") ? `(${s.replace("-", "−")})` : s; };

// alg → trig koraci; vraća {html, r, k, rN, phN}
function algToTrig(z, tips) {
  if (z.isZero()) throw new MathErr("Za z = 0 trigonometrijski oblik nije definisan (nula nema argument).");
  const [a, b] = z.num(), rN = Math.hypot(a, b), phN = Math.atan2(b, a);
  const r = modulus(z), k = findArg(z);
  let h = `<ol class="steps"><li>Modul: <span class="mono">r = |z| = √(${sqP(z.re)}² + ${sqP(z.im)}²) = √(${z.norm2()}) = <b>${rS(r, rN)}</b></span></li>`;
  const qe = (p, q, v) => { const f = `${p}/${q}`; return f === v.toString() ? f : `${f} = ${v}`; };
  if (r) h += `<li><span class="mono">cos φ = a/r = ${qe(z.re.paren(), denP(r), z.re.div(r))}, &nbsp; sin φ = b/r = ${qe(z.im.paren(), denP(r), z.im.div(r))}</span>${!z.re.isZero() ? ` &nbsp;<span class="hint">(tg φ = b/a = ${z.im.div(z.re)})</span>` : ""}</li>`;
  h += `<li>Tačka M(${z.re}, ${z.im}) je ${quadrant(z)}`;
  if (k) {
    const ref = (!z.re.isZero() && !z.im.isZero()) ? findArg(new Cx(z.re.sign() < 0 ? z.re.neg() : z.re, z.im.sign() < 0 ? z.im.neg() : z.im)) : null;
    if (ref) { h += `. Referentni ugao (u I kvadrantu) je α = ${angStr(ref)}, jer je |b|/|a| = ${z.im.div(z.re).sign() < 0 ? z.im.div(z.re).neg() : z.im.div(z.re)}`; tips.add("ref"); }
    h += ` ⇒ <span class="mono"><b>φ = Arg z = ${angStr(k)}</b></span> (${angDeg(k)})</li>`;
  } else {
    const base = a !== 0 ? Math.atan(b / a) : 0;
    const fix = a > 0 ? "φ = arctg(b/a)" : a < 0 && b >= 0 ? "φ = π + arctg(b/a)" : a < 0 ? "φ = −π + arctg(b/a)" : b > 0 ? "φ = π/2" : "φ = −π/2";
    h += `. Ugao nije „lijep“ (nije umnožak od π/12): ${fix} = ${a !== 0 ? `arctg(${(b / a).toFixed(4)})` : ""} ≈ <b>${phN.toFixed(4)} rad</b> (${(phN * 180 / Math.PI).toFixed(2)}°)</li>`;
    notify("Argument nije standardni ugao. Prikazan je preko arctg i približno.", "warn");
  }
  h += `<li>Svi argumenti: <span class="mono">arg z = ${kS(k, phN)} + 2kπ, k ∈ ℤ</span>; glavni argument biramo iz (−π, π].</li></ol>`;
  return { html: h, r, k, rN, phN };
}
function trigToAlg(r, k, rN, phN) { // vraća {z|null, html}
  if (r && k && isStd(k)) {
    const c = cosK(k), s = sinK(k), z = new Cx(r.mul(c), r.mul(s));
    return { z, html: `<span class="mono">${r.isOne() ? "" : r.paren()}${s.isZero() ? "·" + c.paren() : `(${c}${imPart(s, false)})`} = <b>${z}</b></span>` };
  }
  const x = rN * Math.cos(phN), y = rN * Math.sin(phN);
  return { z: null, x, y, html: `<span class="mono">≈ <b>${numCxStr(x, y)}</b></span>` };
}
function getZ(src, tips) { // broj zadat u bilo kom obliku → {r,k,rN,phN, html (konverzija ako treba), label}
  const P = parseZ(src);
  if (P.trig) return { r: P.r, k: P.k, rN: P.rNum, phN: P.phiNum, html: "", z: P.z };
  const T = algToTrig(P.z, tips);
  return { ...T, z: P.z, html: `<div class="step">Prvo prevedemo <span class="mono">${esc(P.z)}</span> u trigonometrijski oblik:${T.html}</div>` };
}

function trigRender() {
  const panel = $("#tab-trig");
  panel.innerHTML = `
  <section class="card">
    <h2>Modul i argument</h2>
    <details class="theory"><summary>📘 Geometrijsko predstavljanje, modul, argument</summary>
      <ul>
        <li>Broj z = a + bi je tačka M(a, b) u kompleksnoj ravni. Osim koordinatama, možemo ga opisati <b>modulom</b> (udaljenost od O) i <b>argumentom</b> (ugao).</li>
        <li><b>Modul</b>: |z| = r = √(a² + b²). Za z = 0 je |z| = 0. Primjer: |3 + 4i| = √25 = 5.</li>
        <li><b>Argument</b> broja z ≠ 0 je ugao φ između pozitivnog dijela Ox ose i duži OM. Mjeri se od pozitivnog smjera realne ose, suprotno kretanju kazaljke na satu.</li>
        <li>Ako je φ jedan argument, onda su svi argumenti <b>arg z = φ + 2kπ, k ∈ ℤ</b>. <b>Glavni argument</b> biramo iz intervala <b>−π &lt; Arg z ≤ π</b>. Broj z = 0 nema argument.</li>
        <li><b>Određivanje argumenta</b>: cos φ = a/|z|, sin φ = b/|z|, a za a ≠ 0 i tg φ = b/a. Obavezno vodi računa o <b>kvadrantu</b> tačke M(a, b)!</li>
        <li>Primjer: z = −1 + √3i ⇒ r = √(1 + 3) = 2, cos φ = −1/2, sin φ = √3/2. Tačka je u II kvadrantu ⇒ φ = 2π/3.</li>
      </ul>
      <table class="res angtab"><tr><th>φ</th><td>0</td><td>π/6</td><td>π/4</td><td>π/3</td><td>π/2</td><td>2π/3</td><td>3π/4</td><td>5π/6</td><td>π</td></tr>
        <tr><th>cos φ</th><td>1</td><td>√3/2</td><td>√2/2</td><td>1/2</td><td>0</td><td>−1/2</td><td>−√2/2</td><td>−√3/2</td><td>−1</td></tr>
        <tr><th>sin φ</th><td>0</td><td>1/2</td><td>√2/2</td><td>√3/2</td><td>1</td><td>√3/2</td><td>√2/2</td><td>1/2</td><td>0</td></tr></table>
    </details>
  </section>

  <section class="card">
    <h2>Trigonometrijski oblik</h2>
    <details class="theory"><summary>📘 Trigonometrijski oblik i prelazi između oblika</summary>
      <ul>
        <li>Za z = a + bi ≠ 0 označimo r = |z|. Tada je a = r cos φ i b = r sin φ, pa je z = r cos φ + i r sin φ, tj. <b>z = r(cos φ + i sin φ)</b>.</li>
        <li><b>Algebarski → trigonometrijski</b>: 1. izračunaj r = √(a² + b²); 2. odredi φ, vodeći računa o kvadrantu; 3. zapiši z = r(cos φ + i sin φ). Za z = 0 trigonometrijski oblik nije definisan.</li>
        <li>Primjer: z = 1 + i ⇒ r = √2, tg φ = 1, I kvadrant ⇒ φ = π/4, pa je z = √2(cos π/4 + i sin π/4).</li>
        <li><b>Trigonometrijski → algebarski</b>: z = r cos φ + i r sin φ. Primjer: 4(cos π/3 + i sin π/3) = 4(1/2 + i√3/2) = 2 + 2√3i.</li>
      </ul>
    </details>
  </section>

  <section class="card">
    <h2>Algebarski → trigonometrijski oblik</h2>
    <p class="lead">Upiši z = a + bi. Dobijaš modul, argument (sa kvadrantom i referentnim uglom), trigonometrijski oblik i crtež.</p>
    <label for="at-in">z =</label>
    ${symbolBar("#at-in", ["i", "√", "(", ")", "/"])}
    <input id="at-in" class="mono" type="text" value="-1 + √3 i">
    <div class="btns"><button class="primary" id="at-go">Prevedi</button>
      <span class="ex-label">Iz prezentacije:</span>
      <button class="ex" data-e="-1 + √3 i">Primjer 1</button><button class="ex" data-e="1 + i">Primjer 2</button><button class="ex" data-e="3 + 4i">3 + 4i</button>
      <span class="ex-label">Još:</span><button class="ex" data-e="√3 - i">√3 − i</button><button class="ex" data-e="-2 - 2i">−2 − 2i</button><button class="ex" data-e="-5i">−5i</button><button class="ex" data-e="-4">−4</button></div>
    <div class="out" id="at-out"></div>
  </section>

  <section class="card">
    <h2>Trigonometrijski → algebarski oblik</h2>
    <p class="lead">Upiši modul r i ugao φ. Za uglove koji su umnošci od π/12 rezultat je tačan, a za ostale približan.</p>
    <div class="grid2">
      <div><label for="ta-r">r =</label><input id="ta-r" class="mono" type="text" value="4"></div>
      <div><label for="ta-p">φ =</label>${symbolBar("#ta-p", ["π", "/", "-"])}<input id="ta-p" class="mono" type="text" value="π/3"></div>
    </div>
    <div class="btns"><button class="primary" id="ta-go">Prevedi</button>
      <button class="ex" data-r="4" data-p="π/3">Primjer iz prezentacije</button><button class="ex" data-r="2" data-p="5π/6">2, 5π/6</button><button class="ex" data-r="√2" data-p="-3π/4">√2, −3π/4</button><button class="ex" data-r="6" data-p="7π/4">6, 7π/4</button></div>
    <div class="out" id="ta-out"></div>
  </section>

  <section class="card">
    <h2>Množenje i dijeljenje u trigonometrijskom obliku</h2>
    <p class="lead">Brojeve upiši u trigonometrijskom obliku, npr. <span class="mono">2(cos π/6 + i sin π/6)</span>, ili u algebarskom (<span class="mono">1 + i</span>). Algebarski oblik se prvo prevede.</p>
    <details class="theory"><summary>📘 Pravila za množenje i dijeljenje</summary>
      <p>Za z₁ = r₁(cos α + i sin α), z₂ = r₂(cos β + i sin β):</p>
      <ul>
        <li><b>Množenje</b>: z₁z₂ = r₁r₂[cos(α + β) + i sin(α + β)]. Moduli se <b>množe</b>, argumenti se <b>sabiraju</b>.</li>
        <li><b>Dijeljenje</b> (z₂ ≠ 0): z₁/z₂ = (r₁/r₂)[cos(α − β) + i sin(α − β)]. Moduli se <b>dijele</b>, od argumenta brojioca se <b>oduzima</b> argument imenioca.</li>
        <li>Primjer 3: 2(cos π/6 + i sin π/6) · 3(cos π/3 + i sin π/3) = 6(cos π/2 + i sin π/2) = 6i.</li>
        <li>Primjer 4: 8(cos 5π/6 + i sin 5π/6) / 2(cos π/6 + i sin π/6) = 4(cos 2π/3 + i sin 2π/3) = −2 + 2√3i.</li>
      </ul>
    </details>
    <label for="md1">z₁ =</label><input id="md1" class="mono" type="text" value="2(cos π/6 + i sin π/6)">
    <div class="row"><label class="chk"><input type="radio" name="md-op" value="mul" checked> z₁ · z₂</label><label class="chk"><input type="radio" name="md-op" value="div"> z₁ / z₂</label></div>
    <label for="md2">z₂ =</label><input id="md2" class="mono" type="text" value="3(cos π/3 + i sin π/3)">
    <div class="btns"><button class="primary" id="mdv-go">Izračunaj</button>
      <button class="ex" data-a="2(cos π/6 + i sin π/6)" data-b="3(cos π/3 + i sin π/3)" data-o="mul">Primjer 3 (·)</button>
      <button class="ex" data-a="8(cos 5π/6 + i sin 5π/6)" data-b="2(cos π/6 + i sin π/6)" data-o="div">Primjer 4 (:)</button>
      <button class="ex" data-a="1 + i" data-b="√3 + i" data-o="mul">(1+i)(√3+i)</button>
      <button class="ex" data-a="-1 + √3 i" data-b="1 - i" data-o="div">(−1+√3i)/(1−i)</button></div>
    <div class="out" id="mdv-out"></div>
  </section>

  <section class="card">
    <h2>Stepenovanje – Moavrova formula</h2>
    <p class="lead">Upiši z (u bilo kom obliku) i n. Dobijaš zⁿ preko Moavrove formule, sa svođenjem ugla.</p>
    <details class="theory"><summary>📘 Moavrova formula</summary>
      <p>Za z = r(cos φ + i sin φ) je z² = r²(cos 2φ + i sin 2φ), z³ = r³(cos 3φ + i sin 3φ), a uopšte:</p>
      <p class="mono"><b>zⁿ = rⁿ(cos nφ + i sin nφ), n ∈ ℕ</b></p>
      <p>Primjer 5: z = 2(cos π/6 + i sin π/6) ⇒ z³ = 2³(cos 3π/6 + i sin 3π/6) = 8(cos π/2 + i sin π/2) = 8(0 + i) = 8i.</p>
    </details>
    <div class="grid2">
      <div><label for="mv-z">z =</label><input id="mv-z" class="mono" type="text" value="2(cos π/6 + i sin π/6)"></div>
      <div><label for="mv-n">n =</label><input id="mv-n" class="mono" type="number" value="3"></div>
    </div>
    <div class="btns"><button class="primary" id="mv-go">Izračunaj zⁿ</button>
      <button class="ex" data-z="2(cos π/6 + i sin π/6)" data-n="3">Primjer 5</button>
      <button class="ex" data-z="1 + i" data-n="10">(1 + i)¹⁰</button>
      <button class="ex" data-z="-1 + √3 i" data-n="6">(−1 + √3i)⁶</button>
      <button class="ex" data-z="√3 - i" data-n="7">(√3 − i)⁷</button></div>
    <div class="out" id="mv-out"></div>
  </section>

  ${drillCard("td", "Vidi odmah – trening", "Uglovi, moduli i stepeni u glavi. Ko razumije geometriju, ovo rješava za par sekundi, a ko zna samo postupak, za par minuta. Cilj je ispod 10 s.")}`;

  // --- alg → trig
  const goAt = () => runSafe($("#at-out"), () => {
    const z = evalC(parseC($("#at-in").value)), tips = new Set();
    const T = algToTrig(z, tips);
    const [x, y] = z.num();
    let h = T.html + `<div class="verdict ok mono">z = ${esc(z)} = ${esc(trigStr(T.r, T.k, T.phN).replace(/^\((.*)\)$/, "$1"))}</div>`;
    h += `<div class="plotwrap">${cplane([{ x, y, label: z.toString(), color: CPC.z, vec: true, proj: true }], [{ phi: T.phN, color: CPC.w, label: "φ" }])}</div>`;
    return h + tgTips(tips);
  });
  $("#at-go").onclick = goAt;
  $("#at-in").addEventListener("keydown", e => { if (e.key === "Enter") goAt(); });
  $$("#at-go ~ .ex").forEach(b => b.onclick = () => { $("#at-in").value = b.dataset.e; goAt(); });

  // --- trig → alg
  const goTa = () => runSafe($("#ta-out"), () => {
    const rz = evalC(parseC($("#ta-r").value));
    if (!rz.isReal() || rz.re.sign() < 0) throw new MathErr("r mora biti nenegativan realan broj.");
    const r = rz.re, A = parseAngle($("#ta-p").value), tips = new Set();
    const k = A.k;
    let h = `<div class="step"><span class="mono">z = ${esc(trigStr(r, k, A.num))}</span></div>`;
    if (k && isStd(k)) {
      const [kn, red] = reduceK(k);
      if (red) { h += `<div class="step">Svođenje ugla: <span class="mono">${angStr(k)}${red}</span></div>`; tips.add("period"); }
      const c = cosK(k), s = sinK(k);
      h += `<div class="step"><span class="mono">cos ${angP(k)} = ${c}, &nbsp; sin ${angP(k)} = ${s}</span></div>`;
      if (!normK(k).isZero() && normK(k).abs().d !== 1n && !(normK(k).abs().d === 2n)) tips.add("reduce");
    } else notify("Ugao nije umnožak od π/12 – rezultat je približan.", "warn");
    const R = trigToAlg(r, k, r.num(), A.num);
    h += `<div class="step">z = r cos φ + i r sin φ = ${R.html}</div>`;
    const [x, y] = R.z ? R.z.num() : [R.x, R.y];
    h += `<div class="verdict ok mono">z = ${R.z ? esc(R.z) : numCxStr(x, y)}</div>`;
    h += `<div class="plotwrap">${cplane([{ x, y, label: "z", color: CPC.z, vec: true, proj: true }], [{ phi: Math.atan2(y, x), color: CPC.w, label: "φ" }])}</div>`;
    return h + tgTips(tips);
  });
  $("#ta-go").onclick = goTa;
  $$("#ta-go ~ .ex").forEach(b => b.onclick = () => { $("#ta-r").value = b.dataset.r; $("#ta-p").value = b.dataset.p; goTa(); });

  // --- množenje / dijeljenje
  const goMd = () => runSafe($("#mdv-out"), () => {
    const tips = new Set();
    const op = $('input[name="md-op"]:checked').value;
    const A = getZ($("#md1").value, tips), B = getZ($("#md2").value, tips);
    let h = A.html.replace("Prvo prevedemo", "z₁: prevedemo") + B.html.replace("Prvo prevedemo", "z₂: prevedemo");
    const exact = A.r && B.r && A.k && B.k;
    let r, k, rN, phN;
    if (op === "mul") {
      rN = A.rN * B.rN; phN = A.phN + B.phN;
      if (exact) { r = A.r.mul(B.r); k = A.k.add(B.k); }
      h += `<div class="step">Moduli se množe, argumenti sabiraju:<div class="eq mono">z₁z₂ = ${rS(A.r, A.rN)}·${rS(B.r, B.rN)}[cos(${kS(A.k, A.phN)} + ${kP(B.k, B.phN)}) + i sin(${kS(A.k, A.phN)} + ${kP(B.k, B.phN)})]<br>&nbsp;= ${exact ? trigStr(r, k) : trigStr(null, null, phN, rN)}</div></div>`;
      tips.add("mul");
    } else {
      if (B.rN === 0) throw new MathErr("z₂ ne smije biti 0.");
      rN = A.rN / B.rN; phN = A.phN - B.phN;
      if (exact) { r = A.r.div(B.r); k = A.k.sub(B.k); }
      h += `<div class="step">Moduli se dijele, argumenti oduzimaju:<div class="eq mono">z₁/z₂ = (${rS(A.r, A.rN)}/${rS(B.r, B.rN)})[cos(${kS(A.k, A.phN)} − ${kP(B.k, B.phN)}) + i sin(${kS(A.k, A.phN)} − ${kP(B.k, B.phN)})]<br>&nbsp;= ${exact ? trigStr(r, k) : trigStr(null, null, phN, rN)}</div></div>`;
      tips.add("div");
    }
    if (exact) {
      const [kn, red] = reduceK(k);
      if (red) { h += `<div class="step">Glavni argument: <span class="mono">${angStr(k)}${red}</span></div>`; tips.add("period"); }
      k = kn;
    } else notify("Bar jedan ugao nije standardni – rezultat je približan.", "warn");
    const R = trigToAlg(r, k, rN, phN);
    h += `<div class="step">Algebarski oblik: ${R.html}</div>`;
    const [x, y] = R.z ? R.z.num() : [R.x, R.y];
    h += `<div class="verdict ok mono">${op === "mul" ? "z₁z₂" : "z₁/z₂"} = ${exact ? esc(trigStr(r, k)) + " = " : ""}${R.z ? esc(R.z) : numCxStr(x, y)}</div>`;
    const za = [A.rN * Math.cos(A.phN), A.rN * Math.sin(A.phN)], zb = [B.rN * Math.cos(B.phN), B.rN * Math.sin(B.phN)];
    h += `<div class="plotwrap">${cplane([{ x: za[0], y: za[1], label: "z₁", color: CPC.z, vec: true }, { x: zb[0], y: zb[1], label: "z₂", color: CPC.w, vec: true }, { x, y, label: op === "mul" ? "z₁z₂" : "z₁/z₂", color: CPC.r, vec: true }],
      [{ phi: A.phN, color: CPC.z, label: "α", rr: 22 }, { phi: B.phN, color: CPC.w, label: "β", rr: 36 }, { phi: Math.atan2(y, x), color: CPC.r, label: op === "mul" ? "α+β" : "α−β", rr: 50 }])}</div>`;
    return h + tgTips(tips);
  });
  $("#mdv-go").onclick = goMd;
  $$("#mdv-go ~ .ex").forEach(b => b.onclick = () => { $("#md1").value = b.dataset.a; $("#md2").value = b.dataset.b; $(`input[name="md-op"][value="${b.dataset.o}"]`).checked = true; goMd(); });

  // --- Moavr
  const goMv = () => runSafe($("#mv-out"), () => {
    const tips = new Set(["moivre"]);
    const n = Number($("#mv-n").value);
    if (!Number.isInteger(n) || Math.abs(n) > 200) throw new MathErr("n mora biti cijeli broj (|n| ≤ 200).");
    const Z = getZ($("#mv-z").value, tips);
    let h = Z.html;
    const exact = Z.r && Z.k;
    const rn = exact ? (n >= 0 ? Z.r.pow(n) : Z.r.pow(-n).inv()) : null, kn = exact ? Z.k.mul(n) : null;
    const rN = Z.rN ** n, phN = Z.phN * n;
    h += `<div class="step">Moavrova formula:<div class="eq mono">z^${n} = ${Z.r ? sqP(Z.r) : Z.rN.toFixed(4)}^${n}·[cos(${n}·${kP(Z.k, Z.phN)}) + i sin(${n}·${kP(Z.k, Z.phN)})]<br>&nbsp;= ${exact ? trigStr(rn, kn) : `${rN.toFixed(4)}(cos ${phN.toFixed(4)} + i sin ${phN.toFixed(4)})`}</div></div>`;
    if (exact && Z.r && !Z.r.isRat()) h += `<p class="hint">${sqP(Z.r)}^${n} = ${rn}</p>`;
    let k2 = kn;
    if (exact) {
      const [kk, red] = reduceK(kn);
      if (red) { h += `<div class="step">Svođenje ugla (period 2π): <span class="mono">${angStr(kn)}${red}</span></div>`; tips.add("period"); }
      k2 = kk;
    } else notify("Ugao nije standardni – rezultat je približan.", "warn");
    const R = trigToAlg(rn, k2, rN, phN);
    h += `<div class="step">Algebarski oblik: ${R.html}</div>`;
    const [x, y] = R.z ? R.z.num() : [R.x, R.y];
    h += `<div class="verdict ok mono">z^${n} = ${exact ? esc(trigStr(rn, k2)) + " = " : ""}${R.z ? esc(R.z) : numCxStr(x, y)}</div>`;
    const z0 = [Z.rN * Math.cos(Z.phN), Z.rN * Math.sin(Z.phN)];
    const big = Math.hypot(x, y) / Math.max(Z.rN, 1e-9) > 40;
    h += `<div class="plotwrap">${cplane(big ? [{ x, y, label: "zⁿ", color: CPC.r, vec: true }] : [{ x: z0[0], y: z0[1], label: "z", color: CPC.z, vec: true }, { x, y, label: "zⁿ", color: CPC.r, vec: true }], big ? [{ phi: Math.atan2(y, x), color: CPC.r, label: "nφ" }] : [{ phi: Z.phN, color: CPC.z, label: "φ", rr: 22 }, { phi: Math.atan2(y, x), color: CPC.r, label: "nφ", rr: 40 }])}${big ? `<p class="hint">z nije nacrtan jer je |zⁿ| mnogo veći od |z|.</p>` : ""}</div>`;
    return h + tgTips(tips);
  });
  $("#mv-go").onclick = goMv;
  $$("#mv-go ~ .ex").forEach(b => b.onclick = () => { $("#mv-z").value = b.dataset.z; $("#mv-n").value = b.dataset.n; goMv(); });

  drillWire("td", TG_DRILL);
}

// ---------- „Vidi odmah“ za trigonometrijski oblik ----------
const R3 = Sd.sqrtQ(3);
const STD_PTS = [[1, 1], [-1, 1], [-1, -1], [1, -1], ["√3", 1], [1, "√3"], [-1, "√3"], ["-√3", 1], ["-√3", -1], [1, "-√3"], ["√3", -1], [0, 1], [0, -1], [-1, 0], [1, 0]];
const toSd = v => typeof v === "number" ? Sd.of(v) : (v.startsWith("-") ? R3.neg() : R3);
function stdZ() { const [a, b] = pick(STD_PTS), c = pick([1, 1, 2, 3]); return new Cx(toSd(a).scale(c), toSd(b).scale(c)); }
function whyArg(z) {
  const k = findArg(z), q = quadrant(z);
  if (z.re.isZero() || z.im.isZero()) return `Tačka leži ${q}, pa je ugao ${angStr(k)} bez ikakvog računa.`;
  const ref = findArg(new Cx(z.re.sign() < 0 ? z.re.neg() : z.re, z.im.sign() < 0 ? z.im.neg() : z.im));
  return `|b| : |a| = ${z.im.div(z.re).sign() < 0 ? z.im.div(z.re).neg() : z.im.div(z.re)} ⇒ referentni ugao ${angStr(ref)}. Tačka je ${q} ⇒ φ = ${angStr(k)}.`;
}
const TG_DRILL = [
  () => { const z = stdZ(); const k = findArg(z); return { q: `Arg(${z}) = ?`, val: k.toNumber() * Math.PI, a: angStr(k), kind: "ang", why: whyArg(z) }; },
  () => { const z = stdZ(); const r = modulus(z); return { q: `|${z}| = ?`, val: [r.num(), 0], a: r.toString(), kind: "r", why: `|z| = √(a² + b²) = √(${z.norm2()}) = ${r}.${z.re.isRat() && z.im.isRat() ? "" : " Brojevi a i ±√3·a (u bilo kom redu) uvijek daju modul 2|a|."}` }; },
  () => { const s = pick([1, -1]), n = rnd(2, 12); const v = new Cx(Sd.of(1), Sd.of(s)).pow(n); return { q: `(1 ${s > 0 ? "+" : "−"} i)^${n} = ?`, val: v.num(), a: v.toString(), kind: "c", why: `r = √2, φ = ${s > 0 ? "" : "−"}π/4. Tada je rⁿ = (√2)^${n} = ${Sd.sqrtQ(2).pow(n)}, a nφ = ${angStr(new Frac(BigInt(s * n), 4n))}${reduceK(new Frac(BigInt(s * n), 4n))[1].replace(/<\/?b>/g, "")} ⇒ ${v}.` }; },
  () => { const z0 = pick([[-1, "√3"], ["√3", 1], [1, "√3"], ["√3", -1], [-1, "-√3"]]); const z = new Cx(toSd(z0[0]), toSd(z0[1])); const n = pick([2, 3, 4, 6]); const v = z.pow(n); const k = findArg(z); return { q: `(${z})^${n} = ?`, val: v.num(), a: v.toString(), kind: "c", why: `r = 2, φ = ${angStr(k)} ⇒ z^${n} = 2^${n}(cos ${angStr(k.mul(n))} + i sin ${angStr(k.mul(n))}). Ugao ${angStr(k.mul(n))}${reduceK(k.mul(n))[1].replace(/<\/?b>/g, "")} ⇒ ${v}.` }; },
  () => { const m = pick([2, 3, 4, 6]), n = rnd(2, 12); const k = new Frac(BigInt(n), BigInt(m)); const v = new Cx(cosK(k), sinK(k)); return { q: `(cos π/${m} + i sin π/${m})^${n} = ?`, val: v.num(), a: v.toString(), kind: "c", why: `Modul je 1, pa se samo ugao množi sa ${n}: ${n}·π/${m} = ${angStr(k)}${reduceK(k)[1].replace(/<\/?b>/g, "")} ⇒ cos + i sin tog ugla = ${v}.` }; },
  () => {
    const A = pick([[1, 6], [1, 4], [1, 3], [2, 3], [5, 6], [3, 4], [1, 2]]), B = pick([[1, 6], [1, 4], [1, 3], [1, 2], [2, 3], [-1, 3], [-1, 6]]);
    const a = new Frac(BigInt(A[0]), BigInt(A[1])), b = new Frac(BigInt(B[0]), BigInt(B[1])), r1 = rnd(1, 4), r2 = rnd(1, 4), mul = Math.random() < .6;
    const k = mul ? a.add(b) : a.sub(b), r = mul ? Frac.of(r1 * r2) : new Frac(BigInt(r1), BigInt(r2));
    const v = new Cx(Sd.of(r).mul(cosK(k)), Sd.of(r).mul(sinK(k)));
    return { q: `${r1}(cos ${angStr(a)} + i sin ${angStr(a)}) ${mul ? "·" : ":"} ${r2}(cos ${angStr(b)} + i sin ${angStr(b)}) = ?`, val: v.num(), a: v.toString(), kind: "c", hint: "Odgovor može i u trigonometrijskom obliku, npr. 6(cos π/2 + i sin π/2).", why: `Moduli: ${r1} ${mul ? "·" : ":"} ${r2} = ${r}. Uglovi: ${angStr(a)} ${mul ? "+" : "−"} ${angStr(b).replace(/^−/, "(−") + (angStr(b).startsWith("−") ? ")" : "")} = ${angStr(k)}${reduceK(k)[1].replace(/<\/?b>/g, "")} ⇒ ${v}.` };
  },
  () => { const [z, n, w] = pick([["1 + i", 8, "φ = π/4, pa treba n·π/4 = 2π ⇒ n = 8."], ["√3 + i", 12, "φ = π/6, pa treba n·π/6 = 2π ⇒ n = 12."], ["−1 + √3i", 3, "φ = 2π/3, pa treba n·2π/3 = 2π ⇒ n = 3."], ["1 − i", 8, "φ = −π/4, pa treba n·π/4 = 2π ⇒ n = 8."], ["i", 4, "φ = π/2 ⇒ n = 4."], ["−√3 − i", 12, "φ = −5π/6. Prvi umnožak od 2π je 12·5π/6 = 10π ⇒ n = 12."]]); return { q: `Najmanje n ∈ ℕ za koje je (${z})ⁿ realan i pozitivan broj?`, val: [n, 0], a: String(n), kind: "r", why: `zⁿ je realan pozitivan kad je n·φ umnožak od 2π. ${w}` }; },
];
