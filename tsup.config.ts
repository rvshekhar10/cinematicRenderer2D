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
      // Production optimizations
      options.treeShaking = true;
      options.target = 'es2020';
      options.define = {
        'process.env.NODE_ENV': '"production"'
      };
    },
    // Bundle analysis for tree-shaking verification
    metafile: true,
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
      options.treeShaking = true;
      options.target = 'es2020';
      options.define = {
        'process.env.NODE_ENV': '"production"'
      };
    },
    metafile: true,
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
    esbuildOptions(options) {
      options.treeShaking = true;
      options.target = 'es2020';
      options.define = {
        'process.env.NODE_ENV': '"production"'
      };
    },
    metafile: true,
  },
  // CLI bundle
  {
    entry: { 'cli/index': 'src/cli/index.ts' },
    format: ['esm'],
    dts: false, // No need for type definitions for CLI binary
    sourcemap: true,
    minify: false, // Keep readable for CLI debugging
    treeshake: true,
    splitting: false,
    outDir: 'dist',
    external: [],
    esbuildOptions(options) {
      options.platform = 'node';
      options.target = 'node16';
      options.treeShaking = true;
    },
    onSuccess: async () => {
      // Add shebang manually after build
      const fs = await import('fs');
      const path = await import('path');
      const cliPath = path.join('dist', 'cli', 'index.js');
      const content = fs.readFileSync(cliPath, 'utf-8');
      if (!content.startsWith('#!/usr/bin/env node')) {
        fs.writeFileSync(cliPath, '#!/usr/bin/env node\n' + content);
      }
    },
  },
]);