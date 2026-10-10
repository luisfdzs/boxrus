// Medidas y coordenadas de la nave (docs/03-escena.md). Metros, Y arriba,
// entrada en z = +4 y la nave hacia Z negativo. La escena y las pruebas
// leen de aquí; nada de números sueltos en los componentes.

export type Vec3 = readonly [number, number, number];

export const ENVOLVENTE = {
  xMin: -18,
  xMax: 18,
  zFrente: 4,
  zFondo: -44,
  alturaAlero: 7,
  alturaCumbrera: 9,
  grosorMuro: 0.3,
} as const;

export const ANCHO = ENVOLVENTE.xMax - ENVOLVENTE.xMin;
export const PROFUNDIDAD = ENVOLVENTE.zFrente - ENVOLVENTE.zFondo;

/** Altura de la cubierta a dos aguas en una x dada (cumbrera en x = 0). */
export const alturaCubierta = (x: number): number =>
  ENVOLVENTE.alturaAlero +
  (ENVOLVENTE.alturaCumbrera - ENVOLVENTE.alturaAlero) * (1 - Math.abs(x) / ENVOLVENTE.xMax);

export const PORTON = { ancho: 5, alto: 4.5 } as const;

export const SUELO = {
  /** Franja de hormigón pulido junto a la entrada. */
  zFinHormigon: 1,
  placaTatami: { ancho: 1, largo: 2 },
  juntaTatami: 0.012,
  /** Variación de tono entre placas (fracción del gris base). */
  variacionTono: 0.08,
  semillaTatami: 1701,
  /** Desgaste del tatami por código (rugosidad y tono), en coordenadas del mundo. */
  desgaste: { semilla: 2203, tamano: 8, resolucion: 512, intensidad: 0.14 },
} as const;

/** Chapa ondulada de la cubierta: normal map por código; las ondas bajan por la pendiente. */
export const CHAPA = {
  paso: 0.18,
  profundidad: 0.04,
  resolucion: 64,
  /** Relieve que conserva cada nivel de mipmap (0 en los siguientes): evita el moiré de la cubierta vista de lejos. */
  relieveMipmaps: [1, 1, 0.6, 0.25],
} as const;

export const ESTRUCTURA = {
  porticosZ: [2, -4, -10, -16, -22, -28, -34, -40],
  cordonInferior: 6.5,
  canto: 0.2,
  /** x de los montantes de cada cercha (simétricos). */
  montantesX: [0, 4.5, 9, 13.5],
  pilares: { x: [-10, 10], z: [-4, -16, -28, -40], seccion: 0.3 },
  correas: { separacion: 1.5, seccion: 0.12 },
} as const;

export const VENTANALES = {
  fondo: { cantidad: 10, ancho: 2.4, alto: 2.2, alfeizar: 3.4 },
  laterales: { ancho: 2.4, alto: 1.6, alfeizar: 4.2 },
  perfil: 0.06,
} as const;

/** Centros x de los ventanales del muro del fondo, repartidos en el ancho. */
export const ventanalesFondoX = (): number[] => {
  const { cantidad } = VENTANALES.fondo;
  const paso = ANCHO / cantidad;
  return Array.from({ length: cantidad }, (_, i) => ENVOLVENTE.xMin + paso * (i + 0.5));
};

/** Centros z de los ventanales laterales: uno entre cada par de pórticos. */
export const ventanalesLateralesZ = (): number[] => {
  const z = ESTRUCTURA.porticosZ;
  return z.slice(0, -1).map((zi, i) => (zi + z[i + 1]) / 2);
};

export const JAULA = {
  centro: [0, 0, -20] as Vec3,
  radio: 4.9,
  altoPlataforma: 0.6,
  retranqueoFaldon: 0.15,
  poste: { radio: 0.15, alto: 2.5 },
  /** Malla de eslabones: rombo de `paso` m de diagonal, alambre de `radioAlambre` m; textura con alfa por código. */
  malla: { yMin: 0.75, yMax: 2.35, paso: 0.06, radioAlambre: 0.0025, resolucion: 64 },
  cable: { y: 2.45, radio: 0.08 },
  /** Hueco libre de cada puerta, centrado en su cara. */
  anchoPuerta: 1.2,
  /** Ángulo (grados, en el plano XZ) del primer vértice; con 22,5° hay caras mirando a ejes y diagonales. */
  anguloVertice0: 22.5,
  /** Normales de las caras con puerta: delantera izquierda (−X, +Z) y trasera derecha (+X, −Z). */
  puertas: { delantera: 135, trasera: -45 },
} as const;

const rad = (grados: number) => (grados * Math.PI) / 180;

/** Dirección en XZ para un ángulo: 0° = +X, 90° = +Z. */
export const direccionXZ = (grados: number): [number, number] => [Math.cos(rad(grados)), Math.sin(rad(grados))];

export const apotemaJaula = JAULA.radio * Math.cos(Math.PI / 8);

/** Vértices del octógono en XZ (absolutos). */
export const verticesJaula = (): [number, number][] =>
  Array.from({ length: 8 }, (_, i) => {
    const [dx, dz] = direccionXZ(JAULA.anguloVertice0 + i * 45);
    return [JAULA.centro[0] + JAULA.radio * dx, JAULA.centro[2] + JAULA.radio * dz];
  });

/** Centro (XZ) y normal hacia fuera de una puerta. */
export const puertaJaula = (cual: keyof typeof JAULA.puertas) => {
  const normal = direccionXZ(JAULA.puertas[cual]);
  return {
    centro: [JAULA.centro[0] + apotemaJaula * normal[0], JAULA.centro[2] + apotemaJaula * normal[1]] as [number, number],
    normal,
  };
};

export const SACOS = {
  radio: 0.2,
  alto: 1.5,
  base: 0.5,
  radioCadena: 0.03,
  // Más cerca del eje que en el plan inicial (±7, −2): así entran en el prólogo también en vertical.
  protagonistas: { posiciones: [[-2.2, -3], [2.2, -3]] as [number, number][], yViga: 6.5 },
  semillaBalanceo: 77,
  /** Amplitud del balanceo, en radianes. */
  balanceo: 0.012,
} as const;

export const BASTIDORES = {
  x: 16.5,
  zInicio: -8,
  zFin: -32,
  alto: 3.2,
  separacionSacos: 3,
  /** x de los postes junto al muro y separación entre ellos. */
  xPostes: 17.6,
  separacionPostes: 6,
  seccion: 0.12,
} as const;

/** z de los sacos de un bastidor (9 por lado). */
export const sacosBastidorZ = (): number[] => {
  const n = Math.round((BASTIDORES.zInicio - BASTIDORES.zFin) / BASTIDORES.separacionSacos) + 1;
  return Array.from({ length: n }, (_, i) => BASTIDORES.zInicio - i * BASTIDORES.separacionSacos);
};

export const PERAS = {
  /** Plataformas de pera de velocidad en cada extremo de cada bastidor. */
  plataforma: { radio: 0.35, y: 2.0, x: 17.5, separacionExtremo: 1.5 },
  pera: { radio: 0.11 },
  /** Pera loca de suelo a cordón, junto a la primera plataforma. */
  loca: { x: 16.8, separacion: 1.0, y: 1.55, radio: 0.12 },
} as const;

export const FLUORESCENTES = {
  y: 6.2,
  filasX: [-13, -8, -3, 3, 8, 13],
  largo: 1.5,
  ancho: 0.25,
  alto: 0.08,
  separacion: 3,
  zInicio: 1,
  zFin: -43,
  // Por debajo de la banda de ventanales vista desde el picado (parada 4).
  refuerzoJaula: { y: 4.4, lado: 4 },
} as const;

/** Posiciones (x, z) de las regletas de las 6 filas. */
export const regletasFilas = (): [number, number][] => {
  const zs: number[] = [];
  for (let z = FLUORESCENTES.zInicio; z >= FLUORESCENTES.zFin; z -= FLUORESCENTES.separacion) zs.push(z);
  return FLUORESCENTES.filasX.flatMap((x) => zs.map((z) => [x, z] as [number, number]));
};

/** Regletas del refuerzo sobre la jaula: centro (x, z) y si van a lo largo de X. */
export const regletasRefuerzo = (): { x: number; z: number; aLoLargoX: boolean }[] => {
  const m = FLUORESCENTES.refuerzoJaula.lado / 2;
  const [cx, , cz] = JAULA.centro;
  return [
    { x: cx - m, z: cz, aLoLargoX: false },
    { x: cx + m, z: cz, aLoLargoX: false },
    { x: cx, z: cz - m, aLoLargoX: true },
    { x: cx, z: cz + m, aLoLargoX: true },
  ];
};

export const MARCADOR = {
  // z = −22: pared limpia entre ventanales, postes del bastidor y cadenas (en −20 quedaba encajonado).
  centro: [-17.9, 3.6, -22] as Vec3,
  ancho: 1.2,
  alto: 0.5,
  fondo: 0.12,
} as const;
