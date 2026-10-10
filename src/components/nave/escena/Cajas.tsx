import { useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, Color, CylinderGeometry, InstancedMesh, Matrix4, Quaternion, Vector3, type BufferGeometry, type Material } from 'three';
import type { Vec3 } from '../../../datos/nave';

export interface Caja {
  posicion: Vec3;
  tamano: Vec3;
  rotacion?: Quaternion;
  color?: Color;
}

const EJE_X = new Vector3(1, 0, 0);

/** Barra de sección cuadrada entre dos puntos. */
export function barra(a: Vec3, b: Vec3, seccion: number): Caja {
  const va = new Vector3(...a);
  const vb = new Vector3(...b);
  const dir = vb.clone().sub(va);
  const medio = va.clone().add(vb).multiplyScalar(0.5);
  return {
    posicion: medio.toArray() as Vec3,
    tamano: [dir.length(), seccion, seccion],
    rotacion: new Quaternion().setFromUnitVectors(EJE_X, dir.normalize()),
  };
}

export const CAJA_UNIDAD = new BoxGeometry(1, 1, 1);
/** Cilindro de diámetro 1 y alto 1 (escala: diámetro, alto, diámetro). */
export const CILINDRO_UNIDAD = new CylinderGeometry(0.5, 0.5, 1, 16);

/** Muchas instancias de una geometría con un solo material, en una única llamada de dibujo. */
export function Cajas({
  cajas,
  material,
  geometria = CAJA_UNIDAD,
  sombras = false,
}: {
  cajas: Caja[];
  material: Material;
  geometria?: BufferGeometry;
  sombras?: boolean;
}) {
  const ref = useRef<InstancedMesh>(null);
  const datos = useMemo(() => cajas, [cajas]);

  useLayoutEffect(() => {
    const malla = ref.current!;
    const m = new Matrix4();
    const identidad = new Quaternion();
    datos.forEach((c, i) => {
      m.compose(new Vector3(...c.posicion), c.rotacion ?? identidad, new Vector3(...c.tamano));
      malla.setMatrixAt(i, m);
      if (c.color) malla.setColorAt(i, c.color);
    });
    malla.instanceMatrix.needsUpdate = true;
    if (malla.instanceColor) malla.instanceColor.needsUpdate = true;
    malla.computeBoundingSphere();
  }, [datos]);

  return <instancedMesh ref={ref} args={[geometria, material, datos.length]} castShadow={sombras} receiveShadow={sombras} />;
}
