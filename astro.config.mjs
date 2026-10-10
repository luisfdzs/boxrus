// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  // La barra de desarrollo se colaría en las capturas de verificación.
  devToolbar: { enabled: false },
});