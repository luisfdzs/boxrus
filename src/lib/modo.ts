// Modos de URL (docs/04): ?parada=N, ?captura=1, ?depuracion=1, ?ajuste=1
// (ajuste a paradas al dejar de hacer scroll, pregunta abierta 6) y ?paginado=1
// (fuerza el scroll por paradas del móvil, para probarlo en escritorio).
import { PARADAS, type IdParada } from '../datos/paradas';

export interface Modo {
  parada?: IdParada;
  captura: boolean;
  depuracion: boolean;
  ajuste: boolean;
  paginado: boolean;
}

export function leerModo(busqueda = typeof location === 'undefined' ? '' : location.search): Modo {
  const params = new URLSearchParams(busqueda);
  const activo = (clave: string) => ['1', 'true', 'si'].includes(params.get(clave) ?? '');
  const parada = params.get('parada')?.toUpperCase();
  return {
    parada: PARADAS.find((p) => p.id === parada)?.id,
    captura: activo('captura'),
    depuracion: activo('depuracion'),
    ajuste: activo('ajuste'),
    paginado: activo('paginado'),
  };
}
