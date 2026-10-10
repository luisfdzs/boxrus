// Viajes directos a una parada (menú de píldora y logotipo, en escritorio y
// móvil) y scroll por paradas en móvil: cada gesto lleva a la parada siguiente
// o anterior y nunca deja la cámara a medio camino. Las posiciones son los
// centros de las pausas (la del epílogo es el cierre).
import gsap from 'gsap';
import { PARADAS, RECORRIDO } from '../datos/paradas';

/** Índice de la posición más cercana a un valor (progreso o píxeles). */
export const indiceMasCercano = (valor: number, posiciones: number[]): number =>
  posiciones.reduce((mejor, p, i) => (Math.abs(p - valor) < Math.abs(posiciones[mejor] - valor) ? i : mejor), 0);

/** Posición expresada como índice fraccionario (1,5 = a medio camino entre las posiciones 1 y 2). */
export const indiceFraccional = (valor: number, posiciones: number[]): number => {
  if (valor <= posiciones[0]) return 0;
  for (let i = 0; i < posiciones.length - 1; i++) {
    const [a, b] = [posiciones[i], posiciones[i + 1]];
    if (valor <= b) return i + (b > a ? (valor - a) / (b - a) : 0);
  }
  return posiciones.length - 1;
};

/**
 * Salto del menú entre secciones no vecinas, con `s` de 0 a 1: primera mitad
 * del tramo de salida [a0 → a1] y segunda mitad del tramo de llegada [b0 → b1].
 */
export const posicionSalto = (s: number, a0: number, a1: number, b0: number, b1: number): number =>
  s < 0.5 ? a0 + (a1 - a0) * s : b0 + (b1 - b0) * s;

/** Opacidad del fundido a negro en un salto: sube, se mantiene en negro en el centro y baja. */
export const opacidadCorte = (s: number, fraccionFundido: number, fraccionNegro: number): number => {
  const rampa = (fraccionFundido - fraccionNegro) / 2;
  const d = Math.abs(s - 0.5);
  return Math.min(1, Math.max(0, (fraccionFundido / 2 - d) / rampa));
};

/** Siguiente índice según la dirección del gesto (+1 avanza, −1 retrocede), sin salirse. */
export const destinoPaginado = (actual: number, direccion: 1 | -1, total: number): number =>
  Math.min(total - 1, Math.max(0, actual + direccion));

/**
 * Dirección de un gesto (+1 avanza, −1 retrocede, null si no cuenta). Deslizar
 * hacia arriba o hacia la derecha avanza; hacia abajo o hacia la izquierda,
 * retrocede. En horizontal solo entre paradas del recorrido por la nave, hasta
 * `ultimaHorizontal`: la salida por el ventanal y el cierre, solo en vertical.
 */
export const direccionGesto = (
  dx: number,
  dy: number,
  umbral: number,
  actual: number,
  ultimaHorizontal: number,
): 1 | -1 | null => {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < umbral) return null;
  if (Math.abs(dy) >= Math.abs(dx)) return dy > 0 ? 1 : -1;
  const direccion = dx > 0 ? 1 : -1;
  return actual + direccion > ultimaHorizontal || actual > ultimaHorizontal ? null : direccion;
};

/** ¿Se usa el scroll por paradas? Pantalla táctil y vertical, como el encuadre móvil. */
export const usarPaginado = (forzado: boolean): boolean =>
  forzado || (matchMedia('(pointer: coarse)').matches && innerWidth / innerHeight < RECORRIDO.aspectoMovil);

interface OpcionesViajes {
  /** Posiciones de scroll (px) de cada parada, en orden. Se recalculan en cada uso. */
  posiciones: () => number[];
  reducido: boolean;
  /** Pinta el fundido a negro de los saltos del menú (0 = transparente, 1 = negro). */
  fundirANegro: (opacidad: number) => void;
  /** Avisos al empezar y acabar cada animación (p. ej. para parar el scroll suave). */
  alEmpezar?: () => void;
  alTerminar?: () => void;
}

export interface ControladorViajes {
  /** Lleva a una parada: tramo real si es vecina; si no, salto con fundido a negro. Siempre dura un tramo. */
  irA: (indice: number) => void;
  /** Parada de destino mientras dura un viaje; null si no hay viaje. */
  destinoViaje: () => number | null;
}

interface Viajes extends ControladorViajes {
  /** Recorre los tramos reales hasta una parada, a `segundosPorTramo` por tramo. */
  animar: (indice: number, segundosPorTramo: number, esViaje: boolean) => void;
  ocupado: () => boolean;
}

export function crearViajes({ posiciones, reducido, fundirANegro, alEmpezar, alTerminar }: OpcionesViajes): Viajes {
  const { segundosPorTramoMenu, corte } = RECORRIDO.paginadoMovil;
  let animacion: gsap.core.Tween | null = null;
  let viaje: number | null = null;

  const terminar = () => {
    animacion = null;
    viaje = null;
    alTerminar?.();
  };

  const animar = (indice: number, segundosPorTramo: number, esViaje: boolean) => {
    const lista = posiciones();
    const destino = lista[indice];
    const desde = window.scrollY;
    if (animacion) {
      animacion.kill();
      terminar();
    }
    if (Math.abs(destino - desde) < 1) return;
    const tramos = Math.abs(indice - indiceFraccional(desde, lista));
    // Sin recorrido que animar (p. ej. al encajar antes de la primera parada), se coloca
    // directamente: una animación de duración cero acabaría antes de guardarse en `animacion`.
    if (reducido || tramos < 0.01) {
      window.scrollTo(0, destino);
      return;
    }
    viaje = esViaje ? indice : null;
    alEmpezar?.();
    const proxy = { y: desde };
    animacion = gsap.to(proxy, {
      y: destino,
      duration: tramos * segundosPorTramo,
      ease: 'none',
      onUpdate: () => window.scrollTo(0, proxy.y),
      onComplete: terminar,
    });
  };

  /**
   * Salto a una sección a más de un paso: medio tramo, fundido, corte y medio tramo.
   * Sale de la posición actual, que en escritorio puede estar entre dos paradas.
   */
  const saltar = (destino: number) => {
    const lista = posiciones();
    const origen = indiceMasCercano(window.scrollY, lista);
    const dir = Math.sign(destino - origen);
    const [a0, a1, b0, b1] = [window.scrollY, lista[origen + dir], lista[destino - dir], lista[destino]];
    viaje = destino;
    alEmpezar?.();
    const proxy = { s: 0 };
    animacion = gsap.to(proxy, {
      s: 1,
      duration: segundosPorTramoMenu,
      ease: 'none',
      onUpdate: () => {
        window.scrollTo(0, posicionSalto(proxy.s, a0, a1, b0, b1));
        fundirANegro(opacidadCorte(proxy.s, corte.fraccionFundido, corte.fraccionNegro));
      },
      onComplete: () => {
        fundirANegro(0);
        terminar();
      },
    });
  };

  const irA = (indice: number) => {
    if (animacion) return;
    const lista = posiciones();
    const pasos = Math.abs(indice - indiceMasCercano(window.scrollY, lista));
    if (pasos > 1 && !reducido) saltar(indice);
    else animar(indice, segundosPorTramoMenu, true);
  };

  return { irA, animar, destinoViaje: () => viaje, ocupado: () => animacion !== null };
}

/** Scroll por paradas (móvil): los gestos táctiles mueven de parada en parada. */
export function iniciarPaginado(viajes: Viajes, posiciones: () => number[]): void {
  const { segundosPorTransicion, umbralGesto } = RECORRIDO.paginadoMovil;
  // Última parada a la que se llega deslizando en horizontal: la anterior al epílogo.
  const ultimaHorizontal = PARADAS.findIndex((p) => p.id === 'E') - 1;
  let inicio: { x: number; y: number } | null = null;

  // El dedo no desplaza la página: solo cuenta el gesto completo.
  document.documentElement.dataset.paginado = 'si';
  document.documentElement.style.overscrollBehavior = 'none';
  addEventListener('touchstart', (e) => (inicio = { x: e.touches[0].clientX, y: e.touches[0].clientY }), { passive: true });
  addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  addEventListener('touchend', (e) => {
    if (inicio === null) return;
    const { clientX, clientY } = e.changedTouches[0];
    const [dx, dy] = [clientX - inicio.x, inicio.y - clientY];
    inicio = null;
    if (viajes.ocupado()) return;
    const lista = posiciones();
    const actual = indiceMasCercano(window.scrollY, lista);
    const direccion = direccionGesto(dx, dy, umbralGesto, actual, ultimaHorizontal);
    if (direccion) viajes.animar(destinoPaginado(actual, direccion, lista.length), segundosPorTransicion, false);
  });

  // Al cargar o al girar la pantalla, quedarse en la posición más cercana.
  const encajar = () => {
    if (!viajes.ocupado()) viajes.animar(indiceMasCercano(window.scrollY, posiciones()), segundosPorTransicion, false);
  };
  addEventListener('resize', encajar);
  encajar();
}
