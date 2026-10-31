// ===================== BINARNE RELACIJE =====================
"use strict";

const REL = {
  has(R, x, y) { return R.some(p => p[0] === x && p[1] === y); },
  props(A, R) {
    const r = {};
    const missing = A.filter(x => !REL.has(R, x, x));
    r.R = { ok: !missing.length, why: missing.length ? `npr. (${missing[0]}, ${missing[0]}) ∉ ρ` + (missing.length > 1 ? ` (nedostaju: ${missing.map(x => `(${x},${x})`).join(", ")})` : "") : `svi parovi (x, x) su u ρ: ${A.map(x => `(${x},${x})`).join(", ")}` };
    const sBad = R.find(([x, y]) => !REL.has(R, y, x));
    const symPairs = R.filter(([x, y]) => x !== y);
    r.S = { ok: !sBad, why: sBad ? `(${sBad[0]}, ${sBad[1]}) ∈ ρ, a (${sBad[1]}, ${sBad[0]}) ∉ ρ` : symPairs.length ? `za svaki par (x, y) ∈ ρ i (y, x) ∈ ρ: ${uniqPairsSym(symPairs)}` : "u ρ su samo parovi oblika (x, x)" };
    const asBad = R.find(([x, y]) => x !== y && REL.has(R, y, x));
    r.AS = { ok: !asBad, why: asBad ? `(${asBad[0]}, ${asBad[1]}) ∈ ρ i (${asBad[1]}, ${asBad[0]}) ∈ ρ, a ${asBad[0]} ≠ ${asBad[1]}` : "nema para (x, y) i (y, x) sa x ≠ y" };
    let tBad = null;
    outer: for (const [x, y] of R) for (const [y2, z] of R) if (y === y2 && !REL.has(R, x, z)) { tBad = [x, y, z]; break outer; }
    r.T = { ok: !tBad, why: tBad ? `(${tBad[0]}, ${tBad[1]}) ∈ ρ i (${tBad[1]}, ${tBad[2]}) ∈ ρ, a (${tBad[0]}, ${tBad[2]}) ∉ ρ` : "kad god xρy i yρz, važi i xρz (provjereni svi lanci)" };
    return r;
  },
  classes(A, R) {
    const cls = [];
    for (const x of A) if (!cls.some(c => c.includes(x))) cls.push(A.filter(y => REL.has(R, x, y)));
    return cls;
  },
  matrix(A, R, cls) {
    const order = cls ? cls.flat() : A;
    const colorOf = x => cls ? cls.findIndex(c => c.includes(x)) : -1;
    let h = `<div class="tablewrap"><table class="mat"><tr><th class="corner">ρ</th>${order.map(x => `<th>${esc(x)}</th>`).join("")}</tr>`;
    for (const x of order) {
      h += `<tr><th>${esc(x)}</th>`;
      for (const y of order) {
        const v = REL.has(R, x, y), ci = colorOf(x);
        h += `<td class="${v ? "one" : ""} ${v && cls && ci === colorOf(y) ? "c" + (ci % 6) : ""} ${x === y ? "diag" : ""}">${v ? 1 : 0}</td>`;
      }
      h += `</tr>`;
    }
    return h + `</table></div>`;
  },
  graph(A, R) {
    const n = A.length, W = 300, cx = 150, cy = 150, rad = n > 1 ? 105 : 0;
    const pos = {}; A.forEach((x, i) => { const t = -Math.PI / 2 + 2 * Math.PI * i / n; pos[x] = [cx + rad * Math.cos(t), cy + rad * Math.sin(t)]; });
    let g = `<svg class="graph" viewBox="0 0 ${W} ${W}"><defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="arrh"/></marker></defs>`;
    for (const [x, y] of R) {
      const [x1, y1] = pos[x], [x2, y2] = pos[y];
      if (x === y) { const dx = x1 - cx, dy = y1 - cy, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L; const lx = x1 + ux * 24, ly = y1 + uy * 24; g += `<circle cx="${lx}" cy="${ly}" r="11" class="edge" fill="none"/>`; continue; }
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      const both = REL.has(R, y, x), off = both ? 5 : 0;
      const sx = x1 + ux * 15 - uy * off, sy = y1 + uy * 15 + ux * off, ex = x2 - ux * 15 - uy * off, ey = y2 - uy * 15 + ux * off;
      g += `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" class="edge" marker-end="url(#arr)"/>`;
    }
    A.forEach(x => { const [px, py] = pos[x]; g += `<circle cx="${px}" cy="${py}" r="14" class="node"/><text x="${px}" y="${py + 4}" text-anchor="middle" class="nodet">${esc(x)}</text>`; });
    return g + "</svg>";
  },
};
function uniqPairsSym(P) {
  const seen = [], out = [];
  for (const [x, y] of P) { const k = [x, y].sort().join("|"); if (!seen.includes(k)) { seen.push(k); out.push(`(${x},${y})∧(${y},${x})`); } }
  return out.slice(0, 6).join(", ") + (out.length > 6 ? ", …" : "");
}

function relacijeRender() {
  const panel = $("#tab-relacije");
  panel.innerHTML = `
  <section class="card">
    <h2>Ispitivanje relacije (R, S, AS, T) i klase ekvivalencije</h2>
    <p class="lead">Zadaj skup i relaciju (parovima ili pravilom). Program ispisuje ρ, matricu, graf, provjerava svako svojstvo sa obrazloženjem/kontraprimjerom i određuje klase ekvivalencije.</p>
    <details class="theory"><summary>📘 Pravila i teorija</summary>
      <ul>
        <li><b>Dekartov proizvod</b> A × B = {(x, y) | x ∈ A, y ∈ B}. <b>Binarna relacija</b> ρ na skupu A je neprazan podskup od A² = A × A. Ako (x, y) ∈ ρ pišemo xρy.</li>
        <li><b>Refleksivna (R):</b> (∀x ∈ A) xρx – na glavnoj dijagonali matrice su sve jedinice.</li>
        <li><b>Simetrična (S):</b> (∀x, y ∈ A) xρy ⇒ yρx – matrica je simetrična u odnosu na dijagonalu.</li>
        <li><b>Antisimetrična (AS):</b> (∀x, y ∈ A) xρy ∧ yρx ⇒ x = y – van dijagonale nikad nisu jedinice na oba simetrična mjesta.</li>
        <li><b>Tranzitivna (T):</b> (∀x, y, z ∈ A) xρy ∧ yρz ⇒ xρz.</li>
        <li>R + S + T = <b>relacija ekvivalencije</b>; R + AS + T = <b>relacija (parcijalnog) poretka</b>.</li>
        <li><b>Klasa ekvivalencije</b> Cₓ = {y ∈ A : xρy}. Skup svih klasa je <b>količnički (faktor) skup</b> A/ρ.</li>
        <li><b>Teorema:</b> A = ∪Cₓ; xρy ⇒ Cₓ = C_y; ako nije xρy onda Cₓ ∩ C_y = ∅ (klase su disjunktne i pokrivaju A).</li>
        <li><b>Postupak dokaza</b> (kao na vježbama): R – pokaži da su svi (x,x) u ρ; S – za proizvoljan xρy pokaži yρx; T – neka su x, y, z proizvoljni takvi da xρy ∧ yρz, pokaži xρz. „Ono što vrijedi za proizvoljne, vrijedi za sve.“ Za NE dovoljan je jedan kontraprimjer.</li>
      </ul>
    </details>
    <label>Skup A (elementi odvojeni zarezom)</label>
    <input id="rl-A" class="mono" value="-2, -1, 0, 1, 2">
    <div class="row">
      <label class="chk"><input type="radio" name="rl-mode" value="rule" checked> pravilom (x, y)</label>
      <label class="chk"><input type="radio" name="rl-mode" value="pairs"> nabrajanjem parova</label>
    </div>
    <div id="rl-rule-box">
      <label>Pravilo: xρy ⇔</label>
      ${symbolBar("#rl-rule", ["=", "≠", "<", "≤", ">", "≥", "^", "|x|", "mod", "∧", "∨", "¬"])}
      <input id="rl-rule" class="mono" value="x^2 = y^2">
      <p class="hint">Primjeri: <span class="mono">x^2 = y^2</span>, <span class="mono">2xy ≥ x + y</span>, <span class="mono">(x+y) mod 2 = 0</span>, <span class="mono">paran(x+y)</span>, <span class="mono">x ≤ y</span>, <span class="mono">x &gt; 1 ∨ y &lt; 1</span>, <span class="mono">sgn(x) = sgn(y)</span>. Logika: ∧ (&amp;&amp;), ∨ (||), ¬ (!).</p>
    </div>
    <div id="rl-pairs-box" hidden>
      <label>ρ = </label>
      <textarea id="rl-pairs" class="mono" rows="2">(1,2), (2,1), (1,1), (2,2)</textarea>
    </div>
    <div class="btns"><button class="primary" id="rl-go">Ispitaj relaciju</button>
      <span class="ex-label">Primjeri:</span>
      <button class="ex" data-a="-2, -1, 0, 1, 2" data-r="x^2 = y^2">Zadatak 1</button>
      <button class="ex" data-a="-2, -1, 0, 1, 2, 3" data-r="2xy >= x + y">Zadatak 2</button>
      <button class="ex" data-a="1, 2, 3, 4, 5" data-r="paran(x+y) && x+y > 0">Vježba 1</button>
      <button class="ex" data-a="1, 2, 3, 4, 6, 12" data-r="y mod x = 0">Djeljivost (poredak)</button>
    </div>
    <div class="out" id="rl-out"></div>
  </section>

  <section class="card">
    <h2>Konstruiši relaciju sa zadatim svojstvima</h2>
    <p class="lead">Npr. „Na skupu {1,2,3} konstruisati relaciju koja je simetrična i tranzitivna, ali nije refleksivna.“</p>
    <label>Skup (najviše 4 elementa)</label><input id="rc-A" class="mono" value="1, 2, 3">
    <div class="propsel">
      ${["R|refleksivna", "S|simetrična", "AS|antisimetrična", "T|tranzitivna"].map(s => { const [k, n] = s.split("|"); return `<div><b>${n}</b><select id="rc-${k}"><option value="any">svejedno</option><option value="yes">mora biti</option><option value="no">ne smije biti</option></select></div>`; }).join("")}
    </div>
    <div class="btns"><button class="primary" id="rc-go">Konstruiši</button><button class="ex" id="rc-ex">Priprema K1 – zad. 2</button></div>
    <div class="out" id="rc-out"></div>
  </section>

  <section class="card">
    <h2>Koliko ima relacija na skupu od n elemenata?</h2>
    <details class="theory"><summary>📘 Obrazloženje</summary>
      <ul>
        <li>|X × X| = n², a svaki par može biti ili ne biti u relaciji ⇒ <b>2^(n²)</b> podskupova (bez praznog: 2^(n²) − 1).</li>
        <li>Refleksivne: n dijagonalnih parova su obavezni, ostalih n² − n slobodno ⇒ <b>2^(n² − n)</b>.</li>
        <li>Simetrične: biramo dijagonalu (n) i parove {(x,y),(y,x)} zajedno ((n² − n)/2) ⇒ <b>2^((n² + n)/2)</b>.</li>
        <li>Refleksivne i simetrične: dijagonala obavezna, biraju se samo parovi ⇒ <b>2^((n² − n)/2)</b>.</li>
      </ul>
    </details>
    <label>n</label><input id="rn-n" type="number" value="3" min="1" max="12">
    <div class="btns"><button class="primary" id="rn-go">Izračunaj</button></div>
    <div class="out" id="rn-out"></div>
  </section>`;

  $$('input[name="rl-mode"]').forEach(r => r.onchange = () => {
    const pairs = $('input[name="rl-mode"]:checked').value === "pairs";
    $("#rl-rule-box").hidden = pairs; $("#rl-pairs-box").hidden = !pairs;
  });
  const go = () => runSafe($("#rl-out"), relacijaSolve);
  $("#rl-go").onclick = go;
  $$("#tab-relacije .ex[data-r]").forEach(b => b.onclick = () => {
    $("#rl-A").value = b.dataset.a; $("#rl-rule").value = b.dataset.r;
    $('input[name="rl-mode"][value="rule"]').checked = true; $("#rl-rule-box").hidden = false; $("#rl-pairs-box").hidden = true; go();
  });
  $("#rc-go").onclick = () => runSafe($("#rc-out"), relacijaKonstruisi);
  $("#rc-ex").onclick = () => { $("#rc-A").value = "1, 2, 3"; $("#rc-R").value = "no"; $("#rc-S").value = "yes"; $("#rc-AS").value = "any"; $("#rc-T").value = "yes"; runSafe($("#rc-out"), relacijaKonstruisi); };
  $("#rn-go").onclick = () => runSafe($("#rn-out"), () => {
    const n = Number($("#rn-n").value); if (!Number.isInteger(n) || n < 1 || n > 12) throw new MathErr("n mora biti od 1 do 12.");
    const p = e => (2n ** BigInt(e)).toString();
    return `<table class="res"><tr><td>Sve binarne relacije (podskupovi od X²)</td><td>2<sup>${n * n}</sup> = <b>${p(n * n)}</b> (bez praznog: ${(2n ** BigInt(n * n) - 1n).toString()})</td></tr>
      <tr><td>Refleksivne</td><td>2<sup>${n * n - n}</sup> = <b>${p(n * n - n)}</b></td></tr>
      <tr><td>Simetrične</td><td>2<sup>${(n * n + n) / 2}</sup> = <b>${p((n * n + n) / 2)}</b></td></tr>
      <tr><td>Refleksivne i simetrične</td><td>2<sup>${(n * n - n) / 2}</sup> = <b>${p((n * n - n) / 2)}</b></td></tr></table>`;
  });
}

function relacijaSolve() {
  const A = parseList($("#rl-A").value);
  if (!A.length) throw new MathErr("Skup A je prazan.");
  if (A.length > 20) throw new MathErr("Najviše 20 elemenata.");
  let R = [], ruleTxt = "";
  if ($('input[name="rl-mode"]:checked').value === "pairs") {
    R = parsePairs($("#rl-pairs").value);
    const bad = R.filter(([x, y]) => !A.includes(x) || !A.includes(y));
    if (bad.length) throw new MathErr(`Parovi ${bad.map(pairStr).join(", ")} nisu iz A × A – to nije relacija na A.`);
  } else {
    ruleTxt = $("#rl-rule").value;
    const ast = parseExpr(ruleTxt, ["x", "y"]);
    const nums = A.map(Number);
    if (nums.some(isNaN)) throw new MathErr("Za zadavanje pravilom elementi moraju biti brojevi. Za slova koristi nabrajanje parova.");
    for (const x of A) for (const y of A) {
      const v = evalNum(ast, { x: Number(x), y: Number(y) });
      if (typeof v !== "boolean") throw new MathErr("Pravilo mora biti uslov (sa =, <, ≤ …), npr. x^2 = y^2.");
      if (v) R.push([x, y]);
    }
  }
  let h = `<div class="step">A = ${esc(setStr(A))}${ruleTxt ? `, &nbsp; xρy ⇔ <span class="mono">${esc(ruleTxt)}</span>` : ""}</div>`;
  if (!R.length) { notify("Relacija je prazan skup – po definiciji sa vježbi binarna relacija mora biti neprazna.", "warn"); return h + `<div class="verdict no">ρ = ∅ (nijedan par ne zadovoljava pravilo).</div>`; }
  h += `<div class="step"><b>Očigledno je</b> ρ = {${R.map(pairStr).join(", ")}} &nbsp; (${R.length} parova)</div>`;
  const P = REL.props(A, R);
  const name = { R: "Refleksivnost", S: "Simetričnost", AS: "Antisimetričnost", T: "Tranzitivnost" };
  h += `<table class="props">`;
  for (const k of ["R", "S", "AS", "T"]) h += `<tr class="${P[k].ok ? "yes" : "no"}"><td><b>${name[k]}</b></td><td>${P[k].ok ? "✔ DA" : "✖ NE"}</td><td>${esc(P[k].why)}</td></tr>`;
  h += `</table>`;
  const eqv = P.R.ok && P.S.ok && P.T.ok, ord = P.R.ok && P.AS.ok && P.T.ok;
  let cls = null;
  if (eqv) {
    cls = REL.classes(A, R);
    h += `<div class="verdict ok">✔ Kako je ρ refleksivna, simetrična i tranzitivna, ρ JESTE relacija ekvivalencije.</div>`;
    h += `<div class="step"><b>Klase ekvivalencije:</b> ${cls.map(c => `C<sub>${esc(c[0])}</sub> = ${esc(setStr(c))}`).join(", &nbsp; ")}<br><b>Količnički skup:</b> A/ρ = {${cls.map(c => esc(setStr(c))).join(", ")}} &nbsp; (${cls.length} ${cls.length === 1 ? "klasa" : "klase"})</div>`;
  } else h += `<div class="verdict no">✖ ρ NIJE relacija ekvivalencije (nije ${[!P.R.ok && "refleksivna", !P.S.ok && "simetrična", !P.T.ok && "tranzitivna"].filter(Boolean).join(", ")}).</div>`;
  if (ord) h += `<div class="verdict ok">✔ ρ je refleksivna, antisimetrična i tranzitivna ⇒ relacija (parcijalnog) POREtka.</div>`.replace("POREtka", "PORETKA");
  // dokaz u stilu vježbi (za pravilo x^2=y^2 i slične jednakosti oblika f(x)=f(y))
  if (ruleTxt && eqv) {
    const m = ruleTxt.match(/^(.+?)\s*=\s*(.+)$/);
    if (m && !/[<>≤≥!]/.test(ruleTxt)) {
      const fx = m[1].trim(), fy = m[2].trim();
      const ty = fx.replace(/x/g, "#").replace(/y/g, "x").replace(/#/g, "y"); // zamijeni x i y
      if (ty === fy || fx.replace(/x/g, "y") === fy) {
        const fz = fx.replace(/x/g, "z");
        h += `<details class="explain" open><summary>Dokaz tranzitivnosti (opšti, kao na vježbama)</summary><p>Neka su x, y, z ∈ A proizvoljni, takvi da xρy ∧ yρz. Tada je ${esc(fx)} = ${esc(fy)} i ${esc(fy)} = ${esc(fz)} ⇒ ${esc(fx)} = ${esc(fz)} ⇔ xρz. Ono što vrijedi za proizvoljne, vrijedi za sve, pa je (∀x, y, z ∈ A) xρy ∧ yρz ⇒ xρz.</p></details>`;
      }
    }
  }
  h += `<div class="grid2 vis"><div><h4>Matrica (tablica) relacije${cls ? " – složena po klasama" : ""}</h4>${REL.matrix(A, R, null)}${cls ? REL.matrix(A, R, cls) : ""}<p class="hint">${cls ? "Grupisane jedinice (obojeni blokovi) daju klase. " : ""}Refleksivna ⇔ dijagonala sve 1; simetrična ⇔ tablica simetrična oko dijagonale.</p></div><div><h4>Graf relacije</h4>${A.length <= 12 ? REL.graph(A, R) : "<p class='hint'>Graf se crta za najviše 12 elemenata.</p>"}</div></div>`;
  return h;
}

function relacijaKonstruisi() {
  const A = parseList($("#rc-A").value);
  if (A.length < 1 || A.length > 4) throw new MathErr("Skup mora imati od 1 do 4 elementa.");
  const want = {}; for (const k of ["R", "S", "AS", "T"]) want[k] = $("#rc-" + k).value;
  const all = []; for (const x of A) for (const y of A) all.push([x, y]);
  const found = [];
  for (let m = 1; m < (1 << all.length); m++) {
    const R = all.filter((_, i) => m >> i & 1);
    const P = REL.props(A, R);
    if (Object.entries(want).every(([k, w]) => w === "any" || (w === "yes") === P[k].ok)) found.push(R);
  }
  if (!found.length) return `<div class="verdict no">✖ Na ovom skupu ne postoji (neprazna) relacija sa traženim svojstvima.</div>`;
  found.sort((a, b) => a.length - b.length);
  // „ljepši“ primjer: najmanji koji sadrži bar jedan par x≠y
  const nice = found.find(R => R.some(([x, y]) => x !== y)) || found[0];
  let h = `<div class="step">Pronađeno ukupno <b>${found.length}</b> takvih relacija. Primjeri:</div><ol class="steps">`;
  const shown = [nice, ...found.filter(R => R !== nice).slice(0, 4)];
  shown.forEach(R => {
    const P = REL.props(A, R);
    h += `<li><span class="mono">ρ = {${R.map(pairStr).join(", ")}}</span><br><span class="hint">${["R", "S", "AS", "T"].map(k => `${k}: ${P[k].ok ? "✔" : "✖"}${!P[k].ok ? " (" + esc(P[k].why) + ")" : ""}`).join(" · ")}</span></li>`;
  });
  h += `</ol>`;
  if (want.R === "no") h += `<p class="hint">Trik: da relacija ne bude refleksivna dovoljno je da izostane bar jedan par (x, x) – npr. element ${esc(A[A.length - 1])} ne stavljamo ni u jedan par.</p>`;
  return h;
}
