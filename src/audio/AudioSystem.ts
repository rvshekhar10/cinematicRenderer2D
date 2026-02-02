/**
 * Audio system with WebAudio API and HTMLAudio fallback
 * 
 * This system handles audio playback for cinematic experiences with support for:
 * - WebAudio API for precise timing and effects
 * - HTMLAudio fallback for compatibility
 * - Multiple audio track types (voiceover, ambience, transition, music, sfx)
 * - Fade in/out effects and volume control
 * - Audio-visual timeline synchronization
 * - Graceful handling of autoplay restrictions
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import type { CompiledAudioTrack } from '../types/CompiledSpec';
import type { AudioTrackType } from '../types/CinematicSpec';
import type { Asset } from '../types/AssetTypes';

export interface AudioSystemConfig {
  /** Preferred audio context sample rate */
  sampleRate?: number;
  /** Master volume (0-1) */
  masterVolume?: number;
  /** Whether to use WebAudio API when available */
  preferWebAudio?: boolean;
  /** Maximum number of concurrent audio tracks */
  maxConcurrentTracks?: number;
  /** Default fade duration in milliseconds */
  defaultFadeDuration?: number;
}

export interface AudioSystemEvents {
  'track-started': (trackId: string) => void;
  'track-ended': (trackId: string) => void;
  'track-error': (trackId: string, error: Error) => void;
  'context-suspended': () => void;
  'context-resumed': () => void;
  'autoplay-blocked': (trackId: string) => void;
}

interface ActiveTrack {
  id: string;
  type: AudioTrackType;
  startTime: number;
  endTime?: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  loop: boolean;
  audioNode?: AudioNode;
  audioElement?: HTMLAudioElement;
  gainNode?: GainNode;
  source?: AudioBufferSourceNode;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
}

export class AudioSystem {
  private _config: Required<AudioSystemConfig>;
  private _eventListeners: Map<keyof AudioSystemEvents, Function[]> = new Map();
  private _audioContext: AudioContext | null = null;
  private _masterGainNode: GainNode | null = null;
  private _activeTracks: Map<string, ActiveTrack> = new Map();
  private _compiledTracks: Map<string, CompiledAudioTrack> = new Map();
  private _isInitialized: boolean = false;
  private _currentTime: number = 0;
  private _isPlaying: boolean = false;
  private _userInteracted: boolean = false;
  
  constructor(config: AudioSystemConfig = {}) {
    this._config = {
      sampleRate: config.sampleRate || 44100,
      masterVolume: config.masterVolume || 1.0,
      preferWebAudio: config.preferWebAudio !== false,
      maxConcurrentTracks: config.maxConcurrentTracks || 8,
      defaultFadeDuration: config.defaultFadeDuration || 1000,
    };
    
    // Set up user interaction detection for autoplay handling
    this._setupUserInteractionDetection();
  }
  
  /**
   * Initialize the audio system
   */
  async initialize(): Promise<void> {
    if (this._isInitialized) {
      return;
    }
    
    try {
      // Try to initialize WebAudio API first
      if (this._config.preferWebAudio && typeof AudioContext !== 'undefined') {
        await this._initializeWebAudio();
      }
      
      this._isInitialized = true;
      
    } catch (error) {
      console.warn('AudioSystem: WebAudio initialization failed, using HTMLAudio fallback:', error);
      // HTMLAudio fallback will be used automatically
      this._isInitialized = true;
    }
  }
  
  /**
   * Load and compile audio tracks for a scene
   */
  async loadTracks(tracks: CompiledAudioTrack[]): Promise<void> {
    if (!this._isInitialized) {
      await this.initialize();
    }
    
    for (const track of tracks) {
      this._compiledTracks.set(track.id, track);
      
      // Prepare audio nodes/elements based on available APIs
      if (this._audioContext && track.asset.data instanceof ArrayBuffer) {
        try {
          // Decode audio data for WebAudio API
          const audioBuffer = await this._audioContext.decodeAudioData(track.asset.data.slice(0));
          track.audioNode = audioBuffer as any; // Store buffer as audioNode for now
        } catch (error) {
          console.warn(`AudioSystem: Failed to decode audio for track ${track.id}:`, error);
          // Fall back to HTMLAudio
          this._createHTMLAudioElement(track);
        }
      } else if (track.asset.data instanceof HTMLAudioElement) {
        track.audioElement = track.asset.data;
      } else {
        // Create HTMLAudio element from asset source
        this._createHTMLAudioElement(track);
      }
    }
  }
  
  /**
   * Start playback of the audio system
   */
  play(): void {
    this._isPlaying = true;
    
    // Resume audio context if suspended (handles autoplay restrictions)
    if (this._audioContext && this._audioContext.state === 'suspended') {
      if (this._userInteracted) {
        this._audioContext.resume().catch(error => {
          console.warn('AudioSystem: Failed to resume audio context:', error);
          this._emit('context-suspended');
        });
      } else {
        this._emit('autoplay-blocked', 'system');
      }
    }
  }
  
  /**
   * Pause playback of all audio tracks
   */
  pause(): void {
    this._isPlaying = false;
    
    // Pause all active tracks
    for (const track of this._activeTracks.values()) {
      if (track.isPlaying) {
        this._pauseTrack(track);
      }
    }
  }
  
  /**
   * Stop playback and reset all tracks
   */
  stop(): void {
    this._isPlaying = false;
    this._currentTime = 0;
    
    // Stop all active tracks
    for (const track of this._activeTracks.values()) {
      this._stopTrack(track);
    }
    
    this._activeTracks.clear();
  }
  
  /**
   * Update audio system with current timeline position
   */
  update(timeMs: number): void {
    this._currentTime = timeMs;
    
    if (!this._isPlaying) {
      return;
    }
    
    // Check which tracks should be playing at current time
    for (const compiledTrack of this._compiledTracks.values()) {
      const shouldPlay = timeMs >= compiledTrack.startMs && 
                        (compiledTrack.endMs === undefined || timeMs < compiledTrack.endMs);
      
      const activeTrack = this._activeTracks.get(compiledTrack.id);
      
      if (shouldPlay && !activeTrack) {
        // Start new track
        this._startTrack(compiledTrack, timeMs);
      } else if (!shouldPlay && activeTrack && activeTrack.isPlaying) {
        // Stop track that should no longer be playing
        this._stopTrack(activeTrack);
      } else if (activeTrack && activeTrack.isPlaying) {
        // Update existing track
        this._updateTrack(activeTrack, timeMs);
      }
    }
  }
  
  /**
   * Seek to a specific time position
   */
  seek(timeMs: number): void {
    this._currentTime = timeMs;
    
    // Stop all currently playing tracks
    for (const track of this._activeTracks.values()) {
      if (track.isPlaying) {
        this._stopTrack(track);
      }
    }
    
    // Update will start appropriate tracks for the new time if we're playing
    if (this._isPlaying) {
      this.update(timeMs);
    }
  }
  
  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this._config.masterVolume = Math.max(0, Math.min(1, volume));
    
    if (this._masterGainNode) {
      this._masterGainNode.gain.setValueAtTime(
        this._config.masterVolume,
        this._audioContext!.currentTime
      );
    }
    
    // Update HTMLAudio elements
    for (const track of this._activeTracks.values()) {
      if (track.audioElement) {
        track.audioElement.volume = this._config.masterVolume * track.volume;
      }
    }
  }
  
  /**
   * Get current master volume
   */
  getMasterVolume(): number {
    return this._config.masterVolume;
  }
  
  /**
   * Check if audio context is available and active
   */
  isWebAudioAvailable(): boolean {
    return this._audioContext !== null && this._audioContext.state !== 'closed';
  }
  
  /**
   * Get current audio context state
   */
  getAudioContextState(): AudioContextState | null {
    return this._audioContext?.state || null;
  }
  
  /**
   * Get active track count
   */
  getActiveTrackCount(): number {
    return Array.from(this._activeTracks.values()).filter(t => t.isPlaying).length;
  }
  
  /**
   * Destroy the audio system and clean up resources
   */
  destroy(): void {
    this.stop();
    
    if (this._audioContext) {
      // Check if close method exists (not available in all test environments)
      if (typeof this._audioContext.close === 'function') {
        this._audioContext.close();
      }
      this._audioContext = null;
      this._masterGainNode = null;
    }
    
    this._compiledTracks.clear();
    this._eventListeners.clear();
    this._isInitialized = false;
  }
  
  /**
   * Add event listener
   */
  on<K extends keyof AudioSystemEvents>(event: K, callback: AudioSystemEvents[K]): void {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    this._eventListeners.get(event)!.push(callback);
  }
  
  /**
   * Remove event listener
   */
  off<K extends keyof AudioSystemEvents>(event: K, callback: AudioSystemEvents[K]): void {
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  // Private methods
  
  private async _initializeWebAudio(): Promise<void> {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    
    if (!AudioContextClass) {
      throw new Error('WebAudio API not supported');
    }
    
    this._audioContext = new AudioContextClass({
      sampleRate: this._config.sampleRate,
    });
    
    // Create master gain node
    this._masterGainNode = this._audioContext.createGain();
    this._masterGainNode.gain.setValueAtTime(
      this._config.masterVolume,
      this._audioContext.currentTime
    );
    this._masterGainNode.connect(this._audioContext.destination);
    
    // Handle context state changes
    this._audioContext.addEventListener('statechange', () => {
      if (this._audioContext!.state === 'suspended') {
        this._emit('context-suspended');
      } else if (this._audioContext!.state === 'running') {
        this._emit('context-resumed');
      }
    });
  }
  
  private _createHTMLAudioElement(track: CompiledAudioTrack): void {
    const audio = new Audio();
    audio.src = track.asset.src;
    audio.preload = 'auto';
    audio.loop = track.loop;
    
    // Handle loading errors
    audio.onerror = () => {
      this._emit('track-error', track.id, new Error(`Failed to load audio: ${track.asset.src}`));
    };
    
    track.audioElement = audio;
  }
  
  private _startTrack(compiledTrack: CompiledAudioTrack, currentTimeMs: number): void {
    if (this._activeTracks.size >= this._config.maxConcurrentTracks) {
      console.warn(`AudioSystem: Maximum concurrent tracks (${this._config.maxConcurrentTracks}) reached`);
      return;
    }
    
    const track: ActiveTrack = {
      id: compiledTrack.id,
      type: compiledTrack.type,
      startTime: compiledTrack.startMs,
      endTime: compiledTrack.endMs,
      volume: compiledTrack.volume,
      fadeIn: compiledTrack.fadeIn,
      fadeOut: compiledTrack.fadeOut,
      loop: compiledTrack.loop,
      audioNode: compiledTrack.audioNode,
      audioElement: compiledTrack.audioElement,
      isPlaying: false,
      isPaused: false,
      currentTime: currentTimeMs - compiledTrack.startMs,
    };
    
    this._activeTracks.set(track.id, track);
    
    try {
      if (this._audioContext && track.audioNode) {
        this._startWebAudioTrack(track, compiledTrack);
      } else if (track.audioElement) {
        this._startHTMLAudioTrack(track);
      } else {
        throw new Error('No audio source available');
      }
      
      track.isPlaying = true;
      this._emit('track-started', track.id);
      
    } catch (error) {
      console.error(`AudioSystem: Failed to start track ${track.id}:`, error);
      this._emit('track-error', track.id, error as Error);
      this._activeTracks.delete(track.id);
    }
  }
  
  private _startWebAudioTrack(track: ActiveTrack, _compiledTrack: CompiledAudioTrack): void {
    if (!this._audioContext || !this._masterGainNode) {
      throw new Error('WebAudio context not available');
    }
    
    // Create source node
    const source = this._audioContext.createBufferSource();
    source.buffer = track.audioNode as unknown as AudioBuffer;
    source.loop = track.loop;
    
    // Create gain node for this track
    const gainNode = this._audioContext.createGain();
    track.gainNode = gainNode;
    
    // Connect audio graph
    source.connect(gainNode);
    gainNode.connect(this._masterGainNode);
    
    // Set initial volume (with fade in if specified)
    const now = this._audioContext.currentTime;
    if (track.fadeIn > 0) {
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(track.volume, now + track.fadeIn / 1000);
    } else {
      gainNode.gain.setValueAtTime(track.volume, now);
    }
    
    // Handle track end
    source.onended = () => {
      if (track.isPlaying) {
        track.isPlaying = false;
        this._emit('track-ended', track.id);
        this._activeTracks.delete(track.id);
      }
    };
    
    // Start playback
    const offset = Math.max(0, track.currentTime / 1000);
    source.start(0, offset);
    track.source = source;
  }
  
  private _startHTMLAudioTrack(track: ActiveTrack): void {
    if (!track.audioElement) {
      throw new Error('HTMLAudio element not available');
    }
    
    const audio = track.audioElement;
    
    // Set volume
    audio.volume = this._config.masterVolume * track.volume;
    
    // Set current time if seeking
    if (track.currentTime > 0) {
      audio.currentTime = track.currentTime / 1000;
    }
    
    // Handle fade in
    if (track.fadeIn > 0) {
      audio.volume = 0;
      this._fadeHTMLAudio(audio, this._config.masterVolume * track.volume, track.fadeIn);
    }
    
    // Handle track end
    audio.onended = () => {
      if (track.isPlaying) {
        track.isPlaying = false;
        this._emit('track-ended', track.id);
        this._activeTracks.delete(track.id);
      }
    };
    
    // Handle errors
    audio.onerror = () => {
      this._emit('track-error', track.id, new Error('HTMLAudio playback error'));
    };
    
    // Start playback
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(error => {
        if (error.name === 'NotAllowedError') {
          this._emit('autoplay-blocked', track.id);
        } else {
          this._emit('track-error', track.id, error);
        }
      });
    }
  }
  
  private _pauseTrack(track: ActiveTrack): void {
    track.isPaused = true;
    
    if (track.source) {
      // WebAudio: can't pause, need to stop and restart later
      track.source.stop();
      track.source = undefined;
    } else if (track.audioElement) {
      track.audioElement.pause();
    }
  }
  
  private _stopTrack(track: ActiveTrack): void {
    track.isPlaying = false;
    track.isPaused = false;
    
    // Handle fade out
    if (track.fadeOut > 0) {
      if (track.gainNode && this._audioContext) {
        const now = this._audioContext.currentTime;
        track.gainNode.gain.linearRampToValueAtTime(0, now + track.fadeOut / 1000);
        
        // Stop after fade completes
        setTimeout(() => {
          this._forceStopTrack(track);
        }, track.fadeOut);
      } else if (track.audioElement) {
        this._fadeHTMLAudio(track.audioElement, 0, track.fadeOut).then(() => {
          this._forceStopTrack(track);
        });
      }
    } else {
      this._forceStopTrack(track);
    }
  }
  
  private _forceStopTrack(track: ActiveTrack): void {
    if (track.source) {
      try {
        track.source.stop();
      } catch (error) {
        // Source might already be stopped
      }
      track.source = undefined;
    }
    
    if (track.audioElement) {
      track.audioElement.pause();
      track.audioElement.currentTime = 0;
    }
    
    this._activeTracks.delete(track.id);
  }
  
  private _updateTrack(track: ActiveTrack, currentTimeMs: number): void {
    track.currentTime = currentTimeMs - track.startTime;
    
    // Handle fade out near end time
    if (track.endTime && track.fadeOut > 0) {
      const timeUntilEnd = track.endTime - currentTimeMs;
      if (timeUntilEnd <= track.fadeOut && timeUntilEnd > 0) {
        const fadeProgress = 1 - (timeUntilEnd / track.fadeOut);
        const targetVolume = track.volume * (1 - fadeProgress);
        
        if (track.gainNode && this._audioContext) {
          track.gainNode.gain.setValueAtTime(targetVolume, this._audioContext.currentTime);
        } else if (track.audioElement) {
          track.audioElement.volume = this._config.masterVolume * targetVolume;
        }
      }
    }
  }
  
  private async _fadeHTMLAudio(audio: HTMLAudioElement, targetVolume: number, durationMs: number): Promise<void> {
    const startVolume = audio.volume;
    const startTime = performance.now();
    
    return new Promise(resolve => {
      const updateVolume = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        
        audio.volume = startVolume + (targetVolume - startVolume) * progress;
        
        if (progress < 1) {
          requestAnimationFrame(updateVolume);
        } else {
          resolve();
        }
      };
      
      updateVolume();
    });
  }
  
  private _setupUserInteractionDetection(): void {
    const events = ['click', 'touchstart', 'keydown'];
    
    const handleInteraction = () => {
      this._userInteracted = true;
      
      // Remove listeners after first interaction
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
      
      // Try to resume audio context if suspended
      if (this._audioContext && this._audioContext.state === 'suspended') {
        this._audioContext.resume();
      }
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true, passive: true });
    });
  }
  
  private _emit<K extends keyof AudioSystemEvents>(event: K, ...args: Parameters<AudioSystemEvents[K]>): void {
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          (callback as any)(...args);
        } catch (error) {
          console.error(`Error in audio system event listener for "${event}":`, error);
        }
      });
    }
  }
}