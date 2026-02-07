# Implementation Plan: Shape Layer System

## Overview

This implementation plan breaks down the shape layer system into discrete, incremental tasks. The approach follows a bottom-up strategy: building core geometry and rendering components first, then integrating with the layer system, and finally adding advanced features like animations and camera integration.

## Tasks

- [x] 1. Create core shape geometry generator
  - Create `src/core/shapes/ShapeGeometry.ts` with path generation functions
  - Implement geometry generation for all 8 shape types (rectangle, square, circle, ellipse, triangle, trapezoid, polygon, star)
  - Generate both SVG path strings and Canvas2D command arrays
  - Include helper functions for coordinate calculations
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [ ]* 1.1 Write property test for shape geometry generation
  - **Property 1: Shape Type Rendering**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8**

- [x] 2. Implement shape renderer interface and DOM renderer
  - [x] 2.1 Create shape renderer interface
    - Create `src/core/shapes/IShapeRenderer.ts` interface
    - Define methods: mount, render, destroy, setVisible, setOpacity
    - _Requirements: 8.1, 8.2_
  
  - [x] 2.2 Implement DOM/SVG shape renderer
    - Create `src/core/shapes/DOMShapeRenderer.ts`
    - Implement SVG element creation and management
    - Apply transforms using SVG transform attributes
    - Apply visual properties (fill, stroke, opacity, blend modes)
    - Support perspective transforms using CSS transforms
    - _Requirements: 8.2, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3_
  
  - [ ]* 2.3 Write property tests for DOM renderer
    - **Property 3: Position Transform Application**
    - **Property 5: Rotation Transform**
    - **Property 6: Scale Transform**
    - **Property 7: Skew Transform**
    - **Property 8: Fill Color Application**
    - **Property 9: Stroke Color and Width Application**
    - **Property 10: Opacity Application**
    - **Property 11: Blend Mode Application**
    - **Property 12: Perspective Transform Application**
    - **Validates: Requirements 2.1, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3**

- [x] 3. Implement Canvas2D shape renderer
  - [x] 3.1 Create Canvas2D shape renderer
    - Create `src/core/shapes/Canvas2DShapeRenderer.ts`
    - Implement canvas element creation and management
    - Apply transforms using canvas context save/restore and transform methods
    - Draw shapes using Canvas2D path API
    - Apply visual properties (fillStyle, strokeStyle, globalAlpha, globalCompositeOperation)
    - _Requirements: 8.1, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 3.2 Write property tests for Canvas2D renderer
    - **Property 3: Position Transform Application**
    - **Property 5: Rotation Transform**
    - **Property 6: Scale Transform**
    - **Property 7: Skew Transform**
    - **Property 8: Fill Color Application**
    - **Property 9: Stroke Color and Width Application**
    - **Property 10: Opacity Application**
    - **Property 11: Blend Mode Application**
    - **Validates: Requirements 2.1, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

- [x] 4. Create ShapeLayer class
  - [x] 4.1 Implement ShapeLayer class
    - Create `src/core/layers/ShapeLayer.ts`
    - Implement ICinematicLayer interface (mount, update, destroy, resize, setVisible, setOpacity)
    - Add shape configuration interface and validation
    - Delegate rendering to appropriate backend renderer (DOM or Canvas2D)
    - Handle transform property resolution (pixels vs percentages)
    - Apply transform order: translate, rotate, scale, skew
    - _Requirements: 7.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8_
  
  - [ ]* 4.2 Write unit tests for ShapeLayer
    - Test lifecycle methods (mount, update, destroy)
    - Test configuration validation
    - Test default values
    - Test transform order
    - _Requirements: 7.3, 2.7, 2.8_
  
  - [ ]* 4.3 Write property test for shape type validation
    - **Property 2: Shape Type Validation**
    - **Validates: Requirements 1.9**

- [x] 5. Checkpoint - Ensure basic shape rendering works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Integrate ShapeLayer with LayerRegistry
  - [x] 6.1 Register ShapeLayer in LayerRegistry
    - Update `src/core/LayerRegistry.ts` to register 'shape' layer type
    - Add factory function for creating ShapeLayer instances
    - Update built-in types list to include 'shape'
    - _Requirements: 7.1, 7.2_
  
  - [ ]* 6.2 Write integration tests
    - Test LayerRegistry creates ShapeLayer correctly
    - Test ShapeLayer works with other layer types in same scene
    - **Property 16: Layer Registry Integration**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.5**

- [x] 7. Implement z-index layering and multiple shapes
  - [x] 7.1 Add z-index sorting and rendering
    - Ensure shapes render in correct z-index order
    - Handle overlapping shapes with blend modes
    - Support multiple shape layers in single scene
    - _Requirements: 2.2, 6.1, 6.2, 6.3_
  
  - [ ]* 7.2 Write property tests for layering
    - **Property 4: Z-Index Layering**
    - **Property 14: Multiple Shape Independence**
    - **Validates: Requirements 2.2, 6.1, 6.2**
  
  - [ ]* 7.3 Write unit tests for blend modes with overlapping shapes
    - Test blend mode application with multiple overlapping shapes
    - _Requirements: 6.3_

- [x] 8. Add animation support
  - [x] 8.1 Integrate with existing animation system
    - Ensure all shape properties are animatable through existing animation system
    - Test position, rotation, scale, color, opacity, stroke width animations
    - Verify easing functions work with shape properties
    - Support simultaneous animation of multiple properties
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_
  
  - [ ]* 8.2 Write property test for animation interpolation
    - **Property 13: Property Animation Interpolation**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**
  
  - [ ]* 8.3 Write unit test for simultaneous property animation
    - Test animating multiple properties at once
    - _Requirements: 5.8_

- [x] 9. Implement transition system compatibility
  - [x] 9.1 Add transition support to ShapeLayer
    - Ensure ShapeLayer works with existing transition system
    - Test transitions between shape property values
    - _Requirements: 7.4_
  
  - [ ]* 9.2 Write property test for transition compatibility
    - **Property 17: Transition System Compatibility**
    - **Validates: Requirements 7.4**

- [x] 10. Add camera system integration
  - [x] 10.1 Implement camera transform application
    - Apply camera pan to shape positions
    - Apply camera zoom to shape scales
    - Synchronize shape updates with camera animations
    - Add `ignoreCameraTransform` flag for UI overlay shapes
    - _Requirements: 10.1, 10.2, 10.4, 10.5_
  
  - [ ]* 10.2 Write property test for camera integration
    - **Property 19: Camera Transform Integration**
    - **Validates: Requirements 10.1, 10.2, 10.4**
  
  - [ ]* 10.3 Write unit test for camera opt-out
    - Test `ignoreCameraTransform` flag
    - _Requirements: 10.5_

- [x] 11. Implement config parsing and validation
  - [x] 11.1 Add shape layer config parsing
    - Parse shape layer definitions from JSON config
    - Validate all shape properties
    - Support all shape types through "shapeType" property
    - Support all transform and visual properties
    - Support animation definitions in config
    - Return descriptive errors for invalid config
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [ ]* 11.2 Write property test for config round-trip
    - **Property 18: Config Parsing Round-Trip**
    - **Validates: Requirements 9.1**
  
  - [ ]* 11.3 Write unit tests for config validation
    - Test all shape types are supported in config
    - Test all transform properties work in config
    - Test all visual properties work in config
    - Test animation definitions in config
    - Test error messages for invalid config
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 12. Add performance optimizations
  - [x] 12.1 Implement off-screen culling
    - Calculate shape bounding boxes
    - Skip rendering shapes outside viewport
    - _Requirements: 11.6_
  
  - [x] 12.2 Implement dirty checking
    - Only re-render shapes when properties change
    - Cache computed transforms
    - Reuse geometry when shape parameters unchanged
    - _Requirements: 11.2, 11.4_
  
  - [ ]* 12.3 Write property test for off-screen culling
    - **Property 20: Off-Screen Culling**
    - **Validates: Requirements 11.6**

- [x] 13. Add dynamic shape updates
  - [x] 13.1 Implement add/remove shape functionality
    - Support adding shapes to scene dynamically
    - Support removing shapes from scene dynamically
    - Ensure scene updates efficiently
    - _Requirements: 6.5_
  
  - [ ]* 13.2 Write property test for dynamic updates
    - **Property 15: Dynamic Shape Updates**
    - **Validates: Requirements 6.5**

- [x] 14. Checkpoint - Ensure all features work together
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Verify backward compatibility
  - [x] 15.1 Test backward compatibility
    - Verify existing layer types still work
    - Verify LayerRegistry supports all existing types
    - Verify existing config files parse correctly
    - Test shape layers mixed with existing layers
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [ ]* 15.2 Write unit tests for backward compatibility
    - Test existing layers work after shape layer addition
    - Test existing configs parse correctly
    - _Requirements: 12.1, 12.2, 12.3_

- [x] 16. Verify bundle size impact
  - [x] 16.1 Measure bundle size
    - Build library with shape layer system
    - Measure minified bundle size increase
    - Verify increase is less than 15KB
    - _Requirements: 11.5_
  
  - [ ]* 16.2 Document bundle size impact
    - Add bundle size measurement to documentation
    - _Requirements: 11.5_

- [x] 17. Create example configurations and documentation
  - [x] 17.1 Create example shape layer configs
    - Create example JSON configs for each shape type
    - Create examples showing animations
    - Create examples showing multiple shapes
    - Create examples showing camera integration
    - Add examples to playground
  
  - [x] 17.2 Update API documentation
    - Document ShapeLayer class and configuration
    - Document all shape types and their parameters
    - Document transform and visual properties
    - Document animation and camera integration
    - Add to docs/API.md
  
  - [x] 17.3 Create tutorial for shape layers
    - Write step-by-step tutorial for using shape layers
    - Include code examples and visual results
    - Add to docs/TUTORIALS.md

- [x] 18. Final checkpoint - Complete implementation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: geometry → renderers → layer → integration → optimization
