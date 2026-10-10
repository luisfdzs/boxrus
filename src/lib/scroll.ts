// Scroll suave (Lenis) + ScrollTrigger → progreso global de la pista.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { fijarProgreso } from './progreso';
import type { Modo } from './modo';
import { calcularPausas, progresoDeParada } from './pausas';

export function iniciarScroll(pista: HTMLElement, modo: Modo): void {
  gsap.registerPlugin(ScrollTrigger);
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lenis: Lenis | undefined;
  if (!modo.captura && !reducido) {
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
    snap: modo.ajuste
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
}
