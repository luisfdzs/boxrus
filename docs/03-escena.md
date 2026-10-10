# 03 · Escena

Todas las cifras son **hipótesis de partida** que se validan en la fase de maqueta en bloques (`08-hoja-de-ruta.md`, fase 1). Si cambian, se actualiza este documento.

## Sistema de coordenadas
- Unidades: **metros**, escala real.
- Eje **Y hacia arriba**. Suelo (tatami) en `y = 0`.
- Eje **X** de izquierda a derecha visto desde la entrada.
- Eje **Z** hacia el espectador: la entrada está en `z = +4` y la nave se adentra hacia **Z negativo**.

## Envolvente de la nave
| Elemento | Valor |
|---|---|
| Ancho | 36 m (`x` de −18 a +18) |
| Profundidad | 48 m (`z` de +4 a −44) |
| Altura de alero (muros laterales) | 7,0 m |
| Altura de cumbrera | 9,0 m (cubierta a dos aguas, cumbrera en `x = 0`) |
| Cordón inferior de las cerchas | `y = 6,5` |
| Pórticos (cerchas) | cada 6 m: `z = +2, −4, −10, −16, −22, −28, −34, −40` |
| Pilares interiores | `x = ±10`, en `z = −4, −16, −28, −40`; sección HEB de 0,3 m |
| Muro de entrada | `z = +4`, portón centrado de 5 × 4,5 m |
| Franja de hormigón pulido | de `z = +4` a `z = +1`; desde ahí, tatami |

## Ventanales
- **Muro del fondo** (`z = −44`): fila de 10 ventanales de 2,4 × 2,2 m, alféizar a `y = 3,4`, repartidos en el ancho. Perfilería de acero negro con cuarterones.
- **Muros laterales**: un ventanal alto (2,4 × 1,6 m, alféizar a `y = 4,2`) entre cada par de pórticos.
- El vidrio es emisivo y algo sobreexpuesto: el exterior no se modela (blanco cálido difuso).

## La jaula (octógono)
| Elemento | Valor |
|---|---|
| Centro | (0, 0, −20) |
| Plataforma | octógono regular, radio a vértices 4,9 m (~9 m entre caras), altura 0,6 m |
| Faldón | negro, de la plataforma al suelo, ligeramente retranqueado |
| Postes | 8, en los vértices; acolchado negro de Ø 0,3 m hasta `y = 2,5` |
| Malla | eslabones de acero (textura con alfa), de `y = 0,75` a `y = 2,35` |
| Cable superior | acolchado negro a `y = 2,45` |
| Puertas | 2, en las caras que miran a la diagonal delantera izquierda (−X, +Z) y trasera derecha (+X, −Z) |
| Lona | gris muy oscuro, mate |
| Rotulación | «BOXRUS» vertical en los 8 acolchados |

## Sacos y bastidores
| Elemento | Valor |
|---|---|
| Saco pesado | cilindro Ø 0,4 m × 1,5 m; base a `y = 0,5` |
| Sacos protagonistas | (−7, z −2) y (+7, z −2), colgados de una viga auxiliar tendida entre los pórticos de `z = +2` y `z = −4`; cadena hasta `y = 6,5` |
| Bastidor izquierdo | estructura de acero a lo largo de `x = −16,5`, de `z = −8` a `z = −32`, altura 3,2 m |
| Bastidor derecho | igual en `x = +16,5` |
| Sacos en bastidores | 9 por lado, cada 3 m (`z = −8, −11, … −32`), cadena corta de 4 ramales |
| Peras | una plataforma de pera de velocidad en cada extremo de cada bastidor; una pera loca (suelo-techo) junto a la primera |
| Movimiento | balanceo muy leve y determinista (desactivado en `?captura=1`) |

## Techo
- Cerchas de acero negro en cada pórtico.
- Correas rojo óxido cada 1,5 m, paralelas a la cumbrera.
- Chapa ondulada gris (geometría o normal map ondulado).
- **Fluorescentes**: regletas dobles de 1,5 m colgadas a `y = 6,2`, en 6 filas longitudinales (`x = −13, −8, −3, +3, +8, +13`), una regleta cada 3 m.
- **Refuerzo sobre la jaula**: 4 regletas adicionales formando un cuadrado sobre el octógono.

## Paredes
- Ladrillo visto en todo el perímetro, de 0 a 7 m.
- **Marcador de asaltos**: caja negra de 1,2 × 0,5 m en la pared izquierda, centrada en (−17,9, 3,6, −20), mirando a +X (hacia la jaula). Dígitos LED rojos `05:00` y un indicador de asalto `R1`.

## Suelo
- Tatami negro en placas de 1 × 2 m, juntas finas, satinado (rugosidad media-baja).
- Una ligera variación de tono entre placas (determinista, con semilla).

## Atmósfera
- **Polvo en suspensión**: partículas instanciadas muy pequeñas, con movimiento lento y determinista; más densas en los haces de luz. ~2.000 en nivel alto, ~500 en bajo.
- **Haces de luz** desde los ventanales del fondo y laterales hacia +Z y hacia abajo (~30°): geometría de volúmenes con material aditivo y ruido, o postproceso de rayos de luz, según rendimiento.
- Neblina muy ligera en toda la nave para dar aire y profundidad.

## Contenido determinista
- Toda variación (tono de placas, balanceo de sacos, polvo, posición de detalles) sale del generador con semilla.
- Detalles opcionales (pendientes de aprobación, ver `09`): guantes colgados en el gancho del primer saco del bastidor derecho; una comba sobre el borde de la plataforma.

## Iluminación (estrategia)
A diferencia de Billaron, la escena es **estática y cerrada**, con pocos objetos repetidos; eso permite más luz real y hace muy rentable la luz precalculada.
1. **Sol**: una luz direccional desde los ventanales del fondo, con una sola sombra de calidad.
2. **Fluorescentes**: caras emisivas en todas las regletas + 4–6 `RectAreaLight` representativas (más las 4 del refuerzo de la jaula en nivel alto).
3. **Entorno**: mapa de entorno oscuro y frío para reflejos en tatami, cuero y malla.
4. **Luz precalculada (recomendada para fase 3, ver `09`)**: *baking* en Blender de la arquitectura (ladrillo, techo, suelo) para luz indirecta y oclusión ambiental creíbles; los objetos con brillo (sacos, jaula) mantienen luz en tiempo real.
5. Postproceso: bloom selectivo (fluorescentes, ventanales, dígitos), profundidad de campo en planos cercanos, viñeteado, grano sutil, mapeo tonal ACES/AgX con gradación fría.
