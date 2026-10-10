import { useLoader, useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import { EquirectangularReflectionMapping } from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { LUZ } from '../../../datos/luz';
import { ENTORNO } from '../../../datos/texturas';

/**
 * Mapa de entorno (HDRI alojado en el sitio, docs/07) para los reflejos. No se
 * pinta de fondo: la nave es cerrada. Suspende hasta tenerlo, como las texturas.
 */
export function Entorno() {
  const escena = useThree((s) => s.scene);
  const textura = useLoader(HDRLoader, ENTORNO.fichero);

  useLayoutEffect(() => {
    textura.mapping = EquirectangularReflectionMapping;
    escena.environment = textura;
    escena.environmentIntensity = LUZ.entorno.intensidad;
    escena.environmentRotation.set(0, LUZ.entorno.rotacion, 0);
    return () => {
      escena.environment = null;
    };
  }, [escena, textura]);

  return null;
}
