# Scene Templates

Pre-built scene templates for common cinematic effects. Each template can be customized with colors, timing, and effects.

## Available Templates

### 1. Sunrise Scene
A warm, peaceful sunrise scene with gradient background and atmospheric particles.

**Features:**
- Warm gradient (orange to yellow to light blue)
- Soft particle effects for atmosphere
- Optional audio track with morning ambience
- Smooth fade in/out

**Default Duration:** 8 seconds

**Customizable Properties:**
- `colors.primary` - Warm orange color
- `colors.secondary` - Golden yellow color
- `colors.accent` - Light blue sky color
- `timing.duration` - Total scene duration
- `effects.particleCount` - Number of atmospheric particles
- `effects.intensity` - Particle opacity

### 2. Cosmic Birth Scene
A dramatic cosmic scene with starfield background, nebula effects, and particle explosions.

**Features:**
- Dark starfield background
- Nebula noise effects
- Explosive particle bursts
- Dramatic lighting

**Default Duration:** 10 seconds

**Customizable Properties:**
- `colors.primary` - Deep purple space color
- `colors.secondary` - Magenta explosion color
- `colors.accent` - Cyan light color
- `timing.duration` - Total scene duration
- `effects.particleCount` - Number of explosion particles
- `effects.speed` - Particle burst speed

### 3. Rain Scene
A moody rain scene with falling rain particles, atmospheric fog, and optional rain sound effects.

**Features:**
- Gray gradient background
- Falling rain particle system
- Atmospheric fog layer
- Optional rain audio

**Default Duration:** 12 seconds

**Customizable Properties:**
- `colors.primary` - Dark gray color
- `colors.secondary` - Light gray color
- `timing.duration` - Total scene duration
- `effects.particleCount` - Number of rain drops
- `effects.speed` - Rain fall speed

### 4. Divine Aura Scene
A heavenly scene with radial light layers, soft glow effects, and gentle particles.

**Features:**
- Bright gradient background
- Multiple radial light layers
- Soft glow effects
- Gentle floating particles

**Default Duration:** 10 seconds

**Customizable Properties:**
- `colors.primary` - Pure white color
- `colors.secondary` - Gold color
- `timing.duration` - Total scene duration
- `effects.intensity` - Light intensity
- `effects.particleCount` - Number of floating particles

### 5. Underwater Scene
An immersive underwater scene with blue gradient, floating debris particles, and light rays.

**Features:**
- Deep blue gradient background
- Floating dust particles (debris)
- Light rays using spot lights
- Gentle movement

**Default Duration:** 15 seconds

**Customizable Properties:**
- `colors.primary` - Deep ocean blue
- `colors.secondary` - Medium blue
- `colors.accent` - Light cyan
- `timing.duration` - Total scene duration
- `effects.particleCount` - Number of debris particles
- `effects.speed` - Particle drift speed

## Usage

### Basic Usage

```typescript
import { SceneTemplates } from 'cinematic-renderer2d';

// Create a sunrise scene with default settings
const sunriseScene = SceneTemplates.sunrise();

// Use in a cinematic spec
const spec = {
  version: '1.0.0',
  events: [
    {
      id: 'sunrise-event',
      startMs: 0,
      endMs: 8000,
      scenes: [sunriseScene]
    }
  ]
};
```

### Customization

```typescript
import { createSunriseScene } from 'cinematic-renderer2d';

// Customize colors, timing, and effects
const customSunrise = createSunriseScene({
  colors: {
    primary: '#FF0000',    // Red instead of orange
    secondary: '#FFFF00',  // Yellow
    accent: '#00FFFF'      // Cyan
  },
  timing: {
    duration: 10000,       // 10 seconds
    fadeInDuration: 3000,  // 3 second fade in
    fadeOutDuration: 3000  // 3 second fade out
  },
  effects: {
    particleCount: 100,    // More particles
    intensity: 0.5,        // Higher opacity
    speed: 1.0             // Faster movement
  }
});
```

### Using the Template Manager

```typescript
import { SceneTemplateManager } from 'cinematic-renderer2d';

// Get list of available templates
const templates = SceneTemplateManager.getAvailableTemplates();
console.log(templates);
// [
//   { id: 'sunrise', name: 'Sunrise', description: '...', ... },
//   { id: 'cosmicBirth', name: 'Cosmic Birth', description: '...', ... },
//   ...
// ]

// Create a scene from template type
const scene = SceneTemplateManager.createScene('rain', {
  timing: { duration: 15000 }
});

// Validate customization before creating
const customization = {
  colors: { primary: '#FF0000' },
  timing: { duration: 5000 }
};

const validation = SceneTemplateManager.validateCustomization('sunrise', customization);
if (validation.valid) {
  const scene = SceneTemplateManager.createScene('sunrise', customization);
} else {
  console.error('Invalid customization:', validation.errors);
}

// Get default customization for a template
const defaults = SceneTemplateManager.getDefaultCustomization('underwater');
```

### Creating Multiple Scenes

```typescript
import { SceneTemplates } from 'cinematic-renderer2d';

// Create a sequence of scenes
const spec = {
  version: '1.0.0',
  events: [
    {
      id: 'sunrise',
      startMs: 0,
      endMs: 8000,
      scenes: [SceneTemplates.sunrise()]
    },
    {
      id: 'cosmic',
      startMs: 8000,
      endMs: 18000,
      scenes: [SceneTemplates.cosmicBirth()]
    },
    {
      id: 'rain',
      startMs: 18000,
      endMs: 30000,
      scenes: [SceneTemplates.rain()]
    }
  ]
};
```

## Customization Interface

```typescript
interface TemplateCustomization {
  colors?: {
    primary?: string;      // Hex color (e.g., '#FF6B35')
    secondary?: string;    // Hex color
    accent?: string;       // Hex color
  };
  timing?: {
    duration?: number;          // Total duration in milliseconds
    fadeInDuration?: number;    // Fade in duration in milliseconds
    fadeOutDuration?: number;   // Fade out duration in milliseconds
  };
  effects?: {
    particleCount?: number;  // Number of particles (0+)
    intensity?: number;      // Effect intensity (0-1)
    speed?: number;          // Movement speed (0+)
  };
}
```

## Validation

The template manager provides validation for customization options:

```typescript
const result = SceneTemplateManager.validateCustomization('sunrise', {
  colors: { primary: 'invalid-color' },  // Invalid
  timing: { duration: -1000 },           // Invalid
  effects: { intensity: 1.5 }            // Invalid
});

console.log(result);
// {
//   valid: false,
//   errors: [
//     'colors.primary must be a valid hex color (e.g., #FF6B35)',
//     'timing.duration must be a positive number',
//     'effects.intensity must be between 0 and 1'
//   ]
// }
```

## Examples

See `playground/examples/template-demo.json` for a complete example using all templates.

## Adding Custom Templates

You can create your own templates following the same pattern:

```typescript
import type { CinematicScene, TemplateCustomization } from 'cinematic-renderer2d';

export function createMyCustomScene(
  customization: TemplateCustomization = {}
): CinematicScene {
  const {
    colors = { primary: '#000000', secondary: '#ffffff' },
    timing = { duration: 5000 },
    effects = { particleCount: 50 }
  } = customization;

  return {
    id: 'my-custom-scene',
    name: 'My Custom Scene',
    duration: timing.duration!,
    layers: [
      // Your layers here
    ],
    audioTracks: []
  };
}
```
