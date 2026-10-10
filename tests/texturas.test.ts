import { describe, expect, it } from 'vitest';
import { CHAPA, JAULA, SUELO } from '../src/datos/nave';
import { CUERO, LONA } from '../src/datos/texturas';
import { pixelesChapa, pixelesCuero, pixelesDesgaste, pixelesLona, pixelesMalla } from '../src/lib/texturas';

const canal = (datos: Uint8Array, c: number) => datos.filter((_, i) => i % 4 === c);

describe('texturas por código', () => {
  it('malla: alambre opaco en las diagonales, hueco transparente en el centro del rombo', () => {
    const res = JAULA.malla.resolucion;
    const datos = pixelesMalla(res, JAULA.malla.radioAlambre / JAULA.malla.paso);
    const alfa = (x: number, y: number) => datos[(y * res + x) * 4 + 3];
    expect(alfa(0, 0)).toBeGreaterThan(200); // las diagonales se cruzan en la esquina
    expect(alfa(res / 2, res / 2)).toBeGreaterThan(200); // y en el centro
    expect(alfa(res / 2, 0)).toBe(0); // centro de un hueco
    expect(alfa(0, res / 2)).toBe(0);
    // Cobertura media parecida a la opacidad de la maqueta (0,28): la malla deja ver la jaula.
    const media = canal(datos, 3).reduce((s, a) => s + a, 0) / (res * res) / 255;
    expect(media).toBeGreaterThan(0.12);
    expect(media).toBeLessThan(0.35);
  });

  it('malla: se repite sin costura (el borde izquierdo continúa el derecho)', () => {
    const res = JAULA.malla.resolucion;
    const datos = pixelesMalla(res, 0.05);
    for (let y = 0; y < res; y++) {
      const izq = datos[(y * res) * 4 + 3];
      const der = datos[(y * res + res - 1) * 4 + 3];
      expect(Math.abs(izq - der)).toBeLessThan(160);
    }
  });

  it('chapa: normales unitarias que solo se inclinan en V y vuelven a la vertical', () => {
    const res = CHAPA.resolucion;
    const datos = pixelesChapa(res, CHAPA.profundidad / CHAPA.paso);
    expect(datos.length).toBe(res * res * 4);
    for (let i = 0; i < datos.length; i += 4) {
      const n = [0, 1, 2].map((c) => datos[i + c] / 127.5 - 1);
      expect(Math.abs(n[0])).toBeLessThan(0.01);
      expect(Math.hypot(...n)).toBeCloseTo(1, 1);
      expect(n[2]).toBeGreaterThan(0);
    }
    const inclinaciones = canal(datos, 1);
    expect(Math.max(...inclinaciones) - Math.min(...inclinaciones)).toBeGreaterThan(100);
  });

  it('cuero: normales unitarias hacia fuera, deterministas y con relieve', () => {
    const { resolucion, semilla, relieve } = CUERO;
    const datos = pixelesCuero(resolucion, semilla, relieve);
    expect(pixelesCuero(resolucion, semilla, relieve)).toEqual(datos);
    for (let i = 0; i < datos.length; i += 4) {
      const n = [0, 1, 2].map((c) => datos[i + c] / 127.5 - 1);
      expect(Math.hypot(...n)).toBeCloseTo(1, 1);
      expect(n[2]).toBeGreaterThan(0.5);
    }
    const x = canal(datos, 0);
    expect(Math.max(...x) - Math.min(...x)).toBeGreaterThan(20);
  });

  it('lona: determinista, dentro del rango y con más roce en el anillo que en el borde', () => {
    const { semilla, intensidad, marcas } = LONA;
    const res = 128;
    const a = pixelesLona(res, semilla, intensidad, marcas);
    expect(pixelesLona(res, semilla, intensidad, marcas)).toEqual(a);
    expect(pixelesLona(res, semilla + 1, intensidad, marcas)).not.toEqual(a);
    const grises = canal(a, 0);
    expect(Math.min(...grises)).toBeGreaterThanOrEqual(Math.floor(255 * (1 - intensidad)));
    // Media en una corona a r ≈ 0,6 frente a la esquina (fuera del octógono).
    const media = (dentro: (r: number) => boolean) => {
      let suma = 0;
      let n = 0;
      for (let y = 0; y < res; y++)
        for (let x = 0; x < res; x++)
          if (dentro(Math.hypot((x + 0.5) / res - 0.5, (y + 0.5) / res - 0.5) / 0.5)) {
            suma += a[(y * res + x) * 4];
            n++;
          }
      return suma / n;
    };
    expect(media((r) => r > 0.5 && r < 0.7)).toBeGreaterThan(media((r) => r > 1.2));
  });

  it('desgaste del tatami: determinista con la semilla y dentro del rango de intensidad', () => {
    const { semilla, intensidad } = SUELO.desgaste;
    const a = pixelesDesgaste(64, semilla, intensidad);
    expect(pixelesDesgaste(64, semilla, intensidad)).toEqual(a);
    expect(pixelesDesgaste(64, semilla + 1, intensidad)).not.toEqual(a);
    const grises = canal(a, 0);
    expect(Math.min(...grises)).toBeGreaterThanOrEqual(Math.floor(255 * (1 - intensidad)));
    expect(Math.max(...grises)).toBeLessThanOrEqual(255);
  });
});
