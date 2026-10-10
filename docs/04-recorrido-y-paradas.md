# 04 · Recorrido y paradas

El recorrido tiene un **prólogo**, **5 paradas** (una por sección de la web) y un **epílogo**. Cada parada usa un tipo de plano distinto: pared con el marcador, dentro de la jaula, travelling lateral, picado desde las cerchas y contraluz en los ventanales.

Coordenadas en el sistema de `03-escena.md`. Posiciones y encuadres son **hipótesis**; se ajustan en la fase de maqueta y se anotan aquí.

## Resumen

| # | Sección | Elemento | Tipo de plano | Cámara (x, y, z) | Mira a (x, y, z) | Focal aprox. |
|---|---|---|---|---|---|---|
| P | Prólogo: la entrada | Jaula + sacos | Simétrico desde el portón, cámara baja | (0,0, 1,3, 2,5) | (0,0, 1,6, −30,0) | 24 mm |
| 1 | Horario | Marcador de asaltos | Tres cuartos hacia la pared izquierda | (−9,5, 2,2, −14,0) | (−17,9, 3,4, −20,5) | 35 mm |
| 2 | Clases | Interior de la jaula | Gran angular desde dentro, a través de la malla | (−2,8, 1,75, −18,4) | (3,2, 1,3, −21,8) | 20 mm |
| 3 | Galería | Sacos del bastidor derecho | Travelling lateral paralelo a la fila | (12,5, 1,6, −12,0) | (16,5, 1,3, −18,0) | 35 mm |
| 4 | Premios | La jaula desde arriba | Picado desde las cerchas | (0,0, 5,6, −12,5) | (0,0, 0,6, −20,5) | 24 mm |
| 5 | Ubicación | Ventanales del fondo | Contraluz con haces de luz | (3,0, 1,6, −34,5) | (−1,0, 3,8, −44,0) | 28 mm |
| E | Epílogo | Un ventanal | Avance hacia la luz, fundido a blanco | (0,0, 4,4, −42,5) | (0,0, 4,4, −50,0) | 35 mm |

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

## Reglas de coreografía
- **Tramos:** 7 (P, 1–5, E). Cada parada tiene una **zona de pausa** (~40 % del tramo) con deriva lenta de cámara y la interfaz visible; el resto es transición.
- **Trayectoria:** curvas suaves (Catmull-Rom o Bézier) para posición y punto de mira, independientes; velocidad angular limitada.
- **Colisiones:** la cámara nunca atraviesa sacos, cadenas, pilares, bastidores, la malla de la jaula (salvo por las puertas) ni las regletas. Prueba automática obligatoria.
- **Entrada y salida de la jaula** solo por las puertas: es la transición más delicada del recorrido.
- **Reversible:** subir el scroll deshace exactamente el recorrido.
- **Ajuste a paradas:** suave y solo cuando el usuario deja de hacer scroll. A validar en uso real.
- **Indicador de progreso:** «01 / 05» con el nombre de la sección y puntos clicables.

## Encuadres en móvil (vertical)
Cada parada define un **encuadre alternativo** para pantalla vertical: más campo de visión o más distancia, y el elemento protagonista desplazado hacia arriba para dejar la interfaz abajo. Se ajusta en la fase de maqueta con capturas en 390 × 844.

## Modo de captura (necesario para verificar)
- `/?parada=N` (N = `P`, `1`…`5`, `E`) coloca la cámara directamente en esa parada.
- `/?captura=1` desactiva animaciones, deriva, balanceo de sacos, polvo animado, grano y toda aleatoriedad.
- `/?depuracion=1` muestra la trayectoria, los ejes, el FPS y los avisos de colisión.
