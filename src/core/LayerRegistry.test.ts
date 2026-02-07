/**
 * Unit tests for LayerRegistry
 */

import { vi } from 'vitest';
import { LayerRegistry } from './LayerRegistry';
import type { ICinematicLayer } from './interfaces/ICinematicLayer';
import type { LayerMountContext, FrameContext } from './interfaces/LayerContext';

// Mock layer implementation for testing
class MockLayer implements ICinematicLayer {
  public readonly id: string;
  public readonly type: string;
  public readonly zIndex: number;
  public mountCalled = false;
  public updateCalled = false;
  public destroyCalled = false;

  constructor(id: string, type: string, config: Record<string, any>) {
    this.id = id;
    this.type = type;
    this.zIndex = config.zIndex || 0;
  }

  mount(_ctx: LayerMountContext): void {
    this.mountCalled = true;
  }

  update(_ctx: FrameContext): void {
    this.updateCalled = true;
  }

  destroy(): void {
    this.destroyCalled = true;
  }
}

describe('LayerRegistry', () => {
  let registry: LayerRegistry;

  beforeEach(() => {
    registry = new LayerRegistry();
  });

  describe('Built-in Layer Types', () => {
    test('should register all built-in DOM layer types', () => {
      const domTypes = ['gradient', 'image', 'textBlock', 'vignette', 'glowOrb', 'noiseOverlay'];
      
      domTypes.forEach(type => {
        expect(registry.hasLayerType(type)).toBe(true);
      });
    });

    test('should register all built-in Canvas2D layer types', () => {
      const canvas2dTypes = ['particles', 'starfield', 'dust', 'nebulaNoise'];
      
      canvas2dTypes.forEach(type => {
        expect(registry.hasLayerType(type)).toBe(true);
      });
    });

    test('should create built-in layer instances successfully', () => {
      const layer = registry.createLayer('gradient', 'test-gradient', { zIndex: 5 });
      
      expect(layer).toBeDefined();
      expect(layer.id).toBe('test-gradient');
      expect(layer.type).toBe('gradient');
      expect(layer.zIndex).toBe(5);
    });

    test('should return correct built-in types categorization', () => {
      const builtInTypes = registry.getBuiltInTypes();
      
      expect(builtInTypes.dom).toEqual(['gradient', 'image', 'textBlock', 'vignette', 'glowOrb', 'noiseOverlay', 'light', 'parallaxGroup', 'shape']);
      expect(builtInTypes.canvas2d).toEqual(['particles', 'starfield', 'dust', 'nebulaNoise', 'fog']);
    });

    test('should correctly identify built-in types', () => {
      expect(registry.isBuiltInType('gradient')).toBe(true);
      expect(registry.isBuiltInType('particles')).toBe(true);
      expect(registry.isBuiltInType('customType')).toBe(false);
    });

    test('should register shape layer type', () => {
      expect(registry.hasLayerType('shape')).toBe(true);
      expect(registry.isBuiltInType('shape')).toBe(true);
    });

    test('should create shape layer instances successfully', () => {
      const layer = registry.createLayer('shape', 'test-shape', { 
        shapeType: 'circle',
        radius: 50,
        zIndex: 5 
      });
      
      expect(layer).toBeDefined();
      expect(layer.id).toBe('test-shape');
      expect(layer.type).toBe('shape');
      expect(layer.zIndex).toBe(5);
    });
  });

  describe('Custom Layer Registration', () => {
    test('should register custom layer type', () => {
      const factory = (id: string, config: Record<string, any>) => new MockLayer(id, 'custom', config);
      
      registry.registerLayerType('custom', factory);
      
      expect(registry.hasLayerType('custom')).toBe(true);
      expect(registry.getRegisteredTypes()).toContain('custom');
    });

    test('should create custom layer instances', () => {
      const factory = (id: string, config: Record<string, any>) => new MockLayer(id, 'custom', config);
      registry.registerLayerType('custom', factory);
      
      const layer = registry.createLayer('custom', 'test-custom', { zIndex: 10 });
      
      expect(layer).toBeInstanceOf(MockLayer);
      expect(layer.id).toBe('test-custom');
      expect(layer.type).toBe('custom');
      expect(layer.zIndex).toBe(10);
    });

    test('should warn when overriding existing layer type', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const factory = (id: string, config: Record<string, any>) => new MockLayer(id, 'override', config);
      
      registry.registerLayerType('gradient', factory); // Override built-in type
      
      expect(consoleSpy).toHaveBeenCalledWith(
        "Layer type 'gradient' is already registered. Overriding existing registration."
      );
      
      consoleSpy.mockRestore();
    });

    test('should get custom types separately from built-in types', () => {
      const factory = (id: string, config: Record<string, any>) => new MockLayer(id, 'custom', config);
      registry.registerLayerType('customType1', factory);
      registry.registerLayerType('customType2', factory);
      
      const customTypes = registry.getCustomTypes();
      
      expect(customTypes).toEqual(['customType1', 'customType2']);
      expect(customTypes).not.toContain('gradient');
      expect(customTypes).not.toContain('particles');
    });
  });

  describe('Layer Creation', () => {
    test('should throw error for unknown layer type', () => {
      expect(() => {
        registry.createLayer('unknownType', 'test-id', {});
      }).toThrow('Unknown layer type: unknownType. Available types: dust, fog, glowOrb, gradient, image, light, nebulaNoise, noiseOverlay, parallaxGroup, particles, shape, starfield, textBlock, vignette');
    });

    test('should create layer with correct properties', () => {
      const layer = registry.createLayer('image', 'test-image', { 
        zIndex: 15,
        src: 'test.jpg',
        opacity: 0.8 
      });
      
      expect(layer.id).toBe('test-image');
      expect(layer.type).toBe('image');
      expect(layer.zIndex).toBe(15);
    });
  });

  describe('Registry Management', () => {
    test('should return sorted list of registered types', () => {
      const factory = (id: string, config: Record<string, any>) => new MockLayer(id, 'custom', config);
      registry.registerLayerType('zebra', factory);
      registry.registerLayerType('alpha', factory);
      
      const types = registry.getRegisteredTypes();
      
      // Should be sorted alphabetically
      expect(types.indexOf('alpha')).toBeLessThan(types.indexOf('zebra'));
      expect(types.indexOf('gradient')).toBeLessThan(types.indexOf('particles'));
    });

    test('should unregister custom layer types', () => {
      const factory = (id: string, config: Record<string, any>) => new MockLayer(id, 'custom', config);
      registry.registerLayerType('customType', factory);
      
      expect(registry.hasLayerType('customType')).toBe(true);
      
      const result = registry.unregisterLayerType('customType');
      
      expect(result).toBe(true);
      expect(registry.hasLayerType('customType')).toBe(false);
    });

    test('should not unregister built-in layer types', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = registry.unregisterLayerType('gradient');
      
      expect(result).toBe(false);
      expect(registry.hasLayerType('gradient')).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith("Cannot unregister built-in layer type 'gradient'");
      
      consoleSpy.mockRestore();
    });

    test('should clear only custom types', () => {
      const factory = (id: string, config: Record<string, any>) => new MockLayer(id, 'custom', config);
      registry.registerLayerType('custom1', factory);
      registry.registerLayerType('custom2', factory);
      
      expect(registry.getCustomTypes()).toEqual(['custom1', 'custom2']);
      
      registry.clearCustomTypes();
      
      expect(registry.getCustomTypes()).toEqual([]);
      expect(registry.hasLayerType('gradient')).toBe(true); // Built-in should remain
      expect(registry.hasLayerType('particles')).toBe(true); // Built-in should remain
    });
  });

  describe('Singleton Pattern', () => {
    test('should return same instance from getInstance', () => {
      const instance1 = LayerRegistry.getInstance();
      const instance2 = LayerRegistry.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    test('should have built-in types registered in singleton instance', () => {
      const instance = LayerRegistry.getInstance();
      
      expect(instance.hasLayerType('gradient')).toBe(true);
      expect(instance.hasLayerType('particles')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle layer creation with missing config gracefully', () => {
      const layer = registry.createLayer('gradient', 'test-gradient', {});
      
      expect(layer).toBeDefined();
      expect(layer.id).toBe('test-gradient');
      expect(layer.type).toBe('gradient');
      expect(layer.zIndex).toBe(0); // Default zIndex
    });

    test('should handle empty layer type name', () => {
      expect(() => {
        registry.createLayer('', 'test-id', {});
      }).toThrow('Unknown layer type: ');
    });
  });
});

  describe('Layer Interface Validation', () => {
    let validationRegistry: LayerRegistry;

    beforeEach(() => {
      validationRegistry = new LayerRegistry();
    });

    test('should reject layer without required properties', () => {
      const invalidFactory = () => ({
        // Missing id, type, zIndex
        mount: () => {},
        update: () => {},
        destroy: () => {},
      });
      
      expect(() => {
        validationRegistry.registerLayerType('invalid', invalidFactory as any);
      }).toThrow(/does not implement required property/);
    });

    test('should reject layer without required methods', () => {
      const invalidFactory = () => ({
        id: 'test',
        type: 'invalid',
        zIndex: 0,
        // Missing mount, update, destroy methods
      });
      
      expect(() => {
        validationRegistry.registerLayerType('invalid', invalidFactory as any);
      }).toThrow(/does not implement required method/);
    });

    test('should reject layer with invalid property types', () => {
      const invalidFactory = () => ({
        id: 123, // Should be string
        type: 'invalid',
        zIndex: 0,
        mount: () => {},
        update: () => {},
        destroy: () => {},
      });
      
      expect(() => {
        validationRegistry.registerLayerType('invalid', invalidFactory as any);
      }).toThrow(/has invalid 'id' property/);
    });

    test('should accept layer with valid interface', () => {
      const validFactory = (id: string, config: Record<string, any>) => ({
        id,
        type: 'valid',
        zIndex: config.zIndex || 0,
        mount: () => {},
        update: () => {},
        destroy: () => {},
      });
      
      expect(() => {
        validationRegistry.registerLayerType('valid', validFactory as any);
      }).not.toThrow();
      
      expect(validationRegistry.hasLayerType('valid')).toBe(true);
    });
  });
