// Materiales provisionales de la maqueta en bloques (fase 1): grises que
// separan volúmenes. Los definitivos son de la fase 3 (luz-y-materiales).
import { DoubleSide, MeshStandardMaterial } from 'three';

const gris = (color: string, extra: ConstructorParameters<typeof MeshStandardMaterial>[0] = {}) =>
  new MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...extra });

export const MATERIALES = {
  muro: gris('#8c8784'),
  hormigon: gris('#9a9a98', { roughness: 0.6 }),
  juntaTatami: gris('#141516'),
  tatami: gris('#ffffff', { roughness: 0.55 }),
  acero: gris('#2c2e31', { roughness: 0.7 }),
  correa: gris('#5a504d'),
  chapa: gris('#6f7377', { side: DoubleSide }),
  porton: gris('#4a4d50'),
  lona: gris('#4b4c4e'),
  faldon: gris('#18191a'),
  acolchado: gris('#1f2022'),
  malla: gris('#9aa0a6', { transparent: true, opacity: 0.28, side: DoubleSide, depthWrite: false }),
  saco: gris('#2b2b2d', { roughness: 0.6 }),
  cadena: gris('#6d7175', { metalness: 0.6, roughness: 0.4 }),
  vidrio: new MeshStandardMaterial({ color: '#000000', emissive: '#fff4e2', emissiveIntensity: 1.6 }),
  fluorescente: new MeshStandardMaterial({ color: '#000000', emissive: '#e6f2ff', emissiveIntensity: 2.2 }),
} as const;
