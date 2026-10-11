// Esquemas puros de las colecciones de contenido (docs/05-arquitectura.md).
// Viven fuera de content.config.ts para poder probarlos con Vitest.
import { z } from 'astro/zod';
import { DIAS, aMinutos } from './dias';

export { DIAS, aMinutos };
export const NIVELES = ['iniciacion', 'intermedio', 'avanzado', 'todos'] as const;

const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM');

export const franjaHoraria = <T extends z.ZodRawShape>(forma: T) =>
  z
    .object({ inicio: hora, fin: hora, ...forma })
    // El genérico T impide a TypeScript ver inicio/fin; el objeto los incluye siempre.
    .refine((f) => {
      const { inicio, fin } = f as { inicio: string; fin: string };
      return aMinutos(fin) > aMinutos(inicio);
    }, {
      message: 'La hora de fin debe ser posterior a la de inicio',
      path: ['fin'],
    });

export const esquemaClase = z.object({
  nombre: z.string().min(1),
  resumen: z.string().min(1),
  niveles: z.array(z.enum(NIVELES)).min(1),
  duracionMinutos: z.number().int().positive(),
  orden: z.number().int(),
});

// `clase` es el id de una entrada de la colección `clases`; en content.config.ts
// se sustituye por reference('clases').
export const formaFranja = {
  dia: z.enum(DIAS),
  nivel: z.enum(NIVELES),
  sala: z.enum(['jaula', 'tatami', 'sacos']),
};
export const esquemaFranja = franjaHoraria({ ...formaFranja, clase: z.string().min(1) });

export const esquemaPremio = z.object({
  titulo: z.string().min(1),
  organismo: z.string().min(1),
  anio: z.number().int().min(1990).max(2100),
  descripcion: z.string().optional(),
  orden: z.number().int(),
});

export const formaImagenGaleria = {
  alt: z.string().min(1),
  pie: z.string().optional(),
  orden: z.number().int(),
  /** Sale entre las miniaturas de la parada Galería de la landing. */
  destacada: z.boolean().default(false),
};

export const esquemaUbicacion = z.object({
  nombre: z.string().min(1),
  direccion: z.object({
    calle: z.string().min(1),
    codigoPostal: z.string().regex(/^\d{5}$/),
    localidad: z.string().min(1),
    provincia: z.string().min(1),
  }),
  coordenadas: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  telefono: z.string().min(1),
  email: z.email(),
  apertura: z.array(franjaHoraria({ dias: z.array(z.enum(DIAS)).min(1) })).min(1),
});
