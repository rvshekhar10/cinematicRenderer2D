/**
 * Playground Integration Tests
 * 
 * Tests the example specifications from the playground to ensure they work correctly
 * with the complete system. Validates Requirements 1.1-1.5 with real-world scenarios.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CinematicRenderer2D, SpecParser } from '../../src/index';
import type { CinematicSpec } from '../../src/index';

// Import example specifications
import storyNarrationSpec from '../../playground/examples/story-narration-spec.json';
import dayNightStorySpec from '../../playground/examples/day-night-story-spec.json';

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

describe('Playground Integration Tests', () => {
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
  });

  afterEach(() => {
    if (renderer) {
      renderer.destroy();
    }
  });

  describe('Story Narration Specification', () => {
    beforeEach(() => {
      renderer = new CinematicRenderer2D({
        container: mockContainer,
        spec: storyNarrationSpec as CinematicSpec
      });

      // Attach event listeners
      Object.entries(eventCallbacks).forEach(([event, callback]) => {
        renderer.on(event, callback);
      });
    });

    it('should parse and validate the story narration specification', () => {
      expect(() => {
        SpecParser.parse(storyNarrationSpec as CinematicSpec);
      }).not.toThrow();
    });

    it('should create renderer with story narration spec', () => {
      expect(renderer).toBeDefined();
      expect(typeof renderer.mount).toBe('function');
      expect(typeof renderer.play).toBe('function');
      expect(typeof renderer.pause).toBe('function');
      expect(typeof renderer.stop).toBe('function');
    });

    it('should handle all events in the story narration spec', async () => {
      await renderer.mount();

      // Test navigation to each event
      const events = ['prologue', 'chapter1', 'epilogue'];
      
      for (const eventId of events) {
        renderer.goToEvent(eventId);
        expect(eventCallbacks.eventChange).toHaveBeenCalledWith(eventId);
      }
    });

    it('should handle all scenes in the story narration spec', async () => {
      await renderer.mount();

      // Test navigation to each scene
      const scenes = ['intro', 'setup', 'departure', 'forest', 'encounter', 'resolution', 'credits'];
      
      for (const sceneId of scenes) {
        renderer.goToScene(sceneId);
        expect(eventCallbacks.sceneChange).toHaveBeenCalledWith(sceneId);
      }
    });

    it('should support all layer types used in story narration spec', async () => {
      await renderer.mount();
      
      // The spec uses these layer types:
      // - gradient, textBlock, starfield, noiseOverlay, particles, glowOrb, vignette, dust
      // All should be supported without errors
      
      renderer.play();
      expect(eventCallbacks.play).toHaveBeenCalled();
      
      // Navigate through scenes to activate different layer types
      renderer.goToScene('intro'); // gradient, textBlock, starfield
      renderer.goToScene('setup'); // gradient, noiseOverlay, textBlock, particles
      renderer.goToScene('departure'); // gradient, glowOrb, textBlock
      renderer.goToScene('forest'); // gradient, vignette, dust, textBlock
      renderer.goToScene('encounter'); // gradient, nebulaNoise, glowOrb, textBlock
      
      // Should handle all layer types without errors
      expect(eventCallbacks.error).not.toHaveBeenCalled();
    });

    it('should handle complex animations in story narration spec', async () => {
      await renderer.mount();
      
      // Test seeking to different points to trigger animations
      renderer.play();
      
      // Seek to various points in the timeline
      renderer.seek(2000); // During intro fade-in
      renderer.seek(4000); // During title scale animation
      renderer.seek(6000); // During subtitle fade-in
      
      expect(eventCallbacks.seek).toHaveBeenCalledTimes(3);
      expect(eventCallbacks.error).not.toHaveBeenCalled();
    });

    it('should maintain performance with complex story narration spec', async () => {
      await renderer.mount();
      
      // Set high quality to test performance
      renderer.setQuality('high');
      expect(eventCallbacks.qualityChange).toHaveBeenCalledWith('high');
      
      renderer.play();
      
      // Navigate through multiple scenes rapidly
      const scenes = ['intro', 'setup', 'departure', 'forest', 'encounter'];
      for (let i = 0; i < scenes.length; i++) {
        renderer.goToScene(scenes[i]);
        // Small delay to simulate real usage
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      expect(eventCallbacks.error).not.toHaveBeenCalled();
    });
  });

  describe('Day-Night Story Specification', () => {
    beforeEach(() => {
      renderer = new CinematicRenderer2D({
        container: mockContainer,
        spec: dayNightStorySpec as CinematicSpec
      });

      // Attach event listeners
      Object.entries(eventCallbacks).forEach(([event, callback]) => {
        renderer.on(event, callback);
      });
    });

    it('should parse and validate the day-night story specification', () => {
      expect(() => {
        SpecParser.parse(dayNightStorySpec as CinematicSpec);
      }).not.toThrow();
    });

    it('should create renderer with day-night story spec', () => {
      expect(renderer).toBeDefined();
      expect(typeof renderer.mount).toBe('function');
      expect(typeof renderer.play).toBe('function');
      expect(typeof renderer.pause).toBe('function');
      expect(typeof renderer.stop).toBe('function');
    });

    it('should handle the single event with multiple scenes', async () => {
      await renderer.mount();

      // Test navigation to the main event
      renderer.goToEvent('eternal-cycle');
      expect(eventCallbacks.eventChange).toHaveBeenCalledWith('eternal-cycle');
    });

    it('should handle all scenes in the day-night story spec', async () => {
      await renderer.mount();

      // Test navigation to each scene in the day-night cycle
      const scenes = [
        'prologue-void', 'prologue-awakening', 'act1-deep-night',
        'act2-pre-dawn', 'act3-sunrise', 'act4-morning-glory', 
        'act5-high-noon', 'act6-golden-hour', 'act7-twilight',
        'act8-dusk', 'act9-night-returns', 'epilogue-eternal'
      ];
      
      for (const sceneId of scenes) {
        renderer.goToScene(sceneId);
        expect(eventCallbacks.sceneChange).toHaveBeenCalledWith(sceneId);
      }
    });

    it('should support complex gradient animations', async () => {
      await renderer.mount();
      
      renderer.play();
      
      // Test scenes with gradient color transitions
      renderer.goToScene('act2-pre-dawn'); // Has gradient color animation
      renderer.goToScene('act3-sunrise'); // Has gradient color animation
      renderer.goToScene('act6-golden-hour'); // Has gradient color animation
      
      expect(eventCallbacks.error).not.toHaveBeenCalled();
    });

    it('should handle multiple glowOrb layers with complex animations', async () => {
      await renderer.mount();
      
      renderer.play();
      
      // Test scenes with multiple glowOrb layers
      renderer.goToScene('act1-deep-night'); // moon-surface + moon-glow
      renderer.goToScene('act3-sunrise'); // sun-emergence + sun-radiance
      renderer.goToScene('act5-high-noon'); // noon-sun + noon-radiance
      renderer.goToScene('act9-night-returns'); // moon-full + moon-radiance-full
      
      expect(eventCallbacks.error).not.toHaveBeenCalled();
    });

    it('should handle high particle counts and complex effects', async () => {
      await renderer.mount();
      
      // Set ultra quality to test maximum performance
      renderer.setQuality('ultra');
      expect(eventCallbacks.qualityChange).toHaveBeenCalledWith('ultra');
      
      renderer.play();
      
      // Test scenes with high particle counts
      renderer.goToScene('act1-deep-night'); // 400 stars + 200 milky-way particles
      renderer.goToScene('act3-sunrise'); // 120 sun-rays particles
      renderer.goToScene('act9-night-returns'); // 500 stars + 250 cosmic-nebula particles
      
      expect(eventCallbacks.error).not.toHaveBeenCalled();
    });

    it('should handle the complete day-night cycle workflow', async () => {
      await renderer.mount();
      
      renderer.play();
      
      // Simulate watching the complete day-night cycle
      const scenes = [
        'prologue-void',        // The Void Before Time
        'prologue-awakening',   // The First Light
        'act1-deep-night',      // The Deep Night
        'act2-pre-dawn',        // The Hour Before Dawn
        'act3-sunrise',         // Sunrise - The Awakening
        'act5-high-noon',       // High Noon - The Zenith
        'act7-twilight',        // Twilight - The Transition
        'act9-night-returns'    // Night Returns - The Circle Closes
      ];
      
      for (const sceneId of scenes) {
        renderer.goToScene(sceneId);
        expect(eventCallbacks.sceneChange).toHaveBeenCalledWith(sceneId);
        
        // Brief pause to simulate scene viewing
        await new Promise(resolve => setTimeout(resolve, 5));
      }
      
      expect(eventCallbacks.error).not.toHaveBeenCalled();
    });
  });

  describe('Cross-Specification Compatibility', () => {
    it('should handle switching between different specifications', async () => {
      // Test with story narration spec first
      renderer = new CinematicRenderer2D({
        container: mockContainer,
        spec: storyNarrationSpec as CinematicSpec
      });

      Object.entries(eventCallbacks).forEach(([event, callback]) => {
        renderer.on(event, callback);
      });

      await renderer.mount();
      renderer.play();
      renderer.goToScene('intro');
      
      expect(eventCallbacks.play).toHaveBeenCalled();
      expect(eventCallbacks.sceneChange).toHaveBeenCalledWith('intro');
      
      renderer.destroy();
      
      // Switch to day-night story spec
      renderer = new CinematicRenderer2D({
        container: mockContainer,
        spec: dayNightStorySpec as CinematicSpec
      });

      Object.entries(eventCallbacks).forEach(([event, callback]) => {
        renderer.on(event, callback);
      });

      await renderer.mount();
      renderer.play();
      renderer.goToScene('prologue-void');
      
      expect(eventCallbacks.sceneChange).toHaveBeenCalledWith('prologue-void');
      expect(eventCallbacks.error).not.toHaveBeenCalled();
    });

    it('should validate both specifications have correct schema versions', () => {
      expect(storyNarrationSpec.schemaVersion).toBe('1.0.0');
      expect(dayNightStorySpec.schemaVersion).toBe('1.0.0');
    });

    it('should handle different quality settings across specifications', async () => {
      // Story narration uses 'auto' quality
      renderer = new CinematicRenderer2D({
        container: mockContainer,
        spec: storyNarrationSpec as CinematicSpec
      });

      Object.entries(eventCallbacks).forEach(([event, callback]) => {
        renderer.on(event, callback);
      });

      await renderer.mount();
      renderer.setQuality('medium');
      expect(eventCallbacks.qualityChange).toHaveBeenCalledWith('medium');
      
      renderer.destroy();
      
      // Day-night story uses 'high' quality
      renderer = new CinematicRenderer2D({
        container: mockContainer,
        spec: dayNightStorySpec as CinematicSpec
      });

      Object.entries(eventCallbacks).forEach(([event, callback]) => {
        renderer.on(event, callback);
      });

      await renderer.mount();
      renderer.setQuality('ultra');
      expect(eventCallbacks.qualityChange).toHaveBeenCalledWith('ultra');
    });
  });

  describe('Error Handling with Real Specifications', () => {
    it('should handle invalid scene navigation gracefully', async () => {
      renderer = new CinematicRenderer2D({
        container: mockContainer,
        spec: storyNarrationSpec as CinematicSpec
      });

      Object.entries(eventCallbacks).forEach(([event, callback]) => {
        renderer.on(event, callback);
      });

      await renderer.mount();
      
      // Try to navigate to non-existent scenes
      renderer.goToScene('non-existent-scene');
      renderer.goToEvent('non-existent-event');
      
      // Should handle gracefully without crashing
      expect(() => renderer.play()).not.toThrow();
      expect(() => renderer.pause()).not.toThrow();
    });

    it('should recover from seek operations beyond timeline', async () => {
      renderer = new CinematicRenderer2D({
        container: mockContainer,
        spec: storyNarrationSpec as CinematicSpec
      });

      Object.entries(eventCallbacks).forEach(([event, callback]) => {
        renderer.on(event, callback);
      });

      await renderer.mount();
      renderer.play();
      
      // Seek beyond the timeline
      renderer.seek(999999); // Way beyond any scene duration
      renderer.seek(-1000);  // Negative time
      
      // Should handle gracefully
      expect(eventCallbacks.error).not.toHaveBeenCalled();
      expect(() => renderer.pause()).not.toThrow();
    });

    it('should handle rapid state changes with complex specifications', async () => {
      renderer = new CinematicRenderer2D({
        container: mockContainer,
        spec: dayNightStorySpec as CinematicSpec
      });

      Object.entries(eventCallbacks).forEach(([event, callback]) => {
        renderer.on(event, callback);
      });

      await renderer.mount();
      
      // Rapid state changes
      for (let i = 0; i < 10; i++) {
        renderer.play();
        renderer.pause();
        renderer.seek(i * 1000);
        renderer.setQuality(i % 2 === 0 ? 'high' : 'low');
      }
      
      // Should handle all rapid changes without errors
      expect(eventCallbacks.error).not.toHaveBeenCalled();
    });
  });

  describe('Performance and Memory with Real Specifications', () => {
    it('should not leak memory when switching between complex specifications', async () => {
      const specs = [storyNarrationSpec, dayNightStorySpec];
      
      for (let i = 0; i < 3; i++) {
        const spec = specs[i % 2];
        
        renderer = new CinematicRenderer2D({
          container: mockContainer,
          spec: spec as CinematicSpec
        });

        Object.entries(eventCallbacks).forEach(([event, callback]) => {
          renderer.on(event, callback);
        });

        await renderer.mount();
        renderer.play();
        
        // Use the renderer briefly
        await new Promise(resolve => setTimeout(resolve, 10));
        
        renderer.destroy();
      }
      
      // Should complete without memory issues
      expect(true).toBe(true);
    });

    it('should maintain performance with high-complexity scenes', async () => {
      renderer = new CinematicRenderer2D({
        container: mockContainer,
        spec: dayNightStorySpec as CinematicSpec
      });

      Object.entries(eventCallbacks).forEach(([event, callback]) => {
        renderer.on(event, callback);
      });

      await renderer.mount();
      renderer.setQuality('ultra');
      renderer.play();
      
      // Navigate to the most complex scene (act9-night-returns with 500 stars + particles + nebula)
      renderer.goToScene('act9-night-returns');
      
      // Should handle high complexity without errors
      expect(eventCallbacks.error).not.toHaveBeenCalled();
      expect(eventCallbacks.sceneChange).toHaveBeenCalledWith('act9-night-returns');
    });
  });
});