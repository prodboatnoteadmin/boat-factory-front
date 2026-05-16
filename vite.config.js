import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The prototype components reference `React` as a global and register
// themselves on `window`. We keep that pattern: `src/globals.js` puts
// React/ReactDOM/supabase on window before the components load.
export default defineConfig({
  plugins: [react()],
  esbuild: { loader: 'jsx' },
  build: { outDir: 'dist', sourcemap: false },
  server: { port: 5173 },
});
