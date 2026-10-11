import { describe, expect, it } from 'vitest';
import { nombreDias, proximasClases, textoApertura, type FranjaSimple } from '../src/lib/etiquetas';

const f = (dia: FranjaSimple['dia'], inicio: string, fin: string, clase = 'Boxeo'): FranjaSimple => ({
  id: `${dia}-${inicio}`,
  dia,
  inicio,
  fin,
  clase,
  claseId: clase.toLowerCase(),
  nivel: 'todos',
});

describe('textos de horario', () => {
  it('resume días consecutivos y sueltos', () => {
    expect(nombreDias(['lunes', 'martes', 'miercoles', 'jueves', 'viernes'])).toBe('lunes a viernes');
    expect(nombreDias(['sabado'])).toBe('sábado');
    expect(nombreDias(['lunes', 'miercoles', 'viernes'])).toBe('lunes, miércoles y viernes');
    expect(nombreDias(['sabado', 'domingo'])).toBe('sábado y domingo');
  });

  it('da formato a la apertura', () => {
    expect(textoApertura({ dias: ['sabado'], inicio: '09:00', fin: '14:00' })).toBe('Sábado: 09:00–14:00');
  });
});

describe('próximas clases', () => {
  const semana = [f('lunes', '10:00', '11:00'), f('lunes', '18:00', '19:00'), f('lunes', '19:00', '20:30', 'MMA'), f('martes', '07:00', '08:00')];

  it('incluye la clase en curso y las siguientes de hoy', () => {
    const r = proximasClases(semana, 1, 10 * 60 + 30);
    expect(r.map((c) => c.inicio)).toEqual(['10:00', '18:00', '19:00']);
    expect(r[0].enCurso).toBe(true);
    expect(r[1].enCurso).toBe(false);
    expect(r[0].cuando).toBe('Hoy');
  });

  it('pasa a mañana cuando hoy ya no queda nada', () => {
    const r = proximasClases(semana, 1, 21 * 60);
    expect(r).toHaveLength(1);
    expect(r[0].cuando).toBe('Mañana');
  });

  it('da la vuelta a la semana y nombra el día si no es mañana', () => {
    const r = proximasClases(semana, 3, 12 * 60);
    expect(r[0].cuando).toBe('Lunes');
  });

  it('devuelve vacío sin franjas', () => {
    expect(proximasClases([], 1, 0)).toEqual([]);
  });
});
