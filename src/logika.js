// ===================== MATEMATIČKA LOGIKA =====================
"use strict";

const LOG = {
  T: "⊤", F: "⊥",
  tokenize(src) {
    const s = src.replace(/<=>|<->|⇔|↔|≡/g, " ⇔ ").replace(/=>|->|⇒|→/g, " ⇒ ")
      .replace(/\/\\|&&|&|∧|\*/g, " ∧ ").replace(/\\\/|\|\||\||∨|\+/g, " ∨ ").replace(/[~!¬]/g, " ¬ ");
    const toks = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if ("()⇔⇒∧∨¬".includes(c)) { toks.push(c); i++; continue; }
      if (c === "⊤" || c === "1") { toks.push({ c: true }); i++; continue; }
      if (c === "⊥" || c === "0") { toks.push({ c: false }); i++; continue; }
      if (/[a-z]/.test(c)) { let j = i + 1; while (j < s.length && /[0-9]/.test(s[j])) j++; toks.push({ v: s.slice(i, j) }); i = j; continue; }
      throw new MathErr(`Nepoznat znak "${c}". Iskazna slova su mala latinična slova (p, q, r…), a operacije ¬ ∧ ∨ ⇒ ⇔.`);
    }
    return toks;
  },
  parse(src) {
    const toks = LOG.tokenize(src); let p = 0; const warns = new Set();
    const peek = () => toks[p];
    // nivo 3: ⇒ i ⇔ (najslabiji), nivo 2: ∧ i ∨, nivo 1: ¬
    function lvl3() {
      let a = lvl2(), seen = null;
      while (peek() === "⇒" || peek() === "⇔") {
        const op = toks[p++];
        if (seen) warns.add("Uzastopne operacije ⇒/⇔ bez zagrada računam slijeva udesno. Na kolokvijumu obavezno stavi zagrade!");
        seen = op; a = { op, a, b: lvl2() };
      }
      return a;
    }
    function lvl2() {
      let a = lvl1(), seen = null;
      while (peek() === "∧" || peek() === "∨") {
        const op = toks[p++];
        if (seen && seen !== op) warns.add("∧ i ∨ imaju isti prioritet – bez zagrada računam slijeva udesno. Preporuka: stavi zagrade.");
        seen = op; a = { op, a, b: lvl1() };
      }
      return a;
    }
    function lvl1() {
      const t = toks[p++];
      if (t === undefined) throw new MathErr("Formula je nepotpuna.");
      if (t === "¬") return { op: "¬", a: lvl1() };
      if (t === "(") { const e = lvl3(); if (toks[p++] !== ")") throw new MathErr("Nedostaje zatvorena zagrada \")\"."); return e; }
      if (t && t.v) return { v: t.v };
      if (t && "c" in t) return { c: t.c };
      throw new MathErr(`Neočekivan znak "${t}" u formuli.`);
    }
    if (!toks.length) throw new MathErr("Upiši formulu.");
    const ast = lvl3();
    if (p < toks.length) throw new MathErr(`Višak znakova u formuli (od "${typeof toks[p] === "string" ? toks[p] : "…"}"). Provjeri zagrade.`);
    return { ast, warns: [...warns] };
  },
  str(n, top = true) {
    if (n.v) return n.v;
    if ("c" in n) return n.c ? "⊤" : "⊥";
    if (n.op === "¬") return "¬" + LOG.str(n.a, false);
    const s = `${LOG.str(n.a, false)} ${n.op} ${LOG.str(n.b, false)}`;
    return top ? s : `(${s})`;
  },
  ev(n, env) {
    if (n.v) return env[n.v];
    if ("c" in n) return n.c;
    if (n.op === "¬") return !LOG.ev(n.a, env);
    const a = LOG.ev(n.a, env), b = LOG.ev(n.b, env);
    return n.op === "∧" ? a && b : n.op === "∨" ? a || b : n.op === "⇒" ? (!a || b) : a === b;
  },
  vars(n, set = new Set()) { if (n.v) set.add(n.v); if (n.a) LOG.vars(n.a, set); if (n.b) LOG.vars(n.b, set); return set; },
  // podformule redom (od najjednostavnijih), kao kolone u tablici
  subs(n, out = []) {
    if (n.a) LOG.subs(n.a, out);
    if (n.b) LOG.subs(n.b, out);
    if (n.op && !out.some(x => LOG.str(x) === LOG.str(n))) out.push(n);
    return out;
  },
};

function logikaRender() {
  const panel = $("#tab-logika");
  panel.innerHTML = `
  <section class="card">
    <h2>Tablica istinitosti i tautologija</h2>
    <p class="lead">Upiši iskaznu formulu. Dobijaš kompletnu tablicu istinitosti sa svim međukolonama (kao na vježbama) i zaključak da li je formula tautologija.</p>
    <details class="theory"><summary>📘 Pravila i teorija</summary>
      <p><b>Iskaz</b> je potvrdna rečenica koja ima smisla i koja je TAČNA (⊤) ili NETAČNA (⊥). Iskazi se označavaju malim latiničnim slovima p, q, r…; τ(p) je istinitosna vrijednost iskaza p.</p>
      <div class="tt-grid">
        <table class="tt mini"><tr><th>p</th><th>¬p</th></tr><tr><td>⊤</td><td>⊥</td></tr><tr><td>⊥</td><td>⊤</td></tr></table>
        <table class="tt mini"><tr><th>p</th><th>q</th><th>p∧q</th><th>p∨q</th><th>p⇒q</th><th>p⇔q</th></tr>
          <tr><td>⊤</td><td>⊤</td><td>⊤</td><td>⊤</td><td>⊤</td><td>⊤</td></tr>
          <tr><td>⊤</td><td>⊥</td><td>⊥</td><td>⊤</td><td>⊥</td><td>⊥</td></tr>
          <tr><td>⊥</td><td>⊤</td><td>⊥</td><td>⊤</td><td>⊤</td><td>⊥</td></tr>
          <tr><td>⊥</td><td>⊥</td><td>⊥</td><td>⊥</td><td>⊤</td><td>⊤</td></tr></table>
      </div>
      <ul>
        <li><b>Negacija</b> ¬p mijenja vrijednost. <b>Konjunkcija</b> p∧q je tačna samo kad su oba tačna. <b>Disjunkcija</b> p∨q je netačna samo kad su oba netačna.</li>
        <li><b>Implikacija</b> p⇒q je netačna <u>samo</u> u slučaju ⊤⇒⊥. <b>Ekvivalencija</b> p⇔q je tačna kad p i q imaju istu vrijednost.</li>
        <li><b>Prioritet:</b> 1. negacija, 2. konjunkcija i disjunkcija, 3. implikacija i ekvivalencija. Ovaj poredak mogu promijeniti zagrade!</li>
        <li><b>Tautologija</b> je složen iskaz koji je tačan za sve istinitosne vrijednosti svojih iskaznih slova (u posljednjoj koloni su sve ⊤).</li>
        <li>Primjeri tautologija: princip neprotivrječnosti ¬(p∧¬p), isključenja trećeg p∨¬p, zakon kontrapozicije (p⇒q)⇔(¬q⇒¬p).</li>
        <li><b>Postupak:</b> za n iskaznih slova tablica ima 2ⁿ redova. Kolone redom: slova, pa podformule od najjednostavnije do cijele formule. Formula je tautologija ako je posljednja kolona sva ⊤.</li>
        <li><b>Kvantifikatori:</b> ∀x „za svako x važi…“, ∃x „postoji bar jedno x za koje važi…“, ∃!x „postoji tačno jedno x za koje važi…“.</li>
      </ul>
    </details>
    <label for="lg-in">Formula</label>
    ${symbolBar("#lg-in", ["¬", "∧", "∨", "⇒", "⇔", "(", ")", "p", "q", "r", "⊤", "⊥"])}
    <input id="lg-in" class="mono" type="text" autocomplete="off" spellcheck="false" value="(p ∧ q) ∨ ¬(p ⇒ q)">
    <p class="hint">Može i sa tastature: ~ ili ! (¬), &amp; (∧), | (∨), =&gt; (⇒), &lt;=&gt; (⇔).</p>
    <div class="row">
      <label class="chk"><input type="checkbox" id="lg-10"> Prikaži 1/0 umjesto ⊤/⊥</label>
    </div>
    <div class="btns">
      <button class="primary" id="lg-go">Riješi</button>
      <span class="ex-label">Primjeri sa vježbi:</span>
      <button class="ex" data-f="(p ∧ q) ∨ ¬(p ⇒ q)">Zadatak 1</button>
      <button class="ex" data-f="((p ∧ q) ⇒ r) ∨ ¬r">Priprema K1 – zad. 3</button>
      <button class="ex" data-f="(p ⇒ q) ⇔ (¬q ⇒ ¬p)">Kontrapozicija</button>
      <button class="ex" data-f="¬(p ∧ ¬p)">Neprotivrječnost</button>
    </div>
    <div class="out" id="lg-out"></div>
  </section>

  <section class="card">
    <h2>Da li su dvije formule ekvivalentne?</h2>
    <p class="lead">Provjerava da li je F ⇔ G tautologija (iste vrijednosti u svim redovima).</p>
    <label>F</label><input id="lg-f1" class="mono" type="text" value="¬(p ∧ q)">
    <label>G</label><input id="lg-f2" class="mono" type="text" value="¬p ∨ ¬q">
    <div class="btns"><button class="primary" id="lg-eq">Provjeri</button></div>
    <div class="out" id="lg-eq-out"></div>
  </section>`;

  const solve = () => runSafe($("#lg-out"), () => logikaSolve($("#lg-in").value, $("#lg-10").checked));
  $("#lg-go").onclick = solve;
  $("#lg-in").addEventListener("keydown", e => { if (e.key === "Enter") solve(); });
  $("#lg-10").onchange = () => { if ($("#lg-out").innerHTML) solve(); };
  $$("#tab-logika .ex").forEach(b => b.onclick = () => { $("#lg-in").value = b.dataset.f; solve(); });
  $("#lg-eq").onclick = () => runSafe($("#lg-eq-out"), () => {
    const a = LOG.parse($("#lg-f1").value).ast, b = LOG.parse($("#lg-f2").value).ast;
    const f = `(${LOG.str(a)}) ⇔ (${LOG.str(b)})`;
    return logikaSolve(f, $("#lg-10").checked, true);
  });
}

function logikaSolve(src, ones, eqMode = false) {
  const { ast, warns } = LOG.parse(src);
  warns.forEach(w => notify(w, "warn"));
  const vars = [...LOG.vars(ast)].sort();
  if (vars.length > 6) throw new MathErr("Previše iskaznih slova (najviše 6, tj. 64 reda).");
  const cols = LOG.subs(ast);
  const T = ones ? "1" : "⊤", F = ones ? "0" : "⊥";
  const n = vars.length, rows = [];
  for (let i = 0; i < (1 << n); i++) {
    const env = {}; vars.forEach((v, j) => env[v] = !((i >> (n - 1 - j)) & 1)); // počinje sa svim ⊤
    rows.push({ env, vals: cols.map(c => LOG.ev(c, env)) });
  }
  const last = rows.map(r => r.vals.length ? r.vals[r.vals.length - 1] : LOG.ev(ast, r.env));
  const allT = last.every(x => x), allF = last.every(x => !x);
  let h = `<div class="step"><b>Formula:</b> <span class="mono big">${esc(LOG.str(ast))}</span></div>`;
  h += `<div class="step">Iskazna slova: <b>${vars.join(", ") || "nema"}</b> ⇒ tablica ima 2<sup>${n}</sup> = <b>${1 << n}</b> redova. Kolone pravimo redom, od najjednostavnije podformule do cijele formule (prioritet: ¬, zatim ∧ ∨, zatim ⇒ ⇔).</div>`;
  h += `<div class="tablewrap"><table class="tt"><thead><tr>${vars.map(v => `<th>${v}</th>`).join("")}${cols.map((c, i) => `<th class="${i === cols.length - 1 ? "fin" : ""} ${i === 0 ? "sep" : ""}">${esc(LOG.str(c))}</th>`).join("")}</tr></thead><tbody>`;
  rows.forEach((r, ri) => {
    h += `<tr>${vars.map(v => `<td>${r.env[v] ? T : F}</td>`).join("")}${r.vals.map((x, i) => `<td class="${i === r.vals.length - 1 ? (x ? "fin t" : "fin f") : ""} ${i === 0 ? "sep" : ""}">${x ? T : F}</td>`).join("")}</tr>`;
  });
  h += `</tbody></table></div>`;
  // objašnjenje kolona
  h += `<details class="explain"><summary>Kako je dobijena svaka kolona?</summary><ol>`;
  cols.forEach(c => {
    const rule = c.op === "¬" ? `negacija kolone <span class="mono">${esc(LOG.str(c.a))}</span> (⊤↔⊥)` :
      c.op === "∧" ? `konjunkcija: ⊤ samo gdje su <span class="mono">${esc(LOG.str(c.a))}</span> i <span class="mono">${esc(LOG.str(c.b))}</span> oba ⊤` :
        c.op === "∨" ? `disjunkcija: ⊥ samo gdje su <span class="mono">${esc(LOG.str(c.a))}</span> i <span class="mono">${esc(LOG.str(c.b))}</span> oba ⊥` :
          c.op === "⇒" ? `implikacija: ⊥ samo gdje je <span class="mono">${esc(LOG.str(c.a))}</span> = ⊤, a <span class="mono">${esc(LOG.str(c.b))}</span> = ⊥` :
            `ekvivalencija: ⊤ gdje <span class="mono">${esc(LOG.str(c.a))}</span> i <span class="mono">${esc(LOG.str(c.b))}</span> imaju istu vrijednost`;
    h += `<li><span class="mono">${esc(LOG.str(c))}</span> — ${rule}</li>`;
  });
  h += `</ol></details>`;
  const bad = rows.map((r, i) => !last[i] ? i : -1).filter(i => i >= 0);
  if (eqMode) {
    h += allT ? `<div class="verdict ok">✔ Formule SU ekvivalentne – posljednja kolona sadrži samo ${T}.</div>`
      : `<div class="verdict no">✖ Formule NISU ekvivalentne – razlikuju se u redu: ${bad.map(i => "(" + vars.map(v => `${v}=${rows[i].env[v] ? T : F}`).join(", ") + ")").join("; ")}.</div>`;
  } else if (allT) h += `<div class="verdict ok">✔ Iz posljednje kolone vidimo da formula JESTE tautologija (sve vrijednosti su ${T}).</div>`;
  else {
    h += `<div class="verdict no">✖ Iz posljednje kolone vidimo da formula NIJE tautologija.</div>`;
    h += `<div class="step">Netačna je za: ${bad.map(i => "(" + vars.map(v => `${v}=${rows[i].env[v] ? T : F}`).join(", ") + ")").join("; ")}.${allF ? " Formula je netačna u svim redovima – to je <b>kontradikcija</b>." : ""}</div>`;
  }
  return h;
}
