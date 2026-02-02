/**
 * Tests for LayerContext interfaces (LayerMountContext and FrameContext)
 */

import type { LayerMountContext, FrameContext } from './LayerContext';
import { RenderBackend } from '../../rendering/RenderBackend';
import { AssetManager } from '../../assets/AssetManager';

// Mock RenderBackend for testing
class MockRenderBackend extends RenderBackend {
  initialize(): void {}
  render(): void {}
  resize(): void {}
  destroy(): void {}
}

describe('LayerContext Interfaces', () => {
  let container: HTMLElement;
  let canvas: HTMLCanvasElement;
  let renderer: MockRenderBackend;
  let assetManager: AssetManager;

  beforeEach(() => {
    container = document.createElement('div');
    canvas = document.createElement('canvas');
    renderer = new MockRenderBackend(container);
    assetManager = new AssetManager();
  });

  describe('LayerMountContext', () => {
    it('should accept all required properties', () => {
      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager,
        layerConfig: { color: 'red' }
      };

      expect(mountContext.container).toBe(container);
      expect(mountContext.renderer).toBe(renderer);
      expect(mountContext.assetManager).toBe(assetManager);
      expect(mountContext.layerConfig).toEqual({ color: 'red' });
    });

    it('should accept optional canvas property', () => {
      const mountContextWithCanvas: LayerMountContext = {
        container,
        canvas,
        renderer,
        assetManager,
        layerConfig: {}
      };

      expect(mountContextWithCanvas.canvas).toBe(canvas);

      const mountContextWithoutCanvas: LayerMountContext = {
        container,
        renderer,
        assetManager,
        layerConfig: {}
      };

      expect(mountContextWithoutCanvas.canvas).toBeUndefined();
    });

    it('should support different container types', () => {
      const divContainer = document.createElement('div');
      const sectionContainer = document.createElement('section');
      const canvasContainer = document.createElement('canvas');

      const contexts = [
        { container: divContainer, name: 'div' },
        { container: sectionContainer, name: 'section' },
        { container: canvasContainer, name: 'canvas' }
      ];

      contexts.forEach(({ container: testContainer, name }) => {
        const mountContext: LayerMountContext = {
          container: testContainer,
          renderer,
          assetManager,
          layerConfig: { containerType: name }
        };

        expect(mountContext.container).toBe(testContainer);
        expect(mountContext.layerConfig.containerType).toBe(name);
      });
    });

    it('should support different layer configurations', () => {
      const configs = [
        {},
        { color: '#ff0000' },
        { text: 'Hello World', fontSize: 24, fontFamily: 'Arial' },
        { particleCount: 100, speed: 2.5, color: 'blue' },
        { gradient: { from: '#000', to: '#fff' }, opacity: 0.8 },
        { image: { src: 'test.jpg', width: 200, height: 150 } },
        { complex: { nested: { value: true }, array: [1, 2, 3] } }
      ];

      configs.forEach((config, index) => {
        const mountContext: LayerMountContext = {
          container,
          renderer,
          assetManager,
          layerConfig: config
        };

        expect(mountContext.layerConfig).toEqual(config);
      });
    });

    it('should work with different asset managers', () => {
      const assetManager1 = new AssetManager();
      const assetManager2 = new AssetManager();

      const context1: LayerMountContext = {
        container,
        renderer,
        assetManager: assetManager1,
        layerConfig: {}
      };

      const context2: LayerMountContext = {
        container,
        renderer,
        assetManager: assetManager2,
        layerConfig: {}
      };

      expect(context1.assetManager).toBe(assetManager1);
      expect(context2.assetManager).toBe(assetManager2);
      expect(context1.assetManager).not.toBe(context2.assetManager);
    });
  });

  describe('FrameContext', () => {
    it('should accept all required properties', () => {
      const frameContext: FrameContext = {
        timeMs: 1000,
        deltaMs: 16.67,
        quality: 'medium',
        viewport: { width: 800, height: 600 },
        devicePixelRatio: 1
      };

      expect(frameContext.timeMs).toBe(1000);
      expect(frameContext.deltaMs).toBe(16.67);
      expect(frameContext.quality).toBe('medium');
      expect(frameContext.viewport).toEqual({ width: 800, height: 600 });
      expect(frameContext.devicePixelRatio).toBe(1);
    });

    it('should support different time values', () => {
      const timeValues = [0, 100, 1000, 5000, 60000, 300000]; // 0ms to 5 minutes

      timeValues.forEach(timeMs => {
        const frameContext: FrameContext = {
          timeMs,
          deltaMs: 16.67,
          quality: 'medium',
          viewport: { width: 800, height: 600 },
          devicePixelRatio: 1
        };

        expect(frameContext.timeMs).toBe(timeMs);
      });
    });

    it('should support different delta time values', () => {
      const deltaValues = [
        8.33,   // 120fps
        16.67,  // 60fps
        33.33,  // 30fps
        50,     // 20fps
        100     // 10fps (performance issue)
      ];

      deltaValues.forEach(deltaMs => {
        const frameContext: FrameContext = {
          timeMs: 1000,
          deltaMs,
          quality: 'medium',
          viewport: { width: 800, height: 600 },
          devicePixelRatio: 1
        };

        expect(frameContext.deltaMs).toBe(deltaMs);
      });
    });

    it('should support all quality levels', () => {
      const qualityLevels = ['low', 'medium', 'high', 'ultra', 'auto'] as const;

      qualityLevels.forEach(quality => {
        const frameContext: FrameContext = {
          timeMs: 1000,
          deltaMs: 16.67,
          quality,
          viewport: { width: 800, height: 600 },
          devicePixelRatio: 1
        };

        expect(frameContext.quality).toBe(quality);
      });
    });

    it('should support different viewport sizes', () => {
      const viewports = [
        { width: 320, height: 240 },    // QVGA
        { width: 640, height: 480 },    // VGA
        { width: 800, height: 600 },    // SVGA
        { width: 1024, height: 768 },   // XGA
        { width: 1280, height: 720 },   // HD
        { width: 1920, height: 1080 },  // Full HD
        { width: 2560, height: 1440 },  // QHD
        { width: 3840, height: 2160 },  // 4K
        { width: 7680, height: 4320 }   // 8K
      ];

      viewports.forEach(viewport => {
        const frameContext: FrameContext = {
          timeMs: 1000,
          deltaMs: 16.67,
          quality: 'medium',
          viewport,
          devicePixelRatio: 1
        };

        expect(frameContext.viewport).toEqual(viewport);
      });
    });

    it('should support different device pixel ratios', () => {
      const pixelRatios = [1, 1.25, 1.5, 2, 2.5, 3, 4];

      pixelRatios.forEach(devicePixelRatio => {
        const frameContext: FrameContext = {
          timeMs: 1000,
          deltaMs: 16.67,
          quality: 'medium',
          viewport: { width: 800, height: 600 },
          devicePixelRatio
        };

        expect(frameContext.devicePixelRatio).toBe(devicePixelRatio);
      });
    });

    it('should handle edge cases', () => {
      // Zero time
      const zeroTimeContext: FrameContext = {
        timeMs: 0,
        deltaMs: 16.67,
        quality: 'low',
        viewport: { width: 1, height: 1 },
        devicePixelRatio: 1
      };
      expect(zeroTimeContext.timeMs).toBe(0);

      // Very small viewport
      const smallViewportContext: FrameContext = {
        timeMs: 1000,
        deltaMs: 16.67,
        quality: 'low',
        viewport: { width: 1, height: 1 },
        devicePixelRatio: 1
      };
      expect(smallViewportContext.viewport.width).toBe(1);
      expect(smallViewportContext.viewport.height).toBe(1);

      // Very large delta (performance issue)
      const largeDeltaContext: FrameContext = {
        timeMs: 1000,
        deltaMs: 1000, // 1 second delta (1fps)
        quality: 'low',
        viewport: { width: 800, height: 600 },
        devicePixelRatio: 1
      };
      expect(largeDeltaContext.deltaMs).toBe(1000);
    });
  });

  describe('context integration', () => {
    it('should work together in layer lifecycle', () => {
      // Mount context
      const mountContext: LayerMountContext = {
        container,
        canvas,
        renderer,
        assetManager,
        layerConfig: {
          type: 'gradient',
          colors: ['#ff0000', '#0000ff'],
          opacity: 0.8
        }
      };

      // Frame contexts for animation
      const frameContexts: FrameContext[] = [
        {
          timeMs: 0,
          deltaMs: 16.67,
          quality: 'high',
          viewport: { width: 1920, height: 1080 },
          devicePixelRatio: 2
        },
        {
          timeMs: 16.67,
          deltaMs: 16.67,
          quality: 'high',
          viewport: { width: 1920, height: 1080 },
          devicePixelRatio: 2
        },
        {
          timeMs: 33.34,
          deltaMs: 16.67,
          quality: 'high',
          viewport: { width: 1920, height: 1080 },
          devicePixelRatio: 2
        }
      ];

      // Verify mount context is valid
      expect(mountContext.container).toBeDefined();
      expect(mountContext.renderer).toBeDefined();
      expect(mountContext.assetManager).toBeDefined();
      expect(mountContext.layerConfig).toBeDefined();

      // Verify frame contexts are valid and progressive
      frameContexts.forEach((context, index) => {
        expect(context.timeMs).toBe(index * 16.67);
        expect(context.deltaMs).toBe(16.67);
        expect(context.quality).toBe('high');
        expect(context.viewport.width).toBe(1920);
        expect(context.viewport.height).toBe(1080);
        expect(context.devicePixelRatio).toBe(2);
      });
    });

    it('should support responsive design scenarios', () => {
      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager,
        layerConfig: { responsive: true }
      };

      // Simulate responsive breakpoints
      const responsiveFrames: FrameContext[] = [
        // Mobile
        {
          timeMs: 1000,
          deltaMs: 16.67,
          quality: 'low',
          viewport: { width: 375, height: 667 },
          devicePixelRatio: 2
        },
        // Tablet
        {
          timeMs: 2000,
          deltaMs: 16.67,
          quality: 'medium',
          viewport: { width: 768, height: 1024 },
          devicePixelRatio: 2
        },
        // Desktop
        {
          timeMs: 3000,
          deltaMs: 16.67,
          quality: 'high',
          viewport: { width: 1920, height: 1080 },
          devicePixelRatio: 1
        }
      ];

      responsiveFrames.forEach(frame => {
        expect(frame.viewport.width).toBeGreaterThan(0);
        expect(frame.viewport.height).toBeGreaterThan(0);
        expect(frame.devicePixelRatio).toBeGreaterThan(0);
        expect(['low', 'medium', 'high', 'ultra', 'auto']).toContain(frame.quality);
      });
    });
  });
});