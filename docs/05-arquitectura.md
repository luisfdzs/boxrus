# 05 · Arquitectura

## Stack
Mismo stack que Billaron.

| Pieza | Elección | Motivo |
|---|---|---|
| Framework web | **Astro 7** (ya instalado) | Páginas estáticas muy rápidas; el 3D va en una «isla» |
| Contenido | **Colecciones de contenido de Astro** | Horario, clases, premios, galería y ubicación editables sin tocar código |
| 3D | **Three.js** con **React Three Fiber** + **drei** | Composición declarativa, instancias, utilidades probadas |
| Postproceso | **@react-three/postprocessing** | Bloom selectivo, profundidad de campo, viñeteado, grano, mapeo tonal |
| Integración React | **@astrojs/react** | Para la isla 3D |
| Scroll | **GSAP ScrollTrigger** + **Lenis** | Scroll suave y progreso preciso por tramos |
| Tipos y comprobación | TypeScript estricto + `astro check` | Ya configurado en el starter |
| Pruebas | **Vitest** | Lógica pura: datos de la nave, contenido, colisiones de cámara |
| Despliegue | **Vercel** (salida estática) | Previsualización por rama, producción desde `main` |

Versiones: la última estable de cada paquete al instalar; se fijan en `package-lock.json`.

## Estructura de carpetas (objetivo)
```text
src/
  pages/
    index.astro              # landing: recorrido + secciones HTML
    horario.astro
    clases.astro
    galeria.astro
    premios.astro
    ubicacion.astro
  content/                   # contenido editable (ficticio en este proyecto)
    horario/                 # franjas por día y clase
    clases/                  # una entrada por disciplina
    premios/                 # una entrada por reconocimiento
    galeria/                 # imágenes con texto alternativo y pie
    ubicacion/               # dirección, coordenadas, teléfono, apertura
  content.config.ts          # esquemas de las colecciones (zod)
  layouts/
    Base.astro               # <html lang="es">, metadatos, fuentes, estilos globales
  components/
    ui/                      # Astro: cabecera, paradas (HTML), progreso, saltar, pie
    nave/                    # isla React Three Fiber
      Nave.tsx               # <Canvas>, carga, niveles de calidad
      escena/                # Envolvente, Ventanales, Techo, Fluorescentes, Pilares,
                             # Jaula, Sacos, Bastidores, Peras, Tatami, Marcador
      atmosfera/             # polvo, haces de luz, neblina
      camara/                # trayectorias y controlador de cámara
      luz/                   # luces y postproceso
      depuracion/            # trayectoria, ejes, FPS, avisos de colisión
  datos/
    nave.ts                  # medidas y coordenadas de 03-escena.md
    paradas.ts               # planos de 04: cámara, encuadre móvil, textos, enlaces
  lib/
    progreso.ts              # estado compartido del progreso del scroll
    pausas.ts                # reparto del progreso en pausas (sin Three.js)
    trayectoria.ts           # progreso → posición, mira y campo de visión
    colisiones.ts            # obstáculos de la nave y prueba de colisiones
    scroll.ts                # Lenis + ScrollTrigger → progreso
    azar.ts                  # generador aleatorio con semilla
    esquemas.ts              # esquemas zod del contenido (los usa content.config.ts)
    modo.ts                  # lectura de ?parada, ?captura, ?depuracion, ?ajuste
    soporte.ts               # WebGL, movimiento reducido, nivel de calidad
  estilos/
public/
  modelos/                   # .glb comprimidos (Draco/Meshopt)
  texturas/                  # .ktx2 (Basis) y alternativas
  fuentes/                   # tipografías OFL alojadas en el sitio
  posters/                   # una imagen fija por plano (P, 1–5, E)
tests/                       # Vitest
```

## Fuente única de datos
- `datos/nave.ts` traduce `03-escena.md` a constantes. La escena **nunca** usa números mágicos sueltos.
- `datos/paradas.ts` traduce `04-recorrido-y-paradas.md`. Lo usan la isla 3D (cámara) y los componentes Astro (interfaz).
- El **contenido** (horarios, clases, premios, galería, ubicación) vive en `src/content/` y lo leen tanto las paradas de la landing (resúmenes) como las páginas completas. Es la pieza que se sustituirá con los datos del gimnasio real.

## Contenido ficticio
- Realista pero inventado: nombres de clases y niveles plausibles, horarios coherentes, premios con organismos **inventados** (nunca organizaciones o personas reales), dirección y teléfono ficticios.
- Las imágenes de la galería, en este proyecto, son **capturas de la propia escena 3D** (en modo `?captura=1`, desde ángulos extra) más imágenes generadas por código; nada de fotos de terceros.
- Mapa de `/ubicacion`: mapa interactivo de OpenStreetMap (Leaflet) **cargado bajo demanda** al pulsar, para no penalizar la carga; enlace «Cómo llegar» a un servicio de mapas.

## Flujo scroll → cámara → interfaz
1. La landing tiene una **pista** alta (≈ 7 pantallas) con una sección HTML por plano. El canvas va fijo detrás.
2. **Lenis** suaviza el scroll; **ScrollTrigger** convierte la posición en un **progreso global 0–1** y en el plano activo.
3. `lib/progreso.ts` guarda ese estado (sin re-renderizar React en cada scroll; se lee en `useFrame`).
4. El controlador de cámara traduce el progreso a posición y punto de mira, con las zonas de pausa.
5. Las secciones HTML aparecen y desaparecen con ScrollTrigger y CSS.
6. El indicador de progreso y la cabecera hacen scroll programático a cada parada.

## Carga y renderizado
- Se muestra de inmediato el **póster** del prólogo (mide el LCP).
- La isla 3D se hidrata después (`client:only="react"`, carga diferida) y sustituye al póster con un fundido cuando el primer fotograma está listo.
- Bucle de render detenido si no hay movimiento (salvo polvo y balanceo, que en nivel bajo se congelan), con la pestaña oculta o el canvas fuera de vista.
- Niveles de calidad alto / medio / bajo (ver `06`).

## Modos de URL
`?parada=N`, `?captura=1`, `?depuracion=1` (ver `04`). Requisito desde la fase 1.

## Pruebas automáticas
- Las medidas de `datos/nave.ts` coinciden con `03` (jaula, pilares, bastidores, ventanales).
- La trayectoria de cámara no atraviesa sacos, cadenas, pilares, bastidores, regletas ni la malla (salvo por las puertas).
- Las colecciones de contenido validan su esquema; el horario no tiene solapes imposibles.
- `paradas.ts` tiene los 7 planos con todos los campos.

## Comandos
- `astro dev --background` (`http://localhost:4321`); `astro dev stop|status|logs`.
- `npm run build` y `npm run preview`.
- `npx astro check`. `npm run test` (se añade en la fase 0).

## Despliegue en Vercel
- Salida **estática** de Astro.
- Repositorio: `github.com/luisfdzs/boxrus` (público). Proyecto de Vercel `boxrus` (equipo `luis-fernandez`) conectado al repositorio.
- Tres ramas:

| Rama | Uso | Dónde se ve |
|---|---|---|
| `dev` | Desarrollo diario; rama por defecto | Previsualización con URL propia por cada push (requiere sesión de Vercel) |
| `test` | Versión para revisar, fusionando `dev` | `https://boxrustest.vercel.app` (dominio fijado a la rama) |
| `prod` | Producción; rama de producción de Vercel | `https://boxrus.vercel.app` |

- Flujo: `dev` → `test` → `prod`. Fusionar en `prod` **publica**, así que solo se hace con aprobación explícita de Luis.
- Salvaguarda en el proyecto de Vercel (*Ignored Build Step*): se descarta cualquier despliegue de producción que no venga de `prod`.
- La protección de Vercel (Vercel Authentication) está activa en previsualizaciones y en `boxrustest.vercel.app`: hay que iniciar sesión en Vercel para verlas.
- Caché larga para `/_astro/`, `modelos/`, `texturas/`, `fuentes/`.
