// Materiales provisionales de la maqueta en bloques (fase 1): grises que
// separan volúmenes. Los definitivos son de la fase 3 (luz-y-materiales).
// Fase 2: malla, chapa y tatami ya llevan sus texturas por código.
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
import { CHAPA, ENVOLVENTE, JAULA, PROFUNDIDAD, SUELO } from '../../../datos/nave';
import { pixelesChapa, pixelesDesgaste, pixelesMalla } from '../../../lib/texturas';

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

// Tatami: desgaste en coordenadas del mundo (las placas son instancias de una caja unidad).
const { semilla, tamano, resolucion: resDesgaste, intensidad } = SUELO.desgaste;
const desgaste = textura(pixelesDesgaste(resDesgaste, semilla, intensidad), resDesgaste, resDesgaste);

function materialTatami() {
  const m = gris('#ffffff', { roughness: 0.7, map: desgaste, roughnessMap: desgaste });
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <uv_vertex>',
      `#include <uv_vertex>
      #ifdef USE_INSTANCING
        vec2 uvMundo = (modelMatrix * instanceMatrix * vec4(position, 1.0)).xz / ${tamano.toFixed(1)};
        vMapUv = uvMundo;
        vRoughnessMapUv = uvMundo;
      #endif`,
    );
  };
  m.customProgramCacheKey = () => 'tatami-uv-mundo';
  return m;
}

export const MATERIALES = {
  muro: gris('#8c8784'),
  hormigon: gris('#9a9a98', { roughness: 0.6 }),
  juntaTatami: gris('#141516'),
  tatami: materialTatami(),
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
  saco: gris('#2b2b2d', { roughness: 0.6 }),
  cadena: gris('#6d7175', { metalness: 0.6, roughness: 0.4 }),
  vidrio: new MeshStandardMaterial({ color: '#000000', emissive: '#fff4e2', emissiveIntensity: 1.6 }),
  fluorescente: new MeshStandardMaterial({ color: '#000000', emissive: '#e6f2ff', emissiveIntensity: 2.2 }),
} as const;
