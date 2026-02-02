import { defineConfig } from 'tsup';

export default defineConfig([
  // Main library bundle
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
    treeshake: true,
    splitting: false,
    outDir: 'dist',
    external: ['react', '@angular/core'],
    esbuildOptions(options) {
      options.banner = {
        js: '"use client"',
      };
    },
  },
  // React adapter bundle
  {
    entry: { react: 'src/react.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    minify: true,
    treeshake: true,
    splitting: false,
    outDir: 'dist',
    external: ['react', 'cinematic-renderer2d'],
    esbuildOptions(options) {
      options.banner = {
        js: '"use client"',
      };
      options.jsx = 'automatic';
    },
  },
  // Angular adapter bundle
  {
    entry: { angular: 'src/angular.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    minify: true,
    treeshake: true,
    splitting: false,
    outDir: 'dist',
    external: ['@angular/core', '@angular/common', 'rxjs', 'zone.js', 'cinematic-renderer2d'],
  },
]);