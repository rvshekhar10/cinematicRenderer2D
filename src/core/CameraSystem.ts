/**
 * Camera System for cinematicRenderer2D
 * 
 * Provides viewport transformation for cinematic camera movements including
 * pan, zoom, and rotation. Supports both DOM and Canvas rendering backends.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import type { EasingType } from '../types';

/**
 * Camera state representing the current viewport transformation
 */
export interface CameraState {
  /** Camera position X (pixels) */
  x: number;
  /** Camera position Y (pixels) */
  y: number;
  /** Zoom level (1.0 = 100%, 2.0 = 200%) */
  zoom: number;
  /** Rotation angle (degrees) */
  rotate: number;
}

/**
 * Camera animation configuration
 */
export interface CameraAnimation {
  /** Property to animate */
  property: 'x' | 'y' | 'zoom' | 'rotate';
  /** Starting value */
  from: number;
  /** Ending value */
  to: number;
  /** Animation start time in milliseconds */
  startMs: number;
  /** Animation end time in milliseconds */
  endMs: number;
  /** Easing function */
  easing: EasingType;
}

/**
 * Camera System manages viewport transformations for cinematic effects
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */
export class CameraSystem {
  private state: CameraState;
  private animations: CameraAnimation[];
  private container: HTMLElement;
  private easingFunctions: Map<EasingType, (t: number) => number>;

  /**
   * Create a new Camera System
   * @param container - The container element to apply transforms to
   */
  constructor(container: HTMLElement) {
    this.container = container;
    this.state = {
      x: 0,
      y: 0,
      zoom: 1.0,
      rotate: 0,
    };
    this.animations = [];
    this.easingFunctions = this.initializeEasingFunctions();
    // Apply initial transform
    this.applyTransform();
  }

  /**
   * Initialize easing functions for camera animations
   */
  private initializeEasingFunctions(): Map<EasingType, (t: number) => number> {
    const easings = new Map<EasingType, (t: number) => number>();
    
    // Linear
    easings.set('linear', (t: number) => t);
    
    // Standard CSS easings
    easings.set('ease', (t: number) => {
      // cubic-bezier(0.25, 0.1, 0.25, 1.0)
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    });
    
    easings.set('ease-in', (t: number) => t * t * t);
    easings.set('ease-out', (t: number) => 1 - Math.pow(1 - t, 3));
    easings.set('ease-in-out', (t: number) => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    });
    
    // Sine easings
    easings.set('ease-in-sine', (t: number) => 1 - Math.cos((t * Math.PI) / 2));
    easings.set('ease-out-sine', (t: number) => Math.sin((t * Math.PI) / 2));
    easings.set('ease-in-out-sine', (t: number) => -(Math.cos(Math.PI * t) - 1) / 2);
    
    return easings;
  }

  /**
   * Set camera state
   * Validates: Requirements 6.1
   */
  setState(state: Partial<CameraState>): void {
    this.state = {
      ...this.state,
      ...state,
    };
    this.applyTransform();
  }

  /**
   * Get current camera state
   * Validates: Requirements 6.1
   */
  getState(): CameraState {
    return { ...this.state };
  }

  /**
   * Add camera animation
   * Validates: Requirements 6.4, 6.5
   */
  addAnimation(animation: CameraAnimation): void {
    this.animations.push(animation);
  }

  /**
   * Clear all camera animations
   */
  clearAnimations(): void {
    this.animations = [];
  }

  /**
   * Update camera for current time
   * Validates: Requirements 6.4, 6.5
   */
  update(timeMs: number): void {
    const newState: Partial<CameraState> = {};
    let stateChanged = false;

    // Process all active animations
    for (const animation of this.animations) {
      if (timeMs >= animation.startMs && timeMs <= animation.endMs) {
        // Calculate progress (0-1)
        const duration = animation.endMs - animation.startMs;
        const elapsed = timeMs - animation.startMs;
        const progress = duration > 0 ? elapsed / duration : 1;

        // Apply easing function
        const easingFn = this.easingFunctions.get(animation.easing) || ((t: number) => t);
        const easedProgress = easingFn(progress);

        // Interpolate value
        const value = animation.from + (animation.to - animation.from) * easedProgress;
        newState[animation.property] = value;
        stateChanged = true;
      }
    }

    // Update state if any animations were active
    if (stateChanged) {
      this.setState(newState);
    }
  }

  /**
   * Apply camera transform to container (for DOM layers)
   * Validates: Requirements 6.2
   */
  applyTransform(): void {
    const { x, y, zoom, rotate } = this.state;
    
    // Build CSS transform string
    // Note: We translate by negative camera position to move the world
    const transform = `translate(${-x}px, ${-y}px) scale(${zoom}) rotate(${rotate}deg)`;
    
    this.container.style.transform = transform;
    this.container.style.transformOrigin = 'center center';
  }

  /**
   * Reset camera to default state
   */
  reset(): void {
    this.state = {
      x: 0,
      y: 0,
      zoom: 1.0,
      rotate: 0,
    };
    this.animations = [];
    this.applyTransform();
  }

  /**
   * Get transform matrix for canvas rendering
   * Validates: Requirements 6.3
   */
  getTransformMatrix(): DOMMatrix {
    const { x, y, zoom, rotate } = this.state;
    
    // Check if DOMMatrix is available (not available in Node.js test environment)
    if (typeof DOMMatrix === 'undefined') {
      // Return a mock matrix for testing
      const rotateRad = (rotate * Math.PI) / 180;
      const cos = Math.cos(rotateRad);
      const sin = Math.sin(rotateRad);
      
      return {
        a: zoom * cos,
        b: zoom * sin,
        c: -zoom * sin,
        d: zoom * cos,
        e: -x * zoom,
        f: -y * zoom,
      } as DOMMatrix;
    }
    
    // Create a new DOMMatrix
    const matrix = new DOMMatrix();
    
    // Apply transformations in order:
    // 1. Translate by camera position (negative to move world)
    // 2. Scale (zoom)
    // 3. Rotate
    
    return matrix
      .translate(-x, -y)
      .scale(zoom, zoom)
      .rotate(0, 0, rotate);
  }

  /**
   * Check if camera has any active animations at the given time
   */
  hasActiveAnimations(timeMs: number): boolean {
    return this.animations.some(
      anim => timeMs >= anim.startMs && timeMs <= anim.endMs
    );
  }

  /**
   * Get all animations
   */
  getAnimations(): CameraAnimation[] {
    return [...this.animations];
  }
}
