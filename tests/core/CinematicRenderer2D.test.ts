/**
 * Basic tests for CinematicRenderer2D to verify the build system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CinematicRenderer2D } from '@/core/CinematicRenderer2D';
import type { CinematicSpec } from '@/types/CinematicSpec';

describe('CinematicRenderer2D', () => {
  let container: HTMLElement;
  let basicSpec: CinematicSpec;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    basicSpec = {
      schemaVersion: '1.0.0',
      engine: {
        targetFps: 60,
        quality: 'medium',
        debug: false,
      },
      events: [
        {
          id: 'test-event',
          name: 'Test Event',
          scenes: ['test-scene'],
        },
      ],
      scenes: [
        {
          id: 'test-scene',
          name: 'Test Scene',
          duration: 1000,
          layers: [
            {
              id: 'test-layer',
              type: 'gradient',
              zIndex: 1,
              config: {
                colors: ['#000000', '#ffffff'],
                direction: 'to bottom'
              }
            }
          ],
        },
      ],
    };
  });

  it('should create an instance with valid parameters', () => {
    expect(() => {
      new CinematicRenderer2D({
        container,
        spec: basicSpec,
      });
    }).not.toThrow();
  });

  it('should implement event system correctly', () => {
    const renderer = new CinematicRenderer2D({
      container,
      spec: basicSpec,
    });

    let callCount = 0;
    const callback = () => callCount++;

    renderer.on('test-event', callback);
    
    // Emit event using protected method (cast to access it)
    (renderer as any).emit('test-event');
    expect(callCount).toBe(1);

    renderer.off('test-event', callback);
    (renderer as any).emit('test-event');
    expect(callCount).toBe(1); // Should not increment
  });

  it('should return correct values for implemented methods', () => {
    const renderer = new CinematicRenderer2D({
      container,
      spec: basicSpec,
    });

    expect(renderer.getCurrentTime()).toBe(0);
    expect(renderer.getDuration()).toBe(1000); // Duration from test scene
    expect(renderer.isPlaying()).toBe(false);
    expect(renderer.isPaused()).toBe(false);
    expect(renderer.getCurrentEvent()).toBe(null);
    expect(renderer.getCurrentScene()).toBe(null);
  });

  it('should implement lifecycle methods correctly', async () => {
    const renderer = new CinematicRenderer2D({
      container,
      spec: basicSpec,
    });

    // Test mount
    await expect(renderer.mount()).resolves.not.toThrow();
    expect(renderer.isMounted()).toBe(true);

    // Test play
    expect(() => renderer.play()).not.toThrow();
    expect(renderer.isPlaying()).toBe(true);

    // Test pause
    expect(() => renderer.pause()).not.toThrow();
    expect(renderer.isPaused()).toBe(true);

    // Test stop
    expect(() => renderer.stop()).not.toThrow();
    expect(renderer.isPlaying()).toBe(false);
    expect(renderer.isPaused()).toBe(false);

    // Test destroy
    expect(() => renderer.destroy()).not.toThrow();
    expect(renderer.getState()).toBe('destroyed');
  });
});