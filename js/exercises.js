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
  { id: 'press-banca',          group: 'pecho', name: 'Press de banca',                brand: 'Barra libre',        icon: 'benchPress',     type: 'weight' },
  { id: 'press-plano-mancu',    group: 'pecho', name: 'Press plano con mancuernas',    brand: 'Mancuernas',         icon: 'dbPress',        type: 'weight' },
  { id: 'press-inclinado-mancu',group: 'pecho', name: 'Press inclinado con mancuernas',brand: 'Mancuernas',         icon: 'inclinePress',   type: 'weight' },
  { id: 'aperturas-mancu',      group: 'pecho', name: 'Aperturas con mancuernas',      brand: 'Mancuernas',         icon: 'dbFly',          type: 'weight' },
  { id: 'hs-press-plano',       group: 'pecho', name: 'Press de pecho plano',          brand: 'Hammer Strength',    icon: 'chestPress',     type: 'weight' },
  { id: 'hs-press-inferior',    group: 'pecho', name: 'Press de pecho inferior',       brand: 'Hammer Strength',    icon: 'declinePress',   type: 'weight' },
  { id: 'tg-chest-press',       group: 'pecho', name: 'Press plano (placas)',          brand: 'Technogym',          icon: 'chestPress',     type: 'weight' },
  { id: 'tg-discos-plano',      group: 'pecho', name: 'Press plano (discos)',          brand: 'Technogym · discos', icon: 'chestPress',     type: 'weight' },
  { id: 'tg-discos-inclinado',  group: 'pecho', name: 'Press inclinado (discos)',      brand: 'Technogym · discos', icon: 'inclineMachine', type: 'weight' },
  { id: 'tg-discos-inferior',   group: 'pecho', name: 'Press inferior (discos)',       brand: 'Technogym · discos', icon: 'declinePress',   type: 'weight' },
  { id: 'g80-press-pie',        group: 'pecho', name: 'Press de pecho de pie',         brand: 'Gym80',              icon: 'standingPress',  type: 'weight' },
  { id: 'g80-aperturas',        group: 'pecho', name: 'Aperturas en máquina',          brand: 'Gym80',              icon: 'machineFly',     type: 'weight' },
  { id: 'tg-pectoral',          group: 'pecho', name: 'Contractor de pecho',           brand: 'Máquina',            icon: 'fly',            type: 'weight' },
  { id: 'cruce-poleas',         group: 'pecho', name: 'Cruce de poleas al frente',     brand: 'Polea',              icon: 'cableFront',     type: 'weight' },
  { id: 'cruce-poleas-abajo',   group: 'pecho', name: 'Cruce de poleas hacia abajo',   brand: 'Polea',              icon: 'cableDown',      type: 'weight' },
  { id: 'fondos',               group: 'pecho', name: 'Fondos en paralelas',           brand: 'Peso corporal',      icon: 'dips',           type: 'bodyweight' },

  // ESPALDA
  { id: 'hs-high-row',          group: 'espalda', name: 'Remo alto (High Row)',          brand: 'Hammer Strength',    icon: 'highRow',       type: 'weight' },
  { id: 'hs-iso-pulldown',      group: 'espalda', name: 'Jalón al pecho en máquina',     brand: 'Hammer Strength',    icon: 'latPulldown',   type: 'weight' },
  { id: 'tg-jalon',             group: 'espalda', name: 'Jalón al pecho',                brand: 'Estación de poleas', icon: 'latPulldown',   type: 'weight' },
  { id: 'remo-polea',           group: 'espalda', name: 'Remo sentado en polea baja',    brand: 'Estación de poleas', icon: 'seatedRow',     type: 'weight' },
  { id: 'pullover-polea',       group: 'espalda', name: 'Pullover en polea alta (serrato)', brand: 'Polea · barra',   icon: 'straightPulldown', type: 'weight' },
  { id: 'triserie-cbum',       group: 'espalda', name: 'Triserie Cbum (modo muerte) 💣', brand: 'Polea alta · 3×10: abierto → cerrado → supino', icon: 'cbum', type: 'weight', boom: true, mult: 3, defReps: 10 }, // cada serie = 3 tramos de N reps
  { id: 'serrucho',             group: 'espalda', name: 'Serrucho (remo a una mano)',    brand: 'Mancuernas',         icon: 'oneArmRow',     type: 'weight' },
  { id: 'g80-remo-t',           group: 'espalda', name: 'Remo en T con apoyo de pecho',  brand: 'Gym80',              icon: 'chestRow',      type: 'weight' },
  { id: 'pullover-mancu',       group: 'espalda', name: 'Pullover con mancuerna',        brand: 'Mancuernas',         icon: 'dbPullover',    type: 'weight' },
  { id: 'hiperextensiones',     group: 'espalda', name: 'Hiperextensiones (lumbares)',   brand: 'Banco romano',       icon: 'hyperext',      type: 'bodyweight' },
  { id: 'encogimientos',        group: 'espalda', name: 'Encogimientos de trapecio',     brand: 'Mancuernas',         icon: 'shrug',         type: 'weight' },
  { id: 'dominadas',            group: 'espalda', name: 'Dominadas',                     brand: 'Peso corporal',      icon: 'pullup',        type: 'bodyweight' },

  // HOMBRO
  { id: 'press-militar',        group: 'hombro', name: 'Press militar',                 brand: 'Barra / mancuernas', icon: 'shoulderPress',   type: 'weight' },
  { id: 'g80-press-militar',    group: 'hombro', name: 'Press militar en máquina',      brand: 'Gym80',              icon: 'shoulderPress',   type: 'weight' },
  { id: 'hs-iso-shoulder',      group: 'hombro', name: 'Press de hombro inclinado 45º', brand: 'Hammer Strength',    icon: 'shoulderPress45', type: 'weight' },
  { id: 'elev-laterales',       group: 'hombro', name: 'Elevaciones laterales',         brand: 'Mancuernas · modo pesado', icon: 'lateralAgain', type: 'weight', again: true },
  { id: 'elev-frontales',       group: 'hombro', name: 'Elevaciones frontales',         brand: 'Mancuernas',         icon: 'frontRaise',      type: 'weight' },
  { id: 'tg-laterales',         group: 'hombro', name: 'Elevaciones laterales en máquina', brand: 'Technogym',       icon: 'lateralMachine',  type: 'weight' },
  { id: 'g80-lateral',          group: 'hombro', name: 'Elevación lateral en máquina',  brand: 'Gym80',              icon: 'lateralMachine',  type: 'weight' },
  { id: 'pajaros-maquina',      group: 'hombro', name: 'Pájaros (deltoide posterior)',  brand: 'Technogym',          icon: 'rearFly',         type: 'weight' },
  { id: 'face-pull',            group: 'hombro', name: 'Face pull',                     brand: 'Polea',              icon: 'facePull',        type: 'weight' },

  // BÍCEPS
  { id: 'curl-barra',           group: 'biceps', name: 'Curl con barra',                 brand: 'Barra libre',        icon: 'curlBar',      type: 'weight' },
  { id: 'curl-z',               group: 'biceps', name: 'Curl con barra Z',               brand: 'Barra Z',            icon: 'curlZ',        type: 'weight' },
  { id: 'curl-arana',           group: 'biceps', name: 'Curl araña',                     brand: 'Banco inclinado · boca abajo', icon: 'spiderCurl', type: 'weight' },
  { id: 'curl-21',              group: 'biceps', name: 'Curl 21 (7 + 7 + 7)',            brand: 'Barra · abajo → arriba → completo', icon: 'curl21', type: 'weight', mult: 3, defReps: 7 },
  { id: 'curl-mancuernas',      group: 'biceps', name: 'Curl con mancuernas de pie',     brand: 'Mancuernas',         icon: 'curl',         type: 'weight' },
  { id: 'curl-inclinado',       group: 'biceps', name: 'Curl inclinado (banco a 45º)',   brand: 'Mancuernas',         icon: 'curlIncline',  type: 'weight' },
  { id: 'curl-martillo',        group: 'biceps', name: 'Curl martillo',                  brand: 'Mancuernas',         icon: 'hammerCurl',   type: 'weight' },
  { id: 'curl-concentrado',     group: 'biceps', name: 'Curl concentrado',               brand: 'Mancuerna',          icon: 'curlConc',     type: 'weight' },
  { id: 'curl-polea',           group: 'biceps', name: 'Curl en polea con barra',        brand: 'Polea · barra',      icon: 'cableCurl',    type: 'weight' },
  { id: 'curl-martillo-cuerda', group: 'biceps', name: 'Curl martillo en polea con cuerda', brand: 'Polea · cuerda',   icon: 'ropeCurl',     type: 'weight' },
  { id: 'curl-bayesian',        group: 'biceps', name: 'Curl Bayesian en polea',         brand: 'Polea · el de siempre', icon: 'bayesianAlways', type: 'weight', always: true },
  { id: 'g80-curl',             group: 'biceps', name: 'Curl predicador',                brand: 'Technogym',          icon: 'preacher',     type: 'weight' },

  // TRÍCEPS
  { id: 'pushdown',             group: 'triceps', name: 'Extensión en polea con cuerda', brand: 'Polea · cuerda',     icon: 'pushdown',     type: 'weight' },
  { id: 'pushdown-barra',       group: 'triceps', name: 'Extensión en polea con barra',  brand: 'Polea · barra',      icon: 'pushdownBar',  type: 'weight' },
  { id: 'pushdown-unilateral',  group: 'triceps', name: 'Extensión unilateral en polea', brand: 'Polea · a una mano', icon: 'pushdownOne',  type: 'weight' },
  { id: 'ext-tras-nuca',        group: 'triceps', name: 'Extensión tras nuca en polea',  brand: 'Polea',              icon: 'overheadCable',type: 'weight' },
  { id: 'patada-triceps',       group: 'triceps', name: 'Patada de tríceps',             brand: 'Mancuerna',          icon: 'kickback',     type: 'weight' },
  { id: 'press-cerrado',        group: 'triceps', name: 'Press de banca agarre cerrado', brand: 'Barra libre',        icon: 'closeGrip',    type: 'weight' },
  { id: 'g80-dips',             group: 'triceps', name: 'Fondos',                        brand: 'Peso corporal',      icon: 'dips',         type: 'bodyweight' },
  { id: 'fondos-banco',         group: 'triceps', name: 'Fondos en banco',               brand: 'Peso corporal',      icon: 'benchDips',    type: 'bodyweight' },
  { id: 'press-frances',        group: 'triceps', name: 'Press francés',                 brand: 'Barra Z · el de Adrián', icon: 'skullNever', type: 'weight', never: true },

  // PIERNA
  { id: 'hs-leg-press',         group: 'pierna', name: 'Prensa 45º',                     brand: 'Technogym',          icon: 'legPress',      type: 'weight' },
  { id: 'hs-prensa-unilateral', group: 'pierna', name: 'Prensa horizontal unilateral',   brand: 'Hammer Strength',    icon: 'horizPress',    type: 'weight' },
  { id: 'hs-belt-squat',        group: 'pierna', name: 'Belt squat (con cinturón)',      brand: 'Hammer Strength',    icon: 'beltSquat',     type: 'weight' },
  { id: 'hs-v-squat',           group: 'pierna', name: 'V-Squat',                        brand: 'Hammer Strength',    icon: 'vSquat',        type: 'weight' },
  { id: 'tg-leg-ext',           group: 'pierna', name: 'Extensión de cuádriceps',        brand: 'Hammer Strength',    icon: 'legExtension',  type: 'weight' },
  { id: 'tg-leg-curl',          group: 'pierna', name: 'Curl femoral tumbado',           brand: 'Hammer Strength',    icon: 'legCurl',       type: 'weight' },
  { id: 'g80-pendulo',          group: 'pierna', name: 'Sentadilla péndulo',             brand: 'Gym80',              icon: 'pendulum',      type: 'weight' },
  { id: 'g80-pendulo-respaldo', group: 'pierna', name: 'Sentadilla péndulo con respaldo',brand: 'Gym80',              icon: 'pendulumBack',  type: 'weight' },
  { id: 'sentadilla-hack',      group: 'pierna', name: 'Sentadilla hack',                brand: 'Technogym',            icon: 'vSquat',        type: 'weight' },
  { id: 'sentadilla-multipower',group: 'pierna', name: 'Sentadilla en multipower',       brand: 'Technogym · multipower',         icon: 'smithSquat',    type: 'weight' },
  { id: 'sentadilla',           group: 'pierna', name: 'Sentadilla con barra',           brand: 'Barra libre',        icon: 'squat',         type: 'weight' },
  { id: 'bulgaras',             group: 'pierna', name: 'Sentadilla búlgara',             brand: 'Mancuernas · pie atrás en banco', icon: 'bulgarian', type: 'weight' },
  { id: 'zancadas',             group: 'pierna', name: 'Zancadas',                       brand: 'Mancuernas',         icon: 'lunge',         type: 'weight' },
  { id: 'gemelo-maquina',       group: 'pierna', name: 'Gemelo de pie',                  brand: 'Technogym',            icon: 'calfRaise',     type: 'weight' },

  // GLÚTEO
  { id: 'hip-thrust',           group: 'gluteo', name: 'Hip thrust',               brand: 'Barra libre',      icon: 'hipThrust',    type: 'weight' },
  { id: 'g80-hip-thrust',       group: 'gluteo', name: 'Hip thrust en máquina',    brand: 'Hammer Strength',  icon: 'hipThrust',    type: 'weight' },
  { id: 'g80-prensa-gluteo',    group: 'gluteo', name: 'Prensa de glúteo (tumbado)', brand: 'Gym80',          icon: 'glutePress',   type: 'weight' },
  { id: 'tg-abductor',          group: 'gluteo', name: 'Abductores',               brand: 'Technogym',        icon: 'abductor',     type: 'weight' },
  { id: 'peso-muerto-rumano',   group: 'gluteo', name: 'Peso muerto rumano',       brand: 'Barra libre',      icon: 'deadlift',     type: 'weight' },
  { id: 'patada-polea',         group: 'gluteo', name: 'Patada de glúteo en polea',brand: 'Polea',            icon: 'lunge',        type: 'weight' },

  // ABDOMEN
  { id: 'crunch',               group: 'abdomen', name: 'Crunch',                  brand: 'Peso corporal',    icon: 'crunch',       type: 'bodyweight' },
  { id: 'tg-abdominal',         group: 'abdomen', name: 'Crunch en máquina',       brand: 'Technogym',        icon: 'crunch',       type: 'weight' },
  { id: 'plancha',              group: 'abdomen', name: 'Plancha',                 brand: 'Peso corporal',    icon: 'plank',        type: 'time' },
  { id: 'elev-piernas',         group: 'abdomen', name: 'Elevación de piernas colgado', brand: 'Peso corporal', icon: 'pullup',     type: 'bodyweight' },

  // CARDIO
  { id: 'caminar',              group: 'cardio', name: 'Caminar',                  brand: 'Con GPS · empieza y para', icon: 'walk',        type: 'cardio', gps: true },
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
