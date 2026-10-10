// Scroll por paradas en móvil: cada gesto lleva a la parada siguiente o
// anterior y nunca deja la cámara a medio camino. Las posiciones son los
// centros de las pausas y, tras el epílogo, el cierre de la página. El menú
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

/** Siguiente índice según la dirección del gesto (+1 avanza, −1 retrocede), sin salirse. */
export const destinoPaginado = (actual: number, direccion: 1 | -1, total: number): number =>
  Math.min(total - 1, Math.max(0, actual + direccion));

/** ¿Se usa el scroll por paradas? Pantalla táctil y vertical, como el encuadre móvil. */
export const usarPaginado = (forzado: boolean): boolean =>
  forzado || (matchMedia('(pointer: coarse)').matches && innerWidth / innerHeight < RECORRIDO.aspectoMovil);

interface Opciones {
  /** Posiciones de scroll (px) de cada parada y del cierre, en orden. Se recalculan en cada uso. */
  posiciones: () => number[];
  reducido: boolean;
}

export interface ControladorPaginado {
  /** Viaja directo a una parada recorriendo las intermedias sin detenerse. */
  irA: (indice: number) => void;
  /** Parada de destino mientras dura un viaje del menú; null si no hay viaje. */
  destinoViaje: () => number | null;
}

export function iniciarPaginado({ posiciones, reducido }: Opciones): ControladorPaginado {
  const { segundosPorTransicion, segundosPorTramoMenu, umbralGesto } = RECORRIDO.paginadoMovil;
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
    if (reducido) {
      window.scrollTo(0, destino);
      return;
    }
    const tramos = Math.abs(indice - indiceFraccional(desde, lista));
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
    irA: (indice) => animar(indice, segundosPorTramoMenu, true),
    destinoViaje: () => viaje,
  };
}
