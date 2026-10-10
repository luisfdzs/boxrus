# Boxrus — reglas del proyecto

Boxrus es un gimnasio ficticio de MMA y deportes de contacto. Este repo es un **proyecto de práctica**: su **landing 3D «La nave»**, un recorrido por scroll por una nave industrial vacía con 5 paradas (Horario, Clases, Galería, Premios, Ubicación). Servirá de base para la futura web de un gimnasio real. El `CLAUDE.md` de la raíz (generado por Astro) sigue vigente para el servidor de desarrollo y la documentación de Astro.

@memory/MEMORY.md

## Documentación: léela antes de trabajar
El plan completo está en `docs/` (índice en `docs/README.md`):
- Escena 3D → `docs/02-direccion-de-arte.md` y `docs/03-escena.md`
- Cámara y scroll → `docs/04-recorrido-y-paradas.md`
- Código, estructura y contenido → `docs/05-arquitectura.md`
- Rendimiento, accesibilidad, SEO → `docs/06-rendimiento-y-accesibilidad.md`
- Recursos externos → `docs/07-assets-y-licencias.md`
- Qué toca ahora → `docs/08-hoja-de-ruta.md`

Los documentos son **vivos**: si una cifra cambia al verla renderizada, actualiza el documento en el mismo cambio y anota la decisión en `docs/09-decisiones-y-preguntas-abiertas.md`.

## Reglas
- **Idioma:** todo el contenido visible, en español. Identificadores de dominio en español (`saco`, `jaula`, `parada`), siguiendo `docs/05-arquitectura.md`.
- **Fuente única de datos:** medidas y planos en `src/datos/`; contenido del gimnasio en `src/content/`. Nada de números mágicos ni textos duplicados en componentes.
- **Contenido ficticio:** realista pero inventado. Nunca organizaciones, personas, ligas ni marcas reales.
- **Determinismo:** toda aleatoriedad (polvo, balanceo, variación del tatami) con el generador con semilla de `src/lib/azar.ts`.
- **Referencia visual:** la imagen de referencia es solo inspiración. No se descarga al repo ni se usa como textura o calco. Su marca de agua, logotipos de terceros, personas y objetos sueltos quedan fuera. La fuente de verdad visual es `docs/02-direccion-de-arte.md`.
- **Marcas:** solo BOXRUS. Ningún logotipo de terceros en sacos, jaula ni material.
- **Licencias:** ningún recurso externo sin anotarlo antes en `docs/07-assets-y-licencias.md`. Solo CC0 o CC BY (y ODbL para OpenStreetMap, con atribución).
- **Por fases:** sigue `docs/08-hoja-de-ruta.md`. No pases de fase sin la aprobación de Luis.
- **Verificación visual:** tras cambios en escena, cámara o interfaz, usa la skill `verificar-visual` y enseña las capturas.
- **Despliegue:** previsualizaciones en Vercel sin problema; **producción solo con aprobación explícita**.
- **Commits:** mensajes breves en inglés, sin atribución a Claude ni `Co-Authored-By`.

## Agentes (`.claude/agents/`)
El **hilo principal** coordina y hace él mismo el trabajo acoplado de escena, luz y cámara. Los agentes se usan para tareas **acotadas o de revisión**, sin editar en paralelo los mismos ficheros.

| Agente | Cuándo usarlo |
|---|---|
| `escena-3d` | Construir o modificar geometría y disposición de un bloque concreto de la nave |
| `luz-y-materiales` | Iterar materiales, luces, haces, polvo, neblina y postproceso sobre la nave ya maquetada |
| `coreografia-camara` | Trayectorias, zonas de pausa, entrada y salida de la jaula, encuadres móviles, colisiones |
| `interfaz` | Componentes Astro, colecciones de contenido, páginas de las 5 secciones, responsive |
| `buscador-assets` | Buscar recursos con licencia libre y verificar licencias (no edita código) |
| `auditor-rendimiento` | Medir Lighthouse, peso, FPS y llamadas de dibujo frente a los presupuestos (no edita código) |
| `revisor-visual` | Comparar capturas con la dirección de arte y la lista de comprobación (no edita código) |

## Comandos
- Servidor: `astro dev --background` (`http://localhost:4321`); `astro dev stop|status|logs`.
- Producción local: `npm run build` y `npm run preview`.
- Tipos: `npx astro check`. Pruebas: `npm run test` (desde la fase 0).
