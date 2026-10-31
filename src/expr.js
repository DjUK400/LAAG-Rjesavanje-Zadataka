// ===================== PARSER ALGEBARSKIH IZRAZA + POLINOMI =====================
"use strict";

const FUNCS = ["abs", "sgn", "sqrt", "cbrt", "sin", "cos", "tan", "ln", "log", "exp", "paran", "neparan", "min", "max", "floor", "ceil"];

function tokenizeExpr(src) {
  const s = src.replace(/−/g, "-").replace(/·|×/g, "*").replace(/÷/g, "/").replace(/²/g, "^2").replace(/³/g, "^3");
  const toks = []; let i = 0;
  const two = ["<=", ">=", "!=", "==", "&&", "||", "**"];
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; toks.push({ k: "num", v: s.slice(i, j) }); i = j; continue; }
    if (/[A-Za-zπ_]/.test(c)) { let j = i; while (j < s.length && /[A-Za-z0-9_π]/.test(s[j])) j++; toks.push({ k: "id", v: s.slice(i, j) }); i = j; continue; }
    const t2 = s.slice(i, i + 2);
    if (two.includes(t2)) { toks.push({ k: "op", v: t2 === "**" ? "^" : t2 }); i += 2; continue; }
    if ("+-*/^%()|,=<>!≤≥≠∧∨¬".includes(c)) {
      const map = { "≤": "<=", "≥": ">=", "≠": "!=", "∧": "&&", "∨": "||", "¬": "!" };
      toks.push({ k: "op", v: map[c] || c }); i++; continue;
    }
    throw new MathErr(`Nepoznat znak "${c}" u izrazu.`);
  }
  return toks;
}

// vars: dozvoljene promjenljive (npr. ["x","y"]) – koristi se za razbijanje "xy" -> x*y
function parseExpr(src, vars = ["x"]) {
  const toks = tokenizeExpr(src);
  let p = 0;
  const peek = () => toks[p], next = () => toks[p++];
  const isOp = (v) => toks[p] && toks[p].k === "op" && toks[p].v === v;
  const isWord = (w) => toks[p] && toks[p].k === "id" && w.includes(toks[p].v.toLowerCase());
  const expect = (v) => { if (!isOp(v)) throw new MathErr(`Očekivao sam "${v}" u izrazu "${src}".`); p++; };

  function orE() { let a = andE(); while (isOp("||") || isWord(["or", "ili"])) { p++; a = { t: "or", a, b: andE() }; } return a; }
  function andE() { let a = notE(); while (isOp("&&") || isWord(["and"])) { p++; a = { t: "and", a, b: notE() }; } return a; }
  function notE() { if (isOp("!") || isWord(["not"])) { p++; return { t: "not", a: notE() }; } return cmpE(); }
  function cmpE() {
    const items = [addE()], ops = [];
    while (peek() && peek().k === "op" && ["=", "==", "!=", "<", "<=", ">", ">="].includes(peek().v)) {
      let o = next().v; if (o === "==") o = "="; ops.push(o); items.push(addE());
    }
    return ops.length ? { t: "cmp", ops, items } : items[0];
  }
  function addE() {
    let a = mulE();
    while (isOp("+") || isOp("-")) { const o = next().v; a = { t: "op", op: o, a, b: mulE() }; }
    return a;
  }
  function startsPrimary() {
    const t = peek(); if (!t) return false;
    if (t.k === "num") return true;
    if (t.k === "id") return !["or", "ili", "and", "not", "mod"].includes(t.v.toLowerCase());
    return t.k === "op" && t.v === "(";
  }
  function mulE() {
    let a = unaryE();
    for (;;) {
      if (isOp("*") || isOp("/") || isOp("%")) { const o = next().v; a = { t: "op", op: o === "%" ? "mod" : o, a, b: unaryE() }; }
      else if (isWord(["mod"])) { p++; a = { t: "op", op: "mod", a, b: unaryE() }; }
      else if (startsPrimary()) { a = { t: "op", op: "*", a, b: powE(), imp: true }; }
      else break;
    }
    return a;
  }
  function unaryE() {
    if (isOp("-")) { p++; return { t: "neg", a: unaryE() }; }
    if (isOp("+")) { p++; return unaryE(); }
    return powE();
  }
  function powE() {
    const b = primary();
    if (isOp("^")) { p++; return { t: "op", op: "^", a: b, b: unaryE() }; }
    return b;
  }
  function primary() {
    const t = next();
    if (!t) throw new MathErr(`Izraz "${src}" je nepotpun.`);
    if (t.k === "num") return { t: "num", v: Frac.parse(t.v) };
    if (t.k === "op" && t.v === "(") { const e = orE(); expect(")"); return e; }
    if (t.k === "op" && t.v === "|") { const e = addE(); expect("|"); return { t: "fn", f: "abs", args: [e] }; }
    if (t.k === "id") {
      const name = t.v;
      const low = name.toLowerCase();
      if (FUNCS.includes(low) && isOp("(")) {
        p++; const args = [orE()];
        while (isOp(",")) { p++; args.push(orE()); }
        expect(")");
        return { t: "fn", f: low, args };
      }
      if (low === "pi" || name === "π") return { t: "const", n: "π", v: Math.PI };
      if (name === "e" && !vars.includes("e")) return { t: "const", n: "e", v: Math.E };
      if (vars.includes(name)) return { t: "var", n: name };
      // razbij npr. "kn" ili "xy" na proizvod poznatih promjenljivih
      if ([...name].every(ch => vars.includes(ch))) {
        let node = { t: "var", n: name[0] };
        for (const ch of name.slice(1)) node = { t: "op", op: "*", a: node, b: { t: "var", n: ch }, imp: true };
        return node;
      }
      throw new MathErr(`Nepoznata oznaka "${name}". Dozvoljene promjenljive: ${vars.join(", ")}.`);
    }
    throw new MathErr(`Neočekivan znak "${t.v}" u izrazu "${src}".`);
  }
  if (!toks.length) throw new MathErr("Izraz je prazan.");
  const ast = orE();
  if (p < toks.length) throw new MathErr(`Ne razumijem dio izraza od "${toks[p].v}".`);
  return ast;
}

// ---------- numeričko izračunavanje (float / boolean) ----------
function evalNum(n, env) {
  switch (n.t) {
    case "num": return n.v.toNumber();
    case "const": return n.v;
    case "var": if (!(n.n in env)) throw new MathErr("Nema vrijednosti za " + n.n); return env[n.n];
    case "neg": return -evalNum(n.a, env);
    case "not": return !evalNum(n.a, env);
    case "and": return !!evalNum(n.a, env) && !!evalNum(n.b, env);
    case "or": return !!evalNum(n.a, env) || !!evalNum(n.b, env);
    case "cmp": {
      const v = n.items.map(x => evalNum(x, env));
      const E = 1e-9;
      for (let i = 0; i < n.ops.length; i++) {
        const a = v[i], b = v[i + 1], o = n.ops[i];
        if (Number.isNaN(a) || Number.isNaN(b)) return false;
        const ok = o === "=" ? Math.abs(a - b) <= E * Math.max(1, Math.abs(a), Math.abs(b)) :
          o === "!=" ? Math.abs(a - b) > E * Math.max(1, Math.abs(a), Math.abs(b)) :
            o === "<" ? a < b - E : o === "<=" ? a <= b + E : o === ">" ? a > b + E : a >= b - E;
        if (!ok) return false;
      }
      return true;
    }
    case "op": {
      const a = evalNum(n.a, env), b = evalNum(n.b, env);
      switch (n.op) {
        case "+": return a + b; case "-": return a - b; case "*": return a * b;
        case "/": return b === 0 ? NaN : a / b;
        case "^": {
          if (a < 0 && !Number.isInteger(b)) return NaN;
          return Math.pow(a, b);
        }
        case "mod": return b === 0 ? NaN : ((a % b) + Math.abs(b)) % Math.abs(b);
      }
    }
    case "fn": {
      const a = n.args.map(x => evalNum(x, env)), x = a[0];
      switch (n.f) {
        case "abs": return Math.abs(x); case "sgn": return Math.sign(x);
        case "sqrt": return x < 0 ? NaN : Math.sqrt(x); case "cbrt": return Math.cbrt(x);
        case "sin": return Math.sin(x); case "cos": return Math.cos(x); case "tan": return Math.tan(x);
        case "ln": return x <= 0 ? NaN : Math.log(x);
        case "log": if (a.length === 2) { return (a[0] <= 0 || a[0] === 1 || a[1] <= 0) ? NaN : Math.log(a[1]) / Math.log(a[0]); } return x <= 0 ? NaN : Math.log10(x);
        case "exp": return Math.exp(x);
        case "paran": return Number.isInteger(x) && x % 2 === 0;
        case "neparan": return Number.isInteger(x) && Math.abs(x % 2) === 1;
        case "min": return Math.min(...a); case "max": return Math.max(...a);
        case "floor": return Math.floor(x); case "ceil": return Math.ceil(x);
      }
    }
  }
  throw new MathErr("Ne mogu izračunati izraz.");
}

// ---------- tačno izračunavanje (razlomci) ----------
function evalExact(n, env) {
  switch (n.t) {
    case "num": return n.v;
    case "var": if (!(n.n in env)) throw new MathErr("Nema vrijednosti za " + n.n); return Frac.of(env[n.n]);
    case "neg": return evalExact(n.a, env).neg();
    case "op": {
      const a = evalExact(n.a, env), b = evalExact(n.b, env);
      switch (n.op) {
        case "+": return a.add(b); case "-": return a.sub(b); case "*": return a.mul(b); case "/": return a.div(b);
        case "^": if (!b.isInt()) throw new MathErr("Tačno računanje podržava samo cjelobrojne eksponente."); return a.pow(Number(b.n));
        case "mod": { if (!a.isInt() || !b.isInt() || b.isZero()) throw new MathErr("mod radi samo za cijele brojeve."); const m = b.n < 0n ? -b.n : b.n; return new Frac(((a.n % m) + m) % m); }
      }
    }
    case "fn": {
      const a = n.args.map(x => evalExact(x, env));
      if (n.f === "abs") return a[0].abs();
      if (n.f === "sgn") return Frac.of(a[0].sign());
      if (n.f === "min") return a.reduce((x, y) => x.cmp(y) <= 0 ? x : y);
      if (n.f === "max") return a.reduce((x, y) => x.cmp(y) >= 0 ? x : y);
      throw new MathErr(`Funkcija ${n.f} se ne može tačno izračunati (rezultat nije razlomak).`);
    }
  }
  throw new MathErr("Izraz nije brojčani (npr. sadrži poređenje ili konstantu π/e).");
}

// ---------- ispis AST-a ----------
const PREC = { "+": 1, "-": 1, "*": 2, "/": 2, "mod": 2, "^": 4 };
function astStr(n, parentPrec = 0, right = false) {
  switch (n.t) {
    case "num": return n.v.toString();
    case "const": return n.n;
    case "var": return n.n;
    case "neg": { const s = "−" + astStr(n.a, 3); return parentPrec > 1 ? `(${s})` : s; }
    case "fn": return n.f === "abs" ? `|${astStr(n.args[0])}|` : `${n.f}(${n.args.map(a => astStr(a)).join(", ")})`;
    case "op": {
      const p = PREC[n.op];
      let s;
      if (n.op === "^") s = `${astStr(n.a, 5)}^${astStr(n.b, 5)}`;
      else if (n.op === "*" && n.imp) { const L = astStr(n.a, p), R = astStr(n.b, p + 0.5, true); s = /^[0-9−]/.test(R) || (/[0-9]$/.test(L) && n.a.t !== "num") ? `${L}·${R}` : `${L}${R}`; }
      else s = `${astStr(n.a, p)} ${n.op === "*" ? "·" : n.op === "-" ? "−" : n.op} ${astStr(n.b, p + (n.op === "-" || n.op === "/" ? 0.5 : 0), true)}`;
      return p < parentPrec || (p === parentPrec && right) ? `(${s})` : s;
    }
    default: return "?";
  }
}
// zamjena promjenljive izrazom (za ispis T(k+1) i sl.)
function substAst(n, name, repl) {
  if (n.t === "var" && n.n === name) return repl;
  const c = { ...n };
  for (const k of ["a", "b"]) if (n[k]) c[k] = substAst(n[k], name, repl);
  if (n.items) c.items = n.items.map(x => substAst(x, name, repl));
  if (n.args) c.args = n.args.map(x => substAst(x, name, repl));
  return c;
}

// ===================== POLINOMI (koeficijenti = razlomci) =====================
class Poly {
  constructor(c) { this.c = c.map(Frac.of); while (this.c.length && this.c[this.c.length - 1].isZero()) this.c.pop(); }
  static k(v) { return new Poly([Frac.of(v)]); }
  static x() { return new Poly([0, 1]); }
  deg() { return this.c.length - 1; }
  isZero() { return this.c.length === 0; }
  co(i) { return this.c[i] || Frac.of(0); }
  lead() { return this.co(this.deg()); }
  add(o) { const n = Math.max(this.c.length, o.c.length), r = []; for (let i = 0; i < n; i++) r.push(this.co(i).add(o.co(i))); return new Poly(r); }
  sub(o) { return this.add(o.scale(-1)); }
  scale(k) { k = Frac.of(k); return new Poly(this.c.map(x => x.mul(k))); }
  mul(o) {
    if (this.isZero() || o.isZero()) return new Poly([]);
    const r = Array(this.c.length + o.c.length - 1).fill(0).map(() => Frac.of(0));
    this.c.forEach((a, i) => o.c.forEach((b, j) => { r[i + j] = r[i + j].add(a.mul(b)); }));
    return new Poly(r);
  }
  pow(k) { let r = Poly.k(1); for (let i = 0; i < k; i++) r = r.mul(this); return r; }
  divmod(o) {
    if (o.isZero()) throw new MathErr("Dijeljenje nultim polinomom.");
    let q = new Poly([]), r = this;
    while (!r.isZero() && r.deg() >= o.deg()) {
      const k = r.lead().div(o.lead()), d = r.deg() - o.deg();
      const t = new Poly([...Array(d).fill(0), k]);
      q = q.add(t); r = r.sub(t.mul(o));
    }
    return [q, r];
  }
  eval(x) { x = Frac.of(x); let r = Frac.of(0); for (let i = this.c.length - 1; i >= 0; i--) r = r.mul(x).add(this.c[i]); return r; }
  compose(q) { let r = new Poly([]); for (let i = this.c.length - 1; i >= 0; i--) r = r.mul(q).add(Poly.k(this.c[i])); return r; }
  monic() { return this.isZero() ? this : this.scale(Frac.of(1).div(this.lead())); }
  eq(o) { return this.sub(o).isZero(); }
  toString(v = "x") {
    if (this.isZero()) return "0";
    let s = "";
    for (let i = this.deg(); i >= 0; i--) {
      const a = this.co(i); if (a.isZero()) continue;
      const neg = a.sign() < 0, ab = a.abs();
      let coef = (ab.eq(1) && i > 0) ? "" : ab.toString();
      if (coef.includes("/") && i > 0) coef = `(${coef})`;
      const term = coef + (i > 0 ? v + (i > 1 ? sup(i) : "") : "");
      s += s ? (neg ? " − " : " + ") + term : (neg ? "−" : "") + term;
    }
    return s;
  }
}
function polyGcd(a, b) { while (!b.isZero()) { [a, b] = [b, a.divmod(b)[1]]; } return a.monic(); }

class Rat {
  constructor(num, den = Poly.k(1)) {
    if (den.isZero()) throw new MathErr("Imenilac je nula.");
    const g = polyGcd(num, den);
    if (g.deg() > 0) { num = num.divmod(g)[0]; den = den.divmod(g)[0]; }
    const l = den.lead(); num = num.scale(Frac.of(1).div(l)); den = den.scale(Frac.of(1).div(l));
    this.num = num; this.den = den;
  }
  add(o) { return new Rat(this.num.mul(o.den).add(o.num.mul(this.den)), this.den.mul(o.den)); }
  sub(o) { return new Rat(this.num.mul(o.den).sub(o.num.mul(this.den)), this.den.mul(o.den)); }
  mul(o) { return new Rat(this.num.mul(o.num), this.den.mul(o.den)); }
  div(o) { if (o.num.isZero()) throw new MathErr("Dijeljenje nulom."); return new Rat(this.num.mul(o.den), this.den.mul(o.num)); }
  isPoly() { return this.den.deg() === 0; }
  eq(o) { return this.sub(o).num.isZero(); }
  compose(q) { // q: Rat, zamjena x -> q
    const n = this.num.deg(), d = this.den.deg(), N = Math.max(n, d, 0);
    // P(q)=sum a_i qn^i qd^(N-i) / qd^N
    const ev = (P) => { let r = new Poly([]); P.c.forEach((a, i) => { r = r.add(q.num.pow(i).mul(q.den.pow(N - i)).scale(a)); }); return r; };
    return new Rat(ev(this.num), ev(this.den));
  }
  eval(x) { return this.num.eval(x).div(this.den.eval(x)); }
  toString(v = "x") {
    if (this.isPoly()) return this.num.scale(Frac.of(1).div(this.den.lead())).toString(v);
    // cjelobrojni koeficijenti radi ljepšeg ispisa
    let L = 1n;
    for (const c of [...this.num.c, ...this.den.c]) L = L * c.d / bgcd(L, c.d);
    let N = this.num.scale(new Frac(L)), D = this.den.scale(new Frac(L));
    const g = [...N.c, ...D.c].reduce((acc, c) => bgcd(acc, c.n), 0n) || 1n;
    N = N.scale(new Frac(1n, g)); D = D.scale(new Frac(1n, g));
    if (D.lead().sign() < 0) { N = N.scale(-1); D = D.scale(-1); }
    const ns = N.c.filter(c => !c.isZero()).length > 1 ? `(${N.toString(v)})` : N.toString(v);
    const ds = D.c.filter(c => !c.isZero()).length > 1 ? `(${D.toString(v)})` : D.toString(v);
    return `${ns} / ${ds}`;
  }
}

// AST -> racionalna funkcija u promjenljivoj v (ako je moguće)
function toRat(n, v) {
  switch (n.t) {
    case "num": return new Rat(Poly.k(n.v));
    case "var": if (n.n === v) return new Rat(Poly.x()); throw new MathErr(`Nepoznata promjenljiva ${n.n}.`);
    case "neg": { const a = toRat(n.a, v); return new Rat(a.num.scale(-1), a.den); }
    case "op": {
      if (n.op === "^") {
        const e = n.b.t === "num" ? n.b.v : (n.b.t === "neg" && n.b.a.t === "num" ? n.b.a.v.neg() : null);
        if (!e || !e.isInt()) throw new MathErr(`Izraz sa promjenljivom u eksponentu ili razlomljenim eksponentom (${astStr(n)}) nije racionalna funkcija.`);
        const k = Number(e.n), base = toRat(n.a, v);
        if (Math.abs(k) > 40) throw new MathErr("Eksponent je prevelik.");
        let r = new Rat(Poly.k(1)); for (let i = 0; i < Math.abs(k); i++) r = r.mul(base);
        return k < 0 ? new Rat(Poly.k(1)).div(r) : r;
      }
      const a = toRat(n.a, v), b = toRat(n.b, v);
      if (n.op === "+") return a.add(b); if (n.op === "-") return a.sub(b);
      if (n.op === "*") return a.mul(b); if (n.op === "/") return a.div(b);
      throw new MathErr("mod nije podržan u algebarskom računu.");
    }
  }
  throw new MathErr(`Izraz ${astStr(n)} sadrži funkciju (npr. sqrt, log) – nije racionalna funkcija.`);
}
function linearOf(src, v = "x") {
  const r = toRat(parseExpr(src, [v]), v);
  if (!r.isPoly() || r.num.deg() > 1) throw new MathErr(`"${src}" nije linearan izraz oblika a${v}+b.`);
  return [r.num.co(1), r.num.co(0)];
}
const linStr = (a, b, v = "x") => new Poly([b, a]).toString(v);

// ---------- faktorisanje (racionalne nule) radi ljepšeg ispisa ----------
function intScale(P) { // vrati [cjelobrojni polinom (BigInt[]), faktor s.t. P = Q * faktor]
  let L = 1n; for (const c of P.c) L = L * c.d / bgcd(L, c.d);
  let Q = P.c.map(c => c.n * (L / c.d));
  let g = Q.reduce((a, b) => bgcd(a, b), 0n) || 1n;
  if (Q[Q.length - 1] < 0n) g = -g;
  Q = Q.map(x => x / g);
  return [Q, new Frac(g, L)];
}
function divisorsBig(n) { n = n < 0n ? -n : n; const r = []; if (n === 0n) return [1n]; for (let i = 1n; i * i <= n && i < 100000n; i++) if (n % i === 0n) { r.push(i); if (i * i !== n) r.push(n / i); } return r; }
function factorPoly(P, v) { // vraća {k: Frac, factors: [string], rest: Poly}
  if (P.isZero()) return { str: "0" };
  let [Q, k] = intScale(P);
  const factors = [];
  let cur = new Poly(Q.map(x => new Frac(x)));
  let guard = 0;
  while (cur.deg() >= 1 && guard++ < 30) {
    // x = 0 kao nula
    if (cur.co(0).isZero()) { factors.push(v); cur = new Poly(cur.c.slice(1)); continue; }
    const a0 = cur.co(0).n, an = cur.lead().n;
    let found = null;
    outer: for (const p of divisorsBig(a0)) for (const q of divisorsBig(an)) for (const s of [1n, -1n]) {
      const r = new Frac(s * p, q);
      if (cur.eval(r).isZero()) { found = r; break outer; }
    }
    if (!found) break;
    const lin = new Poly([new Frac(-found.n), new Frac(found.d)]); // d·v − n
    factors.push(lin.toString(v));
    cur = cur.divmod(lin)[0];
  }
  if (cur.deg() >= 1) factors.push(cur.toString(v));
  else k = k.mul(cur.co(0));
  return { k, factors };
}
function groupFactors(fs, wrap) {
  const cnt = new Map(); fs.forEach(f => cnt.set(f, (cnt.get(f) || 0) + 1));
  return [...cnt].map(([f, c]) => wrap(f) + (c > 1 ? sup(c) : "")).join("");
}
function factorStr(P, v) {
  const f = factorPoly(P, v);
  if (f.str) return f.str;
  const wrap = s => (/[+−]/.test(s.replace(/^−/, "")) ? `(${s})` : s);
  let body = groupFactors(f.factors, wrap);
  let num = f.k.n, den = f.k.d;
  let pre = num === 1n ? "" : num === -1n ? "−" : String(num);
  if (!body) return f.k.toString();
  const s = pre + body;
  return den === 1n ? s : `${s} / ${den}`;
}
Rat.prototype.toFactored = function (v = "x") {
  if (this.isPoly()) return factorStr(this.num.scale(Frac.of(1).div(this.den.lead())), v);
  const n = factorPoly(this.num, v), d = factorPoly(this.den, v);
  const k = n.k.div(d.k);
  const wrap = s => (/[+−]/.test(s.replace(/^−/, "")) ? `(${s})` : s);
  let top = (k.n === 1n ? "" : k.n === -1n ? "−" : String(k.n)) + groupFactors(n.factors, wrap);
  if (!n.factors.length) top = String(k.n);
  let bottom = (k.d === 1n ? "" : String(k.d)) + groupFactors(d.factors, wrap);
  if (!bottom) bottom = "1";
  const needT = n.factors.length + (k.n !== 1n && k.n !== -1n ? 1 : 0) > 1 || /[+−]/.test(top.replace(/^−/, ""));
  return `${top} / ${d.factors.length + (k.d !== 1n ? 1 : 0) > 1 ? "(" + bottom + ")" : bottom}`;
};
Rat.prototype.toNice = function (v = "x") { // polinom: cjelobrojni zapis "(...)/L"
  if (!this.isPoly()) return this.toString(v);
  const P = this.num.scale(Frac.of(1).div(this.den.lead()));
  const [Q, k] = intScale(P);
  const qp = new Poly(Q.map(x => new Frac(x)));
  if (k.isInt()) return (k.eq(1) ? "" : k.eq(-1) ? "−" : k.toString() + "·") + (k.eq(1) || k.eq(-1) || qp.c.filter(c => !c.isZero()).length === 1 ? qp.toString(v) : `(${qp.toString(v)})`);
  const top = k.n === 1n ? qp.toString(v) : k.n === -1n ? "−(" + qp.toString(v) + ")" : `${k.n}(${qp.toString(v)})`;
  return `${qp.c.filter(c => !c.isZero()).length > 1 && k.n === 1n ? "(" + top + ")" : top} / ${k.d}`;
};
