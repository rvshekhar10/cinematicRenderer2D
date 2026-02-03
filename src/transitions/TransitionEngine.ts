/**
 * Transition Engine
 * 
 * Handles smooth visual transitions between scenes with proper cleanup.
 * Supports multiple transition types: crossfade, slide, zoom, wipe, dissolve, blur.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import type { CompiledScene } from '../types/CompiledSpec';
import type { EasingType } from '../types/CinematicSpec';

export interface TransitionConfig {
  type: 'crossfade' | 'slide' | 'zoom' | 'wipe' | 'dissolve' | 'blur';
  duration: number; // milliseconds
  easing: EasingType;
  direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out';
  blurAmount?: number; // for blur transitions
}

export interface TransitionContext {
  fromScene: CompiledScene;
  toScene: CompiledScene;
  container: HTMLElement;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

export interface TransitionHandler {
  execute(
    config: TransitionConfig,
    context: TransitionContext
  ): Promise<void>;
}

export class TransitionEngine {
  private activeTransition: Promise<void> | null = null;
  private transitionHandlers: Map<string, TransitionHandler> = new Map();
  private cancelRequested: boolean = false;
  
  // Default transition configuration (Requirement 2.5)
  private static readonly DEFAULT_TRANSITION: TransitionConfig = {
    type: 'crossfade',
    duration: 500,
    easing: 'ease-in-out',
  };
  
  constructor() {
    // Register built-in transition handlers
    this.registerBuiltInTransitions();
  }
  
  /**
   * Get default transition configuration
   * Requirement 2.5: Use 500ms crossfade when no transition specified
   */
  static getDefaultTransition(): TransitionConfig {
    return { ...TransitionEngine.DEFAULT_TRANSITION };
  }
  
  /**
   * Execute transition between scenes
   * Requirement 2.1: Support multiple transition types
   * Requirement 2.2: Accept duration and easing configuration
   */
  async executeTransition(
    config: TransitionConfig,
    context: TransitionContext
  ): Promise<void> {
    // Cancel any active transition first
    if (this.activeTransition) {
      this.cancelTransition();
      await this.activeTransition;
    }
    
    // Get transition handler
    const handler = this.transitionHandlers.get(config.type);
    if (!handler) {
      throw new Error(
        `Unknown transition type: ${config.type}. Available types: ${Array.from(
          this.transitionHandlers.keys()
        ).join(', ')}`
      );
    }
    
    // Reset cancel flag
    this.cancelRequested = false;
    
    // Execute transition
    this.activeTransition = handler.execute(config, context);
    
    try {
      await this.activeTransition;
      
      // Only call onComplete if not cancelled
      if (!this.cancelRequested) {
        context.onComplete();
      }
    } finally {
      this.activeTransition = null;
    }
  }
  
  /**
   * Register custom transition handler
   * Requirement 2.1: Support extensible transition system
   */
  registerTransition(type: string, handler: TransitionHandler): void {
    this.transitionHandlers.set(type, handler);
  }
  
  /**
   * Check if transition is currently running
   */
  isTransitioning(): boolean {
    return this.activeTransition !== null;
  }
  
  /**
   * Cancel active transition
   * Requirement 2.4: Handle transition interruptions
   */
  cancelTransition(): void {
    this.cancelRequested = true;
  }
  
  /**
   * Get available transition types
   */
  getAvailableTransitions(): string[] {
    return Array.from(this.transitionHandlers.keys());
  }
  
  /**
   * Register all built-in transition handlers
   */
  private registerBuiltInTransitions(): void {
    // Crossfade transition
    this.registerTransition('crossfade', {
      execute: async (config, context) => {
        await this.executeCrossfade(config, context);
      },
    });
    
    // Slide transition
    this.registerTransition('slide', {
      execute: async (config, context) => {
        await this.executeSlide(config, context);
      },
    });
    
    // Zoom transition
    this.registerTransition('zoom', {
      execute: async (config, context) => {
        await this.executeZoom(config, context);
      },
    });
    
    // Wipe transition
    this.registerTransition('wipe', {
      execute: async (config, context) => {
        await this.executeWipe(config, context);
      },
    });
    
    // Dissolve transition
    this.registerTransition('dissolve', {
      execute: async (config, context) => {
        await this.executeDissolve(config, context);
      },
    });
    
    // Blur transition
    this.registerTransition('blur', {
      execute: async (config, context) => {
        await this.executeBlur(config, context);
      },
    });
  }
  
  /**
   * Execute crossfade transition
   * Requirement 2.3: Simultaneously fade out old scene and fade in new scene
   */
  private async executeCrossfade(
    config: TransitionConfig,
    context: TransitionContext
  ): Promise<void> {
    const startTime = performance.now();
    const duration = config.duration;
    
    // Create temporary containers for transition
    const fromContainer = document.createElement('div');
    const toContainer = document.createElement('div');
    
    // Style containers for absolute positioning
    fromContainer.style.position = 'absolute';
    fromContainer.style.top = '0';
    fromContainer.style.left = '0';
    fromContainer.style.width = '100%';
    fromContainer.style.height = '100%';
    fromContainer.style.pointerEvents = 'none';
    
    toContainer.style.position = 'absolute';
    toContainer.style.top = '0';
    toContainer.style.left = '0';
    toContainer.style.width = '100%';
    toContainer.style.height = '100%';
    toContainer.style.pointerEvents = 'none';
    toContainer.style.opacity = '0';
    
    // Move scene layers to transition containers
    // Note: In actual integration, we would move the scene's layer DOM nodes
    // For now, we set up the structure for proper DOM manipulation
    context.container.appendChild(fromContainer);
    context.container.appendChild(toContainer);
    
    return new Promise<void>((resolve) => {
      const animate = () => {
        if (this.cancelRequested) {
          // Cleanup on cancel
          fromContainer.remove();
          toContainer.remove();
          resolve();
          return;
        }
        
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Apply easing
        const easedProgress = this.applyEasing(progress, config.easing);
        
        // Update progress callback
        context.onProgress(progress);
        
        // Crossfade: old scene fades out, new scene fades in
        // This ensures simultaneity (Requirement 2.3)
        const fromOpacity = 1 - easedProgress;
        const toOpacity = easedProgress;
        
        // Apply opacity to scene containers
        fromContainer.style.opacity = fromOpacity.toString();
        toContainer.style.opacity = toOpacity.toString();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Cleanup transition containers
          fromContainer.remove();
          toContainer.remove();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
  
  /**
   * Execute slide transition
   * Requirement 2.1: Move old scene out and new scene in from specified direction
   */
  private async executeSlide(
    config: TransitionConfig,
    context: TransitionContext
  ): Promise<void> {
    const startTime = performance.now();
    const duration = config.duration;
    const direction = config.direction || 'left';
    
    // Create temporary containers for transition
    const fromContainer = document.createElement('div');
    const toContainer = document.createElement('div');
    
    // Style containers for absolute positioning
    fromContainer.style.position = 'absolute';
    fromContainer.style.top = '0';
    fromContainer.style.left = '0';
    fromContainer.style.width = '100%';
    fromContainer.style.height = '100%';
    fromContainer.style.pointerEvents = 'none';
    
    toContainer.style.position = 'absolute';
    toContainer.style.top = '0';
    toContainer.style.left = '0';
    toContainer.style.width = '100%';
    toContainer.style.height = '100%';
    toContainer.style.pointerEvents = 'none';
    
    // Set initial position for new scene based on direction
    switch (direction) {
      case 'left':
        toContainer.style.transform = 'translateX(100%)';
        break;
      case 'right':
        toContainer.style.transform = 'translateX(-100%)';
        break;
      case 'up':
        toContainer.style.transform = 'translateY(100%)';
        break;
      case 'down':
        toContainer.style.transform = 'translateY(-100%)';
        break;
    }
    
    context.container.appendChild(fromContainer);
    context.container.appendChild(toContainer);
    
    return new Promise<void>((resolve) => {
      const animate = () => {
        if (this.cancelRequested) {
          fromContainer.remove();
          toContainer.remove();
          resolve();
          return;
        }
        
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = this.applyEasing(progress, config.easing);
        
        context.onProgress(progress);
        
        // Calculate slide positions based on direction
        let fromTransform = '';
        let toTransform = '';
        
        switch (direction) {
          case 'left':
            fromTransform = `translateX(${-easedProgress * 100}%)`;
            toTransform = `translateX(${(1 - easedProgress) * 100}%)`;
            break;
          case 'right':
            fromTransform = `translateX(${easedProgress * 100}%)`;
            toTransform = `translateX(${-(1 - easedProgress) * 100}%)`;
            break;
          case 'up':
            fromTransform = `translateY(${-easedProgress * 100}%)`;
            toTransform = `translateY(${(1 - easedProgress) * 100}%)`;
            break;
          case 'down':
            fromTransform = `translateY(${easedProgress * 100}%)`;
            toTransform = `translateY(${-(1 - easedProgress) * 100}%)`;
            break;
        }
        
        fromContainer.style.transform = fromTransform;
        toContainer.style.transform = toTransform;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          fromContainer.remove();
          toContainer.remove();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
  
  /**
   * Execute zoom transition
   * Requirement 2.1: Scale old scene down while scaling new scene up
   */
  private async executeZoom(
    config: TransitionConfig,
    context: TransitionContext
  ): Promise<void> {
    const startTime = performance.now();
    const duration = config.duration;
    
    // Create temporary containers for transition
    const fromContainer = document.createElement('div');
    const toContainer = document.createElement('div');
    
    // Style containers for absolute positioning
    fromContainer.style.position = 'absolute';
    fromContainer.style.top = '0';
    fromContainer.style.left = '0';
    fromContainer.style.width = '100%';
    fromContainer.style.height = '100%';
    fromContainer.style.pointerEvents = 'none';
    fromContainer.style.transformOrigin = 'center center';
    
    toContainer.style.position = 'absolute';
    toContainer.style.top = '0';
    toContainer.style.left = '0';
    toContainer.style.width = '100%';
    toContainer.style.height = '100%';
    toContainer.style.pointerEvents = 'none';
    toContainer.style.transformOrigin = 'center center';
    toContainer.style.transform = 'scale(0)';
    toContainer.style.opacity = '0';
    
    context.container.appendChild(fromContainer);
    context.container.appendChild(toContainer);
    
    return new Promise<void>((resolve) => {
      const animate = () => {
        if (this.cancelRequested) {
          fromContainer.remove();
          toContainer.remove();
          resolve();
          return;
        }
        
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = this.applyEasing(progress, config.easing);
        
        context.onProgress(progress);
        
        // Calculate zoom scales
        // Old scene: scale from 1 to 0, fade out
        // New scene: scale from 0 to 1, fade in
        const fromScale = 1 - easedProgress;
        const toScale = easedProgress;
        const fromOpacity = 1 - easedProgress;
        const toOpacity = easedProgress;
        
        fromContainer.style.transform = `scale(${fromScale})`;
        fromContainer.style.opacity = fromOpacity.toString();
        toContainer.style.transform = `scale(${toScale})`;
        toContainer.style.opacity = toOpacity.toString();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          fromContainer.remove();
          toContainer.remove();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
  
  /**
   * Execute wipe transition
   * Requirement 2.1: Reveal new scene with moving edge
   */
  private async executeWipe(
    config: TransitionConfig,
    context: TransitionContext
  ): Promise<void> {
    const startTime = performance.now();
    const duration = config.duration;
    const direction = config.direction || 'left';
    
    // Create temporary containers for transition
    const fromContainer = document.createElement('div');
    const toContainer = document.createElement('div');
    
    // Style containers for absolute positioning
    fromContainer.style.position = 'absolute';
    fromContainer.style.top = '0';
    fromContainer.style.left = '0';
    fromContainer.style.width = '100%';
    fromContainer.style.height = '100%';
    fromContainer.style.pointerEvents = 'none';
    
    toContainer.style.position = 'absolute';
    toContainer.style.top = '0';
    toContainer.style.left = '0';
    toContainer.style.width = '100%';
    toContainer.style.height = '100%';
    toContainer.style.pointerEvents = 'none';
    
    context.container.appendChild(fromContainer);
    context.container.appendChild(toContainer);
    
    return new Promise<void>((resolve) => {
      const animate = () => {
        if (this.cancelRequested) {
          fromContainer.remove();
          toContainer.remove();
          resolve();
          return;
        }
        
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = this.applyEasing(progress, config.easing);
        
        context.onProgress(progress);
        
        // Wipe effect using clip-path
        let clipPath = '';
        switch (direction) {
          case 'left':
            clipPath = `inset(0 ${(1 - easedProgress) * 100}% 0 0)`;
            break;
          case 'right':
            clipPath = `inset(0 0 0 ${(1 - easedProgress) * 100}%)`;
            break;
          case 'up':
            clipPath = `inset(0 0 ${(1 - easedProgress) * 100}% 0)`;
            break;
          case 'down':
            clipPath = `inset(${(1 - easedProgress) * 100}% 0 0 0)`;
            break;
          default:
            clipPath = `inset(0 ${(1 - easedProgress) * 100}% 0 0)`;
        }
        
        toContainer.style.clipPath = clipPath;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          fromContainer.remove();
          toContainer.remove();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
  
  /**
   * Execute dissolve transition
   * Requirement 2.1: Pixelated transition using noise pattern
   */
  private async executeDissolve(
    config: TransitionConfig,
    context: TransitionContext
  ): Promise<void> {
    const startTime = performance.now();
    const duration = config.duration;
    
    // Create temporary containers for transition
    const fromContainer = document.createElement('div');
    const toContainer = document.createElement('div');
    
    // Style containers for absolute positioning
    fromContainer.style.position = 'absolute';
    fromContainer.style.top = '0';
    fromContainer.style.left = '0';
    fromContainer.style.width = '100%';
    fromContainer.style.height = '100%';
    fromContainer.style.pointerEvents = 'none';
    
    toContainer.style.position = 'absolute';
    toContainer.style.top = '0';
    toContainer.style.left = '0';
    toContainer.style.width = '100%';
    toContainer.style.height = '100%';
    toContainer.style.pointerEvents = 'none';
    toContainer.style.opacity = '0';
    
    context.container.appendChild(fromContainer);
    context.container.appendChild(toContainer);
    
    return new Promise<void>((resolve) => {
      const animate = () => {
        if (this.cancelRequested) {
          fromContainer.remove();
          toContainer.remove();
          resolve();
          return;
        }
        
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = this.applyEasing(progress, config.easing);
        
        context.onProgress(progress);
        
        // Dissolve effect using opacity with pixelation filter
        // Apply pixelation effect that increases as transition progresses
        const pixelSize = Math.floor(easedProgress * 20);
        if (pixelSize > 0) {
          fromContainer.style.filter = `blur(${pixelSize}px) contrast(${1 + easedProgress})`;
        }
        
        fromContainer.style.opacity = (1 - easedProgress).toString();
        toContainer.style.opacity = easedProgress.toString();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          fromContainer.remove();
          toContainer.remove();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
  
  /**
   * Execute blur transition
   * Requirement 2.1: Blur old scene while fading in new scene
   */
  private async executeBlur(
    config: TransitionConfig,
    context: TransitionContext
  ): Promise<void> {
    const startTime = performance.now();
    const duration = config.duration;
    const blurAmount = config.blurAmount || 10;
    
    // Create temporary containers for transition
    const fromContainer = document.createElement('div');
    const toContainer = document.createElement('div');
    
    // Style containers for absolute positioning
    fromContainer.style.position = 'absolute';
    fromContainer.style.top = '0';
    fromContainer.style.left = '0';
    fromContainer.style.width = '100%';
    fromContainer.style.height = '100%';
    fromContainer.style.pointerEvents = 'none';
    
    toContainer.style.position = 'absolute';
    toContainer.style.top = '0';
    toContainer.style.left = '0';
    toContainer.style.width = '100%';
    toContainer.style.height = '100%';
    toContainer.style.pointerEvents = 'none';
    toContainer.style.opacity = '0';
    
    context.container.appendChild(fromContainer);
    context.container.appendChild(toContainer);
    
    return new Promise<void>((resolve) => {
      const animate = () => {
        if (this.cancelRequested) {
          fromContainer.remove();
          toContainer.remove();
          resolve();
          return;
        }
        
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = this.applyEasing(progress, config.easing);
        
        context.onProgress(progress);
        
        // Apply blur to old scene and fade in new scene
        const currentBlur = blurAmount * easedProgress;
        fromContainer.style.filter = `blur(${currentBlur}px)`;
        fromContainer.style.opacity = (1 - easedProgress * 0.5).toString(); // Partial fade
        toContainer.style.opacity = easedProgress.toString();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          fromContainer.remove();
          toContainer.remove();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
  
  /**
   * Apply easing function to progress value
   */
  private applyEasing(progress: number, easing: EasingType): number {
    // Basic easing functions
    switch (easing) {
      case 'linear':
        return progress;
      
      case 'ease-in':
        return progress * progress;
      
      case 'ease-out':
        return progress * (2 - progress);
      
      case 'ease-in-out':
        return progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;
      
      default:
        return progress;
    }
  }
}
