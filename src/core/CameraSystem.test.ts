/**
 * Unit Tests for CameraSystem
 * 
 * Tests camera state management, animations, and transform application
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CameraSystem, type CameraState, type CameraAnimation } from './CameraSystem';

describe('CameraSystem', () => {
  let container: HTMLElement;
  let camera: CameraSystem;

  beforeEach(() => {
    // Create a mock container element
    container = document.createElement('div');
    container.style.transform = '';
    camera = new CameraSystem(container);
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const state = camera.getState();
      expect(state).toEqual({
        x: 0,
        y: 0,
        zoom: 1.0,
        rotate: 0,
      });
    });

    it('should apply default transform to container', () => {
      expect(container.style.transform).toBe('translate(0px, 0px) scale(1) rotate(0deg)');
    });
  });

  describe('setState', () => {
    it('should update camera state', () => {
      camera.setState({ x: 100, y: 50 });
      const state = camera.getState();
      expect(state.x).toBe(100);
      expect(state.y).toBe(50);
    });

    it('should partially update state', () => {
      camera.setState({ zoom: 2.0 });
      const state = camera.getState();
      expect(state.zoom).toBe(2.0);
      expect(state.x).toBe(0); // Other properties unchanged
    });

    it('should apply transform to container', () => {
      camera.setState({ x: 100, y: 50, zoom: 2.0 });
      expect(container.style.transform).toBe('translate(-100px, -50px) scale(2) rotate(0deg)');
    });

    it('should handle rotation', () => {
      camera.setState({ rotate: 45 });
      expect(container.style.transform).toBe('translate(0px, 0px) scale(1) rotate(45deg)');
    });
  });

  describe('getState', () => {
    it('should return a copy of the state', () => {
      const state1 = camera.getState();
      state1.x = 999;
      const state2 = camera.getState();
      expect(state2.x).toBe(0); // Original state unchanged
    });
  });

  describe('addAnimation', () => {
    it('should add animation to the list', () => {
      const animation: CameraAnimation = {
        property: 'x',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      };
      camera.addAnimation(animation);
      expect(camera.getAnimations()).toHaveLength(1);
    });

    it('should support multiple animations', () => {
      camera.addAnimation({
        property: 'x',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      });
      camera.addAnimation({
        property: 'y',
        from: 0,
        to: 50,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      });
      expect(camera.getAnimations()).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should interpolate linear animation', () => {
      camera.addAnimation({
        property: 'x',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      });

      camera.update(500); // 50% progress
      const state = camera.getState();
      expect(state.x).toBe(50);
    });

    it('should handle animation at start time', () => {
      camera.addAnimation({
        property: 'zoom',
        from: 1.0,
        to: 2.0,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      });

      camera.update(0);
      const state = camera.getState();
      expect(state.zoom).toBe(1.0);
    });

    it('should handle animation at end time', () => {
      camera.addAnimation({
        property: 'zoom',
        from: 1.0,
        to: 2.0,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      });

      camera.update(1000);
      const state = camera.getState();
      expect(state.zoom).toBe(2.0);
    });

    it('should not update before animation starts', () => {
      camera.addAnimation({
        property: 'x',
        from: 0,
        to: 100,
        startMs: 1000,
        endMs: 2000,
        easing: 'linear',
      });

      camera.update(500);
      const state = camera.getState();
      expect(state.x).toBe(0); // No change
    });

    it('should not update after animation ends', () => {
      camera.addAnimation({
        property: 'x',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      });

      camera.update(1500);
      const state = camera.getState();
      // State should remain at last animated value
      expect(state.x).toBe(0); // No active animation
    });

    it('should handle multiple simultaneous animations', () => {
      camera.addAnimation({
        property: 'x',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      });
      camera.addAnimation({
        property: 'y',
        from: 0,
        to: 50,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      });

      camera.update(500);
      const state = camera.getState();
      expect(state.x).toBe(50);
      expect(state.y).toBe(25);
    });

    it('should apply easing functions', () => {
      camera.addAnimation({
        property: 'x',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'ease-in',
      });

      camera.update(500);
      const state = camera.getState();
      // ease-in should be slower at start, so value < 50
      expect(state.x).toBeLessThan(50);
      expect(state.x).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    it('should reset state to defaults', () => {
      camera.setState({ x: 100, y: 50, zoom: 2.0, rotate: 45 });
      camera.reset();
      const state = camera.getState();
      expect(state).toEqual({
        x: 0,
        y: 0,
        zoom: 1.0,
        rotate: 0,
      });
    });

    it('should clear animations', () => {
      camera.addAnimation({
        property: 'x',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      });
      camera.reset();
      expect(camera.getAnimations()).toHaveLength(0);
    });

    it('should reset container transform', () => {
      camera.setState({ x: 100, y: 50 });
      camera.reset();
      expect(container.style.transform).toBe('translate(0px, 0px) scale(1) rotate(0deg)');
    });
  });

  describe('getTransformMatrix', () => {
    it('should return identity matrix for default state', () => {
      const matrix = camera.getTransformMatrix();
      expect(matrix.a).toBe(1); // scale x
      expect(matrix.d).toBe(1); // scale y
      expect(Math.abs(matrix.e)).toBe(0); // translate x (handle -0)
      expect(Math.abs(matrix.f)).toBe(0); // translate y (handle -0)
    });

    it('should apply translation', () => {
      camera.setState({ x: 100, y: 50 });
      const matrix = camera.getTransformMatrix();
      expect(matrix.e).toBe(-100);
      expect(matrix.f).toBe(-50);
    });

    it('should apply zoom', () => {
      camera.setState({ zoom: 2.0 });
      const matrix = camera.getTransformMatrix();
      expect(matrix.a).toBe(2.0);
      expect(matrix.d).toBe(2.0);
    });

    it('should apply rotation', () => {
      camera.setState({ rotate: 90 });
      const matrix = camera.getTransformMatrix();
      // 90 degrees rotation should swap and negate axes
      expect(Math.abs(matrix.a)).toBeCloseTo(0, 5);
      expect(Math.abs(matrix.b)).toBeCloseTo(1, 5);
    });
  });

  describe('hasActiveAnimations', () => {
    it('should return false when no animations', () => {
      expect(camera.hasActiveAnimations(500)).toBe(false);
    });

    it('should return true during animation', () => {
      camera.addAnimation({
        property: 'x',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      });
      expect(camera.hasActiveAnimations(500)).toBe(true);
    });

    it('should return false before animation starts', () => {
      camera.addAnimation({
        property: 'x',
        from: 0,
        to: 100,
        startMs: 1000,
        endMs: 2000,
        easing: 'linear',
      });
      expect(camera.hasActiveAnimations(500)).toBe(false);
    });

    it('should return false after animation ends', () => {
      camera.addAnimation({
        property: 'x',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      });
      expect(camera.hasActiveAnimations(1500)).toBe(false);
    });
  });

  describe('clearAnimations', () => {
    it('should remove all animations', () => {
      camera.addAnimation({
        property: 'x',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
      });
      camera.clearAnimations();
      expect(camera.getAnimations()).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle zero duration animation', () => {
      camera.addAnimation({
        property: 'x',
        from: 0,
        to: 100,
        startMs: 500,
        endMs: 500,
        easing: 'linear',
      });
      camera.update(500);
      const state = camera.getState();
      expect(state.x).toBe(100); // Should jump to end value
    });

    it('should handle negative zoom', () => {
      camera.setState({ zoom: -1.0 });
      const state = camera.getState();
      expect(state.zoom).toBe(-1.0);
    });

    it('should handle large rotation values', () => {
      camera.setState({ rotate: 720 });
      const state = camera.getState();
      expect(state.rotate).toBe(720);
    });
  });
});
