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
| Chapa ondulada | Geometría o normal map generados por código | Textura CC0 de metal ondulado |
| Ladrillo visto | Textura CC0 (ambientCG / Poly Haven) | — |
| Tatami | Material por código + textura CC0 de caucho/goma para el relieve | Totalmente por código |
| Hormigón pulido (entrada) | Textura CC0 | — |
| Jaula: plataforma, faldón, postes, cable | Por código | Modelo CC0 de octógono si mejora mucho |
| Malla de eslabones | Textura con alfa **generada por código** | — |
| Saco pesado | Por código (cilindro con costuras en normal map) + textura CC0 de cuero | Modelo CC0 |
| Cadenas | Eslabones instanciados por código | — |
| Bastidores y peras | Por código | Modelo CC0 de pera de velocidad |
| Regletas fluorescentes | Por código (caja + emisivo) | — |
| Marcador de asaltos | Por código; dígitos con fuente OFL de 7 segmentos o geometría propia | — |
| Detalles de vida (lista cerrada en `03`): guantes, comba, banco con toalla, botella, vendas y espinilleras, balones medicinales | Modelos CC0/CC BY ligeros (low poly) o por código los simples (banco, balones, botella, vendas) | Por código, más esquemáticos |
| Mapa de entorno | HDRI CC0 de interior industrial (Poly Haven), muy reducido | Entorno por código con drei |
| Tipografías | Fontsource / Google Fonts (OFL), alojadas en el sitio | — |
| Mapa de `/ubicacion` | Teselas de OpenStreetMap (ODbL, atribución obligatoria) vía Leaflet | Enlace externo sin mapa embebido |
| Imágenes de la galería | Capturas de la propia escena | — |

## Formatos y compresión
- Modelos: `.glb` con Draco o Meshopt.
- Texturas y mapas de luz: `.ktx2` (Basis Universal) con mipmaps.
- Tipografías: `woff2`, solo pesos y caracteres usados.

### Herramientas (instaladas el 2026-10-10)
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
