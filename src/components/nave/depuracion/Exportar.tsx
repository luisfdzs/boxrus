import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { BufferGeometry, Color, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, Scene, type Material } from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { LUZ } from '../../../datos/luz';
import { ENVOLVENTE, FLUORESCENTES } from '../../../datos/nave';

/** Materiales que no se exportan para hornear: transparentes o sin peso en la luz rebotada. */
const EXCLUIDOS = new Set(['malla']);

/** Dirección del receptor local (herramientas/blender/recibir.mjs). */
const RECEPTOR = 'http://localhost:4400/';

/**
 * ?exportar=1 (solo para hornear la luz, docs/03): fusiona la geometría de la
 * escena por material, con las transformaciones aplicadas, y la envía como .glb
 * al receptor local junto con los parámetros de luz que necesita Blender.
 */
export function Exportar() {
  const escena = useThree((s) => s.scene);

  useEffect(() => {
    // Espera a que la escena esté completa (texturas, instancias colocadas).
    const id = setTimeout(async () => {
      escena.updateMatrixWorld(true);
      const grupos = new Map<string, { material: Material; geometrias: BufferGeometry[] }>();
      const m = new Matrix4();
      const anadir = (nombre: string, material: Material, geometria: BufferGeometry, matriz: Matrix4) => {
        const g = new BufferGeometry();
        g.setAttribute('position', geometria.getAttribute('position').clone());
        g.setAttribute('normal', geometria.getAttribute('normal').clone());
        if (geometria.index) g.setIndex(geometria.index.clone());
        g.applyMatrix4(matriz);
        const grupo = grupos.get(nombre) ?? { material, geometrias: [] };
        grupo.geometrias.push(g.index ? g.toNonIndexed() : g);
        grupos.set(nombre, grupo);
      };
      escena.traverse((o) => {
        if (!(o instanceof Mesh) || Array.isArray(o.material)) return;
        const material = o.material as Material;
        const nombre = material.name || 'otros';
        if (EXCLUIDOS.has(nombre)) return;
        if (o instanceof InstancedMesh) {
          for (let i = 0; i < o.count; i++) {
            o.getMatrixAt(i, m);
            anadir(nombre, material, o.geometry, m.premultiply(o.matrixWorld).clone());
          }
        } else anadir(nombre, material, o.geometry, o.matrixWorld);
      });

      const salida = new Scene();
      for (const [nombre, { material, geometrias }] of grupos) {
        const original = material as MeshStandardMaterial;
        const plano = new MeshStandardMaterial({
          name: nombre,
          color: original.color ?? new Color('#808080'),
          emissive: original.emissive ?? new Color('#000000'),
          emissiveIntensity: original.emissiveIntensity ?? 0,
        });
        const malla = new Mesh(mergeGeometries(geometrias), plano);
        malla.name = nombre;
        salida.add(malla);
      }

      const glb = (await new GLTFExporter().parseAsync(salida, { binary: true })) as ArrayBuffer;
      const parametros = { luz: LUZ, envolvente: ENVOLVENTE, fluorescentes: FLUORESCENTES };
      await fetch(`${RECEPTOR}nave.glb`, { method: 'POST', body: glb });
      await fetch(`${RECEPTOR}parametros.json`, { method: 'POST', body: JSON.stringify(parametros, null, 2) });
      document.documentElement.dataset.naveExportada = String(glb.byteLength);
    }, 1500);
    return () => clearTimeout(id);
  }, [escena]);

  return null;
}
