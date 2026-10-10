// Iluminación y atmósfera de la nave (docs/03, «Iluminación» y «Atmósfera»).
// Hora del día: mañana fría (pregunta 5 de docs/09, decidida el 2026-10-10).
import type { Vec3 } from './nave';
import { JAULA } from './nave';

export const LUZ = {
  /** Mapeo tonal AgX (más desaturado que ACES en altas luces) y exposición. */
  exposicion: 1,
  /** Mapa de entorno: reflejos en tatami, cuero, malla y acero. Rotación en Y (radianes). */
  entorno: { intensidad: 0.35, rotacion: 0 },
  /**
   * Sol de mañana: entra por los ventanales del fondo y del muro derecho (este),
   * a ~30° de elevación. `direccion` apunta de la escena hacia el sol. La cubierta
   * y los muros arrojan sombra: solo entra por los huecos de los ventanales.
   */
  sol: {
    color: '#fff4e2',
    intensidad: 3.2,
    direccion: [0.55, 0.5, -0.67] as Vec3,
    distancia: 60,
    objetivo: [0, 0, -20] as Vec3,
    sombra: { resolucion: 2048, lado: 34, radio: 3, sesgo: -0.0004, sesgoNormal: 0.03 },
  },
  /** Relleno frío de los fluorescentes (hasta tener la luz precalculada): cielo y suelo del hemisferio. */
  relleno: { cielo: '#cfdcea', suelo: '#16130f', intensidad: 0.55 },
  /** Refuerzo cenital sobre la jaula: foco suave hacia la lona. */
  refuerzoJaula: {
    color: '#e6f2ff',
    intensidad: 40,
    posicion: [JAULA.centro[0], 6.3, JAULA.centro[2]] as Vec3,
    angulo: 0.62,
    penumbra: 0.85,
    distancia: 14,
  },
  /** Brillo de los emisivos (fluorescentes y vidrio de los ventanales). */
  emisivos: { fluorescente: 4, vidrio: 2.4 },
} as const;
