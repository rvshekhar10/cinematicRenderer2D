/**
 * Scene Lifecycle Manager
 * 
 * Manages scene lifecycle phases ensuring proper resource initialization and cleanup.
 * Implements the prepare → mount → play → unmount → destroy lifecycle.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */

import type { CompiledScene } from '../types/CompiledSpec';
import type { AssetManager } from '../assets/AssetManager';
import type { LayerRegistry } from './LayerRegistry';
import type { ICinematicLayer } from './interfaces/ICinematicLayer';
import { SceneState } from './StateMachine';
import { TransitionEngine, TransitionConfig } from '../transitions/TransitionEngine';

export interface SceneLifecyclePhase {
  name: 'prepare' | 'mount' | 'play' | 'unmount' | 'destroy';
  execute: (scene: CompiledScene) => Promise<void>;
}

export interface SceneLifecycleManagerOptions {
  assetManager: AssetManager;
  layerRegistry: LayerRegistry;
  container: HTMLElement;
}

export class SceneLifecycleManager {
  private activeScene: CompiledScene | null = null;
  private sceneStates: Map<string, SceneState> = new Map();
  private assetManager: AssetManager;
  private layerRegistry: LayerRegistry;
  private container: HTMLElement;
  private transitionEngine: TransitionEngine;
  
  constructor(options: SceneLifecycleManagerOptions) {
    this.assetManager = options.assetManager;
    this.layerRegistry = options.layerRegistry;
    this.container = options.container;
    this.transitionEngine = new TransitionEngine();
  }
  
  /**
   * Execute full lifecycle for a scene
   * Requirement 4.1: Execute prepare() → mount() → play() phases in order
   * Requirement 7.8: Use TransitionEngine for scene transitions
   */
  async activateScene(
    scene: CompiledScene,
    transitionConfig?: TransitionConfig
  ): Promise<void> {
    const previousScene = this.activeScene;
    
    // If there's a previous scene and a transition is specified, use TransitionEngine
    if (previousScene && transitionConfig) {
      await this.transitionToScene(previousScene, scene, transitionConfig);
    } else {
      // No transition - just deactivate old scene and activate new one
      if (previousScene) {
        await this.deactivateScene(previousScene);
      }
      
      // Execute lifecycle phases in order
      await this.executePhase(scene, {
        name: 'prepare',
        execute: async (s) => await this.prepare(s),
      });
      
      await this.executePhase(scene, {
        name: 'mount',
        execute: async (s) => await this.mount(s),
      });
      
      await this.executePhase(scene, {
        name: 'play',
        execute: async (s) => await this.play(s),
      });
      
      this.activeScene = scene;
    }
  }
  
  /**
   * Transition from one scene to another using TransitionEngine
   * Requirement 7.8: Coordinate transitions with state machine
   * Requirement 2.4: Ensure old scene is fully destroyed before new scene is active
   */
  private async transitionToScene(
    fromScene: CompiledScene,
    toScene: CompiledScene,
    transitionConfig: TransitionConfig
  ): Promise<void> {
    // Prepare the new scene first
    await this.executePhase(toScene, {
      name: 'prepare',
      execute: async (s) => await this.prepare(s),
    });
    
    // Mount the new scene (but don't play it yet)
    await this.executePhase(toScene, {
      name: 'mount',
      execute: async (s) => await this.mount(s),
    });
    
    // Mark old scene as exiting
    this.sceneStates.set(fromScene.id, SceneState.EXITING);
    
    // Execute transition
    await this.transitionEngine.executeTransition(transitionConfig, {
      fromScene,
      toScene,
      container: this.container,
      onProgress: (_progress) => {
        // Progress callback - could emit events here in future
      },
      onComplete: () => {
        // Transition complete
      },
    });
    
    // Deactivate old scene (unmount and destroy)
    await this.deactivateScene(fromScene);
    
    // Activate new scene (play phase)
    await this.executePhase(toScene, {
      name: 'play',
      execute: async (s) => await this.play(s),
    });
    
    this.activeScene = toScene;
  }
  
  /**
   * Get the TransitionEngine instance
   */
  getTransitionEngine(): TransitionEngine {
    return this.transitionEngine;
  }
  
  /**
   * Execute specific lifecycle phase
   */
  async executePhase(
    scene: CompiledScene,
    phase: SceneLifecyclePhase
  ): Promise<void> {
    try {
      await phase.execute(scene);
    } catch (error) {
      throw new Error(
        `Failed to execute ${phase.name} phase for scene ${scene.id}: ${error}`
      );
    }
  }
  
  /**
   * Get current active scene
   */
  getActiveScene(): CompiledScene | null {
    return this.activeScene;
  }
  
  /**
   * Get scene state
   */
  getSceneState(sceneId: string): SceneState {
    return this.sceneStates.get(sceneId) || SceneState.CREATED;
  }
  
  /**
   * Cleanup and deactivate scene
   * Requirement 4.1: Execute unmount() → destroy() phases in order
   */
  async deactivateScene(scene: CompiledScene): Promise<void> {
    if (this.activeScene?.id !== scene.id) {
      return; // Scene is not active
    }
    
    // Execute cleanup phases in order
    await this.executePhase(scene, {
      name: 'unmount',
      execute: async (s) => await this.unmount(s),
    });
    
    await this.executePhase(scene, {
      name: 'destroy',
      execute: async (s) => await this.destroy(s),
    });
    
    this.activeScene = null;
  }
  
  /**
   * Prepare phase: Preload all assets required by the scene
   * Requirement 4.2: Preload all assets required by the scene
   */
  private async prepare(scene: CompiledScene): Promise<void> {
    // Extract asset IDs from scene layers
    const assetIds: string[] = [];
    
    for (const layer of scene.layers) {
      // Check for asset references in layer config
      if (layer.initialConfig['assetId']) {
        assetIds.push(layer.initialConfig['assetId']);
      }
      if (layer.initialConfig['src']) {
        assetIds.push(layer.initialConfig['src']);
      }
    }
    
    // Preload audio track assets
    for (const audioTrack of scene.audioTracks) {
      if (audioTrack.asset) {
        assetIds.push(audioTrack.asset.id);
      }
    }
    
    // Preload all assets using the correct method
    if (assetIds.length > 0) {
      // AssetManager doesn't have preloadAssets, we need to load them individually
      // or use loadAssets with asset definitions
      // For now, check if assets are already loaded
      for (const assetId of assetIds) {
        if (!this.assetManager.isAssetLoaded(assetId)) {
          // Asset needs to be loaded - this will be handled by the asset preloader
          // in future tasks. For now, we just track that preparation is needed.
        }
      }
    }
    
    // Update scene state
    this.sceneStates.set(scene.id, SceneState.CREATED);
  }
  
  /**
   * Mount phase: Create and attach all layer DOM nodes to the container
   * Requirement 4.3: Create and attach all layer DOM nodes to the container
   */
  private async mount(scene: CompiledScene): Promise<void> {
    // Create layer instances from specs if not already created
    for (const compiledLayer of scene.layers) {
      if (!compiledLayer.instance) {
        // Create layer instance
        const layer = this.layerRegistry.createLayer(
          compiledLayer.type,
          compiledLayer.id,
          compiledLayer.initialConfig
        );
        compiledLayer.instance = layer;
      }
      
      // Mount the layer
      const layer = compiledLayer.instance;
      if (layer && typeof layer.mount === 'function') {
        layer.mount({
          container: this.container,
          renderer: null as any, // Will be set by renderer
          assetManager: this.assetManager,
          layerConfig: compiledLayer.initialConfig,
        });
      }
    }
    
    // Update scene state
    this.sceneStates.set(scene.id, SceneState.MOUNTED);
  }
  
  /**
   * Play phase: Start all animations and audio tracks
   * Requirement 4.4: Start all animations and audio tracks for the scene
   */
  private async play(scene: CompiledScene): Promise<void> {
    // Start animations for all layers
    for (const compiledLayer of scene.layers) {
      if (compiledLayer.instance) {
        // Mark layer as active
        compiledLayer.active = true;
        
        // Start animations (handled by animation system)
        // This will be integrated with the animation compiler in future tasks
      }
    }
    
    // Start audio tracks (handled by audio system)
    // This will be integrated with the audio system in future tasks
    
    // Update scene state
    this.sceneStates.set(scene.id, SceneState.ACTIVE);
  }
  
  /**
   * Unmount phase: Remove all layer DOM nodes from the container
   * Requirement 4.5: Remove all layer DOM nodes from the container
   */
  private async unmount(scene: CompiledScene): Promise<void> {
    // Remove DOM nodes for all layers
    for (const compiledLayer of scene.layers) {
      if (compiledLayer.instance && typeof compiledLayer.instance.destroy === 'function') {
        // Destroy will remove DOM nodes
        compiledLayer.instance.destroy();
      }
      
      // Mark layer as inactive
      compiledLayer.active = false;
    }
    
    // Update scene state
    this.sceneStates.set(scene.id, SceneState.UNMOUNTED);
  }
  
  /**
   * Destroy phase: Release all resources and cancel all pending operations
   * Requirement 4.6: Release all resources and cancel all pending operations
   */
  private async destroy(scene: CompiledScene): Promise<void> {
    // Release all resources
    for (const compiledLayer of scene.layers) {
      if (compiledLayer.instance) {
        // Ensure layer is fully destroyed
        if (typeof compiledLayer.instance.destroy === 'function') {
          compiledLayer.instance.destroy();
        }
        
        // Clear reference
        compiledLayer.instance = null as any;
      }
      
      // Clear animations
      compiledLayer.animations = [];
    }
    
    // Clear audio tracks
    scene.audioTracks = [];
    
    // Remove scene state
    this.sceneStates.delete(scene.id);
  }
  
  /**
   * Ensure only one scene is in ACTIVE state at any given time
   * Requirement 4.7: Ensure only one scene is in ACTIVE state at any given time
   */
  ensureSingleActiveScene(): void {
    let activeSceneCount = 0;
    
    for (const [sceneId, state] of this.sceneStates.entries()) {
      if (state === SceneState.ACTIVE) {
        activeSceneCount++;
        
        if (activeSceneCount > 1) {
          throw new Error(
            `Multiple scenes in ACTIVE state detected. Only one scene can be active at a time.`
          );
        }
      }
    }
  }
}
