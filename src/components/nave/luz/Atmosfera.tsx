import { useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, DoubleSide, ShaderMaterial } from 'three';
import { LUZ } from '../../../datos/luz';
import { ENVOLVENTE, FLUORESCENTES, type Vec3 } from '../../../datos/nave';
import { crearAzar } from '../../../lib/azar';
import { hacesDeSol, type Haz } from '../../../lib/haces';

const { niebla, haces: H, polvo: P } = LUZ.atmosfera;

/** Volúmenes de los haces: las cuatro caras laterales de cada prisma, con `avance` 0 en el hueco y 1 al final. */
function geometriaHaces(haces: Haz[]) {
  const posiciones: number[] = [];
  const avances: number[] = [];
  for (const { hueco, fin } of haces) {
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      const quad: [Vec3, number][] = [[hueco[i], 0], [hueco[j], 0], [fin[j], 1], [hueco[i], 0], [fin[j], 1], [fin[i], 1]];
      for (const [p, a] of quad) {
        posiciones.push(...p);
        avances.push(a);
      }
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(posiciones), 3));
  g.setAttribute('avance', new BufferAttribute(new Float32Array(avances), 1));
  g.computeVertexNormals();
  return g;
}

const materialHaces = () =>
  new ShaderMaterial({
    uniforms: {
      color: { value: new Color(H.color) },
      intensidad: { value: H.intensidad },
      caida: { value: H.caida },
      bordes: { value: H.bordes },
      tiempo: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float avance;
      varying float vAvance;
      varying vec3 vNormalV;
      varying vec3 vVista;
      varying vec3 vMundo;
      void main() {
        vAvance = avance;
        vMundo = position;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormalV = normalize(normalMatrix * normal);
        vVista = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 color;
      uniform float intensidad, caida, bordes, tiempo;
      varying float vAvance;
      varying vec3 vNormalV;
      varying vec3 vVista;
      varying vec3 vMundo;
      void main() {
        // Caras degeneradas (esquinas que coinciden al recortar contra un muro) tienen normal nula:
        // sin esta guarda dan NaN y el bloom lo extiende a toda la imagen.
        float ln = length(vNormalV);
        float frente = ln > 1e-4 ? pow(clamp(abs(dot(vNormalV / ln, normalize(vVista))), 0.0, 1.0), bordes) : 0.0;
        // La interpolación puede dejar 1 − avance ligeramente negativo: pow daría NaN.
        float largo = pow(clamp(1.0 - vAvance, 0.0, 1.0), caida) * smoothstep(0.0, 0.06, vAvance);
        float ruido = 0.8 + 0.2 * sin(vMundo.x * 1.7 + vMundo.z * 1.3 + vMundo.y * 2.3 + tiempo * 0.15);
        vec3 c = max(color * intensidad * frente * largo * ruido, 0.0);
        // Un solo píxel NaN se extiende con el bloom a toda la imagen.
        if (any(isnan(c)) || any(isinf(c))) c = vec3(0.0);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
  });

/** Polvo: puntos repartidos con semilla, la mayoría dentro de los haces (más brillantes). */
function geometriaPolvo(haces: Haz[]) {
  const azar = crearAzar(P.semilla);
  const n = P.cantidad;
  const posiciones = new Float32Array(n * 3);
  const fases = new Float32Array(n);
  const brillos = new Float32Array(n);
  const mezcla = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const bilineal = (q: Vec3[], u: number, v: number) => mezcla(mezcla(q[0], q[1], u), mezcla(q[3], q[2], u), v);
  const m = 0.5;
  for (let i = 0; i < n; i++) {
    let p: Vec3;
    if (haces.length && azar() < P.enHaces) {
      const h = haces[Math.floor(azar() * haces.length)];
      const [u, v, t] = [azar(), azar(), azar()];
      p = mezcla(bilineal(h.hueco, u, v), bilineal(h.fin, u, v), t);
      brillos[i] = P.brillo * (1 - t * 0.6);
    } else {
      p = [
        ENVOLVENTE.xMin + m + azar() * (ENVOLVENTE.xMax - ENVOLVENTE.xMin - 2 * m),
        0.3 + azar() * (FLUORESCENTES.y - 0.3),
        ENVOLVENTE.zFondo + m + azar() * (ENVOLVENTE.zFrente - ENVOLVENTE.zFondo - 2 * m),
      ];
      brillos[i] = P.brilloFuera;
    }
    posiciones.set(p, i * 3);
    fases[i] = azar() * Math.PI * 2;
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(posiciones, 3));
  g.setAttribute('fase', new BufferAttribute(fases, 1));
  g.setAttribute('brillo', new BufferAttribute(brillos, 1));
  return g;
}

const materialPolvo = () =>
  new ShaderMaterial({
    uniforms: {
      color: { value: new Color(H.color) },
      tiempo: { value: 0 },
      deriva: { value: P.deriva },
      velocidad: { value: P.velocidad },
      tamano: { value: P.tamano },
      escalaPx: { value: 800 },
      maximoPx: { value: P.maximoPx },
      cerca: { value: P.cerca },
    },
    vertexShader: /* glsl */ `
      attribute float fase;
      attribute float brillo;
      uniform float tiempo, deriva, velocidad, tamano, escalaPx, maximoPx;
      uniform vec2 cerca;
      varying float vBrillo;
      void main() {
        float t = tiempo * velocidad;
        vec3 p = position + deriva * vec3(sin(t + fase), 0.5 * sin(0.7 * t + 1.3 * fase), cos(0.9 * t + fase));
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        float distancia = max(-mvPosition.z, 0.1);
        float px = tamano * escalaPx / distancia;
        // Por debajo de un píxel no se encoge: se atenúa (sin parpadeo). Por arriba, tope de
        // tamano máximo y apagado cerca de la cámara: de cerca parecían copos de nieve.
        gl_PointSize = clamp(px, 1.0, maximoPx);
        vBrillo = brillo * min(px, 1.0) * smoothstep(cerca.x, cerca.y, distancia);
        gl_Position = projectionMatrix * mvPosition;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 color;
      varying float vBrillo;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        vec3 c = max(color * vBrillo * a, 0.0);
        if (any(isnan(c)) || any(isinf(c))) c = vec3(0.0);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

/** Neblina, haces de luz y polvo de la nave. `animar`: falso en ?captura=1 (fotograma fijo). */
export function Atmosfera({ animar }: { animar: boolean }) {
  const { haces, polvo, mHaces, mPolvo } = useMemo(() => {
    const lista = hacesDeSol(LUZ.sol.direccion);
    return { haces: geometriaHaces(lista), polvo: geometriaPolvo(lista), mHaces: materialHaces(), mPolvo: materialPolvo() };
  }, []);
  const camara = useThree((s) => s.camera);
  const alto = useThree((s) => s.size.height);
  const dpr = useThree((s) => s.viewport.dpr);

  useFrame(({ clock }) => {
    const fov = 'fov' in camara ? (camara.fov as number) : 50;
    mPolvo.uniforms.escalaPx.value = (alto * dpr) / (2 * Math.tan((fov * Math.PI) / 360));
    if (!animar) return;
    mPolvo.uniforms.tiempo.value = clock.elapsedTime;
    mHaces.uniforms.tiempo.value = clock.elapsedTime;
  });

  return (
    <group>
      <fogExp2 attach="fog" args={[niebla.color, niebla.densidad]} />
      <mesh geometry={haces} material={mHaces} renderOrder={2} frustumCulled={false} />
      <points geometry={polvo} material={mPolvo} renderOrder={3} frustumCulled={false} />
    </group>
  );
}
