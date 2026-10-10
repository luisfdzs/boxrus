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
| 2026-10-10 | Detalles de vida **por código** (primitivas fusionadas por grupo, color por vértice, 5 llamadas de dibujo, ~3.400 triángulos). Guantes en el saco de z = −20 del bastidor derecho, no en el primero | Aprobado por Luis sin modelos externos. El saco de z = −8 queda detrás de la cámara en la parada 3; el de −20 se ve en escritorio y en vertical |
| 2026-10-10 | Banco de los detalles de vida en z = −38 (muro izquierdo, pasado el bastidor) en vez de entre bastidor y portón | Ahí no salía en ningún plano (la cámara nunca mira hacia atrás); en −38 se ve en la transición P → 1, en una esquina de la parada 1 y entre las paradas 4 y 5. Decidido por Claude con la confianza delegada de Luis; revisable |
| 2026-10-10 | Recursos externos de la fase 2: **todos aprobados** por Luis («me fío de ti»), con criterio delegado en Claude | Luis aprobó la lista completa del `buscador-assets` |
| 2026-10-10 | Leather 011 descartado; grano de cuero **por código** (`pixelesCuero`) | La vista previa mostró cuero capitoné (de sofá), absurdo en un saco. Era el plan B documentado |
| 2026-10-10 | Marcador: dígitos con **geometría propia** de 7 segmentos; DSEG (OFL) queda de reserva | Recomendación aceptada; no añade descarga |
| 2026-10-10 | Normales `.ktx2` a 512 px (UASTC + zstd); color y rugosidad a 1K (ETC1S). Sin la rugosidad del caucho (el tatami usa el desgaste por código) | A 1K cada normal pesaba ~1,3 MB y RDO apenas ahorraba; a 512 son ~0,3 MB. Total texturas: 1,39 MB |
| 2026-10-10 | UV en coordenadas del mundo para muros, hormigón y tatami (`usarUvMundo` en `materiales.ts`); escena y cámara dentro de un `Suspense` que espera a las texturas | Las cajas unidad escaladas estiraban las texturas; el modo captura no debe marcar «lista» con la escena a medias |
| 2026-10-10 | Transcodificador Basis en `public/basis/` (excluido de `tsconfig`) | Regla de `07`: nada de CDN. `astro check` analizaba el JS minificado y fallaba |
| 2026-10-10 | **Luz precalculada en Blender: sí** (pregunta 4). Blender 5.2.2 LTS portátil instalado en la carpeta de programas del usuario | Decisión de Luis. Proceso documentado en `03` cuando esté probado |
| 2026-10-10 | **Hora del día: mañana fría** (pregunta 5): sol blanco neutro (`#fff4e2`) a ~30° desde el fondo y el muro derecho | Decisión de Luis; coincide con la gradación fría de `02` |
| 2026-10-10 | **El postproceso va en un trozo diferido** y se cuenta aparte de los 350 KB de la isla inicial, con tope propio de ~80 KB (gzip) | Decisión de Luis. Los 350 KB son lo que bloquea el primer fotograma |
| 2026-10-10 | Muros con **huecos reales** en los ventanales (franja baja, franja alta y machones) | Con muros macizos y cubierta arrojando sombra, el sol no entraba en la nave; ahora solo entra por los ventanales y dibuja sus manchas en el suelo |
| 2026-10-10 | Mapeo tonal **AgX**, sombras `PCFShadowMap` con radio (three r186 retiró `PCFSoftShadowMap`) | AgX satura menos las altas luces: encaja con «fría y algo desaturada» |
| 2026-10-10 | Ladrillo: saturación ajustable y relieve que se apaga a distancia en el sombreador (`TEXTURAS.ladrillo`); costuras de los sacos en el sombreador (`CUERO.costuras`) | Pendientes heredados de la fase 2, sin texturas nuevas. La textura de ladrillo es menos saturada que la paleta: la saturación que se veía venía de la luz y de ACES |
| 2026-10-10 | Fase 3, iteración 2 de luz: **AgX se queda** frente a Neutral (prueba A/B en los planos P y 1, misma exposición) | Neutral daba ladrillo y dígitos más saturados, pero hundía el tatami en negro (`#050b11` frente a `#1d2024`) y calentaba toda la imagen. AgX respeta «fría y algo desaturada» y «sin negros empastados»; la saturación que le falta al ladrillo se recupera en su sombreador (2,1) |
| 2026-10-10 | **Entorno capturado de la propia nave** (cámara cúbica de 128 px en (0, 3, −20), PMREM, una vez por carga) en lugar del HDRI Empty Warehouse 01, que deja de cargarse | Los reflejos pasan a ser los fluorescentes, ventanales y ladrillo de la nave; el HDRI, con el Fresnel, ponía el tatami gris (`#666a6a`) a ángulo rasante. Ahorra 0,52 MB de descarga y el `HDRLoader`. Al no haber relleno del HDRI, la exposición sube de 1 a 1,8 |
| 2026-10-10 | Marcador: dígitos de **7 segmentos por geometría propia** (`src/lib/marcador.ts`, probados con Vitest), con segmentos apagados tenues y la R con pata diagonal; marcador subido a y = 3,8 | Con la fuente del sistema, «R1» se montaba sobre el último 0. La caja rozaba la viga del bastidor en la parada 1; a 3,8 queda entre viga y ventanal (que empieza a 4,2) |
| 2026-10-10 | Sombra del sol: los muros la proyectan con su **cara exterior** (`shadowSide = FrontSide`) y radio PCF 1 | Con la cara trasera por defecto (la interior), el suelo a 1–2 cm del pie del muro quedaba por delante de ella con el sesgo: línea clara en la parada 3. No hizo falta prolongar los muros bajo el suelo. Con radio 3, el PCF de three (5 muestras giradas con ruido) punteaba los bordes de las manchas de sol y parecían alfombrillas |
| 2026-10-10 | Refuerzo de la jaula **sin sombra** (foco de 200 cd, ángulo 0,75, penumbra 0,6) | Desde un foco central, la sombra de malla y postes cae hacia fuera, nunca sobre la lona. Probada a 1024 px: +10 llamadas de dibujo y +16.000 triángulos sin nada visible a cambio (los FPS siguieron topados a 60 en producción). Para ver la sombra de la malla en la lona haría falta un foco rasante desde fuera de la jaula: propuesta abierta, no aplicada |
| 2026-10-10 | Malla: la cobertura del alfa crece con la inclinación de la vista (`espesarMallaDeLado`) | Con metal 0,5 y la cobertura plana (~22 %), la malla desaparecía a distancia; así los paños oblicuos se leen como velo y el frontal sigue transparente |
| 2026-10-10 | Tatami a rugosidad 0,7 × desgaste (≈ 0,60–0,70) en vez de 0,58–0,62; ladrillo a saturación 2,1 en vez de 1,3 | Con 0,6 el reflejo del sol rasante convertía sus manchas en placas blancas; con 1,3 el ladrillo seguía en `#5b4840`. Cifras del revisor ajustadas mirando el resultado |
| 2026-10-10 | **Luz precalculada sin segundas UV**: mapas de suelo, cubierta y muros proyectados en coordenadas del mundo (muros desplegados por el perímetro), horneados en Blender en dos pasadas (fluorescentes; día solo indirecta) y mezclados después | La geometría se genera por código y no tiene UV de mapa de luz. Separar las pasadas permite reajustar el equilibrio sin volver a hornear. Proceso en `03` |
| 2026-10-10 | Con la luz horneada, el ladrillo baja a saturación 1,4 y brillo 1,05, y los mapas a intensidad 0,85; el hemisferio pesa un 40 % en los materiales con mapa | Con los valores de la iteración 2 (sin horneado) el ladrillo se iba a naranja |
| 2026-10-10 | Haces de luz por **geometría aditiva** (prismas desde cada ventanal soleado) en vez de rayos en postproceso | Coste mínimo, deterministas y coherentes con las manchas de sol; el polvo se reparte dentro de ellos |
| 2026-10-10 | Oclusión en pantalla con **SSAO** de `postprocessing` en vez de N8AO | N8AO añadía ~80 KB con gzip al trozo diferido; con SSAO el trozo pesa ~29 KB |
| 2026-10-10 | En modo captura, «lista» espera también al postproceso | Si no, las capturas salían a veces sin postproceso y no eran comparables |
| 2026-10-10 | Fase 3 terminada; Luis pidió fusionar en `test` y `prod` al acabarla | Petición explícita de Luis |

## Preguntas abiertas

| # | Pregunta | Afecta a | Cuándo hace falta |
|---|---|---|---|
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
