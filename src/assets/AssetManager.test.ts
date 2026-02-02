/**
 * Tests for AssetManager class
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AssetManager } from './AssetManager';
import type { AssetDefinition } from '../types/AssetTypes';

describe('AssetManager', () => {
  let assetManager: AssetManager;

  beforeEach(() => {
    assetManager = new AssetManager();
    
    // Simple mock for fetch
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ test: 'data' }),
      text: () => Promise.resolve('test content'),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    }));
    
    // Simple mock for Image
    vi.stubGlobal('Image', class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      crossOrigin: string | null = null;
      width = 100;
      height = 100;
      
      set src(_value: string) {
        // Simulate immediate success
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 1);
      }
    });
    
    // Simple mock for Audio
    vi.stubGlobal('Audio', class MockAudio {
      oncanplaythrough: (() => void) | null = null;
      onerror: (() => void) | null = null;
      crossOrigin: string | null = null;
      preload = '';
      
      set src(_value: string) {
        setTimeout(() => {
          if (this.oncanplaythrough) this.oncanplaythrough();
        }, 1);
      }
      
      load() {}
    });
    
    // Mock document.createElement for video
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'video') {
        return {
          oncanplaythrough: null,
          onerror: null,
          crossOrigin: null,
          preload: '',
          src: '',
          load: vi.fn(),
        } as any;
      }
      return document.createElement(tagName);
    });
    
    // Mock FontFace
    vi.stubGlobal('FontFace', class MockFontFace {
      constructor(public family: string, public source: ArrayBuffer) {}
      async load() { return this; }
    });
    
    // Mock document.fonts
    Object.defineProperty(document, 'fonts', {
      value: { add: vi.fn() },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    assetManager.clearCache();
  });

  describe('initialization', () => {
    it('should create with default configuration', () => {
      expect(assetManager).toBeDefined();
      expect(assetManager.getAllAssets()).toEqual([]);
    });

    it('should create with custom configuration', () => {
      const customManager = new AssetManager({
        maxConcurrentLoads: 10,
        defaultTimeout: 5000,
        baseUrl: 'https://example.com/',
      });
      
      expect(customManager).toBeDefined();
    });
  });

  describe('basic asset loading', () => {
    it('should load a single image asset', async () => {
      const definition: AssetDefinition = {
        id: 'test-image',
        type: 'image',
        src: '/test.jpg',
      };

      const assets = await assetManager.loadAssets([definition]);
      
      expect(assets).toHaveLength(1);
      expect(assets[0].id).toBe('test-image');
      expect(assets[0].type).toBe('image');
      expect(assets[0].loaded).toBe(true);
      expect(assets[0].error).toBeNull();
    });

    it('should handle JSON assets', async () => {
      const definition: AssetDefinition = {
        id: 'test-json',
        type: 'json',
        src: '/test.json',
      };

      const assets = await assetManager.loadAssets([definition]);
      
      expect(assets[0].data).toEqual({ test: 'data' });
    });

    it('should handle text assets', async () => {
      const definition: AssetDefinition = {
        id: 'test-text',
        type: 'text',
        src: '/test.txt',
      };

      const assets = await assetManager.loadAssets([definition]);
      
      expect(assets[0].data).toBe('test content');
    });
  });

  describe('asset retrieval', () => {
    beforeEach(async () => {
      const definitions: AssetDefinition[] = [
        { id: 'image1', type: 'image', src: '/1.jpg' },
        { id: 'audio1', type: 'audio', src: '/1.mp3' },
      ];
      
      await assetManager.loadAssets(definitions);
    });

    it('should get asset by ID', () => {
      const asset = assetManager.getAsset('image1');
      
      expect(asset).toBeDefined();
      expect(asset!.id).toBe('image1');
      expect(asset!.type).toBe('image');
    });

    it('should return null for non-existent asset', () => {
      const asset = assetManager.getAsset('nonexistent');
      expect(asset).toBeNull();
    });

    it('should check if asset is loaded', () => {
      expect(assetManager.isAssetLoaded('image1')).toBe(true);
      expect(assetManager.isAssetLoaded('nonexistent')).toBe(false);
    });

    it('should get all assets', () => {
      const assets = assetManager.getAllAssets();
      expect(assets).toHaveLength(2);
    });

    it('should get assets by type', () => {
      const imageAssets = assetManager.getAssetsByType('image');
      const audioAssets = assetManager.getAssetsByType('audio');
      
      expect(imageAssets).toHaveLength(1);
      expect(audioAssets).toHaveLength(1);
    });
  });

  describe('cache management', () => {
    it('should track cache size', async () => {
      const definition: AssetDefinition = {
        id: 'test-image',
        type: 'image',
        src: '/test.jpg',
      };

      await assetManager.loadAssets([definition]);
      
      const stats = assetManager.getCacheStats();
      expect(stats.totalAssets).toBe(1);
      expect(stats.cacheSize).toBeGreaterThan(0);
    });

    it('should clear cache', async () => {
      const definition: AssetDefinition = {
        id: 'test-image',
        type: 'image',
        src: '/test.jpg',
      };

      await assetManager.loadAssets([definition]);
      expect(assetManager.getAllAssets()).toHaveLength(1);
      
      assetManager.clearCache();
      expect(assetManager.getAllAssets()).toHaveLength(0);
    });

    it('should remove specific assets', async () => {
      const definitions: AssetDefinition[] = [
        { id: 'keep', type: 'image', src: '/keep.jpg' },
        { id: 'remove', type: 'image', src: '/remove.jpg' },
      ];

      await assetManager.loadAssets(definitions);
      expect(assetManager.getAllAssets()).toHaveLength(2);
      
      const removed = assetManager.removeAsset('remove');
      expect(removed).toBe(true);
      expect(assetManager.getAllAssets()).toHaveLength(1);
      expect(assetManager.getAsset('keep')).toBeDefined();
      expect(assetManager.getAsset('remove')).toBeNull();
    });
  });

  describe('event system', () => {
    it('should add and remove event listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      assetManager.on('progress', callback1);
      assetManager.on('progress', callback2);
      assetManager.off('progress', callback1);
      
      // Trigger an event
      (assetManager as any)._emit('progress', { loaded: 1, total: 1, percentage: 100 });
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('URL resolution', () => {
    it('should resolve relative URLs with base URL', () => {
      const managerWithBase = new AssetManager({
        baseUrl: 'https://cdn.example.com/',
      });

      const definition: AssetDefinition = {
        id: 'test',
        type: 'image',
        src: 'images/test.jpg',
      };

      const asset = (managerWithBase as any)._createAsset(definition);
      expect(asset.src).toBe('https://cdn.example.com/images/test.jpg');
    });

    it('should not modify absolute URLs', () => {
      const managerWithBase = new AssetManager({
        baseUrl: 'https://cdn.example.com/',
      });

      const definition: AssetDefinition = {
        id: 'test',
        type: 'image',
        src: 'https://other.com/test.jpg',
      };

      const asset = (managerWithBase as any)._createAsset(definition);
      expect(asset.src).toBe('https://other.com/test.jpg');
    });
  });

  describe('error handling', () => {
    it('should handle loading errors', async () => {
      // Mock Image to fail
      vi.stubGlobal('Image', class MockImage {
        onerror: (() => void) | null = null;
        
        set src(_value: string) {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 1);
        }
      });

      const definition: AssetDefinition = {
        id: 'failing-image',
        type: 'image',
        src: '/nonexistent.jpg',
      };

      const errorCallback = vi.fn();
      assetManager.on('asset-error', errorCallback);

      const assets = await assetManager.loadAssets([definition]);
      
      expect(assets[0].loaded).toBe(false);
      expect(assets[0].error).toBeDefined();
      expect(errorCallback).toHaveBeenCalled();
    });
  });

  describe('preloading', () => {
    it('should preload single asset', async () => {
      const definition: AssetDefinition = {
        id: 'preload-test',
        type: 'image',
        src: '/preload.jpg',
      };

      const asset = await assetManager.preloadAsset(definition);
      
      expect(asset.loaded).toBe(true);
      expect(asset.id).toBe('preload-test');
      expect(assetManager.getAsset('preload-test')).toBe(asset);
    });
  });
});