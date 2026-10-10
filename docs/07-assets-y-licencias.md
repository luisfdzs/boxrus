# 07 · Assets y licencias

## Política
- Solo recursos **CC0** (preferente) o **CC BY** (con atribución en una página de créditos). Para **tipografías**, también **SIL OFL** (autorizado por Luis el 2026-10-10). OpenStreetMap: ODbL con atribución.
- **Ningún recurso de la imagen de referencia**, ninguna foto de terceros y **ningún logotipo o marca de terceros** (ligas, promotoras, fabricantes de material).
- Todo recurso externo se anota en el registro de abajo **antes** de usarlo.
- Preferencia por **generar por código** lo geométrico o repetitivo.

## Inventario

| Recurso | Origen previsto | Alternativa |
|---|---|---|
| Estructura de la nave (muros, cerchas, correas, pilares, ventanales) | Por código | — |
| Chapa ondulada | Normal map **generado por código** ✅ (fase 2) | Textura CC0 de metal ondulado |
| Ladrillo visto | Red Brick 03 (Poly Haven, CC0) ✅ fase 2 | — |
| Tatami | Material por código (tono por placa y desgaste ✅, fase 2) + textura CC0 de caucho/goma para el relieve | Totalmente por código |
| Hormigón pulido (entrada) | Concrete 034 (ambientCG, CC0) ✅ fase 2. Es hormigón encofrado claro con agujeros de latiguillos: oscurecido y con relieve suave. Fase 3: color `#4e4f50` y reflejo del entorno 0,4; se lee como pulido oscuro (con la exposición nueva salía casi blanco al pie del prólogo en móvil) | Por código |
| Jaula: plataforma, faldón, postes, cable | Por código | Modelo CC0 de octógono si mejora mucho |
| Malla de eslabones | Textura con alfa **generada por código** ✅ (fase 2) | — |
| Saco pesado | Por código: cilindro + grano de cuero en normal map ✅ fase 2 (Leather 011 descartado: es capitoné). Costuras en el sombreador ✅ fase 3 (`CUERO.costuras`) | Modelo CC0 |
| Cadenas | Eslabones instanciados por código | — |
| Bastidores y peras | Por código | Modelo CC0 de pera de velocidad |
| Regletas fluorescentes | Por código (caja + emisivo) | — |
| Marcador de asaltos | Por código; dígitos con **geometría propia** de 7 segmentos (decidido en la fase 2; DSEG, OFL, queda de reserva) | — |
| Detalles de vida (lista cerrada en `03`): guantes, comba, banco con toalla, botella, vendas y espinilleras, balones medicinales | **Todos por código** ✅ fase 2 (`src/lib/detalles.ts`): no se encontraron modelos ligeros con licencia válida | — |
| Mapa de entorno | **Capturado de la propia nave** en tiempo de ejecución (cámara cúbica y PMREM, `luz/Entorno.tsx`) ✅ fase 3, iteración 2. Empty Warehouse 01 (Poly Haven, CC0, reducido a 512 × 256 con `herramientas/reducir_hdr.py`) **ya no se carga** y se retiró del repo el 2026-10-10 (decisión de Luis) | — |
| Tipografías | Fontsource / Google Fonts (OFL), alojadas en el sitio | — |
| Mapa de `/ubicacion` | Teselas de OpenStreetMap (ODbL, atribución obligatoria) vía Leaflet | Enlace externo sin mapa embebido |
| Imágenes de la galería | Capturas de la propia escena | — |

## Formatos y compresión
- Modelos: `.glb` con Draco o Meshopt.
- Texturas y mapas de luz: `.ktx2` (Basis Universal) con mipmaps.
- Tipografías: `woff2`, solo pesos y caracteres usados.

### Herramientas (instaladas el 2026-10-10)
- **Blender 5.2.2 LTS** (portátil, fase 3, para hornear la luz): `%LOCALAPPDATA%\Programs\blender-5.2.2-windows-x64\blender.exe`. Descargado de `download.blender.org` y comprobado con su SHA-256.
- **`herramientas/reducir_hdr.py`**: ejecutar con `python -E -P` (no con `-I`, que desactiva el numpy instalado para el usuario).
- **gltf-transform** (`@gltf-transform/cli` 4.5, dependencia de desarrollo): `npx gltf-transform …`.
- **KTX-Software 4.4.2** (Khronos): `ktx` y `toktx`, que gltf-transform necesita para `.ktx2`. Instalado en la carpeta de programas del usuario y añadido a su `PATH` (ver la memoria local `entorno-local`).

Cadena probada:
```bash
npx gltf-transform resize   entrada.glb a.glb --width 1024 --height 1024   # tope de resolución (06: 2K alto, 1K medio)
npx gltf-transform etc1s    a.glb b.glb      # color y texturas sin mucho detalle (más pequeño)
npx gltf-transform uastc    a.glb b.glb      # normales y texturas con detalle fino (más calidad)
npx gltf-transform meshopt  b.glb salida.glb # geometría (o `draco`)
npx gltf-transform inspect  salida.glb       # comprobar tamaño, extensiones y texturas
```
Las texturas sueltas (sin modelo) se convierten con `toktx --t2 --encode etc1s --genmipmap salida.ktx2 entrada.png` (o `--encode uastc` para normales).

### En el navegador
- `useGLTF` de drei decodifica Meshopt sin configuración; para Draco hay que indicarle el decodificador.
- `.ktx2` necesita el **transcodificador Basis** (`three/examples/jsm/libs/basis/`): copiarlo a `public/basis/` y apuntar ahí `KTX2Loader.setTranscoderPath`. **No** usar la ruta por defecto de drei, que carga desde un CDN externo.

## Registro de licencias

| Recurso | Fichero en el repo | Autor | Fuente (URL) | Licencia | Atribución necesaria | Fecha |
|---|---|---|---|---|---|---|
| Anton (titulares, peso 400, subconjunto latino) | `@fontsource/anton` (npm, se empaqueta en `/_astro/`) | The Anton Project Authors | https://github.com/googlefonts/AntonFont · https://fontsource.org/fonts/anton | SIL OFL 1.1 | No (licencia incluida en el paquete) | 2026-10-10 |
| Inter variable (textos, eje `wght`) | `@fontsource-variable/inter` (npm, se empaqueta en `/_astro/`) | The Inter Project Authors | https://github.com/rsms/inter · https://fontsource.org/fonts/inter | SIL OFL 1.1 | No (licencia incluida en el paquete) | 2026-10-10 |
| Red Brick 03 (ladrillo; color, normal GL, ARM a 1K; normal reducida a 512) | `public/texturas/ladrillo_{color,normal,arm}.ktx2` | Rob Tuytel | https://polyhaven.com/a/red_brick_03 | CC0 | No (cortesía en créditos) | 2026-10-10 |
| Concrete 034 (hormigón de la entrada; color y rugosidad a 1K, normal a 512 × 256) | `public/texturas/hormigon_{color,normal,rugosidad}.ktx2` | ambientCG | https://ambientcg.com/view?id=Concrete034 | CC0 | No (cortesía en créditos) | 2026-10-10 |
| Rubber 004 (solo normal, a 512: relieve del tatami) | `public/texturas/caucho_normal.ktx2` | ambientCG | https://ambientcg.com/view?id=Rubber004 | CC0 | No (cortesía en créditos) | 2026-10-10 |
| Empty Warehouse 01 (HDRI, mapa de entorno; reducido a 512 × 256, RGBE sin RLE, 512 KB / 384 KB con gzip). **Retirado del repo el 2026-10-10**: no se carga desde la fase 3, iteración 2 (entorno capturado de la nave) | Estuvo en `public/entorno/empty_warehouse_01_512.hdr` (MD5 `cc4870deef4a56daed6099bf59d0819a`). Origen: `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/empty_warehouse_01_1k.hdr`, MD5 `ab2931b0191b050b97b1e08ab67b0fb0` | Sergej Majboroda | https://polyhaven.com/a/empty_warehouse_01 | CC0 | No (cortesía en créditos) | 2026-10-10 |
| Transcodificador Basis Universal (código, no asset; copiado de `three/examples/jsm/libs/basis/`) | `public/basis/basis_transcoder.{js,wasm}` | Binomial LLC / three.js | https://github.com/BinomialLLC/basis_universal | Apache 2.0 | No | 2026-10-10 |

Descartados en la fase 2: Leather 011 (ambientCG, CC0) por ser cuero capitoné; modelos de guantes de Sketchfab (CC BY, 85.000 triángulos o más).

### Cómo se generaron los `.ktx2` (fase 2)
```bash
# color (sRGB) y rugosidad/ARM (lineal): ETC1S a 1K
toktx --t2 --encode etc1s --clevel 4 --qlevel 200 --genmipmap --assign_oetf srgb   salida.ktx2 color.jpg
toktx --t2 --encode etc1s --clevel 4 --qlevel 200 --genmipmap --assign_oetf linear salida.ktx2 rugosidad.jpg
# normales: UASTC + zstd reducidas a 512 (a 1K pesaban ~1,3 MB cada una; RDO apenas ahorraba)
toktx --t2 --encode uastc --uastc_quality 2 --zcmp 19 --genmipmap --resize 512x512 --assign_oetf linear salida.ktx2 normal_gl.jpg
```
