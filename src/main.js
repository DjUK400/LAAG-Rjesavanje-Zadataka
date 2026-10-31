// ===================== POKRETANJE =====================
"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const renders = { logika: logikaRender, skupovi: skupoviRender, relacije: relacijeRender, funkcije: funkcijeRender, indukcija: indukcijaRender };
  for (const [k, fn] of Object.entries(renders)) {
    try { fn(); } catch (e) { console.error(e); $("#tab-" + k).innerHTML = `<div class="card bad">Greška pri učitavanju taba: ${esc(e.message)}</div>`; }
  }
  const show = (name) => {
    if (!renders[name]) name = "logika";
    $$("nav.tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === name));
    $$(".panel").forEach(p => p.classList.toggle("on", p.id === "tab-" + name));
  };
  $$("nav.tabs button").forEach(b => b.onclick = () => { show(b.dataset.tab); history.replaceState(null, "", "#" + b.dataset.tab); window.scrollTo({ top: 0 }); });
  show(location.hash.slice(1));
  window.addEventListener("hashchange", () => show(location.hash.slice(1)));
  // tema
  const root = document.documentElement;
  try { const t = localStorage.getItem("mm-theme"); if (t) root.dataset.theme = t; } catch { }
  $("#theme").onclick = () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("mm-theme", root.dataset.theme); } catch { }
  };
});
