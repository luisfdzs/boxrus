// Scroll por paradas en móvil: cada gesto lleva a la parada siguiente o
// anterior y nunca deja la cámara a medio camino. Las posiciones son los
// centros de las pausas y, tras el epílogo, el cierre de la página.
import gsap from 'gsap';
import { RECORRIDO } from '../datos/paradas';

/** Índice de la posición más cercana a un valor (progreso o píxeles). */
export const indiceMasCercano = (valor: number, posiciones: number[]): number =>
  posiciones.reduce((mejor, p, i) => (Math.abs(p - valor) < Math.abs(posiciones[mejor] - valor) ? i : mejor), 0);

/** Siguiente índice según la dirección del gesto (+1 avanza, −1 retrocede), sin salirse. */
export const destinoPaginado = (actual: number, direccion: 1 | -1, total: number): number =>
  Math.min(total - 1, Math.max(0, actual + direccion));

/** ¿Se usa el scroll por paradas? Pantalla táctil y vertical, como el encuadre móvil. */
export const usarPaginado = (forzado: boolean): boolean =>
  forzado || (matchMedia('(pointer: coarse)').matches && innerWidth / innerHeight < RECORRIDO.aspectoMovil);

interface Opciones {
  /** Posiciones de scroll (px) de cada parada y del cierre, en orden. Se recalculan en cada gesto. */
  posiciones: () => number[];
  reducido: boolean;
}

export function iniciarPaginado({ posiciones, reducido }: Opciones): void {
  const { segundosPorTransicion, umbralGesto } = RECORRIDO.paginadoMovil;
  let animando = false;
  let inicioY: number | null = null;

  const ir = (indice: number) => {
    const destino = posiciones()[indice];
    const desde = window.scrollY;
    if (Math.abs(destino - desde) < 1) return;
    if (reducido) {
      window.scrollTo(0, destino);
      return;
    }
    animando = true;
    const proxy = { y: desde };
    gsap.to(proxy, {
      y: destino,
      duration: segundosPorTransicion,
      ease: 'none',
      onUpdate: () => window.scrollTo(0, proxy.y),
      onComplete: () => {
        animando = false;
      },
    });
  };

  // El dedo no desplaza la página: solo cuenta el gesto completo.
  document.documentElement.style.overscrollBehavior = 'none';
  addEventListener('touchstart', (e) => (inicioY = e.touches[0].clientY), { passive: true });
  addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  addEventListener('touchend', (e) => {
    if (inicioY === null) return;
    const delta = inicioY - e.changedTouches[0].clientY;
    inicioY = null;
    if (animando || Math.abs(delta) < umbralGesto) return;
    const lista = posiciones();
    const actual = indiceMasCercano(window.scrollY, lista);
    ir(destinoPaginado(actual, delta > 0 ? 1 : -1, lista.length));
  });

  // Al cargar o al girar la pantalla, quedarse en la posición más cercana.
  const encajar = () => {
    if (!animando) ir(indiceMasCercano(window.scrollY, posiciones()));
  };
  addEventListener('resize', encajar);
  encajar();
}
