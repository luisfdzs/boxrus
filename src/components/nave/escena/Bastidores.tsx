import { useMemo } from 'react';
import { BASTIDORES, ESTRUCTURA, PERAS, sacosBastidorZ } from '../../../datos/nave';
import { CILINDRO_UNIDAD, Cajas, barra, type Caja } from './Cajas';
import { MATERIALES } from './materiales';

function piezas() {
  const acero: Caja[] = [];
  const plataformas: Caja[] = [];
  const peras: Caja[] = [];
  const cuerdas: Caja[] = [];
  const { alto, seccion: s } = BASTIDORES;
  const zs = sacosBastidorZ();
  const z0 = Math.max(...zs);
  const z1 = Math.min(...zs);

  for (const lado of [-1, 1]) {
    const xViga = lado * BASTIDORES.x;
    const xPoste = lado * BASTIDORES.xPostes;
    acero.push(barra([xViga, alto, z0 + 0.3], [xViga, alto, z1 - 0.3], s));
    for (let z = z0; z >= z1 - 1e-6; z -= BASTIDORES.separacionPostes) {
      acero.push({ posicion: [xPoste, alto / 2, z], tamano: [s, alto, s] });
      acero.push(barra([xPoste, alto, z], [xViga, alto, z], s));
    }

    // Peras de velocidad en los extremos: plataforma, soporte al muro y pera.
    const { plataforma, pera, loca } = PERAS;
    for (const z of [z0 + plataforma.separacionExtremo, z1 - plataforma.separacionExtremo]) {
      const x = lado * plataforma.x;
      plataformas.push({ posicion: [x, plataforma.y, z], tamano: [plataforma.radio * 2, 0.05, plataforma.radio * 2] });
      acero.push(barra([x, plataforma.y + 0.1, z], [lado * (BASTIDORES.xPostes + 0.3), plataforma.y + 0.1, z], 0.06));
      peras.push({ posicion: [x, plataforma.y - 0.2, z], tamano: [pera.radio * 2, 0.3, pera.radio * 2] });
    }

    // Pera loca: cuerda de suelo a cordón inferior y bola.
    const zLoca = z0 + plataforma.separacionExtremo + loca.separacion;
    const xLoca = lado * loca.x;
    cuerdas.push({ posicion: [xLoca, ESTRUCTURA.cordonInferior / 2, zLoca], tamano: [0.015, ESTRUCTURA.cordonInferior, 0.015] });
    peras.push({ posicion: [xLoca, loca.y, zLoca], tamano: [loca.radio * 2, loca.radio * 2.4, loca.radio * 2] });
  }
  return { acero, plataformas, peras, cuerdas };
}

export function Bastidores() {
  const { acero, plataformas, peras, cuerdas } = useMemo(piezas, []);
  return (
    <group>
      <Cajas cajas={acero} material={MATERIALES.acero} sombras />
      <Cajas cajas={plataformas} material={MATERIALES.acero} geometria={CILINDRO_UNIDAD} />
      <Cajas cajas={peras} material={MATERIALES.saco} geometria={CILINDRO_UNIDAD} />
      <Cajas cajas={cuerdas} material={MATERIALES.cadena} />
    </group>
  );
}
