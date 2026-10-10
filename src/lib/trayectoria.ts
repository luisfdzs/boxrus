// Trayectoria de cámara: progreso global 0–1 → posición, mira y campo de visión.
// Es una función pura del progreso, así que el recorrido es reversible y
// determinista. Curvas Catmull-Rom (centrípetas) independientes para posición
// y mira, que pasan por los extremos de cada pausa y por los puntos de paso.
import { CatmullRomCurve3, MathUtils, Vector3 } from 'three';
import type { Vec3 } from '../datos/nave';
import { PARADAS, RECORRIDO, type Parada } from '../datos/paradas';
import { calcularPausas, type Pausa } from './pausas';

export { calcularPausas, progresoDeParada } from './pausas';

export type Variante = 'escritorio' | 'movil';

export interface Pose {
  posicion: Vector3;
  mira: Vector3;
  /** Campo de visión vertical en grados. */
  fov: number;
}

/** Campo de visión vertical para una focal full frame (sensor de 24 mm de alto). */
export const focalAFov = (mm: number): number => MathUtils.radToDeg(2 * Math.atan(12 / mm));

const suavizar = (t: number) => t * t * (3 - 2 * t);
const v = (p: Vec3) => new Vector3(p[0], p[1], p[2]);

export interface Trayectoria {
  evaluar: (progreso: number, destino?: Pose) => Pose;
  pausas: Pausa[];
  curvaPosicion: CatmullRomCurve3;
  curvaMira: CatmullRomCurve3;
}

export function crearTrayectoria(variante: Variante, paradas: Parada[] = PARADAS): Trayectoria {
  const posiciones: Vector3[] = [];
  const miras: Vector3[] = [];
  const indicePausa: { a: number; b: number; fov: number }[] = [];
  const extremosPausa: { posicion: [Vector3, Vector3]; mira: [Vector3, Vector3] }[] = [];

  for (const parada of paradas) {
    for (const punto of parada.llegada) {
      posiciones.push(v(punto.posicion));
      miras.push(v(punto.mira));
    }
    const encuadre = parada[variante];
    const media = v(parada.deriva).multiplyScalar(0.5);
    const a = posiciones.length;
    posiciones.push(v(encuadre.posicion).sub(media), v(encuadre.posicion).add(media));
    miras.push(v(encuadre.mira).sub(media), v(encuadre.mira).add(media));
    indicePausa.push({ a, b: a + 1, fov: focalAFov(encuadre.focal) });
    extremosPausa.push({ posicion: [posiciones[a], posiciones[a + 1]], mira: [miras[a], miras[a + 1]] });
  }

  const curvaPosicion = new CatmullRomCurve3(posiciones, false, 'centripetal');
  const curvaMira = new CatmullRomCurve3(miras, false, 'centripetal');
  const ultimo = posiciones.length - 1;
  const pausas = calcularPausas(paradas.length);

  // «Longitud» acumulada por índice de punto de control: desplazamiento más
  // giro de la mirada. Recorrerla a ritmo uniforme limita a la vez la
  // velocidad lineal y la angular (con aceleración y frenada suaves).
  const SUB = 64;
  const muestrasU: number[] = [];
  const longitudes: number[] = [];
  const posPrevia = new Vector3();
  const dirPrevia = new Vector3();
  const pos = new Vector3();
  const dir = new Vector3();
  let acumulada = 0;
  for (let i = 0; i <= ultimo * SUB; i++) {
    const u = i / SUB;
    curvaPosicion.getPoint(u / ultimo, pos);
    curvaMira.getPoint(u / ultimo, dir).sub(pos).normalize();
    if (i > 0) acumulada += pos.distanceTo(posPrevia) + RECORRIDO.metrosPorRadian * dir.angleTo(dirPrevia);
    posPrevia.copy(pos);
    dirPrevia.copy(dir);
    muestrasU.push(u);
    longitudes.push(acumulada);
  }

  const longitudEnU = (u: number) => {
    const i = Math.min(Math.floor(u * SUB), longitudes.length - 2);
    const f = u * SUB - i;
    return MathUtils.lerp(longitudes[i], longitudes[i + 1], f);
  };

  const uEnLongitud = (l: number) => {
    let lo = 0;
    let hi = longitudes.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (longitudes[mid] < l) lo = mid;
      else hi = mid;
    }
    const tramo = longitudes[hi] - longitudes[lo];
    const f = tramo > 0 ? (l - longitudes[lo]) / tramo : 0;
    return MathUtils.lerp(muestrasU[lo], muestrasU[hi], f);
  };

  const evaluar = (progreso: number, destino?: Pose): Pose => {
    const p = MathUtils.clamp(progreso, 0, 1);
    const pose = destino ?? { posicion: new Vector3(), mira: new Vector3(), fov: 0 };
    let k = pausas.findIndex((pausa) => p <= pausa.fin);
    if (k < 0) k = pausas.length - 1;
    const pausa = pausas[k];

    if (p >= pausa.inicio) {
      // Pausa: deriva en línea recta entre sus extremos, centrada en el encuadre.
      const f = MathUtils.clamp((p - pausa.inicio) / (pausa.fin - pausa.inicio), 0, 1);
      const { posicion, mira } = extremosPausa[k];
      pose.posicion.lerpVectors(posicion[0], posicion[1], f);
      pose.mira.lerpVectors(mira[0], mira[1], f);
      pose.fov = indicePausa[k].fov;
      return pose;
    }

    const anterior = pausas[k - 1];
    const s = suavizar((p - anterior.fin) / (pausa.inicio - anterior.fin));
    const l0 = longitudEnU(indicePausa[k - 1].b);
    const l1 = longitudEnU(indicePausa[k].a);
    const u = uEnLongitud(MathUtils.lerp(l0, l1, s));
    curvaPosicion.getPoint(u / ultimo, pose.posicion);
    curvaMira.getPoint(u / ultimo, pose.mira);
    pose.fov = MathUtils.lerp(indicePausa[k - 1].fov, indicePausa[k].fov, s);
    return pose;
  };

  return { evaluar, pausas, curvaPosicion, curvaMira };
}

