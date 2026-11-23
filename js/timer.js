// Temporizador de descanso + intervalos (Tabata / circuito) con pitidos y vibración.
// Usa la hora de fin (no un contador) para no desajustarse si el móvil frena la pestaña.

let ctx = null;
export function unlockAudio() {
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {}
}
export function beep(freq = 880, ms = 150, vol = 0.4) {
  try {
    unlockAudio();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000);
    o.connect(g).connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + ms / 1000);
  } catch {}
}
const vibrate = (p) => { try { navigator.vibrate?.(p); } catch {} };

let wakeLock = null;
async function keepAwake(on) {
  try {
    if (on && !wakeLock && navigator.wakeLock) wakeLock = await navigator.wakeLock.request('screen');
    if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch {}
}

// Estado público
export const T = {
  mode: null,          // 'rest' | 'interval' | null
  phase: '',           // 'prep' | 'work' | 'rest' | 'done'
  endAt: 0, total: 0,
  round: 0, rounds: 0,
  cfg: { work: 20, rest: 10, rounds: 8, prep: 10 },
  paused: false, remainingOnPause: 0,
  lastBeepSec: null,
};
let tick = null;
let listeners = [];
export const onTimer = (fn) => listeners.push(fn);
const emit = () => listeners.forEach((fn) => fn());

export const remaining = () => (T.paused ? T.remainingOnPause : Math.max(0, (T.endAt - Date.now()) / 1000));

function startPhase(phase, secs) {
  T.phase = phase; T.total = secs; T.endAt = Date.now() + secs * 1000; T.lastBeepSec = null;
}
function loop() {
  clearInterval(tick);
  tick = setInterval(() => {
    if (!T.mode || T.paused) return;
    const r = remaining();
    const sec = Math.ceil(r);
    if (sec <= 3 && sec > 0 && sec !== T.lastBeepSec) { T.lastBeepSec = sec; beep(660, 120); }
    if (r <= 0) next();
    emit();
  }, 200);
}
function next() {
  if (T.mode === 'rest') {
    beep(1046, 600); vibrate([300, 100, 300]);
    stop(); return;
  }
  const c = T.cfg;
  if (T.phase === 'prep' || T.phase === 'rest') {
    T.round += 1; startPhase('work', c.work); beep(1046, 450); vibrate(250);
  } else if (T.phase === 'work') {
    if (T.round >= c.rounds) {
      T.phase = 'done'; beep(1046, 300); setTimeout(() => beep(1318, 300), 350); setTimeout(() => beep(1568, 700), 700);
      vibrate([200, 100, 200, 100, 500]); T.mode = null; clearInterval(tick); keepAwake(false); emit(); return;
    }
    startPhase('rest', c.rest); beep(440, 450); vibrate(150);
  }
}

export function startRest(secs) {
  unlockAudio();
  T.mode = 'rest'; T.paused = false; T.round = 0; T.rounds = 0;
  startPhase('rest', secs); loop(); emit();
}
export function addRest(delta) {
  if (T.mode !== 'rest') return;
  if (T.paused) T.remainingOnPause = Math.max(1, T.remainingOnPause + delta);
  else T.endAt = Math.max(Date.now() + 1000, T.endAt + delta * 1000);
  T.total = Math.max(T.total + delta, 1); emit();
}
export function startInterval(cfg) {
  unlockAudio();
  T.cfg = { ...cfg }; T.mode = 'interval'; T.paused = false; T.round = 0; T.rounds = cfg.rounds;
  if (cfg.prep > 0) { startPhase('prep', cfg.prep); beep(880, 120); } else { T.round = 1; startPhase('work', cfg.work); beep(1046, 450); }
  keepAwake(true); loop(); emit();
}
export function togglePause() {
  if (!T.mode) return;
  if (T.paused) { T.endAt = Date.now() + T.remainingOnPause * 1000; T.paused = false; }
  else { T.remainingOnPause = remaining(); T.paused = true; }
  emit();
}
export function stop() {
  T.mode = null; T.phase = ''; T.paused = false; clearInterval(tick); keepAwake(false); emit();
}
export const fmtClock = (s) => { s = Math.ceil(s); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
