// Materiales de la nave (fase 3, paleta de docs/02), con sus texturas por
// código (malla, chapa, tatami, cuero) o externas en .ktx2 (ladrillo, hormigón,
// relieve del caucho; ver TexturasNave).
import {
  DataTexture,
  DoubleSide,
  LinearFilter,
  LinearMipmapLinearFilter,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  ShaderChunk,
  Vector2,
  type ColorSpace,
} from 'three';
import { CHAPA, ENVOLVENTE, JAULA, PROFUNDIDAD, SACOS, SUELO } from '../../../datos/nave';
import { LUZ } from '../../../datos/luz';
import { CUERO, TEXTURAS } from '../../../datos/texturas';
import { pixelesChapa, pixelesCuero, pixelesDesgaste, pixelesMalla } from '../../../lib/texturas';

const material = (color: string, extra: ConstructorParameters<typeof MeshStandardMaterial>[0] = {}) =>
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

type Sombreador = Parameters<MeshStandardMaterial['onBeforeCompile']>[0];

/** Encadena una modificación del sombreador a las que ya tenga el material. */
function alCompilar(material: MeshStandardMaterial, clave: string, modificar: (shader: Sombreador) => void) {
  const previo = material.onBeforeCompile;
  const clavePrevia = material.customProgramCacheKey();
  material.onBeforeCompile = (shader, renderer) => {
    previo.call(material, shader, renderer);
    modificar(shader);
  };
  material.customProgramCacheKey = () => `${clavePrevia}|${clave}`;
}

const f = (n: number) => n.toFixed(5);

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
  alCompilar(material, `uv-mundo-${plano}-${JSON.stringify(teselas)}`, (shader) => {
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
  });
}

/**
 * Ladrillo: saturación del color y, a distancia (muchas teselas por píxel), relieve
 * apagado y rugosidad 1. Sin esto, la normal de las juntas da chispas especulares.
 */
function ajustarLadrillo(material: MeshStandardMaterial) {
  const { saturacion, lejania } = TEXTURAS.ladrillo;
  alCompilar(material, 'ladrillo', (shader) => {
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float lejania = 0.0;
        #ifdef USE_MAP
          lejania = smoothstep(${f(lejania[0])}, ${f(lejania[1])}, length(fwidth(vMapUv)));
          diffuseColor.rgb = mix(vec3(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722))), diffuseColor.rgb, ${f(saturacion)});
        #endif`,
      )
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 1.0, lejania);')
      .replace(
        '#include <normal_fragment_maps>',
        ShaderChunk.normal_fragment_maps.replace('mapN.xy *= normalScale;', 'mapN.xy *= normalScale * (1.0 - lejania);'),
      );
  });
}

/**
 * Costuras de los sacos (CUERO.costuras): surcos verticales entre paneles y dos
 * horizontales cerca de los extremos, calculados con las UV del cilindro unidad
 * (u alrededor, v a lo alto). El surco inclina la normal y oscurece una línea fina;
 * a distancia se promedia con fwidth para que no parpadee.
 */
function coserSaco(material: MeshStandardMaterial) {
  const { paneles, arriba, abajo, ancho, profundidad, oscurecer } = CUERO.costuras;
  const perimetro = 2 * Math.PI * SACOS.radio;
  alCompilar(material, 'costuras', (shader) => {
    const declarar = 'varying vec2 vUvSaco;\nvarying float vLateral;\n';
    shader.vertexShader = declarar + shader.vertexShader.replace(
      '#include <uv_vertex>',
      '#include <uv_vertex>\nvUvSaco = uv;\nvLateral = step(abs(normal.y), 0.5);',
    );
    shader.fragmentShader = declarar + shader.fragmentShader
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        // Distancias con signo (m) a la costura vertical más cercana y a las horizontales.
        float dU = (fract(vUvSaco.x * ${f(paneles)} + 0.5) - 0.5) * ${f(perimetro / paneles)};
        float yS = vUvSaco.y * ${f(SACOS.alto)};
        float dArriba = yS - ${f(SACOS.alto - arriba)};
        float dAbajo = yS - ${f(abajo)};
        float dV = abs(dArriba) < abs(dAbajo) ? dArriba : dAbajo;
        float w = ${f(ancho)};
        float aaU = min(1.0, w / max(fwidth(dU), 1e-6));
        float aaV = min(1.0, w / max(fwidth(dV), 1e-6));
        float gU = exp(-dU * dU / (w * w));
        float gV = exp(-dV * dV / (w * w));
        float linea = max(gU * aaU, gV * aaV) * vLateral;
        diffuseColor.rgb *= 1.0 - ${f(oscurecer)} * linea;
        vec2 inclinacion = vec2(dU * gU * aaU * aaU, dV * gV * aaV * aaV) * (-2.0 * ${f(profundidad)} / (w * w)) * vLateral;`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        ShaderChunk.normal_fragment_maps.replace('mapN.xy *= normalScale;', 'mapN.xy *= normalScale;\n\tmapN.xy += inclinacion;'),
      );
  });
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
  muro: material('#ffffff', { roughness: 1 }),
  // Hormigón pulido: oscurecido y con brillo (Concrete 034 es encofrado claro).
  hormigon: material('#6c6c6a', { roughness: 0.4 }),
  juntaTatami: material('#0e0f10'),
  // Tatami satinado: el tono por placa va en el color de cada instancia (Envolvente).
  tatami: material('#ffffff', { roughness: 0.42, map: desgaste, roughnessMap: desgaste }),
  // Acero estructural negro mate (pintado, no metálico).
  acero: material('#16181b', { roughness: 0.6 }),
  correa: material('#6e2a22', { roughness: 0.65 }),
  chapa: material('#8a9096', {
    side: DoubleSide,
    roughness: 0.38,
    metalness: 0.65,
    normalMap: normalChapa,
    normalScale: new Vector2(1, 1),
  }),
  porton: material('#3a3d40', { roughness: 0.6, metalness: 0.3 }),
  lona: material('#3a3c3f', { roughness: 0.92 }),
  faldon: material('#121314', { roughness: 0.7 }),
  // Vinilo de los acolchados: negro con algo de brillo.
  acolchado: material('#141517', { roughness: 0.45 }),
  malla: material('#a7adb3', {
    map: texturaMalla,
    transparent: true,
    side: DoubleSide,
    depthWrite: false,
    roughness: 0.35,
    metalness: 0.85,
  }),
  saco: material('#1b1b1d', { roughness: 0.42, normalMap: normalCuero, normalScale: new Vector2(0.6, 0.6) }),
  cadena: material('#7a7e83', { metalness: 0.9, roughness: 0.35 }),
  vidrio: new MeshStandardMaterial({ color: '#000000', emissive: '#fff4e2', emissiveIntensity: LUZ.emisivos.vidrio }),
  fluorescente: new MeshStandardMaterial({ color: '#000000', emissive: '#e6f2ff', emissiveIntensity: LUZ.emisivos.fluorescente }),
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
ajustarLadrillo(MATERIALES.muro);
coserSaco(MATERIALES.saco);
