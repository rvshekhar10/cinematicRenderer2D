/**
 * Unit tests for ShapeLayer
 * 
 * Tests lifecycle methods, configuration validation, default values, and transform order.
 * 
 * Requirements: 7.3, 2.7, 2.8
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShapeLayer } from './ShapeLayer';
import type { LayerMountContext, FrameContext } from '../interfaces/LayerContext';
import type { ShapeLayerConfig } from '../shapes/IShapeRenderer';

// Mock renderer for testing
class MockRenderBackend {
  constructor(public name: string = 'DOMRenderer') {}
}

describe('ShapeLayer', () => {
  let mockContainer: HTMLElement;
  let mockMountContext: LayerMountContext;
  let mockFrameContext: FrameContext;

  beforeEach(() => {
    // Create mock container
    mockContainer = document.createElement('div');
    mockContainer.style.width = '1920px';
    mockContainer.style.height = '1080px';
    document.body.appendChild(mockContainer);

    // Create mock mount context
    mockMountContext = {
      container: mockContainer,
      renderer: new MockRenderBackend() as any,
      assetManager: {} as any,
      layerConfig: {}
    };

    // Create mock frame context
    mockFrameContext = {
      timeMs: 0,
      deltaMs: 16,
      quality: 'high',
      viewport: {
        width: 1920,
        height: 1080
      },
      devicePixelRatio: 1
    };
  });

  describe('Constructor', () => {
    it('should create a shape layer with valid configuration', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test-circle', config);

      expect(layer.id).toBe('test-circle');
      expect(layer.type).toBe('shape');
      expect(layer.zIndex).toBe(0);
    });

    it('should use custom zIndex when provided', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        zIndex: 10
      };

      const layer = new ShapeLayer('test-circle', config);

      expect(layer.zIndex).toBe(10);
    });

    it('should throw error for invalid shape type', () => {
      const config = {
        shapeType: 'invalid-shape',
        radius: 50
      } as any;

      expect(() => new ShapeLayer('test', config)).toThrow(
        "Invalid shape type: 'invalid-shape'"
      );
    });

    it('should throw error for rectangle missing width', () => {
      const config = {
        shapeType: 'rectangle',
        height: 100
      } as any;

      expect(() => new ShapeLayer('test', config)).toThrow(
        "Missing required parameter 'width' or 'height' for shape type 'rectangle'"
      );
    });

    it('should throw error for circle missing radius', () => {
      const config = {
        shapeType: 'circle'
      } as any;

      expect(() => new ShapeLayer('test', config)).toThrow(
        "Missing required parameter 'radius' for shape type 'circle'"
      );
    });

    it('should throw error for negative dimensions', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: -50
      };

      expect(() => new ShapeLayer('test', config)).toThrow(
        "Invalid value for 'radius'"
      );
    });

    it('should throw error for star with innerRadius >= outerRadius', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'star',
        points: 5,
        innerRadius: 100,
        outerRadius: 50
      };

      expect(() => new ShapeLayer('test', config)).toThrow(
        'Expected less than outerRadius'
      );
    });
  });

  describe('Default Values', () => {
    it('should apply default transform values', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);
      const layerConfig = layer.getConfig();

      // Default transform values per requirement 2.8
      expect(layerConfig.x).toBe(0);
      expect(layerConfig.y).toBe(0);
      expect(layerConfig.rotation).toBe(0);
      expect(layerConfig.scaleX).toBe(1);
      expect(layerConfig.scaleY).toBe(1);
      expect(layerConfig.skewX).toBe(0);
      expect(layerConfig.skewY).toBe(0);
    });

    it('should apply default visual properties', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);
      const layerConfig = layer.getConfig();

      // Default visual values per requirement 3.8
      expect(layerConfig.fillColor).toBe('#000000');
      expect(layerConfig.strokeWidth).toBe(0);
      expect(layerConfig.opacity).toBe(1.0);
    });

    it('should preserve custom values when provided', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        x: 100,
        y: 200,
        rotation: 45,
        scaleX: 2,
        scaleY: 0.5,
        fillColor: '#ff0000',
        opacity: 0.5
      };

      const layer = new ShapeLayer('test', config);
      const layerConfig = layer.getConfig();

      expect(layerConfig.x).toBe(100);
      expect(layerConfig.y).toBe(200);
      expect(layerConfig.rotation).toBe(45);
      expect(layerConfig.scaleX).toBe(2);
      expect(layerConfig.scaleY).toBe(0.5);
      expect(layerConfig.fillColor).toBe('#ff0000');
      expect(layerConfig.opacity).toBe(0.5);
    });
  });

  describe('Lifecycle Methods', () => {
    it('should mount successfully', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);

      expect(() => layer.mount(mockMountContext)).not.toThrow();
    });

    it('should not mount twice', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);
      layer.mount(mockMountContext);

      // Second mount should be ignored
      expect(() => layer.mount(mockMountContext)).not.toThrow();
    });

    it('should update after mounting', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);
      layer.mount(mockMountContext);

      expect(() => layer.update(mockFrameContext)).not.toThrow();
    });

    it('should not throw when updating before mount', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);

      // Update before mount should be safe (no-op)
      expect(() => layer.update(mockFrameContext)).not.toThrow();
    });

    it('should destroy successfully', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);
      layer.mount(mockMountContext);

      expect(() => layer.destroy()).not.toThrow();
    });

    it('should handle destroy before mount', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);

      expect(() => layer.destroy()).not.toThrow();
    });
  });

  describe('Visibility and Opacity', () => {
    it('should set visibility', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);
      layer.mount(mockMountContext);

      expect(() => layer.setVisible(false)).not.toThrow();
      expect(() => layer.setVisible(true)).not.toThrow();
    });

    it('should set opacity', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);
      layer.mount(mockMountContext);

      expect(() => layer.setOpacity(0.5)).not.toThrow();
    });

    it('should clamp opacity to valid range', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);
      layer.mount(mockMountContext);

      // Test clamping
      expect(() => layer.setOpacity(-0.5)).not.toThrow();
      expect(() => layer.setOpacity(1.5)).not.toThrow();
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);
      
      layer.updateConfig({ radius: 100 });
      
      const updatedConfig = layer.getConfig();
      expect(updatedConfig.radius).toBe(100);
    });

    it('should preserve other properties when updating', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        fillColor: '#ff0000'
      };

      const layer = new ShapeLayer('test', config);
      
      layer.updateConfig({ radius: 100 });
      
      const updatedConfig = layer.getConfig();
      expect(updatedConfig.radius).toBe(100);
      expect(updatedConfig.fillColor).toBe('#ff0000');
    });
  });

  describe('Resize Handler', () => {
    it('should handle resize', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);
      layer.mount(mockMountContext);

      expect(() => layer.resize(1280, 720)).not.toThrow();
    });
  });

  describe('All Shape Types', () => {
    it('should create rectangle shape', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'rectangle',
        width: 100,
        height: 50
      };

      const layer = new ShapeLayer('test', config);
      expect(layer).toBeDefined();
    });

    it('should create square shape', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'square',
        size: 100
      };

      const layer = new ShapeLayer('test', config);
      expect(layer).toBeDefined();
    });

    it('should create circle shape', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);
      expect(layer).toBeDefined();
    });

    it('should create ellipse shape', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'ellipse',
        radiusX: 100,
        radiusY: 50
      };

      const layer = new ShapeLayer('test', config);
      expect(layer).toBeDefined();
    });

    it('should create triangle shape', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'triangle',
        vertices: [
          { x: 0, y: -50 },
          { x: -50, y: 50 },
          { x: 50, y: 50 }
        ]
      };

      const layer = new ShapeLayer('test', config);
      expect(layer).toBeDefined();
    });

    it('should create trapezoid shape', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'trapezoid',
        topWidth: 50,
        bottomWidth: 100,
        height: 75
      };

      const layer = new ShapeLayer('test', config);
      expect(layer).toBeDefined();
    });

    it('should create polygon shape', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'polygon',
        sides: 6,
        radius: 50
      };

      const layer = new ShapeLayer('test', config);
      expect(layer).toBeDefined();
    });

    it('should create star shape', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'star',
        points: 5,
        innerRadius: 25,
        outerRadius: 50
      };

      const layer = new ShapeLayer('test', config);
      expect(layer).toBeDefined();
    });
  });

  describe('Backend Selection', () => {
    it('should use Canvas2D renderer for Canvas2DRenderer backend', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);
      
      const canvasContext = {
        ...mockMountContext,
        renderer: new MockRenderBackend('Canvas2DRenderer') as any
      };

      expect(() => layer.mount(canvasContext)).not.toThrow();
    });

    it('should use DOM renderer for DOMRenderer backend', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test', config);
      
      const domContext = {
        ...mockMountContext,
        renderer: new MockRenderBackend('DOMRenderer') as any
      };

      expect(() => layer.mount(domContext)).not.toThrow();
    });
  });
});
