// ===================== „VIDI ODMAH“ ZA SVE OBLASTI + „KAKAV SVE MOŽE BITI REZULTAT“ =====================
"use strict";

const OPT_TF = ["⊤ (tačno)", "⊥ (netačno)", "ne može se odrediti"];
const yesNo = (q, yes, why, hint) => mcQ(q, yes ? "da" : "ne", [yes ? "ne" : "da"], why, hint);

// ---------- LOGIKA ----------
const LOG_FORMS = [
  ["p ⇒ (q ⇒ p)", "Desna strana q ⇒ p je ⊥ samo za p = ⊥. Tada je lijeva strana p = ⊥, pa je cijela implikacija ⊤."],
  ["(p ∧ ¬p) ⇒ q", "Lijeva strana p ∧ ¬p je uvijek ⊥, a iz netačnog slijedi bilo šta. Uvijek ⊤."],
  ["p ∧ ¬p", "p i ¬p nikad nisu istovremeno tačni. Formula nije tačna ni u jednom redu."],
  ["(p ⇒ q) ∧ p ∧ ¬q", "p ∧ ¬q traži p = ⊤ i q = ⊥, a tada je p ⇒ q = ⊥. Nikad tačno."],
  ["p ⇒ q", "Za p = ⊤, q = ⊥ je ⊥, a za p = ⊥ je ⊤. Zavisi od p i q."],
  ["(p ∨ q) ⇒ p", "Za p = ⊥, q = ⊤ dobijamo ⊤ ⇒ ⊥ = ⊥, a za p = ⊤ je ⊤. Zavisi od p i q."],
  ["((p ∧ q) ⇒ r) ∨ ¬r", "Ako je r = ⊥, onda je ¬r = ⊤. Ako je r = ⊤, implikacija ima tačnu desnu stranu. U oba slučaja ⊤."],
  ["(p ⇒ q) ⇔ (¬q ⇒ ¬p)", "To je zakon kontrapozicije: obje strane su isti iskaz zapisan na dva načina."],
  ["(p ⇒ q) ⇔ (q ⇒ p)", "Implikacija i njen obrat nisu isto: za p = ⊤, q = ⊥ lijevo je ⊥, a desno ⊤."],
  ["¬(p ∨ q) ⇔ (¬p ∧ ¬q)", "De Morganov zakon: obje strane kažu „ni p ni q“."],
  ["((p ⇒ q) ∧ (q ⇒ r)) ⇒ (p ⇒ r)", "Tranzitivnost implikacije. Da bi bilo ⊥, treba p = ⊤ i r = ⊥, a tada p ⇒ q i q ⇒ r ne mogu oba biti ⊤."],
  ["p ∨ (q ∧ ¬q)", "q ∧ ¬q je uvijek ⊥, pa je formula isto što i p. Zavisi od p."],
  ["(p ⇔ q) ∧ (p ⇔ ¬q)", "q i ¬q ne mogu oba imati istu vrijednost kao p. Nikad tačno."],
  ["(p ∧ q) ∨ ¬(p ⇒ q)", "¬(p ⇒ q) znači p = ⊤ i q = ⊥, a p ∧ q znači p = ⊤ i q = ⊤. Ukupno: tačno tačno kad je p = ⊤. Zavisi od p."],
];
const LOG_VALS = [
  ["τ(p) = ⊥. Kolika je τ(p ⇒ ((q ∨ r) ∧ ¬s))?", 0, "Lijeva strana implikacije je ⊥, a iz netačnog slijedi sve. Ostatak ne treba ni gledati."],
  ["τ(q) = ⊤. Kolika je τ((p ∧ r) ∨ s ⇒ q)?", 0, "Desna strana implikacije je ⊤, pa je implikacija ⊤ bez obzira na lijevu stranu."],
  ["τ(p) = ⊥. Kolika je τ(p ∧ (q ⇒ r))?", 1, "U konjunkciji je jedan dio ⊥, pa je cijela ⊥."],
  ["τ(p) = ⊤. Kolika je τ(p ∨ (q ⇔ ¬r))?", 0, "U disjunkciji je jedan dio ⊤, pa je cijela ⊤."],
  ["τ(p) = ⊤. Kolika je τ(p ⇒ q)?", 2, "Za p = ⊤ vrijednost implikacije je ista kao vrijednost q. Bez q se ne može odrediti."],
  ["τ(p) = ⊥. Kolika je τ(p ∨ q)?", 2, "Za p = ⊥ disjunkcija ima vrijednost q, a q nije zadat."],
  ["τ(r) = ⊥. Kolika je τ((p ⇒ q) ∧ r)?", 1, "Jedan dio konjunkcije je ⊥, pa je cijela ⊥."],
  ["τ(p) = ⊤, τ(q) = ⊥. Kolika je τ(¬p ⇒ (q ∧ r))?", 0, "¬p = ⊥, pa je implikacija ⊤. r nije potrebno."],
];
const LOGIKA_DRILL = [
  () => {
    const [f, why] = pick(LOG_FORMS); const { ast } = LOG.parse(f), vars = [...LOG.vars(ast)];
    let t = 0, n = 1 << vars.length;
    for (let i = 0; i < n; i++) { const env = {}; vars.forEach((v, j) => env[v] = !!(i >> j & 1)); if (LOG.ev(ast, env)) t++; }
    const cls = t === n ? 0 : t === 0 ? 1 : 2;
    const opts = ["tautologija (uvijek ⊤)", "kontradikcija (nikad ⊤)", "ni jedno ni drugo (zavisi od slova)"];
    return mcQ(`Formula <span class="mono">${f}</span> je:`, opts[cls], opts.filter((_, k) => k !== cls), why);
  },
  () => { const [q, a, why] = pick(LOG_VALS); return mcQ(q, OPT_TF[a], OPT_TF.filter((_, k) => k !== a), why); },
  () => { const n = rnd(2, 6); return { kind: "r", q: `Koliko redova ima tablica istinitosti formule sa ${n} različita iskazna slova?`, val: [2 ** n, 0], a: String(2 ** n), why: `Svako slovo je ⊤ ili ⊥, pa je broj redova 2<sup>${n}</sup> = ${2 ** n}.` }; },
  () => { const [f, k, why] = pick([["p ⇒ q", 1, "Implikacija je ⊥ samo za ⊤ ⇒ ⊥: jedan red."], ["p ∨ q", 1, "Disjunkcija je ⊥ samo kad su oba ⊥: jedan red."], ["p ∧ q", 3, "Konjunkcija je ⊤ samo u jednom redu, pa je ⊥ u ostala 3."], ["p ⇔ q", 2, "Ekvivalencija je ⊥ kad p i q imaju različite vrijednosti: 2 reda."], ["p ∨ ¬p", 0, "Princip isključenja trećeg: uvijek ⊤, pa ⊥ nema ni u jednom redu."], ["(p ⇒ q) ∧ (q ⇒ p)", 2, "To je p ⇔ q, pa je ⊥ u 2 reda."]]); return { kind: "r", q: `U koliko redova tablice formula <span class="mono">${f}</span> ima vrijednost ⊥?`, val: [k, 0], a: String(k), why }; },
];

// ---------- SKUPOVI ----------
const SET_IDS = [
  ["A ∩ Aᶜ", "∅", "Ništa ne može biti istovremeno u A i van A."], ["A ∪ Aᶜ", "U", "Svaki element je ili u A ili van A."],
  ["A \\ A", "∅", "Iz A izbacimo sve iz A."], ["A Δ A", "∅", "Simetrična razlika broji ono što je u tačno jednom od skupova. Ovdje toga nema."],
  ["A Δ ∅", "A", "Sa ∅ nema zajedničkih elemenata, pa ostaje A."], ["(A \\ B) ∩ B", "∅", "A \\ B ne sadrži ništa iz B."],
  ["A ∩ (A ∪ B)", "A", "Zakon apsorpcije: A ⊆ A ∪ B."], ["A ∪ (A ∩ B)", "A", "Zakon apsorpcije: A ∩ B ⊆ A."],
  ["(Aᶜ)ᶜ", "A", "Dvostruki komplement vraća skup."], ["∅ᶜ", "U", "Van praznog skupa je sve."],
  ["∅ \\ A", "∅", "Iz praznog skupa nema šta da se izbaci."], ["A ∩ ∅", "∅", "Presjek sa praznim skupom je prazan."],
];
const SET_POOL = ["∅", "U", "A", "B", "Aᶜ", "A ∩ B", "A ∪ B"];
const SKUPOVI_DRILL = [
  () => { const [e, r, why] = pick(SET_IDS); const w = SET_POOL.filter(x => x !== r).sort(() => Math.random() - .5).slice(0, 3); return mcQ(`<span class="mono">${e} = ?</span>`, r, w, why); },
  () => { const n = pick([0, 1, 2, 3, 4, 5, 6, 0]); return { kind: "r", q: `|A| = ${n}. Koliko elemenata ima P(A)?`, val: [2 ** n, 0], a: String(2 ** n), why: n === 0 ? "Zamka: A = ∅, a P(∅) = {∅} ima jedan element (sam prazan skup)." : `Svaki element biramo „u podskupu“ ili „ne“: 2<sup>${n}</sup> = ${2 ** n}.` }; },
  () => mcQ("P(∅) = ?", "{∅}", ["∅", "{0}", "ne postoji"], "Jedini podskup praznog skupa je ∅, pa P(∅) ima tačno jedan element: {∅} ≠ ∅."),
  () => {
    const a = rnd(-5, 2), b = a + rnd(1, 4), t = rnd(0, 3);
    if (t === 0) { const c = b + rnd(1, 3), d = c + rnd(1, 3); return { kind: "iv", q: `(${a}, ${b}) ∩ (${c}, ${d}) = ?`, a: "∅", why: `Intervali se ne dodiruju (${b} < ${c}), pa nemaju zajedničkih tačaka.` }; }
    const d = b + rnd(1, 4);
    if (t === 1) return { kind: "iv", q: `(${a}, ${b}) ∩ (${b}, ${d}) = ?`, a: "∅", why: `Tačka ${b} je kraj oba intervala, ali nijedan je ne sadrži (otvorene zagrade). Presjek je ∅.` };
    if (t === 2) return { kind: "iv", q: `[${a}, ${b}] ∩ [${b}, ${d}] = ?`, a: `{${b}}`, why: `Jedina zajednička tačka je ${b}, a obje zagrade su zatvorene. Presjek je jednočlan skup {${b}}, a ne interval.` };
    const m = a + 1, b2 = m + rnd(1, 3), d2 = b2 + rnd(1, 3); return { kind: "iv", q: `(${a}, ${b2}) ∩ [${m}, ${d2}) = ?`, a: `[${m}, ${b2})`, why: `Lijevi kraj je veći od dva lijeva kraja (${m}, zatvoren), a desni manji od dva desna (${b2}, otvoren).` };
  },
  () => { const k = rnd(1, 9), a = rnd(-5, 5); const [q, ans, why] = pick([[`|x − ${a}| < −${k}`, "∅", "Apsolutna vrijednost nikad nije negativna, pa ne može biti manja od negativnog broja."], [`|x − ${a}| ≥ −${k}`, "R", "Apsolutna vrijednost je uvijek ≥ 0 > −" + k + ", pa važi za svako x."], [`x² + ${k} > 0`, "R", "x² ≥ 0, pa je x² + " + k + " uvijek pozitivno."], ["x² < 0", "∅", "Kvadrat realnog broja nikad nije negativan."], ["x² ≤ 0", "{0}", "x² ≥ 0, pa je x² ≤ 0 samo za x² = 0, tj. x = 0."]]); return { kind: "iv", q: `Skup rješenja: ${q}`, a: ans, why, hint: "Upiši ∅ ako nema rješenja, R ako je svaki realan broj rješenje." }; },
  () => {
    const n = rnd(4, 6), S = Array.from({ length: n }, (_, i) => i + 1), A = S.filter(() => Math.random() < .5).slice(0, 3); if (A.length < 2) A.push(...[1, 2].filter(x => !A.includes(x)));
    A.sort((x, y) => x - y);
    const impossible = Math.random() < .35;
    const B = impossible ? [A[0], 9] : A.filter(() => Math.random() < .6);
    const cnt = impossible ? 0 : 2 ** (n - A.length);
    return { kind: "r", q: `X ⊆ {${S.join(", ")}} i {${A.join(", ")}} ∩ X = ${B.length ? "{" + B.join(", ") + "}" : "∅"}. Koliko ima takvih skupova X?`, val: [cnt, 0], a: String(cnt), why: impossible ? `9 ∉ {${A.join(", ")}}, pa presjek nikad ne može sadržati 9. Rješenja nema (0).` : `Elementi iz {${A.join(", ")}} su određeni: ${B.length ? B.join(", ") + " moraju biti u X" : "nijedan nije u X"}${A.filter(x => !B.includes(x)).length ? ", " + A.filter(x => !B.includes(x)).join(", ") + " ne smiju" : ""}. Ostalih ${n - A.length} elemenata je slobodno, pa ima 2<sup>${n - A.length}</sup> = ${cnt} rješenja.` };
  },
  () => {
    const a = rnd(3, 12), b = rnd(3, 12);
    if (Math.random() < .4) { const c = Math.min(a, b) + rnd(1, 3); return mcQ(`|A| = ${a}, |B| = ${b}, |A ∩ B| = ${c}. Koliko je |A ∪ B|?`, `takva situacija nije moguća`, [`${a + b - c}`, `${a + b}`, `${Math.max(a, b)}`], `A ∩ B ⊆ A i A ∩ B ⊆ B, pa presjek ne može imati više od ${Math.min(a, b)} elemenata.`); }
    const c = rnd(0, Math.min(a, b)); return { kind: "r", q: `|A| = ${a}, |B| = ${b}, |A ∩ B| = ${c}. |A ∪ B| = ?`, val: [a + b - c, 0], a: String(a + b - c), why: `|A ∪ B| = |A| + |B| − |A ∩ B| = ${a} + ${b} − ${c}. Presjek se oduzima jer je brojan dva puta.` };
  },
];

// ---------- RELACIJE ----------
const REL_CONC = [
  ["Prazna relacija ρ = ∅ na A = {1, 2} je:", "simetrična, antisimetrična i tranzitivna, ali nije refleksivna", ["refleksivna, simetrična i tranzitivna", "nema nijedno svojstvo", "nije relacija, pa ništa ne važi"], "Uslovi S, AS i T su oblika „ako … onda …“, a pretpostavka nikad nije ispunjena. R traži (1, 1) ∈ ρ, a toga nema."],
  ["Dijagonala Δ = {(x, x) | x ∈ A} je:", "i relacija ekvivalencije i relacija poretka", ["samo relacija ekvivalencije", "samo relacija poretka", "ni jedno ni drugo"], "Δ je R, S, AS i T, pa je i ekvivalencija (R, S, T) i poredak (R, AS, T)."],
  ["Može li relacija biti i simetrična i antisimetrična?", "da, npr. ∅ ili dijagonala", ["ne, to su suprotna svojstva", "samo na praznom skupu", "samo ako je refleksivna"], "S i AS zajedno znače da nema para (x, y) sa x ≠ y. To ima npr. dijagonala."],
  ["Relacija < na ℕ je:", "antisimetrična i tranzitivna, ali nije ni refleksivna ni simetrična", ["relacija poretka", "relacija ekvivalencije", "samo tranzitivna"], "x < x nikad ne važi (nije R). x < y i y < x nikad ne važe zajedno (AS važi). Iz x < y i y < z slijedi x < z (T)."],
  ["Relacija xρy ⇔ x ≠ y na {1, 2, 3} je:", "simetrična, ali nije ni refleksivna ni tranzitivna", ["relacija ekvivalencije", "antisimetrična", "refleksivna i simetrična"], "Za T kontraprimjer: 1 ≠ 2 i 2 ≠ 1, a 1 ≠ 1 ne važi."],
  ["xρy ⇔ x − y je paran broj (na ℤ). Koliko klasa ekvivalencije ima?", "2 (parni i neparni)", ["1", "beskonačno mnogo", "nije ekvivalencija"], "x i y su u relaciji tačno kad imaju istu parnost. Klase su parni i neparni brojevi."],
  ["Na skupu {1, 2} tražimo relaciju koja je refleksivna i NIJE tranzitivna. Rezultat?", "takva relacija ne postoji", ["{(1, 1), (2, 2)}", "{(1, 2), (2, 1)}", "{(1, 1), (2, 2), (1, 2)}"], "Sa dva elementa refleksivna relacija sadrži (1,1) i (2,2). Bilo koji dodatni par ne može pokvariti tranzitivnost: provjeri sve 4 mogućnosti."],
];
function matQ() {
  const A = [1, 2, 3];
  let R = []; for (const x of A) for (const y of A) if (Math.random() < .45) R.push([String(x), String(y)]);
  if (!R.length) R = [["1", "1"]];
  const k = pick(["R", "S", "AS", "T"]), names = { R: "refleksivna", S: "simetrična", AS: "antisimetrična", T: "tranzitivna" };
  const P = REL.props(A.map(String), R);
  const tbl = `<table class="mat"><tr><th class="corner">ρ</th><th>1</th><th>2</th><th>3</th></tr>${A.map(x => `<tr><th>${x}</th>${A.map(y => `<td class="${x === y ? "diag" : ""}">${REL.has(R, String(x), String(y)) ? 1 : 0}</td>`).join("")}</tr>`).join("")}</table>`;
  const tip = { R: "Gledaj samo dijagonalu.", S: "Gledaj da li je matrica simetrična oko dijagonale.", AS: "Gledaj parove simetričnih mjesta van dijagonale: nikad dvije jedinice.", T: "Za svaki put x → y → z mora postojati i x → z." }[k];
  return yesNo(`Da li je relacija zadata matricom ${names[k]}?${tbl}`, P[k].ok, `${tip} Ovdje: ${P[k].why}.`);
}
const RELACIJE_DRILL = [
  matQ, matQ,
  () => { const [q, r, w, why] = pick(REL_CONC); return mcQ(q, r, w, why); },
  () => { const m = rnd(2, 6), n = rnd(m - 1, 12); const k = Math.min(m, n); return { kind: "r", q: `Na skupu {1, 2, …, ${n}}: xρy ⇔ x i y daju isti ostatak pri dijeljenju sa ${m}. Koliko ima klasa ekvivalencije?`, val: [k, 0], a: String(k), why: n >= m ? `Klasa ima onoliko koliko ima mogućih ostataka: 0, 1, …, ${m - 1}, tj. ${m}.` : `Mogućih ostataka ima ${m}, ali skup ima samo ${n} elemenata, pa je svaki element sam u svojoj klasi: ${n} klasa.` }; },
  () => { const n = rnd(1, 3), refl = Math.random() < .5; const e = refl ? n * n - n : n * n; return { kind: "r", q: `Koliko ima ${refl ? "refleksivnih " : ""}binarnih relacija na skupu od ${n} element${n === 1 ? "a" : "a"} (računajući i ∅${refl ? ", ako je refleksivna" : ""})?`, val: [2 ** e, 0], a: String(2 ** e), why: refl ? `${n} dijagonalnih parova je obavezno, a ostalih n² − n = ${e} je slobodno: 2<sup>${e}</sup>.` : `|A × A| = ${n * n}, a svaki par biramo „u relaciji“ ili „ne“: 2<sup>${n * n}</sup>.` }; },
];

// ---------- FUNKCIJE ----------
const FUN_INV = [
  ["f: ℝ → ℝ, f(x) = x²", "ne postoji", ["√x", "x²", "1/x²"], "f(−1) = f(1), pa f nije 1-1 i inverz ne postoji."],
  ["f: [0, +∞) → [0, +∞), f(x) = x²", "√x", ["ne postoji", "−√x", "x/2"], "Na [0, +∞) je x² rastuća i „na“, pa je inverz √x. Odgovor zavisi od domena."],
  ["f: ℝ → ℝ, f(x) = 5", "ne postoji", ["x − 5", "x/5", "5"], "Konstanta nije ni 1-1 ni „na“."],
  ["f: ℝ → ℝ, f(x) = x³", "∛x", ["ne postoji", "x³", "1/x³"], "x³ je strogo rastuća i „na“ ℝ, pa je inverz ∛x."],
  ["f: ℝ → ℝ, f(x) = |x|", "ne postoji", ["|x|", "−x", "x"], "|−1| = |1|, pa f nije 1-1."],
  ["f: ℝ \\ {0} → ℝ \\ {0}, f(x) = 1/x", "1/x (sama sebi je inverz)", ["ne postoji", "x", "−1/x"], "y = 1/x ⇔ x = 1/y, pa je f⁻¹ = f."],
];
const FUNKCIJE_DRILL = [
  () => { const a = rnd(1, 6), b = rnd(1, 6), k = pick(["injekcija", "sirjekcija", "bijekcija"]); const ok = k === "injekcija" ? a <= b : k === "sirjekcija" ? a >= b : a === b; return yesNo(`|X| = ${a}, |Y| = ${b}. Može li neko preslikavanje f: X → Y biti ${k}?`, ok, k === "injekcija" ? `Injekcija traži |X| ≤ |Y| (svaki element svoju sliku). Ovdje ${a} ${ok ? "≤" : ">"} ${b}.` : k === "sirjekcija" ? `Sirjekcija traži |X| ≥ |Y| (svaki element iz Y bar jedan original). Ovdje ${a} ${ok ? "≥" : "<"} ${b}.` : `Bijekcija traži |X| = |Y|. Ovdje je ${a} ${ok ? "=" : "≠"} ${b}.`); },
  () => { const n = rnd(1, 4), m = rnd(1, 4); return { kind: "r", q: `Koliko ima svih preslikavanja f: X → Y ako je |X| = ${n}, |Y| = ${m}?`, val: [m ** n, 0], a: String(m ** n), why: `Svaki od ${n} elemenata iz X bira jednu od ${m} slika: ${m}<sup>${n}</sup> = ${m ** n}.` }; },
  () => { const a = pick([2, 3, 4, 5, -2, -3]), b = rnd(-9, 9); return { kind: "fx", q: `f(x) = ${linStr(Frac.of(a), Frac.of(b))}. f⁻¹(x) = ?`, a: `(x - (${b}))/(${a})`, disp: `(x ${b >= 0 ? "−" : "+"} ${Math.abs(b)})/${a < 0 ? "(" + String(a).replace("-", "−") + ")" : a}`, why: `f prvo množi sa ${a}, pa dodaje ${b}. Inverz radi obrnuto: oduzme ${b}, pa podijeli sa ${a}: f⁻¹(x) = (x ${b >= 0 ? "−" : "+"} ${Math.abs(b)})/${a < 0 ? "(" + a + ")" : a}.` }; },
  () => { const [a, b, c, d] = pick([[2, 1, 1, -1], [1, 2, 1, 3], [3, -1, 1, 2], [1, 0, 1, 1], [2, 3, 1, -2]]); return { kind: "fx", q: `f(x) = (${linStr(Frac.of(a), Frac.of(b))})/(${linStr(Frac.of(c), Frac.of(d))}). f⁻¹(x) = ?`, a: `(${d}*x - (${b}))/(-(${c})*x + ${a})`, disp: `(${linStr(Frac.of(d), Frac.of(-b))})/(${linStr(Frac.of(-c), Frac.of(a))})`, why: `Za (ax + b)/(cx + d) inverz je (dx − b)/(−cx + a): a i d zamijene mjesta, b i c promijene znak. Ovdje (${linStr(Frac.of(d), Frac.of(-b))})/(${linStr(Frac.of(-c), Frac.of(a))}).` }; },
  () => { const [f, r, w, why] = pick(FUN_INV); return mcQ(`${f}. Inverzna funkcija f⁻¹(x) = ?`, r, w, why); },
  () => { const a = rnd(1, 5), gf = Math.random() < .5; return { kind: "fx", q: `f(x) = x + ${a}, g(x) = x². ${gf ? "(g∘f)(x)" : "(f∘g)(x)"} = ?`, a: gf ? `(x + ${a})^2` : `x^2 + ${a}`, disp: gf ? `(x + ${a})²` : `x² + ${a}`, why: gf ? `(g∘f)(x) = g(f(x)): prvo f (dodaj ${a}), pa g (kvadriraj): (x + ${a})².` : `(f∘g)(x) = f(g(x)): prvo g (kvadriraj), pa f (dodaj ${a}): x² + ${a}. Redoslijed je bitan: g∘f ≠ f∘g.` }; },
  () => { const [a, b, c, d] = pick([[2, 1, 1, -1], [3, 2, 1, 1], [1, 4, 2, 1], [-4, 1, 2, 3]]); const v = new Frac(BigInt(a), BigInt(c)); return { kind: "r", q: `f(x) = (${linStr(Frac.of(a), Frac.of(b))})/(${linStr(Frac.of(c), Frac.of(d))}). Koju vrijednost f nikad ne dostiže?`, val: [v.toNumber(), 0], a: v.toString().replace("-", "−"), why: `To je a/c = ${a}/${c} (horizontalna asimptota). Jednačina f(x) = a/c nema rješenja, jer se x „skrati“.` }; },
];

// ---------- INDUKCIJA ----------
const IND_THR = [["2^n", "n^2"], ["3^n", "n^3"], ["2^n", "2n+1"], ["n^2", "2n+1"], ["2^n", "n^3"], ["n^2", "5n"]];
const INDUKCIJA_DRILL = [
  () => {
    const [l, d] = pick(IND_THR), L = parseExpr(l, ["n"]), D = parseExpr(d, ["n"]);
    const ok = n => evalNum(L, { n }) > evalNum(D, { n });
    let thr = 1; for (let m = 1; m <= 30; m++) { let all = true; for (let n = m; n <= 60; n++) if (!ok(n)) { all = false; break; } if (all) { thr = m; break; } }
    const early = []; for (let n = 1; n < thr; n++) if (ok(n)) early.push(n);
    const tbl = Array.from({ length: Math.min(thr + 1, 11) }, (_, i) => i + 1).map(n => `n=${n}: ${evalNum(L, { n })} ${ok(n) ? ">" : "≤"} ${evalNum(D, { n })}`).join(" · ");
    return { kind: "r", q: `Od kog najmanjeg n važi ${l.replace("^", "^")} > ${d} <i>za sva</i> n nadalje?`, val: [thr, 0], a: String(thr), why: `Mala tablica: ${tbl}.${early.length ? ` Pažnja: važi i za n ∈ {${early.join(", ")}}, pa onda prestane i opet počne. Zato baza indukcije mora biti n = ${thr}.` : ""}` };
  },
  () => { const n = pick([10, 20, 50, 100, 200, 1000]); return { kind: "r", q: `1 + 2 + 3 + … + ${n} = ?`, val: [n * (n + 1) / 2, 0], a: String(n * (n + 1) / 2), why: `Spoji prvi i posljednji, drugi i pretposljednji…: ${n / 2} parova po ${n + 1}, tj. n(n+1)/2 = ${n * (n + 1) / 2}.` }; },
  () => { const n = rnd(5, 40); return { kind: "r", q: `1 + 3 + 5 + … + ${2 * n - 1} = ?`, val: [n * n, 0], a: String(n * n), why: `Zbir prvih n neparnih brojeva je n². Ovdje ima ${n} sabiraka, pa je zbir ${n}² = ${n * n}.` }; },
  () => mcQ("Dokazan je korak T(k) ⇒ T(k+1), ali T(1) ne važi. Šta se može zaključiti?", "ništa – tvrđenje može biti netačno za svako n", ["tvrđenje važi za sve n ≥ 2", "tvrđenje važi za sve n", "tvrđenje ne važi ni za jedno n"], "Bez baze korak „dokazuje“ i besmislice: iz n = n + 1 slijedi n + 1 = n + 2. Ali tvrđenje može važiti od nekog kasnijeg n, pa ni „ne važi nigdje“ nije siguran zaključak."),
  () => { const m = rnd(3, 12), n = rnd(10, 999); return { kind: "r", q: `Ostatak broja ${m + 1}^${n} pri dijeljenju sa ${m}?`, val: [1, 0], a: "1", why: `${m + 1} = ${m} + 1 daje ostatak 1, a 1 na bilo koji stepen je 1.` }; },
  () => { const m = rnd(3, 12), n = rnd(10, 999); const r = n % 2 ? m - 1 : 1; return { kind: "r", q: `Ostatak broja ${m - 1}^${n} pri dijeljenju sa ${m}?`, val: [r, 0], a: String(r), why: `${m - 1} ≡ −1 (mod ${m}), pa je ${m - 1}^${n} ≡ (−1)^${n} = ${n % 2 ? "−1, tj. ostatak " + (m - 1) : "1"}.` }; },
  () => mcQ("Da li je n² + n + 41 prost broj za svako n ∈ ℕ?", "ne", ["da", "ne može se odrediti"], "Za n = 1, …, 39 jeste prost, ali za n = 40 dobijamo 40² + 40 + 41 = 41², a za n = 41 je djeljiv sa 41. Mnogo primjera nije dokaz, dok je jedan kontraprimjer dovoljan za „ne“."),
];

// dodatna „zamka“ pitanja za kompleksne brojeve (dodaju se postojećim)
KX_DRILL.push(
  () => mcQ("Koliko rješenja ima jednačina z = z̄ (z ∈ ℂ)?", "beskonačno mnogo (svaki realan broj)", ["nijedno", "jedno (z = 0)", "dva"], "z = z̄ ⇔ a + bi = a − bi ⇔ b = 0. Rješenje je svaki realan broj."),
  () => mcQ("Koliko rješenja ima jednačina |z| = −1?", "nijedno", ["jedno", "dva", "beskonačno mnogo"], "Modul je rastojanje, pa nikad nije negativan. Skup rješenja je ∅."),
  () => mcQ("Koliko rješenja u ℂ ima z² = −4?", "dva: 2i i −2i", ["nijedno", "jedno: 2i", "beskonačno mnogo"], "U ℝ nema rješenja, ali u ℂ ima: (±2i)² = 4i² = −4."),
  () => mcQ("Koliko rješenja ima z + z̄ = 2i?", "nijedno", ["jedno", "beskonačno mnogo", "dva"], "z + z̄ = 2·Re(z) je uvijek realan broj, a 2i nije realan."),
);
TG_DRILL.push(
  () => mcQ("Arg(0) = ?", "nije definisan", ["0", "π", "π/2"], "Broj 0 nema argument: tačka O nema pravac."),
  () => mcQ("Koliko ima brojeva z sa |z| = 2 i Arg z = π/3?", "tačno jedan: 1 + √3i", ["nijedan", "dva", "beskonačno mnogo"], "Modul i glavni argument jednoznačno određuju broj: z = 2(cos π/3 + i sin π/3) = 1 + √3i."),
  () => mcQ("Koliko ima brojeva z sa |z| = 2?", "beskonačno mnogo (cijela kružnica)", ["dva: 2 i −2", "četiri", "jedan"], "Svi brojevi na kružnici poluprečnika 2 oko O imaju modul 2."),
);

// ---------- „Kakav sve može biti rezultat“ (ide u Pravila) ----------
const OUTCOMES = {
  logika: `<ul><li>Formula može biti <b>tautologija</b> (uvijek ⊤), <b>kontradikcija</b> (nikad ⊤, skup redova u kojima je tačna je ∅) ili <b>ni jedno ni drugo</b>.</li><li>Dvije formule mogu biti ekvivalentne ili ne. Za „ne“ je dovoljan jedan red.</li><li>Vrijednost složenog iskaza se nekad <b>ne može odrediti</b> bez vrijednosti svih slova (npr. τ(p ⇒ q) za τ(p) = ⊤).</li></ul>`,
  skupovi: `<ul><li>Rezultat operacije može biti <b>∅</b> ili cijeli univerzalni skup U (kod intervala <b>ℝ</b>).</li><li>Presjek intervala može biti i <b>jedna tačka</b> {a}, a ne interval.</li><li>Zadatak „odredi X“ može imati <b>više rješenja</b> (2<sup>k</sup>) ili <b>nijedno</b> (npr. {1, 2} ∩ X = {3}).</li><li>Podaci u zadatku sa Venovim dijagramom mogu biti <b>protivrječni</b>: tada takva situacija ne postoji.</li><li>Nejednačina može imati skup rješenja ∅ (|x| &lt; −1) ili ℝ (x² + 1 &gt; 0).</li></ul>`,
  relacije: `<ul><li>Pravilo može dati <b>praznu relaciju</b>. Ona je S, AS i T, ali nije R.</li><li>Relacija može biti <b>i S i AS</b> (npr. dijagonala) ili <b>ni S ni AS</b>. To nisu suprotnosti.</li><li>Relacija sa traženim svojstvima možda <b>ne postoji</b> ili ih postoji više.</li><li>Ako relacija nije ekvivalencija, <b>klase ekvivalencije ne postoje</b>.</li></ul>`,
  funkcije: `<ul><li>Zadata relacija možda <b>nije preslikavanje</b> (element bez slike ili sa dvije slike).</li><li>Inverz <b>ne postoji</b> ako f nije bijekcija. Nekad postoji tek kad se <b>suzi domen</b> (x² na [0, +∞)), pa odgovor zavisi od domena.</li><li>Po Dirihleovom principu: ako je |X| &gt; |Y|, injekcija ne postoji, a ako je |X| &lt; |Y|, sirjekcija ne postoji.</li><li>Kod g∘f zadate po dijelovima neke kombinacije dijelova <b>otpadaju</b> (presjek ∅).</li></ul>`,
  indukcija: `<ul><li>Tvrđenje može biti <b>netačno</b>. Tada je odgovor kontraprimjer, a indukcija se ne radi.</li><li>Tvrđenje može važiti <b>tek od nekog n</b> (2ⁿ &gt; n² za n ≥ 5), ili važiti za mala n, prestati i opet početi (2ⁿ &gt; n² važi i za n = 1).</li><li>Bez baze korak ne dokazuje ništa. Bez koraka ni hiljadu provjerenih n nije dokaz (n² + n + 41).</li></ul>`,
  kompleksni: `<ul><li>Jednačina u ℂ može imati <b>jedno</b> rješenje, <b>nijedno</b> (z + z̄ = 2i, |z| = −1) ili <b>beskonačno mnogo</b> (z = z̄ važi za svaki realan z).</li><li>Jednačina bez rješenja u ℝ može imati rješenja u ℂ (z² = −4 ⇒ z = ±2i).</li></ul>`,
  trig: `<ul><li>Broj 0 <b>nema argument</b>, pa ni trigonometrijski oblik.</li><li>Argument je određen samo do na 2π: arg z = φ + 2kπ. Glavni argument je jedinstven u (−π, π].</li><li>Uslov |z| = r daje <b>beskonačno mnogo</b> brojeva (kružnica), a tek modul i argument zajedno daju jedan broj.</li></ul>`,
};
const THINK_DRILL = { logika: [LOGIKA_DRILL, "lgd"], skupovi: [SKUPOVI_DRILL, "skd"], relacije: [RELACIJE_DRILL, "rld"], funkcije: [FUNKCIJE_DRILL, "fnd"], indukcija: [INDUKCIJA_DRILL, "ind"] };
function addThinking(name) {
  const panel = $("#tab-" + name);
  if (!panel) return;
  if (THINK_DRILL[name]) {
    const [gens, id] = THINK_DRILL[name];
    panel.insertAdjacentHTML("beforeend", drillCard(id, "Vidi odmah – trening", "Kratka pitanja koja se, uz razumijevanje, rješavaju u glavi za par sekundi. Među njima su i „zamke“: odgovor može biti ∅, „nema rješenja“, „ne postoji“ ili „ne može se odrediti“. Cilj je ispod 10 s."));
    drillWire(id, gens);
  }
  if (OUTCOMES[name]) panel.insertAdjacentHTML("beforeend", `<section class="card"><details class="theory"><summary>🧭 Kakav sve može biti rezultat</summary><p>Profesor zadaje i zadatke čiji odgovor nije „lijep“ broj. Ovo su svi mogući ishodi u ovoj oblasti, i svaki je ispravan odgovor:</p>${OUTCOMES[name]}</details></section>`);
}
