// Obstáculos de la nave para la prueba de colisiones de la cámara
// (docs/04: la cámara nunca atraviesa sacos, cadenas, pilares, bastidores,
// regletas ni la malla de la jaula, salvo por las puertas).
// Cada obstáculo da la distancia aproximada (m) de un punto a su superficie.
import {
  BASTIDORES,
  ENVOLVENTE,
  ESTRUCTURA,
  FLUORESCENTES,
  JAULA,
  MARCADOR,
  PERAS,
  SACOS,
  direccionXZ,
  regletasFilas,
  regletasRefuerzo,
  sacosBastidorZ,
  verticesJaula,
} from '../datos/nave';

type Punto = { x: number; y: number; z: number };

export interface Obstaculo {
  nombre: string;
  distancia: (p: Punto) => number;
}

const fueraDeRango = (y: number, y0: number, y1: number) => Math.max(y0 - y, 0, y - y1);

const caja = (nombre: string, min: [number, number, number], max: [number, number, number]): Obstaculo => ({
  nombre,
  distancia: ({ x, y, z }) => {
    const dx = Math.max(min[0] - x, 0, x - max[0]);
    const dy = Math.max(min[1] - y, 0, y - max[1]);
    const dz = Math.max(min[2] - z, 0, z - max[2]);
    return Math.hypot(dx, dy, dz);
  },
});

const cilindro = (nombre: string, cx: number, cz: number, radio: number, y0: number, y1: number): Obstaculo => ({
  nombre,
  distancia: ({ x, y, z }) => Math.hypot(Math.max(Math.hypot(x - cx, z - cz) - radio, 0), fueraDeRango(y, y0, y1)),
});

/** Pared vertical fina entre dos puntos del plano XZ. */
const pared = (nombre: string, a: [number, number], b: [number, number], y0: number, y1: number): Obstaculo => ({
  nombre,
  distancia: ({ x, y, z }) => {
    const [ax, az] = a;
    const [bx, bz] = b;
    const lx = bx - ax;
    const lz = bz - az;
    const t = Math.min(1, Math.max(0, ((x - ax) * lx + (z - az) * lz) / (lx * lx + lz * lz)));
    const horizontal = Math.hypot(x - (ax + t * lx), z - (az + t * lz));
    return Math.hypot(horizontal, fueraDeRango(y, y0, y1));
  },
});

function obstaculosJaula(): Obstaculo[] {
  const [cx, , cz] = JAULA.centro;
  const vertices = verticesJaula();
  const yMin = JAULA.altoPlataforma;
  const yMax = JAULA.poste.alto;
  const lista: Obstaculo[] = [cilindro('plataforma de la jaula', cx, cz, JAULA.radio, 0, JAULA.altoPlataforma)];

  vertices.forEach(([x, z], i) => {
    lista.push(cilindro(`poste ${i + 1} de la jaula`, x, z, JAULA.poste.radio, 0, yMax));

    const siguiente = vertices[(i + 1) % 8];
    // El cable superior recorre todas las caras, también sobre las puertas.
    lista.push(pared('cable superior de la jaula', [x, z], siguiente, JAULA.cable.y - JAULA.cable.radio, JAULA.cable.y + JAULA.cable.radio));
    const normalCara = JAULA.anguloVertice0 + i * 45 + 22.5;
    const conPuerta = Object.values(JAULA.puertas).some((a) => Math.abs(((normalCara - a + 540) % 360) - 180) < 1);
    if (!conPuerta) {
      lista.push(pared(`malla ${i + 1} de la jaula`, [x, z], siguiente, yMin, yMax));
      return;
    }
    // Cara con puerta: dos tramos de malla a los lados del hueco.
    const largo = Math.hypot(siguiente[0] - x, siguiente[1] - z);
    const t = (largo - JAULA.anchoPuerta) / 2 / largo;
    const corte = (f: number): [number, number] => [x + (siguiente[0] - x) * f, z + (siguiente[1] - z) * f];
    lista.push(pared(`malla ${i + 1} (junto a la puerta)`, [x, z], corte(t), yMin, yMax));
    lista.push(pared(`malla ${i + 1} (junto a la puerta)`, corte(1 - t), siguiente, yMin, yMax));
  });
  return lista;
}

function obstaculosSacos(): Obstaculo[] {
  const lista: Obstaculo[] = [];
  const techoSaco = SACOS.base + SACOS.alto;
  const { radio, radioCadena } = SACOS;

  for (const [x, z] of SACOS.protagonistas.posiciones) {
    lista.push(cilindro('saco protagonista', x, z, radio, SACOS.base, techoSaco));
    lista.push(cilindro('cadena del saco protagonista', x, z, radioCadena, techoSaco, SACOS.protagonistas.yViga));
  }
  const margen = radio + 0.05;
  for (const lado of [-1, 1]) {
    // El bastidor completo (postes, viga, cadenas y sacos) como una caja.
    const x0 = lado * (BASTIDORES.x - margen);
    lista.push(
      caja(
        lado < 0 ? 'bastidor izquierdo' : 'bastidor derecho',
        [Math.min(x0, lado * ENVOLVENTE.xMax), 0, Math.min(...sacosBastidorZ()) - margen],
        [Math.max(x0, lado * ENVOLVENTE.xMax), BASTIDORES.alto + BASTIDORES.seccion, Math.max(...sacosBastidorZ()) + margen],
      ),
    );
    // Peras de velocidad en los extremos y pera loca junto a la primera.
    for (const z of [BASTIDORES.zInicio + PERAS.plataforma.separacionExtremo, BASTIDORES.zFin - PERAS.plataforma.separacionExtremo]) {
      lista.push(cilindro('pera de velocidad', lado * PERAS.plataforma.x, z, PERAS.plataforma.radio, 1.4, PERAS.plataforma.y + 0.1));
    }
    const zLoca = BASTIDORES.zInicio + PERAS.plataforma.separacionExtremo + PERAS.loca.separacion;
    lista.push(cilindro('pera loca', lado * PERAS.loca.x, zLoca, PERAS.loca.radio, 0, ESTRUCTURA.cordonInferior));
  }
  return lista;
}

function obstaculosEstructura(): Obstaculo[] {
  const lista: Obstaculo[] = [];
  const m = ESTRUCTURA.pilares.seccion / 2;
  for (const x of ESTRUCTURA.pilares.x)
    for (const z of ESTRUCTURA.pilares.z) lista.push(caja('pilar', [x - m, 0, z - m], [x + m, ESTRUCTURA.cordonInferior, z + m]));

  const { largo, ancho, alto, y } = FLUORESCENTES;
  for (const [x, z] of regletasFilas())
    lista.push(caja('regleta', [x - ancho / 2, y - alto / 2, z - largo / 2], [x + ancho / 2, y + alto / 2, z + largo / 2]));
  for (const r of regletasRefuerzo()) {
    const [mx, mz] = r.aLoLargoX ? [largo / 2, ancho / 2] : [ancho / 2, largo / 2];
    const yr = FLUORESCENTES.refuerzoJaula.y;
    lista.push(caja('regleta del refuerzo', [r.x - mx, yr - alto / 2, r.z - mz], [r.x + mx, yr + alto / 2, r.z + mz]));
  }

  const [mx, my, mz] = MARCADOR.centro;
  lista.push(caja('marcador', [mx - MARCADOR.fondo, my - MARCADOR.alto / 2, mz - MARCADOR.ancho / 2], [ENVOLVENTE.xMin, my + MARCADOR.alto / 2, mz + MARCADOR.ancho / 2]));

  // Envolvente: muros, suelo y cordón inferior de las cerchas como techo útil.
  const g = ENVOLVENTE.grosorMuro / 2;
  lista.push({
    nombre: 'envolvente',
    distancia: ({ x, y, z }) =>
      Math.max(0, Math.min(x - (ENVOLVENTE.xMin + g), ENVOLVENTE.xMax - g - x, z - (ENVOLVENTE.zFondo + g), ENVOLVENTE.zFrente - g - z, y, ESTRUCTURA.cordonInferior - ESTRUCTURA.canto / 2 - y)),
  });
  return lista;
}

export const crearObstaculos = (): Obstaculo[] => [...obstaculosJaula(), ...obstaculosSacos(), ...obstaculosEstructura()];

export interface Colision {
  progreso: number;
  punto: Punto;
  obstaculo: string;
  distancia: number;
}

/** Recorre el progreso en `muestras` pasos y devuelve los puntos más cerca que `margen` de algún obstáculo. */
export function comprobarColisiones(
  posicionEn: (progreso: number) => Punto,
  margen: number,
  muestras = 2000,
  obstaculos = crearObstaculos(),
): Colision[] {
  const colisiones: Colision[] = [];
  for (let i = 0; i <= muestras; i++) {
    const progreso = i / muestras;
    const punto = posicionEn(progreso);
    for (const o of obstaculos) {
      const distancia = o.distancia(punto);
      if (distancia < margen) colisiones.push({ progreso, punto: { ...punto }, obstaculo: o.nombre, distancia });
    }
  }
  return colisiones;
}

// Comprobación de coherencia: las puertas deben coincidir con caras del octógono.
export const puertasEnCaras = (): boolean =>
  Object.values(JAULA.puertas).every((a) => {
    const relativo = (((a - JAULA.anguloVertice0 - 22.5) % 45) + 45) % 45;
    return relativo < 1e-9 && direccionXZ(a).every(Number.isFinite);
  });
