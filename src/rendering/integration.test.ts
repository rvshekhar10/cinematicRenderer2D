/**
 * Integration tests for rendering interfaces
 */

import { RenderBackend } from './RenderBackend';
import type { ICinematicLayer, LayerMountContext, FrameContext } from '../core/interfaces';
import { AssetManager } from '../assets/AssetManager';

// Test implementation of RenderBackend
class TestRenderBackend extends RenderBackend {
  public layers: ICinematicLayer[] = [];
  public isInitialized = false;
  public isDestroyed = false;

  initialize(): void {
    this.isInitialized = true;
  }

  render(layers: ICinematicLayer[], context: FrameContext): void {
    this.layers = layers;
    // Simulate rendering by calling update on all layers
    layers.forEach(layer => layer.update(context));
  }

  resize(width: number, height: number): void {
    // Update container size
    this.container.style.width = `${width}px`;
    this.container.style.height = `${height}px`;
  }

  destroy(): void {
    this.isDestroyed = true;
    this.layers.forEach(layer => layer.destroy());
    this.layers = [];
  }
}

// Test implementation of ICinematicLayer
class TestLayer implements ICinematicLayer {
  public isMounted = false;
  public isDestroyed = false;
  public updateCount = 0;
  public lastFrameContext: FrameContext | null = null;

  constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly zIndex: number
  ) {}

  mount(ctx: LayerMountContext): void {
    this.isMounted = true;
    // Simulate creating DOM element
    const element = document.createElement('div');
    element.id = this.id;
    element.className = `layer-${this.type}`;
    element.style.zIndex = this.zIndex.toString();
    ctx.container.appendChild(element);
  }

  update(ctx: FrameContext): void {
    this.updateCount++;
    this.lastFrameContext = ctx;
  }

  destroy(): void {
    this.isDestroyed = true;
    // Simulate removing DOM element
    const element = document.getElementById(this.id);
    if (element) {
      element.remove();
    }
  }
}

describe('Rendering System Integration', () => {
  let container: HTMLElement;
  let renderer: TestRenderBackend;
  let assetManager: AssetManager;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
    
    renderer = new TestRenderBackend(container);
    assetManager = new AssetManager();
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('complete rendering lifecycle', () => {
    it('should handle full lifecycle with multiple layers', () => {
      // Create layers with different z-indices
      const backgroundLayer = new TestLayer('bg', 'gradient', 0);
      const contentLayer = new TestLayer('content', 'text', 10);
      const overlayLayer = new TestLayer('overlay', 'vignette', 100);
      const layers = [backgroundLayer, contentLayer, overlayLayer];

      // Initialize renderer
      renderer.initialize();
      expect(renderer.isInitialized).toBe(true);

      // Mount all layers
      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager,
        layerConfig: { test: true }
      };

      layers.forEach(layer => {
        layer.mount(mountContext);
        expect(layer.isMounted).toBe(true);
      });

      // Verify DOM elements were created
      expect(container.children).toHaveLength(3);
      expect(document.getElementById('bg')).toBeTruthy();
      expect(document.getElementById('content')).toBeTruthy();
      expect(document.getElementById('overlay')).toBeTruthy();

      // Render multiple frames
      const frameContexts: FrameContext[] = [
        {
          timeMs: 0,
          deltaMs: 16.67,
          quality: 'high',
          viewport: { width: 800, height: 600 },
          devicePixelRatio: 1
        },
        {
          timeMs: 16.67,
          deltaMs: 16.67,
          quality: 'high',
          viewport: { width: 800, height: 600 },
          devicePixelRatio: 1
        },
        {
          timeMs: 33.34,
          deltaMs: 16.67,
          quality: 'high',
          viewport: { width: 800, height: 600 },
          devicePixelRatio: 1
        }
      ];

      frameContexts.forEach(frameContext => {
        renderer.render(layers, frameContext);
      });

      // Verify all layers were updated
      layers.forEach(layer => {
        expect(layer.updateCount).toBe(3);
        expect(layer.lastFrameContext?.timeMs).toBe(33.34);
      });

      // Test resize
      renderer.resize(1920, 1080);
      expect(container.style.width).toBe('1920px');
      expect(container.style.height).toBe('1080px');

      // Destroy renderer and layers
      renderer.destroy();
      expect(renderer.isDestroyed).toBe(true);
      
      layers.forEach(layer => {
        expect(layer.isDestroyed).toBe(true);
      });

      // Verify DOM elements were removed
      expect(document.getElementById('bg')).toBeFalsy();
      expect(document.getElementById('content')).toBeFalsy();
      expect(document.getElementById('overlay')).toBeFalsy();
    });

    it('should handle layer z-index ordering', () => {
      const layers = [
        new TestLayer('layer-high', 'test', 100),
        new TestLayer('layer-low', 'test', 1),
        new TestLayer('layer-medium', 'test', 50)
      ];

      renderer.initialize();

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager,
        layerConfig: {}
      };

      layers.forEach(layer => layer.mount(mountContext));

      const frameContext: FrameContext = {
        timeMs: 1000,
        deltaMs: 16.67,
        quality: 'medium',
        viewport: { width: 800, height: 600 },
        devicePixelRatio: 1
      };

      renderer.render(layers, frameContext);

      // Verify z-index is applied correctly
      const highElement = document.getElementById('layer-high');
      const mediumElement = document.getElementById('layer-medium');
      const lowElement = document.getElementById('layer-low');

      expect(highElement?.style.zIndex).toBe('100');
      expect(mediumElement?.style.zIndex).toBe('50');
      expect(lowElement?.style.zIndex).toBe('1');

      renderer.destroy();
    });

    it('should handle responsive viewport changes', () => {
      const layer = new TestLayer('responsive', 'test', 1);
      renderer.initialize();

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager,
        layerConfig: { responsive: true }
      };

      layer.mount(mountContext);

      // Simulate different viewport sizes
      const viewports = [
        { width: 320, height: 568 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1920, height: 1080 }  // Desktop
      ];

      viewports.forEach((viewport, index) => {
        const frameContext: FrameContext = {
          timeMs: index * 1000,
          deltaMs: 16.67,
          quality: 'medium',
          viewport,
          devicePixelRatio: index + 1
        };

        renderer.render([layer], frameContext);
        renderer.resize(viewport.width, viewport.height);

        expect(layer.lastFrameContext?.viewport).toEqual(viewport);
        expect(container.style.width).toBe(`${viewport.width}px`);
        expect(container.style.height).toBe(`${viewport.height}px`);
      });

      renderer.destroy();
    });

    it('should handle quality level changes', () => {
      const layer = new TestLayer('quality-test', 'test', 1);
      renderer.initialize();

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager,
        layerConfig: {}
      };

      layer.mount(mountContext);

      const qualityLevels = ['low', 'medium', 'high', 'ultra'] as const;

      qualityLevels.forEach((quality, index) => {
        const frameContext: FrameContext = {
          timeMs: index * 100,
          deltaMs: 16.67,
          quality,
          viewport: { width: 800, height: 600 },
          devicePixelRatio: 1
        };

        renderer.render([layer], frameContext);
        expect(layer.lastFrameContext?.quality).toBe(quality);
      });

      renderer.destroy();
    });
  });

  describe('error handling', () => {
    it('should handle layer mount failures gracefully', () => {
      class FailingLayer extends TestLayer {
        mount(): void {
          throw new Error('Mount failed');
        }
      }

      const goodLayer = new TestLayer('good', 'test', 1);
      const badLayer = new FailingLayer('bad', 'test', 2);

      renderer.initialize();

      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager,
        layerConfig: {}
      };

      // Good layer should mount successfully
      expect(() => goodLayer.mount(mountContext)).not.toThrow();
      expect(goodLayer.isMounted).toBe(true);

      // Bad layer should throw error
      expect(() => badLayer.mount(mountContext)).toThrow('Mount failed');
      expect(badLayer.isMounted).toBe(false);

      renderer.destroy();
    });

    it('should handle empty layer arrays', () => {
      renderer.initialize();

      const frameContext: FrameContext = {
        timeMs: 1000,
        deltaMs: 16.67,
        quality: 'medium',
        viewport: { width: 800, height: 600 },
        devicePixelRatio: 1
      };

      expect(() => renderer.render([], frameContext)).not.toThrow();
      expect(renderer.layers).toEqual([]);

      renderer.destroy();
    });
  });
});