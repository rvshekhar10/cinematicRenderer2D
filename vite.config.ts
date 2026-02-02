import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'playground',
  publicDir: resolve(__dirname, 'public'),
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'cinematic-renderer2d': resolve(__dirname, 'src/index.ts'),
    },
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from the docs directory
      allow: ['..'],
    },
  },
  build: {
    outDir: '../dist-playground',
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: ['fast-check'],
  },
});