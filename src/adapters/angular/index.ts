/**
 * Angular adapter for cinematicRenderer2D
 * 
 * Provides a CinematicPlayerComponent Angular component that wraps the core engine
 * with Angular-specific lifecycle management and event handling.
 * 
 * Requirements: 10.2, 10.3, 10.4, 10.5 - Angular integration with proper lifecycle
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import { CinematicRenderer2D, type CinematicRenderer2DOptions, type PlaybackState } from '../../core/CinematicRenderer2D';
import type { CinematicSpec } from '../../types/CinematicSpec';
import type { QualityLevel } from '../../types/QualityTypes';

export interface CinematicPlayerEvents {
  ready: void;
  play: { previousState: PlaybackState; currentTime: number };
  pause: { previousState: PlaybackState; currentTime: number };
  stop: { previousState: PlaybackState };
  seek: { previousTime: number; currentTime: number; currentEvent: string | null; currentScene: string | null };
  eventChange: { eventId: string; eventName: string; currentTime: number };
  sceneChange: { sceneId: string; sceneName: string; currentTime: number };
  qualityChange: { previousQuality: QualityLevel; currentQuality: QualityLevel; metrics?: any };
  resize: { width: number; height: number };
  frame: { currentTime: number; fps: number; deltaMs: number; currentEvent: string | null; currentScene: string | null };
  stateChange: { previousState: PlaybackState; currentState: PlaybackState };
  ended: void;
  error: Error;
  loading: void;
  destroy: { previousState: PlaybackState };
  audioError: { trackId: string; error: Error };
  autoplayBlocked: { trackId: string };
}

/**
 * CinematicPlayerComponent Angular Component
 * 
 * An Angular wrapper for the CinematicRenderer2D engine that handles:
 * - Angular lifecycle integration (ngOnInit/ngOnDestroy)
 * - Input/Output bindings for spec and events
 * - Event forwarding to Angular event system
 * - Automatic cleanup on component destruction
 */
@Component({
  selector: 'cinematic-player',
  template: `
    <div 
      #container 
      [class]="containerClass"
      [ngStyle]="containerStyle"
      style="width: 100%; height: 100%; position: relative; overflow: hidden;">
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CinematicPlayerComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  // Input properties
  @Input() spec!: CinematicSpec;
  @Input() autoplay: boolean = false;
  @Input() quality?: QualityLevel;
  @Input() debug: boolean = false;
  @Input() editorMode: boolean | Partial<import('../../editor/EditorMode').EditorModeConfig> = false;
  @Input() containerClass?: string;
  @Input() containerStyle?: { [key: string]: any };

  // Output events - forward all engine events to Angular event system
  @Output() ready = new EventEmitter<void>();
  @Output() play = new EventEmitter<CinematicPlayerEvents['play']>();
  @Output() pause = new EventEmitter<CinematicPlayerEvents['pause']>();
  @Output() stop = new EventEmitter<CinematicPlayerEvents['stop']>();
  @Output() seek = new EventEmitter<CinematicPlayerEvents['seek']>();
  @Output() eventChange = new EventEmitter<CinematicPlayerEvents['eventChange']>();
  @Output() sceneChange = new EventEmitter<CinematicPlayerEvents['sceneChange']>();
  @Output() qualityChange = new EventEmitter<CinematicPlayerEvents['qualityChange']>();
  @Output() resize = new EventEmitter<CinematicPlayerEvents['resize']>();
  @Output() frame = new EventEmitter<CinematicPlayerEvents['frame']>();
  @Output() stateChange = new EventEmitter<CinematicPlayerEvents['stateChange']>();
  @Output() ended = new EventEmitter<void>();
  @Output() error = new EventEmitter<Error>();
  @Output() loading = new EventEmitter<void>();
  @Output() destroy = new EventEmitter<CinematicPlayerEvents['destroy']>();
  @Output() audioError = new EventEmitter<CinematicPlayerEvents['audioError']>();
  @Output() autoplayBlocked = new EventEmitter<CinematicPlayerEvents['autoplayBlocked']>();

  private engine: CinematicRenderer2D | null = null;
  private initialized = false;

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    if (!this.spec) {
      throw new Error('CinematicPlayerComponent: spec input is required');
    }

    this.initializeEngine();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized) {
      // Handle spec changes by reinitializing the engine
      if (changes['spec'] && !changes['spec'].firstChange) {
        this.destroyEngine();
        this.initializeEngine();
      }

      // Handle quality changes
      if (changes['quality'] && !changes['quality'].firstChange && this.engine) {
        this.engine.setQuality(this.quality || 'auto');
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyEngine();
  }

  // Public API methods for programmatic control
  playEngine(): void {
    this.engine?.play();
  }

  pauseEngine(): void {
    this.engine?.pause();
  }

  stopEngine(): void {
    this.engine?.stop();
  }

  seekEngine(timeMs: number): void {
    this.engine?.seek(timeMs);
  }

  goToEvent(eventId: string): void {
    this.engine?.goToEvent(eventId);
  }

  goToScene(sceneId: string): void {
    this.engine?.goToScene(sceneId);
  }

  setQuality(level: QualityLevel): void {
    this.engine?.setQuality(level);
  }

  resizeEngine(width: number, height: number): void {
    this.engine?.resize(width, height);
  }

  // State getters
  getCurrentTime(): number {
    return this.engine?.getCurrentTime() ?? 0;
  }

  getDuration(): number {
    return this.engine?.getDuration() ?? 0;
  }

  isPlaying(): boolean {
    return this.engine?.isPlaying() ?? false;
  }

  isPaused(): boolean {
    return this.engine?.isPaused() ?? false;
  }

  getCurrentEvent(): string | null {
    return this.engine?.getCurrentEvent() ?? null;
  }

  getCurrentScene(): string | null {
    return this.engine?.getCurrentScene() ?? null;
  }

  getState(): PlaybackState {
    return this.engine?.getState() ?? 'idle';
  }

  getQuality(): QualityLevel {
    return this.engine?.getQuality() ?? 'auto';
  }

  isMounted(): boolean {
    return this.engine?.isMounted() ?? false;
  }

  // Performance monitoring
  getCurrentFps(): number {
    return this.engine?.getCurrentFps() ?? 0;
  }

  getPerformanceMetrics(): any {
    return this.engine?.getPerformanceMetrics();
  }

  getQualitySettings(): any {
    return this.engine?.getQualitySettings();
  }

  getDeviceCapabilities(): any {
    return this.engine?.getDeviceCapabilities();
  }

  // Audio methods
  setMasterVolume(volume: number): void {
    this.engine?.setMasterVolume(volume);
  }

  getMasterVolume(): number {
    return this.engine?.getMasterVolume() ?? 1;
  }

  isWebAudioAvailable(): boolean {
    return this.engine?.isWebAudioAvailable() ?? false;
  }

  getActiveAudioTrackCount(): number {
    return this.engine?.getActiveAudioTrackCount() ?? 0;
  }

  // Debug methods
  isDebugEnabled(): boolean {
    return this.engine?.isDebugEnabled() ?? false;
  }

  toggleDebug(): void {
    this.engine?.toggleDebug();
  }

  showDebug(): void {
    this.engine?.showDebug();
  }

  hideDebug(): void {
    this.engine?.hideDebug();
  }

  // Editor mode methods
  isEditorModeEnabled(): boolean {
    return this.engine?.isEditorModeEnabled() ?? false;
  }

  toggleEditorMode(): void {
    this.engine?.toggleEditorMode();
  }

  showEditorMode(): void {
    this.engine?.showEditorMode();
  }

  hideEditorMode(): void {
    this.engine?.hideEditorMode();
  }

  getEditorMode(): import('../../editor/EditorMode').EditorMode | null {
    return this.engine?.getEditorMode() ?? null;
  }

  // Direct engine access for advanced use cases
  getEngine(): CinematicRenderer2D | null {
    return this.engine;
  }

  private initializeEngine(): void {
    if (!this.containerRef?.nativeElement) {
      throw new Error('Container element not available');
    }

    try {
      const options: CinematicRenderer2DOptions = {
        container: this.containerRef.nativeElement,
        spec: this.spec,
        autoplay: this.autoplay,
        quality: this.quality,
        debug: this.debug,
        editorMode: this.editorMode,
      };

      this.engine = new CinematicRenderer2D(options);
      this.setupEventListeners();

      // Mount the engine outside Angular zone to avoid triggering change detection on every frame
      this.ngZone.runOutsideAngular(() => {
        this.engine!.mount().catch((error) => {
          console.error('Failed to mount CinematicRenderer2D:', error);
          this.ngZone.run(() => {
            this.error.emit(error);
          });
        });
      });

      this.initialized = true;

    } catch (error) {
      console.error('Failed to initialize CinematicRenderer2D:', error);
      this.error.emit(error as Error);
    }
  }

  private setupEventListeners(): void {
    if (!this.engine) return;

    // Forward all engine events to Angular outputs
    // Run event emissions inside Angular zone to trigger change detection
    this.engine.on('ready', () => {
      this.ngZone.run(() => this.ready.emit());
    });

    this.engine.on('play', (event: CinematicPlayerEvents['play']) => {
      this.ngZone.run(() => this.play.emit(event));
    });

    this.engine.on('pause', (event: CinematicPlayerEvents['pause']) => {
      this.ngZone.run(() => this.pause.emit(event));
    });

    this.engine.on('stop', (event: CinematicPlayerEvents['stop']) => {
      this.ngZone.run(() => this.stop.emit(event));
    });

    this.engine.on('seek', (event: CinematicPlayerEvents['seek']) => {
      this.ngZone.run(() => this.seek.emit(event));
    });

    this.engine.on('eventChange', (event: CinematicPlayerEvents['eventChange']) => {
      this.ngZone.run(() => this.eventChange.emit(event));
    });

    this.engine.on('sceneChange', (event: CinematicPlayerEvents['sceneChange']) => {
      this.ngZone.run(() => this.sceneChange.emit(event));
    });

    this.engine.on('qualityChange', (event: CinematicPlayerEvents['qualityChange']) => {
      this.ngZone.run(() => this.qualityChange.emit(event));
    });

    this.engine.on('resize', (event: CinematicPlayerEvents['resize']) => {
      this.ngZone.run(() => this.resize.emit(event));
    });

    this.engine.on('frame', (event: CinematicPlayerEvents['frame']) => {
      // Frame events are high-frequency, so we might want to throttle these
      // or only emit them when specifically needed to avoid performance issues
      this.ngZone.run(() => this.frame.emit(event));
    });

    this.engine.on('stateChange', (event: CinematicPlayerEvents['stateChange']) => {
      this.ngZone.run(() => this.stateChange.emit(event));
    });

    this.engine.on('ended', () => {
      this.ngZone.run(() => this.ended.emit());
    });

    this.engine.on('error', (error: Error) => {
      this.ngZone.run(() => this.error.emit(error));
    });

    this.engine.on('loading', () => {
      this.ngZone.run(() => this.loading.emit());
    });

    this.engine.on('destroy', (event: CinematicPlayerEvents['destroy']) => {
      this.ngZone.run(() => this.destroy.emit(event));
    });

    this.engine.on('audioError', (event: CinematicPlayerEvents['audioError']) => {
      this.ngZone.run(() => this.audioError.emit(event));
    });

    this.engine.on('autoplayBlocked', (event: CinematicPlayerEvents['autoplayBlocked']) => {
      this.ngZone.run(() => this.autoplayBlocked.emit(event));
    });
  }

  private destroyEngine(): void {
    if (this.engine) {
      this.engine.destroy();
      this.engine = null;
    }
    this.initialized = false;
  }
}