/**
 * Unit tests for SceneLifecycleManager
 * 
 * Tests the scene lifecycle phases and state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SceneLifecycleManager } from './SceneLifecycleManager';
import { SceneState } from './StateMachine';
import type { CompiledScene } from '../types/CompiledSpec';
import type { AssetManager } from '../assets/AssetManager';
import type { LayerRegistry } from './LayerRegistry';

describe('SceneLifecycleManager', () => {
  let lifecycleManager: SceneLifecycleManager;
  let mockAssetManager: AssetManager;
  let mockLayerRegistry: LayerRegistry;
  let mockContainer: HTMLElement;
  let mockScene: CompiledScene;
  
  beforeEach(() => {
    // Create mock container
    mockContainer = document.createElement('div');
    
    // Create mock asset manager
    mockAssetManager = {
      isAssetLoaded: vi.fn().mockReturnValue(true),
      getAsset: vi.fn(),
      preloadAsset: vi.fn(),
    } as any;
    
    // Create mock layer registry
    mockLayerRegistry = {
      createLayer: vi.fn().mockReturnValue({
        id: 'test-layer',
        type: 'gradient',
        zIndex: 0,
        mount: vi.fn(),
        update: vi.fn(),
        destroy: vi.fn(),
      }),
    } as any;
    
    // Create mock scene
    mockScene = {
      id: 'test-scene',
      name: 'Test Scene',
      duration: 5000,
      layers: [
        {
          id: 'layer-1',
          type: 'gradient',
          zIndex: 0,
          instance: null as any,
          animations: [],
          initialConfig: {},
          active: false,
        },
      ],
      audioTracks: [],
      startTime: 0,
      endTime: 5000,
    };
    
    // Create lifecycle manager
    lifecycleManager = new SceneLifecycleManager({
      assetManager: mockAssetManager,
      layerRegistry: mockLayerRegistry,
      container: mockContainer,
    });
  });
  
  describe('activateScene', () => {
    it('should execute lifecycle phases in correct order', async () => {
      await lifecycleManager.activateScene(mockScene);
      
      // Verify scene is active
      expect(lifecycleManager.getActiveScene()).toBe(mockScene);
      expect(lifecycleManager.getSceneState(mockScene.id)).toBe(SceneState.ACTIVE);
    });
    
    it('should deactivate previous scene before activating new one', async () => {
      const scene1 = { ...mockScene, id: 'scene-1' };
      const scene2 = { ...mockScene, id: 'scene-2' };
      
      await lifecycleManager.activateScene(scene1);
      expect(lifecycleManager.getActiveScene()).toBe(scene1);
      
      await lifecycleManager.activateScene(scene2);
      expect(lifecycleManager.getActiveScene()).toBe(scene2);
      
      // Scene 1 should be deactivated (no state since it was destroyed)
      expect(lifecycleManager.getSceneState(scene1.id)).toBe(SceneState.CREATED);
    });
  });
  
  describe('deactivateScene', () => {
    it('should execute cleanup phases in correct order', async () => {
      await lifecycleManager.activateScene(mockScene);
      await lifecycleManager.deactivateScene(mockScene);
      
      // Verify scene is no longer active
      expect(lifecycleManager.getActiveScene()).toBeNull();
    });
    
    it('should not throw if scene is not active', async () => {
      await expect(lifecycleManager.deactivateScene(mockScene)).resolves.not.toThrow();
    });
  });
  
  describe('getSceneState', () => {
    it('should return CREATED for unknown scenes', () => {
      expect(lifecycleManager.getSceneState('unknown-scene')).toBe(SceneState.CREATED);
    });
    
    it('should track scene state through lifecycle', async () => {
      // Initial state
      expect(lifecycleManager.getSceneState(mockScene.id)).toBe(SceneState.CREATED);
      
      // After activation
      await lifecycleManager.activateScene(mockScene);
      expect(lifecycleManager.getSceneState(mockScene.id)).toBe(SceneState.ACTIVE);
    });
  });
  
  describe('ensureSingleActiveScene', () => {
    it('should not throw when only one scene is active', async () => {
      await lifecycleManager.activateScene(mockScene);
      expect(() => lifecycleManager.ensureSingleActiveScene()).not.toThrow();
    });
  });
  
  describe('lifecycle phases', () => {
    it('should create layer instances during mount phase', async () => {
      await lifecycleManager.activateScene(mockScene);
      
      // Verify layer was created
      expect(mockLayerRegistry.createLayer).toHaveBeenCalledWith(
        'gradient',
        'layer-1',
        {}
      );
      
      // Verify layer instance was set
      expect(mockScene.layers[0].instance).toBeTruthy();
    });
    
    it('should mark layers as active during play phase', async () => {
      await lifecycleManager.activateScene(mockScene);
      
      // Verify layer is marked as active
      expect(mockScene.layers[0].active).toBe(true);
    });
    
    it('should mark layers as inactive during unmount phase', async () => {
      await lifecycleManager.activateScene(mockScene);
      await lifecycleManager.deactivateScene(mockScene);
      
      // Verify layer is marked as inactive
      expect(mockScene.layers[0].active).toBe(false);
    });
    
    it('should clear layer instances during destroy phase', async () => {
      await lifecycleManager.activateScene(mockScene);
      await lifecycleManager.deactivateScene(mockScene);
      
      // Verify layer instance was cleared
      expect(mockScene.layers[0].instance).toBeNull();
    });
  });
  
  describe('error handling', () => {
    it('should throw descriptive error if phase execution fails', async () => {
      // Make layer creation fail
      mockLayerRegistry.createLayer = vi.fn().mockImplementation(() => {
        throw new Error('Layer creation failed');
      });
      
      await expect(lifecycleManager.activateScene(mockScene)).rejects.toThrow(
        /Failed to execute mount phase/
      );
    });
  });
  
  describe('TransitionEngine integration', () => {
    it('should have a TransitionEngine instance', () => {
      const transitionEngine = lifecycleManager.getTransitionEngine();
      
      expect(transitionEngine).toBeDefined();
    });
    
    it('should activate scene with transition config', async () => {
      const scene1 = { ...mockScene, id: 'scene1', layers: [{ ...mockScene.layers[0] }] };
      const scene2 = { ...mockScene, id: 'scene2', layers: [{ ...mockScene.layers[0] }] };
      
      // Activate first scene without transition
      await lifecycleManager.activateScene(scene1);
      
      expect(lifecycleManager.getActiveScene()).toBe(scene1);
      expect(lifecycleManager.getSceneState('scene1')).toBe(SceneState.ACTIVE);
      
      // Activate second scene with transition
      await lifecycleManager.activateScene(scene2, {
        type: 'crossfade',
        duration: 100,
        easing: 'linear',
      });
      
      expect(lifecycleManager.getActiveScene()).toBe(scene2);
      expect(lifecycleManager.getSceneState('scene2')).toBe(SceneState.ACTIVE);
    });
    
    it('should deactivate old scene after transition', async () => {
      const scene1 = { ...mockScene, id: 'scene1', layers: [{ ...mockScene.layers[0] }] };
      const scene2 = { ...mockScene, id: 'scene2', layers: [{ ...mockScene.layers[0] }] };
      
      // Activate first scene
      await lifecycleManager.activateScene(scene1);
      
      // Activate second scene with transition
      await lifecycleManager.activateScene(scene2, {
        type: 'slide',
        duration: 100,
        easing: 'linear',
        direction: 'left',
      });
      
      // Old scene should be unmounted
      expect(lifecycleManager.getSceneState('scene1')).not.toBe(SceneState.ACTIVE);
      expect(lifecycleManager.getActiveScene()).toBe(scene2);
    });
  });
});
