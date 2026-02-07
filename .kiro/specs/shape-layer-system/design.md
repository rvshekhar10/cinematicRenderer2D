# Design Document: Shape Layer System

## Overview

The Shape Layer System introduces native geometric shape rendering capabilities to the CinematicRenderer2D library. This system enables developers to create, animate, and compose 2D geometric shapes (rectangles, circles, polygons, stars, etc.) without requiring external image assets. The design follows the existing layer architecture patterns, integrating seamlessly with the LayerRegistry, animation system, and rendering backends.

### Key Design Goals

1. **Seamless Integration**: Follow existing layer patterns (BuiltInLayers, LightLayer) for consistency
2. **Dual Backend Support**: Implement both Canvas2D and DOM/SVG rendering paths
3. **Full Animation Support**: Enable animation of all shape properties through existing animation system
4. **Performance**: Efficient rendering with minimal bundle size impact
5. **Flexibility**: Support diverse shape types with comprehensive styling options
6. **Config-Driven**: Complete JSON configuration support matching existing layer patterns

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      LayerRegistry                          │
│  (registers ShapeLayer factory)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ creates
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      ShapeLayer                             │
│  - Implements ICinematicLayer interface                    │
│  - Manages shape lifecycle (mount, update, destroy)        │
│  - Delegates rendering to backend-specific renderers       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ delegates to
                     ▼
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│  DOMShapeRenderer│    │Canvas2DShapeRenderer│
│  (SVG-based)     │    │  (Canvas API)    │
└──────────────────┘    └──────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌──────────────────────────────────────────┐
│         ShapeGeometry                    │
│  - Generates path data for each shape   │
│  - Shared by both renderers             │
└──────────────────────────────────────────┘
```

### Integration Points

1. **LayerRegistry**: Registers `'shape'` layer type with factory function
2. **Animation System**: Existing animation system handles shape property interpolation
3. **Camera System**: Shapes respond to camera transformations (pan, zoom)
4. **Config Parser**: Parses shape layer definitions from JSON specs
5. **Rendering Backends**: Both DOM and Canvas2D renderers support shape layers

## Components and Interfaces

### 1. ShapeLayer Class

The main layer class implementing `ICinematicLayer` interface.

```typescript
interface ShapeLayerConfig {
  // Shape definition
  shapeType: 'rectangle' | 'square' | 'circle' | 'ellipse' | 
             'triangle' | 'trapezoid' | 'polygon' | 'star';
  
  // Shape-specific properties
  width?: number;           // rectangle, trapezoid
  height?: number;          // rectangle, trapezoid
  size?: number;            // square
  radius?: number;          // circle, polygon, star
  radiusX?: number;         // ellipse
  radiusY?: number;         // ellipse
  vertices?: Array<{x: number, y: number}>;  // triangle
  topWidth?: number;        // trapezoid
  bottomWidth?: number;     // trapezoid
  sides?: number;           // polygon
  points?: number;          // star
  innerRadius?: number;     // star
  outerRadius?: number;     // star
  
  // Transform properties
  x?: number | string;      // position (pixels or percentage)
  y?: number | string;      // position (pixels or percentage)
  zIndex?: number;          // layering order
  rotation?: number;        // degrees
  scaleX?: number;          // scale factor
  scaleY?: number;          // scale factor
  skewX?: number;           // degrees
  skewY?: number;           // degrees
  
  // Visual properties
  fillColor?: string;       // CSS color format
  strokeColor?: string;     // CSS color format
  strokeWidth?: number;     // pixels
  opacity?: number;         // 0.0 to 1.0
  blendMode?: string;       // CSS blend mode
  
  // Perspective properties
  perspective?: number;     // perspective distance
  rotateX?: number;         // 3D rotation (degrees)
  rotateY?: number;         // 3D rotation (degrees)
  rotateZ?: number;         // 3D rotation (degrees)
  translateZ?: number;      // depth positioning
  
  // Camera integration
  ignoreCameraTransform?: boolean;  // opt-out from camera effects
}

class ShapeLayer implements ICinematicLayer {
  public readonly id: string;
  public readonly type: 'shape' = 'shape';
  public readonly zIndex: number;
  
  private config: ShapeLayerConfig;
  private renderer: IShapeRenderer;
  private mounted: boolean = false;
  
  constructor(id: string, config: ShapeLayerConfig);
  
  // ICinematicLayer interface
  mount(ctx: LayerMountContext): void;
  update(ctx: FrameContext): void;
  destroy(): void;
  resize(width: number, height: number): void;
  setVisible(visible: boolean): void;
  setOpacity(opacity: number): void;
}
```

### 2. Shape Renderer Interface

Abstract interface for backend-specific rendering.

```typescript
interface IShapeRenderer {
  mount(container: HTMLElement, config: ShapeLayerConfig): void;
  render(config: ShapeLayerConfig, ctx: FrameContext): void;
  destroy(): void;
  setVisible(visible: boolean): void;
  setOpacity(opacity: number): void;
}
```

### 3. DOM Shape Renderer

SVG-based rendering for DOM backend.

```typescript
class DOMShapeRenderer implements IShapeRenderer {
  private svgElement: SVGSVGElement | null = null;
  private shapeElement: SVGElement | null = null;
  
  mount(container: HTMLElement, config: ShapeLayerConfig): void {
    // Create SVG container
    // Create appropriate SVG shape element based on shapeType
    // Apply initial styles and transforms
  }
  
  render(config: ShapeLayerConfig, ctx: FrameContext): void {
    // Update shape attributes
    // Apply transforms (translate, rotate, scale, skew)
    // Apply visual properties (fill, stroke, opacity)
    // Apply perspective transforms if specified
  }
  
  destroy(): void {
    // Remove SVG elements from DOM
  }
}
```

### 4. Canvas2D Shape Renderer

Canvas API-based rendering for Canvas2D backend.

```typescript
class Canvas2DShapeRenderer implements IShapeRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  
  mount(container: HTMLElement, config: ShapeLayerConfig): void {
    // Create canvas element
    // Get 2D context
    // Position canvas in container
  }
  
  render(config: ShapeLayerConfig, ctx: FrameContext): void {
    // Clear canvas
    // Apply transforms using context.save/restore
    // Draw shape using appropriate Canvas2D API
    // Apply visual properties (fillStyle, strokeStyle, etc.)
  }
  
  destroy(): void {
    // Remove canvas from DOM
  }
}
```

### 5. Shape Geometry Generator

Shared utility for generating shape path data.

```typescript
class ShapeGeometry {
  static generateRectangle(width: number, height: number): PathData;
  static generateSquare(size: number): PathData;
  static generateCircle(radius: number): PathData;
  static generateEllipse(radiusX: number, radiusY: number): PathData;
  static generateTriangle(vertices: Array<{x: number, y: number}>): PathData;
  static generateTrapezoid(topWidth: number, bottomWidth: number, height: number): PathData;
  static generatePolygon(sides: number, radius: number): PathData;
  static generateStar(points: number, innerRadius: number, outerRadius: number): PathData;
}

type PathData = {
  svgPath: string;           // SVG path string for DOM renderer
  canvasCommands: Array<{    // Canvas commands for Canvas2D renderer
    type: 'moveTo' | 'lineTo' | 'arc' | 'closePath';
    args: number[];
  }>;
};
```

## Data Models

### Shape Configuration Schema

```typescript
// JSON schema for shape layer configuration
{
  "type": "shape",
  "id": "myShape",
  "zIndex": 10,
  "shapeType": "circle",
  "radius": 50,
  "x": "50%",
  "y": "50%",
  "fillColor": "#ff6b6b",
  "strokeColor": "#ffffff",
  "strokeWidth": 2,
  "opacity": 0.8,
  "blendMode": "multiply",
  "rotation": 45,
  "scaleX": 1.5,
  "scaleY": 1.5,
  "animations": [
    {
      "property": "rotation",
      "keyframes": [
        { "time": 0, "value": 0 },
        { "time": 2000, "value": 360 }
      ],
      "easing": "linear",
      "loop": true
    }
  ]
}
```

### Transform Application Order

Transforms are applied in a specific order to ensure predictable results:

1. **Translate**: Position the shape at (x, y)
2. **Rotate**: Rotate around the shape's center
3. **Scale**: Scale from the shape's center
4. **Skew**: Apply skew transformation
5. **Perspective**: Apply 3D perspective transforms (if specified)

This order matches CSS transform conventions and provides intuitive behavior.

### Color Format Support

The system supports all CSS color formats:
- Hex: `#ff6b6b`, `#f6b`
- RGB: `rgb(255, 107, 107)`
- RGBA: `rgba(255, 107, 107, 0.8)`
- HSL: `hsl(0, 100%, 71%)`
- HSLA: `hsla(0, 100%, 71%, 0.8)`
- Named colors: `red`, `blue`, `transparent`

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Shape Type Rendering

*For any* supported shape type (rectangle, square, circle, ellipse, triangle, trapezoid, polygon, star) with valid configuration parameters, the Shape_Layer should successfully render the shape without errors.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8**

### Property 2: Shape Type Validation

*For any* shape type string provided in configuration, the Shape_Registry should accept valid shape types and reject invalid shape types with descriptive errors.

**Validates: Requirements 1.9**

### Property 3: Position Transform Application

*For any* shape with specified x and y coordinates (in pixels or percentages), the Shape_Layer should position the shape at the resolved pixel coordinates within the viewport.

**Validates: Requirements 2.1**

### Property 4: Z-Index Layering

*For any* set of shapes with different z-index values, the Shape_Layer should render shapes in ascending z-index order (lower z-index renders first, higher z-index renders on top).

**Validates: Requirements 2.2, 6.2**

### Property 5: Rotation Transform

*For any* shape with a specified rotation value in degrees, the Shape_Layer should rotate the shape by that amount around its center point.

**Validates: Requirements 2.3**

### Property 6: Scale Transform

*For any* shape with specified scaleX and scaleY values (including negative values), the Shape_Layer should scale the shape by those factors from its center point.

**Validates: Requirements 2.4, 2.6**

### Property 7: Skew Transform

*For any* shape with specified skewX and skewY values in degrees, the Shape_Layer should apply the skew transformation to the shape.

**Validates: Requirements 2.5**

### Property 8: Fill Color Application

*For any* shape with a specified fill color in any supported CSS color format, the Shape_Layer should fill the shape interior with that color.

**Validates: Requirements 3.1, 3.6**

### Property 9: Stroke Color and Width Application

*For any* shape with specified stroke color and stroke width, the Shape_Layer should draw the shape outline with that color and width.

**Validates: Requirements 3.2, 3.3**

### Property 10: Opacity Application

*For any* shape with a specified opacity value between 0.0 and 1.0, the Shape_Layer should render the shape with that opacity level.

**Validates: Requirements 3.4**

### Property 11: Blend Mode Application

*For any* shape with a specified CSS blend mode, the Shape_Layer should apply that blend mode to the shape rendering.

**Validates: Requirements 3.5**

### Property 12: Perspective Transform Application

*For any* shape with specified perspective transform values (rotateX, rotateY, rotateZ, translateZ), the Shape_Layer should apply those 3D transformations to the shape.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 13: Property Animation Interpolation

*For any* animatable shape property (position, rotation, scale, color, opacity, stroke width) with defined animation keyframes, the Animation_System should interpolate the property value smoothly over time according to the keyframes and easing function.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**

### Property 14: Multiple Shape Independence

*For any* scene with multiple shape layers, each shape should render independently without affecting the rendering of other shapes (except for intentional layering and blend mode interactions).

**Validates: Requirements 6.1**

### Property 15: Dynamic Shape Updates

*For any* shape layer that is added to or removed from a scene, the scene should update to reflect the change without affecting other layers.

**Validates: Requirements 6.5**

### Property 16: Layer Registry Integration

*For any* shape layer configuration provided to the Layer_Registry, the registry should instantiate a valid ShapeLayer object that implements all required ICinematicLayer interface methods.

**Validates: Requirements 7.2, 7.3**

### Property 17: Transition System Compatibility

*For any* shape layer with transition definitions, the existing transition system should apply transitions to shape properties in the same manner as other layer types.

**Validates: Requirements 7.4**

### Property 18: Config Parsing Round-Trip

*For any* valid shape layer configuration object, serializing it to JSON and then parsing it back should produce an equivalent configuration that renders identically.

**Validates: Requirements 9.1**

### Property 19: Camera Transform Integration

*For any* camera transformation (pan, zoom, or animated camera movement), shapes without `ignoreCameraTransform` flag should update their position and scale according to the camera transformation.

**Validates: Requirements 10.1, 10.2, 10.4**

### Property 20: Off-Screen Culling

*For any* shape whose bounding box is completely outside the visible viewport, the Shape_Layer should skip rendering that shape to optimize performance.

**Validates: Requirements 11.6**

## Error Handling

### Validation Errors

1. **Invalid Shape Type**: When an unsupported shape type is specified
   - Error: `"Invalid shape type: '{type}'. Supported types: rectangle, square, circle, ellipse, triangle, trapezoid, polygon, star"`
   - Action: Throw error during layer creation

2. **Missing Required Parameters**: When shape-specific required parameters are missing
   - Error: `"Missing required parameter '{param}' for shape type '{type}'"`
   - Action: Throw error during layer creation

3. **Invalid Parameter Values**: When parameters are out of valid range
   - Error: `"Invalid value for '{param}': {value}. Expected {constraint}"`
   - Action: Throw error during layer creation

4. **Invalid Color Format**: When color string cannot be parsed
   - Error: `"Invalid color format: '{color}'. Use CSS color formats (hex, rgb, rgba, hsl, hsla, or named colors)"`
   - Action: Fall back to default color (black for fill, transparent for stroke)

### Runtime Errors

1. **Rendering Backend Not Available**: When required rendering backend is not initialized
   - Error: `"Shape rendering backend not available"`
   - Action: Log error and skip rendering

2. **Canvas Context Lost**: When Canvas2D context is lost
   - Error: `"Canvas context lost for shape layer '{id}'"`
   - Action: Attempt to recreate canvas and context

### Graceful Degradation

1. **Unsupported Blend Modes**: If a blend mode is not supported by the browser
   - Action: Fall back to 'normal' blend mode and log warning

2. **Perspective Transform Not Supported**: If 3D transforms are not supported
   - Action: Skip perspective transforms and log warning

3. **Animation System Unavailable**: If animation system fails
   - Action: Render shapes with final property values

## Testing Strategy

### Dual Testing Approach

The shape layer system requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Specific shape rendering examples (one test per shape type)
- Edge cases (negative scales, zero dimensions, extreme values)
- Error conditions (invalid configs, missing parameters)
- Integration with LayerRegistry, animation system, camera system
- Backend-specific rendering (DOM vs Canvas2D)

**Property-Based Tests**: Verify universal properties across all inputs
- Generate random shape configurations and verify rendering succeeds
- Generate random transform combinations and verify correct application
- Generate random color formats and verify parsing and application
- Generate random animation keyframes and verify interpolation
- Test with hundreds of randomized inputs per property

### Property-Based Testing Configuration

- **Library**: Use `fast-check` for TypeScript/JavaScript property-based testing
- **Iterations**: Minimum 100 iterations per property test
- **Tagging**: Each property test must reference its design document property
- **Tag Format**: `// Feature: shape-layer-system, Property {number}: {property_text}`

### Test Organization

```
tests/
  shape-layer/
    unit/
      shape-layer.test.ts          # ShapeLayer class unit tests
      dom-renderer.test.ts         # DOM renderer unit tests
      canvas-renderer.test.ts      # Canvas2D renderer unit tests
      shape-geometry.test.ts       # Geometry generation unit tests
      integration.test.ts          # Integration with other systems
    
    property/
      shape-rendering.property.ts  # Property 1: Shape type rendering
      transforms.property.ts       # Properties 3-7: Transform application
      visual-props.property.ts     # Properties 8-11: Visual properties
      animation.property.ts        # Property 13: Animation interpolation
      config-parsing.property.ts   # Property 18: Config round-trip
      camera.property.ts           # Property 19: Camera integration
```

### Example Property Test

```typescript
// Feature: shape-layer-system, Property 1: Shape Type Rendering
import fc from 'fast-check';

describe('Property 1: Shape Type Rendering', () => {
  it('should render any supported shape type without errors', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('rectangle'),
          fc.constant('square'),
          fc.constant('circle'),
          fc.constant('ellipse'),
          fc.constant('triangle'),
          fc.constant('trapezoid'),
          fc.constant('polygon'),
          fc.constant('star')
        ),
        fc.record({
          // Generate appropriate config based on shape type
          width: fc.integer({ min: 1, max: 1000 }),
          height: fc.integer({ min: 1, max: 1000 }),
          radius: fc.integer({ min: 1, max: 500 }),
          // ... other properties
        }),
        (shapeType, config) => {
          const shapeLayer = new ShapeLayer('test', {
            shapeType,
            ...config
          });
          
          // Verify layer can be mounted and rendered without throwing
          expect(() => {
            shapeLayer.mount(mockContext);
            shapeLayer.update(mockFrameContext);
          }).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Coverage Goals

- **Line Coverage**: Minimum 90%
- **Branch Coverage**: Minimum 85%
- **Property Coverage**: 100% of correctness properties tested
- **Shape Type Coverage**: 100% of supported shape types tested
- **Backend Coverage**: Both DOM and Canvas2D renderers tested

### Performance Testing

While not part of correctness properties, performance should be validated:
- Render 100 shapes at 60 FPS (manual verification)
- Bundle size impact < 15KB minified (automated check)
- Memory usage stable over time (manual profiling)

## Implementation Notes

### Bundle Size Optimization

To keep the bundle size impact minimal:
1. **Tree-shakeable exports**: Export shape renderers separately so unused backends can be tree-shaken
2. **Shared geometry code**: ShapeGeometry class shared between renderers
3. **Minimal dependencies**: No external dependencies for shape rendering
4. **Lazy loading**: Shape layer code only loaded when shape layers are used

### Browser Compatibility

- **SVG Support**: Required for DOM renderer (all modern browsers)
- **Canvas2D Support**: Required for Canvas2D renderer (all modern browsers)
- **CSS Transforms**: Required for transform application (all modern browsers)
- **Blend Modes**: Graceful degradation if not supported

### Performance Considerations

1. **Dirty Checking**: Only re-render shapes when properties change
2. **Off-Screen Culling**: Skip rendering shapes outside viewport
3. **Batch Rendering**: Group shape rendering operations when possible
4. **Transform Caching**: Cache computed transform matrices
5. **Geometry Reuse**: Reuse generated path data when shape parameters unchanged

### Accessibility

- Shapes rendered via SVG should include appropriate ARIA labels when used for meaningful content
- Decorative shapes should have `aria-hidden="true"`
- Interactive shapes should be keyboard accessible

### Future Enhancements

Potential future additions (not in current scope):
- Custom shape definitions via path data
- Shape morphing animations
- Gradient fills and strokes
- Pattern fills
- Shadow effects
- Clipping paths
- Shape boolean operations (union, intersection, difference)
