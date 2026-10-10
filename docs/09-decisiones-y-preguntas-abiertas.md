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
| 2026-10-10 | Repositorio público `luisfdzs/boxrus`; ramas `dev` (desarrollo), `test` (`boxrustest.vercel.app`) y `prod` (producción, `boxrus.vercel.app`) en un solo proyecto de Vercel. Responde a la pregunta 1 | Separar desarrollo, revisión y publicación; producción solo al fusionar en `prod` |
| 2026-10-10 | *Ignored Build Step* en Vercel que descarta despliegues de producción fuera de `prod` | El primer push a `dev` generó un despliegue de producción (probablemente por ser el primero del proyecto); se canceló antes de servirse |
| 2026-10-10 | `noindex, nofollow` en `Base.astro` mientras sea de práctica (pregunta 2, con la opción recomendada) | No indexar un gimnasio inexistente; se quita al pasar al gimnasio real |
| 2026-10-10 | Tipografías: **Anton** (titulares) e **Inter** variable (textos), vía Fontsource | Las primeras candidatas de `02`; OFL y alojadas en el sitio. Revisables al ver la interfaz (fase 4) |
| 2026-10-10 | Esquemas de contenido en `src/lib/esquemas.ts`; `content.config.ts` solo los conecta a las colecciones | Así Vitest los prueba sin depender de `astro:content` |
| 2026-10-10 | Colecciones vacías hasta la fase 4 (incluida `ubicacion`, que usa `glob` en vez de `file`) | Evita inventar ahora una dirección que depende de la pregunta 7 |
| 2026-10-10 | Fase 1: sacos protagonistas en (±2,2, −3) en vez de (±7, −2); marcador en z = −22; refuerzo de la jaula a y = 4,4 | Sacos visibles en el prólogo también en vertical; marcador en pared limpia; refuerzo separado de los ventanales en el picado (propuestas del `revisor-visual`) |
| 2026-10-10 | Fase 1: encuadres de todas las paradas ajustados tras dos rondas de capturas (detalle en `04`) | Composición revisada con el agente `revisor-visual` |
| 2026-10-10 | Velocidad de cámara uniforme sobre desplazamiento + giro de la mirada (8 m/rad), con límite de 36° por 1 % de progreso | Sin el giro en la cuenta, la salida por la puerta trasera hacía un barrido de casi 90° en un instante |
| 2026-10-10 | Ajuste a paradas desactivado por defecto; se prueba con `?ajuste=1` | Pregunta 6: probar ambos en uso real antes de decidir |
| 2026-10-10 | **Móvil: scroll por paradas.** Cada gesto lleva a la parada siguiente o anterior, sin posiciones intermedias, a ritmo constante (2,2 s por transición) | Decisión de Luis: scroll totalmente controlado en móvil. Resuelve la pregunta 6 para móvil; en escritorio sigue abierta |
| 2026-10-10 | **Móvil: menú de píldora** abajo y centrado, un icono por sección, que lleva directo a la parada. Iconos SVG propios | Decisión de Luis: llegar a cualquier sección con un toque. Se adelanta a la fase 4 solo en móvil; la navegación de escritorio (cabecera, indicador «01 / 05») sigue en la fase 4 |
| 2026-10-10 | Saltos del menú: tramo real si la sección es vecina; si no, medio tramo de salida, fundido a negro, corte y medio tramo de llegada. Todos duran 1,5 s | Decisión de Luis: que ningún salto dure más que uno entre vecinas |
| 2026-10-10 | Logotipo arriba y centrado (texto BOXRUS en Anton, en píldora oscura) en `Base.astro`; al pulsarlo recarga `/` desde el prólogo | Decisión de Luis. Es texto provisional hasta que haya logotipo gráfico |
| 2026-10-10 | **Fase 1 aprobada** (capturas de los 7 planos incluidas) | Aprobación de Luis |
| 2026-10-10 | **Detalles de vida, sin saturar**: lista cerrada de seis en `03` (guantes, comba, banco con toalla y botella, vendas, espinilleras, balones medicinales). Responde a la pregunta 3 | Decisión de Luis: que la nave parezca usada, no decorada |
| 2026-10-10 | Se admite **SIL OFL** para tipografías | Autorización de Luis; ya era la licencia de Anton e Inter |
| 2026-10-10 | Herramientas de compresión: `@gltf-transform/cli` (npm, desarrollo) y KTX-Software 4.4.2 (usuario, en el `PATH`) | Necesarias para `.glb`/`.ktx2` en la fase 2. `npm audit` avisa de 3 vulnerabilidades «altas» en `braces` (dependencia del CLI): denegación de servicio solo con patrones de archivo maliciosos, en una herramienta local; no se aplica `audit fix --force` porque bajaría el CLI a la versión 2 |
| 2026-10-10 | Texturas por código como píxeles generados en `src/lib/texturas.ts` (probados con Vitest) y convertidos a `DataTexture` en `materiales.ts`; parámetros en `datos/nave.ts` | Cero descarga, deterministas y ajustables sin herramientas externas |
| 2026-10-10 | Chapa: tesela cuadrada repetida en los dos ejes y **mipmaps propios** que aplanan la onda (`CHAPA.relieveMipmaps`) | Con la tesela de 4 × 64 px y los mipmaps automáticos, la cubierta mostraba moiré en anillos al verse en ángulo rasante |
| 2026-10-10 | Malla: paños planos con UV en teselas medidas desde el inicio de cada cara, en lugar de cajas instanciadas | El rombo tiene el mismo tamaño en todos los paños, también en los partidos por las puertas |
| 2026-10-10 | Desgaste del tatami en coordenadas del mundo (UV calculadas en el sombreador de las instancias) | Con las UV de la caja unidad, cada placa repetía la misma mancha |

## Preguntas abiertas

| # | Pregunta | Afecta a | Cuándo hace falta |
|---|---|---|---|
| 4 | ¿Luz precalculada en Blender? Requiere Blender instalado; muy rentable en esta escena | Calidad visual | Fase 3 |
| 5 | ¿Hora del día? Luz de mañana fría (como la referencia) o tarde con haces más cálidos y bajos | Atmósfera | Fase 3 |
| 6 | ¿Ajuste a paradas al dejar de hacer scroll o scroll libre? **En escritorio** (en móvil ya está decidido: scroll por paradas) | Coreografía | Fase 1 (probar ambos) |
| 7 | ¿Ciudad para la dirección ficticia? (afecta al mapa) | Contenido | Fase 4 |
| 8 | Paleta de marca: ¿rojo Boxrus (`#d4382a`) como acento o prefieres otro? | Interfaz | Fase 4 |
| 9 | Tono de los textos (tú/usted, más agresivo o más cercano) | Interfaz | Fase 4 |

## Pendientes menores
- Probar en un **teléfono real** (sobre todo iPhone/Safari) el scroll por paradas, el menú de píldora y los saltos con fundido; solo se han probado con gestos simulados.
- Rama **`main`** antigua en GitHub, sin uso (las ramas de trabajo son `dev`, `test` y `prod`): borrarla cuando Luis lo confirme.
- `docs/02` **enlaza** la imagen de referencia de un tercero en un repositorio público (no la aloja). Valorar sustituir el enlace por una mención a la memoria local.
- Duración de los saltos: gesto 2,2 s, menú 1,5 s (`RECORRIDO.paginadoMovil`). Revisar en el teléfono si conviene igualarlas.
- En el prólogo coinciden el logotipo de arriba y el titular grande «BOXRUS» (se revisará con la interfaz, fase 4).
