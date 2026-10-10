// Planos del recorrido (docs/04-recorrido-y-paradas.md): cámara, encuadre
// móvil, deriva durante la pausa, puntos de paso de llegada y textos.
// Lo leen la isla 3D (cámara) y los componentes Astro (interfaz).
import { puertaJaula, type Vec3 } from './nave';

export type IdParada = 'P' | '1' | '2' | '3' | '4' | '5' | 'E';

export interface Encuadre {
  posicion: Vec3;
  mira: Vec3;
  /** Focal equivalente en full frame (mm). */
  focal: number;
}

export interface PuntoDePaso {
  posicion: Vec3;
  mira: Vec3;
}

export interface Parada {
  id: IdParada;
  nombre: string;
  escritorio: Encuadre;
  /** Encuadre para pantallas verticales: más campo y el protagonista más arriba. */
  movil: Encuadre;
  /** Desplazamiento de cámara y mira a lo largo de la pausa (centrado en el encuadre). */
  deriva: Vec3;
  /** Puntos de paso desde la parada anterior hasta esta. */
  llegada: PuntoDePaso[];
  interfaz: {
    antetitulo?: string;
    titular: string;
    subtitulo?: string;
    texto?: string;
    boton?: { texto: string; href: string };
    /** Indicación sin enlace (p. ej. «Desliza para entrar»). */
    indicacion?: string;
  };
}

export const RECORRIDO = {
  /** Fracción de cada tramo dedicada a la pausa (docs/04: ~40 %). */
  fraccionPausa: 0.4,
  /** Pantallas de scroll de la pista completa. */
  pantallas: 8,
  /** Distancia mínima de la cámara a cualquier obstáculo (m). */
  margenColision: 0.3,
  /** Peso del giro de la mirada frente al desplazamiento al repartir la velocidad (m por radián). */
  metrosPorRadian: 8,
  /** Por debajo de esta relación ancho/alto se usa el encuadre móvil. */
  aspectoMovil: 0.8,
  /**
   * Móvil (táctil y vertical): cada gesto lleva a la parada siguiente o anterior,
   * sin posiciones intermedias. El scroll avanza a ritmo constante y la propia
   * trayectoria pone la aceleración y la frenada de cada transición.
   */
  paginadoMovil: {
    segundosPorTransicion: 2.2,
    /**
     * Duración de un salto del menú de píldora. Entre secciones vecinas es el
     * tramo real; si están a más de un paso, se recorre la primera mitad del
     * primer tramo, se funde a negro, se corta a la mitad del último tramo y se
     * funde desde negro hasta el destino: dura lo mismo que un salto vecino.
     */
    segundosPorTramoMenu: 1.5,
    /** Fracción central del salto con fundido y, dentro de ella, la de negro total. */
    corte: { fraccionFundido: 0.4, fraccionNegro: 0.16 },
    /** Desplazamiento mínimo del dedo (px) para contar como gesto. */
    umbralGesto: 30,
  },
} as const;

/** Punto a `d` metros de una puerta de la jaula a lo largo de su normal (d < 0: hacia dentro). */
const junto = (puerta: ReturnType<typeof puertaJaula>, d: number, y: number): Vec3 => [
  puerta.centro[0] + puerta.normal[0] * d,
  y,
  puerta.centro[1] + puerta.normal[1] * d,
];

const delantera = puertaJaula('delantera');
const trasera = puertaJaula('trasera');

/** Altura de cámara al cruzar las puertas: por debajo del cable superior y con margen. */
const yPuerta = 2.05;

export const PARADAS: Parada[] = [
  {
    id: 'P',
    nombre: 'La entrada',
    escritorio: { posicion: [0, 1.3, 3], mira: [0, 1.6, -30], focal: 27 },
    movil: { posicion: [0, 1.4, 3.1], mira: [0, 0.6, -30], focal: 14 },
    deriva: [0, 0, -0.8],
    llegada: [],
    interfaz: {
      titular: 'Boxrus',
      subtitulo: 'Entrena donde se forjan los combates.',
      texto: 'MMA, boxeo y deportes de contacto en una nave de 1.700 m².',
      indicacion: 'Desliza para entrar',
    },
  },
  {
    id: '1',
    nombre: 'Horario',
    escritorio: { posicion: [-9.5, 2.2, -14], mira: [-17.9, 3.2, -22.5], focal: 35 },
    movil: { posicion: [-8.6, 2.2, -12.6], mira: [-17.9, 2.4, -22.5], focal: 22 },
    deriva: [-0.25, 0, -0.2],
    llegada: [{ posicion: [-1.5, 1.6, -6], mira: [-7, 2.4, -16] }],
    interfaz: {
      antetitulo: 'Horario',
      titular: 'Cada asalto empieza a su hora.',
      boton: { texto: 'Ver horario completo', href: '/horario' },
    },
  },
  {
    id: '2',
    nombre: 'Clases',
    // Mirando a la puerta trasera: sus dos postes anclan el plano y anticipan la salida.
    escritorio: { posicion: [-0.6, 2.1, -19.4], mira: [3.2, 1.5, -23.2], focal: 20 },
    // En vertical, un poste centrado (donde irá BOXRUS).
    movil: { posicion: [-0.6, 2.1, -19.4], mira: [4.53, 1.4, -21.88], focal: 14 },
    deriva: [0.15, 0, -0.15],
    llegada: [
      { posicion: [-7.2, 2.1, -14.2], mira: [-8, 1.8, -22.5] },
      { posicion: junto(delantera, 1.6, yPuerta), mira: junto(delantera, -4, 1.7) },
      { posicion: junto(delantera, 0, yPuerta), mira: junto(delantera, -5, 1.6) },
    ],
    interfaz: {
      antetitulo: 'Clases',
      titular: 'Seis disciplinas, un mismo tatami.',
      boton: { texto: 'Ver clases', href: '/clases' },
    },
  },
  {
    id: '3',
    nombre: 'Galería',
    escritorio: { posicion: [12.5, 1.6, -12], mira: [16.5, 1.3, -18], focal: 35 },
    movil: { posicion: [12, 1.6, -12], mira: [15.8, 1, -21], focal: 18 },
    deriva: [0, 0, 2],
    llegada: [
      { posicion: junto(trasera, -1.2, yPuerta), mira: junto(trasera, 6, 1.6) },
      { posicion: junto(trasera, 0, yPuerta), mira: junto(trasera, 9, 1.6) },
      { posicion: junto(trasera, 1.8, 1.85), mira: [13, 1.5, -25] },
      { posicion: [8.8, 1.7, -19], mira: [16, 1.4, -21] },
    ],
    interfaz: {
      antetitulo: 'Galería',
      titular: 'Lo que pasa aquí dentro.',
      boton: { texto: 'Ver galería', href: '/galeria' },
    },
  },
  {
    id: '4',
    nombre: 'Premios',
    escritorio: { posicion: [0, 5.6, -7.5], mira: [0, 0.6, -20], focal: 22 },
    movil: { posicion: [0, 5.6, -9], mira: [0, 0.2, -20], focal: 14 },
    deriva: [0, 0, -0.4],
    llegada: [
      { posicion: [11.2, 2.8, -10.6], mira: [8.5, 1.2, -20] },
      { posicion: [5.5, 4.6, -11.2], mira: [1.5, 1, -19.5] },
    ],
    interfaz: {
      antetitulo: 'Premios y reconocimientos',
      titular: 'Lo que hemos ganado, peleando desde aquí.',
      boton: { texto: 'Ver todos', href: '/premios' },
    },
  },
  {
    id: '5',
    nombre: 'Ubicación',
    // El pilar (−10, −40) entra como silueta a contraluz; más suelo para los haces.
    escritorio: { posicion: [6, 1.6, -31], mira: [-1, 2.8, -44], focal: 24 },
    movil: { posicion: [6, 1.6, -31], mira: [-1, 2.6, -44], focal: 16 },
    deriva: [-0.2, 0, -0.5],
    llegada: [
      { posicion: [3, 5, -17], mira: [2.5, 1.2, -28] },
      { posicion: [6.5, 3.6, -24], mira: [2, 2, -36] },
    ],
    interfaz: {
      antetitulo: 'Ubicación',
      titular: 'Ven a conocernos.',
      boton: { texto: 'Ver ubicación', href: '/ubicacion' },
    },
  },
  {
    id: 'E',
    nombre: 'Epílogo',
    // x = 1,8 e y = 4,5: centro del ventanal central (en x = 0 hay machón entre ventanales).
    escritorio: { posicion: [1.8, 4.5, -39.5], mira: [1.8, 4.5, -50], focal: 35 },
    movil: { posicion: [1.8, 4.5, -39.5], mira: [1.8, 4.1, -50], focal: 24 },
    // Avance hacia el ventanal durante la pausa, mientras funde a blanco.
    deriva: [0, 0, -3],
    llegada: [],
    interfaz: {
      titular: 'Boxrus. Tu primera clase te espera.',
    },
  },
];
