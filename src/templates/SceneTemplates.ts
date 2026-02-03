/**
 * Scene Templates
 * 
 * Pre-built scene templates for common cinematic effects.
 * Each template can be customized with colors, timing, and effects.
 */

import type { CinematicScene } from '../types/CinematicSpec';

export interface TemplateCustomization {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  timing?: {
    duration?: number;
    fadeInDuration?: number;
    fadeOutDuration?: number;
  };
  effects?: {
    particleCount?: number;
    intensity?: number;
    speed?: number;
  };
}

/**
 * Sunrise Scene Template
 * 
 * A warm, peaceful sunrise scene with gradient background,
 * atmospheric particles, and optional morning ambience audio.
 * 
 * Features:
 * - Warm gradient (orange to yellow to light blue)
 * - Soft particle effects for atmosphere
 * - Optional audio track with morning ambience
 * - Smooth fade in/out
 */
export function createSunriseScene(
  customization: TemplateCustomization = {}
): CinematicScene {
  const {
    colors = {
      primary: '#FF6B35',    // Warm orange
      secondary: '#FFD23F',  // Golden yellow
      accent: '#87CEEB'      // Light blue
    },
    timing = {
      duration: 8000,
      fadeInDuration: 2000,
      fadeOutDuration: 2000
    },
    effects = {
      particleCount: 50,
      intensity: 0.3,
      speed: 0.5
    }
  } = customization;

  return {
    id: 'sunrise-scene',
    name: 'Sunrise',
    duration: timing.duration!,
    layers: [
      // Background gradient
      {
        id: 'sunrise-gradient',
        type: 'gradient',
        zIndex: 0,
        config: {
          type: 'linear',
          angle: 180, // Top to bottom
          stops: [
            { offset: 0, color: colors.accent! },      // Sky blue at top
            { offset: 0.4, color: colors.secondary! }, // Golden yellow
            { offset: 1, color: colors.primary! }      // Warm orange at bottom
          ]
        },
        animations: [
          // Fade in
          {
            property: 'opacity',
            from: 0,
            to: 1,
            startMs: 0,
            endMs: timing.fadeInDuration!,
            easing: 'ease-in-out'
          },
          // Fade out
          {
            property: 'opacity',
            from: 1,
            to: 0,
            startMs: timing.duration! - timing.fadeOutDuration!,
            endMs: timing.duration!,
            easing: 'ease-in-out'
          }
        ]
      },
      // Atmospheric particles
      {
        id: 'sunrise-particles',
        type: 'particles',
        zIndex: 1,
        config: {
          count: effects.particleCount!,
          size: { min: 2, max: 6 },
          color: colors.secondary!,
          opacity: effects.intensity!,
          speed: effects.speed!,
          direction: 90, // Upward
          spread: 30,
          lifetime: 5000
        },
        animations: [
          // Fade in particles
          {
            property: 'opacity',
            from: 0,
            to: effects.intensity!,
            startMs: timing.fadeInDuration! * 0.5,
            endMs: timing.fadeInDuration! * 1.5,
            easing: 'ease-in'
          },
          // Fade out particles
          {
            property: 'opacity',
            from: effects.intensity!,
            to: 0,
            startMs: timing.duration! - timing.fadeOutDuration!,
            endMs: timing.duration!,
            easing: 'ease-out'
          }
        ]
      },
      // Light layer for sun glow
      {
        id: 'sunrise-glow',
        type: 'light',
        zIndex: 2,
        config: {
          mode: 'radial',
          position: { x: 50, y: 70 }, // Bottom center
          radius: 40,
          intensity: 0.6,
          color: colors.secondary!,
          blendMode: 'screen'
        },
        animations: [
          // Grow sun glow
          {
            property: 'radius',
            from: 20,
            to: 40,
            startMs: 0,
            endMs: timing.duration! * 0.6,
            easing: 'ease-out'
          },
          // Fade in glow
          {
            property: 'intensity',
            from: 0,
            to: 0.6,
            startMs: 0,
            endMs: timing.fadeInDuration!,
            easing: 'ease-in'
          },
          // Fade out glow
          {
            property: 'intensity',
            from: 0.6,
            to: 0,
            startMs: timing.duration! - timing.fadeOutDuration!,
            endMs: timing.duration!,
            easing: 'ease-out'
          }
        ]
      }
    ],
    audio: [
      // Optional morning ambience
      // Users can provide their own audio file
      // {
      //   id: 'morning-ambience',
      //   src: 'assets/audio/morning-ambience.mp3',
      //   loop: false,
      //   volume: 0.5,
      //   fadeIn: timing.fadeInDuration,
      //   fadeOut: timing.fadeOutDuration
      // }
    ]
  };
}

/**
 * Cosmic Birth Scene Template
 * 
 * A dramatic cosmic scene with starfield background,
 * nebula effects, and particle explosions.
 * 
 * Features:
 * - Dark starfield background
 * - Nebula noise effects
 * - Explosive particle bursts
 * - Dramatic lighting
 */
export function createCosmicBirthScene(
  customization: TemplateCustomization = {}
): CinematicScene {
  const {
    colors = {
      primary: '#1a0033',    // Deep purple
      secondary: '#ff00ff',  // Magenta
      accent: '#00ffff'      // Cyan
    },
    timing = {
      duration: 10000,
      fadeInDuration: 1000,
      fadeOutDuration: 2000
    },
    effects = {
      particleCount: 200,
      intensity: 0.8,
      speed: 2.0
    }
  } = customization;

  return {
    id: 'cosmic-birth-scene',
    name: 'Cosmic Birth',
    duration: timing.duration!,
    layers: [
      // Dark space background
      {
        id: 'space-background',
        type: 'gradient',
        zIndex: 0,
        config: {
          type: 'radial',
          stops: [
            { offset: 0, color: colors.primary! },
            { offset: 1, color: '#000000' }
          ]
        }
      },
      // Starfield particles
      {
        id: 'starfield',
        type: 'particles',
        zIndex: 1,
        config: {
          count: 100,
          size: { min: 1, max: 3 },
          color: '#ffffff',
          opacity: 0.6,
          speed: 0.1,
          direction: 0,
          spread: 360,
          lifetime: timing.duration!
        }
      },
      // Nebula noise overlay
      {
        id: 'nebula',
        type: 'noiseOverlay',
        zIndex: 2,
        config: {
          intensity: 0.3,
          scale: 2,
          animated: true
        },
        animations: [
          {
            property: 'opacity',
            from: 0,
            to: 0.5,
            startMs: 0,
            endMs: timing.fadeInDuration!,
            easing: 'ease-in'
          }
        ]
      },
      // Explosive particle burst
      {
        id: 'cosmic-explosion',
        type: 'particles',
        zIndex: 3,
        config: {
          count: effects.particleCount!,
          size: { min: 3, max: 10 },
          color: colors.secondary!,
          opacity: effects.intensity!,
          speed: effects.speed!,
          direction: 0,
          spread: 360,
          lifetime: 3000
        },
        animations: [
          // Burst at center
          {
            property: 'speed',
            from: 0,
            to: effects.speed!,
            startMs: timing.duration! * 0.3,
            endMs: timing.duration! * 0.4,
            easing: 'ease-out'
          },
          // Fade out explosion
          {
            property: 'opacity',
            from: effects.intensity!,
            to: 0,
            startMs: timing.duration! * 0.6,
            endMs: timing.duration!,
            easing: 'ease-out'
          }
        ]
      },
      // Central light burst
      {
        id: 'cosmic-light',
        type: 'light',
        zIndex: 4,
        config: {
          mode: 'radial',
          position: { x: 50, y: 50 },
          radius: 10,
          intensity: 1.0,
          color: colors.accent!,
          blendMode: 'screen'
        },
        animations: [
          // Explosive growth
          {
            property: 'radius',
            from: 0,
            to: 60,
            startMs: timing.duration! * 0.3,
            endMs: timing.duration! * 0.7,
            easing: 'ease-out'
          },
          // Intensity pulse
          {
            property: 'intensity',
            from: 0,
            to: 1.0,
            startMs: timing.duration! * 0.3,
            endMs: timing.duration! * 0.4,
            easing: 'ease-in'
          },
          {
            property: 'intensity',
            from: 1.0,
            to: 0,
            startMs: timing.duration! * 0.7,
            endMs: timing.duration!,
            easing: 'ease-out'
          }
        ]
      }
    ],
    audio: []
  };
}

/**
 * Rain Scene Template
 * 
 * A moody rain scene with falling rain particles,
 * atmospheric fog, and optional rain sound effects.
 * 
 * Features:
 * - Gray gradient background
 * - Falling rain particle system
 * - Atmospheric fog layer
 * - Optional rain audio
 */
export function createRainScene(
  customization: TemplateCustomization = {}
): CinematicScene {
  const {
    colors = {
      primary: '#4a5568',    // Dark gray
      secondary: '#cbd5e0',  // Light gray
      accent: '#ffffff'      // White (rain drops)
    },
    timing = {
      duration: 12000,
      fadeInDuration: 2000,
      fadeOutDuration: 2000
    },
    effects = {
      particleCount: 300,
      intensity: 0.6,
      speed: 3.0
    }
  } = customization;

  return {
    id: 'rain-scene',
    name: 'Rain',
    duration: timing.duration!,
    layers: [
      // Overcast sky gradient
      {
        id: 'rain-sky',
        type: 'gradient',
        zIndex: 0,
        config: {
          type: 'linear',
          angle: 180,
          stops: [
            { offset: 0, color: colors.secondary! },
            { offset: 1, color: colors.primary! }
          ]
        }
      },
      // Atmospheric fog
      {
        id: 'rain-fog',
        type: 'fog',
        zIndex: 1,
        config: {
          density: 0.3,
          color: colors.secondary!,
          speed: 0.2,
          direction: 90
        },
        animations: [
          {
            property: 'opacity',
            from: 0,
            to: 0.4,
            startMs: 0,
            endMs: timing.fadeInDuration!,
            easing: 'ease-in'
          }
        ]
      },
      // Rain particles
      {
        id: 'rain-drops',
        type: 'particles',
        zIndex: 2,
        config: {
          count: effects.particleCount!,
          size: { min: 1, max: 3 },
          color: colors.accent!,
          opacity: effects.intensity!,
          speed: effects.speed!,
          direction: 180, // Downward
          spread: 10,
          lifetime: 2000
        },
        animations: [
          {
            property: 'opacity',
            from: 0,
            to: effects.intensity!,
            startMs: timing.fadeInDuration! * 0.5,
            endMs: timing.fadeInDuration! * 1.5,
            easing: 'ease-in'
          },
          {
            property: 'opacity',
            from: effects.intensity!,
            to: 0,
            startMs: timing.duration! - timing.fadeOutDuration!,
            endMs: timing.duration!,
            easing: 'ease-out'
          }
        ]
      },
      // Vignette for mood
      {
        id: 'rain-vignette',
        type: 'vignette',
        zIndex: 3,
        config: {
          radius: 0.7,
          intensity: 0.5
        }
      }
    ],
    audio: [
      // Optional rain sound effects
      // {
      //   id: 'rain-sound',
      //   src: 'assets/audio/rain-sound.mp3',
      //   loop: true,
      //   volume: 0.6,
      //   fadeIn: timing.fadeInDuration,
      //   fadeOut: timing.fadeOutDuration
      // }
    ]
  };
}

/**
 * Divine Aura Scene Template
 * 
 * A heavenly scene with radial light layers,
 * soft glow effects, and gentle particles.
 * 
 * Features:
 * - Bright gradient background
 * - Multiple radial light layers
 * - Soft glow effects
 * - Gentle floating particles
 */
export function createDivineAuraScene(
  customization: TemplateCustomization = {}
): CinematicScene {
  const {
    colors = {
      primary: '#ffffff',    // Pure white
      secondary: '#ffd700',  // Gold
      accent: '#fffacd'      // Light yellow
    },
    timing = {
      duration: 10000,
      fadeInDuration: 3000,
      fadeOutDuration: 3000
    },
    effects = {
      particleCount: 80,
      intensity: 0.8,
      speed: 0.3
    }
  } = customization;

  return {
    id: 'divine-aura-scene',
    name: 'Divine Aura',
    duration: timing.duration!,
    layers: [
      // Bright background
      {
        id: 'divine-background',
        type: 'gradient',
        zIndex: 0,
        config: {
          type: 'radial',
          stops: [
            { offset: 0, color: colors.primary! },
            { offset: 0.5, color: colors.accent! },
            { offset: 1, color: colors.secondary! }
          ]
        },
        animations: [
          {
            property: 'opacity',
            from: 0,
            to: 1,
            startMs: 0,
            endMs: timing.fadeInDuration!,
            easing: 'ease-in'
          }
        ]
      },
      // Central radial light
      {
        id: 'divine-light-center',
        type: 'light',
        zIndex: 1,
        config: {
          mode: 'radial',
          position: { x: 50, y: 50 },
          radius: 30,
          intensity: effects.intensity!,
          color: colors.primary!,
          blendMode: 'screen'
        },
        animations: [
          // Pulsing effect
          {
            property: 'intensity',
            from: effects.intensity! * 0.6,
            to: effects.intensity!,
            startMs: 0,
            endMs: timing.duration! * 0.5,
            easing: 'ease-in-out',
            loop: true,
            yoyo: true
          },
          {
            property: 'radius',
            from: 25,
            to: 35,
            startMs: 0,
            endMs: timing.duration! * 0.5,
            easing: 'ease-in-out',
            loop: true,
            yoyo: true
          }
        ]
      },
      // Outer glow ring
      {
        id: 'divine-glow',
        type: 'light',
        zIndex: 2,
        config: {
          mode: 'radial',
          position: { x: 50, y: 50 },
          radius: 40,
          intensity: 0.6,
          color: colors.secondary!,
          blendMode: 'screen'
        },
        animations: [
          {
            property: 'opacity',
            from: 0,
            to: 0.8,
            startMs: timing.fadeInDuration! * 0.5,
            endMs: timing.fadeInDuration! * 1.5,
            easing: 'ease-in'
          }
        ]
      },
      // Soft floating particles
      {
        id: 'divine-particles',
        type: 'particles',
        zIndex: 3,
        config: {
          count: effects.particleCount!,
          size: { min: 2, max: 5 },
          color: colors.secondary!,
          opacity: 0.5,
          speed: effects.speed!,
          direction: 90, // Upward
          spread: 60,
          lifetime: 6000
        },
        animations: [
          {
            property: 'opacity',
            from: 0,
            to: 0.5,
            startMs: timing.fadeInDuration!,
            endMs: timing.fadeInDuration! * 2,
            easing: 'ease-in'
          },
          {
            property: 'opacity',
            from: 0.5,
            to: 0,
            startMs: timing.duration! - timing.fadeOutDuration!,
            endMs: timing.duration!,
            easing: 'ease-out'
          }
        ]
      }
    ],
    audio: []
  };
}

/**
 * Underwater Scene Template
 * 
 * An immersive underwater scene with blue gradient,
 * floating debris particles, and light rays.
 * 
 * Features:
 * - Deep blue gradient background
 * - Floating dust particles (debris)
 * - Light rays using spot lights
 * - Gentle movement
 */
export function createUnderwaterScene(
  customization: TemplateCustomization = {}
): CinematicScene {
  const {
    colors = {
      primary: '#001f3f',    // Deep ocean blue
      secondary: '#0074D9',  // Medium blue
      accent: '#7FDBFF'      // Light cyan
    },
    timing = {
      duration: 15000,
      fadeInDuration: 3000,
      fadeOutDuration: 3000
    },
    effects = {
      particleCount: 100,
      intensity: 0.4,
      speed: 0.2
    }
  } = customization;

  return {
    id: 'underwater-scene',
    name: 'Underwater',
    duration: timing.duration!,
    layers: [
      // Deep ocean gradient
      {
        id: 'ocean-background',
        type: 'gradient',
        zIndex: 0,
        config: {
          type: 'linear',
          angle: 180,
          stops: [
            { offset: 0, color: colors.secondary! },
            { offset: 0.5, color: colors.primary! },
            { offset: 1, color: '#000814' }
          ]
        }
      },
      // Light rays from surface
      {
        id: 'light-ray-1',
        type: 'light',
        zIndex: 1,
        config: {
          mode: 'spot',
          position: { x: 30, y: 0 },
          angle: 30,
          direction: 180,
          intensity: 0.3,
          color: colors.accent!,
          blendMode: 'screen'
        },
        animations: [
          // Gentle sway
          {
            property: 'direction',
            from: 170,
            to: 190,
            startMs: 0,
            endMs: timing.duration! * 0.4,
            easing: 'ease-in-out',
            loop: true,
            yoyo: true
          },
          {
            property: 'opacity',
            from: 0,
            to: 0.5,
            startMs: 0,
            endMs: timing.fadeInDuration!,
            easing: 'ease-in'
          }
        ]
      },
      {
        id: 'light-ray-2',
        type: 'light',
        zIndex: 1,
        config: {
          mode: 'spot',
          position: { x: 70, y: 0 },
          angle: 30,
          direction: 180,
          intensity: 0.3,
          color: colors.accent!,
          blendMode: 'screen'
        },
        animations: [
          // Gentle sway (offset timing)
          {
            property: 'direction',
            from: 175,
            to: 185,
            startMs: timing.duration! * 0.2,
            endMs: timing.duration! * 0.6,
            easing: 'ease-in-out',
            loop: true,
            yoyo: true
          },
          {
            property: 'opacity',
            from: 0,
            to: 0.5,
            startMs: timing.fadeInDuration! * 0.5,
            endMs: timing.fadeInDuration! * 1.5,
            easing: 'ease-in'
          }
        ]
      },
      // Floating debris particles
      {
        id: 'underwater-debris',
        type: 'particles',
        zIndex: 2,
        config: {
          count: effects.particleCount!,
          size: { min: 1, max: 4 },
          color: colors.accent!,
          opacity: effects.intensity!,
          speed: effects.speed!,
          direction: 90, // Slow upward drift
          spread: 180,
          lifetime: 10000
        },
        animations: [
          {
            property: 'opacity',
            from: 0,
            to: effects.intensity!,
            startMs: timing.fadeInDuration!,
            endMs: timing.fadeInDuration! * 2,
            easing: 'ease-in'
          },
          {
            property: 'opacity',
            from: effects.intensity!,
            to: 0,
            startMs: timing.duration! - timing.fadeOutDuration!,
            endMs: timing.duration!,
            easing: 'ease-out'
          }
        ]
      },
      // Subtle vignette
      {
        id: 'underwater-vignette',
        type: 'vignette',
        zIndex: 3,
        config: {
          radius: 0.8,
          intensity: 0.4
        }
      }
    ],
    audio: []
  };
}

/**
 * Template Manager
 * 
 * Provides a unified interface for accessing and customizing scene templates.
 */
export type TemplateType = 'sunrise' | 'cosmicBirth' | 'rain' | 'divineAura' | 'underwater';

export interface TemplateInfo {
  id: TemplateType;
  name: string;
  description: string;
  defaultDuration: number;
  customizableProperties: string[];
}

export class SceneTemplateManager {
  private static templates: Map<TemplateType, (customization?: TemplateCustomization) => CinematicScene> = new Map([
    ['sunrise', createSunriseScene],
    ['cosmicBirth', createCosmicBirthScene],
    ['rain', createRainScene],
    ['divineAura', createDivineAuraScene],
    ['underwater', createUnderwaterScene]
  ]);

  /**
   * Get a list of all available templates
   */
  static getAvailableTemplates(): TemplateInfo[] {
    return [
      {
        id: 'sunrise',
        name: 'Sunrise',
        description: 'A warm, peaceful sunrise scene with gradient background and atmospheric particles',
        defaultDuration: 8000,
        customizableProperties: ['colors.primary', 'colors.secondary', 'colors.accent', 'timing.duration', 'effects.particleCount', 'effects.intensity']
      },
      {
        id: 'cosmicBirth',
        name: 'Cosmic Birth',
        description: 'A dramatic cosmic scene with starfield, nebula effects, and particle explosions',
        defaultDuration: 10000,
        customizableProperties: ['colors.primary', 'colors.secondary', 'colors.accent', 'timing.duration', 'effects.particleCount', 'effects.speed']
      },
      {
        id: 'rain',
        name: 'Rain',
        description: 'A moody rain scene with falling particles, fog, and atmospheric effects',
        defaultDuration: 12000,
        customizableProperties: ['colors.primary', 'colors.secondary', 'timing.duration', 'effects.particleCount', 'effects.speed']
      },
      {
        id: 'divineAura',
        name: 'Divine Aura',
        description: 'A heavenly scene with radial lights, soft glows, and gentle particles',
        defaultDuration: 10000,
        customizableProperties: ['colors.primary', 'colors.secondary', 'timing.duration', 'effects.intensity', 'effects.particleCount']
      },
      {
        id: 'underwater',
        name: 'Underwater',
        description: 'An immersive underwater scene with blue gradient, light rays, and floating debris',
        defaultDuration: 15000,
        customizableProperties: ['colors.primary', 'colors.secondary', 'colors.accent', 'timing.duration', 'effects.particleCount', 'effects.speed']
      }
    ];
  }

  /**
   * Create a scene from a template with optional customization
   */
  static createScene(
    templateType: TemplateType,
    customization?: TemplateCustomization
  ): CinematicScene {
    const templateFn = this.templates.get(templateType);
    if (!templateFn) {
      throw new Error(`Unknown template type: ${templateType}`);
    }
    return templateFn(customization);
  }

  /**
   * Validate customization options for a template
   */
  static validateCustomization(
    _templateType: TemplateType,
    customization: TemplateCustomization
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate colors
    if (customization.colors) {
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (customization.colors.primary && !colorRegex.test(customization.colors.primary)) {
        errors.push('colors.primary must be a valid hex color (e.g., #FF6B35)');
      }
      if (customization.colors.secondary && !colorRegex.test(customization.colors.secondary)) {
        errors.push('colors.secondary must be a valid hex color');
      }
      if (customization.colors.accent && !colorRegex.test(customization.colors.accent)) {
        errors.push('colors.accent must be a valid hex color');
      }
    }

    // Validate timing
    if (customization.timing) {
      if (customization.timing.duration !== undefined && customization.timing.duration <= 0) {
        errors.push('timing.duration must be a positive number');
      }
      if (customization.timing.fadeInDuration !== undefined && customization.timing.fadeInDuration < 0) {
        errors.push('timing.fadeInDuration must be non-negative');
      }
      if (customization.timing.fadeOutDuration !== undefined && customization.timing.fadeOutDuration < 0) {
        errors.push('timing.fadeOutDuration must be non-negative');
      }
    }

    // Validate effects
    if (customization.effects) {
      if (customization.effects.particleCount !== undefined && customization.effects.particleCount < 0) {
        errors.push('effects.particleCount must be non-negative');
      }
      if (customization.effects.intensity !== undefined && 
          (customization.effects.intensity < 0 || customization.effects.intensity > 1)) {
        errors.push('effects.intensity must be between 0 and 1');
      }
      if (customization.effects.speed !== undefined && customization.effects.speed < 0) {
        errors.push('effects.speed must be non-negative');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get default customization for a template
   */
  static getDefaultCustomization(templateType: TemplateType): TemplateCustomization {
    // Create a scene with no customization to get defaults
    const scene = this.createScene(templateType);
    
    // Extract defaults from the scene (this is a simplified approach)
    return {
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#888888'
      },
      timing: {
        duration: scene.duration,
        fadeInDuration: 2000,
        fadeOutDuration: 2000
      },
      effects: {
        particleCount: 100,
        intensity: 0.5,
        speed: 1.0
      }
    };
  }
}

/**
 * Export all template functions and the manager
 */
export const SceneTemplates = {
  sunrise: createSunriseScene,
  cosmicBirth: createCosmicBirthScene,
  rain: createRainScene,
  divineAura: createDivineAuraScene,
  underwater: createUnderwaterScene,
  manager: SceneTemplateManager
};
