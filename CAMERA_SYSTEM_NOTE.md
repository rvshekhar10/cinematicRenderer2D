# Camera System - JSON Spec Support Missing

## Issue

The camera system was implemented programmatically but **camera animations are not supported in JSON specifications**.

## Current State

- ✅ Camera system implemented (`CameraSystem` class)
- ✅ Programmatic API works: `renderer.addCameraAnimation()`
- ❌ JSON spec support missing: `CinematicScene` interface has no `camera` property

## What Works

```typescript
// Programmatic API (works)
renderer.addCameraAnimation({
  property: 'zoom',
  from: 1.0,
  to: 2.0,
  startMs: 0,
  endMs: 3000,
  easing: 'ease-in-out'
});
```

## What Doesn't Work

```json
// JSON spec (doesn't work - not in schema)
{
  "id": "scene1",
  "duration": 5000,
  "camera": {
    "animations": [
      {
        "property": "zoom",
        "from": 1.0,
        "to": 2.0,
        "startMs": 0,
        "endMs": 3000
      }
    ]
  },
  "layers": [...]
}
```

## Required Changes

To add JSON spec support for camera animations:

### 1. Update TypeScript Types (`src/types/CinematicSpec.ts`)

```typescript
export interface CinematicScene {
  id: string;
  name: string;
  duration: number;
  layers: LayerSpec[];
  audio?: AudioTrackSpec[];
  camera?: CameraSpec;  // ADD THIS
}

export interface CameraSpec {
  animations?: CameraAnimationSpec[];
}

export interface CameraAnimationSpec {
  property: 'x' | 'y' | 'zoom' | 'rotation';
  from: number;
  to: number;
  startMs: number;
  endMs: number;
  easing?: EasingType;
  loop?: boolean;
  yoyo?: boolean;
  keyframes?: AnimationKeyframe[];
}
```

### 2. Update Zod Schema (`src/parsing/SpecParser.ts`)

```typescript
const CameraAnimationSpecSchema = z.object({
  property: z.enum(['x', 'y', 'zoom', 'rotation']),
  from: z.number(),
  to: z.number(),
  startMs: z.number().min(0),
  endMs: z.number().min(0),
  easing: EasingTypeSchema.optional().default('ease' as EasingType),
  loop: z.boolean().optional().default(false),
  yoyo: z.boolean().optional().default(false),
  keyframes: z.array(AnimationKeyframeSchema).optional()
}).refine(data => data.endMs > data.startMs, {
  message: "endMs must be greater than startMs",
  path: ["endMs"]
});

const CameraSpecSchema = z.object({
  animations: z.array(CameraAnimationSpecSchema).optional().default([])
}).optional();

const CinematicSceneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  duration: z.number().min(0),
  layers: z.array(LayerSpecSchema).min(1),
  audio: z.array(AudioTrackSpecSchema).optional().default([]),
  camera: CameraSpecSchema  // ADD THIS
});
```

### 3. Update SpecParser Compilation

In `SpecParser.compileScene()`, add camera animation compilation:

```typescript
// Compile camera animations
if (scene.camera?.animations) {
  for (const anim of scene.camera.animations) {
    renderer.addCameraAnimation({
      property: anim.property,
      from: anim.from,
      to: anim.to,
      startMs: anim.startMs,
      endMs: anim.endMs,
      easing: anim.easing,
      loop: anim.loop,
      yoyo: anim.yoyo
    });
  }
}
```

## Workaround

For now, camera animations must be added programmatically after loading the spec:

```typescript
const renderer = new CinematicRenderer2D(container, spec);

// Add camera animations manually
renderer.on('sceneStart', (sceneId) => {
  if (sceneId === 'pan-scene') {
    renderer.addCameraAnimation({
      property: 'x',
      from: -100,
      to: 100,
      startMs: 0,
      endMs: 6000,
      easing: 'ease-in-out'
    });
  }
});
```

## Impact

- `camera-showcase.json` example doesn't work in playground
- Users cannot specify camera animations in JSON specs
- Camera system is only accessible via programmatic API

## Recommendation

Add JSON spec support for camera animations as described above to complete the camera system implementation.
