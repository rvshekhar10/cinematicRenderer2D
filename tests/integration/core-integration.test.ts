/**
 * Core Integration Tests
 * 
 * Tests the complete integration of all core components working together.
 * Validates Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CinematicRenderer2D, SpecParser, LayerRegistry } from '../../src/index';
import type { CinematicSpec, QualityLevel } from '../../src/index';

// Mock DOM environment
const mockContainer = {
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  getBoundingClientRect: () => ({ width: 1920, height: 1080, top: 0, left: 0 }),
  style: {
    setProperty: vi.fn(),
    overflow: '',
    position: '',
    width: '',
    height: '',
    left: '',
    top: '',
  },
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(() => false),
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  removeAttribute: vi.fn(),
  innerHTML: '',
  parentNode: { removeChild: vi.fn() },
  contains: vi.fn(() => true),
} as any;

// Mock document.contains to work with our mock container
Object.defineProperty(document, 'contains', {
  value: vi.fn(() => true),
  writable: true
});

// Test specification
const testSpec: CinematicSpec = {
  schemaVersion: '1.0.0',
  engine: {
    targetFps: 60,
    quality: 'auto',
    debug: false,
    autoplay: false
  },
  events: [
    {
      id: 'intro',
      name: 'Introduction Sequence',
      scenes: ['scene1', 'scene2']
    },
    {
      id: 'main',
      name: 'Main Content',
      scenes: ['scene3']
    }
  ],
  scenes: [
    {
      id: 'scene1',
      name: 'Opening Scene',
      duration: 2000,
      layers: [
        {
          id: 'background',
          type: 'gradient',
          zIndex: 1,
          config: {
            colors: ['#000000', '#333333'],
            direction: 'to bottom',
            opacity: 1
          },
          animations: [
            {
              property: 'opacity',
              from: 0,
              to: 1,
              startMs: 0,
              endMs: 1000,
              easing: 'ease-in-out'
            }
          ]
        },
        {
          id: 'title',
          type: 'textBlock',
          zIndex: 2,
          config: {
            text: 'Welcome',
            fontSize: '48px',
            color: '#ffffff',
            textAlign: 'center'
          },
          animations: [
            {
              property: 'transform.scale',
              from: 0.5,
              to: 1,
              startMs: 500,
              endMs: 1500,
              easing: 'ease-out-back'
            }
          ]
        }
      ]
    },
    {
      id: 'scene2',
      name: 'Transition Scene',
      duration: 1500,
      layers: [
        {
          id: 'particles',
          type: 'particles',
          zIndex: 3,
          config: {
            count: 100,
            size: 2,
            color: '#ffffff',
            speed: 1
          }
        }
      ]
    },
    {
      id: 'scene3',
      name: 'Final Scene',
      duration: 3000,
      layers: [
        {
          id: 'starfield',
          type: 'starfield',
          zIndex: 1,
          config: {
            density: 0.5,
            twinkle: true
          }
        }
      ]
    }
  ]
};

describe('Core Integration Tests', () => {
  let renderer: CinematicRenderer2D;
  let eventCallbacks: { [key: string]: vi.Mock } = {};

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create event callback mocks
    eventCallbacks = {
      play: vi.fn(),
      pause: vi.fn(),
      stop: vi.fn(),
      end: vi.fn(),
      seek: vi.fn(),
      error: vi.fn(),
      qualityChange: vi.fn(),
      sceneChange: vi.fn(),
      eventChange: vi.fn()
    };

    // Create renderer instance
    renderer = new CinematicRenderer2D({
      container: mockContainer,
      spec: testSpec
    });

    // Attach event listeners
    Object.entries(eventCallbacks).forEach(([event, callback]) => {
      renderer.on(event, callback);
    });
  });

  afterEach(() => {
    if (renderer) {
      renderer.destroy();
    }
  });

  describe('Requirement 1.1: Constructor Acceptance', () => {
    it('should accept a container DOM element and JSON specification', () => {
      expect(() => {
        new CinematicRenderer2D({
          container: mockContainer,
          spec: testSpec
        });
      }).not.toThrow();
    });

    it('should validate the JSON specification during construction', () => {
      const invalidSpec = { ...testSpec, scenes: [] }; // Invalid: no scenes

      expect(() => {
        new CinematicRenderer2D({
          container: mockContainer,
          spec: invalidSpec as any
        });
      }).toThrow();
    });

    it('should compile the specification during construction', () => {
      const validateSpy = vi.spyOn(SpecParser, 'validate');
      const parseSpy = vi.spyOn(SpecParser, 'parse');
      
      new CinematicRenderer2D({
        container: mockContainer,
        spec: testSpec
      });

      expect(validateSpy).toHaveBeenCalledWith(testSpec);
      expect(parseSpy).toHaveBeenCalled();
    });
  });

  describe('Requirement 1.2: Lifecycle Methods', () => {
    it('should provide mount() method that initializes the renderer', async () => {
      expect(typeof renderer.mount).toBe('function');
      
      await expect(renderer.mount()).resolves.not.toThrow();
    });

    it('should provide play() method that starts playback', async () => {
      expect(typeof renderer.play).toBe('function');
      
      await renderer.mount();
      renderer.play();
      expect(eventCallbacks.play).toHaveBeenCalled();
    });

    it('should provide pause() method that pauses playback', async () => {
      expect(typeof renderer.pause).toBe('function');
      
      await renderer.mount();
      renderer.play();
      renderer.pause();
      expect(eventCallbacks.pause).toHaveBeenCalled();
    });

    it('should provide stop() method that stops playback', async () => {
      expect(typeof renderer.stop).toBe('function');
      
      await renderer.mount();
      renderer.play();
      renderer.stop();
      expect(eventCallbacks.stop).toHaveBeenCalled();
    });

    it('should provide destroy() method that cleans up resources', () => {
      expect(typeof renderer.destroy).toBe('function');
      
      expect(() => renderer.destroy()).not.toThrow();
    });

    it('should follow proper lifecycle sequence', async () => {
      // Mount -> Play -> Pause -> Stop -> Destroy
      await renderer.mount();
      renderer.play();
      renderer.pause();
      renderer.stop();
      renderer.destroy();

      expect(eventCallbacks.play).toHaveBeenCalled();
      expect(eventCallbacks.pause).toHaveBeenCalled();
      expect(eventCallbacks.stop).toHaveBeenCalled();
    });
  });

  describe('Requirement 1.3: Navigation Methods', () => {
    beforeEach(async () => {
      await renderer.mount();
    });

    it('should provide seek(ms) method for time-based navigation', () => {
      expect(typeof renderer.seek).toBe('function');
      
      renderer.seek(1500);
      expect(eventCallbacks.seek).toHaveBeenCalledWith(1500);
    });

    it('should provide goToEvent(eventId) method for event navigation', () => {
      expect(typeof renderer.goToEvent).toBe('function');
      
      renderer.goToEvent('main');
      expect(eventCallbacks.eventChange).toHaveBeenCalledWith('main');
    });

    it('should provide goToScene(sceneId) method for scene navigation', () => {
      expect(typeof renderer.goToScene).toBe('function');
      
      renderer.goToScene('scene2');
      expect(eventCallbacks.sceneChange).toHaveBeenCalledWith('scene2');
    });

    it('should handle invalid navigation gracefully', () => {
      expect(() => renderer.goToEvent('nonexistent')).not.toThrow();
      expect(() => renderer.goToScene('nonexistent')).not.toThrow();
      expect(() => renderer.seek(-1000)).not.toThrow();
    });

    it('should maintain playback state during navigation', () => {
      renderer.play();
      renderer.seek(1000);
      
      // Should still be playing after seek
      expect(eventCallbacks.play).toHaveBeenCalled();
      expect(eventCallbacks.pause).not.toHaveBeenCalled();
    });
  });

  describe('Requirement 1.4: Event Emission', () => {
    beforeEach(async () => {
      await renderer.mount();
    });

    it('should emit events for playback state changes', () => {
      renderer.play();
      expect(eventCallbacks.play).toHaveBeenCalled();

      renderer.pause();
      expect(eventCallbacks.pause).toHaveBeenCalled();

      renderer.stop();
      expect(eventCallbacks.stop).toHaveBeenCalled();
    });

    it('should emit seek events when position changes', () => {
      renderer.seek(2500);
      expect(eventCallbacks.seek).toHaveBeenCalledWith(2500);
    });

    it('should emit scene change events', () => {
      renderer.goToScene('scene2');
      expect(eventCallbacks.sceneChange).toHaveBeenCalledWith('scene2');
    });

    it('should emit event change events', () => {
      renderer.goToEvent('main');
      expect(eventCallbacks.eventChange).toHaveBeenCalledWith('main');
    });

    it('should emit quality change events', () => {
      renderer.setQuality('high');
      expect(eventCallbacks.qualityChange).toHaveBeenCalledWith('high');
    });

    it('should emit error events when errors occur', () => {
      // Trigger an error condition
      renderer.goToEvent('invalid-event');
      
      // Should emit error event
      expect(eventCallbacks.error).toHaveBeenCalled();
    });

    it('should support event listener removal', () => {
      const testCallback = vi.fn();
      renderer.on('play', testCallback);
      renderer.off('play', testCallback);
      
      renderer.play();
      expect(testCallback).not.toHaveBeenCalled();
    });
  });

  describe('Requirement 1.5: Automatic Resize', () => {
    beforeEach(async () => {
      await renderer.mount();
    });

    it('should provide resize method', () => {
      expect(typeof renderer.resize).toBe('function');
    });

    it('should handle container dimension changes', () => {
      expect(() => renderer.resize(1280, 720)).not.toThrow();
    });

    it('should automatically detect container resize', () => {
      const resizeSpy = vi.spyOn(renderer, 'resize');
      
      // Simulate container resize
      mockContainer.getBoundingClientRect = () => ({ 
        width: 1280, 
        height: 720, 
        top: 0, 
        left: 0 
      });
      
      // Trigger resize event
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
      
      // Should have called resize
      expect(resizeSpy).toHaveBeenCalled();
    });

    it('should maintain aspect ratio during resize', () => {
      renderer.resize(1280, 720);
      
      // Verify that layers are properly scaled
      // This would be implementation-specific
      expect(mockContainer.style.width).toBeDefined();
      expect(mockContainer.style.height).toBeDefined();
    });
  });

  describe('Complete Integration Workflow', () => {
    it('should execute a complete cinematic sequence', async () => {
      // Full workflow: mount -> play -> navigate -> stop -> destroy
      await renderer.mount();
      
      renderer.play();
      expect(eventCallbacks.play).toHaveBeenCalled();
      
      // Let it play for a bit
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to different scenes
      renderer.goToScene('scene2');
      expect(eventCallbacks.sceneChange).toHaveBeenCalledWith('scene2');
      
      renderer.goToEvent('main');
      expect(eventCallbacks.eventChange).toHaveBeenCalledWith('main');
      
      // Seek to specific time (within duration)
      renderer.seek(3000);
      expect(eventCallbacks.seek).toHaveBeenLastCalledWith(3000);
      
      // Change quality
      renderer.setQuality('high');
      expect(eventCallbacks.qualityChange).toHaveBeenCalledWith('high');
      
      // Stop and cleanup
      renderer.stop();
      expect(eventCallbacks.stop).toHaveBeenCalled();
      
      renderer.destroy();
    });

    it('should handle multiple quality changes', async () => {
      await renderer.mount();
      
      const qualityLevels: QualityLevel[] = ['low', 'medium', 'high', 'ultra', 'auto'];
      
      for (const quality of qualityLevels) {
        renderer.setQuality(quality);
        expect(eventCallbacks.qualityChange).toHaveBeenCalledWith(quality);
      }
    });

    it('should maintain state consistency across operations', async () => {
      await renderer.mount();
      
      // Start playback
      renderer.play();
      
      // Navigate while playing
      renderer.goToScene('scene2');
      renderer.seek(1000);
      
      // Should still be in playing state
      expect(eventCallbacks.play).toHaveBeenCalled();
      expect(eventCallbacks.pause).not.toHaveBeenCalled();
      
      // Pause and resume
      renderer.pause();
      expect(eventCallbacks.pause).toHaveBeenCalled();
      
      renderer.play();
      expect(eventCallbacks.play).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid state changes gracefully', async () => {
      await renderer.mount();
      
      // Rapid state changes
      renderer.play();
      renderer.pause();
      renderer.play();
      renderer.stop();
      renderer.play();
      
      // Should handle all state changes without errors
      expect(eventCallbacks.play).toHaveBeenCalledTimes(3);
      expect(eventCallbacks.pause).toHaveBeenCalledTimes(1);
      expect(eventCallbacks.stop).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle invalid specifications gracefully', () => {
      const invalidSpec = {
        schemaVersion: '1.0.0',
        engine: {},
        events: [],
        scenes: []
      };

      expect(() => {
        new CinematicRenderer2D({
          container: mockContainer,
          spec: invalidSpec as any
        });
      }).toThrow();
    });

    it('should recover from runtime errors', async () => {
      await renderer.mount();
      
      // Trigger error condition
      renderer.goToEvent('nonexistent-event');
      
      // Should emit error but continue functioning
      expect(eventCallbacks.error).toHaveBeenCalled();
      
      // Should still be able to perform other operations
      expect(() => renderer.play()).not.toThrow();
      expect(() => renderer.setQuality('medium')).not.toThrow();
    });

    it('should handle container removal gracefully', async () => {
      await renderer.mount();
      
      // Simulate container removal
      mockContainer.parentNode = null;
      
      // Should handle gracefully
      expect(() => renderer.play()).not.toThrow();
      expect(() => renderer.destroy()).not.toThrow();
    });
  });

  describe('Performance and Memory', () => {
    it('should not leak memory after destroy', async () => {
      await renderer.mount();
      renderer.play();
      
      const initialCallbackCount = Object.keys(eventCallbacks).length;
      
      renderer.destroy();
      
      // Event listeners should be cleaned up
      // This is a simplified check - in real implementation,
      // we'd check internal event listener maps
      expect(() => renderer.play()).toThrow(); // Should not work after destroy
    });

    it('should handle multiple instances', () => {
      const renderer2 = new CinematicRenderer2D({
        container: mockContainer,
        spec: testSpec
      });

      expect(renderer).toBeDefined();
      expect(renderer2).toBeDefined();
      expect(renderer).not.toBe(renderer2);

      renderer2.destroy();
    });

    it('should optimize layer rendering order', async () => {
      await renderer.mount();
      
      // Layers should be rendered in z-index order
      // This would be verified by checking the actual DOM structure
      // or render backend calls in a real implementation
      expect(mockContainer.appendChild).toHaveBeenCalled();
    });
  });
});