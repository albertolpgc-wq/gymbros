// Caminata con GPS: cronometra y mide la distancia mientras la app está abierta.
// El estado se guarda en el móvil para no perderlo si se recarga la página.
const KEY = 'gym.walk';
let watchId = null, wake = null;
const listeners = [];
export const onWalk = (fn) => listeners.push(fn);
const emit = () => listeners.forEach((f) => f());

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } }
function save(s) { try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch {} }
export let walk = load(); // { exId, start, meters, last:{lat,lon}, error }

// Distancia entre dos puntos (fórmula del haversine), en metros
function dist(a, b) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function onPos(p) {
  if (!walk) return;
  const { latitude: lat, longitude: lon, accuracy } = p.coords;
  walk.error = null;
  walk.acc = Math.round(accuracy);
  if (accuracy > 35) { emit(); return; }           // lectura poco precisa: se ignora
  const here = { lat, lon };
  if (walk.last) {
    const d = dist(walk.last, here);
    if (d < 4) { emit(); return; }                  // ruido estando quieto
    if (d > 200) { walk.last = here; save(walk); emit(); return; } // salto raro (túnel, etc.)
    walk.meters += d;
  }
  walk.last = here;
  save(walk); emit();
}
function onErr(e) {
  if (!walk) return;
  walk.error = e.code === 1 ? 'Sin permiso de ubicación' : 'Buscando señal GPS…';
  emit();
}
async function keepAwake(on) {
  try {
    if (on && !wake && navigator.wakeLock) wake = await navigator.wakeLock.request('screen');
    if (!on && wake) { await wake.release(); wake = null; }
  } catch {}
}
function watch() {
  if (!navigator.geolocation) { walk.error = 'Este móvil no tiene GPS disponible'; emit(); return; }
  if (watchId === null) watchId = navigator.geolocation.watchPosition(onPos, onErr, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
  keepAwake(true);
}

export function startWalk(exId) {
  walk = { exId, start: Date.now(), meters: 0, last: null, error: null };
  save(walk); watch(); emit();
}
export function stopWalk() {
  const res = walk ? { exId: walk.exId, minutes: Math.max(1, Math.round((Date.now() - walk.start) / 60000)), km: Math.round(walk.meters / 10) / 100 } : null;
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = null; walk = null; save(null); keepAwake(false); emit();
  return res;
}
export const elapsed = () => (walk ? (Date.now() - walk.start) / 1000 : 0);

// Si la app se recarga con una caminata en marcha, se reanuda
if (walk) watch();
document.addEventListener('visibilitychange', () => { if (!document.hidden && walk) { watch(); emit(); } });
