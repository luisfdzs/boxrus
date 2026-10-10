import { useMemo } from 'react';
import { Color, ExtrudeGeometry, Shape } from 'three';
import {
  ANCHO,
  ENVOLVENTE,
  PORTON,
  PROFUNDIDAD,
  SUELO,
  VENTANALES,
  ventanalesFondoX,
  ventanalesLateralesZ,
  type Vec3,
} from '../../../datos/nave';
import { LUZ } from '../../../datos/luz';
import { crearAzar, entre } from '../../../lib/azar';
import { Cajas, type Caja } from './Cajas';
import { MATERIALES } from './materiales';

const { xMin, xMax, zFrente, zFondo, alturaAlero, alturaCumbrera, grosorMuro: g } = ENVOLVENTE;
const zCentro = (zFrente + zFondo) / 2;

function placasTatami(): Caja[] {
  const azar = crearAzar(SUELO.semillaTatami);
  const { ancho, largo } = SUELO.placaTatami;
  const j = SUELO.juntaTatami;
  const base = new Color(SUELO.colorPlaca);
  const placas: Caja[] = [];
  for (let z0 = SUELO.zFinHormigon; z0 > zFondo + 1e-6; z0 -= largo) {
    const l = Math.min(largo, z0 - zFondo);
    for (let x0 = xMin; x0 < xMax - 1e-6; x0 += ancho) {
      const tono = 1 + entre(azar, -SUELO.variacionTono, SUELO.variacionTono);
      placas.push({
        posicion: [x0 + ancho / 2, 0.01, z0 - l / 2],
        tamano: [ancho - j, 0.02, l - j],
        color: base.clone().multiplyScalar(tono),
      });
    }
  }
  return placas;
}

/**
 * Muro con huecos de ventanal (fase 3: el sol entra solo por ellos). `a`–`b` es el
 * tramo a lo largo del muro; `fijo`, su coordenada perpendicular. Se parte en
 * franja baja, franja alta y machones entre huecos.
 */
function muroConHuecos(enX: boolean, fijo: number, a: number, b: number, centros: number[], ancho: number, alfeizar: number, alto: number): Caja[] {
  const caja = (u0: number, u1: number, y0: number, y1: number): Caja => {
    const u = (u0 + u1) / 2;
    const y = (y0 + y1) / 2;
    return enX
      ? { posicion: [u, y, fijo], tamano: [u1 - u0, y1 - y0, g] }
      : { posicion: [fijo, y, u], tamano: [g, y1 - y0, u1 - u0] };
  };
  const dintel = alfeizar + alto;
  const bordes = [a, ...[...centros].sort((p, q) => p - q).flatMap((c) => [c - ancho / 2, c + ancho / 2]), b];
  const machones: Caja[] = [];
  for (let i = 0; i < bordes.length; i += 2) if (bordes[i + 1] - bordes[i] > 1e-6) machones.push(caja(bordes[i], bordes[i + 1], alfeizar, dintel));
  return [caja(a, b, 0, alfeizar), caja(a, b, dintel, alturaAlero), ...machones];
}

function muros(): Caja[] {
  const ladoPorton = (ANCHO - PORTON.ancho) / 2;
  const { fondo, laterales } = VENTANALES;
  const lateral = (x: number) =>
    muroConHuecos(false, x, zFondo - g / 2, zFrente + g / 2, ventanalesLateralesZ(), laterales.ancho, laterales.alfeizar, laterales.alto);
  return [
    // Laterales y fondo, con los huecos de los ventanales.
    ...lateral(xMin),
    ...lateral(xMax),
    ...muroConHuecos(true, zFondo, xMin, xMax, ventanalesFondoX(), fondo.ancho, fondo.alfeizar, fondo.alto),
    // Muro de entrada con el hueco del portón.
    { posicion: [xMin + ladoPorton / 2, alturaAlero / 2, zFrente], tamano: [ladoPorton, alturaAlero, g] },
    { posicion: [xMax - ladoPorton / 2, alturaAlero / 2, zFrente], tamano: [ladoPorton, alturaAlero, g] },
    {
      posicion: [0, (PORTON.alto + alturaAlero) / 2, zFrente],
      tamano: [PORTON.ancho, alturaAlero - PORTON.alto, g],
    },
  ];
}

/** Vidrio (emisivo) y perfilería de un ventanal: marco y cuarterones en cruz. `brillo`: variación entre hojas. */
function ventanal(centro: Vec3, ancho: number, alto: number, enX: boolean, brillo: number) {
  const p = VENTANALES.perfil;
  const [cx, cy, cz] = centro;
  const pos = (u: number, v: number): Vec3 => (enX ? [cx + u, cy + v, cz] : [cx, cy + v, cz + u]);
  const tam = (tu: number, tv: number): Vec3 => (enX ? [tu, tv, p] : [p, tv, tu]);
  const vidrio: Caja = {
    posicion: centro,
    tamano: enX ? [ancho, alto, 0.02] : [0.02, alto, ancho],
    color: new Color(brillo, brillo, brillo),
  };
  const perfiles: Caja[] = [
    { posicion: pos(0, alto / 2), tamano: tam(ancho, p) },
    { posicion: pos(0, -alto / 2), tamano: tam(ancho, p) },
    { posicion: pos(-ancho / 2, 0), tamano: tam(p, alto) },
    { posicion: pos(ancho / 2, 0), tamano: tam(p, alto) },
    { posicion: pos(0, 0), tamano: tam(ancho, p) },
    { posicion: pos(-ancho / 6, 0), tamano: tam(p, alto) },
    { posicion: pos(ancho / 6, 0), tamano: tam(p, alto) },
  ];
  return { vidrio, perfiles };
}

function ventanales() {
  const vidrios: Caja[] = [];
  const perfiles: Caja[] = [];
  const anadir = (v: ReturnType<typeof ventanal>) => {
    vidrios.push(v.vidrio);
    perfiles.push(...v.perfiles);
  };
  const { fondo, laterales, retranqueo } = VENTANALES;
  const azar = crearAzar(LUZ.vidrio.semilla);
  const brillo = () => 1 + entre(azar, -LUZ.vidrio.variacion, LUZ.vidrio.variacion);
  // Vidrio y perfiles retranqueados dentro del hueco: se ve el canto del muro.
  const zFondoVidrio = zFondo + g / 2 - retranqueo;
  for (const x of ventanalesFondoX())
    anadir(ventanal([x, fondo.alfeizar + fondo.alto / 2, zFondoVidrio], fondo.ancho, fondo.alto, true, brillo()));
  for (const lado of [-1, 1]) {
    const x = lado * (xMax - g / 2 + retranqueo);
    for (const z of ventanalesLateralesZ())
      anadir(ventanal([x, laterales.alfeizar + laterales.alto / 2, z], laterales.ancho, laterales.alto, false, brillo()));
  }
  return { vidrios, perfiles };
}

/** Piñón triangular sobre el alero en los muros de entrada y fondo. */
function usePinon() {
  return useMemo(() => {
    const forma = new Shape();
    forma.moveTo(xMin, alturaAlero);
    forma.lineTo(xMax, alturaAlero);
    forma.lineTo(0, alturaCumbrera);
    forma.closePath();
    const geometria = new ExtrudeGeometry(forma, { depth: g, bevelEnabled: false });
    geometria.translate(0, 0, -g / 2);
    return geometria;
  }, []);
}

export function Envolvente() {
  const tatami = useMemo(placasTatami, []);
  const paredes = useMemo(muros, []);
  const { vidrios, perfiles } = useMemo(ventanales, []);
  const pinon = usePinon();

  const pendiente = Math.atan2(alturaCumbrera - alturaAlero, xMax);
  const anchoFaldon = Math.hypot(xMax, alturaCumbrera - alturaAlero);
  const largoHormigon = zFrente - SUELO.zFinHormigon;

  return (
    <group>
      {/* Suelo: base oscura (juntas), placas de tatami y franja de hormigón. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, zCentro]} material={MATERIALES.juntaTatami} receiveShadow>
        <planeGeometry args={[ANCHO, PROFUNDIDAD]} />
      </mesh>
      <Cajas cajas={tatami} material={MATERIALES.tatami} sombras />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.021, zFrente - largoHormigon / 2]} material={MATERIALES.hormigon} receiveShadow>
        <planeGeometry args={[ANCHO, largoHormigon]} />
      </mesh>

      <Cajas cajas={paredes} material={MATERIALES.muro} sombras />
      <mesh geometry={pinon} position={[0, 0, zFrente]} material={MATERIALES.muro} castShadow />
      <mesh geometry={pinon} position={[0, 0, zFondo]} material={MATERIALES.muro} castShadow />

      {/* Portón cerrado, enrasado con la cara interior del muro. */}
      <mesh position={[0, PORTON.alto / 2, zFrente + 0.05]} material={MATERIALES.porton}>
        <boxGeometry args={[PORTON.ancho, PORTON.alto, 0.1]} />
      </mesh>

      <Cajas cajas={vidrios} material={MATERIALES.vidrio} />
      <Cajas cajas={perfiles} material={MATERIALES.acero} sombras />

      {/* Cubierta a dos aguas. */}
      {[-1, 1].map((lado) => (
        <mesh
          key={lado}
          position={[(lado * xMax) / 2, (alturaAlero + alturaCumbrera) / 2 + 0.05, zCentro]}
          rotation-z={-lado * pendiente}
          material={MATERIALES.chapa}
          castShadow
        >
          <boxGeometry args={[anchoFaldon, 0.06, PROFUNDIDAD + g]} />
        </mesh>
      ))}
    </group>
  );
}
