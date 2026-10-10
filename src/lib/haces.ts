// Haces de luz por los ventanales (docs/03, «Atmósfera»): cada ventanal soleado
// se barre en la dirección de la luz del sol hasta el suelo. Funciones puras, sin
// Three, para probarlas con Vitest y repartir el polvo dentro de los haces.
import { ENVOLVENTE, VENTANALES, ventanalesFondoX, ventanalesLateralesZ, type Vec3 } from '../datos/nave';

export interface Haz {
  /** Esquinas del hueco del ventanal (en la cara interior del muro), en orden. */
  hueco: [Vec3, Vec3, Vec3, Vec3];
  /** Las mismas esquinas llevadas a lo largo de la luz hasta el suelo o, si llegan antes, un muro. */
  fin: [Vec3, Vec3, Vec3, Vec3];
}

/**
 * Lleva un punto a lo largo de la dirección `luz` hasta el suelo (y = 0) o hasta la
 * cara interior de un muro, lo que llegue antes.
 */
export function alSuelo([x, y, z]: Vec3, luz: Vec3): Vec3 {
  const g = ENVOLVENTE.grosorMuro / 2;
  const limites: number[] = [y / -luz[1]];
  if (luz[0] < 0) limites.push((ENVOLVENTE.xMin + g - x) / luz[0]);
  if (luz[0] > 0) limites.push((ENVOLVENTE.xMax - g - x) / luz[0]);
  if (luz[2] < 0) limites.push((ENVOLVENTE.zFondo + g - z) / luz[2]);
  if (luz[2] > 0) limites.push((ENVOLVENTE.zFrente - g - z) / luz[2]);
  const t = Math.max(0, Math.min(...limites));
  return [x + luz[0] * t, y + luz[1] * t, z + luz[2] * t];
}

/**
 * Haces de los ventanales por los que entra el sol. `haciaElSol` apunta de la
 * escena al sol (LUZ.sol.direccion): solo cuentan los muros cuya normal interior
 * va en el sentido de la luz (fondo si la luz avanza hacia +Z; derecho si hacia −X;
 * izquierdo si hacia +X).
 */
export function hacesDeSol(haciaElSol: Vec3): Haz[] {
  const n = Math.hypot(...haciaElSol);
  const luz: Vec3 = [-haciaElSol[0] / n, -haciaElSol[1] / n, -haciaElSol[2] / n];
  if (luz[1] >= 0) return [];
  const g = ENVOLVENTE.grosorMuro / 2;
  const haces: Haz[] = [];
  const anadir = (hueco: [Vec3, Vec3, Vec3, Vec3]) =>
    haces.push({ hueco, fin: hueco.map((p) => alSuelo(p, luz)) as Haz['fin'] });

  const { fondo, laterales } = VENTANALES;
  if (luz[2] > 0) {
    const z = ENVOLVENTE.zFondo + g;
    for (const x of ventanalesFondoX()) {
      const [a, b] = [x - fondo.ancho / 2, x + fondo.ancho / 2];
      const [y0, y1] = [fondo.alfeizar, fondo.alfeizar + fondo.alto];
      anadir([[a, y0, z], [b, y0, z], [b, y1, z], [a, y1, z]]);
    }
  }
  for (const lado of [-1, 1] as const) {
    // Muro derecho (lado 1) si la luz va hacia −X; izquierdo si va hacia +X.
    if (lado * luz[0] >= 0) continue;
    const x = lado * (ENVOLVENTE.xMax - g);
    for (const zc of ventanalesLateralesZ()) {
      const [a, b] = [zc - laterales.ancho / 2, zc + laterales.ancho / 2];
      const [y0, y1] = [laterales.alfeizar, laterales.alfeizar + laterales.alto];
      anadir([[x, y0, a], [x, y0, b], [x, y1, b], [x, y1, a]]);
    }
  }
  return haces;
}
