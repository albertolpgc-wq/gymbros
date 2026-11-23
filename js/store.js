// Capa de datos: todo se guarda primero en el móvil (funciona sin cobertura)
// y se sincroniza con Supabase en cuanto hay conexión.
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// Con "?local" en la URL se usa un modo de pruebas que no toca la nube
const TEST = new URLSearchParams(location.search).has('local');
const P = TEST ? 'gym.test.' : 'gym.';
const DB_KEY = `${P}db.v1`;
const OUTBOX_KEY = `${P}outbox.v1`;
const PHOTOS_KEY = `${P}photos.v1`;
const PK = { users: ['id'], sets: ['id'], notes: ['user_id', 'exercise_id'], exercise_photos: ['exercise_id'], activities: ['id'] };

const cloud = Boolean(SUPABASE_URL && SUPABASE_KEY) && !TEST;
let db = { users: [], sets: [], notes: [], activities: [] };
let photos = {};
let outbox = [];
let listeners = [];
let syncing = false;
export const status = { cloud, pending: 0, lastSync: null, error: null };

function readJSON(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function writeJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; }
}
function persist() {
  writeJSON(DB_KEY, db);
  writeJSON(OUTBOX_KEY, outbox);
  status.pending = outbox.length;
}
function emit() { listeners.forEach((fn) => fn()); }
export function onChange(fn) { listeners.push(fn); }

export const uuid = () =>
  (crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    }));

const sameKey = (table, a, b) => PK[table].every((k) => a[k] === b[k]);

// ---------- aplicar operaciones en local ----------
function applyLocal(op) {
  if (op.table === 'exercise_photos') {
    if (op.kind === 'upsert') photos[op.row.exercise_id] = op.row.data;
    else delete photos[op.row.exercise_id];
    writeJSON(PHOTOS_KEY, photos);
    return;
  }
  const list = db[op.table];
  const i = list.findIndex((r) => sameKey(op.table, r, op.row));
  if (op.kind === 'upsert') { if (i >= 0) list[i] = { ...list[i], ...op.row }; else list.push(op.row); }
  else if (i >= 0) list.splice(i, 1);
}

function enqueue(op) {
  applyLocal(op);
  if (cloud) outbox.push(op);
  persist();
  emit();
  if (cloud) sync();
}

// ---------- API REST de Supabase (sin librerías) ----------
function headers(extra = {}) {
  const h = { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', ...extra };
  if (!SUPABASE_KEY.startsWith('sb_')) h.Authorization = `Bearer ${SUPABASE_KEY}`;
  return h;
}
async function api(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...opts, headers: headers(opts.headers) });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.status === 204 || opts.method && opts.method !== 'GET' ? null : res.json();
}
async function fetchAll(table) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const page = await api(`${table}?select=*`, { headers: { Range: `${from}-${from + 999}` } });
    out.push(...page);
    if (page.length < 1000) return out;
  }
}
async function pushOp(op) {
  if (op.kind === 'upsert') {
    await api(`${op.table}?on_conflict=${PK[op.table].join(',')}`, {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(op.row),
    });
  } else {
    const q = PK[op.table].map((k) => `${k}=eq.${encodeURIComponent(op.row[k])}`).join('&');
    await api(`${op.table}?${q}`, { method: 'DELETE' });
  }
}

export async function sync() {
  if (!cloud || syncing) return;
  syncing = true;
  try {
    while (outbox.length) {
      await pushOp(outbox[0]);
      outbox.shift();
      persist();
    }
    const [users, sets, notes, ph, activities] = await Promise.all([
      fetchAll('users'), fetchAll('sets'), fetchAll('notes'), fetchAll('exercise_photos'),
      fetchAll('activities').catch(() => db.activities), // por si aún no existe la tabla
    ]);
    db = { users, sets, notes, activities };
    photos = Object.fromEntries(ph.map((p) => [p.exercise_id, p.data]));
    outbox.forEach(applyLocal); // lo que se haya añadido mientras tanto
    writeJSON(PHOTOS_KEY, photos);
    persist();
    status.lastSync = new Date();
    status.error = null;
  } catch (e) {
    status.error = navigator.onLine ? 'Error al sincronizar' : 'Sin conexión';
    console.warn('sync', e);
  } finally {
    syncing = false;
    emit();
  }
}

export function init() {
  db = { ...db, ...readJSON(DB_KEY, db) };
  db.activities ||= [];
  outbox = readJSON(OUTBOX_KEY, []);
  photos = readJSON(PHOTOS_KEY, {});
  status.pending = outbox.length;
  if (cloud) {
    sync();
    window.addEventListener('online', sync);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });
  }
}

// ---------- consultas ----------
export const getUsers = () => [...db.users].sort((a, b) => a.name.localeCompare(b.name));
export const getUser = (id) => db.users.find((u) => u.id === id);
export const getSets = (userId) => db.sets.filter((s) => s.user_id === userId);
export const getAllSets = () => db.sets;
export const getNote = (userId, exId) => db.notes.find((n) => n.user_id === userId && n.exercise_id === exId)?.text || '';
export const getPhoto = (exId) => photos[exId] || null;
export const getActivities = (userId) => db.activities.filter((a) => a.user_id === userId);
export const getAllActivities = () => db.activities;

// ---------- modificaciones ----------
export function addUser(name, emoji) {
  const row = { id: uuid(), name: name.trim(), emoji, created_at: new Date().toISOString() };
  enqueue({ table: 'users', kind: 'upsert', row });
  return row;
}
export function updateUser(row) { enqueue({ table: 'users', kind: 'upsert', row }); }
export function addSet({ user_id, exercise_id, day, weight, reps, warmup }) {
  const row = { id: uuid(), user_id, exercise_id, day, weight: +weight || 0, reps: +reps || 0, warmup: !!warmup, created_at: new Date().toISOString() };
  enqueue({ table: 'sets', kind: 'upsert', row });
  return row;
}
export function addActivity({ user_id, exercise_id, day, minutes, rpe, note }) {
  const row = { id: uuid(), user_id, exercise_id, day, minutes: +minutes || 0, rpe: +rpe || 5, note: note || '', created_at: new Date().toISOString() };
  enqueue({ table: 'activities', kind: 'upsert', row });
  return row;
}
export function deleteActivity(row) { enqueue({ table: 'activities', kind: 'delete', row: { id: row.id } }); }
export function deleteSet(row) { enqueue({ table: 'sets', kind: 'delete', row: { id: row.id } }); }
export function setNote(user_id, exercise_id, text) {
  enqueue({ table: 'notes', kind: 'upsert', row: { user_id, exercise_id, text, updated_at: new Date().toISOString() } });
}
export function setPhoto(exercise_id, data) {
  enqueue({ table: 'exercise_photos', kind: data ? 'upsert' : 'delete', row: { exercise_id, data, updated_at: new Date().toISOString() } });
}
