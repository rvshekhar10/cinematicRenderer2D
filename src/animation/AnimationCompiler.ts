/**
 * Animation track compilation system
 * 
 * Provides high-performance animation compilation with comprehensive easing functions,
 * interpolation for different value types, and support for loops and yoyo effects.
 * All animations are precompiled at parse time to avoid per-frame calculations.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import type { AnimationTrackSpec, EasingType, AnimationValue } from '../types/CinematicSpec';
import type { CompiledAnimationTrack, EasingFunction, InterpolationFunction } from '../types/CompiledSpec';

/**
 * Animation compilation system with optimized easing and interpolation functions
 */
export class AnimationCompiler {
  /**
   * Compiles an animation track specification into an optimized runtime track
   * 
   * @param track - Animation track specification to compile
   * @returns Compiled animation track with precompiled interpolation function
   */
  static compileTrack(track: AnimationTrackSpec): CompiledAnimationTrack {
    const easingFunction = this.compileEasing(track.easing || 'ease');
    const interpolationFunction = this.compileInterpolation(track.from, track.to, easingFunction);
    
    return {
      property: track.property,
      startMs: track.startMs,
      endMs: track.endMs,
      interpolate: interpolationFunction,
      loop: track.loop || false,
      yoyo: track.yoyo || false,
      easingType: track.easing || 'ease',
      currentLoop: 0,
      isReverse: false
    };
  }
  
  /**
   * Compiles an easing function from string specification to optimized function
   * 
   * @param easing - Easing type or cubic-bezier specification
   * @returns Optimized easing function that maps [0,1] to [0,1]
   */
  static compileEasing(easing: EasingType): EasingFunction {
    // Handle cubic-bezier functions
    if (typeof easing === 'string' && easing.startsWith('cubic-bezier(')) {
      return this.compileCubicBezier(easing);
    }
    
    // Standard easing functions with optimized implementations
    switch (easing) {
      case 'linear':
        return (t: number) => t;
        
      case 'ease':
        return this.cubicBezier(0.25, 0.1, 0.25, 1);
        
      case 'ease-in':
        return this.cubicBezier(0.42, 0, 1, 1);
        
      case 'ease-out':
        return this.cubicBezier(0, 0, 0.58, 1);
        
      case 'ease-in-out':
        return this.cubicBezier(0.42, 0, 0.58, 1);
        
      // Sine easing functions
      case 'ease-in-sine':
        return (t: number) => 1 - Math.cos((t * Math.PI) / 2);
        
      case 'ease-out-sine':
        return (t: number) => Math.sin((t * Math.PI) / 2);
        
      case 'ease-in-out-sine':
        return (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
        
      // Quadratic easing functions
      case 'ease-in-quad':
        return (t: number) => t * t;
        
      case 'ease-out-quad':
        return (t: number) => 1 - (1 - t) * (1 - t);
        
      case 'ease-in-out-quad':
        return (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        
      // Cubic easing functions
      case 'ease-in-cubic':
        return (t: number) => t * t * t;
        
      case 'ease-out-cubic':
        return (t: number) => 1 - Math.pow(1 - t, 3);
        
      case 'ease-in-out-cubic':
        return (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        
      // Quartic easing functions
      case 'ease-in-quart':
        return (t: number) => t * t * t * t;
        
      case 'ease-out-quart':
        return (t: number) => 1 - Math.pow(1 - t, 4);
        
      case 'ease-in-out-quart':
        return (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
        
      // Quintic easing functions
      case 'ease-in-quint':
        return (t: number) => t * t * t * t * t;
        
      case 'ease-out-quint':
        return (t: number) => 1 - Math.pow(1 - t, 5);
        
      case 'ease-in-out-quint':
        return (t: number) => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
        
      // Exponential easing functions
      case 'ease-in-expo':
        return (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
        
      case 'ease-out-expo':
        return (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        
      case 'ease-in-out-expo':
        return (t: number) => {
          if (t === 0) return 0;
          if (t === 1) return 1;
          return t < 0.5 
            ? Math.pow(2, 20 * t - 10) / 2
            : (2 - Math.pow(2, -20 * t + 10)) / 2;
        };
        
      // Circular easing functions
      case 'ease-in-circ':
        return (t: number) => 1 - Math.sqrt(1 - Math.pow(t, 2));
        
      case 'ease-out-circ':
        return (t: number) => Math.sqrt(1 - Math.pow(t - 1, 2));
        
      case 'ease-in-out-circ':
        return (t: number) => t < 0.5
          ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
          : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
          
      // Back easing functions
      case 'ease-in-back':
        return this.backEasing(1.70158, 'in');
        
      case 'ease-out-back':
        return this.backEasing(1.70158, 'out');
        
      case 'ease-in-out-back':
        return this.backEasing(1.70158, 'in-out');
        
      // Elastic easing functions
      case 'ease-in-elastic':
        return this.elasticEasing(2 * Math.PI / 3, 'in');
        
      case 'ease-out-elastic':
        return this.elasticEasing(2 * Math.PI / 3, 'out');
        
      case 'ease-in-out-elastic':
        return this.elasticEasing(2 * Math.PI / 4.5, 'in-out');
        
      // Bounce easing functions
      case 'ease-in-bounce':
        return (t: number) => 1 - this.bounceOut(1 - t);
        
      case 'ease-out-bounce':
        return this.bounceOut;
        
      case 'ease-in-out-bounce':
        return (t: number) => t < 0.5
          ? (1 - this.bounceOut(1 - 2 * t)) / 2
          : (1 + this.bounceOut(2 * t - 1)) / 2;
          
      default:
        // Fallback to ease
        return this.cubicBezier(0.25, 0.1, 0.25, 1);
    }
  }
  
  /**
   * Compiles an interpolation function for animating between two values
   * 
   * @param from - Starting value
   * @param to - Ending value
   * @param easingFunction - Easing function to apply
   * @returns Optimized interpolation function
   */
  static compileInterpolation(from: AnimationValue, to: AnimationValue, easingFunction: EasingFunction): InterpolationFunction {
    // Determine the interpolation strategy based on value types
    const fromType = this.getValueType(from);
    const toType = this.getValueType(to);
    
    if (fromType !== toType) {
      // Type mismatch - use discrete transition
      return (progress: number) => {
        const easedProgress = easingFunction(Math.max(0, Math.min(1, progress)));
        return easedProgress < 0.5 ? from : to;
      };
    }
    
    switch (fromType) {
      case 'number':
        return this.compileNumberInterpolation(from as number, to as number, easingFunction);
        
      case 'string':
        return this.compileStringInterpolation(from as string, to as string, easingFunction);
        
      case 'boolean':
        return this.compileBooleanInterpolation(from as boolean, to as boolean, easingFunction);
        
      case 'object':
        return this.compileObjectInterpolation(
          from as Record<string, any>, 
          to as Record<string, any>, 
          easingFunction
        );
        
      default:
        // Fallback to discrete transition
        return (progress: number) => {
          const easedProgress = easingFunction(Math.max(0, Math.min(1, progress)));
          return easedProgress < 0.5 ? from : to;
        };
    }
  }
  
  /**
   * Creates a cubic-bezier easing function with the given control points
   */
  private static cubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFunction {
    // Simplified cubic-bezier implementation
    // In a production system, this would use a more accurate algorithm
    return (t: number) => {
      // Use Newton-Raphson method approximation
      const cx = 3 * x1;
      const bx = 3 * (x2 - x1) - cx;
      const ax = 1 - cx - bx;
      
      const cy = 3 * y1;
      const by = 3 * (y2 - y1) - cy;
      const ay = 1 - cy - by;
      
      // Solve for t given x using Newton-Raphson
      let x = t;
      for (let i = 0; i < 8; i++) {
        const currentX = ((ax * x + bx) * x + cx) * x;
        const currentSlope = (3 * ax * x + 2 * bx) * x + cx;
        if (Math.abs(currentSlope) < 1e-6) break;
        x = x - (currentX - t) / currentSlope;
      }
      
      // Calculate y for the solved t
      return ((ay * x + by) * x + cy) * x;
    };
  }
  
  /**
   * Parses and compiles a cubic-bezier string specification
   */
  private static compileCubicBezier(bezierString: string): EasingFunction {
    const match = bezierString.match(/cubic-bezier\(([^)]+)\)/);
    if (!match || !match[1]) {
      return this.cubicBezier(0.25, 0.1, 0.25, 1); // Fallback to ease
    }
    
    const values = match[1].split(',').map(v => parseFloat(v.trim()));
    if (values.length !== 4 || values.some(v => isNaN(v))) {
      return this.cubicBezier(0.25, 0.1, 0.25, 1); // Fallback to ease
    }
    
    return this.cubicBezier(values[0]!, values[1]!, values[2]!, values[3]!);
  }
  
  /**
   * Creates a back easing function with overshoot
   */
  private static backEasing(c: number, type: 'in' | 'out' | 'in-out'): EasingFunction {
    const c1 = c;
    const c2 = c1 * 1.525;
    const c3 = c1 + 1;
    
    switch (type) {
      case 'in':
        return (t: number) => c3 * t * t * t - c1 * t * t;
        
      case 'out':
        return (t: number) => 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        
      case 'in-out':
        return (t: number) => t < 0.5
          ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
          : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
          
      default:
        return (t: number) => t;
    }
  }
  
  /**
   * Creates an elastic easing function with oscillation
   */
  private static elasticEasing(c: number, type: 'in' | 'out' | 'in-out'): EasingFunction {
    switch (type) {
      case 'in':
        return (t: number) => {
          if (t === 0) return 0;
          if (t === 1) return 1;
          return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c);
        };
        
      case 'out':
        return (t: number) => {
          if (t === 0) return 0;
          if (t === 1) return 1;
          return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c) + 1;
        };
        
      case 'in-out':
        return (t: number) => {
          if (t === 0) return 0;
          if (t === 1) return 1;
          return t < 0.5
            ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c)) / 2
            : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c)) / 2 + 1;
        };
        
      default:
        return (t: number) => t;
    }
  }
  
  /**
   * Bounce easing out function
   */
  private static bounceOut(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
  
  /**
   * Determines the type of an animation value
   */
  private static getValueType(value: AnimationValue): 'number' | 'string' | 'boolean' | 'object' {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'object' && value !== null) return 'object';
    return 'object'; // Fallback
  }
  
  /**
   * Compiles number interpolation with optimized performance
   */
  private static compileNumberInterpolation(from: number, to: number, easingFunction: EasingFunction): InterpolationFunction {
    const delta = to - from;
    return (progress: number) => {
      const easedProgress = easingFunction(Math.max(0, Math.min(1, progress)));
      return from + delta * easedProgress;
    };
  }
  
  /**
   * Compiles string interpolation with CSS value support
   */
  private static compileStringInterpolation(from: string, to: string, easingFunction: EasingFunction): InterpolationFunction {
    // Check if strings contain numeric values that can be interpolated
    const fromMatch = from.match(/^([+-]?\d*\.?\d+)(.*)$/);
    const toMatch = to.match(/^([+-]?\d*\.?\d+)(.*)$/);
    
    if (fromMatch && toMatch && fromMatch[2] === toMatch[2]) {
      // Interpolate numeric part, keep unit
      const fromNum = parseFloat(fromMatch[1]!);
      const toNum = parseFloat(toMatch[1]!);
      const unit = fromMatch[2];
      const delta = toNum - fromNum;
      
      return (progress: number) => {
        const easedProgress = easingFunction(Math.max(0, Math.min(1, progress)));
        const interpolatedValue = fromNum + delta * easedProgress;
        // Round to avoid floating point precision issues
        const roundedValue = Math.round(interpolatedValue * 1000000) / 1000000;
        return `${roundedValue}${unit}`;
      };
    }
    
    // Discrete transition for non-numeric strings
    return (progress: number) => {
      const easedProgress = easingFunction(Math.max(0, Math.min(1, progress)));
      return easedProgress < 0.5 ? from : to;
    };
  }
  
  /**
   * Compiles boolean interpolation (discrete transition)
   */
  private static compileBooleanInterpolation(from: boolean, to: boolean, easingFunction: EasingFunction): InterpolationFunction {
    return (progress: number) => {
      const easedProgress = easingFunction(Math.max(0, Math.min(1, progress)));
      return easedProgress < 0.5 ? from : to;
    };
  }
  
  /**
   * Compiles object interpolation for complex values
   */
  private static compileObjectInterpolation(
    from: Record<string, any>, 
    to: Record<string, any>, 
    easingFunction: EasingFunction
  ): InterpolationFunction {
    // Pre-compile interpolation functions for each property
    const propertyInterpolators = new Map<string, InterpolationFunction>();
    
    // Get all unique keys from both objects
    const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);
    
    for (const key of allKeys) {
      const fromValue = from[key];
      const toValue = to[key];
      
      if (fromValue !== undefined && toValue !== undefined) {
        // Both objects have this property - create interpolator
        propertyInterpolators.set(key, this.compileInterpolation(fromValue, toValue, easingFunction));
      } else if (fromValue !== undefined) {
        // Only from has this property - keep constant
        propertyInterpolators.set(key, () => fromValue);
      } else {
        // Only to has this property - discrete transition
        propertyInterpolators.set(key, (progress: number) => {
          const easedProgress = easingFunction(Math.max(0, Math.min(1, progress)));
          return easedProgress < 0.5 ? undefined : toValue;
        });
      }
    }
    
    return (progress: number) => {
      const result: Record<string, any> = {};
      
      for (const [key, interpolator] of propertyInterpolators) {
        const value = interpolator(progress);
        if (value !== undefined) {
          result[key] = value;
        }
      }
      
      return result;
    };
  }
}