import { describe, expect, it } from 'vitest';
import { destinoPaginado, direccionGesto, indiceFraccional, indiceMasCercano, opacidadCorte, posicionSalto } from '../src/lib/paginado';

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

  it('deslizar a la izquierda avanza y a la derecha retrocede, solo antes del epílogo', () => {
    // Paradas 0–5 en horizontal; la 6 (epílogo) solo en vertical.
    expect(direccionGesto(-80, 10, 30, 2, 5)).toBe(1);
    expect(direccionGesto(80, 10, 30, 2, 5)).toBe(-1);
    expect(direccionGesto(-80, 0, 30, 5, 5)).toBeNull();
    expect(direccionGesto(80, 0, 30, 6, 5)).toBeNull();
    expect(direccionGesto(20, 10, 30, 2, 5)).toBeNull();
  });

  it('en vertical, arriba avanza y abajo retrocede, también hacia y desde el epílogo', () => {
    expect(direccionGesto(10, 80, 30, 5, 5)).toBe(1);
    expect(direccionGesto(10, -80, 30, 6, 5)).toBe(-1);
    expect(direccionGesto(60, 70, 30, 2, 5)).toBe(1);
  });
});

describe('viaje directo del menú', () => {
  const posiciones = [0, 1000, 2000, 3000];

  it('mide la posición actual en tramos fraccionarios', () => {
    expect(indiceFraccional(0, posiciones)).toBe(0);
    expect(indiceFraccional(1500, posiciones)).toBe(1.5);
    expect(indiceFraccional(3000, posiciones)).toBe(3);
    expect(indiceFraccional(5000, posiciones)).toBe(3);
  });
});

describe('salto del menú entre secciones no vecinas', () => {
  it('recorre medio tramo de salida, corta y termina medio tramo de llegada', () => {
    // Salida 0 → 1000, llegada 3000 → 4000.
    expect(posicionSalto(0, 0, 1000, 3000, 4000)).toBe(0);
    expect(posicionSalto(0.25, 0, 1000, 3000, 4000)).toBe(250);
    expect(posicionSalto(0.5, 0, 1000, 3000, 4000)).toBe(3500);
    expect(posicionSalto(1, 0, 1000, 3000, 4000)).toBe(4000);
  });

  it('el corte ocurre en negro total y el fundido no toca los extremos', () => {
    const op = (s: number) => opacidadCorte(s, 0.4, 0.16);
    expect(op(0)).toBe(0);
    expect(op(0.29)).toBe(0);
    expect(op(0.5)).toBe(1);
    expect(op(0.45)).toBe(1);
    expect(op(0.36)).toBeGreaterThan(0);
    expect(op(0.36)).toBeLessThan(1);
    expect(op(1)).toBe(0);
  });
});
