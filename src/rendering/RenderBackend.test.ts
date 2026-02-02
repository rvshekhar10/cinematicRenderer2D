/**
 * Tests for RenderBackend abstract base class
 */

import { RenderBackend } from './RenderBackend';
import type { ICinematicLayer } from '../core/interfaces/ICinematicLayer';
import type { FrameContext } from '../core/interfaces/LayerContext';

// Test implementation of RenderBackend for testing purposes
class TestRenderBackend extends RenderBackend {
  public initializeCalled = false;
  public renderCalled = false;
  public resizeCalled = false;
  public destroyCalled = false;
  public lastRenderLayers: ICinematicLayer[] = [];
  public lastRenderContext: FrameContext | null = null;
  public lastResizeWidth = 0;
  public lastResizeHeight = 0;

  initialize(): void {
    this.initializeCalled = true;
  }

  render(layers: ICinematicLayer[], context: FrameContext): void {
    this.renderCalled = true;
    this.lastRenderLayers = layers;
    this.lastRenderContext = context;
  }

  resize(width: number, height: number): void {
    this.resizeCalled = true;
    this.lastResizeWidth = width;
    this.lastResizeHeight = height;
  }

  destroy(): void {
    this.destroyCalled = true;
  }
}

// Mock layer implementation for testing
class MockLayer implements ICinematicLayer {
  public mountCalled = false;
  public updateCalled = false;
  public destroyCalled = false;

  constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly zIndex: number
  ) {}

  mount(): void {
    this.mountCalled = true;
  }

  update(): void {
    this.updateCalled = true;
  }

  destroy(): void {
    this.destroyCalled = true;
  }
}

describe('RenderBackend', () => {
  let container: HTMLElement;
  let backend: TestRenderBackend;

  beforeEach(() => {
    container = document.createElement('div');
    backend = new TestRenderBackend(container);
  });

  describe('constructor', () => {
    it('should accept a container element', () => {
      expect(backend).toBeInstanceOf(RenderBackend);
      expect((backend as any).container).toBe(container);
    });

    it('should work with different container types', () => {
      const canvas = document.createElement('canvas');
      const canvasBackend = new TestRenderBackend(canvas);
      expect((canvasBackend as any).container).toBe(canvas);

      const section = document.createElement('section');
      const sectionBackend = new TestRenderBackend(section);
      expect((sectionBackend as any).container).toBe(section);
    });
  });

  describe('abstract methods', () => {
    it('should call initialize method', () => {
      backend.initialize();
      expect(backend.initializeCalled).toBe(true);
    });

    it('should call render method with layers and context', () => {
      const layers = [
        new MockLayer('layer1', 'test', 1),
        new MockLayer('layer2', 'test', 2)
      ];
      const context: FrameContext = {
        timeMs: 1000,
        deltaMs: 16.67,
        quality: 'medium',
        viewport: { width: 800, height: 600 },
        devicePixelRatio: 1
      };

      backend.render(layers, context);

      expect(backend.renderCalled).toBe(true);
      expect(backend.lastRenderLayers).toBe(layers);
      expect(backend.lastRenderContext).toBe(context);
    });

    it('should call resize method with dimensions', () => {
      backend.resize(1920, 1080);

      expect(backend.resizeCalled).toBe(true);
      expect(backend.lastResizeWidth).toBe(1920);
      expect(backend.lastResizeHeight).toBe(1080);
    });

    it('should call destroy method', () => {
      backend.destroy();
      expect(backend.destroyCalled).toBe(true);
    });
  });

  describe('render method edge cases', () => {
    it('should handle empty layers array', () => {
      const context: FrameContext = {
        timeMs: 0,
        deltaMs: 16.67,
        quality: 'low',
        viewport: { width: 400, height: 300 },
        devicePixelRatio: 1
      };

      backend.render([], context);

      expect(backend.renderCalled).toBe(true);
      expect(backend.lastRenderLayers).toEqual([]);
    });

    it('should handle layers with different z-indices', () => {
      const layers = [
        new MockLayer('background', 'gradient', 0),
        new MockLayer('content', 'text', 10),
        new MockLayer('overlay', 'vignette', 100)
      ];
      const context: FrameContext = {
        timeMs: 500,
        deltaMs: 16.67,
        quality: 'high',
        viewport: { width: 1200, height: 800 },
        devicePixelRatio: 2
      };

      backend.render(layers, context);

      expect(backend.lastRenderLayers).toHaveLength(3);
      expect(backend.lastRenderLayers[0].zIndex).toBe(0);
      expect(backend.lastRenderLayers[1].zIndex).toBe(10);
      expect(backend.lastRenderLayers[2].zIndex).toBe(100);
    });
  });

  describe('resize method edge cases', () => {
    it('should handle zero dimensions', () => {
      backend.resize(0, 0);

      expect(backend.resizeCalled).toBe(true);
      expect(backend.lastResizeWidth).toBe(0);
      expect(backend.lastResizeHeight).toBe(0);
    });

    it('should handle very large dimensions', () => {
      backend.resize(8192, 4320);

      expect(backend.resizeCalled).toBe(true);
      expect(backend.lastResizeWidth).toBe(8192);
      expect(backend.lastResizeHeight).toBe(4320);
    });

    it('should handle fractional dimensions', () => {
      backend.resize(1920.5, 1080.7);

      expect(backend.resizeCalled).toBe(true);
      expect(backend.lastResizeWidth).toBe(1920.5);
      expect(backend.lastResizeHeight).toBe(1080.7);
    });
  });

  describe('lifecycle', () => {
    it('should support full lifecycle: initialize -> render -> resize -> destroy', () => {
      const layers = [new MockLayer('test', 'test', 1)];
      const context: FrameContext = {
        timeMs: 1000,
        deltaMs: 16.67,
        quality: 'medium',
        viewport: { width: 800, height: 600 },
        devicePixelRatio: 1
      };

      // Initialize
      backend.initialize();
      expect(backend.initializeCalled).toBe(true);

      // Render
      backend.render(layers, context);
      expect(backend.renderCalled).toBe(true);

      // Resize
      backend.resize(1024, 768);
      expect(backend.resizeCalled).toBe(true);

      // Destroy
      backend.destroy();
      expect(backend.destroyCalled).toBe(true);
    });
  });
});