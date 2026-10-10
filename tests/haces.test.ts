import { describe, expect, it } from 'vitest';
import { LUZ } from '../src/datos/luz';
import { ENVOLVENTE, VENTANALES, ventanalesLateralesZ } from '../src/datos/nave';
import { alSuelo, hacesDeSol } from '../src/lib/haces';

describe('haces de luz', () => {
  it('proyecta sobre el suelo a lo largo de la luz', () => {
    const p = alSuelo([0, 2, 0], [0.5, -1, 0]);
    expect(p).toEqual([1, 0, 0]);
  });

  it('se detiene en el muro si llega antes que al suelo', () => {
    const [x, y] = alSuelo([ENVOLVENTE.xMin + 1, 4, -20], [-1, -0.1, 0]);
    expect(x).toBeCloseTo(ENVOLVENTE.xMin + ENVOLVENTE.grosorMuro / 2);
    expect(y).toBeGreaterThan(0);
  });

  it('con el sol de la mañana entran por el fondo y el muro derecho, y terminan dentro de la nave', () => {
    const haces = hacesDeSol(LUZ.sol.direccion);
    expect(haces).toHaveLength(VENTANALES.fondo.cantidad + ventanalesLateralesZ().length);
    for (const h of haces) {
      for (const [x, y, z] of h.fin) {
        expect(y).toBeGreaterThanOrEqual(0);
        expect(x).toBeGreaterThanOrEqual(ENVOLVENTE.xMin);
        expect(x).toBeLessThanOrEqual(ENVOLVENTE.xMax);
        expect(z).toBeGreaterThan(ENVOLVENTE.zFondo);
        expect(z).toBeLessThan(ENVOLVENTE.zFrente);
      }
    }
  });

  it('sin sol por encima del horizonte no hay haces', () => {
    expect(hacesDeSol([0.5, -0.2, -0.5])).toEqual([]);
  });
});
