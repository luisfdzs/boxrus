import { useMemo } from 'react';
import { ENVOLVENTE, ESTRUCTURA, SACOS, alturaCubierta, type Vec3 } from '../../../datos/nave';
import { Cajas, barra, type Caja } from './Cajas';
import { MATERIALES } from './materiales';

const { xMin, xMax, zFrente, zFondo } = ENVOLVENTE;
const { cordonInferior: yc, canto } = ESTRUCTURA;
/** Cara inferior de la chapa menos el canto de las correas. */
const bajoCubierta = (x: number) => alturaCubierta(x) - ESTRUCTURA.correas.seccion - canto / 2;

function cerchas(): Caja[] {
  const barras: Caja[] = [];
  const montantes = ESTRUCTURA.montantesX.flatMap((x) => (x === 0 ? [0] : [-x, x])).sort((a, b) => a - b);
  const nudos = [xMin, ...montantes, xMax];
  for (const z of ESTRUCTURA.porticosZ) {
    const p = (x: number, y: number): Vec3 => [x, y, z];
    barras.push(barra(p(xMin, yc), p(xMax, yc), canto));
    barras.push(barra(p(xMin, bajoCubierta(xMin)), p(0, bajoCubierta(0)), canto));
    barras.push(barra(p(0, bajoCubierta(0)), p(xMax, bajoCubierta(xMax)), canto));
    for (const x of montantes) barras.push(barra(p(x, yc), p(x, bajoCubierta(x)), canto * 0.6));
    // Diagonales en celosía Pratt: bajan hacia el centro.
    nudos.slice(0, -1).forEach((x0, i) => {
      const x1 = nudos[i + 1];
      const [arriba, abajo] = Math.abs(x0) > Math.abs(x1) ? [x0, x1] : [x1, x0];
      barras.push(barra(p(arriba, bajoCubierta(arriba)), p(abajo, yc), canto * 0.5));
    });
  }
  return barras;
}

function correas(): Caja[] {
  const s = ESTRUCTURA.correas.seccion;
  const lista: Caja[] = [];
  for (let x = xMin; x <= xMax + 1e-6; x += ESTRUCTURA.correas.separacion)
    lista.push({ posicion: [x, alturaCubierta(x) - s / 2, (zFrente + zFondo) / 2], tamano: [s, s, zFrente - zFondo] });
  return lista;
}

function pilares(): Caja[] {
  const s = ESTRUCTURA.pilares.seccion;
  return ESTRUCTURA.pilares.x.flatMap((x) =>
    ESTRUCTURA.pilares.z.map((z): Caja => ({ posicion: [x, yc / 2, z], tamano: [s, yc, s] })),
  );
}

/** Vigas auxiliares de los sacos protagonistas, entre los dos primeros pórticos. */
function vigasAuxiliares(): Caja[] {
  const [z0, z1] = ESTRUCTURA.porticosZ;
  return SACOS.protagonistas.posiciones.map(([x]) => barra([x, SACOS.protagonistas.yViga, z0], [x, SACOS.protagonistas.yViga, z1], canto));
}

export function Estructura() {
  const acero = useMemo(() => [...cerchas(), ...pilares(), ...vigasAuxiliares()], []);
  const listaCorreas = useMemo(correas, []);
  return (
    <group>
      <Cajas cajas={acero} material={MATERIALES.acero} sombras />
      <Cajas cajas={listaCorreas} material={MATERIALES.correa} />
    </group>
  );
}
