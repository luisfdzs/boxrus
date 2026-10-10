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
  /**
   * Luz precalculada en Blender (herramientas/blender/, docs/03). Lo leen los
   * scripts a través de parametros.json (?exportar=1). Pasada «fluorescentes»:
   * directa + indirecta de las regletas; pasada «dia»: solo la indirecta del sol
   * y del cielo de los ventanales. `mezcla` pondera las dos al combinarlas.
   */
  horneado: {
    resoluciones: { suelo: [384, 512], techo: [192, 256], muros: [2048, 112] },
    /** Altura del plano de horneado del suelo (encima de las placas de tatami). */
    alturaSuelo: 0.025,
    fuerzaFluorescente: 30,
    fuerzaCielo: 6,
    fuerzaSol: 4,
    /** Diámetro aparente del sol (grados): sombras suaves en la luz rebotada. */
    solAngulo: 2,
    /** Albedo difuso por material para la luz rebotada (los texturizados, con su color medio). */
    albedos: {
      muro: '#76615a',
      tatami: '#23272b',
      juntaTatami: '#0e0f10',
      hormigon: '#6c6c6a',
      acero: '#16181b',
      correa: '#6e2a22',
      chapa: '#8a9096',
      porton: '#3a3d40',
      lona: '#3a3c3f',
      faldon: '#121314',
      acolchado: '#141517',
      saco: '#1b1b1d',
      cadena: '#7a7e83',
      otros: '#3a3a3a',
    },
    mezcla: { fluorescentes: 1, dia: 1 },
  },
} as const;
