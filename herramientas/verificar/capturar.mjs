// Capturas de verificación sin navegador visible (alternativa a la skill
// verificar-visual cuando la extensión de Chrome no está conectada): abre
// Chrome sin ventana y guarda la pantalla de cada ruta en escritorio y móvil.
// En las rutas con la nave espera a `data-nave-lista`. En móvil, los planos se
// cargan con ?paginado=1 en vez de ?captura=1 (que desactiva el scroll por
// paradas y con él la píldora y la interfaz móvil); la escena no es determinista.
// Uso (desde la raíz): node herramientas/verificar/capturar.mjs <url-base> <carpeta> [ruta…]
// (SOLO=escritorio o SOLO=movil para una sola variante)
// Por defecto: los 7 planos del recorrido (?parada=N&captura=1) y las 5 páginas.
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PUERTO = 9334;
const SOLO = process.env.SOLO;
const TAMANOS = {
  escritorio: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  movil: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
};
const PLANOS = ['P', '1', '2', '3', '4', '5', 'E'].map((p) => `/?parada=${p}&captura=1`);
const PAGINAS = ['/horario', '/clases', '/galeria', '/premios', '/ubicacion'];

const [base, carpeta, ...rutas] = process.argv.slice(2);
if (!base || !carpeta) throw new Error('Uso: capturar.mjs <url-base> <carpeta> [ruta…]');
mkdirSync(carpeta, { recursive: true });
const lista = rutas.length ? rutas : [...PLANOS, ...PAGINAS];
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const nombre = (ruta) => (ruta.match(/parada=(\w)/)?.[1] ? `plano-${ruta.match(/parada=(\w)/)[1]}` : ruta.replace(/[^\w]+/g, '') || 'inicio');

const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PUERTO}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'boxrus-verificar-'))}`,
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
  const errores = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (pendientes.has(m.id)) pendientes.get(m.id)(m), pendientes.delete(m.id);
    if (m.method === 'Runtime.exceptionThrown') errores.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errores.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
  });
  const cdp = (method, params = {}) =>
    new Promise((r) => {
      pendientes.set(++id, r);
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluar = async (expression) =>
    (await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;
  await cdp('Runtime.enable');

  for (const [variante, metricas] of Object.entries(TAMANOS)) {
    if (SOLO && SOLO !== variante) continue;
    await cdp('Emulation.setDeviceMetricsOverride', metricas);
    await cdp('Emulation.setTouchEmulationEnabled', { enabled: metricas.mobile, maxTouchPoints: metricas.mobile ? 5 : 0 });
    for (const ruta of lista) {
      errores.length = 0;
      const url = metricas.mobile ? ruta.replace('captura=1', 'paginado=1') : ruta;
      await cdp('Page.navigate', { url: base + url });
      await espera(1500);
      if (await evaluar('!!document.querySelector("canvas") || location.pathname === "/"')) {
        for (let i = 0; i < 150; i++) {
          if ((await evaluar('document.documentElement.dataset.naveLista')) === 'si') break;
          await espera(200);
        }
      }
      await espera(1000);
      const { result } = await cdp('Page.captureScreenshot', { format: 'png' });
      const fichero = join(carpeta, `${variante}-${nombre(ruta)}.png`);
      writeFileSync(fichero, Buffer.from(result.data, 'base64'));
      console.log(`${fichero}${errores.length ? `  ERRORES: ${[...new Set(errores)].join(' | ')}` : ''}`);
    }
  }
  ws.close();
} finally {
  chrome.kill();
}
