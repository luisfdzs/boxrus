import { describe, expect, it } from 'vitest';
import { Box3, Vector3 } from 'three';
import {
  BASTIDORES,
  DETALLES,
  ENVOLVENTE,
  JAULA,
  SACOS,
  apotemaJaula,
  direccionXZ,
  puertaJaula,
  sacosBastidorZ,
  verticesJaula,
} from '../src/datos/nave';
import { PARADAS, RECORRIDO, type IdParada } from '../src/datos/paradas';
import { comprobarColisiones, crearObstaculos, type Obstaculo } from '../src/lib/colisiones';
import { crearDetalles, type Grupo } from '../src/lib/detalles';
import { calcularPausas, crearTrayectoria, type Variante } from '../src/lib/trayectoria';

const grupos = crearDetalles();
const grupo = (g: Grupo) => grupos.find((x) => x.grupo === g)!;
const caja = (g: Grupo) => grupo(g).geometria.boundingBox!;

/** Recorre los vértices de un grupo. */
function vertices(g: Grupo): Vector3[] {
  const pos = grupo(g).geometria.getAttribute('position');
  return Array.from({ length: pos.count }, (_, i) => new Vector3().fromBufferAttribute(pos, i));
}

/** Puntos repartidos por el volumen de una caja (para medir distancias a obstáculos). */
function muestrear(c: Box3, n = 6): Vector3[] {
  const puntos: Vector3[] = [];
  for (let i = 0; i <= n; i++)
    for (let j = 0; j <= n; j++)
      for (let k = 0; k <= n; k++)
        puntos.push(new Vector3(c.min.x + ((c.max.x - c.min.x) * i) / n, c.min.y + ((c.max.y - c.min.y) * j) / n, c.min.z + ((c.max.z - c.min.z) * k) / n));
  return puntos;
}

describe('detalles de vida (docs/03)', () => {
  it('cinco grupos fusionados: como mucho 8 llamadas de dibujo y geometría ligera', () => {
    expect(grupos.map((g) => g.grupo).sort()).toEqual(['balones', 'bancoMate', 'bancoSatinado', 'comba', 'guantes']);
    expect(grupos.length).toBeLessThanOrEqual(8);
    const triangulos = grupos.reduce((s, g) => s + g.geometria.index!.count / 3, 0);
    expect(triangulos).toBeLessThan(6000);
  });

  it('son deterministas', () => {
    const otra = crearDetalles();
    grupos.forEach((g, i) => expect(otra[i].geometria.getAttribute('position').array).toEqual(g.geometria.getAttribute('position').array));
  });

  it('todo queda dentro de la nave y sobre el suelo', () => {
    const g = ENVOLVENTE.grosorMuro / 2;
    for (const { grupo: nombre, geometria } of grupos) {
      const c = geometria.boundingBox!;
      expect(c.min.x, nombre).toBeGreaterThan(ENVOLVENTE.xMin + g);
      expect(c.max.x, nombre).toBeLessThan(ENVOLVENTE.xMax - g);
      expect(c.min.z, nombre).toBeGreaterThan(ENVOLVENTE.zFondo + g);
      expect(c.max.z, nombre).toBeLessThan(ENVOLVENTE.zFrente - g);
      expect(c.min.y, nombre).toBeGreaterThanOrEqual(-0.005);
      expect(c.max.y, nombre).toBeLessThan(ENVOLVENTE.alturaAlero);
    }
  });

  it('el banco y sus objetos no chocan con pilares, bastidor ni peras', () => {
    const obstaculos = crearObstaculos().filter((o) => /pilar|bastidor|pera/.test(o.nombre));
    for (const g of ['bancoMate', 'bancoSatinado'] as Grupo[]) {
      for (const p of muestrear(caja(g)))
        for (const o of obstaculos) expect(o.distancia(p), `${g} con ${o.nombre}`).toBeGreaterThan(0.1);
    }
    // Junto al muro izquierdo, pasado el extremo del bastidor (entre el portón y el bastidor no salía en ningún plano).
    const c = caja('bancoMate').clone().union(caja('bancoSatinado'));
    expect(c.max.z).toBeLessThan(BASTIDORES.zFin);
    expect(c.min.z).toBeGreaterThan(ENVOLVENTE.zFondo);
    expect(c.min.x).toBeLessThan(ENVOLVENTE.xMin + 1.5);
  });

  it('los balones están en el suelo junto al extremo del bastidor derecho, sin tocarlo', () => {
    const obstaculos = crearObstaculos().filter((o) => /bastidor|pera|pilar/.test(o.nombre));
    for (const p of muestrear(caja('balones'))) for (const o of obstaculos) expect(o.distancia(p), o.nombre).toBeGreaterThan(0.05);
    for (const [x, z] of DETALLES.balones.lista) {
      expect(x).toBeGreaterThan(0);
      expect(Math.abs(z - (BASTIDORES.zFin - 1.5))).toBeLessThan(1);
    }
  });

  it('los guantes cuelgan del gancho de un saco del bastidor derecho, por encima y a un lado del saco', () => {
    const zSaco = sacosBastidorZ()[DETALLES.guantes.indiceSaco];
    expect(zSaco).toBeDefined();
    const c = caja('guantes');
    expect(c.max.y).toBeLessThanOrEqual(BASTIDORES.alto);
    expect(c.min.y).toBeGreaterThan(SACOS.base + SACOS.alto);
    for (const v of vertices('guantes')) expect(Math.hypot(v.x - BASTIDORES.x, v.z - zSaco)).toBeGreaterThan(SACOS.radio);
    expect(Math.abs((c.min.x + c.max.x) / 2 - BASTIDORES.x)).toBeLessThan(0.2);
  });

  it('la comba está sobre la lona, dentro de la malla, junto a un poste y lejos de las puertas', () => {
    const [cx, , cz] = JAULA.centro;
    const normales = Array.from({ length: 8 }, (_, i) => direccionXZ(JAULA.anguloVertice0 + 22.5 + i * 45));
    const postes = verticesJaula();
    const puertas = (['delantera', 'trasera'] as const).map((p) => puertaJaula(p).centro);
    let posteMasCercano = Infinity;
    for (const v of vertices('comba')) {
      expect(v.y).toBeGreaterThanOrEqual(JAULA.altoPlataforma - 0.001);
      for (const [nx, nz] of normales) expect((v.x - cx) * nx + (v.z - cz) * nz).toBeLessThan(apotemaJaula - 0.05);
      for (const [px, pz] of postes) {
        const d = Math.hypot(v.x - px, v.z - pz);
        expect(d).toBeGreaterThan(JAULA.poste.radio + 0.05);
        posteMasCercano = Math.min(posteMasCercano, d);
      }
      for (const [px, pz] of puertas) expect(Math.hypot(v.x - px, v.z - pz)).toBeGreaterThan(JAULA.anchoPuerta);
    }
    expect(posteMasCercano).toBeLessThan(0.6);
  });
});

describe.each<Variante>(['escritorio', 'movil'])('detalles y cámara (%s)', (variante) => {
  const trayectoria = crearTrayectoria(variante);

  it('no invaden la trayectoria de cámara', () => {
    const obstaculos: Obstaculo[] = grupos.map(({ grupo: nombre, geometria }) => ({
      nombre: `detalle ${nombre}`,
      distancia: (p) => geometria.boundingBox!.distanceToPoint(new Vector3(p.x, p.y, p.z)),
    }));
    const colisiones = comprobarColisiones((p) => trayectoria.evaluar(p).posicion, RECORRIDO.margenColision, 2000, obstaculos);
    expect([...new Set(colisiones.map((c) => c.obstaculo))]).toEqual([]);
  });

  // Encuadre: el centro del objeto cae dentro del cuadro durante toda la pausa (16:9 y vertical 390 × 844).
  const aspecto = variante === 'escritorio' ? 16 / 9 : 390 / 844;
  const pausas = calcularPausas();
  const enCuadro = (punto: Vector3, id: IdParada) => {
    const pausa = pausas[PARADAS.findIndex((p) => p.id === id)];
    return [pausa.inicio, (pausa.inicio + pausa.fin) / 2, pausa.fin].every((progreso) => {
      const { posicion, mira, fov } = trayectoria.evaluar(progreso);
      const frente = mira.clone().sub(posicion).normalize();
      const derecha = frente.clone().cross(new Vector3(0, 1, 0)).normalize();
      const arriba = derecha.clone().cross(frente);
      const d = punto.clone().sub(posicion);
      const profundidad = d.dot(frente);
      const t = Math.tan((fov * Math.PI) / 360);
      return profundidad > 0 && Math.abs(d.dot(derecha) / profundidad) < t * aspecto && Math.abs(d.dot(arriba) / profundidad) < t;
    });
  };
  const centro = (g: Grupo) => caja(g).getCenter(new Vector3());

  it('los guantes y los balones se ven en la parada 3 (Galería)', () => {
    expect(enCuadro(centro('guantes'), '3')).toBe(true);
    expect(enCuadro(centro('balones'), '3')).toBe(true);
  });

  it('la comba se ve en el picado de la parada 4 (Premios)', () => {
    expect(enCuadro(centro('comba'), '4')).toBe(true);
  });
});
