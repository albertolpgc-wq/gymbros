import * as S from './store.js';
import { GROUPS, EXERCISES, exerciseById, groupById, exercisesOf, FIELDS, defaultStep, STEP_OPTIONS } from './exercises.js';
import { iconSvg } from './icons.js';
import { groupArt, groupJoke } from './groupArt.js';
import {
  today, addDays, weekStart, parseDay, dayStr, fmtDayLong, fmtDayShort, monthName, relDay, fmtNum,
  sessions, prSetIds, prValue, light, LIGHT_FACE, frase, moodOf, volumeLabel, setLabel, prLabel, MESES_CORTOS,
  effort, rpeInfo, realReps,
} from './stats.js';
import * as TM from './timer.js';
import * as GPS from './gps.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const EMOJIS = ['💪', '🦍', '🐻', '🦁', '🐺', '🦖', '🐗', '🦈', '🐂', '🔥', '⚡', '🍗', '🥚', '🚀', '👑', '🤖'];
const state = {
  userId: ls.get('gym.user', null),
  draft: {},                 // valores escritos en cada ejercicio
  calMonth: null,            // [año, mes]
  chartMetric: 'volume',
  restSecs: ls.get('gym.rest', 90),
  autoRest: ls.get('gym.autoRest', true),
  interval: ls.get('gym.interval', { work: 20, rest: 10, rounds: 8, prep: 10 }),
  creating: false,
};

const view = () => $('#view');
const me = () => S.getUser(state.userId);
const mySets = () => S.getSets(state.userId);
const myActs = () => S.getActivities(state.userId);
const actDays = (acts) => new Set(acts.map((a) => a.day));

// ---------------- router ----------------
function route() {
  const hash = location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);
  if (!me() && parts[0] !== 'timer') { if (parts.length) location.hash = '#/'; return renderUsers(); }
  switch (parts[0]) {
    case undefined: return renderUsers();
    case 'home': return renderHome();
    case 'train': return renderGroups();
    case 'g': return renderGroup(parts[1]);
    case 'e': return renderExercise(parts[1]);
    case 'cal': return renderCalendar();
    case 'day': return renderDay(parts[1]);
    case 'timer': return renderTimer();
    case 'perfil': return renderProfile();
    default: location.hash = '#/home';
  }
}
function go(h) { if (location.hash === h) route(); else location.hash = h; }

function layout(title, body, { back = null, nav = null } = {}) {
  const u = me();
  const st = S.status;
  const sync = !st.cloud ? '<span class="sync local" title="Datos solo en este dispositivo">📱 local</span>'
    : st.pending ? `<span class="sync pend">⏳ ${st.pending}</span>`
    : st.error ? `<span class="sync err">⚠️ ${esc(st.error)}</span>`
    : '<span class="sync ok">☁️</span>';
  view().innerHTML = `
    <header class="top">
      ${back ? `<a class="back" href="${back}" aria-label="Volver">‹</a>` : '<span class="logo">🏋️</span>'}
      <h1>${title}</h1>
      ${sync}
      ${u ? `<a class="me" href="#/perfil" title="Mi perfil">${esc(u.emoji)}</a>` : ''}
    </header>
    <main class="content">${body}</main>`;
  $$('.tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === nav));
  $('#tabs').hidden = !u;
  window.scrollTo(0, 0);
}

// ---------------- usuarios ----------------
function renderUsers() {
  const users = S.getUsers();
  const pick = state.newEmoji || EMOJIS[0];
  layout('¿Quién entrena?', `
    <p class="muted center">Elige tu perfil. Sin contraseñas, sin líos.</p>
    <div class="users">
      ${users.map((u) => `
        <button class="user-card ${u.id === state.userId ? 'cur' : ''}" data-user="${u.id}">
          <span class="ue">${esc(u.emoji)}</span><span class="un">${esc(u.name)}</span>
        </button>`).join('')}
      <button class="user-card add" id="addUser"><span class="ue">＋</span><span class="un">Nuevo colega</span></button>
    </div>
    <form id="newUser" class="card" ${state.creating || !users.length ? '' : 'hidden'}>
      <h2>Nuevo colega</h2>
      <input id="uname" maxlength="20" placeholder="Tu nombre o mote" autocomplete="off" required>
      <div class="emojis">${EMOJIS.map((e) => `<button type="button" class="emo ${e === pick ? 'on' : ''}" data-e="${e}">${e}</button>`).join('')}</div>
      <button class="btn big" type="submit">Entrar al gym</button>
    </form>`);
  $$('[data-user]').forEach((b) => b.onclick = () => { state.userId = b.dataset.user; ls.set('gym.user', state.userId); go('#/home'); });
  $('#addUser').onclick = () => { state.creating = true; renderUsers(); $('#uname').focus(); };
  $$('.emo').forEach((b) => b.onclick = () => { state.newEmoji = b.dataset.e; $$('.emo').forEach((x) => x.classList.toggle('on', x === b)); });
  $('#newUser').onsubmit = (ev) => {
    ev.preventDefault();
    const name = $('#uname').value.trim();
    if (!name) return;
    if (S.getUsers().some((u) => u.name.toLowerCase() === name.toLowerCase())) return toast('Ese nombre ya existe 😅');
    const u = S.addUser(name, state.newEmoji || EMOJIS[0]);
    state.userId = u.id; state.creating = false; ls.set('gym.user', u.id);
    go('#/home');
  };
}

// ---------------- panel principal ----------------
function weekSummary(sets, acts, ws, nDays = 7, person = null) {
  const we = addDays(ws, nDays);
  const wk = sets.filter((s) => s.day >= ws && s.day < we);
  const wa = acts.filter((a) => a.day >= ws && a.day < we);
  const days = new Set([...wk.map((s) => s.day), ...wa.map((a) => a.day)]);
  const kg = wk.filter((s) => !s.warmup && exerciseById(s.exercise_id)?.type === 'weight').reduce((a, s) => a + s.weight * realReps(s), 0);
  return { wk, wa, days, kg, eff: effort(wk, wa, person) };
}
const pctDiff = (a, b) => (b ? Math.round(((a - b) / b) * 100) : null);
const diffTxt = (d) => (d === null ? '' : `${d >= 0 ? '▲' : '▼'} ${Math.abs(d)}% vs sem. pasada`);

function renderHome() {
  const u = me();
  const sets = mySets();
  const acts = myActs();
  const td = today();
  const ws = weekStart(td);
  const cur = weekSummary(sets, acts, ws, 7, u);
  const prev = weekSummary(sets, acts, addDays(ws, -7), 7, u);
  const dayIdx = Math.round((parseDay(td) - parseDay(ws)) / 864e5);
  const prevSoFar = weekSummary(sets, acts, addDays(ws, -7), dayIdx + 1, u); // semana pasada hasta el mismo día

  // semáforo por ejercicio hecho esta semana
  const exIds = [...new Set(cur.wk.map((s) => s.exercise_id))];
  const counts = { green: 0, yellow: 0, red: 0, progress: 0 };
  const rows = exIds.map((id) => {
    const ex = exerciseById(id); if (!ex) return null;
    const ss = sessions(sets, id);
    const last = ss.find((x) => x.day >= ws);
    const before = ss.find((x) => x.day < last.day);
    let l = light(last.volume, before?.volume);
    if (l === 'red' && last.day === td) l = 'progress'; // hoy aún en curso: no cuenta como rojo
    if (counts[l] !== undefined) counts[l]++;
    const prs = prSetIds(sets, id);
    const pr = last.sets.some((s) => prs.has(s.id));
    return { ex, l, pr, last, before };
  }).filter(Boolean);
  // clases (HIIT): última sesión de la semana vs la anterior, por carga
  [...new Set(cur.wa.map((a) => a.exercise_id))].forEach((id) => {
    const ex = exerciseById(id); if (!ex) return;
    const list = acts.filter((a) => a.exercise_id === id).sort((a, b) => (a.day + a.created_at < b.day + b.created_at ? 1 : -1));
    const last = list[0], before = list[1];
    const ld = (a) => a.minutes * a.rpe;
    const l = light(ld(last), before && ld(before));
    if (counts[l] !== undefined) counts[l]++;
    rows.push({ ex, l, pr: false, cls: true, txt: `${rpeInfo(last.rpe).face} ${last.rpe}/10 · ${last.minutes} min${before ? ` · antes ${before.rpe}/10 · ${before.minutes} min` : ' · primera vez'}` });
  });
  const mood = moodOf(counts, cur.days.size);
  const prRows = rows.filter((r) => r.pr);

  // racha de semanas
  let streak = 0; let w = cur.days.size ? ws : addDays(ws, -7);
  const inWeek = (d, w0) => d >= w0 && d < addDays(w0, 7);
  while (sets.some((s) => inWeek(s.day, w)) || acts.some((a) => inWeek(a.day, w))) { streak++; w = addDays(w, -7); }

  // ranking de colegas por carga semanal (pesas + cardio + HIIT)
  const all = S.getAllSets(), allActs = S.getAllActivities();
  const rank = S.getUsers().map((x) => {
    const r = weekSummary(all.filter((s) => s.user_id === x.id), allActs.filter((a) => a.user_id === x.id), ws);
    return { u: x, kg: r.kg, load: r.eff.load, days: r.days.size };
  }).filter((r) => r.days).sort((a, b) => b.load - a.load);

  const diff = pctDiff(cur.kg, prevSoFar.kg);
  const diffLoad = pctDiff(cur.eff.load, prevSoFar.eff.load);
  const diffKcal = cur.eff.kcal !== null ? pctDiff(cur.eff.kcal, prevSoFar.eff.kcal) : null;
  const letters = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const groupsWeek = [...new Set([...cur.wk, ...cur.wa].map((s) => exerciseById(s.exercise_id)?.group))].map(groupById).filter(Boolean);

  layout(`Hola, ${esc(u.name)}`, `
    <section class="mood card">
      <div class="mood-face">${mood.face}</div>
      <div><h2>${mood.title}</h2><p>${mood.text}</p></div>
    </section>

    <div class="week-strip">
      ${letters.map((l, i) => { const d = addDays(ws, i); return `
        <a class="wd ${d === td ? 'today' : ''} ${cur.days.has(d) ? 'done' : ''}" href="#/day/${d}">
          <span>${l}</span><b>${parseDay(d).getDate()}</b><i></i></a>`; }).join('')}
    </div>

    <div class="stats">
      <div class="stat"><span class="k">Días esta semana</span><b>${cur.days.size}</b><span class="s">la anterior: ${prev.days.size}</span></div>
      <div class="stat"><span class="k">Kg levantados</span><b>${fmtNum(Math.round(cur.kg))}</b>
        <span class="s ${diff === null ? '' : diff >= 0 ? 'up' : 'down'}">${diff === null ? `la anterior: ${fmtNum(Math.round(prev.kg))}` : `${diff >= 0 ? '▲' : '▼'} ${Math.abs(diff)}% vs mismo día sem. pasada`}</span></div>
      <div class="stat"><span class="k">Racha</span><b>${streak} ${streak === 1 ? 'sem' : 'sems'}</b><span class="s">${streak >= 3 ? '🔥 imparable' : streak ? 'no la rompas' : 'empieza hoy'}</span></div>
    </div>
    <div class="stats two">
      <div class="stat"><span class="k">⚡ Carga semanal</span><b>${fmtNum(cur.eff.load)}</b>
        <span class="s ${diffLoad === null ? '' : diffLoad >= 0 ? 'up' : 'down'}">${diffLoad === null ? `${cur.eff.min} min de actividad` : diffTxt(diffLoad)}</span></div>
      <div class="stat"><span class="k">🔥 kcal estimadas</span>${cur.eff.kcal === null
        ? '<a class="s link" href="#/perfil">Pon tu peso en el perfil</a>'
        : `<b>~${fmtNum(cur.eff.kcal)}</b><span class="s ${diffKcal === null ? '' : diffKcal >= 0 ? 'up' : 'down'}">${diffKcal === null ? 'aproximadas' : diffTxt(diffKcal)}</span>`}</div>
    </div>

    <a class="btn big train-cta" href="#/train">💪 Entrenar hoy <small>${fmtDayLong(td)}</small></a>

    ${prRows.length ? `
    <section class="card pr-card">
      <h2><span class="pr-bang">!</span> Récords de la semana</h2>
      ${prRows.map((r) => `<a class="pr-row" href="#/e/${r.ex.id}"><span>${esc(r.ex.name)}</span><b>${prLabel(r.last.best, r.ex.type)}</b></a>`).join('')}
    </section>` : ''}

    <section class="card">
      <h2>Semáforo de la semana</h2>
      ${groupsWeek.length ? `<div class="chips">${groupsWeek.map((g) => `<span class="chip">${g.emoji} ${g.name}</span>`).join('')}</div>` : ''}
      ${rows.length ? `
        <div class="lights-sum">
          <span><i class="dot green"></i>${counts.green} mejor</span>
          <span><i class="dot yellow"></i>${counts.yellow} igual</span>
          <span><i class="dot red"></i>${counts.red} peor</span>
        </div>
        ${rows.map((r) => `
          <a class="ex-row" href="#/e/${r.ex.id}">
            <span class="face">${LIGHT_FACE[r.l]}</span>
            <span class="grow"><b>${esc(r.ex.name)}</b>
              <small>${r.cls ? r.txt : `${volumeLabel(r.last.volume, r.ex.type)}${r.before ? ` · antes ${volumeLabel(r.before.volume, r.ex.type)}` : ' · primera vez'}`}</small></span>
            ${r.pr ? '<span class="pr-tag">¡PR!</span>' : ''}<i class="dot ${r.l}"></i>
          </a>`).join('')}`
      : '<p class="muted">Cuando registres ejercicios esta semana verás aquí si vas mejor o peor que la anterior.</p>'}
    </section>

    ${rank.length ? `
    <section class="card">
      <h2>🏆 Ranking colegas (semana) <small>por carga</small></h2>
      ${rank.map((r, i) => `
        <div class="rank-row ${r.u.id === u.id ? 'mine' : ''}">
          <span class="pos">${['🥇', '🥈', '🥉'][i] || i + 1}</span>
          <span class="grow">${esc(r.u.emoji)} ${esc(r.u.name)}<small>${r.days} ${r.days === 1 ? 'día' : 'días'} · ${fmtNum(Math.round(r.kg))} kg</small></span>
          <b>⚡ ${fmtNum(r.load)}</b>
        </div>`).join('')}
    </section>` : ''}
  `, { nav: 'home' });
}

// ---------------- grupos musculares ----------------
function lastDayOfGroup(sets, gid) {
  const ids = new Set(exercisesOf(gid).map((e) => e.id));
  return sets.filter((s) => ids.has(s.exercise_id)).reduce((m, s) => (s.day > m ? s.day : m), '');
}
function renderGroups() {
  const sets = [...mySets(), ...myActs()];
  layout('¿Qué toca hoy?', `
    <p class="muted center">${fmtDayLong(today())}</p>
    <div class="groups">
      ${GROUPS.map((g) => { const last = lastDayOfGroup(sets, g.id); return `
        <a class="group" href="#/g/${g.id}">
          ${groupArt(g.id) || iconSvg(g.icon)}
          <b>${g.name}</b>
          <small class="joke">${groupJoke(g.id)}</small>
          <small>${last ? relDay(last) : 'sin registros'}</small>
        </a>`; }).join('')}
    </div>`, { nav: 'train' });
}

function thumb(ex) {
  const p = S.getPhoto(ex.id);
  return p ? `<img class="thumb" src="${p}" alt="">` : `<span class="thumb">${iconSvg(ex.icon)}</span>`;
}

function renderGroup(gid) {
  const g = groupById(gid);
  if (!g) return go('#/train');
  const sets = mySets();
  const td = today();
  layout(`${g.emoji} ${g.name}`, `
    <div class="ex-list">
      ${exercisesOf(gid).map((ex) => {
        if (ex.type === 'class') {
          const la = myActs().filter((a) => a.exercise_id === ex.id).sort((a, b) => (a.day + a.created_at < b.day + b.created_at ? 1 : -1))[0];
          return `
          <a class="ex-item ${la?.day === td ? 'today' : ''}" href="#/e/${ex.id}">
            ${thumb(ex)}
            <span class="grow"><b>${esc(ex.name)}</b><small class="brand">${esc(ex.brand)}</small>
              <small>${la ? `${la.day === td ? '✅ hoy' : relDay(la.day)} · ${rpeInfo(la.rpe).face} ${la.rpe}/10 · ${la.minutes} min` : 'Nunca registrado'}</small></span>
          </a>`;
        }
        const ss = sessions(sets, ex.id);
        const last = ss[0];
        const doneToday = last?.day === td;
        let l = last ? light(last.volume, ss[1]?.volume) : null;
        if (l === 'red' && doneToday) l = 'progress';
        return `
        <a class="ex-item ${doneToday ? 'today' : ''} ${ex.boom ? 'boom' : ''} ${ex.never ? 'never' : ''} ${ex.always ? 'always' : ''} ${ex.again ? 'again' : ''}" href="#/e/${ex.id}">
          ${thumb(ex)}
          <span class="grow">
            <b>${esc(ex.name)}</b>
            <small class="brand">${esc(ex.brand)}</small>
            ${ex.always ? '<small class="joke">Si no hay Bayesian, no ha sido día de bíceps 👑</small>' : ''}
            ${ex.again ? `<small class="joke">${ss.length ? `Llevas ${ss.length} ${ss.length === 1 ? 'día' : 'días'} de laterales. ¿Otra vez? Pesao 🙄` : '¿Laterales? ¿Otra vez? 🙄'}</small>` : ''}
            <small>${last ? `${doneToday ? '✅ hoy' : relDay(last.day)} · ${last.sets.filter((s) => !s.warmup).map((s) => setLabel(s, ex.type)).join('  ')}` : ex.never ? '<span class="joke">«La semana que viene lo hacemos» — Adrián, siempre</span>' : 'Nunca registrado'}</small>
          </span>
          ${l ? `<i class="dot ${l}"></i>` : ''}
        </a>`; }).join('')}
    </div>`, { back: '#/train', nav: 'train' });
}

// ---------------- ejercicio ----------------
function renderExercise(exId) {
  const ex = exerciseById(exId);
  if (!ex) return go('#/train');
  if (ex.type === 'class') return renderClass(ex);
  const F = FIELDS[ex.type];
  const stepA = ls.get(`gym.step.${ex.id}`, defaultStep(ex));
  const sets = mySets();
  const td = today();
  const ss = sessions(sets, ex.id);
  const tdS = ss.find((x) => x.day === td);
  const prev = ss.find((x) => x.day < td);
  const prs = prSetIds(sets, ex.id);
  const cur = tdS?.volume || 0;
  const pv = prev?.volume || 0;
  let l = light(cur, pv);
  const todayPR = tdS?.sets.some((s) => prs.has(s.id));
  const allBest = ss.reduce((b, x) => (x.best && (!b || prValue(x.best, ex.type) > prValue(b, ex.type)) ? x.best : b), null);

  // valores iniciales del formulario
  const lastSet = tdS?.sets[tdS.sets.length - 1] || prev?.sets.find((s) => !s.warmup) || null;
  const d = state.draft[ex.id] ||= { a: lastSet ? lastSet.weight : (ex.type === 'cardio' ? 1 : ex.type === 'weight' ? (stepA === 2 ? 10 : 20) : 0), b: lastSet ? lastSet.reps : (ex.defReps || (ex.type === 'time' ? 30 : 10)), warm: false };

  let face, msg;
  if (!prev) { face = tdS ? LIGHT_FACE.new : '🤔'; msg = tdS ? frase('new', ex.id) : 'Sin registros anteriores. Hoy marcas la referencia.'; }
  else if (!tdS) { face = '⏱️'; msg = `Objetivo: superar ${volumeLabel(pv, ex.type)} de volumen.`; l = 'none'; }
  else if (l === 'red') { face = LIGHT_FACE.progress; msg = `${frase('progress', td + ex.id)} Te faltan ${volumeLabel(pv - cur, ex.type)}.`; }
  else { face = LIGHT_FACE[l]; msg = frase(l, td + ex.id); }
  const pct = pv ? Math.min(100, Math.round((cur / pv) * 100)) : (cur ? 100 : 0);
  const photo = S.getPhoto(ex.id);
  const note = S.getNote(state.userId, ex.id);

  layout(esc(ex.name), `
    <section class="ex-head">
      <div class="media ${ex.boom ? 'boom' : ''}">${photo ? `<img src="${photo}" alt="Foto de la máquina">` : iconSvg(ex.icon, 'big')}</div>
      <div class="ex-meta">
        <span class="chip">${esc(ex.brand)}</span>
        <label class="btn small ghost">📷 ${photo ? 'Cambiar foto' : 'Foto máquina'}<input type="file" accept="image/*" capture="environment" id="photo" hidden></label>
        ${photo ? '<button class="btn small ghost" id="delPhoto">🗑️ Quitar foto</button>' : ''}
        ${allBest ? `<div class="best">Tu récord<b>${prLabel(allBest, ex.type)}</b></div>` : ''}
      </div>
    </section>

    ${prev ? `
    <section class="card prev">
      <h2>La última vez <small>${fmtDayShort(prev.day)} · ${relDay(prev.day)}</small></h2>
      <div class="set-chips">${prev.sets.map((s) => `<span class="set-chip ${s.warmup ? 'warm' : ''}">${setLabel(s, ex.type)}</span>`).join('')}</div>
      <small class="muted">Volumen: ${volumeLabel(pv, ex.type)}</small>
    </section>` : ''}

    <section class="card compare ${todayPR ? 'has-pr' : ''}">
      <div class="semaforo"><i class="red ${l === 'red' ? 'on' : ''}"></i><i class="yellow ${l === 'yellow' ? 'on' : ''}"></i><i class="green ${l === 'green' || l === 'new' && tdS ? 'on' : ''}"></i></div>
      <div class="grow">
        <div class="cmp-face">${face}</div>
        <p>${msg}</p>
        ${prev ? `<div class="bar"><span style="width:${pct}%" class="${l}"></span></div>
        <small class="muted">Hoy ${volumeLabel(cur, ex.type)} / antes ${volumeLabel(pv, ex.type)}</small>` : ''}
      </div>
      ${todayPR ? '<div class="pr-burst">¡¡PR!!</div>' : ''}
    </section>

    ${ex.gps ? '<section class="card walk" id="walkCard"></section>' : ''}

    <section class="card entry">
      <h2>${d.warm ? 'Calentamiento' : `Serie ${(tdS?.sets.filter((s) => !s.warmup).length || 0) + 1}`}</h2>
      <div class="steppers">
        ${stepper('a', F.a, d.a, stepA)}
        ${stepper('b', F.b, d.b, F.stepB)}
      </div>
      ${ex.type !== 'cardio' ? `
      <div class="step-pick"><span>Salto de peso</span>
        ${STEP_OPTIONS.map((s) => `<button class="${s === stepA ? 'on' : ''}" data-stepa="${s}">${fmtNum(s)}</button>`).join('')}
      </div>` : ''}
      ${ex.mult ? `<p class="muted small mult-hint">${ex.boom ? '💣' : '🔁'} Cada serie = ${ex.mult} tramos de las reps que pongas (${d.b} → ${d.b * ex.mult} reps en total)</p>` : ''}
      <label class="toggle"><input type="checkbox" id="warm" ${d.warm ? 'checked' : ''}> Serie de calentamiento</label>
      <button class="btn big" id="addSet">＋ Añadir serie</button>
      <div class="rest-opt">
        <label class="toggle"><input type="checkbox" id="autoRest" ${state.autoRest ? 'checked' : ''}> Descanso automático</label>
        <select id="restSecs">${[30, 45, 60, 90, 120, 150, 180, 240].map((s) => `<option value="${s}" ${s === state.restSecs ? 'selected' : ''}>${TM.fmtClock(s)}</option>`).join('')}</select>
      </div>
    </section>

    ${tdS ? `
    <section class="card">
      <h2>Hoy</h2>
      ${tdS.sets.map((s, i) => `
        <div class="set-row ${s.warmup ? 'warm' : ''}">
          <span class="n">${s.warmup ? 'C' : i + 1 - tdS.sets.slice(0, i).filter((x) => x.warmup).length}</span>
          <b class="grow">${setLabel(s, ex.type)}</b>
          ${prs.has(s.id) ? '<span class="pr-tag">¡PR!</span>' : ''}
          <button class="x" data-del="${s.id}" aria-label="Borrar serie">✕</button>
        </div>`).join('')}
    </section>` : ''}

    <section class="card">
      <h2>📝 Notas</h2>
      <textarea id="note" rows="2" placeholder="Altura del asiento, agarre, sensaciones…">${esc(note)}</textarea>
    </section>

    ${ss.length >= 2 ? chartCard(ss, ex) : ''}

    ${ss.length ? `
    <section class="card">
      <h2>Historial</h2>
      ${ss.slice(0, 15).map((x, i) => { const lx = light(x.volume, ss[i + 1]?.volume); return `
        <div class="hist-row">
          <i class="dot ${lx}"></i>
          <span class="hd">${fmtDayShort(x.day)}</span>
          <span class="grow set-chips small">${x.sets.filter((s) => !s.warmup).map((s) => `<span class="set-chip ${prs.has(s.id) ? 'pr' : ''}">${setLabel(s, ex.type)}${prs.has(s.id) ? ' !' : ''}</span>`).join('')}</span>
          <small>${volumeLabel(x.volume, ex.type)}</small>
        </div>`; }).join('')}
    </section>` : ''}
  `, { back: `#/g/${ex.group}`, nav: 'train' });

  // eventos
  paintWalk();
  bindSteppers(d);
  $$('[data-stepa]').forEach((b) => b.onclick = () => { ls.set(`gym.step.${ex.id}`, +b.dataset.stepa); renderExercise(ex.id); });
  $('#warm').onchange = (e) => (d.warm = e.target.checked);
  $('#autoRest').onchange = (e) => { state.autoRest = e.target.checked; ls.set('gym.autoRest', state.autoRest); };
  $('#restSecs').onchange = (e) => { state.restSecs = +e.target.value; ls.set('gym.rest', state.restSecs); };
  $('#addSet').onclick = () => {
    TM.unlockAudio();
    if (!(d.b > 0)) return toast(`Pon las ${F.b} 😉`);
    const wasPR = prs.size;
    S.addSet({ user_id: state.userId, exercise_id: ex.id, day: td, weight: d.a, reps: d.b, warmup: d.warm });
    d.warm = false;
    const nowPR = prSetIds(mySets(), ex.id).size;
    if (ex.never && !ss.length) { toast('🎉 ¡¡HISTÓRICO!! Por fin alguien hace el press francés. Adrián, llora.', 'pr'); TM.beep(1046, 200); setTimeout(() => TM.beep(1568, 500), 220); }
    else if (ex.again && nowPR <= wasPR) toast(['🙄 Laterales… otra vez. Nadie sorprendido.', '🙄 Una serie más de laterales. Cómo no.', '🥥 Esos hombros ya no caben por la puerta.'][(tdS?.sets.length || 0) % 3]);
    else if (nowPR > wasPR) { toast('🚨 ¡¡NUEVO RÉCORD!! 🚨', 'pr'); TM.beep(1318, 200); setTimeout(() => TM.beep(1568, 400), 220); }
    if (state.autoRest) TM.startRest(state.restSecs);
  };
  $$('[data-del]').forEach((b) => b.onclick = () => {
    const s = tdS.sets.find((x) => x.id === b.dataset.del);
    if (s && confirm(`¿Borrar la serie ${setLabel(s, ex.type)}?`)) S.deleteSet(s);
  });
  $('#note').onchange = (e) => S.setNote(state.userId, ex.id, e.target.value);
  $('#photo').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { S.setPhoto(ex.id, await resizeImage(f, 640)); toast('Foto guardada para todos 📸'); }
    catch { toast('No se pudo cargar la foto'); }
  };
  $('#delPhoto') && ($('#delPhoto').onclick = () => { if (confirm('¿Quitar la foto de esta máquina?')) S.setPhoto(ex.id, null); });
  bindChart(ss, ex);
}

// ---------------- caminata con GPS ----------------
function paintWalk() {
  const w = GPS.walk;
  const card = $('#walkCard');
  if (card) {
    if (!w) {
      card.innerHTML = `
        <h2>📍 Caminata con GPS</h2>
        <p class="muted small">Pulsa empezar al salir de casa y terminar al llegar: se guardan solos los minutos y los kilómetros.
        Deja la app abierta (la pantalla no se apagará); si la cierras, el tiempo sigue contando pero los km no.</p>
        <button class="btn big" id="walkStart">▶ Empezar a caminar</button>`;
      $('#walkStart').onclick = () => { TM.unlockAudio(); GPS.startWalk(location.hash.split('/')[2]); };
    } else {
      const t = GPS.elapsed(), km = w.meters / 1000;
      const pace = km > 0.05 ? t / 60 / km : null;
      card.innerHTML = `
        <h2>📍 Caminando… <small>${w.error ? `⚠️ ${esc(w.error)}` : w.acc ? `GPS ±${w.acc} m` : 'buscando señal…'}</small></h2>
        <div class="walk-stats">
          <div><b>${TM.fmtClock(t)}</b><span>tiempo</span></div>
          <div><b>${fmtNum(Math.round(km * 100) / 100)}</b><span>km</span></div>
          <div><b>${pace ? `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, '0')}` : '–'}</b><span>min/km</span></div>
        </div>
        <div class="t-btns">
          <button class="btn" id="walkStop">■ Terminar y guardar</button>
          <button class="btn ghost" id="walkCancel">Cancelar</button>
        </div>`;
      $('#walkStop').onclick = () => {
        const r = GPS.stopWalk();
        if (r) { S.addSet({ user_id: state.userId, exercise_id: r.exId, day: today(), weight: r.km, reps: r.minutes }); toast(`🚶 Guardado: ${fmtNum(r.km)} km en ${r.minutes} min`); }
      };
      $('#walkCancel').onclick = () => { if (confirm('¿Descartar esta caminata?')) GPS.stopWalk(); };
    }
  }
  // aviso flotante si se está caminando y estás en otra pantalla
  const bar = $('#walkbar');
  const show = !!w && !card;
  bar.hidden = !show;
  if (show) bar.innerHTML = `<a href="#/e/${w.exId}">📍 Caminando · <b>${TM.fmtClock(GPS.elapsed())}</b> · ${fmtNum(Math.round(w.meters / 10) / 100)} km</a>`;
}
GPS.onWalk(paintWalk);
setInterval(() => { if (GPS.walk) paintWalk(); }, 1000);

// ---------------- HIIT / clases ----------------
function renderClass(ex) {
  const u = me();
  const td = today();
  const acts = myActs().filter((a) => a.exercise_id === ex.id).sort((a, b) => (a.day + a.created_at < b.day + b.created_at ? 1 : -1));
  const tdA = acts.filter((a) => a.day === td);
  const prev = acts.find((a) => a.day < td);
  const d = state.draft[ex.id] ||= { min: prev?.minutes || 50, rpe: prev?.rpe || 8, note: '' };
  const ri = rpeInfo(d.rpe);
  const kcalOf = (a) => effort([], [a], u).kcal;
  const loadOf = (a) => Math.round(a.minutes * a.rpe);

  layout(esc(ex.name), `
    <section class="ex-head">
      <div class="media">${iconSvg(ex.icon, 'big')}</div>
      <div class="ex-meta">
        <span class="chip">${esc(ex.brand)}</span>
        ${prev ? `<div class="best">La última vez<b>${rpeInfo(prev.rpe).face} ${prev.rpe}/10</b><small>${relDay(prev.day)} · ${prev.minutes} min</small></div>` : ''}
        ${!u.weight_kg ? '<a class="btn small ghost" href="#/perfil">⚖️ Pon tu peso para ver kcal</a>' : ''}
      </div>
    </section>

    ${tdA.length ? `
    <section class="card compare">
      <div class="cmp-face big-face">${rpeInfo(tdA[0].rpe).face}</div>
      <div class="grow">
        <h2>Hoy: ${rpeInfo(tdA[0].rpe).label}</h2>
        <p class="muted">${tdA[0].minutes} min · carga ${loadOf(tdA[0])}${kcalOf(tdA[0]) ? ` · ~${kcalOf(tdA[0])} kcal` : ''}</p>
        ${prev ? (() => { const l = light(loadOf(tdA[0]), loadOf(prev)); return `<p>${LIGHT_FACE[l]} ${frase(l, td + ex.id)}</p>`; })() : ''}
      </div>
    </section>` : ''}

    <section class="card entry">
      <h2>${tdA.length ? 'Añadir otra sesión' : 'Registrar la sesión de hoy'}</h2>
      <div class="steppers one">${stepper('min', 'minutos', d.min, 5)}</div>
      <div class="rpe">
        <div class="rpe-top"><span>¿Cómo de dura?</span><b id="rpeLbl">${ri.face} ${d.rpe}/10 · ${ri.label}</b></div>
        <input type="range" id="rpe" min="1" max="10" step="1" value="${d.rpe}">
        <div class="rpe-scale"><span>😌</span><span>😅</span><span>🥵</span><span>💀</span></div>
      </div>
      <textarea id="actNote" rows="3" placeholder="¿Qué os ha hecho hacer hoy? Burpees, kettlebell, comba…">${esc(d.note)}</textarea>
      <button class="btn big" id="addAct">💀 Sobreviví. Registrar</button>
    </section>

    ${acts.length ? `
    <section class="card">
      <h2>Historial</h2>
      ${acts.slice(0, 20).map((a, i) => { const p = acts[i + 1]; const l = p ? light(loadOf(a), loadOf(p)) : 'new'; return `
        <div class="hist-row act">
          <i class="dot ${l}"></i>
          <span class="hd">${fmtDayShort(a.day)}</span>
          <span class="grow"><b>${rpeInfo(a.rpe).face} ${a.rpe}/10</b> · ${a.minutes} min${kcalOf(a) ? ` · ~${kcalOf(a)} kcal` : ''}
            ${a.note ? `<small class="note">${esc(a.note)}</small>` : ''}</span>
          <button class="x" data-delact="${a.id}" aria-label="Borrar">✕</button>
        </div>`; }).join('')}
    </section>` : ''}
  `, { back: `#/g/${ex.group}`, nav: 'train' });

  bindSteppers(d);
  $('#rpe').oninput = (e) => { d.rpe = +e.target.value; const r = rpeInfo(d.rpe); $('#rpeLbl').textContent = `${r.face} ${d.rpe}/10 · ${r.label}`; };
  $('#actNote').oninput = (e) => (d.note = e.target.value);
  $('#addAct').onclick = () => {
    if (!(d.min > 0)) return toast('Pon los minutos 😉');
    S.addActivity({ user_id: state.userId, exercise_id: ex.id, day: td, minutes: d.min, rpe: d.rpe, note: d.note.trim() });
    toast(d.rpe >= 9 ? '💀 Pablo 1 – Tú 0. ¡Registrado!' : '🔥 ¡Registrado!');
    d.note = '';
  };
  $$('[data-delact]').forEach((b) => b.onclick = () => {
    const a = acts.find((x) => x.id === b.dataset.delact);
    if (a && confirm(`¿Borrar la sesión del ${fmtDayShort(a.day)}?`)) S.deleteActivity(a);
  });
}

// ---------------- perfil ----------------
function renderProfile() {
  const u = me();
  const imc = u.weight_kg && u.height_cm ? u.weight_kg / (u.height_cm / 100) ** 2 : null;
  const imcTxt = !imc ? '' : imc < 18.5 ? 'bajo' : imc < 25 ? 'normal' : imc < 30 ? 'sobrepeso (o mucho músculo 😏)' : 'alto';
  layout('Mi perfil', `
    <section class="card profile">
      <div class="emojis">${EMOJIS.map((e) => `<button type="button" class="emo ${e === u.emoji ? 'on' : ''}" data-e="${e}">${e}</button>`).join('')}</div>
      <label>Nombre<input id="pName" maxlength="20" value="${esc(u.name)}" autocomplete="off"></label>
      <div class="seg sex" role="radiogroup">
        <button type="button" data-sex="h" class="${u.sex === 'h' ? 'on' : ''}">🙋‍♂️ Hombre</button>
        <button type="button" data-sex="m" class="${u.sex === 'm' ? 'on' : ''}">🙋‍♀️ Mujer</button>
      </div>
      <div class="two">
        <label>Edad<input id="pAge" inputmode="numeric" value="${u.age ?? ''}" placeholder="35"></label>
        <span></span>
        <label>Peso (kg)<input id="pKg" inputmode="decimal" value="${u.weight_kg ?? ''}" placeholder="80"></label>
        <label>Altura (cm)<input id="pCm" inputmode="numeric" value="${u.height_cm ?? ''}" placeholder="178"></label>
      </div>
      ${imc ? `<p class="muted">IMC ${fmtNum(Math.round(imc * 10) / 10)} · ${imcTxt}</p>` : ''}
      <p class="muted small">Con sexo, edad, peso y altura calculo tu metabolismo basal (fórmula Mifflin-St Jeor) y con él las kcal. Aun así es una aproximación (±20-30 %): sin pulsómetro no se puede afinar más.</p>
      <button class="btn big" id="pSave">Guardar</button>
    </section>
    <a class="btn big ghost" href="#/">👥 Cambiar de usuario</a>
    <p class="muted small center">Iconos de grupos: Fluent Emoji © Microsoft (licencia MIT)</p>`, { back: '#/home', nav: null });
  let emoji = u.emoji, sex = u.sex || null;
  $$('.emo').forEach((b) => b.onclick = () => { emoji = b.dataset.e; $$('.emo').forEach((x) => x.classList.toggle('on', x === b)); });
  $$('[data-sex]').forEach((b) => b.onclick = () => { sex = b.dataset.sex; $$('[data-sex]').forEach((x) => x.classList.toggle('on', x === b)); });
  $('#pSave').onclick = () => {
    const name = $('#pName').value.trim();
    if (!name) return toast('Ponte un nombre 😅');
    if (S.getUsers().some((x) => x.id !== u.id && x.name.toLowerCase() === name.toLowerCase())) return toast('Ese nombre ya existe 😅');
    const num = (v) => { const n = parseFloat(String(v).replace(',', '.')); return n > 0 ? n : null; };
    S.updateUser({ ...u, name, emoji, sex, age: num($('#pAge').value), weight_kg: num($('#pKg').value), height_cm: num($('#pCm').value) });
    toast('Perfil guardado 💪');
    go('#/home');
  };
}

function bindSteppers(d) {
  $$('.stp').forEach((b) => b.onclick = () => {
    const k = b.dataset.k; const inp = $(`#inp-${k}`);
    const v = Math.max(0, Math.round(((parseFloat(inp.value.replace(',', '.')) || 0) + parseFloat(b.dataset.step)) * 100) / 100);
    inp.value = v; d[k] = v;
  });
  $$('.stp-inp').forEach((inp) => inp.oninput = () => { d[inp.dataset.k] = parseFloat(inp.value.replace(',', '.')) || 0; });
}

function stepper(k, label, val, step) {
  return `
    <div class="stepper">
      <span class="lbl">${label}</span>
      <div class="row">
        <button class="stp" data-k="${k}" data-step="${-step}" aria-label="menos">−</button>
        <input class="stp-inp" id="inp-${k}" data-k="${k}" inputmode="decimal" value="${val}">
        <button class="stp" data-k="${k}" data-step="${step}" aria-label="más">＋</button>
      </div>
    </div>`;
}

function resizeImage(file, max) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      res(c.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

// ---------------- gráfica de evolución ----------------
function chartData(ss, ex) {
  const pts = ss.slice(0, 12).reverse();
  return pts.map((x) => ({ day: x.day, v: state.chartMetric === 'volume' ? x.volume : (x.best ? (ex.type === 'weight' || ex.type === 'cardio' ? x.best.weight : x.best.reps) : 0) }));
}
function chartCard(ss, ex) {
  const bestName = ex.type === 'weight' ? 'Peso máx.' : ex.type === 'cardio' ? 'Km máx.' : ex.type === 'time' ? 'Tiempo máx.' : 'Reps máx.';
  return `
    <section class="card">
      <div class="chart-head"><h2>Evolución</h2>
        <div class="seg">
          <button data-m="volume" class="${state.chartMetric === 'volume' ? 'on' : ''}">Volumen</button>
          <button data-m="best" class="${state.chartMetric === 'best' ? 'on' : ''}">${bestName}</button>
        </div>
      </div>
      <div class="chart" id="chart"></div>
      <div class="chart-tip" id="chartTip">Toca un punto para ver el valor</div>
    </section>`;
}
function bindChart(ss, ex) {
  const el = $('#chart'); if (!el) return;
  $$('.seg button').forEach((b) => b.onclick = () => { state.chartMetric = b.dataset.m; renderExercise(ex.id); $('#chart').scrollIntoView({ block: 'center' }); });
  const data = chartData(ss, ex);
  const W = 320, H = 150, pl = 8, pr = 8, pt = 14, pb = 22;
  const vals = data.map((d) => d.v);
  let min = Math.min(...vals), max = Math.max(...vals);
  if (min === max) { min = min * 0.9; max = max * 1.1 || 1; }
  const pad = (max - min) * 0.15; min -= pad; max += pad;
  const x = (i) => pl + (data.length === 1 ? (W - pl - pr) / 2 : (i * (W - pl - pr)) / (data.length - 1));
  const y = (v) => pt + (1 - (v - min) / (max - min)) * (H - pt - pb);
  const fmt = (v) => (state.chartMetric === 'volume' ? volumeLabel(v, ex.type) : `${fmtNum(v)}${ex.type === 'weight' ? ' kg' : ex.type === 'cardio' ? ' km' : ex.type === 'time' ? ' s' : ' reps'}`);
  const grid = [0.25, 0.5, 0.75].map((f) => `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${pt + f * (H - pt - pb)}" y2="${pt + f * (H - pt - pb)}"/>`).join('');
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.v).toFixed(1)}`).join(' ');
  const labels = data.map((d, i) => (i === 0 || i === data.length - 1 || data.length <= 6) ? `<text class="axis" x="${x(i)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}">${fmtDayShort(d.day)}</text>` : '').join('');
  const last = data[data.length - 1];
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="line-chart">
    ${grid}<line class="base" x1="${pl}" x2="${W - pr}" y1="${H - pb}" y2="${H - pb}"/>
    <path d="${path}" class="ln"/>
    ${data.map((d, i) => `<circle class="pt" cx="${x(i)}" cy="${y(d.v)}" r="4.5"/><circle class="hit" data-i="${i}" cx="${x(i)}" cy="${y(d.v)}" r="16"/>`).join('')}
    <text class="lbl-last" x="${x(data.length - 1)}" y="${y(last.v) - 9}" text-anchor="end">${fmt(last.v)}</text>
    ${labels}
  </svg>`;
  $$('.hit', el).forEach((c) => {
    const show = () => {
      const d = data[+c.dataset.i];
      $('#chartTip').innerHTML = `<b>${fmtDayShort(d.day)}</b> · ${fmt(d.v)}`;
      $$('.pt', el).forEach((p, j) => p.classList.toggle('sel', j === +c.dataset.i));
    };
    c.onclick = show; c.onmouseenter = show;
  });
}

// ---------------- calendario ----------------
function renderCalendar() {
  const sets = mySets();
  const t = parseDay(today());
  const [y, m] = state.calMonth || [t.getFullYear(), t.getMonth()];
  const first = new Date(y, m, 1);
  const offset = (first.getDay() + 6) % 7;
  const nDays = new Date(y, m + 1, 0).getDate();
  const byDay = {};
  [...sets, ...myActs()].forEach((s) => { const g = groupById(exerciseById(s.exercise_id)?.group); if (g) (byDay[s.day] ||= new Set()).add(g.emoji); });
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push('<span class="cd empty"></span>');
  for (let dd = 1; dd <= nDays; dd++) {
    const ds = dayStr(new Date(y, m, dd));
    const em = byDay[ds] ? [...byDay[ds]].slice(0, 3).join('') : '';
    cells.push(`<a class="cd ${ds === today() ? 'today' : ''} ${em ? 'done' : ''}" href="#/day/${ds}"><b>${dd}</b><span>${em}</span></a>`);
  }
  const monthDays = Object.keys(byDay).filter((d) => d.startsWith(`${y}-${String(m + 1).padStart(2, '0')}`)).length;
  layout('Calendario', `
    <div class="cal-nav">
      <button class="btn small ghost" id="pm">‹</button>
      <h2>${monthName(y, m)}</h2>
      <button class="btn small ghost" id="nm">›</button>
    </div>
    <p class="muted center">${monthDays} ${monthDays === 1 ? 'día entrenado' : 'días entrenados'} este mes ${monthDays >= 12 ? '🔥' : monthDays >= 6 ? '💪' : monthDays ? '🙂' : '🛋️'}</p>
    <div class="cal">
      ${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((l) => `<span class="ch">${l}</span>`).join('')}
      ${cells.join('')}
    </div>`, { nav: 'cal' });
  $('#pm').onclick = () => { state.calMonth = m === 0 ? [y - 1, 11] : [y, m - 1]; renderCalendar(); };
  $('#nm').onclick = () => { state.calMonth = m === 11 ? [y + 1, 0] : [y, m + 1]; renderCalendar(); };
}

function renderDay(ds) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ds || '')) return go('#/cal');
  const sets = mySets();
  const daySets = sets.filter((s) => s.day === ds);
  const exIds = [...new Set(daySets.map((s) => s.exercise_id))];
  const dayActs = myActs().filter((a) => a.day === ds);
  const eff = effort(daySets, dayActs, me());
  layout(fmtDayShort(ds), `
    <p class="muted center">${fmtDayLong(ds)}</p>
    ${exIds.length || dayActs.length ? `<p class="center day-eff">⚡ Carga ${fmtNum(eff.load)} · ⏱️ ~${eff.min} min${eff.kcal !== null ? ` · 🔥 ~${fmtNum(eff.kcal)} kcal` : ''}</p>` : ''}
    ${dayActs.map((a) => { const ex = exerciseById(a.exercise_id); return !ex ? '' : `
      <a class="card day-ex" href="#/e/${ex.id}">
        ${thumb(ex)}
        <span class="grow"><b>${esc(ex.name)}</b>
          <small>${a.minutes} min · ${rpeInfo(a.rpe).label}</small>
          ${a.note ? `<small class="note">${esc(a.note)}</small>` : ''}</span>
        <span class="face">${rpeInfo(a.rpe).face}</span>
      </a>`; }).join('')}
    ${exIds.length || dayActs.length ? exIds.map((id) => {
      const ex = exerciseById(id); if (!ex) return '';
      const ss = sessions(sets, id);
      const i = ss.findIndex((x) => x.day === ds);
      const lx = light(ss[i].volume, ss[i + 1]?.volume);
      return `
      <a class="card day-ex" href="#/e/${id}">
        ${thumb(ex)}
        <span class="grow"><b>${esc(ex.name)}</b>
          <span class="set-chips small">${ss[i].sets.map((s) => `<span class="set-chip ${s.warmup ? 'warm' : ''}">${setLabel(s, ex.type)}</span>`).join('')}</span>
          <small>${volumeLabel(ss[i].volume, ex.type)}</small></span>
        <span class="face">${LIGHT_FACE[lx]}</span>
      </a>`; }).join('')
    : `<div class="empty-day">🛋️<p>Día de descanso${ds === today() ? '… de momento' : ''}.</p></div>`}
  `, { back: '#/cal', nav: 'cal' });
}

// ---------------- temporizador ----------------
const PRESETS = [
  { name: 'Tabata', work: 20, rest: 10, rounds: 8, prep: 10 },
  { name: 'Circuito', work: 45, rest: 15, rounds: 10, prep: 10 },
  { name: 'EMOM 1′', work: 50, rest: 10, rounds: 10, prep: 10 },
];
function renderTimer() {
  const c = state.interval;
  const running = TM.T.mode === 'interval' || TM.T.phase === 'done';
  layout('Temporizador', `
    <section class="card timer-big" id="tbig"></section>
    <section class="card" ${running ? 'hidden' : ''}>
      <h2>⏸️ Descanso entre series</h2>
      <div class="presets">${[45, 60, 90, 120, 180].map((s) => `<button class="btn ghost" data-rest="${s}">${TM.fmtClock(s)}</button>`).join('')}</div>
    </section>
    <section class="card" ${running ? 'hidden' : ''}>
      <h2>🔁 Intervalos: Tabata / Circuito</h2>
      <div class="presets">${PRESETS.map((p, i) => `<button class="btn ghost small" data-preset="${i}">${p.name}</button>`).join('')}</div>
      <div class="int-grid">
        ${intField('work', 'Trabajo (s)', c.work, 5)}
        ${intField('rest', 'Descanso (s)', c.rest, 5)}
        ${intField('rounds', 'Rondas', c.rounds, 1)}
        ${intField('prep', 'Preparación (s)', c.prep, 5)}
      </div>
      <p class="muted center">Total: ${TM.fmtClock(c.prep + c.rounds * c.work + (c.rounds - 1) * c.rest)}</p>
      <button class="btn big" id="startInt">▶ Empezar</button>
    </section>`, { nav: 'timer', back: me() ? null : '#/' });
  $$('[data-rest]').forEach((b) => b.onclick = () => TM.startRest(+b.dataset.rest));
  $$('[data-preset]').forEach((b) => b.onclick = () => { const p = PRESETS[+b.dataset.preset]; state.interval = { work: p.work, rest: p.rest, rounds: p.rounds, prep: p.prep }; ls.set('gym.interval', state.interval); renderTimer(); });
  $$('.istp').forEach((b) => b.onclick = () => {
    const k = b.dataset.k; state.interval[k] = Math.max(k === 'rounds' || k === 'work' ? 1 : 0, state.interval[k] + +b.dataset.step);
    ls.set('gym.interval', state.interval); renderTimer();
  });
  $('#startInt').onclick = () => TM.startInterval(state.interval);
  paintTimer();
}
function intField(k, label, v, step) {
  return `<div class="stepper"><span class="lbl">${label}</span><div class="row">
    <button class="istp stp" data-k="${k}" data-step="${-step}">−</button><output>${v}</output><button class="istp stp" data-k="${k}" data-step="${step}">＋</button></div></div>`;
}

const PHASE = { prep: ['Prepárate', 'prep'], work: ['¡DALE!', 'work'], rest: ['Descansa', 'rest'] };
function paintTimer() {
  const T = TM.T;
  const big = $('#tbig');
  if (big) {
    if (!T.mode && T.phase === 'done') {
      big.className = 'card timer-big done';
      big.innerHTML = `<div class="t-phase">🎉 ¡Terminado!</div><div class="t-clock">💀</div><p>Has sobrevivido a ${T.cfg.rounds} rondas.</p><button class="btn" id="tReset">Vale, otra</button>`;
      $('#tReset').onclick = () => { T.phase = ''; renderTimer(); };
    } else if (!T.mode) {
      big.className = 'card timer-big idle';
      big.innerHTML = `<div class="t-clock">0:00</div><p class="muted">Elige un descanso o configura intervalos</p>`;
    } else {
      const [label, cls] = T.mode === 'rest' ? ['Descanso', 'rest'] : PHASE[T.phase] || ['', ''];
      const r = TM.remaining();
      const frac = T.total ? r / T.total : 0;
      big.className = `card timer-big ${cls}`;
      big.innerHTML = `
        <div class="t-phase">${label}${T.mode === 'interval' && T.round ? ` · ronda ${T.round}/${T.cfg.rounds}` : ''}</div>
        <div class="t-clock">${TM.fmtClock(r)}</div>
        <div class="bar"><span style="width:${(frac * 100).toFixed(1)}%"></span></div>
        <div class="t-btns">
          ${T.mode === 'rest' ? '<button class="btn ghost" data-add="-15">−15</button>' : ''}
          <button class="btn" id="tPause">${T.paused ? '▶ Seguir' : '⏸ Pausa'}</button>
          <button class="btn ghost" id="tStop">■ Parar</button>
          ${T.mode === 'rest' ? '<button class="btn ghost" data-add="15">+15</button>' : ''}
        </div>`;
      $('#tPause').onclick = TM.togglePause;
      $('#tStop').onclick = () => { TM.stop(); renderTimer(); };
      $$('[data-add]', big).forEach((b) => b.onclick = () => TM.addRest(+b.dataset.add));
    }
  }
  // mini barra en el resto de pantallas
  const mini = $('#mini');
  const onTimer = location.hash.startsWith('#/timer');
  mini.hidden = !T.mode || onTimer;
  if (T.mode && !onTimer) {
    const label = T.mode === 'rest' ? 'Descanso' : (PHASE[T.phase] || [''])[0];
    mini.className = `mini ${T.mode === 'rest' ? 'rest' : T.phase}`;
    mini.innerHTML = `<a href="#/timer" class="grow">⏱️ ${label} <b>${TM.fmtClock(TM.remaining())}</b></a>
      ${T.mode === 'rest' ? '<button data-madd="15">+15</button>' : ''}<button id="mStop">✕</button>`;
    $('#mStop').onclick = TM.stop;
    $('[data-madd]', mini) && ($('[data-madd]', mini).onclick = () => TM.addRest(15));
  }
}
// En la pantalla del temporizador se repinta entera solo cuando cambia de "parado" a "en marcha" (o al terminar)
let lastMode = '';
TM.onTimer(() => {
  const key = `${TM.T.mode}|${TM.T.phase === 'done'}`;
  const changed = key !== lastMode; lastMode = key;
  if (changed && location.hash.startsWith('#/timer')) return renderTimer();
  paintTimer();
});

// ---------------- utilidades ----------------
let toastT;
function toast(msg, cls = '') {
  const t = $('#toast');
  t.textContent = msg; t.className = `toast show ${cls}`;
  clearTimeout(toastT); toastT = setTimeout(() => (t.className = 'toast'), cls === 'pr' ? 3500 : 2200);
}

// Re-pintar cuando cambian datos (sin pisar lo que el usuario está escribiendo)
S.onChange(() => {
  const a = document.activeElement;
  if (a && (a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && a.type !== 'checkbox' && a.type !== 'file'))) return;
  const y = window.scrollY; route(); window.scrollTo(0, y);
});

// ---------------- arranque ----------------
S.init();
navigator.storage?.persist?.().catch(() => {});
if (!location.hash || location.hash === '#/') { if (me()) location.hash = '#/home'; }
window.addEventListener('hashchange', route);
route();

// Service worker + aviso de actualización
// (en localhost no se activa, para ver los cambios al momento mientras desarrollamos)
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').then((reg) => {
    const ask = (w) => {
      const b = $('#update'); b.hidden = false;
      b.onclick = () => w.postMessage('skip');
    };
    if (reg.waiting && navigator.serviceWorker.controller) ask(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) ask(w); });
    });
    setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
  }).catch(() => {});
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
}
