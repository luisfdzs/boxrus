// Receptor local para ?exportar=1: guarda en la carpeta indicada lo que la
// página envía (nave.glb y parametros.json). Solo escucha en localhost.
// Uso: node herramientas/blender/recibir.mjs <carpeta>
import { createServer } from 'node:http';
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const carpeta = process.argv[2];
if (!carpeta) throw new Error('Falta la carpeta de salida');
mkdirSync(carpeta, { recursive: true });
const PERMITIDOS = new Set(['nave.glb', 'parametros.json']);

createServer((pet, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const nombre = basename(new URL(pet.url, 'http://localhost').pathname);
  if (pet.method !== 'POST' || !PERMITIDOS.has(nombre)) return res.writeHead(pet.method === 'OPTIONS' ? 204 : 404).end();
  const trozos = [];
  pet.on('data', (t) => trozos.push(t));
  pet.on('end', () => {
    const datos = Buffer.concat(trozos);
    writeFileSync(join(carpeta, nombre), datos);
    console.log(`${nombre}: ${datos.length} bytes`);
    res.writeHead(200).end('ok');
  });
}).listen(4400, '127.0.0.1', () => console.log(`Receptor en http://localhost:4400 → ${carpeta}`));
