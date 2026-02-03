# Implementation Plan: Cinematic Renderer 2D Enhancements

## Overview

This implementation plan breaks down the comprehensive enhancements to the cinematic-renderer2d library into discrete, incremental coding tasks. The plan follows a logical progression: fix critical bugs first, then add core infrastructure (state machine, lifecycle), followed by new features (transitions, camera, lighting), and finally developer experience improvements (CLI, editor, wrappers).

Each task builds on previous work and includes testing sub-tasks to validate correctness early. The plan assumes all context documents (requirements, design) are available during implementation.

## Tasks

- [x] 1. Fix Scene Cleanup Bug
  - [x] 1.1 Implement proper layer destruction in scene transitions
    - Modify CinematicRenderer2D to track active layers per scene
    - Ensure old scene layers are destroyed before new scene layers are mounted
    - Add layer state tracking (mounted, active, destroyed)
    - _Requirements: 1.1_
  
  - [ ]* 1.2 Write property test for layer destruction order
    - **Property 1: Layer destruction before mounting**
    - **Validates: Requirements 1.1**
  
  - [x] 1.3 Implement animation loop cancellation on layer destroy
    - Track animation frame IDs in layer instances
    - Cancel all requestAnimationFrame calls in layer.destroy()
    - Clear animation callbacks from scheduler
    - _Requirements: 1.2_
  
  - [ ]* 1.4 Write property test for animation loop cancellation
    - **Property 2: Animation loop cancellation on destroy**
    - **Validates: Requirements 1.2**
  
  - [x] 1.5 Implement DOM node cleanup on layer destroy
    - Ensure layer.destroy() removes all created DOM nodes
    - Verify container node count returns to baseline
    - Handle nested DOM structures properly
    - _Requirements: 1.3_
  
  - [ ]* 1.6 Write property test for DOM node removal
    - **Property 3: DOM node removal on destroy**
    - **Validates: Requirements 1.3**
  
  - [x] 1.7 Add memory leak prevention
    - Clear all object references in destroy methods
    - Remove event listeners properly
    - Verify no circular references remain
    - _Requirements: 1.4_
  
  - [ ]* 1.8 Write property test for memory stability
    - **Property 4: Memory stability across scenes**
    - **Validates: Requirements 1.4**
  
  - [x] 1.9 Handle interrupted transitions
    - Add transition cancellation logic
    - Ensure cleanup completes before new transition starts
    - Test rapid scene switching
    - _Requirements: 1.5_
  
  - [ ]* 1.10 Write property test for interrupted transitions
    - **Property 5: Interrupted transition cleanup**
    - **Validates: Requirements 1.5**

- [x] 2. Checkpoint - Verify scene cleanup fixes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement State Machine
  - [x] 3.1 Create StateMachine class with state enums
    - Define RendererState and SceneState enums
    - Implement state storage and getter
    - Add state change event emission
    - _Requirements: 3.1, 3.2_
  
  - [x] 3.2 Implement state transition validation
    - Create transition registry with valid transitions
    - Implement canTransition() method
    - Implement transition() method with validation
    - Throw descriptive errors for invalid transitions
    - _Requirements: 3.3, 3.4, 3.6_
  
  - [ ]* 3.3 Write property test for IDLE state transitions
    - **Property 10: Valid state transitions from IDLE**
    - **Validates: Requirements 3.3**
  
  - [ ]* 3.4 Write property test for PLAYING state transitions
    - **Property 11: Valid state transitions from PLAYING**
    - **Validates: Requirements 3.4**
  
  - [ ]* 3.5 Write property test for invalid transitions
    - **Property 13: Invalid transition error handling**
    - **Validates: Requirements 3.6**
  
  - [x] 3.6 Implement single active scene invariant
    - Add scene state tracking to StateMachine
    - Enforce only one ACTIVE scene at a time
    - Prevent multiple scenes from activating simultaneously
    - _Requirements: 3.5_
  
  - [ ]* 3.7 Write property test for single active scene
    - **Property 12: Single active scene invariant**
    - **Validates: Requirements 3.5, 4.7**
  
  - [x] 3.8 Integrate StateMachine with CinematicRenderer2D
    - Replace manual state management with StateMachine
    - Update all state transitions to use StateMachine
    - Emit state change events through renderer
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 4. Implement Scene Lifecycle Manager
  - [x] 4.1 Create SceneLifecycleManager class
    - Define lifecycle phase interface
    - Implement phase execution methods
    - Add scene state tracking
    - _Requirements: 4.1_
  
  - [x] 4.2 Implement prepare() phase
    - Integrate with AssetPreloader (to be created)
    - Preload all scene assets
    - Mark scene as prepared
    - _Requirements: 4.2_
  
  - [x] 4.3 Implement mount() phase
    - Create layer instances from specs
    - Attach DOM nodes to container
    - Mark scene as mounted
    - _Requirements: 4.3_
  
  - [x] 4.4 Implement play() phase
    - Start all scene animations
    - Start all audio tracks
    - Mark scene as active
    - _Requirements: 4.4_
  
  - [x] 4.5 Implement unmount() phase
    - Remove layer DOM nodes
    - Stop animations
    - Mark scene as unmounted
    - _Requirements: 4.5_
  
  - [x] 4.6 Implement destroy() phase
    - Release all resources
    - Cancel pending operations
    - Clear references
    - _Requirements: 4.6_
  
  - [ ]* 4.7 Write property test for lifecycle phase ordering
    - **Property 14: Lifecycle phase ordering**
    - **Validates: Requirements 4.1**
  
  - [ ]* 4.8 Write property tests for each lifecycle phase
    - **Property 15: Asset preloading in prepare phase**
    - **Property 16: DOM node creation in mount phase**
    - **Property 17: Animation and audio start in play phase**
    - **Property 18: DOM node removal in unmount phase**
    - **Property 19: Resource release in destroy phase**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6**
  
  - [x] 4.9 Integrate SceneLifecycleManager with CinematicRenderer2D
    - Replace manual scene management with SceneLifecycleManager
    - Update scene transitions to use lifecycle phases
    - Coordinate with StateMachine for state transitions
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 5. Checkpoint - Verify state machine and lifecycle
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Asset Preloader
  - [x] 6.1 Create AssetPreloader class
    - Implement preload queue with priorities
    - Add progress tracking
    - Integrate with existing AssetManager
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 6.2 Implement scene asset preloading
    - Extract asset IDs from scene layers
    - Preload assets with priority ordering
    - Return preload progress
    - _Requirements: 9.1_
  
  - [x] 6.3 Implement asset caching
    - Cache loaded assets by ID
    - Reuse cached assets across scenes
    - Implement cache clearing
    - _Requirements: 9.2_
  
  - [ ]* 6.4 Write property tests for asset preloading
    - **Property 36: Scene asset preloading**
    - **Property 37: Asset cache reuse**
    - **Property 38: Priority-based loading order**
    - **Validates: Requirements 9.1, 9.2, 9.3**

- [x] 7. Implement Transition Engine
  - [x] 7.1 Create TransitionEngine class
    - Define transition handler interface
    - Implement transition execution framework
    - Add transition state tracking
    - _Requirements: 2.1, 2.2_
  
  - [x] 7.2 Implement crossfade transition
    - Simultaneously fade out old scene and fade in new scene
    - Use opacity animations with easing
    - Ensure cleanup after transition
    - _Requirements: 2.3_
  
  - [x] 7.3 Implement slide transition
    - Move old scene out and new scene in
    - Support all directions (up, down, left, right)
    - Use CSS transforms for performance
    - _Requirements: 2.1_
  
  - [x] 7.4 Implement zoom transition
    - Scale old scene down while scaling new scene up
    - Use transform: scale() for performance
    - _Requirements: 2.1_
  
  - [x] 7.5 Implement wipe, dissolve, and blur transitions
    - Wipe: Reveal new scene with moving edge
    - Dissolve: Use noise pattern for pixelated transition
    - Blur: Blur old scene while fading in new scene
    - _Requirements: 2.1_
  
  - [ ]* 7.6 Write property tests for transitions
    - **Property 6: Transition type support**
    - **Property 7: Transition configuration acceptance**
    - **Property 8: Crossfade simultaneity**
    - **Property 9: Transition cleanup order**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
  
  - [x] 7.7 Implement default transition behavior
    - Use 500ms crossfade when no transition specified
    - _Requirements: 2.5_
  
  - [x] 7.8 Integrate TransitionEngine with scene transitions
    - Update SceneLifecycleManager to use TransitionEngine
    - Coordinate transitions with state machine
    - Handle transition interruptions
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 8. Checkpoint - Verify transitions work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Camera System
  - [x] 9.1 Create CameraSystem class
    - Define CameraState interface
    - Implement camera state storage and getters
    - Add camera animation support
    - _Requirements: 6.1_
  
  - [x] 9.2 Implement camera transform application for DOM
    - Apply CSS transforms to scene container
    - Support x, y, zoom, rotate properties
    - Update on camera state changes
    - _Requirements: 6.2_
  
  - [x] 9.3 Implement camera transform application for Canvas
    - Calculate transform matrix
    - Adjust rendering coordinates
    - Apply to all Canvas layers
    - _Requirements: 6.3_
  
  - [x] 9.4 Implement camera animations
    - Support same timing and easing as layer animations
    - Interpolate camera properties smoothly
    - Update camera state on each frame
    - _Requirements: 6.4, 6.5_
  
  - [ ]* 9.5 Write property tests for camera system
    - **Property 23: Camera transform application**
    - **Property 24: Camera animation interpolation**
    - **Property 25: Camera animation feature parity**
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5**
  
  - [x] 9.6 Integrate CameraSystem with CinematicRenderer2D
    - Add camera system to renderer
    - Update frame rendering to apply camera transforms
    - Support camera animations in specs
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 10. Implement Light Layer System
  - [x] 10.1 Create LightLayer class
    - Implement ICinematicLayer interface
    - Define LightLayerConfig interface
    - Support all light modes (radial, spot, ambient, vignette)
    - _Requirements: 5.1_
  
  - [x] 10.2 Implement radial light rendering
    - Create circular gradient from center point
    - Support configurable radius and intensity
    - _Requirements: 5.2_
  
  - [x] 10.3 Implement spot light rendering
    - Create directional cone of light
    - Support configurable angle and direction
    - _Requirements: 5.3_
  
  - [x] 10.4 Implement ambient and vignette light rendering
    - Ambient: Uniform color overlay
    - Vignette: Darkening at edges
    - _Requirements: 5.1_
  
  - [x] 10.5 Implement blend modes
    - Support screen, overlay, soft-light, multiply
    - Use CSS mix-blend-mode for DOM
    - Use globalCompositeOperation for Canvas
    - _Requirements: 5.4, 5.6_
  
  - [x] 10.6 Implement light property animations
    - Support animating position, intensity, color, radius
    - Integrate with existing animation system
    - _Requirements: 5.5_
  
  - [ ]* 10.7 Write property tests for light layers
    - **Property 20: Light mode support**
    - **Property 21: Blend mode support**
    - **Property 22: Light property animation**
    - **Validates: Requirements 5.1, 5.4, 5.5**
  
  - [x] 10.8 Register LightLayer in LayerRegistry
    - Add 'light' layer type to registry
    - Update built-in types list
    - _Requirements: 5.1_

- [x] 11. Checkpoint - Verify camera and lighting work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Enhance Animation System
  - [x] 12.1 Extend AnimationCompiler for looping
    - Add loop and yoyo support to animation tracks
    - Implement loop restart logic
    - Implement yoyo direction reversal
    - _Requirements: 7.1, 7.2_
  
  - [x] 12.2 Implement keyframe animations
    - Define AnimationKeyframe interface
    - Implement keyframe interpolation
    - Support per-keyframe easing
    - _Requirements: 7.3, 7.6_
  
  - [x] 12.3 Implement stagger effects
    - Define StaggerConfig interface
    - Generate time-offset animations
    - Support different stagger patterns (start, center, end)
    - _Requirements: 7.4_
  
  - [x] 12.4 Implement randomization
    - Define RandomizeConfig interface
    - Apply random variations within bounds
    - Support seeded randomness for reproducibility
    - _Requirements: 7.5_
  
  - [ ]* 12.5 Write property tests for enhanced animations
    - **Property 26: Animation looping**
    - **Property 27: Animation yoyo behavior**
    - **Property 28: Keyframe interpolation**
    - **Property 29: Stagger timing**
    - **Property 30: Randomization bounds**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**
  
  - [x] 12.6 Update SpecParser to support enhanced animations
    - Add validation for new animation properties
    - Update compilation logic
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 13. Enhance Audio Engine
  - [x] 13.1 Extend AudioSystem for per-track control
    - Add loop, volume, fadeIn, fadeOut properties
    - Implement per-track volume control
    - _Requirements: 8.1_
  
  - [x] 13.2 Implement audio fade in/out
    - Use Web Audio API GainNode for smooth fades
    - Support configurable fade durations
    - _Requirements: 8.3, 8.4_
  
  - [x] 13.3 Implement audio crossfading
    - Simultaneously fade out old track and fade in new track
    - Support configurable crossfade duration
    - Clean up old track when crossfade completes
    - _Requirements: 8.2_
  
  - [x] 13.4 Implement multi-track playback
    - Support multiple simultaneous tracks
    - Maintain independent volume control
    - _Requirements: 8.5_
  
  - [x] 13.5 Implement audio cleanup on scene unmount
    - Stop all scene audio tracks
    - Release audio resources
    - _Requirements: 8.6_
  
  - [ ]* 13.6 Write property tests for enhanced audio
    - **Property 31: Audio track feature support**
    - **Property 32: Audio crossfade simultaneity**
    - **Property 33: Volume fade behavior**
    - **Property 34: Multi-track playback**
    - **Property 35: Audio cleanup on unmount**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**

- [x] 14. Implement Performance Monitor
  - [x] 14.1 Extend QualitySystem for performance monitoring
    - Add performance threshold configuration
    - Implement FPS-based quality adjustment
    - Track performance metrics continuously
    - _Requirements: 9.4, 9.5, 9.6, 9.7_
  
  - [x] 14.2 Implement performance optimizations
    - Reduce particle counts when FPS < 50
    - Switch to low quality when FPS < 30
    - Disable expensive effects under load
    - _Requirements: 9.4, 9.5_
  
  - [x] 14.3 Implement auto quality adjustment
    - Continuously monitor performance
    - Adjust quality level to maintain target FPS
    - Emit quality change events
    - _Requirements: 9.7_
  
  - [ ]* 14.4 Write property tests for performance monitoring
    - **Property 39: Performance adaptation at 50 FPS**
    - **Property 40: Quality downgrade at 30 FPS**
    - **Property 41: Performance metrics tracking**
    - **Property 42: Auto quality adjustment**
    - **Validates: Requirements 9.4, 9.5, 9.6, 9.7**

- [x] 15. Checkpoint - Verify animations, audio, and performance
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Implement New Layer Types
  - [x] 16.1 Create FogLayer class
    - Implement atmospheric fog rendering
    - Support density, color, speed, direction
    - Use Canvas2D or CSS animation
    - _Requirements: 11.1_
  
  - [x] 16.2 Create enhanced NoiseOverlayLayer
    - Implement film grain rendering
    - Support intensity, scale, animation
    - Use Canvas2D noise generation
    - _Requirements: 11.2_
  
  - [x] 16.3 Enhance existing VignetteLayer
    - Add configurable radius and intensity
    - Improve rendering quality
    - _Requirements: 11.3_
  
  - [x] 16.4 Enhance existing ImageLayer
    - Add support for PNG and SVG
    - Implement positioning and scaling
    - Support rotation and objectFit
    - _Requirements: 11.4_
  
  - [x] 16.5 Create ParallaxGroupLayer class
    - Group layers with different scroll speeds
    - Implement depth-based speed calculation
    - Support camera integration
    - _Requirements: 11.5_
  
  - [x] 16.6 Create GlowEffectLayer class
    - Render soft glows using CSS filters or Canvas
    - Support position, radius, intensity, color, blur
    - _Requirements: 11.6_
  
  - [x] 16.7 Implement layer interface validation
    - Validate ICinematicLayer implementation on registration
    - Throw descriptive errors for invalid layers
    - _Requirements: 11.7_
  
  - [ ]* 16.8 Write property test for layer interface validation
    - **Property 46: Layer interface validation**
    - **Validates: Requirements 11.7**
  
  - [x] 16.9 Register new layer types in LayerRegistry
    - Add all new layer types to registry
    - Update built-in types list
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 17. Improve CLI Tools
  - [x] 17.1 Enhance validate command
    - Improve error messages with line numbers
    - Add suggestions for common errors
    - Output specification statistics
    - _Requirements: 10.1, 10.2, 10.6_
  
  - [x] 17.2 Implement dev command
    - Start live preview server
    - Watch specification file for changes
    - Implement hot reload
    - _Requirements: 10.3, 10.4_
  
  - [x] 17.3 Enhance preview command
    - Generate standalone HTML file
    - Embed all assets inline
    - Add sharing metadata
    - _Requirements: 10.5_
  
  - [ ]* 17.4 Write property tests for CLI
    - **Property 43: Validation error reporting**
    - **Property 44: Dev server hot reload**
    - **Property 45: Validation success reporting**
    - **Validates: Requirements 10.2, 10.4, 10.6**

- [ ] 18. Create Scene Templates
  - [ ] 18.1 Create sunrise scene template
    - Gradient background with warm colors
    - Particle effects for atmosphere
    - Audio track with morning ambience
    - _Requirements: 12.2_
  
  - [ ] 18.2 Create cosmic birth scene template
    - Starfield background
    - Nebula noise effects
    - Particle explosions
    - _Requirements: 12.2_
  
  - [ ] 18.3 Create rain scene template
    - Particle system for rain drops
    - Fog layer for atmosphere
    - Audio track with rain sounds
    - _Requirements: 12.2_
  
  - [ ] 18.4 Create divine aura scene template
    - Light layers with radial mode
    - Glow effects
    - Soft particles
    - _Requirements: 12.2_
  
  - [ ] 18.5 Create underwater scene template
    - Blue gradient background
    - Dust particles for floating debris
    - Light rays using light layers
    - _Requirements: 12.2_
  
  - [ ] 18.6 Implement template customization
    - Support color, timing, effect customization
    - Provide configuration interface
    - _Requirements: 12.3_
  
  - [ ]* 18.7 Write property test for template customization
    - **Property 47: Template customization**
    - **Validates: Requirements 12.3**

- [ ] 19. Checkpoint - Verify new layers, CLI, and templates
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Implement Editor Mode
  - [ ] 20.1 Create EditorMode class
    - Define EditorModeConfig interface
    - Implement enable/disable functionality
    - Coordinate with DebugOverlay
    - _Requirements: 14.1, 14.3, 14.5, 14.6_
  
  - [ ] 20.2 Create TimelineUI component
    - Render timeline with scene markers
    - Implement draggable scrubber
    - Show current time position
    - _Requirements: 14.1_
  
  - [ ] 20.3 Implement timeline scrubbing
    - Handle scrubber drag events
    - Seek renderer to scrubbed time
    - Update scrubber position on playback
    - _Requirements: 14.2_
  
  - [ ] 20.4 Implement bounding box visualization
    - Draw boxes around all layers
    - Show layer IDs
    - Update on layer changes
    - _Requirements: 14.3_
  
  - [ ] 20.5 Create PropertyInspector component
    - Display layer properties
    - Update values in real-time
    - Support layer selection
    - _Requirements: 14.4_
  
  - [ ] 20.6 Implement layer click handling
    - Detect layer clicks in editor mode
    - Show property inspector for clicked layer
    - Highlight selected layer
    - _Requirements: 14.4_
  
  - [ ] 20.7 Display performance metrics in editor
    - Show FPS, memory usage, active layer count
    - Update metrics in real-time
    - _Requirements: 14.5_
  
  - [ ] 20.8 Auto-enable editor mode with debug mode
    - Activate editor mode when debug is enabled
    - _Requirements: 14.6_
  
  - [ ]* 20.9 Write property tests for editor mode
    - **Property 50: Timeline scrubber seeking**
    - **Property 51: Layer inspector display**
    - **Validates: Requirements 14.2, 14.4**
  
  - [ ] 20.10 Integrate EditorMode with CinematicRenderer2D
    - Add editor mode option to renderer config
    - Initialize editor mode when enabled
    - Coordinate with debug overlay
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [x] 21. Enhance Framework Wrappers
  - [x] 21.1 Enhance React wrapper
    - Implement useRenderer hook
    - Add ref forwarding support
    - Ensure automatic cleanup on unmount
    - Add editorMode prop
    - _Requirements: 13.1, 13.2, 13.5_
  
  - [x] 21.2 Enhance Angular wrapper
    - Integrate with Angular lifecycle hooks
    - Expose renderer methods via @ViewChild
    - Ensure automatic cleanup on destroy
    - Add editorMode input
    - _Requirements: 13.3, 13.4, 13.6_
  
  - [ ]* 21.3 Write property tests for framework wrappers
    - **Property 48: Angular lifecycle integration**
    - **Property 49: React cleanup on unmount**
    - **Validates: Requirements 13.3, 13.5, 13.6**
  
  - [x] 21.4 Update wrapper documentation
    - Document new hooks and methods
    - Add usage examples
    - Update TypeScript types
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ] 22. Create Documentation and Examples
  - [ ] 22.1 Create scene cookbook
    - Document 10+ complete scene examples
    - Include code and visual previews
    - Cover common patterns
    - _Requirements: 12.1_
  
  - [ ] 22.2 Create step-by-step tutorials
    - Getting started tutorial
    - Advanced features tutorial
    - Performance optimization tutorial
    - _Requirements: 12.4_
  
  - [ ] 22.3 Update API documentation
    - Document all new classes and interfaces
    - Add code examples
    - Update TypeScript definitions
    - _Requirements: All_
  
  - [ ] 22.4 Create interactive playground examples
    - Add examples for all new features
    - Make examples editable in real-time
    - _Requirements: 12.5_

- [ ] 23. Integration Testing and Polish
  - [ ]* 23.1 Write integration tests for full playback
    - Test complete cinematic playback from start to end
    - Verify all systems work together
    - Test with complex specifications
  
  - [ ]* 23.2 Write integration tests for scene transitions
    - Test all transition types
    - Test transition interruptions
    - Test rapid scene switching
  
  - [ ]* 23.3 Write integration tests for camera with layers
    - Test camera transforms with various layer types
    - Test camera animations with layer animations
    - Test camera with transitions
  
  - [ ]* 23.4 Write integration tests for audio with transitions
    - Test audio crossfading during transitions
    - Test multi-track playback
    - Test audio cleanup
  
  - [ ] 23.5 Performance testing and optimization
    - Run performance benchmarks
    - Identify and fix bottlenecks
    - Verify FPS targets are met
  
  - [ ] 23.6 Browser compatibility testing
    - Test on Chrome, Firefox, Safari, Edge
    - Fix browser-specific issues
    - Add polyfills where needed
  
  - [ ] 23.7 Accessibility improvements
    - Ensure keyboard navigation works
    - Add ARIA labels
    - Test with screen readers

- [ ] 24. Final Checkpoint - Complete verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all 51 correctness properties have passing tests
  - Run full test suite with coverage report
  - Verify documentation is complete

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
- The implementation follows a logical progression: bugs → infrastructure → features → DX
- All new features maintain backward compatibility with existing specifications
- TypeScript is used throughout for type safety
