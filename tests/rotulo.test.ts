import { describe, expect, it } from 'vitest';
import { JAULA, direccionXZ } from '../src/datos/nave';
import { cuerpoRotulo, disposicionRotulo, giroPoste } from '../src/lib/rotulo';

describe('rótulo BOXRUS de los postes (docs/03)', () => {
  const r = JAULA.rotulo;
  const d = disposicionRotulo();

  it('queda en la parte vista del acolchado: sobre la lona y bajo el cable', () => {
    expect(d.yMin).toBeGreaterThan(JAULA.altoPlataforma + 0.1);
    expect(d.yMax).toBeLessThan(JAULA.cable.y - JAULA.cable.radio - 0.1);
  });

  it('cabe en media vuelta del poste con fondo a los lados (la textura se repite hacia dentro)', () => {
    expect(d.ancho).toBeLessThan(d.mediaVuelta * 0.6);
    // Sin pasar del frente visible: ±40° alrededor del centro como mucho.
    expect(d.ancho / JAULA.poste.radio).toBeLessThan((80 * Math.PI) / 180);
  });

  it('la franja de la textura va de yMin a yMax sobre el poste', () => {
    const [, rv] = d.repeticion;
    const [, ov] = d.desplazamiento;
    expect((d.yMin / JAULA.poste.alto) * rv + ov).toBeCloseTo(0, 6);
    expect((d.yMax / JAULA.poste.alto) * rv + ov).toBeCloseTo(1, 6);
    expect(d.repeticion[0]).toBe(2);
  });

  it('el centro del rótulo (+X local) mira hacia fuera en cada vértice', () => {
    for (let i = 0; i < 8; i++) {
      const phi = giroPoste(i);
      const [dx, dz] = direccionXZ(JAULA.anguloVertice0 + i * 45);
      // Giro en Y: +X pasa a (cos φ, −sen φ) en XZ.
      expect(Math.cos(phi)).toBeCloseTo(dx, 6);
      expect(-Math.sin(phi)).toBeCloseTo(dz, 6);
    }
  });

  it('el cuerpo de letra respeta el alto y el largo máximos', () => {
    // Medidas de Anton (anton-latin-400): tinta de 0,875 em y avances de BOXRUS de 2,86 em.
    const anchoEm = 2.86 + r.espaciado * 5;
    const cuerpo = cuerpoRotulo(anchoEm, 0.875);
    expect((0.875 * cuerpo) / r.pxPorMetro).toBeCloseTo(r.alto, 9);
    expect((anchoEm * cuerpo) / r.pxPorMetro).toBeLessThanOrEqual(r.largo);
    // Con una de respaldo muy ancha manda el largo.
    expect((8 * cuerpoRotulo(8, 0.875)) / r.pxPorMetro).toBeCloseTo(r.largo, 9);
  });
});
