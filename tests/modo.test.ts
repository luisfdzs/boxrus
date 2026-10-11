import { describe, expect, it } from 'vitest';
import { leerModo } from '../src/lib/modo';

describe('modos de URL', () => {
  it('lee una parada y el modo de captura', () => {
    const m = leerModo('?parada=3&captura=1');
    expect(m.parada).toBe('3');
    expect(m.captura).toBe(true);
    expect(m.camara).toBeUndefined();
  });

  it('lee un encuadre libre con ?camara', () => {
    expect(leerModo('?camara=1,2,3,4,5,-6,35').camara).toEqual({ posicion: [1, 2, 3], mira: [4, 5, -6], focal: 35 });
  });

  it('descarta encuadres incompletos o no numéricos', () => {
    expect(leerModo('?camara=1,2,3').camara).toBeUndefined();
    expect(leerModo('?camara=1,2,3,4,5,x,35').camara).toBeUndefined();
    expect(leerModo('?camara=1,2,3,4,5,6,0').camara).toBeUndefined();
  });
});
