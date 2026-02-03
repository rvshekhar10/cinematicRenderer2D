# Angular Integration Guide

This guide covers how to integrate cinematicRenderer2D into Angular applications, including setup, usage patterns, and best practices.

## Installation

```bash
npm install cinematic-renderer2d
```

## Basic Setup

### Import the Angular Module

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CinematicPlayerModule } from 'cinematic-renderer2d/angular';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CinematicPlayerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Basic Component Usage

```typescript
import { Component } from '@angular/core';
import type { CinematicSpec, QualityLevel } from 'cinematic-renderer2d';

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <cinematic-player
        [spec]="cinematicSpec"
        [autoplay]="true"
        [quality]="'auto'"
        [debug]="false"
        (play)="onPlay()"
        (pause)="onPause()"
        (end)="onEnd()"
        (error)="onError($event)">
      </cinematic-player>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  cinematicSpec: CinematicSpec = {
    schemaVersion: '1.0.0',
    engine: {
      targetFps: 60,
      quality: 'auto'
    },
    events: [{
      id: 'intro',
      name: 'Introduction',
      scenes: ['scene1']
    }],
    scenes: [{
      id: 'scene1',
      name: 'Opening Scene',
      duration: 5000,
      layers: [{
        id: 'background',
        type: 'gradient',
        zIndex: 1,
        config: {
          colors: ['#000000', '#333333']
        }
      }]
    }]
  };

  onPlay(): void {
    console.log('Playback started');
  }

  onPause(): void {
    console.log('Playback paused');
  }

  onEnd(): void {
    console.log('Playback completed');
  }

  onError(error: Error): void {
    console.error('Playback error:', error);
  }
}
```

## Component API

### Inputs

```typescript
@Input() spec: CinematicSpec;              // JSON specification (required)
@Input() autoplay: boolean = false;        // Auto-start playback
@Input() quality: QualityLevel = 'auto';   // Quality level
@Input() debug: boolean = false;           // Enable debug overlay
@Input() editorMode: boolean | Partial<EditorModeConfig> = false; // Enable editor mode
```

### Editor Mode Configuration

```typescript
interface EditorModeConfig {
  enabled: boolean;
  showTimeline?: boolean;              // Show timeline scrubber (default: true)
  showBoundingBoxes?: boolean;         // Show layer bounding boxes (default: true)
  showPropertyInspector?: boolean;     // Show property inspector (default: true)
  showPerformanceMetrics?: boolean;    // Show performance metrics (default: true)
  autoEnableWithDebug?: boolean;       // Auto-enable with debug mode (default: true)
}
```

### Outputs

```typescript
@Output() play = new EventEmitter<void>();                    // Playback started
@Output() pause = new EventEmitter<void>();                   // Playback paused
@Output() stop = new EventEmitter<void>();                    // Playback stopped
@Output() end = new EventEmitter<void>();                     // Playback completed
@Output() error = new EventEmitter<Error>();                  // Error occurred
@Output() qualityChange = new EventEmitter<QualityLevel>();   // Quality changed
@Output() sceneChange = new EventEmitter<string>();           // Scene changed
@Output() eventChange = new EventEmitter<string>();           // Event changed
```

## Advanced Usage Patterns

### Imperative API Access

The `CinematicPlayerComponent` provides comprehensive methods for programmatic control:

```typescript
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CinematicPlayerComponent } from 'cinematic-renderer2d/angular';
import type { CinematicSpec, QualityLevel } from 'cinematic-renderer2d';

@Component({
  selector: 'app-imperative-api',
  template: `
    <div class="api-example">
      <cinematic-player
        #player
        [spec]="spec"
        [autoplay]="false">
      </cinematic-player>
      
      <div class="controls">
        <button (click)="play()">Play</button>
        <button (click)="pause()">Pause</button>
        <button (click)="stop()">Stop</button>
        <button (click)="seek(5000)">Seek to 5s</button>
        <button (click)="toggleDebug()">Toggle Debug</button>
        <button (click)="toggleEditor()">Toggle Editor</button>
        <button (click)="setVolume(0.5)">50% Volume</button>
      </div>
      
      <div class="info">
        <p>Time: {{ getCurrentTime() }}ms / {{ getDuration() }}ms</p>
        <p>FPS: {{ getCurrentFps() }}</p>
        <p>Playing: {{ isPlaying() ? 'Yes' : 'No' }}</p>
        <p>Debug: {{ isDebugEnabled() ? 'On' : 'Off' }}</p>
        <p>Editor: {{ isEditorEnabled() ? 'On' : 'Off' }}</p>
      </div>
    </div>
  `
})
export class ImperativeAPIComponent implements AfterViewInit {
  @ViewChild('player') player!: CinematicPlayerComponent;
  
  spec: CinematicSpec = {
    // Your specification here
  };

  ngAfterViewInit(): void {
    // Player is now available
  }

  // Playback control
  play(): void {
    this.player.playEngine();
  }

  pause(): void {
    this.player.pauseEngine();
  }

  stop(): void {
    this.player.stopEngine();
  }

  seek(timeMs: number): void {
    this.player.seekEngine(timeMs);
  }

  // Navigation
  goToEvent(eventId: string): void {
    this.player.goToEvent(eventId);
  }

  goToScene(sceneId: string): void {
    this.player.goToScene(sceneId);
  }

  // Quality control
  setQuality(level: QualityLevel): void {
    this.player.setQuality(level);
  }

  // Debug and editor mode
  toggleDebug(): void {
    this.player.toggleDebug();
  }

  toggleEditor(): void {
    this.player.toggleEditorMode();
  }

  showDebug(): void {
    this.player.showDebug();
  }

  hideDebug(): void {
    this.player.hideDebug();
  }

  showEditor(): void {
    this.player.showEditorMode();
  }

  hideEditor(): void {
    this.player.hideEditorMode();
  }

  // State queries
  getCurrentTime(): number {
    return this.player.getCurrentTime();
  }

  getDuration(): number {
    return this.player.getDuration();
  }

  isPlaying(): boolean {
    return this.player.isPlaying();
  }

  getCurrentFps(): number {
    return this.player.getCurrentFps();
  }

  isDebugEnabled(): boolean {
    return this.player.isDebugEnabled();
  }

  isEditorEnabled(): boolean {
    return this.player.isEditorModeEnabled();
  }

  // Audio control
  setVolume(volume: number): void {
    this.player.setMasterVolume(volume);
  }

  getVolume(): number {
    return this.player.getMasterVolume();
  }
}
```

### Editor Mode Usage

```typescript
// cinematic.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { CinematicSpec, QualityLevel } from 'cinematic-renderer2d';

@Injectable({
  providedIn: 'root'
})
export class CinematicService {
  private playingSubject = new BehaviorSubject<boolean>(false);
  private qualitySubject = new BehaviorSubject<QualityLevel>('auto');
  private errorSubject = new BehaviorSubject<Error | null>(null);

  public playing$ = this.playingSubject.asObservable();
  public quality$ = this.qualitySubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  setPlaying(playing: boolean): void {
    this.playingSubject.next(playing);
  }

  setQuality(quality: QualityLevel): void {
    this.qualitySubject.next(quality);
  }

  setError(error: Error | null): void {
    this.errorSubject.next(error);
  }

  async loadSpec(url: string): Promise<CinematicSpec> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load spec: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }
}
```

```typescript
// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CinematicService } from './cinematic.service';
import type { CinematicSpec, QualityLevel } from 'cinematic-renderer2d';

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <cinematic-player
        [spec]="spec"
        [autoplay]="false"
        [quality]="currentQuality"
        (play)="cinematicService.setPlaying(true)"
        (pause)="cinematicService.setPlaying(false)"
        (error)="cinematicService.setError($event)"
        (qualityChange)="cinematicService.setQuality($event)">
      </cinematic-player>
      
      <div class="controls">
        <button (click)="togglePlayback()">
          {{ (cinematicService.playing$ | async) ? 'Pause' : 'Play' }}
        </button>
        <select [(ngModel)]="currentQuality" (change)="onQualityChange()">
          <option value="auto">Auto</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="ultra">Ultra</option>
        </select>
      </div>
      
      <div class="status" *ngIf="cinematicService.error$ | async as error">
        Error: {{ error.message }}
      </div>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  spec: CinematicSpec | null = null;
  currentQuality: QualityLevel = 'auto';
  
  private destroy$ = new Subject<void>();

  constructor(public cinematicService: CinematicService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.spec = await this.cinematicService.loadSpec('/assets/cinematic-spec.json');
    } catch (error) {
      console.error('Failed to load cinematic spec:', error);
    }

    // Subscribe to quality changes
    this.cinematicService.quality$
      .pipe(takeUntil(this.destroy$))
      .subscribe(quality => {
        this.currentQuality = quality;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePlayback(): void {
    // This would require a reference to the player component
    // See the ViewChild example below
  }

  onQualityChange(): void {
    this.cinematicService.setQuality(this.currentQuality);
  }
}
```

### Editor Mode Usage

```typescript
import { Component } from '@angular/core';
import type { CinematicSpec } from 'cinematic-renderer2d';

@Component({
  selector: 'app-editor-mode',
  template: `
    <div class="editor-container">
      <cinematic-player
        [spec]="cinematicSpec"
        [editorMode]="true"
        [debug]="false"
        (play)="onPlay()"
        (pause)="onPause()">
      </cinematic-player>
      
      <div class="controls">
        <button (click)="toggleEditor()">Toggle Editor Mode</button>
        <button (click)="toggleDebug()">Toggle Debug Overlay</button>
      </div>
    </div>
  `
})
export class EditorModeComponent {
  cinematicSpec: CinematicSpec = {
    // Your specification here
  };

  toggleEditor(): void {
    // Access via ViewChild
  }

  toggleDebug(): void {
    // Access via ViewChild
  }

  onPlay(): void {
    console.log('Playback started');
  }

  onPause(): void {
    console.log('Playback paused');
  }
}

// Advanced editor mode configuration
@Component({
  selector: 'app-advanced-editor',
  template: `
    <cinematic-player
      [spec]="cinematicSpec"
      [editorMode]="editorConfig">
    </cinematic-player>
  `
})
export class AdvancedEditorComponent {
  cinematicSpec: CinematicSpec = {
    // Your specification here
  };

  editorConfig = {
    enabled: true,
    showTimeline: true,
    showBoundingBoxes: true,
    showPropertyInspector: true,
    showPerformanceMetrics: true,
    autoEnableWithDebug: true
  };
}
```

### Editor Mode Features

The editor mode provides several visual development tools:

- **Timeline Scrubber**: Visual timeline with scene markers and draggable scrubber for precise time navigation
- **Bounding Boxes**: Visual outlines around all layers with click-to-inspect functionality
- **Property Inspector**: Real-time property viewer for selected layers
- **Performance Metrics**: Integrated debug overlay showing FPS, frame time, and quality settings
- **Keyboard Shortcuts**: Press `Ctrl+E` (or `Cmd+E` on Mac) to toggle editor mode

```typescript
// Example: Using editor mode with keyboard shortcuts
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-editor-shortcuts',
  template: `
    <cinematic-player
      [spec]="cinematicSpec"
      [editorMode]="true">
    </cinematic-player>
    <div class="shortcuts-info">
      <p>Ctrl+E / Cmd+E: Toggle Editor Mode</p>
      <p>Ctrl+D / Cmd+D: Toggle Debug Overlay</p>
    </div>
  `
})
export class EditorShortcutsComponent {
  cinematicSpec: CinematicSpec = {
    // Your specification here
  };

  @HostListener('window:keydown', ['$event'])
  handleKeyPress(event: KeyboardEvent): void {
    // Ctrl+E or Cmd+E toggles editor mode
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
      event.preventDefault();
      // Toggle editor mode via ViewChild reference
    }
    // Ctrl+D or Cmd+D toggles debug overlay
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
      event.preventDefault();
      // Toggle debug via ViewChild reference
    }
  }
}
```

### Service-Based Architecture

```typescript
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CinematicPlayerComponent } from 'cinematic-renderer2d/angular';
import type { CinematicSpec } from 'cinematic-renderer2d';

@Component({
  selector: 'app-cinematic-control',
  template: `
    <div class="cinematic-container">
      <cinematic-player
        #cinematicPlayer
        [spec]="spec"
        [autoplay]="false"
        [editorMode]="false"
        (play)="onPlay()"
        (pause)="onPause()">
      </cinematic-player>
      
      <div class="control-panel">
        <button (click)="play()">Play</button>
        <button (click)="pause()">Pause</button>
        <button (click)="stop()">Stop</button>
        <button (click)="restart()">Restart</button>
        <button (click)="goToScene('scene2')">Go to Scene 2</button>
        <button (click)="setHighQuality()">High Quality</button>
        <button (click)="toggleDebug()">Toggle Debug</button>
        <button (click)="toggleEditor()">Toggle Editor</button>
      </div>
      
      <div class="timeline">
        <input 
          type="range" 
          [min]="0" 
          [max]="totalDuration" 
          [value]="currentTime"
          (input)="seekTo($event)"
          class="timeline-slider">
      </div>
    </div>
  `
})
export class CinematicControlComponent implements AfterViewInit {
  @ViewChild('cinematicPlayer') cinematicPlayer!: CinematicPlayerComponent;
  
  spec: CinematicSpec = {
    // Your specification here
  };
  
  currentTime = 0;
  totalDuration = 0;
  isPlaying = false;

  ngAfterViewInit(): void {
    // Access the underlying renderer after view init
    if (this.cinematicPlayer.renderer) {
      // Set up additional event listeners or configurations
      this.totalDuration = this.cinematicPlayer.renderer.getTotalDuration();
    }
  }

  play(): void {
    this.cinematicPlayer.play();
  }

  pause(): void {
    this.cinematicPlayer.pause();
  }

  stop(): void {
    this.cinematicPlayer.stop();
  }

  restart(): void {
    this.cinematicPlayer.seek(0);
    this.cinematicPlayer.play();
  }

  goToScene(sceneId: string): void {
    this.cinematicPlayer.goToScene(sceneId);
  }

  setHighQuality(): void {
    this.cinematicPlayer.setQuality('high');
  }

  toggleDebug(): void {
    this.cinematicPlayer.toggleDebug();
  }

  toggleEditor(): void {
    this.cinematicPlayer.toggleEditorMode();
  }

  seekTo(event: Event): void {
    const target = event.target as HTMLInputElement;
    const timeMs = parseInt(target.value, 10);
    this.cinematicPlayer.seekEngine(timeMs);
  }

  onPlay(): void {
    this.isPlaying = true;
  }

  onPause(): void {
    this.isPlaying = false;
  }
}
```

### Reactive Forms Integration

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import type { CinematicSpec, QualityLevel } from 'cinematic-renderer2d';

@Component({
  selector: 'app-cinematic-form',
  template: `
    <form [formGroup]="cinematicForm" class="cinematic-form">
      <div class="form-group">
        <label for="autoplay">Autoplay:</label>
        <input 
          type="checkbox" 
          id="autoplay"
          formControlName="autoplay">
      </div>
      
      <div class="form-group">
        <label for="quality">Quality:</label>
        <select id="quality" formControlName="quality">
          <option value="auto">Auto</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="ultra">Ultra</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="debug">Debug Mode:</label>
        <input 
          type="checkbox" 
          id="debug"
          formControlName="debug">
      </div>
      
      <div class="form-group">
        <label for="editorMode">Editor Mode:</label>
        <input 
          type="checkbox" 
          id="editorMode"
          formControlName="editorMode">
      </div>
    </form>
    
    <cinematic-player
      [spec]="spec"
      [autoplay]="cinematicForm.get('autoplay')?.value"
      [quality]="cinematicForm.get('quality')?.value"
      [debug]="cinematicForm.get('debug')?.value"
      (play)="onPlay()"
      (error)="onError($event)">
    </cinematic-player>
  `
})
export class CinematicFormComponent implements OnInit {
  cinematicForm: FormGroup;
  spec: CinematicSpec = {
    // Your specification here
  };

  constructor(private fb: FormBuilder) {
    this.cinematicForm = this.fb.group({
      autoplay: [false],
      quality: ['auto', Validators.required],
      debug: [false],
      editorMode: [false]
    });
  }

  ngOnInit(): void {
    // React to form changes
    this.cinematicForm.valueChanges.subscribe(values => {
      console.log('Cinematic settings changed:', values);
    });
  }

  onPlay(): void {
    console.log('Playback started with settings:', this.cinematicForm.value);
  }

  onError(error: Error): void {
    console.error('Cinematic error:', error);
  }
}
```

## Styling and Layout

### Component Styles

```scss
// cinematic-player.component.scss
.cinematic-container {
  width: 100%;
  height: 100vh;
  position: relative;
  background: #000;
  overflow: hidden;
}

cinematic-player {
  display: block;
  width: 100%;
  height: 100%;
}

.control-panel {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 1000;
  
  button {
    padding: 10px 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 0.9);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.timeline {
  position: absolute;
  bottom: 80px;
  left: 20px;
  right: 20px;
  z-index: 1000;
  
  .timeline-slider {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
    
    &::-webkit-slider-thumb {
      appearance: none;
      width: 16px;
      height: 16px;
      background: #fff;
      border-radius: 50%;
      cursor: pointer;
    }
    
    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #fff;
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .control-panel {
    bottom: 10px;
    gap: 5px;
    
    button {
      padding: 8px 16px;
      font-size: 14px;
    }
  }
  
  .timeline {
    bottom: 60px;
    left: 10px;
    right: 10px;
  }
}
```

### Global Styles

```scss
// styles.scss (global styles)
.cinematic-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #000;
  color: white;
  font-size: 18px;
  
  &::after {
    content: '';
    width: 20px;
    height: 20px;
    margin-left: 10px;
    border: 2px solid transparent;
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

.cinematic-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #1a1a1a;
  color: #ff6b6b;
  text-align: center;
  padding: 20px;
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 20px;
  }
  
  p {
    margin: 0 0 20px 0;
    font-size: 14px;
    opacity: 0.8;
  }
  
  button {
    padding: 10px 20px;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background: #ff5252;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## Directives and Pipes

### Custom Directive for Fullscreen

```typescript
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appFullscreen]'
})
export class FullscreenDirective {
  constructor(private el: ElementRef) {}

  @HostListener('dblclick')
  onDoubleClick(): void {
    this.toggleFullscreen();
  }

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.el.nativeElement.requestFullscreen().catch((err: Error) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }
}

// Usage
/*
<cinematic-player
  appFullscreen
  [spec]="spec">
</cinematic-player>
*/
```

### Time Formatting Pipe

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat'
})
export class TimeFormatPipe implements PipeTransform {
  transform(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Usage
/*
<div class="time-display">
  {{ currentTime | timeFormat }} / {{ totalDuration | timeFormat }}
</div>
*/
```

## State Management with NgRx

### Actions

```typescript
// cinematic.actions.ts
import { createAction, props } from '@ngrx/store';
import type { CinematicSpec, QualityLevel } from 'cinematic-renderer2d';

export const loadSpec = createAction(
  '[Cinematic] Load Spec',
  props<{ url: string }>()
);

export const loadSpecSuccess = createAction(
  '[Cinematic] Load Spec Success',
  props<{ spec: CinematicSpec }>()
);

export const loadSpecFailure = createAction(
  '[Cinematic] Load Spec Failure',
  props<{ error: string }>()
);

export const play = createAction('[Cinematic] Play');
export const pause = createAction('[Cinematic] Pause');
export const stop = createAction('[Cinematic] Stop');

export const setQuality = createAction(
  '[Cinematic] Set Quality',
  props<{ quality: QualityLevel }>()
);

export const seek = createAction(
  '[Cinematic] Seek',
  props<{ timeMs: number }>()
);
```

### Reducer

```typescript
// cinematic.reducer.ts
import { createReducer, on } from '@ngrx/store';
import type { CinematicSpec, QualityLevel } from 'cinematic-renderer2d';
import * as CinematicActions from './cinematic.actions';

export interface CinematicState {
  spec: CinematicSpec | null;
  loading: boolean;
  error: string | null;
  playing: boolean;
  currentTime: number;
  quality: QualityLevel;
}

const initialState: CinematicState = {
  spec: null,
  loading: false,
  error: null,
  playing: false,
  currentTime: 0,
  quality: 'auto'
};

export const cinematicReducer = createReducer(
  initialState,
  on(CinematicActions.loadSpec, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CinematicActions.loadSpecSuccess, (state, { spec }) => ({
    ...state,
    spec,
    loading: false,
    error: null
  })),
  on(CinematicActions.loadSpecFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(CinematicActions.play, state => ({
    ...state,
    playing: true
  })),
  on(CinematicActions.pause, state => ({
    ...state,
    playing: false
  })),
  on(CinematicActions.stop, state => ({
    ...state,
    playing: false,
    currentTime: 0
  })),
  on(CinematicActions.setQuality, (state, { quality }) => ({
    ...state,
    quality
  })),
  on(CinematicActions.seek, (state, { timeMs }) => ({
    ...state,
    currentTime: timeMs
  }))
);
```

### Effects

```typescript
// cinematic.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as CinematicActions from './cinematic.actions';

@Injectable()
export class CinematicEffects {
  loadSpec$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CinematicActions.loadSpec),
      switchMap(({ url }) =>
        fetch(url).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load spec: ${response.statusText}`);
          }
          return response.json();
        }).then(spec => 
          CinematicActions.loadSpecSuccess({ spec })
        ).catch(error =>
          CinematicActions.loadSpecFailure({ error: error.message })
        )
      )
    )
  );

  constructor(private actions$: Actions) {}
}
```

## Testing

### Unit Testing with Jasmine and Karma

```typescript
// cinematic-player.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CinematicPlayerComponent } from 'cinematic-renderer2d/angular';
import type { CinematicSpec } from 'cinematic-renderer2d';

describe('CinematicPlayerComponent', () => {
  let component: CinematicPlayerComponent;
  let fixture: ComponentFixture<CinematicPlayerComponent>;

  const mockSpec: CinematicSpec = {
    schemaVersion: '1.0.0',
    engine: { targetFps: 60 },
    events: [{ id: 'test', name: 'Test', scenes: ['scene1'] }],
    scenes: [{
      id: 'scene1',
      name: 'Test Scene',
      duration: 1000,
      layers: [{
        id: 'layer1',
        type: 'gradient',
        zIndex: 1,
        config: { colors: ['#000', '#fff'] }
      }]
    }]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CinematicPlayerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CinematicPlayerComponent);
    component = fixture.componentInstance;
    component.spec = mockSpec;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit play event when playback starts', () => {
    spyOn(component.play, 'emit');
    
    component.onPlay();
    
    expect(component.play.emit).toHaveBeenCalled();
  });

  it('should handle quality changes', () => {
    spyOn(component.qualityChange, 'emit');
    
    component.setQuality('high');
    
    expect(component.qualityChange.emit).toHaveBeenCalledWith('high');
  });
});
```

### Integration Testing

```typescript
// app.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CinematicPlayerModule } from 'cinematic-renderer2d/angular';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [CinematicPlayerModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render cinematic player', () => {
    const cinematicPlayer = fixture.debugElement.query(By.css('cinematic-player'));
    expect(cinematicPlayer).toBeTruthy();
  });

  it('should handle play events', () => {
    spyOn(component, 'onPlay');
    
    const cinematicPlayer = fixture.debugElement.query(By.css('cinematic-player'));
    cinematicPlayer.triggerEventHandler('play', null);
    
    expect(component.onPlay).toHaveBeenCalled();
  });
});
```

## Performance Optimization

### OnPush Change Detection

```typescript
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import type { CinematicSpec, QualityLevel } from 'cinematic-renderer2d';

@Component({
  selector: 'app-optimized-cinematic',
  template: `
    <cinematic-player
      [spec]="spec"
      [autoplay]="autoplay"
      [quality]="quality"
      (play)="playEvent.emit()"
      (pause)="pauseEvent.emit()"
      (error)="errorEvent.emit($event)">
    </cinematic-player>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedCinematicComponent {
  @Input() spec!: CinematicSpec;
  @Input() autoplay = false;
  @Input() quality: QualityLevel = 'auto';
  
  @Output() playEvent = new EventEmitter<void>();
  @Output() pauseEvent = new EventEmitter<void>();
  @Output() errorEvent = new EventEmitter<Error>();
}
```

### Lazy Loading Module

```typescript
// cinematic.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CinematicPlayerModule } from 'cinematic-renderer2d/angular';
import { CinematicRoutingModule } from './cinematic-routing.module';
import { CinematicPageComponent } from './cinematic-page.component';

@NgModule({
  declarations: [CinematicPageComponent],
  imports: [
    CommonModule,
    CinematicPlayerModule,
    CinematicRoutingModule
  ]
})
export class CinematicModule { }

// app-routing.module.ts
const routes: Routes = [
  {
    path: 'cinematic',
    loadChildren: () => import('./cinematic/cinematic.module').then(m => m.CinematicModule)
  }
];
```

## Best Practices

### 1. Module Organization

- Create a dedicated module for cinematic-related components
- Use lazy loading for cinematic features to reduce initial bundle size
- Import `CinematicPlayerModule` only where needed

### 2. State Management

- Use services for simple state management
- Consider NgRx for complex applications with multiple cinematic players
- Implement proper error handling and loading states

### 3. Performance

- Use `OnPush` change detection strategy when possible
- Implement proper cleanup in `ngOnDestroy`
- Consider using `trackBy` functions for dynamic lists

### 4. Testing

- Mock the cinematic renderer for unit tests
- Test both successful and error scenarios
- Use integration tests for complex user interactions

### 5. Accessibility

- Provide alternative content for users who can't view cinematic experiences
- Implement proper ARIA labels and descriptions
- Respect user preferences for reduced motion

This guide covers the essential patterns for integrating cinematicRenderer2D into Angular applications. For more advanced usage and custom development, refer to the main API documentation.