// Modos de URL (docs/04): ?parada=N, ?captura=1, ?depuracion=1, ?ajuste=1
// (ajuste a paradas al dejar de hacer scroll, pregunta abierta 6) y ?paginado=1
// (fuerza el scroll por paradas del móvil, para probarlo en escritorio) y
// ?exportar=1 (envía la geometría a Blender para hornear la luz, docs/03) y
// ?camara=x,y,z,mx,my,mz,focal (encuadre libre para las fotos de la galería).
import type { Vec3 } from '../datos/nave';
import { PARADAS, type IdParada } from '../datos/paradas';

export interface Modo {
  parada?: IdParada;
  captura: boolean;
  depuracion: boolean;
  ajuste: boolean;
  paginado: boolean;
  exportar: boolean;
  /** Encuadre fijo que sustituye al recorrido: posición, punto de mira y focal (mm). */
  camara?: { posicion: Vec3; mira: Vec3; focal: number };
}

export function leerModo(busqueda = typeof location === 'undefined' ? '' : location.search): Modo {
  const params = new URLSearchParams(busqueda);
  const activo = (clave: string) => ['1', 'true', 'si'].includes(params.get(clave) ?? '');
  const parada = params.get('parada')?.toUpperCase();
  const c = params.get('camara')?.split(',').map(Number);
  const camara =
    c?.length === 7 && c.every(Number.isFinite) && c[6] > 0
      ? { posicion: [c[0], c[1], c[2]] as Vec3, mira: [c[3], c[4], c[5]] as Vec3, focal: c[6] }
      : undefined;
  return {
    parada: PARADAS.find((p) => p.id === parada)?.id,
    captura: activo('captura'),
    depuracion: activo('depuracion'),
    ajuste: activo('ajuste'),
    paginado: activo('paginado'),
    exportar: activo('exportar'),
    camara,
  };
}
