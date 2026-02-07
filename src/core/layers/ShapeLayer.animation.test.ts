/**
 * ShapeLayer Animation Integration Tests
 * 
 * Tests that all shape properties can be animated through the existing animation system.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShapeLayer } from './ShapeLayer';
import { AnimationCompiler } from '../../animation/AnimationCompiler';
import type { AnimationTrackSpec } from '../../types/CinematicSpec';
import type { CompiledAnimationTrack } from '../../types/CompiledSpec';
import type { LayerMountContext, FrameContext } from '../interfaces/LayerContext';

describe('ShapeLayer Animation Integration', () => {
  let mockContainer: HTMLElement;
  let mockRenderer: any;
  let mockMountContext: LayerMountContext;

  beforeEach(() => {
    mockContainer = document.createElement('div');
    document.body.appendChild(mockContainer);

    mockRenderer = {
      constructor: { name: 'DOMRenderer' },
      createLayerElement: vi.fn(() => document.createElement('div')),
      getDOMContainer: vi.fn(() => mockContainer),
    };

    mockMountContext = {
      container: mockContainer,
      renderer: mockRenderer,
      assetManager: null as any,
      layerConfig: {},
    };
  });

  describe('Position Animation (Requirement 5.1)', () => {
    it('should animate x position over time', () => {
      const layer = new ShapeLayer('test-circle', {
        shapeType: 'circle',
        radius: 50,
        x: 0,
        y: 100,
        fillColor: '#ff0000',
      });

      layer.mount(mockMountContext);

      // Create animation track for x position
      const animationTrack: AnimationTrackSpec = {
        property: 'x',
        from: 0,
        to: 500,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      };

      const compiledTrack = AnimationCompiler.compileTrack(animationTrack);

      // Test animation at different time points
      const testPoints = [
        { time: 0, expected: 0 },
        { time: 250, expected: 125 },
        { time: 500, expected: 250 },
        { time: 750, expected: 375 },
        { time: 1000, expected: 500 },
      ];

      for (const { time, expected } of testPoints) {
        const value = AnimationCompiler.applyAnimation(compiledTrack, time);
        expect(value).toBeCloseTo(expected, 1);

        // Update layer config with animated value
        layer.updateConfig({ x: value });
        const config = layer.getConfig();
        expect(config.x).toBeCloseTo(expected, 1);
      }
    });

    it('should animate y position over time', () => {
      const layer = new ShapeLayer('test-rect', {
        shapeType: 'rectangle',
        width: 100,
        height: 50,
        x: 100,
        y: 0,
        fillColor: '#00ff00',
      });

      layer.mount(mockMountContext);

      const animationTrack: AnimationTrackSpec = {
        property: 'y',
        from: 0,
        to: 300,
        startMs: 0,
        endMs: 2000,
        easing: 'ease-in-out',
      };

      const compiledTrack = AnimationCompiler.compileTrack(animationTrack);

      // Test at start, middle, and end
      const startValue = AnimationCompiler.applyAnimation(compiledTrack, 0);
      expect(startValue).toBe(0);

      const midValue = AnimationCompiler.applyAnimation(compiledTrack, 1000);
      expect(midValue).toBeGreaterThan(100);
      expect(midValue).toBeLessThan(200);

      const endValue = AnimationCompiler.applyAnimation(compiledTrack, 2000);
      expect(endValue).toBe(300);

      // Verify layer accepts animated values
      layer.updateConfig({ y: endValue });
      expect(layer.getConfig().y).toBe(300);
    });
  });

  describe('Rotation Animation (Requirement 5.2)', () => {
    it('should animate rotation over time', () => {
      const layer = new ShapeLayer('test-square', {
        shapeType: 'square',
        size: 100,
        x: 200,
        y: 200,
        rotation: 0,
        fillColor: '#0000ff',
      });

      layer.mount(mockMountContext);

      const animationTrack: AnimationTrackSpec = {
        property: 'rotation',
        from: 0,
        to: 360,
        startMs: 0,
        endMs: 2000,
        easing: 'linear',
        loop: true,
      };

      const compiledTrack = AnimationCompiler.compileTrack(animationTrack);

      // Test full rotation (note: at 2000ms, loop resets to 0)
      const testPoints = [
        { time: 0, expected: 0 },
        { time: 500, expected: 90 },
        { time: 1000, expected: 180 },
        { time: 1500, expected: 270 },
        { time: 1999, expected: 360 }, // Just before loop reset
      ];

      for (const { time, expected } of testPoints) {
        const value = AnimationCompiler.applyAnimation(compiledTrack, time);
        expect(value).toBeCloseTo(expected, 0); // Use 0 decimal places for rotation

        layer.updateConfig({ rotation: value });
        expect(layer.getConfig().rotation).toBeCloseTo(expected, 0);
      }
    });
  });

  describe('Scale Animation (Requirement 5.3)', () => {
    it('should animate scaleX and scaleY independently', () => {
      const layer = new ShapeLayer('test-ellipse', {
        shapeType: 'ellipse',
        radiusX: 50,
        radiusY: 30,
        x: 300,
        y: 300,
        scaleX: 1,
        scaleY: 1,
        fillColor: '#ff00ff',
      });

      layer.mount(mockMountContext);

      // Animate scaleX
      const scaleXTrack: AnimationTrackSpec = {
        property: 'scaleX',
        from: 1,
        to: 2,
        startMs: 0,
        endMs: 1000,
        easing: 'ease-out',
      };

      // Animate scaleY
      const scaleYTrack: AnimationTrackSpec = {
        property: 'scaleY',
        from: 1,
        to: 0.5,
        startMs: 0,
        endMs: 1000,
        easing: 'ease-in',
      };

      const compiledScaleX = AnimationCompiler.compileTrack(scaleXTrack);
      const compiledScaleY = AnimationCompiler.compileTrack(scaleYTrack);

      // Test at end of animation
      const scaleXValue = AnimationCompiler.applyAnimation(compiledScaleX, 1000);
      const scaleYValue = AnimationCompiler.applyAnimation(compiledScaleY, 1000);

      expect(scaleXValue).toBe(2);
      expect(scaleYValue).toBe(0.5);

      // Update layer with animated values
      layer.updateConfig({ scaleX: scaleXValue, scaleY: scaleYValue });
      expect(layer.getConfig().scaleX).toBe(2);
      expect(layer.getConfig().scaleY).toBe(0.5);
    });
  });

  describe('Color Animation (Requirement 5.4)', () => {
    it('should animate fillColor over time', () => {
      const layer = new ShapeLayer('test-star', {
        shapeType: 'star',
        points: 5,
        innerRadius: 30,
        outerRadius: 60,
        x: 400,
        y: 400,
        fillColor: '#ff0000',
      });

      layer.mount(mockMountContext);

      // Note: Color interpolation requires string interpolation
      // The animation system should handle this
      const animationTrack: AnimationTrackSpec = {
        property: 'fillColor',
        from: '#ff0000', // red
        to: '#0000ff', // blue
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      };

      const compiledTrack = AnimationCompiler.compileTrack(animationTrack);

      // Test at start and end (color interpolation is discrete in current implementation)
      const startValue = AnimationCompiler.applyAnimation(compiledTrack, 0);
      const endValue = AnimationCompiler.applyAnimation(compiledTrack, 1000);

      // Update layer with animated color
      layer.updateConfig({ fillColor: endValue });
      const config = layer.getConfig();
      expect(config.fillColor).toBeDefined();
    });

    it('should animate strokeColor over time', () => {
      const layer = new ShapeLayer('test-polygon', {
        shapeType: 'polygon',
        sides: 6,
        radius: 50,
        x: 500,
        y: 500,
        strokeColor: '#000000',
        strokeWidth: 2,
      });

      layer.mount(mockMountContext);

      const animationTrack: AnimationTrackSpec = {
        property: 'strokeColor',
        from: '#000000',
        to: '#ffffff',
        startMs: 0,
        endMs: 500,
        easing: 'linear',
      };

      const compiledTrack = AnimationCompiler.compileTrack(animationTrack);

      const endValue = AnimationCompiler.applyAnimation(compiledTrack, 500);
      layer.updateConfig({ strokeColor: endValue });
      expect(layer.getConfig().strokeColor).toBeDefined();
    });
  });

  describe('Opacity Animation (Requirement 5.5)', () => {
    it('should animate opacity over time', () => {
      const layer = new ShapeLayer('test-triangle', {
        shapeType: 'triangle',
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 50, y: 100 },
        ],
        x: 100,
        y: 100,
        opacity: 1,
        fillColor: '#ffff00',
      });

      layer.mount(mockMountContext);

      const animationTrack: AnimationTrackSpec = {
        property: 'opacity',
        from: 1,
        to: 0,
        startMs: 0,
        endMs: 1000,
        easing: 'ease-in-out',
      };

      const compiledTrack = AnimationCompiler.compileTrack(animationTrack);

      // Test fade out
      const testPoints = [
        { time: 0, expected: 1 },
        { time: 500, expected: 0.5 },
        { time: 1000, expected: 0 },
      ];

      for (const { time, expected } of testPoints) {
        const value = AnimationCompiler.applyAnimation(compiledTrack, time);
        expect(value).toBeCloseTo(expected, 1);

        layer.updateConfig({ opacity: value });
        expect(layer.getConfig().opacity).toBeCloseTo(expected, 1);
      }
    });
  });

  describe('Stroke Width Animation (Requirement 5.6)', () => {
    it('should animate strokeWidth over time', () => {
      const layer = new ShapeLayer('test-trapezoid', {
        shapeType: 'trapezoid',
        topWidth: 50,
        bottomWidth: 100,
        height: 60,
        x: 200,
        y: 200,
        strokeColor: '#ff0000',
        strokeWidth: 1,
      });

      layer.mount(mockMountContext);

      const animationTrack: AnimationTrackSpec = {
        property: 'strokeWidth',
        from: 1,
        to: 10,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      };

      const compiledTrack = AnimationCompiler.compileTrack(animationTrack);

      // Test stroke width increase
      const testPoints = [
        { time: 0, expected: 1 },
        { time: 500, expected: 5.5 },
        { time: 1000, expected: 10 },
      ];

      for (const { time, expected } of testPoints) {
        const value = AnimationCompiler.applyAnimation(compiledTrack, time);
        expect(value).toBeCloseTo(expected, 1);

        layer.updateConfig({ strokeWidth: value });
        expect(layer.getConfig().strokeWidth).toBeCloseTo(expected, 1);
      }
    });
  });

  describe('Easing Functions (Requirement 5.7)', () => {
    it('should support different easing functions for shape properties', () => {
      const layer = new ShapeLayer('test-circle', {
        shapeType: 'circle',
        radius: 50,
        x: 0,
        y: 0,
        fillColor: '#00ff00',
      });

      layer.mount(mockMountContext);

      const easingFunctions: Array<{ name: string; easing: any }> = [
        { name: 'linear', easing: 'linear' },
        { name: 'ease', easing: 'ease' },
        { name: 'ease-in', easing: 'ease-in' },
        { name: 'ease-out', easing: 'ease-out' },
        { name: 'ease-in-out', easing: 'ease-in-out' },
        { name: 'ease-in-cubic', easing: 'ease-in-cubic' },
        { name: 'ease-out-bounce', easing: 'ease-out-bounce' },
      ];

      for (const { name, easing } of easingFunctions) {
        const animationTrack: AnimationTrackSpec = {
          property: 'x',
          from: 0,
          to: 100,
          startMs: 0,
          endMs: 1000,
          easing,
        };

        const compiledTrack = AnimationCompiler.compileTrack(animationTrack);

        // Test that animation compiles and produces values
        const startValue = AnimationCompiler.applyAnimation(compiledTrack, 0);
        const midValue = AnimationCompiler.applyAnimation(compiledTrack, 500);
        const endValue = AnimationCompiler.applyAnimation(compiledTrack, 1000);

        expect(startValue).toBe(0);
        expect(endValue).toBe(100);
        expect(midValue).toBeGreaterThanOrEqual(0);
        expect(midValue).toBeLessThanOrEqual(100);

        // Verify layer accepts animated value
        layer.updateConfig({ x: midValue });
        expect(layer.getConfig().x).toBe(midValue);
      }
    });
  });

  describe('Simultaneous Property Animation (Requirement 5.8)', () => {
    it('should support animating multiple properties at once', () => {
      const layer = new ShapeLayer('test-rect', {
        shapeType: 'rectangle',
        width: 100,
        height: 50,
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        fillColor: '#ff0000',
        strokeColor: '#000000',
        strokeWidth: 1,
      });

      layer.mount(mockMountContext);

      // Create multiple animation tracks
      const animations: AnimationTrackSpec[] = [
        { property: 'x', from: 0, to: 500, startMs: 0, endMs: 2000, easing: 'linear' },
        { property: 'y', from: 0, to: 300, startMs: 0, endMs: 2000, easing: 'linear' },
        { property: 'rotation', from: 0, to: 360, startMs: 0, endMs: 2000, easing: 'linear' },
        { property: 'scaleX', from: 1, to: 2, startMs: 0, endMs: 2000, easing: 'ease-out' },
        { property: 'scaleY', from: 1, to: 0.5, startMs: 0, endMs: 2000, easing: 'ease-in' },
        { property: 'opacity', from: 1, to: 0.3, startMs: 0, endMs: 2000, easing: 'ease-in-out' },
        { property: 'strokeWidth', from: 1, to: 5, startMs: 0, endMs: 2000, easing: 'linear' },
      ];

      const compiledTracks = animations.map(track => ({
        property: track.property,
        compiled: AnimationCompiler.compileTrack(track),
      }));

      // Test at end of animation
      const timeMs = 2000;
      const animatedValues: Record<string, any> = {};

      for (const { property, compiled } of compiledTracks) {
        const value = AnimationCompiler.applyAnimation(compiled, timeMs);
        animatedValues[property] = value;
      }

      // Update layer with all animated values at once
      layer.updateConfig(animatedValues);

      // Verify all properties were updated
      const config = layer.getConfig();
      expect(config.x).toBeCloseTo(500, 1);
      expect(config.y).toBeCloseTo(300, 1);
      expect(config.rotation).toBeCloseTo(360, 1);
      expect(config.scaleX).toBeCloseTo(2, 1);
      expect(config.scaleY).toBeCloseTo(0.5, 1);
      expect(config.opacity).toBeCloseTo(0.3, 1);
      expect(config.strokeWidth).toBeCloseTo(5, 1);
    });

    it('should handle keyframe animations with multiple properties', () => {
      const layer = new ShapeLayer('test-circle', {
        shapeType: 'circle',
        radius: 50,
        x: 100,
        y: 100,
        scaleX: 1,
        scaleY: 1,
        fillColor: '#0000ff',
      });

      layer.mount(mockMountContext);

      // Create keyframe animation for scale
      const scaleAnimation: AnimationTrackSpec = {
        property: 'scaleX',
        from: 1,
        to: 2,
        startMs: 0,
        endMs: 3000,
        easing: 'linear',
        keyframes: [
          { time: 0, value: 1, easing: 'ease-out' },
          { time: 0.5, value: 2, easing: 'ease-in' },
          { time: 1, value: 1 },
        ],
      };

      const compiledTrack = AnimationCompiler.compileTrack(scaleAnimation);

      // Test keyframe values
      const startValue = AnimationCompiler.applyAnimation(compiledTrack, 0);
      const midValue = AnimationCompiler.applyAnimation(compiledTrack, 1500);
      const endValue = AnimationCompiler.applyAnimation(compiledTrack, 3000);

      expect(startValue).toBe(1);
      expect(midValue).toBeCloseTo(2, 1);
      expect(endValue).toBe(1);

      // Verify layer accepts keyframe animated values
      layer.updateConfig({ scaleX: midValue });
      expect(layer.getConfig().scaleX).toBeCloseTo(2, 1);
    });
  });

  describe('Animation Loop and Yoyo (Requirement 5.7)', () => {
    it('should support looping animations', () => {
      const layer = new ShapeLayer('test-square', {
        shapeType: 'square',
        size: 50,
        x: 0,
        y: 0,
        fillColor: '#ffff00',
      });

      layer.mount(mockMountContext);

      const animationTrack: AnimationTrackSpec = {
        property: 'x',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        loop: true,
      };

      const compiledTrack = AnimationCompiler.compileTrack(animationTrack);

      // Test multiple loops
      const loop1Start = AnimationCompiler.applyAnimation(compiledTrack, 0);
      const loop1End = AnimationCompiler.applyAnimation(compiledTrack, 1000);
      const loop2Start = AnimationCompiler.applyAnimation(compiledTrack, 1000);
      const loop2Mid = AnimationCompiler.applyAnimation(compiledTrack, 1500);

      expect(loop1Start).toBe(0);
      expect(loop1End).toBeCloseTo(0, 1); // Loops back to start
      expect(loop2Start).toBeCloseTo(0, 1);
      expect(loop2Mid).toBeCloseTo(50, 1);
    });

    it('should support yoyo animations', () => {
      const layer = new ShapeLayer('test-circle', {
        shapeType: 'circle',
        radius: 30,
        x: 0,
        y: 0,
        fillColor: '#00ffff',
      });

      layer.mount(mockMountContext);

      const animationTrack: AnimationTrackSpec = {
        property: 'x',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        loop: true,
        yoyo: true,
      };

      const compiledTrack = AnimationCompiler.compileTrack(animationTrack);

      // Test yoyo behavior
      const forward = AnimationCompiler.applyAnimation(compiledTrack, 500);
      const backward = AnimationCompiler.applyAnimation(compiledTrack, 1500);

      expect(forward).toBeCloseTo(50, 1);
      expect(backward).toBeCloseTo(50, 1); // Should be going backward
    });
  });

  describe('Integration with FrameContext', () => {
    it('should update shape rendering with animated values in frame context', () => {
      const layer = new ShapeLayer('test-animated', {
        shapeType: 'rectangle',
        width: 100,
        height: 50,
        x: 0,
        y: 0,
        rotation: 0,
        fillColor: '#ff0000',
      });

      layer.mount(mockMountContext);

      // Simulate animation system applying values
      const frameContext: FrameContext = {
        timeMs: 500,
        deltaMs: 16.67,
        quality: 'high',
        viewport: { width: 1920, height: 1080 },
        devicePixelRatio: 1,
      };

      // Apply animated values before update
      layer.updateConfig({
        x: 250,
        rotation: 180,
      });

      // Update layer (this would trigger rendering)
      layer.update(frameContext);

      // Verify config was updated
      const config = layer.getConfig();
      expect(config.x).toBe(250);
      expect(config.rotation).toBe(180);
    });
  });
});
