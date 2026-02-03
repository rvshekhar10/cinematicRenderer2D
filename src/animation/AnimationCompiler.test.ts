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

  describe('calculateProgress', () => {
    it('should return null before animation starts', () => {
      const track = AnimationCompiler.compileTrack({
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 1000,
        endMs: 2000,
        easing: 'linear'
      });

      const progress = AnimationCompiler.calculateProgress(track, 500);
      expect(progress).toBeNull();
    });

    it('should return progress between 0 and 1 during animation', () => {
      const track = AnimationCompiler.compileTrack({
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      });

      expect(AnimationCompiler.calculateProgress(track, 0)).toBe(0);
      expect(AnimationCompiler.calculateProgress(track, 250)).toBe(0.25);
      expect(AnimationCompiler.calculateProgress(track, 500)).toBe(0.5);
      expect(AnimationCompiler.calculateProgress(track, 750)).toBe(0.75);
      expect(AnimationCompiler.calculateProgress(track, 1000)).toBe(1);
    });

    it('should return null after non-looping animation completes', () => {
      const track = AnimationCompiler.compileTrack({
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        loop: false
      });

      const progress = AnimationCompiler.calculateProgress(track, 1500);
      expect(progress).toBeNull();
    });

    it('should restart from beginning when loop is enabled', () => {
      const track = AnimationCompiler.compileTrack({
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        loop: true
      });

      // First loop
      expect(AnimationCompiler.calculateProgress(track, 0)).toBe(0);
      expect(AnimationCompiler.calculateProgress(track, 500)).toBe(0.5);
      expect(AnimationCompiler.calculateProgress(track, 1000)).toBe(0);
      
      // Second loop
      expect(AnimationCompiler.calculateProgress(track, 1500)).toBe(0.5);
      expect(AnimationCompiler.calculateProgress(track, 2000)).toBe(0);
      
      // Third loop
      expect(AnimationCompiler.calculateProgress(track, 2500)).toBe(0.5);
    });

    it('should reverse direction on each loop when yoyo is enabled', () => {
      const track = AnimationCompiler.compileTrack({
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        loop: true,
        yoyo: true
      });

      // First loop (forward)
      expect(AnimationCompiler.calculateProgress(track, 0)).toBe(0);
      expect(AnimationCompiler.calculateProgress(track, 500)).toBe(0.5);
      expect(AnimationCompiler.calculateProgress(track, 999)).toBeCloseTo(0.999, 2); // Near end of first loop
      
      // At exactly 1000ms, we're at the start of the second loop (reverse)
      expect(AnimationCompiler.calculateProgress(track, 1000)).toBe(1); // Reversed: 1 - 0 = 1
      expect(track.isReverse).toBe(true);
      
      // Second loop (reverse)
      expect(AnimationCompiler.calculateProgress(track, 1500)).toBe(0.5); // Reversed: 1 - 0.5 = 0.5
      expect(AnimationCompiler.calculateProgress(track, 1999)).toBeCloseTo(0.001, 2); // Reversed: 1 - 0.999 = 0.001
      expect(track.isReverse).toBe(true);
      
      // At exactly 2000ms, we're at the start of the third loop (forward again)
      expect(AnimationCompiler.calculateProgress(track, 2000)).toBe(0);
      expect(track.isReverse).toBe(false);
      
      // Third loop (forward again)
      expect(AnimationCompiler.calculateProgress(track, 2500)).toBe(0.5);
      expect(track.isReverse).toBe(false);
    });

    it('should update currentLoop counter', () => {
      const track = AnimationCompiler.compileTrack({
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        loop: true
      });

      AnimationCompiler.calculateProgress(track, 500);
      expect(track.currentLoop).toBe(0);
      
      AnimationCompiler.calculateProgress(track, 1500);
      expect(track.currentLoop).toBe(1);
      
      AnimationCompiler.calculateProgress(track, 2500);
      expect(track.currentLoop).toBe(2);
    });
  });

  describe('applyAnimation', () => {
    it('should return null before animation starts', () => {
      const track = AnimationCompiler.compileTrack({
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 1000,
        endMs: 2000,
        easing: 'linear'
      });

      const value = AnimationCompiler.applyAnimation(track, 500);
      expect(value).toBeNull();
    });

    it('should return interpolated value during animation', () => {
      const track = AnimationCompiler.compileTrack({
        property: 'opacity',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      });

      expect(AnimationCompiler.applyAnimation(track, 0)).toBe(0);
      expect(AnimationCompiler.applyAnimation(track, 250)).toBe(25);
      expect(AnimationCompiler.applyAnimation(track, 500)).toBe(50);
      expect(AnimationCompiler.applyAnimation(track, 750)).toBe(75);
      expect(AnimationCompiler.applyAnimation(track, 1000)).toBe(100);
    });

    it('should return null after non-looping animation completes', () => {
      const track = AnimationCompiler.compileTrack({
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        loop: false
      });

      const value = AnimationCompiler.applyAnimation(track, 1500);
      expect(value).toBeNull();
    });

    it('should loop animation values when loop is enabled', () => {
      const track = AnimationCompiler.compileTrack({
        property: 'opacity',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        loop: true
      });

      // First loop
      expect(AnimationCompiler.applyAnimation(track, 500)).toBe(50);
      
      // Second loop
      expect(AnimationCompiler.applyAnimation(track, 1500)).toBe(50);
      
      // Third loop
      expect(AnimationCompiler.applyAnimation(track, 2500)).toBe(50);
    });

    it('should reverse animation values when yoyo is enabled', () => {
      const track = AnimationCompiler.compileTrack({
        property: 'opacity',
        from: 0,
        to: 100,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        loop: true,
        yoyo: true
      });

      // First loop (forward): 0 -> 100
      expect(AnimationCompiler.applyAnimation(track, 500)).toBe(50);
      
      // Second loop (reverse): 100 -> 0
      expect(AnimationCompiler.applyAnimation(track, 1500)).toBe(50);
      
      // Third loop (forward): 0 -> 100
      expect(AnimationCompiler.applyAnimation(track, 2500)).toBe(50);
    });
  });

  describe('isAnimationActive', () => {
    it('should return false before animation starts', () => {
      const track = AnimationCompiler.compileTrack({
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 1000,
        endMs: 2000,
        easing: 'linear'
      });

      expect(AnimationCompiler.isAnimationActive(track, 500)).toBe(false);
    });

    it('should return true during animation', () => {
      const track = AnimationCompiler.compileTrack({
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      });

      expect(AnimationCompiler.isAnimationActive(track, 0)).toBe(true);
      expect(AnimationCompiler.isAnimationActive(track, 500)).toBe(true);
      expect(AnimationCompiler.isAnimationActive(track, 1000)).toBe(true);
    });

    it('should return false after non-looping animation completes', () => {
      const track = AnimationCompiler.compileTrack({
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        loop: false
      });

      expect(AnimationCompiler.isAnimationActive(track, 1500)).toBe(false);
    });

    it('should return true indefinitely for looping animations', () => {
      const track = AnimationCompiler.compileTrack({
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        loop: true
      });

      expect(AnimationCompiler.isAnimationActive(track, 1500)).toBe(true);
      expect(AnimationCompiler.isAnimationActive(track, 5000)).toBe(true);
      expect(AnimationCompiler.isAnimationActive(track, 10000)).toBe(true);
    });
  });
});

describe('Keyframe Animations', () => {
  describe('compileKeyframeTrack', () => {
    it('should compile a basic keyframe animation', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.5, value: 0.8 },
          { time: 1, value: 1 }
        ]
      };

      const compiled = AnimationCompiler.compileTrack(track);

      expect(compiled.property).toBe('opacity');
      expect(compiled.keyframeSegments).toBeDefined();
      expect(compiled.keyframeSegments?.length).toBe(2);
    });

    it('should interpolate through keyframes correctly', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.5, value: 0.8 },
          { time: 1, value: 1 }
        ]
      };

      const compiled = AnimationCompiler.compileTrack(track);

      // At time 0, should be at first keyframe
      expect(compiled.interpolate(0)).toBe(0);
      
      // At time 0.25, should be halfway between 0 and 0.8
      expect(compiled.interpolate(0.25)).toBeCloseTo(0.4, 5);
      
      // At time 0.5, should be at second keyframe
      expect(compiled.interpolate(0.5)).toBeCloseTo(0.8, 5);
      
      // At time 0.75, should be halfway between 0.8 and 1
      expect(compiled.interpolate(0.75)).toBeCloseTo(0.9, 5);
      
      // At time 1, should be at last keyframe
      expect(compiled.interpolate(1)).toBe(1);
    });

    it('should add implicit keyframes at 0 and 1 if missing', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        keyframes: [
          { time: 0.5, value: 0.5 }
        ]
      };

      const compiled = AnimationCompiler.compileTrack(track);

      expect(compiled.interpolate(0)).toBe(0); // Uses from value
      expect(compiled.interpolate(0.5)).toBeCloseTo(0.5, 5);
      expect(compiled.interpolate(1)).toBe(1); // Uses to value
    });

    it('should support per-keyframe easing', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        keyframes: [
          { time: 0, value: 0, easing: 'ease-in-quad' },
          { time: 0.5, value: 0.5, easing: 'ease-out-quad' },
          { time: 1, value: 1 }
        ]
      };

      const compiled = AnimationCompiler.compileTrack(track);

      // First segment uses ease-in-quad
      const firstSegmentMid = compiled.interpolate(0.25);
      expect(firstSegmentMid).toBeLessThan(0.25); // ease-in starts slow
      
      // Second segment uses ease-out-quad
      const secondSegmentMid = compiled.interpolate(0.75);
      expect(secondSegmentMid).toBeGreaterThan(0.75); // ease-out ends slow
    });

    it('should handle string values in keyframes', () => {
      const track: AnimationTrackSpec = {
        property: 'width',
        from: '0px',
        to: '100px',
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        keyframes: [
          { time: 0, value: '0px' },
          { time: 0.5, value: '80px' },
          { time: 1, value: '100px' }
        ]
      };

      const compiled = AnimationCompiler.compileTrack(track);

      expect(compiled.interpolate(0)).toBe('0px');
      expect(compiled.interpolate(0.25)).toBe('40px');
      expect(compiled.interpolate(0.5)).toBe('80px');
      expect(compiled.interpolate(0.75)).toBe('90px');
      expect(compiled.interpolate(1)).toBe('100px');
    });

    it('should handle object values in keyframes', () => {
      const track: AnimationTrackSpec = {
        property: 'transform',
        from: { x: 0, y: 0 },
        to: { x: 100, y: 100 },
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        keyframes: [
          { time: 0, value: { x: 0, y: 0 } },
          { time: 0.5, value: { x: 80, y: 20 } },
          { time: 1, value: { x: 100, y: 100 } }
        ]
      };

      const compiled = AnimationCompiler.compileTrack(track);

      const result0 = compiled.interpolate(0);
      expect(result0.x).toBe(0);
      expect(result0.y).toBe(0);

      const result025 = compiled.interpolate(0.25);
      expect(result025.x).toBeCloseTo(40, 5);
      expect(result025.y).toBeCloseTo(10, 5);

      const result05 = compiled.interpolate(0.5);
      expect(result05.x).toBeCloseTo(80, 5);
      expect(result05.y).toBeCloseTo(20, 5);

      const result075 = compiled.interpolate(0.75);
      expect(result075.x).toBeCloseTo(90, 5);
      expect(result075.y).toBeCloseTo(60, 5);

      const result1 = compiled.interpolate(1);
      expect(result1.x).toBe(100);
      expect(result1.y).toBe(100);
    });

    it('should throw error for keyframe times outside [0, 1]', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        keyframes: [
          { time: -0.1, value: 0 },
          { time: 0.5, value: 0.5 },
          { time: 1, value: 1 }
        ]
      };

      expect(() => AnimationCompiler.compileTrack(track)).toThrow();
    });

    it('should sort keyframes by time', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        keyframes: [
          { time: 1, value: 1 },
          { time: 0, value: 0 },
          { time: 0.5, value: 0.5 }
        ]
      };

      const compiled = AnimationCompiler.compileTrack(track);

      expect(compiled.interpolate(0)).toBe(0);
      expect(compiled.interpolate(0.5)).toBeCloseTo(0.5, 5);
      expect(compiled.interpolate(1)).toBe(1);
    });

    it('should work with loop and yoyo', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        loop: true,
        yoyo: true,
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.5, value: 0.8 },
          { time: 1, value: 1 }
        ]
      };

      const compiled = AnimationCompiler.compileTrack(track);

      // First loop (forward): at 250ms (25% of duration), progress is 0.25
      // At progress 0.25, we're halfway between keyframe 0 (value 0) and keyframe 0.5 (value 0.8)
      // So value should be 0.4
      expect(AnimationCompiler.applyAnimation(compiled, 250)).toBeCloseTo(0.4, 5);
      
      // At 500ms (50% of duration), progress is 0.5, which is exactly at keyframe 0.5
      expect(AnimationCompiler.applyAnimation(compiled, 500)).toBeCloseTo(0.8, 5);
      
      // Second loop (reverse): at 1250ms, we're 250ms into the second loop
      // With yoyo, progress is reversed: 1 - 0.25 = 0.75
      // At progress 0.75, we're halfway between keyframe 0.5 (value 0.8) and keyframe 1 (value 1)
      // So value should be 0.9
      expect(AnimationCompiler.applyAnimation(compiled, 1250)).toBeCloseTo(0.9, 5);
      
      // At 1500ms, we're 500ms into the second loop
      // With yoyo, progress is reversed: 1 - 0.5 = 0.5
      // At progress 0.5, we're at keyframe 0.5 (value 0.8)
      expect(AnimationCompiler.applyAnimation(compiled, 1500)).toBeCloseTo(0.8, 5);
    });

    it('should handle multiple keyframes with different easing', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        keyframes: [
          { time: 0, value: 0, easing: 'ease-in' },
          { time: 0.33, value: 0.3, easing: 'linear' },
          { time: 0.66, value: 0.6, easing: 'ease-out' },
          { time: 1, value: 1 }
        ]
      };

      const compiled = AnimationCompiler.compileTrack(track);

      // Should interpolate through all keyframes
      expect(compiled.interpolate(0)).toBe(0);
      expect(compiled.interpolate(0.33)).toBeCloseTo(0.3, 5);
      expect(compiled.interpolate(0.66)).toBeCloseTo(0.6, 5);
      expect(compiled.interpolate(1)).toBe(1);
    });
  });

  describe('keyframe property-based tests', () => {
    it('should always interpolate within bounds for keyframe animations', () => {
      fc.assert(fc.property(
        fc.array(
          fc.record({
            time: fc.float({ min: 0, max: 1, noNaN: true }),
            value: fc.float({ min: 0, max: 100, noNaN: true })
          }),
          { minLength: 2, maxLength: 5 }
        ),
        fc.float({ min: 0, max: 1, noNaN: true }),
        (keyframes, progress) => {
          // Ensure keyframes are sorted and have 0 and 1
          const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
          if (sortedKeyframes[0]!.time !== 0) {
            sortedKeyframes.unshift({ time: 0, value: 0 });
          }
          if (sortedKeyframes[sortedKeyframes.length - 1]!.time !== 1) {
            sortedKeyframes.push({ time: 1, value: 100 });
          }

          const track: AnimationTrackSpec = {
            property: 'test',
            from: 0,
            to: 100,
            startMs: 0,
            endMs: 1000,
            easing: 'linear',
            keyframes: sortedKeyframes
          };

          const compiled = AnimationCompiler.compileTrack(track);
          const result = compiled.interpolate(progress);

          expect(typeof result).toBe('number');
          expect(result).toBeGreaterThanOrEqual(-1); // Allow small overshoot
          expect(result).toBeLessThanOrEqual(101); // Allow small overshoot
        }
      ), { numRuns: 100 });
    });

    it('should always start and end at correct keyframe values', () => {
      fc.assert(fc.property(
        fc.array(
          fc.record({
            time: fc.float({ min: Math.fround(0.1), max: Math.fround(0.9), noNaN: true }),
            value: fc.float({ min: 0, max: 100, noNaN: true })
          }),
          { minLength: 1, maxLength: 3 }
        ),
        (keyframes) => {
          const track: AnimationTrackSpec = {
            property: 'test',
            from: 0,
            to: 100,
            startMs: 0,
            endMs: 1000,
            easing: 'linear',
            keyframes
          };

          const compiled = AnimationCompiler.compileTrack(track);

          expect(compiled.interpolate(0)).toBe(0);
          expect(compiled.interpolate(1)).toBe(100);
        }
      ), { numRuns: 100 });
    });
  });
});

describe('Stagger Effects', () => {
  describe('generateStaggeredAnimations', () => {
    it('should generate staggered animations from start', () => {
      const baseTrack: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const stagger: StaggerConfig = {
        amount: 100,
        from: 'start'
      };

      const tracks = AnimationCompiler.generateStaggeredAnimations(baseTrack, 3, stagger);

      expect(tracks.length).toBe(3);
      expect(tracks[0]!.startMs).toBe(0);
      expect(tracks[0]!.endMs).toBe(1000);
      expect(tracks[1]!.startMs).toBe(100);
      expect(tracks[1]!.endMs).toBe(1100);
      expect(tracks[2]!.startMs).toBe(200);
      expect(tracks[2]!.endMs).toBe(1200);
    });

    it('should generate staggered animations from end', () => {
      const baseTrack: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const stagger: StaggerConfig = {
        amount: 100,
        from: 'end'
      };

      const tracks = AnimationCompiler.generateStaggeredAnimations(baseTrack, 3, stagger);

      expect(tracks.length).toBe(3);
      expect(tracks[0]!.startMs).toBe(200);
      expect(tracks[0]!.endMs).toBe(1200);
      expect(tracks[1]!.startMs).toBe(100);
      expect(tracks[1]!.endMs).toBe(1100);
      expect(tracks[2]!.startMs).toBe(0);
      expect(tracks[2]!.endMs).toBe(1000);
    });

    it('should generate staggered animations from center', () => {
      const baseTrack: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const stagger: StaggerConfig = {
        amount: 100,
        from: 'center'
      };

      const tracks = AnimationCompiler.generateStaggeredAnimations(baseTrack, 5, stagger);

      expect(tracks.length).toBe(5);
      // Center item (index 2) should start first
      expect(tracks[2]!.startMs).toBe(0);
      // Items 1 and 3 should be offset by 100ms
      expect(tracks[1]!.startMs).toBe(100);
      expect(tracks[3]!.startMs).toBe(100);
      // Items 0 and 4 should be offset by 200ms
      expect(tracks[0]!.startMs).toBe(200);
      expect(tracks[4]!.startMs).toBe(200);
    });

    it('should handle grid-based stagger from start', () => {
      const baseTrack: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const stagger: StaggerConfig = {
        amount: 50,
        from: 'start',
        grid: [3, 2] // 3 columns, 2 rows
      };

      const tracks = AnimationCompiler.generateStaggeredAnimations(baseTrack, 6, stagger);

      expect(tracks.length).toBe(6);
      // First row
      expect(tracks[0]!.startMs).toBe(0);   // (0,0)
      expect(tracks[1]!.startMs).toBe(50);  // (1,0)
      expect(tracks[2]!.startMs).toBe(100); // (2,0)
      // Second row
      expect(tracks[3]!.startMs).toBe(150); // (0,1)
      expect(tracks[4]!.startMs).toBe(200); // (1,1)
      expect(tracks[5]!.startMs).toBe(250); // (2,1)
    });

    it('should handle grid-based stagger from center', () => {
      const baseTrack: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const stagger: StaggerConfig = {
        amount: 50,
        from: 'center',
        grid: [3, 3] // 3x3 grid
      };

      const tracks = AnimationCompiler.generateStaggeredAnimations(baseTrack, 9, stagger);

      expect(tracks.length).toBe(9);
      // Center item (index 4) should start first (distance 0)
      expect(tracks[4]!.startMs).toBe(0);
      // Adjacent items should have similar offsets
      expect(tracks[1]!.startMs).toBeGreaterThan(0);
      expect(tracks[3]!.startMs).toBeGreaterThan(0);
      expect(tracks[5]!.startMs).toBeGreaterThan(0);
      expect(tracks[7]!.startMs).toBeGreaterThan(0);
    });

    it('should throw error if target count exceeds grid capacity', () => {
      const baseTrack: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const stagger: StaggerConfig = {
        amount: 50,
        grid: [2, 2] // 2x2 grid = 4 cells
      };

      expect(() => {
        AnimationCompiler.generateStaggeredAnimations(baseTrack, 5, stagger);
      }).toThrow();
    });

    it('should work with keyframe animations', () => {
      const baseTrack: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear',
        keyframes: [
          { time: 0, value: 0 },
          { time: 0.5, value: 0.8 },
          { time: 1, value: 1 }
        ]
      };

      const stagger: StaggerConfig = {
        amount: 100,
        from: 'start'
      };

      const tracks = AnimationCompiler.generateStaggeredAnimations(baseTrack, 3, stagger);

      expect(tracks.length).toBe(3);
      expect(tracks[0]!.keyframeSegments).toBeDefined();
      expect(tracks[1]!.keyframeSegments).toBeDefined();
      expect(tracks[2]!.keyframeSegments).toBeDefined();
      
      // Verify timing is staggered
      expect(tracks[0]!.startMs).toBe(0);
      expect(tracks[1]!.startMs).toBe(100);
      expect(tracks[2]!.startMs).toBe(200);
    });

    it('should return empty array for zero targets', () => {
      const baseTrack: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const stagger: StaggerConfig = {
        amount: 100
      };

      const tracks = AnimationCompiler.generateStaggeredAnimations(baseTrack, 0, stagger);

      expect(tracks.length).toBe(0);
    });

    it('should preserve animation properties in staggered tracks', () => {
      const baseTrack: AnimationTrackSpec = {
        property: 'transform.scale',
        from: 1,
        to: 2,
        startMs: 500,
        endMs: 1500,
        easing: 'ease-in-out',
        loop: true,
        yoyo: true
      };

      const stagger: StaggerConfig = {
        amount: 50,
        from: 'start'
      };

      const tracks = AnimationCompiler.generateStaggeredAnimations(baseTrack, 2, stagger);

      expect(tracks[0]!.property).toBe('transform.scale');
      expect(tracks[0]!.loop).toBe(true);
      expect(tracks[0]!.yoyo).toBe(true);
      expect(tracks[0]!.easingType).toBe('ease-in-out');
      
      expect(tracks[1]!.property).toBe('transform.scale');
      expect(tracks[1]!.loop).toBe(true);
      expect(tracks[1]!.yoyo).toBe(true);
    });
  });

  describe('stagger property-based tests', () => {
    it('should maintain correct timing relationships', () => {
      fc.assert(fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 10, max: 200 }),
        fc.constantFrom('start', 'center', 'end'),
        (targetCount, staggerAmount, staggerFrom) => {
          const baseTrack: AnimationTrackSpec = {
            property: 'opacity',
            from: 0,
            to: 1,
            startMs: 0,
            endMs: 1000,
            easing: 'linear'
          };

          const stagger: StaggerConfig = {
            amount: staggerAmount,
            from: staggerFrom
          };

          const tracks = AnimationCompiler.generateStaggeredAnimations(baseTrack, targetCount, stagger);

          expect(tracks.length).toBe(targetCount);
          
          // All tracks should have the same duration
          const duration = baseTrack.endMs - baseTrack.startMs;
          for (const track of tracks) {
            expect(track.endMs - track.startMs).toBe(duration);
          }
          
          // All start times should be non-negative
          for (const track of tracks) {
            expect(track.startMs).toBeGreaterThanOrEqual(0);
          }
        }
      ), { numRuns: 50 });
    });

    it('should generate unique start times for linear stagger from start', () => {
      fc.assert(fc.property(
        fc.integer({ min: 2, max: 10 }),
        fc.integer({ min: 10, max: 100 }),
        (targetCount, staggerAmount) => {
          const baseTrack: AnimationTrackSpec = {
            property: 'opacity',
            from: 0,
            to: 1,
            startMs: 0,
            endMs: 1000,
            easing: 'linear'
          };

          const stagger: StaggerConfig = {
            amount: staggerAmount,
            from: 'start'
          };

          const tracks = AnimationCompiler.generateStaggeredAnimations(baseTrack, targetCount, stagger);

          // Extract start times
          const startTimes = tracks.map(t => t.startMs);
          
          // All start times should be unique for linear stagger from start
          const uniqueStartTimes = new Set(startTimes);
          expect(uniqueStartTimes.size).toBe(targetCount);
          
          // Start times should be in ascending order
          for (let i = 1; i < startTimes.length; i++) {
            expect(startTimes[i]).toBeGreaterThan(startTimes[i - 1]!);
          }
        }
      ), { numRuns: 50 });
    });
  });
});

describe('Randomization', () => {
  describe('applyRandomization', () => {
    it('should randomize from value', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const randomize: RandomizeConfig = {
        property: 'from',
        min: 0.2,
        max: 0.8,
        seed: 42
      };

      const randomized = AnimationCompiler.applyRandomization(track, randomize);

      expect(randomized.from).toBeGreaterThanOrEqual(0.2);
      expect(randomized.from).toBeLessThanOrEqual(0.8);
      expect(randomized.to).toBe(1); // Should not change
    });

    it('should randomize to value', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const randomize: RandomizeConfig = {
        property: 'to',
        min: 0.5,
        max: 1.5,
        seed: 42
      };

      const randomized = AnimationCompiler.applyRandomization(track, randomize);

      expect(randomized.from).toBe(0); // Should not change
      expect(randomized.to).toBeGreaterThanOrEqual(0.5);
      expect(randomized.to).toBeLessThanOrEqual(1.5);
    });

    it('should randomize duration', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const randomize: RandomizeConfig = {
        property: 'duration',
        min: -200,
        max: 200,
        seed: 42
      };

      const randomized = AnimationCompiler.applyRandomization(track, randomize);

      expect(randomized.startMs).toBe(0); // Should not change
      const newDuration = randomized.endMs - randomized.startMs;
      expect(newDuration).toBeGreaterThanOrEqual(800);
      expect(newDuration).toBeLessThanOrEqual(1200);
    });

    it('should randomize delay', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 500,
        endMs: 1500,
        easing: 'linear'
      };

      const randomize: RandomizeConfig = {
        property: 'delay',
        min: -100,
        max: 100,
        seed: 42
      };

      const randomized = AnimationCompiler.applyRandomization(track, randomize);

      const originalDuration = 1000;
      const newDuration = randomized.endMs - randomized.startMs;
      
      expect(newDuration).toBe(originalDuration); // Duration should stay the same
      expect(randomized.startMs).toBeGreaterThanOrEqual(400);
      expect(randomized.startMs).toBeLessThanOrEqual(600);
    });

    it('should use seeded random for reproducibility', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const randomize: RandomizeConfig = {
        property: 'from',
        min: 0,
        max: 1,
        seed: 12345
      };

      const randomized1 = AnimationCompiler.applyRandomization(track, randomize);
      const randomized2 = AnimationCompiler.applyRandomization(track, randomize);

      // Same seed should produce same result
      expect(randomized1.from).toBe(randomized2.from);
    });

    it('should produce different results without seed', () => {
      const track: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const randomize: RandomizeConfig = {
        property: 'from',
        min: 0,
        max: 1
        // No seed
      };

      const results = new Set();
      for (let i = 0; i < 10; i++) {
        const randomized = AnimationCompiler.applyRandomization(track, randomize);
        results.add(randomized.from);
      }

      // Should produce multiple different values
      expect(results.size).toBeGreaterThan(1);
    });

    it('should not randomize non-number from values', () => {
      const track: AnimationTrackSpec = {
        property: 'color',
        from: 'red',
        to: 'blue',
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const randomize: RandomizeConfig = {
        property: 'from',
        min: 0,
        max: 1,
        seed: 42
      };

      const randomized = AnimationCompiler.applyRandomization(track, randomize);

      expect(randomized.from).toBe('red'); // Should not change
    });
  });

  describe('generateRandomizedAnimations', () => {
    it('should generate multiple randomized tracks', () => {
      const baseTrack: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const randomize: RandomizeConfig = {
        property: 'from',
        min: 0,
        max: 0.5,
        seed: 42
      };

      const tracks = AnimationCompiler.generateRandomizedAnimations(baseTrack, 5, randomize);

      expect(tracks.length).toBe(5);
      
      // Each track should have a different from value
      const fromValues = new Set();
      for (const track of tracks) {
        const value = AnimationCompiler.applyAnimation(track, 0);
        fromValues.add(value);
      }
      
      expect(fromValues.size).toBeGreaterThan(1);
    });

    it('should use seed offset for reproducibility', () => {
      const baseTrack: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const randomize: RandomizeConfig = {
        property: 'to',
        min: 0.5,
        max: 1.5,
        seed: 100
      };

      const tracks1 = AnimationCompiler.generateRandomizedAnimations(baseTrack, 3, randomize);
      const tracks2 = AnimationCompiler.generateRandomizedAnimations(baseTrack, 3, randomize);

      // Same seed should produce same results
      for (let i = 0; i < 3; i++) {
        const value1 = AnimationCompiler.applyAnimation(tracks1[i]!, 1000);
        const value2 = AnimationCompiler.applyAnimation(tracks2[i]!, 1000);
        expect(value1).toBe(value2);
      }
    });

    it('should work with duration randomization', () => {
      const baseTrack: AnimationTrackSpec = {
        property: 'opacity',
        from: 0,
        to: 1,
        startMs: 0,
        endMs: 1000,
        easing: 'linear'
      };

      const randomize: RandomizeConfig = {
        property: 'duration',
        min: -200,
        max: 200,
        seed: 42
      };

      const tracks = AnimationCompiler.generateRandomizedAnimations(baseTrack, 5, randomize);

      expect(tracks.length).toBe(5);
      
      // Each track should have a different duration
      const durations = new Set();
      for (const track of tracks) {
        durations.add(track.endMs - track.startMs);
      }
      
      expect(durations.size).toBeGreaterThan(1);
    });
  });

  describe('randomization property-based tests', () => {
    it('should always produce values within bounds', () => {
      fc.assert(fc.property(
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.integer({ min: 0, max: 10000 }),
        (min, max, seed) => {
          // Ensure min <= max
          const actualMin = Math.min(min, max);
          const actualMax = Math.max(min, max);
          
          const track: AnimationTrackSpec = {
            property: 'opacity',
            from: 0,
            to: 1,
            startMs: 0,
            endMs: 1000,
            easing: 'linear'
          };

          const randomize: RandomizeConfig = {
            property: 'from',
            min: actualMin,
            max: actualMax,
            seed
          };

          const randomized = AnimationCompiler.applyRandomization(track, randomize);

          expect(randomized.from).toBeGreaterThanOrEqual(actualMin);
          expect(randomized.from).toBeLessThanOrEqual(actualMax);
        }
      ), { numRuns: 100 });
    });

    it('should maintain animation duration when randomizing delay', () => {
      fc.assert(fc.property(
        fc.integer({ min: 0, max: 5000 }),
        fc.integer({ min: 100, max: 2000 }),
        fc.integer({ min: -500, max: 500 }),
        fc.integer({ min: 0, max: 10000 }),
        (startMs, duration, delayOffset, seed) => {
          const track: AnimationTrackSpec = {
            property: 'opacity',
            from: 0,
            to: 1,
            startMs,
            endMs: startMs + duration,
            easing: 'linear'
          };

          const randomize: RandomizeConfig = {
            property: 'delay',
            min: delayOffset,
            max: delayOffset,
            seed
          };

          const randomized = AnimationCompiler.applyRandomization(track, randomize);

          const newDuration = randomized.endMs - randomized.startMs;
          expect(newDuration).toBe(duration);
        }
      ), { numRuns: 50 });
    });

    it('should produce consistent results with same seed', () => {
      fc.assert(fc.property(
        fc.integer({ min: 0, max: 10000 }),
        (seed) => {
          const track: AnimationTrackSpec = {
            property: 'opacity',
            from: 0,
            to: 1,
            startMs: 0,
            endMs: 1000,
            easing: 'linear'
          };

          const randomize: RandomizeConfig = {
            property: 'from',
            min: 0,
            max: 1,
            seed
          };

          const randomized1 = AnimationCompiler.applyRandomization(track, randomize);
          const randomized2 = AnimationCompiler.applyRandomization(track, randomize);

          expect(randomized1.from).toBe(randomized2.from);
        }
      ), { numRuns: 50 });
    });
  });
});
