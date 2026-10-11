// Lectura de las colecciones de contenido (src/content/) para landing y páginas.
import { getCollection, getEntry } from 'astro:content';
import { DIAS, aMinutos } from './esquemas';
import type { FranjaSimple } from './etiquetas';

export const urlComoLlegar = ({ lat, lng }: { lat: number; lng: number }) =>
  `https://www.openstreetmap.org/directions?route=%3B${lat}%2C${lng}`;

export const telefonoHref = (telefono: string) => `tel:${telefono.replace(/[^\d+]/g, '')}`;

export async function cargarGimnasio() {
  const entrada = await getEntry('ubicacion', 'boxrus');
  if (!entrada) throw new Error('Falta src/content/ubicacion/boxrus.json');
  return entrada.data;
}

export async function cargarClases() {
  return (await getCollection('clases')).sort((a, b) => a.data.orden - b.data.orden);
}

export async function cargarPremios() {
  return (await getCollection('premios')).sort((a, b) => a.data.orden - b.data.orden);
}

export async function cargarGaleria() {
  return (await getCollection('galeria')).sort((a, b) => a.data.orden - b.data.orden);
}

/** Franjas del horario ordenadas por día y hora, con el nombre de su clase ya resuelto. */
export async function cargarFranjas(): Promise<(FranjaSimple & { sala: string })[]> {
  const [franjas, clases] = await Promise.all([getCollection('horario'), cargarClases()]);
  const nombres = new Map(clases.map((c) => [c.id, c.data.nombre]));
  return franjas
    .map(({ id, data }) => ({
      id,
      dia: data.dia,
      inicio: data.inicio,
      fin: data.fin,
      claseId: data.clase.id,
      clase: nombres.get(data.clase.id) ?? data.clase.id,
      nivel: data.nivel,
      sala: data.sala,
    }))
    .sort((a, b) => DIAS.indexOf(a.dia) - DIAS.indexOf(b.dia) || aMinutos(a.inicio) - aMinutos(b.inicio));
}

/** Una imagen de la galería por su id (nombre del fichero sin extensión). */
export async function cargarImagenGaleria(id: string) {
  const entrada = await getEntry('galeria', id);
  if (!entrada) throw new Error(`Falta la imagen de galería «${id}» en src/content/galeria/`);
  return entrada.data;
}
