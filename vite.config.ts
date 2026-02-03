import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  root: 'playground',
  base: './', // Use relative paths for assets
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
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'playground/index.html'),
        'getting-started': resolve(__dirname, 'playground/getting-started.html'),
      },
    },
  },
  optimizeDeps: {
    include: ['fast-check'],
  },
  plugins: [
    {
      name: 'copy-examples',
      closeBundle() {
        const examplesDir = resolve(__dirname, 'dist-playground/examples');
        if (!existsSync(examplesDir)) {
          mkdirSync(examplesDir, { recursive: true });
        }
        
        // Copy example files
        const examples = [
          'enhanced-story.json',
          'simple-demo-spec.json',
          'story-narration-spec.json',
          'day-night-story-spec.json',
          'night-sky-demo.json',
        ];
        
        examples.forEach(file => {
          const src = resolve(__dirname, 'playground/examples', file);
          const dest = resolve(examplesDir, file);
          if (existsSync(src)) {
            copyFileSync(src, dest);
            console.log(`Copied ${file} to dist-playground/examples/`);
          }
        });
      },
    },
  ],
});