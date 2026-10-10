// Generador aleatorio con semilla (mulberry32). Toda la aleatoriedad de la escena
// pasa por aquí para que el recorrido y las capturas sean deterministas.
export type Azar = () => number;

export function crearAzar(semilla: number): Azar {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const entre = (azar: Azar, min: number, max: number): number => min + (max - min) * azar();
