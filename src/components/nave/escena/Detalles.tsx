// Detalles de vida (docs/03): seis objetos sueltos hechos con primitivas, en
// cinco mallas fusionadas con color por vértice (cinco llamadas de dibujo como
// máximo; cada grupo está en un sitio, así que el recorte por vista descarta los
// que no se ven). Geometría y posiciones en lib/detalles.ts y datos/nave.ts.
import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { crearDetalles, type Acabado } from '../../../lib/detalles';

// Provisionales, como los de materiales.ts: el color lo pone cada vértice.
const MATERIALES_DETALLES: Record<Acabado, MeshStandardMaterial> = {
  mate: new MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 }),
  satinado: new MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0 }),
};

export function Detalles() {
  const grupos = useMemo(crearDetalles, []);
  useEffect(() => () => grupos.forEach((g) => g.geometria.dispose()), [grupos]);

  return (
    <group>
      {grupos.map((g) => (
        <mesh
          key={g.grupo}
          name={`detalles-${g.grupo}`}
          geometry={g.geometria}
          material={MATERIALES_DETALLES[g.acabado]}
          castShadow={g.sombras}
          receiveShadow={g.sombras}
        />
      ))}
    </group>
  );
}
