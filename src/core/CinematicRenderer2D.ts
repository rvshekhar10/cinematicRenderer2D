/**
 * Main CinematicRenderer2D engine class
 * 
 * This is the primary entry point for the cinematic rendering system.
 * It orchestrates all subsystems including parsing, rendering, animation, and audio.
 */

import type { ICinematicRenderer2D } from './interfaces/ICinematicRenderer2D';
import type { CinematicSpec } from '../types/CinematicSpec';
import type { CompiledSpec } from '../types/CompiledSpec';
import type { QualityLevel } from '../types/QualityTypes';
import { SpecParser } from '../parsing/SpecParser';
import { Scheduler, type FrameContext } from './Scheduler';
import { QualitySystem } from '../performance/QualitySystem';
import { AudioSystem } from '../audio/AudioSystem';
import { DebugOverlay } from '../debug/DebugOverlay';
import { LayerRegistry } from './LayerRegistry';
import { DOMRenderer } from '../rendering/dom/DOMRenderer';
import { Canvas2DRenderer } from '../rendering/canvas2d/Canvas2DRenderer';
import type { ICinematicLayer } from './interfaces/ICinematicLayer';
import { StateMachine, RendererState, SceneState } from './StateMachine';
import type { LayerMountContext } from './interfaces/LayerContext';
import { SceneLifecycleManager } from './SceneLifecycleManager';
import { AssetManager } from '../assets/AssetManager';
import { CameraSystem } from './CameraSystem';

export interface CinematicRenderer2DOptions {
  container: HTMLElement;
  spec: CinematicSpec;
  autoplay?: boolean;
  quality?: QualityLevel;
  debug?: boolean;
}

export type PlaybackState = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'stopped' | 'destroyed';

export class CinematicRenderer2D implements ICinematicRenderer2D {
  private _container: HTMLElement;
  private _spec: CinematicSpec;
  private _compiledSpec: CompiledSpec;
  private _options: CinematicRenderer2DOptions;
  private eventListeners: Map<string, Function[]> = new Map();
  
  // State management
  private _stateMachine: StateMachine;
  private _state: PlaybackState = 'idle';
  private _currentTime: number = 0;
  private _duration: number = 0;
  private _currentEventId: string | null = null;
  private _currentSceneId: string | null = null;
  private _quality: QualityLevel;
  private _resizeListener: (() => void) | null = null;
  
  // Core subsystems
  private _scheduler: Scheduler;
  private _qualitySystem: QualitySystem;
  private _audioSystem: AudioSystem;
  private _debugOverlay: DebugOverlay | null = null;
  private _layerRegistry: LayerRegistry;
  private _domRenderer: DOMRenderer | null = null;
  private _canvas2DRenderer: Canvas2DRenderer | null = null;
  private _assetManager: AssetManager;
  private _sceneLifecycleManager: SceneLifecycleManager | null = null;
  private _cameraSystem: CameraSystem | null = null;
  
  // Layer management
  private _layers: ICinematicLayer[] = [];
  private _currentSceneLayers: ICinematicLayer[] = [];
  private _layerStates: Map<string, 'created' | 'mounted' | 'active' | 'destroyed'> = new Map();
  
  // Resize observer for automatic container resizing
  private _resizeObserver: ResizeObserver | null = null;
  private _mounted: boolean = false;
  
  constructor(options: CinematicRenderer2DOptions) {
    // Validate required parameters
    if (!options.container) {
      throw new Error('CinematicRenderer2D: container element is required');
    }
    if (!options.spec) {
      throw new Error('CinematicRenderer2D: spec is required');
    }
    
    // Validate and compile the specification
    const validatedSpec = SpecParser.validate(options.spec);
    const compiledSpec = SpecParser.parse(validatedSpec);
    
    this._container = options.container;
    this._spec = validatedSpec;
    this._compiledSpec = compiledSpec;
    this._options = options;
    this._quality = options.quality || this._spec.engine.quality || 'auto';
    
    // Initialize state machine
    this._stateMachine = new StateMachine(RendererState.IDLE);
    
    // Listen for state changes and emit events
    this._stateMachine.addListener((from, to) => {
      this.emit('state-change', { from, to });
    });
    
    // Initialize core subsystems
    this._scheduler = new Scheduler({
      targetFps: this._spec.engine.targetFps || 60,
      enableAdaptiveQuality: this._quality === 'auto',
    });
    
    this._qualitySystem = new QualitySystem({
      respectUserPreferences: true,
      useDeviceDetection: true,
    });
    
    // Initialize layer registry
    this._layerRegistry = LayerRegistry.getInstance();
    
    // Initialize asset manager
    this._assetManager = new AssetManager({
      maxConcurrentLoads: 6,
      defaultTimeout: 30000,
      defaultRetries: 3,
      baseUrl: '',
    });
    
    // Initialize audio system
    this._audioSystem = new AudioSystem({
      preferWebAudio: true,
      masterVolume: 1.0,
      maxConcurrentTracks: 8,
      defaultFadeDuration: 1000,
    });
    
    // Set initial quality
    this._qualitySystem.setQuality(this._quality);
    
    // Connect scheduler to quality system
    this._scheduler.addQualityChangeCallback((metrics) => {
      this._qualitySystem.updatePerformanceMetrics(metrics);
    });
    
    // Listen for quality changes
    this._qualitySystem.addEventListener((event) => {
      if (event.type === 'quality-change') {
        this._quality = event.newQuality!;
        this.emit('qualityChange', {
          previousQuality: event.previousQuality,
          currentQuality: event.newQuality,
          metrics: event.metrics,
        });
      }
    });
    
    // Set up frame callback for animation updates
    this._scheduler.addFrameCallback((context) => {
      this._onFrame(context);
    });
    
    // Set up audio system event listeners
    this._audioSystem.on('track-error', (trackId, error) => {
      this.emit('audioError', { trackId, error });
    });
    
    this._audioSystem.on('autoplay-blocked', (trackId) => {
      this.emit('autoplayBlocked', { trackId });
    });
    
    // Calculate total duration from all events and scenes
    this._calculateDuration();
    
    // Set up automatic resize handling (Requirement 1.5)
    this._setupResizeObserver();
    
    // Initialize debug overlay if debug mode is enabled
    if (this._options.debug) {
      this._debugOverlay = new DebugOverlay(this, this._container, {
        position: 'top-right',
        showPerformanceGraph: true,
      });
    }
    
    // TODO: Initialize other subsystems in future tasks
    // - SpecParser for JSON validation and compilation
    // - AssetManager for resource loading
  }
  
  
  async mount(): Promise<void> {
    // Check if already destroyed
    if (this._stateMachine.getState() === RendererState.DESTROYED) {
      throw new Error('Cannot mount destroyed renderer');
    }
    
    if (this._mounted) {
      return; // Already mounted
    }
    
    try {
      this._setState('loading');
      this.emit('loading');
      
      // Validate container is in DOM
      if (!document.contains(this._container)) {
        throw new Error('Container element must be attached to the DOM');
      }
      
      // Set up container styles for cinematic rendering
      this._setupContainer();
      
      // Initialize rendering backends
      this._initializeRenderers();
      
      // Initialize camera system
      this._cameraSystem = new CameraSystem(this._container);
      
      // Initialize scene lifecycle manager
      this._sceneLifecycleManager = new SceneLifecycleManager({
        assetManager: this._assetManager,
        layerRegistry: this._layerRegistry,
        container: this._container,
      });
      
      // Create and mount layers for the initial scene
      this._initializeLayers();
      
      // Initialize audio system
      await this._audioSystem.initialize();
      
      // Set up automatic resize detection
      this._setupResizeListener();
      
      // Show debug overlay if enabled
      if (this._debugOverlay) {
        this._debugOverlay.show();
      }
      
      this._mounted = true;
      
      // Transition to READY state
      await this._stateMachine.transition(RendererState.READY);
      this._setState('ready');
      this.emit('ready');
      
      // Auto-play if requested
      if (this._options.autoplay) {
        this.play();
      }
      
    } catch (error) {
      this._setState('idle');
      await this._stateMachine.transition(RendererState.IDLE).catch(() => {});
      this.emit('error', error);
      throw error;
    }
  }
  
  play(): void {
    // Check if destroyed
    if (this._stateMachine.getState() === RendererState.DESTROYED) {
      throw new Error('Cannot play destroyed renderer');
    }
    
    if (!this._mounted) {
      throw new Error('Must mount renderer before playing');
    }
    
    // Check if already playing
    const currentState = this._stateMachine.getState();
    if (currentState === RendererState.PLAYING) {
      return; // Already playing
    }
    
    // Validate transition
    if (!this._stateMachine.canTransition(RendererState.PLAYING)) {
      throw new Error(`Cannot play from state: ${currentState}`);
    }
    
    const previousState = this._state;
    
    // Transition to PLAYING state
    this._stateMachine.transition(RendererState.PLAYING).catch((error) => {
      console.error('State transition error:', error);
    });
    
    this._setState('playing');
    
    // Start the scheduler frame loop
    this._scheduler.start();
    
    // Start audio system
    this._audioSystem.play();
    
    // Update layers for current scene
    this._updateCurrentSceneLayers();
    
    this.emit('play', { previousState, currentTime: this._currentTime });
  }
  
  pause(): void {
    const currentState = this._stateMachine.getState();
    if (currentState !== RendererState.PLAYING) {
      return; // Not playing, nothing to pause
    }
    
    const previousState = this._state;
    
    // Transition to PAUSED state
    this._stateMachine.transition(RendererState.PAUSED).catch((error) => {
      console.error('State transition error:', error);
    });
    
    this._setState('paused');
    
    // Pause the scheduler frame loop
    this._scheduler.stop();
    
    // Pause audio system
    this._audioSystem.pause();
    
    this.emit('pause', { previousState, currentTime: this._currentTime });
  }
  
  stop(): void {
    const currentState = this._stateMachine.getState();
    if (currentState === RendererState.DESTROYED || currentState === RendererState.IDLE) {
      return; // Already stopped or destroyed
    }
    
    // Don't transition if already stopped
    if (currentState === RendererState.STOPPED) {
      return;
    }
    
    const previousState = this._state;
    
    // Transition to STOPPED state
    this._stateMachine.transition(RendererState.STOPPED).catch((error) => {
      console.error('State transition error:', error);
    });
    
    this._setState('stopped');
    
    // Stop the scheduler frame loop
    this._scheduler.stop();
    
    // Stop audio system
    this._audioSystem.stop();
    
    // Reset playback position
    this._currentTime = 0;
    this._currentEventId = null;
    this._currentSceneId = null;
    
    // Reset all layers to initial state
    this._resetLayersToInitialState();
    
    this.emit('stop', { previousState });
  }
  
  destroy(): void {
    const currentState = this._stateMachine.getState();
    if (currentState === RendererState.DESTROYED) {
      return; // Already destroyed
    }
    
    const previousState = this._state;
    
    // Stop playback first
    this.stop();
    
    // Transition to DESTROYED state
    this._stateMachine.transition(RendererState.DESTROYED).catch((error) => {
      console.error('State transition error:', error);
    });
    
    // Clean up resize observer
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    
    // TODO: In future tasks:
    // - Destroy all subsystems
    // - Clean up DOM elements
    // - Release audio resources
    // - Clear asset cache
    
    // Destroy all layers
    this._destroyAllLayers();
    
    // Destroy renderers
    if (this._domRenderer) {
      this._domRenderer.destroy();
      this._domRenderer = null;
    }
    if (this._canvas2DRenderer) {
      this._canvas2DRenderer.destroy();
      this._canvas2DRenderer = null;
    }
    
    // Destroy audio system
    this._audioSystem.destroy();
    
    // Destroy scene lifecycle manager
    if (this._sceneLifecycleManager) {
      const activeScene = this._sceneLifecycleManager.getActiveScene();
      if (activeScene) {
        this._sceneLifecycleManager.deactivateScene(activeScene).catch((error) => {
          console.error('Error deactivating scene during destroy:', error);
        });
      }
      this._sceneLifecycleManager = null;
    }
    
    // Destroy camera system
    if (this._cameraSystem) {
      this._cameraSystem.reset();
      this._cameraSystem = null;
    }
    
    // Destroy debug overlay
    if (this._debugOverlay) {
      this._debugOverlay.destroy();
      this._debugOverlay = null;
    }
    
    // Clear container
    this._container.innerHTML = '';
    if (typeof this._container.removeAttribute === 'function') {
      this._container.removeAttribute('style');
    }
    
    // Clear all event listeners
    this.eventListeners.clear();
    
    // Remove resize listener
    if (this._resizeListener) {
      window.removeEventListener('resize', this._resizeListener);
      this._resizeListener = null;
    }
    
    this._mounted = false;
    this._setState('destroyed');
    
    this.emit('destroy', { previousState });
  }
  
  
  seek(timeMs: number): void {
    if (this._stateMachine.getState() === RendererState.DESTROYED) {
      throw new Error('Cannot seek on destroyed renderer');
    }
    
    if (!this._mounted) {
      throw new Error('Must mount renderer before seeking');
    }
    
    // Clamp time to valid range
    const clampedTime = Math.max(0, Math.min(timeMs, this._duration));
    const previousTime = this._currentTime;
    
    this._currentTime = clampedTime;
    
    // Update current event and scene based on time
    this._updateCurrentEventAndScene();
    
    // Update layers for current scene if scene changed
    this._updateCurrentSceneLayers();
    
    // Seek audio system
    this._audioSystem.seek(clampedTime);
    
    this.emit('seek', this._currentTime);
  }
  
  goToEvent(eventId: string): void {
    if (this._stateMachine.getState() === RendererState.DESTROYED) {
      throw new Error('Cannot navigate on destroyed renderer');
    }
    
    if (!this._mounted) {
      throw new Error('Must mount renderer before navigation');
    }
    
    // Find the event in the spec
    const event = this._spec.events.find(e => e.id === eventId);
    if (!event) {
      // Handle gracefully - emit error event but don't throw
      this.emit('error', new Error(`Event with id "${eventId}" not found`));
      return;
    }
    
    // Calculate the start time of this event
    const eventStartTime = this._calculateEventStartTime(eventId);
    
    // Seek to the event start time
    this.seek(eventStartTime);
    
    this.emit('eventChange', eventId);
  }
  
  goToScene(sceneId: string): void {
    if (this._stateMachine.getState() === RendererState.DESTROYED) {
      throw new Error('Cannot navigate on destroyed renderer');
    }
    
    if (!this._mounted) {
      throw new Error('Must mount renderer before navigation');
    }
    
    // Find the scene in the spec
    const scene = this._spec.scenes.find(s => s.id === sceneId);
    if (!scene) {
      // Handle gracefully - emit error event but don't throw
      this.emit('error', new Error(`Scene with id "${sceneId}" not found`));
      return;
    }
    
    // Calculate the start time of this scene
    const sceneStartTime = this._calculateSceneStartTime(sceneId);
    
    // Seek to the scene start time
    this.seek(sceneStartTime);
    
    this.emit('sceneChange', sceneId);
  }
  
  setQuality(level: QualityLevel): void {
    if (this._quality === level) {
      return; // No change needed
    }
    
    const previousQuality = this._quality;
    this._quality = level;
    
    // Update quality system
    this._qualitySystem.setQuality(level);
    
    // TODO: In future tasks:
    // - Update rendering backend quality settings
    
    this.emit('qualityChange', level);
  }
  
  resize(width: number, height: number): void {
    if (this._stateMachine.getState() === RendererState.DESTROYED) {
      return; // Cannot resize destroyed renderer
    }
    
    // Update container size
    this._container.style.width = `${width}px`;
    this._container.style.height = `${height}px`;
    
    // Notify all rendering backends of size change
    if (this._domRenderer) {
      this._domRenderer.resize(width, height);
    }
    if (this._canvas2DRenderer) {
      this._canvas2DRenderer.resize(width, height);
    }
    
    this.emit('resize', { width, height });
  }
  
  
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }
  
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  getCurrentTime(): number {
    return this._currentTime;
  }
  
  getDuration(): number {
    return this._duration;
  }
  
  isPlaying(): boolean {
    return this._state === 'playing';
  }
  
  isPaused(): boolean {
    return this._state === 'paused';
  }
  
  getCurrentEvent(): string | null {
    return this._currentEventId;
  }
  
  getCurrentScene(): string | null {
    return this._currentSceneId;
  }
  
  // Additional state getters for debugging and monitoring
  getState(): PlaybackState {
    return this._state;
  }
  
  getQuality(): QualityLevel {
    return this._quality;
  }
  
  isMounted(): boolean {
    return this._mounted;
  }
  
  // Performance monitoring methods
  getCurrentFps(): number {
    return this._scheduler.getCurrentFps();
  }
  
  getPerformanceMetrics() {
    return this._scheduler.getPerformanceMetrics();
  }
  
  getQualitySettings() {
    return this._qualitySystem.getCurrentSettings();
  }
  
  getDeviceCapabilities() {
    return this._qualitySystem.getDeviceCapabilities();
  }
  
  // Audio system methods
  setMasterVolume(volume: number): void {
    this._audioSystem.setMasterVolume(volume);
  }
  
  getMasterVolume(): number {
    return this._audioSystem.getMasterVolume();
  }
  
  isWebAudioAvailable(): boolean {
    return this._audioSystem.isWebAudioAvailable();
  }
  
  getActiveAudioTrackCount(): number {
    return this._audioSystem.getActiveTrackCount();
  }
  
  // Camera system methods
  getCameraState() {
    if (!this._cameraSystem) {
      throw new Error('Camera system not initialized. Call mount() first.');
    }
    return this._cameraSystem.getState();
  }
  
  setCameraState(state: Partial<import('./CameraSystem').CameraState>): void {
    if (!this._cameraSystem) {
      throw new Error('Camera system not initialized. Call mount() first.');
    }
    this._cameraSystem.setState(state);
  }
  
  addCameraAnimation(animation: import('./CameraSystem').CameraAnimation): void {
    if (!this._cameraSystem) {
      throw new Error('Camera system not initialized. Call mount() first.');
    }
    this._cameraSystem.addAnimation(animation);
  }
  
  resetCamera(): void {
    if (!this._cameraSystem) {
      throw new Error('Camera system not initialized. Call mount() first.');
    }
    this._cameraSystem.reset();
  }
  
  getCameraTransformMatrix(): DOMMatrix {
    if (!this._cameraSystem) {
      throw new Error('Camera system not initialized. Call mount() first.');
    }
    return this._cameraSystem.getTransformMatrix();
  }
  
  // Debug system methods
  isDebugEnabled(): boolean {
    return this._debugOverlay !== null;
  }
  
  toggleDebug(): void {
    if (this._debugOverlay) {
      this._debugOverlay.toggle();
    }
  }
  
  showDebug(): void {
    if (this._debugOverlay) {
      this._debugOverlay.show();
    }
  }
  
  hideDebug(): void {
    if (this._debugOverlay) {
      this._debugOverlay.hide();
    }
  }
  
  // Scene lifecycle methods
  getSceneLifecycleManager(): SceneLifecycleManager | null {
    return this._sceneLifecycleManager;
  }
  
  protected emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
    }
  }
  
  // Frame callback for animation updates
  private _onFrame(context: FrameContext): void {
    if (this._stateMachine.getState() !== RendererState.PLAYING) {
      return;
    }
    
    // Update current time
    this._currentTime += context.deltaMs;
    
    // Clamp to duration
    if (this._currentTime >= this._duration) {
      this._currentTime = this._duration;
      this.stop(); // Auto-stop when reaching end
      this.emit('ended');
      return;
    }
    
    // Update current event and scene
    this._updateCurrentEventAndScene();
    
    // Update camera system
    if (this._cameraSystem) {
      this._cameraSystem.update(this._currentTime);
    }
    
    // Update layers for current scene if scene changed
    this._updateCurrentSceneLayers();
    
    // Update performance metrics with current layer/particle counts
    this._scheduler.updateMetrics({
      activeLayers: this._currentSceneLayers.length,
      activeParticles: 0, // TODO: Get from particle systems
      domNodes: this._container.querySelectorAll('*').length,
      drawCalls: 0, // TODO: Get from canvas renderers
    });
    
    // Render current scene layers
    this._renderCurrentFrame(context);
    
    // Update audio system
    this._audioSystem.update(this._currentTime);
    
    // Emit frame update event
    this.emit('frame', {
      currentTime: this._currentTime,
      fps: context.fps,
      deltaMs: context.deltaMs,
      currentEvent: this._currentEventId,
      currentScene: this._currentSceneId,
    });
  }
  
  // Private helper methods
  
  private _setState(newState: PlaybackState): void {
    const previousState = this._state;
    this._state = newState;
    
    if (previousState !== newState) {
      this.emit('stateChange', { previousState, currentState: newState });
    }
  }
  
  private _calculateDuration(): void {
    // Calculate total duration by finding the maximum end time across all events
    let maxDuration = 0;
    
    for (const event of this._spec.events) {
      let eventDuration = 0;
      
      for (const sceneId of event.scenes) {
        const scene = this._spec.scenes.find(s => s.id === sceneId);
        if (scene) {
          eventDuration += scene.duration;
        }
      }
      
      maxDuration = Math.max(maxDuration, eventDuration);
    }
    
    this._duration = maxDuration;
  }
  
  private _calculateEventStartTime(eventId: string): number {
    // For now, assume events are sequential
    // TODO: In future tasks, implement proper event timing based on transitions
    let startTime = 0;
    
    for (const event of this._spec.events) {
      if (event.id === eventId) {
        return startTime;
      }
      
      // Add duration of this event's scenes
      for (const sceneId of event.scenes) {
        const scene = this._spec.scenes.find(s => s.id === sceneId);
        if (scene) {
          startTime += scene.duration;
        }
      }
    }
    
    return 0; // Event not found
  }
  
  private _calculateSceneStartTime(sceneId: string): number {
    // Find which event contains this scene and calculate its start time
    let totalTime = 0;
    
    for (const event of this._spec.events) {
      let eventTime = 0;
      
      for (const eventSceneId of event.scenes) {
        if (eventSceneId === sceneId) {
          return totalTime + eventTime;
        }
        
        const scene = this._spec.scenes.find(s => s.id === eventSceneId);
        if (scene) {
          eventTime += scene.duration;
        }
      }
      
      totalTime += eventTime;
    }
    
    return 0; // Scene not found
  }
  
  private _updateCurrentEventAndScene(): void {
    // Find current event and scene based on current time
    let accumulatedTime = 0;
    
    for (const event of this._spec.events) {
      let eventStartTime = accumulatedTime;
      let eventTime = 0;
      
      for (const sceneId of event.scenes) {
        const scene = this._spec.scenes.find(s => s.id === sceneId);
        if (scene) {
          const sceneStartTime = eventStartTime + eventTime;
          const sceneEndTime = sceneStartTime + scene.duration;
          
          if (this._currentTime >= sceneStartTime && this._currentTime < sceneEndTime) {
            this._currentEventId = event.id;
            this._currentSceneId = scene.id;
            return;
          }
          
          eventTime += scene.duration;
        }
      }
      
      accumulatedTime += eventTime;
    }
    
    // If we're past all content, stay on the last scene
    if (this._spec.events.length > 0) {
      const lastEvent = this._spec.events[this._spec.events.length - 1];
      if (lastEvent && lastEvent.scenes.length > 0) {
        const lastSceneId = lastEvent.scenes[lastEvent.scenes.length - 1];
        this._currentEventId = lastEvent.id;
        this._currentSceneId = lastSceneId || null;
      }
    }
  }
  
  private _setupContainer(): void {
    // Set up container for cinematic rendering
    const containerStyle = this._container.style;
    
    // Ensure container has position context for absolute positioning of layers
    if (!containerStyle.position || containerStyle.position === 'static') {
      containerStyle.position = 'relative';
    }
    
    // Ensure container has dimensions
    if (!containerStyle.width && !containerStyle.height) {
      containerStyle.width = '100%';
      containerStyle.height = '100%';
    }
    
    // Set overflow hidden to prevent content from spilling out
    containerStyle.overflow = 'hidden';
    
    // Add cinematic renderer class for styling
    this._container.classList.add('cinematic-renderer2d');
    
    // Set up CSS custom properties for theming
    containerStyle.setProperty('--cinematic-quality', this._quality);
  }
  
  private _setupResizeObserver(): void {
    // Set up automatic resize handling (Requirement 1.5)
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          this.resize(width, height);
        }
      });
      
      this._resizeObserver.observe(this._container);
    }
  }
  
  private _setupResizeListener(): void {
    // Set up window resize listener for automatic resize detection
    this._resizeListener = () => {
      const rect = this._container.getBoundingClientRect();
      this.resize(rect.width, rect.height);
    };
    
    window.addEventListener('resize', this._resizeListener);
  }
  
  // Layer management methods
  
  private _initializeRenderers(): void {
    // Initialize DOM renderer for DOM-based layers
    this._domRenderer = new DOMRenderer(this._container);
    this._domRenderer.initialize();
    
    // Initialize Canvas2D renderer for particle systems and effects
    this._canvas2DRenderer = new Canvas2DRenderer(this._container);
    this._canvas2DRenderer.initialize();
  }
  
  private _initializeLayers(): void {
    // Create layers for all scenes (they will be mounted/unmounted as needed)
    for (const scene of this._spec.scenes) {
      for (const layerSpec of scene.layers) {
        try {
          const layer = this._layerRegistry.createLayer(layerSpec.type, layerSpec.id, layerSpec.config);
          this._layers.push(layer);
          // Initialize layer state as 'created'
          this._layerStates.set(layer.id, 'created');
        } catch (error) {
          console.error(`Failed to create layer ${layerSpec.id} of type ${layerSpec.type}:`, error);
        }
      }
    }
    
    // Mount layers for the initial scene
    this._updateCurrentSceneLayers();
  }
  
  private _updateCurrentSceneLayers(): void {
    const currentScene = this._getCurrentScene();
    if (!currentScene) return;
    
    // TODO: Once we have CompiledScene objects from SpecParser, we can use SceneLifecycleManager
    // For now, continue with the existing layer management approach
    // Future integration:
    // if (this._sceneLifecycleManager && compiledScene) {
    //   await this._sceneLifecycleManager.activateScene(compiledScene);
    //   return;
    // }
    
    // Get layers for current scene
    const newSceneLayers = this._layers.filter(layer => 
      currentScene.layers.some(layerSpec => layerSpec.id === layer.id)
    );
    
    // Check if scene layers have changed
    const layersChanged = newSceneLayers.length !== this._currentSceneLayers.length ||
      newSceneLayers.some(layer => !this._currentSceneLayers.includes(layer));
    
    if (layersChanged) {
      // CRITICAL: Destroy old scene layers BEFORE mounting new ones (Requirement 1.1)
      const layersToDestroy = this._currentSceneLayers.filter(layer => !newSceneLayers.includes(layer));
      
      for (const layer of layersToDestroy) {
        this._destroyLayer(layer);
      }
      
      // Mount new layers only after old ones are fully destroyed
      for (const layer of newSceneLayers) {
        if (!this._currentSceneLayers.includes(layer)) {
          this._mountLayer(layer);
        }
      }
      
      this._currentSceneLayers = newSceneLayers;
      
      // Emit scene change event with layer counts for debugging
      this.emit('sceneLayersChanged', {
        destroyed: layersToDestroy.length,
        mounted: newSceneLayers.filter(l => !this._currentSceneLayers.includes(l)).length,
        active: this._currentSceneLayers.length
      });
    }
  }
  
  private _mountLayer(layer: ICinematicLayer): void {
    try {
      // Check if layer is already mounted or destroyed
      const layerState = this._layerStates.get(layer.id);
      if (layerState === 'mounted' || layerState === 'active') {
        console.warn(`Layer ${layer.id} is already mounted, skipping mount`);
        return;
      }
      if (layerState === 'destroyed') {
        console.error(`Cannot mount destroyed layer ${layer.id}`);
        return;
      }
      
      // Determine which renderer to use based on layer type
      const builtInTypes = this._layerRegistry.getBuiltInTypes();
      let renderer: any = this._domRenderer; // Use any type to allow both renderer types
      
      if (builtInTypes.canvas2d.includes(layer.type)) {
        renderer = this._canvas2DRenderer;
      }
      
      if (!renderer) {
        console.error(`No suitable renderer found for layer type: ${layer.type}`);
        return;
      }
      
      // Create mount context
      const mountContext: LayerMountContext = {
        container: this._container,
        renderer,
        assetManager: null as any, // TODO: Implement asset manager
        layerConfig: this._getLayerConfig(layer.id),
      };
      
      // Mount the layer
      layer.mount(mountContext);
      
      // Update layer state
      this._layerStates.set(layer.id, 'mounted');
    } catch (error) {
      console.error(`Failed to mount layer ${layer.id}:`, error);
    }
  }
  
  private _destroyLayer(layer: ICinematicLayer): void {
    try {
      const layerState = this._layerStates.get(layer.id);
      
      // Skip if already destroyed
      if (layerState === 'destroyed') {
        return;
      }
      
      // Destroy the layer (this should cancel animations and remove DOM nodes)
      layer.destroy();
      
      // Update layer state
      this._layerStates.set(layer.id, 'destroyed');
      
      // Log for debugging
      if (this._options.debug) {
        console.log(`Layer ${layer.id} destroyed`);
      }
    } catch (error) {
      console.error(`Error destroying layer ${layer.id}:`, error);
    }
  }
  
  private _renderCurrentFrame(context: FrameContext): void {
    // Create layer frame context
    const layerContext: import('./interfaces/LayerContext').FrameContext = {
      timeMs: this._currentTime,
      deltaMs: context.deltaMs,
      quality: this._quality,
      viewport: {
        width: this._container.clientWidth,
        height: this._container.clientHeight,
      },
      devicePixelRatio: window.devicePixelRatio || 1,
    };
    
    // Render DOM layers
    if (this._domRenderer && this._currentSceneLayers.length > 0) {
      const domLayers = this._currentSceneLayers.filter(layer => {
        const builtInTypes = this._layerRegistry.getBuiltInTypes();
        return builtInTypes.dom.includes(layer.type);
      });
      
      if (domLayers.length > 0) {
        this._domRenderer.render(domLayers, layerContext);
      }
    }
    
    // Render Canvas2D layers
    if (this._canvas2DRenderer && this._currentSceneLayers.length > 0) {
      const canvas2DLayers = this._currentSceneLayers.filter(layer => {
        const builtInTypes = this._layerRegistry.getBuiltInTypes();
        return builtInTypes.canvas2d.includes(layer.type);
      });
      
      if (canvas2DLayers.length > 0) {
        this._canvas2DRenderer.render(canvas2DLayers, layerContext);
      }
    }
  }
  
  private _getCurrentScene() {
    if (!this._currentSceneId) return null;
    return this._spec.scenes.find(scene => scene.id === this._currentSceneId);
  }
  
  private _getLayerConfig(layerId: string): Record<string, any> {
    for (const scene of this._spec.scenes) {
      const layerSpec = scene.layers.find(layer => layer.id === layerId);
      if (layerSpec) {
        return layerSpec.config || {};
      }
    }
    return {};
  }
  
  private _resetLayersToInitialState(): void {
    // Reset all layers to their initial state
    for (const layer of this._currentSceneLayers) {
      // Destroy and remount the layer to reset state
      this._destroyLayer(layer);
      // Reset state to 'created' so it can be mounted again
      this._layerStates.set(layer.id, 'created');
      this._mountLayer(layer);
    }
  }
  
  private _destroyAllLayers(): void {
    // Destroy all layers
    for (const layer of this._layers) {
      this._destroyLayer(layer);
    }
    
    this._layers = [];
    this._currentSceneLayers = [];
    this._layerStates.clear();
  }
}