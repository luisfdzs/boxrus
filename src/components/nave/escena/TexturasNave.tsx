import { useLoader, useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import { RepeatWrapping, type Texture } from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { TEXTURAS } from '../../../datos/texturas';
import { MATERIALES } from './materiales';

const { carpeta, ladrillo, hormigon, caucho } = TEXTURAS;
const FICHEROS = [
  ladrillo.color,
  ladrillo.normal,
  ladrillo.arm,
  hormigon.color,
  hormigon.normal,
  hormigon.rugosidad,
  caucho.normal,
].map((f) => carpeta + f);

/**
 * Carga las texturas externas (.ktx2, transcodificador Basis alojado en el sitio)
 * y las asigna a los materiales. Suspende hasta tenerlas: la escena no se pinta a
 * medias y el modo captura espera a que estén.
 */
export function TexturasNave() {
  const gl = useThree((s) => s.gl);
  const texturas = useLoader(KTX2Loader, FICHEROS, (cargador) => {
    cargador.setTranscoderPath(TEXTURAS.transcodificador).detectSupport(gl);
  }) as Texture[];

  useLayoutEffect(() => {
    for (const t of texturas) {
      t.wrapS = t.wrapT = RepeatWrapping;
      t.anisotropy = 8;
      t.needsUpdate = true;
    }
    const [lColor, lNormal, lArm, hColor, hNormal, hRugosidad, cNormal] = texturas;

    Object.assign(MATERIALES.muro, { map: lColor, normalMap: lNormal, roughnessMap: lArm, aoMap: lArm });
    Object.assign(MATERIALES.hormigon, { map: hColor, normalMap: hNormal, roughnessMap: hRugosidad });
    MATERIALES.hormigon.normalScale.set(0.5, 0.5);
    MATERIALES.tatami.normalMap = cNormal;
    MATERIALES.tatami.normalScale.set(0.5, 0.5);
    for (const m of [MATERIALES.muro, MATERIALES.hormigon, MATERIALES.tatami]) m.needsUpdate = true;
  }, [texturas]);

  return null;
}
