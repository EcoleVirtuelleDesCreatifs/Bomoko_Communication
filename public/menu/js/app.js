/* LE CERCLE — Carte digitale mobile (client)
   Carte chargée depuis le serveur (avec copie locale pour le hors-ligne),
   panier, récapitulatif, envoi de commande (file d'attente hors-ligne), suivi du statut. */
(function () {
  "use strict";
  const API = window.CercleAPI;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmt = (n) => Number(n).toLocaleString("fr-FR").replace(/[  ]/g, " ");
  const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ICON_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  const STATUS = {
    envoi: ["Envoi…", "wait"], attente: ["En attente de réseau", "wait"],
    nouvelle: ["Reçue par le restaurant", "new"], preparation: ["En préparation", "prep"],
    servie: ["Servie", "done"], payee: ["Réglée", "done"], annulee: ["Annulée", "off"],
  };
  const ACTIVE = ["envoi", "attente", "nouvelle", "preparation", "servie"];

  /* ---------- Stockage local ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  let MENU = [], SET = { devise: "F CFA", commandes_ouvertes: true }, VERSION = null;
  let INDEX = {}, FLAT = [];
  let cart = store.get("cercle.cart", {});
  let orders = store.get("cercle.orders", []);
  let draft = store.get("cercle.draft", { table: "", note: "" });
  const params = new URLSearchParams(location.search);
  if (params.get("table")) { draft.table = params.get("table").slice(0, 6); store.set("cercle.draft", draft); }
  const CUR = () => SET.devise || "F CFA";
  const saveCart = () => store.set("cercle.cart", cart);
  const saveDraft = () => store.set("cercle.draft", draft);
  const saveOrders = () => store.set("cercle.orders", orders.slice(0, 15));

  /* ---------- Thème & réseau ---------- */
  const root = document.documentElement;
  const t0 = store.get("cercle.theme", null);
  if (t0) root.setAttribute("data-theme", t0);
  $("#themeBtn").addEventListener("click", () => {
    const cur = root.getAttribute("data-theme");
    const dark = cur ? cur === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", dark ? "light" : "dark"); store.set("cercle.theme", dark ? "light" : "dark");
  });
  function netState() { const on = navigator.onLine !== false; const n = $("#net"); if (!n) return; n.textContent = on ? "En ligne" : "Hors ligne"; n.classList.toggle("off", !on); }
  addEventListener("online", () => { netState(); flushQueue(); refreshMenu(); });
  addEventListener("offline", netState); netState();

  /* ---------- Chargement de la carte ---------- */
  function useMenu(data) {
    MENU = data.menu || []; SET = Object.assign({ devise: "F CFA", commandes_ouvertes: true }, data.settings || {}); VERSION = data.version;
    INDEX = {}; FLAT = [];
    MENU.forEach((u) => u.groups.forEach((g) => g.cats.forEach((c) => c.items.forEach((it) => {
      it.where = g.title; it.key = norm(`${it.n} ${it.d} ${c.t} ${g.title} ${u.label}`);
      INDEX[it.id] = it; FLAT.push(it);
    }))));
    let removed = 0;
    Object.keys(cart).forEach((k) => { const [id, oi] = k.split("|"); const it = INDEX[id]; if (!it || it.x || !it.o[+oi]) { delete cart[k]; removed++; } });
    if (removed) { saveCart(); toast(removed > 1 ? `${removed} articles épuisés retirés` : "Un article épuisé a été retiré"); }
    if (SET.nom && $("#brandName")) $("#brandName").textContent = SET.nom.replace(/\s+Abidjan$/i, "");
  }
  async function refreshMenu() {
    try {
      const data = await API.menu();
      if (data.version !== VERSION) {
        const first = !MENU.length;
        store.set("cercle.menu", data); useMenu(data);
        renderTabs(); renderUniverse(current || startUniverse(), !first);
        updateBar();
      } else { SET = Object.assign(SET, data.settings || {}); }
    } catch (e) {
      if (!MENU.length) $("#content").innerHTML = `<p class="empty">La carte n’a pas pu être chargée.<br>Vérifiez votre connexion (données ou Wi-Fi du restaurant).</p>
        <p class="text-center"><button type="button" class="add" id="retryMenu">Réessayer</button></p>`;
    }
  }
  document.addEventListener("click", (e) => { if (e.target.closest("#retryMenu")) { $("#content").innerHTML = `<p class="empty">Chargement…</p>`; refreshMenu(); } });

  /* ---------- Rendu des articles ---------- */
  function control(key, label, soldout) {
    if (soldout) return `<span class="soldout-tag">Épuisé</span>`;
    const q = cart[key] || 0;
    if (!q) return `<button type="button" class="add" data-inc="${key}" aria-label="Ajouter ${esc(label)}">${ICON_PLUS}Ajouter</button>`;
    return `<div class="stepper" role="group" aria-label="Quantité ${esc(label)}">
      <button type="button" data-dec="${key}" aria-label="Retirer un">−</button><span class="qty">${q}</span>
      <button type="button" data-inc="${key}" aria-label="Ajouter un">+</button></div>`;
  }
  function optsHTML(it) {
    return it.o.map(([lbl, v], oi) => `<div class="opt">
      <span class="opt-price">${lbl ? `<span class="lbl">${esc(lbl)}</span>` : ""}${fmt(v)}<span class="cur">${CUR()}</span></span>
      ${control(`${it.id}|${oi}`, it.n + (lbl ? " " + lbl : ""), it.x)}</div>`).join("");
  }
  const inCart = (it) => it.o.some((_, oi) => cart[`${it.id}|${oi}`]);
  function itemHTML(it, showWhere) {
    const tags = (it.t || []).filter((t) => t === "veg" || t === "sig").map((t) =>
      t === "veg" ? '<span class="tag tag-veg">Végétarien</span>' : '<span class="tag tag-sig">Signature</span>').join("");
    return `<article class="item${inCart(it) ? " in" : ""}${it.x ? " soldout" : ""}" data-item="${it.id}">
      <h4 class="item-name">${esc(it.n)}</h4>
      ${showWhere ? `<div class="item-where">${esc(it.where)}</div>` : ""}
      ${it.d ? `<p class="item-desc">${esc(it.d)}</p>` : ""}
      ${tags ? `<div class="item-tags">${tags}</div>` : ""}
      <div class="opts">${optsHTML(it)}</div></article>`;
  }
  function refreshItem(id) {
    const it = INDEX[id]; if (!it) return;
    $$(`[data-item="${id}"]`).forEach((el) => { el.querySelector(".opts").innerHTML = optsHTML(it); el.classList.toggle("in", inCart(it)); });
  }

  /* ---------- Univers & rubriques ---------- */
  let current = null, observer = null;
  const shortTitle = (t) => t.replace(/^(Les|Le|La) /, "");
  const startUniverse = () => { const h = location.hash.slice(1); return MENU.some((u) => u.id === h) ? h : (MENU[0] && MENU[0].id); };
  function renderTabs() {
    const box = $("#universes");
    box.style.gridTemplateColumns = `repeat(${MENU.length || 1}, 1fr)`;
    box.innerHTML = MENU.map((u) => `<button type="button" class="universe" role="tab" data-u="${esc(u.id)}" aria-selected="false">${esc(u.label)}</button>`).join("");
  }
  $("#universes").addEventListener("click", (e) => {
    const b = e.target.closest(".universe"); if (!b || b.dataset.u === current) return;
    try { history.replaceState(null, "", location.pathname + location.search + "#" + b.dataset.u); } catch (err) {}
    renderUniverse(b.dataset.u);
  });
  function renderUniverse(id, keepScroll) {
    const u = MENU.find((x) => x.id === id) || MENU[0]; if (!u) return;
    current = u.id;
    $$(".universe").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.u === u.id)));
    const groups = u.groups.filter((g) => g.cats.some((c) => c.items.length));
    $("#chips").innerHTML = groups.map((g, i) => `<button type="button" class="chip${i ? "" : " active"}" data-g="${esc(g.id)}">${esc(shortTitle(g.title))}</button>`).join("");
    $("#content").innerHTML = groups.map((g) => `
      <section class="group fade-in" id="g-${esc(g.id)}">
        <h2 class="group-title">${esc(g.title)}</h2>
        ${g.sub ? `<p class="group-sub">${esc(g.sub)}</p>` : ""}
        ${g.cats.filter((c) => c.items.length).map((c) => `<div class="cat">${g.cats.length > 1 || c.t !== g.sub ? `<h3 class="cat-title">${esc(c.t)}</h3>` : ""}
          ${c.items.map((it) => itemHTML(it)).join("")}</div>`).join("")}
      </section>`).join("") || `<p class="empty">Cette carte est vide pour le moment.</p>`;
    if (!keepScroll) { const top = $(".sticky-nav").offsetTop; if (scrollY > top) scrollTo(0, top); $("#chips").scrollLeft = 0; }
    setupSpy();
  }
  const headH = () => $(".sticky-nav").getBoundingClientRect().height;
  function setupSpy() {
    if (observer) observer.disconnect();
    const h = headH(); root.style.setProperty("--head-h", h + "px");
    if (!("IntersectionObserver" in window)) return;
    observer = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) activateChip(e.target.id.slice(2)); }),
      { rootMargin: `-${Math.round(h + 8)}px 0px -65% 0px` });
    $$(".group").forEach((s) => observer.observe(s));
  }
  function activateChip(gid) {
    $$("#chips .chip").forEach((c) => {
      const on = c.dataset.g === gid; c.classList.toggle("active", on);
      if (on) { const bar = $("#chips"); bar.scrollTo({ left: c.offsetLeft - bar.clientWidth / 2 + c.clientWidth / 2, behavior: "smooth" }); }
    });
  }
  $("#chips").addEventListener("click", (e) => {
    const c = e.target.closest(".chip"); if (!c) return;
    const s = document.getElementById("g-" + c.dataset.g); if (!s) return;
    scrollTo({ top: s.getBoundingClientRect().top + scrollY - headH() + 2, behavior: "smooth" });
    activateChip(c.dataset.g);
  });
  addEventListener("hashchange", () => { const h = location.hash.slice(1); if (h !== current && MENU.some((u) => u.id === h)) renderUniverse(h); });
  addEventListener("scroll", () => $(".sticky-nav").classList.toggle("scrolled", scrollY > 60), { passive: true });
  addEventListener("resize", setupSpy);

  /* ---------- Panier ---------- */
  function totals() {
    let n = 0, sum = 0;
    for (const [k, q] of Object.entries(cart)) { const [id, oi] = k.split("|"); const it = INDEX[id]; if (!it) continue; n += q; sum += it.o[+oi][1] * q; }
    return { n, sum };
  }
  function updateBar(bump) {
    const { n, sum } = totals(), bar = $("#cartBar");
    const live = orders.filter((o) => ACTIVE.includes(o.status) && Date.now() - o.at < 6 * 3600e3).length;
    bar.hidden = n === 0 && live === 0;
    $("#cartCount").textContent = n || "✓";
    $("#cartLabel").textContent = n ? "Voir ma commande" : "Suivre ma commande";
    $("#cartTotal").textContent = n ? `${fmt(sum)} ${CUR()}` : "";
    if (bump && n) { bar.classList.remove("bump"); void bar.offsetWidth; bar.classList.add("bump"); }
  }
  function setQty(key, q) {
    if (q <= 0) delete cart[key]; else cart[key] = Math.min(q, 99);
    saveCart(); refreshItem(key.split("|")[0]); updateBar(true);
    if (sheetOpen && view === "cart") renderCart();
  }
  let toastT;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1500); }
  document.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
    if (inc) {
      const k = inc.dataset.inc, was = cart[k] || 0; setQty(k, was + 1);
      if (!was && !sheetOpen && INDEX[k.split("|")[0]]) toast(`${INDEX[k.split("|")[0]].n} ajouté`);
      try { navigator.vibrate && navigator.vibrate(8); } catch (err) {}
    } else if (dec) setQty(dec.dataset.dec, (cart[dec.dataset.dec] || 0) - 1);
  });

  /* ---------- Feuille : récapitulatif → validation → suivi ---------- */
  const sheetEl = $("#orderSheet");
  const sheet = new bootstrap.Offcanvas(sheetEl);
  let sheetOpen = false, view = "cart", shown = null;
  sheetEl.addEventListener("show.bs.offcanvas", () => { sheetOpen = true; });
  sheetEl.addEventListener("hidden.bs.offcanvas", () => { sheetOpen = false; });
  $("#cartOpen").addEventListener("click", () => {
    if (!Object.keys(cart).length) { const last = orders.find((o) => ACTIVE.includes(o.status)); if (last) { showTicket(last); sheet.show(); return; } }
    view = "cart"; renderCart(); sheet.show();
  });
  const pill = (st) => { const [t, c] = STATUS[st] || [st, "new"]; return `<span class="status-pill s-${c}">${t}</span>`; };

  function renderCart() {
    view = "cart";
    $("#orderTitle").textContent = "Récapitulatif";
    const keys = Object.keys(cart), body = $("#orderBody"), foot = $("#orderFoot");
    if (!keys.length) {
      body.innerHTML = `<p class="empty">Votre commande est vide.<br>Touchez « Ajouter » sur un plat ou une boisson.</p>${historyHTML()}`;
      foot.innerHTML = `<button type="button" class="btn-sec" data-bs-dismiss="offcanvas">Retour à la carte</button>`;
      return;
    }
    const { n, sum } = totals();
    body.innerHTML = keys.map((k) => {
      const [id, oi] = k.split("|"), it = INDEX[id]; if (!it) return "";
      const [lbl, v] = it.o[+oi], q = cart[k];
      return `<div class="line"><div><div class="nm">${esc(it.n)}</div>
        <div class="op">${lbl ? esc(lbl) + " · " : ""}${fmt(v)} ${CUR()}</div></div>
        <div class="sub">${fmt(v * q)}</div><div></div>
        <div class="stepper light" role="group" aria-label="Quantité ${esc(it.n)}">
          <button type="button" data-dec="${k}" aria-label="Retirer un">−</button><span class="qty">${q}</span>
          <button type="button" data-inc="${k}" aria-label="Ajouter un">+</button></div></div>`;
    }).join("") + `
      <div class="field" id="fTable"><label for="tableIn">Numéro de table</label>
        <input id="tableIn" inputmode="numeric" maxlength="6" placeholder="Ex. 12" value="${esc(draft.table)}" autocomplete="off">
        <p class="err" id="tableErr" hidden>Indiquez votre numéro de table pour valider.</p></div>
      <div class="field"><label for="noteIn">Remarques (facultatif)</label>
        <textarea id="noteIn" maxlength="300" placeholder="Cuisson, allergie, sans piment…">${esc(draft.note)}</textarea></div>
      <button type="button" class="link-btn" id="clearCart">Vider la commande</button>`;
    const closed = SET.commandes_ouvertes === false;
    foot.innerHTML = `<p class="send-err" id="sendErr" ${closed ? "" : "hidden"}>${closed ? "Les commandes par téléphone sont fermées pour le moment. Appelez un serveur." : ""}</p>
      <div class="sum"><span class="k">${n} article${n > 1 ? "s" : ""}</span><span class="v">${fmt(sum)} ${CUR()}</span></div>
      <button type="button" class="btn-main" id="validate" ${closed ? "disabled" : ""}>Valider et envoyer</button>`;
    $("#tableIn").addEventListener("input", (e) => { draft.table = e.target.value.trim(); saveDraft(); $("#fTable").classList.remove("invalid"); $("#tableErr").hidden = true; });
    $("#noteIn").addEventListener("input", (e) => { draft.note = e.target.value; saveDraft(); });
    const clr = $("#clearCart");
    clr.addEventListener("click", () => {
      if (!clr.dataset.armed) { clr.dataset.armed = "1"; clr.textContent = "Touchez encore pour confirmer"; setTimeout(() => { if (clr.isConnected) { delete clr.dataset.armed; clr.textContent = "Vider la commande"; } }, 3000); return; }
      const ids = Object.keys(cart).map((k) => k.split("|")[0]); cart = {}; saveCart(); ids.forEach(refreshItem); updateBar(); renderCart();
    });
    $("#validate").addEventListener("click", validate);
  }

  const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, "0")).join("");
  async function validate() {
    if (!draft.table) {
      $("#fTable").classList.add("invalid"); $("#tableErr").hidden = false;
      $("#tableIn").focus(); $("#tableIn").scrollIntoView({ block: "center", behavior: "smooth" }); return;
    }
    const btn = $("#validate"); btn.disabled = true; btn.textContent = "Envoi en cours…";
    const lines = Object.entries(cart).map(([k, q]) => { const [id, oi] = k.split("|"); const it = INDEX[id]; const [l, v] = it.o[+oi]; return { id, o: +oi, q, n: it.n, l, v }; });
    const local = { ref: rid(), no: null, table: draft.table, note: draft.note.trim(), lines, total: lines.reduce((s, l) => s + l.v * l.q, 0), status: "envoi", at: Date.now() };
    try {
      const { order } = await API.placeOrder(payload(local));
      Object.assign(local, { no: order.no, status: order.status, total: order.total, lines: order.lines });
    } catch (e) {
      if (!e.offline) {
        btn.disabled = false; btn.textContent = "Valider et envoyer";
        const er = $("#sendErr"); er.textContent = e.message; er.hidden = false; return;
      }
      local.status = "attente";
    }
    orders.unshift(local); saveOrders();
    const ids = Object.keys(cart).map((k) => k.split("|")[0]);
    cart = {}; saveCart(); draft.note = ""; saveDraft(); ids.forEach(refreshItem); updateBar();
    showTicket(local);
  }
  const payload = (o) => ({ client_ref: o.ref, table: o.table, note: o.note, lines: o.lines.map((l) => ({ id: l.id, o: l.o ?? 0, q: l.q })) });

  /* Envoi différé des commandes faites hors connexion */
  let flushing = false;
  async function flushQueue() {
    if (flushing) return; flushing = true;
    for (const o of orders.filter((x) => x.status === "attente")) {
      try { const { order } = await API.placeOrder(payload(o)); Object.assign(o, { no: order.no, status: order.status, total: order.total }); toast(`Commande ${order.no} envoyée`); }
      catch (e) { if (!e.offline) { o.status = "annulee"; o.error = e.message; } break; }
    }
    saveOrders(); flushing = false; updateBar(); if (shown && sheetOpen && view === "done") showTicket(shown);
  }
  /* Suivi du statut */
  async function pollStatus() {
    const live = orders.filter((o) => o.no && ["nouvelle", "preparation", "servie"].includes(o.status) && Date.now() - o.at < 6 * 3600e3);
    if (!live.length) return;
    try {
      const { statuses } = await API.status(live.map((o) => o.ref));
      let changed = false;
      live.forEach((o) => { const s = statuses[o.ref]; if (s && s.status !== o.status) { o.status = s.status; changed = true; } });
      if (changed) { saveOrders(); updateBar(); if (shown && sheetOpen && view === "done") showTicket(shown); }
    } catch (e) {}
  }
  setInterval(() => { flushQueue(); pollStatus(); }, 10000);

  function waText(o) {
    return `*${SET.nom || "Le Cercle"}* — Commande ${o.no || ""}\nTable ${o.table}\n\n` +
      o.lines.map((l) => `${l.q} × ${l.n}${l.l ? " (" + l.l + ")" : ""} — ${fmt(l.v * l.q)} ${CUR()}`).join("\n") +
      (o.note ? `\n\nRemarque : ${o.note}` : "") + `\n\nTotal : ${fmt(o.total)} ${CUR()}`;
  }
  function showTicket(o) {
    view = "done"; shown = o;
    $("#orderTitle").textContent = o.no ? `Commande ${o.no}` : "Commande";
    const time = new Date(o.at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const msg = o.status === "attente" ? "Pas de réseau : la commande partira automatiquement dès le retour de la connexion. Vous pouvez aussi montrer cet écran au serveur."
      : o.status === "annulee" ? (o.error || "Cette commande a été annulée. Adressez-vous à votre serveur.")
      : o.status === "servie" || o.status === "payee" ? "Bon appétit !" : "Le restaurant a bien reçu votre commande. Cet écran se met à jour tout seul.";
    $("#orderBody").innerHTML = `<div class="done">
      <div class="done-check ${o.status === "attente" ? "wait" : o.status === "annulee" ? "off" : ""}">${o.status === "attente"
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>'}</div>
      <div class="mt-3">${pill(o.status)}</div><p class="mt-2">${esc(msg)}</p></div>
      <div class="ticket">
        <div class="ticket-head"><div><div class="ticket-k">Commande</div><div class="ticket-no">${o.no || "—"}</div><div class="ticket-k" style="margin-top:6px">${time}</div></div>
          <div class="ticket-table"><div class="ticket-k">Table</div><div class="big">${esc(o.table)}</div></div></div>
        ${o.lines.map((l) => `<div class="ticket-line"><span class="q">${l.q}×</span><span class="n">${esc(l.n)}${l.l ? `<small>${esc(l.l)}</small>` : ""}</span><span class="p">${fmt(l.v * l.q)}</span></div>`).join("")}
        ${o.note ? `<div class="ticket-note"><span class="ticket-k">Remarque</span><br>${esc(o.note)}</div>` : ""}
        <div class="ticket-total"><span>Total</span><span>${fmt(o.total)} ${CUR()}</span></div>
      </div>${historyHTML(o.ref)}`;
    const wa = SET.whatsapp ? `<a class="btn-sec" href="https://wa.me/${esc(SET.whatsapp)}?text=${encodeURIComponent(waText(o))}" target="_blank" rel="noopener">Envoyer aussi par WhatsApp</a>` : "";
    $("#orderFoot").innerHTML = `${wa}<button type="button" class="btn-main" data-bs-dismiss="offcanvas">Retour à la carte</button>`;
  }
  function historyHTML(except) {
    const list = orders.filter((o) => o.ref !== except);
    if (!list.length) return "";
    return `<div class="history"><h3>Mes commandes</h3>${list.map((o) =>
      `<button type="button" class="hist-item" data-hist="${o.ref}"><span>${o.no ? "N° " + o.no : "En attente"} · Table ${esc(o.table)} · ${new Date(o.at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span><span>${pill(o.status)}</span></button>`).join("")}</div>`;
  }
  $("#orderBody").addEventListener("click", (e) => { const h = e.target.closest("[data-hist]"); if (h) { const o = orders.find((x) => x.ref === h.dataset.hist); if (o) { showTicket(o); $("#orderBody").scrollTop = 0; } } });

  /* ---------- Recherche ---------- */
  const filters = { veg: false, verre: false, sig: false };
  const q = $("#q");
  function runSearch() {
    const terms = norm(q.value.trim()).split(/\s+/).filter(Boolean), out = $("#results");
    if (!terms.length && !filters.veg && !filters.verre && !filters.sig) { out.innerHTML = `<p class="empty">Essayez « gambas », « Bourgogne » ou « mojito ».</p>`; return; }
    const hits = FLAT.filter((it) => terms.every((t) => it.key.includes(t)) &&
      (!filters.veg || it.t.includes("veg")) && (!filters.verre || it.t.includes("verre")) && (!filters.sig || it.t.includes("sig")));
    out.innerHTML = hits.length
      ? `<p class="result-head">${hits.length} résultat${hits.length > 1 ? "s" : ""}</p>` + hits.slice(0, 60).map((it) => itemHTML(it, true)).join("")
      : `<p class="empty">Aucun résultat. Vérifiez l’orthographe ou retirez un filtre.</p>`;
  }
  q.addEventListener("input", runSearch);
  $$("#searchFilters .chip").forEach((c) => c.addEventListener("click", () => {
    filters[c.dataset.f] = !filters[c.dataset.f];
    c.classList.toggle("active", filters[c.dataset.f]); c.setAttribute("aria-pressed", String(filters[c.dataset.f])); runSearch();
  }));
  $("#searchSheet").addEventListener("show.bs.offcanvas", runSearch);

  /* ---------- Démarrage ---------- */
  const cached = store.get("cercle.menu", null);
  if (cached && cached.menu) { useMenu(cached); renderTabs(); renderUniverse(startUniverse(), true); }
  updateBar();
  refreshMenu().then(() => { flushQueue(); pollStatus(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { refreshMenu(); pollStatus(); } });
})();
