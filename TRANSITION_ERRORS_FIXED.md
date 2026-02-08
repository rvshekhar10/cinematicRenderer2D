# Transition System Errors Fixed

## Errors Encountered

### 1. AudioSystem TypeError
```
AudioSystem.ts:448 Uncaught TypeError: Cannot read properties of null (reading 'state')
at AudioContext.<anonymous> (AudioSystem.ts:448:31)
```

**Cause:** The `statechange` event listener was using `this._audioContext!.state` with a non-null assertion, but the audio context could be null after destruction.

**Fix:** Added null checks before accessing the state property:
```typescript
// Before
if (this._audioContext!.state === 'suspended') {

// After  
if (this._audioContext && this._audioContext.state === 'suspended') {
```

### 2. ShapeLayer Invalid Shape Type
```
Failed to create layer icon of type shape: Error: Invalid shape type: 'undefined'. 
Supported types: rectangle, square, circle, ellipse, triangle, trapezoid, polygon, star
```

**Cause:** The JSON spec was using `shape` property but ShapeLayer expects `shapeType`. Also using incorrect property names:
- `fill` instead of `fillColor`
- `position` object instead of `x` and `y` directly
- `transform` object instead of direct positioning

**Fix:** Updated all shape configurations in `transition-types.json`:

```json
// Before (WRONG)
{
  "type": "shape",
  "config": {
    "shape": "circle",
    "width": 120,
    "height": 120,
    "fill": "#ffffff",
    "position": { "x": "50%", "y": "35%" },
    "transform": { "translateX": "-50%", "translateY": "-50%" }
  }
}

// After (CORRECT)
{
  "type": "shape",
  "config": {
    "shapeType": "circle",
    "radius": 60,
    "fillColor": "#ffffff",
    "x": "50%",
    "y": "35%"
  }
}
```

## Shape Configuration Reference

### Correct Property Names

| Shape Type | Required Properties | Example |
|------------|-------------------|---------|
| circle | `shapeType`, `radius`, `x`, `y` | `{"shapeType": "circle", "radius": 60}` |
| rectangle | `shapeType`, `width`, `height`, `x`, `y` | `{"shapeType": "rectangle", "width": 120, "height": 80}` |
| square | `shapeType`, `size`, `x`, `y` | `{"shapeType": "square", "size": 100}` |
| ellipse | `shapeType`, `radiusX`, `radiusY`, `x`, `y` | `{"shapeType": "ellipse", "radiusX": 80, "radiusY": 50}` |
| triangle | `shapeType`, `vertices`, `x`, `y` | `{"shapeType": "triangle", "vertices": [...]}` |
| polygon | `shapeType`, `sides`, `radius`, `x`, `y` | `{"shapeType": "polygon", "sides": 6, "radius": 60}` |
| star | `shapeType`, `points`, `outerRadius`, `innerRadius`, `x`, `y` | `{"shapeType": "star", "points": 5, "outerRadius": 60, "innerRadius": 30}` |

### Visual Properties

- `fillColor` - Fill color (CSS format)
- `strokeColor` - Stroke color (CSS format)
- `strokeWidth` - Stroke width in pixels
- `opacity` - Opacity (0.0 to 1.0)
- `rotation` - Rotation in degrees
- `scaleX`, `scaleY` - Scale factors
- `blendMode` - CSS blend mode

## Files Modified

1. **src/audio/AudioSystem.ts** - Added null checks for audio context
2. **playground/examples/transition-types.json** - Fixed all 6 shape layer configurations

## Testing

The transition demo should now work without errors:
1. Open http://localhost:3001/
2. Load "Transition Types" example
3. Click "Create Renderer" then "Play"
4. Watch transitions between 6 scenes with shape icons

## Shape Types in Transitions Demo

1. **Scene 1 (Crossfade)** - Circle icon
2. **Scene 2 (Slide)** - Rectangle icon
3. **Scene 3 (Zoom)** - Star icon (5 points)
4. **Scene 4 (Wipe)** - Triangle icon
5. **Scene 5 (Dissolve)** - Hexagon icon (6-sided polygon)
6. **Scene 6 (Blur)** - Circle icon (dark)

All shapes are now properly configured and will render correctly!
