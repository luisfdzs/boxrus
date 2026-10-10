import { describe, expect, it } from 'vitest';
import { destinoPaginado, indiceMasCercano } from '../src/lib/paginado';

describe('scroll por paradas (móvil)', () => {
  const posiciones = [0, 1000, 2000, 3000];

  it('encaja en la posición más cercana', () => {
    expect(indiceMasCercano(0, posiciones)).toBe(0);
    expect(indiceMasCercano(1400, posiciones)).toBe(1);
    expect(indiceMasCercano(2600, posiciones)).toBe(3);
  });

  it('cada gesto avanza o retrocede exactamente una posición, sin salirse', () => {
    expect(destinoPaginado(1, 1, 4)).toBe(2);
    expect(destinoPaginado(1, -1, 4)).toBe(0);
    expect(destinoPaginado(3, 1, 4)).toBe(3);
    expect(destinoPaginado(0, -1, 4)).toBe(0);
  });
});
