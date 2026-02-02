/**
 * Abstract base class for rendering backends
 */

import type { ICinematicLayer } from '../core/interfaces/ICinematicLayer';
import type { FrameContext } from '../core/interfaces/LayerContext';

export abstract class RenderBackend {
  protected container: HTMLElement;
  
  constructor(container: HTMLElement) {
    this.container = container;
  }
  
  abstract initialize(): void;
  abstract render(layers: ICinematicLayer[], context: FrameContext): void;
  abstract resize(width: number, height: number): void;
  abstract destroy(): void;
}