import { describe, expect, it } from 'vitest';
import {
  ENVOLVENTE,
  ESTRUCTURA,
  JAULA,
  apotemaJaula,
  puertaJaula,
  regletasFilas,
  sacosBastidorZ,
  ventanalesFondoX,
  ventanalesLateralesZ,
  verticesJaula,
} from '../src/datos/nave';
import { puertasEnCaras } from '../src/lib/colisiones';

describe('datos de la nave (docs/03)', () => {
  it('envolvente de 36 × 48 m, alero 7 m y cumbrera 9 m', () => {
    expect(ENVOLVENTE.xMax - ENVOLVENTE.xMin).toBe(36);
    expect(ENVOLVENTE.zFrente - ENVOLVENTE.zFondo).toBe(48);
    expect([ENVOLVENTE.alturaAlero, ENVOLVENTE.alturaCumbrera]).toEqual([7, 9]);
  });

  it('pórticos cada 6 m y pilares en x = ±10', () => {
    const z = ESTRUCTURA.porticosZ;
    z.slice(1).forEach((zi, i) => expect(z[i] - zi).toBe(6));
    expect(ESTRUCTURA.pilares.x).toEqual([-10, 10]);
  });

  it('jaula: octógono de radio 4,9 m (~9 m entre caras) con las puertas en caras', () => {
    expect(verticesJaula()).toHaveLength(8);
    expect(2 * apotemaJaula).toBeCloseTo(9.05, 1);
    expect(puertasEnCaras()).toBe(true);
    const d = puertaJaula('delantera');
    expect(d.normal[0]).toBeLessThan(0);
    expect(d.normal[1]).toBeGreaterThan(0);
    expect(JAULA.malla.yMax).toBeLessThan(JAULA.cable.y);
  });

  it('9 sacos por bastidor, 10 ventanales al fondo, 7 por lateral y 6 filas de regletas', () => {
    expect(sacosBastidorZ()).toEqual([-8, -11, -14, -17, -20, -23, -26, -29, -32]);
    expect(ventanalesFondoX()).toHaveLength(10);
    expect(ventanalesLateralesZ()).toHaveLength(7);
    expect(new Set(regletasFilas().map(([x]) => x)).size).toBe(6);
  });
});
