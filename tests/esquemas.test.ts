import { describe, expect, it } from 'vitest';
import { esquemaClase, esquemaFranja, esquemaPremio, esquemaUbicacion } from '../src/lib/esquemas';

describe('esquemas de contenido', () => {
  it('acepta una franja horaria válida', () => {
    const franja = { dia: 'lunes', inicio: '19:00', fin: '20:30', clase: 'mma', nivel: 'todos', sala: 'jaula' };
    expect(esquemaFranja.safeParse(franja).success).toBe(true);
  });

  it('rechaza franjas que acaban antes de empezar o con hora mal escrita', () => {
    const base = { dia: 'martes', clase: 'boxeo', nivel: 'iniciacion', sala: 'sacos' };
    expect(esquemaFranja.safeParse({ ...base, inicio: '20:00', fin: '19:00' }).success).toBe(false);
    expect(esquemaFranja.safeParse({ ...base, inicio: '9:00', fin: '10:00' }).success).toBe(false);
  });

  it('exige al menos un nivel por clase', () => {
    const clase = { nombre: 'Grappling', resumen: 'Lucha en el suelo.', niveles: [], duracionMinutos: 60, orden: 1 };
    expect(esquemaClase.safeParse(clase).success).toBe(false);
  });

  it('valida año del premio y datos de ubicación', () => {
    expect(esquemaPremio.safeParse({ titulo: 'Mejor club', organismo: 'Liga Inventada', anio: 1800, orden: 1 }).success).toBe(false);

    const ubicacion = {
      nombre: 'Boxrus',
      direccion: { calle: 'Calle Ficticia 1', codigoPostal: '00000', localidad: 'Villaficticia', provincia: 'Ficticia' },
      coordenadas: { lat: 40, lng: -3 },
      telefono: '900 000 000',
      email: 'hola@boxrus.example',
      apertura: [{ dias: ['lunes', 'viernes'], inicio: '07:00', fin: '22:00' }],
    };
    expect(esquemaUbicacion.safeParse(ubicacion).success).toBe(true);
    expect(esquemaUbicacion.safeParse({ ...ubicacion, email: 'no-es-email' }).success).toBe(false);
  });
});
