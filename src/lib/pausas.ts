// Reparto del progreso en pausas (sin Three.js, para que lo use la interfaz).
import { PARADAS, RECORRIDO } from '../datos/paradas';

export interface Pausa {
  inicio: number;
  fin: number;
  centro: number;
}

/** Rangos de progreso de las pausas: la primera empieza en 0 y la última acaba en 1. */
export const calcularPausas = (n = PARADAS.length, fraccion = RECORRIDO.fraccionPausa): Pausa[] => {
  const ancho = fraccion / n;
  return Array.from({ length: n }, (_, k) => {
    const centro = ancho / 2 + (k * (1 - ancho)) / (n - 1);
    return { inicio: centro - ancho / 2, fin: centro + ancho / 2, centro };
  });
};

/** Progreso del centro de la pausa de una parada (para `?parada=N`). */
export const progresoDeParada = (id: string): number | undefined => {
  const k = PARADAS.findIndex((p) => p.id === id.toUpperCase());
  return k < 0 ? undefined : calcularPausas()[k].centro;
};
