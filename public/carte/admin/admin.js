/* LE CERCLE — Espace admin : commandes en direct, éditeur de carte, réglages */
(function () {
  "use strict";
  const API = window.CercleAPI;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmt = (n) => Number(n).toLocaleString("fr-FR").replace(/[  ]/g, " ");
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const ICON = {
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 10 6 6 6-6"/></svg>',
    del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  };
  const STATUS = { nouvelle: "Nouvelle", preparation: "En préparation", servie: "Servie", payee: "Payée", annulee: "Annulée" };
  const NEXT = { nouvelle: ["preparation", "Lancer la préparation"], preparation: ["servie", "Marquer servie"], servie: ["payee", "Encaisser"], annulee: ["nouvelle", "Rétablir"] };
  let CUR = "F CFA";

  let toastT;
  function toast(m) { const t = $("#aToast"); t.textContent = m; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200); }
  function handle(e) {
    if (e.status === 401) { showLogin("Session expirée. Reconnectez-vous."); return; }
    toast(e.offline ? "Serveur injoignable. Vérifiez la connexion." : e.message);
  }

  /* ---------- Thème ---------- */
  const root = document.documentElement;
  const th = store.get("cercle.theme", null); if (th) root.setAttribute("data-theme", th);
  $("#themeA").addEventListener("click", () => {
    const c = root.getAttribute("data-theme");
    const dark = c ? c === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", dark ? "light" : "dark"); store.set("cercle.theme", dark ? "light" : "dark");
  });

  /* ---------- Connexion ---------- */
  let pollT = null;
  function showLogin(msg) {
    clearInterval(pollT); pollT = null;
    $("#aApp").hidden = true; $("#aLogin").hidden = false;
    const er = $("#loginErr"); er.hidden = !msg; er.textContent = msg || "";
    setTimeout(() => $("#loginPw").focus(), 50);
  }
  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.submitter || $("#loginForm button"); btn.disabled = true;
    try { const r = await API.login($("#loginPw").value); $("#loginPw").value = ""; enter(r); }
    catch (err) { const er = $("#loginErr"); er.hidden = false; er.textContent = err.offline ? "Serveur injoignable." : err.message; }
    btn.disabled = false;
  });
  $("#logoutBtn").addEventListener("click", async () => { try { await API.logout(); } catch (e) {} showLogin(); });
  function enter(me) {
    $("#aLogin").hidden = true; $("#aApp").hidden = false;
    $("#pwWarn").hidden = !me.default_password;
    loadSettings(); loadMenu(); loadOrders(true);
    clearInterval(pollT); pollT = setInterval(() => loadOrders(), 5000);
  }
  $("#goPw").addEventListener("click", () => { selectTab("settings"); $("#pwCur").focus(); });

  /* ---------- Onglets ---------- */
  function selectTab(id) {
    $$(".a-tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === id)));
    ["orders", "menu", "settings"].forEach((x) => { $("#tab-" + x).hidden = x !== id; });
    scrollTo(0, 0);
  }
  $$(".a-tab").forEach((t) => t.addEventListener("click", () => selectTab(t.dataset.tab)));

  /* =====================================================
     COMMANDES
     ===================================================== */
  let scope = "active", seen = null, loading = false;
  let soundOn = store.get("cercle.admin.sound", false), actx = null;
  function beep() {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.22].forEach((t) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.frequency.value = t ? 1046 : 784; o.connect(g); g.connect(actx.destination);
        g.gain.setValueAtTime(0.0001, actx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.25, actx.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + t + 0.2); o.start(actx.currentTime + t); o.stop(actx.currentTime + t + 0.22);
      });
    } catch (e) {}
  }
  function soundLabel() { const b = $("#soundBtn"); b.textContent = soundOn ? "🔔 Son activé" : "🔕 Activer le son"; b.setAttribute("aria-pressed", String(soundOn)); }
  $("#soundBtn").addEventListener("click", () => { soundOn = !soundOn; store.set("cercle.admin.sound", soundOn); soundLabel(); if (soundOn) beep(); });
  soundLabel();

  $("#scopeSeg").addEventListener("click", (e) => {
    const b = e.target.closest("[data-scope]"); if (!b) return;
    scope = b.dataset.scope; $$("#scopeSeg button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    loadOrders();
  });

  async function loadOrders(first) {
    if (loading) return; loading = true;
    try {
      const { orders, stats } = await API.orders(scope);
      const fresh = orders.filter((o) => o.status === "nouvelle" && seen && !seen.has(o.id));
      if (!seen) seen = new Set();
      orders.forEach((o) => seen.add(o.id));
      if (fresh.length && !first) { beep(); toast(fresh.length > 1 ? `${fresh.length} nouvelles commandes` : `Nouvelle commande · Table ${fresh[0].table}`); }
      renderStats(stats); renderOrders(orders);
      const b = $("#newBadge"); b.hidden = !stats.new; b.textContent = stats.new;
      document.title = (stats.new ? `(${stats.new}) ` : "") + "Le Cercle — Admin";
    } catch (e) { if (e.status === 401) handle(e); }
    loading = false;
  }
  function renderStats(s) {
    $("#stats").innerHTML = [
      ["Nouvelles", s.new, s.new ? " hot" : ""], ["En cours", s.active, ""],
      ["Commandes du jour", s.today, ""], ["Chiffre du jour", `${fmt(s.revenue)} <small style="font-size:13px">${esc(CUR)}</small>`, ""],
    ].map(([k, v, c]) => `<div class="a-stat${c}"><div class="k">${k}</div><div class="v">${v}</div></div>`).join("");
  }
  const ago = (t) => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? "à l’instant" : m < 60 ? `il y a ${m} min` : new Date(t).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); };
  function renderOrders(list) {
    const box = $("#orders");
    if (!list.length) { box.innerHTML = `<div class="a-empty" style="grid-column:1/-1">${scope === "active" ? "Aucune commande en cours. Les nouvelles commandes apparaissent ici automatiquement." : "Aucune commande pour cette période."}</div>`; return; }
    box.innerHTML = list.map((o) => {
      const nx = NEXT[o.status];
      return `<article class="a-order st-${o.status}">
        <div class="a-order-head"><div><div class="a-no">N° ${esc(o.no)}</div><div class="a-meta">${new Date(o.at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} · ${ago(o.at)}</div>
          <div class="mt-2"><span class="pill p-${o.status}">${STATUS[o.status]}</span></div></div>
          <div class="a-table"><div class="k">Table</div><div class="v">${esc(o.table)}</div></div></div>
        <div class="a-lines">${o.lines.map((l) => `<div class="a-line"><span class="q">${l.q}×</span><span class="n">${esc(l.n)}${l.l ? `<small>${esc(l.l)}</small>` : ""}</span><span class="p">${fmt(l.v * l.q)}</span></div>`).join("")}</div>
        ${o.note ? `<div class="a-note"><b>Remarque :</b> ${esc(o.note)}</div>` : ""}
        <div class="a-total"><span>Total</span><span>${fmt(o.total)} ${esc(CUR)}</span></div>
        <div class="a-actions">
          ${nx ? `<button type="button" class="${o.status === "nouvelle" ? "a-gold" : "a-primary"}" data-set="${o.id}" data-st="${nx[0]}">${nx[1]}</button>` : ""}
          <select aria-label="Changer le statut de la commande ${esc(o.no)}" data-sel="${o.id}">
            ${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === o.status ? "selected" : ""}>${v}</option>`).join("")}</select>
        </div></article>`;
    }).join("");
  }
  async function setStatus(id, st) {
    try { await API.setStatus(id, st); toast(`Commande : ${STATUS[st].toLowerCase()}`); } catch (e) { handle(e); }
    loadOrders();
  }
  $("#orders").addEventListener("click", (e) => { const b = e.target.closest("[data-set]"); if (b) { b.disabled = true; setStatus(+b.dataset.set, b.dataset.st); } });
  $("#orders").addEventListener("change", (e) => { const s = e.target.closest("[data-sel]"); if (s) setStatus(+s.dataset.sel, s.value); });

  /* =====================================================
     RÉGLAGES
     ===================================================== */
  async function loadSettings() {
    try {
      const { settings: s } = await API.settings();
      CUR = s.devise || "F CFA";
      $("#sNom").value = s.nom || ""; $("#sDev").value = s.devise || ""; $("#sWa").value = s.whatsapp || "";
      $("#sOpen").checked = !!s.commandes_ouvertes; $("#openSw").checked = !!s.commandes_ouvertes;
      $("#openLbl").textContent = s.commandes_ouvertes ? "Commandes ouvertes" : "Commandes fermées";
      $("#aName").textContent = s.nom || "Le Cercle";
    } catch (e) { handle(e); }
  }
  async function setOpen(v) {
    try { await API.saveSettings({ commandes_ouvertes: v }); toast(v ? "Les clients peuvent commander" : "Commandes par téléphone fermées"); } catch (e) { handle(e); }
    loadSettings();
  }
  $("#openSw").addEventListener("change", (e) => setOpen(e.target.checked));
  $("#setForm").addEventListener("submit", async (e) => {
    e.preventDefault(); const m = $("#setMsg");
    try {
      await API.saveSettings({ nom: $("#sNom").value, devise: $("#sDev").value, whatsapp: $("#sWa").value, commandes_ouvertes: $("#sOpen").checked });
      m.className = "a-msg ok"; m.textContent = "Réglages enregistrés."; loadSettings();
    } catch (err) { m.className = "a-msg err"; m.textContent = err.message; if (err.status === 401) handle(err); }
    m.hidden = false;
  });
  $("#pwForm").addEventListener("submit", async (e) => {
    e.preventDefault(); const m = $("#pwMsg"); m.hidden = false;
    if ($("#pwNew").value !== $("#pwNew2").value) { m.className = "a-msg err"; m.textContent = "Les deux nouveaux mots de passe ne correspondent pas."; return; }
    try {
      await API.password($("#pwCur").value, $("#pwNew").value);
      m.className = "a-msg ok"; m.textContent = "Mot de passe changé."; $("#pwWarn").hidden = true; e.target.reset();
    } catch (err) { m.className = "a-msg err"; m.textContent = err.message; }
  });

  /* QR codes */
  try { $("#qrBase").value = API.demo ? "https://votre-site.com/carte/" : new URL("../", location.href).href; } catch (e) {}
  $("#qrPrint").addEventListener("click", () => window.print());
  $("#qrGen").addEventListener("click", () => {
    const base = $("#qrBase").value.trim(), a = Math.max(1, +$("#qrFrom").value || 1), b = Math.min(a + 99, Math.max(a, +$("#qrTo").value || a));
    if (!base || typeof qrcode !== "function") { $("#qrGrid").innerHTML = `<p class="a-msg err">Indiquez l’adresse de la carte.</p>`; return; }
    let html = "";
    for (let t = a; t <= b; t++) {
      const url = base + (base.includes("?") ? "&" : "?") + "table=" + t;
      const q = qrcode(0, "M"); q.addData(url); q.make();
      html += `<div class="qr-card">${q.createSvgTag({ cellSize: 4, margin: 2, scalable: true })}<b>Table ${t}</b><small>${esc(url)}</small></div>`;
    }
    $("#qrGrid").innerHTML = html;
    $("#qrPrint").hidden = !!API.demo;
  });

  /* Sauvegarde */
  if (API.demo) $("#dataPanel").hidden = true;
  $("#expBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(MENU, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `carte-le-cercle-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove();
  });
  $("#impFile").addEventListener("change", (e) => {
    const f = e.target.files[0]; if (!f) return; const m = $("#dataMsg"); m.hidden = false;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!Array.isArray(data) || !data.every((u) => u.id && Array.isArray(u.groups))) throw new Error();
        confirmDel("La carte actuelle sera remplacée par ce fichier.", () => { MENU = data; uni = MENU[0] && MENU[0].id; renderMenu(); persist(); m.className = "a-msg ok"; m.textContent = "Carte importée."; }, "Remplacer");
      } catch (err) { m.className = "a-msg err"; m.textContent = "Ce fichier n’est pas une sauvegarde de carte valide."; }
      e.target.value = "";
    };
    r.readAsText(f);
  });

  /* =====================================================
     CARTE
     ===================================================== */
  let MENU = [], VERSION = null, uni = null, find = "";
  async function loadMenu() {
    try { const d = await API.menu(); MENU = d.menu; VERSION = d.version; if (!MENU.some((u) => u.id === uni)) uni = MENU[0] && MENU[0].id; renderMenu(); setSave("ok"); }
    catch (e) { handle(e); }
  }
  function setSave(state, msg) {
    const s = $("#saveState");
    s.className = "a-save" + (state === "busy" ? " busy" : state === "err" ? " err" : "");
    s.innerHTML = state === "busy" ? "Enregistrement…" : state === "err" ? `${esc(msg)} <button type="button" class="a-ghost ms-2" id="retrySave">Réessayer</button>`
      : `Publié sur la carte · ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  }
  let saveT = null, saving = false, again = false;
  function persist() { setSave("busy"); clearTimeout(saveT); saveT = setTimeout(doSave, 500); }
  async function doSave() {
    if (saving) { again = true; return; }
    saving = true;
    try { const r = await API.saveMenu(MENU, VERSION); VERSION = r.version; setSave("ok"); }
    catch (e) {
      if (e.status === 409) { toast(e.message); loadMenu(); }
      else if (e.status === 401) handle(e);
      else setSave("err", e.offline ? "Non enregistré (pas de connexion)." : e.message);
    }
    saving = false; if (again) { again = false; doSave(); }
  }
  document.addEventListener("click", (e) => { if (e.target.closest("#retrySave")) persist(); });
  addEventListener("beforeunload", (e) => { if (saving || saveT && $("#saveState").classList.contains("busy")) { e.preventDefault(); e.returnValue = ""; } });

  const U = () => MENU.find((u) => u.id === uni);
  const priceTxt = (it) => it.o.map(([l, v]) => `${l ? `<small>${esc(l)}</small> ` : ""}${fmt(v)}`).join("<br>");
  const tools = (kind, attrs, first, last) => `<div class="a-tools">
    <button type="button" class="a-ico" data-act="edit-${kind}" ${attrs} aria-label="Modifier">${ICON.edit}</button>
    <button type="button" class="a-ico" data-act="up-${kind}" ${attrs} aria-label="Monter" ${first ? "disabled" : ""}>${ICON.up}</button>
    <button type="button" class="a-ico" data-act="down-${kind}" ${attrs} aria-label="Descendre" ${last ? "disabled" : ""}>${ICON.down}</button>
    <button type="button" class="a-ico del" data-act="del-${kind}" ${attrs} aria-label="Supprimer">${ICON.del}</button></div>`;
  function itemRow(it, ui, gi, ci, ii, n, hit) {
    const a = `data-u="${ui}" data-g="${gi}" data-c="${ci}" data-i="${ii}"`;
    return `<div class="a-item${it.x ? " off" : ""}${hit ? " hit" : ""}">
      <div style="min-width:0"><div class="n">${esc(it.n)}</div>${it.d ? `<div class="d">${esc(it.d)}</div>` : ""}</div>
      <div class="pr">${priceTxt(it)}</div>
      <div class="d-flex align-items-center gap-1 a-tools-wrap">
        <label class="a-switch form-switch"><input class="form-check-input" type="checkbox" role="switch" data-avail ${a} ${it.x ? "" : "checked"} aria-label="Disponible : ${esc(it.n)}"> <span>${it.x ? "Épuisé" : "Dispo"}</span></label>
        ${tools("item", a, ii === 0, ii === n - 1)}</div></div>`;
  }
  function renderMenu() {
    const ui = MENU.findIndex((u) => u.id === uni);
    $("#unis").innerHTML = MENU.map((u) => `<button type="button" class="a-uni" data-uni="${esc(u.id)}" aria-pressed="${u.id === uni}">${esc(u.label)}</button>`).join("") +
      `<button type="button" class="a-ico" data-act="edit-uni" aria-label="Renommer cet univers">${ICON.edit}</button>
       <button type="button" class="a-ghost" data-act="add-uni">+ Univers</button>
       <input class="a-find" id="findIn" type="search" placeholder="Trouver un article…" value="${esc(find)}" aria-label="Trouver un article">`;
    $("#findIn").addEventListener("input", (e) => { find = e.target.value; renderGroups(); });
    renderGroups(ui);
  }
  function renderGroups() {
    const box = $("#groups");
    if (find.trim()) {
      const terms = norm(find).split(/\s+/).filter(Boolean); const rows = [];
      MENU.forEach((u, ui) => u.groups.forEach((g, gi) => g.cats.forEach((c, ci) => c.items.forEach((it, ii) => {
        if (terms.every((t) => norm(`${it.n} ${it.d} ${c.t} ${g.title}`).includes(t))) rows.push(`<div class="a-meta" style="padding-top:8px">${esc(u.label)} › ${esc(g.title)} › ${esc(c.t)}</div>` + itemRow(it, ui, gi, ci, ii, c.items.length));
      }))));
      box.innerHTML = `<div class="a-group"><div class="a-cat">${rows.join("") || '<p class="a-empty" style="margin:12px 0">Aucun article trouvé.</p>'}</div></div>`;
      return;
    }
    const ui = MENU.findIndex((u) => u.id === uni), u = MENU[ui];
    if (!u) { box.innerHTML = `<div class="a-empty">Aucun univers. Ajoutez-en un.</div>`; return; }
    box.innerHTML = u.groups.map((g, gi) => `<section class="a-group">
      <div class="a-group-head"><div class="t"><h3>${esc(g.title)}</h3>${g.sub ? `<p>${esc(g.sub)}</p>` : ""}</div>
        ${tools("group", `data-u="${ui}" data-g="${gi}"`, gi === 0, gi === u.groups.length - 1)}</div>
      ${g.cats.map((c, ci) => `<div class="a-cat">
        <div class="a-cat-head"><b>${esc(c.t)}</b>${tools("cat", `data-u="${ui}" data-g="${gi}" data-c="${ci}"`, ci === 0, ci === g.cats.length - 1)}</div>
        ${c.items.map((it, ii) => itemRow(it, ui, gi, ci, ii, c.items.length)).join("")}
        <button type="button" class="a-add" data-act="add-item" data-u="${ui}" data-g="${gi}" data-c="${ci}">+ Ajouter un article dans « ${esc(c.t)} »</button></div>`).join("")}
      <div class="a-cat"><button type="button" class="a-add" data-act="add-cat" data-u="${ui}" data-g="${gi}">+ Nouvelle catégorie dans « ${esc(g.title)} »</button></div>
    </section>`).join("") + `<button type="button" class="a-add" data-act="add-group" data-u="${ui}" style="padding:14px">+ Nouvelle rubrique dans « ${esc(u.label)} »</button>
      ${u.groups.length ? "" : `<button type="button" class="a-danger mt-3" data-act="del-uni" data-u="${ui}">Supprimer l’univers « ${esc(u.label)} »</button>`}`;
  }
  $("#unis").addEventListener("click", (e) => { const b = e.target.closest("[data-uni]"); if (b) { uni = b.dataset.uni; find = ""; renderMenu(); } });

  const swap = (arr, i, j) => { if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; };
  document.addEventListener("change", (e) => {
    const s = e.target.closest("[data-avail]"); if (!s) return;
    const it = MENU[+s.dataset.u].groups[+s.dataset.g].cats[+s.dataset.c].items[+s.dataset.i];
    it.x = !s.checked; renderGroups(); persist(); toast(it.x ? `« ${it.n} » marqué épuisé` : `« ${it.n} » de nouveau disponible`);
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b || !$("#tab-menu").contains(b)) return;
    const d = b.dataset, u = MENU[+d.u], g = u && u.groups[+d.g], c = g && g.cats[+d.c];
    const done = () => { renderGroups(); persist(); };
    switch (d.act) {
      case "up-item": swap(c.items, +d.i, +d.i - 1); done(); break;
      case "down-item": swap(c.items, +d.i, +d.i + 1); done(); break;
      case "up-cat": swap(g.cats, +d.c, +d.c - 1); done(); break;
      case "down-cat": swap(g.cats, +d.c, +d.c + 1); done(); break;
      case "up-group": swap(u.groups, +d.g, +d.g - 1); done(); break;
      case "down-group": swap(u.groups, +d.g, +d.g + 1); done(); break;
      case "edit-item": openItem(+d.u, +d.g, +d.c, +d.i); break;
      case "add-item": openItem(+d.u, +d.g, +d.c, -1); break;
      case "del-item": { const it = c.items[+d.i]; confirmDel(`Supprimer « ${it.n} » de la carte ?`, () => { c.items.splice(+d.i, 1); done(); }); break; }
      case "edit-cat": openText({ title: "Catégorie", a: ["Nom de la catégorie", c.t] }, (a) => { c.t = a; done(); }); break;
      case "add-cat": openText({ title: "Nouvelle catégorie", a: ["Nom de la catégorie", ""] }, (a) => { g.cats.push({ id: uid("c"), t: a, items: [] }); done(); }); break;
      case "del-cat": confirmDel(`Supprimer la catégorie « ${c.t} »${c.items.length ? ` et ses ${c.items.length} article(s)` : ""} ?`, () => { g.cats.splice(+d.c, 1); done(); }); break;
      case "edit-group": openText({ title: "Rubrique", a: ["Titre", g.title], b: ["Sous-titre (facultatif)", g.sub] }, (a, s) => { g.title = a; g.sub = s; done(); }); break;
      case "add-group": openText({ title: "Nouvelle rubrique", a: ["Titre (ex. Les Brunchs)", ""], b: ["Sous-titre (facultatif)", ""] }, (a, s) => {
        u.groups.push({ id: uid("g"), title: a, sub: s, cats: [{ id: uid("c"), t: "Sélection", items: [] }] }); done(); }); break;
      case "del-group": confirmDel(`Supprimer la rubrique « ${g.title} » et tout son contenu ?`, () => { u.groups.splice(+d.g, 1); done(); }); break;
      case "edit-uni": { const cu = U(); if (cu) openText({ title: "Univers", a: ["Nom de l’onglet (court)", cu.label] }, (a) => { cu.label = a; renderMenu(); persist(); }); break; }
      case "add-uni": openText({ title: "Nouvel univers", a: ["Nom de l’onglet (ex. Brunch)", ""] }, (a) => {
        const id = norm(a).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || uid("u");
        MENU.push({ id: MENU.some((x) => x.id === id) ? uid("u") : id, label: a, groups: [] }); uni = MENU[MENU.length - 1].id; renderMenu(); persist(); }); break;
      case "del-uni": confirmDel(`Supprimer l’univers « ${u.label} » ?`, () => { MENU.splice(+d.u, 1); uni = MENU[0] && MENU[0].id; renderMenu(); persist(); }); break;
    }
  });

  /* ---------- Modale article ---------- */
  const itemModal = new bootstrap.Modal($("#itemModal"));
  let editing = null;
  function optRow(l, v) {
    return `<div class="opt-row"><input placeholder="Libellé (ex. Verre)" value="${esc(l || "")}" aria-label="Libellé du prix" maxlength="20">
      <input type="number" min="0" step="500" inputmode="numeric" placeholder="Prix" value="${v ?? ""}" aria-label="Prix">
      <button type="button" class="a-ico del" data-rmopt aria-label="Retirer ce prix">${ICON.del}</button></div>`;
  }
  function openItem(ui, gi, ci, ii) {
    const u = MENU[ui], it = ii >= 0 ? u.groups[gi].cats[ci].items[ii] : { n: "", d: "", o: [[null, ""]], t: [], x: false };
    editing = { ui, gi, ci, ii };
    $("#itemTitle").textContent = ii >= 0 ? "Modifier l’article" : "Nouvel article";
    $("#iName").value = it.n; $("#iDesc").value = it.d || "";
    $("#iOpts").innerHTML = it.o.map(([l, v]) => optRow(l, v)).join("");
    $("#iCat").innerHTML = u.groups.map((g, g2) => g.cats.map((c, c2) => `<option value="${g2}|${c2}" ${g2 === gi && c2 === ci ? "selected" : ""}>${esc(g.title)} › ${esc(c.t)}</option>`).join("")).join("");
    $("#iVeg").checked = (it.t || []).includes("veg"); $("#iSig").checked = (it.t || []).includes("sig"); $("#iVerre").checked = (it.t || []).includes("verre");
    $("#iAvail").checked = !it.x; $("#iErr").hidden = true;
    itemModal.show();
  }
  $("#itemModal").addEventListener("shown.bs.modal", () => $("#iName").focus());
  $("#iAddOpt").addEventListener("click", () => $("#iOpts").insertAdjacentHTML("beforeend", optRow("", "")));
  $("#iOpts").addEventListener("click", (e) => { const b = e.target.closest("[data-rmopt]"); if (b && $$("#iOpts .opt-row").length > 1) b.closest(".opt-row").remove(); });
  $("#itemForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const err = (m) => { const x = $("#iErr"); x.textContent = m; x.hidden = false; };
    const n = $("#iName").value.trim(); if (!n) return err("Indiquez le nom de l’article.");
    const o = $$("#iOpts .opt-row").map((r) => { const [l, v] = r.querySelectorAll("input"); return [l.value.trim() || null, v.value === "" ? NaN : Math.round(+v.value)]; });
    if (o.some(([, v]) => !(v >= 0))) return err("Chaque prix doit être un nombre (0 ou plus).");
    if (o.length > 1 && o.some(([l]) => !l)) return err("Avec plusieurs prix, donnez un libellé à chacun (ex. Verre, Bouteille).");
    const t = [["iVeg", "veg"], ["iSig", "sig"], ["iVerre", "verre"]].filter(([id]) => $("#" + id).checked).map(([, v]) => v);
    const { ui, gi, ci, ii } = editing, u = MENU[ui];
    const [ng, nc] = $("#iCat").value.split("|").map(Number);
    const old = ii >= 0 ? u.groups[gi].cats[ci].items[ii] : null;
    const item = { id: old ? old.id : uid("i"), n, d: $("#iDesc").value.trim(), o, t, x: !$("#iAvail").checked };
    if (old && ng === gi && nc === ci) u.groups[gi].cats[ci].items[ii] = item;
    else { if (old) u.groups[gi].cats[ci].items.splice(ii, 1); u.groups[ng].cats[nc].items.push(item); }
    itemModal.hide(); renderGroups(); persist(); toast(old ? "Article modifié" : "Article ajouté");
  });

  /* ---------- Modale texte & confirmation ---------- */
  const textModal = new bootstrap.Modal($("#textModal"));
  let textCb = null;
  function openText(cfg, cb) {
    textCb = cb; $("#textTitle").textContent = cfg.title;
    $("#tALbl").textContent = cfg.a[0]; $("#tA").value = cfg.a[1] || "";
    $("#tBWrap").hidden = !cfg.b; if (cfg.b) { $("#tBLbl").textContent = cfg.b[0]; $("#tB").value = cfg.b[1] || ""; }
    $("#tErr").hidden = true; textModal.show();
  }
  $("#textModal").addEventListener("shown.bs.modal", () => $("#tA").focus());
  $("#textForm").addEventListener("submit", (e) => {
    e.preventDefault(); const a = $("#tA").value.trim();
    if (!a) { $("#tErr").textContent = "Ce champ est obligatoire."; $("#tErr").hidden = false; return; }
    textModal.hide(); textCb && textCb(a, $("#tB").value.trim());
  });
  const cfModal = new bootstrap.Modal($("#confirmModal"));
  let cfCb = null;
  function confirmDel(text, cb, label) { cfCb = cb; $("#cfText").textContent = text; $("#cfOk").textContent = label || "Supprimer"; cfModal.show(); }
  $("#cfOk").addEventListener("click", () => { cfModal.hide(); cfCb && cfCb(); });

  /* ---------- Démarrage ---------- */
  (async function boot() {
    try { const me = await API.me(); me.admin ? enter(me) : showLogin(); }
    catch (e) { showLogin(e.offline ? "Serveur injoignable." : e.message); }
  })();
})();
