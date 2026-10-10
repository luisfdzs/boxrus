// Luz neutra para leer volúmenes en la maqueta en bloques (fase 1).
// La iluminación definitiva (sol, fluorescentes, entorno) es de la fase 3.
import { ENVOLVENTE } from '../../../datos/nave';

export function IluminacionMaqueta() {
  return (
    <group>
      <hemisphereLight args={['#dfe8f2', '#2a2622', 1.1]} />
      <ambientLight intensity={0.25} />
      {/* Luz natural desde los ventanales del fondo, hacia +Z y hacia abajo. */}
      <directionalLight position={[6, 16, ENVOLVENTE.zFondo - 10]} intensity={1.4} color="#fff4e2" />
      <directionalLight position={[-4, 10, ENVOLVENTE.zFrente + 6]} intensity={0.35} color="#e6f2ff" />
    </group>
  );
}
