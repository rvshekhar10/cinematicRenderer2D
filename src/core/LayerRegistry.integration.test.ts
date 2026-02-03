/**
 * Integration tests for LayerRegistry with other components
 */

import { LayerRegistry } from './LayerRegistry';
import { SpecParser } from '../parsing/SpecParser';
import type { CinematicSpec } from '../types/CinematicSpec';
import type { ICinematicLayer } from './interfaces/ICinematicLayer';
import type { LayerMountContext, FrameContext } from './interfaces/LayerContext';

// Custom layer for testing plugin functionality
class CustomTestLayer implements ICinematicLayer {
  public readonly id: string;
  public readonly type: string;
  public readonly zIndex: number;
  private config: Record<string, any>;

  constructor(id: string, config: Record<string, any>) {
    this.id = id;
    this.type = 'customTest';
    this.zIndex = config.zIndex || 0;
    this.config = config;
  }

  mount(_ctx: LayerMountContext): void {
    // Custom implementation
  }

  update(_ctx: FrameContext): void {
    // Custom implementation
  }

  destroy(): void {
    // Custom implementation
  }

  getCustomProperty(): string {
    return this.config.customProperty || 'default';
  }
}

describe('LayerRegistry Integration', () => {
  let registry: LayerRegistry;

  beforeEach(() => {
    registry = new LayerRegistry();
  });

  describe('Integration with SpecParser', () => {
    test('should create layers from valid spec using built-in types', () => {
      const spec: CinematicSpec = {
        schemaVersion: '1.0.0',
        engine: {
          targetFps: 60,
          quality: 'medium',
        },
        events: [
          {
            id: 'test-event',
            name: 'Test Event',
            scenes: ['test-scene'],
          },
        ],
        scenes: [
          {
            id: 'test-scene',
            name: 'Test Scene',
            duration: 5000,
            layers: [
              {
                id: 'bg-gradient',
                type: 'gradient',
                zIndex: 1,
                config: {
                  colors: ['#ff0000', '#0000ff'],
                  direction: 'vertical',
                },
              },
              {
                id: 'star-field',
                type: 'starfield',
                zIndex: 2,
                config: {
                  starCount: 500,
                  speed: 1.0,
                },
              },
            ],
          },
        ],
      };

      const compiledSpec = SpecParser.parse(spec);
      expect(compiledSpec).toBeDefined();

      const scene = compiledSpec.scenes.get('test-scene');
      expect(scene).toBeDefined();

      // Create layers using registry
      const gradientLayer = registry.createLayer('gradient', 'bg-gradient', {
        zIndex: 1,
        colors: ['#ff0000', '#0000ff'],
        direction: 'vertical',
      });

      const starfieldLayer = registry.createLayer('starfield', 'star-field', {
        zIndex: 2,
        starCount: 500,
        speed: 1.0,
      });

      expect(gradientLayer.type).toBe('gradient');
      expect(gradientLayer.id).toBe('bg-gradient');
      expect(gradientLayer.zIndex).toBe(1);

      expect(starfieldLayer.type).toBe('starfield');
      expect(starfieldLayer.id).toBe('star-field');
      expect(starfieldLayer.zIndex).toBe(2);
    });

    test('should handle mixed built-in and custom layer types', () => {
      // Register custom layer type
      registry.registerLayerType('customTest', (id, config) => new CustomTestLayer(id, config));

      const spec: CinematicSpec = {
        schemaVersion: '1.0.0',
        engine: {
          targetFps: 60,
          quality: 'medium',
        },
        events: [
          {
            id: 'mixed-event',
            name: 'Mixed Event',
            scenes: ['mixed-scene'],
          },
        ],
        scenes: [
          {
            id: 'mixed-scene',
            name: 'Mixed Scene',
            duration: 3000,
            layers: [
              {
                id: 'built-in-image',
                type: 'image',
                zIndex: 1,
                config: {
                  src: 'test.jpg',
                  opacity: 0.8,
                },
              },
            ],
          },
        ],
      };

      const compiledSpec = SpecParser.parse(spec);
      expect(compiledSpec).toBeDefined();

      // Create layers using registry
      const imageLayer = registry.createLayer('image', 'built-in-image', {
        zIndex: 1,
        src: 'test.jpg',
        opacity: 0.8,
      });

      const customLayer = registry.createLayer('customTest', 'custom-layer', {
        zIndex: 2,
        customProperty: 'test-value',
      }) as CustomTestLayer;

      expect(imageLayer.type).toBe('image');
      expect(imageLayer.id).toBe('built-in-image');

      expect(customLayer.type).toBe('customTest');
      expect(customLayer.id).toBe('custom-layer');
      expect(customLayer.getCustomProperty()).toBe('test-value');
    });
  });

  describe('Plugin System Functionality', () => {
    test('should support dynamic layer type registration', () => {
      expect(registry.hasLayerType('dynamicLayer')).toBe(false);

      // Register new layer type at runtime
      registry.registerLayerType('dynamicLayer', (id, config) => new CustomTestLayer(id, config));

      expect(registry.hasLayerType('dynamicLayer')).toBe(true);
      expect(registry.getRegisteredTypes()).toContain('dynamicLayer');

      const layer = registry.createLayer('dynamicLayer', 'test-dynamic', {
        customProperty: 'dynamic-value',
      }) as CustomTestLayer;

      expect(layer.type).toBe('customTest'); // CustomTestLayer always returns 'customTest'
      expect(layer.getCustomProperty()).toBe('dynamic-value');
    });

    test('should support layer type replacement for testing', () => {
      // Create original layer
      const originalLayer = registry.createLayer('gradient', 'test-gradient', {});
      expect(originalLayer.type).toBe('gradient');

      // Replace with mock for testing
      registry.registerLayerType('gradient', (id, config) => new CustomTestLayer(id, config));

      const mockLayer = registry.createLayer('gradient', 'test-gradient-mock', {
        customProperty: 'mock-value',
      }) as CustomTestLayer;

      expect(mockLayer.getCustomProperty()).toBe('mock-value');
    });

    test('should maintain layer type isolation', () => {
      const registry1 = new LayerRegistry();
      const registry2 = new LayerRegistry();

      // Register custom type in first registry only
      registry1.registerLayerType('custom1', (id, config) => new CustomTestLayer(id, config));

      expect(registry1.hasLayerType('custom1')).toBe(true);
      expect(registry2.hasLayerType('custom1')).toBe(false);

      // Both should have built-in types
      expect(registry1.hasLayerType('gradient')).toBe(true);
      expect(registry2.hasLayerType('gradient')).toBe(true);
    });
  });

  describe('Layer Creation Patterns', () => {
    test('should support factory pattern with configuration', () => {
      // Register layer with complex factory
      registry.registerLayerType('configurable', (id, config) => {
        const layer = new CustomTestLayer(id, {
          ...config,
          // Add default configurations
          defaultProperty: config.defaultProperty || 'default-value',
          computedProperty: `computed-${config.input || 'none'}`,
        });
        return layer;
      });

      const layer = registry.createLayer('configurable', 'test-config', {
        input: 'test-input',
        customProperty: 'custom-value',
      }) as CustomTestLayer;

      expect(layer.getCustomProperty()).toBe('custom-value');
    });

    test('should handle layer creation with validation', () => {
      // Register layer with validation
      registry.registerLayerType('validated', (id, config) => {
        // Skip validation for the test layer created during registration
        if (id === '__validation_test__') {
          return new CustomTestLayer(id, config);
        }
        if (!config.required) {
          throw new Error('Required property missing');
        }
        return new CustomTestLayer(id, config);
      });

      expect(() => {
        registry.createLayer('validated', 'test-invalid', {});
      }).toThrow('Required property missing');

      const validLayer = registry.createLayer('validated', 'test-valid', { required: true });
      expect(validLayer).toBeDefined();
    });
  });

  describe('Performance and Memory', () => {
    test('should efficiently handle many layer types', () => {
      const startTime = performance.now();

      // Register many layer types
      for (let i = 0; i < 100; i++) {
        registry.registerLayerType(`type${i}`, (id, config) => new CustomTestLayer(id, config));
      }

      const registrationTime = performance.now() - startTime;
      expect(registrationTime).toBeLessThan(100); // Should be fast

      // Create layers efficiently
      const creationStart = performance.now();
      const layers: ICinematicLayer[] = [];

      for (let i = 0; i < 100; i++) {
        layers.push(registry.createLayer(`type${i}`, `layer${i}`, {}));
      }

      const creationTime = performance.now() - creationStart;
      expect(creationTime).toBeLessThan(100); // Should be fast
      expect(layers).toHaveLength(100);
    });

    test('should handle registry cleanup properly', () => {
      // Add custom types
      for (let i = 0; i < 10; i++) {
        registry.registerLayerType(`temp${i}`, (id, config) => new CustomTestLayer(id, config));
      }

      const beforeCleanup = registry.getRegisteredTypes().length;
      const customCount = registry.getCustomTypes().length;

      registry.clearCustomTypes();

      const afterCleanup = registry.getRegisteredTypes().length;
      expect(afterCleanup).toBe(beforeCleanup - customCount);

      // Built-in types should remain
      expect(registry.hasLayerType('gradient')).toBe(true);
      expect(registry.hasLayerType('particles')).toBe(true);
    });
  });
});