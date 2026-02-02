/**
 * Unit tests for built-in layer implementations
 */

import { vi } from 'vitest';
import {
  GradientLayer,
  ImageLayer,
  TextBlockLayer,
  VignetteLayer,
  GlowOrbLayer,
  NoiseOverlayLayer,
  ParticlesLayer,
  StarfieldLayer,
  DustLayer,
  NebulaNoiseLayer,
} from './BuiltInLayers';
import type { LayerMountContext, FrameContext } from '../interfaces/LayerContext';
import type { RenderBackend } from '../../rendering/RenderBackend';
import type { AssetManager } from '../../assets/AssetManager';
import type { QualityLevel } from '../../types/QualityTypes';

// Mock implementations for testing
const mockRenderBackend = {} as RenderBackend;
const mockAssetManager = {} as AssetManager;

// Mock Canvas2D renderer with createLayerCanvas method
const mockCanvas2DRenderer = {
  createLayerCanvas: vi.fn((width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    // Mock getContext to return a mock 2D context
    const mockContext = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      createImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(width * height * 4),
        width,
        height
      })),
      putImageData: vi.fn(),
      drawImage: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      closePath: vi.fn(),
    };
    Object.defineProperty(mockContext, 'globalAlpha', {
      writable: true,
      value: 1
    });
    Object.defineProperty(mockContext, 'fillStyle', {
      writable: true,
      value: '#000000'
    });
    
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockContext as any);
    return canvas;
  })
} as any;

const createMockMountContext = (layerConfig: Record<string, any> = {}, useCanvas2D: boolean = false): LayerMountContext => ({
  container: document.createElement('div'),
  renderer: useCanvas2D ? mockCanvas2DRenderer : mockRenderBackend,
  assetManager: mockAssetManager,
  layerConfig,
});

const createMockFrameContext = (): FrameContext => ({
  timeMs: 1000,
  deltaMs: 16.67,
  quality: 'medium' as QualityLevel,
  viewport: { width: 1920, height: 1080 },
  devicePixelRatio: 1,
});

describe('Built-in Layer Types', () => {
  describe('DOM Layer Types', () => {
    describe('GradientLayer', () => {
      test('should create with correct properties', () => {
        const layer = new GradientLayer('test-gradient', { zIndex: 5, colors: ['#ff0000', '#0000ff'] });
        
        expect(layer.id).toBe('test-gradient');
        expect(layer.type).toBe('gradient');
        expect(layer.zIndex).toBe(5);
      });

      test('should mount and update without errors', () => {
        const layer = new GradientLayer('test-gradient', {});
        
        // Create a mock renderer with the required methods
        const mockRenderer = {
          createLayerElement: vi.fn().mockReturnValue(document.createElement('div')),
          removeLayerElement: vi.fn(),
        };
        
        const mountContext = createMockMountContext();
        mountContext.renderer = mockRenderer as any;
        
        expect(() => layer.mount(mountContext)).not.toThrow();
        expect(() => layer.update(createMockFrameContext())).not.toThrow();
        
        // Verify that the renderer methods were called
        expect(mockRenderer.createLayerElement).toHaveBeenCalledWith('test-gradient', 0);
      });

      test('should handle destroy lifecycle', () => {
        const layer = new GradientLayer('test-gradient', {});
        layer.mount(createMockMountContext());
        
        expect(() => layer.destroy()).not.toThrow();
      });
    });

    describe('ImageLayer', () => {
      test('should create with correct properties', () => {
        const layer = new ImageLayer('test-image', { zIndex: 10, src: 'test.jpg' });
        
        expect(layer.id).toBe('test-image');
        expect(layer.type).toBe('image');
        expect(layer.zIndex).toBe(10);
      });

      test('should mount and update without errors', () => {
        const layer = new ImageLayer('test-image', {});
        
        // Create a mock renderer with the required methods
        const mockRenderer = {
          createLayerElement: vi.fn().mockReturnValue(document.createElement('div')),
          removeLayerElement: vi.fn(),
        };
        
        const mountContext = createMockMountContext();
        mountContext.renderer = mockRenderer as any;
        
        expect(() => layer.mount(mountContext)).not.toThrow();
        expect(() => layer.update(createMockFrameContext())).not.toThrow();
        
        // Verify that the renderer methods were called
        expect(mockRenderer.createLayerElement).toHaveBeenCalledWith('test-image', 0);
      });
    });

    describe('TextBlockLayer', () => {
      test('should create with correct properties', () => {
        const layer = new TextBlockLayer('test-text', { zIndex: 15, text: 'Hello World' });
        
        expect(layer.id).toBe('test-text');
        expect(layer.type).toBe('textBlock');
        expect(layer.zIndex).toBe(15);
      });

      test('should mount and update without errors', () => {
        const layer = new TextBlockLayer('test-text', {});
        
        // Create a mock renderer with the required methods
        const mockRenderer = {
          createLayerElement: vi.fn().mockReturnValue(document.createElement('div')),
          removeLayerElement: vi.fn(),
        };
        
        const mountContext = createMockMountContext();
        mountContext.renderer = mockRenderer as any;
        
        expect(() => layer.mount(mountContext)).not.toThrow();
        expect(() => layer.update(createMockFrameContext())).not.toThrow();
        
        // Verify that the renderer methods were called
        expect(mockRenderer.createLayerElement).toHaveBeenCalledWith('test-text', 0);
      });
    });

    describe('VignetteLayer', () => {
      test('should create with correct properties', () => {
        const layer = new VignetteLayer('test-vignette', { zIndex: 20, intensity: 0.5 });
        
        expect(layer.id).toBe('test-vignette');
        expect(layer.type).toBe('vignette');
        expect(layer.zIndex).toBe(20);
      });

      test('should mount and update without errors', () => {
        const layer = new VignetteLayer('test-vignette', {});
        
        // Create a mock renderer with the required methods
        const mockRenderer = {
          createLayerElement: vi.fn().mockReturnValue(document.createElement('div')),
          removeLayerElement: vi.fn(),
        };
        
        const mountContext = createMockMountContext();
        mountContext.renderer = mockRenderer as any;
        
        expect(() => layer.mount(mountContext)).not.toThrow();
        expect(() => layer.update(createMockFrameContext())).not.toThrow();
        
        // Verify that the renderer methods were called
        expect(mockRenderer.createLayerElement).toHaveBeenCalledWith('test-vignette', 0);
      });
    });

    describe('GlowOrbLayer', () => {
      test('should create with correct properties', () => {
        const layer = new GlowOrbLayer('test-orb', { zIndex: 25, radius: 100 });
        
        expect(layer.id).toBe('test-orb');
        expect(layer.type).toBe('glowOrb');
        expect(layer.zIndex).toBe(25);
      });

      test('should mount and update without errors', () => {
        const layer = new GlowOrbLayer('test-orb', {});
        
        // Create a mock renderer with the required methods
        const mockRenderer = {
          createLayerElement: vi.fn().mockReturnValue(document.createElement('div')),
          removeLayerElement: vi.fn(),
        };
        
        const mountContext = createMockMountContext();
        mountContext.renderer = mockRenderer as any;
        
        expect(() => layer.mount(mountContext)).not.toThrow();
        expect(() => layer.update(createMockFrameContext())).not.toThrow();
        
        // Verify that the renderer methods were called
        expect(mockRenderer.createLayerElement).toHaveBeenCalledWith('test-orb', 0);
      });
    });

    describe('NoiseOverlayLayer', () => {
      test('should create with correct properties', () => {
        const layer = new NoiseOverlayLayer('test-noise', { zIndex: 30, opacity: 0.3 });
        
        expect(layer.id).toBe('test-noise');
        expect(layer.type).toBe('noiseOverlay');
        expect(layer.zIndex).toBe(30);
      });

      test('should mount and update without errors', () => {
        const layer = new NoiseOverlayLayer('test-noise', {});
        
        // Create a mock renderer with the required methods
        const mockRenderer = {
          createLayerElement: vi.fn().mockReturnValue(document.createElement('div')),
          removeLayerElement: vi.fn(),
        };
        
        const mountContext = createMockMountContext();
        mountContext.renderer = mockRenderer as any;
        
        expect(() => layer.mount(mountContext)).not.toThrow();
        expect(() => layer.update(createMockFrameContext())).not.toThrow();
        
        // Verify that the renderer methods were called
        expect(mockRenderer.createLayerElement).toHaveBeenCalledWith('test-noise', 0);
      });
    });
  });

  describe('Canvas2D Layer Types', () => {
    describe('ParticlesLayer', () => {
      test('should create with correct properties', () => {
        const layer = new ParticlesLayer('test-particles', { zIndex: 5, count: 1000 });
        
        expect(layer.id).toBe('test-particles');
        expect(layer.type).toBe('particles');
        expect(layer.zIndex).toBe(5);
      });

      test('should mount and update without errors', () => {
        const layer = new ParticlesLayer('test-particles', {});
        
        expect(() => layer.mount(createMockMountContext({}, true))).not.toThrow();
        expect(() => layer.update(createMockFrameContext())).not.toThrow();
        
        // Verify that the Canvas2D renderer method was called
        expect(mockCanvas2DRenderer.createLayerCanvas).toHaveBeenCalled();
      });
    });

    describe('StarfieldLayer', () => {
      test('should create with correct properties', () => {
        const layer = new StarfieldLayer('test-starfield', { zIndex: 10, starCount: 500 });
        
        expect(layer.id).toBe('test-starfield');
        expect(layer.type).toBe('starfield');
        expect(layer.zIndex).toBe(10);
      });

      test('should mount and update without errors', () => {
        const layer = new StarfieldLayer('test-starfield', {});
        
        expect(() => layer.mount(createMockMountContext({}, true))).not.toThrow();
        expect(() => layer.update(createMockFrameContext())).not.toThrow();
      });
    });

    describe('DustLayer', () => {
      test('should create with correct properties', () => {
        const layer = new DustLayer('test-dust', { zIndex: 15, particleSize: 2 });
        
        expect(layer.id).toBe('test-dust');
        expect(layer.type).toBe('dust');
        expect(layer.zIndex).toBe(15);
      });

      test('should mount and update without errors', () => {
        const layer = new DustLayer('test-dust', {});
        
        expect(() => layer.mount(createMockMountContext({}, true))).not.toThrow();
        expect(() => layer.update(createMockFrameContext())).not.toThrow();
      });
    });

    describe('NebulaNoiseLayer', () => {
      test('should create with correct properties', () => {
        const layer = new NebulaNoiseLayer('test-nebula', { zIndex: 20, scale: 0.5 });
        
        expect(layer.id).toBe('test-nebula');
        expect(layer.type).toBe('nebulaNoise');
        expect(layer.zIndex).toBe(20);
      });

      test('should mount and update without errors', () => {
        const layer = new NebulaNoiseLayer('test-nebula', {});
        
        expect(() => layer.mount(createMockMountContext({}, true))).not.toThrow();
        expect(() => layer.update(createMockFrameContext())).not.toThrow();
      });
    });
  });

  describe('Base Layer Functionality', () => {
    test('should handle default zIndex when not provided', () => {
      const layer = new GradientLayer('test-gradient', {});
      
      expect(layer.zIndex).toBe(0);
    });

    test('should implement optional methods', () => {
      const layer = new ImageLayer('test-image', {});
      
      expect(() => layer.setVisible?.(true)).not.toThrow();
      expect(() => layer.setOpacity?.(0.5)).not.toThrow();
      expect(() => layer.resize?.(800, 600)).not.toThrow();
    });

    test('should not update when not mounted', () => {
      const layer = new ParticlesLayer('test-particles', {});
      
      // Should not throw even when not mounted
      expect(() => layer.update(createMockFrameContext())).not.toThrow();
    });

    test('should handle mount context with canvas', () => {
      const layer = new ParticlesLayer('test-particles', {});
      const mountContext = createMockMountContext();
      mountContext.canvas = document.createElement('canvas');
      
      expect(() => layer.mount(mountContext)).not.toThrow();
    });
  });

  describe('Layer Type Coverage', () => {
    test('should cover all required DOM layer types', () => {
      const domTypes = [
        { type: 'gradient', class: GradientLayer },
        { type: 'image', class: ImageLayer },
        { type: 'textBlock', class: TextBlockLayer },
        { type: 'vignette', class: VignetteLayer },
        { type: 'glowOrb', class: GlowOrbLayer },
        { type: 'noiseOverlay', class: NoiseOverlayLayer },
      ];

      domTypes.forEach(({ type, class: LayerClass }) => {
        const layer = new LayerClass('test-id', {});
        expect(layer.type).toBe(type);
      });
    });

    test('should cover all required Canvas2D layer types', () => {
      const canvas2dTypes = [
        { type: 'particles', class: ParticlesLayer },
        { type: 'starfield', class: StarfieldLayer },
        { type: 'dust', class: DustLayer },
        { type: 'nebulaNoise', class: NebulaNoiseLayer },
      ];

      canvas2dTypes.forEach(({ type, class: LayerClass }) => {
        const layer = new LayerClass('test-id', {});
        expect(layer.type).toBe(type);
      });
    });
  });
});