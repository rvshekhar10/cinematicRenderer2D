/**
 * Integration tests for TransitionEngine
 * 
 * Tests the complete transition workflow with SceneLifecycleManager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TransitionEngine } from './TransitionEngine';
import { SceneLifecycleManager } from '../core/SceneLifecycleManager';
import type { CompiledScene } from '../types/CompiledSpec';
import type { AssetManager } from '../assets/AssetManager';
import type { LayerRegistry } from '../core/LayerRegistry';

describe('TransitionEngine Integration', () => {
  let transitionEngine: TransitionEngine;
  let lifecycleManager: SceneLifecycleManager;
  let mockContainer: HTMLElement;
  let scene1: CompiledScene;
  let scene2: CompiledScene;
  
  beforeEach(() => {
    transitionEngine = new TransitionEngine();
    mockContainer = document.createElement('div');
    
    // Create mock asset manager
    const mockAssetManager: AssetManager = {
      isAssetLoaded: () => true,
      getAsset: () => null,
    } as any;
    
    // Create mock layer registry
    const mockLayerRegistry: LayerRegistry = {
      createLayer: () => ({
        id: 'test-layer',
        type: 'gradient',
        zIndex: 0,
        mount: () => {},
        update: () => {},
        destroy: () => {},
      }),
    } as any;
    
    lifecycleManager = new SceneLifecycleManager({
      assetManager: mockAssetManager,
      layerRegistry: mockLayerRegistry,
      container: mockContainer,
    });
    
    // Create test scenes
    scene1 = {
      id: 'scene1',
      name: 'Scene 1',
      duration: 5000,
      layers: [{
        id: 'layer1',
        type: 'gradient',
        zIndex: 0,
        instance: null as any,
        animations: [],
        initialConfig: {},
        active: false,
      }],
      audioTracks: [],
      startTime: 0,
      endTime: 5000,
    };
    
    scene2 = {
      id: 'scene2',
      name: 'Scene 2',
      duration: 5000,
      layers: [{
        id: 'layer2',
        type: 'gradient',
        zIndex: 0,
        instance: null as any,
        animations: [],
        initialConfig: {},
        active: false,
      }],
      audioTracks: [],
      startTime: 5000,
      endTime: 10000,
    };
  });
  
  describe('Scene transitions with TransitionEngine', () => {
    it('should transition between scenes using crossfade', async () => {
      // Activate first scene
      await lifecycleManager.activateScene(scene1);
      expect(lifecycleManager.getActiveScene()).toBe(scene1);
      
      // Transition to second scene
      await lifecycleManager.activateScene(scene2, {
        type: 'crossfade',
        duration: 100,
        easing: 'linear',
      });
      
      expect(lifecycleManager.getActiveScene()).toBe(scene2);
    });
    
    it('should transition between scenes using slide', async () => {
      await lifecycleManager.activateScene(scene1);
      
      await lifecycleManager.activateScene(scene2, {
        type: 'slide',
        duration: 100,
        easing: 'ease-in-out',
        direction: 'left',
      });
      
      expect(lifecycleManager.getActiveScene()).toBe(scene2);
    });
    
    it('should transition between scenes using zoom', async () => {
      await lifecycleManager.activateScene(scene1);
      
      await lifecycleManager.activateScene(scene2, {
        type: 'zoom',
        duration: 100,
        easing: 'ease-out',
      });
      
      expect(lifecycleManager.getActiveScene()).toBe(scene2);
    });
    
    it('should handle multiple sequential transitions', async () => {
      const scene3: CompiledScene = {
        ...scene2,
        id: 'scene3',
        name: 'Scene 3',
      };
      
      // Scene 1 -> Scene 2
      await lifecycleManager.activateScene(scene1);
      await lifecycleManager.activateScene(scene2, {
        type: 'crossfade',
        duration: 50,
        easing: 'linear',
      });
      
      expect(lifecycleManager.getActiveScene()).toBe(scene2);
      
      // Scene 2 -> Scene 3
      await lifecycleManager.activateScene(scene3, {
        type: 'slide',
        duration: 50,
        easing: 'linear',
        direction: 'up',
      });
      
      expect(lifecycleManager.getActiveScene()).toBe(scene3);
    });
    
    it('should use default transition when none specified', async () => {
      const defaultTransition = TransitionEngine.getDefaultTransition();
      
      expect(defaultTransition.type).toBe('crossfade');
      expect(defaultTransition.duration).toBe(500);
      expect(defaultTransition.easing).toBe('ease-in-out');
    });
  });
  
  describe('Transition cancellation', () => {
    it('should handle transition interruption', async () => {
      await lifecycleManager.activateScene(scene1);
      
      // Start a long transition
      const transitionPromise = lifecycleManager.activateScene(scene2, {
        type: 'crossfade',
        duration: 1000,
        easing: 'linear',
      });
      
      // Immediately start another transition (this should cancel the first)
      const scene3: CompiledScene = {
        ...scene2,
        id: 'scene3',
        name: 'Scene 3',
      };
      
      await lifecycleManager.activateScene(scene3, {
        type: 'slide',
        duration: 100,
        easing: 'linear',
      });
      
      // Wait for first transition to complete
      await transitionPromise;
      
      // Scene 3 should be active
      expect(lifecycleManager.getActiveScene()).toBe(scene3);
    });
  });
  
  describe('Transition with different easing functions', () => {
    it('should support linear easing', async () => {
      await lifecycleManager.activateScene(scene1);
      
      await lifecycleManager.activateScene(scene2, {
        type: 'crossfade',
        duration: 100,
        easing: 'linear',
      });
      
      expect(lifecycleManager.getActiveScene()).toBe(scene2);
    });
    
    it('should support ease-in easing', async () => {
      await lifecycleManager.activateScene(scene1);
      
      await lifecycleManager.activateScene(scene2, {
        type: 'crossfade',
        duration: 100,
        easing: 'ease-in',
      });
      
      expect(lifecycleManager.getActiveScene()).toBe(scene2);
    });
    
    it('should support ease-out easing', async () => {
      await lifecycleManager.activateScene(scene1);
      
      await lifecycleManager.activateScene(scene2, {
        type: 'crossfade',
        duration: 100,
        easing: 'ease-out',
      });
      
      expect(lifecycleManager.getActiveScene()).toBe(scene2);
    });
    
    it('should support ease-in-out easing', async () => {
      await lifecycleManager.activateScene(scene1);
      
      await lifecycleManager.activateScene(scene2, {
        type: 'crossfade',
        duration: 100,
        easing: 'ease-in-out',
      });
      
      expect(lifecycleManager.getActiveScene()).toBe(scene2);
    });
  });
});
