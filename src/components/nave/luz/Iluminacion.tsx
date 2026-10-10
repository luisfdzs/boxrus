import { useLayoutEffect, useRef } from 'react';
import type { DirectionalLight, SpotLight } from 'three';
import { LUZ } from '../../../datos/luz';

/** Luz de la nave (fase 3): sol por los ventanales, relleno frío y refuerzo de la jaula. */
export function Iluminacion() {
  const sol = useRef<DirectionalLight>(null);
  const foco = useRef<SpotLight>(null);
  const { sol: s, relleno, refuerzoJaula: r } = LUZ;
  const posicionSol = s.objetivo.map((o, i) => o + s.direccion[i] * s.distancia) as [number, number, number];

  useLayoutEffect(() => {
    // Los objetivos de las luces tienen que estar en la escena para que se actualice su matriz.
    for (const luz of [sol.current!, foco.current!]) {
      luz.parent!.add(luz.target);
    }
    sol.current!.target.position.set(...s.objetivo);
    foco.current!.target.position.set(r.posicion[0], 0, r.posicion[2]);
    const camara = sol.current!.shadow.camera;
    camara.left = camara.bottom = -s.sombra.lado;
    camara.right = camara.top = s.sombra.lado;
    camara.near = s.distancia - 45;
    camara.far = s.distancia + 45;
    camara.updateProjectionMatrix();
  }, [s, r]);

  return (
    <group>
      <hemisphereLight args={[relleno.cielo, relleno.suelo, relleno.intensidad]} />
      <directionalLight
        ref={sol}
        position={posicionSol}
        color={s.color}
        intensity={s.intensidad}
        castShadow
        shadow-mapSize={[s.sombra.resolucion, s.sombra.resolucion]}
        shadow-radius={s.sombra.radio}
        shadow-bias={s.sombra.sesgo}
        shadow-normalBias={s.sombra.sesgoNormal}
      />
      <spotLight
        ref={foco}
        position={r.posicion}
        color={r.color}
        intensity={r.intensidad}
        angle={r.angulo}
        penumbra={r.penumbra}
        distance={r.distancia}
        decay={2}
      />
    </group>
  );
}
