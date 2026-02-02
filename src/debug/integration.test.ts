/**
 * Integration tests for debug system with CinematicRenderer2D
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CinematicRenderer2D } from '../core/CinematicRenderer2D';
import type { CinematicSpec } from '../types/CinematicSpec';

const testSpec: CinematicSpec = {
  schemaVersion: '1.0.0',
  engine: {
    targetFps: 60,
    quality: 'medium',
    debug: true,
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
      duration: 3000,
      layers: [
        {
          id: 'test-layer',
          type: 'gradient',
          zIndex: 0,
          config: {
            colors: ['#ff0000', '#0000ff'],
            direction: 'vertical',
          },
        },
      ],
    },
  ],
};

describe('Debug System Integration', () => {
  let container: HTMLElement;
  let renderer: CinematicRenderer2D;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (renderer) {
      renderer.destroy();
    }
    document.body.removeChild(container);
  });

  it('should create renderer with debug enabled', () => {
    renderer = new CinematicRenderer2D({
      container,
      spec: testSpec,
      debug: true,
    });

    expect(renderer.isDebugEnabled()).toBe(true);
  });

  it('should create renderer with debug disabled', () => {
    const specWithoutDebug = {
      ...testSpec,
      engine: {
        ...testSpec.engine,
        debug: false,
      },
    };

    renderer = new CinematicRenderer2D({
      container,
      spec: specWithoutDebug,
      debug: false,
    });

    expect(renderer.isDebugEnabled()).toBe(false);
  });

  it('should have debug methods available', () => {
    renderer = new CinematicRenderer2D({
      container,
      spec: testSpec,
      debug: true,
    });

    expect(typeof renderer.isDebugEnabled).toBe('function');
    expect(typeof renderer.toggleDebug).toBe('function');
    expect(typeof renderer.showDebug).toBe('function');
    expect(typeof renderer.hideDebug).toBe('function');
  });

  it('should create debug overlay when mounted with debug enabled', async () => {
    renderer = new CinematicRenderer2D({
      container,
      spec: testSpec,
      debug: true,
    });

    await renderer.mount();

    // Check if debug overlay exists in the container
    const debugOverlay = container.querySelector('.cinematic-debug-overlay');
    expect(debugOverlay).toBeTruthy();
  });

  it('should not create debug overlay when debug is disabled', async () => {
    const specWithoutDebug = {
      ...testSpec,
      engine: {
        ...testSpec.engine,
        debug: false,
      },
    };

    renderer = new CinematicRenderer2D({
      container,
      spec: specWithoutDebug,
      debug: false,
    });

    await renderer.mount();

    // Check that no debug overlay exists
    const debugOverlay = container.querySelector('.cinematic-debug-overlay');
    expect(debugOverlay).toBeFalsy();
  });

  it('should provide performance metrics for debug display', async () => {
    renderer = new CinematicRenderer2D({
      container,
      spec: testSpec,
      debug: true,
    });

    await renderer.mount();

    // Test performance metric methods
    expect(typeof renderer.getCurrentFps()).toBe('number');
    expect(typeof renderer.getPerformanceMetrics()).toBe('object');
    expect(typeof renderer.getQuality()).toBe('string');
    expect(typeof renderer.getCurrentTime()).toBe('number');
    expect(typeof renderer.getDuration()).toBe('number');
  });
});