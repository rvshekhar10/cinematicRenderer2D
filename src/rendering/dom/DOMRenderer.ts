/**
 * DOM-based rendering backend
 * Optimized for 60-120fps performance using CSS transforms and will-change properties
 */

import { RenderBackend } from '../RenderBackend';
import type { ICinematicLayer } from '../../core/interfaces/ICinematicLayer';
import type { FrameContext } from '../../core/interfaces/LayerContext';

export class DOMRenderer extends RenderBackend {
  private domContainer!: HTMLElement;
  private layerElements: Map<string, HTMLElement> = new Map();
  private initialized: boolean = false;

  initialize(): void {
    if (this.initialized) return;

    // Create DOM container for layers
    this.domContainer = document.createElement('div');
    this.domContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
    `;
    
    this.container.appendChild(this.domContainer);
    this.initialized = true;
  }
  
  render(layers: ICinematicLayer[], context: FrameContext): void {
    if (!this.initialized) {
      this.initialize();
    }

    // Sort layers by zIndex for proper rendering order
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    
    // Update each layer
    for (const layer of sortedLayers) {
      layer.update(context);
    }
  }
  
  resize(width: number, height: number): void {
    if (!this.initialized) return;
    
    // Update container dimensions
    this.domContainer.style.width = `${width}px`;
    this.domContainer.style.height = `${height}px`;
    
    // Notify all layers about resize
    for (const element of this.layerElements.values()) {
      // Layers will handle their own resize logic
    }
  }
  
  destroy(): void {
    if (!this.initialized) return;
    
    // Clean up all layer elements
    this.layerElements.clear();
    
    // Remove DOM container
    if (this.domContainer && this.domContainer.parentNode) {
      this.domContainer.parentNode.removeChild(this.domContainer);
    }
    
    this.initialized = false;
  }

  /**
   * Create a DOM element for a layer with performance optimizations
   */
  createLayerElement(layerId: string, zIndex: number): HTMLElement {
    if (this.layerElements.has(layerId)) {
      return this.layerElements.get(layerId)!;
    }

    const element = document.createElement('div');
    element.id = `layer-${layerId}`;
    element.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      will-change: transform, opacity, filter;
      transform-style: preserve-3d;
      backface-visibility: hidden;
      z-index: ${zIndex};
    `;

    this.domContainer.appendChild(element);
    this.layerElements.set(layerId, element);
    
    return element;
  }

  /**
   * Remove a layer element from the DOM
   */
  removeLayerElement(layerId: string): void {
    const element = this.layerElements.get(layerId);
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
      this.layerElements.delete(layerId);
    }
  }

  /**
   * Get the DOM container for layers
   */
  getDOMContainer(): HTMLElement {
    return this.domContainer;
  }

  /**
   * Get a layer element by ID
   */
  getLayerElement(layerId: string): HTMLElement | undefined {
    return this.layerElements.get(layerId);
  }
}