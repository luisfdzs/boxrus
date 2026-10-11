// Las 5 secciones (el botón del epílogo no es una sección) de la web, derivadas de `paradas.ts` (fuente única de nombres y rutas).
import { PARADAS } from '../datos/paradas';

export interface Seccion {
  /** Índice de la parada en el recorrido (para los viajes animados). */
  indice: number;
  nombre: string;
  href: string;
}

export const SECCIONES: Seccion[] = PARADAS.flatMap((p, indice) =>
  p.interfaz.boton && p.id !== 'E' ? [{ indice, nombre: p.nombre, href: p.interfaz.boton.href }] : [],
);

/** Índice de la parada de cierre (epílogo). */
export const INDICE_CIERRE = PARADAS.findIndex((p) => p.id === 'E');
