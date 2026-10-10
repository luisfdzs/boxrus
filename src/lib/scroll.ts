// Scroll suave (Lenis) + ScrollTrigger → progreso global de la pista.
// En móvil, scroll por paradas (paginado.ts) en lugar de scroll libre. En los
// dos, viajes directos a una parada desde el menú y el logotipo.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { fijarProgreso } from './progreso';
import type { Modo } from './modo';
import { crearViajes, iniciarPaginado, usarPaginado, type ControladorViajes } from './paginado';
import { calcularPausas, progresoDeParada } from './pausas';

/** Devuelve el controlador de los viajes directos a una parada (menú y logotipo). */
export function iniciarScroll(
  pista: HTMLElement,
  modo: Modo,
  fundirANegro: (opacidad: number) => void = () => {},
): ControladorViajes {
  gsap.registerPlugin(ScrollTrigger);
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const paginado = !modo.captura && usarPaginado(modo.paginado);

  let lenis: Lenis | undefined;
  if (!modo.captura && !reducido && !paginado) {
    lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((tiempo) => lenis!.raf(tiempo * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const disparador = ScrollTrigger.create({
    trigger: pista,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => fijarProgreso(self.progress),
    snap: modo.ajuste && !paginado
      ? { snapTo: calcularPausas().map((p) => p.centro), delay: 0.25, duration: { min: 0.4, max: 1.2 }, ease: 'power2.inOut' }
      : undefined,
  });

  if (modo.parada) {
    const p = progresoDeParada(modo.parada)!;
    const y = disparador.start + p * (disparador.end - disparador.start);
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
    fijarProgreso(p);
  } else {
    fijarProgreso(disparador.progress);
  }

  const pausas = calcularPausas();
  // Centros de las pausas; la del epílogo es el cierre.
  const posiciones = () => {
    const { start, end } = disparador;
    return pausas.map((p) => start + p.centro * (end - start));
  };
  const viajes = crearViajes({
    reducido,
    fundirANegro,
    posiciones,
    // Durante un viaje la rueda no mueve la página ni pelea con la animación.
    alEmpezar: () => lenis?.stop(),
    alTerminar: () => lenis?.start(),
  });
  if (paginado) iniciarPaginado(viajes, posiciones);
  return { irA: viajes.irA, destinoViaje: viajes.destinoViaje };
}
