import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      electron: resolve(__dirname, 'test/mocks/electronMock.js'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    setupFiles: ['./test/mocks/setupTests.js'],
    server: {
      deps: {
        moduleDirectories: ['node_modules', 'app/node_modules'],
      },
    },
  },
});
