import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { join } from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
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
      rollupOptions: {
        input: {
          index: join(__dirname, 'app/renderer/index.html'),
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': join(__dirname, 'app/renderer/src'),
      },
    },
  },
});
