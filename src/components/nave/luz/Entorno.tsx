import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { CubeCamera, HalfFloatType, PMREMGenerator, WebGLCubeRenderTarget, type MeshStandardMaterial, type WebGLRenderTarget } from 'three';
import { LUZ } from '../../../datos/luz';
import { MATERIALES } from '../escena/materiales';

/**
 * Mapa de entorno capturado de la propia nave (LUZ.entorno): en el primer
 * fotograma, ya con texturas e instancias colocadas, una cámara cúbica pinta la
 * escena desde encima de la jaula y el resultado pasa a PMREM. Así los reflejos
 * del tatami, el cuero y la malla son los fluorescentes, ventanales y ladrillo de
 * la nave, no los de un almacén ajeno. No se pinta de fondo: la nave es cerrada.
 * Va dentro del Suspense de la escena: se monta cuando ya está todo cargado.
 */
export function Entorno() {
  const gl = useThree((s) => s.gl);
  const escena = useThree((s) => s.scene);
  const mapa = useRef<WebGLRenderTarget | null>(null);

  // Prioridad por defecto: corre antes del render del fotograma, que ya sale con el entorno.
  useFrame(() => {
    if (mapa.current) return;
    const { posicion, resolucion, intensidad, materiales } = LUZ.entorno;
    const cubo = new WebGLCubeRenderTarget(resolucion, { type: HalfFloatType });
    const camara = new CubeCamera(0.05, 120, cubo);
    camara.position.set(...posicion);
    camara.update(gl, escena);
    const pmrem = new PMREMGenerator(gl);
    mapa.current = pmrem.fromCubemap(cubo.texture);
    pmrem.dispose();
    cubo.dispose();

    const textura = mapa.current.texture;
    escena.environment = textura;
    escena.environmentIntensity = intensidad;
    // Con el entorno de la escena, three usa su intensidad general; para afinar por material hay que darle su envMap.
    const lista = MATERIALES as Record<string, MeshStandardMaterial>;
    for (const [nombre, k] of Object.entries(materiales)) {
      const m = lista[nombre];
      if (!m) continue;
      m.envMap = textura;
      m.envMapIntensity = k;
      m.needsUpdate = true;
    }
  });

  useEffect(
    () => () => {
      escena.environment = null;
      for (const m of Object.values(MATERIALES)) if (m.envMap === mapa.current?.texture) m.envMap = null;
      mapa.current?.dispose();
      mapa.current = null;
    },
    [escena],
  );

  return null;
}
