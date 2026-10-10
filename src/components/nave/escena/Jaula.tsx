import { useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { JAULA, verticesJaula } from '../../../datos/nave';
import { CILINDRO_UNIDAD, Cajas, barra, type Caja } from './Cajas';
import { MATERIALES } from './materiales';

const [cx, , cz] = JAULA.centro;
const esCaraConPuerta = (i: number) => {
  const normal = JAULA.anguloVertice0 + i * 45 + 22.5;
  return Object.values(JAULA.puertas).some((a) => Math.abs(((normal - a + 540) % 360) - 180) < 1);
};

function piezas() {
  const vertices = verticesJaula();
  const { yMin, yMax, paso } = JAULA.malla;
  const postes: Caja[] = [];
  // Paños de malla: cuatro vértices cada uno, UV en teselas (una por rombo) medidas desde el inicio de la cara.
  const posiciones: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const cable: Caja[] = [];

  vertices.forEach(([x, z], i) => {
    const d = JAULA.poste.radio * 2;
    postes.push({ posicion: [x, JAULA.poste.alto / 2, z], tamano: [d, JAULA.poste.alto, d] });
    const [x1, z1] = vertices[(i + 1) % 8];
    cable.push(barra([x, JAULA.cable.y, z], [x1, JAULA.cable.y, z1], JAULA.cable.radio * 2));

    // Paños de malla (dos por cara si tiene puerta, dejando el hueco libre).
    const largo = Math.hypot(x1 - x, z1 - z);
    const tramos: [number, number][] = [[0, 1]];
    if (esCaraConPuerta(i)) {
      const t = (largo - JAULA.anchoPuerta) / 2 / largo;
      tramos.splice(0, 1, [0, t], [1 - t, 1]);
    }
    for (const [t0, t1] of tramos) {
      const n = posiciones.length / 3;
      for (const [t, y] of [[t0, yMin], [t1, yMin], [t1, yMax], [t0, yMax]]) {
        posiciones.push(x + (x1 - x) * t, y, z + (z1 - z) * t);
        uvs.push((t * largo) / paso, (y - yMin) / paso);
      }
      indices.push(n, n + 1, n + 2, n, n + 2, n + 3);
    }
  });
  const malla = new BufferGeometry();
  malla.setAttribute('position', new Float32BufferAttribute(posiciones, 3));
  malla.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  malla.setIndex(indices);
  malla.computeVertexNormals();
  return { postes, malla, cable };
}

export function Jaula() {
  const { postes, malla, cable } = useMemo(piezas, []);
  const h = JAULA.altoPlataforma;
  const tapa = 0.08;
  return (
    <group>
      {/* Plataforma: lona arriba y faldón negro retranqueado. thetaStart alinea los vértices con nave.ts. */}
      <mesh position={[cx, h - tapa / 2, cz]} material={MATERIALES.lona} receiveShadow castShadow>
        <cylinderGeometry args={[JAULA.radio, JAULA.radio, tapa, 8, 1, false, Math.PI / 8]} />
      </mesh>
      <mesh position={[cx, (h - tapa) / 2, cz]} material={MATERIALES.faldon}>
        <cylinderGeometry
          args={[JAULA.radio - JAULA.retranqueoFaldon, JAULA.radio - JAULA.retranqueoFaldon, h - tapa, 8, 1, false, Math.PI / 8]}
        />
      </mesh>
      <Cajas cajas={postes} material={MATERIALES.acolchado} geometria={CILINDRO_UNIDAD} sombras />
      <Cajas cajas={cable} material={MATERIALES.acolchado} />
      <mesh geometry={malla} material={MATERIALES.malla} />
    </group>
  );
}
