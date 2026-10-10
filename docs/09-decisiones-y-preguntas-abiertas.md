# 09 · Decisiones y preguntas abiertas

## Decisiones tomadas

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-10-09 | Proyecto **de práctica** para una futura web de un gimnasio real | Dominar la técnica antes del proyecto real |
| 2026-10-09 | Escena **3D en tiempo real**, mismo stack que Billaron | Coherencia, control, interactividad; reutilizar lo aprendido |
| 2026-10-09 | La imagen de referencia solo como **inspiración**, descrita en `02`; se descartan su marca de agua, logotipos de terceros, personas y objetos sueltos | Es material de terceros |
| 2026-10-09 | 5 paradas: Horario, Clases, Galería, Premios y reconocimientos, Ubicación | Secciones típicas de la web de un gimnasio |
| 2026-10-09 | **Nave vacía**, sin personas | Igual que Billaron; las personas en 3D en tiempo real son caras y poco creíbles |
| 2026-10-09 | Contenido **ficticio** en colecciones de Astro | Sustituible por el real sin tocar código |
| 2026-10-09 | Solo **español**, alojamiento en **Vercel**, marca **Boxrus** | — |
| 2026-10-10 | `noindex, nofollow` en `Base.astro` mientras sea de práctica (pregunta 2, con la opción recomendada) | No indexar un gimnasio inexistente; se quita al pasar al gimnasio real |
| 2026-10-10 | Tipografías: **Anton** (titulares) e **Inter** variable (textos), vía Fontsource | Las primeras candidatas de `02`; OFL y alojadas en el sitio. Revisables al ver la interfaz (fase 4) |
| 2026-10-10 | Esquemas de contenido en `src/lib/esquemas.ts`; `content.config.ts` solo los conecta a las colecciones | Así Vitest los prueba sin depender de `astro:content` |
| 2026-10-10 | Colecciones vacías hasta la fase 4 (incluida `ubicacion`, que usa `glob` en vez de `file`) | Evita inventar ahora una dirección que depende de la pregunta 7 |

## Preguntas abiertas

| # | Pregunta | Afecta a | Cuándo hace falta |
|---|---|---|---|
| 1 | ¿Repositorio remoto (GitHub u otro) y cuenta/equipo de Vercel? | Despliegue | Fase 0 |
| 3 | ¿Detalles de vida (guantes colgados, comba) o nave totalmente desnuda? | Escena | Fase 3 |
| 4 | ¿Luz precalculada en Blender? Requiere Blender instalado; muy rentable en esta escena | Calidad visual | Fase 3 |
| 5 | ¿Hora del día? Luz de mañana fría (como la referencia) o tarde con haces más cálidos y bajos | Atmósfera | Fase 3 |
| 6 | ¿Ajuste a paradas al dejar de hacer scroll o scroll libre? | Coreografía | Fase 1 (probar ambos) |
| 7 | ¿Ciudad para la dirección ficticia? (afecta al mapa) | Contenido | Fase 4 |
| 8 | Paleta de marca: ¿rojo Boxrus (`#d4382a`) como acento o prefieres otro? | Interfaz | Fase 4 |
| 9 | Tono de los textos (tú/usted, más agresivo o más cercano) | Interfaz | Fase 4 |
