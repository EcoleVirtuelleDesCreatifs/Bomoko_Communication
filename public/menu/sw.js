/* Le Cercle — service worker : la carte reste consultable sans connexion.
   Après une modification de la carte, augmenter VERSION pour forcer la mise à jour. */
const VERSION = "cercle-v3";
const FILES = [
  "./", "./index.html", "./manifest.json",
  "./css/style.css", "./css/fonts.css",
  "./vendor/bootstrap.min.css", "./vendor/bootstrap.bundle.min.js",
  "./js/api.js", "./js/app.js",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-180.png",
  "./fonts/hanken-grotesk-latin-400-normal.woff2", "./fonts/hanken-grotesk-latin-500-normal.woff2",
  "./fonts/hanken-grotesk-latin-600-normal.woff2", "./fonts/hanken-grotesk-latin-700-normal.woff2",
  "./fonts/newsreader-latin-400-normal.woff2", "./fonts/newsreader-latin-500-normal.woff2",
  "./fonts/newsreader-latin-400-italic.woff2", "./fonts/pinyon-script-latin-400-normal.woff2"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Réseau d'abord (prix toujours à jour), cache en secours hors connexion */
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.includes("/admin/")) return;                       // l'admin reste toujours en ligne
  if (url.pathname.includes("/api/") && url.searchParams.get("a") !== "menu") return; // seule la carte est mise en cache
  e.respondWith(
    fetch(e.request).then((r) => {
      const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: !url.pathname.includes("/api/") }).then((m) => m || caches.match("./index.html")))
  );
});
