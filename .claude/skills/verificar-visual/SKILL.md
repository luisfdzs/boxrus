---
name: verificar-visual
description: Captura los 7 planos del recorrido 3D de Boxrus (prólogo, 5 paradas, epílogo) en escritorio y móvil con el modo de captura determinista y los compara con la dirección de arte. Úsala tras cualquier cambio en la escena, la cámara, la luz o la interfaz, o cuando pidan «enséñame cómo queda».
---

# Verificar visualmente el recorrido

## 1. Preparar
1. `astro dev status`; si no está en marcha, `astro dev --background`. **Usa la URL que devuelva** (puede no ser 4321: en las fases 1 y 2 fue 4322). O la URL de Vercel si te la indican.
   - Si `--background` falla («failed to start within 30s»), lanza `npx astro dev` como tarea en segundo plano de Claude Code y lee la URL de su salida. Al terminar, para la tarea **y comprueba que nadie siga escuchando en el puerto** (en la fase 2 el proceso hijo de Astro sobrevivió y hubo que cerrarlo con `Stop-Process`).
2. Invoca la skill `claude-in-chrome` y abre una pestaña nueva (no reutilices pestañas del usuario).
   - **Si la extensión no está conectada**, usa Chrome sin ventana: `node herramientas/verificar/capturar.mjs <url> <carpeta> [ruta…]` (`SOLO=escritorio` o `SOLO=movil`). Captura los 7 planos y las 5 páginas en 1440 × 900 y 390 × 844 y avisa de errores de consola. En móvil carga `?paginado=1` en lugar de `?captura=1` para ver la interfaz real (píldora); la escena no es determinista. Para revisarlas de un vistazo, monta una hoja de contactos con `sharp`.

## 2. Capturar

### Lo que hay que saber (aprendido en la fase 1)
- **La ventana no se deja redimensionar** a 1440 × 900: `resize_window` no surte efecto (el viewport real es ~1920 × 855). Para tamaños exactos, carga la página **dentro de un iframe** del tamaño deseado.
- **Un solo lienzo WebGL a la vez.** Varios iframes con la escena cuelgan la pestaña (`Runtime.evaluate` se agota a los 45 s). Captura plano a plano reutilizando un único iframe.
- **La recarga automática de Vite** (al guardar cualquier fichero) recarga la página y borra las funciones auxiliares definidas con `javascript_tool`: defínelas en la misma llamada que las usa.
- Si una llamada de JavaScript larga se agota, lanza el trabajo en segundo plano (una función `async` sin `await` que guarde el resultado en `window.resultado`), espera con `computer → wait` y léelo en otra llamada.
- **Si la ventana de Chrome está oculta o minimizada** (`document.visibilityState === 'hidden'`), no hay fotogramas: el lienzo se queda en 300 px y la señal no llega nunca, sin errores. Compruébalo antes de buscar fallos en el código y pide a Luis que restaure la ventana (fase 3).
- Señal de «listo para capturar»: `<html data-nave-lista>` aparece cuando la cámara está colocada y hay fotogramas pintados.
- La barra de desarrollo de Astro está desactivada (`astro.config.mjs`), así que no sale en las capturas.

### Procedimiento
Navega a la URL base y define y usa el auxiliar **en la misma llamada**:
```js
window.uno = async (parada, w, h) => {
  document.documentElement.innerHTML = '<body style="margin:0;background:#333"></body>';
  scrollTo(0, 0); // la página exterior conserva su scroll y desplaza la captura
  const k = Math.min(1, (innerHeight - 10) / h, (innerWidth - 10) / w); // escala para que quepa entero
  const f = document.createElement('iframe');
  f.style.cssText = `width:${w}px;height:${h}px;border:0;display:block;transform-origin:0 0;transform:scale(${k})`;
  f.src = `/?parada=${parada}&captura=1`;
  document.body.appendChild(f);
  // Hasta 15 s: desde la fase 2 la señal espera también a las texturas .ktx2.
  for (let i = 0; i < 75; i++) { await new Promise(r => setTimeout(r, 200)); try { if (f.contentDocument.documentElement.dataset.naveLista) break; } catch {} }
  await new Promise(r => setTimeout(r, 600));
  return { w: w * k, h: h * k }; // tamaño mostrado, en px CSS
};
await uno('P', 1440, 900)
```
Después, `computer → zoom` sobre la región del iframe con `save_to_disk: true`. Ojo: las coordenadas de `zoom` van en el marco de la captura de pantalla, que puede estar reducido respecto a los px CSS (factor = ancho de la captura / `innerWidth`).

Para cada plano `N` en `P, 1, 2, 3, 4, 5, E` (o solo los que te pidan):
1. Escritorio: `uno(N, 1440, 900)` y captura.
2. Móvil: `uno(N, 390, 844)` y captura. Con un ratón el scroll por paradas no se activa: para probarlo, añade `&paginado=1`.

Si `?parada` o `?captura` no funcionan, dilo en el informe en lugar de capturar a mano con scroll: sin ellos las capturas no son comparables.

## 3. Comparar
Con `docs/02-direccion-de-arte.md` (lista de comprobación y «Evitar») y `docs/04-recorrido-y-paradas.md` (qué debe verse en cada plano):
- ¿El encuadre muestra lo previsto?
- Lista de comprobación punto por punto (atención especial: ninguna marca que no sea BOXRUS, ninguna persona).
- ¿La interfaz superpuesta (tarjeta, logotipo arriba, píldora del menú en móvil) es legible y no tapa el elemento protagonista?
- Consola del navegador: errores o avisos de WebGL. El aviso `THREE.Clock: This module has been deprecated` viene de React Three Fiber y es inofensivo.

Para una revisión de composición más a fondo, pásale las rutas de las capturas al agente `revisor-visual` (no necesita navegador).

## 4. Informar
- Tabla: plano × (encuadre, lista de comprobación, interfaz, consola) con cumple / no cumple.
- Desviaciones concretas ordenadas por gravedad, con la causa probable.
- Las capturas (rutas en disco), para que Luis las vea y decida.
- Cierra la pestaña que has abierto.
