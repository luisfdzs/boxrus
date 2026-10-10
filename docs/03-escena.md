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
- El vidrio es emisivo y algo sobreexpuesto: el exterior no se modela. *(Fase 3, iteración 2:)* vidrio y perfilería retranqueados 0,18 m dentro del hueco (`VENTANALES.retranqueo`), para que se vea el canto del muro; emisivo 7 con un degradado vertical por hoja, frío y luminoso arriba (`#dce8f8`), cálido y más tenue abajo (`#a8865f`), y ±4 % de brillo entre hojas con semilla (`LUZ.vidrio`). Con 2,4 y un solo color se leían como papel blanco.

## La jaula (octógono)
| Elemento | Valor |
|---|---|
| Centro | (0, 0, −20) |
| Plataforma | octógono regular, radio a vértices 4,9 m (~9 m entre caras), altura 0,6 m |
| Faldón | negro, de la plataforma al suelo, ligeramente retranqueado |
| Postes | 8, en los vértices; acolchado negro de Ø 0,3 m hasta `y = 2,5` |
| Malla | eslabones de acero (textura con alfa por código, rombo de 6 cm y alambre de Ø 5 mm), de `y = 0,75` a `y = 2,35`. Acero medio mate (`#8a9096`, metal 0,5, rugosidad 0,55); la cobertura del alfa crece con la inclinación de la vista (los alambres se solapan), así que los paños oblicuos se leen como un velo gris y el frontal deja ver la jaula |
| Cable superior | acolchado negro a `y = 2,45` |
| Puertas | 2, en las caras que miran a la diagonal delantera izquierda (−X, +Z) y trasera derecha (+X, −Z); hueco libre de 1,2 m centrado en la cara. Los vértices están a 22,5° + k·45° para que haya caras mirando a las diagonales |
| Lona | gris muy oscuro, mate (`#3a3c3f`, rugosidad 0,92), con desgaste por código en planta (`LONA`: anillo de roce, manchas y rozaduras de pisadas, determinista); la caída del foco del refuerzo hace el resto |
| Rotulación | «BOXRUS» vertical en los 8 acolchados |

## Sacos y bastidores
| Elemento | Valor |
|---|---|
| Saco pesado | cilindro Ø 0,4 m × 1,5 m; base a `y = 0,5` |
| Sacos protagonistas | (−2,2, z −3) y (+2,2, z −3) *(fase 1: en (±7, −2) quedaban fuera del plano del prólogo)*, colgados de una viga auxiliar tendida entre los pórticos de `z = +2` y `z = −4`; cadena hasta `y = 6,5` |
| Bastidor izquierdo | estructura de acero a lo largo de `x = −16,5`, de `z = −8` a `z = −32`, altura 3,2 m |
| Bastidor derecho | igual en `x = +16,5` |
| Sacos en bastidores | 9 por lado, cada 3 m (`z = −8, −11, … −32`), cadena corta de 4 ramales |
| Peras | una plataforma de pera de velocidad en cada extremo de cada bastidor; una pera loca (suelo-techo) junto a la primera |
| Movimiento | balanceo muy leve y determinista (desactivado en `?captura=1`) |

## Techo
- Cerchas de acero negro en cada pórtico.
- Correas rojo óxido cada 1,5 m, paralelas a la cumbrera.
- Chapa ondulada gris: normal map senoidal por código, onda de 18 cm de paso y 4 cm de profundidad, bajando por la pendiente. Mipmaps propios que aplanan la onda a distancia (sin ellos, moiré).
- **Fluorescentes**: regletas dobles de 1,5 m colgadas a `y = 6,2`, en 6 filas longitudinales (`x = −13, −8, −3, +3, +8, +13`), una regleta cada 3 m.
- **Refuerzo sobre la jaula**: 4 regletas adicionales formando un cuadrado de 4 m sobre el octógono, a `y = 4,4` (fase 1: a 5,2 se confundían con los ventanales en el picado).

## Paredes
- Ladrillo visto en todo el perímetro, de 0 a 7 m.
- **Marcador de asaltos**: caja negra de 1,2 × 0,5 m en la pared izquierda, centrada en (−17,9, 3,8, −22) *(fase 1: en z = −20 quedaba encajonado entre poste, viga y ventanal; fase 3: subida 0,2 m porque en la parada 1 su borde inferior rozaba la viga del bastidor)*, mirando a +X (hacia la jaula). Dígitos LED de 7 segmentos por geometría propia (`src/lib/marcador.ts`, medidas en `MARCADOR.digitos`): `05:00` en cifras de 0,3 m y el asalto `R1` a la derecha, a 0,55 de escala y alineado por abajo; la R lleva una pata diagonal. Rojo `#ff2a1a` con emisivo moderado (0,9: con más, AgX lo vira a salmón) y segmentos apagados apenas visibles; carcasa negra mate.

## Suelo
- Tatami negro en placas de 1 × 2 m, juntas finas, satinado. *(Fase 3, iteración 2:)* gris base `#1e2225` (`SUELO.colorPlaca`), rugosidad 0,7 multiplicada por el desgaste (≈ 0,60–0,70), reflejo del entorno a 0,3; juntas `#15181b`. En pantalla queda en `#1d2024`–`#2d2f31`, dentro de la paleta.
- Una ligera variación de tono entre placas (determinista, con semilla).
- Desgaste por código: manchas amplias de roce y grano fino (tono y rugosidad, ±14 %), en coordenadas del mundo con tesela de 8 m, para que no se repita placa a placa.

## Atmósfera
- **Polvo en suspensión**: partículas instanciadas muy pequeñas, con movimiento lento y determinista; más densas en los haces de luz. ~2.000 en nivel alto, ~500 en bajo.
- **Haces de luz** desde los ventanales del fondo y laterales hacia +Z y hacia abajo (~30°): geometría de volúmenes con material aditivo y ruido, o postproceso de rayos de luz, según rendimiento.
- Neblina muy ligera en toda la nave para dar aire y profundidad.

## Contenido determinista
- Toda variación (tono de placas, balanceo de sacos, polvo, posición de detalles) sale del generador con semilla.
- **Detalles de vida** (aprobados por Luis el 2026-10-10, **sin saturar**): la nave debe parecer usada, no decorada. Lista cerrada, como máximo estos seis, repartidos en pocos puntos y nunca tapando al protagonista de un plano:
  1. Un par de guantes colgados del gancho de un saco del bastidor derecho, a un lado del saco, visibles en la parada 3. *(Fase 2: del saco de z = −20, no del primero: el de z = −8 queda detrás de la cámara de la parada 3.)*
  2. Una comba enrollada sobre el borde de la plataforma de la jaula, junto a un poste *(fase 2: sobre la lona, por dentro de la malla, junto al poste de 67,5°, en la cara frontal sin puerta; se ve en el picado de la parada 4)*.
  3. Un banco bajo de madera y acero junto al muro izquierdo, con una toalla doblada y una botella de agua sin etiqueta *(fase 2: pasado el extremo del bastidor, en z = −38; entre bastidor y portón no salía en ningún plano)*.
  4. Un par de vendas enrolladas sobre el banco.
  5. Dos o tres balones medicinales en el suelo, junto al extremo del bastidor derecho *(fase 2: tres, de Ø 0,30–0,36 m, en z ≈ −33,5)*.
  6. Unas espinilleras apoyadas en el banco.
  Sin marcas en ningún objeto (solo BOXRUS si hiciera falta). Posiciones en `src/datos/nave.ts`; variación de giro o color con el generador con semilla.
  Hechos por código con primitivas (`src/lib/detalles.ts`, componente `Detalles`), en cinco mallas fusionadas con color por vértice. Banco movido a z = −38 (ver `09`).

## Iluminación (estrategia)
A diferencia de Billaron, la escena es **estática y cerrada**, con pocos objetos repetidos; eso permite más luz real y hace muy rentable la luz precalculada.
1. **Sol**: una luz direccional desde los ventanales del fondo, con una sola sombra de calidad.
2. **Fluorescentes**: caras emisivas en todas las regletas + 4–6 `RectAreaLight` representativas (más las 4 del refuerzo de la jaula en nivel alto).
3. **Entorno**: mapa de entorno **capturado de la propia nave** (fase 3, iteración 2): una cámara cúbica de 128 px en (0, 3, −20) pinta la escena en el primer fotograma, ya con texturas, y pasa a PMREM (`luz/Entorno.tsx`). Sustituye al HDRI genérico, cuyas ventanas y cielo, multiplicados por el Fresnel, ponían gris el tatami a ángulo rasante. Intensidad general 1; por material: tatami y juntas 0,3, hormigón 0,4, lona 0,5, malla 0,6 (`LUZ.entorno.materiales`).
4. **Luz precalculada** ✅ (aprobada por Luis, fase 3): horneada en Blender en suelo, muros y cubierta, con la luz de las regletas y el rebote del día. Los objetos con brillo (sacos, jaula) mantienen luz en tiempo real. Proceso abajo, en «Luz precalculada».
5. Postproceso: bloom selectivo (fluorescentes, ventanales, dígitos), profundidad de campo en planos cercanos, viñeteado, grano sutil, mapeo tonal ACES/AgX con gradación fría.

### Luz en tiempo real: valores actuales (fase 3, iteración 3, con luz horneada)
Todo en `src/datos/luz.ts`. La luz de los fluorescentes en suelo, muros y techo y la oclusión de contacto llegan horneadas: aquí no se persiguen.
| Pieza | Valor |
|---|---|
| Mapeo tonal | AgX, exposición 1,8 (A/B con Neutral en `09`) |
| Sol | `#fff4e2`, 2,5, a ~23° de elevación (dirección `[0,584, 0,391, −0,711]`); sombra PCF de 2048 px, radio 1, sesgo −0,0004, sesgo normal 0,015. Los muros proyectan sombra con su cara exterior (`shadowSide = FrontSide`) |
| Relleno (hemisferio) | cielo `#cfdcea`, suelo `#2a2b2d`, intensidad 0,3 (×0,6 en los materiales con mapa de luz) |
| Refuerzo de la jaula | foco `#e6f2ff` de 130 cd en (0, 6,3, −20), ángulo 0,75, penumbra 0,6, alcance 14 m, **sin sombra** (ver `09`) |
| Emisivos | fluorescentes 4, vidrio 4,5 (con degradado), dígitos `#ff1a0a` a 0,6 |
| Ladrillo | saturación 1,8 y brillo 1,2 en el sombreador (`TEXTURAS.ladrillo`), con el rebote horneado de un blanco algo cálido (`#f2f6fb`) |
| Chapa | `#767a7e`, metal 0,3, rugosidad 0,5; mapa de luz a intensidad 1 (las regletas solo emiten hacia abajo en el horneado) |
| Tatami | rugosidad 0,65 × desgaste, reflejo del entorno 0,35 (con 0,55 y 0,6 el fondo se veía gris) |
| Lona | desgaste 0,8, reflejo del entorno 0,3 |
| Sacos | grano de 0,12 m, relieve 0,15, `normalScale` 0,35, rugosidad 0,5 (`CUERO`) |

## Luz precalculada (Blender)
Tres mapas de luz, proyectados en coordenadas del mundo, **sin segundas UV** (la geometría se genera por código):
| Mapa | Proyección (coordenadas de three) | Resolución | Materiales |
|---|---|---|---|
| `public/luz/luz_suelo.ktx2` | u = (x − xMin) / 36, v = (z − zFondo) / 48 | 768 × 1024 (~4,7 cm/px), sin desenfoque: conserva la oclusión de contacto | tatami, juntas, hormigón |
| `public/luz/luz_techo.ktx2` | igual que el suelo, en planta | 192 × 256 | chapa |
| `public/luz/luz_muros.ktx2` | u = s / 168 (s: recorrido por el perímetro: izquierdo desde la entrada, fondo, derecho, frente), v = y / 9 | 2048 × 112 (~8 cm/px) | muro (ladrillo y piñones) |

El muro de cada caja se elige por el centro de la instancia (`usarLuzHorneada` en `materiales.ts`). En los materiales con mapa, el relleno indirecto del hemisferio se multiplica por `LUZ.horneado.mapas.relleno` (0,4) para no contar dos veces la luz difusa. El sol directo, con su sombra, sigue en tiempo real.

**Proceso** (Blender 5.2.2 LTS portátil, Cycles en CPU; parámetros en `LUZ.horneado`):
1. `node herramientas/blender/recibir.mjs <carpeta>` (receptor local en el puerto 4400).
2. Abrir `/?parada=P&captura=1&exportar=1`: fusiona la geometría por material (sin la malla) y envía `nave.glb` y `parametros.json`. La página marca `data-nave-exportada` al terminar.
3. `blender -b --factory-startup -P herramientas/blender/hornear.py -- <carpeta> 256`: planos destino a 1 cm por delante de cada superficie (invisibles para los rayos, salvo para la cámara: sin ella Cycles hornea a negro) y dos pasadas DIFFUSE sin color:
   - «fluorescentes»: solo la cara inferior de cada regleta emite (fuerza 30, `#f2f6fb`), directa + indirecta;
   - «día»: sol (fuerza 4, 2° de diámetro, la dirección de `LUZ.sol`) y cielo emisivo en los vidrios (fuerza 9, con transparencia para que pase el sol), solo indirecta.
   Unos 15 minutos a 384 muestras en un Ryzen 7 7730U (con el suelo a 768 × 1024).
4. `blender -b --factory-startup -P herramientas/blender/combinar.py -- <carpeta>`: mezcla con `LUZ.horneado.mezcla`, desenfoque por superficie (`LUZ.horneado.desenfoque`: 0 en el suelo, 1 px de radio en muros y techo) y división por una escala común (percentil 99,5; se copia a `LUZ.horneado.mapas.escala`). Escribe PNG con curva sRGB.
5. `toktx --t2 --encode uastc --uastc_quality 2 --zcmp 19 --genmipmap --assign_oetf srgb public/luz/luz_<superficie>.ktx2 <superficie>.png` (1,1 MB los tres; el suelo, 815 KB).

Hay que volver a hornear si cambian la geometría, la dirección del sol o los albedos (`LUZ.horneado.albedos`). Las texturas `.ktx2` no se voltean: v = 0 es la fila de arriba de la imagen (por eso `hornear.py` usa 1 − v en las UV de Blender).
