import { useMemo } from 'react';
import { FLUORESCENTES, regletasFilas, regletasRefuerzo } from '../../../datos/nave';
import { Cajas, type Caja } from './Cajas';
import { MATERIALES } from './materiales';

function regletas(): Caja[] {
  const { largo, ancho, alto, y } = FLUORESCENTES;
  const filas = regletasFilas().map(([x, z]): Caja => ({ posicion: [x, y, z], tamano: [ancho, alto, largo] }));
  const refuerzo = regletasRefuerzo().map(
    (r): Caja => ({
      posicion: [r.x, FLUORESCENTES.refuerzoJaula.y, r.z],
      tamano: r.aLoLargoX ? [largo, alto, ancho] : [ancho, alto, largo],
    }),
  );
  return [...filas, ...refuerzo];
}

export function Fluorescentes() {
  const lista = useMemo(regletas, []);
  return <Cajas cajas={lista} material={MATERIALES.fluorescente} />;
}
