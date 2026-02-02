import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'playground',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'cinematic-renderer2d': resolve(__dirname, 'src/index.ts'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: '../dist-playground',
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: ['fast-check'],
  },
});