/**
 * Asset Management Types for cinematicRenderer2D
 * 
 * These types define the asset loading, caching, and management system
 * that handles images, videos, audio files, and other resources.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4 - Comprehensive asset management
 */

export interface Asset {
  /** Unique identifier for the asset */
  id: string;
  /** Type of asset */
  type: AssetType;
  /** Source URL */
  src: string;
  /** Loaded asset data (varies by type) */
  data: AssetData | null;
  /** Whether the asset has finished loading */
  loaded: boolean;
  /** Loading error if any occurred */
  error: Error | null;
  /** Fallback asset ID or URL */
  fallback?: string;
  /** Asset metadata */
  metadata: AssetMetadata;
  /** Loading progress (0-1) */
  progress: number;
  /** Cache timestamp for expiration */
  cachedAt?: number;
  /** Asset size in bytes */
  size?: number;
}

/** Union type for all possible asset data types */
export type AssetData = 
  | HTMLImageElement 
  | HTMLVideoElement 
  | HTMLAudioElement 
  | AudioBuffer 
  | FontFace
  | ArrayBuffer
  | string
  | object;

/** Supported asset types */
export type AssetType = 'image' | 'video' | 'audio' | 'font' | 'json' | 'binary' | 'text';

export interface AssetDefinition {
  /** Unique identifier for the asset */
  id: string;
  /** Type of asset */
  type: AssetType;
  /** Source URL for the asset */
  src: string;
  /** Whether to preload this asset */
  preload?: boolean;
  /** Fallback asset ID or URL if loading fails */
  fallback?: string;
  /** Additional metadata for the asset */
  metadata?: Partial<AssetMetadata>;
}

/** Asset metadata for optimization and caching */
export interface AssetMetadata {
  /** Expected file size in bytes */
  size: number;
  /** MIME type */
  mimeType: string;
  /** Cache duration in milliseconds */
  cacheDuration: number;
  /** Asset dimensions for images/videos */
  dimensions?: {
    width: number;
    height: number;
  };
  /** Audio/video duration in milliseconds */
  duration?: number;
  /** Compression quality (0-1) */
  quality?: number;
  /** Whether asset supports streaming */
  streamable?: boolean;
  /** Asset priority for loading order */
  priority?: AssetPriority;
}

/** Asset loading priority levels */
export type AssetPriority = 'critical' | 'high' | 'normal' | 'low' | 'lazy';

export interface AssetLoadProgress {
  /** Number of assets loaded */
  loaded: number;
  /** Total number of assets to load */
  total: number;
  /** Currently loading asset ID */
  currentAsset?: string;
  /** Overall progress percentage (0-100) */
  percentage: number;
  /** Loading speed in bytes per second */
  speed?: number;
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining?: number;
}

/** Asset loading options */
export interface AssetLoadOptions {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts */
  retries?: number;
  /** Whether to use cache */
  useCache?: boolean;
  /** Custom headers for the request */
  headers?: Record<string, string>;
  /** CORS mode */
  mode?: 'cors' | 'no-cors' | 'same-origin';
  /** Credentials mode */
  credentials?: 'omit' | 'same-origin' | 'include';
}

/** Asset cache configuration */
export interface AssetCacheConfig {
  /** Maximum cache size in bytes */
  maxSize: number;
  /** Default cache duration in milliseconds */
  defaultDuration: number;
  /** Cache storage type */
  storageType: 'memory' | 'indexeddb' | 'localstorage';
  /** Whether to compress cached assets */
  compress: boolean;
  /** Cache eviction strategy */
  evictionStrategy: 'lru' | 'lfu' | 'fifo';
}