import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  esquemaClase,
  esquemaPremio,
  esquemaUbicacion,
  formaFranja,
  formaImagenGaleria,
  franjaHoraria,
} from './lib/esquemas';

const clases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/clases' }),
  schema: esquemaClase,
});

// Toda la semana en un solo fichero: una lista de franjas, cada una con su `id`.
const horario = defineCollection({
  loader: file('./src/content/horario/semana.yaml'),
  schema: franjaHoraria({ ...formaFranja, clase: reference('clases') }),
});

const premios = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/premios' }),
  schema: esquemaPremio,
});

const galeria = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml,json}', base: './src/content/galeria' }),
  schema: ({ image }) => z.object({ imagen: image(), ...formaImagenGaleria }),
});

const ubicacion = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/ubicacion' }),
  schema: esquemaUbicacion,
});

export const collections = { clases, horario, premios, galeria, ubicacion };
