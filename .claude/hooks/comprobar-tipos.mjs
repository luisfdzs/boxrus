// Hook PostToolUse: tras editar .ts/.tsx/.astro ejecuta `astro check` y,
// si hay errores, se los devuelve a Claude (código de salida 2).
import { execSync } from 'node:child_process';

let entrada = '';
process.stdin.on('data', (trozo) => (entrada += trozo));
process.stdin.on('end', () => {
  const fichero = JSON.parse(entrada).tool_input?.file_path ?? '';
  if (!/\.(ts|tsx|astro)$/.test(fichero)) process.exit(0);

  try {
    execSync('npx astro check', { stdio: 'pipe', cwd: process.env.CLAUDE_PROJECT_DIR });
  } catch (error) {
    const salida = `${error.stdout ?? ''}${error.stderr ?? ''}`;
    process.stderr.write(`astro check ha fallado:\n${salida.slice(-4000)}`);
    process.exit(2);
  }
});
