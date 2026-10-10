# 08 · Hoja de ruta

Cada fase termina con **capturas y un resumen para Luis**, que da el visto bueno antes de pasar a la siguiente. Nada de pulir el acabado sin haber aprobado la composición.

Agentes: ver `.claude/agents/` y la política de uso en `.claude/CLAUDE.md`. El hilo principal coordina y hace el trabajo acoplado de escena, luz y cámara; los agentes entran en tareas acotadas o de revisión.

---

## Estado
- Fase 0 ✅ · Fase 1 ✅ (2026-10-10) · **Fase 2 en curso**: texturas por código hechas; propuestas de recursos externos pendientes de aprobación de Luis.

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
- Vigilar el JS de la isla (~302 KB de 350, ver `06`): los cargadores añaden peso.

Punto de partida en una sesión nueva: leer `07` (inventario y herramientas), `03` (medidas y detalles de vida), `06` (presupuestos y estado del peso) y la memoria local del proyecto (capturas y entorno).

**Criterios de aceptación:**
- [ ] Registro de licencias completo.
- [ ] Peso dentro del presupuesto de `06`.

## Fase 3 · Ambiente
- Materiales: ladrillo, acero, chapa, tatami, cuero, malla, lona.
- Sol, fluorescentes, refuerzo de la jaula, entorno, neblina, haces de luz, polvo, postproceso.
- Decidir y, si procede, aplicar luz precalculada en Blender (ver `09`).
- Agentes: `luz-y-materiales` (con el hilo principal), `revisor-visual` en cada iteración.

**Criterios de aceptación:**
- [ ] Lista de comprobación de `02` cumplida en todos los planos.
- [ ] **Aprobación de Luis** sobre capturas de los 7 planos.
- [ ] FPS en escritorio ≥ 60 en nivel alto (medición preliminar).

## Fase 4 · Interfaz y contenido
- Contenido ficticio completo en `src/content/`: horario semanal, 6 disciplinas, 4–6 premios inventados, 12–18 imágenes de galería (capturas de la escena), ubicación ficticia.
- Interfaz de cada parada con resúmenes del contenido.
- Páginas `/horario`, `/clases`, `/galeria` (con visor accesible), `/premios`, `/ubicacion` (mapa bajo demanda).
- Cabecera, «Saltar recorrido», indicador de progreso, secciones finales y pie.
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
