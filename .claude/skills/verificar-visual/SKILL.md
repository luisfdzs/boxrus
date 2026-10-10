---
name: verificar-visual
description: Captura los 7 planos del recorrido 3D de Boxrus (prólogo, 5 paradas, epílogo) en escritorio y móvil con el modo de captura determinista y los compara con la dirección de arte. Úsala tras cualquier cambio en la escena, la cámara, la luz o la interfaz, o cuando pidan «enséñame cómo queda».
---

# Verificar visualmente el recorrido

## 1. Preparar
1. Comprueba el servidor con `astro dev status`; si no está en marcha, `astro dev --background`. URL base: `http://localhost:4321` (o la URL de previsualización de Vercel si te la indican).
2. Invoca la skill `claude-in-chrome` y abre una pestaña nueva (no reutilices pestañas del usuario).

## 2. Capturar
Para cada plano `N` en `P, 1, 2, 3, 4, 5, E` (o solo los que te pidan):
1. Escritorio: ventana a **1440 × 900**, abre `/?parada=N&captura=1`, espera a que el canvas haya pintado (sin el póster de carga) y haz la captura.
2. Móvil: ventana a **390 × 844**, misma URL, captura.

Si `?parada` o `?captura` no funcionan todavía, dilo en el informe en lugar de capturar a mano con scroll: sin ellos las capturas no son comparables.

## 3. Comparar
Con `docs/02-direccion-de-arte.md` (lista de comprobación y «Evitar») y `docs/04-recorrido-y-paradas.md` (qué debe verse en cada plano):
- ¿El encuadre muestra lo previsto?
- Lista de comprobación punto por punto (atención especial: ninguna marca que no sea BOXRUS, ninguna persona).
- ¿La interfaz superpuesta es legible y no tapa el elemento protagonista?
- Consola del navegador: errores o avisos de WebGL.

## 4. Informar
- Tabla: plano × (encuadre, lista de comprobación, interfaz, consola) con cumple / no cumple.
- Desviaciones concretas ordenadas por gravedad, con la causa probable.
- Las capturas, para que Luis las vea y decida.
- Cierra la pestaña que has abierto.
