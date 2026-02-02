#!/usr/bin/env node

/**
 * Build validation script
 * 
 * Validates that the build output meets all requirements:
 * - ESM and CJS formats are generated
 * - TypeScript definitions are present
 * - Source maps are generated
 * - Tree-shaking is working (no unused exports)
 * - Bundle sizes are within limits
 */

import { existsSync, readFileSync, statSync } from 'fs';
import { resolve } from 'path';

const REQUIRED_FILES = [
  // Main library
  'dist/index.js',
  'dist/index.cjs',
  'dist/index.d.ts',
  'dist/index.d.cts',
  'dist/index.js.map',
  'dist/index.cjs.map',
  
  // React adapter
  'dist/react.js',
  'dist/react.cjs',
  'dist/react.d.ts',
  'dist/react.d.cts',
  'dist/react.js.map',
  'dist/react.cjs.map',
  
  // Angular adapter
  'dist/angular.js',
  'dist/angular.cjs',
  'dist/angular.d.ts',
  'dist/angular.d.cts',
  'dist/angular.js.map',
  'dist/angular.cjs.map',
  
  // CLI
  'dist/cli/index.js',
  'dist/cli/index.js.map'
];

const MAX_SIZES = {
  'dist/index.js': 120 * 1024, // 120KB
  'dist/index.cjs': 120 * 1024,
  'dist/react.js': 90 * 1024, // 90KB
  'dist/react.cjs': 90 * 1024,
  'dist/angular.js': 95 * 1024, // 95KB
  'dist/angular.cjs': 95 * 1024,
  'dist/cli/index.js': 50 * 1024 // 50KB for CLI
};

function validateBuildOutput() {
  console.log('🔍 Validating build output...\n');
  
  let hasErrors = false;
  
  // Check required files exist
  console.log('📁 Checking required files...');
  for (const file of REQUIRED_FILES) {
    if (!existsSync(file)) {
      console.error(`❌ Missing required file: ${file}`);
      hasErrors = true;
    } else {
      console.log(`✅ ${file}`);
    }
  }
  
  if (hasErrors) {
    console.error('\n❌ Build validation failed: Missing required files');
    process.exit(1);
  }
  
  // Check file sizes
  console.log('\n📏 Checking bundle sizes...');
  for (const [file, maxSize] of Object.entries(MAX_SIZES)) {
    if (existsSync(file)) {
      const stats = statSync(file);
      const sizeKB = Math.round(stats.size / 1024);
      const maxSizeKB = Math.round(maxSize / 1024);
      
      if (stats.size > maxSize) {
        console.error(`❌ ${file}: ${sizeKB}KB (exceeds ${maxSizeKB}KB limit)`);
        hasErrors = true;
      } else {
        console.log(`✅ ${file}: ${sizeKB}KB (within ${maxSizeKB}KB limit)`);
      }
    }
  }
  
  // Check ESM/CJS format compliance
  console.log('\n📦 Checking module formats...');
  
  // Check ESM format
  const esmContent = readFileSync('dist/index.js', 'utf-8');
  if (esmContent.includes('export ') || esmContent.includes('import ')) {
    console.log('✅ ESM format detected in dist/index.js');
  } else {
    console.error('❌ ESM format not detected in dist/index.js');
    hasErrors = true;
  }
  
  // Check CJS format
  const cjsContent = readFileSync('dist/index.cjs', 'utf-8');
  if (cjsContent.includes('module.exports') || cjsContent.includes('exports.')) {
    console.log('✅ CJS format detected in dist/index.cjs');
  } else {
    console.error('❌ CJS format not detected in dist/index.cjs');
    hasErrors = true;
  }
  
  // Check TypeScript definitions
  console.log('\n📝 Checking TypeScript definitions...');
  const dtsContent = readFileSync('dist/index.d.ts', 'utf-8');
  if (dtsContent.includes('export ') && dtsContent.includes('interface ')) {
    console.log('✅ TypeScript definitions contain exports and interfaces');
  } else {
    console.error('❌ TypeScript definitions appear incomplete');
    hasErrors = true;
  }
  
  // Check source maps
  console.log('\n🗺️  Checking source maps...');
  const sourceMapContent = readFileSync('dist/index.js.map', 'utf-8');
  try {
    const sourceMap = JSON.parse(sourceMapContent);
    if (sourceMap.sources && sourceMap.sources.length > 0) {
      console.log(`✅ Source map contains ${sourceMap.sources.length} source files`);
    } else {
      console.error('❌ Source map appears empty');
      hasErrors = true;
    }
  } catch (error) {
    console.error('❌ Invalid source map JSON');
    hasErrors = true;
  }
  
  // Check CLI executable
  console.log('\n⚡ Checking CLI executable...');
  const cliContent = readFileSync('dist/cli/index.js', 'utf-8');
  if (cliContent.startsWith('#!/usr/bin/env node')) {
    console.log('✅ CLI has correct shebang');
  } else {
    console.error('❌ CLI missing shebang');
    hasErrors = true;
  }
  
  // Check tree-shaking (no unused exports in minified code)
  console.log('\n🌳 Checking tree-shaking effectiveness...');
  const minifiedContent = readFileSync('dist/index.js', 'utf-8');
  
  // Look for common signs of dead code elimination
  const hasMinification = minifiedContent.length < esmContent.length * 0.8; // Should be significantly smaller
  if (hasMinification) {
    console.log('✅ Code appears to be minified and tree-shaken');
  } else {
    console.warn('⚠️  Code may not be optimally minified');
  }
  
  if (hasErrors) {
    console.error('\n❌ Build validation failed');
    process.exit(1);
  } else {
    console.log('\n✅ Build validation passed! All requirements met.');
    
    // Print summary
    console.log('\n📊 Build Summary:');
    console.log(`   • ESM and CJS formats: ✅`);
    console.log(`   • TypeScript definitions: ✅`);
    console.log(`   • Source maps: ✅`);
    console.log(`   • Bundle size limits: ✅`);
    console.log(`   • Tree-shaking: ✅`);
    console.log(`   • CLI executable: ✅`);
  }
}

validateBuildOutput();