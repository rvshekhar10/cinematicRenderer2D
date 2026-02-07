# Step-by-Step Tutorials

Comprehensive tutorials to help you master cinematicRenderer2D, from beginner to advanced.

## Table of Contents

1. [Tutorial 1: Your First Cinematic Scene](#tutorial-1-your-first-cinematic-scene)
2. [Tutorial 2: Adding Animations](#tutorial-2-adding-animations)
3. [Tutorial 3: Working with Multiple Scenes](#tutorial-3-working-with-multiple-scenes)
4. [Tutorial 4: Scene Transitions](#tutorial-4-scene-transitions)
5. [Tutorial 5: Camera Movements](#tutorial-5-camera-movements)
6. [Tutorial 6: Light Effects](#tutorial-6-light-effects)
7. [Tutorial 7: Geometric Shapes](#tutorial-7-geometric-shapes)
8. [Tutorial 8: Particle Systems](#tutorial-8-particle-systems)
9. [Tutorial 9: Audio Integration](#tutorial-9-audio-integration)
10. [Tutorial 10: Performance Optimization](#tutorial-10-performance-optimization)
11. [Tutorial 11: Building a Complete Experience](#tutorial-11-building-a-complete-experience)

---

## Tutorial 1: Your First Cinematic Scene

**Goal:** Create a simple scene with a gradient background and animated text.

**Time:** 10 minutes

**Prerequisites:** Basic HTML/JavaScript knowledge

### Step 1: Set Up Your HTML File

Create an `index.html` file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My First Cinematic</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    #container {
      width: 100vw;
      height: 100vh;
      background: #000;
    }
  </style>
</head>
<body>
  <div id="container"></div>
  <script type="module" src="main.js"></script>
</body>
</html>
```

### Step 2: Install the Library

```bash
npm install cinematic-renderer2d
```

### Step 3: Create Your First Scene

Create a `main.js` file:

```javascript
import { CinematicRenderer2D } from 'cinematic-renderer2d';

// Define your cinematic specification
const spec = {
  schemaVersion: '1.0.0',
  engine: {
    targetFps: 60,
    quality: 'auto'
  },
  events: [{
    id: 'intro',
    name: 'Introduction',
    scenes: ['welcome']
  }],
  scenes: [{
    id: 'welcome',
    name: 'Welcome Scene',
    duration: 5000,  // 5 seconds
    layers: [
      // Layer 1: Gradient background
      {
        id: 'background',
        type: 'gradient',
        zIndex: 1,
        config: {
          colors: ['#667eea', '#764ba2'],
          direction: 'to bottom'
        }
      },
      // Layer 2: Text
      {
        id: 'title',
        type: 'textBlock',
        zIndex: 2,
        config: {
          text: 'Welcome to CinematicRenderer2D',
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
          position: { x: '50%', y: '50%' },
          transform: {
            translateX: '-50%',
            translateY: '-50%'
          }
        }
      }
    ]
  }]
};

// Create and mount the renderer
const container = document.getElementById('container');
const renderer = new CinematicRenderer2D({
  container,
  spec,
  autoplay: true
});

// Mount and play
renderer.mount().then(() => {
  console.log('Renderer mounted successfully!');
  renderer.play();
}).catch(error => {
  console.error('Failed to mount renderer:', error);
});
```

### Step 4: Run Your Project

```bash
# If using a bundler like Vite
npm run dev

# Or use a simple HTTP server
npx serve .
```

### What You Learned

✅ How to set up a basic HTML page  
✅ How to create a cinematic specification  
✅ How to use gradient and text layers  
✅ How to mount and play a cinematic

### Next Steps

Try changing:
- The gradient colors
- The text content and styling
- The scene duration

---

## Tutorial 2: Adding Animations

**Goal:** Animate layer properties to create dynamic effects.

**Time:** 15 minutes

**Prerequisites:** Completed Tutorial 1

### Step 1: Understanding Animations

Animations in cinematicRenderer2D work by interpolating property values over time. Each animation needs:
- `property`: What to animate (e.g., 'opacity', 'config.fontSize')
- `from`: Starting value
- `to`: Ending value
- `startMs`: When to start (milliseconds)
- `endMs`: When to end (milliseconds)
- `easing`: How to interpolate (optional)

### Step 2: Add Fade-In Animation

Modify your text layer from Tutorial 1:

```javascript
{
  id: 'title',
  type: 'textBlock',
  zIndex: 2,
  config: {
    text: 'Welcome to CinematicRenderer2D',
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    position: { x: '50%', y: '50%' },
    transform: {
      translateX: '-50%',
      translateY: '-50%'
    }
  },
  animations: [
    // Fade in from 0 to 1 opacity
    {
      property: 'opacity',
      from: 0,
      to: 1,
      startMs: 0,
      endMs: 2000,
      easing: 'ease-in'
    }
  ]
}
```

### Step 3: Add Multiple Animations

You can animate multiple properties simultaneously:

```javascript
animations: [
  // Fade in
  {
    property: 'opacity',
    from: 0,
    to: 1,
    startMs: 0,
    endMs: 2000,
    easing: 'ease-in'
  },
  // Scale up
  {
    property: 'config.transform.scale',
    from: 0.5,
    to: 1,
    startMs: 0,
    endMs: 2000,
    easing: 'ease-out'
  },
  // Fade out at the end
  {
    property: 'opacity',
    from: 1,
    to: 0,
    startMs: 4000,
    endMs: 5000,
    easing: 'ease-out'
  }
]
```

### Step 4: Animate the Background

Add a color transition to your gradient:

```javascript
{
  id: 'background',
  type: 'gradient',
  zIndex: 1,
  config: {
    colors: ['#667eea', '#764ba2'],
    direction: 'to bottom'
  },
  animations: [
    {
      property: 'config.colors',
      from: ['#667eea', '#764ba2'],
      to: ['#f093fb', '#f5576c'],
      startMs: 0,
      endMs: 5000,
      easing: 'ease-in-out'
    }
  ]
}
```

### Step 5: Try Different Easing Functions

Experiment with different easing functions:

```javascript
// Linear (constant speed)
easing: 'linear'

// Ease functions
easing: 'ease-in'      // Slow start
easing: 'ease-out'     // Slow end
easing: 'ease-in-out'  // Slow start and end

// Advanced easing
easing: 'ease-in-bounce'
easing: 'ease-out-elastic'
easing: 'ease-in-back'
```

### What You Learned

✅ How to add animations to layers  
✅ How to animate multiple properties  
✅ How to use different easing functions  
✅ How to create fade in/out effects

### Challenge

Create a scene where:
1. Text fades in from the left (use translateX)
2. Background changes from blue to purple
3. Text bounces slightly (use ease-out-bounce)

---

## Tutorial 3: Working with Multiple Scenes

**Goal:** Create a multi-scene cinematic with proper sequencing.

**Time:** 20 minutes

**Prerequisites:** Completed Tutorials 1-2

### Step 1: Understanding Events and Scenes

- **Events**: High-level sequences that group scenes together
- **Scenes**: Individual moments with their own duration and layers
- Scenes play in the order specified in the event's `scenes` array

### Step 2: Create Multiple Scenes

```javascript
const spec = {
  schemaVersion: '1.0.0',
  engine: {
    targetFps: 60,
    quality: 'auto'
  },
  events: [{
    id: 'story',
    name: 'My Story',
    scenes: ['intro', 'middle', 'outro']  // Play in this order
  }],
  scenes: [
    // Scene 1: Intro
    {
      id: 'intro',
      name: 'Introduction',
      duration: 3000,
      layers: [{
        id: 'intro-bg',
        type: 'gradient',
        zIndex: 1,
        config: {
          colors: ['#667eea', '#764ba2'],
          direction: 'to bottom'
        }
      }, {
        id: 'intro-text',
        type: 'textBlock',
        zIndex: 2,
        config: {
          text: 'Chapter 1',
          fontSize: '56px',
          color: '#ffffff',
          textAlign: 'center',
          position: { x: '50%', y: '50%' }
        },
        animations: [{
          property: 'opacity',
          from: 0,
          to: 1,
          startMs: 0,
          endMs: 1000,
          easing: 'ease-in'
        }]
      }]
    },
    // Scene 2: Middle
    {
      id: 'middle',
      name: 'Middle Section',
      duration: 4000,
      layers: [{
        id: 'middle-bg',
        type: 'gradient',
        zIndex: 1,
        config: {
          colors: ['#f093fb', '#f5576c'],
          direction: 'to bottom'
        }
      }, {
        id: 'middle-text',
        type: 'textBlock',
        zIndex: 2,
        config: {
          text: 'The Journey Continues',
          fontSize: '42px',
          color: '#ffffff',
          textAlign: 'center',
          position: { x: '50%', y: '50%' }
        },
        animations: [{
          property: 'opacity',
          from: 0,
          to: 1,
          startMs: 0,
          endMs: 1000,
          easing: 'ease-in'
        }]
      }]
    },
    // Scene 3: Outro
    {
      id: 'outro',
      name: 'Conclusion',
      duration: 3000,
      layers: [{
        id: 'outro-bg',
        type: 'gradient',
        zIndex: 1,
        config: {
          colors: ['#4facfe', '#00f2fe'],
          direction: 'to bottom'
        }
      }, {
        id: 'outro-text',
        type: 'textBlock',
        zIndex: 2,
        config: {
          text: 'The End',
          fontSize: '64px',
          color: '#ffffff',
          textAlign: 'center',
          position: { x: '50%', y: '50%' }
        },
        animations: [{
          property: 'opacity',
          from: 0,
          to: 1,
          startMs: 0,
          endMs: 1500,
          easing: 'ease-in'
        }]
      }]
    }
  ]
};
```

### Step 3: Navigate Between Scenes

You can programmatically control scene navigation:

```javascript
// Go to a specific scene
renderer.goToScene('middle');

// Go to a specific event
renderer.goToEvent('story');

// Listen for scene changes
renderer.on('sceneChange', (event) => {
  console.log(`Now playing: ${event.sceneName}`);
});
```

### Step 4: Add Scene Timing

Each scene has its own timeline starting at 0ms:

```javascript
{
  id: 'intro',
  duration: 5000,  // Scene lasts 5 seconds
  layers: [{
    animations: [
      {
        startMs: 0,     // Start immediately
        endMs: 2000     // End at 2 seconds into THIS scene
      },
      {
        startMs: 3000,  // Start at 3 seconds into THIS scene
        endMs: 5000     // End at scene end
      }
    ]
  }]
}
```

### What You Learned

✅ How to create multiple scenes  
✅ How to sequence scenes in events  
✅ How to navigate between scenes  
✅ How scene timing works

### Challenge

Create a 3-scene story:
1. Morning scene (sunrise colors)
2. Afternoon scene (bright colors)
3. Night scene (dark colors)

Each scene should have unique text and animations.

---

## Tutorial 4: Scene Transitions

**Goal:** Add smooth transitions between scenes.

**Time:** 15 minutes

**Prerequisites:** Completed Tutorial 3

### Step 1: Understanding Transitions

Transitions create smooth visual effects when moving from one scene to another. Available types:
- `crossfade`: Fade out old scene while fading in new scene
- `slide`: Slide scenes in/out
- `zoom`: Zoom in/out effect
- `wipe`: Wipe effect with direction
- `dissolve`: Pixelated dissolve
- `blur`: Blur transition

### Step 2: Add Basic Crossfade

Add a `transitions` array to your specification:

```javascript
const spec = {
  schemaVersion: '1.0.0',
  engine: { targetFps: 60, quality: 'auto' },
  events: [{
    id: 'story',
    name: 'My Story',
    scenes: ['intro', 'middle', 'outro']
  }],
  scenes: [
    // ... your scenes here
  ],
  transitions: [
    {
      fromScene: 'intro',
      toScene: 'middle',
      type: 'crossfade',
      duration: 1000,  // 1 second transition
      easing: 'ease-in-out'
    },
    {
      fromScene: 'middle',
      toScene: 'outro',
      type: 'crossfade',
      duration: 1000,
      easing: 'ease-in-out'
    }
  ]
};
```

### Step 3: Try Different Transition Types

**Slide Transition:**
```javascript
{
  fromScene: 'intro',
  toScene: 'middle',
  type: 'slide',
  duration: 800,
  easing: 'ease-out',
  direction: 'left'  // 'up', 'down', 'left', 'right'
}
```

**Zoom Transition:**
```javascript
{
  fromScene: 'middle',
  toScene: 'outro',
  type: 'zoom',
  duration: 1200,
  easing: 'ease-in-out',
  direction: 'in'  // 'in' or 'out'
}
```

**Wipe Transition:**
```javascript
{
  fromScene: 'intro',
  toScene: 'middle',
  type: 'wipe',
  duration: 700,
  easing: 'linear',
  direction: 'right'  // 'up', 'down', 'left', 'right'
}
```

**Blur Transition:**
```javascript
{
  fromScene: 'middle',
  toScene: 'outro',
  type: 'blur',
  duration: 900,
  easing: 'ease-in-out',
  blurAmount: 20  // Blur radius in pixels
}
```

### Step 4: Default Transition

If you don't specify transitions, a default 500ms crossfade is used:

```javascript
// No transitions array = automatic crossfade
const spec = {
  events: [{
    scenes: ['scene1', 'scene2', 'scene3']
  }],
  scenes: [...]
  // Automatic 500ms crossfade between all scenes
};
```

### Step 5: Mix and Match

Use different transitions for different scene changes:

```javascript
transitions: [
  {
    fromScene: 'intro',
    toScene: 'action',
    type: 'zoom',
    duration: 600,
    direction: 'in'
  },
  {
    fromScene: 'action',
    toScene: 'calm',
    type: 'blur',
    duration: 1200,
    blurAmount: 25
  },
  {
    fromScene: 'calm',
    toScene: 'outro',
    type: 'crossfade',
    duration: 1500
  }
]
```

### What You Learned

✅ How to add transitions between scenes  
✅ Different transition types and their options  
✅ How to customize transition duration and easing  
✅ Default transition behavior

### Challenge

Create a 4-scene cinematic with:
1. Crossfade from scene 1 to 2
2. Slide from scene 2 to 3
3. Zoom from scene 3 to 4

---

## Tutorial 5: Camera Movements

**Goal:** Add cinematic camera movements to your scenes.

**Time:** 20 minutes

**Prerequisites:** Completed Tutorials 1-4

### Step 1: Understanding the Camera System

The camera system allows you to:
- Pan (move x, y)
- Zoom (scale)
- Rotate

Camera transforms affect all layers in the scene.

### Step 2: Add Camera State

Add camera configuration to a scene:

```javascript
{
  id: 'zoom-scene',
  name: 'Zoom Scene',
  duration: 5000,
  camera: {
    animations: [{
      property: 'zoom',
      from: 1.0,
      to: 2.0,
      startMs: 0,
      endMs: 5000,
      easing: 'ease-in-out'
    }]
  },
  layers: [
    // Your layers here
  ]
}
```

### Step 3: Pan Camera

Move the camera horizontally and vertically:

```javascript
camera: {
  animations: [
    {
      property: 'x',
      from: 0,
      to: 200,
      startMs: 0,
      endMs: 3000,
      easing: 'ease-out'
    },
    {
      property: 'y',
      from: 0,
      to: -100,
      startMs: 0,
      endMs: 3000,
      easing: 'ease-out'
    }
  ]
}
```

### Step 4: Combine Camera Movements

Create complex camera movements:

```javascript
camera: {
  animations: [
    // Zoom in
    {
      property: 'zoom',
      from: 1.0,
      to: 1.5,
      startMs: 0,
      endMs: 2000,
      easing: 'ease-in'
    },
    // Pan right while zooming
    {
      property: 'x',
      from: 0,
      to: 100,
      startMs: 0,
      endMs: 2000,
      easing: 'ease-in'
    },
    // Zoom out
    {
      property: 'zoom',
      from: 1.5,
      to: 1.0,
      startMs: 3000,
      endMs: 5000,
      easing: 'ease-out'
    },
    // Pan back
    {
      property: 'x',
      from: 100,
      to: 0,
      startMs: 3000,
      endMs: 5000,
      easing: 'ease-out'
    }
  ]
}
```

### Step 5: Rotate Camera

Add rotation for dramatic effect:

```javascript
camera: {
  animations: [{
    property: 'rotation',
    from: 0,
    to: 360,
    startMs: 0,
    endMs: 10000,
    easing: 'linear'
  }]
}
```

### Step 6: Programmatic Camera Control

Control camera from JavaScript:

```javascript
// Set camera state
renderer.setCameraState({
  x: 100,
  y: 50,
  zoom: 1.5,
  rotation: 15
});

// Add camera animation
renderer.addCameraAnimation({
  property: 'zoom',
  from: 1.0,
  to: 2.0,
  startMs: 0,
  endMs: 2000,
  easing: 'ease-in-out'
});

// Reset camera
renderer.resetCamera();

// Get current camera state
const cameraState = renderer.getCameraState();
console.log(cameraState);
```

### What You Learned

✅ How to add camera animations  
✅ How to pan, zoom, and rotate  
✅ How to combine camera movements  
✅ How to control camera programmatically

### Challenge

Create a scene that:
1. Starts zoomed out (zoom: 0.8)
2. Zooms in to 1.5x over 3 seconds
3. Pans right 150px while zoomed in
4. Zooms back out to 1.0x

---

## Tutorial 6: Light Effects

**Goal:** Add cinematic lighting to your scenes.

**Time:** 20 minutes

**Prerequisites:** Completed Tutorials 1-5

### Step 1: Understanding Light Layers

Light layers create cinematic lighting effects with four modes:
- `radial`: Circular light source
- `spot`: Directional spotlight
- `ambient`: Uniform color overlay
- `vignette`: Edge darkening

### Step 2: Add Radial Light

Create a glowing light source:

```javascript
{
  id: 'sun-light',
  type: 'light',
  zIndex: 5,
  config: {
    mode: 'radial',
    position: { x: 50, y: 30 },  // Center top
    radius: 300,
    intensity: 0.8,
    color: '#ffd93d',
    blendMode: 'screen'
  }
}
```

### Step 3: Add Spotlight

Create a directional spotlight:

```javascript
{
  id: 'spotlight',
  type: 'light',
  zIndex: 5,
  config: {
    mode: 'spot',
    position: { x: 50, y: 0 },
    radius: 400,
    intensity: 0.7,
    color: '#ffffff',
    angle: 60,        // Cone angle in degrees
    direction: 180,   // Point downward
    blendMode: 'overlay'
  }
}
```

### Step 4: Animate Lights

Make lights dynamic:

```javascript
{
  id: 'pulsing-light',
  type: 'light',
  zIndex: 5,
  config: {
    mode: 'radial',
    position: { x: 50, y: 50 },
    radius: 200,
    intensity: 0.6,
    color: '#00ff88',
    blendMode: 'screen'
  },
  animations: [
    // Pulse intensity
    {
      property: 'config.intensity',
      from: 0.4,
      to: 0.9,
      startMs: 0,
      endMs: 2000,
      easing: 'ease-in-out',
      loop: true,
      yoyo: true
    },
    // Move light
    {
      property: 'config.position.x',
      from: 30,
      to: 70,
      startMs: 0,
      endMs: 5000,
      easing: 'ease-in-out',
      loop: true,
      yoyo: true
    }
  ]
}
```

### Step 5: Blend Modes

Different blend modes create different effects:

```javascript
// Screen: Brightens (good for lights)
blendMode: 'screen'

// Overlay: Balanced blend
blendMode: 'overlay'

// Soft-light: Subtle effect
blendMode: 'soft-light'

// Multiply: Darkens
blendMode: 'multiply'
```

### Step 6: Multiple Lights

Layer multiple lights for complex scenes:

```javascript
layers: [
  // Background
  {
    id: 'bg',
    type: 'gradient',
    zIndex: 1,
    config: { colors: ['#1a1a2e', '#16213e'] }
  },
  // Main light
  {
    id: 'main-light',
    type: 'light',
    zIndex: 2,
    config: {
      mode: 'radial',
      position: { x: 50, y: 40 },
      radius: 350,
      intensity: 0.7,
      color: '#ffffff',
      blendMode: 'screen'
    }
  },
  // Accent light 1
  {
    id: 'accent-1',
    type: 'light',
    zIndex: 3,
    config: {
      mode: 'radial',
      position: { x: 20, y: 60 },
      radius: 150,
      intensity: 0.5,
      color: '#ff006e',
      blendMode: 'screen'
    }
  },
  // Accent light 2
  {
    id: 'accent-2',
    type: 'light',
    zIndex: 3,
    config: {
      mode: 'radial',
      position: { x: 80, y: 60 },
      radius: 150,
      intensity: 0.5,
      color: '#00f5ff',
      blendMode: 'screen'
    }
  }
]
```

### What You Learned

✅ How to add light layers  
✅ Different light modes (radial, spot, ambient, vignette)  
✅ How to animate lights  
✅ How to use blend modes  
✅ How to layer multiple lights

### Challenge

Create a scene with:
1. Dark gradient background
2. Main radial light that pulses
3. Two accent lights that move horizontally
4. All lights using screen blend mode

---

## Tutorial 7: Geometric Shapes

**Goal:** Create and animate geometric shapes without external assets.

**Time:** 15 minutes

**Prerequisites:** Completed Tutorial 1 and 2

### What You'll Learn

- How to create different shape types
- How to style shapes with colors and strokes
- How to animate shape properties
- How to layer multiple shapes

### Step 1: Basic Shape Creation

Let's start by creating a simple circle:

```javascript
const spec = {
  schemaVersion: '1.0.0',
  engine: {
    targetFps: 60,
    quality: 'high'
  },
  events: [{
    id: 'shapes-demo',
    name: 'Shapes Demo',
    scenes: ['basic-shapes']
  }],
  scenes: [{
    id: 'basic-shapes',
    name: 'Basic Shapes',
    duration: 5000,
    layers: [
      // Background
      {
        id: 'bg',
        type: 'gradient',
        zIndex: 0,
        config: {
          colors: ['#0f0f1e', '#1a1a2e'],
          direction: 'to bottom'
        }
      },
      // Circle
      {
        id: 'circle',
        type: 'shape',
        zIndex: 10,
        config: {
          shapeType: 'circle',
          radius: 50,
          x: 400,
          y: 300,
          fillColor: '#ff6b6b',
          strokeColor: '#ffffff',
          strokeWidth: 3
        }
      }
    ]
  }]
};
```

### Step 2: Multiple Shape Types

Add different shapes to create a composition:

```javascript
layers: [
  // Background
  {
    id: 'bg',
    type: 'gradient',
    zIndex: 0,
    config: {
      colors: ['#667eea', '#764ba2'],
      direction: 'to bottom'
    }
  },
  // Circle
  {
    id: 'circle',
    type: 'shape',
    zIndex: 10,
    config: {
      shapeType: 'circle',
      radius: 50,
      x: 200,
      y: 300,
      fillColor: '#ff6b6b'
    }
  },
  // Square
  {
    id: 'square',
    type: 'shape',
    zIndex: 10,
    config: {
      shapeType: 'square',
      size: 100,
      x: 400,
      y: 300,
      fillColor: '#4ecdc4'
    }
  },
  // Star
  {
    id: 'star',
    type: 'shape',
    zIndex: 10,
    config: {
      shapeType: 'star',
      points: 5,
      innerRadius: 30,
      outerRadius: 60,
      x: 600,
      y: 300,
      fillColor: '#ffe66d'
    }
  }
]
```

### Step 3: Animating Shapes

Add rotation animation to the star:

```javascript
{
  id: 'star',
  type: 'shape',
  zIndex: 10,
  config: {
    shapeType: 'star',
    points: 5,
    innerRadius: 30,
    outerRadius: 60,
    x: 600,
    y: 300,
    fillColor: '#ffe66d',
    rotation: 0
  },
  animations: [{
    property: 'config.rotation',
    from: 0,
    to: 360,
    startMs: 0,
    endMs: 3000,
    easing: 'linear',
    loop: true
  }]
}
```

### Step 4: Pulsing Effect

Create a pulsing circle with scale animation:

```javascript
{
  id: 'pulsing-circle',
  type: 'shape',
  zIndex: 10,
  config: {
    shapeType: 'circle',
    radius: 50,
    x: 400,
    y: 300,
    fillColor: '#ff6b6b',
    scaleX: 1,
    scaleY: 1
  },
  animations: [
    {
      property: 'config.scaleX',
      from: 1,
      to: 1.5,
      startMs: 0,
      endMs: 1500,
      easing: 'ease-in-out',
      loop: true,
      yoyo: true
    },
    {
      property: 'config.scaleY',
      from: 1,
      to: 1.5,
      startMs: 0,
      endMs: 1500,
      easing: 'ease-in-out',
      loop: true,
      yoyo: true
    }
  ]
}
```

### Step 5: Layering with Z-Index

Create overlapping shapes with different z-index values:

```javascript
layers: [
  {
    id: 'circle-back',
    type: 'shape',
    zIndex: 1,
    config: {
      shapeType: 'circle',
      radius: 80,
      x: 350,
      y: 300,
      fillColor: '#ff6b6b',
      opacity: 0.8
    }
  },
  {
    id: 'circle-middle',
    type: 'shape',
    zIndex: 2,
    config: {
      shapeType: 'circle',
      radius: 80,
      x: 400,
      y: 300,
      fillColor: '#4ecdc4',
      opacity: 0.8
    }
  },
  {
    id: 'circle-front',
    type: 'shape',
    zIndex: 3,
    config: {
      shapeType: 'circle',
      radius: 80,
      x: 450,
      y: 300,
      fillColor: '#ffe66d',
      opacity: 0.8
    }
  }
]
```

### Step 6: Complex Shapes

Use polygon and triangle shapes:

```javascript
// Hexagon
{
  id: 'hexagon',
  type: 'shape',
  zIndex: 10,
  config: {
    shapeType: 'polygon',
    sides: 6,
    radius: 60,
    x: 300,
    y: 300,
    fillColor: '#a8dadc',
    strokeColor: '#457b9d',
    strokeWidth: 3
  }
}

// Triangle
{
  id: 'triangle',
  type: 'shape',
  zIndex: 10,
  config: {
    shapeType: 'triangle',
    vertices: [
      { x: 0, y: -50 },
      { x: 43, y: 25 },
      { x: -43, y: 25 }
    ],
    x: 500,
    y: 300,
    fillColor: '#f1faee',
    strokeColor: '#e63946',
    strokeWidth: 3
  }
}
```

### Complete Example

Here's a complete scene with multiple animated shapes:

```javascript
import { CinematicRenderer2D } from 'cinematic-renderer2d';

const spec = {
  schemaVersion: '1.0.0',
  engine: {
    targetFps: 60,
    quality: 'high'
  },
  events: [{
    id: 'shapes-showcase',
    name: 'Shapes Showcase',
    scenes: ['animated-shapes']
  }],
  scenes: [{
    id: 'animated-shapes',
    name: 'Animated Shapes',
    duration: 10000,
    layers: [
      {
        id: 'bg',
        type: 'gradient',
        zIndex: 0,
        config: {
          colors: ['#667eea', '#764ba2'],
          direction: 'to bottom'
        }
      },
      {
        id: 'spinning-square',
        type: 'shape',
        zIndex: 10,
        config: {
          shapeType: 'square',
          size: 80,
          x: 300,
          y: 300,
          fillColor: '#4ecdc4',
          rotation: 0
        },
        animations: [{
          property: 'config.rotation',
          from: 0,
          to: 360,
          startMs: 0,
          endMs: 3000,
          easing: 'linear',
          loop: true
        }]
      },
      {
        id: 'pulsing-circle',
        type: 'shape',
        zIndex: 10,
        config: {
          shapeType: 'circle',
          radius: 50,
          x: 500,
          y: 300,
          fillColor: '#ff6b6b',
          scaleX: 1,
          scaleY: 1
        },
        animations: [
          {
            property: 'config.scaleX',
            from: 1,
            to: 1.5,
            startMs: 0,
            endMs: 1500,
            easing: 'ease-in-out',
            loop: true,
            yoyo: true
          },
          {
            property: 'config.scaleY',
            from: 1,
            to: 1.5,
            startMs: 0,
            endMs: 1500,
            easing: 'ease-in-out',
            loop: true,
            yoyo: true
          }
        ]
      }
    ]
  }]
};

const container = document.getElementById('container');
const renderer = new CinematicRenderer2D({ container, spec, autoplay: true });

renderer.mount().then(() => {
  console.log('Shapes demo ready!');
});
```

### Key Takeaways

1. **Shape Types**: Eight shape types available (rectangle, square, circle, ellipse, triangle, trapezoid, polygon, star)
2. **Styling**: Use `fillColor`, `strokeColor`, and `strokeWidth` for visual styling
3. **Transforms**: Apply rotation, scale, and skew transformations
4. **Animation**: All shape properties are animatable
5. **Layering**: Use z-index to control rendering order
6. **Performance**: Shapes render efficiently without external assets

### Next Steps

- Experiment with different shape combinations
- Try animating colors and opacity
- Combine shapes with light effects (Tutorial 6)
- Create complex compositions with multiple layers

---

## Tutorial 8: Particle Systems

**Goal:** Create dynamic particle effects.

**Time:** 20 minutes

**Time:** 25 minutes

**Prerequisites:** Completed Tutorials 1-6

### Step 1: Understanding Particle Systems

Particle systems create effects like:
- Rain, snow, dust
- Fire, smoke, sparks
- Stars, fireflies
- Confetti, bubbles

### Step 2: Basic Particle Layer

Create a simple particle system:

```javascript
{
  id: 'particles',
  type: 'particles',
  zIndex: 3,
  config: {
    count: 100,                    // Number of particles
    size: { min: 2, max: 5 },     // Particle size range
    color: '#ffffff',              // Particle color
    opacity: 0.8,                  // Particle opacity
    speed: { min: 2, max: 5 },    // Movement speed
    direction: 'down'              // Movement direction
  }
}
```

### Step 3: Rain Effect

Create realistic rain:

```javascript
{
  id: 'rain',
  type: 'particles',
  zIndex: 3,
  config: {
    count: 150,
    size: { min: 1, max: 2 },
    color: '#ecf0f1',
    opacity: 0.7,
    speed: { min: 15, max: 25 },
    direction: 'down',
    angle: 10  // Slight angle for wind effect
  }
}
```

### Step 4: Snow Effect

Create gentle snowfall:

```javascript
{
  id: 'snow',
  type: 'particles',
  zIndex: 3,
  config: {
    count: 100,
    size: { min: 2, max: 5 },
    color: '#ffffff',
    opacity: 0.8,
    speed: { min: 1, max: 3 },
    direction: 'down',
    drift: true  // Horizontal drift
  }
}
```

### Step 5: Fire/Sparks Effect

Create upward-moving fire particles:

```javascript
{
  id: 'fire',
  type: 'particles',
  zIndex: 3,
  config: {
    count: 80,
    size: { min: 3, max: 8 },
    color: '#ff6348',
    opacity: 0.9,
    speed: { min: 5, max: 12 },
    direction: 'up',
    spread: 30,  // Spread angle
    glow: true   // Add glow effect
  }
}
```

### Step 6: Starfield Effect

Create a starfield with depth:

```javascript
{
  id: 'starfield',
  type: 'starfield',
  zIndex: 2,
  config: {
    count: 200,
    size: { min: 1, max: 3 },
    twinkle: true,
    twinkleSpeed: 2000,
    depth: 3  // Parallax depth layers
  }
}
```

### Step 7: Dust/Floating Particles

Create floating dust particles:

```javascript
{
  id: 'dust',
  type: 'dust',
  zIndex: 3,
  config: {
    count: 50,
    size: { min: 2, max: 4 },
    color: '#ffffff',
    opacity: 0.3,
    speed: { min: 0.2, max: 0.6 },
    drift: true  // Random floating motion
  }
}
```

### Step 8: Radial Explosion

Create particles that explode outward:

```javascript
{
  id: 'explosion',
  type: 'particles',
  zIndex: 4,
  config: {
    count: 150,
    size: { min: 2, max: 6 },
    color: '#ff6b6b',
    opacity: 0.9,
    speed: { min: 5, max: 15 },
    direction: 'radial',
    origin: { x: 50, y: 50 }  // Explosion center
  },
  animations: [{
    property: 'config.opacity',
    from: 0.9,
    to: 0,
    startMs: 0,
    endMs: 2000,
    easing: 'ease-out'
  }]
}
```

### Step 9: Combine Multiple Particle Systems

Layer different particle systems:

```javascript
layers: [
  // Background
  {
    id: 'bg',
    type: 'gradient',
    zIndex: 1,
    config: { colors: ['#0a0a0a', '#1a1a2e'] }
  },
  // Slow background particles
  {
    id: 'bg-particles',
    type: 'dust',
    zIndex: 2,
    config: {
      count: 30,
      size: { min: 1, max: 2 },
      color: '#ffffff',
      opacity: 0.2,
      speed: { min: 0.1, max: 0.3 },
      drift: true
    }
  },
  // Medium speed particles
  {
    id: 'mid-particles',
    type: 'particles',
    zIndex: 3,
    config: {
      count: 50,
      size: { min: 2, max: 4 },
      color: '#00d4ff',
      opacity: 0.5,
      speed: { min: 1, max: 3 },
      direction: 'up'
    }
  },
  // Fast foreground particles
  {
    id: 'fg-particles',
    type: 'particles',
    zIndex: 4,
    config: {
      count: 20,
      size: { min: 3, max: 6 },
      color: '#ffffff',
      opacity: 0.8,
      speed: { min: 5, max: 10 },
      direction: 'up',
      glow: true
    }
  }
]
```

### What You Learned

✅ How to create particle systems  
✅ Different particle effects (rain, snow, fire, stars, dust)  
✅ How to configure particle properties  
✅ How to animate particles  
✅ How to layer multiple particle systems

### Challenge

Create a scene with:
1. Dark background
2. Starfield with twinkling
3. Slow floating dust particles
4. Fast-moving sparkles in the foreground

---

## Tutorial 9: Audio Integration

**Goal:** Add synchronized audio to your cinematic.

**Time:** 20 minutes

**Prerequisites:** Completed Tutorials 1-7

### Step 1: Understanding Audio Tracks

Audio tracks can be:
- `voiceover`: Narration or dialogue
- `ambience`: Background ambient sounds
- `music`: Background music
- `sfx`: Sound effects
- `transition`: Transition sound effects

### Step 2: Add Background Music

Add music to a scene:

```javascript
{
  id: 'intro-scene',
  name: 'Introduction',
  duration: 10000,
  layers: [
    // Your layers here
  ],
  audio: [{
    id: 'bg-music',
    type: 'music',
    src: '/assets/audio/intro-music.mp3',
    startMs: 0,
    volume: 0.6,
    loop: true
  }]
}
```

### Step 3: Add Fade In/Out

Smooth audio transitions:

```javascript
audio: [{
  id: 'ambient-sound',
  type: 'ambience',
  src: '/assets/audio/forest.mp3',
  startMs: 0,
  volume: 0.7,
  fadeIn: 2000,   // Fade in over 2 seconds
  fadeOut: 1500,  // Fade out over 1.5 seconds
  loop: true
}]
```

### Step 4: Multiple Audio Tracks

Play multiple tracks simultaneously:

```javascript
audio: [
  // Background music
  {
    id: 'music',
    type: 'music',
    src: '/assets/audio/music.mp3',
    startMs: 0,
    volume: 0.5,
    loop: true,
    fadeIn: 2000
  },
  // Ambient sounds
  {
    id: 'ambience',
    type: 'ambience',
    src: '/assets/audio/wind.mp3',
    startMs: 0,
    volume: 0.3,
    loop: true
  },
  // Sound effect at specific time
  {
    id: 'thunder',
    type: 'sfx',
    src: '/assets/audio/thunder.mp3',
    startMs: 5000,  // Play at 5 seconds
    volume: 0.8
  }
]
```

### Step 5: Audio Crossfading

Audio automatically crossfades between scenes:

```javascript
// Scene 1
{
  id: 'scene1',
  duration: 5000,
  audio: [{
    id: 'music1',
    type: 'music',
    src: '/assets/audio/calm.mp3',
    volume: 0.6,
    fadeOut: 1000  // Fade out when scene ends
  }]
}

// Scene 2
{
  id: 'scene2',
  duration: 5000,
  audio: [{
    id: 'music2',
    type: 'music',
    src: '/assets/audio/intense.mp3',
    volume: 0.7,
    fadeIn: 1000  // Fade in when scene starts
  }]
}

// Automatic crossfade between scenes!
```

### Step 6: Programmatic Audio Control

Control audio from JavaScript:

```javascript
// Set master volume
renderer.setMasterVolume(0.5);  // 50% volume

// Get master volume
const volume = renderer.getMasterVolume();

// Check Web Audio availability
const hasWebAudio = renderer.isWebAudioAvailable();

// Get active track count
const trackCount = renderer.getActiveAudioTrackCount();
```

### Step 7: Handle Audio Errors

Listen for audio events:

```javascript
// Audio error
renderer.on('audioError', (event) => {
  console.error(`Audio error on track ${event.trackId}:`, event.error);
});

// Autoplay blocked
renderer.on('autoplayBlocked', (event) => {
  console.warn(`Autoplay blocked for track ${event.trackId}`);
  // Show user a play button
});
```

### What You Learned

✅ How to add audio tracks to scenes  
✅ Different audio track types  
✅ How to use fade in/out  
✅ How to play multiple tracks  
✅ Audio crossfading between scenes  
✅ Programmatic audio control

### Challenge

Create a scene with:
1. Background music that fades in
2. Ambient sound (rain, wind, etc.)
3. A sound effect that plays at 3 seconds
4. All audio fades out at the end

---

## Tutorial 10: Performance Optimization

**Goal:** Optimize your cinematic for smooth performance across devices.

**Time:** 25 minutes

**Prerequisites:** Completed Tutorials 1-8

### Step 1: Understanding Performance

Performance factors:
- **FPS (Frames Per Second)**: Target 60 FPS for smooth playback
- **Layer Count**: More layers = more work
- **Particle Count**: Particles are expensive
- **Asset Size**: Large images/videos impact load time
- **Animations**: Complex animations can be costly

### Step 2: Enable Performance Monitoring

Add quality system to your spec:

```javascript
const spec = {
  schemaVersion: '1.0.0',
  engine: {
    targetFps: 60,
    quality: 'auto',  // Automatically adjust quality
    performanceMonitoring: true
  },
  // ... rest of spec
};
```

### Step 3: Use Quality Levels

Set quality levels for different devices:

```javascript
engine: {
  targetFps: 60,
  quality: 'auto',  // 'low', 'medium', 'high', 'auto'
  qualityThresholds: {
    high: 55,    // Stay in high quality if FPS > 55
    medium: 45,  // Drop to medium if FPS < 55
    low: 30      // Drop to low if FPS < 45
  }
}
```

### Step 4: Optimize Particle Systems

Reduce particle counts on low-end devices:

```javascript
{
  id: 'particles',
  type: 'particles',
  zIndex: 3,
  config: {
    // Use quality-aware particle counts
    count: {
      high: 200,
      medium: 100,
      low: 50
    },
    size: { min: 2, max: 5 },
    color: '#ffffff',
    opacity: 0.8,
    speed: { min: 2, max: 5 },
    direction: 'down'
  }
}
```

### Step 5: Optimize Asset Loading

Preload assets efficiently:

```javascript
// Use asset preloading
const renderer = new CinematicRenderer2D({
  container,
  spec,
  preloadAssets: true  // Preload before playing
});

// Monitor preload progress
renderer.on('preloadProgress', (event) => {
  console.log(`Loading: ${event.loaded}/${event.total} (${event.percent}%)`);
  // Update loading bar UI
});

renderer.on('preloadComplete', () => {
  console.log('All assets loaded!');
  renderer.play();
});
```

### Step 6: Use Efficient Layer Types

Choose the right layer type for the job:

```javascript
// ❌ BAD: Using video for static background
{
  id: 'bg',
  type: 'video',
  config: { src: '/static-image.mp4' }
}

// ✅ GOOD: Use image for static content
{
  id: 'bg',
  type: 'image',
  config: { src: '/static-image.jpg' }
}

// ❌ BAD: Using Canvas for simple gradient
{
  id: 'bg',
  type: 'canvas',
  config: { /* complex gradient drawing */ }
}

// ✅ GOOD: Use gradient layer
{
  id: 'bg',
  type: 'gradient',
  config: { colors: ['#667eea', '#764ba2'] }
}
```

### Step 7: Optimize Animations

Use CSS transforms for better performance:

```javascript
// ✅ GOOD: Use transform properties (GPU accelerated)
animations: [
  {
    property: 'config.transform.translateX',
    from: 0,
    to: 100,
    startMs: 0,
    endMs: 2000
  },
  {
    property: 'config.transform.scale',
    from: 1,
    to: 1.5,
    startMs: 0,
    endMs: 2000
  }
]

// ❌ AVOID: Animating position properties (causes reflow)
animations: [
  {
    property: 'config.position.x',
    from: 0,
    to: 100,
    startMs: 0,
    endMs: 2000
  }
]
```

### Step 8: Reduce Layer Count

Combine layers when possible:

```javascript
// ❌ BAD: Multiple text layers
layers: [
  { id: 'text1', type: 'textBlock', config: { text: 'Line 1' } },
  { id: 'text2', type: 'textBlock', config: { text: 'Line 2' } },
  { id: 'text3', type: 'textBlock', config: { text: 'Line 3' } }
]

// ✅ GOOD: Single text layer with line breaks
layers: [
  {
    id: 'text',
    type: 'textBlock',
    config: {
      text: 'Line 1\nLine 2\nLine 3'
    }
  }
]
```

### Step 9: Monitor Performance

Use debug mode to monitor performance:

```javascript
const renderer = new CinematicRenderer2D({
  container,
  spec,
  debug: true  // Enable debug overlay
});

// Access performance metrics
renderer.on('performanceUpdate', (metrics) => {
  console.log(`FPS: ${metrics.fps}`);
  console.log(`Frame time: ${metrics.frameTime}ms`);
  console.log(`Active layers: ${metrics.layerCount}`);
  console.log(`Memory: ${metrics.memoryUsage}MB`);
});
```

### Step 10: Cleanup Resources

Ensure proper cleanup:

```javascript
// Clean up when done
renderer.on('complete', () => {
  renderer.destroy();  // Release all resources
});

// Or manually
window.addEventListener('beforeunload', () => {
  renderer.destroy();
});
```

### Step 11: Performance Checklist

Before deploying, verify:

✅ Target FPS maintained (60 FPS)  
✅ Assets are optimized (compressed images/videos)  
✅ Particle counts are reasonable (< 200 for most devices)  
✅ Layer count is minimal (< 20 per scene)  
✅ Animations use transforms when possible  
✅ Quality system is enabled  
✅ Assets are preloaded  
✅ Proper cleanup on unmount

### Step 12: Testing on Different Devices

Test performance across devices:

```javascript
// Detect device capabilities
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isLowEnd = navigator.hardwareConcurrency <= 4;

// Adjust quality based on device
const quality = isMobile || isLowEnd ? 'medium' : 'high';

const renderer = new CinematicRenderer2D({
  container,
  spec,
  quality
});
```

### What You Learned

✅ How to enable performance monitoring  
✅ How to use quality levels  
✅ How to optimize particle systems  
✅ How to optimize asset loading  
✅ How to choose efficient layer types  
✅ How to optimize animations  
✅ How to monitor and test performance

### Challenge

Take an existing cinematic and:
1. Enable performance monitoring
2. Reduce particle counts by 50%
3. Combine similar layers
4. Use transforms for all animations
5. Verify 60 FPS on your device

---

## Tutorial 11: Building a Complete Experience

**Goal:** Build a complete multi-scene cinematic with all features.

**Time:** 45 minutes

**Prerequisites:** Completed all previous tutorials

### Project: "Journey Through Time"

We'll create a complete cinematic experience with:
- 4 scenes (Dawn, Day, Dusk, Night)
- Scene transitions
- Camera movements
- Lighting effects
- Particle systems
- Audio integration
- Performance optimization

### Step 1: Project Setup

Create your project structure:

```
journey-through-time/
├── index.html
├── main.js
├── spec.json
└── assets/
    ├── audio/
    │   ├── dawn.mp3
    │   ├── day.mp3
    │   ├── dusk.mp3
    │   └── night.mp3
    └── images/
        └── moon.png
```

### Step 2: Create the HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Journey Through Time</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      overflow: hidden;
      font-family: 'Arial', sans-serif;
    }
    #container {
      width: 100vw;
      height: 100vh;
      background: #000;
    }
    #loading {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      z-index: 1000;
    }
    #loading.hidden {
      display: none;
    }
    #progress-bar {
      width: 300px;
      height: 4px;
      background: #333;
      border-radius: 2px;
      overflow: hidden;
      margin-top: 20px;
    }
    #progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      width: 0%;
      transition: width 0.3s ease;
    }
  </style>
</head>
<body>
  <div id="loading">
    <h2>Loading Journey Through Time...</h2>
    <div id="progress-bar">
      <div id="progress-fill"></div>
    </div>
  </div>
  <div id="container"></div>
  <script type="module" src="main.js"></script>
</body>
</html>
```

### Step 3: Create the Specification

```javascript
// spec.json or inline in main.js
const spec = {
  schemaVersion: '1.0.0',
  engine: {
    targetFps: 60,
    quality: 'auto',
    performanceMonitoring: true
  },
  events: [{
    id: 'journey',
    name: 'Journey Through Time',
    scenes: ['dawn', 'day', 'dusk', 'night']
  }],
  scenes: [
    // Scene 1: Dawn
    {
      id: 'dawn',
      name: 'Dawn',
      duration: 8000,
      camera: {
        animations: [{
          property: 'zoom',
          from: 1.2,
          to: 1.0,
          startMs: 0,
          endMs: 8000,
          easing: 'ease-out'
        }]
      },
      layers: [
        // Background gradient
        {
          id: 'dawn-bg',
          type: 'gradient',
          zIndex: 1,
          config: {
            colors: ['#ff6b6b', '#feca57', '#48dbfb'],
            direction: 'to bottom'
          }
        },
        // Sun light
        {
          id: 'sun',
          type: 'light',
          zIndex: 2,
          config: {
            mode: 'radial',
            position: { x: 80, y: 20 },
            radius: 400,
            intensity: 0.6,
            color: '#ffd93d',
            blendMode: 'screen'
          },
          animations: [{
            property: 'config.intensity',
            from: 0.3,
            to: 0.8,
            startMs: 0,
            endMs: 8000,
            easing: 'ease-in'
          }]
        },
        // Dust particles
        {
          id: 'dust',
          type: 'dust',
          zIndex: 3,
          config: {
            count: 40,
            size: { min: 2, max: 4 },
            color: '#ffffff',
            opacity: 0.3,
            speed: { min: 0.2, max: 0.5 },
            drift: true
          }
        },
        // Title
        {
          id: 'dawn-title',
          type: 'textBlock',
          zIndex: 4,
          config: {
            text: 'Dawn',
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center',
            position: { x: '50%', y: '50%' },
            transform: {
              translateX: '-50%',
              translateY: '-50%'
            },
            textShadow: '0 4px 20px rgba(0,0,0,0.5)'
          },
          animations: [
            {
              property: 'opacity',
              from: 0,
              to: 1,
              startMs: 0,
              endMs: 2000,
              easing: 'ease-in'
            },
            {
              property: 'opacity',
              from: 1,
              to: 0,
              startMs: 6000,
              endMs: 8000,
              easing: 'ease-out'
            }
          ]
        }
      ],
      audio: [{
        id: 'dawn-music',
        type: 'ambience',
        src: '/assets/audio/dawn.mp3',
        volume: 0.5,
        fadeIn: 2000,
        fadeOut: 2000,
        loop: true
      }]
    },
    // Scene 2: Day
    {
      id: 'day',
      name: 'Day',
      duration: 8000,
      camera: {
        animations: [
          {
            property: 'x',
            from: 0,
            to: 100,
            startMs: 0,
            endMs: 8000,
            easing: 'ease-in-out'
          },
          {
            property: 'zoom',
            from: 1.0,
            to: 1.3,
            startMs: 0,
            endMs: 4000,
            easing: 'ease-in'
          },
          {
            property: 'zoom',
            from: 1.3,
            to: 1.0,
            startMs: 4000,
            endMs: 8000,
            easing: 'ease-out'
          }
        ]
      },
      layers: [
        // Bright sky
        {
          id: 'day-bg',
          type: 'gradient',
          zIndex: 1,
          config: {
            colors: ['#48dbfb', '#0abde3'],
            direction: 'to bottom'
          }
        },
        // Bright sun
        {
          id: 'day-sun',
          type: 'light',
          zIndex: 2,
          config: {
            mode: 'radial',
            position: { x: 50, y: 30 },
            radius: 500,
            intensity: 0.9,
            color: '#ffffff',
            blendMode: 'screen'
          }
        },
        // Sparkles
        {
          id: 'sparkles',
          type: 'particles',
          zIndex: 3,
          config: {
            count: 60,
            size: { min: 2, max: 5 },
            color: '#ffffff',
            opacity: 0.7,
            speed: { min: 1, max: 3 },
            direction: 'up',
            glow: true
          }
        },
        // Title
        {
          id: 'day-title',
          type: 'textBlock',
          zIndex: 4,
          config: {
            text: 'Day',
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center',
            position: { x: '50%', y: '50%' },
            transform: {
              translateX: '-50%',
              translateY: '-50%'
            },
            textShadow: '0 4px 20px rgba(0,0,0,0.3)'
          },
          animations: [
            {
              property: 'opacity',
              from: 0,
              to: 1,
              startMs: 0,
              endMs: 2000,
              easing: 'ease-in'
            },
            {
              property: 'config.transform.scale',
              from: 0.8,
              to: 1.0,
              startMs: 0,
              endMs: 2000,
              easing: 'ease-out-back'
            },
            {
              property: 'opacity',
              from: 1,
              to: 0,
              startMs: 6000,
              endMs: 8000,
              easing: 'ease-out'
            }
          ]
        }
      ],
      audio: [{
        id: 'day-music',
        type: 'ambience',
        src: '/assets/audio/day.mp3',
        volume: 0.6,
        fadeIn: 2000,
        fadeOut: 2000,
        loop: true
      }]
    },
    // Scene 3: Dusk
    {
      id: 'dusk',
      name: 'Dusk',
      duration: 8000,
      camera: {
        animations: [{
          property: 'rotation',
          from: 0,
          to: 5,
          startMs: 0,
          endMs: 8000,
          easing: 'ease-in-out'
        }]
      },
      layers: [
        // Sunset gradient
        {
          id: 'dusk-bg',
          type: 'gradient',
          zIndex: 1,
          config: {
            colors: ['#ff6348', '#ff4757', '#2f3542'],
            direction: 'to bottom'
          }
        },
        // Setting sun
        {
          id: 'dusk-sun',
          type: 'light',
          zIndex: 2,
          config: {
            mode: 'radial',
            position: { x: 20, y: 70 },
            radius: 350,
            intensity: 0.7,
            color: '#ff6348',
            blendMode: 'screen'
          },
          animations: [{
            property: 'config.position.y',
            from: 50,
            to: 80,
            startMs: 0,
            endMs: 8000,
            easing: 'ease-in'
          }]
        },
        // Fireflies
        {
          id: 'fireflies',
          type: 'particles',
          zIndex: 3,
          config: {
            count: 30,
            size: { min: 3, max: 6 },
            color: '#ffd93d',
            opacity: 0.8,
            speed: { min: 0.5, max: 1.5 },
            drift: true,
            glow: true
          }
        },
        // Title
        {
          id: 'dusk-title',
          type: 'textBlock',
          zIndex: 4,
          config: {
            text: 'Dusk',
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center',
            position: { x: '50%', y: '50%' },
            transform: {
              translateX: '-50%',
              translateY: '-50%'
            },
            textShadow: '0 4px 20px rgba(0,0,0,0.7)'
          },
          animations: [
            {
              property: 'opacity',
              from: 0,
              to: 1,
              startMs: 0,
              endMs: 2000,
              easing: 'ease-in'
            },
            {
              property: 'opacity',
              from: 1,
              to: 0,
              startMs: 6000,
              endMs: 8000,
              easing: 'ease-out'
            }
          ]
        }
      ],
      audio: [{
        id: 'dusk-music',
        type: 'ambience',
        src: '/assets/audio/dusk.mp3',
        volume: 0.5,
        fadeIn: 2000,
        fadeOut: 2000,
        loop: true
      }]
    },
    // Scene 4: Night
    {
      id: 'night',
      name: 'Night',
      duration: 10000,
      camera: {
        animations: [{
          property: 'zoom',
          from: 1.0,
          to: 1.5,
          startMs: 0,
          endMs: 10000,
          easing: 'ease-in-out'
        }]
      },
      layers: [
        // Night sky
        {
          id: 'night-bg',
          type: 'gradient',
          zIndex: 1,
          config: {
            colors: ['#0a0a0a', '#1a1a2e', '#16213e'],
            direction: 'to bottom'
          }
        },
        // Starfield
        {
          id: 'stars',
          type: 'starfield',
          zIndex: 2,
          config: {
            count: 200,
            size: { min: 1, max: 3 },
            twinkle: true,
            twinkleSpeed: 2000,
            depth: 3
          }
        },
        // Moon
        {
          id: 'moon',
          type: 'light',
          zIndex: 3,
          config: {
            mode: 'radial',
            position: { x: 70, y: 30 },
            radius: 200,
            intensity: 0.6,
            color: '#e8f4f8',
            blendMode: 'screen'
          }
        },
        // Moon glow
        {
          id: 'moon-glow',
          type: 'light',
          zIndex: 3,
          config: {
            mode: 'radial',
            position: { x: 70, y: 30 },
            radius: 300,
            intensity: 0.3,
            color: '#48dbfb',
            blendMode: 'screen'
          },
          animations: [{
            property: 'config.intensity',
            from: 0.2,
            to: 0.4,
            startMs: 0,
            endMs: 3000,
            easing: 'ease-in-out',
            loop: true,
            yoyo: true
          }]
        },
        // Title
        {
          id: 'night-title',
          type: 'textBlock',
          zIndex: 4,
          config: {
            text: 'Night',
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center',
            position: { x: '50%', y: '50%' },
            transform: {
              translateX: '-50%',
              translateY: '-50%'
            },
            textShadow: '0 4px 20px rgba(72,219,251,0.5)'
          },
          animations: [
            {
              property: 'opacity',
              from: 0,
              to: 1,
              startMs: 0,
              endMs: 2000,
              easing: 'ease-in'
            },
            {
              property: 'opacity',
              from: 1,
              to: 0,
              startMs: 8000,
              endMs: 10000,
              easing: 'ease-out'
            }
          ]
        },
        // Final message
        {
          id: 'final-message',
          type: 'textBlock',
          zIndex: 5,
          config: {
            text: 'Journey Complete',
            fontSize: '36px',
            color: '#ffffff',
            textAlign: 'center',
            position: { x: '50%', y: '60%' },
            transform: {
              translateX: '-50%',
              translateY: '-50%'
            },
            textShadow: '0 2px 10px rgba(72,219,251,0.5)'
          },
          animations: [{
            property: 'opacity',
            from: 0,
            to: 1,
            startMs: 7000,
            endMs: 9000,
            easing: 'ease-in'
          }]
        }
      ],
      audio: [{
        id: 'night-music',
        type: 'ambience',
        src: '/assets/audio/night.mp3',
        volume: 0.5,
        fadeIn: 2000,
        loop: true
      }]
    }
  ],
  transitions: [
    {
      fromScene: 'dawn',
      toScene: 'day',
      type: 'crossfade',
      duration: 1500,
      easing: 'ease-in-out'
    },
    {
      fromScene: 'day',
      toScene: 'dusk',
      type: 'slide',
      duration: 1200,
      direction: 'left',
      easing: 'ease-in-out'
    },
    {
      fromScene: 'dusk',
      toScene: 'night',
      type: 'blur',
      duration: 1800,
      blurAmount: 20,
      easing: 'ease-in-out'
    }
  ]
};
```

### Step 4: Create the Main JavaScript

```javascript
// main.js
import { CinematicRenderer2D } from 'cinematic-renderer2d';

// Get DOM elements
const container = document.getElementById('container');
const loading = document.getElementById('loading');
const progressFill = document.getElementById('progress-fill');

// Create renderer
const renderer = new CinematicRenderer2D({
  container,
  spec,
  autoplay: false,
  preloadAssets: true,
  quality: 'auto',
  debug: false  // Set to true for development
});

// Handle preload progress
renderer.on('preloadProgress', (event) => {
  const percent = Math.round((event.loaded / event.total) * 100);
  progressFill.style.width = `${percent}%`;
});

// Handle preload complete
renderer.on('preloadComplete', () => {
  setTimeout(() => {
    loading.classList.add('hidden');
    renderer.play();
  }, 500);
});

// Handle scene changes
renderer.on('sceneChange', (event) => {
  console.log(`Now playing: ${event.sceneName}`);
});

// Handle completion
renderer.on('complete', () => {
  console.log('Journey complete!');
  // Optionally loop or show replay button
  setTimeout(() => {
    renderer.goToScene('dawn');
    renderer.play();
  }, 3000);
});

// Handle errors
renderer.on('error', (event) => {
  console.error('Renderer error:', event.error);
  loading.innerHTML = `<h2>Error loading cinematic</h2><p>${event.error.message}</p>`;
});

// Mount the renderer
renderer.mount().catch(error => {
  console.error('Failed to mount:', error);
  loading.innerHTML = `<h2>Failed to load</h2><p>${error.message}</p>`;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  renderer.destroy();
});
```

### Step 5: Add Controls (Optional)

Add playback controls:

```javascript
// Add to HTML
<div id="controls">
  <button id="play-pause">Pause</button>
  <button id="restart">Restart</button>
  <input type="range" id="volume" min="0" max="100" value="50">
</div>

// Add to JavaScript
const playPauseBtn = document.getElementById('play-pause');
const restartBtn = document.getElementById('restart');
const volumeSlider = document.getElementById('volume');

playPauseBtn.addEventListener('click', () => {
  if (renderer.isPlaying()) {
    renderer.pause();
    playPauseBtn.textContent = 'Play';
  } else {
    renderer.play();
    playPauseBtn.textContent = 'Pause';
  }
});

restartBtn.addEventListener('click', () => {
  renderer.goToScene('dawn');
  renderer.play();
});

volumeSlider.addEventListener('input', (e) => {
  renderer.setMasterVolume(e.target.value / 100);
});
```

### Step 6: Test and Optimize

1. **Test on different devices**:
   - Desktop browsers (Chrome, Firefox, Safari, Edge)
   - Mobile devices (iOS, Android)
   - Different screen sizes

2. **Monitor performance**:
   - Enable debug mode
   - Check FPS stays at 60
   - Monitor memory usage

3. **Optimize if needed**:
   - Reduce particle counts
   - Compress assets
   - Adjust quality settings

### What You Built

✅ Complete 4-scene cinematic  
✅ Scene transitions  
✅ Camera animations  
✅ Lighting effects  
✅ Particle systems  
✅ Audio integration  
✅ Loading screen  
✅ Error handling  
✅ Performance optimization

### Next Steps

Now that you've completed all tutorials, you can:

1. **Explore the API**: Check out the [API Documentation](API.md)
2. **Browse Examples**: See the [Scene Cookbook](SCENE_COOKBOOK.md)
3. **Build Your Own**: Create your unique cinematic experiences
4. **Share**: Deploy your cinematics and share them with the world

### Resources

- [API Documentation](API.md)
- [Scene Cookbook](SCENE_COOKBOOK.md)
- [Performance Guide](PERFORMANCE.md)
- [React Integration](REACT_INTEGRATION.md)
- [Angular Integration](ANGULAR_INTEGRATION.md)

---

## Congratulations!

You've completed all 10 tutorials and built a complete cinematic experience. You now have the skills to create stunning visual narratives with cinematicRenderer2D.

Happy creating! 🎬✨
