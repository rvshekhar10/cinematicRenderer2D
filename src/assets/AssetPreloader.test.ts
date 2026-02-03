/**
 * Unit tests for AssetPreloader
 * 
 * Tests asset preloading, caching, and progress tracking
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssetPreloader } from './AssetPreloader';
import type { AssetManager } from './AssetManager';
import type { CompiledScene } from '../types/CompiledSpec';

describe('AssetPreloader', () => {
  let assetPreloader: AssetPreloader;
  let mockAssetManager: AssetManager;
  
  beforeEach(() => {
    // Create mock asset manager
    mockAssetManager = {
      isAssetLoaded: vi.fn().mockReturnValue(false),
      getAsset: vi.fn().mockReturnValue(null),
      loadAssets: vi.fn().mockImplementation((definitions) => {
        return Promise.resolve(
          definitions.map((def: any) => ({
            id: def.id,
            type: def.type,
            src: def.src,
            loaded: true,
            error: null,
            data: {},
            progress: 1,
          }))
        );
      }),
    } as any;
    
    assetPreloader = new AssetPreloader(mockAssetManager);
  });
  
  describe('preloadAssets', () => {
    it('should preload assets and return progress', async () => {
      const assetIds = ['test-asset-1.png', 'test-asset-2.mp3'];
      
      const progress = await assetPreloader.preloadAssets(assetIds);
      
      expect(progress.total).toBe(2);
      expect(progress.loaded).toBe(2);
      expect(progress.failed).toBe(0);
      expect(progress.percentage).toBe(100);
    });
    
    it('should use cache for already loaded assets', async () => {
      const assetIds = ['test-asset-1.png'];
      
      // First load
      await assetPreloader.preloadAssets(assetIds);
      
      // Reset mock call count
      vi.clearAllMocks();
      
      // Second load should use cache
      const progress = await assetPreloader.preloadAssets(assetIds);
      
      expect(progress.loaded).toBe(1);
      expect(mockAssetManager.loadAssets).not.toHaveBeenCalled();
    });
    
    it('should handle priority-based loading', async () => {
      const assetIds = ['critical-asset.png'];
      
      await assetPreloader.preloadAssets(assetIds, {
        priority: 'critical',
      });
      
      expect(mockAssetManager.loadAssets).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            metadata: expect.objectContaining({
              priority: 'critical',
            }),
          }),
        ])
      );
    });
    
    it('should infer asset types correctly', async () => {
      const assetIds = [
        'image.png',
        'audio.mp3',
        'video.mp4',
        'font.woff2',
        'data.json',
      ];
      
      await assetPreloader.preloadAssets(assetIds);
      
      expect(mockAssetManager.loadAssets).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ type: 'image' }),
          expect.objectContaining({ type: 'audio' }),
          expect.objectContaining({ type: 'video' }),
          expect.objectContaining({ type: 'font' }),
          expect.objectContaining({ type: 'json' }),
        ])
      );
    });
  });
  
  describe('preloadScene', () => {
    it('should extract and preload assets from scene layers', async () => {
      const mockScene: CompiledScene = {
        id: 'test-scene',
        name: 'Test Scene',
        duration: 5000,
        layers: [
          {
            id: 'layer-1',
            type: 'image',
            zIndex: 0,
            instance: null as any,
            animations: [],
            initialConfig: {
              src: 'layer-image.png',
            },
            active: false,
          },
          {
            id: 'layer-2',
            type: 'gradient',
            zIndex: 1,
            instance: null as any,
            animations: [],
            initialConfig: {
              backgroundImage: 'background.jpg',
            },
            active: false,
          },
        ],
        audioTracks: [
          {
            id: 'audio-1',
            type: 'music',
            asset: {
              id: 'music.mp3',
              type: 'audio',
              src: 'music.mp3',
              loaded: true,
              error: null,
              data: null,
              progress: 1,
            },
            startMs: 0,
            endMs: 5000,
            volume: 1,
            fadeIn: 0,
            fadeOut: 0,
            loop: false,
          },
        ],
        startTime: 0,
        endTime: 5000,
      };
      
      const progress = await assetPreloader.preloadScene(mockScene);
      
      expect(progress.total).toBe(3); // 2 images + 1 audio
      expect(mockAssetManager.loadAssets).toHaveBeenCalled();
    });
    
    it('should handle scenes with no assets', async () => {
      const mockScene: CompiledScene = {
        id: 'empty-scene',
        name: 'Empty Scene',
        duration: 1000,
        layers: [],
        audioTracks: [],
        startTime: 0,
        endTime: 1000,
      };
      
      const progress = await assetPreloader.preloadScene(mockScene);
      
      expect(progress.total).toBe(0);
      expect(progress.percentage).toBe(100);
    });
  });
  
  describe('areAssetsLoaded', () => {
    it('should return true when all assets are loaded', async () => {
      const assetIds = ['test-asset-1.png', 'test-asset-2.mp3'];
      
      await assetPreloader.preloadAssets(assetIds);
      
      expect(assetPreloader.areAssetsLoaded(assetIds)).toBe(true);
    });
    
    it('should return false when some assets are not loaded', () => {
      const assetIds = ['not-loaded.png'];
      
      expect(assetPreloader.areAssetsLoaded(assetIds)).toBe(false);
    });
  });
  
  describe('cache management', () => {
    it('should clear cache', async () => {
      await assetPreloader.preloadAssets(['test-asset-1.png']);
      
      assetPreloader.clearCache();
      
      const stats = assetPreloader.getCacheStats();
      expect(stats.cachedAssets).toBe(0);
    });
    
    it('should get cached asset', async () => {
      await assetPreloader.preloadAssets(['test-asset-1.png']);
      
      const cachedAsset = assetPreloader.getCachedAsset('test-asset-1.png');
      expect(cachedAsset).toBeTruthy();
    });
    
    it('should return cache statistics', async () => {
      await assetPreloader.preloadAssets(['test-asset-1.png', 'test-asset-2.mp3']);
      
      const stats = assetPreloader.getCacheStats();
      expect(stats.cachedAssets).toBe(2);
    });
  });
  
  describe('progress tracking', () => {
    it('should track progress during loading', async () => {
      const assetIds = ['asset-1.png', 'asset-2.mp3', 'asset-3.jpg'];
      
      await assetPreloader.preloadAssets(assetIds);
      
      const progress = assetPreloader.getProgress();
      expect(progress.total).toBe(3);
      expect(progress.percentage).toBeGreaterThan(0);
    });
  });
  
  describe('error handling', () => {
    it('should handle loading errors gracefully', async () => {
      mockAssetManager.loadAssets = vi.fn().mockRejectedValue(
        new Error('Loading failed')
      );
      
      const progress = await assetPreloader.preloadAssets(['error-asset.png']);
      
      expect(progress.failed).toBeGreaterThan(0);
    });
  });
});
