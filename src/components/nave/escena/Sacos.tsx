import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Euler, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';
import { BASTIDORES, SACOS, sacosBastidorZ } from '../../../datos/nave';
import { crearAzar } from '../../../lib/azar';
import { CILINDRO_UNIDAD } from './Cajas';
import { MATERIALES } from './materiales';

interface Saco {
  x: number;
  z: number;
  /** Punto de cuelgue: el saco y su cadena giran alrededor de él. */
  yCuelgue: number;
  fase: number;
  frecuencia: number;
  rumbo: number;
}

function sacos(): Saco[] {
  const azar = crearAzar(SACOS.semillaBalanceo);
  const nuevo = (x: number, z: number, yCuelgue: number): Saco => ({
    x,
    z,
    yCuelgue,
    fase: azar() * Math.PI * 2,
    frecuencia: 0.35 + azar() * 0.2,
    rumbo: azar() * Math.PI,
  });
  return [
    ...SACOS.protagonistas.posiciones.map(([x, z]) => nuevo(x, z, SACOS.protagonistas.yViga)),
    ...[-1, 1].flatMap((lado) => sacosBastidorZ().map((z) => nuevo(lado * BASTIDORES.x, z, BASTIDORES.alto))),
  ];
}

const techoSaco = SACOS.base + SACOS.alto;

export function Sacos({ animar }: { animar: boolean }) {
  const lista = useMemo(sacos, []);
  const refSacos = useRef<InstancedMesh>(null);
  const refCadenas = useRef<InstancedMesh>(null);

  const colocar = useMemo(() => {
    const m = new Matrix4();
    const q = new Quaternion();
    const e = new Euler();
    const pivote = new Vector3();
    const desplazamiento = new Vector3();
    const escala = new Vector3();
    const d = SACOS.radio * 2;
    const dc = SACOS.radioCadena * 2;
    return (tiempo: number) => {
      lista.forEach((s, i) => {
        const angulo = animar ? SACOS.balanceo * Math.sin(tiempo * s.frecuencia * Math.PI * 2 + s.fase) : 0;
        q.setFromEuler(e.set(angulo * Math.cos(s.rumbo), 0, angulo * Math.sin(s.rumbo)));
        pivote.set(s.x, s.yCuelgue, s.z);

        desplazamiento.set(0, SACOS.base + SACOS.alto / 2 - s.yCuelgue, 0).applyQuaternion(q);
        m.compose(desplazamiento.add(pivote), q, escala.set(d, SACOS.alto, d));
        refSacos.current!.setMatrixAt(i, m);

        const largo = s.yCuelgue - techoSaco;
        desplazamiento.set(0, -largo / 2, 0).applyQuaternion(q);
        m.compose(desplazamiento.add(pivote), q, escala.set(dc, largo, dc));
        refCadenas.current!.setMatrixAt(i, m);
      });
      refSacos.current!.instanceMatrix.needsUpdate = true;
      refCadenas.current!.instanceMatrix.needsUpdate = true;
    };
  }, [lista, animar]);

  useLayoutEffect(() => {
    colocar(0);
    refSacos.current!.computeBoundingSphere();
    refCadenas.current!.computeBoundingSphere();
  }, [colocar]);

  useFrame(({ clock }) => {
    if (animar) colocar(clock.elapsedTime);
  });

  return (
    <group>
      <instancedMesh ref={refSacos} args={[CILINDRO_UNIDAD, MATERIALES.saco, lista.length]} castShadow receiveShadow />
      <instancedMesh ref={refCadenas} args={[CILINDRO_UNIDAD, MATERIALES.cadena, lista.length]} />
    </group>
  );
}
