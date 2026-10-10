import { describe, expect, it } from 'vitest';
import { PARADAS, RECORRIDO } from '../src/datos/paradas';
import { comprobarColisiones } from '../src/lib/colisiones';
import { calcularPausas, crearTrayectoria, progresoDeParada, type Variante } from '../src/lib/trayectoria';

const VARIANTES: Variante[] = ['escritorio', 'movil'];

describe('paradas (docs/04)', () => {
  it('7 planos en orden, con encuadres y textos completos', () => {
    expect(PARADAS.map((p) => p.id)).toEqual(['P', '1', '2', '3', '4', '5', 'E']);
    for (const p of PARADAS) {
      for (const v of VARIANTES) {
        expect(p[v].posicion).toHaveLength(3);
        expect(p[v].mira).toHaveLength(3);
        expect(p[v].focal).toBeGreaterThan(0);
      }
      expect(p.interfaz.titular.length).toBeGreaterThan(0);
    }
  });

  it('pausas ordenadas que cubren de 0 a 1', () => {
    const pausas = calcularPausas();
    expect(pausas[0].inicio).toBe(0);
    expect(pausas.at(-1)!.fin).toBeCloseTo(1, 10);
    pausas.slice(1).forEach((p, i) => expect(p.inicio).toBeGreaterThan(pausas[i].fin));
  });
});

describe.each(VARIANTES)('trayectoria (%s)', (variante) => {
  const trayectoria = crearTrayectoria(variante);

  it('en el centro de cada pausa la cámara está en el encuadre de la parada', () => {
    for (const parada of PARADAS) {
      const pose = trayectoria.evaluar(progresoDeParada(parada.id)!);
      const [x, y, z] = parada[variante].posicion;
      expect(pose.posicion.distanceTo({ x, y, z } as never)).toBeLessThan(0.02);
    }
  });

  it('es reversible: el mismo progreso da la misma pose', () => {
    const a = trayectoria.evaluar(0.4321);
    trayectoria.evaluar(0.9);
    const b = trayectoria.evaluar(0.4321);
    expect(a.posicion.toArray()).toEqual(b.posicion.toArray());
    expect(a.mira.toArray()).toEqual(b.mira.toArray());
  });

  it('no atraviesa ningún obstáculo', () => {
    const colisiones = comprobarColisiones((p) => trayectoria.evaluar(p).posicion, RECORRIDO.margenColision);
    const resumen = [...new Map(colisiones.map((c) => [c.obstaculo, c])).values()].map(
      (c) => `${c.obstaculo} @${c.progreso.toFixed(3)} d=${c.distancia.toFixed(2)} (${c.punto.x.toFixed(2)}, ${c.punto.y.toFixed(2)}, ${c.punto.z.toFixed(2)})`,
    );
    expect(resumen).toEqual([]);
  });

  it('limita la velocidad angular de la mirada', () => {
    let maximo = 0;
    let anterior = trayectoria.evaluar(0);
    let dirAnterior = anterior.mira.clone().sub(anterior.posicion).normalize();
    for (let i = 1; i <= 4000; i++) {
      const pose = trayectoria.evaluar(i / 4000);
      const dir = pose.mira.clone().sub(pose.posicion).normalize();
      maximo = Math.max(maximo, dir.angleTo(dirAnterior));
      dirAnterior = dir;
    }
    // Grados por cada 1 % de progreso (el pico está al salir por la puerta trasera).
    expect((maximo * 4000 * 0.01 * 180) / Math.PI).toBeLessThan(36);
  });
});
