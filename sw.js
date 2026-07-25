// Dişli Hesap service worker — çevrimdışı çalışma
// Sürümü artırınca eski önbellek silinir ve dosyalar yeniden indirilir.
const CACHE = 'disli-hesap-v2';
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/app.js',
  'js/engine.js',
  'js/format.js',
  'js/modules.js',
  'js/optimizer.js',
  'js/storage.js',
  'data/cells.js',
  'data/cells2026.js',
  'data/gears.js',
  'data/zst.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  // no-cache: tarayıcının HTTP önbelleğini atla, dosyaların güncel halini indir
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'no-cache' }))))
      .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()));
});

// Aynı kaynaktan GET: önce önbellek, yoksa ağ (ağdan geleni önbelleğe yaz)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // fontlar vb. tarayıcıya kalsın
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) =>
      hit ||
      fetch(e.request).then((resp) => {
        if (resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return resp;
      })));
});
