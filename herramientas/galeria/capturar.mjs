// Fotos de la galería: abre Chrome sin ventana, carga cada encuadre de
// planos.json con ?captura=1&camara=… y guarda el lienzo como JPG con su ficha
// YAML en src/content/galeria. Requiere el servidor de desarrollo en marcha.
// Uso (desde la raíz): node herramientas/galeria/capturar.mjs <url-base> [id…]
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PUERTO = 9333;
const ANCHO = 1600;
const ALTO = 1000;
const CALIDAD_JPG = 82;
const DESTINO = 'src/content/galeria';
const PLANOS = JSON.parse(readFileSync(new URL('./planos.json', import.meta.url), 'utf8'));

const [base = 'http://localhost:4321', ...solo] = process.argv.slice(2);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PUERTO}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'boxrus-galeria-'))}`,
  `--window-size=${ANCHO},${ALTO}`,
  '--ignore-gpu-blocklist',
  'about:blank',
]);

try {
  let pagina;
  for (let i = 0; i < 50 && !pagina; i++) {
    await espera(200);
    pagina = await fetch(`http://127.0.0.1:${PUERTO}/json/list`)
      .then((r) => r.json())
      .then((l) => l.find((t) => t.type === 'page'))
      .catch(() => undefined);
  }
  if (!pagina) throw new Error('Chrome no responde');

  const ws = new WebSocket(pagina.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const pendientes = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (pendientes.has(m.id)) pendientes.get(m.id)(m), pendientes.delete(m.id);
  });
  const cdp = (method, params = {}) =>
    new Promise((r) => {
      pendientes.set(++id, r);
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluar = async (expression) =>
    (await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;

  await cdp('Emulation.setDeviceMetricsOverride', { width: ANCHO, height: ALTO, deviceScaleFactor: 1, mobile: false });
  // Sin barra de desplazamiento: si no, el lienzo pierde su ancho (1585 en vez de 1600 px).
  await cdp('Emulation.setScrollbarsHidden', { hidden: true });

  /** Carga un encuadre y devuelve el lienzo en PNG, o nada si no llega a estar listo. */
  const capturar = async (plano) => {
    await cdp('Page.navigate', { url: `${base}/?captura=1&camara=${plano.camara.join(',')}` });
    let lista = false;
    for (let i = 0; i < 150 && !lista; i++) {
      await espera(200);
      lista = (await evaluar('document.documentElement.dataset.naveLista')) === 'si';
    }
    if (!lista) return undefined;
    await espera(800);
    // La recarga de Vite (al guardar cualquier fichero) puede llevarse el lienzo entre medias.
    const datos = await evaluar(`document.querySelector('canvas')?.toDataURL('image/png')`);
    return datos?.startsWith('data:image/png') ? Buffer.from(datos.split(',')[1], 'base64') : undefined;
  };

  for (const [indice, plano] of PLANOS.entries()) {
    if (solo.length && !solo.includes(plano.id)) continue;
    let png;
    for (let intento = 0; intento < 3 && !png; intento++) png = await capturar(plano);
    if (!png) {
      console.error(`${plano.id}: no se pudo capturar`);
      continue;
    }
    await sharp(png).jpeg({ quality: CALIDAD_JPG, mozjpeg: true }).toFile(join(DESTINO, `${plano.id}.jpg`));
    const ficha = [`imagen: ./${plano.id}.jpg`, `alt: ${JSON.stringify(plano.alt)}`, `pie: ${JSON.stringify(plano.pie)}`, `orden: ${indice + 1}`, ...(plano.destacada ? ['destacada: true'] : []), ''];
    writeFileSync(join(DESTINO, `${plano.id}.yaml`), ficha.join('\n'));
    console.log(`${plano.id}: listo`);
  }
  ws.close();
} finally {
  chrome.kill();
}
