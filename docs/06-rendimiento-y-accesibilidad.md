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

### Estado medido (fin de la fase 1, 2026-10-10)
| Pieza (gzip) | Peso | Cuenta en |
|---|---|---|
| Isla 3D: Three.js, React Three Fiber, drei, escena y cámara (`ControladorCamara.*.js`) | ~238 KB | JS de la isla |
| Cliente de React (`client.*.js`) | ~64 KB | JS de la isla |
| Componente de la isla (`Nave.*.js`) | ~7 KB | JS de la isla (no se contaba en la primera medición) |
| **Total JS de la isla** | **~310 KB de 350** | |
| Script de la página: GSAP, ScrollTrigger, Lenis, scroll por paradas (`index.astro_*.js`) | ~49 KB | aparte (no es la isla) |
| Capa de depuración (`Depuracion.*.js`) | carga solo con `?depuracion=1` | — |
| Llamadas de dibujo / triángulos | ~27 / ~30.000 | presupuesto de 150 / — |

### Estado medido (fin de la fase 2, 2026-10-10)
| Pieza (gzip) | Peso | Cuenta en |
|---|---|---|
| `ControladorCamara.*.js` | ~239 KB | JS de la isla |
| `client.*.js` | ~64 KB | JS de la isla |
| `Nave.*.js`: escena + `KTX2Loader` (con `ktx-parse` y `zstddec`, ~30 KB) + detalles de vida (~5 KB) + texturas por código (~1 KB) | ~37 KB | JS de la isla |
| **Total JS de la isla** | **~340 KB de 350** | |
| Texturas `.ktx2` (`public/texturas/`, 7 ficheros) | 1,39 MB | descarga 3D |
| Transcodificador Basis (`public/basis/`) | 0,58 MB (~0,26 MB con gzip) | descarga 3D |
| **Total descarga 3D** | **~1,7–2,0 MB de 10 / 5** | |

No hace falta cargador de modelos ni Meshopt: no se descarga ningún `.glb`. `vite build` emite además en `_astro/` una copia del transcodificador por defecto de `KTX2Loader` (`basis_transcoder.*.{js,wasm}`) porque el cargador la referencia por URL; no se descarga nunca (usamos `setTranscoderPath('/basis/')`).

**Margen: ~10 KB.** El postproceso de la fase 3 (`@react-three/postprocessing` + `postprocessing`, ~40–60 KB) **no cabe** sin aplicar alguna palanca de abajo; la primera candidata es cargar en un trozo diferido el postproceso (y quizá `TexturasNave` + `KTX2Loader`). Los modelos y texturas **no** cuentan aquí, sino en la descarga 3D (10 MB / 5 MB).

### Estado medido (fase 3, iteración 3, 2026-10-10)
- JS de la isla: ~341,6 KB de 350 (el `HDRLoader` salió al sustituir el HDRI por el entorno capturado de la nave).
- Descarga 3D: texturas `.ktx2` 1,39 MB + transcodificador Basis ~0,26 MB (gzip) + mapas de luz `public/luz/` 1,1 MB ≈ **2,8 MB de 10 / 5**. El HDRI de `public/entorno/` ya no se descarga.
- FPS (escritorio, GPU integrada, 1440 × 900, DPR 1, compilación de producción): 60 en todos los planos salvo la parada 4 (56,7), medido en la iteración 2.

### Estado medido (cierre de la fase 3, 2026-10-10)
| Pieza (gzip) | Peso | Cuenta en |
|---|---|---|
| `events-*.esm.js` (Three, R3F, drei, escena y cámara) | ~238 KB | isla inicial |
| `client.*.js` | ~64,5 KB | isla inicial |
| `Nave.*.js` (escena, `KTX2Loader`, atmósfera, haces) | ~42,3 KB | isla inicial |
| **Total isla inicial** | **~344,7 KB de 350** | |
| `Postproceso.*.js` (postprocessing: SSAO, bloom, AgX, viñeteado, grano) | ~29,2 KB | trozo diferido, tope ~80 KB |
| Descarga 3D | ~2,8 MB de 10 / 5 | |

FPS con atmósfera y postproceso (compilación de producción, 1920 × 855, DPR 1, GPU integrada AMD): 56 en el prólogo, 60 en la parada 4. Móvil real: sin medir.

**Decisión (2026-10-10, Luis):** el postproceso se carga en un **trozo diferido** tras el primer fotograma y se mide aparte, con tope propio de ~80 KB (gzip). Los 350 KB siguen siendo el presupuesto de la isla inicial.

### Estado medido (fase 4, rótulos BOXRUS de los postes, 2026-10-11)
Comparación A/B con el mismo árbol de trabajo (incluidos los cambios de interfaz en curso), con y sin el rótulo:
| Pieza (gzip) | Sin rótulo | Con rótulo |
|---|---|---|
| `events-*.esm.js` | 238,02 KB | 238,03 KB |
| `client.*.js` | 64,48 KB | 64,48 KB |
| `Nave.*.js` | 41,63 KB | 42,38 KB (+0,75) |
| **Total isla inicial** | **344,1 KB** | **344,9 KB de 350** |

Aparte, trozos pequeños que también carga la isla y no se contaban: `scheduler` 4,4 KB, `pausas` 3,6 KB, `ControladorCamara` 1,3 KB, `BufferGeometryUtils` 1,2 KB, `luz` 1,0 KB (sin cambios por el rótulo). El rótulo es una textura de lienzo (`CanvasTexture`, ~0,9 MB en la GPU con mipmaps; no se descarga) con Anton, que ya carga la página: ni `Text` de drei ni fuentes nuevas. Llamadas de dibujo y triángulos: **sin cambios** (los postes siguen siendo una malla instanciada, ahora con su propio material; +1 programa de sombreado).

### Estado medido (fase 3, iteración 2 de luz, 2026-10-10)
| Pieza (gzip) | Peso | Cuenta en |
|---|---|---|
| Three.js + React Three Fiber (`events-*.esm.*.js`, antes `ControladorCamara.*.js`) | 237,9 KB | JS de la isla |
| `client.*.js` | 64,5 KB | JS de la isla |
| `Nave.*.js` (sin `HDRLoader`; con entorno capturado, marcador de 7 segmentos y lona por código) | 39,2 KB (+0,25 KB) | JS de la isla |
| **Total JS de la isla** | **341,6 KB de 350** (+ `scheduler.*.js`, 4,7 KB, sin cambios) | |
| HDRI | ya no se descarga (−0,52 MB; −0,38 MB con gzip) | descarga 3D |

FPS con `?depuracion=1` sobre la compilación de producción (`astro preview`), 1440 × 900, DPR 1, GPU integrada AMD Radeon (APU): 60 en P, 1, 2, 3, 5 y E; 56,7 en la parada 4 (picado con toda la nave). Llamadas de dibujo 33–51 y 47.000–51.000 triángulos, contando la capa de depuración. *(2026-10-11: esas cifras eran solo parte del fotograma; contando todas las pasadas —sombras, SSAO, escena y postproceso— la auditoría de la fase 4 midió 74–109 llamadas y 77.000–84.000 triángulos según el plano: cumple el tope de escritorio, 150; en móvil P, 1, 2 y 4 pasarían de 80 con estas pasadas.)* El modo captura y el servidor de desarrollo dan cifras más bajas y ruidosas: no sirven para medir.

Palancas si no cabe, de menor a mayor esfuerzo: importar de drei solo lo usado (ya se hace; vigilar que no entren `Text`, `Environment` con presets remotos, etc.); cargar el postproceso en diferido tras el primer fotograma; partir la isla en dos trozos (escena base + postproceso/atmósfera); revisar el presupuesto con Luis si la calidad lo justifica.

Cómo medirlo tras `npm run build`:
```bash
for f in dist/_astro/*.js; do echo "$(gzip -c "$f" | wc -c) $f"; done | sort -n | tail
```
Y en el navegador, con `?depuracion=1`: `window.naveRender` da llamadas de dibujo y triángulos del último fotograma completo (todas las pasadas; corregido el 2026-10-11).

### Estado medido (fase 4, interfaz y páginas, 2026-10-11)
| Pieza (gzip) | Peso | Cuenta en |
|---|---|---|
| `events-*.esm.*.js` + `client.*.js` + `Nave.*.js` | 238,0 + 64,5 + 42,4 = **344,9 KB de 350** | isla inicial (sin cambios por la interfaz) |
| Script de la landing (`index.astro_*.js`: GSAP, ScrollTrigger, Lenis, viajes, próximas clases) | ~51,8 KB | aparte (no es la isla) |
| `leaflet-src.*.js` + `leaflet.*.css` | 42,9 KB + 6,4 KB | **solo en `/ubicacion`, al pulsar «Ver mapa»** (import dinámico; el CSS se enlaza por URL desde el script) |
| Script de `/ubicacion` | ~1 KB | carga inicial de esa página |

Con `import 'leaflet/dist/leaflet.css'` Astro enlazaba el CSS en el HTML inicial; por eso se importa con `?url` y se añade el `<link>` al pulsar.

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
- «Saltar al contenido» (primer elemento tabulable de cada página) y «Saltar recorrido» (botón del prólogo; lleva al cierre y enfoca su titular).
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
