# 06 · Rendimiento, accesibilidad y SEO

## Presupuestos
Valores objetivo; se miden en la fase 5 y se revisan si resultan irreales.

| Métrica | Escritorio | Móvil (gama media) |
|---|---|---|
| Lighthouse Rendimiento (landing) | ≥ 90 | ≥ 80 |
| Lighthouse Accesibilidad | ≥ 95 | ≥ 95 |
| Lighthouse SEO / Buenas prácticas | ≥ 95 | ≥ 95 |
| LCP (póster del prólogo) | ≤ 1,8 s | ≤ 2,5 s |
| CLS | ≤ 0,05 | ≤ 0,05 |
| JS de la isla 3D (gzip) | ≤ 350 KB | ≤ 350 KB |
| Descarga 3D total (modelos + texturas + mapas de luz) | ≤ 10 MB | ≤ 5 MB |
| FPS durante el recorrido | 60 estable | ≥ 30 estable |
| Llamadas de dibujo por fotograma | ≤ 150 | ≤ 80 |

El presupuesto de descarga es algo mayor que en Billaron porque los mapas de luz precalculados, si se usan, pesan.

## Niveles de calidad
| Ajuste | Alto | Medio | Bajo |
|---|---|---|---|
| Resolución de render (DPR) | hasta 2 | hasta 1,5 | 1 |
| Sombra del sol | suave, 2K | 1K | sin sombra (o precalculada) |
| `RectAreaLight` de fluorescentes | 6 + 4 de la jaula | 4 | 0 (solo emisivos + luz precalculada) |
| Haces de luz | volumétricos | volúmenes simples | volúmenes simples, muy tenues |
| Polvo | ~2.000 partículas, animado | ~1.000 | ~500, estático |
| Balanceo de sacos | sí | sí | no |
| Bloom | completo | reducido | muy reducido |
| Profundidad de campo | sí | solo paradas 1 y 2 | no |
| Texturas | 2K | 1K | 1K/512 |

Elección inicial según el dispositivo y ajuste automático si los FPS caen.

## Alternativas sin 3D
Versión estática cuando no hay WebGL, con `prefers-reduced-motion`, si el nivel «bajo» no llega a 30 FPS o si el usuario elige «Versión ligera». Usa los **pósters** de cada plano con las mismas secciones HTML y transiciones de opacidad.

## Accesibilidad
- Contenido y acciones en **HTML semántico**; canvas decorativo (`aria-hidden`).
- «Saltar al contenido» y «Saltar recorrido».
- Teclado completo, foco visible, orden lógico.
- Contraste AA en todo texto superpuesto.
- El horario como **tabla accesible** (encabezados de fila y columna), no como imagen.
- Sin sonido automático.

## SEO (local)
Pensado para que, con el gimnasio real, funcione desde el primer día:
- `<html lang="es">`, título y descripción por página, URL canónica.
- Datos estructurados **`ExerciseGym`** (o `SportsActivityLocation`) con nombre, dirección, coordenadas, teléfono y `openingHoursSpecification` generados desde `src/content/`.
- Las 5 secciones son páginas indexables con contenido real en HTML.
- Imagen Open Graph: póster del prólogo.
- `sitemap.xml` y `robots.txt`.
- En este proyecto de práctica, `noindex` para no indexar un gimnasio inexistente (ver `09`).
