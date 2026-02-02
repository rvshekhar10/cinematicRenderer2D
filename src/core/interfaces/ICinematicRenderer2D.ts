/**
 * Main interface for the CinematicRenderer2D engine
 */

import type { QualityLevel } from '../../types/QualityTypes';
import type { PlaybackState } from '../CinematicRenderer2D';

export interface ICinematicRenderer2D {
  // Lifecycle methods
  mount(): Promise<void>;
  play(): void;
  pause(): void;
  stop(): void;
  destroy(): void;
  
  // Navigation methods
  seek(timeMs: number): void;
  goToEvent(eventId: string): void;
  goToScene(sceneId: string): void;
  
  // Configuration methods
  setQuality(level: QualityLevel): void;
  resize(width: number, height: number): void;
  
  // Event system
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
  
  // State getters
  getCurrentTime(): number;
  getDuration(): number;
  isPlaying(): boolean;
  isPaused(): boolean;
  getCurrentEvent(): string | null;
  getCurrentScene(): string | null;
  getState(): PlaybackState;
  getQuality(): QualityLevel;
  isMounted(): boolean;
}