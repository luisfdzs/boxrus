// Texturas de la nave: ficheros externos (.ktx2, registrados en docs/07) y
// parámetros de las generadas por código que no dependen de las medidas de la
// nave. Tamaños de tesela en metros reales: las UV se calculan en coordenadas
// del mundo (ver usarUvMundo en materiales.ts).

export const TEXTURAS = {
  /** Carpeta pública de las texturas y del transcodificador Basis (nunca el CDN por defecto de drei). */
  carpeta: '/texturas/',
  transcodificador: '/basis/',
  /** Red Brick 03 (Poly Haven, CC0). arm = oclusión (R), rugosidad (G), metal (B). Tesela de 1 × 1 m. */
  ladrillo: { color: 'ladrillo_color.ktx2', normal: 'ladrillo_normal.ktx2', arm: 'ladrillo_arm.ktx2', tamano: [1, 1] },
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
export const CUERO = { semilla: 3109, resolucion: 256, tamano: 0.25, relieve: 0.3 } as const;
