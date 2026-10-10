// Scroll suave (Lenis) + ScrollTrigger → progreso global de la pista.
// En móvil, scroll por paradas (paginado.ts) en lugar de scroll libre.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { fijarProgreso } from './progreso';
import type { Modo } from './modo';
import { iniciarPaginado, usarPaginado, type ControladorPaginado } from './paginado';
import { calcularPausas, progresoDeParada } from './pausas';

/** Devuelve el controlador del scroll por paradas si está activo (móvil). */
export function iniciarScroll(
  pista: HTMLElement,
  modo: Modo,
  fundirANegro: (opacidad: number) => void = () => {},
): ControladorPaginado | undefined {
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

  if (paginado) {
    const pausas = calcularPausas();
    return iniciarPaginado({
      reducido,
      fundirANegro,
      posiciones: () => {
        const { start, end } = disparador;
        // Centros de las pausas; la del epílogo es el cierre.
        return pausas.map((p) => start + p.centro * (end - start));
      },
    });
  }
}
