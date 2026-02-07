/**
 * Unit tests for DOMShapeRenderer
 * 
 * Tests SVG-based shape rendering including:
 * - Shape element creation and mounting
 * - Path generation for all shape types
 * - Visual property application
 * - Transform application (2D and 3D)
 * - Visibility and opacity control
 * - Cleanup and destruction
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DOMShapeRenderer } from './DOMShapeRenderer';
import type { ShapeLayerConfig } from './IShapeRenderer';
import type { FrameContext } from '../interfaces/LayerContext';

describe('DOMShapeRenderer', () => {
  let container: HTMLElement;
  let renderer: DOMShapeRenderer;
  let frameContext: FrameContext;

  beforeEach(() => {
    // Create container element
    container = document.createElement('div');
    container.style.width = '1920px';
    container.style.height = '1080px';
    document.body.appendChild(container);

    // Create renderer
    renderer = new DOMShapeRenderer();

    // Create frame context
    frameContext = {
      timeMs: 0,
      deltaMs: 16.67,
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
    renderer.destroy();
    document.body.removeChild(container);
  });

  describe('mount', () => {
    it('should create SVG container and shape element', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);

      // Check SVG container exists
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.style.position).toBe('absolute');
      expect(svg?.style.width).toBe('100%');
      expect(svg?.style.height).toBe('100%');

      // Check shape element exists
      const path = svg?.querySelector('path');
      expect(path).toBeTruthy();
    });

    it('should apply initial configuration', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'rectangle',
        width: 100,
        height: 50,
        fillColor: '#ff0000',
        strokeColor: '#0000ff',
        strokeWidth: 2
      };

      renderer.mount(container, config);

      const path = container.querySelector('path');
      expect(path?.getAttribute('fill')).toBe('#ff0000');
      expect(path?.getAttribute('stroke')).toBe('#0000ff');
      expect(path?.getAttribute('stroke-width')).toBe('2');
    });
  });

  describe('render - shape types', () => {
    it('should render rectangle', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'rectangle',
        width: 100,
        height: 50
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      expect(path?.getAttribute('d')).toBeTruthy();
      expect(path?.getAttribute('d')).toContain('M');
      expect(path?.getAttribute('d')).toContain('L');
    });

    it('should render square', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'square',
        size: 100
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      expect(path?.getAttribute('d')).toBeTruthy();
    });

    it('should render circle', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      expect(path?.getAttribute('d')).toBeTruthy();
      expect(path?.getAttribute('d')).toContain('A'); // Arc command
    });

    it('should render ellipse', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'ellipse',
        radiusX: 100,
        radiusY: 50
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      expect(path?.getAttribute('d')).toBeTruthy();
    });

    it('should render triangle', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'triangle',
        vertices: [
          { x: 0, y: -50 },
          { x: 50, y: 50 },
          { x: -50, y: 50 }
        ]
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      expect(path?.getAttribute('d')).toBeTruthy();
    });

    it('should render trapezoid', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'trapezoid',
        topWidth: 50,
        bottomWidth: 100,
        height: 75
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      expect(path?.getAttribute('d')).toBeTruthy();
    });

    it('should render polygon', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'polygon',
        sides: 6,
        radius: 50
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      expect(path?.getAttribute('d')).toBeTruthy();
    });

    it('should render star', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'star',
        points: 5,
        innerRadius: 25,
        outerRadius: 50
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      expect(path?.getAttribute('d')).toBeTruthy();
    });
  });

  describe('render - visual properties', () => {
    it('should apply fill color', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        fillColor: '#ff6b6b'
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      expect(path?.getAttribute('fill')).toBe('#ff6b6b');
    });

    it('should apply default fill color when not specified', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      expect(path?.getAttribute('fill')).toBe('#000000');
    });

    it('should apply stroke color and width', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        strokeColor: '#0000ff',
        strokeWidth: 3
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      expect(path?.getAttribute('stroke')).toBe('#0000ff');
      expect(path?.getAttribute('stroke-width')).toBe('3');
    });

    it('should apply default stroke (none) when not specified', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      expect(path?.getAttribute('stroke')).toBe('none');
      expect(path?.getAttribute('stroke-width')).toBe('0');
    });

    it('should apply opacity', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        opacity: 0.5
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      expect(path?.getAttribute('opacity')).toBe('0.5');
    });

    it('should apply default opacity (1.0) when not specified', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      expect(path?.getAttribute('opacity')).toBe('1');
    });

    it('should apply blend mode', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        blendMode: 'multiply'
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path') as SVGPathElement;
      expect(path?.style.mixBlendMode).toBe('multiply');
    });

    it('should apply default blend mode (normal) when not specified', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path') as SVGPathElement;
      expect(path?.style.mixBlendMode).toBe('normal');
    });

    it('should support CSS color formats', () => {
      const configs = [
        { fillColor: '#ff0000' },
        { fillColor: 'rgb(255, 0, 0)' },
        { fillColor: 'rgba(255, 0, 0, 0.5)' },
        { fillColor: 'hsl(0, 100%, 50%)' },
        { fillColor: 'red' }
      ];

      configs.forEach((colorConfig) => {
        const config: ShapeLayerConfig = {
          shapeType: 'circle',
          radius: 50,
          ...colorConfig
        };

        renderer.mount(container, config);
        renderer.render(config, frameContext);

        const path = container.querySelector('path');
        expect(path?.getAttribute('fill')).toBe(colorConfig.fillColor);

        renderer.destroy();
        renderer = new DOMShapeRenderer();
      });
    });
  });

  describe('render - transforms', () => {
    it('should apply position transform (pixels)', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        x: 100,
        y: 200
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      const transform = path?.getAttribute('transform');
      expect(transform).toContain('translate(100, 200)');
    });

    it('should apply position transform (percentage)', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        x: '50%',
        y: '50%'
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      const transform = path?.getAttribute('transform');
      // 50% of 1920 = 960, 50% of 1080 = 540
      expect(transform).toContain('translate(960, 540)');
    });

    it('should apply rotation transform', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        rotation: 45
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      const transform = path?.getAttribute('transform');
      expect(transform).toContain('rotate(45)');
    });

    it('should apply scale transform', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        scaleX: 2,
        scaleY: 1.5
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      const transform = path?.getAttribute('transform');
      expect(transform).toContain('scale(2, 1.5)');
    });

    it('should support negative scale (flipping)', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        scaleX: -1,
        scaleY: 1
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      const transform = path?.getAttribute('transform');
      expect(transform).toContain('scale(-1, 1)');
    });

    it('should apply skew transform', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        skewX: 15,
        skewY: 10
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      const transform = path?.getAttribute('transform');
      expect(transform).toContain('skewX(15)');
      expect(transform).toContain('skewY(10)');
    });

    it('should apply transforms in correct order: translate, rotate, scale, skew', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        x: 100,
        y: 200,
        rotation: 45,
        scaleX: 2,
        scaleY: 2,
        skewX: 10
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      const transform = path?.getAttribute('transform') || '';
      
      // Check order by finding indices
      const translateIndex = transform.indexOf('translate');
      const rotateIndex = transform.indexOf('rotate');
      const scaleIndex = transform.indexOf('scale');
      const skewIndex = transform.indexOf('skew');

      expect(translateIndex).toBeLessThan(rotateIndex);
      expect(rotateIndex).toBeLessThan(scaleIndex);
      expect(scaleIndex).toBeLessThan(skewIndex);
    });

    it('should apply default transforms when not specified', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      const transform = path?.getAttribute('transform');
      // Should have translate(0, 0) at minimum
      expect(transform).toContain('translate(0, 0)');
    });
  });

  describe('render - perspective transforms', () => {
    it('should apply perspective distance', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        perspective: 1000
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const svg = container.querySelector('svg') as SVGSVGElement;
      expect(svg?.style.perspective).toBe('1000px');
      expect(svg?.style.transformStyle).toBe('preserve-3d');
    });

    it('should apply 3D rotation transforms', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        rotateX: 45,
        rotateY: 30,
        rotateZ: 15
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const svg = container.querySelector('svg') as SVGSVGElement;
      const transform = svg?.style.transform;
      expect(transform).toContain('rotateX(45deg)');
      expect(transform).toContain('rotateY(30deg)');
      expect(transform).toContain('rotateZ(15deg)');
    });

    it('should apply translateZ', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        translateZ: 100
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const svg = container.querySelector('svg') as SVGSVGElement;
      const transform = svg?.style.transform;
      expect(transform).toContain('translateZ(100px)');
    });

    it('should not apply perspective transforms when not specified', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      renderer.render(config, frameContext);

      const svg = container.querySelector('svg') as SVGSVGElement;
      expect(svg?.style.transform).toBe('');
      expect(svg?.style.perspective).toBe('');
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

      const svg = container.querySelector('svg') as SVGSVGElement;
      expect(svg?.style.display).toBe('none');
    });

    it('should show shape when set to true', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      renderer.setVisible(false);
      renderer.setVisible(true);

      const svg = container.querySelector('svg') as SVGSVGElement;
      expect(svg?.style.display).toBe('block');
    });
  });

  describe('setOpacity', () => {
    it('should apply explicit opacity', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      renderer.setOpacity(0.5);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      expect(path?.getAttribute('opacity')).toBe('0.5');
    });

    it('should combine config opacity with explicit opacity', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50,
        opacity: 0.8
      };

      renderer.mount(container, config);
      renderer.setOpacity(0.5);
      renderer.render(config, frameContext);

      const path = container.querySelector('path');
      // 0.8 * 0.5 = 0.4
      expect(path?.getAttribute('opacity')).toBe('0.4');
    });
  });

  describe('destroy', () => {
    it('should remove SVG element from container', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      expect(container.querySelector('svg')).toBeTruthy();

      renderer.destroy();
      expect(container.querySelector('svg')).toBeNull();
    });

    it('should handle multiple destroy calls gracefully', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle',
        radius: 50
      };

      renderer.mount(container, config);
      renderer.destroy();
      
      // Should not throw
      expect(() => renderer.destroy()).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should throw error for unsupported shape type', () => {
      const config = {
        shapeType: 'invalid' as any,
        radius: 50
      };

      expect(() => renderer.mount(container, config)).toThrow('Unsupported shape type');
    });

    it('should throw error for rectangle without width/height', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'rectangle'
      };

      expect(() => renderer.mount(container, config)).toThrow('Rectangle requires width and height');
    });

    it('should throw error for circle without radius', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'circle'
      };

      expect(() => renderer.mount(container, config)).toThrow('Circle requires radius');
    });

    it('should throw error for triangle without vertices', () => {
      const config: ShapeLayerConfig = {
        shapeType: 'triangle'
      };

      expect(() => renderer.mount(container, config)).toThrow('Triangle requires exactly 3 vertices');
    });
  });
});
