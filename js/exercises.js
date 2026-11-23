// Catálogo de ejercicios. Solo se edita aquí (los usuarios no pueden añadir).
// type: 'weight' (kg × reps) | 'bodyweight' (kg extra × reps) | 'time' (segundos) | 'cardio' (km + minutos)
// icon: nombre del dibujo en icons.js
// brand: marca/línea de la máquina (orientativo, se corrige cuando me digas las del gimnasio)

export const GROUPS = [
  { id: 'pecho',   name: 'Pecho',    emoji: '🦍', icon: 'benchPress' },
  { id: 'espalda', name: 'Espalda',  emoji: '🦅', icon: 'latPulldown' },
  { id: 'hombro',  name: 'Hombro',   emoji: '🥥', icon: 'shoulderPress' },
  { id: 'biceps',  name: 'Bíceps',   emoji: '💪', icon: 'curl' },
  { id: 'triceps', name: 'Tríceps',  emoji: '🔱', icon: 'pushdown' },
  { id: 'pierna',  name: 'Pierna',   emoji: '🍗', icon: 'squat' },
  { id: 'gluteo',  name: 'Glúteo',   emoji: '🍑', icon: 'hipThrust' },
  { id: 'abdomen', name: 'Abdomen',  emoji: '🍫', icon: 'crunch' },
  { id: 'cardio',  name: 'Cardio',   emoji: '🏃', icon: 'run' },
  { id: 'hiit',    name: 'HIIT',     emoji: '💀', icon: 'hiit' },
];

export const EXERCISES = [
  // PECHO
  { id: 'press-banca',          group: 'pecho', name: 'Press de banca',            brand: 'Barra libre',      icon: 'benchPress',   type: 'weight' },
  { id: 'press-inclinado-mancu',group: 'pecho', name: 'Press inclinado mancuernas',brand: 'Mancuernas',       icon: 'inclinePress', type: 'weight' },
  { id: 'hs-iso-chest',         group: 'pecho', name: 'Press pecho Iso-Lateral',   brand: 'Hammer Strength',  icon: 'chestPress',   type: 'weight' },
  { id: 'hs-iso-incline',       group: 'pecho', name: 'Press inclinado Iso-Lateral',brand: 'Hammer Strength', icon: 'inclinePress', type: 'weight' },
  { id: 'tg-chest-press',       group: 'pecho', name: 'Chest Press',               brand: 'Technogym',        icon: 'chestPress',   type: 'weight' },
  { id: 'tg-pectoral',          group: 'pecho', name: 'Contractor de pecho (Pec Deck)', brand: 'Technogym',   icon: 'fly',          type: 'weight' },
  { id: 'cruce-poleas',         group: 'pecho', name: 'Cruce de poleas',           brand: 'Polea',            icon: 'fly',          type: 'weight' },
  { id: 'fondos',               group: 'pecho', name: 'Fondos en paralelas',       brand: 'Peso corporal',    icon: 'dips',         type: 'bodyweight' },

  // ESPALDA
  { id: 'dominadas',            group: 'espalda', name: 'Dominadas',               brand: 'Peso corporal',    icon: 'pullup',       type: 'bodyweight' },
  { id: 'tg-jalon',             group: 'espalda', name: 'Jalón al pecho',          brand: 'Technogym',        icon: 'latPulldown',  type: 'weight' },
  { id: 'hs-iso-pulldown',      group: 'espalda', name: 'Jalón Iso-Lateral',       brand: 'Hammer Strength',  icon: 'latPulldown',  type: 'weight' },
  { id: 'hs-iso-row',           group: 'espalda', name: 'Remo Iso-Lateral',        brand: 'Hammer Strength',  icon: 'seatedRow',    type: 'weight' },
  { id: 'tg-low-row',           group: 'espalda', name: 'Remo bajo (Low Row)',     brand: 'Technogym',        icon: 'seatedRow',    type: 'weight' },
  { id: 'remo-polea',           group: 'espalda', name: 'Remo en polea baja',      brand: 'Polea',            icon: 'seatedRow',    type: 'weight' },
  { id: 'remo-barra',           group: 'espalda', name: 'Remo con barra',          brand: 'Barra libre',      icon: 'bentRow',      type: 'weight' },
  { id: 'peso-muerto',          group: 'espalda', name: 'Peso muerto',             brand: 'Barra libre',      icon: 'deadlift',     type: 'weight' },

  // HOMBRO
  { id: 'press-militar',        group: 'hombro', name: 'Press militar',            brand: 'Barra / mancuernas', icon: 'shoulderPress', type: 'weight' },
  { id: 'hs-iso-shoulder',      group: 'hombro', name: 'Press hombro Iso-Lateral', brand: 'Hammer Strength',  icon: 'shoulderPress',type: 'weight' },
  { id: 'tg-shoulder-press',    group: 'hombro', name: 'Shoulder Press',           brand: 'Technogym',        icon: 'shoulderPress',type: 'weight' },
  { id: 'elev-laterales',       group: 'hombro', name: 'Elevaciones laterales',    brand: 'Mancuernas',       icon: 'lateralRaise', type: 'weight' },
  { id: 'g80-lateral',          group: 'hombro', name: 'Elevación lateral máquina',brand: 'Gym80',            icon: 'lateralRaise', type: 'weight' },
  { id: 'face-pull',            group: 'hombro', name: 'Face pull',                brand: 'Polea',            icon: 'facePull',     type: 'weight' },
  { id: 'pajaros-maquina',      group: 'hombro', name: 'Pájaros en máquina (Rear Delt)', brand: 'Technogym',  icon: 'fly',          type: 'weight' },

  // BÍCEPS
  { id: 'curl-barra',           group: 'biceps', name: 'Curl con barra',           brand: 'Barra libre',      icon: 'curl',         type: 'weight' },
  { id: 'curl-mancuernas',      group: 'biceps', name: 'Curl con mancuernas',      brand: 'Mancuernas',       icon: 'curl',         type: 'weight' },
  { id: 'curl-martillo',        group: 'biceps', name: 'Curl martillo',            brand: 'Mancuernas',       icon: 'curl',         type: 'weight' },
  { id: 'curl-polea',           group: 'biceps', name: 'Curl en polea',            brand: 'Polea',            icon: 'curl',         type: 'weight' },
  { id: 'g80-curl',             group: 'biceps', name: 'Curl predicador máquina',  brand: 'Gym80',            icon: 'curl',         type: 'weight' },

  // TRÍCEPS
  { id: 'pushdown',             group: 'triceps', name: 'Extensión en polea (cuerda)', brand: 'Polea',        icon: 'pushdown',     type: 'weight' },
  { id: 'press-frances',        group: 'triceps', name: 'Press francés',           brand: 'Barra Z',          icon: 'overheadExt',  type: 'weight' },
  { id: 'ext-tras-nuca',        group: 'triceps', name: 'Extensión tras nuca',     brand: 'Mancuerna',        icon: 'overheadExt',  type: 'weight' },
  { id: 'g80-dips',             group: 'triceps', name: 'Fondos en máquina',       brand: 'Gym80',            icon: 'dips',         type: 'weight' },

  // PIERNA
  { id: 'sentadilla',           group: 'pierna', name: 'Sentadilla',               brand: 'Barra libre',      icon: 'squat',        type: 'weight' },
  { id: 'hs-v-squat',           group: 'pierna', name: 'V-Squat',                  brand: 'Hammer Strength',  icon: 'squat',        type: 'weight' },
  { id: 'hs-leg-press',         group: 'pierna', name: 'Prensa de piernas',        brand: 'Hammer Strength',  icon: 'legPress',     type: 'weight' },
  { id: 'tg-leg-ext',           group: 'pierna', name: 'Extensión de cuádriceps',  brand: 'Technogym',        icon: 'legExtension', type: 'weight' },
  { id: 'tg-leg-curl',          group: 'pierna', name: 'Curl femoral tumbado',     brand: 'Technogym',        icon: 'legCurl',      type: 'weight' },
  { id: 'zancadas',             group: 'pierna', name: 'Zancadas',                 brand: 'Mancuernas',       icon: 'lunge',        type: 'weight' },
  { id: 'gemelo-maquina',       group: 'pierna', name: 'Gemelo de pie',            brand: 'Gym80',            icon: 'calfRaise',    type: 'weight' },

  // GLÚTEO
  { id: 'hip-thrust',           group: 'gluteo', name: 'Hip thrust',               brand: 'Barra libre',      icon: 'hipThrust',    type: 'weight' },
  { id: 'g80-hip-thrust',       group: 'gluteo', name: 'Hip thrust máquina',       brand: 'Gym80',            icon: 'hipThrust',    type: 'weight' },
  { id: 'tg-abductor',          group: 'gluteo', name: 'Abductores',               brand: 'Technogym',        icon: 'abductor',     type: 'weight' },
  { id: 'peso-muerto-rumano',   group: 'gluteo', name: 'Peso muerto rumano',       brand: 'Barra libre',      icon: 'deadlift',     type: 'weight' },
  { id: 'patada-polea',         group: 'gluteo', name: 'Patada de glúteo en polea',brand: 'Polea',            icon: 'lunge',        type: 'weight' },

  // ABDOMEN
  { id: 'crunch',               group: 'abdomen', name: 'Crunch',                  brand: 'Peso corporal',    icon: 'crunch',       type: 'bodyweight' },
  { id: 'tg-abdominal',         group: 'abdomen', name: 'Crunch en máquina',       brand: 'Technogym',        icon: 'crunch',       type: 'weight' },
  { id: 'plancha',              group: 'abdomen', name: 'Plancha',                 brand: 'Peso corporal',    icon: 'plank',        type: 'time' },
  { id: 'elev-piernas',         group: 'abdomen', name: 'Elevación de piernas colgado', brand: 'Peso corporal', icon: 'pullup',     type: 'bodyweight' },

  // CARDIO
  { id: 'cinta',                group: 'cardio', name: 'Cinta de correr',          brand: 'Technogym',        icon: 'run',          type: 'cardio' },
  { id: 'bici',                 group: 'cardio', name: 'Bicicleta estática',       brand: 'Technogym',        icon: 'bike',         type: 'cardio' },
  { id: 'eliptica',             group: 'cardio', name: 'Elíptica',                 brand: 'Technogym',        icon: 'run',          type: 'cardio' },

  // HIIT / CLASES (se registra duración + dureza + nota, no series)
  { id: 'hiit-pablo',           group: 'hiit',   name: 'HIIT con Pablo',           brand: 'Full body · alta intensidad', icon: 'hiit', type: 'class' },
];

// Salto por defecto del peso según el material (sin decimales salvo que se elija 2,5)
export function defaultStep(ex) {
  if (ex.type === 'cardio') return 0.5;
  if (/mancuerna/i.test(ex.brand)) return 2;   // mancuernas Technogym de 2 en 2
  if (ex.type === 'bodyweight' || ex.type === 'time') return 2;
  return 5;                                     // máquinas, barras y poleas
}
export const STEP_OPTIONS = [1, 2, 2.5, 5];

export const exerciseById = (id) => EXERCISES.find((e) => e.id === id);
export const groupById = (id) => GROUPS.find((g) => g.id === id);
export const exercisesOf = (groupId) => EXERCISES.filter((e) => e.group === groupId);

// Etiquetas de los campos según tipo de ejercicio
export const FIELDS = {
  weight:     { a: 'kg',       b: 'reps', stepA: 2.5, stepB: 1 },
  bodyweight: { a: 'kg extra', b: 'reps', stepA: 2.5, stepB: 1 },
  time:       { a: 'kg extra', b: 'seg',  stepA: 2.5, stepB: 5 },
  cardio:     { a: 'km',       b: 'min',  stepA: 0.5, stepB: 1 },
};
