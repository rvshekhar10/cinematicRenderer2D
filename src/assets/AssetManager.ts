/**
 * Comprehensive asset management system for preloading and caching resources
 * 
 * This system handles loading, caching, and management of various asset types
 * including images, videos, audio files, fonts, and other resources with
 * fallback handling, progress tracking, and performance optimization.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

import type { 
  Asset, 
  AssetDefinition, 
  AssetType, 
  AssetData, 
  AssetLoadProgress, 
  AssetLoadOptions, 
  AssetCacheConfig, 
  AssetPriority,
  AssetMetadata 
} from '../types/AssetTypes';

export interface AssetManagerConfig {
  /** Maximum number of concurrent downloads */
  maxConcurrentLoads?: number;
  /** Default timeout for asset loading in milliseconds */
  defaultTimeout?: number;
  /** Default number of retry attempts */
  defaultRetries?: number;
  /** Cache configuration */
  cache?: Partial<AssetCacheConfig>;
  /** Base URL for relative asset paths */
  baseUrl?: string;
}

interface AssetManagerInternalConfig {
  maxConcurrentLoads: number;
  defaultTimeout: number;
  defaultRetries: number;
  baseUrl: string;
  cache: AssetCacheConfig;
}

export interface AssetManagerEvents {
  'progress': (progress: AssetLoadProgress) => void;
  'asset-loaded': (asset: Asset) => void;
  'asset-error': (assetId: string, error: Error) => void;
  'complete': (assets: Asset[]) => void;
  'cache-full': (cacheSize: number) => void;
}

export class AssetManager {
  private _assets: Map<string, Asset> = new Map();
  private _eventListeners: Map<keyof AssetManagerEvents, Function[]> = new Map();
  private _loadingQueue: AssetDefinition[] = [];
  private _activeLoads: Set<string> = new Set();
  private _config: AssetManagerInternalConfig;
  private _cacheSize: number = 0;
  private _loadStartTime: number = 0;
  private _loadedBytes: number = 0;
  
  constructor(config: AssetManagerConfig = {}) {
    this._config = {
      maxConcurrentLoads: config.maxConcurrentLoads || 6,
      defaultTimeout: config.defaultTimeout || 30000,
      defaultRetries: config.defaultRetries || 3,
      baseUrl: config.baseUrl || '',
      cache: {
        maxSize: config.cache?.maxSize || 100 * 1024 * 1024, // 100MB
        defaultDuration: config.cache?.defaultDuration || 24 * 60 * 60 * 1000, // 24 hours
        storageType: config.cache?.storageType || 'memory',
        compress: config.cache?.compress || false,
        evictionStrategy: config.cache?.evictionStrategy || 'lru',
      },
    };
  }
  
  /**
   * Load multiple assets with progress tracking and fallback handling
   */
  async loadAssets(definitions: AssetDefinition[]): Promise<Asset[]> {
    if (definitions.length === 0) {
      return [];
    }
    
    this._loadStartTime = performance.now();
    this._loadedBytes = 0;
    
    // Sort by priority
    const sortedDefinitions = this._sortByPriority(definitions);
    
    // Initialize assets
    const assets: Asset[] = sortedDefinitions.map(def => this._createAsset(def));
    assets.forEach(asset => this._assets.set(asset.id, asset));
    
    // Start loading process
    this._loadingQueue = [...sortedDefinitions];
    const loadPromises: Promise<Asset>[] = [];
    
    // Process queue with concurrency limit
    while (this._loadingQueue.length > 0 || this._activeLoads.size > 0) {
      // Start new loads up to concurrency limit
      while (this._loadingQueue.length > 0 && this._activeLoads.size < this._config.maxConcurrentLoads) {
        const definition = this._loadingQueue.shift()!;
        const asset = this._assets.get(definition.id)!;
        
        this._activeLoads.add(definition.id);
        const loadPromise = this._loadSingleAsset(asset, definition);
        loadPromises.push(loadPromise);
        
        // Remove from active loads when complete
        loadPromise.finally(() => {
          this._activeLoads.delete(definition.id);
        });
      }
      
      // Wait for at least one load to complete before continuing
      if (this._activeLoads.size > 0) {
        const activePromises = loadPromises.filter(p => p && !this._isPromiseSettled(p));
        if (activePromises.length > 0) {
          await Promise.race(activePromises);
        }
      }
      
      // Emit progress update
      this._emitProgress();
    }
    
    // Wait for all loads to complete
    const results = await Promise.allSettled(loadPromises);
    const loadedAssets = results
      .filter((result): result is PromiseFulfilledResult<Asset> => result.status === 'fulfilled')
      .map(result => result.value);
    
    this._emit('complete', loadedAssets);
    return loadedAssets;
  }
  
  /**
   * Get a loaded asset by ID
   */
  getAsset(id: string): Asset | null {
    return this._assets.get(id) || null;
  }
  
  /**
   * Check if an asset is loaded
   */
  isAssetLoaded(id: string): boolean {
    const asset = this._assets.get(id);
    return asset ? asset.loaded && !asset.error : false;
  }
  
  /**
   * Get all loaded assets
   */
  getAllAssets(): Asset[] {
    return Array.from(this._assets.values());
  }
  
  /**
   * Get assets by type
   */
  getAssetsByType(type: AssetType): Asset[] {
    return Array.from(this._assets.values()).filter(asset => asset.type === type);
  }
  
  /**
   * Preload a single asset
   */
  async preloadAsset(definition: AssetDefinition): Promise<Asset> {
    const asset = this._createAsset(definition);
    this._assets.set(asset.id, asset);
    
    return this._loadSingleAsset(asset, definition);
  }
  
  /**
   * Clear all cached assets
   */
  clearCache(): void {
    this._assets.clear();
    this._cacheSize = 0;
  }
  
  /**
   * Remove specific asset from cache
   */
  removeAsset(id: string): boolean {
    const asset = this._assets.get(id);
    if (asset) {
      this._cacheSize -= asset.size || 0;
      this._assets.delete(id);
      return true;
    }
    return false;
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      totalAssets: this._assets.size,
      cacheSize: this._cacheSize,
      maxCacheSize: this._config.cache.maxSize,
      cacheUtilization: this._cacheSize / this._config.cache.maxSize,
    };
  }
  
  /**
   * Add event listener
   */
  on<K extends keyof AssetManagerEvents>(event: K, callback: AssetManagerEvents[K]): void {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    this._eventListeners.get(event)!.push(callback);
  }
  
  /**
   * Remove event listener
   */
  off<K extends keyof AssetManagerEvents>(event: K, callback: AssetManagerEvents[K]): void {
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  // Private methods
  
  private _createAsset(definition: AssetDefinition): Asset {
    return {
      id: definition.id,
      type: definition.type,
      src: this._resolveUrl(definition.src),
      data: null,
      loaded: false,
      error: null,
      fallback: definition.fallback,
      progress: 0,
      metadata: this._createDefaultMetadata(definition),
    };
  }
  
  private _createDefaultMetadata(definition: AssetDefinition): AssetMetadata {
    const baseMetadata: AssetMetadata = {
      size: 0,
      mimeType: this._getMimeType(definition.type),
      cacheDuration: this._config.cache.defaultDuration,
      priority: definition.metadata?.priority || 'normal',
    };
    
    return {
      ...baseMetadata,
      ...definition.metadata,
    };
  }
  
  private _resolveUrl(src: string): string {
    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) {
      return src;
    }
    return this._config.baseUrl + src;
  }
  
  private _getMimeType(type: AssetType): string {
    const mimeTypes: Record<AssetType, string> = {
      image: 'image/*',
      video: 'video/*',
      audio: 'audio/*',
      font: 'font/*',
      json: 'application/json',
      binary: 'application/octet-stream',
      text: 'text/plain',
    };
    return mimeTypes[type];
  }
  
  private _sortByPriority(definitions: AssetDefinition[]): AssetDefinition[] {
    const priorityOrder: Record<AssetPriority, number> = {
      critical: 0,
      high: 1,
      normal: 2,
      low: 3,
      lazy: 4,
    };
    
    return [...definitions].sort((a, b) => {
      const aPriority = a.metadata?.priority || 'normal';
      const bPriority = b.metadata?.priority || 'normal';
      return priorityOrder[aPriority] - priorityOrder[bPriority];
    });
  }
  
  private async _loadSingleAsset(asset: Asset, definition: AssetDefinition): Promise<Asset> {
    const options: AssetLoadOptions = {
      timeout: this._config.defaultTimeout,
      retries: this._config.defaultRetries,
      useCache: true,
    };
    
    let lastError: Error | null = null;
    
    // Try loading with retries
    for (let attempt = 0; attempt <= options.retries!; attempt++) {
      try {
        await this._loadAssetData(asset, options);
        asset.loaded = true;
        asset.progress = 1;
        
        // Update cache size
        if (asset.size) {
          this._cacheSize += asset.size;
          this._loadedBytes += asset.size;
        }
        
        // Check cache limits
        this._enforceCache();
        
        this._emit('asset-loaded', asset);
        return asset;
        
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < options.retries!) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    // All retries failed, try fallback
    if (definition.fallback) {
      try {
        const fallbackAsset = { ...asset, src: this._resolveUrl(definition.fallback) };
        await this._loadAssetData(fallbackAsset, options);
        
        asset.data = fallbackAsset.data;
        asset.loaded = true;
        asset.progress = 1;
        
        this._emit('asset-loaded', asset);
        return asset;
        
      } catch (fallbackError) {
        lastError = fallbackError as Error;
      }
    }
    
    // Complete failure
    asset.error = lastError;
    asset.progress = 0;
    this._emit('asset-error', asset.id, lastError!);
    
    return asset;
  }
  
  private async _loadAssetData(asset: Asset, options: AssetLoadOptions): Promise<void> {
    switch (asset.type) {
      case 'image':
        asset.data = await this._loadImage(asset.src, options);
        break;
      case 'video':
        asset.data = await this._loadVideo(asset.src, options);
        break;
      case 'audio':
        asset.data = await this._loadAudio(asset.src, options);
        break;
      case 'font':
        asset.data = await this._loadFont(asset.src, options);
        break;
      case 'json':
        asset.data = await this._loadJson(asset.src, options);
        break;
      case 'text':
        asset.data = await this._loadText(asset.src, options);
        break;
      case 'binary':
        asset.data = await this._loadBinary(asset.src, options);
        break;
      default:
        throw new Error(`Unsupported asset type: ${asset.type}`);
    }
    
    // Update asset size if not set
    if (!asset.size && asset.data) {
      const estimatedSize = this._estimateAssetSize(asset.data);
      asset.size = estimatedSize;
    }
  }
  
  private async _loadImage(src: string, options: AssetLoadOptions): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const timeout = setTimeout(() => {
        reject(new Error(`Image load timeout: ${src}`));
      }, options.timeout);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      if (options.mode === 'cors') {
        img.crossOrigin = 'anonymous';
      }
      
      img.src = src;
    });
  }
  
  private async _loadVideo(src: string, options: AssetLoadOptions): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      
      const timeout = setTimeout(() => {
        reject(new Error(`Video load timeout: ${src}`));
      }, options.timeout);
      
      video.oncanplaythrough = () => {
        clearTimeout(timeout);
        resolve(video);
      };
      
      video.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load video: ${src}`));
      };
      
      if (options.mode === 'cors') {
        video.crossOrigin = 'anonymous';
      }
      
      video.preload = 'auto';
      video.src = src;
      video.load();
    });
  }
  
  private async _loadAudio(src: string, options: AssetLoadOptions): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      const timeout = setTimeout(() => {
        reject(new Error(`Audio load timeout: ${src}`));
      }, options.timeout);
      
      audio.oncanplaythrough = () => {
        clearTimeout(timeout);
        resolve(audio);
      };
      
      audio.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load audio: ${src}`));
      };
      
      if (options.mode === 'cors') {
        audio.crossOrigin = 'anonymous';
      }
      
      audio.preload = 'auto';
      audio.src = src;
      audio.load();
    });
  }
  
  private async _loadFont(src: string, options: AssetLoadOptions): Promise<FontFace> {
    const response = await this._fetchWithTimeout(src, options);
    const fontData = await response.arrayBuffer();
    
    // Extract font family name from URL or use default
    const fontFamily = src.split('/').pop()?.split('.')[0] || 'CustomFont';
    
    const fontFace = new FontFace(fontFamily, fontData);
    await fontFace.load();
    
    // Add to document fonts
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.add(fontFace);
    }
    
    return fontFace;
  }
  
  private async _loadJson(src: string, options: AssetLoadOptions): Promise<object> {
    const response = await this._fetchWithTimeout(src, options);
    return response.json();
  }
  
  private async _loadText(src: string, options: AssetLoadOptions): Promise<string> {
    const response = await this._fetchWithTimeout(src, options);
    return response.text();
  }
  
  private async _loadBinary(src: string, options: AssetLoadOptions): Promise<ArrayBuffer> {
    const response = await this._fetchWithTimeout(src, options);
    return response.arrayBuffer();
  }
  
  private async _fetchWithTimeout(src: string, options: AssetLoadOptions): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout);
    
    try {
      const response = await fetch(src, {
        signal: controller.signal,
        mode: options.mode,
        credentials: options.credentials,
        headers: options.headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } finally {
      clearTimeout(timeout);
    }
  }
  
  private _estimateAssetSize(data: AssetData): number {
    if (data instanceof HTMLImageElement) {
      return data.width * data.height * 4; // Rough estimate for RGBA
    } else if (data instanceof ArrayBuffer) {
      return data.byteLength;
    } else if (typeof data === 'string') {
      return data.length * 2; // UTF-16 encoding
    } else if (data instanceof HTMLVideoElement || data instanceof HTMLAudioElement) {
      return 1024 * 1024; // Default 1MB estimate
    }
    return 0;
  }
  
  private _enforceCache(): void {
    if (this._cacheSize <= this._config.cache.maxSize) {
      return;
    }
    
    // Emit cache full event
    this._emit('cache-full', this._cacheSize);
    
    // Evict assets based on strategy
    const assets = Array.from(this._assets.values());
    
    switch (this._config.cache.evictionStrategy) {
      case 'lru':
        assets.sort((a, b) => (a.cachedAt || 0) - (b.cachedAt || 0));
        break;
      case 'lfu':
        // For simplicity, treat as LRU since we don't track usage frequency
        assets.sort((a, b) => (a.cachedAt || 0) - (b.cachedAt || 0));
        break;
      case 'fifo':
        assets.sort((a, b) => (a.cachedAt || 0) - (b.cachedAt || 0));
        break;
    }
    
    // Remove assets until under limit
    while (this._cacheSize > this._config.cache.maxSize * 0.8 && assets.length > 0) {
      const asset = assets.shift();
      if (asset) {
        this.removeAsset(asset.id);
      }
    }
  }
  
  private _emitProgress(): void {
    const totalAssets = this._assets.size;
    const loadedAssets = Array.from(this._assets.values()).filter(a => a.loaded || a.error).length;
    const currentAsset = Array.from(this._assets.values()).find(a => !a.loaded && !a.error)?.id;
    
    const progress: AssetLoadProgress = {
      loaded: loadedAssets,
      total: totalAssets,
      currentAsset,
      percentage: totalAssets > 0 ? (loadedAssets / totalAssets) * 100 : 0,
    };
    
    // Calculate loading speed and ETA
    const elapsedTime = performance.now() - this._loadStartTime;
    if (elapsedTime > 0 && this._loadedBytes > 0) {
      progress.speed = this._loadedBytes / (elapsedTime / 1000);
      
      const remainingAssets = totalAssets - loadedAssets;
      if (remainingAssets > 0 && progress.speed > 0) {
        const avgAssetSize = this._loadedBytes / loadedAssets;
        const remainingBytes = remainingAssets * avgAssetSize;
        progress.estimatedTimeRemaining = (remainingBytes / progress.speed) * 1000;
      }
    }
    
    this._emit('progress', progress);
  }
  
  private _emit<K extends keyof AssetManagerEvents>(event: K, ...args: Parameters<AssetManagerEvents[K]>): void {
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          (callback as any)(...args);
        } catch (error) {
          console.error(`Error in asset manager event listener for "${event}":`, error);
        }
      });
    }
  }
  
  private _isPromiseSettled(_promise: Promise<any>): boolean {
    // This is a simplified check - in practice, you might use a more sophisticated approach
    return false;
  }
}