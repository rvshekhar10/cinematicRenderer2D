/**
 * Tests for ICinematicLayer interface contract
 */

import type { ICinematicLayer, LayerMountContext, FrameContext } from './';
import { RenderBackend } from '../../rendering/RenderBackend';
import { AssetManager } from '../../assets/AssetManager';

// Test implementation of ICinematicLayer
class TestLayer implements ICinematicLayer {
  public mountCalled = false;
  public updateCalled = false;
  public destroyCalled = false;
  public resizeCalled = false;
  public setVisibleCalled = false;
  public setOpacityCalled = false;
  public lastMountContext: LayerMountContext | null = null;
  public lastUpdateContext: FrameContext | null = null;
  public lastResizeWidth = 0;
  public lastResizeHeight = 0;
  public lastVisibility = true;
  public lastOpacity = 1;

  constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly zIndex: number
  ) {}

  mount(ctx: LayerMountContext): void {
    this.mountCalled = true;
    this.lastMountContext = ctx;
  }

  update(ctx: FrameContext): void {
    this.updateCalled = true;
    this.lastUpdateContext = ctx;
  }

  destroy(): void {
    this.destroyCalled = true;
  }

  // Optional methods
  resize(width: number, height: number): void {
    this.resizeCalled = true;
    this.lastResizeWidth = width;
    this.lastResizeHeight = height;
  }

  setVisible(visible: boolean): void {
    this.setVisibleCalled = true;
    this.lastVisibility = visible;
  }

  setOpacity(opacity: number): void {
    this.setOpacityCalled = true;
    this.lastOpacity = opacity;
  }
}

// Mock RenderBackend for testing
class MockRenderBackend extends RenderBackend {
  initialize(): void {}
  render(): void {}
  resize(): void {}
  destroy(): void {}
}

describe('ICinematicLayer', () => {
  let layer: TestLayer;
  let container: HTMLElement;
  let canvas: HTMLCanvasElement;
  let renderer: MockRenderBackend;
  let assetManager: AssetManager;

  beforeEach(() => {
    layer = new TestLayer('test-layer', 'test-type', 5);
    container = document.createElement('div');
    canvas = document.createElement('canvas');
    renderer = new MockRenderBackend(container);
    assetManager = new AssetManager();
  });

  describe('required properties', () => {
    it('should have readonly id property', () => {
      expect(layer.id).toBe('test-layer');
      expect(typeof layer.id).toBe('string');
    });

    it('should have readonly type property', () => {
      expect(layer.type).toBe('test-type');
      expect(typeof layer.type).toBe('string');
    });

    it('should have readonly zIndex property', () => {
      expect(layer.zIndex).toBe(5);
      expect(typeof layer.zIndex).toBe('number');
    });

    it('should support different layer types', () => {
      const gradientLayer = new TestLayer('grad1', 'gradient', 1);
      const textLayer = new TestLayer('text1', 'textBlock', 2);
      const particleLayer = new TestLayer('particles1', 'particles', 3);

      expect(gradientLayer.type).toBe('gradient');
      expect(textLayer.type).toBe('textBlock');
      expect(particleLayer.type).toBe('particles');
    });

    it('should support different z-index values', () => {
      const backgroundLayer = new TestLayer('bg', 'gradient', 0);
      const contentLayer = new TestLayer('content', 'text', 10);
      const overlayLayer = new TestLayer('overlay', 'vignette', 100);

      expect(backgroundLayer.zIndex).toBe(0);
      expect(contentLayer.zIndex).toBe(10);
      expect(overlayLayer.zIndex).toBe(100);
    });
  });

  describe('mount method', () => {
    it('should accept LayerMountContext', () => {
      const mountContext: LayerMountContext = {
        container,
        canvas,
        renderer,
        assetManager,
        layerConfig: { color: 'red', opacity: 0.8 }
      };

      layer.mount(mountContext);

      expect(layer.mountCalled).toBe(true);
      expect(layer.lastMountContext).toBe(mountContext);
    });

    it('should work without canvas in mount context', () => {
      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager,
        layerConfig: { text: 'Hello World' }
      };

      layer.mount(mountContext);

      expect(layer.mountCalled).toBe(true);
      expect(layer.lastMountContext?.canvas).toBeUndefined();
    });

    it('should handle different layer configurations', () => {
      const configs = [
        { color: '#ff0000', opacity: 1.0 },
        { text: 'Sample text', fontSize: 24 },
        { particleCount: 100, speed: 2.5 },
        {}
      ];

      configs.forEach((config, index) => {
        const testLayer = new TestLayer(`layer${index}`, 'test', index);
        const mountContext: LayerMountContext = {
          container,
          renderer,
          assetManager,
          layerConfig: config
        };

        testLayer.mount(mountContext);

        expect(testLayer.mountCalled).toBe(true);
        expect(testLayer.lastMountContext?.layerConfig).toEqual(config);
      });
    });
  });

  describe('update method', () => {
    it('should accept FrameContext', () => {
      const frameContext: FrameContext = {
        timeMs: 1000,
        deltaMs: 16.67,
        quality: 'medium',
        viewport: { width: 800, height: 600 },
        devicePixelRatio: 1
      };

      layer.update(frameContext);

      expect(layer.updateCalled).toBe(true);
      expect(layer.lastUpdateContext).toBe(frameContext);
    });

    it('should handle different quality levels', () => {
      const qualityLevels = ['low', 'medium', 'high', 'ultra', 'auto'] as const;

      qualityLevels.forEach(quality => {
        const testLayer = new TestLayer(`layer-${quality}`, 'test', 1);
        const frameContext: FrameContext = {
          timeMs: 500,
          deltaMs: 16.67,
          quality,
          viewport: { width: 1920, height: 1080 },
          devicePixelRatio: 2
        };

        testLayer.update(frameContext);

        expect(testLayer.updateCalled).toBe(true);
        expect(testLayer.lastUpdateContext?.quality).toBe(quality);
      });
    });

    it('should handle different viewport sizes', () => {
      const viewports = [
        { width: 320, height: 240 },   // Small mobile
        { width: 800, height: 600 },   // Standard
        { width: 1920, height: 1080 }, // Full HD
        { width: 3840, height: 2160 }  // 4K
      ];

      viewports.forEach((viewport, index) => {
        const testLayer = new TestLayer(`layer${index}`, 'test', index);
        const frameContext: FrameContext = {
          timeMs: 1000,
          deltaMs: 16.67,
          quality: 'medium',
          viewport,
          devicePixelRatio: 1
        };

        testLayer.update(frameContext);

        expect(testLayer.updateCalled).toBe(true);
        expect(testLayer.lastUpdateContext?.viewport).toEqual(viewport);
      });
    });

    it('should handle different device pixel ratios', () => {
      const pixelRatios = [1, 1.5, 2, 3];

      pixelRatios.forEach(devicePixelRatio => {
        const testLayer = new TestLayer(`layer-${devicePixelRatio}`, 'test', 1);
        const frameContext: FrameContext = {
          timeMs: 1000,
          deltaMs: 16.67,
          quality: 'medium',
          viewport: { width: 800, height: 600 },
          devicePixelRatio
        };

        testLayer.update(frameContext);

        expect(testLayer.updateCalled).toBe(true);
        expect(testLayer.lastUpdateContext?.devicePixelRatio).toBe(devicePixelRatio);
      });
    });

    it('should handle frame timing variations', () => {
      const timings = [
        { timeMs: 0, deltaMs: 16.67 },      // 60fps
        { timeMs: 1000, deltaMs: 8.33 },    // 120fps
        { timeMs: 2000, deltaMs: 33.33 },   // 30fps
        { timeMs: 5000, deltaMs: 100 }      // 10fps (performance issue)
      ];

      timings.forEach((timing, index) => {
        const testLayer = new TestLayer(`layer${index}`, 'test', index);
        const frameContext: FrameContext = {
          ...timing,
          quality: 'medium',
          viewport: { width: 800, height: 600 },
          devicePixelRatio: 1
        };

        testLayer.update(frameContext);

        expect(testLayer.updateCalled).toBe(true);
        expect(testLayer.lastUpdateContext?.timeMs).toBe(timing.timeMs);
        expect(testLayer.lastUpdateContext?.deltaMs).toBe(timing.deltaMs);
      });
    });
  });

  describe('destroy method', () => {
    it('should be callable', () => {
      layer.destroy();
      expect(layer.destroyCalled).toBe(true);
    });

    it('should be callable multiple times without error', () => {
      layer.destroy();
      layer.destroy();
      layer.destroy();
      expect(layer.destroyCalled).toBe(true);
    });
  });

  describe('optional methods', () => {
    it('should support optional resize method', () => {
      layer.resize!(1024, 768);

      expect(layer.resizeCalled).toBe(true);
      expect(layer.lastResizeWidth).toBe(1024);
      expect(layer.lastResizeHeight).toBe(768);
    });

    it('should support optional setVisible method', () => {
      layer.setVisible!(false);

      expect(layer.setVisibleCalled).toBe(true);
      expect(layer.lastVisibility).toBe(false);
    });

    it('should support optional setOpacity method', () => {
      layer.setOpacity!(0.5);

      expect(layer.setOpacityCalled).toBe(true);
      expect(layer.lastOpacity).toBe(0.5);
    });

    it('should handle edge cases for optional methods', () => {
      // Test edge cases for resize
      layer.resize!(0, 0);
      expect(layer.lastResizeWidth).toBe(0);
      expect(layer.lastResizeHeight).toBe(0);

      // Test edge cases for opacity
      layer.setOpacity!(0);
      expect(layer.lastOpacity).toBe(0);

      layer.setOpacity!(1);
      expect(layer.lastOpacity).toBe(1);
    });
  });

  describe('lifecycle integration', () => {
    it('should support full lifecycle: mount -> update -> destroy', () => {
      const mountContext: LayerMountContext = {
        container,
        renderer,
        assetManager,
        layerConfig: { test: true }
      };

      const frameContext: FrameContext = {
        timeMs: 1000,
        deltaMs: 16.67,
        quality: 'medium',
        viewport: { width: 800, height: 600 },
        devicePixelRatio: 1
      };

      // Mount
      layer.mount(mountContext);
      expect(layer.mountCalled).toBe(true);

      // Update multiple times
      layer.update(frameContext);
      layer.update({ ...frameContext, timeMs: 1016.67 });
      layer.update({ ...frameContext, timeMs: 1033.34 });
      expect(layer.updateCalled).toBe(true);

      // Optional resize
      if (layer.resize) {
        layer.resize(1920, 1080);
        expect(layer.resizeCalled).toBe(true);
      }

      // Destroy
      layer.destroy();
      expect(layer.destroyCalled).toBe(true);
    });
  });
});