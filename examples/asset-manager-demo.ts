/**
 * Demo showing the AssetManager loading various asset types
 * with progress tracking, fallbacks, and error handling
 */

import { AssetManager } from '../src/assets/AssetManager';
import type { AssetDefinition } from '../src/types/AssetTypes';

// Create demo container
const container = document.createElement('div');
container.style.width = '800px';
container.style.height = '600px';
container.style.border = '1px solid #ccc';
container.style.position = 'relative';
container.style.backgroundColor = '#f0f0f0';
container.style.fontFamily = 'Arial, sans-serif';
document.body.appendChild(container);

// Create UI elements
const titleDiv = document.createElement('div');
titleDiv.innerHTML = '<h2>Asset Manager Demo</h2>';
titleDiv.style.padding = '20px';
container.appendChild(titleDiv);

const progressDiv = document.createElement('div');
progressDiv.style.padding = '20px';
progressDiv.style.borderBottom = '1px solid #ddd';
container.appendChild(progressDiv);

const assetsDiv = document.createElement('div');
assetsDiv.style.padding = '20px';
assetsDiv.style.height = '400px';
assetsDiv.style.overflowY = 'auto';
container.appendChild(assetsDiv);

const controlsDiv = document.createElement('div');
controlsDiv.style.padding = '20px';
controlsDiv.style.borderTop = '1px solid #ddd';
container.appendChild(controlsDiv);

// Initialize AssetManager
const assetManager = new AssetManager({
  baseUrl: 'https://picsum.photos/', // Using Lorem Picsum for demo images
  maxConcurrentLoads: 3,
  defaultTimeout: 10000,
  cache: {
    maxSize: 50 * 1024 * 1024, // 50MB cache
  },
});

// Demo asset definitions
const demoAssets: AssetDefinition[] = [
  {
    id: 'hero-image',
    type: 'image',
    src: '800/400?random=1',
    metadata: { 
      priority: 'critical',
      size: 100000,
    },
  },
  {
    id: 'background-image',
    type: 'image',
    src: '1200/800?random=2',
    metadata: { 
      priority: 'high',
      size: 200000,
    },
  },
  {
    id: 'thumbnail-1',
    type: 'image',
    src: '200/200?random=3',
    metadata: { priority: 'normal' },
  },
  {
    id: 'thumbnail-2',
    type: 'image',
    src: '200/200?random=4',
    metadata: { priority: 'normal' },
  },
  {
    id: 'thumbnail-3',
    type: 'image',
    src: '200/200?random=5',
    metadata: { priority: 'low' },
  },
  {
    id: 'config-data',
    type: 'json',
    src: 'https://jsonplaceholder.typicode.com/posts/1',
    metadata: { priority: 'high' },
  },
  {
    id: 'failing-asset',
    type: 'image',
    src: 'nonexistent-image.jpg',
    fallback: '300/300?random=fallback',
    metadata: { priority: 'low' },
  },
];

// Progress tracking
let progressBar: HTMLElement;
let progressText: HTMLElement;
let statsDiv: HTMLElement;

function createProgressUI() {
  progressDiv.innerHTML = `
    <div style="margin-bottom: 10px;">
      <strong>Loading Progress:</strong>
    </div>
    <div style="background: #ddd; height: 20px; border-radius: 10px; overflow: hidden; margin-bottom: 10px;">
      <div id="progress-bar" style="background: linear-gradient(90deg, #4CAF50, #45a049); height: 100%; width: 0%; transition: width 0.3s;"></div>
    </div>
    <div id="progress-text">Ready to load...</div>
    <div id="stats" style="margin-top: 10px; font-size: 12px; color: #666;"></div>
  `;
  
  progressBar = document.getElementById('progress-bar')!;
  progressText = document.getElementById('progress-text')!;
  statsDiv = document.getElementById('stats')!;
}

function updateProgress(progress: any) {
  progressBar.style.width = `${progress.percentage}%`;
  progressText.innerHTML = `
    Loading: ${progress.loaded}/${progress.total} assets (${progress.percentage.toFixed(1)}%)
    ${progress.currentAsset ? `<br>Current: ${progress.currentAsset}` : ''}
    ${progress.speed ? `<br>Speed: ${(progress.speed / 1024).toFixed(1)} KB/s` : ''}
    ${progress.estimatedTimeRemaining ? `<br>ETA: ${(progress.estimatedTimeRemaining / 1000).toFixed(1)}s` : ''}
  `;
}

function updateStats() {
  const stats = assetManager.getCacheStats();
  statsDiv.innerHTML = `
    Cache: ${stats.totalAssets} assets, 
    ${(stats.cacheSize / 1024).toFixed(1)} KB used, 
    ${(stats.cacheUtilization * 100).toFixed(1)}% utilization
  `;
}

function displayAsset(asset: any) {
  const assetDiv = document.createElement('div');
  assetDiv.style.marginBottom = '15px';
  assetDiv.style.padding = '10px';
  assetDiv.style.border = '1px solid #ddd';
  assetDiv.style.borderRadius = '5px';
  assetDiv.style.backgroundColor = asset.loaded ? '#f9fff9' : '#fff9f9';
  
  let content = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <strong>${asset.id}</strong>
      <span style="padding: 2px 8px; border-radius: 12px; font-size: 11px; 
                   background: ${asset.loaded ? '#4CAF50' : asset.error ? '#f44336' : '#ff9800'}; 
                   color: white;">
        ${asset.loaded ? 'LOADED' : asset.error ? 'ERROR' : 'LOADING'}
      </span>
    </div>
    <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
      Type: ${asset.type} | Priority: ${asset.metadata.priority || 'normal'}
      ${asset.size ? ` | Size: ${(asset.size / 1024).toFixed(1)} KB` : ''}
    </div>
  `;
  
  if (asset.error) {
    content += `<div style="color: #f44336; font-size: 12px;">Error: ${asset.error.message}</div>`;
  } else if (asset.loaded && asset.data) {
    if (asset.type === 'image' && asset.data instanceof HTMLImageElement) {
      const img = document.createElement('img');
      img.src = asset.data.src;
      img.style.maxWidth = '200px';
      img.style.maxHeight = '150px';
      img.style.border = '1px solid #ddd';
      assetDiv.appendChild(img);
    } else if (asset.type === 'json') {
      content += `<pre style="background: #f5f5f5; padding: 10px; border-radius: 3px; font-size: 11px; overflow: auto; max-height: 100px;">${JSON.stringify(asset.data, null, 2)}</pre>`;
    } else if (asset.type === 'text') {
      content += `<div style="background: #f5f5f5; padding: 10px; border-radius: 3px; font-size: 11px; max-height: 100px; overflow: auto;">${asset.data}</div>`;
    }
  }
  
  assetDiv.innerHTML = content;
  return assetDiv;
}

function displayAssets() {
  assetsDiv.innerHTML = '<h3>Loaded Assets:</h3>';
  
  const assets = assetManager.getAllAssets();
  assets.forEach(asset => {
    assetsDiv.appendChild(displayAsset(asset));
  });
  
  updateStats();
}

// Set up event listeners
assetManager.on('progress', (progress) => {
  updateProgress(progress);
});

assetManager.on('asset-loaded', (asset) => {
  console.log(`✅ Loaded: ${asset.id} (${asset.type})`);
  displayAssets();
});

assetManager.on('asset-error', (assetId, error) => {
  console.error(`❌ Failed: ${assetId} - ${error.message}`);
  displayAssets();
});

assetManager.on('complete', (assets) => {
  console.log(`🎉 All assets loaded! Total: ${assets.length}`);
  progressText.innerHTML = `✅ Complete! Loaded ${assets.length} assets`;
  displayAssets();
});

assetManager.on('cache-full', (size) => {
  console.warn(`⚠️ Cache full: ${(size / 1024).toFixed(1)} KB`);
});

// Create controls
function createControls() {
  controlsDiv.innerHTML = `
    <button id="load-btn" style="padding: 10px 20px; margin-right: 10px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
      Load Demo Assets
    </button>
    <button id="clear-btn" style="padding: 10px 20px; margin-right: 10px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">
      Clear Cache
    </button>
    <button id="preload-btn" style="padding: 10px 20px; margin-right: 10px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;">
      Preload Single Asset
    </button>
    <button id="stats-btn" style="padding: 10px 20px; background: #FF9800; color: white; border: none; border-radius: 5px; cursor: pointer;">
      Show Cache Stats
    </button>
  `;
  
  document.getElementById('load-btn')!.addEventListener('click', loadDemoAssets);
  document.getElementById('clear-btn')!.addEventListener('click', clearCache);
  document.getElementById('preload-btn')!.addEventListener('click', preloadSingleAsset);
  document.getElementById('stats-btn')!.addEventListener('click', showCacheStats);
}

async function loadDemoAssets() {
  console.log('🚀 Starting asset loading...');
  progressText.innerHTML = 'Starting load...';
  
  try {
    const startTime = performance.now();
    await assetManager.loadAssets(demoAssets);
    const loadTime = performance.now() - startTime;
    
    console.log(`⏱️ Total load time: ${loadTime.toFixed(1)}ms`);
  } catch (error) {
    console.error('❌ Load failed:', error);
    progressText.innerHTML = `❌ Load failed: ${error}`;
  }
}

function clearCache() {
  assetManager.clearCache();
  assetsDiv.innerHTML = '<h3>Cache cleared!</h3>';
  progressBar.style.width = '0%';
  progressText.innerHTML = 'Cache cleared. Ready to load...';
  updateStats();
  console.log('🗑️ Cache cleared');
}

async function preloadSingleAsset() {
  const randomId = Math.floor(Math.random() * 1000);
  const asset = await assetManager.preloadAsset({
    id: `preload-${randomId}`,
    type: 'image',
    src: `150/150?random=${randomId}`,
    metadata: { priority: 'normal' },
  });
  
  console.log(`📥 Preloaded: ${asset.id}`);
  displayAssets();
}

function showCacheStats() {
  const stats = assetManager.getCacheStats();
  const assets = assetManager.getAllAssets();
  
  const imageAssets = assetManager.getAssetsByType('image');
  const jsonAssets = assetManager.getAssetsByType('json');
  
  alert(`Cache Statistics:
  
Total Assets: ${stats.totalAssets}
Cache Size: ${(stats.cacheSize / 1024).toFixed(1)} KB
Max Cache Size: ${(stats.maxCacheSize / 1024).toFixed(1)} KB
Cache Utilization: ${(stats.cacheUtilization * 100).toFixed(1)}%

Asset Breakdown:
- Images: ${imageAssets.length}
- JSON: ${jsonAssets.length}
- Other: ${assets.length - imageAssets.length - jsonAssets.length}

Loaded Assets: ${assets.filter(a => a.loaded).length}
Failed Assets: ${assets.filter(a => a.error).length}`);
}

// Initialize the demo
createProgressUI();
createControls();
displayAssets();

console.log('🎬 Asset Manager Demo initialized!');
console.log('- Click "Load Demo Assets" to start loading various asset types');
console.log('- Watch the progress bar and asset list update in real-time');
console.log('- Try clearing the cache and reloading');
console.log('- Use "Preload Single Asset" to add individual assets');
console.log('- Check cache statistics to see memory usage');

// Add some styling
const style = document.createElement('style');
style.textContent = `
  button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  button:active {
    transform: translateY(0);
  }
  
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
`;
document.head.appendChild(style);