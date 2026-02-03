/**
 * Asset Preloader
 * 
 * Manages preloading of assets before scenes with priority-based loading
 * and progress tracking. Integrates with AssetManager for actual loading.
 * 
 * Requirements: 9.1, 9.2, 9.3
 */

import type { CompiledScene } from '../types/CompiledSpec';
import type { Asset, AssetDefinition } from '../types/AssetTypes';
import { AssetManager } from './AssetManager';

export interface PreloadConfig {
  priority: 'critical' | 'high' | 'normal' | 'low';
  timeout?: number;
  retries?: number;
}

export interface PreloadProgress {
  total: number;
  loaded: number;
  failed: number;
  percentage: number;
}

export class AssetPreloader {
  private assetManager: AssetManager;
  private preloadQueue: Map<string, PreloadConfig> = new Map();
  private cache: Map<string, Asset> = new Map();
  private currentProgress: PreloadProgress = {
    total: 0,
    loaded: 0,
    failed: 0,
    percentage: 0,
  };
  
  constructor(assetManager: AssetManager) {
    this.assetManager = assetManager;
  }
  
  /**
   * Preload assets for a scene
   * Requirement 9.1: Load all required assets before the scene becomes active
   */
  async preloadScene(scene: CompiledScene): Promise<PreloadProgress> {
    // Extract asset IDs from scene layers
    const assetIds: string[] = [];
    
    for (const layer of scene.layers) {
      // Check for asset references in layer config
      if (layer.initialConfig['assetId']) {
        assetIds.push(layer.initialConfig['assetId']);
      }
      if (layer.initialConfig['src']) {
        assetIds.push(layer.initialConfig['src']);
      }
      if (layer.initialConfig['backgroundImage']) {
        assetIds.push(layer.initialConfig['backgroundImage']);
      }
    }
    
    // Extract asset IDs from audio tracks
    for (const audioTrack of scene.audioTracks) {
      if (audioTrack.asset) {
        assetIds.push(audioTrack.asset.id);
      }
    }
    
    // Remove duplicates
    const uniqueAssetIds = Array.from(new Set(assetIds));
    
    // Preload with default config
    return this.preloadAssets(uniqueAssetIds, {
      priority: 'high',
    });
  }
  
  /**
   * Preload specific assets
   * Requirement 9.3: Support priority-based loading
   */
  async preloadAssets(
    assetIds: string[],
    config: PreloadConfig = { priority: 'normal' }
  ): Promise<PreloadProgress> {
    // Initialize progress
    this.currentProgress = {
      total: assetIds.length,
      loaded: 0,
      failed: 0,
      percentage: 0,
    };
    
    // Check which assets are already loaded
    const assetsToLoad: string[] = [];
    
    for (const assetId of assetIds) {
      // Check cache first (Requirement 9.2)
      if (this.cache.has(assetId)) {
        this.currentProgress.loaded++;
        continue;
      }
      
      // Check if already loaded in asset manager
      const existingAsset = this.assetManager.getAsset(assetId);
      if (existingAsset && existingAsset.loaded && !existingAsset.error) {
        this.cache.set(assetId, existingAsset);
        this.currentProgress.loaded++;
        continue;
      }
      
      assetsToLoad.push(assetId);
      this.preloadQueue.set(assetId, config);
    }
    
    // If all assets are already loaded, return immediately
    if (assetsToLoad.length === 0) {
      this.currentProgress.percentage = 100;
      return this.currentProgress;
    }
    
    // Create asset definitions for loading
    const assetDefinitions: AssetDefinition[] = assetsToLoad.map(assetId => ({
      id: assetId,
      type: this._inferAssetType(assetId),
      src: assetId,
      metadata: {
        priority: config.priority,
      },
    }));
    
    // Load assets using AssetManager
    try {
      const loadedAssets = await this.assetManager.loadAssets(assetDefinitions);
      
      // Update cache and progress
      for (const asset of loadedAssets) {
        if (asset.loaded && !asset.error) {
          this.cache.set(asset.id, asset);
          this.currentProgress.loaded++;
        } else {
          this.currentProgress.failed++;
        }
      }
      
      // Update percentage
      this.currentProgress.percentage = 
        (this.currentProgress.loaded / this.currentProgress.total) * 100;
      
    } catch (error) {
      console.error('Error preloading assets:', error);
      this.currentProgress.failed = assetsToLoad.length;
    }
    
    // Clear preload queue
    for (const assetId of assetsToLoad) {
      this.preloadQueue.delete(assetId);
    }
    
    return this.currentProgress;
  }
  
  /**
   * Check if assets are loaded
   * Requirement 9.2: Reuse cached assets
   */
  areAssetsLoaded(assetIds: string[]): boolean {
    for (const assetId of assetIds) {
      // Check cache first
      if (this.cache.has(assetId)) {
        continue;
      }
      
      // Check asset manager
      if (!this.assetManager.isAssetLoaded(assetId)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get preload progress
   */
  getProgress(): PreloadProgress {
    return { ...this.currentProgress };
  }
  
  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.preloadQueue.clear();
    this.currentProgress = {
      total: 0,
      loaded: 0,
      failed: 0,
      percentage: 0,
    };
  }
  
  /**
   * Get cached asset
   */
  getCachedAsset(assetId: string): Asset | null {
    return this.cache.get(assetId) || null;
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cachedAssets: this.cache.size,
      queuedAssets: this.preloadQueue.size,
    };
  }
  
  /**
   * Infer asset type from asset ID/path
   */
  private _inferAssetType(assetId: string): 'image' | 'audio' | 'video' | 'font' | 'json' | 'text' | 'binary' {
    const extension = assetId.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return 'image';
      
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'aac':
      case 'm4a':
        return 'audio';
      
      case 'mp4':
      case 'webm':
      case 'ogv':
        return 'video';
      
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'otf':
        return 'font';
      
      case 'json':
        return 'json';
      
      case 'txt':
      case 'md':
        return 'text';
      
      default:
        return 'binary';
    }
  }
}
