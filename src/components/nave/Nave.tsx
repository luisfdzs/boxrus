import { Canvas } from '@react-three/fiber';
import { Suspense, lazy, useCallback } from 'react';
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
import { Entorno } from './luz/Entorno';
import { IluminacionMaqueta } from './luz/IluminacionMaqueta';

const Depuracion = lazy(() => import('./depuracion/Depuracion').then((m) => ({ default: m.Depuracion })));

/** Isla 3D: la nave en bloques (fase 1) y la cámara del recorrido. */
export default function Nave() {
  const modo = leerModo();
  // Señal para las capturas: la cámara ya está colocada y hay fotogramas pintados.
  const marcarLista = useCallback(() => {
    document.documentElement.dataset.naveLista = 'si';
  }, []);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ near: 0.05, far: 120, fov: 50 }}
      gl={{ antialias: true, preserveDrawingBuffer: modo.captura }}
      aria-hidden="true"
    >
      <color attach="background" args={['#0d0e10']} />
      {/* Todo espera a las texturas: ni se pinta a medias ni se marca «lista» antes de tiempo. */}
      <Suspense fallback={null}>
        <TexturasNave />
        <Entorno />
        <IluminacionMaqueta />
        <Envolvente />
        <Estructura />
        <Fluorescentes />
        <Jaula />
        <Sacos animar={!modo.captura} />
        <Bastidores />
        <Marcador />
        <Detalles />
        <ControladorCamara alPrimerFotograma={marcarLista} />
      </Suspense>
      {modo.depuracion && (
        <Suspense fallback={null}>
          <Depuracion />
        </Suspense>
      )}
    </Canvas>
  );
}
