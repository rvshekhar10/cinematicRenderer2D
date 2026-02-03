#!/usr/bin/env node

/**
 * Asset Verification Script
 * Verifies that all assets are present and properly formatted
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function verifyAsset(assetPath, expectedType) {
  const fullPath = path.join(path.dirname(__dirname), assetPath);
  
  if (!fs.existsSync(fullPath)) {
    log(`  ✗ Missing: ${assetPath}`, 'red');
    return false;
  }
  
  const stats = fs.statSync(fullPath);
  const size = formatBytes(stats.size);
  
  log(`  ✓ Found: ${assetPath} (${size})`, 'green');
  
  // Check file size warnings
  if (stats.size > 10 * 1024 * 1024) {
    log(`    ⚠ Warning: File is large (${size}). Consider optimization.`, 'yellow');
  }
  
  return true;
}

function main() {
  log('\n🎨 Cinematic Renderer 2D - Asset Verification\n', 'cyan');
  
  const assets = {
    audio: [
      'public/assets/audio/waves-crashing-397977.mp3'
    ],
    images: [
      'public/assets/images/full-moon-image-in-center-screen.jpg'
    ],
    videos: [
      'public/assets/video/free_milky_way_galaxy_from_ground_with_treeline.mp4'
    ]
  };
  
  let totalAssets = 0;
  let foundAssets = 0;
  
  // Verify audio assets
  log('📢 Audio Assets:', 'blue');
  assets.audio.forEach(asset => {
    totalAssets++;
    if (verifyAsset(asset, 'audio')) foundAssets++;
  });
  
  // Verify image assets
  log('\n🖼️  Image Assets:', 'blue');
  assets.images.forEach(asset => {
    totalAssets++;
    if (verifyAsset(asset, 'image')) foundAssets++;
  });
  
  // Verify video assets
  log('\n🎬 Video Assets:', 'blue');
  assets.videos.forEach(asset => {
    totalAssets++;
    if (verifyAsset(asset, 'video')) foundAssets++;
  });
  
  // Verify directories
  log('\n📁 Directory Structure:', 'blue');
  const directories = [
    'public/assets',
    'public/assets/audio',
    'public/assets/images',
    'public/assets/video',
    'playground/assets',
    'playground/assets/audio',
    'playground/assets/images',
    'playground/assets/video'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(path.dirname(__dirname), dir);
    if (fs.existsSync(fullPath)) {
      log(`  ✓ ${dir}`, 'green');
    } else {
      log(`  ✗ Missing: ${dir}`, 'red');
    }
  });
  
  // Verify documentation
  log('\n📚 Documentation:', 'blue');
  const docs = [
    'ASSETS_GUIDE.md',
    'ASSETS_VERIFICATION.md',
    'ASSETS_SUMMARY.md',
    'public/assets/README.md',
    'public/assets/index.json',
    'playground/assets/README.md'
  ];
  
  docs.forEach(doc => {
    const fullPath = path.join(path.dirname(__dirname), doc);
    if (fs.existsSync(fullPath)) {
      log(`  ✓ ${doc}`, 'green');
    } else {
      log(`  ✗ Missing: ${doc}`, 'red');
    }
  });
  
  // Verify demo spec
  log('\n🎬 Demo Specs:', 'blue');
  const demoSpec = 'playground/examples/night-sky-demo.json';
  const fullPath = path.join(path.dirname(__dirname), demoSpec);
  if (fs.existsSync(fullPath)) {
    log(`  ✓ ${demoSpec}`, 'green');
    
    // Validate JSON
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      JSON.parse(content);
      log(`    ✓ Valid JSON`, 'green');
    } catch (error) {
      log(`    ✗ Invalid JSON: ${error.message}`, 'red');
    }
  } else {
    log(`  ✗ Missing: ${demoSpec}`, 'red');
  }
  
  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log(`\n📊 Summary:`, 'cyan');
  log(`  Assets Found: ${foundAssets}/${totalAssets}`, foundAssets === totalAssets ? 'green' : 'yellow');
  
  if (foundAssets === totalAssets) {
    log('\n✅ All assets verified successfully!', 'green');
    log('🚀 Ready for development and testing!\n', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some assets are missing. Please add them to continue.', 'yellow');
    log('📖 See ASSETS_GUIDE.md for instructions.\n', 'yellow');
    process.exit(1);
  }
}

main();
