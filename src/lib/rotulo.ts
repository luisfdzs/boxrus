// Rótulo BOXRUS de los acolchados de los postes (docs/03): cómo se coloca la
// textura sobre el cilindro del acolchado. Funciones puras (sin DOM ni Three)
// para poder probarlas; el lienzo lo pinta components/nave/escena/rotuloPostes.ts.
import { JAULA } from '../datos/nave';

type Rotulo = typeof JAULA.rotulo;
type Poste = typeof JAULA.poste;

/**
 * La textura cubre media vuelta del acolchado y se repite dos veces alrededor
 * (rótulo hacia fuera y hacia dentro del octógono). A lo alto solo cubre la
 * franja del rótulo; fuera de ella se estira su borde, que es fondo (sujeta en v).
 * El cilindro de three lleva u alrededor (u = 0 en +Z local, 0,25 en +X) y v de
 * abajo arriba; el centro del lienzo cae en u = 0,25 y 0,75 (+X y −X locales).
 */
export function disposicionRotulo(r: Rotulo = JAULA.rotulo, poste: Poste = JAULA.poste) {
  const mediaVuelta = Math.PI * poste.radio;
  const yMin = r.centroY - r.largo / 2 - r.margen;
  const yMax = r.centroY + r.largo / 2 + r.margen;
  const vMin = yMin / poste.alto;
  const vMax = yMax / poste.alto;
  return {
    yMin,
    yMax,
    mediaVuelta,
    /** Ancho del rótulo alrededor del poste: letras, separación y raya roja. */
    ancho: r.alto + r.detalle.separacion + r.detalle.grosor,
    lienzo: { ancho: Math.round(mediaVuelta * r.pxPorMetro), alto: Math.round((yMax - yMin) * r.pxPorMetro) },
    /** `repeat` y `offset` de la textura sobre las UV del cilindro. */
    repeticion: [2, 1 / (vMax - vMin)] as [number, number],
    desplazamiento: [0, -vMin / (vMax - vMin)] as [number, number],
  };
}

/**
 * Giro en Y (rad) del poste `i` para que el centro del rótulo (+X local) mire
 * hacia fuera del octógono, en la dirección de su vértice: un giro φ lleva +X a
 * (cos φ, −sen φ) en XZ, así que φ = −ángulo del vértice.
 */
export const giroPoste = (i: number): number => -((JAULA.anguloVertice0 + i * 45) * Math.PI) / 180;

/**
 * Cuerpo de letra (px) para que la tinta mida `alto` alrededor del poste sin
 * pasar de `largo` a lo alto. `anchoEm` (avances más espaciado) y `altoEm` (de
 * la tinta) son las medidas del texto con cuerpo 1.
 */
export function cuerpoRotulo(anchoEm: number, altoEm: number, r: Rotulo = JAULA.rotulo): number {
  return Math.min(r.alto / altoEm, r.largo / anchoEm) * r.pxPorMetro;
}
