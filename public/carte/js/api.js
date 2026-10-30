/* LE CERCLE — accès au serveur (partagé par la carte client et l'admin) */
window.CercleAPI = window.CercleAPI || (function () {
  const BASE = window.CERCLE_API_BASE || "api/index.php";
  async function call(a, { method = "GET", body, query } = {}) {
    const qs = new URLSearchParams(Object.assign({ a }, query || {})).toString();
    let res;
    try {
      res = await fetch(`${BASE}?${qs}`, {
        method, credentials: "same-origin", cache: "no-store",
        headers: method === "POST" ? { "Content-Type": "application/json", "X-Cercle": "1" } : {},
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      const err = new Error("Pas de connexion au serveur."); err.offline = true; throw err;
    }
    let data = {};
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) { const err = new Error(data.error || `Erreur ${res.status}`); err.status = res.status; throw err; }
    return data;
  }
  const post = (a, body) => call(a, { method: "POST", body: body || {} });
  return {
    demo: false,
    menu: () => call("menu"),
    placeOrder: (o) => post("order", o),
    status: (refs) => call("status", { query: { refs: refs.join(",") } }),
    login: (password) => post("login", { password }),
    logout: () => post("logout"),
    me: () => call("me"),
    orders: (scope) => call("orders", { query: { scope } }),
    setStatus: (id, status) => post("order_status", { id, status }),
    saveMenu: (menu, version) => post("menu_save", { menu, version }),
    settings: () => call("settings"),
    saveSettings: (s) => post("settings_save", s),
    password: (current, next) => post("password", { current, new: next }),
  };
})();
