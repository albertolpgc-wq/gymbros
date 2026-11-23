// Service worker: guarda la app para que abra sin cobertura.
// Para publicar una versión nueva basta con cambiar VERSION: los móviles mostrarán "Nueva versión disponible".
const VERSION = 'v3';
const CACHE = `gymbros-${VERSION}`;
const FILES = [
  './', './index.html', './css/styles.css', './manifest.webmanifest',
  './js/app.js', './js/store.js', './js/stats.js', './js/timer.js', './js/icons.js', './js/groupArt.js', './js/gps.js', './js/exercises.js', './js/config.js',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png',
];

const CDN = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/';
const ICONS = ['Dove/3D/dove_3d.png', 'Wing/3D/wing_3d.png', 'Coconut/3D/coconut_3d.png', 'Flexed biceps/Default/3D/flexed_biceps_3d_default.png',
  'Magnet/3D/magnet_3d.png', 'Leg/Default/3D/leg_3d_default.png', 'Peach/3D/peach_3d.png', 'Chocolate bar/3D/chocolate_bar_3d.png',
  'Anatomical heart/3D/anatomical_heart_3d.png', 'Skull/3D/skull_3d.png'].map((p) => CDN + encodeURI(p));

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES).then(() => c.addAll(ICONS).catch(() => {}))));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', (e) => { if (e.data === 'skip') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Iconos 3D del CDN: se guardan la primera vez para tenerlos sin conexión
  if (url.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(caches.open(CACHE).then((c) => c.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { c.put(e.request, r.clone()); return r; }))));
    return;
  }
  if (url.origin !== location.origin) return; // Supabase va siempre a la red
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request))
  );
});
