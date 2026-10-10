import { describe, expect, it } from 'vitest';
import { crearAzar, entre } from '../src/lib/azar';

describe('azar', () => {
  it('repite la misma secuencia con la misma semilla', () => {
    const a = crearAzar(42);
    const b = crearAzar(42);
    expect(Array.from({ length: 5 }, a)).toEqual(Array.from({ length: 5 }, b));
  });

  it('cambia la secuencia con otra semilla', () => {
    expect(crearAzar(1)()).not.toBe(crearAzar(2)());
  });

  it('devuelve valores en [0, 1) y respeta el rango de entre()', () => {
    const azar = crearAzar(7);
    for (let i = 0; i < 1000; i++) {
      const v = entre(azar, -2, 3);
      expect(v).toBeGreaterThanOrEqual(-2);
      expect(v).toBeLessThan(3);
    }
  });
});
