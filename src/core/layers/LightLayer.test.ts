/**
 * Unit Tests for LightLayer
 * 
 * Tests light layer rendering, modes, and property updates
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LightLayer, type LightLayerConfig } from './LightLayer';
import type { LayerMountContext, FrameContext } from '../interfaces/LayerContext';

describe('LightLayer', () => {
  let mockRenderer: any;
  let mockElement: HTMLElement;
  let mountContext: LayerMountContext;
  let frameContext: FrameContext;

  beforeEach(() => {
    // Create mock DOM element
    mockElement = document.createElement('div');
    mockElement.style.cssText = '';

    // Create mock renderer
    mockRenderer = {
      createLayerElement: vi.fn((id: string, zIndex: number) => {
        mockElement.id = id;
        mockElement.style.zIndex = zIndex.toString();
        return mockElement;
      }),
    };

    // Create mock contexts
    mountContext = {
      renderer: mockRenderer,
      container: document.createElement('div'),
      viewport: { width: 1920, height: 1080 },
    };

    frameContext = {
      currentTime: 0,
      deltaMs: 16.67,
      fps: 60,
      viewport: { width: 1920, height: 1080 },
    };
  });

  describe('initialization', () => {
    it('should create light layer with default config', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
      };
      const layer = new LightLayer('light1', config);
      
      expect(layer.id).toBe('light1');
      expect(layer.type).toBe('light');
      expect(layer.zIndex).toBe(0);
    });

    it('should accept custom zIndex', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
        zIndex: 10,
      };
      const layer = new LightLayer('light1', config);
      
      expect(layer.zIndex).toBe(10);
    });

    it('should set default values for optional properties', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      expect(mockElement.style.opacity).toBe('1');
      expect(mockElement.style.mixBlendMode).toBe('screen');
    });
  });

  describe('mount', () => {
    it('should create DOM element on mount', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      expect(mockRenderer.createLayerElement).toHaveBeenCalledWith('light1', 0);
      expect(mockElement.style.position).toBe('absolute');
    });

    it('should apply blend mode', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
        blendMode: 'overlay',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      expect(mockElement.style.mixBlendMode).toBe('overlay');
    });

    it('should not mount twice', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      layer.mount(mountContext);
      
      expect(mockRenderer.createLayerElement).toHaveBeenCalledTimes(1);
    });
  });

  describe('radial light mode', () => {
    it('should render radial gradient', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
        position: { x: 500, y: 300 },
        radius: 200,
        color: '#ffffff',
        intensity: 1.0,
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      expect(mockElement.style.background).toContain('radial-gradient');
      expect(mockElement.style.background).toContain('500px 300px');
    });

    it('should handle percentage positions', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
        position: { x: '50%', y: '50%' },
        radius: 200,
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      // 50% of 1920 = 960, 50% of 1080 = 540
      expect(mockElement.style.background).toContain('960px 540px');
    });

    it('should apply intensity', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
        intensity: 0.5,
        color: '#ffffff',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      expect(mockElement.style.background).toContain('0.5');
    });
  });

  describe('spot light mode', () => {
    it('should render spot light with conic gradient', () => {
      const config: LightLayerConfig = {
        mode: 'spot',
        position: { x: 500, y: 300 },
        angle: 45,
        direction: 90,
        radius: 300,
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      expect(mockElement.style.background).toContain('conic-gradient');
    });

    it('should apply mask for radial falloff', () => {
      const config: LightLayerConfig = {
        mode: 'spot',
        radius: 300,
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      expect(mockElement.style.maskImage).toContain('radial-gradient');
    });
  });

  describe('ambient light mode', () => {
    it('should render uniform color overlay', () => {
      const config: LightLayerConfig = {
        mode: 'ambient',
        color: '#ff0000',
        intensity: 0.3,
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      expect(mockElement.style.background).toContain('rgba');
    });
  });

  describe('vignette light mode', () => {
    it('should render vignette gradient', () => {
      const config: LightLayerConfig = {
        mode: 'vignette',
        radius: 70,
        color: '#000000',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      expect(mockElement.style.background).toContain('radial-gradient');
      expect(mockElement.style.background).toContain('70%');
    });
  });

  describe('blend modes', () => {
    it('should support screen blend mode', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
        blendMode: 'screen',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      expect(mockElement.style.mixBlendMode).toBe('screen');
    });

    it('should support overlay blend mode', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
        blendMode: 'overlay',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      expect(mockElement.style.mixBlendMode).toBe('overlay');
    });

    it('should support soft-light blend mode', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
        blendMode: 'soft-light',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      expect(mockElement.style.mixBlendMode).toBe('soft-light');
    });

    it('should support multiply blend mode', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
        blendMode: 'multiply',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      expect(mockElement.style.mixBlendMode).toBe('multiply');
    });
  });

  describe('property updates', () => {
    it('should update position', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      layer.setPosition(600, 400);
      layer.update(frameContext);
      
      expect(mockElement.style.background).toContain('600px 400px');
    });

    it('should update intensity', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
        color: '#ffffff',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      layer.setIntensity(0.7);
      layer.update(frameContext);
      
      expect(mockElement.style.background).toContain('0.7');
    });

    it('should clamp intensity to 0-1 range', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      layer.setIntensity(1.5);
      layer.update(frameContext);
      
      expect(mockElement.style.background).toContain('1'); // Clamped to 1
    });

    it('should update color', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      layer.setColor('#ff0000');
      layer.update(frameContext);
      
      expect(mockElement.style.background).toContain('255, 0, 0'); // RGB of #ff0000
    });

    it('should update radius', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      layer.setRadius(300);
      layer.update(frameContext);
      
      expect(mockElement.style.background).toContain('300px');
    });

    it('should update opacity', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      layer.setOpacity(0.5);
      
      expect(mockElement.style.opacity).toBe('0.5');
    });
  });

  describe('visibility', () => {
    it('should hide layer when setVisible(false)', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      layer.setVisible(false);
      
      expect(mockElement.style.display).toBe('none');
    });

    it('should show layer when setVisible(true)', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      layer.setVisible(false);
      layer.setVisible(true);
      
      expect(mockElement.style.display).toBe('block');
    });
  });

  describe('destroy', () => {
    it('should remove DOM element', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
      };
      const layer = new LightLayer('light1', config);
      const container = document.createElement('div');
      container.appendChild(mockElement);
      
      layer.mount(mountContext);
      layer.destroy();
      
      expect(mockElement.parentNode).toBeNull();
    });

    it('should handle destroy when not mounted', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
      };
      const layer = new LightLayer('light1', config);
      
      expect(() => layer.destroy()).not.toThrow();
    });
  });

  describe('update', () => {
    it('should not throw when not mounted', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
      };
      const layer = new LightLayer('light1', config);
      
      expect(() => layer.update(frameContext)).not.toThrow();
    });

    it('should update on each frame', () => {
      const config: LightLayerConfig = {
        mode: 'radial',
        opacity: 0.8,
      };
      const layer = new LightLayer('light1', config);
      layer.mount(mountContext);
      
      layer.update(frameContext);
      
      expect(mockElement.style.opacity).toBe('0.8');
    });
  });
});
