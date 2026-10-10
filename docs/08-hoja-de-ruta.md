# 08 · Hoja de ruta

Cada fase termina con **capturas y un resumen para Luis**, que da el visto bueno antes de pasar a la siguiente. Nada de pulir el acabado sin haber aprobado la composición.

Agentes: ver `.claude/agents/` y la política de uso en `.claude/CLAUDE.md`. El hilo principal coordina y hace el trabajo acoplado de escena, luz y cámara; los agentes entran en tareas acotadas o de revisión.

---

## Estado
- Fase 0 ✅ · Fase 1 ✅ (2026-10-10) · Fase 2 ✅ (2026-10-10) · Fase 3 terminada (2026-10-10), **pendiente de la aprobación de Luis** · Siguiente: fase 4 (no empezar sin su aprobación).

## Fase 0 · Preparación
- Limpiar el starter de Astro.
- Instalar dependencias del stack (`05`), integración React, Vitest y script `test`.
- `Base.astro` con `lang="es"`, metadatos, fuentes y `noindex` (proyecto de práctica).
- Esquemas de las colecciones de contenido (`content.config.ts`).
- Repositorio remoto y proyecto de Vercel conectado (requiere a Luis).
- Hook de comprobación de tipos en `.claude/settings.json` cuando el proyecto compile.

**Criterios de aceptación:**
- [ ] `npm run build`, `npx astro check` y `npm run test` pasan.
- [ ] URL de previsualización de Vercel funcionando.

## Fase 1 · Maqueta en bloques
- Nave en geometría gris a escala real: muros, ventanales, cerchas, pilares, jaula con puertas, sacos, bastidores, regletas, marcador.
- `datos/nave.ts` y `datos/paradas.ts` a partir de `03` y `04`.
- Trayectoria completa con los 7 planos, entrada y salida de la jaula por las puertas; scroll con Lenis + ScrollTrigger.
- Modos `?parada`, `?captura`, `?depuracion`; prueba automática de colisiones.
- Secciones HTML provisionales; encuadres móviles iniciales.
- Agentes: `escena-3d`, `coreografia-camara`; `revisor-visual` al final.

**Criterios de aceptación:**
- [x] Capturas de los 7 planos en escritorio (1440 × 900) y móvil (390 × 844) **aprobadas por Luis**.
- [x] Recorrido fluido y reversible; prueba de colisiones en verde.
- [x] Coordenadas definitivas actualizadas en `03` y `04`.

**✅ Fase 1 aprobada por Luis el 2026-10-10.** Además de lo previsto se hizo: scroll por paradas y menú de píldora en móvil, y logotipo que vuelve al inicio (ver `04` y `09`). Está en producción (`boxrus.vercel.app`).

## Fase 2 · Assets
- Agente `buscador-assets`: propuestas según `07`, con licencias. Incluye los **detalles de vida** de `03` (lista cerrada, sin saturar).
- Texturas por código: malla de eslabones, chapa, variación del tatami. ✅ (`src/lib/texturas.ts`, 2026-10-10)
- Compresión a `.glb`/`.ktx2`. Herramientas ya instaladas y cadena probada (ver `07`, «Herramientas»). El transcodificador Basis, alojado en `public/basis/`.
- Vigilar el JS de la isla (ver `06`): los cargadores añaden peso.

Punto de partida en una sesión nueva: leer `07` (inventario y herramientas), `03` (medidas y detalles de vida), `06` (presupuestos y estado del peso) y la memoria local del proyecto (capturas y entorno).

**Criterios de aceptación:**
- [x] Registro de licencias completo (`07`).
- [x] Peso dentro del presupuesto de `06`: descarga 3D ~2 MB de 10 / 5; JS de la isla ~340 de 350 KB (justo: ver el riesgo en la fase 3).

**✅ Fase 2 cerrada el 2026-10-10.** Luis aprobó todos los recursos propuestos y delegó el criterio en Claude. Resultado:
- Por código: malla, chapa (con mipmaps propios contra el moiré), desgaste del tatami, grano del cuero y los seis detalles de vida (`src/lib/texturas.ts`, `src/lib/detalles.ts`).
- Externos en `.ktx2`: ladrillo, hormigón y relieve del caucho, cargados con `TexturasNave` y UV en coordenadas del mundo.
- Desviaciones: Leather 011 descartado (capitoné), guantes en el saco de z = −20 y banco en z = −38 (ver `09`). El HDRI queda descargable pero sin procesar: pasa a la fase 3.

## Fase 3 · Ambiente
Punto de partida en una sesión nueva: leer `02` (paleta, lista de comprobación, «Evitar»), `03` (iluminación y atmósfera), `06` (estado del peso: la isla está a ~340 de 350 KB), `07` (registro y cómo se generaron las texturas), `09` (preguntas 4 y 5) y la memoria local (`arranque-fase-3` y `entorno-local`).

Pendientes heredados de la fase 2:
- **JS de la isla:** quedan ~10 KB. Antes de añadir el postproceso, separarlo en un trozo diferido (y valorar lo mismo con `TexturasNave` + `KTX2Loader`) o pedir a Luis que revise el presupuesto.
- ✅ **HDRI** Empty Warehouse 01 en `public/entorno/` (512 × 256). El bloqueo de la fase 2 venía de `python -I`, que ignora el numpy del usuario; con `-E -P` funciona. *(Iteración 2 de luz: sustituido por un entorno capturado de la propia nave; ver `09`.)*
- ✅ (pendiente de confirmar en móvil) **Ladrillo:** chispas blancas en las juntas a distancia (aliasing especular de la normal; muy visible en móvil). Bajar `normalScale` o reducir el relieve en los mipmaps, como en la chapa.
- ✅ (control `TEXTURAS.ladrillo.saturacion`, ajuste fino con la luz definitiva) **Ladrillo, color:** más saturado que la paleta (`#7d4430`–`#a85a3c`); desaturar con el color del material o en el sombreador.
- ✅ (iteración 2: `#4e4f50`, reflejo 0,4) **Hormigón:** Concrete 034 es encofrado claro con agujeros de latiguillos; comprobar que se lee como pulido (está detrás de la cámara en casi todo el recorrido; solo asoma al pie del prólogo en móvil).
- ✅ **Sacos:** costuras en el sombreador (`CUERO.costuras`).
- **Chapa:** con la luz de la maqueta apenas se ven las ondas; con el sol y los fluorescentes deberían aparecer los reflejos lineales de `02`. *(Iteración 2: gris acero, metal 0,3; las ondas se leen. Los reflejos lineales de los fluorescentes dependen de la luz horneada.)*

- Materiales: ladrillo, acero, chapa, tatami, cuero, malla, lona.
- Sol, fluorescentes, refuerzo de la jaula, entorno, neblina, haces de luz, polvo, postproceso.
- Decidir y, si procede, aplicar luz precalculada en Blender (ver `09`).
- Agentes: `luz-y-materiales` (con el hilo principal), `revisor-visual` en cada iteración.

**Criterios de aceptación:**
- [x] Lista de comprobación de `02` cumplida en todos los planos, salvo los reflejos de los fluorescentes en el tatami, que apenas se ven (punto medio para que el fondo no se vea gris).
- [ ] **Aprobación de Luis** sobre capturas de los 7 planos.
- [x] FPS en escritorio: 56–60 a 1920 × 855 con atmósfera y postproceso (medición preliminar; ver `06`).

**Fase 3 terminada el 2026-10-10.** Resultado:
- Pendientes heredados resueltos (HDRI sustituido por entorno capturado de la nave, ladrillo, costuras).
- Luz en tiempo real (sol por huecos reales, AgX, foco de la jaula), materiales con la paleta y luz precalculada en Blender (suelo, muros, cubierta; proceso en `03`).
- Atmósfera (neblina, haces, polvo) y postproceso en trozo diferido.
- Pendiente para más adelante: profundidad de campo y ajuste fino (fase 6); rótulos BOXRUS en los postes de la jaula (fase 4, decidido por Luis); reflejos de los tubos en el tatami.
- HDRI de `public/entorno/` retirado del repo (decisión de Luis).

## Fase 4 · Interfaz y contenido
- Contenido ficticio completo en `src/content/`: horario semanal, 6 disciplinas, 4–6 premios inventados, 12–18 imágenes de galería (capturas de la escena), ubicación ficticia.
- Interfaz de cada parada con resúmenes del contenido.
- Páginas `/horario`, `/clases`, `/galeria` (con visor accesible), `/premios`, `/ubicacion` (mapa bajo demanda).
- Cabecera, «Saltar recorrido», indicador de progreso, secciones finales y pie.
- Rótulos **BOXRUS** verticales en los 8 acolchados de los postes de la jaula, en blanco con detalle rojo (`02`, `03`, `04`). Asignado a esta fase por Luis el 2026-10-10.
- Agente: `interfaz`.

**Criterios de aceptación:**
- [ ] Cambiar un dato en `src/content/` actualiza landing y página sin tocar código.
- [ ] Navegación completa con teclado; horario como tabla accesible.
- [ ] **Aprobación de Luis** de textos y diseño.

## Fase 5 · Rendimiento, accesibilidad y alternativas
- Niveles de calidad y ajuste automático.
- Pósters de los 7 planos y versión estática.
- Datos estructurados `ExerciseGym`, Open Graph, sitemap.
- Agente: `auditor-rendimiento`.

**Criterios de aceptación:**
- [ ] Presupuestos de `06` cumplidos (o desviaciones aprobadas y anotadas en `09`).
- [ ] Versión estática revisada con movimiento reducido y sin WebGL.

## Fase 6 · Pulido y publicación
- Ajuste fino de curvas, tiempos, haces de luz, polvo, bloom y grano.
- Revisión de código completa (`/code-review`).
- Página de créditos (OpenStreetMap y recursos CC BY).
- Despliegue a producción **con aprobación explícita**.

**Criterios de aceptación:**
- [ ] Revisión visual final aprobada por Luis.
- [ ] Producción comprobada en escritorio y móvil reales.

## Después: paso a un gimnasio real
Lista de lo que cambiaría (para el proyecto futuro): contenido de `src/content/`, fotos reales en la galería, marca y paleta del gimnasio, ajuste de la nave a su espacio real (o mantener la ficticia), quitar `noindex`, dominio propio.
