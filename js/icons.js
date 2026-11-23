// Pictogramas "machanguito" en SVG (viewBox 100×100).
// Cada figura se define por articulaciones: h=cabeza, n=cuello, p=cadera,
// a/a2 = [codo, mano], l/l2 = [rodilla, pie]. "eq" = equipamiento (máquina, barra…).

const L = (a, b) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;
const PL = (...pts) => `<polyline points="${pts.map((p) => p.join(',')).join(' ')}"/>`;
const C = (c, r) => `<circle cx="${c[0]}" cy="${c[1]}" r="${r}"/>`;
const R = (x, y, w, h, rx = 2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
const PLATE = (c, r = 7) => `<circle cx="${c[0]}" cy="${c[1]}" r="${r}" class="plate"/>`;
const DB = (c) => `<rect x="${c[0] - 6}" y="${c[1] - 3}" width="12" height="6" rx="2" class="plate"/>`;

// Flechas de movimiento (naranja): recta o curva (curva cuadrática con punto de control c)
function head(x, y, ang) {
  const a1 = ang + 2.6, a2 = ang - 2.6, s = 5;
  return `<polyline class="mvh" points="${x + s * Math.cos(a1)},${y + s * Math.sin(a1)} ${x},${y} ${x + s * Math.cos(a2)},${y + s * Math.sin(a2)}"/>`;
}
const ARW = (a, b) => `<g class="mv"><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>${head(b[0], b[1], Math.atan2(b[1] - a[1], b[0] - a[0]))}</g>`;
const ARC = (a, c, b) => `<g class="mv"><path d="M${a[0]},${a[1]} Q${c[0]},${c[1]} ${b[0]},${b[1]}"/>${head(b[0], b[1], Math.atan2(b[1] - c[1], b[0] - c[0]))}</g>`;
const BENCH = (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="6" rx="3" class="pad"/>` + L([x + 8, y + 6], [x + 8, 88]) + L([x + w - 8, y + 6], [x + w - 8, 88]);
// Estrella de explosión (picos alternos de radio R y r)
const BURST = (cx, cy, R, r, cls, n = 14) => {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2, rad = i % 2 ? r : R * (0.85 + 0.15 * ((i * 7) % 3) / 2);
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" class="${cls}"/>`;
};
const HANDLE = (c) => `<rect x="${c[0] - 2.5}" y="${c[1] - 7}" width="5" height="14" rx="2.5" class="plate"/>`;

function fig(f, eq = '') {
  let body = '';
  const limb = (from, seg) => seg && (body += PL(from, seg[0], seg[1]));
  limb(f.n, f.a2); limb(f.p, f.l2);
  body += L(f.n, f.p);
  limb(f.n, f.a); limb(f.p, f.l);
  // las flechas se pintan encima del cuerpo
  const mv = (eq.match(/<g class="mv">.*?<\/g>/g) || []).join('');
  eq = eq.replace(/<g class="mv">.*?<\/g>/g, '');
  return `<g class="eq">${eq}</g><g class="body">${body}<circle cx="${f.h[0]}" cy="${f.h[1]}" r="6.5" class="head"/></g>${mv}`;
}

const ground = L([8, 89], [92, 89]);

export const ICONS = {
  // ---- PECHO ----
  benchPress: fig(
    { h: [22, 54], n: [30, 58], p: [60, 58], a: [[31, 45], [33, 32]], l: [[74, 58], [78, 87]] },
    ground + BENCH(16, 62, 58) + L([22, 22], [22, 62]) + L([12, 32], [56, 32]) + PLATE([16, 32], 9) + ARW([44, 46], [44, 22])
  ),
  dbPress: fig(
    { h: [22, 54], n: [30, 58], p: [60, 58], a: [[31, 45], [33, 32]], l: [[74, 58], [78, 87]] },
    ground + BENCH(16, 62, 58) + DB([33, 29]) + ARW([46, 46], [46, 22])
  ),
  inclinePress: fig(
    { h: [35, 37], n: [40, 45], p: [58, 68], a: [[46, 32], [50, 18]], l: [[74, 68], [76, 87]] },
    ground + `<path d="M30,36 L54,72 L70,72 L70,78 L50,78 L26,40 Z" class="pad"/>` + L([60, 78], [60, 88]) + DB([50, 15]) + ARW([62, 34], [70, 18])
  ),
  dbFly: fig( // vista desde arriba: tumbado en el banco con los brazos abiertos
    { h: [50, 19], n: [50, 28], p: [50, 58], a: [[35, 31], [19, 35]], a2: [[65, 31], [81, 35]], l: [[45, 73], [43, 88]], l2: [[55, 73], [57, 88]] },
    `<rect x="41" y="10" width="18" height="56" rx="4" class="pad"/>` + DB([17, 35]) + DB([83, 35]) + ARC([14, 25], [18, 8], [36, 10]) + ARC([86, 25], [82, 8], [64, 10])
  ),
  chestPress: fig(
    { h: [38, 31], n: [38, 40], p: [40, 68], a: [[50, 50], [64, 45]], l: [[58, 68], [60, 87]] },
    ground + `<rect x="27" y="28" width="6" height="44" rx="3" class="pad"/><rect x="30" y="70" width="30" height="6" rx="3" class="pad"/>` + L([38, 76], [38, 88]) +
      HANDLE([66, 45]) + L([66, 45], [84, 24]) + C([84, 24], 3) + L([84, 24], [84, 89]) + ARW([68, 58], [82, 58])
  ),
  declinePress: fig(
    { h: [36, 31], n: [37, 40], p: [40, 68], a: [[50, 52], [64, 62]], l: [[58, 68], [60, 87]] },
    ground + `<rect x="26" y="28" width="6" height="44" rx="3" class="pad"/><rect x="30" y="70" width="30" height="6" rx="3" class="pad"/>` + L([38, 76], [38, 88]) +
      HANDLE([66, 62]) + L([66, 62], [86, 30]) + C([86, 30], 3) + L([86, 30], [86, 89]) + ARW([70, 48], [80, 60])
  ),
  inclineMachine: fig(
    { h: [33, 31], n: [36, 40], p: [42, 68], a: [[46, 36], [58, 24]], l: [[60, 68], [62, 87]] },
    ground + `<path d="M24,30 L30,30 L40,72 L34,72 Z" class="pad"/><rect x="32" y="70" width="30" height="6" rx="3" class="pad"/>` + L([40, 76], [40, 88]) +
      HANDLE([60, 22]) + L([60, 22], [84, 40]) + C([84, 40], 3) + L([84, 40], [84, 89]) + ARW([66, 32], [76, 16])
  ),
  standingPress: fig( // Gym80 de pie, empujando al frente
    { h: [40, 20], n: [40, 29], p: [41, 58], a: [[52, 36], [64, 36]], l: [[42, 73], [40, 88]], l2: [[42, 73], [48, 88]] },
    ground + `<rect x="29" y="24" width="6" height="30" rx="3" class="pad"/>` + L([32, 54], [32, 89]) +
      HANDLE([66, 36]) + L([66, 36], [84, 14]) + C([84, 14], 3) + L([84, 14], [84, 89]) + ARW([68, 50], [82, 50])
  ),
  fly: fig( // contractor / pec deck (codos a 90º)
    { h: [50, 25], n: [50, 34], p: [50, 63], a: [[32, 38], [31, 22]], a2: [[68, 38], [69, 22]], l: [[41, 74], [41, 88]], l2: [[59, 74], [59, 88]] },
    `<rect x="24" y="18" width="12" height="24" rx="4" class="pad"/><rect x="64" y="18" width="12" height="24" rx="4" class="pad"/>` +
      `<rect x="43" y="22" width="14" height="44" rx="4" class="pad"/>` + L([18, 10], [82, 10]) + L([18, 10], [18, 88]) + L([82, 10], [82, 88]) +
      ARC([22, 50], [28, 58], [40, 52]) + ARC([78, 50], [72, 58], [60, 52])
  ),
  machineFly: fig( // Gym80 aperturas (brazos casi rectos)
    { h: [50, 25], n: [50, 34], p: [50, 63], a: [[35, 36], [19, 38]], a2: [[65, 36], [81, 38]], l: [[41, 74], [41, 88]], l2: [[59, 74], [59, 88]] },
    `<rect x="43" y="20" width="14" height="46" rx="4" class="pad"/>` + HANDLE([17, 38]) + HANDLE([83, 38]) +
      L([17, 31], [30, 10]) + L([83, 31], [70, 10]) + L([30, 10], [70, 10]) +
      ARC([12, 50], [18, 62], [36, 56]) + ARC([88, 50], [82, 62], [64, 56])
  ),
  cableFront: fig(
    { h: [50, 20], n: [50, 29], p: [50, 58], a: [[38, 38], [46, 45]], a2: [[62, 38], [54, 45]], l: [[45, 73], [43, 88]], l2: [[55, 73], [57, 88]] },
    ground + L([7, 6], [7, 89]) + L([93, 6], [93, 89]) + C([10, 32], 3) + C([90, 32], 3) +
      `<line x1="10" y1="32" x2="46" y2="45" class="cable"/><line x1="90" y1="32" x2="54" y2="45" class="cable"/>` + ARW([30, 52], [42, 52]) + ARW([70, 52], [58, 52])
  ),
  cableDown: fig(
    { h: [50, 22], n: [50, 31], p: [50, 60], a: [[40, 44], [47, 61]], a2: [[60, 44], [53, 61]], l: [[45, 74], [43, 88]], l2: [[55, 74], [57, 88]] },
    ground + L([7, 6], [7, 89]) + L([93, 6], [93, 89]) + C([10, 9], 3) + C([90, 9], 3) +
      `<line x1="10" y1="9" x2="47" y2="61" class="cable"/><line x1="90" y1="9" x2="53" y2="61" class="cable"/>` + ARW([28, 56], [36, 68]) + ARW([72, 56], [64, 68])
  ),
  dips: fig(
    { h: [50, 25], n: [50, 34], p: [50, 62], a: [[33, 42], [36, 54]], a2: [[67, 42], [64, 54]], l: [[46, 74], [52, 84]], l2: [[54, 74], [60, 84]] },
    L([24, 54], [40, 54]) + L([60, 54], [76, 54]) + L([28, 54], [28, 89]) + L([72, 54], [72, 89]) + ARW([88, 30], [88, 48]) + ARW([12, 48], [12, 30])
  ),
  // ---- ESPALDA ----
  latPulldown: fig(
    { h: [50, 29], n: [50, 38], p: [50, 66], a: [[33, 32], [29, 15]], a2: [[67, 32], [71, 15]], l: [[40, 74], [40, 88]], l2: [[60, 74], [60, 88]] },
    L([18, 14], [82, 14]) + `<line x1="50" y1="14" x2="50" y2="3" class="cable"/>` + `<rect x="34" y="66" width="32" height="6" rx="3" class="pad"/><rect x="32" y="56" width="36" height="5" rx="2.5" class="pad"/>` +
      ARW([14, 18], [14, 38]) + ARW([86, 18], [86, 38])
  ),
  cbum: fig( // triserie con fondo de explosión
    { h: [50, 29], n: [50, 38], p: [50, 66], a: [[33, 32], [29, 15]], a2: [[67, 32], [71, 15]], l: [[40, 74], [40, 88]], l2: [[60, 74], [60, 88]] },
    BURST(50, 50, 49, 30, 'burst1') + BURST(50, 50, 34, 20, 'burst2') +
      L([18, 14], [82, 14]) + `<line x1="50" y1="14" x2="50" y2="3" class="cable"/>` + `<rect x="34" y="66" width="32" height="6" rx="3" class="pad"/>` +
      `<g class="mv"><text x="64" y="84" class="x3">×3</text></g>`
  ),
  dbPullover: fig( // tumbado, mancuerna detrás de la cabeza
    { h: [24, 54], n: [31, 58], p: [60, 58], a: [[20, 50], [10, 47]], l: [[74, 58], [78, 87]] },
    ground + BENCH(18, 62, 56) + DB([8, 47]) + ARC([6, 38], [12, 16], [32, 22])
  ),
  hyperext: fig( // banco romano
    { h: [22, 45], n: [30, 50], p: [52, 63], a: [[38, 58], [42, 51]], l: [[68, 73], [82, 81]] },
    ground + `<path d="M46,68 L58,60 L62,66 L50,74 Z" class="pad"/>` + L([56, 70], [56, 89]) + `<circle cx="84" cy="85" r="4" class="plate"/>` + L([56, 89], [86, 89]) +
      ARC([16, 60], [8, 48], [14, 34])
  ),
  shrug: fig( // encogimientos con mancuernas
    { h: [50, 19], n: [50, 28], p: [50, 58], a: [[39, 42], [37, 56]], a2: [[61, 42], [63, 56]], l: [[45, 73], [43, 88]], l2: [[55, 73], [57, 88]] },
    ground + DB([37, 59]) + DB([63, 59]) + ARW([30, 34], [30, 20]) + ARW([70, 34], [70, 20])
  ),
  highRow: fig( // Hammer High Row: agarres arriba-delante, tiras hacia abajo y atrás
    { h: [41, 31], n: [42, 40], p: [40, 68], a: [[54, 30], [64, 18]], l: [[58, 68], [60, 87]] },
    ground + `<rect x="50" y="40" width="6" height="18" rx="3" class="pad"/><rect x="28" y="70" width="28" height="6" rx="3" class="pad"/>` + L([38, 76], [38, 88]) +
      HANDLE([66, 16]) + L([66, 16], [86, 36]) + C([86, 36], 3) + L([86, 36], [86, 89]) + ARW([74, 12], [66, 32])
  ),
  oneArmRow: fig( // serrucho: rodilla y mano en el banco
    { h: [31, 42], n: [39, 46], p: [66, 50], a: [[50, 36], [50, 52]], a2: [[42, 52], [44, 58]], l: [[70, 70], [70, 88]], l2: [[74, 58], [86, 58]] },
    ground + BENCH(40, 58, 50) + DB([50, 55]) + ARW([24, 64], [24, 46])
  ),
  chestRow: fig( // Gym80 remo en T: tumbado boca abajo en banco inclinado
    { h: [71, 38], n: [64, 45], p: [44, 62], a: [[67, 57], [65, 70]], l: [[34, 72], [24, 84]] },
    ground + `<path d="M40,70 L66,50 L70,55 L44,75 Z" class="pad"/>` + L([44, 75], [44, 88]) + `<rect x="18" y="84" width="12" height="4" rx="2" class="pad"/>` +
      HANDLE([65, 72]) + L([65, 72], [90, 80]) + PLATE([90, 80], 7) + ARW([80, 70], [80, 52])
  ),
  straightPulldown: fig( // pullover en polea alta, brazos rectos
    { h: [50, 24], n: [46, 32], p: [40, 58], a: [[56, 40], [66, 50]], l: [[43, 73], [41, 88]], l2: [[43, 73], [48, 88]] },
    ground + L([62, 50], [72, 50]) + `<line x1="66" y1="50" x2="84" y2="8" class="cable"/>` + C([84, 8], 3) + L([88, 4], [88, 89]) + ARC([66, 26], [78, 40], [70, 64])
  ),
  pullup: fig(
    { h: [50, 24], n: [50, 33], p: [50, 62], a: [[33, 26], [34, 12]], a2: [[67, 26], [66, 12]], l: [[46, 76], [44, 88]], l2: [[54, 76], [56, 88]] },
    L([14, 12], [86, 12]) + L([16, 12], [16, 4]) + L([84, 12], [84, 4])
  ),
  seatedRow: fig(
    { h: [31, 34], n: [34, 42], p: [38, 68], a: [[26, 54], [44, 52]], l: [[56, 62], [72, 67]] },
    ground + `<rect x="28" y="70" width="22" height="6" rx="3" class="pad"/>` + L([38, 76], [38, 88]) + `<line x1="44" y1="52" x2="86" y2="52" class="cable"/>` + L([76, 58], [76, 76]) + L([88, 40], [88, 88]) + ARW([60, 42], [46, 42])
  ),
  bentRow: fig(
    { h: [67, 37], n: [60, 44], p: [36, 56], a: [[53, 54], [56, 68]], l: [[44, 72], [40, 87]] },
    ground + L([40, 70], [76, 70]) + PLATE([62, 70], 9)
  ),
  deadlift: fig(
    { h: [65, 31], n: [58, 39], p: [40, 58], a: [[58, 53], [56, 70]], l: [[51, 72], [48, 87]] },
    ground + L([36, 70], [76, 70]) + PLATE([56, 79], 9)
  ),
  // ---- HOMBRO ----
  shoulderPress: fig(
    { h: [50, 30], n: [50, 39], p: [50, 66], a: [[32, 40], [35, 21]], a2: [[68, 40], [65, 21]], l: [[40, 74], [40, 88]], l2: [[60, 74], [60, 88]] },
    `<rect x="42" y="26" width="16" height="46" rx="4" class="pad"/>` + L([20, 21], [80, 21]) + PLATE([20, 21], 6) + PLATE([80, 21], 6) + ARW([88, 36], [88, 14]) + ARW([12, 36], [12, 14])
  ),
  shoulderPress45: fig( // banco inclinado a 45º, empujando hacia arriba
    { h: [37, 33], n: [42, 41], p: [56, 66], a: [[40, 28], [50, 15]], l: [[72, 64], [74, 87]] },
    ground + `<path d="M30,34 L36,30 L60,70 L54,72 Z" class="pad"/><rect x="50" y="68" width="22" height="6" rx="3" class="pad"/>` + L([62, 74], [62, 88]) +
      HANDLE([52, 13]) + L([52, 13], [80, 22]) + C([80, 22], 3) + L([80, 22], [80, 89]) + ARW([62, 30], [70, 14])
  ),
  lateralRaise: fig(
    { h: [50, 19], n: [50, 28], p: [50, 58], a: [[35, 30], [20, 32]], a2: [[65, 30], [80, 32]], l: [[44, 73], [42, 88]], l2: [[56, 73], [58, 88]] },
    ground + DB([20, 32]) + DB([80, 32]) + ARC([30, 56], [16, 52], [14, 40]) + ARC([70, 56], [84, 52], [86, 40])
  ),
  frontRaise: fig( // de perfil, brazo recto al frente
    { h: [42, 19], n: [42, 28], p: [43, 58], a: [[56, 29], [70, 30]], l: [[44, 73], [43, 88]], l2: [[44, 73], [50, 88]] },
    ground + `<rect x="68" y="24" width="6" height="12" rx="2" class="plate"/>` + ARC([58, 60], [76, 56], [80, 40])
  ),
  lateralMachine: fig( // sentado, almohadillas en los brazos
    { h: [50, 26], n: [50, 35], p: [50, 64], a: [[34, 36], [22, 40]], a2: [[66, 36], [78, 40]], l: [[41, 75], [41, 88]], l2: [[59, 75], [59, 88]] },
    `<rect x="43" y="22" width="14" height="44" rx="4" class="pad"/>` + `<rect x="24" y="30" width="12" height="10" rx="3" class="plate"/><rect x="64" y="30" width="12" height="10" rx="3" class="plate"/>` +
      L([14, 30], [14, 88]) + L([86, 30], [86, 88]) + ARC([28, 60], [18, 56], [18, 46]) + ARC([72, 60], [82, 56], [82, 46])
  ),
  rearFly: fig( // pájaros en máquina: de espaldas, brazos rectos hacia atrás
    { h: [50, 25], n: [50, 34], p: [50, 63], a: [[34, 34], [18, 34]], a2: [[66, 34], [82, 34]], l: [[41, 74], [41, 88]], l2: [[59, 74], [59, 88]] },
    HANDLE([16, 34]) + HANDLE([84, 34]) + L([16, 27], [30, 10]) + L([84, 27], [70, 10]) + L([30, 10], [70, 10]) +
      ARC([38, 50], [26, 52], [16, 46]) + ARC([62, 50], [74, 52], [84, 46])
  ),
  facePull: fig(
    { h: [44, 21], n: [44, 30], p: [44, 59], a: [[30, 26], [52, 22]], l: [[46, 74], [44, 88]], l2: [[46, 74], [52, 88]] },
    ground + `<line x1="52" y1="22" x2="86" y2="26" class="cable"/>` + L([88, 8], [88, 89]) + C([86, 26], 3) + ARW([70, 36], [56, 34])
  ),
  // ---- BÍCEPS ----
  curl: fig(
    { h: [46, 19], n: [46, 28], p: [46, 58], a: [[47, 46], [60, 34]], l: [[47, 73], [46, 88]], l2: [[47, 73], [54, 88]] },
    ground + DB([62, 34]) + ARC([68, 56], [76, 44], [70, 30])
  ),
  hammerCurl: fig(
    { h: [46, 19], n: [46, 28], p: [46, 58], a: [[47, 46], [60, 34]], l: [[47, 73], [46, 88]], l2: [[47, 73], [54, 88]] },
    ground + `<rect x="58" y="25" width="7" height="17" rx="2" class="plate"/>` + ARC([70, 56], [78, 44], [72, 30])
  ),
  curlBar: fig(
    { h: [46, 19], n: [46, 28], p: [46, 58], a: [[47, 46], [60, 34]], l: [[47, 73], [46, 88]], l2: [[47, 73], [54, 88]] },
    ground + PLATE([61, 34], 8) + ARC([72, 58], [80, 44], [74, 28])
  ),
  curlZ: fig(
    { h: [46, 19], n: [46, 28], p: [46, 58], a: [[47, 46], [60, 34]], l: [[47, 73], [46, 88]], l2: [[47, 73], [54, 88]] },
    ground + PL([54, 30], [58, 36], [62, 30], [66, 36]) + PLATE([68, 33], 6) + ARC([74, 58], [82, 44], [76, 28])
  ),
  spiderCurl: fig( // boca abajo en banco inclinado, brazos colgando delante
    { h: [66, 30], n: [60, 37], p: [38, 58], a: [[62, 54], [72, 46]], l: [[28, 70], [22, 87]] },
    ground + `<path d="M34,64 L60,40 L64,46 L38,70 Z" class="pad"/>` + L([40, 70], [40, 88]) + DB([74, 45]) + ARC([60, 72], [80, 70], [80, 52])
  ),
  ropeCurl: fig(
    { h: [42, 19], n: [42, 28], p: [42, 58], a: [[43, 46], [56, 34]], l: [[43, 73], [42, 88]], l2: [[43, 73], [50, 88]] },
    ground + `<line x1="57" y1="36" x2="72" y2="66" class="cable"/><line x1="72" y1="66" x2="80" y2="84" class="cable"/>` + L([56, 30], [57, 40]) + L([60, 31], [61, 41]) +
      C([80, 84], 3) + L([86, 36], [86, 89]) + ARC([66, 52], [72, 42], [66, 28])
  ),
  curl21: fig(
    { h: [40, 19], n: [40, 28], p: [40, 58], a: [[41, 46], [54, 34]], l: [[41, 73], [40, 88]], l2: [[41, 73], [48, 88]] },
    ground + PLATE([55, 34], 8) + ARC([66, 54], [72, 44], [66, 32]) + `<g class="mv"><text x="58" y="84" class="x3">21</text></g>`
  ),
  curlIncline: fig( // sentado en banco a 45º, brazos colgando por detrás
    { h: [35, 37], n: [40, 45], p: [58, 68], a: [[40, 63], [50, 56]], l: [[74, 68], [76, 87]] },
    ground + `<path d="M30,36 L54,72 L70,72 L70,78 L50,78 L26,40 Z" class="pad"/>` + L([60, 78], [60, 88]) + DB([52, 56]) + ARC([34, 80], [56, 84], [60, 64])
  ),
  curlConc: fig( // sentado, codo apoyado en el muslo
    { h: [58, 35], n: [52, 42], p: [36, 66], a: [[54, 62], [63, 49]], l: [[56, 66], [58, 87]] },
    ground + `<rect x="22" y="68" width="28" height="6" rx="3" class="pad"/>` + L([30, 74], [30, 88]) + DB([65, 48]) + ARC([72, 70], [80, 56], [72, 42])
  ),
  cableCurl: fig(
    { h: [42, 19], n: [42, 28], p: [42, 58], a: [[43, 46], [56, 34]], l: [[43, 73], [42, 88]], l2: [[43, 73], [50, 88]] },
    ground + L([56, 29], [56, 39]) + `<line x1="56" y1="34" x2="80" y2="84" class="cable"/>` + C([80, 84], 3) + L([86, 36], [86, 89]) + ARC([64, 54], [72, 44], [66, 28])
  ),
  bayesian: fig( // polea por detrás, codo atrás
    { h: [54, 19], n: [53, 28], p: [52, 58], a: [[44, 47], [54, 39]], l: [[56, 73], [62, 88]], l2: [[50, 73], [42, 88]] },
    ground + L([54, 35], [54, 43]) + `<line x1="54" y1="39" x2="12" y2="60" class="cable"/>` + C([12, 60], 3) + L([8, 24], [8, 89]) + ARC([64, 56], [72, 44], [64, 32])
  ),
  preacher: fig( // predicador: brazo apoyado en el atril
    { h: [37, 33], n: [37, 42], p: [34, 68], a: [[56, 56], [62, 40]], l: [[52, 70], [54, 87]] },
    ground + `<path d="M40,50 L57,61 L60,56 L43,45 Z" class="pad"/><rect x="22" y="70" width="26" height="6" rx="3" class="pad"/>` + L([34, 76], [34, 88]) +
      L([58, 62], [64, 89]) + HANDLE([63, 38]) + ARC([72, 60], [80, 46], [70, 32])
  ),
  // ---- TRÍCEPS ----
  pushdown: fig( // cuerda
    { h: [42, 19], n: [42, 28], p: [43, 58], a: [[45, 44], [58, 58]], l: [[45, 73], [44, 88]], l2: [[45, 73], [52, 88]] },
    ground + `<line x1="60" y1="50" x2="66" y2="8" class="cable"/>` + L([56, 52], [57, 62]) + L([60, 51], [61, 61]) + C([66, 8], 3) + L([66, 5], [86, 5]) + L([86, 5], [86, 89]) + ARW([74, 44], [74, 62])
  ),
  pushdownBar: fig(
    { h: [42, 19], n: [42, 28], p: [43, 58], a: [[45, 44], [58, 58]], l: [[45, 73], [44, 88]], l2: [[45, 73], [52, 88]] },
    ground + `<line x1="58" y1="58" x2="66" y2="8" class="cable"/>` + L([52, 58], [66, 58]) + C([66, 8], 3) + L([66, 5], [86, 5]) + L([86, 5], [86, 89]) + ARW([74, 44], [74, 62])
  ),
  pushdownOne: fig( // a una mano con agarre en D
    { h: [42, 19], n: [42, 28], p: [43, 58], a: [[45, 44], [58, 58]], l: [[45, 73], [44, 88]], l2: [[45, 73], [52, 88]] },
    ground + `<line x1="58" y1="56" x2="66" y2="8" class="cable"/>` + `<path d="M54,56 L62,56 L58,64 Z" class="plate"/>` + C([66, 8], 3) + L([66, 5], [86, 5]) + L([86, 5], [86, 89]) +
      ARW([74, 44], [74, 62]) + `<g class="mv"><text x="18" y="50" class="x3">1</text></g>`
  ),
  overheadCable: fig( // de espaldas a la polea, brazos por encima de la cabeza
    { h: [58, 25], n: [53, 32], p: [44, 58], a: [[58, 14], [76, 14]], l: [[50, 73], [56, 88]], l2: [[42, 73], [34, 88]] },
    ground + `<line x1="76" y1="14" x2="12" y2="34" class="cable"/>` + C([12, 34], 3) + L([8, 10], [8, 89]) + L([75, 10], [77, 18]) + ARW([72, 26], [86, 24])
  ),
  kickback: fig( // inclinado, brazo estirado hacia atrás
    { h: [72, 36], n: [64, 42], p: [38, 54], a: [[50, 46], [34, 42]], a2: [[66, 56], [68, 66]], l: [[44, 72], [44, 88]], l2: [[34, 70], [28, 88]] },
    ground + BENCH(56, 66, 30) + DB([32, 42]) + ARC([30, 58], [20, 52], [22, 40])
  ),
  closeGrip: fig( // press de banca con las manos juntas
    { h: [22, 54], n: [30, 58], p: [60, 58], a: [[37, 46], [36, 32]], l: [[74, 58], [78, 87]] },
    ground + BENCH(16, 62, 58) + L([22, 22], [22, 62]) + L([12, 32], [56, 32]) + PLATE([16, 32], 9) + L([33, 28], [33, 36]) + L([39, 28], [39, 36]) + ARW([48, 46], [48, 22])
  ),
  benchDips: fig( // manos en un banco detrás, piernas estiradas
    { h: [40, 27], n: [38, 36], p: [40, 62], a: [[28, 40], [26, 52]], l: [[62, 64], [82, 84]] },
    ground + BENCH(8, 52, 26) + ARW([52, 52], [52, 36])
  ),
  skullCrusher: fig( // press francés tumbado en banco
    { h: [22, 54], n: [30, 58], p: [60, 58], a: [[30, 38], [18, 43]], l: [[74, 58], [78, 87]] },
    ground + BENCH(16, 62, 58) + PLATE([17, 43], 6) + ARC([8, 52], [4, 32], [24, 26])
  ),
  overheadExt: fig(
    { h: [44, 22], n: [44, 31], p: [44, 61], a: [[52, 12], [36, 16]], l: [[46, 75], [44, 88]], l2: [[46, 75], [52, 88]] },
    ground + DB([34, 14])
  ),
  // ---- PIERNA ----
  squat: fig(
    { h: [53, 32], n: [47, 40], p: [36, 65], a: [[58, 46], [50, 38]], l: [[60, 72], [50, 87]] },
    ground + L([28, 38], [66, 38]) + PLATE([30, 38], 8) + ARW([80, 80], [80, 56])
  ),
  smithSquat: fig( // multipower: barra guiada por raíles
    { h: [53, 32], n: [47, 40], p: [36, 65], a: [[58, 46], [50, 38]], l: [[60, 72], [50, 87]] },
    ground + L([22, 4], [22, 89]) + L([74, 4], [74, 89]) + L([22, 38], [74, 38]) + `<rect x="18" y="34" width="8" height="8" rx="2" class="plate"/><rect x="70" y="34" width="8" height="8" rx="2" class="plate"/>` + ARW([86, 74], [86, 50])
  ),
  legPress: fig(
    { h: [16, 46], n: [22, 53], p: [36, 72], a: [[30, 66], [38, 76]], l: [[44, 48], [62, 48]] },
    ground + `<path d="M12,58 L18,54 L40,78 L34,82 Z" class="pad"/>` + L([38, 80], [50, 80]) + `<line x1="56" y1="36" x2="68" y2="58" stroke-width="5"/>` + L([62, 47], [86, 28]) + L([44, 80], [44, 88]) + ARW([72, 56], [84, 44])
  ),
  horizPress: fig( // prensa horizontal unilateral
    { h: [30, 31], n: [32, 40], p: [36, 66], a: [[34, 54], [42, 64]], l: [[52, 56], [68, 62]], l2: [[50, 70], [54, 84]] },
    ground + `<path d="M22,30 L28,30 L34,70 L28,70 Z" class="pad"/><rect x="26" y="68" width="24" height="6" rx="3" class="pad"/>` + L([36, 74], [36, 88]) +
      `<line x1="71" y1="50" x2="71" y2="76" stroke-width="5"/>` + L([71, 62], [88, 40]) + C([88, 40], 3) + L([88, 40], [88, 89]) + ARW([76, 82], [90, 82])
  ),
  beltSquat: fig( // con cinturón y cadena a la palanca
    { h: [50, 24], n: [48, 32], p: [42, 58], a: [[58, 42], [70, 44]], l: [[58, 67], [52, 79]], l2: [[38, 68], [34, 79]] },
    `<rect x="24" y="80" width="40" height="6" rx="2" class="pad"/>` + L([10, 89], [92, 89]) + L([66, 44], [86, 44]) + L([86, 44], [86, 89]) +
      `<rect x="37" y="54" width="12" height="7" rx="2" class="plate"/>` + `<line x1="43" y1="61" x2="44" y2="89" class="cable"/>` + ARW([16, 76], [16, 54])
  ),
  vSquat: fig( // V-squat / hack: espalda apoyada, plataforma inclinada
    { h: [35, 27], n: [38, 36], p: [46, 64], a: [[48, 40], [42, 34]], l: [[70, 66], [66, 84]] },
    `<path d="M26,30 L32,28 L44,70 L38,72 Z" class="pad"/>` + `<rect x="36" y="30" width="10" height="6" rx="2" class="plate"/>` +
      `<line x1="54" y1="90" x2="84" y2="80" stroke-width="5"/>` + L([10, 92], [92, 92]) + ARW([18, 72], [12, 48])
  ),
  pendulum: fig( // péndulo de Gym80 (libre)
    { h: [46, 28], n: [44, 36], p: [42, 64], a: [[54, 44], [52, 34]], l: [[64, 68], [56, 84]] },
    `<rect x="42" y="86" width="32" height="4" rx="2" class="pad"/>` + L([10, 89], [92, 89]) + C([20, 8], 3) + L([20, 8], [44, 32]) + L([20, 8], [20, 89]) +
      `<rect x="40" y="30" width="10" height="6" rx="2" class="plate"/>` + ARC([16, 62], [6, 40], [20, 22])
  ),
  pendulumBack: fig( // péndulo con respaldo
    { h: [46, 28], n: [44, 36], p: [42, 64], a: [[54, 44], [52, 34]], l: [[64, 68], [56, 84]] },
    `<rect x="42" y="86" width="32" height="4" rx="2" class="pad"/>` + L([10, 89], [92, 89]) + C([20, 8], 3) + L([20, 8], [44, 32]) + L([20, 8], [20, 89]) +
      `<path d="M32,34 L38,32 L38,68 L32,68 Z" class="pad"/>` + `<rect x="40" y="30" width="10" height="6" rx="2" class="plate"/>` + ARC([16, 62], [6, 40], [20, 22])
  ),
  legExtension: fig(
    { h: [37, 29], n: [38, 38], p: [40, 64], a: [[42, 52], [48, 64]], l: [[58, 64], [78, 58]] },
    ground + `<rect x="30" y="66" width="30" height="6" rx="3" class="pad"/><rect x="26" y="30" width="6" height="38" rx="3" class="pad"/>` + L([44, 72], [44, 88]) + C([79, 62], 4) + L([58, 66], [79, 62]) + ARC([84, 80], [94, 72], [88, 54])
  ),
  legCurl: fig(
    { h: [18, 51], n: [26, 56], p: [56, 56], a: [[22, 64], [14, 64]], l: [[72, 56], [78, 38]] },
    ground + `<rect x="16" y="60" width="64" height="6" rx="3" class="pad"/>` + L([28, 66], [28, 88]) + L([70, 66], [70, 88]) + C([80, 42], 4) + ARC([90, 58], [94, 42], [84, 30])
  ),
  bulgarian: fig( // pie de atrás apoyado en un banco
    { h: [50, 25], n: [50, 34], p: [50, 60], a: [[52, 48], [52, 61]], l: [[66, 70], [66, 87]], l2: [[38, 76], [24, 62]] },
    ground + BENCH(8, 62, 24) + DB([52, 63]) + ARW([80, 82], [80, 60])
  ),
  glutePress: fig( // Gym80: tumbado, empujando hacia arriba con un pie
    { h: [14, 66], n: [22, 69], p: [48, 70], a: [[30, 78], [22, 80]], l: [[60, 52], [72, 42]], l2: [[60, 62], [62, 72]] },
    ground + `<rect x="8" y="74" width="54" height="6" rx="3" class="pad"/>` + L([20, 80], [20, 88]) + L([52, 80], [52, 88]) +
      `<line x1="66" y1="34" x2="80" y2="50" stroke-width="5"/>` + L([73, 42], [90, 60]) + C([90, 60], 3) + L([90, 60], [90, 89]) + ARW([82, 32], [90, 22])
  ),
  lunge: fig(
    { h: [48, 27], n: [48, 36], p: [48, 62], a: [[50, 50], [50, 63]], l: [[66, 68], [66, 87]], l2: [[38, 84], [24, 85]] },
    ground + DB([50, 65])
  ),
  hipThrust: fig(
    { h: [19, 54], n: [27, 58], p: [52, 51], a: [[38, 58], [48, 46]], l: [[68, 54], [70, 87]] },
    ground + R(12, 62, 20, 8) + L([22, 70], [22, 88]) + L([36, 45], [62, 45]) + PLATE([50, 44], 8)
  ),
  calfRaise: fig(
    { h: [48, 16], n: [48, 26], p: [48, 54], a: [[58, 36], [58, 24]], l: [[48, 70], [50, 84]] },
    R(38, 84, 26, 5) + L([36, 23], [62, 23]) + L([62, 23], [80, 23]) + L([80, 23], [80, 89]) + L([44, 84], [56, 84])
  ),
  abductor: fig(
    { h: [50, 25], n: [50, 34], p: [50, 62], a: [[40, 48], [38, 62]], a2: [[60, 48], [62, 62]], l: [[31, 70], [29, 87]], l2: [[69, 70], [71, 87]] },
    R(22, 64, 6, 14) + R(72, 64, 6, 14) + R(38, 62, 24, 4) + R(43, 20, 14, 44, 3)
  ),
  crunch: fig(
    { h: [30, 63], n: [38, 70], p: [54, 81], a: [[42, 60], [33, 57]], l: [[68, 64], [80, 84]] },
    L([10, 88], [92, 88])
  ),
  plank: fig(
    { h: [21, 57], n: [29, 62], p: [55, 71], a: [[29, 84], [42, 84]], l: [[69, 77], [83, 84]] },
    L([10, 88], [92, 88])
  ),
  run: fig(
    { h: [53, 17], n: [50, 26], p: [46, 52], a: [[58, 37], [66, 29]], a2: [[40, 38], [36, 48]], l: [[58, 64], [54, 80]], l2: [[40, 66], [28, 72]] },
    L([10, 84], [86, 84]) + L([86, 84], [92, 60]) + L([92, 60], [92, 40])
  ),
  walk: fig(
    { h: [52, 18], n: [51, 27], p: [49, 55], a: [[56, 40], [60, 51]], a2: [[45, 40], [41, 50]], l: [[56, 70], [60, 86]], l2: [[44, 70], [38, 86]] },
    L([10, 89], [92, 89]) + `<path d="M74,30 a8,8 0 1 1 16,0 c0,6 -8,14 -8,14 c0,0 -8,-8 -8,-14 Z" class="plate"/>` + `<circle cx="82" cy="30" r="3" fill="#0f1115"/>`
  ),
  hiit: fig(
    { h: [50, 20], n: [50, 29], p: [50, 56], a: [[38, 21], [29, 9]], a2: [[62, 21], [71, 9]], l: [[40, 71], [31, 84]], l2: [[60, 71], [69, 84]] },
    L([10, 89], [90, 89]) + L([14, 34], [24, 38]) + L([12, 46], [22, 46]) + L([86, 34], [76, 38]) + L([88, 46], [78, 46]) + C([22, 64], 2) + C([80, 62], 2)
  ),
  bike: fig(
    { h: [53, 22], n: [48, 31], p: [38, 52], a: [[57, 41], [68, 42]], l: [[56, 59], [52, 74]] },
    ground + L([38, 55], [52, 74]) + L([52, 74], [68, 42]) + L([66, 42], [74, 40]) + C([66, 76], 11) + L([32, 89], [42, 55])
  ),
};

// Press francés "de Adrián": siempre se propone, nunca se hace
ICONS.skullNever = `<g class="never">${ICONS.skullCrusher}</g>` +
  `<g class="stamp" transform="rotate(-20 50 50)"><rect x="8" y="36" width="84" height="28" rx="5"/><text x="50" y="58" text-anchor="middle" textLength="70" lengthAdjust="spacingAndGlyphs">NEVER</text></g>`;

// Curl Bayesian: el que se hace SIEMPRE
ICONS.bayesianAlways = ICONS.bayesian +
  `<g class="crown"><path d="M70,4 L74,14 L80,6 L84,14 L90,4 L88,18 L72,18 Z"/></g>` +
  `<g class="stamp always" transform="rotate(-14 50 50)"><rect x="6" y="62" width="88" height="24" rx="5"/><text x="50" y="80" text-anchor="middle" textLength="74" lengthAdjust="spacingAndGlyphs">ALWAYS</text></g>`;

// Elevaciones laterales: el ejercicio del pesado del grupo
ICONS.lateralAgain = ICONS.lateralRaise +
  `<g class="stamp again" transform="rotate(12 50 50)"><rect x="10" y="62" width="80" height="24" rx="5"/><text x="50" y="79" text-anchor="middle" textLength="70" lengthAdjust="spacingAndGlyphs">OTRA VEZ</text></g>`;

/** Devuelve el SVG del pictograma */
export function iconSvg(name, cls = '') {
  const inner = ICONS[name] || ICONS.curl;
  return `<svg class="pict ${cls}" viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`;
}
