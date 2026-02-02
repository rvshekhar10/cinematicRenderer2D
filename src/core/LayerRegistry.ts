/**
 * Layer Registry for managing layer types and instances
 * Supports both built-in layer types and custom layer plugins
 */

import type { ICinematicLayer } from './interfaces/ICinematicLayer';
import {
  GradientLayer,
  ImageLayer,
  TextBlockLayer,
  VignetteLayer,
  GlowOrbLayer,
  NoiseOverlayLayer,
  ParticlesLayer,
  StarfieldLayer,
  DustLayer,
  NebulaNoiseLayer,
} from './layers/BuiltInLayers';

export type LayerFactory = (id: string, config: Record<string, any>) => ICinematicLayer;

export class LayerRegistry {
  private layerTypes: Map<string, LayerFactory> = new Map();
  private static instance: LayerRegistry | null = null;
  
  constructor() {
    this.registerBuiltInLayers();
  }
  
  /**
   * Get the global layer registry instance
   */
  static getInstance(): LayerRegistry {
    if (!LayerRegistry.instance) {
      LayerRegistry.instance = new LayerRegistry();
    }
    return LayerRegistry.instance;
  }
  
  /**
   * Register a custom layer type with a factory function
   */
  registerLayerType(type: string, factory: LayerFactory): void {
    if (this.layerTypes.has(type)) {
      console.warn(`Layer type '${type}' is already registered. Overriding existing registration.`);
    }
    this.layerTypes.set(type, factory);
  }
  
  /**
   * Create a layer instance of the specified type
   */
  createLayer(type: string, id: string, config: Record<string, any>): ICinematicLayer {
    const factory = this.layerTypes.get(type);
    if (!factory) {
      throw new Error(`Unknown layer type: ${type}. Available types: ${this.getRegisteredTypes().join(', ')}`);
    }
    return factory(id, config);
  }
  
  /**
   * Check if a layer type is registered
   */
  hasLayerType(type: string): boolean {
    return this.layerTypes.has(type);
  }
  
  /**
   * Get all registered layer type names
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.layerTypes.keys()).sort();
  }
  
  /**
   * Get built-in layer types (DOM and Canvas2D)
   */
  getBuiltInTypes(): { dom: string[]; canvas2d: string[] } {
    return {
      dom: ['gradient', 'image', 'textBlock', 'vignette', 'glowOrb', 'noiseOverlay'],
      canvas2d: ['particles', 'starfield', 'dust', 'nebulaNoise'],
    };
  }
  
  /**
   * Check if a layer type is a built-in type
   */
  isBuiltInType(type: string): boolean {
    const builtInTypes = this.getBuiltInTypes();
    return builtInTypes.dom.includes(type) || builtInTypes.canvas2d.includes(type);
  }
  
  /**
   * Get custom (non-built-in) layer types
   */
  getCustomTypes(): string[] {
    return this.getRegisteredTypes().filter(type => !this.isBuiltInType(type));
  }
  
  /**
   * Unregister a layer type (useful for testing or dynamic plugin management)
   */
  unregisterLayerType(type: string): boolean {
    if (this.isBuiltInType(type)) {
      console.warn(`Cannot unregister built-in layer type '${type}'`);
      return false;
    }
    return this.layerTypes.delete(type);
  }
  
  /**
   * Clear all custom layer types (keeps built-in types)
   */
  clearCustomTypes(): void {
    const customTypes = this.getCustomTypes();
    customTypes.forEach(type => this.layerTypes.delete(type));
  }
  
  /**
   * Register all built-in layer types
   */
  private registerBuiltInLayers(): void {
    // DOM layer types
    this.layerTypes.set('gradient', (id, config) => new GradientLayer(id, config));
    this.layerTypes.set('image', (id, config) => new ImageLayer(id, config));
    this.layerTypes.set('textBlock', (id, config) => new TextBlockLayer(id, config));
    this.layerTypes.set('vignette', (id, config) => new VignetteLayer(id, config));
    this.layerTypes.set('glowOrb', (id, config) => new GlowOrbLayer(id, config));
    this.layerTypes.set('noiseOverlay', (id, config) => new NoiseOverlayLayer(id, config));
    
    // Canvas2D layer types
    this.layerTypes.set('particles', (id, config) => new ParticlesLayer(id, config));
    this.layerTypes.set('starfield', (id, config) => new StarfieldLayer(id, config));
    this.layerTypes.set('dust', (id, config) => new DustLayer(id, config));
    this.layerTypes.set('nebulaNoise', (id, config) => new NebulaNoiseLayer(id, config));
  }
}