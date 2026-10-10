// Texturas de la nave: ficheros externos (.ktx2, registrados en docs/07) y
// parámetros de las generadas por código que no dependen de las medidas de la
// nave. Tamaños de tesela en metros reales: las UV se calculan en coordenadas
// del mundo (ver usarUvMundo en materiales.ts).

export const TEXTURAS = {
  /** Carpeta pública de las texturas y del transcodificador Basis (nunca el CDN por defecto de drei). */
  carpeta: '/texturas/',
  transcodificador: '/basis/',
  /**
   * Red Brick 03 (Poly Haven, CC0). arm = oclusión (R), rugosidad (G), metal (B). Tesela de 1 × 1 m.
   * `saturacion` ajusta el color en el sombreador para acercarlo a la paleta de docs/02.
   * `lejania`: teselas por píxel en pantalla entre las que el relieve se apaga y la
   * rugosidad sube a 1 (quita las chispas especulares de las juntas a distancia).
   */
  ladrillo: {
    color: 'ladrillo_color.ktx2',
    normal: 'ladrillo_normal.ktx2',
    arm: 'ladrillo_arm.ktx2',
    tamano: [1, 1],
    relieve: 0.8,
    saturacion: 1,
    lejania: [1 / 512, 1 / 128],
  },
  /** Concrete 034 (ambientCG, CC0). Tesela 2:1 del tamaño de un panel de encofrado. */
  hormigon: {
    color: 'hormigon_color.ktx2',
    normal: 'hormigon_normal.ktx2',
    rugosidad: 'hormigon_rugosidad.ktx2',
    tamano: [2.4, 1.2],
  },
  /** Rubber 004 (ambientCG, CC0): solo el relieve del tatami; color y rugosidad van por código. */
  caucho: { normal: 'caucho_normal.ktx2', tamano: [0.75, 0.75] },
} as const;

/** Grano del cuero de los sacos, por código (Leather 011 se descartó: es capitoné). */
export const CUERO = {
  semilla: 3109,
  resolucion: 256,
  tamano: 0.25,
  relieve: 0.3,
  /**
   * Costuras en el sombreador (sin textura): `paneles` costuras verticales repartidas
   * alrededor y dos horizontales a `arriba` y `abajo` m de los extremos. Surco de
   * `ancho` m y `profundidad` m; `oscurecer` es cuánto oscurece la línea del surco.
   */
  costuras: { paneles: 4, arriba: 0.09, abajo: 0.07, ancho: 0.006, profundidad: 0.003, oscurecer: 0.45 },
} as const;

/** Mapa de entorno: Empty Warehouse 01 (Poly Haven, CC0) reducido a 512 × 256 con herramientas/reducir_hdr.py. */
export const ENTORNO = { fichero: '/entorno/empty_warehouse_01_512.hdr' } as const;
