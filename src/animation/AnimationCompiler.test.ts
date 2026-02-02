/**
 * Tests for AnimationCompiler
 * 
 * Tests comprehensive easing functions, interpolation for different value types,
 * and support for loops and yoyo effects. Includes both unit tests and property-based tests.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { AnimationCompiler } from './AnimationCompiler';
import type { AnimationTrackSpec, EasingType } from '../types/CinematicSpec';

describe('AnimationCompiler', () => {
  describe('compileTrack', () => {
    it('should compile a basic animation track', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const compiled = AnimationCompiler.compileTrack(track);

      expect(compiled.property).toBe('opacity');
      expect(compiled.startMs).toBe(0);
      expect(compiled.endMs).toBe(1000);
      expect(compiled.loop).toBe(false);
      expect(compiled.yoyo).toBe(false);
      expect(compiled.easingType).toBe('linear');
      expect(compiled.currentLoop).toBe(0);
      expect(compiled.isReverse).toBe(false);
      expect(typeof compiled.interpolate).toBe('function');
    });

    it('should compile animation track with loop and yoyo', () => {
      const track: AnimationTrackSpec = {
        property: 'transform.scale',
        from: 1,
        to: 2,
        startMs: 500,
        endMs: 1500,
        easing: 'ease-in-out',
        loop: true,
        yoyo: true
      };

      const compiled = AnimationCompiler.compileTrack(track);

      expect(compiled.loop).toBe(true);
      expect(compiled.yoyo).toBe(true);
      expect(compiled.easingType).toBe('ease-in-out');
    });

    it('should apply default values for optional properties', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000
      };

      const compiled = AnimationCompiler.compileTrack(track);

      expect(compiled.loop).toBe(false);
      expect(compiled.yoyo).toBe(false);
      expect(compiled.easingType).toBe('ease');
    });
  });

  describe('compileEasing', () => {
    describe('basic easing functions', () => {
      it('should compile linear easing', () => {
        const easing = AnimationCompiler.compileEasing('linear');
        
        expect(easing(0)).toBe(0);
        expect(easing(0.5)).toBe(0.5);
        expect(easing(1)).toBe(1);
      });

      it('should compile ease easing', () => {
        const easing = AnimationCompiler.compileEasing('ease');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
        expect(easing(0.5)).toBeGreaterThan(0);
        expect(easing(0.5)).toBeLessThan(1);
      });

      it('should compile ease-in easing', () => {
        const easing = AnimationCompiler.compileEasing('ease-in');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
        // Ease-in should start slow
        expect(easing(0.1)).toBeLessThan(0.1);
      });

      it('should compile ease-out easing', () => {
        const easing = AnimationCompiler.compileEasing('ease-out');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
        // Ease-out should end slow
        expect(easing(0.9)).toBeGreaterThan(0.9);
      });

      it('should compile ease-in-out easing', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-out');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
        expect(easing(0.5)).toBeGreaterThan(0);
        expect(easing(0.5)).toBeLessThan(1);
      });
    });

    describe('sine easing functions', () => {
      it('should compile ease-in-sine', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-sine');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBeCloseTo(1, 10);
        expect(easing(0.5)).toBeGreaterThan(0);
        expect(easing(0.5)).toBeLessThan(1);
      });

      it('should compile ease-out-sine', () => {
        const easing = AnimationCompiler.compileEasing('ease-out-sine');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });

      it('should compile ease-in-out-sine', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-out-sine');
        
        expect(easing(0)).toBeCloseTo(0, 10);
        expect(easing(1)).toBe(1);
      });
    });

    describe('quadratic easing functions', () => {
      it('should compile ease-in-quad', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-quad');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
        expect(easing(0.5)).toBe(0.25);
      });

      it('should compile ease-out-quad', () => {
        const easing = AnimationCompiler.compileEasing('ease-out-quad');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
        expect(easing(0.5)).toBe(0.75);
      });

      it('should compile ease-in-out-quad', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-out-quad');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
        expect(easing(0.5)).toBe(0.5);
      });
    });

    describe('cubic easing functions', () => {
      it('should compile ease-in-cubic', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-cubic');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
        expect(easing(0.5)).toBe(0.125);
      });

      it('should compile ease-out-cubic', () => {
        const easing = AnimationCompiler.compileEasing('ease-out-cubic');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
        expect(easing(0.5)).toBe(0.875);
      });

      it('should compile ease-in-out-cubic', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-out-cubic');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
        expect(easing(0.5)).toBe(0.5);
      });
    });

    describe('exponential easing functions', () => {
      it('should compile ease-in-expo', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-expo');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });

      it('should compile ease-out-expo', () => {
        const easing = AnimationCompiler.compileEasing('ease-out-expo');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });

      it('should compile ease-in-out-expo', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-out-expo');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });
    });

    describe('circular easing functions', () => {
      it('should compile ease-in-circ', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-circ');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });

      it('should compile ease-out-circ', () => {
        const easing = AnimationCompiler.compileEasing('ease-out-circ');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });

      it('should compile ease-in-out-circ', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-out-circ');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });
    });

    describe('back easing functions', () => {
      it('should compile ease-in-back', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-back');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBeCloseTo(1, 10);
        // Back easing can go negative
        expect(easing(0.1)).toBeLessThan(0);
      });

      it('should compile ease-out-back', () => {
        const easing = AnimationCompiler.compileEasing('ease-out-back');
        
        expect(easing(0)).toBeCloseTo(0, 10);
        expect(easing(1)).toBe(1);
        // Back easing can overshoot
        expect(easing(0.9)).toBeGreaterThan(1);
      });

      it('should compile ease-in-out-back', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-out-back');
        
        expect(easing(0)).toBeCloseTo(0, 10);
        expect(easing(1)).toBe(1);
      });
    });

    describe('elastic easing functions', () => {
      it('should compile ease-in-elastic', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-elastic');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });

      it('should compile ease-out-elastic', () => {
        const easing = AnimationCompiler.compileEasing('ease-out-elastic');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });

      it('should compile ease-in-out-elastic', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-out-elastic');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });
    });

    describe('bounce easing functions', () => {
      it('should compile ease-in-bounce', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-bounce');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });

      it('should compile ease-out-bounce', () => {
        const easing = AnimationCompiler.compileEasing('ease-out-bounce');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });

      it('should compile ease-in-out-bounce', () => {
        const easing = AnimationCompiler.compileEasing('ease-in-out-bounce');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });
    });

    describe('cubic-bezier easing functions', () => {
      it('should compile valid cubic-bezier function', () => {
        const easing = AnimationCompiler.compileEasing('cubic-bezier(0.25,0.1,0.25,1)');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
        expect(easing(0.5)).toBeGreaterThan(0);
        expect(easing(0.5)).toBeLessThan(1);
      });

      it('should handle cubic-bezier with spaces', () => {
        const easing = AnimationCompiler.compileEasing('cubic-bezier(0.25, 0.1, 0.25, 1)');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });

      it('should fallback to ease for invalid cubic-bezier', () => {
        const easing = AnimationCompiler.compileEasing('cubic-bezier(invalid)');
        
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });
    });

    it('should fallback to ease for unknown easing types', () => {
      const easing = AnimationCompiler.compileEasing('unknown-easing' as EasingType);
      
      expect(easing(0)).toBe(0);
      expect(easing(1)).toBe(1);
    });
  });

  describe('interpolation', () => {
    describe('number interpolation', () => {
      it('should interpolate between numbers', () => {
        const track: AnimationTrackSpec = {
          property: 'opacity',
          from: 0,
          to: 100,
          startMs: 0,
          endMs: 1000,
          easing: 'linear'
        };

        const compiled = AnimationCompiler.compileTrack(track);

        expect(compiled.interpolate(0)).toBe(0);
        expect(compiled.interpolate(0.5)).toBe(50);
        expect(compiled.interpolate(1)).toBe(100);
      });

      it('should handle negative numbers', () => {
        const track: AnimationTrackSpec = {
          property: 'transform.x',
          from: -50,
          to: 50,
          startMs: 0,
          endMs: 1000,
          easing: 'linear'
        };

        const compiled = AnimationCompiler.compileTrack(track);

        expect(compiled.interpolate(0)).toBe(-50);
        expect(compiled.interpolate(0.5)).toBe(0);
        expect(compiled.interpolate(1)).toBe(50);
      });

      it('should handle decimal numbers', () => {
        const track: AnimationTrackSpec = {
          property: 'opacity',
          from: 0.1,
          to: 0.9,
          startMs: 0,
          endMs: 1000,
          easing: 'linear'
        };

        const compiled = AnimationCompiler.compileTrack(track);

        expect(compiled.interpolate(0)).toBeCloseTo(0.1);
        expect(compiled.interpolate(0.5)).toBeCloseTo(0.5);
        expect(compiled.interpolate(1)).toBeCloseTo(0.9);
      });
    });

    describe('string interpolation', () => {
      it('should interpolate numeric strings with units', () => {
        const track: AnimationTrackSpec = {
          property: 'width',
          from: '100px',
          to: '200px',
          startMs: 0,
          endMs: 1000,
          easing: 'linear'
        };

        const compiled = AnimationCompiler.compileTrack(track);

        expect(compiled.interpolate(0)).toBe('100px');
        expect(compiled.interpolate(0.5)).toBe('150px');
        expect(compiled.interpolate(1)).toBe('200px');
      });

      it('should interpolate percentage values', () => {
        const track: AnimationTrackSpec = {
          property: 'width',
          from: '0%',
          to: '100%',
          startMs: 0,
          endMs: 1000,
          easing: 'linear'
        };

        const compiled = AnimationCompiler.compileTrack(track);

        expect(compiled.interpolate(0)).toBe('0%');
        expect(compiled.interpolate(0.5)).toBe('50%');
        expect(compiled.interpolate(1)).toBe('100%');
      });

      it('should handle decimal values in strings', () => {
        const track: AnimationTrackSpec = {
          property: 'fontSize',
          from: '1.2em',
          to: '2.4em',
          startMs: 0,
          endMs: 1000,
          easing: 'linear'
        };

        const compiled = AnimationCompiler.compileTrack(track);

        expect(compiled.interpolate(0)).toBe('1.2em');
        expect(compiled.interpolate(0.5)).toBe('1.8em');
        expect(compiled.interpolate(1)).toBe('2.4em');
      });

      it('should use discrete transition for non-numeric strings', () => {
        const track: AnimationTrackSpec = {
          property: 'color',
          from: 'red',
          to: 'blue',
          startMs: 0,
          endMs: 1000,
          easing: 'linear'
        };

        const compiled = AnimationCompiler.compileTrack(track);

        expect(compiled.interpolate(0)).toBe('red');
        expect(compiled.interpolate(0.4)).toBe('red');
        expect(compiled.interpolate(0.6)).toBe('blue');
        expect(compiled.interpolate(1)).toBe('blue');
      });
    });

    describe('boolean interpolation', () => {
      it('should use discrete transition for booleans', () => {
        const track: AnimationTrackSpec = {
          property: 'visible',
          from: false,
          to: true,
          startMs: 0,
          endMs: 1000,
          easing: 'linear'
        };

        const compiled = AnimationCompiler.compileTrack(track);

        expect(compiled.interpolate(0)).toBe(false);
        expect(compiled.interpolate(0.4)).toBe(false);
        expect(compiled.interpolate(0.6)).toBe(true);
        expect(compiled.interpolate(1)).toBe(true);
      });
    });

    describe('object interpolation', () => {
      it('should interpolate object properties', () => {
        const track: AnimationTrackSpec = {
          property: 'transform',
          from: { x: 0, y: 0, scale: 1 },
          to: { x: 100, y: 50, scale: 2 },
          startMs: 0,
          endMs: 1000,
          easing: 'linear'
        };

        const compiled = AnimationCompiler.compileTrack(track);

        const result0 = compiled.interpolate(0);
        expect(result0.x).toBe(0);
        expect(result0.y).toBe(0);
        expect(result0.scale).toBe(1);

        const result05 = compiled.interpolate(0.5);
        expect(result05.x).toBe(50);
        expect(result05.y).toBe(25);
        expect(result05.scale).toBe(1.5);

        const result1 = compiled.interpolate(1);
        expect(result1.x).toBe(100);
        expect(result1.y).toBe(50);
        expect(result1.scale).toBe(2);
      });

      it('should handle missing properties in objects', () => {
        const track: AnimationTrackSpec = {
          property: 'transform',
          from: { x: 0, y: 0 },
          to: { x: 100, z: 50 },
          startMs: 0,
          endMs: 1000,
          easing: 'linear'
        };

        const compiled = AnimationCompiler.compileTrack(track);

        const result0 = compiled.interpolate(0);
        expect(result0.x).toBe(0);
        expect(result0.y).toBe(0);
        expect(result0.z).toBeUndefined();

        const result1 = compiled.interpolate(1);
        expect(result1.x).toBe(100);
        expect(result1.y).toBe(0); // Kept from 'from' object
        expect(result1.z).toBe(50);
      });

      it('should handle mixed property types in objects', () => {
        const track: AnimationTrackSpec = {
          property: 'style',
          from: { opacity: 0, color: 'red', visible: false },
          to: { opacity: 1, color: 'blue', visible: true },
          startMs: 0,
          endMs: 1000,
          easing: 'linear'
        };

        const compiled = AnimationCompiler.compileTrack(track);

        const result0 = compiled.interpolate(0);
        expect(result0.opacity).toBe(0);
        expect(result0.color).toBe('red');
        expect(result0.visible).toBe(false);

        const result05 = compiled.interpolate(0.5);
        expect(result05.opacity).toBe(0.5);
        expect(result05.color).toBe('blue'); // Discrete transition
        expect(result05.visible).toBe(true); // Discrete transition

        const result1 = compiled.interpolate(1);
        expect(result1.opacity).toBe(1);
        expect(result1.color).toBe('blue');
        expect(result1.visible).toBe(true);
      });
    });

    describe('type mismatch handling', () => {
      it('should use discrete transition for mismatched types', () => {
        const track: AnimationTrackSpec = {
          property: 'value',
          from: 100,
          to: 'auto',
          startMs: 0,
          endMs: 1000,
          easing: 'linear'
        };

        const compiled = AnimationCompiler.compileTrack(track);

        expect(compiled.interpolate(0)).toBe(100);
        expect(compiled.interpolate(0.4)).toBe(100);
        expect(compiled.interpolate(0.6)).toBe('auto');
        expect(compiled.interpolate(1)).toBe('auto');
      });
    });
  });

  describe('easing with interpolation', () => {
    it('should apply easing to number interpolation', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'ease-in-quad'
      };

      const compiled = AnimationCompiler.compileTrack(track);

      expect(compiled.interpolate(0)).toBe(0);
      expect(compiled.interpolate(0.5)).toBe(25); // 0.5^2 * 100 = 25
      expect(compiled.interpolate(1)).toBe(100);
    });

    it('should apply easing to string interpolation', () => {
      const track: AnimationTrackSpec = {
        property: 'width',
        from: '0px',
        to: '100px',
        startMs: 0,
        endMs: 1000,
        easing: 'ease-in-quad'
      };

      const compiled = AnimationCompiler.compileTrack(track);

      expect(compiled.interpolate(0)).toBe('0px');
      expect(compiled.interpolate(0.5)).toBe('25px'); // 0.5^2 * 100 = 25
      expect(compiled.interpolate(1)).toBe('100px');
    });
  });

  describe('property-based tests', () => {
    it('should always return values within expected bounds for number interpolation', () => {
      fc.assert(fc.property(
        fc.float({ min: -1000, max: 1000, noNaN: true }),
        fc.float({ min: -1000, max: 1000, noNaN: true }),
        fc.float({ min: 0, max: 1, noNaN: true }),
        (from, to, progress) => {
          const track: AnimationTrackSpec = {
            property: 'test',
            from,
            to,
            startMs: 0,
            endMs: 1000,
            easing: 'linear'
          };

          const compiled = AnimationCompiler.compileTrack(track);
          const result = compiled.interpolate(progress);

          const min = Math.min(from, to);
          const max = Math.max(from, to);
          
          expect(typeof result).toBe('number');
          expect(result).toBeGreaterThanOrEqual(min - 1e-10); // Allow small floating point error
          expect(result).toBeLessThanOrEqual(max + 1e-10); // Allow small floating point error
        }
      ), { numRuns: 100 });
    });

    it('should always start and end at correct values', () => {
      fc.assert(fc.property(
        fc.oneof(
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.string(),
          fc.boolean()
        ),
        fc.oneof(
          fc.float({ min: -1000, max: 1000, noNaN: true }),
          fc.string(),
          fc.boolean()
        ),
        fc.constantFrom('linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'),
        (from, to, easing) => {
          const track: AnimationTrackSpec = {
            property: 'test',
            from,
            to,
            startMs: 0,
            endMs: 1000,
            easing: easing as EasingType
          };

          const compiled = AnimationCompiler.compileTrack(track);

          const startResult = compiled.interpolate(0);
          const endResult = compiled.interpolate(1);
          
          // Handle floating point precision for numbers
          if (typeof from === 'number' && typeof startResult === 'number') {
            expect(startResult).toBeCloseTo(from, 10);
          } else {
            expect(startResult).toEqual(from);
          }
          
          if (typeof to === 'number' && typeof endResult === 'number') {
            expect(endResult).toBeCloseTo(to, 10);
          } else {
            expect(endResult).toEqual(to);
          }
        }
      ), { numRuns: 100 });
    });

    it('should handle all easing functions without throwing', () => {
      const easingTypes: EasingType[] = [
        'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out',
        'ease-in-sine', 'ease-out-sine', 'ease-in-out-sine',
        'ease-in-quad', 'ease-out-quad', 'ease-in-out-quad',
        'ease-in-cubic', 'ease-out-cubic', 'ease-in-out-cubic',
        'ease-in-quart', 'ease-out-quart', 'ease-in-out-quart',
        'ease-in-quint', 'ease-out-quint', 'ease-in-out-quint',
        'ease-in-expo', 'ease-out-expo', 'ease-in-out-expo',
        'ease-in-circ', 'ease-out-circ', 'ease-in-out-circ',
        'ease-in-back', 'ease-out-back', 'ease-in-out-back',
        'ease-in-elastic', 'ease-out-elastic', 'ease-in-out-elastic',
        'ease-in-bounce', 'ease-out-bounce', 'ease-in-out-bounce'
      ];

      fc.assert(fc.property(
        fc.constantFrom(...easingTypes),
        fc.float({ min: 0, max: 1, noNaN: true }),
        (easing, progress) => {
          expect(() => {
            const easingFunction = AnimationCompiler.compileEasing(easing);
            const result = easingFunction(progress);
            expect(typeof result).toBe('number');
            expect(isFinite(result)).toBe(true);
          }).not.toThrow();
        }
      ), { numRuns: 200 });
    });

    it('should produce monotonic results for monotonic easing functions', () => {
      const monotonicEasings: EasingType[] = [
        'linear', 'ease-in', 'ease-out', 'ease-in-out',
        'ease-in-sine', 'ease-out-sine', 'ease-in-out-sine',
        'ease-in-quad', 'ease-out-quad', 'ease-in-out-quad',
        'ease-in-cubic', 'ease-out-cubic', 'ease-in-out-cubic',
        'ease-in-quart', 'ease-out-quart', 'ease-in-out-quart',
        'ease-in-quint', 'ease-out-quint', 'ease-in-out-quint',
        'ease-in-expo', 'ease-out-expo', 'ease-in-out-expo',
        'ease-in-circ', 'ease-out-circ', 'ease-in-out-circ'
      ];

      fc.assert(fc.property(
        fc.constantFrom(...monotonicEasings),
        (easing) => {
          const easingFunction = AnimationCompiler.compileEasing(easing);
          
          // Test monotonicity with a series of increasing values
          const values = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
          const results = values.map(v => easingFunction(v));
          
          for (let i = 1; i < results.length; i++) {
            expect(results[i]).toBeGreaterThanOrEqual(results[i - 1]);
          }
        }
      ), { numRuns: 50 });
    });
  });
});