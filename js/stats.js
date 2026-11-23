// Cálculos: volumen, sesiones, semáforo, récords (PR) y frases con humor.
import { exerciseById } from './exercises.js';

export const pad = (n) => String(n).padStart(2, '0');
export const dayStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => dayStr(new Date());
export const parseDay = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (s, n) => { const d = parseDay(s); d.setDate(d.getDate() + n); return dayStr(d); };
export const weekStart = (s) => { const d = parseDay(s); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return dayStr(d); };

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const MESES_CORTOS = MESES.map((m) => m.slice(0, 3));
export const fmtDayLong = (s) => { const d = parseDay(s); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`; };
export const fmtDayShort = (s) => { const d = parseDay(s); return `${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`; };
export const monthName = (y, m) => `${MESES[m]} ${y}`;
export function relDay(s) {
  const diff = Math.round((parseDay(today()) - parseDay(s)) / 864e5);
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'ayer';
  if (diff < 7) return `hace ${diff} días`;
  if (diff < 14) return 'hace 1 semana';
  return `hace ${Math.floor(diff / 7)} semanas`;
}

export const fmtNum = (n) => (Math.round(n * 10) / 10).toLocaleString('es-ES');

// ---------- volumen y métricas por tipo ----------
const working = (sets) => sets.filter((s) => !s.warmup);

export function volume(sets, type) {
  const w = working(sets);
  switch (type) {
    case 'weight': return w.reduce((a, s) => a + s.weight * s.reps, 0);
    case 'bodyweight': return w.reduce((a, s) => a + s.reps * (1 + s.weight / 100), 0);
    case 'time': return w.reduce((a, s) => a + s.reps, 0);
    case 'cardio': return w.reduce((a, s) => a + (s.weight > 0 ? s.weight : s.reps / 10), 0);
  }
  return 0;
}
export function volumeLabel(v, type) {
  if (type === 'weight') return `${fmtNum(Math.round(v))} kg`;
  if (type === 'bodyweight') return `${fmtNum(Math.round(v))} reps`;
  if (type === 'time') return `${fmtNum(v)} s`;
  return `${fmtNum(v)} km`;
}
// Valor que cuenta como récord personal (PR)
export const prValue = (s, type) => (type === 'weight' || type === 'cardio' ? s.weight : type === 'bodyweight' ? s.reps + s.weight / 100 : s.reps);
export function prLabel(s, type) {
  if (type === 'weight') return `${fmtNum(s.weight)} kg`;
  if (type === 'bodyweight') return s.weight ? `${s.reps} reps +${fmtNum(s.weight)} kg` : `${s.reps} reps`;
  if (type === 'time') return `${s.reps} s`;
  return `${fmtNum(s.weight)} km`;
}
export function setLabel(s, type) {
  if (type === 'weight') return `${fmtNum(s.weight)}×${s.reps}`;
  if (type === 'bodyweight') return s.weight ? `+${fmtNum(s.weight)}×${s.reps}` : `${s.reps} reps`;
  if (type === 'time') return s.weight ? `${s.reps}s +${fmtNum(s.weight)}kg` : `${s.reps} s`;
  return `${fmtNum(s.weight)} km · ${s.reps}′`;
}

/** Sesiones de un ejercicio, de la más reciente a la más antigua */
export function sessions(userSets, exId) {
  const type = exerciseById(exId)?.type || 'weight';
  const byDay = {};
  userSets.filter((s) => s.exercise_id === exId).forEach((s) => (byDay[s.day] ||= []).push(s));
  return Object.entries(byDay)
    .map(([day, sets]) => {
      sets.sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
      const w = working(sets);
      const best = w.reduce((b, s) => (!b || prValue(s, type) > prValue(b, type) ? s : b), null);
      return { day, sets, volume: volume(sets, type), best, type };
    })
    .sort((a, b) => (a.day < b.day ? 1 : -1));
}

/** IDs de series que fueron récord (superan todo lo anterior, y existía historial) */
export function prSetIds(userSets, exId) {
  const type = exerciseById(exId)?.type || 'weight';
  const list = working(userSets.filter((s) => s.exercise_id === exId))
    .sort((a, b) => (a.day + a.created_at < b.day + b.created_at ? -1 : 1));
  const ids = new Set();
  let best = null;
  let firstDay = list[0]?.day;
  for (const s of list) {
    const v = prValue(s, type);
    if (best !== null && v > best && s.day !== firstDay) ids.add(s.id);
    if (best === null || v > best) best = v;
  }
  return ids;
}

// ---------- semáforo ----------
export function light(cur, prev) {
  if (!prev) return 'new';
  if (!cur) return 'none';
  const r = cur / prev;
  if (r > 1.02) return 'green';
  if (r >= 0.98) return 'yellow';
  return 'red';
}
export const LIGHT_FACE = { green: '😎', yellow: '😐', red: '😭', new: '🐣', none: '💤', progress: '😤' };

const FRASES = {
  green: [
    'Bestia parda. La semana pasada te mira con envidia.',
    '¡Esto es progresar! Ya puedes subir una story.',
    'Más fuerte que el café del lunes. ☕',
    'Tu yo de la semana pasada acaba de pedir el traslado.',
    'Así sí. Los hierros tiemblan cuando entras.',
  ],
  yellow: [
    'Igualito que la semana pasada. Consistente… o vago. 🤔',
    'Mantenerse también es ganar. Un poquito.',
    'Ni frío ni calor. Como el agua del vestuario.',
    'Empate técnico contra ti mismo.',
  ],
  red: [
    '¿Ayer hubo cena con amigos o qué? 🍕',
    'Hoy te ha ganado la gravedad. Mañana revancha.',
    'Tranquilo, nadie lo ha visto… salvo esta app. 👀',
    'Menos que la semana pasada. ¿Dormiste algo?',
    'El sofá se está riendo de ti ahora mismo.',
  ],
  new: [
    'Primera vez registrada. ¡Ya tienes marca que batir!',
    'Bienvenido a este ejercicio. La semana que viene, a superarlo.',
  ],
  progress: [
    'Vas por debajo de la semana pasada… ¡Aprieta!',
    'Todavía no llegas. Una serie más y lo petas.',
    'Tu yo del pasado va ganando. ¿Lo vas a permitir?',
  ],
};
function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
export const frase = (kind, seed = '') => { const a = FRASES[kind] || FRASES.yellow; return a[hash(seed) % a.length]; };

// ---------- dureza (RPE 1-10), carga y kcal estimadas ----------
export function rpeInfo(r) {
  if (r <= 3) return { face: '😌', label: 'Paseíto' };
  if (r <= 6) return { face: '😅', label: 'Ha picado' };
  if (r <= 8) return { face: '🥵', label: 'Me ha reventado' };
  return { face: '💀', label: 'Modo Pablo' };
}
// Equivalencia aproximada dureza -> MET (gasto respecto a estar sentado)
const metFromRpe = (r) => 3 + 0.6 * r;
const MET_PESAS = 5, RPE_PESAS = 7, MET_CARDIO = 7, RPE_CARDIO = 6;

/**
 * Esfuerzo de un conjunto de días: minutos, carga (minutos × dureza) y kcal estimadas.
 * Pesas: duración = tiempo entre primera y última serie (+5 min). Cardio: minutos apuntados.
 */
export function effort(sets, acts, bodyKg) {
  let min = 0, load = 0, metMin = 0;
  const byDay = {};
  sets.forEach((s) => (byDay[s.day] ||= []).push(s));
  Object.values(byDay).forEach((ds) => {
    const cardio = ds.filter((s) => exerciseById(s.exercise_id)?.type === 'cardio');
    const strength = ds.filter((s) => exerciseById(s.exercise_id)?.type !== 'cardio');
    if (strength.length) {
      const t = strength.map((s) => Date.parse(s.created_at)).filter(Boolean).sort((a, b) => a - b);
      const span = t.length > 1 ? (t[t.length - 1] - t[0]) / 60000 : 0;
      const m = Math.min(150, Math.max(span + 5, strength.length * 3));
      min += m; load += m * RPE_PESAS; metMin += m * MET_PESAS;
    }
    const cm = cardio.reduce((a, s) => a + s.reps, 0);
    min += cm; load += cm * RPE_CARDIO; metMin += cm * MET_CARDIO;
  });
  acts.forEach((a) => { min += a.minutes; load += a.minutes * a.rpe; metMin += a.minutes * metFromRpe(a.rpe); });
  return { min: Math.round(min), load: Math.round(load), kcal: bodyKg ? Math.round((metMin * bodyKg) / 60) : null };
}

// Humor general del panel según la semana
export function moodOf(counts, trainedDays) {
  if (!trainedDays) return { face: '🛋️', title: 'Modo sofá activado', text: 'Esta semana aún no has pisado el gym. Las pesas te echan de menos.' };
  const { green = 0, yellow = 0, red = 0 } = counts;
  const total = green + yellow + red;
  if (!total && counts.progress) return { face: '😤', title: 'Sesión en marcha', text: 'Todavía no has igualado lo de la semana pasada. ¡Aprieta, que tú puedes!' };
  if (!total) return { face: '🐣', title: 'Arrancando motores', text: 'Aún no hay con qué comparar. ¡La semana que viene empieza el pique!' };
  if (green / total >= 0.6) return { face: '🔥', title: 'Estás on fire', text: 'La mayoría de tus ejercicios han mejorado. Sigue así, máquina.' };
  if (red / total >= 0.5) return { face: '😡', title: 'Semana floja, ¿eh?', text: 'Más rojos que verdes. Come, duerme y vuelve con ganas de venganza.' };
  if (red > green) return { face: '😕', title: 'Regulín', text: 'Algunos ejercicios han bajado. Nada que no arregle una buena sesión.' };
  return { face: '🙂', title: 'Vas bien', text: 'Progreso decente. Un empujón más y entras en modo bestia.' };
}
