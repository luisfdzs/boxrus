# 01 · Visión

## Qué es Boxrus
Boxrus es un **gimnasio ficticio de deportes de contacto** (MMA, boxeo y disciplinas afines) instalado en una nave industrial. Este proyecto es **de práctica**: sirve para dominar la técnica antes de hacer, en el futuro, la web de un gimnasio real de estas características. Por eso:
- el contenido (horarios, clases, premios, dirección) es **ficticio** pero realista;
- la estructura se diseña para que, con un gimnasio real, baste con **cambiar el contenido**, no el código.

## Objetivo de la landing
Que la primera visita sea una **experiencia cinematográfica**: al hacer scroll, la cámara recorre la nave vacía y se detiene en 5 puntos. Cada punto es una sección de la web:

1. Horario
2. Clases
3. Galería
4. Premios y reconocimientos
5. Ubicación

El recorrido es el menú.

## Sensación buscada
- Cruda, industrial y seria: un gimnasio de verdad, no un decorado. Acero, ladrillo, caucho, luz fluorescente fría.
- Cinematográfica: luz natural que entra por los ventanales y cruza el polvo en suspensión, contraste marcado, la jaula como protagonista.
- Quieta y tensa: la nave vacía justo antes de que empiece la sesión.
- Agradable de usar: fluida, reversible, sin mareos ni esperas.

## Principios de experiencia
- **Salida siempre visible**: accesos directos a las 5 secciones en la cabecera y botón «Saltar recorrido» desde el primer segundo.
- **El contenido importante vive en HTML real**, no dentro del canvas (SEO y accesibilidad). Para un gimnasio esto es crítico: horario, dirección y teléfono deben poder encontrarse en Google y leerse en cualquier dispositivo.
- **Funciona sin 3D**: versión estática equivalente si no hay WebGL, el dispositivo es modesto o el usuario prefiere menos movimiento.

## Alcance
**Dentro:**
- Landing 3D en tiempo real con recorrido por scroll, prólogo, 5 paradas y epílogo.
- Interfaz superpuesta de cada parada, navegación, indicador de progreso.
- Páginas de las 5 secciones (`/horario`, `/clases`, `/galeria`, `/premios`, `/ubicacion`) con **contenido ficticio editable** (colecciones de contenido de Astro).
- Versión estática alternativa, rendimiento, accesibilidad, SEO local y despliegue en Vercel.

**Fuera:**
- Reservas, pagos, área de socios, formularios con backend.
- Contenido real de un gimnasio (llegará en el proyecto futuro).

## Restricciones fijadas
- Idioma: **solo español**.
- Alojamiento: **Vercel**.
- Marca: **Boxrus** (definitiva).
- Técnica: **escena 3D en tiempo real** con el mismo stack que Billaron.
- **Nave vacía**: sin personas.
