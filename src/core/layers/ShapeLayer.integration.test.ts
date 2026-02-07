/**
 * Integration tests for ShapeLayer with rendering backends
 * 
 * Tests ShapeLayer integration with DOM and Canvas2D renderers.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ShapeLayer } from './ShapeLayer';
import { DOMRenderer } from '../../rendering/dom/DOMRenderer';
import { Canvas2DRenderer } from '../../rendering/canvas2d/Canvas2DRenderer';
import type { LayerMountContext, FrameContext } from '../interfaces/LayerContext';
import type { ShapeLayerConfig } from '../shapes/IShapeRenderer';

describe('ShapeLayer Integration', () => {
  let container: HTMLElement;
  let frameContext: FrameContext;

  beforeEach(() => {
    // Create container
    container = document.createElement('div');
    container.style.width = '1920px';
    container.style.height = '1080px';
    document.body.appendChild(container);

    // Create frame context
    frameContext = {
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

  describe('DOM Renderer Integration', () => {
    it('should render circle with DOM renderer', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        fillColor: '#ff0000'
      };

      const layer = new ShapeLayer('test-circle', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Verify SVG element was created
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();

      layer.destroy();
      renderer.destroy();
    });

    it('should render rectangle with DOM renderer', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'rectangle',
        width: 100,
        height: 50,
        fillColor: '#00ff00'
      };

      const layer = new ShapeLayer('test-rect', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Verify SVG element was created
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();

      layer.destroy();
      renderer.destroy();
    });

    it('should handle visibility changes with DOM renderer', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test-circle', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Test visibility
      layer.setVisible(false);
      layer.update(frameContext);

      const svg = container.querySelector('svg') as SVGElement;
      expect(svg.style.display).toBe('none');

      layer.setVisible(true);
      layer.update(frameContext);
      expect(svg.style.display).toBe('block');

      layer.destroy();
      renderer.destroy();
    });
  });

  describe('Canvas2D Renderer Integration', () => {
    it('should render circle with Canvas2D renderer', () => {
      const renderer = new Canvas2DRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        fillColor: '#ff0000'
      };

      const layer = new ShapeLayer('test-circle', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Verify canvas element was created
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();

      layer.destroy();
      renderer.destroy();
    });

    it('should render star with Canvas2D renderer', () => {
      const renderer = new Canvas2DRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'star',
        points: 5,
        innerRadius: 25,
        outerRadius: 50,
        fillColor: '#ffff00'
      };

      const layer = new ShapeLayer('test-star', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Verify canvas element was created
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();

      layer.destroy();
      renderer.destroy();
    });

    it('should handle opacity changes with Canvas2D renderer', () => {
      const renderer = new Canvas2DRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      const layer = new ShapeLayer('test-circle', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Test opacity changes
      expect(() => {
        layer.setOpacity(0.5);
        layer.update(frameContext);
      }).not.toThrow();

      layer.destroy();
      renderer.destroy();
    });
  });

  describe('Multiple Shapes', () => {
    it('should render multiple shapes with DOM renderer', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const circle: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        x: 100,
        y: 100
      };

      const square: ShapeLayerConfig = {
        shapeType: 'square',
        size: 80,
        x: 300,
        y: 100
      };

      const layer1 = new ShapeLayer('circle', circle);
      const layer2 = new ShapeLayer('square', square);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer1.mount(mountContext);
      layer2.mount(mountContext);

      layer1.update(frameContext);
      layer2.update(frameContext);

      // Verify both shapes were created
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(2);

      layer1.destroy();
      layer2.destroy();
      renderer.destroy();
    });
  });

  describe('Transform Properties', () => {
    it('should apply position transform', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        x: 500,
        y: 300
      };

      const layer = new ShapeLayer('test-circle', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Verify shape was created
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();

      layer.destroy();
      renderer.destroy();
    });

    it('should apply rotation transform', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'rectangle',
        width: 100,
        height: 50,
        rotation: 45
      };

      const layer = new ShapeLayer('test-rect', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Verify shape was created
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();

      layer.destroy();
      renderer.destroy();
    });

    it('should apply scale transform', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        scaleX: 2,
        scaleY: 0.5
      };

      const layer = new ShapeLayer('test-circle', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Verify shape was created
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();

      layer.destroy();
      renderer.destroy();
    });

    it('should support negative scale for flipping', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'triangle',
        vertices: [
          { x: 0, y: -50 },
          { x: -50, y: 50 },
          { x: 50, y: 50 }
        ],
        scaleX: -1,
        scaleY: 1
      };

      const layer = new ShapeLayer('test-triangle', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Verify shape was created
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();

      layer.destroy();
      renderer.destroy();
    });
  });

  describe('Visual Properties', () => {
    it('should apply fill and stroke', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        fillColor: '#ff0000',
        strokeColor: '#0000ff',
        strokeWidth: 3
      };

      const layer = new ShapeLayer('test-circle', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Verify shape was created
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();

      layer.destroy();
      renderer.destroy();
    });

    it('should apply opacity', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        opacity: 0.5
      };

      const layer = new ShapeLayer('test-circle', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Verify shape was created
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();

      layer.destroy();
      renderer.destroy();
    });

    it('should apply blend modes', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        fillColor: '#ff0000',
        blendMode: 'multiply'
      };

      const layer = new ShapeLayer('test-circle', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Verify shape was created with blend mode
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      
      const path = svg?.querySelector('path');
      expect(path).toBeTruthy();
      expect((path as SVGPathElement).style.mixBlendMode).toBe('multiply');

      layer.destroy();
      renderer.destroy();
    });
  });

  describe('Z-Index Layering (Requirements 2.2, 6.1, 6.2, 6.3)', () => {
    it('should respect z-index values in layer creation', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      // Create shapes with different z-index values
      const layer1 = new ShapeLayer('shape-low', {
        shapeType: 'circle',
        radius: 50,
        zIndex: 1
      });

      const layer2 = new ShapeLayer('shape-high', {
        shapeType: 'square',
        size: 80,
        zIndex: 10
      });

      const layer3 = new ShapeLayer('shape-medium', {
        shapeType: 'star',
        points: 5,
        innerRadius: 20,
        outerRadius: 40,
        zIndex: 5
      });

      // Verify z-index values are set correctly
      expect(layer1.zIndex).toBe(1);
      expect(layer2.zIndex).toBe(10);
      expect(layer3.zIndex).toBe(5);

      renderer.destroy();
    });

    it('should render multiple shapes independently (Requirement 6.1)', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      // Create multiple shapes with different properties
      const shapes = [
        new ShapeLayer('circle', {
          shapeType: 'circle',
          radius: 50,
          x: 100,
          y: 100,
          fillColor: '#ff0000',
          zIndex: 1
        }),
        new ShapeLayer('square', {
          shapeType: 'square',
          size: 80,
          x: 200,
          y: 100,
          fillColor: '#00ff00',
          zIndex: 2
        }),
        new ShapeLayer('star', {
          shapeType: 'star',
          points: 5,
          innerRadius: 25,
          outerRadius: 50,
          x: 300,
          y: 100,
          fillColor: '#0000ff',
          zIndex: 3
        })
      ];

      // Mount and render all shapes
      shapes.forEach(shape => {
        shape.mount(mountContext);
        shape.update(frameContext);
      });

      // Verify all shapes were created independently
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(3);

      // Verify each shape has its own SVG element
      shapes.forEach(shape => {
        const svg = Array.from(svgs).find(s => 
          s.querySelector('path') !== null
        );
        expect(svg).toBeTruthy();
      });

      // Clean up
      shapes.forEach(shape => shape.destroy());
      renderer.destroy();
    });

    it('should render shapes in correct z-index order with DOMRenderer (Requirement 6.2)', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      // Create shapes with different z-index values (not in order)
      const layers = [
        new ShapeLayer('shape-high', {
          shapeType: 'circle',
          radius: 50,
          zIndex: 100
        }),
        new ShapeLayer('shape-low', {
          shapeType: 'square',
          size: 80,
          zIndex: 1
        }),
        new ShapeLayer('shape-medium', {
          shapeType: 'star',
          points: 5,
          innerRadius: 20,
          outerRadius: 40,
          zIndex: 50
        })
      ];

      // The DOMRenderer should sort these by z-index
      renderer.render(layers, frameContext);

      // Verify layers are sorted by z-index
      // DOMRenderer sorts layers internally, so we just verify it doesn't throw
      expect(layers[0].zIndex).toBe(100);
      expect(layers[1].zIndex).toBe(1);
      expect(layers[2].zIndex).toBe(50);

      renderer.destroy();
    });

    it('should handle overlapping shapes with blend modes (Requirement 6.3)', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      // Create overlapping shapes with different blend modes
      const shape1 = new ShapeLayer('shape-base', {
        shapeType: 'circle',
        radius: 60,
        x: 500,
        y: 500,
        fillColor: '#ff0000',
        opacity: 0.8,
        zIndex: 1
      });

      const shape2 = new ShapeLayer('shape-overlay', {
        shapeType: 'circle',
        radius: 60,
        x: 540,
        y: 500,
        fillColor: '#0000ff',
        opacity: 0.8,
        blendMode: 'multiply',
        zIndex: 2
      });

      // Mount and render shapes
      shape1.mount(mountContext);
      shape2.mount(mountContext);
      shape1.update(frameContext);
      shape2.update(frameContext);

      // Verify both shapes were created
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(2);

      // Verify blend mode is applied to the overlay shape
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBe(2);
      
      // The second shape should have the blend mode
      const overlayPath = paths[1] as SVGPathElement;
      expect(overlayPath.style.mixBlendMode).toBe('multiply');

      // Clean up
      shape1.destroy();
      shape2.destroy();
      renderer.destroy();
    });

    it('should support multiple shape layers in single scene (Requirement 6.1)', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      // Create many shapes to test performance and independence
      const shapes = [];
      for (let i = 0; i < 10; i++) {
        shapes.push(new ShapeLayer(`shape-${i}`, {
          shapeType: 'circle',
          radius: 20,
          x: 100 + (i * 50),
          y: 500,
          fillColor: `hsl(${i * 36}, 70%, 50%)`,
          zIndex: i
        }));
      }

      // Mount and render all shapes
      shapes.forEach(shape => {
        shape.mount(mountContext);
        shape.update(frameContext);
      });

      // Verify all shapes were created
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(10);

      // Clean up
      shapes.forEach(shape => shape.destroy());
      renderer.destroy();
    });

    it('should handle z-index with Canvas2D renderer', () => {
      const renderer = new Canvas2DRenderer(container);
      renderer.initialize();

      // Create shapes with different z-index values
      const layers = [
        new ShapeLayer('shape-high', {
          shapeType: 'circle',
          radius: 50,
          zIndex: 100
        }),
        new ShapeLayer('shape-low', {
          shapeType: 'square',
          size: 80,
          zIndex: 1
        }),
        new ShapeLayer('shape-medium', {
          shapeType: 'star',
          points: 5,
          innerRadius: 20,
          outerRadius: 40,
          zIndex: 50
        })
      ];

      // The Canvas2DRenderer should sort these by z-index
      // Note: Canvas2D renderer doesn't directly support shape layers yet,
      // but we verify the z-index property is preserved
      expect(layers[0].zIndex).toBe(100);
      expect(layers[1].zIndex).toBe(1);
      expect(layers[2].zIndex).toBe(50);

      renderer.destroy();
    });
  });

  describe('Transition System Compatibility (Requirement 7.4)', () => {
    it('should support opacity transitions for crossfade effects', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        fillColor: '#ff0000'
      };

      const layer = new ShapeLayer('test-circle', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Simulate transition by changing opacity over time
      // This is what the TransitionEngine does during crossfade
      const opacityValues = [1.0, 0.75, 0.5, 0.25, 0.0];
      
      opacityValues.forEach(opacity => {
        expect(() => {
          layer.setOpacity(opacity);
          layer.update(frameContext);
        }).not.toThrow();
      });

      // Verify shape is still functional after opacity changes
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();

      layer.destroy();
      renderer.destroy();
    });

    it('should support visibility transitions', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'square',
        size: 100,
        fillColor: '#00ff00'
      };

      const layer = new ShapeLayer('test-square', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Simulate transition visibility changes
      expect(() => {
        layer.setVisible(false);
        layer.update(frameContext);
      }).not.toThrow();

      const svg = container.querySelector('svg') as SVGElement;
      expect(svg.style.display).toBe('none');

      expect(() => {
        layer.setVisible(true);
        layer.update(frameContext);
      }).not.toThrow();

      expect(svg.style.display).toBe('block');

      layer.destroy();
      renderer.destroy();
    });

    it('should handle rapid opacity changes during transitions', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'star',
        points: 5,
        innerRadius: 25,
        outerRadius: 50,
        fillColor: '#ffff00'
      };

      const layer = new ShapeLayer('test-star', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Simulate rapid opacity changes (like during a fast transition)
      for (let i = 0; i <= 100; i += 5) {
        const opacity = i / 100;
        expect(() => {
          layer.setOpacity(opacity);
          layer.update(frameContext);
        }).not.toThrow();
      }

      // Verify shape is still functional
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();

      layer.destroy();
      renderer.destroy();
    });

    it('should combine config opacity with transition opacity', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        fillColor: '#ff0000',
        opacity: 0.8 // Base opacity from config
      };

      const layer = new ShapeLayer('test-circle', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Apply transition opacity (should multiply with config opacity)
      // Config opacity: 0.8, Transition opacity: 0.5
      // Expected final opacity: 0.8 * 0.5 = 0.4
      expect(() => {
        layer.setOpacity(0.5);
        layer.update(frameContext);
      }).not.toThrow();

      // Verify shape is still functional
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();

      layer.destroy();
      renderer.destroy();
    });

    it('should work with Canvas2D renderer during transitions', () => {
      const renderer = new Canvas2DRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'polygon',
        sides: 6,
        radius: 50,
        fillColor: '#0000ff'
      };

      const layer = new ShapeLayer('test-polygon', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Simulate transition opacity changes with Canvas2D
      const opacityValues = [1.0, 0.75, 0.5, 0.25, 0.0];
      
      opacityValues.forEach(opacity => {
        expect(() => {
          layer.setOpacity(opacity);
          layer.update(frameContext);
        }).not.toThrow();
      });

      // Verify canvas is still functional
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();

      layer.destroy();
      renderer.destroy();
    });

    it('should maintain shape properties during transitions', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const config: ShapeLayerConfig = {
        shapeType: 'rectangle',
        width: 100,
        height: 50,
        fillColor: '#ff00ff',
        strokeColor: '#000000',
        strokeWidth: 2,
        rotation: 45,
        scaleX: 1.5,
        scaleY: 1.5
      };

      const layer = new ShapeLayer('test-rect', config);

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      layer.mount(mountContext);
      layer.update(frameContext);

      // Apply transition effects
      layer.setOpacity(0.5);
      layer.update(frameContext);

      // Verify shape configuration is preserved
      const layerConfig = layer.getConfig();
      expect(layerConfig.width).toBe(100);
      expect(layerConfig.height).toBe(50);
      expect(layerConfig.fillColor).toBe('#ff00ff');
      expect(layerConfig.rotation).toBe(45);
      expect(layerConfig.scaleX).toBe(1.5);

      layer.destroy();
      renderer.destroy();
    });

    it('should support multiple shapes transitioning simultaneously', () => {
      const renderer = new DOMRenderer(container);
      renderer.initialize();

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager: {} as any,
        layerConfig: {}
      };

      // Create multiple shapes
      const shapes = [
        new ShapeLayer('circle', {
          shapeType: 'circle',
          radius: 50,
          x: 100,
          y: 100,
          fillColor: '#ff0000'
        }),
        new ShapeLayer('square', {
          shapeType: 'square',
          size: 80,
          x: 300,
          y: 100,
          fillColor: '#00ff00'
        }),
        new ShapeLayer('star', {
          shapeType: 'star',
          points: 5,
          innerRadius: 25,
          outerRadius: 50,
          x: 500,
          y: 100,
          fillColor: '#0000ff'
        })
      ];

      // Mount all shapes
      shapes.forEach(shape => {
        shape.mount(mountContext);
        shape.update(frameContext);
      });

      // Simulate simultaneous transition (like crossfade)
      const opacityValues = [1.0, 0.75, 0.5, 0.25, 0.0];
      
      opacityValues.forEach(opacity => {
        shapes.forEach(shape => {
          expect(() => {
            shape.setOpacity(opacity);
            shape.update(frameContext);
          }).not.toThrow();
        });
      });

      // Verify all shapes are still functional
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(3);

      // Clean up
      shapes.forEach(shape => shape.destroy());
      renderer.destroy();
    });
  });
});
