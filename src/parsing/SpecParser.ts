/**
 * JSON Specification Parser with Zod validation
 * 
 * Provides comprehensive JSON schema validation, default value application,
 * and descriptive error message generation for cinematic specifications.
 * Supports schema versioning for backward compatibility.
 * 
 * Requirements: 3.1, 3.2, 3.4, 3.5
 */

import { z } from 'zod';
import type { 
  CinematicSpec, 
  CinematicEvent, 
  CinematicScene, 
  LayerSpec, 
  AnimationTrackSpec, 
  AudioTrackSpec, 
  TransitionSpec, 
  AssetDefinition,
  EasingType
} from '../types/CinematicSpec';
import type { 
  CompiledSpec, 
  CompiledEvent, 
  CompiledScene, 
  CompiledLayer, 
  CompiledAnimationTrack, 
  CompiledAudioTrack, 
  CompiledTransition,
  CompilationContext
} from '../types/CompiledSpec';
import type { Asset } from '../types/AssetTypes';
import { AnimationCompiler } from '../animation/AnimationCompiler';

/**
 * Supported schema versions for backward compatibility
 */
const SUPPORTED_SCHEMA_VERSIONS = ['1.0.0', '1.1.0'] as const;

/**
 * Zod schema definitions for comprehensive validation
 */

// Basic type schemas
const QualityLevelSchema = z.enum(['low', 'medium', 'high', 'ultra', 'auto']);
const LayerTypeSchema = z.enum([
  'gradient', 'image', 'textBlock', 'vignette', 'glowOrb', 'noiseOverlay',
  'particles', 'starfield', 'dust', 'nebulaNoise', 'webgl-custom'
]);
const EasingTypeSchema = z.enum([
  'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out',
  'ease-in-sine', 'ease-out-sine', 'ease-in-out-sine',
  'ease-in-quad', 'ease-out-quad', 'ease-in-out-quad',
  'ease-in-cubic', 'ease-out-cubic', 'ease-in-out-cubic',
  'ease-in-quart', 'ease-out-quart', 'ease-in-out-quart',
  'ease-in-quint', 'ease-out-quint', 'ease-in-out-quint',
  'ease-in-expo', 'ease-out-expo', 'ease-in-out-expo',
  'ease-in-circ', 'ease-out-circ', 'ease-in-out-circ',
  'ease-in-back', 'ease-out-back', 'ease-in-out-back',
  'ease-in-elastic', 'ease-out-elastic', 'ease-in-out-elastic',
  'ease-in-bounce', 'ease-out-bounce', 'ease-in-out-bounce'
]).or(z.string().regex(/^cubic-bezier\(\d*\.?\d+,\d*\.?\d+,\d*\.?\d+,\d*\.?\d+\)$/));
const AudioTrackTypeSchema = z.enum(['voiceover', 'ambience', 'transition', 'music', 'sfx']);
const TransitionTypeSchema = z.enum(['fade', 'slide', 'zoom', 'wipe', 'dissolve', 'blur']);
const AssetTypeSchema = z.enum(['image', 'video', 'audio', 'font', 'json', 'binary']);

// Transform configuration schema
const TransformConfigSchema = z.object({
  x: z.union([z.number(), z.string()]).optional(),
  y: z.union([z.number(), z.string()]).optional(),
  scale: z.number().optional(),
  rotation: z.number().optional(),
  origin: z.string().optional()
}).optional();

// Layer configuration schema
const LayerConfigSchema = z.object({
  opacity: z.number().min(0).max(1).optional(),
  visible: z.boolean().optional(),
  transform: TransformConfigSchema
}).catchall(z.any()); // Allow additional layer-specific properties

// Animation value schema
const AnimationValueSchema = z.union([
  z.number(),
  z.string(),
  z.boolean(),
  z.record(z.union([z.number(), z.string(), z.boolean()]))
]);

// Animation track schema
const AnimationTrackSpecSchema = z.object({
  property: z.string().min(1),
  from: AnimationValueSchema,
  to: AnimationValueSchema,
  startMs: z.number().min(0),
  endMs: z.number().min(0),
  easing: EasingTypeSchema.optional().default('ease' as EasingType),
  loop: z.boolean().optional().default(false),
  yoyo: z.boolean().optional().default(false)
}).refine(data => data.endMs > data.startMs, {
  message: "endMs must be greater than startMs",
  path: ["endMs"]
});

// Audio track schema
const AudioTrackSpecSchema = z.object({
  id: z.string().min(1),
  type: AudioTrackTypeSchema,
  src: z.string().min(1),
  startMs: z.number().min(0),
  endMs: z.number().min(0).optional(),
  volume: z.number().min(0).max(1).optional().default(1),
  fadeIn: z.number().min(0).optional().default(0),
  fadeOut: z.number().min(0).optional().default(0),
  loop: z.boolean().optional().default(false)
});

// Transition configuration schema
const TransitionConfigSchema = z.object({
  direction: z.enum(['up', 'down', 'left', 'right', 'in', 'out']).optional(),
  blurAmount: z.number().min(0).optional()
}).catchall(z.any()).optional();

// Transition spec schema
const TransitionSpecSchema = z.object({
  type: TransitionTypeSchema,
  duration: z.number().min(0),
  easing: EasingTypeSchema.optional().default('ease' as EasingType),
  config: TransitionConfigSchema
});

// Asset metadata schema
const AssetMetadataSchema = z.object({
  size: z.number().min(0).optional(),
  mimeType: z.string().optional(),
  cacheDuration: z.number().min(0).optional(),
  dimensions: z.object({
    width: z.number().min(1),
    height: z.number().min(1)
  }).optional(),
  duration: z.number().min(0).optional()
}).optional();

// Asset definition schema
const AssetDefinitionSchema = z.object({
  id: z.string().min(1),
  type: AssetTypeSchema,
  src: z.string().min(1),
  preload: z.boolean().optional().default(true),
  fallback: z.string().optional(),
  metadata: AssetMetadataSchema
});

// Layer spec schema
const LayerSpecSchema = z.object({
  id: z.string().min(1),
  type: LayerTypeSchema,
  zIndex: z.number(),
  config: LayerConfigSchema,
  animations: z.array(AnimationTrackSpecSchema).optional().default([])
});

// Scene schema
const CinematicSceneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  duration: z.number().min(0),
  layers: z.array(LayerSpecSchema).min(1),
  audio: z.array(AudioTrackSpecSchema).optional().default([])
});

// Event schema
const CinematicEventSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  scenes: z.array(z.string().min(1)).min(1),
  transitions: z.array(TransitionSpecSchema).optional().default([])
});

// Engine configuration schema
const EngineConfigSchema = z.object({
  targetFps: z.number().min(1).max(240).optional().default(60),
  quality: QualityLevelSchema.optional().default('auto'),
  debug: z.boolean().optional().default(false),
  autoplay: z.boolean().optional().default(false)
});

// Main cinematic spec schema
const CinematicSpecSchema = z.object({
  schemaVersion: z.string().min(1),
  engine: EngineConfigSchema,
  events: z.array(CinematicEventSchema).min(1),
  scenes: z.array(CinematicSceneSchema).min(1),
  assets: z.array(AssetDefinitionSchema).optional().default([])
}).refine(data => {
  // Validate that all scene IDs referenced in events exist
  const sceneIds = new Set(data.scenes.map(scene => scene.id));
  const referencedSceneIds = new Set(data.events.flatMap(event => event.scenes));
  
  for (const sceneId of referencedSceneIds) {
    if (!sceneIds.has(sceneId)) {
      return false;
    }
  }
  return true;
}, {
  message: "All scene IDs referenced in events must exist in the scenes array",
  path: ["events"]
}).refine(data => {
  // Validate unique IDs within each collection
  const eventIds = data.events.map(e => e.id);
  const sceneIds = data.scenes.map(s => s.id);
  const assetIds = data.assets?.map(a => a.id) || [];
  
  return new Set(eventIds).size === eventIds.length &&
         new Set(sceneIds).size === sceneIds.length &&
         new Set(assetIds).size === assetIds.length;
}, {
  message: "All IDs must be unique within their respective collections",
  path: ["events", "scenes", "assets"]
});

/**
 * SpecParser class with comprehensive Zod validation and compilation
 */
export class SpecParser {
  /**
   * Validates and parses a raw JSON specification into a validated CinematicSpec
   * 
   * @param spec - Raw JSON specification to validate
   * @returns Validated CinematicSpec with applied defaults
   * @throws ZodError with descriptive validation messages
   */
  static validate(spec: unknown): CinematicSpec {
    try {
      // First validate the schema version
      if (typeof spec !== 'object' || spec === null) {
        throw new Error('Specification must be a valid object');
      }
      
      const rawSpec = spec as Record<string, any>;
      const schemaVersion = rawSpec['schemaVersion'];
      
      if (!schemaVersion || typeof schemaVersion !== 'string') {
        throw new Error('Missing or invalid schemaVersion. Current supported versions: ' + 
                       SUPPORTED_SCHEMA_VERSIONS.join(', '));
      }
      
      if (!SUPPORTED_SCHEMA_VERSIONS.includes(schemaVersion as any)) {
        throw new Error(`Unsupported schema version: ${schemaVersion}. ` +
                       `Supported versions: ${SUPPORTED_SCHEMA_VERSIONS.join(', ')}`);
      }
      
      // Apply schema version-specific validation
      const validatedSpec = this.validateByVersion(spec, schemaVersion);
      
      return validatedSpec;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(this.formatZodError(error));
      }
      throw error;
    }
  }
  
  /**
   * Compiles a validated CinematicSpec into an optimized CompiledSpec
   * 
   * @param spec - Validated CinematicSpec to compile
   * @returns CompiledSpec with precompiled animations and optimized runtime structures
   */
  static parse(spec: CinematicSpec): CompiledSpec {
    const context: CompilationContext = {
      schemaVersion: spec.schemaVersion,
      assetPromises: new Map(),
      layerTypes: new Set(spec.scenes.flatMap(s => s.layers.map(l => l.type))),
      diagnostics: [],
      optimizations: {
        precompileAnimations: true,
        optimizeAssetLoading: true,
        enableObjectPooling: true,
        minimizeDOMUpdates: true,
        useWebWorkers: false // Disabled for now
      }
    };
    
    try {
      // Compile assets
      const compiledAssets = this.compileAssets(spec.assets || [], context);
      
      // Compile scenes first (needed for events)
      const compiledScenes = this.compileScenes(spec.scenes, context);
      
      // Compile events
      const compiledEvents = this.compileEvents(spec.events, compiledScenes, context);
      
      // Calculate total duration
      const totalDuration = Math.max(...Array.from(compiledEvents.values())
        .map(event => event.startTime + event.duration));
      
      const compiledSpec: CompiledSpec = {
        events: compiledEvents,
        scenes: compiledScenes,
        assets: compiledAssets,
        globalConfig: spec.engine,
        schemaVersion: spec.schemaVersion,
        totalDuration,
        compiledAt: Date.now()
      };
      
      // Log any compilation warnings
      if (context.diagnostics.length > 0) {
        console.warn('Compilation completed with warnings:', context.diagnostics);
      }
      
      return compiledSpec;
    } catch (error) {
      context.diagnostics.push({
        level: 'error',
        message: error instanceof Error ? error.message : 'Unknown compilation error',
        code: 'COMPILATION_ERROR'
      });
      throw new Error(`Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Validates specification based on schema version
   */
  private static validateByVersion(spec: unknown, version: string): CinematicSpec {
    // For now, all supported versions use the same schema
    // In the future, this would handle version-specific differences
    switch (version) {
      case '1.0.0':
      case '1.1.0':
        return CinematicSpecSchema.parse(spec) as CinematicSpec;
      default:
        throw new Error(`Unsupported schema version: ${version}`);
    }
  }
  
  /**
   * Compiles asset definitions into runtime assets
   */
  private static compileAssets(assets: AssetDefinition[], _context: CompilationContext): Map<string, Asset> {
    const compiledAssets = new Map<string, Asset>();
    
    for (const assetDef of assets) {
      // Create a basic asset object (actual loading would happen in AssetManager)
      const asset: Asset = {
        id: assetDef.id,
        type: assetDef.type,
        src: assetDef.src,
        data: null,
        loaded: false,
        error: null,
        fallback: assetDef.fallback,
        metadata: {
          size: assetDef.metadata?.size || 0,
          mimeType: assetDef.metadata?.mimeType || '',
          cacheDuration: assetDef.metadata?.cacheDuration || 3600000, // 1 hour default
          dimensions: assetDef.metadata?.dimensions,
          duration: assetDef.metadata?.duration,
          quality: 1,
          streamable: false,
          priority: 'normal'
        },
        progress: 0
      };
      
      compiledAssets.set(assetDef.id, asset);
    }
    
    return compiledAssets;
  }
  
  /**
   * Compiles scene definitions into runtime scenes
   */
  private static compileScenes(scenes: CinematicScene[], context: CompilationContext): Map<string, CompiledScene> {
    const compiledScenes = new Map<string, CompiledScene>();
    let currentStartTime = 0;
    
    for (const scene of scenes) {
      const compiledLayers = this.compileLayers(scene.layers, context);
      const compiledAudioTracks = this.compileAudioTracks(scene.audio || [], context);
      
      const compiledScene: CompiledScene = {
        id: scene.id,
        name: scene.name,
        duration: scene.duration,
        layers: compiledLayers,
        audioTracks: compiledAudioTracks,
        startTime: currentStartTime,
        endTime: currentStartTime + scene.duration
      };
      
      compiledScenes.set(scene.id, compiledScene);
      currentStartTime += scene.duration;
    }
    
    return compiledScenes;
  }
  
  /**
   * Compiles layer specifications into runtime layers
   */
  private static compileLayers(layers: LayerSpec[], context: CompilationContext): CompiledLayer[] {
    return layers
      .sort((a, b) => a.zIndex - b.zIndex) // Sort by z-index for rendering order
      .map(layer => {
        const compiledAnimations = this.compileAnimationTracks(layer.animations || [], context);
        
        // Create a placeholder layer instance (actual instantiation happens in LayerRegistry)
        const layerInstance = {
          id: layer.id,
          type: layer.type,
          zIndex: layer.zIndex,
          mount: () => {},
          update: () => {},
          destroy: () => {}
        } as any; // Placeholder - real implementation in LayerRegistry
        
        const compiledLayer: CompiledLayer = {
          id: layer.id,
          type: layer.type,
          zIndex: layer.zIndex,
          instance: layerInstance,
          animations: compiledAnimations,
          initialConfig: { ...layer.config },
          active: true
        };
        
        return compiledLayer;
      });
  }
  
  /**
   * Compiles animation tracks into optimized runtime animations
   */
  private static compileAnimationTracks(tracks: AnimationTrackSpec[], _context: CompilationContext): CompiledAnimationTrack[] {
    return tracks.map(track => AnimationCompiler.compileTrack(track));
  }
  
  /**
   * Compiles audio tracks into runtime audio objects
   */
  private static compileAudioTracks(tracks: AudioTrackSpec[], _context: CompilationContext): CompiledAudioTrack[] {
    return tracks.map(track => {
      // Create placeholder asset reference (actual loading in AssetManager)
      const asset: Asset = {
        id: track.id,
        type: 'audio',
        src: track.src,
        data: null,
        loaded: false,
        error: null,
        metadata: {
          size: 0,
          mimeType: 'audio/mpeg',
          cacheDuration: 3600000,
          priority: 'normal'
        },
        progress: 0
      };
      
      const compiledTrack: CompiledAudioTrack = {
        id: track.id,
        type: track.type,
        asset,
        startMs: track.startMs,
        endMs: track.endMs || 0, // Will be set when audio loads
        volume: track.volume || 1,
        fadeIn: track.fadeIn || 0,
        fadeOut: track.fadeOut || 0,
        loop: track.loop || false
      };
      
      return compiledTrack;
    });
  }
  
  /**
   * Compiles event definitions into runtime events
   */
  private static compileEvents(events: CinematicEvent[], scenes: Map<string, CompiledScene>, context: CompilationContext): Map<string, CompiledEvent> {
    const compiledEvents = new Map<string, CompiledEvent>();
    let currentStartTime = 0;
    
    for (const event of events) {
      const eventScenes = event.scenes.map(sceneId => {
        const scene = scenes.get(sceneId);
        if (!scene) {
          throw new Error(`Scene with ID "${sceneId}" not found for event "${event.id}"`);
        }
        return scene;
      });
      
      const compiledTransitions = this.compileTransitions(event.transitions || [], context);
      const eventDuration = eventScenes.reduce((total, scene) => total + scene.duration, 0);
      
      const compiledEvent: CompiledEvent = {
        id: event.id,
        name: event.name,
        scenes: eventScenes,
        transitions: compiledTransitions,
        duration: eventDuration,
        startTime: currentStartTime
      };
      
      compiledEvents.set(event.id, compiledEvent);
      currentStartTime += eventDuration;
    }
    
    return compiledEvents;
  }
  
  /**
   * Compiles transition specifications into runtime transitions
   */
  private static compileTransitions(transitions: TransitionSpec[], _context: CompilationContext): CompiledTransition[] {
    return transitions.map(transition => {
      const easingFunction = AnimationCompiler.compileEasing(transition.easing || 'ease');
      
      // Create placeholder transition execution function
      const executeFunction = (progress: number, _fromElement: HTMLElement, _toElement: HTMLElement) => {
        // Actual implementation would be in the transition system
        // TODO: Implement transition execution logic
        void progress; // Suppress unused parameter warning
      };
      
      const compiledTransition: CompiledTransition = {
        type: transition.type,
        duration: transition.duration,
        easingFunction,
        config: transition.config || {},
        execute: executeFunction
      };
      
      return compiledTransition;
    });
  }
  
  /**
   * Formats Zod validation errors into human-readable messages
   */
  private static formatZodError(error: z.ZodError): string {
    const messages = error.errors.map(err => {
      const path = err.path.length > 0 ? `at ${err.path.join('.')}` : 'at root';
      return `${path}: ${err.message}`;
    });
    
    return `Specification validation failed:\n${messages.join('\n')}`;
  }
}