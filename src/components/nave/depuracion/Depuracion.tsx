import { Line, Stats } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { RECORRIDO } from '../../../datos/paradas';
import { comprobarColisiones } from '../../../lib/colisiones';
import { crearTrayectoria } from '../../../lib/trayectoria';
import { varianteParaAspecto } from '../camara/ControladorCamara';

/** ?depuracion=1: trayectoria, ejes, FPS y avisos de colisión. */
export function Depuracion() {
  const aspecto = useThree((s) => s.size.width / s.size.height);
  const gl = useThree((s) => s.gl);
  // Llamadas de dibujo y triángulos del último fotograma completo (sombras, SSAO,
  // escena y postproceso), para medir desde la consola. Con el reinicio automático,
  // `gl.info` solo contaba la última pasada del postproceso (1 llamada).
  const ultimo = useMemo(() => ({ calls: 0, triangles: 0 }), []);
  useEffect(() => {
    gl.info.autoReset = false;
    (window as unknown as { naveRender: typeof ultimo }).naveRender = ultimo;
    return () => void (gl.info.autoReset = true);
  }, [gl, ultimo]);
  // Prioridad negativa: corre antes que el resto de pasadas del fotograma.
  useFrame(() => {
    ultimo.calls = gl.info.render.calls;
    ultimo.triangles = gl.info.render.triangles;
    gl.info.reset();
  }, -1);
  const variante = varianteParaAspecto(aspecto);
  const { posiciones, miras, colisiones } = useMemo(() => {
    const t = crearTrayectoria(variante);
    const n = 800;
    const muestras = Array.from({ length: n + 1 }, (_, i) => t.evaluar(i / n));
    const colisiones = comprobarColisiones((p) => t.evaluar(p).posicion, RECORRIDO.margenColision);
    if (colisiones.length) console.warn(`[nave] ${colisiones.length} muestras de cámara a menos de ${RECORRIDO.margenColision} m`, colisiones);
    return {
      posiciones: muestras.map((m) => m.posicion.toArray()),
      miras: muestras.map((m) => m.mira.toArray()),
      colisiones,
    };
  }, [variante]);

  return (
    <group>
      <Line points={posiciones} color="#ffcc00" lineWidth={2} />
      <Line points={miras} color="#00d0ff" lineWidth={1} dashed dashSize={0.3} gapSize={0.2} />
      {colisiones.map((c, i) => (
        <mesh key={i} position={[c.punto.x, c.punto.y, c.punto.z]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color="#ff0033" />
        </mesh>
      ))}
      <axesHelper args={[3]} />
      <Stats />
    </group>
  );
}
