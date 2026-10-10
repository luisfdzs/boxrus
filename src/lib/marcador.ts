// Dígitos LED del marcador de asaltos (docs/02 y docs/09): geometría propia de
// 7 segmentos, sin fuentes ni texturas. Funciones puras (sin Three) para poder
// probarlas con Vitest; el componente Marcador las convierte en mallas.
import type { MARCADOR } from '../datos/nave';

type Punto = readonly [number, number];

/**
 * Segmentos en la celda unidad (x de 0 a 1, y de 0 a 2, sobre los ejes de los
 * trazos): los siete clásicos y `k`, la pata diagonal de la R.
 */
const SEGMENTOS: Record<string, readonly [Punto, Punto]> = {
  a: [[0, 2], [1, 2]],
  b: [[1, 2], [1, 1]],
  c: [[1, 1], [1, 0]],
  d: [[0, 0], [1, 0]],
  e: [[0, 0], [0, 1]],
  f: [[0, 1], [0, 2]],
  g: [[0, 1], [1, 1]],
  k: [[0.5, 1], [1, 0]],
};

const CARACTERES: Record<string, string> = {
  '0': 'abcdef',
  '1': 'bc',
  '2': 'abdeg',
  '3': 'abcdg',
  '4': 'bcfg',
  '5': 'acdfg',
  '6': 'acdefg',
  '7': 'abc',
  '8': 'abcdefg',
  '9': 'abcdfg',
  R: 'abefgk',
};

export type Digitos = (typeof MARCADOR)['digitos'];

/** Triángulos en el plano del frontal (x a la derecha, y arriba, metros), como lista plana x, y. */
export interface Trazo {
  encendidos: number[];
  apagados: number[];
}

/** Segmento hexagonal (puntas en bisel) de `p` a `q`, acortado `hueco / 2` por cada extremo. */
function segmento(salida: number[], p: Punto, q: Punto, grosor: number, hueco: number) {
  const largo = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const [dx, dy] = [(q[0] - p[0]) / largo, (q[1] - p[1]) / largo];
  const [nx, ny] = [-dy, dx];
  const m = grosor / 2;
  const punto = (a: number, b: number): Punto => [p[0] + dx * a + nx * b, p[1] + dy * a + ny * b];
  const l = largo - hueco / 2;
  const s = hueco / 2;
  // Contorno en sentido antihorario visto de frente; abanico desde el primer vértice.
  const contorno = [punto(s, 0), punto(s + m, -m), punto(l - m, -m), punto(l, 0), punto(l - m, m), punto(s + m, m)];
  for (let i = 1; i < contorno.length - 1; i++) salida.push(...contorno[0], ...contorno[i], ...contorno[i + 1]);
}

const anchoCelda = (c: string, d: Digitos, escala: number) => (c === ':' ? d.grosor * 1.2 : d.ancho) * escala;

/** Pinta `texto` desde (x0, y0) (esquina inferior izquierda) a la escala dada. */
function trazarTexto(texto: string, d: Digitos, escala: number, x0: number, y0: number): Trazo {
  const trazo: Trazo = { encendidos: [], apagados: [] };
  const t = d.grosor * escala;
  const w = d.ancho * escala;
  const h = d.alto * escala;
  let x = x0;
  for (const c of texto) {
    if (c === ':') {
      // Dos puntos cuadrados.
      const m = (t * 1.1) / 2;
      const cx = x + anchoCelda(c, d, escala) / 2;
      for (const fy of [0.3, 0.7]) {
        const cy = y0 + h * fy;
        trazo.encendidos.push(cx - m, cy - m, cx + m, cy - m, cx + m, cy + m, cx - m, cy - m, cx + m, cy + m, cx - m, cy + m);
      }
    } else {
      const encendidos = CARACTERES[c] ?? '';
      // A los ejes de los trazos: medio grosor hacia dentro de la celda.
      const enCelda = ([u, v]: Punto): Punto => [x + t / 2 + u * (w - t), y0 + t / 2 + (v / 2) * (h - t)];
      for (const [nombre, [p, q]] of Object.entries(SEGMENTOS)) {
        const lista = encendidos.includes(nombre) ? trazo.encendidos : nombre !== 'k' ? trazo.apagados : null;
        if (lista) segmento(lista, enCelda(p), enCelda(q), t, d.hueco * escala);
      }
    }
    x += anchoCelda(c, d, escala) + d.separacion * escala;
  }
  return trazo;
}

const anchoTexto = (texto: string, d: Digitos, escala: number) =>
  [...texto].reduce((s, c) => s + anchoCelda(c, d, escala), 0) + d.separacion * escala * (texto.length - 1);

/**
 * Tiempo y asalto centrados en el frontal (origen en su centro), con la cursiva
 * aplicada. El asalto va a la derecha del tiempo, alineado por abajo.
 */
export function trazarMarcador(d: Digitos): { tiempo: Trazo; asalto: Trazo } {
  const s = d.escalaAsalto;
  const total = anchoTexto(d.tiempo, d, 1) + d.separacionAsalto + anchoTexto(d.asalto, d, s);
  const x0 = -total / 2;
  const y0 = -d.alto / 2;
  const tiempo = trazarTexto(d.tiempo, d, 1, x0, y0);
  const asalto = trazarTexto(d.asalto, d, s, x0 + anchoTexto(d.tiempo, d, 1) + d.separacionAsalto, y0);
  const cursiva = (lista: number[]) => {
    for (let i = 0; i < lista.length; i += 2) lista[i] += lista[i + 1] * d.inclinacion;
  };
  for (const trazo of [tiempo, asalto]) {
    cursiva(trazo.encendidos);
    cursiva(trazo.apagados);
  }
  return { tiempo, asalto };
}
