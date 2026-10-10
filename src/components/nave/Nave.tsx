import { Canvas } from '@react-three/fiber';
import { Suspense, lazy, useCallback, useRef } from 'react';
import { AgXToneMapping, PCFShadowMap } from 'three';
import { LUZ } from '../../datos/luz';
import { leerModo } from '../../lib/modo';
import { ControladorCamara } from './camara/ControladorCamara';
import { Bastidores } from './escena/Bastidores';
import { Detalles } from './escena/Detalles';
import { Envolvente } from './escena/Envolvente';
import { Estructura } from './escena/Estructura';
import { Fluorescentes } from './escena/Fluorescentes';
import { Jaula } from './escena/Jaula';
import { Marcador } from './escena/Marcador';
import { Sacos } from './escena/Sacos';
import { TexturasNave } from './escena/TexturasNave';
import { Atmosfera } from './luz/Atmosfera';
import { Entorno } from './luz/Entorno';
import { Iluminacion } from './luz/Iluminacion';

const Exportar = lazy(() => import('./depuracion/Exportar').then((m) => ({ default: m.Exportar })));
// Postproceso en un trozo diferido: no cuenta en los 350 KB de la isla inicial (docs/06 y 09).
const Postproceso = lazy(() => import('./luz/Postproceso'));
const Depuracion = lazy(() => import('./depuracion/Depuracion').then((m) => ({ default: m.Depuracion })));

/** Isla 3D: la nave, su luz y la cámara del recorrido. */
export default function Nave() {
  const modo = leerModo();
  // Señal para las capturas: la cámara ya está colocada, hay fotogramas pintados
  // y el postproceso (que llega después, en su trozo) ya está activo.
  const pendientes = useRef(new Set(['camara', 'postproceso']));
  const marcar = useCallback((pieza: string) => {
    pendientes.current.delete(pieza);
    if (!pendientes.current.size) document.documentElement.dataset.naveLista = 'si';
  }, []);
  const camaraLista = useCallback(() => marcar('camara'), [marcar]);
  const postprocesoListo = useCallback(() => marcar('postproceso'), [marcar]);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ near: 0.05, far: 120, fov: 50 }}
      shadows={{ type: PCFShadowMap }}
      gl={{ antialias: true, preserveDrawingBuffer: modo.captura, toneMapping: AgXToneMapping, toneMappingExposure: LUZ.exposicion }}
      aria-hidden="true"
    >
      <color attach="background" args={['#0d0e10']} />
      {/* Todo espera a las texturas: ni se pinta a medias ni se marca «lista» antes de tiempo. */}
      <Suspense fallback={null}>
        <TexturasNave />
        <Entorno />
        <Iluminacion />
        <Envolvente />
        <Estructura />
        <Fluorescentes />
        <Jaula />
        <Sacos animar={!modo.captura} />
        <Bastidores />
        <Marcador />
        <Detalles />
        <Atmosfera animar={!modo.captura} />
        <ControladorCamara alPrimerFotograma={camaraLista} />
      </Suspense>
      <Suspense fallback={null}>
        <Postproceso alListo={postprocesoListo} />
      </Suspense>
      {modo.exportar && (
        <Suspense fallback={null}>
          <Exportar />
        </Suspense>
      )}
      {modo.depuracion && (
        <Suspense fallback={null}>
          <Depuracion />
        </Suspense>
      )}
    </Canvas>
  );
}
