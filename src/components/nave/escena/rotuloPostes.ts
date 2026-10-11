// Textura del rótulo BOXRUS de los postes (JAULA.rotulo), pintada en un lienzo:
// sin fuentes nuevas ni Text de drei. Una sola textura para los 8 postes, en el
// material del acolchado de los postes (ver disposicionRotulo en lib/rotulo.ts).
import { CanvasTexture, ClampToEdgeWrapping, RepeatWrapping, SRGBColorSpace } from 'three';
import { JAULA } from '../../../datos/nave';
import { cuerpoRotulo, disposicionRotulo } from '../../../lib/rotulo';
import { MATERIALES } from './materiales';

const r = JAULA.rotulo;
/** Cuerpo con el que se mide el texto antes de escalarlo. */
const CUERPO_MEDIDA = 100;

let listo: Promise<void> | undefined;

/**
 * Pinta el rótulo una sola vez y lo asigna a MATERIALES.acolchadoPoste. Jaula
 * suspende con esta promesa: la escena (y la señal de captura) espera a que esté.
 */
export const prepararRotulo = (): Promise<void> => (listo ??= pintar());

async function pintar() {
  // Anton la carga ya la página para los titulares; se espera a que esté (con tope)
  // para no pintar con la de respaldo si aún no había llegado.
  const espera = new Promise((resolver) => setTimeout(resolver, r.esperaFuente));
  await Promise.race([document.fonts.load(`${CUERPO_MEDIDA}px ${r.fuente}`, r.texto).catch(() => undefined), espera]);

  const d = disposicionRotulo();
  const lienzo = document.createElement('canvas');
  lienzo.width = d.lienzo.ancho;
  lienzo.height = d.lienzo.alto;
  const ctx = lienzo.getContext('2d')!;
  ctx.fillStyle = `#${MATERIALES.acolchado.color.getHexString()}`;
  ctx.fillRect(0, 0, lienzo.width, lienzo.height);

  // Medidas con cuerpo fijo: avances de cada letra y alto de la tinta.
  ctx.font = `${CUERPO_MEDIDA}px ${r.fuente}`;
  const letras = [...r.texto];
  const avances = letras.map((l) => ctx.measureText(l).width / CUERPO_MEDIDA);
  const tinta = ctx.measureText(r.texto);
  const subeEm = tinta.actualBoundingBoxAscent / CUERPO_MEDIDA;
  const bajaEm = tinta.actualBoundingBoxDescent / CUERPO_MEDIDA;
  const anchoEm = avances.reduce((s, a) => s + a, 0) + r.espaciado * (letras.length - 1);
  const cuerpo = cuerpoRotulo(anchoEm, subeEm + bajaEm);
  const px = r.pxPorMetro;

  // Girado 90° a la izquierda: se lee de abajo arriba y el pie de las letras queda a la derecha.
  // Letras y raya roja, centradas en el lienzo (alrededor y a lo alto).
  const total = (subeEm + bajaEm) * cuerpo + (r.detalle.separacion + r.detalle.grosor) * px;
  const largo = anchoEm * cuerpo;
  const base = -total / 2 + subeEm * cuerpo;
  ctx.translate(lienzo.width / 2, lienzo.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = `${cuerpo}px ${r.fuente}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = r.colorLetras;
  let x = -largo / 2;
  letras.forEach((l, i) => {
    ctx.fillText(l, x, base);
    x += (avances[i] + r.espaciado) * cuerpo;
  });
  ctx.fillStyle = r.colorDetalle;
  ctx.fillRect(-largo / 2, base + bajaEm * cuerpo + r.detalle.separacion * px, largo, r.detalle.grosor * px);

  const textura = new CanvasTexture(lienzo);
  textura.colorSpace = SRGBColorSpace;
  textura.wrapS = RepeatWrapping;
  textura.wrapT = ClampToEdgeWrapping;
  textura.repeat.set(...d.repeticion);
  textura.offset.set(...d.desplazamiento);
  textura.anisotropy = 8;
  MATERIALES.acolchadoPoste.map = textura;
  MATERIALES.acolchadoPoste.needsUpdate = true;
}
