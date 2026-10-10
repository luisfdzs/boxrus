# 04 · Recorrido y paradas

El recorrido tiene un **prólogo**, **5 paradas** (una por sección de la web) y un **epílogo**. Cada parada usa un tipo de plano distinto: pared con el marcador, dentro de la jaula, travelling lateral, picado desde las cerchas y contraluz en los ventanales.

Coordenadas en el sistema de `03-escena.md`. La tabla recoge los valores **ajustados en la fase 1** (maqueta en bloques); la fuente de verdad es `src/datos/paradas.ts`.

## Resumen

| # | Sección | Elemento | Tipo de plano | Cámara (x, y, z) | Mira a (x, y, z) | Focal aprox. |
|---|---|---|---|---|---|---|
| P | Prólogo: la entrada | Jaula + sacos | Simétrico desde el portón, cámara baja | (0,0, 1,3, 3,0) | (0,0, 1,6, −30,0) | 27 mm |
| 1 | Horario | Marcador de asaltos | Tres cuartos hacia la pared izquierda | (−9,5, 2,2, −14,0) | (−17,9, 3,2, −22,5) | 35 mm |
| 2 | Clases | Interior de la jaula | Gran angular desde dentro, a través de la malla | (−0,6, 2,1, −19,4) | (3,2, 1,5, −23,2) | 20 mm |
| 3 | Galería | Sacos del bastidor derecho | Travelling lateral paralelo a la fila | (12,5, 1,6, −12,0) | (16,5, 1,3, −18,0) | 35 mm |
| 4 | Premios | La jaula desde arriba | Picado desde las cerchas | (0,0, 5,6, −7,5) | (0,0, 0,6, −20,0) | 22 mm |
| 5 | Ubicación | Ventanales del fondo | Contraluz con haces de luz | (6,0, 1,6, −31,0) | (−1,0, 2,8, −44,0) | 24 mm |
| E | Epílogo | Un ventanal | Avance hacia la luz, fundido a blanco | (1,8, 4,5, −39,5) | (1,8, 4,5, −50,0) | 35 mm |

## Detalle de cada plano

### P · Prólogo: la entrada
- **Encuadre:** desde el portón, cámara baja (1,3 m), composición simétrica. La jaula en el centro, un saco protagonista a cada lado en primer término, los bastidores de sacos en las paredes, las filas de fluorescentes fugando hacia los ventanales del fondo y el tatami reflejando la luz.
- **Movimiento al empezar el scroll:** avance lento por el eje central, entre los dos sacos.
- **Interfaz:**
  - Titular: «Boxrus»
  - Subtítulo: «Entrena donde se forjan los combates.»
  - Texto: «MMA, boxeo y deportes de contacto en una nave de 1.700 m².»
  - Indicación: «Desliza para entrar» + botón «Saltar recorrido».

### 1 · Horario — marcador de asaltos
- **Encuadre:** la cámara gira a la izquierda y se acerca a la pared; los sacos del bastidor izquierdo en primer término desenfocados y, al fondo, el marcador de asaltos con sus dígitos rojos encendidos sobre el ladrillo.
- **Idea:** el tiempo manda en el gimnasio.
- **Interfaz:**
  - Antetítulo: «Horario»
  - Titular: «Cada asalto empieza a su hora.»
  - Contenido: resumen de apertura (lunes a viernes / sábados) y las próximas clases del día.
  - Botón: «Ver horario completo» → `/horario`

### 2 · Clases — dentro de la jaula
- **Encuadre:** la cámara entra por la puerta delantera izquierda y queda dentro del octógono, a la altura de los ojos de alguien de pie sobre la lona. Gran angular: la lona, los postes con BOXRUS y la nave vista a través de la malla.
- **Idea:** aquí es donde se aprende.
- **Interfaz:**
  - Antetítulo: «Clases»
  - Titular: «Seis disciplinas, un mismo tatami.»
  - Contenido: lista breve de disciplinas (boxeo, MMA, muay thai, kickboxing, grappling, preparación física) con su nivel.
  - Botón: «Ver clases» → `/clases`

### 3 · Galería — fila de sacos
- **Encuadre:** la cámara sale de la jaula por la puerta trasera derecha y se coloca junto al bastidor derecho, en paralelo. Durante la pausa avanza muy despacio a lo largo de la fila (travelling lateral de ~2 m): los sacos pasan como fotogramas de una película.
- **Idea:** el gimnasio en imágenes.
- **Interfaz:**
  - Antetítulo: «Galería»
  - Titular: «Lo que pasa aquí dentro.»
  - Contenido: 3 miniaturas de la galería.
  - Botón: «Ver galería» → `/galeria`

### 4 · Premios — la jaula desde arriba
- **Encuadre:** la cámara sube hasta justo debajo de las cerchas y mira la jaula en picado, con los fluorescentes en la parte alta del encuadre y el refuerzo de luz recortando el octógono sobre el tatami oscuro.
- **Idea:** lo más alto.
- **Interfaz:**
  - Antetítulo: «Premios y reconocimientos»
  - Titular: «Lo que hemos ganado, peleando desde aquí.»
  - Contenido: 2–3 reconocimientos destacados.
  - Botón: «Ver todos» → `/premios`

### 5 · Ubicación — los ventanales
- **Encuadre:** la cámara baja y avanza hacia el fondo de la nave, mirando hacia los ventanales en contraluz: haces de luz cruzando el aire, polvo en suspensión, la silueta de la perfilería.
- **Idea:** la salida al mundo: dónde estamos.
- **Interfaz:**
  - Antetítulo: «Ubicación»
  - Titular: «Ven a conocernos.»
  - Contenido: dirección, teléfono y horario de apertura.
  - Botones: «Cómo llegar» (abre la ruta en un servicio de mapas) y «Ver ubicación» → `/ubicacion`

### E · Epílogo
- **Movimiento:** la cámara sube y avanza hacia el ventanal central hasta que la luz llena la pantalla; fundido a blanco y, después, a las secciones HTML finales (llamada a la acción y pie).
- **Interfaz:** «Boxrus. Tu primera clase te espera.» + accesos a las 5 secciones.

Todos los textos y cifras son **borradores ficticios**; ver contenido en `05-arquitectura.md` (colecciones de contenido).

### Ajustes de la fase 1
- **P · Prólogo:** cámara a `z = 3,0` (con la deriva no cabe más cerca del portón) y 27 mm; sacos protagonistas en (±2,2, −3) para el tríptico saco–jaula–saco, también en vertical.
- **1 · Horario:** marcador movido a `z = −22`, en pared limpia. Los sacos quedan a media distancia, no en primer término: el saco cercano caería bajo la tarjeta.
- **2 · Clases:** cámara a `y = 2,1` (ojos de alguien de pie sobre la lona, que está a 0,6 m), por debajo del cable superior al cruzar la puerta. Mira a la puerta trasera: sus dos postes anclan el plano y anticipan la salida. En vertical, un poste centrado (donde irá BOXRUS).
- **3 · Galería:** el travelling avanza hacia **+Z** (2 m): la cámara llega desde la puerta trasera por el sur y así no tiene que dar media vuelta.
- **4 · Premios:** retrasada a `z = −7,5` con 22 mm: el picado abarca la jaula entera y los fluorescentes entran por arriba. El refuerzo de la jaula baja a `y = 4,4` para no confundirse con la banda de ventanales.
- **5 · Ubicación:** en (6, 1,6, −31) con 24 mm: el pilar (−10, −40) entra como silueta a contraluz y se ve más suelo, donde caerán los haces.
- **E · Epílogo:** centrada en el ventanal central (`x = 1,8`; en `x = 0` hay machón) y a `z = −39,5`, con una deriva de 3 m hacia el ventanal mientras funde a blanco.
- **Puntos de paso:** cada transición tiene los suyos en `paradas.ts`; los de las puertas de la jaula se calculan desde `nave.ts`.
- **Velocidad:** cada transición se recorre a ritmo uniforme sobre una «longitud» que suma desplazamiento y giro de la mirada (8 m por radián), con aceleración y frenada suaves. Límite comprobado en pruebas: 36° de giro por cada 1 % de progreso; el pico está al salir por la puerta trasera.

## Reglas de coreografía
- **Tramos:** 7 (P, 1–5, E). Cada parada tiene una **zona de pausa** (~40 % del tramo) con deriva lenta de cámara y la interfaz visible; el resto es transición.
- **Trayectoria:** curvas suaves (Catmull-Rom o Bézier) para posición y punto de mira, independientes; velocidad angular limitada.
- **Colisiones:** la cámara nunca atraviesa sacos, cadenas, pilares, bastidores, la malla de la jaula (salvo por las puertas) ni las regletas. Prueba automática obligatoria.
- **Entrada y salida de la jaula** solo por las puertas: es la transición más delicada del recorrido.
- **Reversible:** subir el scroll deshace exactamente el recorrido.
- **Ajuste a paradas (escritorio):** suave y solo cuando el usuario deja de hacer scroll. A validar en uso real: por ahora desactivado; se prueba con `?ajuste=1`.
- **Scroll por paradas (móvil):** en pantalla táctil y vertical (ancho/alto < 0,8), cada gesto lleva a la parada siguiente o a la anterior, sin posiciones intermedias. El scroll se anima a ritmo constante (2,2 s por transición, en `RECORRIDO.paginadoMovil`) y la trayectoria pone su propia aceleración y frenada, así que la cámara hace el mismo recorrido que con scroll libre. Los gestos durante la animación se ignoran; tras el epílogo, el siguiente gesto lleva al cierre. Se puede forzar en escritorio con `?paginado=1`.
- **Menú de píldora (móvil):** abajo y centrado, con un icono por sección (reloj, octógono, fotografía, trofeo, chincheta). Un toque viaja directo a esa parada: la cámara hace el recorrido completo, pasando por las intermedias sin detenerse, a 1,5 s por tramo (`RECORRIDO.paginadoMovil.segundosPorTramoMenu`). Durante el viaje solo se muestra el texto de la parada de destino; el icono de la sección actual (o de destino) va resaltado. Otro toque a mitad de viaje cambia el destino desde donde esté la cámara. Solo aparece con el scroll por paradas activo.
- **Indicador de progreso:** «01 / 05» con el nombre de la sección y puntos clicables.

## Encuadres en móvil (vertical)
Cada parada define un **encuadre alternativo** para pantalla vertical: más campo de visión o más distancia, y el elemento protagonista desplazado hacia arriba para dejar la interfaz abajo. Se usa cuando la relación ancho/alto es menor que 0,8. Valores de la fase 1 (390 × 844) en `src/datos/paradas.ts` (`movil`); focales entre 14 y 24 mm. En el prólogo vertical los sacos protagonistas quedan fuera de cuadro: se prioriza la jaula.

## Modo de captura (necesario para verificar)
- `/?parada=N` (N = `P`, `1`…`5`, `E`) coloca la cámara directamente en esa parada.
- `/?captura=1` desactiva animaciones, deriva, balanceo de sacos, polvo animado, grano y toda aleatoriedad.
- `/?depuracion=1` muestra la trayectoria, los ejes, el FPS y los avisos de colisión (y expone `window.naveRender` con llamadas de dibujo y triángulos).
- `/?ajuste=1` activa el ajuste a paradas (pregunta abierta 6).
- `/?paginado=1` fuerza el scroll por paradas del móvil (para probarlo en escritorio).
- Cuando la cámara está colocada y hay fotogramas pintados, `<html>` recibe `data-nave-lista`: es la señal para capturar.
