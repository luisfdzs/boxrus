import { useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { MARCADOR } from '../../../datos/nave';
import { trazarMarcador } from '../../../lib/marcador';
import { MATERIALES } from './materiales';

/** Triángulos planos (x, y) del frontal a geometría con normal +Z. */
function geometria(triangulos: number[]) {
  const posiciones: number[] = [];
  for (let i = 0; i < triangulos.length; i += 2) posiciones.push(triangulos[i], triangulos[i + 1], 0);
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(posiciones, 3));
  g.setAttribute('normal', new Float32BufferAttribute(posiciones.map((_, i) => (i % 3 === 2 ? 1 : 0)), 3));
  return g;
}

/** Marcador de asaltos: caja negra y dígitos LED de 7 segmentos (encendidos y apagados), mirando a +X. */
export function Marcador() {
  const { encendidos, apagados } = useMemo(() => {
    const { tiempo, asalto } = trazarMarcador(MARCADOR.digitos);
    return {
      encendidos: geometria([...tiempo.encendidos, ...asalto.encendidos]),
      apagados: geometria([...tiempo.apagados, ...asalto.apagados]),
    };
  }, []);
  const [x, y, z] = MARCADOR.centro;
  return (
    <group position={[x, y, z]}>
      <mesh material={MATERIALES.carcasa}>
        <boxGeometry args={[MARCADOR.fondo, MARCADOR.alto, MARCADOR.ancho]} />
      </mesh>
      {/* Frontal hacia +X (hacia la jaula): con el giro, la x del frontal va hacia −Z. */}
      <group position={[MARCADOR.fondo / 2 + 0.002, 0, 0]} rotation-y={Math.PI / 2}>
        <mesh geometry={apagados} material={MATERIALES.digitoApagado} />
        <mesh geometry={encendidos} material={MATERIALES.digito} />
      </group>
    </group>
  );
}
