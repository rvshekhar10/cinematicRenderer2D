/**
 * Angular adapter entry point for cinematicRenderer2D
 * 
 * This module provides Angular-specific components and services for integrating
 * the cinematicRenderer2D engine into Angular applications.
 */

// Re-export core types that Angular users will need
export type {
  CinematicSpec,
  CinematicEvent,
  CinematicScene,
  LayerSpec,
  LayerType,
  QualityLevel,
  PlaybackState,
} from './index';

// Export Angular-specific components and types
export { CinematicPlayerComponent } from './adapters/angular/index';
export type { CinematicPlayerEvents } from './adapters/angular/index';