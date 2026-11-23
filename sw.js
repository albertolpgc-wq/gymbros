// Service worker: guarda la app para que abra sin cobertura.
// Para publicar una versión nueva basta con cambiar VERSION: los móviles mostrarán "Nueva versión disponible".
const VERSION = 'v2';
const CACHE = `gymbros-${VERSION}`;
const FILES = [
  './', './index.html', './css/styles.css', './manifest.webmanifest',
  './js/app.js', './js/store.js', './js/stats.js', './js/timer.js', './js/icons.js', './js/exercises.js', './js/config.js',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', (e) => { if (e.data === 'skip') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // Supabase va siempre a la red
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request))
  );
});
