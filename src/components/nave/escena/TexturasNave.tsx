import { useLoader, useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import { ClampToEdgeWrapping, RepeatWrapping, type Texture } from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { LUZ } from '../../../datos/luz';
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
// Mapas de luz horneados en Blender (LUZ.horneado.mapas): suelo, techo y muros.
const LUZ_MAPAS = LUZ.horneado.mapas;
const FICHEROS_LUZ = [LUZ_MAPAS.suelo, LUZ_MAPAS.techo, LUZ_MAPAS.muros].map((f) => LUZ_MAPAS.carpeta + f);

/**
 * Carga las texturas externas (.ktx2, transcodificador Basis alojado en el sitio)
 * y las asigna a los materiales. Suspende hasta tenerlas: la escena no se pinta a
 * medias y el modo captura espera a que estén.
 */
export function TexturasNave() {
  const gl = useThree((s) => s.gl);
  const todas = useLoader(KTX2Loader, [...FICHEROS, ...FICHEROS_LUZ], (cargador) => {
    cargador.setTranscoderPath(TEXTURAS.transcodificador).detectSupport(gl);
  }) as Texture[];
  const texturas = todas.slice(0, FICHEROS.length);
  const mapasLuz = todas.slice(FICHEROS.length);

  useLayoutEffect(() => {
    for (const t of texturas) {
      t.wrapS = t.wrapT = RepeatWrapping;
      t.anisotropy = 8;
      t.needsUpdate = true;
    }
    const [lColor, lNormal, lArm, hColor, hNormal, hRugosidad, cNormal] = texturas;

    Object.assign(MATERIALES.muro, { map: lColor, normalMap: lNormal, roughnessMap: lArm, aoMap: lArm });
    MATERIALES.muro.normalScale.setScalar(ladrillo.relieve);
    Object.assign(MATERIALES.hormigon, { map: hColor, normalMap: hNormal, roughnessMap: hRugosidad });
    MATERIALES.hormigon.normalScale.set(0.5, 0.5);
    MATERIALES.tatami.normalMap = cNormal;
    MATERIALES.tatami.normalScale.set(0.5, 0.5);
    for (const m of [MATERIALES.muro, MATERIALES.hormigon, MATERIALES.tatami]) m.needsUpdate = true;

    // Mapas de luz: sin repetir (las UV van de 0 a 1 en toda la nave; ver usarLuzHorneada).
    const [luzSuelo, luzTecho, luzMuros] = mapasLuz;
    const asignar = (mapa: Texture, materiales: typeof MATERIALES.muro[], superficie: keyof typeof LUZ_MAPAS.intensidad) => {
      const intensidad = LUZ_MAPAS.escala * LUZ_MAPAS.intensidad[superficie];
      mapa.wrapS = mapa.wrapT = ClampToEdgeWrapping;
      mapa.needsUpdate = true;
      for (const m of materiales) Object.assign(m, { lightMap: mapa, lightMapIntensity: intensidad, needsUpdate: true });
    };
    asignar(luzSuelo, [MATERIALES.tatami, MATERIALES.juntaTatami, MATERIALES.hormigon], 'suelo');
    asignar(luzTecho, [MATERIALES.chapa], 'techo');
    asignar(luzMuros, [MATERIALES.muro], 'muros');
  }, [todas]);

  return null;
}
