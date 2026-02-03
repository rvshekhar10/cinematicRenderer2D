/**
 * Unit tests for TransitionEngine
 * 
 * Tests all transition types and core functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransitionEngine, TransitionConfig, TransitionContext } from './TransitionEngine';
import type { CompiledScene } from '../types/CompiledSpec';

describe('TransitionEngine', () => {
  let engine: TransitionEngine;
  let mockContainer: HTMLElement;
  let mockFromScene: CompiledScene;
  let mockToScene: CompiledScene;
  let mockContext: TransitionContext;
  
  beforeEach(() => {
    engine = new TransitionEngine();
    mockContainer = document.createElement('div');
    
    mockFromScene = {
      id: 'scene1',
      name: 'Scene 1',
      duration: 5000,
      layers: [],
      audioTracks: [],
      startTime: 0,
      endTime: 5000,
    };
    
    mockToScene = {
      id: 'scene2',
      name: 'Scene 2',
      duration: 5000,
      layers: [],
      audioTracks: [],
      startTime: 5000,
      endTime: 10000,
    };
    
    mockContext = {
      fromScene: mockFromScene,
      toScene: mockToScene,
      container: mockContainer,
      onProgress: vi.fn(),
      onComplete: vi.fn(),
    };
  });
  
  describe('Constructor', () => {
    it('should create instance with built-in transitions registered', () => {
      const availableTransitions = engine.getAvailableTransitions();
      
      expect(availableTransitions).toContain('crossfade');
      expect(availableTransitions).toContain('slide');
      expect(availableTransitions).toContain('zoom');
      expect(availableTransitions).toContain('wipe');
      expect(availableTransitions).toContain('dissolve');
      expect(availableTransitions).toContain('blur');
    });
  });
  
  describe('registerTransition', () => {
    it('should register custom transition handler', () => {
      const customHandler = {
        execute: vi.fn().mockResolvedValue(undefined),
      };
      
      engine.registerTransition('custom', customHandler);
      
      const availableTransitions = engine.getAvailableTransitions();
      expect(availableTransitions).toContain('custom');
    });
  });
  
  describe('executeTransition', () => {
    it('should throw error for unknown transition type', async () => {
      const config: TransitionConfig = {
        type: 'unknown' as any,
        duration: 500,
        easing: 'linear',
      };
      
      await expect(engine.executeTransition(config, mockContext)).rejects.toThrow(
        'Unknown transition type: unknown'
      );
    });
    
    it('should execute crossfade transition', async () => {
      const config: TransitionConfig = {
        type: 'crossfade',
        duration: 100,
        easing: 'linear',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should execute slide transition with default direction', async () => {
      const config: TransitionConfig = {
        type: 'slide',
        duration: 100,
        easing: 'linear',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should execute slide transition with custom direction', async () => {
      const config: TransitionConfig = {
        type: 'slide',
        duration: 100,
        easing: 'linear',
        direction: 'up',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should execute zoom transition', async () => {
      const config: TransitionConfig = {
        type: 'zoom',
        duration: 100,
        easing: 'linear',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should execute wipe transition', async () => {
      const config: TransitionConfig = {
        type: 'wipe',
        duration: 100,
        easing: 'linear',
        direction: 'left',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should execute dissolve transition', async () => {
      const config: TransitionConfig = {
        type: 'dissolve',
        duration: 100,
        easing: 'linear',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should execute blur transition', async () => {
      const config: TransitionConfig = {
        type: 'blur',
        duration: 100,
        easing: 'linear',
        blurAmount: 15,
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should call onProgress callback during transition', async () => {
      const config: TransitionConfig = {
        type: 'crossfade',
        duration: 100,
        easing: 'linear',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onProgress).toHaveBeenCalled();
      expect(mockContext.onProgress).toHaveBeenCalledWith(expect.any(Number));
    });
    
    it('should cancel active transition when new transition starts', async () => {
      const config1: TransitionConfig = {
        type: 'crossfade',
        duration: 500,
        easing: 'linear',
      };
      
      const config2: TransitionConfig = {
        type: 'slide',
        duration: 100,
        easing: 'linear',
      };
      
      // Start first transition (don't await)
      const promise1 = engine.executeTransition(config1, mockContext);
      
      // Start second transition immediately
      await engine.executeTransition(config2, mockContext);
      
      // Wait for first transition to complete
      await promise1;
      
      // Both should complete without error
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
  });
  
  describe('isTransitioning', () => {
    it('should return false when no transition is active', () => {
      expect(engine.isTransitioning()).toBe(false);
    });
    
    it('should return true during transition', async () => {
      const config: TransitionConfig = {
        type: 'crossfade',
        duration: 200,
        easing: 'linear',
      };
      
      const promise = engine.executeTransition(config, mockContext);
      
      // Check immediately after starting
      expect(engine.isTransitioning()).toBe(true);
      
      await promise;
      
      // Should be false after completion
      expect(engine.isTransitioning()).toBe(false);
    });
  });
  
  describe('cancelTransition', () => {
    it('should cancel active transition', async () => {
      const config: TransitionConfig = {
        type: 'crossfade',
        duration: 500,
        easing: 'linear',
      };
      
      const promise = engine.executeTransition(config, mockContext);
      
      // Cancel immediately
      engine.cancelTransition();
      
      await promise;
      
      // onComplete should not be called when cancelled
      expect(mockContext.onComplete).not.toHaveBeenCalled();
    });
  });
  
  describe('Easing functions', () => {
    it('should apply linear easing', async () => {
      const config: TransitionConfig = {
        type: 'crossfade',
        duration: 100,
        easing: 'linear',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should apply ease-in easing', async () => {
      const config: TransitionConfig = {
        type: 'crossfade',
        duration: 100,
        easing: 'ease-in',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should apply ease-out easing', async () => {
      const config: TransitionConfig = {
        type: 'crossfade',
        duration: 100,
        easing: 'ease-out',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should apply ease-in-out easing', async () => {
      const config: TransitionConfig = {
        type: 'crossfade',
        duration: 100,
        easing: 'ease-in-out',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
  });
  
  describe('Slide directions', () => {
    it('should handle left slide direction', async () => {
      const config: TransitionConfig = {
        type: 'slide',
        duration: 100,
        easing: 'linear',
        direction: 'left',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should handle right slide direction', async () => {
      const config: TransitionConfig = {
        type: 'slide',
        duration: 100,
        easing: 'linear',
        direction: 'right',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should handle up slide direction', async () => {
      const config: TransitionConfig = {
        type: 'slide',
        duration: 100,
        easing: 'linear',
        direction: 'up',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should handle down slide direction', async () => {
      const config: TransitionConfig = {
        type: 'slide',
        duration: 100,
        easing: 'linear',
        direction: 'down',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
  });
  
  describe('Wipe directions', () => {
    it('should handle left wipe direction', async () => {
      const config: TransitionConfig = {
        type: 'wipe',
        duration: 100,
        easing: 'linear',
        direction: 'left',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should handle right wipe direction', async () => {
      const config: TransitionConfig = {
        type: 'wipe',
        duration: 100,
        easing: 'linear',
        direction: 'right',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should handle up wipe direction', async () => {
      const config: TransitionConfig = {
        type: 'wipe',
        duration: 100,
        easing: 'linear',
        direction: 'up',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should handle down wipe direction', async () => {
      const config: TransitionConfig = {
        type: 'wipe',
        duration: 100,
        easing: 'linear',
        direction: 'down',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
  });
  
  describe('Custom blur amount', () => {
    it('should use default blur amount when not specified', async () => {
      const config: TransitionConfig = {
        type: 'blur',
        duration: 100,
        easing: 'linear',
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
    
    it('should use custom blur amount when specified', async () => {
      const config: TransitionConfig = {
        type: 'blur',
        duration: 100,
        easing: 'linear',
        blurAmount: 25,
      };
      
      await engine.executeTransition(config, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
  });
  
  describe('Default transition', () => {
    it('should provide default transition configuration', () => {
      const defaultConfig = TransitionEngine.getDefaultTransition();
      
      expect(defaultConfig.type).toBe('crossfade');
      expect(defaultConfig.duration).toBe(500);
      expect(defaultConfig.easing).toBe('ease-in-out');
    });
    
    it('should execute default transition', async () => {
      const defaultConfig = TransitionEngine.getDefaultTransition();
      
      await engine.executeTransition(defaultConfig, mockContext);
      
      expect(mockContext.onComplete).toHaveBeenCalled();
    });
  });
});
