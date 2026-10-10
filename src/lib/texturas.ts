// Texturas generadas por código (docs/07): píxeles RGBA en bruto, sin Three,
// para poder probarlas con Vitest. Todas son repetibles (tileables) y
// deterministas; la que lleva ruido usa el generador con semilla.
import { crearAzar } from './azar';

const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Malla de eslabones: un rombo por tesela (diagonales iguales, vértices arriba,
 * abajo y a los lados). `radio` es el radio del alambre en fracción del paso.
 * RGB: sombreado cilíndrico del alambre; A: cobertura con antialias.
 */
export function pixelesMalla(res: number, radio: number): Uint8Array {
  const datos = new Uint8Array(res * res * 4);
  const aa = 0.75 / res;
  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      const u = (x + 0.5) / res;
      const v = (y + 0.5) / res;
      // Distancia (en teselas) a las dos familias de alambres diagonales.
      const d = Math.min(
        Math.abs(u + v - Math.round(u + v)),
        Math.abs(u - v - Math.round(u - v)),
      ) / Math.SQRT2;
      const alfa = 1 - suave(radio - aa, radio + aa, d);
      const luz = 0.55 + 0.45 * Math.sqrt(Math.max(0, 1 - (d / radio) ** 2));
      const i = (y * res + x) * 4;
      datos[i] = datos[i + 1] = datos[i + 2] = Math.round(255 * luz);
      datos[i + 3] = Math.round(255 * alfa);
    }
  }
  return datos;
}

/**
 * Normal map (espacio tangente) de chapa ondulada: perfil senoidal a lo largo
 * de V, constante a lo largo de U. `relacion` = profundidad / paso de la onda.
 * Tesela cuadrada: hay que repetirla también en U (un paso por tesela) para que
 * el filtrado anisótropo no produzca moiré en la cubierta vista de lejos.
 */
export function pixelesChapa(res: number, relacion: number): Uint8Array {
  const ancho = res;
  const datos = new Uint8Array(ancho * res * 4);
  for (let y = 0; y < res; y++) {
    // Altura h = (relacion/2)·sen(2πt) en unidades del paso; su pendiente:
    const pendiente = relacion * Math.PI * Math.cos((2 * Math.PI * (y + 0.5)) / res);
    const l = Math.hypot(pendiente, 1);
    const n = [0, -pendiente / l, 1 / l];
    for (let x = 0; x < ancho; x++) {
      const i = (y * ancho + x) * 4;
      datos[i] = Math.round((n[0] * 0.5 + 0.5) * 255);
      datos[i + 1] = Math.round((n[1] * 0.5 + 0.5) * 255);
      datos[i + 2] = Math.round((n[2] * 0.5 + 0.5) * 255);
      datos[i + 3] = 255;
    }
  }
  return datos;
}

/** Ruido de valor repetible: rejilla de `celdas` × `celdas` con interpolación suave. */
function ruidoValor(res: number, celdas: number, azar: () => number): Float32Array {
  const rejilla = Float32Array.from({ length: celdas * celdas }, azar);
  const salida = new Float32Array(res * res);
  const s = (t: number) => t * t * (3 - 2 * t);
  for (let y = 0; y < res; y++) {
    const gy = (y / res) * celdas;
    const y0 = Math.floor(gy);
    const ty = s(gy - y0);
    const y1 = (y0 + 1) % celdas;
    for (let x = 0; x < res; x++) {
      const gx = (x / res) * celdas;
      const x0 = Math.floor(gx);
      const tx = s(gx - x0);
      const x1 = (x0 + 1) % celdas;
      const a = rejilla[y0 * celdas + x0] + (rejilla[y0 * celdas + x1] - rejilla[y0 * celdas + x0]) * tx;
      const b = rejilla[y1 * celdas + x0] + (rejilla[y1 * celdas + x1] - rejilla[y1 * celdas + x0]) * tx;
      salida[y * res + x] = a + (b - a) * ty;
    }
  }
  return salida;
}

/**
 * Normal map de cuero granulado: alturas de ruido repetible (grano fino y algo
 * de ondulación) convertidas a normales por diferencias centrales con vuelta.
 * `relieve` escala la pendiente.
 */
export function pixelesCuero(res: number, semilla: number, relieve: number): Uint8Array {
  const azar = crearAzar(semilla);
  const capas = [
    { celdas: 64, peso: 0.6 },
    { celdas: 32, peso: 0.3 },
    { celdas: 8, peso: 0.1 },
  ].map((c) => ({ ...c, ruido: ruidoValor(res, c.celdas, azar) }));
  const altura = new Float32Array(res * res);
  for (let p = 0; p < res * res; p++) altura[p] = capas.reduce((s, c) => s + c.peso * c.ruido[p], 0);
  const h = (x: number, y: number) => altura[((y + res) % res) * res + ((x + res) % res)];
  const datos = new Uint8Array(res * res * 4);
  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      const dx = ((h(x + 1, y) - h(x - 1, y)) / 2) * res * relieve * 0.05;
      const dy = ((h(x, y + 1) - h(x, y - 1)) / 2) * res * relieve * 0.05;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * res + x) * 4;
      datos[i] = Math.round((-dx / l) * 127.5 + 127.5);
      datos[i + 1] = Math.round((-dy / l) * 127.5 + 127.5);
      datos[i + 2] = Math.round((1 / l) * 127.5 + 127.5);
      datos[i + 3] = 255;
    }
  }
  return datos;
}

/**
 * Desgaste del tatami: manchas amplias de roce (más claras y mates) y grano
 * fino. Gris en RGB, en [1 − intensidad, 1]: sirve a la vez de multiplicador
 * de color y de rugosidad (canal G).
 */
export function pixelesDesgaste(res: number, semilla: number, intensidad: number): Uint8Array {
  const azar = crearAzar(semilla);
  const octavas = [
    { celdas: 4, peso: 0.5 },
    { celdas: 8, peso: 0.3 },
    { celdas: 32, peso: 0.2 },
  ].map((o) => ({ ...o, ruido: ruidoValor(res, o.celdas, azar) }));
  const datos = new Uint8Array(res * res * 4);
  for (let p = 0; p < res * res; p++) {
    const fbm = octavas.reduce((suma, o) => suma + o.peso * o.ruido[p], 0);
    const manchas = suave(0.5, 0.8, fbm);
    const grano = azar();
    const valor = Math.min(1, 0.75 * manchas + 0.25 * grano);
    const g = Math.round(255 * (1 - intensidad + intensidad * valor));
    datos[p * 4] = datos[p * 4 + 1] = datos[p * 4 + 2] = g;
    datos[p * 4 + 3] = 255;
  }
  return datos;
}
