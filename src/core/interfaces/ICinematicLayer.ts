/**
 * Interface for cinematic layers - the building blocks of scenes
 */

import type { LayerMountContext, FrameContext } from './LayerContext';

export interface ICinematicLayer {
  readonly id: string;
  readonly type: string;
  readonly zIndex: number;
  
  // Lifecycle methods
  mount(ctx: LayerMountContext): void;
  update(ctx: FrameContext): void;
  destroy(): void;
  
  // Optional methods for advanced layers
  resize?(width: number, height: number): void;
  setVisible?(visible: boolean): void;
  setOpacity?(opacity: number): void;
}