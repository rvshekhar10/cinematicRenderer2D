/**
 * Property-based tests to verify the build system and infrastructure
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { CinematicRenderer2D } from '@/core/CinematicRenderer2D';
import type { CinematicSpec } from '@/types/CinematicSpec';

describe('Build System Infrastructure', () => {
  it('should handle various container elements', () => {
    fc.assert(fc.property(
      fc.constantFrom('div', 'section', 'main', 'article'),
      (tagName) => {
        const container = document.createElement(tagName);
        const basicSpec: CinematicSpec = {
          schemaVersion: '1.0.0',
          engine: { targetFps: 60 },
          events: [],
          scenes: [],
        };

        expect(() => {
          new CinematicRenderer2D({ container, spec: basicSpec });
        }).not.toThrow();
      }
    ), { numRuns: 50 });
  });

  it('should handle various schema versions', () => {
    fc.assert(fc.property(
      fc.constantFrom('1.0.0', '1.1.0', '2.0.0'),
      fc.integer({ min: 30, max: 120 }),
      (schemaVersion, targetFps) => {
        const container = document.createElement('div');
        const spec: CinematicSpec = {
          schemaVersion,
          engine: { targetFps },
          events: [],
          scenes: [],
        };

        const renderer = new CinematicRenderer2D({ container, spec });
        expect(renderer).toBeDefined();
        expect(renderer.getCurrentTime()).toBe(0);
      }
    ), { numRuns: 30 });
  });

  it('should maintain event listener consistency', () => {
    fc.assert(fc.property(
      fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
      (eventNames) => {
        const container = document.createElement('div');
        const spec: CinematicSpec = {
          schemaVersion: '1.0.0',
          engine: {},
          events: [],
          scenes: [],
        };

        const renderer = new CinematicRenderer2D({ container, spec });
        const callCounts = new Map<string, number>();

        // Register listeners
        eventNames.forEach(eventName => {
          callCounts.set(eventName, 0);
          const callback = () => {
            callCounts.set(eventName, callCounts.get(eventName)! + 1);
          };
          renderer.on(eventName, callback);
        });

        // Emit events
        eventNames.forEach(eventName => {
          (renderer as any).emit(eventName);
        });

        // Verify all events were called exactly once
        eventNames.forEach(eventName => {
          expect(callCounts.get(eventName)).toBe(1);
        });
      }
    ), { numRuns: 25 });
  });
});