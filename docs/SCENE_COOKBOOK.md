# Scene Cookbook

A comprehensive collection of ready-to-use scene examples for cinematicRenderer2D. Each example includes complete code, visual descriptions, and customization tips.

## Table of Contents

1. [Sunrise Scene](#1-sunrise-scene)
2. [Starry Night Scene](#2-starry-night-scene)
3. [Rain Scene](#3-rain-scene)
4. [Underwater Scene](#4-underwater-scene)
5. [Cosmic Birth Scene](#5-cosmic-birth-scene)
6. [Divine Aura Scene](#6-divine-aura-scene)
7. [Foggy Forest Scene](#7-foggy-forest-scene)
8. [Neon City Scene](#8-neon-city-scene)
9. [Desert Sunset Scene](#9-desert-sunset-scene)
10. [Northern Lights Scene](#10-northern-lights-scene)
11. [Volcanic Eruption Scene](#11-volcanic-eruption-scene)
12. [Snow Storm Scene](#12-snow-storm-scene)
13. [Ocean Waves Scene](#13-ocean-waves-scene)
14. [Space Station Scene](#14-space-station-scene)
15. [Enchanted Garden Scene](#15-enchanted-garden-scene)

---

## 1. Sunrise Scene

**Visual Description:** A warm, peaceful sunrise with gradient sky transitioning from deep purple to orange, with atmospheric particles and gentle light rays.

**Use Cases:** Opening scenes, peaceful transitions, nature documentaries, meditation apps

**Duration:** 10 seconds

### Complete Code

```json
{
  "id": "sunrise",
  "name": "Sunrise Scene",
  "duration": 10000,
  "camera": {
    "animations": [{
      "property": "zoom",
      "from": 1.0,
      "to": 1.2,
      "startMs": 0,
      "endMs": 10000,
      "easing": "ease-in-out"
    }]
  },
  "layers": [
    {
      "id": "sky-gradient",
      "type": "gradient",
      "zIndex": 1,
      "config": {
        "colors": ["#1a1a2e", "#16213e", "#0f3460", "#533483", "#e94560", "#ff6b6b", "#feca57"],
        "direction": "to bottom"
      },
      "animations": [{
        "property": "config.colors",
        "from": ["#1a1a2e", "#16213e", "#0f3460"],
        "to": ["#feca57", "#ff6b6b", "#48dbfb"],
        "startMs": 0,
        "endMs": 8000,
        "easing": "ease-in-out"
      }]
    },
    {
      "id": "sun",
      "type": "light",
      "zIndex": 2,
      "config": {
        "mode": "radial",
        "position": { "x": 50, "y": 70 },
        "radius": 300,
        "intensity": 0.8,
        "color": "#ffd93d",
        "blendMode": "screen"
      },
      "animations": [{
        "property": "config.position.y",
        "from": 90,
        "to": 70,
        "startMs": 0,
        "endMs": 10000,
        "easing": "ease-out"
      }, {
        "property": "config.intensity",
        "from": 0.2,
        "to": 0.8,
        "startMs": 0,
        "endMs": 8000,
        "easing": "ease-in"
      }]
    },
    {
      "id": "atmosphere",
      "type": "particles",
      "zIndex": 3,
      "config": {
        "count": 50,
        "size": { "min": 2, "max": 4 },
        "color": "#ffffff",
        "opacity": 0.3,
        "speed": { "min": 0.5, "max": 1.5 },
        "direction": "up"
      }
    },
    {
      "id": "title",
      "type": "textBlock",
      "zIndex": 4,
      "config": {
        "text": "A New Day Begins",
        "fontSize": "48px",
        "fontWeight": "bold",
        "color": "#ffffff",
        "textAlign": "center",
        "textShadow": "0 2px 10px rgba(0,0,0,0.5)",
        "position": { "x": "50%", "y": "50%" },
        "transform": { "translateX": "-50%", "translateY": "-50%" }
      },
      "animations": [{
        "property": "opacity",
        "from": 0,
        "to": 1,
        "startMs": 2000,
        "endMs": 4000,
        "easing": "ease-in"
      }, {
        "property": "opacity",
        "from": 1,
        "to": 0,
        "startMs": 8000,
        "endMs": 10000,
        "easing": "ease-out"
      }]
    }
  ],
  "audio": [{
    "id": "morning-ambience",
    "type": "ambience",
    "src": "/assets/audio/morning-birds.mp3",
    "startMs": 0,
    "volume": 0.6,
    "fadeIn": 2000,
    "fadeOut": 2000
  }]
}
```

### Customization Tips

**Change Colors:**
```json
"colors": ["#your-dark-color", "#your-mid-color", "#your-bright-color"]
```

**Adjust Sun Position:**
```json
"position": { "x": 30, "y": 60 }  // Left side sunrise
"position": { "x": 70, "y": 60 }  // Right side sunrise
```

**More/Fewer Particles:**
```json
"count": 100  // More atmospheric
"count": 20   // Subtle effect
```

---

## 2. Starry Night Scene

**Visual Description:** Deep space with twinkling stars, nebula clouds, and a sense of infinite depth.

**Use Cases:** Space themes, contemplative moments, sci-fi intros, astronomy content

**Duration:** 15 seconds

### Complete Code

```json
{
  "id": "starry-night",
  "name": "Starry Night Scene",
  "duration": 15000,
  "camera": {
    "animations": [{
      "property": "rotation",
      "from": 0,
      "to": 5,
      "startMs": 0,
      "endMs": 15000,
      "easing": "linear"
    }]
  },
  "layers": [
    {
      "id": "space-background",
      "type": "gradient",
      "zIndex": 1,
      "config": {
        "colors": ["#0a0a0a", "#1a1a2e", "#16213e"],
        "direction": "to bottom"
      }
    },
    {
      "id": "starfield",
      "type": "starfield",
      "zIndex": 2,
      "config": {
        "count": 200,
        "size": { "min": 1, "max": 3 },
        "twinkle": true,
        "twinkleSpeed": 2000,
        "depth": 3
      }
    },
    {
      "id": "nebula",
      "type": "nebulaNoise",
      "zIndex": 3,
      "config": {
        "colors": ["#533483", "#e94560", "#0f3460"],
        "opacity": 0.3,
        "scale": 2,
        "speed": 0.5
      }
    },
    {
      "id": "moon",
      "type": "light",
      "zIndex": 4,
      "config": {
        "mode": "radial",
        "position": { "x": 80, "y": 20 },
        "radius": 150,
        "intensity": 0.6,
        "color": "#e8e8e8",
        "blendMode": "screen"
      }
    },
    {
      "id": "shooting-star",
      "type": "particles",
      "zIndex": 5,
      "config": {
        "count": 1,
        "size": { "min": 2, "max": 2 },
        "color": "#ffffff",
        "opacity": 1,
        "speed": { "min": 20, "max": 20 },
        "direction": "diagonal",
        "trail": true,
        "trailLength": 50
      },
      "animations": [{
        "property": "config.position.x",
        "from": 100,
        "to": 0,
        "startMs": 5000,
        "endMs": 6000,
        "easing": "linear"
      }]
    }
  ]
}
```

### Customization Tips

**Change Star Density:**
```json
"count": 500  // Dense starfield
"count": 50   // Sparse stars
```

**Nebula Colors:**
```json
"colors": ["#ff6b6b", "#4ecdc4", "#45b7d1"]  // Colorful nebula
"colors": ["#2d3436", "#636e72", "#b2bec3"]  // Gray nebula
```

**Add More Shooting Stars:**
```json
"count": 3  // Multiple shooting stars
```

---

## 3. Rain Scene

**Visual Description:** Atmospheric rain with fog, water droplets, and moody lighting.

**Use Cases:** Sad moments, contemplative scenes, weather effects, ambient backgrounds

**Duration:** 12 seconds

### Complete Code

```json
{
  "id": "rain-scene",
  "name": "Rain Scene",
  "duration": 12000,
  "layers": [
    {
      "id": "dark-sky",
      "type": "gradient",
      "zIndex": 1,
      "config": {
        "colors": ["#2c3e50", "#34495e", "#7f8c8d"],
        "direction": "to bottom"
      }
    },
    {
      "id": "fog",
      "type": "fog",
      "zIndex": 2,
      "config": {
        "density": 0.4,
        "color": "#95a5a6",
        "speed": 1,
        "direction": "horizontal",
        "opacity": 0.6
      }
    },
    {
      "id": "rain-particles",
      "type": "particles",
      "zIndex": 3,
      "config": {
        "count": 150,
        "size": { "min": 1, "max": 2 },
        "color": "#ecf0f1",
        "opacity": 0.7,
        "speed": { "min": 15, "max": 25 },
        "direction": "down",
        "angle": 10
      }
    },
    {
      "id": "lightning-flash",
      "type": "light",
      "zIndex": 4,
      "config": {
        "mode": "ambient",
        "color": "#ffffff",
        "intensity": 0,
        "blendMode": "screen"
      },
      "animations": [{
        "property": "config.intensity",
        "from": 0,
        "to": 0.8,
        "startMs": 4000,
        "endMs": 4100,
        "easing": "linear"
      }, {
        "property": "config.intensity",
        "from": 0.8,
        "to": 0,
        "startMs": 4100,
        "endMs": 4300,
        "easing": "ease-out"
      }]
    },
    {
      "id": "vignette",
      "type": "vignette",
      "zIndex": 5,
      "config": {
        "intensity": 0.6,
        "radius": 0.7
      }
    }
  ],
  "audio": [{
    "id": "rain-sound",
    "type": "ambience",
    "src": "/assets/audio/rain.mp3",
    "startMs": 0,
    "volume": 0.7,
    "loop": true,
    "fadeIn": 1000
  }, {
    "id": "thunder",
    "type": "sfx",
    "src": "/assets/audio/thunder.mp3",
    "startMs": 4000,
    "volume": 0.5
  }]
}
```

### Customization Tips

**Adjust Rain Intensity:**
```json
"count": 300  // Heavy rain
"count": 50   // Light drizzle
```

**Change Fog Density:**
```json
"density": 0.7  // Thick fog
"density": 0.2  // Light mist
```

---

## 4. Underwater Scene

**Visual Description:** Serene underwater environment with light rays, floating particles, and blue tint.

**Use Cases:** Ocean themes, relaxation content, nature documentaries, aquatic games

**Duration:** 10 seconds

### Complete Code

```json
{
  "id": "underwater",
  "name": "Underwater Scene",
  "duration": 10000,
  "camera": {
    "animations": [{
      "property": "y",
      "from": 0,
      "to": -20,
      "startMs": 0,
      "endMs": 10000,
      "easing": "ease-in-out",
      "yoyo": true
    }]
  },
  "layers": [
    {
      "id": "water-gradient",
      "type": "gradient",
      "zIndex": 1,
      "config": {
        "colors": ["#003973", "#0066cc", "#0099ff"],
        "direction": "to bottom"
      }
    },
    {
      "id": "light-rays",
      "type": "light",
      "zIndex": 2,
      "config": {
        "mode": "spot",
        "position": { "x": 50, "y": 0 },
        "radius": 400,
        "intensity": 0.5,
        "color": "#ffffff",
        "angle": 60,
        "direction": 180,
        "blendMode": "overlay"
      },
      "animations": [{
        "property": "config.position.x",
        "from": 40,
        "to": 60,
        "startMs": 0,
        "endMs": 10000,
        "easing": "ease-in-out",
        "yoyo": true
      }]
    },
    {
      "id": "floating-particles",
      "type": "dust",
      "zIndex": 3,
      "config": {
        "count": 40,
        "size": { "min": 2, "max": 5 },
        "color": "#ffffff",
        "opacity": 0.4,
        "speed": { "min": 0.3, "max": 0.8 },
        "drift": true
      }
    },
    {
      "id": "bubbles",
      "type": "particles",
      "zIndex": 4,
      "config": {
        "count": 20,
        "size": { "min": 3, "max": 8 },
        "color": "#ffffff",
        "opacity": 0.6,
        "speed": { "min": 2, "max": 4 },
        "direction": "up"
      }
    },
    {
      "id": "title",
      "type": "textBlock",
      "zIndex": 5,
      "config": {
        "text": "Beneath the Waves",
        "fontSize": "42px",
        "fontWeight": "300",
        "color": "#ffffff",
        "textAlign": "center",
        "textShadow": "0 0 20px rgba(0,153,255,0.8)",
        "position": { "x": "50%", "y": "50%" }
      },
      "animations": [{
        "property": "opacity",
        "from": 0,
        "to": 1,
        "startMs": 1000,
        "endMs": 3000,
        "easing": "ease-in"
      }]
    }
  ],
  "audio": [{
    "id": "underwater-ambience",
    "type": "ambience",
    "src": "/assets/audio/underwater.mp3",
    "startMs": 0,
    "volume": 0.5,
    "loop": true,
    "fadeIn": 2000
  }]
}
```

### Customization Tips

**Change Water Color:**
```json
"colors": ["#1a535c", "#4ecdc4", "#95e1d3"]  // Tropical water
"colors": ["#0f2027", "#203a43", "#2c5364"]  // Deep ocean
```

**More Bubbles:**
```json
"count": 50  // Lots of bubbles
```

---

## 5. Cosmic Birth Scene

**Visual Description:** Explosive cosmic event with nebula, particles, and dramatic lighting.

**Use Cases:** Sci-fi intros, creation stories, dramatic reveals, space content

**Duration:** 15 seconds

### Complete Code

```json
{
  "id": "cosmic-birth",
  "name": "Cosmic Birth Scene",
  "duration": 15000,
  "camera": {
    "animations": [{
      "property": "zoom",
      "from": 0.5,
      "to": 1.5,
      "startMs": 0,
      "endMs": 15000,
      "easing": "ease-out"
    }]
  },
  "layers": [
    {
      "id": "space-void",
      "type": "gradient",
      "zIndex": 1,
      "config": {
        "colors": ["#000000", "#0a0a0a"],
        "direction": "radial"
      }
    },
    {
      "id": "starfield-bg",
      "type": "starfield",
      "zIndex": 2,
      "config": {
        "count": 300,
        "size": { "min": 1, "max": 2 },
        "twinkle": true,
        "depth": 5
      }
    },
    {
      "id": "nebula-cloud",
      "type": "nebulaNoise",
      "zIndex": 3,
      "config": {
        "colors": ["#e94560", "#533483", "#0f3460", "#ff6b6b"],
        "opacity": 0.6,
        "scale": 3,
        "speed": 1
      },
      "animations": [{
        "property": "config.opacity",
        "from": 0,
        "to": 0.6,
        "startMs": 0,
        "endMs": 5000,
        "easing": "ease-out"
      }]
    },
    {
      "id": "explosion-center",
      "type": "light",
      "zIndex": 4,
      "config": {
        "mode": "radial",
        "position": { "x": 50, "y": 50 },
        "radius": 0,
        "intensity": 1,
        "color": "#ffffff",
        "blendMode": "screen"
      },
      "animations": [{
        "property": "config.radius",
        "from": 0,
        "to": 500,
        "startMs": 2000,
        "endMs": 8000,
        "easing": "ease-out"
      }, {
        "property": "config.intensity",
        "from": 1,
        "to": 0.3,
        "startMs": 2000,
        "endMs": 10000,
        "easing": "ease-out"
      }]
    },
    {
      "id": "explosion-particles",
      "type": "particles",
      "zIndex": 5,
      "config": {
        "count": 200,
        "size": { "min": 2, "max": 6 },
        "color": "#ff6b6b",
        "opacity": 0.8,
        "speed": { "min": 5, "max": 15 },
        "direction": "radial",
        "origin": { "x": 50, "y": 50 }
      },
      "animations": [{
        "property": "config.opacity",
        "from": 0.8,
        "to": 0,
        "startMs": 2000,
        "endMs": 12000,
        "easing": "ease-out"
      }]
    }
  ]
}
```

### Customization Tips

**Change Nebula Colors:**
```json
"colors": ["#00d2ff", "#3a7bd5", "#00d2ff"]  // Blue nebula
"colors": ["#f2994a", "#f2c94c", "#eb5757"]  // Fire nebula
```

**Adjust Explosion Speed:**
```json
"endMs": 5000  // Fast explosion
"endMs": 15000 // Slow expansion
```

---

## 6. Divine Aura Scene

**Visual Description:** Ethereal, heavenly scene with soft glows, gentle particles, and warm light.

**Use Cases:** Spiritual content, peaceful transitions, achievement moments, healing themes

**Duration:** 8 seconds

### Complete Code

```json
{
  "id": "divine-aura",
  "name": "Divine Aura Scene",
  "duration": 8000,
  "layers": [
    {
      "id": "heavenly-gradient",
      "type": "gradient",
      "zIndex": 1,
      "config": {
        "colors": ["#ffeaa7", "#fdcb6e", "#ffffff"],
        "direction": "radial"
      }
    },
    {
      "id": "central-glow",
      "type": "glowOrb",
      "zIndex": 2,
      "config": {
        "position": { "x": 50, "y": 50 },
        "radius": 200,
        "intensity": 0.9,
        "color": "#ffffff",
        "blur": 40
      },
      "animations": [{
        "property": "config.radius",
        "from": 150,
        "to": 250,
        "startMs": 0,
        "endMs": 8000,
        "easing": "ease-in-out",
        "yoyo": true
      }]
    },
    {
      "id": "aura-light",
      "type": "light",
      "zIndex": 3,
      "config": {
        "mode": "radial",
        "position": { "x": 50, "y": 50 },
        "radius": 400,
        "intensity": 0.7,
        "color": "#ffd93d",
        "blendMode": "screen"
      }
    },
    {
      "id": "soft-particles",
      "type": "particles",
      "zIndex": 4,
      "config": {
        "count": 30,
        "size": { "min": 3, "max": 6 },
        "color": "#ffffff",
        "opacity": 0.6,
        "speed": { "min": 0.5, "max": 1.5 },
        "direction": "up",
        "glow": true
      }
    },
    {
      "id": "title",
      "type": "textBlock",
      "zIndex": 5,
      "config": {
        "text": "Enlightenment",
        "fontSize": "56px",
        "fontWeight": "200",
        "color": "#ffffff",
        "textAlign": "center",
        "textShadow": "0 0 30px rgba(255,217,61,0.8)",
        "position": { "x": "50%", "y": "50%" }
      },
      "animations": [{
        "property": "opacity",
        "from": 0,
        "to": 1,
        "startMs": 1000,
        "endMs": 3000,
        "easing": "ease-in"
      }]
    }
  ],
  "audio": [{
    "id": "ethereal-sound",
    "type": "ambience",
    "src": "/assets/audio/ethereal.mp3",
    "startMs": 0,
    "volume": 0.4,
    "fadeIn": 2000,
    "fadeOut": 2000
  }]
}
```

### Customization Tips

**Change Aura Color:**
```json
"color": "#a8e6cf"  // Green aura
"color": "#dda0dd"  // Purple aura
```

**More Particles:**
```json
"count": 60  // More ethereal
```

---

## 7. Foggy Forest Scene

**Visual Description:** Mysterious forest with dense fog, subtle lighting, and atmospheric depth.

**Use Cases:** Mystery themes, horror content, nature scenes, atmospheric backgrounds

**Duration:** 12 seconds

### Complete Code

```json
{
  "id": "foggy-forest",
  "name": "Foggy Forest Scene",
  "duration": 12000,
  "camera": {
    "animations": [{
      "property": "x",
      "from": -10,
      "to": 10,
      "startMs": 0,
      "endMs": 12000,
      "easing": "ease-in-out"
    }]
  },
  "layers": [
    {
      "id": "forest-bg",
      "type": "gradient",
      "zIndex": 1,
      "config": {
        "colors": ["#1e3a20", "#2d5016", "#3d6b1f"],
        "direction": "to bottom"
      }
    },
    {
      "id": "dense-fog",
      "type": "fog",
      "zIndex": 2,
      "config": {
        "density": 0.7,
        "color": "#b8c6db",
        "speed": 0.5,
        "direction": "horizontal",
        "opacity": 0.8
      }
    },
    {
      "id": "fog-layer-2",
      "type": "fog",
      "zIndex": 3,
      "config": {
        "density": 0.5,
        "color": "#f5f7fa",
        "speed": 0.3,
        "direction": "horizontal",
        "opacity": 0.6
      }
    },
    {
      "id": "moonlight",
      "type": "light",
      "zIndex": 4,
      "config": {
        "mode": "spot",
        "position": { "x": 70, "y": 10 },
        "radius": 300,
        "intensity": 0.4,
        "color": "#e8e8e8",
        "angle": 45,
        "direction": 180,
        "blendMode": "overlay"
      }
    },
    {
      "id": "dust-particles",
      "type": "dust",
      "zIndex": 5,
      "config": {
        "count": 50,
        "size": { "min": 1, "max": 3 },
        "color": "#ffffff",
        "opacity": 0.3,
        "speed": { "min": 0.2, "max": 0.6 },
        "drift": true
      }
    },
    {
      "id": "vignette",
      "type": "vignette",
      "zIndex": 6,
      "config": {
        "intensity": 0.8,
        "radius": 0.6
      }
    }
  ],
  "audio": [{
    "id": "forest-ambience",
    "type": "ambience",
    "src": "/assets/audio/forest-night.mp3",
    "startMs": 0,
    "volume": 0.5,
    "loop": true,
    "fadeIn": 2000
  }]
}
```

### Customization Tips

**Adjust Fog Density:**
```json
"density": 0.9  // Very thick fog
"density": 0.3  // Light mist
```

**Change Forest Colors:**
```json
"colors": ["#2c3e50", "#34495e", "#7f8c8d"]  // Dark forest
"colors": ["#27ae60", "#2ecc71", "#52be80"]  // Bright forest
```

---

## 8. Neon City Scene

**Visual Description:** Futuristic cyberpunk cityscape with neon lights, rain, and urban atmosphere.

**Use Cases:** Cyberpunk themes, futuristic content, urban scenes, tech presentations

**Duration:** 10 seconds

### Complete Code

```json
{
  "id": "neon-city",
  "name": "Neon City Scene",
  "duration": 10000,
  "layers": [
    {
      "id": "city-gradient",
      "type": "gradient",
      "zIndex": 1,
      "config": {
        "colors": ["#0a0a0a", "#1a1a2e", "#16213e"],
        "direction": "to bottom"
      }
    },
    {
      "id": "neon-glow-1",
      "type": "glowOrb",
      "zIndex": 2,
      "config": {
        "position": { "x": 20, "y": 40 },
        "radius": 100,
        "intensity": 0.8,
        "color": "#ff006e",
        "blur": 30
      },
      "animations": [{
        "property": "config.intensity",
        "from": 0.6,
        "to": 1,
        "startMs": 0,
        "endMs": 2000,
        "easing": "ease-in-out",
        "loop": true,
        "yoyo": true
      }]
    },
    {
      "id": "neon-glow-2",
      "type": "glowOrb",
      "zIndex": 2,
      "config": {
        "position": { "x": 80, "y": 60 },
        "radius": 120,
        "intensity": 0.7,
        "color": "#00f5ff",
        "blur": 35
      },
      "animations": [{
        "property": "config.intensity",
        "from": 0.5,
        "to": 0.9,
        "startMs": 500,
        "endMs": 2500,
        "easing": "ease-in-out",
        "loop": true,
        "yoyo": true
      }]
    },
    {
      "id": "rain",
      "type": "particles",
      "zIndex": 3,
      "config": {
        "count": 100,
        "size": { "min": 1, "max": 2 },
        "color": "#ffffff",
        "opacity": 0.5,
        "speed": { "min": 20, "max": 30 },
        "direction": "down",
        "angle": 5
      }
    },
    {
      "id": "noise-overlay",
      "type": "noiseOverlay",
      "zIndex": 4,
      "config": {
        "intensity": 0.15,
        "scale": 1,
        "animated": true
      }
    },
    {
      "id": "title",
      "type": "textBlock",
      "zIndex": 5,
      "config": {
        "text": "NEON NIGHTS",
        "fontSize": "64px",
        "fontWeight": "900",
        "color": "#00f5ff",
        "textAlign": "center",
        "textShadow": "0 0 20px #00f5ff, 0 0 40px #ff006e",
        "position": { "x": "50%", "y": "50%" },
        "letterSpacing": "8px"
      },
      "animations": [{
        "property": "opacity",
        "from": 0,
        "to": 1,
        "startMs": 1000,
        "endMs": 2000,
        "easing": "ease-in"
      }]
    }
  ],
  "audio": [{
    "id": "city-ambience",
    "type": "ambience",
    "src": "/assets/audio/city-night.mp3",
    "startMs": 0,
    "volume": 0.6,
    "loop": true
  }]
}
```

### Customization Tips

**Change Neon Colors:**
```json
"color": "#39ff14"  // Neon green
"color": "#ff10f0"  // Neon pink
```

**More Rain:**
```json
"count": 200  // Heavy rain
```

---

## 9. Desert Sunset Scene

**Visual Description:** Warm desert landscape with golden hour lighting and heat haze effect.

**Use Cases:** Travel content, western themes, peaceful transitions, nature documentaries

**Duration:** 10 seconds

### Complete Code

```json
{
  "id": "desert-sunset",
  "name": "Desert Sunset Scene",
  "duration": 10000,
  "layers": [
    {
      "id": "desert-sky",
      "type": "gradient",
      "zIndex": 1,
      "config": {
        "colors": ["#ff6b6b", "#feca57", "#ff9ff3", "#54a0ff"],
        "direction": "to bottom"
      }
    },
    {
      "id": "sun",
      "type": "light",
      "zIndex": 2,
      "config": {
        "mode": "radial",
        "position": { "x": 50, "y": 60 },
        "radius": 250,
        "intensity": 0.9,
        "color": "#ff6348",
        "blendMode": "screen"
      }
    },
    {
      "id": "heat-haze",
      "type": "fog",
      "zIndex": 3,
      "config": {
        "density": 0.3,
        "color": "#feca57",
        "speed": 2,
        "direction": "vertical",
        "opacity": 0.4
      }
    },
    {
      "id": "sand-particles",
      "type": "dust",
      "zIndex": 4,
      "config": {
        "count": 30,
        "size": { "min": 2, "max": 4 },
        "color": "#f39c12",
        "opacity": 0.5,
        "speed": { "min": 1, "max": 3 },
        "drift": true
      }
    },
    {
      "id": "title",
      "type": "textBlock",
      "zIndex": 5,
      "config": {
        "text": "Golden Hour",
        "fontSize": "52px",
        "fontWeight": "300",
        "color": "#ffffff",
        "textAlign": "center",
        "textShadow": "0 2px 20px rgba(255,99,72,0.6)",
        "position": { "x": "50%", "y": "40%" }
      },
      "animations": [{
        "property": "opacity",
        "from": 0,
        "to": 1,
        "startMs": 2000,
        "endMs": 4000,
        "easing": "ease-in"
      }]
    }
  ],
  "audio": [{
    "id": "desert-wind",
    "type": "ambience",
    "src": "/assets/audio/desert-wind.mp3",
    "startMs": 0,
    "volume": 0.5,
    "loop": true,
    "fadeIn": 2000
  }]
}
```

---

## 10. Northern Lights Scene

**Visual Description:** Mesmerizing aurora borealis with flowing colors and starry sky.

**Use Cases:** Nature content, magical moments, winter themes, atmospheric backgrounds

**Duration:** 15 seconds

### Complete Code

```json
{
  "id": "northern-lights",
  "name": "Northern Lights Scene",
  "duration": 15000,
  "layers": [
    {
      "id": "night-sky",
      "type": "gradient",
      "zIndex": 1,
      "config": {
        "colors": ["#0a0a0a", "#1a1a2e", "#0f3460"],
        "direction": "to bottom"
      }
    },
    {
      "id": "stars",
      "type": "starfield",
      "zIndex": 2,
      "config": {
        "count": 150,
        "size": { "min": 1, "max": 2 },
        "twinkle": true,
        "depth": 2
      }
    },
    {
      "id": "aurora-1",
      "type": "nebulaNoise",
      "zIndex": 3,
      "config": {
        "colors": ["#00ff88", "#00d4aa", "#00b8cc"],
        "opacity": 0.6,
        "scale": 4,
        "speed": 0.5
      },
      "animations": [{
        "property": "config.opacity",
        "from": 0.4,
        "to": 0.8,
        "startMs": 0,
        "endMs": 5000,
        "easing": "ease-in-out",
        "loop": true,
        "yoyo": true
      }]
    },
    {
      "id": "aurora-2",
      "type": "nebulaNoise",
      "zIndex": 4,
      "config": {
        "colors": ["#a8e6cf", "#dcedc1", "#ffd3b6"],
        "opacity": 0.4,
        "scale": 3,
        "speed": 0.7
      },
      "animations": [{
        "property": "config.opacity",
        "from": 0.3,
        "to": 0.6,
        "startMs": 1000,
        "endMs": 6000,
        "easing": "ease-in-out",
        "loop": true,
        "yoyo": true
      }]
    },
    {
      "id": "glow-effect",
      "type": "light",
      "zIndex": 5,
      "config": {
        "mode": "ambient",
        "color": "#00ff88",
        "intensity": 0.3,
        "blendMode": "screen"
      }
    }
  ]
}
```

---

## 11. Volcanic Eruption Scene

**Visual Description:** Dramatic volcanic eruption with fire, smoke, and intense lighting.

**Use Cases:** Action sequences, dramatic reveals, disaster themes, intense moments

**Duration:** 12 seconds

### Complete Code

```json
{
  "id": "volcanic-eruption",
  "name": "Volcanic Eruption Scene",
  "duration": 12000,
  "camera": {
    "animations": [{
      "property": "zoom",
      "from": 1.0,
      "to": 1.3,
      "startMs": 0,
      "endMs": 12000,
      "easing": "ease-in"
    }]
  },
  "layers": [
    {
      "id": "dark-sky",
      "type": "gradient",
      "zIndex": 1,
      "config": {
        "colors": ["#1a1a1a", "#2d2d2d", "#4a4a4a"],
        "direction": "to bottom"
      }
    },
    {
      "id": "lava-glow",
      "type": "light",
      "zIndex": 2,
      "config": {
        "mode": "radial",
        "position": { "x": 50, "y": 80 },
        "radius": 400,
        "intensity": 0.9,
        "color": "#ff4500",
        "blendMode": "screen"
      },
      "animations": [{
        "property": "config.intensity",
        "from": 0.7,
        "to": 1,
        "startMs": 0,
        "endMs": 1000,
        "easing": "ease-in-out",
        "loop": true,
        "yoyo": true
      }]
    },
    {
      "id": "smoke",
      "type": "fog",
      "zIndex": 3,
      "config": {
        "density": 0.6,
        "color": "#3d3d3d",
        "speed": 2,
        "direction": "up",
        "opacity": 0.7
      }
    },
    {
      "id": "fire-particles",
      "type": "particles",
      "zIndex": 4,
      "config": {
        "count": 150,
        "size": { "min": 3, "max": 8 },
        "color": "#ff6348",
        "opacity": 0.9,
        "speed": { "min": 10, "max": 20 },
        "direction": "up",
        "spread": 30,
        "glow": true
      }
    },
    {
      "id": "ash-particles",
      "type": "particles",
      "zIndex": 5,
      "config": {
        "count": 100,
        "size": { "min": 1, "max": 3 },
        "color": "#7f8c8d",
        "opacity": 0.6,
        "speed": { "min": 2, "max": 5 },
        "direction": "down",
        "drift": true
      }
    }
  ],
  "audio": [{
    "id": "eruption-sound",
    "type": "sfx",
    "src": "/assets/audio/volcano.mp3",
    "startMs": 0,
    "volume": 0.8
  }]
}
```

---

## 12. Snow Storm Scene

**Visual Description:** Intense winter storm with heavy snowfall and wind effects.

**Use Cases:** Winter themes, dramatic weather, survival content, atmospheric backgrounds

**Duration:** 10 seconds

### Complete Code

```json
{
  "id": "snow-storm",
  "name": "Snow Storm Scene",
  "duration": 10000,
  "camera": {
    "animations": [{
      "property": "x",
      "from": -5,
      "to": 5,
        "startMs": 0,
      "endMs": 2000,
      "easing": "ease-in-out",
      "loop": true,
      "yoyo": true
    }]
  },
  "layers": [
    {
      "id": "winter-sky",
      "type": "gradient",
      "zIndex": 1,
      "config": {
        "colors": ["#bdc3c7", "#ecf0f1", "#ffffff"],
        "direction": "to bottom"
      }
    },
    {
      "id": "blizzard-fog",
      "type": "fog",
      "zIndex": 2,
      "config": {
        "density": 0.5,
        "color": "#ecf0f1",
        "speed": 3,
        "direction": "horizontal",
        "opacity": 0.7
      }
    },
    {
      "id": "heavy-snow",
      "type": "particles",
      "zIndex": 3,
      "config": {
        "count": 200,
        "size": { "min": 2, "max": 5 },
        "color": "#ffffff",
        "opacity": 0.8,
        "speed": { "min": 8, "max": 15 },
        "direction": "down",
        "angle": 20,
        "drift": true
      }
    },
    {
      "id": "wind-snow",
      "type": "particles",
      "zIndex": 4,
      "config": {
        "count": 100,
        "size": { "min": 1, "max": 3 },
        "color": "#ffffff",
        "opacity": 0.6,
        "speed": { "min": 15, "max": 25 },
        "direction": "diagonal",
        "angle": 45
      }
    },
    {
      "id": "vignette",
      "type": "vignette",
      "zIndex": 5,
      "config": {
        "intensity": 0.4,
        "radius": 0.8
      }
    }
  ],
  "audio": [{
    "id": "wind-howl",
    "type": "ambience",
    "src": "/assets/audio/blizzard.mp3",
    "startMs": 0,
    "volume": 0.7,
    "loop": true
  }]
}
```

---

## 13. Ocean Waves Scene

**Visual Description:** Peaceful ocean scene with rolling waves, seagulls, and coastal atmosphere.

**Use Cases:** Relaxation content, beach themes, travel videos, meditation apps

**Duration:** 12 seconds

### Complete Code

```json
{
  "id": "ocean-waves",
  "name": "Ocean Waves Scene",
  "duration": 12000,
  "camera": {
    "animations": [{
      "property": "y",
      "from": 0,
      "to": -10,
      "startMs": 0,
      "endMs": 3000,
      "easing": "ease-in-out",
      "loop": true,
      "yoyo": true
    }]
  },
  "layers": [
    {
      "id": "ocean-gradient",
      "type": "gradient",
      "zIndex": 1,
      "config": {
        "colors": ["#48c6ef", "#6f86d6", "#a8edea"],
        "direction": "to bottom"
      }
    },
    {
      "id": "sun-reflection",
      "type": "light",
      "zIndex": 2,
      "config": {
        "mode": "radial",
        "position": { "x": 50, "y": 30 },
        "radius": 200,
        "intensity": 0.6,
        "color": "#ffffff",
        "blendMode": "overlay"
      },
      "animations": [{
        "property": "config.intensity",
        "from": 0.5,
        "to": 0.7,
        "startMs": 0,
        "endMs": 2000,
        "easing": "ease-in-out",
        "loop": true,
        "yoyo": true
      }]
    },
    {
      "id": "sea-spray",
      "type": "particles",
      "zIndex": 3,
      "config": {
        "count": 40,
        "size": { "min": 2, "max": 4 },
        "color": "#ffffff",
        "opacity": 0.5,
        "speed": { "min": 1, "max": 3 },
        "direction": "up",
        "spread": 20
      }
    },
    {
      "id": "foam-particles",
      "type": "dust",
      "zIndex": 4,
      "config": {
        "count": 30,
        "size": { "min": 3, "max": 6 },
        "color": "#ffffff",
        "opacity": 0.7,
        "speed": { "min": 0.5, "max": 1.5 },
        "drift": true
      }
    },
    {
      "id": "title",
      "type": "textBlock",
      "zIndex": 5,
      "config": {
        "text": "Endless Horizon",
        "fontSize": "48px",
        "fontWeight": "300",
        "color": "#ffffff",
        "textAlign": "center",
        "textShadow": "0 2px 15px rgba(72,198,239,0.6)",
        "position": { "x": "50%", "y": "50%" }
      },
      "animations": [{
        "property": "opacity",
        "from": 0,
        "to": 1,
        "startMs": 1000,
        "endMs": 3000,
        "easing": "ease-in"
      }]
    }
  ],
  "audio": [{
    "id": "ocean-waves-sound",
    "type": "ambience",
    "src": "/assets/audio/ocean-waves.mp3",
    "startMs": 0,
    "volume": 0.6,
    "loop": true,
    "fadeIn": 2000
  }]
}
```

---

## 14. Space Station Scene

**Visual Description:** Futuristic space station interior with holographic displays and tech ambience.

**Use Cases:** Sci-fi content, tech presentations, futuristic themes, game interfaces

**Duration:** 10 seconds

### Complete Code

```json
{
  "id": "space-station",
  "name": "Space Station Scene",
  "duration": 10000,
  "layers": [
    {
      "id": "station-bg",
      "type": "gradient",
      "zIndex": 1,
      "config": {
        "colors": ["#0f2027", "#203a43", "#2c5364"],
        "direction": "to bottom"
      }
    },
    {
      "id": "hologram-glow-1",
      "type": "glowOrb",
      "zIndex": 2,
      "config": {
        "position": { "x": 25, "y": 30 },
        "radius": 80,
        "intensity": 0.7,
        "color": "#00d4ff",
        "blur": 25
      },
      "animations": [{
        "property": "config.intensity",
        "from": 0.5,
        "to": 0.9,
        "startMs": 0,
        "endMs": 1500,
        "easing": "ease-in-out",
        "loop": true,
        "yoyo": true
      }]
    },
    {
      "id": "hologram-glow-2",
      "type": "glowOrb",
      "zIndex": 2,
      "config": {
        "position": { "x": 75, "y": 70 },
        "radius": 90,
        "intensity": 0.6,
        "color": "#00ff88",
        "blur": 30
      },
      "animations": [{
        "property": "config.intensity",
        "from": 0.4,
        "to": 0.8,
        "startMs": 500,
        "endMs": 2000,
        "easing": "ease-in-out",
        "loop": true,
        "yoyo": true
      }]
    },
    {
      "id": "data-particles",
      "type": "particles",
      "zIndex": 3,
      "config": {
        "count": 60,
        "size": { "min": 1, "max": 2 },
        "color": "#00d4ff",
        "opacity": 0.7,
        "speed": { "min": 2, "max": 5 },
        "direction": "up",
        "glow": true
      }
    },
    {
      "id": "scan-lines",
      "type": "noiseOverlay",
      "zIndex": 4,
      "config": {
        "intensity": 0.1,
        "scale": 0.5,
        "animated": true
      }
    },
    {
      "id": "title",
      "type": "textBlock",
      "zIndex": 5,
      "config": {
        "text": "STATION ALPHA",
        "fontSize": "56px",
        "fontWeight": "700",
        "color": "#00d4ff",
        "textAlign": "center",
        "textShadow": "0 0 20px #00d4ff",
        "position": { "x": "50%", "y": "50%" },
        "fontFamily": "monospace",
        "letterSpacing": "4px"
      },
      "animations": [{
        "property": "opacity",
        "from": 0,
        "to": 1,
        "startMs": 1000,
        "endMs": 2000,
        "easing": "ease-in"
      }]
    }
  ],
  "audio": [{
    "id": "tech-hum",
    "type": "ambience",
    "src": "/assets/audio/tech-ambience.mp3",
    "startMs": 0,
    "volume": 0.4,
    "loop": true
  }]
}
```

---

## 15. Enchanted Garden Scene

**Visual Description:** Magical garden with glowing fireflies, soft lighting, and mystical atmosphere.

**Use Cases:** Fantasy content, magical moments, fairy tales, peaceful transitions

**Duration:** 12 seconds

### Complete Code

```json
{
  "id": "enchanted-garden",
  "name": "Enchanted Garden Scene",
  "duration": 12000,
  "layers": [
    {
      "id": "garden-gradient",
      "type": "gradient",
      "zIndex": 1,
      "config": {
        "colors": ["#1e3a20", "#2d5016", "#4a7c59"],
        "direction": "to bottom"
      }
    },
    {
      "id": "moonlight",
      "type": "light",
      "zIndex": 2,
      "config": {
        "mode": "radial",
        "position": { "x": 70, "y": 20 },
        "radius": 300,
        "intensity": 0.5,
        "color": "#e8e8e8",
        "blendMode": "overlay"
      }
    },
    {
      "id": "firefly-1",
      "type": "glowOrb",
      "zIndex": 3,
      "config": {
        "position": { "x": 30, "y": 40 },
        "radius": 20,
        "intensity": 0.9,
        "color": "#ffeb3b",
        "blur": 15
      },
      "animations": [{
        "property": "config.position.x",
        "from": 30,
        "to": 40,
        "startMs": 0,
        "endMs": 3000,
        "easing": "ease-in-out",
        "loop": true,
        "yoyo": true
      }, {
        "property": "config.position.y",
        "from": 40,
        "to": 50,
        "startMs": 0,
        "endMs": 4000,
        "easing": "ease-in-out",
        "loop": true,
        "yoyo": true
      }]
    },
    {
      "id": "firefly-2",
      "type": "glowOrb",
      "zIndex": 3,
      "config": {
        "position": { "x": 60, "y": 60 },
        "radius": 18,
        "intensity": 0.8,
        "color": "#ffeb3b",
        "blur": 12
      },
      "animations": [{
        "property": "config.position.x",
        "from": 60,
        "to": 70,
        "startMs": 500,
        "endMs": 3500,
        "easing": "ease-in-out",
        "loop": true,
        "yoyo": true
      }, {
        "property": "config.position.y",
        "from": 60,
        "to": 50,
        "startMs": 500,
        "endMs": 4500,
        "easing": "ease-in-out",
        "loop": true,
        "yoyo": true
      }]
    },
    {
      "id": "firefly-3",
      "type": "glowOrb",
      "zIndex": 3,
      "config": {
        "position": { "x": 80, "y": 70 },
        "radius": 22,
        "intensity": 0.85,
        "color": "#ffeb3b",
        "blur": 18
      },
      "animations": [{
        "property": "config.position.x",
        "from": 80,
        "to": 75,
        "startMs": 1000,
        "endMs": 4000,
        "easing": "ease-in-out",
        "loop": true,
        "yoyo": true
      }, {
        "property": "config.position.y",
        "from": 70,
        "to": 60,
        "startMs": 1000,
        "endMs": 5000,
        "easing": "ease-in-out",
        "loop": true,
        "yoyo": true
      }]
    },
    {
      "id": "magic-particles",
      "type": "particles",
      "zIndex": 4,
      "config": {
        "count": 40,
        "size": { "min": 2, "max": 4 },
        "color": "#a8e6cf",
        "opacity": 0.6,
        "speed": { "min": 0.5, "max": 1.5 },
        "direction": "up",
        "glow": true
      }
    },
    {
      "id": "title",
      "type": "textBlock",
      "zIndex": 5,
      "config": {
        "text": "Enchanted Garden",
        "fontSize": "50px",
        "fontWeight": "300",
        "color": "#ffffff",
        "textAlign": "center",
        "textShadow": "0 0 25px rgba(255,235,59,0.6)",
        "position": { "x": "50%", "y": "50%" }
      },
      "animations": [{
        "property": "opacity",
        "from": 0,
        "to": 1,
        "startMs": 2000,
        "endMs": 4000,
        "easing": "ease-in"
      }]
    }
  ],
  "audio": [{
    "id": "night-crickets",
    "type": "ambience",
    "src": "/assets/audio/night-garden.mp3",
    "startMs": 0,
    "volume": 0.5,
    "loop": true,
    "fadeIn": 2000
  }]
}
```

---

## Common Patterns and Tips

### Pattern 1: Layered Atmosphere

Create depth by stacking multiple fog/particle layers:

```json
{
  "layers": [
    { "type": "fog", "zIndex": 2, "config": { "density": 0.7, "speed": 0.5 } },
    { "type": "fog", "zIndex": 3, "config": { "density": 0.4, "speed": 0.8 } },
    { "type": "particles", "zIndex": 4, "config": { "count": 50 } }
  ]
}
```

### Pattern 2: Pulsing Lights

Create breathing/pulsing light effects:

```json
{
  "animations": [{
    "property": "config.intensity",
    "from": 0.5,
    "to": 1.0,
    "startMs": 0,
    "endMs": 2000,
    "easing": "ease-in-out",
    "loop": true,
    "yoyo": true
  }]
}
```

### Pattern 3: Camera Movement

Add subtle camera motion for dynamic feel:

```json
{
  "camera": {
    "animations": [{
      "property": "x",
      "from": -10,
      "to": 10,
      "startMs": 0,
      "endMs": 10000,
      "easing": "ease-in-out",
      "yoyo": true
    }]
  }
}
```

### Pattern 4: Text Fade In/Out

Standard text animation pattern:

```json
{
  "animations": [
    {
      "property": "opacity",
      "from": 0,
      "to": 1,
      "startMs": 1000,
      "endMs": 2000,
      "easing": "ease-in"
    },
    {
      "property": "opacity",
      "from": 1,
      "to": 0,
      "startMs": 8000,
      "endMs": 9000,
      "easing": "ease-out"
    }
  ]
}
```

### Pattern 5: Multi-Color Gradients

Create rich color transitions:

```json
{
  "config": {
    "colors": [
      "#color1",  // Bottom/start
      "#color2",  // Middle
      "#color3",  // Top/end
    ],
    "direction": "to bottom"
  }
}
```

## Performance Tips

1. **Limit Particle Counts:** Keep particle counts under 200 for smooth performance
2. **Use Appropriate Layer Types:** DOM layers for simple effects, Canvas for complex animations
3. **Optimize Audio:** Use compressed audio formats (MP3, OGG)
4. **Reuse Assets:** Define assets once and reference them multiple times
5. **Test on Target Devices:** Always test on the lowest-spec device you're targeting

## Combining Scenes

Create complete cinematic experiences by combining scenes with transitions:

```json
{
  "events": [{
    "id": "nature-journey",
    "name": "Nature Journey",
    "scenes": ["sunrise", "ocean-waves", "starry-night"]
  }],
  "transitions": [
    {
      "fromScene": "sunrise",
      "toScene": "ocean-waves",
      "type": "crossfade",
      "duration": 1000
    },
    {
      "fromScene": "ocean-waves",
      "toScene": "starry-night",
      "type": "fade",
      "duration": 1500
    }
  ]
}
```

---

**Need more examples?** Check out the [playground examples](../playground/examples/) for interactive demonstrations of these scenes.

**Want to create custom scenes?** See the [API Documentation](./API.md) for complete layer type and configuration references.
