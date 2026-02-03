/**
 * Scene Templates Tests
 */

import { describe, it, expect } from 'vitest';
import {
  SceneTemplateManager,
  createSunriseScene,
  createCosmicBirthScene,
  createRainScene,
  createDivineAuraScene,
  createUnderwaterScene,
  type TemplateCustomization
} from './SceneTemplates';

describe('Scene Templates', () => {
  describe('createSunriseScene', () => {
    it('should create a sunrise scene with default values', () => {
      const scene = createSunriseScene();
      
      expect(scene.id).toBe('sunrise-scene');
      expect(scene.name).toBe('Sunrise');
      expect(scene.duration).toBe(8000);
      expect(scene.layers).toHaveLength(3);
      expect(scene.layers[0].type).toBe('gradient');
      expect(scene.layers[1].type).toBe('particles');
      expect(scene.layers[2].type).toBe('light');
    });

    it('should apply custom colors', () => {
      const customization: TemplateCustomization = {
        colors: {
          primary: '#FF0000',
          secondary: '#00FF00',
          accent: '#0000FF'
        }
      };
      
      const scene = createSunriseScene(customization);
      const gradient = scene.layers[0];
      
      expect(gradient.config.stops[2].color).toBe('#FF0000');
      expect(gradient.config.stops[1].color).toBe('#00FF00');
      expect(gradient.config.stops[0].color).toBe('#0000FF');
    });

    it('should apply custom timing', () => {
      const customization: TemplateCustomization = {
        timing: {
          duration: 10000,
          fadeInDuration: 3000,
          fadeOutDuration: 3000
        }
      };
      
      const scene = createSunriseScene(customization);
      
      expect(scene.duration).toBe(10000);
      expect(scene.layers[0].animations![0].endMs).toBe(3000);
    });

    it('should apply custom effects', () => {
      const customization: TemplateCustomization = {
        effects: {
          particleCount: 200,
          intensity: 0.8,
          speed: 2.0
        }
      };
      
      const scene = createSunriseScene(customization);
      const particles = scene.layers[1];
      
      expect(particles.config.count).toBe(200);
      expect(particles.config.opacity).toBe(0.8);
      expect(particles.config.speed).toBe(2.0);
    });
  });

  describe('createCosmicBirthScene', () => {
    it('should create a cosmic birth scene with default values', () => {
      const scene = createCosmicBirthScene();
      
      expect(scene.id).toBe('cosmic-birth-scene');
      expect(scene.name).toBe('Cosmic Birth');
      expect(scene.duration).toBe(10000);
      expect(scene.layers.length).toBeGreaterThan(3);
    });

    it('should include starfield and nebula layers', () => {
      const scene = createCosmicBirthScene();
      
      const starfield = scene.layers.find(l => l.id === 'starfield');
      const nebula = scene.layers.find(l => l.id === 'nebula');
      
      expect(starfield).toBeDefined();
      expect(nebula).toBeDefined();
      expect(nebula?.type).toBe('noiseOverlay');
    });
  });

  describe('createRainScene', () => {
    it('should create a rain scene with default values', () => {
      const scene = createRainScene();
      
      expect(scene.id).toBe('rain-scene');
      expect(scene.name).toBe('Rain');
      expect(scene.duration).toBe(12000);
    });

    it('should include fog and rain particles', () => {
      const scene = createRainScene();
      
      const fog = scene.layers.find(l => l.id === 'rain-fog');
      const rain = scene.layers.find(l => l.id === 'rain-drops');
      
      expect(fog).toBeDefined();
      expect(fog?.type).toBe('fog');
      expect(rain).toBeDefined();
      expect(rain?.type).toBe('particles');
      expect(rain?.config.direction).toBe(180); // Downward
    });
  });

  describe('createDivineAuraScene', () => {
    it('should create a divine aura scene with default values', () => {
      const scene = createDivineAuraScene();
      
      expect(scene.id).toBe('divine-aura-scene');
      expect(scene.name).toBe('Divine Aura');
      expect(scene.duration).toBe(10000);
    });

    it('should include radial light and glow effects', () => {
      const scene = createDivineAuraScene();
      
      const light = scene.layers.find(l => l.id === 'divine-light-center');
      const glow = scene.layers.find(l => l.id === 'divine-glow');
      
      expect(light).toBeDefined();
      expect(light?.type).toBe('light');
      expect(light?.config.mode).toBe('radial');
      expect(glow).toBeDefined();
      expect(glow?.type).toBe('glowEffect');
    });

    it('should have pulsing animations', () => {
      const scene = createDivineAuraScene();
      
      const light = scene.layers.find(l => l.id === 'divine-light-center');
      const intensityAnim = light?.animations?.find(a => a.property === 'intensity');
      
      expect(intensityAnim).toBeDefined();
      expect(intensityAnim?.loop).toBe(true);
      expect(intensityAnim?.yoyo).toBe(true);
    });
  });

  describe('createUnderwaterScene', () => {
    it('should create an underwater scene with default values', () => {
      const scene = createUnderwaterScene();
      
      expect(scene.id).toBe('underwater-scene');
      expect(scene.name).toBe('Underwater');
      expect(scene.duration).toBe(15000);
    });

    it('should include light rays and debris', () => {
      const scene = createUnderwaterScene();
      
      const lightRay1 = scene.layers.find(l => l.id === 'light-ray-1');
      const lightRay2 = scene.layers.find(l => l.id === 'light-ray-2');
      const debris = scene.layers.find(l => l.id === 'underwater-debris');
      
      expect(lightRay1).toBeDefined();
      expect(lightRay1?.type).toBe('light');
      expect(lightRay1?.config.mode).toBe('spot');
      expect(lightRay2).toBeDefined();
      expect(debris).toBeDefined();
      expect(debris?.type).toBe('particles');
    });
  });

  describe('SceneTemplateManager', () => {
    describe('getAvailableTemplates', () => {
      it('should return all available templates', () => {
        const templates = SceneTemplateManager.getAvailableTemplates();
        
        expect(templates).toHaveLength(5);
        expect(templates.map(t => t.id)).toEqual([
          'sunrise',
          'cosmicBirth',
          'rain',
          'divineAura',
          'underwater'
        ]);
      });

      it('should include template metadata', () => {
        const templates = SceneTemplateManager.getAvailableTemplates();
        const sunrise = templates.find(t => t.id === 'sunrise');
        
        expect(sunrise).toBeDefined();
        expect(sunrise?.name).toBe('Sunrise');
        expect(sunrise?.description).toBeTruthy();
        expect(sunrise?.defaultDuration).toBe(8000);
        expect(sunrise?.customizableProperties).toContain('colors.primary');
      });
    });

    describe('createScene', () => {
      it('should create a scene from template type', () => {
        const scene = SceneTemplateManager.createScene('sunrise');
        
        expect(scene.id).toBe('sunrise-scene');
        expect(scene.name).toBe('Sunrise');
      });

      it('should apply customization', () => {
        const customization: TemplateCustomization = {
          timing: { duration: 5000 }
        };
        
        const scene = SceneTemplateManager.createScene('rain', customization);
        
        expect(scene.duration).toBe(5000);
      });

      it('should throw error for unknown template', () => {
        expect(() => {
          SceneTemplateManager.createScene('unknown' as any);
        }).toThrow('Unknown template type: unknown');
      });
    });

    describe('validateCustomization', () => {
      it('should validate valid customization', () => {
        const customization: TemplateCustomization = {
          colors: {
            primary: '#FF0000',
            secondary: '#00FF00'
          },
          timing: {
            duration: 5000
          },
          effects: {
            intensity: 0.5
          }
        };
        
        const result = SceneTemplateManager.validateCustomization('sunrise', customization);
        
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject invalid hex colors', () => {
        const customization: TemplateCustomization = {
          colors: {
            primary: 'red', // Invalid
            secondary: '#GG0000' // Invalid
          }
        };
        
        const result = SceneTemplateManager.validateCustomization('sunrise', customization);
        
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toContain('hex color');
      });

      it('should reject negative duration', () => {
        const customization: TemplateCustomization = {
          timing: {
            duration: -1000
          }
        };
        
        const result = SceneTemplateManager.validateCustomization('sunrise', customization);
        
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('timing.duration must be a positive number');
      });

      it('should reject intensity out of range', () => {
        const customization: TemplateCustomization = {
          effects: {
            intensity: 1.5 // > 1
          }
        };
        
        const result = SceneTemplateManager.validateCustomization('sunrise', customization);
        
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('effects.intensity must be between 0 and 1');
      });
    });

    describe('getDefaultCustomization', () => {
      it('should return default customization for a template', () => {
        const defaults = SceneTemplateManager.getDefaultCustomization('sunrise');
        
        expect(defaults.colors).toBeDefined();
        expect(defaults.timing).toBeDefined();
        expect(defaults.effects).toBeDefined();
        expect(defaults.timing?.duration).toBe(8000);
      });
    });
  });
});
