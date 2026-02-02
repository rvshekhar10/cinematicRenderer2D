/**
 * Context objects passed to layers during mount and update operations
 */

import type { RenderBackend } from '../../rendering/RenderBackend';
import type { AssetManager } from '../../assets/AssetManager';
import type { QualityLevel } from '../../types/QualityTypes';

export interface LayerMountContext {
  container: HTMLElement;
  canvas?: HTMLCanvasElement;
  renderer: RenderBackend;
  assetManager: AssetManager;
  layerConfig: Record<string, any>;
}

export interface FrameContext {
  timeMs: number;
  deltaMs: number;
  quality: QualityLevel;
  viewport: {
    width: number;
    height: number;
  };
  devicePixelRatio: number;
}