import { useMemo } from 'react';
import { CanvasTexture, MeshStandardMaterial, SRGBColorSpace } from 'three';
import { MARCADOR } from '../../../datos/nave';
import { MATERIALES } from './materiales';

// Provisional (fase 1): dígitos con una fuente monoespaciada del sistema.
// En la fase 3 se sustituye por dígitos LED de 7 segmentos (docs/02).
function texturaDigitos() {
  const lienzo = document.createElement('canvas');
  lienzo.width = 512;
  lienzo.height = Math.round((512 * MARCADOR.alto) / MARCADOR.ancho);
  const ctx = lienzo.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, lienzo.width, lienzo.height);
  ctx.fillStyle = '#ff2a1a';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${lienzo.height * 0.72}px monospace`;
  ctx.fillText('05:00', lienzo.width * 0.06, lienzo.height / 2);
  ctx.font = `bold ${lienzo.height * 0.4}px monospace`;
  ctx.fillText('R1', lienzo.width * 0.76, lienzo.height / 2);
  const textura = new CanvasTexture(lienzo);
  textura.colorSpace = SRGBColorSpace;
  return textura;
}

export function Marcador() {
  const pantalla = useMemo(() => {
    const mapa = texturaDigitos();
    return new MeshStandardMaterial({ color: '#000', emissive: '#ffffff', emissiveMap: mapa, emissiveIntensity: 1.4 });
  }, []);
  const [x, y, z] = MARCADOR.centro;
  return (
    <group position={[x, y, z]}>
      <mesh material={MATERIALES.acolchado}>
        <boxGeometry args={[MARCADOR.fondo, MARCADOR.alto, MARCADOR.ancho]} />
      </mesh>
      {/* Mira a +X, hacia la jaula. */}
      <mesh position={[MARCADOR.fondo / 2 + 0.002, 0, 0]} rotation-y={Math.PI / 2} material={pantalla}>
        <planeGeometry args={[MARCADOR.ancho * 0.94, MARCADOR.alto * 0.86]} />
      </mesh>
    </group>
  );
}
