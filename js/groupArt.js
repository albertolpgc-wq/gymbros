// Iconos de grupo: Fluent Emoji 3D (Microsoft, licencia MIT) + coletilla de gimbro.
const BASE = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/';
const url = (name, skin) => {
  const s = name.toLowerCase().replace(/ /g, '_');
  return BASE + encodeURI(skin ? `${name}/Default/3D/${s}_3d_default.png` : `${name}/3D/${s}_3d.png`);
};

export const GROUP_ART = {
  pecho:   { img: url('Dove'),                   joke: 'modo paloma' },
  espalda: { img: url('Wing'),                   joke: 'alas, no dorsales' },
  hombro:  { img: url('Coconut'),                joke: '¿cuello?' },
  biceps:  { img: url('Flexed biceps', true),    joke: 'todos los días' },
  triceps: { img: url('Magnet'),                 joke: 'la herradura' },
  pierna:  { img: url('Leg', true),              joke: 'mañana no hay escaleras' },
  gluteo:  { img: url('Peach'),                  joke: 'glute check' },
  abdomen: { img: url('Chocolate bar'),          joke: 'operación bikini' },
  cardio:  { img: url('Anatomical heart'),       joke: 'mata ganancias' },
  hiit:    { img: url('Skull'),                  joke: 'Pablo te espera' },
};

export function groupArt(id, cls = 'ga') {
  const a = GROUP_ART[id];
  return a ? `<img class="${cls}" src="${a.img}" alt="" loading="lazy" decoding="async">` : null;
}
export const groupJoke = (id) => GROUP_ART[id]?.joke || '';
