// Textos legibles de los valores de las colecciones (días, niveles, salas) y
// utilidades puras de horario. Sin dependencias de Astro, para probarlas con Vitest.
import { DIAS, aMinutos } from './dias';

export type Dia = (typeof DIAS)[number];

export const ETIQUETA_DIA: Record<Dia, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

export const ETIQUETA_NIVEL: Record<string, string> = {
  iniciacion: 'Iniciación',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  todos: 'Todos los niveles',
};

export const ETIQUETA_SALA: Record<string, string> = {
  jaula: 'Jaula',
  tatami: 'Tatami',
  sacos: 'Sacos',
};

/** Nombre del día en minúsculas para frases («lunes a viernes»). */
const enFrase = (dia: Dia) => ETIQUETA_DIA[dia].toLowerCase();

/** «lunes a viernes», «sábado» o «lunes, miércoles y viernes» según sean consecutivos o no. */
export function nombreDias(dias: readonly Dia[]): string {
  const orden = [...dias].sort((a, b) => DIAS.indexOf(a) - DIAS.indexOf(b));
  const consecutivos = orden.every((d, i) => i === 0 || DIAS.indexOf(d) === DIAS.indexOf(orden[i - 1]) + 1);
  if (orden.length === 1) return enFrase(orden[0]);
  if (consecutivos && orden.length > 2) return `${enFrase(orden[0])} a ${enFrase(orden.at(-1)!)}`;
  return `${orden.slice(0, -1).map(enFrase).join(', ')} y ${enFrase(orden.at(-1)!)}`;
}

const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

export interface Apertura {
  dias: readonly Dia[];
  inicio: string;
  fin: string;
}

/** «Lunes a viernes: 07:00–22:30». */
export const textoApertura = (a: Apertura): string => `${mayuscula(nombreDias(a.dias))}: ${a.inicio}–${a.fin}`;

export interface FranjaSimple {
  id: string;
  dia: Dia;
  inicio: string;
  fin: string;
  /** Nombre ya legible de la clase. */
  clase: string;
  claseId: string;
  nivel: string;
}

export interface ClaseProxima extends FranjaSimple {
  /** «Hoy», «Mañana» o el nombre del día. */
  cuando: string;
  enCurso: boolean;
}

/** Día de la semana de `Date#getDay()` (0 = domingo) al formato de la colección. */
export const diaDeFecha = (getDay: number): Dia => DIAS[(getDay + 6) % 7];

/**
 * Próximas clases a partir de un instante: lo que queda de hoy (incluida la clase en
 * curso) y, si no queda nada, las del siguiente día con clases.
 */
export function proximasClases(franjas: readonly FranjaSimple[], getDay: number, minutosDelDia: number, max = 3): ClaseProxima[] {
  const ordenadas = (dia: Dia) => franjas.filter((f) => f.dia === dia).sort((a, b) => aMinutos(a.inicio) - aMinutos(b.inicio));
  const hoy = DIAS.indexOf(diaDeFecha(getDay));
  for (let salto = 0; salto < 7; salto++) {
    const dia = DIAS[(hoy + salto) % 7];
    const lista = ordenadas(dia).filter((f) => salto > 0 || aMinutos(f.fin) > minutosDelDia);
    if (lista.length === 0) continue;
    const cuando = salto === 0 ? 'Hoy' : salto === 1 ? 'Mañana' : ETIQUETA_DIA[dia];
    return lista.slice(0, max).map((f) => ({ ...f, cuando, enCurso: salto === 0 && aMinutos(f.inicio) <= minutosDelDia }));
  }
  return [];
}
