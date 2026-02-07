# Shape Layer Animation Integration

## Overview

The Shape Layer system is fully integrated with the existing animation system in CinematicRenderer2D. All shape properties can be animated using the same animation specification format as other layer types.

## Animated Properties

The following shape properties support animation:

### Transform Properties (Requirements 5.1, 5.2, 5.3)
- **x**: Horizontal position (pixels or percentage)
- **y**: Vertical position (pixels or percentage)
- **rotation**: Rotation in degrees
- **scaleX**: Horizontal scale factor
- **scaleY**: Vertical scale factor
- **skewX**: Horizontal skew in degrees
- **skewY**: Vertical skew in degrees

### Visual Properties (Requirements 5.4, 5.5, 5.6)
- **fillColor**: Fill color (CSS color format)
- **strokeColor**: Stroke color (CSS color format)
- **strokeWidth**: Stroke width in pixels
- **opacity**: Opacity (0.0 to 1.0)
- **blendMode**: CSS blend mode

### Shape-Specific Properties
- **radius**: Circle/polygon radius
- **radiusX**: Ellipse horizontal radius
- **radiusY**: Ellipse vertical radius
- **width**: Rectangle width
- **height**: Rectangle height
- **size**: Square size
- **innerRadius**: Star inner radius
- **outerRadius**: Star outer radius

## Animation Features

### Easing Functions (Requirement 5.7)

All standard easing functions are supported:
- Linear: `linear`
- Standard: `ease`, `ease-in`, `ease-out`, `ease-in-out`
- Sine: `ease-in-sine`, `ease-out-sine`, `ease-in-out-sine`
- Quadratic: `ease-in-quad`, `ease-out-quad`, `ease-in-out-quad`
- Cubic: `ease-in-cubic`, `ease-out-cubic`, `ease-in-out-cubic`
- Quartic: `ease-in-quart`, `ease-out-quart`, `ease-in-out-quart`
- Quintic: `ease-in-quint`, `ease-out-quint`, `ease-in-out-quint`
- Exponential: `ease-in-expo`, `ease-out-expo`, `ease-in-out-expo`
- Circular: `ease-in-circ`, `ease-out-circ`, `ease-in-out-circ`
- Back: `ease-in-back`, `ease-out-back`, `ease-in-out-back`
- Elastic: `ease-in-elastic`, `ease-out-elastic`, `ease-in-out-elastic`
- Bounce: `ease-in-bounce`, `ease-out-bounce`, `ease-in-out-bounce`
- Custom: `cubic-bezier(x1, y1, x2, y2)`

### Simultaneous Animations (Requirement 5.8)

Multiple properties can be animated simultaneously:

```typescript
{
  id: 'animated-shape',
  type: 'shape',
  config: {
    shapeType: 'rectangle',
    width: 100,
    height: 50,
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    opacity: 1,
  },
  animations: [
    {
      property: 'x',
      from: 0,
      to: 500,
      startMs: 0,
      endMs: 2000,
      easing: 'ease-in-out',
    },
    {
      property: 'rotation',
      from: 0,
      to: 360,
      startMs: 0,
      endMs: 2000,
      easing: 'linear',
    },
    {
      property: 'scaleX',
      from: 1,
      to: 2,
      startMs: 0,
      endMs: 2000,
      easing: 'ease-out',
    },
    {
      property: 'opacity',
      from: 1,
      to: 0.3,
      startMs: 0,
      endMs: 2000,
      easing: 'ease-in',
    },
  ],
}
```

### Keyframe Animations

Complex multi-step animations using keyframes:

```typescript
{
  property: 'y',
  from: 300,
  to: 300,
  startMs: 0,
  endMs: 3000,
  easing: 'linear',
  keyframes: [
    { time: 0, value: 300 },
    { time: 0.25, value: 200, easing: 'ease-out' },
    { time: 0.5, value: 300, easing: 'ease-in' },
    { time: 0.75, value: 400, easing: 'ease-out' },
    { time: 1, value: 300, easing: 'ease-in' },
  ],
}
```

### Looping and Yoyo

Animations can loop indefinitely and reverse direction:

```typescript
{
  property: 'rotation',
  from: 0,
  to: 360,
  startMs: 0,
  endMs: 2000,
  easing: 'linear',
  loop: true,  // Loop indefinitely
}

{
  property: 'scaleX',
  from: 1,
  to: 1.5,
  startMs: 0,
  endMs: 1000,
  easing: 'ease-in-out',
  loop: true,
  yoyo: true,  // Reverse direction on each loop
}
```

## How It Works

### Animation Compilation

1. **Specification Parsing**: Animation tracks are defined in the JSON spec
2. **Compilation**: `AnimationCompiler.compileTrack()` converts specs into optimized runtime functions
3. **Storage**: Compiled animations are stored in `CompiledLayer.animations`

### Animation Application

The animation system works through the following flow:

1. **Frame Update**: On each frame, the renderer calls `layer.update(frameContext)`
2. **Value Calculation**: For each active animation track:
   - `AnimationCompiler.calculateProgress()` determines the current progress (0-1)
   - `track.interpolate(progress)` calculates the interpolated value
3. **Property Update**: The animated value is applied via `layer.updateConfig({ property: value })`
4. **Rendering**: The renderer uses the updated config to render the shape

### Integration Points

```typescript
// In the rendering loop (simplified):
for (const layer of activeLayers) {
  // Get compiled animations for this layer
  const animations = compiledLayer.animations;
  
  // Apply each animation
  for (const track of animations) {
    const value = AnimationCompiler.applyAnimation(track, currentTimeMs);
    if (value !== null) {
      // Update layer config with animated value
      layer.updateConfig({ [track.property]: value });
    }
  }
  
  // Render with updated config
  layer.update(frameContext);
}
```

## Examples

### Simple Position Animation

```typescript
{
  id: 'moving-circle',
  type: 'shape',
  config: {
    shapeType: 'circle',
    radius: 50,
    x: 100,
    y: 300,
    fillColor: '#ff6b6b',
  },
  animations: [
    {
      property: 'x',
      from: 100,
      to: 700,
      startMs: 0,
      endMs: 3000,
      easing: 'ease-in-out',
    },
  ],
}
```

### Rotation Animation

```typescript
{
  id: 'spinning-square',
  type: 'shape',
  config: {
    shapeType: 'square',
    size: 80,
    x: 400,
    y: 300,
    rotation: 0,
    fillColor: '#4ecdc4',
  },
  animations: [
    {
      property: 'rotation',
      from: 0,
      to: 360,
      startMs: 0,
      endMs: 2000,
      easing: 'linear',
      loop: true,
    },
  ],
}
```

### Pulsing Scale Animation

```typescript
{
  id: 'pulsing-star',
  type: 'shape',
  config: {
    shapeType: 'star',
    points: 5,
    innerRadius: 30,
    outerRadius: 60,
    x: 400,
    y: 300,
    scaleX: 1,
    scaleY: 1,
    fillColor: '#ffd93d',
  },
  animations: [
    {
      property: 'scaleX',
      from: 1,
      to: 1.5,
      startMs: 0,
      endMs: 1000,
      easing: 'ease-in-out',
      loop: true,
      yoyo: true,
    },
    {
      property: 'scaleY',
      from: 1,
      to: 1.5,
      startMs: 0,
      endMs: 1000,
      easing: 'ease-in-out',
      loop: true,
      yoyo: true,
    },
  ],
}
```

### Fade Animation

```typescript
{
  id: 'fading-polygon',
  type: 'shape',
  config: {
    shapeType: 'polygon',
    sides: 6,
    radius: 60,
    x: 300,
    y: 300,
    fillColor: '#ff6b6b',
    opacity: 1,
  },
  animations: [
    {
      property: 'opacity',
      from: 1,
      to: 0,
      startMs: 0,
      endMs: 2000,
      easing: 'ease-in-out',
    },
  ],
}
```

### Complex Combined Animation

```typescript
{
  id: 'complex-shape',
  type: 'shape',
  config: {
    shapeType: 'rectangle',
    width: 100,
    height: 60,
    x: 100,
    y: 100,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    fillColor: '#ff6b6b',
    strokeWidth: 2,
    opacity: 1,
  },
  animations: [
    { property: 'x', from: 100, to: 700, startMs: 0, endMs: 5000, easing: 'ease-in-out' },
    { property: 'y', from: 100, to: 500, startMs: 0, endMs: 5000, easing: 'ease-in-out' },
    { property: 'rotation', from: 0, to: 360, startMs: 0, endMs: 5000, easing: 'linear' },
    { property: 'scaleX', from: 1, to: 2, startMs: 0, endMs: 5000, easing: 'ease-out' },
    { property: 'scaleY', from: 1, to: 0.5, startMs: 0, endMs: 5000, easing: 'ease-in' },
    { property: 'opacity', from: 1, to: 0.3, startMs: 0, endMs: 5000, easing: 'ease-in-out' },
    { property: 'strokeWidth', from: 2, to: 8, startMs: 0, endMs: 5000, easing: 'linear' },
  ],
}
```

## Testing

Comprehensive tests verify animation integration:

- **Position Animation Tests**: Verify x and y position animations
- **Rotation Animation Tests**: Verify rotation with different easing functions
- **Scale Animation Tests**: Verify independent scaleX and scaleY animations
- **Color Animation Tests**: Verify fillColor and strokeColor animations
- **Opacity Animation Tests**: Verify opacity fade effects
- **Stroke Width Animation Tests**: Verify stroke width changes
- **Easing Function Tests**: Verify all easing functions work correctly
- **Simultaneous Animation Tests**: Verify multiple properties animate together
- **Keyframe Animation Tests**: Verify multi-step keyframe animations
- **Loop and Yoyo Tests**: Verify looping and reversing animations

Run tests with:
```bash
npm test -- ShapeLayer.animation.test.ts
```

## Performance Considerations

1. **Precompiled Animations**: All animations are compiled at parse time for optimal runtime performance
2. **Efficient Interpolation**: Interpolation functions are optimized for each value type
3. **Minimal Overhead**: Animation application adds negligible overhead to the render loop
4. **Smart Updates**: Only properties with active animations are updated

## Requirements Validation

This implementation validates the following requirements:

- **5.1**: Position (x, y) animations ✓
- **5.2**: Rotation animations ✓
- **5.3**: Scale (scaleX, scaleY) animations ✓
- **5.4**: Color (fillColor, strokeColor) animations ✓
- **5.5**: Opacity animations ✓
- **5.6**: Stroke width animations ✓
- **5.7**: Easing functions for all properties ✓
- **5.8**: Simultaneous animation of multiple properties ✓

## See Also

- [Shape Layer Demo](./examples/shape-layer-demo.ts) - Basic shape rendering
- [Shape Animation Demo](./examples/shape-animation-demo.ts) - Animation showcase
- [Animation Compiler](./src/animation/AnimationCompiler.ts) - Animation system implementation
- [Shape Layer Tests](./src/core/layers/ShapeLayer.animation.test.ts) - Animation integration tests
