import { describe, expect, it } from 'vitest';
import { MARCADOR } from '../src/datos/nave';
import { trazarMarcador } from '../src/lib/marcador';

const xs = (lista: number[]) => lista.filter((_, i) => i % 2 === 0);
const ys = (lista: number[]) => lista.filter((_, i) => i % 2 === 1);

describe('marcador de asaltos (7 segmentos)', () => {
  const { tiempo, asalto } = trazarMarcador(MARCADOR.digitos);

  it('«05:00»: 23 segmentos de 4 triángulos y los dos puntos', () => {
    expect(tiempo.encendidos.length / 6).toBe(23 * 4 + 2 * 2);
    // Apagados: los que faltan para «8» en cada cifra (1 + 2 + 1 + 1).
    expect(tiempo.apagados.length / 6).toBe(5 * 4);
  });

  it('el asalto no se monta sobre el tiempo (fallo de la fase 2 con la fuente del sistema)', () => {
    const finTiempo = Math.max(...xs([...tiempo.encendidos, ...tiempo.apagados]));
    const inicioAsalto = Math.min(...xs([...asalto.encendidos, ...asalto.apagados]));
    expect(inicioAsalto - finTiempo).toBeGreaterThan(0.03);
  });

  it('todo cabe en el frontal de la caja', () => {
    const todo = [...tiempo.encendidos, ...tiempo.apagados, ...asalto.encendidos, ...asalto.apagados];
    expect(Math.max(...xs(todo).map(Math.abs))).toBeLessThan((MARCADOR.ancho / 2) * 0.95);
    expect(Math.max(...ys(todo).map(Math.abs))).toBeLessThan((MARCADOR.alto / 2) * 0.9);
  });

  it('triángulos en sentido antihorario (cara visible hacia la jaula)', () => {
    const lista = [...tiempo.encendidos, ...asalto.encendidos];
    for (let i = 0; i < lista.length; i += 6) {
      const [ax, ay, bx, by, cx, cy] = lista.slice(i, i + 6);
      expect((bx - ax) * (cy - ay) - (by - ay) * (cx - ax)).toBeGreaterThanOrEqual(-1e-12);
    }
  });
});
