import { join } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: join(__dirname, 'app/out/main'),
      rollupOptions: {
        input: {
          index: join(__dirname, 'app/main/index.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: join(__dirname, 'app/out/preload'),
      rollupOptions: {
        input: {
          index: join(__dirname, 'app/preload/index.ts'),
        },
      },
    },
  },
  renderer: {
    root: join(__dirname, 'app/renderer'),
    build: {
      outDir: join(__dirname, 'app/out/renderer'),
      rollupOptions: {
        input: {
          index: join(__dirname, 'app/renderer/index.html'),
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': join(__dirname, 'app'),
      },
    },
  },
});
