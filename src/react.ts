/**
 * React adapter entry point for cinematicRenderer2D
 * 
 * This module provides React-specific components and hooks for integrating
 * the cinematicRenderer2D engine into React applications.
 */

// Re-export core types that React users will need
export type {
  CinematicSpec,
  CinematicEvent,
  CinematicScene,
  LayerSpec,
  LayerType,
  QualityLevel,
  PlaybackState,
} from './index';

// Export React-specific components and types
export { CinematicPlayer } from './adapters/react/index';
export type { CinematicPlayerProps, CinematicPlayerRef } from './adapters/react/index';