/**
 * Animation track compilation system
 * 
 * Provides high-performance animation compilation with comprehensive easing functions,
 * interpolation for different value types, and support for loops and yoyo effects.
 * All animations are precompiled at parse time to avoid per-frame calculations.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import type { AnimationTrackSpec, EasingType, AnimationValue, AnimationKeyframe, StaggerConfig, RandomizeConfig } from '../types/CinematicSpec';
import type { CompiledAnimationTrack, EasingFunction, InterpolationFunction, CompiledKeyframeSegment } from '../types/CompiledSpec';

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
    // Check if keyframes are provided
    if (track.keyframes && track.keyframes.length > 0) {
      return this.compileKeyframeTrack(track);
    }
    
    // Standard from/to animation
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
   * Compiles a keyframe-based animation track
   * 
   * @param track - Animation track specification with keyframes
   * @returns Compiled animation track with keyframe segments
   */
  static compileKeyframeTrack(track: AnimationTrackSpec): CompiledAnimationTrack {
    if (!track.keyframes || track.keyframes.length === 0) {
      throw new Error('compileKeyframeTrack called without keyframes');
    }
    
    // Sort keyframes by time
    const sortedKeyframes = [...track.keyframes].sort((a, b) => a.time - b.time);
    
    // Validate keyframe times are in range [0, 1]
    for (const keyframe of sortedKeyframes) {
      if (keyframe.time < 0 || keyframe.time > 1) {
        throw new Error(`Keyframe time must be between 0 and 1, got ${keyframe.time}`);
      }
    }
    
    // Ensure we have keyframes at 0 and 1
    if (sortedKeyframes[0]!.time !== 0) {
      sortedKeyframes.unshift({
        time: 0,
        value: track.from,
        easing: track.easing
      });
    }
    
    if (sortedKeyframes[sortedKeyframes.length - 1]!.time !== 1) {
      sortedKeyframes.push({
        time: 1,
        value: track.to,
        easing: track.easing
      });
    }
    
    // Compile segments between keyframes
    const segments: CompiledKeyframeSegment[] = [];
    
    for (let i = 0; i < sortedKeyframes.length - 1; i++) {
      const fromKeyframe = sortedKeyframes[i]!;
      const toKeyframe = sortedKeyframes[i + 1]!;
      
      // Use the easing from the "from" keyframe, or fall back to track easing
      const segmentEasing = fromKeyframe.easing || track.easing || 'ease';
      const easingFunction = this.compileEasing(segmentEasing);
      const interpolationFunction = this.compileInterpolation(
        fromKeyframe.value,
        toKeyframe.value,
        easingFunction
      );
      
      segments.push({
        startTime: fromKeyframe.time,
        endTime: toKeyframe.time,
        interpolate: interpolationFunction
      });
    }
    
    // Create master interpolation function that delegates to segments
    const masterInterpolate = (progress: number): any => {
      // Clamp progress to [0, 1]
      const clampedProgress = Math.max(0, Math.min(1, progress));
      
      // Find the appropriate segment
      for (const segment of segments) {
        if (clampedProgress >= segment.startTime && clampedProgress <= segment.endTime) {
          // Calculate progress within this segment
          const segmentDuration = segment.endTime - segment.startTime;
          if (segmentDuration === 0) {
            return segment.interpolate(0);
          }
          const segmentProgress = (clampedProgress - segment.startTime) / segmentDuration;
          return segment.interpolate(segmentProgress);
        }
      }
      
      // Fallback to last segment's end value
      return segments[segments.length - 1]!.interpolate(1);
    };
    
    return {
      property: track.property,
      startMs: track.startMs,
      endMs: track.endMs,
      interpolate: masterInterpolate,
      loop: track.loop || false,
      yoyo: track.yoyo || false,
      easingType: track.easing || 'ease',
      currentLoop: 0,
      isReverse: false,
      keyframeSegments: segments
    };
  }
  
  /**
   * Generates staggered animations for multiple targets
   * 
   * @param baseTrack - Base animation track to stagger
   * @param targetCount - Number of targets to animate
   * @param stagger - Stagger configuration
   * @returns Array of compiled animation tracks with time offsets
   */
  static generateStaggeredAnimations(
    baseTrack: AnimationTrackSpec,
    targetCount: number,
    stagger: StaggerConfig
  ): CompiledAnimationTrack[] {
    if (targetCount <= 0) {
      return [];
    }
    
    const tracks: CompiledAnimationTrack[] = [];
    const staggerFrom = stagger.from || 'start';
    
    // Calculate stagger offsets based on pattern
    const offsets = this.calculateStaggerOffsets(targetCount, stagger);
    
    // Generate a track for each target with the appropriate time offset
    for (let i = 0; i < targetCount; i++) {
      const offset = offsets[i]!;
      
      // Create a new track with adjusted timing
      const staggeredTrack: AnimationTrackSpec = {
        ...baseTrack,
        startMs: baseTrack.startMs + offset,
        endMs: baseTrack.endMs + offset
      };
      
      // Compile the staggered track
      tracks.push(this.compileTrack(staggeredTrack));
    }
    
    return tracks;
  }
  
  /**
   * Calculates time offsets for stagger effect
   * 
   * @param targetCount - Number of targets
   * @param stagger - Stagger configuration
   * @returns Array of time offsets in milliseconds
   */
  private static calculateStaggerOffsets(
    targetCount: number,
    stagger: StaggerConfig
  ): number[] {
    const offsets: number[] = [];
    const staggerFrom = stagger.from || 'start';
    
    // Handle grid-based stagger (2D)
    if (stagger.grid) {
      const [cols, rows] = stagger.grid;
      const totalCells = cols * rows;
      
      if (targetCount > totalCells) {
        throw new Error(`Target count (${targetCount}) exceeds grid capacity (${totalCells})`);
      }
      
      // Calculate offsets based on grid position
      for (let i = 0; i < targetCount; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        // Calculate distance from stagger origin
        let distance: number;
        
        switch (staggerFrom) {
          case 'center':
            const centerCol = (cols - 1) / 2;
            const centerRow = (rows - 1) / 2;
            distance = Math.sqrt(
              Math.pow(col - centerCol, 2) + Math.pow(row - centerRow, 2)
            );
            break;
            
          case 'end':
            distance = (rows - 1 - row) * cols + (cols - 1 - col);
            break;
            
          case 'start':
          default:
            distance = row * cols + col;
            break;
        }
        
        offsets.push(distance * stagger.amount);
      }
    } else {
      // Handle linear stagger (1D)
      for (let i = 0; i < targetCount; i++) {
        let index: number;
        
        switch (staggerFrom) {
          case 'center':
            const centerIndex = (targetCount - 1) / 2;
            index = Math.abs(i - centerIndex);
            break;
            
          case 'end':
            index = targetCount - 1 - i;
            break;
            
          case 'start':
          default:
            index = i;
            break;
        }
        
        offsets.push(index * stagger.amount);
      }
    }
    
    return offsets;
  }
  
  /**
   * Applies randomization to an animation track
   * 
   * @param track - Animation track to randomize
   * @param randomize - Randomization configuration
   * @returns New track with randomized values
   */
  static applyRandomization(
    track: AnimationTrackSpec,
    randomize: RandomizeConfig
  ): AnimationTrackSpec {
    const randomValue = this.generateRandomValue(randomize);
    const newTrack = { ...track };
    
    // Apply randomization based on property
    switch (randomize.property) {
      case 'from':
        if (typeof track.from === 'number') {
          newTrack.from = randomValue;
        }
        break;
        
      case 'to':
        if (typeof track.to === 'number') {
          newTrack.to = randomValue;
        }
        break;
        
      case 'duration':
        const currentDuration = track.endMs - track.startMs;
        const newDuration = Math.max(0, currentDuration + randomValue);
        newTrack.endMs = track.startMs + newDuration;
        break;
        
      case 'startMs':
        newTrack.startMs = Math.max(0, track.startMs + randomValue);
        newTrack.endMs = newTrack.startMs + (track.endMs - track.startMs);
        break;
        
      case 'delay':
        newTrack.startMs = track.startMs + randomValue;
        newTrack.endMs = track.endMs + randomValue;
        break;
        
      default:
        // For custom properties, try to apply to the track
        (newTrack as any)[randomize.property] = randomValue;
        break;
    }
    
    return newTrack;
  }
  
  /**
   * Generates a random value within the specified range
   * 
   * @param randomize - Randomization configuration
   * @returns Random value between min and max
   */
  private static generateRandomValue(randomize: RandomizeConfig): number {
    // Use seeded random if seed is provided
    if (randomize.seed !== undefined) {
      const random = this.seededRandom(randomize.seed);
      return randomize.min + random * (randomize.max - randomize.min);
    }
    
    // Use standard Math.random
    return randomize.min + Math.random() * (randomize.max - randomize.min);
  }
  
  /**
   * Seeded random number generator for reproducible randomness
   * 
   * @param seed - Seed value
   * @returns Random number between 0 and 1
   */
  private static seededRandom(seed: number): number {
    // Simple seeded random using sine
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
  
  /**
   * Generates multiple randomized animation tracks
   * 
   * @param baseTrack - Base animation track
   * @param count - Number of randomized tracks to generate
   * @param randomize - Randomization configuration
   * @returns Array of randomized compiled tracks
   */
  static generateRandomizedAnimations(
    baseTrack: AnimationTrackSpec,
    count: number,
    randomize: RandomizeConfig
  ): CompiledAnimationTrack[] {
    const tracks: CompiledAnimationTrack[] = [];
    
    for (let i = 0; i < count; i++) {
      // Use index as seed offset if seed is provided
      const config = randomize.seed !== undefined
        ? { ...randomize, seed: randomize.seed + i }
        : randomize;
      
      const randomizedTrack = this.applyRandomization(baseTrack, config);
      tracks.push(this.compileTrack(randomizedTrack));
    }
    
    return tracks;
  }
  
  /**
   * Calculates the effective progress for an animation considering loop and yoyo
   * 
   * @param track - Compiled animation track
   * @param timeMs - Current time in milliseconds
   * @returns Effective progress value (0-1) considering loop/yoyo state
   */
  static calculateProgress(track: CompiledAnimationTrack, timeMs: number): number | null {
    // Check if animation is active
    if (timeMs < track.startMs) {
      return null; // Animation hasn't started yet
    }
    
    const duration = track.endMs - track.startMs;
    if (duration <= 0) {
      return 1; // Invalid duration, return end state
    }
    
    const elapsed = timeMs - track.startMs;
    
    // Handle non-looping animations
    if (!track.loop) {
      if (elapsed > duration) {
        return null; // Animation has completed
      }
      const progress = elapsed / duration;
      return Math.max(0, Math.min(1, progress));
    }
    
    // Handle looping animations
    const loopCount = Math.floor(elapsed / duration);
    const loopProgress = (elapsed % duration) / duration;
    
    // Update loop counter (for tracking purposes)
    track.currentLoop = loopCount;
    
    // Handle yoyo (reverse direction on odd loops)
    if (track.yoyo) {
      const isReverse = loopCount % 2 === 1;
      track.isReverse = isReverse;
      return isReverse ? 1 - loopProgress : loopProgress;
    }
    
    // Regular loop (always forward)
    return loopProgress;
  }
  
  /**
   * Applies an animation track to get the interpolated value at a specific time
   * 
   * @param track - Compiled animation track
   * @param timeMs - Current time in milliseconds
   * @returns Interpolated value or null if animation is not active
   */
  static applyAnimation(track: CompiledAnimationTrack, timeMs: number): any | null {
    const progress = this.calculateProgress(track, timeMs);
    
    if (progress === null) {
      return null; // Animation is not active
    }
    
    return track.interpolate(progress);
  }
  
  /**
   * Checks if an animation is currently active at the given time
   * 
   * @param track - Compiled animation track
   * @param timeMs - Current time in milliseconds
   * @returns True if the animation is active
   */
  static isAnimationActive(track: CompiledAnimationTrack, timeMs: number): boolean {
    if (timeMs < track.startMs) {
      return false;
    }
    
    if (!track.loop) {
      return timeMs <= track.endMs;
    }
    
    // Looping animations are always active after start
    return true;
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