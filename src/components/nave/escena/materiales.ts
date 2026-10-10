// Materiales de la nave (fase 3, paleta de docs/02), con sus texturas por
// código (malla, chapa, tatami, cuero) o externas en .ktx2 (ladrillo, hormigón,
// relieve del caucho; ver TexturasNave).
import {
  ClampToEdgeWrapping,
  Color,
  DataTexture,
  DoubleSide,
  FrontSide,
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
import { CUERO, LONA, TEXTURAS } from '../../../datos/texturas';
import { pixelesChapa, pixelesCuero, pixelesDesgaste, pixelesLona, pixelesMalla } from '../../../lib/texturas';

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
  // En «pared», las caras horizontales (dinteles y alféizares de los huecos) proyectan en XZ: si no, la textura se estira.
  const proyeccion =
    plano === 'suelo' ? 'pMundo.xz' : '(nMundo.y > max(nMundo.x, nMundo.z) ? pMundo.xz : nMundo.x > nMundo.z ? pMundo.zy : pMundo.xy)';
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
 * Ladrillo: saturación y brillo del color y, a distancia (muchas teselas por píxel),
 * relieve apagado y rugosidad 1. Sin esto, la normal de las juntas da chispas especulares.
 */
function ajustarLadrillo(material: MeshStandardMaterial) {
  const { saturacion, brillo, lejania } = TEXTURAS.ladrillo;
  alCompilar(material, 'ladrillo', (shader) => {
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float lejania = 0.0;
        #ifdef USE_MAP
          lejania = smoothstep(${f(lejania[0])}, ${f(lejania[1])}, length(fwidth(vMapUv)));
          diffuseColor.rgb = mix(vec3(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722))), diffuseColor.rgb, ${f(saturacion)});
          diffuseColor.rgb = clamp(diffuseColor.rgb * ${f(brillo)}, 0.0, 1.0);
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
/**
 * Mapa de luz horneado (LUZ.horneado.mapas) con UV proyectadas en el mundo, con
 * las mismas fórmulas que herramientas/blender/hornear.py: suelo y techo en planta;
 * muros desplegados por el perímetro (s) y la altura. El muro de cada caja se
 * elige por el centro de la instancia, no por el vértice (las esquinas son ambiguas).
 * También rebaja el relleno indirecto (hemisferio) en estos materiales, que ya
 * traen en el mapa la luz difusa de la nave.
 */
function usarLuzHorneada(material: MeshStandardMaterial, superficie: 'suelo' | 'techo' | 'muros') {
  const { xMin, xMax, zFrente, zFondo, alturaCumbrera } = ENVOLVENTE;
  const ancho = xMax - xMin;
  const perimetro = 2 * (ancho + PROFUNDIDAD);
  const enPlanta = `vLightMapUv = vec2((pLuz.x - ${f(xMin)}) / ${f(ancho)}, (pLuz.z - ${f(zFondo)}) / ${f(PROFUNDIDAD)});`;
  const enMuros = `
    vec3 cLuz = (mLuz * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vec4 dLuz = abs(vec4(cLuz.x - ${f(xMin)}, cLuz.z - ${f(zFondo)}, cLuz.x - ${f(xMax)}, cLuz.z - ${f(zFrente)}));
    float mLado = min(min(dLuz.x, dLuz.y), min(dLuz.z, dLuz.w));
    float sLuz;
    if (mLado == dLuz.x) sLuz = ${f(zFrente)} - pLuz.z;
    else if (mLado == dLuz.y) sLuz = ${f(PROFUNDIDAD)} + pLuz.x - ${f(xMin)};
    else if (mLado == dLuz.z) sLuz = ${f(PROFUNDIDAD + ancho)} + pLuz.z - ${f(zFondo)};
    else sLuz = ${f(2 * PROFUNDIDAD + ancho)} + ${f(xMax)} - pLuz.x;
    vLightMapUv = vec2(sLuz / ${f(perimetro)}, pLuz.y / ${f(alturaCumbrera)});`;
  alCompilar(material, `luz-${superficie}`, (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <uv_vertex>',
      `#include <uv_vertex>
      #ifdef USE_LIGHTMAP
        #ifdef USE_INSTANCING
          mat4 mLuz = modelMatrix * instanceMatrix;
        #else
          mat4 mLuz = modelMatrix;
        #endif
        vec3 pLuz = (mLuz * vec4(position, 1.0)).xyz;
        ${superficie === 'muros' ? enMuros : enPlanta}
      #endif`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_fragment_maps>',
      `#ifdef USE_LIGHTMAP
        irradiance *= ${f(LUZ.horneado.mapas.relleno)};
      #endif
      #include <lights_fragment_maps>`,
    );
  });
}

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

/**
 * Vidrio de los ventanales (LUZ.vidrio): degradado vertical en cada hoja (frío
 * arriba, cálido abajo), con la altura de la caja unidad instanciada, y variación
 * de brillo entre hojas con el color de cada instancia (ver Envolvente).
 */
function degradarVidrio(material: MeshStandardMaterial) {
  const vec3 = (hexa: string) => {
    const c = new Color(hexa);
    return `vec3(${f(c.r)}, ${f(c.g)}, ${f(c.b)})`;
  };
  const { arriba, abajo } = LUZ.vidrio;
  alCompilar(material, 'vidrio', (shader) => {
    const declarar = 'varying float vAlturaVidrio;\n';
    shader.vertexShader = declarar + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvAlturaVidrio = position.y + 0.5;');
    shader.fragmentShader = declarar + shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
      totalEmissiveRadiance *= mix(${vec3(abajo)}, ${vec3(arriba)}, smoothstep(0.0, 1.0, vAlturaVidrio));
      #ifdef USE_COLOR
        totalEmissiveRadiance *= vColor.rgb;
      #endif`,
    );
  });
}

/**
 * Malla de eslabones vista de lado: los alambres se solapan y tapan más. La
 * cobertura del alfa (media de los mipmaps a distancia) crece con la inclinación
 * de la vista, c' = 1 − (1 − c)^(1/cos θ): de frente la malla deja ver la jaula y
 * en los paños oblicuos se lee como un velo gris, no como un vidrio uniforme.
 */
function espesarMallaDeLado(material: MeshStandardMaterial) {
  alCompilar(material, 'malla-lado', (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `#include <map_fragment>
      float cosVista = max(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.12);
      diffuseColor.a = 1.0 - pow(1.0 - diffuseColor.a, 1.0 / cosVista);`,
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

// Lona: desgaste en la planta del octógono; las UV de la tapa del cilindro ya son una proyección en planta.
const desgasteLona = textura(pixelesLona(LONA.resolucion, LONA.semilla, LONA.intensidad, LONA.marcas), LONA.resolucion, LONA.resolucion);
desgasteLona.wrapS = desgasteLona.wrapT = ClampToEdgeWrapping;

const emisivo = (color: string, intensidad: number, extra: ConstructorParameters<typeof MeshStandardMaterial>[0] = {}) =>
  new MeshStandardMaterial({ color: '#000000', emissive: color, emissiveIntensity: intensidad, ...extra });

export const MATERIALES = {
  // Ladrillo: color, normal y arm llegan con TexturasNave (blanco para no teñir el mapa de color).
  muro: material('#ffffff', { roughness: 1 }),
  // Hormigón pulido: oscurecido y con brillo (Concrete 034 es encofrado claro). Más oscuro desde la
  // exposición 1,8: con #6c6c6a la franja de la entrada salía casi blanca al pie del prólogo en móvil.
  hormigon: material('#4e4f50', { roughness: 0.4 }),
  juntaTatami: material('#15181b'),
  // Tatami satinado: el tono por placa va en el color de cada instancia (Envolvente).
  // El desgaste multiplica la rugosidad (0,86–1): queda en ~0,60–0,70. Algo más que el 0,6 de partida:
  // con menos, el reflejo del sol rasante convertía sus manchas en placas blancas.
  tatami: material('#ffffff', { roughness: 0.7, map: desgaste, roughnessMap: desgaste }),
  // Acero estructural negro mate (pintado, no metálico).
  acero: material('#16181b', { roughness: 0.6 }),
  correa: material('#6e2a22', { roughness: 0.65 }),
  // Chapa galvanizada envejecida: poco metálica, para que tome el gris de su color y no el del entorno.
  chapa: material('#8a9096', {
    side: DoubleSide,
    roughness: 0.5,
    metalness: 0.3,
    normalMap: normalChapa,
    normalScale: new Vector2(1, 1),
  }),
  porton: material('#3a3d40', { roughness: 0.6, metalness: 0.3 }),
  lona: material('#3a3c3f', { roughness: 0.92, map: desgasteLona, roughnessMap: desgasteLona }),
  faldon: material('#121314', { roughness: 0.7 }),
  // Vinilo de los acolchados: negro con algo de brillo.
  acolchado: material('#141517', { roughness: 0.45 }),
  // Malla: acero galvanizado medio mate; a distancia, un velo gris (la cobertura media del alfa ronda el 22 %).
  malla: material('#8a9096', {
    map: texturaMalla,
    transparent: true,
    side: DoubleSide,
    depthWrite: false,
    roughness: 0.55,
    metalness: 0.5,
  }),
  saco: material('#1b1b1d', {
    roughness: CUERO.rugosidad,
    normalMap: normalCuero,
    normalScale: new Vector2(CUERO.escalaNormal, CUERO.escalaNormal),
  }),
  cadena: material('#7a7e83', { metalness: 0.9, roughness: 0.35 }),
  vidrio: emisivo('#ffffff', LUZ.emisivos.vidrio),
  fluorescente: emisivo('#e6f2ff', LUZ.emisivos.fluorescente),
  // Marcador: carcasa negra mate y dígitos LED, encendidos y apagados (estos, apenas visibles tras el frontal ahumado).
  carcasa: material('#0e0f10', { roughness: 0.9 }),
  digito: emisivo('#ff2a1a', LUZ.emisivos.digitos),
  digitoApagado: emisivo('#ff2a1a', LUZ.emisivos.digitosApagados, { color: '#060303', roughness: 0.9 }),
} as const;

// Nombres: los usa ?exportar=1 para reconocer cada material al hornear la luz en Blender.
for (const [nombre, m] of Object.entries(MATERIALES)) m.name = nombre;

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
// Sombra del sol con las caras exteriores de los muros (por defecto three usa las traseras, aquí las
// interiores): con la interior, el suelo a 1–2 cm del pie del muro quedaba por delante de ella con el
// sesgo y se encendía una línea clara a lo largo del muro (parada 3).
MATERIALES.muro.shadowSide = FrontSide;
coserSaco(MATERIALES.saco);
degradarVidrio(MATERIALES.vidrio);
espesarMallaDeLado(MATERIALES.malla);
for (const m of [MATERIALES.tatami, MATERIALES.juntaTatami, MATERIALES.hormigon]) usarLuzHorneada(m, 'suelo');
usarLuzHorneada(MATERIALES.chapa, 'techo');
usarLuzHorneada(MATERIALES.muro, 'muros');
