// ===================== POKRETANJE =====================
"use strict";

// kratki nazivi podtabova (redom kartica u svakom tabu)
const SUB_LABELS = {
  logika: ["Tablica istinitosti", "Ekvivalencija formula"],
  skupovi: ["Operacije sa skupovima", "Nepoznati skup X", "Intervali", "Venov dijagram"],
  relacije: ["Ispitaj relaciju", "Konstruiši relaciju", "Broj relacija"],
  funkcije: ["Preslikavanje", "Realna funkcija i inverz", "Smjena", "Po dijelovima i g∘f", "Kompozicija"],
  indukcija: ["Zbir (identitet)", "Djeljivost", "Nejednakost"],
};

// Svaki tab dijeli na podtabove: „📘 Pravila“ + po jedan podtab za svaku vrstu zadatka
function buildSubtabs(name) {
  const panel = $("#tab-" + name);
  const cards = $$(":scope > section.card", panel);
  if (!cards.length) return;
  const rules = document.createElement("section");
  rules.className = "card rules";
  rules.innerHTML = `<h2>📘 Pravila i teorija – ${esc($(`nav.tabs button[data-tab="${name}"]`).textContent)}</h2>`;
  const tasks = [];
  let li = 0;
  cards.forEach(card => {
    const theory = $$("details.theory", card);
    const title = $("h2", card)?.textContent || "";
    const hasTask = !!$(".btns", card);
    if (theory.length) {
      const block = document.createElement("div");
      block.className = "rule-block";
      if (hasTask) block.innerHTML = `<h3>${esc(title)}</h3>`;
      theory.forEach(d => {
        const sum = $("summary", d)?.textContent.replace("📘", "").trim();
        if (sum && !/^Pravila i teorija$/i.test(sum) && hasTask) block.insertAdjacentHTML("beforeend", `<h4>${esc(sum)}</h4>`);
        [...d.childNodes].filter(n => !(n.tagName === "SUMMARY")).forEach(n => block.appendChild(n));
        d.remove();
      });
      rules.appendChild(block);
    }
    if (hasTask) {
      const label = (SUB_LABELS[name] || [])[li++] || title;
      tasks.push({ label, card });
      if (theory.length) card.querySelector("h2").insertAdjacentHTML("afterend", `<button type="button" class="tolinks" data-goto="pravila">📘 Pogledaj pravila</button>`);
    } else card.remove();
  });
  const bar = document.createElement("div");
  bar.className = "subtabs";
  const items = [{ id: "pravila", label: "📘 Pravila", el: rules }, ...tasks.map((t, i) => ({ id: "z" + (i + 1), label: t.label, el: t.card }))];
  bar.innerHTML = items.map(it => `<button type="button" data-sub="${it.id}">${esc(it.label)}</button>`).join("");
  panel.prepend(bar);
  panel.appendChild(rules);
  tasks.forEach(t => panel.appendChild(t.card));
  items.forEach(it => it.el.dataset.subpage = it.id);
  panel._items = items;
}
function showSub(name, sub) {
  const panel = $("#tab-" + name);
  if (!panel || !panel._items) return;
  if (!panel._items.some(it => it.id === sub)) sub = panel._items[1] ? panel._items[1].id : "pravila";
  panel._items.forEach(it => it.el.hidden = it.id !== sub);
  $$(".subtabs button", panel).forEach(b => b.classList.toggle("on", b.dataset.sub === sub));
  panel._cur = sub;
}

document.addEventListener("DOMContentLoaded", () => {
  const renders = { logika: logikaRender, skupovi: skupoviRender, relacije: relacijeRender, funkcije: funkcijeRender, indukcija: indukcijaRender };
  for (const [k, fn] of Object.entries(renders)) {
    try { fn(); buildSubtabs(k); } catch (e) { console.error(e); $("#tab-" + k).innerHTML = `<div class="card bad">Greška pri učitavanju taba: ${esc(e.message)}</div>`; }
  }
  const go = (name, sub, push = true) => {
    if (!renders[name]) name = "logika";
    $$("nav.tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === name));
    $$(".panel").forEach(p => p.classList.toggle("on", p.id === "tab-" + name));
    showSub(name, sub ?? $("#tab-" + name)._cur);
    if (push) history.replaceState(null, "", "#" + name + "/" + $("#tab-" + name)._cur);
  };
  $$("nav.tabs button").forEach(b => b.onclick = () => { go(b.dataset.tab); window.scrollTo({ top: 0 }); });
  document.addEventListener("click", e => {
    const sb = e.target.closest(".subtabs button, .tolinks");
    if (!sb) return;
    const name = sb.closest(".panel").id.slice(4);
    go(name, sb.dataset.sub || sb.dataset.goto);
    window.scrollTo({ top: 0 });
  });
  const fromHash = () => { const [n, s] = location.hash.slice(1).split("/"); go(n, s, false); };
  fromHash();
  window.addEventListener("hashchange", fromHash);
  // tema
  const root = document.documentElement;
  try { const t = localStorage.getItem("mm-theme"); if (t) root.dataset.theme = t; } catch { }
  $("#theme").onclick = () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("mm-theme", root.dataset.theme); } catch { }
  };
});
