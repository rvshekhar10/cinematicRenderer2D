/**
 * Integration tests for AssetManager with CinematicRenderer2D
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssetManager } from './AssetManager';
import { CinematicRenderer2D } from '../core/CinematicRenderer2D';
import type { AssetDefinition, CinematicSpec } from '../types';

describe('AssetManager Integration', () => {
  let assetManager: AssetManager;
  let container: HTMLElement;

  beforeEach(() => {
    assetManager = new AssetManager({
      baseUrl: 'https://cdn.example.com/',
      maxConcurrentLoads: 4,
    });

    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    // Mock browser APIs
    vi.stubGlobal('Image', class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      
      set src(value: string) {
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 10);
      }
      
      get width() { return 1920; }
      get height() { return 1080; }
    });

    vi.stubGlobal('Audio', class MockAudio {
      oncanplaythrough: (() => void) | null = null;
      onerror: (() => void) | null = null;
      
      set src(value: string) {
        setTimeout(() => {
          if (this.oncanplaythrough) {
            this.oncanplaythrough();
          }
        }, 10);
      }
      
      load() {}
    });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ test: 'data' }),
      text: () => Promise.resolve('test content'),
    }));
  });

  describe('Cinematic Spec Asset Loading', () => {
    it('should load assets for a complete cinematic spec', async () => {
      const assetDefinitions: AssetDefinition[] = [
        {
          id: 'background-image',
          type: 'image',
          src: 'images/space-background.jpg',
          metadata: { priority: 'critical' },
        },
        {
          id: 'logo-image',
          type: 'image',
          src: 'images/company-logo.png',
          metadata: { priority: 'high' },
        },
        {
          id: 'ambient-audio',
          type: 'audio',
          src: 'audio/space-ambient.mp3',
          metadata: { priority: 'normal' },
        },
        {
          id: 'config-data',
          type: 'json',
          src: 'data/scene-config.json',
          metadata: { priority: 'high' },
        },
        {
          id: 'particle-texture',
          type: 'image',
          src: 'textures/star-particle.png',
          metadata: { priority: 'low' },
          fallback: 'textures/default-particle.png',
        },
      ];

      const progressEvents: any[] = [];
      assetManager.on('progress', (progress) => {
        progressEvents.push(progress);
      });

      const loadedAssets: any[] = [];
      assetManager.on('asset-loaded', (asset) => {
        loadedAssets.push(asset);
      });

      const assets = await assetManager.loadAssets(assetDefinitions);

      // Verify all assets loaded successfully
      expect(assets).toHaveLength(5);
      expect(assets.every(asset => asset.loaded)).toBe(true);
      expect(assets.every(asset => asset.error === null)).toBe(true);

      // Verify progress tracking
      expect(progressEvents.length).toBeGreaterThan(0);
      const finalProgress = progressEvents[progressEvents.length - 1];
      expect(finalProgress.percentage).toBe(100);
      expect(finalProgress.loaded).toBe(5);
      expect(finalProgress.total).toBe(5);

      // Verify loading order (critical and high priority first)
      const criticalAsset = loadedAssets.find(a => a.id === 'background-image');
      const lowPriorityAsset = loadedAssets.find(a => a.id === 'particle-texture');
      const criticalIndex = loadedAssets.indexOf(criticalAsset);
      const lowPriorityIndex = loadedAssets.indexOf(lowPriorityAsset);
      
      expect(criticalIndex).toBeLessThan(lowPriorityIndex);
    });

    it('should handle mixed asset types with proper URL resolution', async () => {
      const assetDefinitions: AssetDefinition[] = [
        {
          id: 'relative-image',
          type: 'image',
          src: 'images/test.jpg', // Should be resolved with baseUrl
        },
        {
          id: 'absolute-image',
          type: 'image',
          src: 'https://external.com/image.jpg', // Should remain unchanged
        },
        {
          id: 'data-url-image',
          type: 'image',
          src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        },
      ];

      const assets = await assetManager.loadAssets(assetDefinitions);

      expect(assets[0].src).toBe('https://cdn.example.com/images/test.jpg');
      expect(assets[1].src).toBe('https://external.com/image.jpg');
      expect(assets[2].src).toStartWith('data:image/png;base64,');
    });

    it('should provide comprehensive asset retrieval methods', async () => {
      const assetDefinitions: AssetDefinition[] = [
        { id: 'image1', type: 'image', src: 'img1.jpg' },
        { id: 'image2', type: 'image', src: 'img2.jpg' },
        { id: 'audio1', type: 'audio', src: 'audio1.mp3' },
        { id: 'json1', type: 'json', src: 'data1.json' },
      ];

      await assetManager.loadAssets(assetDefinitions);

      // Test individual asset retrieval
      const image1 = assetManager.getAsset('image1');
      expect(image1).toBeDefined();
      expect(image1!.type).toBe('image');

      // Test asset existence check
      expect(assetManager.isAssetLoaded('image1')).toBe(true);
      expect(assetManager.isAssetLoaded('nonexistent')).toBe(false);

      // Test getting all assets
      const allAssets = assetManager.getAllAssets();
      expect(allAssets).toHaveLength(4);

      // Test getting assets by type
      const imageAssets = assetManager.getAssetsByType('image');
      const audioAssets = assetManager.getAssetsByType('audio');
      const jsonAssets = assetManager.getAssetsByType('json');

      expect(imageAssets).toHaveLength(2);
      expect(audioAssets).toHaveLength(1);
      expect(jsonAssets).toHaveLength(1);
    });
  });

  describe('Performance and Caching', () => {
    it('should respect concurrent loading limits', async () => {
      const limitedManager = new AssetManager({
        maxConcurrentLoads: 2,
      });

      const assetDefinitions: AssetDefinition[] = Array.from({ length: 6 }, (_, i) => ({
        id: `asset-${i}`,
        type: 'image',
        src: `image-${i}.jpg`,
      }));

      let maxConcurrent = 0;
      let currentConcurrent = 0;

      // Mock Image to track concurrent loads
      vi.stubGlobal('Image', class MockImage {
        onload: (() => void) | null = null;
        
        set src(value: string) {
          currentConcurrent++;
          maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
          
          setTimeout(() => {
            currentConcurrent--;
            if (this.onload) {
              this.onload();
            }
          }, 50);
        }
        
        get width() { return 100; }
        get height() { return 100; }
      });

      await limitedManager.loadAssets(assetDefinitions);

      // Should not exceed the concurrent limit
      expect(maxConcurrent).toBeLessThanOrEqual(2);
    });

    it('should provide cache statistics and management', async () => {
      const assetDefinitions: AssetDefinition[] = [
        { id: 'large-image', type: 'image', src: 'large.jpg' },
        { id: 'small-image', type: 'image', src: 'small.jpg' },
      ];

      await assetManager.loadAssets(assetDefinitions);

      const stats = assetManager.getCacheStats();
      expect(stats.totalAssets).toBe(2);
      expect(stats.cacheSize).toBeGreaterThan(0);
      expect(stats.cacheUtilization).toBeGreaterThan(0);
      expect(stats.cacheUtilization).toBeLessThanOrEqual(1);

      // Test cache clearing
      assetManager.clearCache();
      const clearedStats = assetManager.getCacheStats();
      expect(clearedStats.totalAssets).toBe(0);
      expect(clearedStats.cacheSize).toBe(0);
    });

    it('should handle cache eviction when limits are exceeded', async () => {
      const smallCacheManager = new AssetManager({
        cache: {
          maxSize: 1000, // Very small cache
          evictionStrategy: 'lru',
        },
      });

      const cacheFullEvents: number[] = [];
      smallCacheManager.on('cache-full', (size) => {
        cacheFullEvents.push(size);
      });

      // Load many assets to exceed cache
      const assetDefinitions: AssetDefinition[] = Array.from({ length: 20 }, (_, i) => ({
        id: `asset-${i}`,
        type: 'image',
        src: `asset-${i}.jpg`,
      }));

      await smallCacheManager.loadAssets(assetDefinitions);

      // Should have triggered cache eviction
      expect(cacheFullEvents.length).toBeGreaterThan(0);
      
      const finalStats = smallCacheManager.getCacheStats();
      expect(finalStats.cacheUtilization).toBeLessThanOrEqual(1);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle network failures with retries', async () => {
      let fetchAttempts = 0;
      vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
        fetchAttempts++;
        if (fetchAttempts < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('Success after retries'),
        });
      }));

      const retryManager = new AssetManager({
        defaultRetries: 3,
        defaultTimeout: 1000,
      });

      const definition: AssetDefinition = {
        id: 'retry-test',
        type: 'text',
        src: 'test.txt',
      };

      const assets = await retryManager.loadAssets([definition]);
      
      expect(assets[0].loaded).toBe(true);
      expect(fetchAttempts).toBe(3);
    });

    it('should use fallback assets when primary assets fail', async () => {
      let imageLoadAttempts = 0;
      vi.stubGlobal('Image', class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        
        set src(value: string) {
          imageLoadAttempts++;
          setTimeout(() => {
            if (value.includes('primary') && this.onerror) {
              // Primary asset fails
              this.onerror();
            } else if (this.onload) {
              // Fallback succeeds
              this.onload();
            }
          }, 10);
        }
        
        get width() { return 100; }
        get height() { return 100; }
      });

      const definition: AssetDefinition = {
        id: 'fallback-test',
        type: 'image',
        src: 'primary-image.jpg',
        fallback: 'fallback-image.jpg',
      };

      const errorEvents: any[] = [];
      assetManager.on('asset-error', (assetId, error) => {
        errorEvents.push({ assetId, error });
      });

      const assets = await assetManager.loadAssets([definition]);
      
      expect(assets[0].loaded).toBe(true);
      expect(imageLoadAttempts).toBeGreaterThan(1); // Primary + fallback
    });

    it('should emit appropriate events for failed assets', async () => {
      vi.stubGlobal('Image', class MockImage {
        onerror: (() => void) | null = null;
        
        set src(value: string) {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 10);
        }
      });

      const definition: AssetDefinition = {
        id: 'failing-asset',
        type: 'image',
        src: 'nonexistent.jpg',
      };

      const errorEvents: any[] = [];
      assetManager.on('asset-error', (assetId, error) => {
        errorEvents.push({ assetId, error });
      });

      const assets = await assetManager.loadAssets([definition]);
      
      expect(assets[0].loaded).toBe(false);
      expect(assets[0].error).toBeDefined();
      expect(errorEvents).toHaveLength(1);
      expect(errorEvents[0].assetId).toBe('failing-asset');
    });
  });

  describe('Real-world Usage Patterns', () => {
    it('should handle a typical cinematic scene asset manifest', async () => {
      const sceneAssets: AssetDefinition[] = [
        // Critical assets (must load first)
        {
          id: 'scene-background',
          type: 'image',
          src: 'backgrounds/space-nebula.jpg',
          metadata: { 
            priority: 'critical',
            size: 2048 * 1024, // 2MB
          },
        },
        
        // High priority assets (UI elements)
        {
          id: 'ui-overlay',
          type: 'image',
          src: 'ui/overlay.png',
          metadata: { priority: 'high' },
        },
        {
          id: 'scene-config',
          type: 'json',
          src: 'configs/scene-1.json',
          metadata: { priority: 'high' },
        },
        
        // Normal priority assets (content)
        {
          id: 'ambient-sound',
          type: 'audio',
          src: 'audio/space-ambient.ogg',
          fallback: 'audio/space-ambient.mp3',
          metadata: { priority: 'normal' },
        },
        {
          id: 'particle-atlas',
          type: 'image',
          src: 'textures/particles.png',
          metadata: { priority: 'normal' },
        },
        
        // Low priority assets (optional enhancements)
        {
          id: 'detail-texture',
          type: 'image',
          src: 'textures/detail-overlay.png',
          metadata: { priority: 'low' },
        },
      ];

      const loadingEvents: any[] = [];
      assetManager.on('progress', (progress) => {
        loadingEvents.push({
          type: 'progress',
          percentage: progress.percentage,
          currentAsset: progress.currentAsset,
        });
      });

      assetManager.on('asset-loaded', (asset) => {
        loadingEvents.push({
          type: 'asset-loaded',
          assetId: asset.id,
          priority: asset.metadata.priority,
        });
      });

      const startTime = performance.now();
      const assets = await assetManager.loadAssets(sceneAssets);
      const loadTime = performance.now() - startTime;

      // Verify all assets loaded
      expect(assets).toHaveLength(6);
      expect(assets.every(asset => asset.loaded)).toBe(true);

      // Verify critical assets loaded first
      const assetLoadEvents = loadingEvents.filter(e => e.type === 'asset-loaded');
      const firstLoaded = assetLoadEvents[0];
      expect(firstLoaded.priority).toBe('critical');

      // Verify reasonable load time (should be concurrent)
      expect(loadTime).toBeLessThan(1000); // Should complete quickly in test environment

      // Verify asset retrieval works
      const background = assetManager.getAsset('scene-background');
      const config = assetManager.getAsset('scene-config');
      
      expect(background?.type).toBe('image');
      expect(config?.type).toBe('json');
    });

    it('should integrate with CinematicRenderer2D lifecycle', async () => {
      // Create a minimal spec for testing
      const spec: CinematicSpec = {
        version: '1.0.0',
        engine: {
          targetFps: 60,
          quality: 'auto',
        },
        events: [{
          id: 'intro',
          name: 'Introduction',
          scenes: ['scene1'],
        }],
        scenes: [{
          id: 'scene1',
          name: 'Test Scene',
          duration: 5000,
          layers: [],
        }],
      };

      // Pre-load assets before creating renderer
      const assetDefinitions: AssetDefinition[] = [
        { id: 'bg', type: 'image', src: 'bg.jpg' },
        { id: 'audio', type: 'audio', src: 'audio.mp3' },
      ];

      const assets = await assetManager.loadAssets(assetDefinitions);
      expect(assets.every(asset => asset.loaded)).toBe(true);

      // Create renderer with pre-loaded assets available
      const renderer = new CinematicRenderer2D({
        container,
        spec,
      });

      await renderer.mount();
      
      // Assets should be available to the renderer
      expect(assetManager.getAsset('bg')).toBeDefined();
      expect(assetManager.getAsset('audio')).toBeDefined();

      renderer.destroy();
    });
  });
});