// Materiales provisionales de la maqueta en bloques (fase 1): grises que
// separan volúmenes. Los definitivos son de la fase 3 (luz-y-materiales).
// Fase 2: llevan ya sus texturas, por código (malla, chapa, tatami, cuero) o
// externas en .ktx2 (ladrillo, hormigón, relieve del caucho; ver TexturasNave).
import {
  DataTexture,
  DoubleSide,
  LinearFilter,
  LinearMipmapLinearFilter,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  Vector2,
  type ColorSpace,
} from 'three';
import { CHAPA, ENVOLVENTE, JAULA, PROFUNDIDAD, SACOS, SUELO } from '../../../datos/nave';
import { CUERO, TEXTURAS } from '../../../datos/texturas';
import { pixelesChapa, pixelesCuero, pixelesDesgaste, pixelesMalla } from '../../../lib/texturas';

const gris = (color: string, extra: ConstructorParameters<typeof MeshStandardMaterial>[0] = {}) =>
  new MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...extra });

/** Textura repetible con mipmaps a partir de píxeles RGBA (lado potencia de dos). */
function textura(datos: Uint8Array, ancho: number, alto: number, espacio?: ColorSpace) {
  const t = new DataTexture(datos, ancho, alto);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.magFilter = LinearFilter;
  t.minFilter = LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.anisotropy = 8;
  if (espacio) t.colorSpace = espacio;
  t.needsUpdate = true;
  return t;
}

type Mapa = 'map' | 'normalMap' | 'roughnessMap' | 'aoMap';

/**
 * UV en coordenadas del mundo, en metros divididos por el tamaño de tesela de
 * cada mapa. «suelo» proyecta en XZ; «pared» en ZY o XY según la orientación
 * de la cara. Funciona con instancias (cajas unidad escaladas) y sin ellas.
 */
function usarUvMundo(material: MeshStandardMaterial, plano: 'suelo' | 'pared', teselas: Partial<Record<Mapa, readonly [number, number]>>) {
  const vec2 = ([u, v]: readonly [number, number]) => `vec2(${u.toFixed(4)}, ${v.toFixed(4)})`;
  const varying: Record<Mapa, string> = { map: 'vMapUv', normalMap: 'vNormalMapUv', roughnessMap: 'vRoughnessMapUv', aoMap: 'vAoMapUv' };
  const define: Record<Mapa, string> = { map: 'USE_MAP', normalMap: 'USE_NORMALMAP', roughnessMap: 'USE_ROUGHNESSMAP', aoMap: 'USE_AOMAP' };
  const asignaciones = (Object.entries(teselas) as [Mapa, readonly [number, number]][])
    .map(([m, t]) => `#ifdef ${define[m]}\n ${varying[m]} = uvMundo / ${vec2(t)};\n#endif`)
    .join('\n');
  const proyeccion = plano === 'suelo' ? 'pMundo.xz' : '(nMundo.x > nMundo.z ? pMundo.zy : pMundo.xy)';
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <uv_vertex>',
      `#include <uv_vertex>
      #ifdef USE_INSTANCING
        mat4 mUvMundo = modelMatrix * instanceMatrix;
      #else
        mat4 mUvMundo = modelMatrix;
      #endif
      vec3 pMundo = (mUvMundo * vec4(position, 1.0)).xyz;
      vec3 nMundo = abs(mat3(mUvMundo) * normal);
      vec2 uvMundo = ${proyeccion};
      ${asignaciones}`,
    );
  };
  const clave = `uv-mundo-${plano}-${JSON.stringify(teselas)}`;
  material.customProgramCacheKey = () => clave;
}

// Malla: las UV de la geometría ya van en teselas (una por rombo), ver Jaula.tsx.
const { paso, radioAlambre, resolucion } = JAULA.malla;
const texturaMalla = textura(pixelesMalla(resolucion, radioAlambre / paso), resolucion, resolucion, SRGBColorSpace);

// Chapa: en la cara inferior de la cubierta, V recorre la nave a lo largo de Z.
// Tesela cuadrada de un paso de lado, repetida en los dos ejes (en U, a lo largo de la pendiente).
// Mipmaps propios: la onda se aplana antes de quedar por debajo de unos píxeles en pantalla.
function normalChapaConMipmaps() {
  const niveles = [];
  for (let res = CHAPA.resolucion, n = 0; res >= 1; res /= 2, n++) {
    const relieve = CHAPA.relieveMipmaps[n] ?? 0;
    niveles.push({ data: pixelesChapa(res, (relieve * CHAPA.profundidad) / CHAPA.paso), width: res, height: res });
  }
  const t = textura(niveles[0].data, CHAPA.resolucion, CHAPA.resolucion);
  t.mipmaps = niveles;
  t.generateMipmaps = false;
  return t;
}
const normalChapa = normalChapaConMipmaps();
const anchoFaldon = Math.hypot(ENVOLVENTE.xMax, ENVOLVENTE.alturaCumbrera - ENVOLVENTE.alturaAlero);
normalChapa.repeat.set(anchoFaldon / CHAPA.paso, (PROFUNDIDAD + ENVOLVENTE.grosorMuro) / CHAPA.paso);

// Tatami: desgaste por código (tono y rugosidad) en coordenadas del mundo; el relieve
// del caucho (normalMap) lo asigna TexturasNave al cargar.
const { semilla, tamano, resolucion: resDesgaste, intensidad } = SUELO.desgaste;
const desgaste = textura(pixelesDesgaste(resDesgaste, semilla, intensidad), resDesgaste, resDesgaste);

// Cuero de los sacos: el cilindro unidad lleva UV de 0 a 1; se repite un número entero
// de veces alrededor y a lo alto para que el grano no tenga costura.
const normalCuero = textura(pixelesCuero(CUERO.resolucion, CUERO.semilla, CUERO.relieve), CUERO.resolucion, CUERO.resolucion);
normalCuero.repeat.set(
  Math.max(1, Math.round((2 * Math.PI * SACOS.radio) / CUERO.tamano)),
  Math.max(1, Math.round(SACOS.alto / CUERO.tamano)),
);

export const MATERIALES = {
  // Ladrillo: color, normal y arm llegan con TexturasNave (blanco para no teñir el mapa de color).
  muro: gris('#ffffff', { roughness: 1 }),
  hormigon: gris('#8a8a88', { roughness: 0.7 }),
  juntaTatami: gris('#141516'),
  tatami: gris('#ffffff', { roughness: 0.7, map: desgaste, roughnessMap: desgaste }),
  acero: gris('#2c2e31', { roughness: 0.7 }),
  correa: gris('#5a504d'),
  chapa: gris('#6f7377', { side: DoubleSide, roughness: 0.6, normalMap: normalChapa, normalScale: new Vector2(1, 1) }),
  porton: gris('#4a4d50'),
  lona: gris('#4b4c4e'),
  faldon: gris('#18191a'),
  acolchado: gris('#1f2022'),
  malla: gris('#9aa0a6', {
    map: texturaMalla,
    transparent: true,
    side: DoubleSide,
    depthWrite: false,
    roughness: 0.5,
    metalness: 0.4,
  }),
  saco: gris('#2b2b2d', { roughness: 0.55, normalMap: normalCuero, normalScale: new Vector2(0.6, 0.6) }),
  cadena: gris('#6d7175', { metalness: 0.6, roughness: 0.4 }),
  vidrio: new MeshStandardMaterial({ color: '#000000', emissive: '#fff4e2', emissiveIntensity: 1.6 }),
  fluorescente: new MeshStandardMaterial({ color: '#000000', emissive: '#e6f2ff', emissiveIntensity: 2.2 }),
} as const;

// UV en el mundo. Los mapas que aún no estén asignados se ignoran (#ifdef) hasta que TexturasNave los cargue.
usarUvMundo(MATERIALES.muro, 'pared', {
  map: TEXTURAS.ladrillo.tamano,
  normalMap: TEXTURAS.ladrillo.tamano,
  roughnessMap: TEXTURAS.ladrillo.tamano,
  aoMap: TEXTURAS.ladrillo.tamano,
});
usarUvMundo(MATERIALES.hormigon, 'suelo', {
  map: TEXTURAS.hormigon.tamano,
  normalMap: TEXTURAS.hormigon.tamano,
  roughnessMap: TEXTURAS.hormigon.tamano,
});
usarUvMundo(MATERIALES.tatami, 'suelo', { map: [tamano, tamano], roughnessMap: [tamano, tamano], normalMap: TEXTURAS.caucho.tamano });
