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
import { crearAzar, entre } from '../../../lib/azar';
import { Cajas, type Caja } from './Cajas';
import { MATERIALES } from './materiales';

const { xMin, xMax, zFrente, zFondo, alturaAlero, alturaCumbrera, grosorMuro: g } = ENVOLVENTE;
const zCentro = (zFrente + zFondo) / 2;

function placasTatami(): Caja[] {
  const azar = crearAzar(SUELO.semillaTatami);
  const { ancho, largo } = SUELO.placaTatami;
  const j = SUELO.juntaTatami;
  const base = new Color('#2f3236');
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

function muros(): Caja[] {
  const ladoPorton = (ANCHO - PORTON.ancho) / 2;
  return [
    // Laterales y fondo.
    { posicion: [xMin, alturaAlero / 2, zCentro], tamano: [g, alturaAlero, PROFUNDIDAD + g] },
    { posicion: [xMax, alturaAlero / 2, zCentro], tamano: [g, alturaAlero, PROFUNDIDAD + g] },
    { posicion: [0, alturaAlero / 2, zFondo], tamano: [ANCHO, alturaAlero, g] },
    // Muro de entrada con el hueco del portón.
    { posicion: [xMin + ladoPorton / 2, alturaAlero / 2, zFrente], tamano: [ladoPorton, alturaAlero, g] },
    { posicion: [xMax - ladoPorton / 2, alturaAlero / 2, zFrente], tamano: [ladoPorton, alturaAlero, g] },
    {
      posicion: [0, (PORTON.alto + alturaAlero) / 2, zFrente],
      tamano: [PORTON.ancho, alturaAlero - PORTON.alto, g],
    },
  ];
}

/** Vidrio (emisivo) y perfilería de un ventanal: marco y cuarterones en cruz. */
function ventanal(centro: Vec3, ancho: number, alto: number, enX: boolean) {
  const p = VENTANALES.perfil;
  const [cx, cy, cz] = centro;
  const pos = (u: number, v: number): Vec3 => (enX ? [cx + u, cy + v, cz] : [cx, cy + v, cz + u]);
  const tam = (tu: number, tv: number): Vec3 => (enX ? [tu, tv, p] : [p, tv, tu]);
  const vidrio: Caja = { posicion: centro, tamano: enX ? [ancho, alto, 0.02] : [0.02, alto, ancho] };
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
  const { fondo, laterales } = VENTANALES;
  const zInteriorFondo = zFondo + g / 2 + 0.02;
  for (const x of ventanalesFondoX()) anadir(ventanal([x, fondo.alfeizar + fondo.alto / 2, zInteriorFondo], fondo.ancho, fondo.alto, true));
  for (const lado of [-1, 1]) {
    const x = lado * (xMax - g / 2 - 0.02);
    for (const z of ventanalesLateralesZ())
      anadir(ventanal([x, laterales.alfeizar + laterales.alto / 2, z], laterales.ancho, laterales.alto, false));
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
      <mesh geometry={pinon} position={[0, 0, zFrente]} material={MATERIALES.muro} />
      <mesh geometry={pinon} position={[0, 0, zFondo]} material={MATERIALES.muro} />

      {/* Portón cerrado, enrasado con la cara interior del muro. */}
      <mesh position={[0, PORTON.alto / 2, zFrente + 0.05]} material={MATERIALES.porton}>
        <boxGeometry args={[PORTON.ancho, PORTON.alto, 0.1]} />
      </mesh>

      <Cajas cajas={vidrios} material={MATERIALES.vidrio} />
      <Cajas cajas={perfiles} material={MATERIALES.acero} />

      {/* Cubierta a dos aguas. */}
      {[-1, 1].map((lado) => (
        <mesh
          key={lado}
          position={[(lado * xMax) / 2, (alturaAlero + alturaCumbrera) / 2 + 0.05, zCentro]}
          rotation-z={-lado * pendiente}
          material={MATERIALES.chapa}
        >
          <boxGeometry args={[anchoFaldon, 0.06, PROFUNDIDAD + g]} />
        </mesh>
      ))}
    </group>
  );
}
