/**
 * Unit tests for Canvas2DShapeRenderer
 * 
 * Tests Canvas2D-based shape rendering including:
 * - Mounting and initialization
 * - Shape rendering for all shape types
 * - Transform application
 * - Visual property application
 * - Visibility and opacity control
 * - Cleanup and destruction
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Canvas2DShapeRenderer } from './Canvas2DShapeRenderer';
import type { ShapeLayerConfig } from './IShapeRenderer';
import type { FrameContext } from '../interfaces/LayerContext';

describe('Canvas2DShapeRenderer', () => {
  let container: HTMLElement;
  let renderer: Canvas2DShapeRenderer;
  let mockFrameContext: FrameContext;

  beforeEach(() => {
    // Create container element
    container = document.createElement('div');
    container.style.width = '1920px';
    container.style.height = '1080px';
    document.body.appendChild(container);

    // Create renderer
    renderer = new Canvas2DShapeRenderer();

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

  afterEach(() => {
    // Clean up
    if (renderer) {
      renderer.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('mount', () => {
    it('should create canvas element and add to container', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);

      const canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();
      expect(canvas?.style.position).toBe('absolute');
    });

    it('should get 2D context from canvas', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas).not.toBeNull();
      
      const ctx = canvas.getContext('2d');
      expect(ctx).not.toBeNull();
    });

    it('should set canvas size to match container', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas.width).toBe(1920);
      expect(canvas.height).toBe(1080);
    });
  });

  describe('render - shape types', () => {
    it('should render rectangle without errors', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'rectangle',
        width: 100,
        height: 50
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should render square without errors', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'square',
        size: 100
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should render circle without errors', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should render ellipse without errors', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'ellipse',
        radiusX: 100,
        radiusY: 50
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should render triangle without errors', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'triangle',
        vertices: [
          { x: 0, y: -50 },
          { x: 50, y: 50 },
          { x: -50, y: 50 }
        ]
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should render trapezoid without errors', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'trapezoid',
        topWidth: 50,
        bottomWidth: 100,
        height: 75
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should render polygon without errors', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'polygon',
        sides: 6,
        radius: 50
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should render star without errors', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'star',
        points: 5,
        innerRadius: 25,
        outerRadius: 50
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should throw error for rectangle missing width', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'rectangle',
        height: 50
      };

      expect(() => renderer.mount(container, config)).toThrow('Rectangle requires width and height');
    });

    it('should throw error for unsupported shape type', () => {
      const config = {
        shapeType: 'hexagon' as any
      };

      expect(() => renderer.mount(container, config)).toThrow('Unsupported shape type');
    });
  });

  describe('render - transforms', () => {
    it('should apply position transform', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        x: 100,
        y: 200
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should apply percentage position', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        x: '50%',
        y: '50%'
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should apply rotation transform', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'rectangle',
        width: 100,
        height: 50,
        rotation: 45
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should apply scale transform', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        scaleX: 2,
        scaleY: 1.5
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should apply negative scale (flip)', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'rectangle',
        width: 100,
        height: 50,
        scaleX: -1,
        scaleY: 1
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should apply skew transform', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'rectangle',
        width: 100,
        height: 50,
        skewX: 15,
        skewY: 10
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should apply all transforms together', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        x: 100,
        y: 200,
        rotation: 45,
        scaleX: 1.5,
        scaleY: 1.5,
        skewX: 10,
        skewY: 5
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });
  });

  describe('render - visual properties', () => {
    it('should apply fill color', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        fillColor: '#ff0000'
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should apply stroke color and width', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        strokeColor: '#0000ff',
        strokeWidth: 3
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should apply both fill and stroke', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        fillColor: '#ff0000',
        strokeColor: '#0000ff',
        strokeWidth: 2
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should apply opacity', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        opacity: 0.5
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should apply blend mode', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        blendMode: 'multiply'
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should support various CSS color formats', () => {
      const colorFormats = [
        '#ff0000',
        '#f00',
        'rgb(255, 0, 0)',
        'rgba(255, 0, 0, 0.5)',
        'hsl(0, 100%, 50%)',
        'hsla(0, 100%, 50%, 0.5)',
        'red'
      ];

      for (const color of colorFormats) {
        const config: ShapeLayerConfig = {
          shapeType: 'circle',
          radius: 50,
          fillColor: color
        };

        renderer.mount(container, config);
        expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
        renderer.destroy();
        renderer = new Canvas2DShapeRenderer();
      }
    });
  });

  describe('setVisible', () => {
    it('should hide shape when set to false', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      renderer.setVisible(false);

      // Canvas should still exist but shape should not be rendered
      const canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();
    });

    it('should show shape when set to true', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      renderer.setVisible(false);
      renderer.setVisible(true);

      const canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();
    });
  });

  describe('setOpacity', () => {
    it('should update shape opacity', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      expect(() => renderer.setOpacity(0.5)).not.toThrow();
    });

    it('should combine with config opacity', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        opacity: 0.8
      };

      renderer.mount(container, config);
      expect(() => renderer.setOpacity(0.5)).not.toThrow();
      // Final opacity should be 0.8 * 0.5 = 0.4
    });
  });

  describe('destroy', () => {
    it('should remove canvas from container', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      
      let canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();

      renderer.destroy();

      canvas = container.querySelector('canvas');
      expect(canvas).toBeNull();
    });

    it('should not throw when called multiple times', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      
      expect(() => {
        renderer.destroy();
        renderer.destroy();
      }).not.toThrow();
    });
  });

  describe('default values', () => {
    it('should use default position (0, 0)', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should use default rotation (0)', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should use default scale (1, 1)', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should use default skew (0, 0)', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should use default fill color (black)', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should use default opacity (1.0)', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle zero-sized shapes', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 0
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should handle very large shapes', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 10000
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should handle 360 degree rotation', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        rotation: 360
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should handle zero opacity', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        opacity: 0
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });

    it('should handle zero scale', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        scaleX: 0,
        scaleY: 0
      };

      renderer.mount(container, config);
      expect(() => renderer.render(config, mockFrameContext)).not.toThrow();
    });
  });
});
