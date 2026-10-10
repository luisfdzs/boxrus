// Scroll por paradas en móvil: cada gesto lleva a la parada siguiente o
// anterior y nunca deja la cámara a medio camino. Las posiciones son los
// centros de las pausas (la del epílogo es el cierre). El menú
// de píldora usa el mismo controlador para viajar directo a una parada.
import gsap from 'gsap';
import { RECORRIDO } from '../datos/paradas';

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

/** ¿Se usa el scroll por paradas? Pantalla táctil y vertical, como el encuadre móvil. */
export const usarPaginado = (forzado: boolean): boolean =>
  forzado || (matchMedia('(pointer: coarse)').matches && innerWidth / innerHeight < RECORRIDO.aspectoMovil);

interface Opciones {
  /** Posiciones de scroll (px) de cada parada, en orden. Se recalculan en cada uso. */
  posiciones: () => number[];
  reducido: boolean;
  /** Pinta el fundido a negro de los saltos del menú (0 = transparente, 1 = negro). */
  fundirANegro: (opacidad: number) => void;
}

export interface ControladorPaginado {
  /** Lleva a una parada: tramo real si es vecina; si no, salto con fundido a negro. Siempre dura un tramo. */
  irA: (indice: number) => void;
  /** Parada de destino mientras dura un viaje del menú; null si no hay viaje. */
  destinoViaje: () => number | null;
}

export function iniciarPaginado({ posiciones, reducido, fundirANegro }: Opciones): ControladorPaginado {
  const { segundosPorTransicion, segundosPorTramoMenu, umbralGesto, corte } = RECORRIDO.paginadoMovil;
  let animacion: gsap.core.Tween | null = null;
  let viaje: number | null = null;
  let inicioY: number | null = null;

  const animar = (indice: number, segundosPorTramo: number, esViaje: boolean) => {
    const lista = posiciones();
    const destino = lista[indice];
    const desde = window.scrollY;
    animacion?.kill();
    animacion = null;
    viaje = null;
    if (Math.abs(destino - desde) < 1) return;
    const tramos = Math.abs(indice - indiceFraccional(desde, lista));
    // Sin recorrido que animar (p. ej. al encajar antes de la primera parada), se coloca
    // directamente: una animación de duración cero acabaría antes de guardarse en `animacion`.
    if (reducido || tramos < 0.01) {
      window.scrollTo(0, destino);
      return;
    }
    viaje = esViaje ? indice : null;
    const proxy = { y: desde };
    animacion = gsap.to(proxy, {
      y: destino,
      duration: tramos * segundosPorTramo,
      ease: 'none',
      onUpdate: () => window.scrollTo(0, proxy.y),
      onComplete: () => {
        animacion = null;
        viaje = null;
      },
    });
  };

  /** Salto a una sección a más de un paso: medio tramo, fundido, corte y medio tramo. */
  const saltar = (destino: number) => {
    const lista = posiciones();
    const origen = indiceMasCercano(window.scrollY, lista);
    const dir = Math.sign(destino - origen);
    const [a0, a1, b0, b1] = [lista[origen], lista[origen + dir], lista[destino - dir], lista[destino]];
    viaje = destino;
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
        animacion = null;
        viaje = null;
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

  // El dedo no desplaza la página: solo cuenta el gesto completo.
  document.documentElement.dataset.paginado = 'si';
  document.documentElement.style.overscrollBehavior = 'none';
  addEventListener('touchstart', (e) => (inicioY = e.touches[0].clientY), { passive: true });
  addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  addEventListener('touchend', (e) => {
    if (inicioY === null) return;
    const delta = inicioY - e.changedTouches[0].clientY;
    inicioY = null;
    if (animacion || Math.abs(delta) < umbralGesto) return;
    const lista = posiciones();
    const actual = indiceMasCercano(window.scrollY, lista);
    animar(destinoPaginado(actual, delta > 0 ? 1 : -1, lista.length), segundosPorTransicion, false);
  });

  // Al cargar o al girar la pantalla, quedarse en la posición más cercana.
  const encajar = () => {
    if (!animacion) animar(indiceMasCercano(window.scrollY, posiciones()), segundosPorTransicion, false);
  };
  addEventListener('resize', encajar);
  encajar();

  return {
    irA,
    destinoViaje: () => viaje,
  };
}
