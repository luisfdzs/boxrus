import { useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import { PerspectiveCamera, Vector3 } from 'three';
import { RECORRIDO } from '../../../datos/paradas';
import { leerModo } from '../../../lib/modo';
import { progreso } from '../../../lib/progreso';
import { crearTrayectoria, focalAFov, type Pose, type Variante } from '../../../lib/trayectoria';

export const varianteParaAspecto = (aspecto: number): Variante => (aspecto < RECORRIDO.aspectoMovil ? 'movil' : 'escritorio');

/** Coloca la cámara según el progreso del scroll, leído en cada fotograma. */
export function ControladorCamara({ alPrimerFotograma }: { alPrimerFotograma?: () => void }) {
  const camara = useThree((s) => s.camera) as PerspectiveCamera;
  const aspecto = useThree((s) => s.size.width / s.size.height);
  const variante = varianteParaAspecto(aspecto);
  const trayectoria = useMemo(() => crearTrayectoria(variante), [variante]);
  const pose = useMemo<Pose>(() => ({ posicion: new Vector3(), mira: new Vector3(), fov: 50 }), []);
  const estado = useMemo(() => ({ fotogramas: 0 }), []);
  // ?camara=…: encuadre fijo (fotos de la galería) en lugar del recorrido.
  const fija = useMemo(() => leerModo().camara, []);

  useFrame(() => {
    if (fija) {
      pose.posicion.set(...fija.posicion);
      pose.mira.set(...fija.mira);
      pose.fov = focalAFov(fija.focal);
    } else trayectoria.evaluar(progreso.valor, pose);
    camara.position.copy(pose.posicion);
    camara.lookAt(pose.mira);
    if (Math.abs(camara.fov - pose.fov) > 1e-3) {
      camara.fov = pose.fov;
      camara.updateProjectionMatrix();
    }
    if (++estado.fotogramas === 3) alPrimerFotograma?.();
  });

  return null;
}
