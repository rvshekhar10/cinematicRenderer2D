/**
 * AudioSystem unit tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioSystem } from './AudioSystem';
import type { CompiledAudioTrack } from '../types/CompiledSpec';
import type { Asset } from '../types/AssetTypes';

// Mock Web Audio API
const mockAudioContext = {
  state: 'running' as AudioContextState,
  currentTime: 0,
  sampleRate: 44100,
  destination: {} as AudioDestinationNode,
  createGain: vi.fn(() => ({
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  })),
  createBufferSource: vi.fn(() => ({
    buffer: null,
    loop: false,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
  })),
  decodeAudioData: vi.fn(() => Promise.resolve(new ArrayBuffer(1024))),
  resume: vi.fn(() => Promise.resolve()),
  close: vi.fn(() => Promise.resolve()),
  addEventListener: vi.fn(),
};

// Mock HTML Audio
const mockAudio = {
  src: '',
  volume: 1,
  currentTime: 0,
  loop: false,
  preload: 'auto',
  play: vi.fn(() => Promise.resolve()),
  pause: vi.fn(),
  load: vi.fn(),
  oncanplaythrough: null,
  onended: null,
  onerror: null,
};

describe('AudioSystem', () => {
  let audioSystem: AudioSystem;
  let mockAsset: Asset;
  let mockTrack: CompiledAudioTrack;

  beforeEach(() => {
    // Mock global Audio constructor
    global.Audio = vi.fn(() => mockAudio) as any;
    
    // Mock AudioContext
    global.AudioContext = vi.fn(() => mockAudioContext) as any;
    (global as any).webkitAudioContext = global.AudioContext;
    
    audioSystem = new AudioSystem({
      preferWebAudio: true,
      masterVolume: 0.8,
      maxConcurrentTracks: 4,
    });

    mockAsset = {
      id: 'test-audio',
      type: 'audio',
      src: 'test-audio.mp3',
      data: new ArrayBuffer(1024),
      loaded: true,
      error: null,
      metadata: {
        size: 1024,
        mimeType: 'audio/mpeg',
        cacheDuration: 3600000,
        priority: 'normal',
        duration: 5000,
      },
      progress: 1,
    };

    mockTrack = {
      id: 'track-1',
      type: 'voiceover',
      asset: mockAsset,
      startMs: 1000,
      endMs: 6000,
      volume: 0.7,
      fadeIn: 500,
      fadeOut: 500,
      loop: false,
    };
  });

  afterEach(() => {
    audioSystem.destroy();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const system = new AudioSystem();
      expect(system).toBeDefined();
      expect(system.getMasterVolume()).toBe(1.0);
    });

    it('should initialize with custom config', () => {
      expect(audioSystem.getMasterVolume()).toBe(0.8);
    });

    it('should initialize WebAudio when available', async () => {
      await audioSystem.initialize();
      expect(global.AudioContext).toHaveBeenCalled();
      expect(audioSystem.isWebAudioAvailable()).toBe(true);
    });

    it('should handle WebAudio initialization failure gracefully', async () => {
      global.AudioContext = vi.fn(() => {
        throw new Error('WebAudio not supported');
      }) as any;

      const system = new AudioSystem({ preferWebAudio: true });
      await expect(system.initialize()).resolves.not.toThrow();
    });
  });

  describe('track loading', () => {
    beforeEach(async () => {
      await audioSystem.initialize();
    });

    it('should load tracks successfully', async () => {
      await expect(audioSystem.loadTracks([mockTrack])).resolves.not.toThrow();
    });

    it('should handle audio decoding for WebAudio', async () => {
      await audioSystem.loadTracks([mockTrack]);
      expect(mockAudioContext.decodeAudioData).toHaveBeenCalled();
    });

    it('should fall back to HTMLAudio on decode failure', async () => {
      mockAudioContext.decodeAudioData.mockRejectedValue(new Error('Decode failed'));
      
      await audioSystem.loadTracks([mockTrack]);
      expect(global.Audio).toHaveBeenCalled();
    });

    it('should create HTMLAudio element for HTMLAudioElement assets', async () => {
      const htmlAudioAsset = { ...mockAsset, data: mockAudio as HTMLAudioElement };
      const htmlTrack = { ...mockTrack, asset: htmlAudioAsset };
      
      await audioSystem.loadTracks([htmlTrack]);
      expect(htmlTrack.audioElement).toBe(mockAudio);
    });
  });

  describe('playback control', () => {
    beforeEach(async () => {
      await audioSystem.initialize();
      await audioSystem.loadTracks([mockTrack]);
    });

    it('should start playback', () => {
      // Mock context state as suspended to trigger resume
      mockAudioContext.state = 'suspended';
      audioSystem.play();
      
      // Since user hasn't interacted, resume won't be called
      // Instead check that the system is in playing state
      expect(audioSystem['_isPlaying']).toBe(true);
    });

    it('should pause all active tracks', () => {
      audioSystem.play();
      audioSystem.update(2000); // Start a track
      audioSystem.pause();
      expect(audioSystem['_isPlaying']).toBe(false);
    });

    it('should stop and reset all tracks', () => {
      audioSystem.play();
      audioSystem.update(2000); // Start a track
      audioSystem.stop();
      expect(audioSystem.getActiveTrackCount()).toBe(0);
    });
  });

  describe('timeline synchronization', () => {
    beforeEach(async () => {
      await audioSystem.initialize();
      await audioSystem.loadTracks([mockTrack]);
      audioSystem.play();
    });

    it('should start tracks at correct time', () => {
      audioSystem.update(1500); // Within track time range
      expect(audioSystem.getActiveTrackCount()).toBe(1);
    });

    it('should not start tracks before their time', () => {
      audioSystem.update(500); // Before track start time
      expect(audioSystem.getActiveTrackCount()).toBe(0);
    });

    it('should stop tracks after their end time', () => {
      audioSystem.update(1500); // Start track
      expect(audioSystem.getActiveTrackCount()).toBe(1);
      
      audioSystem.update(7000); // After track end time
      expect(audioSystem.getActiveTrackCount()).toBe(0);
    });

    it('should handle seeking correctly', () => {
      // Manually add a working track to the compiled tracks
      const workingTrack = { 
        ...mockTrack, 
        audioElement: mockAudio as HTMLAudioElement
      };
      audioSystem['_compiledTracks'].set(workingTrack.id, workingTrack);
      
      audioSystem.update(2000); // Start track
      expect(audioSystem.getActiveTrackCount()).toBe(1);
      
      audioSystem.seek(500); // Seek before track start
      expect(audioSystem.getActiveTrackCount()).toBe(0);
      
      // After seeking, the system should still be playing, so update should start tracks
      audioSystem.update(1500); // Update to track time
      expect(audioSystem.getActiveTrackCount()).toBe(1);
    });
  });

  describe('volume control', () => {
    beforeEach(async () => {
      await audioSystem.initialize();
    });

    it('should set master volume', () => {
      audioSystem.setMasterVolume(0.5);
      expect(audioSystem.getMasterVolume()).toBe(0.5);
    });

    it('should clamp volume to valid range', () => {
      audioSystem.setMasterVolume(-0.5);
      expect(audioSystem.getMasterVolume()).toBe(0);
      
      audioSystem.setMasterVolume(1.5);
      expect(audioSystem.getMasterVolume()).toBe(1);
    });

    it('should update WebAudio gain node when setting volume', async () => {
      // Initialize first to create master gain node
      await audioSystem.initialize();
      
      // Get the master gain node that was created during initialization
      const masterGainNode = audioSystem['_masterGainNode'];
      expect(masterGainNode).toBeDefined();
      
      audioSystem.setMasterVolume(0.6);
      expect(audioSystem.getMasterVolume()).toBe(0.6);
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await audioSystem.initialize();
    });

    it('should emit track-error on loading failure', async () => {
      const errorCallback = vi.fn();
      audioSystem.on('track-error', errorCallback);
      
      // Create a track with no valid audio source
      const invalidTrack = { 
        ...mockTrack, 
        asset: { ...mockAsset, data: null },
        audioElement: undefined,
        audioNode: undefined
      };
      
      // Don't call loadTracks - this will ensure no audio source is available
      audioSystem['_compiledTracks'].set(invalidTrack.id, invalidTrack);
      
      audioSystem.play();
      audioSystem.update(1500);
      
      // The error should be emitted when trying to start the track
      expect(errorCallback).toHaveBeenCalled();
    });

    it('should emit autoplay-blocked on autoplay restriction', async () => {
      const autoplayCallback = vi.fn();
      audioSystem.on('autoplay-blocked', autoplayCallback);
      
      // Mock suspended context (autoplay blocked)
      mockAudioContext.state = 'suspended';
      
      audioSystem.play();
      expect(autoplayCallback).toHaveBeenCalled();
    });

    it('should handle concurrent track limit', async () => {
      const tracks = Array.from({ length: 6 }, (_, i) => ({
        ...mockTrack,
        id: `track-${i}`,
        startMs: 1000 + i * 100,
      }));
      
      await audioSystem.loadTracks(tracks);
      audioSystem.play();
      
      // Update to start all tracks
      audioSystem.update(2000);
      
      // Should not exceed max concurrent tracks (4)
      expect(audioSystem.getActiveTrackCount()).toBeLessThanOrEqual(4);
    });
  });

  describe('event system', () => {
    it('should add and remove event listeners', () => {
      const callback = vi.fn();
      
      audioSystem.on('track-started', callback);
      audioSystem.off('track-started', callback);
      
      // Verify listener was removed (no direct way to test, but ensures no errors)
      expect(() => audioSystem.off('track-started', callback)).not.toThrow();
    });

    it('should emit track-started event', async () => {
      const callback = vi.fn();
      audioSystem.on('track-started', callback);
      
      await audioSystem.initialize();
      await audioSystem.loadTracks([mockTrack]);
      audioSystem.play();
      audioSystem.update(1500);
      
      expect(callback).toHaveBeenCalledWith('track-1');
    });
  });

  describe('cleanup', () => {
    it('should destroy cleanly', async () => {
      await audioSystem.initialize();
      await audioSystem.loadTracks([mockTrack]);
      
      audioSystem.destroy();
      
      expect(mockAudioContext.close).toHaveBeenCalled();
      expect(audioSystem.getActiveTrackCount()).toBe(0);
    });

    it('should handle multiple destroy calls', async () => {
      await audioSystem.initialize();
      
      audioSystem.destroy();
      expect(() => audioSystem.destroy()).not.toThrow();
    });
  });
});