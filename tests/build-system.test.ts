/**
 * Build System Tests
 * 
 * Tests that the build system meets all requirements for production distribution.
 * 
 * Requirements: 12.1, 12.2, 12.3
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Build System', () => {
  beforeAll(async () => {
    // Ensure build is up to date
    try {
      await execAsync('npm run build');
    } catch (error) {
      console.error('Build failed:', error);
      throw error;
    }
  });

  describe('Requirement 12.1: ESM and CJS formats with tree-shaking support', () => {
    it('should generate ESM format for main library', () => {
      expect(existsSync('dist/index.js')).toBe(true);
      
      const content = readFileSync('dist/index.js', 'utf-8');
      expect(content).toContain('export');
    });

    it('should generate CJS format for main library', () => {
      expect(existsSync('dist/index.cjs')).toBe(true);
      
      const content = readFileSync('dist/index.cjs', 'utf-8');
      expect(content).toMatch(/module\.exports|exports\./);
    });

    it('should generate ESM format for React adapter', () => {
      expect(existsSync('dist/react.js')).toBe(true);
      
      const content = readFileSync('dist/react.js', 'utf-8');
      expect(content).toContain('export');
    });

    it('should generate CJS format for React adapter', () => {
      expect(existsSync('dist/react.cjs')).toBe(true);
      
      const content = readFileSync('dist/react.cjs', 'utf-8');
      expect(content).toMatch(/module\.exports|exports\./);
    });

    it('should generate ESM format for Angular adapter', () => {
      expect(existsSync('dist/angular.js')).toBe(true);
      
      const content = readFileSync('dist/angular.js', 'utf-8');
      expect(content).toContain('export');
    });

    it('should generate CJS format for Angular adapter', () => {
      expect(existsSync('dist/angular.cjs')).toBe(true);
      
      const content = readFileSync('dist/angular.cjs', 'utf-8');
      expect(content).toMatch(/module\.exports|exports\./);
    });

    it('should support tree-shaking (minified output)', () => {
      const esmContent = readFileSync('dist/index.js', 'utf-8');
      const cjsContent = readFileSync('dist/index.cjs', 'utf-8');
      
      // Minified code should be significantly compressed
      expect(esmContent.length).toBeLessThan(200000); // Less than 200KB
      expect(cjsContent.length).toBeLessThan(200000);
      
      // Should not contain obvious dead code patterns
      expect(esmContent).not.toContain('// This code is never used');
      expect(cjsContent).not.toContain('// This code is never used');
    });

    it('should have sideEffects: false for tree-shaking', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      expect(packageJson.sideEffects).toBe(false);
    });
  });

  describe('Requirement 12.2: TypeScript definitions and source maps', () => {
    it('should generate TypeScript definitions for main library', () => {
      expect(existsSync('dist/index.d.ts')).toBe(true);
      expect(existsSync('dist/index.d.cts')).toBe(true);
      
      const dtsContent = readFileSync('dist/index.d.ts', 'utf-8');
      expect(dtsContent).toContain('export');
      expect(dtsContent).toContain('interface');
    });

    it('should generate TypeScript definitions for React adapter', () => {
      expect(existsSync('dist/react.d.ts')).toBe(true);
      expect(existsSync('dist/react.d.cts')).toBe(true);
      
      const dtsContent = readFileSync('dist/react.d.ts', 'utf-8');
      expect(dtsContent).toContain('export');
    });

    it('should generate TypeScript definitions for Angular adapter', () => {
      expect(existsSync('dist/angular.d.ts')).toBe(true);
      expect(existsSync('dist/angular.d.cts')).toBe(true);
      
      const dtsContent = readFileSync('dist/angular.d.ts', 'utf-8');
      expect(dtsContent).toContain('export');
    });

    it('should generate source maps for all bundles', () => {
      const sourceMapFiles = [
        'dist/index.js.map',
        'dist/index.cjs.map',
        'dist/react.js.map',
        'dist/react.cjs.map',
        'dist/angular.js.map',
        'dist/angular.cjs.map',
        'dist/cli/index.js.map'
      ];

      for (const file of sourceMapFiles) {
        expect(existsSync(file)).toBe(true);
        
        const content = readFileSync(file, 'utf-8');
        const sourceMap = JSON.parse(content);
        expect(sourceMap.sources).toBeDefined();
        expect(sourceMap.sources.length).toBeGreaterThan(0);
      }
    });

    it('should include source map references in bundles', () => {
      const jsFiles = [
        'dist/index.js',
        'dist/index.cjs',
        'dist/react.js',
        'dist/react.cjs',
        'dist/angular.js',
        'dist/angular.cjs'
      ];

      for (const file of jsFiles) {
        const content = readFileSync(file, 'utf-8');
        expect(content).toContain('//# sourceMappingURL=');
      }
    });
  });

  describe('Requirement 12.3: Semantic versioning with changesets', () => {
    it('should have changesets configuration', () => {
      expect(existsSync('.changeset/config.json')).toBe(true);
      
      const config = JSON.parse(readFileSync('.changeset/config.json', 'utf-8'));
      expect(config.access).toBe('public');
      expect(config.baseBranch).toBeDefined();
    });

    it('should have changeset scripts in package.json', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      expect(packageJson.scripts.changeset).toBeDefined();
      expect(packageJson.scripts.version).toBeDefined();
      expect(packageJson.scripts.release).toBeDefined();
    });

    it('should have @changesets/cli as dependency', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      expect(packageJson.devDependencies['@changesets/cli']).toBeDefined();
    });

    it('should follow semantic versioning format', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      const version = packageJson.version;
      
      // Should match semantic versioning pattern (x.y.z)
      expect(version).toMatch(/^\d+\.\d+\.\d+(-.*)?$/);
    });
  });

  describe('Package Configuration', () => {
    it('should have correct package.json exports', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      
      expect(packageJson.main).toBe('./dist/index.cjs');
      expect(packageJson.module).toBe('./dist/index.js');
      expect(packageJson.types).toBe('./dist/index.d.ts');
      
      expect(packageJson.exports['.']).toBeDefined();
      expect(packageJson.exports['./react']).toBeDefined();
      expect(packageJson.exports['./angular']).toBeDefined();
    });

    it('should have CLI binary configured', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      expect(packageJson.bin['cinematic-cli']).toBe('./dist/cli/index.js');
      
      // CLI should be executable
      expect(existsSync('dist/cli/index.js')).toBe(true);
      const cliContent = readFileSync('dist/cli/index.js', 'utf-8');
      expect(cliContent.startsWith('#!/usr/bin/env node')).toBe(true);
    });

    it('should include required files for distribution', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      expect(packageJson.files).toContain('dist');
      expect(packageJson.files).toContain('README.md');
      expect(packageJson.files).toContain('LICENSE');
    });

    it('should have appropriate bundle sizes', () => {
      const files = [
        { path: 'dist/index.js', maxSize: 120 * 1024 },
        { path: 'dist/index.cjs', maxSize: 120 * 1024 },
        { path: 'dist/react.js', maxSize: 90 * 1024 },
        { path: 'dist/react.cjs', maxSize: 90 * 1024 },
        { path: 'dist/angular.js', maxSize: 95 * 1024 },
        { path: 'dist/angular.cjs', maxSize: 95 * 1024 },
        { path: 'dist/cli/index.js', maxSize: 50 * 1024 }
      ];

      for (const { path, maxSize } of files) {
        const stats = statSync(path);
        expect(stats.size).toBeLessThanOrEqual(maxSize);
      }
    });
  });

  describe('Build Scripts', () => {
    it('should have all required build scripts', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      const scripts = packageJson.scripts;
      
      expect(scripts.dev).toBeDefined();
      expect(scripts.build).toBeDefined();
      expect(scripts.test).toBeDefined();
      expect(scripts.lint).toBeDefined();
      expect(scripts.typecheck).toBeDefined();
      expect(scripts.preview).toBeDefined();
      expect(scripts.release).toBeDefined();
    });

    it('should have build validation script', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      expect(packageJson.scripts['validate-build']).toBeDefined();
      expect(packageJson.scripts['build:check']).toBeDefined();
    });

    it('should run validation after build', () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      expect(packageJson.scripts.postbuild).toContain('validate-build');
    });
  });
});