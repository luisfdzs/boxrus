import { useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, Noise, SSAO, ToneMapping, Vignette } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { useRef } from 'react';
import { LUZ } from '../../../datos/luz';

const { ao, bloom, vineteado, grano } = LUZ.postproceso;

/**
 * Postproceso (docs/03, punto 5). Va en un trozo diferido (import dinámico en
 * Nave.tsx): no cuenta en los 350 KB de la isla inicial (decisión de Luis, docs/09).
 * Orden: oclusión ambiental en pantalla (SSAO, con el pase de normales: contacto de sacos,
 * jaula y pilares),
 * bloom selectivo por umbral (fluorescentes, ventanales, dígitos), mapeo tonal AgX
 * (el compositor desactiva el del renderizador), viñeteado y grano.
 */
export default function Postproceso({ alListo }: { alListo?: () => void }) {
  const fotogramas = useRef(0);
  useFrame(() => {
    if (++fotogramas.current === 3) alListo?.();
  });

  return (
    <EffectComposer multisampling={4} enableNormalPass>
      <SSAO
        samples={ao.muestras}
        radius={ao.radio}
        intensity={ao.intensidad}
        luminanceInfluence={ao.luminancia}
        worldDistanceThreshold={ao.distancia}
        worldDistanceFalloff={ao.caidaDistancia}
        worldProximityThreshold={ao.proximidad}
        worldProximityFalloff={ao.caidaProximidad}
      />

      <Bloom mipmapBlur luminanceThreshold={bloom.umbral} luminanceSmoothing={bloom.suavidad} intensity={bloom.intensidad} radius={bloom.radio} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette offset={vineteado.desplazamiento} darkness={vineteado.oscuridad} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={grano.opacidad} />
    </EffectComposer>
  );
}
