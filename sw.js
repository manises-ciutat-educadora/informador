/* Service Worker — Informador de Manises (PWA offline) */
const CACHE = "informador-manises-v1";
const ESTÀTICS = [
  "./", "./index.html", "./styles.css", "./app.js", "./manifest.json",
  "./iconos/icon-192.png", "./iconos/icon-512.png", "./iconos/icon-maskable-512.png",
  "./iconos/apple-touch-icon.png", "./iconos/favicon-48.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ESTÀTICS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(claus => Promise.all(claus.filter(c => c !== CACHE).map(c => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Les API (Worker Cloudflare) sempre van per xarxa
  if (e.request.method !== "GET" || url.pathname.startsWith("/api/")) return;
  // HTML: xarxa primer, caché de recul (per tenir sempre la versió nova)
  if (e.request.mode === "navigate"){
    e.respondWith(fetch(e.request).catch(() => caches.match("./index.html")));
    return;
  }
  // Resta: caché primer, actualitza en segon pla
  e.respondWith(
    caches.match(e.request).then(c => {
      const f = fetch(e.request).then(r => {
        if (r.ok){ const copia = r.clone(); caches.open(CACHE).then(cache => cache.put(e.request, copia)); }
        return r;
      }).catch(() => c);
      return c || f;
    })
  );
});
