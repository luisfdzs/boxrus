// Detalles de vida (docs/03, «Contenido determinista»): guantes, comba, banco
// con toalla, botella y vendas, espinilleras y balones medicinales, hechos con
// primitivas low poly. Cada grupo se fusiona en una sola geometría con color
// por vértice: una llamada de dibujo por grupo. Sin React, para que Vitest
// compruebe dónde queda cada cosa.
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  Euler,
  Float32BufferAttribute,
  Matrix4,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BASTIDORES, DETALLES, JAULA, direccionXZ, sacosBastidorZ, type Vec3 } from '../datos/nave';
import { crearAzar, entre, type Azar } from './azar';

export type Acabado = 'mate' | 'satinado';
export type Grupo = 'guantes' | 'comba' | 'bancoMate' | 'bancoSatinado' | 'balones';

/** Acabado de cada grupo y si proyecta sombra (solo lo que apoya en el suelo). */
export const GRUPOS: Record<Grupo, { acabado: Acabado; sombras: boolean }> = {
  guantes: { acabado: 'satinado', sombras: false },
  comba: { acabado: 'satinado', sombras: false },
  bancoMate: { acabado: 'mate', sombras: true },
  bancoSatinado: { acabado: 'satinado', sombras: true },
  balones: { acabado: 'satinado', sombras: true },
};

/** Colores provisionales (paleta de docs/02); los definitivos son de la fase 3. Sin marcas ni texto. */
export const COLORES = {
  guante: '#1a1a1c',
  ribete: '#d4382a',
  cordon: '#2a2b2e',
  acero: '#1f2124',
  cuerda: '#1b1b1d',
  mango: '#2a2b2d',
  madera: '#5f5244',
  toalla: '#3a3d40',
  botella: '#7e878e',
  tapon: '#1c1d1f',
  vendas: ['#2b2c2f', '#55585c'],
  espinillera: '#1d1e20',
  correa: '#3e4044',
  balon: '#242527',
  costura: '#3b3d40',
} as const;

/** Resolución de las primitivas (low poly: a la distancia de los planos no se aprecia más). */
const SEGMENTOS = { cilindro: 10, cilindroPequeno: 8, esfera: [10, 7], esferaPequena: [6, 4], balon: [14, 10], toro: [4, 28] } as const;

const EJE_Y = new Vector3(0, 1, 0);

export interface GrupoDetalles {
  grupo: Grupo;
  acabado: Acabado;
  sombras: boolean;
  geometria: BufferGeometry;
}

class Montaje {
  private piezas = new Map<Grupo, BufferGeometry[]>();
  constructor(private azar: Azar) {}

  /** Color con una ligera variación de luminosidad determinista. */
  tono(hex: string, variar = true): Color {
    const c = new Color(hex);
    return variar ? c.multiplyScalar(1 + entre(this.azar, -DETALLES.variacionTono, DETALLES.variacionTono)) : c;
  }

  anadir(grupo: Grupo, base: BufferGeometry, matriz: Matrix4, color: Color) {
    const g = base.clone().applyMatrix4(matriz);
    g.deleteAttribute('uv');
    const n = g.getAttribute('position').count;
    const colores = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) colores.set([color.r, color.g, color.b], i * 3);
    g.setAttribute('color', new Float32BufferAttribute(colores, 3));
    const lista = this.piezas.get(grupo) ?? [];
    lista.push(g);
    this.piezas.set(grupo, lista);
  }

  fusionar(): GrupoDetalles[] {
    return [...this.piezas].map(([grupo, lista]) => {
      const geometria = mergeGeometries(lista, false);
      lista.forEach((g) => g.dispose());
      geometria.computeBoundingBox();
      geometria.computeBoundingSphere();
      return { grupo, ...GRUPOS[grupo], geometria };
    });
  }
}

// Primitivas unidad (diámetro y alto 1): la matriz de cada pieza les da tamaño y sitio.
const caja = new BoxGeometry(1, 1, 1);
const cilindro = new CylinderGeometry(0.5, 0.5, 1, SEGMENTOS.cilindro);
const cilindroPequeno = new CylinderGeometry(0.5, 0.5, 1, SEGMENTOS.cilindroPequeno);
/** Hombro de la botella: estrecha hacia arriba. */
const tronco = new CylinderGeometry(0.22, 0.5, 1, SEGMENTOS.cilindro);
const esfera = new SphereGeometry(0.5, ...SEGMENTOS.esfera);
const esferaPequena = new SphereGeometry(0.5, ...SEGMENTOS.esferaPequena);
const balon = new SphereGeometry(0.5, ...SEGMENTOS.balon);
/** Costura del balón: anillo sobre la superficie de la esfera unidad. */
const costura = new TorusGeometry(0.5, 0.012, ...SEGMENTOS.toro);

const componer = (posicion: Vec3 | Vector3, giro: Euler | Quaternion, escala: Vec3) => {
  const q = giro instanceof Quaternion ? giro : new Quaternion().setFromEuler(giro);
  const p = posicion instanceof Vector3 ? posicion : new Vector3(...posicion);
  return new Matrix4().compose(p, q, new Vector3(...escala));
};

/** Cilindro (o primitiva alargada en Y) entre dos puntos; `seccion` = [x, z] locales. */
const entrePuntos = (a: Vector3, b: Vector3, seccion: [number, number]) => {
  const dir = b.clone().sub(a);
  const q = new Quaternion().setFromUnitVectors(EJE_Y, dir.clone().normalize());
  return componer(a.clone().add(b).multiplyScalar(0.5), q, [seccion[0], dir.length(), seccion[1]]);
};

function guantes(m: Montaje, azar: Azar) {
  const g = DETALLES.guantes;
  const zSaco = sacosBastidorZ()[g.indiceSaco];
  const gancho = new Vector3(BASTIDORES.x, g.yGancho, zSaco + g.separacion);
  m.anadir('guantes', cilindroPequeno, componer(gancho.clone().setY(g.yGancho - 0.03), new Euler(), [0.012, 0.06, 0.012]), m.tono(COLORES.acero, false));

  g.cordones.forEach((cordon, i) => {
    const lado = i === 0 ? -1 : 1;
    // Origen del guante: borde superior de la muñeca, colgando boca abajo.
    const origen = gancho.clone().add(new Vector3((lado * g.separacionPar) / 2, -cordon, entre(azar, -0.02, 0.02)));
    const giro = new Euler(entre(azar, -0.06, 0.06), entre(azar, -0.5, 0.5), entre(azar, -0.06, 0.06));
    const base = new Matrix4().compose(origen, new Quaternion().setFromEuler(giro), new Vector3(1, 1, 1));
    const local = (pos: Vec3, rot: Euler, escala: Vec3) => base.clone().multiply(componer(pos, rot, escala));
    const negro = m.tono(COLORES.guante);
    const { muneca, puno, ribete } = g;

    m.anadir('guantes', cilindro, local([0, -muneca.largo / 2, 0], new Euler(), [muneca.diametro, muneca.largo, muneca.diametro * 0.85]), negro);
    m.anadir(
      'guantes',
      cilindro,
      local([0, -ribete / 2 - 0.004, 0], new Euler(), [muneca.diametro * 1.08, ribete, muneca.diametro * 0.92]),
      m.tono(COLORES.ribete, false),
    );
    m.anadir('guantes', esfera, local([0, -muneca.largo - puno.largo / 2 + 0.03, 0], new Euler(), [puno.ancho, puno.largo, puno.grueso]), negro);
    m.anadir(
      'guantes',
      esferaPequena,
      local([lado * puno.ancho * 0.42, -muneca.largo - 0.05, puno.grueso * 0.2], new Euler(0, 0, lado * 0.25), [0.05, 0.11, 0.055]),
      negro,
    );
    m.anadir('guantes', cilindroPequeno, entrePuntos(gancho, origen, [0.008, 0.008]), m.tono(COLORES.cordon, false));
  });
}

function comba(m: Montaje, azar: Azar) {
  const c = DETALLES.comba;
  const [dx, dz] = direccionXZ(c.angulo);
  const y = JAULA.altoPlataforma;
  const centro = new Vector3(JAULA.centro[0] + c.radio * dx, y, JAULA.centro[2] + c.radio * dz);
  const cuerda = m.tono(COLORES.cuerda);

  for (let k = 0; k < c.vueltas; k++) {
    const r = c.radioRollo * (1 - 0.07 * k) + entre(azar, -0.008, 0.008);
    const vuelta = new TorusGeometry(r, c.grosor, ...SEGMENTOS.toro);
    // Leve inclinación de cada vuelta; se levanta lo justo para que ningún borde atraviese la lona.
    const inclinacion = 0.03;
    const pos = centro.clone().add(new Vector3(entre(azar, -0.015, 0.015), c.grosor * (1 + 1.6 * k) + r * inclinacion * 1.25, entre(azar, -0.015, 0.015)));
    // El toro de Three.js está en el plano XY: se tumba sobre la lona.
    const giro = new Euler(-Math.PI / 2 + entre(azar, -inclinacion, inclinacion), 0, entre(azar, -inclinacion, inclinacion) * 0.7);
    m.anadir('comba', vuelta, componer(pos, giro, [1, 1, 1]), cuerda);
    vuelta.dispose();
  }

  // Mangos tumbados hacia el centro de la jaula (lejos de la malla) y el cabo que los une al rollo.
  const haciaDentro = c.angulo + 180;
  for (const signo of [-1, 1]) {
    const a = haciaDentro + signo * entre(azar, 20, 50);
    const [ux, uz] = direccionXZ(a);
    const borde = centro.clone().add(new Vector3(ux * c.radioRollo, c.grosor, uz * c.radioRollo));
    const [ex, ez] = direccionXZ(a + entre(azar, -25, 25));
    const yMango = y + c.mango.diametro / 2;
    const p0 = borde.clone().add(new Vector3(ux * 0.05, 0, uz * 0.05)).setY(yMango);
    const p1 = p0.clone().add(new Vector3(ex * c.mango.largo, 0, ez * c.mango.largo));
    m.anadir('comba', cilindroPequeno, entrePuntos(p0, p1, [c.mango.diametro, c.mango.diametro]), m.tono(COLORES.mango));
    m.anadir('comba', cilindroPequeno, entrePuntos(borde, p0.clone().setY(y + c.grosor), [c.grosor * 2, c.grosor * 2]), cuerda);
  }
}

function banco(m: Montaje, azar: Azar) {
  const b = DETALLES.banco;
  const [bx, by, bz] = b.centro;
  const asiento = by + b.alto;
  const p = (x: number, y: number, z: number): Vec3 => [bx + x, by + y, bz + z];
  const recto = new Euler();

  // Asiento de dos tablas.
  for (const lado of [-1, 1]) {
    m.anadir('bancoMate', caja, componer(p((lado * b.fondo) / 4, b.alto - b.grosorAsiento / 2, 0), recto, [b.fondo / 2 - 0.01, b.grosorAsiento, b.largo]), m.tono(COLORES.madera));
  }

  // Estructura de acero: dos marcos (patas y travesaños) y un larguero.
  const acero = m.tono(COLORES.acero, false);
  const altoPata = b.alto - b.grosorAsiento;
  for (const extremo of [-1, 1]) {
    const z = extremo * (b.largo / 2 - 0.12);
    for (const lado of [-1, 1]) {
      m.anadir('bancoMate', caja, componer(p(lado * (b.fondo / 2 - b.perfil / 2), altoPata / 2, z), recto, [b.perfil, altoPata, b.perfil]), acero);
    }
    m.anadir('bancoMate', caja, componer(p(0, 0.06, z), recto, [b.fondo, b.perfil, b.perfil]), acero);
    m.anadir('bancoMate', caja, componer(p(0, altoPata - b.perfil / 2, z), recto, [b.fondo, b.perfil, b.perfil]), acero);
  }
  m.anadir('bancoMate', caja, componer(p(0, 0.12, 0), recto, [b.perfil, b.perfil, b.largo - 0.24]), acero);

  // Toalla doblada: plancha y canto redondeado del pliegue.
  const t = b.toalla;
  const giroToalla = new Euler(0, entre(azar, -0.15, 0.15), 0);
  const baseToalla = componer([bx + t.dx, asiento + t.grueso / 2, bz + t.dz], giroToalla, [1, 1, 1]);
  const toalla = m.tono(COLORES.toalla);
  m.anadir('bancoMate', caja, baseToalla.clone().multiply(componer([0, 0, -0.015], recto, [t.ancho, t.grueso, t.largo - 0.03])), toalla);
  m.anadir('bancoMate', cilindro, baseToalla.clone().multiply(componer([0, 0, t.largo / 2 - 0.03], new Euler(0, 0, Math.PI / 2), [t.grueso, t.ancho, t.grueso])), toalla);

  // Vendas: dos rollos tumbados.
  const v = b.vendas;
  COLORES.vendas.forEach((color, i) => {
    const pos: Vec3 = [bx + v.dx + i * 0.03, asiento + v.diametro / 2, bz + v.dz + i * 0.075];
    m.anadir('bancoMate', cilindro, componer(pos, new Euler(0, entre(azar, -0.6, 0.6), Math.PI / 2, 'YXZ'), [v.diametro, v.ancho, v.diametro]), m.tono(color));
  });

  // Botella sin etiqueta: cuerpo, hombro y tapón.
  const bo = b.botella;
  const xb = bx + bo.dx;
  const zb = bz + bo.dz;
  const cuerpo = bo.alto * 0.76;
  const hombro = bo.alto * 0.1;
  const tapon = bo.alto - cuerpo - hombro;
  m.anadir('bancoSatinado', cilindro, componer([xb, asiento + cuerpo / 2, zb], recto, [bo.diametro, cuerpo, bo.diametro]), m.tono(COLORES.botella));
  m.anadir('bancoSatinado', tronco, componer([xb, asiento + cuerpo + hombro / 2, zb], recto, [bo.diametro, hombro, bo.diametro]), m.tono(COLORES.botella, false));
  m.anadir('bancoSatinado', cilindroPequeno, componer([xb, asiento + cuerpo + hombro + tapon / 2, zb], recto, [bo.diametro * 0.48, tapon, bo.diametro * 0.48]), m.tono(COLORES.tapon, false));

  // Espinilleras de pie en el suelo, apoyadas en el canto del asiento que da al pasillo.
  const e = b.espinilleras;
  const xCanto = bx + b.fondo / 2 + e.grueso / 2 + 0.005;
  const yApoyo = asiento - 0.05;
  for (const dz of e.dz) {
    const z = bz + dz + entre(azar, -0.01, 0.01);
    const yPie = 0.04;
    const tumbado = Math.sqrt(e.largo ** 2 - (yApoyo - yPie) ** 2) + entre(azar, -0.02, 0.02);
    const arriba = new Vector3(xCanto, yApoyo, z);
    const abajo = new Vector3(xCanto + tumbado, yPie, z);
    const negro = m.tono(COLORES.espinillera);
    m.anadir('bancoSatinado', cilindro, entrePuntos(abajo, arriba, [e.grueso, e.ancho]), negro);
    // Correa a un tercio desde arriba.
    const enCorrea = abajo.clone().lerp(arriba, 0.68);
    const dir = arriba.clone().sub(abajo).normalize().multiplyScalar(0.015);
    m.anadir('bancoSatinado', cilindroPequeno, entrePuntos(enCorrea.clone().sub(dir), enCorrea.clone().add(dir), [e.grueso * 1.2, e.ancho * 1.04]), m.tono(COLORES.correa, false));
    // Empeine: pieza más corta que sale hacia el pasillo, casi tumbada.
    const punta = abajo.clone().add(new Vector3(e.pie * 0.9, -0.01, 0));
    m.anadir('bancoSatinado', cilindroPequeno, entrePuntos(abajo.clone().setY(0.035), punta.setY(0.025), [e.grueso * 0.8, e.ancho * 0.85]), negro);
  }
}

function balones(m: Montaje, azar: Azar) {
  for (const [x, z, r] of DETALLES.balones.lista) {
    const giro = new Euler(entre(azar, 0, Math.PI), entre(azar, 0, Math.PI), 0);
    const matriz = componer([x, r, z], giro, [2 * r, 2 * r, 2 * r]);
    m.anadir('balones', balon, matriz, m.tono(COLORES.balon));
    m.anadir('balones', costura, matriz, m.tono(COLORES.costura, false));
  }
}

/** Geometrías fusionadas de los seis detalles, una por grupo (deterministas). */
export function crearDetalles(): GrupoDetalles[] {
  const azar = crearAzar(DETALLES.semilla);
  const m = new Montaje(azar);
  guantes(m, azar);
  comba(m, azar);
  banco(m, azar);
  balones(m, azar);
  return m.fusionar();
}
