// Iluminación y atmósfera de la nave (docs/03, «Iluminación» y «Atmósfera»).
// Hora del día: mañana fría (pregunta 5 de docs/09, decidida el 2026-10-10).
import type { Vec3 } from './nave';
import { JAULA } from './nave';

export const LUZ = {
  /**
   * Mapeo tonal AgX (más desaturado que ACES en altas luces; ganó la prueba A/B con
   * Neutral, docs/09) y exposición. 1,8 desde que el entorno es el capturado de la
   * nave: el HDRI genérico aportaba mucho relleno y con él bastaba 1.
   */
  exposicion: 1.8,
  /**
   * Mapa de entorno capturado de la propia nave (Entorno.tsx): una cámara cúbica
   * en `posicion` pinta la escena una vez cargadas las texturas y el resultado pasa
   * a PMREM. Sustituye al HDRI genérico, cuyas ventanas y cielo, multiplicados por
   * el Fresnel, aclaraban el tatami a ángulo rasante. `resolucion`: lado de cada
   * cara del cubo. `intensidad`: la general (la radiancia ya es la de la escena);
   * `materiales` la rebaja o sube por material (envMapIntensity).
   */
  entorno: {
    posicion: [JAULA.centro[0], 3, JAULA.centro[2]] as Vec3,
    resolucion: 128,
    intensidad: 1,
    materiales: { tatami: 0.3, juntaTatami: 0.3, hormigon: 0.4, malla: 0.6, lona: 0.5, carcasa: 0.1, digitoApagado: 0.1 } as Record<string, number>,
  },
  /**
   * Sol de mañana: entra por los ventanales del fondo y del muro derecho (este),
   * a ~23° de elevación (con 30° las manchas del suelo eran cortas y parecían
   * alfombrillas). `direccion` apunta de la escena hacia el sol. La cubierta
   * y los muros arrojan sombra: solo entra por los huecos de los ventanales.
   */
  sol: {
    color: '#fff4e2',
    intensidad: 2.5,
    direccion: [0.584, 0.391, -0.711] as Vec3,
    distancia: 60,
    objetivo: [0, 0, -20] as Vec3,
    // radio 1: con más, el PCF de three (5 muestras giradas con ruido) deja bordes punteados
    // que, sin TAA, hacían que las manchas parecieran alfombrillas.
    sombra: { resolucion: 2048, lado: 34, radio: 1, sesgo: -0.0004, sesgoNormal: 0.015 },
  },
  /** Relleno frío de los fluorescentes (hasta tener la luz precalculada): cielo y suelo del hemisferio. */
  relleno: { cielo: '#cfdcea', suelo: '#2a2b2d', intensidad: 0.45 },
  /**
   * Refuerzo cenital sobre la jaula: foco hacia la lona, con caída hasta la malla.
   * Sin sombra: desde el centro, la de la malla y los postes cae hacia fuera (nunca
   * sobre la lona); en la prueba solo añadía ~10 llamadas de dibujo y ~16.000
   * triángulos, sin nada visible a cambio (docs/09).
   */
  refuerzoJaula: {
    color: '#e6f2ff',
    intensidad: 200,
    posicion: [JAULA.centro[0], 6.3, JAULA.centro[2]] as Vec3,
    angulo: 0.75,
    penumbra: 0.6,
    distancia: 14,
  },
  /**
   * Brillo de los emisivos (fluorescentes, vidrio de los ventanales y dígitos del
   * marcador). El vidrio lleva además un degradado vertical por hoja (frío arriba,
   * cálido abajo) y una variación de brillo entre hojas, con semilla.
   */
  emisivos: { fluorescente: 4, vidrio: 7, digitos: 0.9, digitosApagados: 0.04 },
  /** Colores del degradado (con su luminancia: abajo, más tenue y cálido) y variación de brillo entre hojas. */
  vidrio: { arriba: '#dce8f8', abajo: '#a8865f', variacion: 0.04, semilla: 4409 },
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
