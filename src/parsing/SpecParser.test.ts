/**
 * Tests for SpecParser with Zod validation
 * 
 * Tests comprehensive JSON schema validation, default value application,
 * and descriptive error message generation.
 */

import { describe, it, expect } from 'vitest';
import { SpecParser } from './SpecParser';
import type { CinematicSpec } from '../types/CinematicSpec';

describe('SpecParser', () => {
  const validSpec: CinematicSpec = {
    schemaVersion: '1.0.0',
    engine: {
      targetFps: 60,
      quality: 'auto',
      debug: false,
      autoplay: false
    },
    events: [
      {
        id: 'event1',
        name: 'Test Event',
        scenes: ['scene1'],
        transitions: []
      }
    ],
    scenes: [
      {
        id: 'scene1',
        name: 'Test Scene',
        duration: 5000,
        layers: [
          {
            id: 'layer1',
            type: 'gradient',
            zIndex: 1,
            config: {
              opacity: 1,
              visible: true
            },
            animations: []
          }
        ],
        audio: []
      }
    ],
    assets: []
  };

  describe('validate', () => {
    it('should validate a correct specification', () => {
      const result = SpecParser.validate(validSpec);
      expect(result).toBeDefined();
      expect(result.schemaVersion).toBe('1.0.0');
      expect(result.events).toHaveLength(1);
      expect(result.scenes).toHaveLength(1);
    });

    it('should apply default values for optional properties', () => {
      const minimalSpec = {
        schemaVersion: '1.0.0',
        engine: {},
        events: [
          {
            id: 'event1',
            name: 'Test Event',
            scenes: ['scene1']
          }
        ],
        scenes: [
          {
            id: 'scene1',
            name: 'Test Scene',
            duration: 5000,
            layers: [
              {
                id: 'layer1',
                type: 'gradient',
                zIndex: 1,
                config: {}
              }
            ]
          }
        ]
      };

      const result = SpecParser.validate(minimalSpec);
      
      // Check that defaults were applied
      expect(result.engine.targetFps).toBe(60);
      expect(result.engine.quality).toBe('auto');
      expect(result.engine.debug).toBe(false);
      expect(result.engine.autoplay).toBe(false);
      expect(result.events[0].transitions).toEqual([]);
      expect(result.scenes[0].audio).toEqual([]);
      expect(result.scenes[0].layers[0].animations).toEqual([]);
      expect(result.assets).toEqual([]);
    });

    it('should reject specification with missing required fields', () => {
      const invalidSpec = {
        schemaVersion: '1.0.0',
        engine: {},
        events: [], // Empty events array should fail
        scenes: []
      };

      expect(() => SpecParser.validate(invalidSpec)).toThrow();
    });

    it('should reject specification with invalid schema version', () => {
      const invalidSpec = {
        ...validSpec,
        schemaVersion: '2.0.0' // Unsupported version
      };

      expect(() => SpecParser.validate(invalidSpec)).toThrow(/Unsupported schema version/);
    });

    it('should reject specification with missing schema version', () => {
      const invalidSpec = {
        ...validSpec
      };
      delete (invalidSpec as any).schemaVersion;

      expect(() => SpecParser.validate(invalidSpec)).toThrow(/Missing or invalid schemaVersion/);
    });

    it('should reject specification with invalid scene references', () => {
      const invalidSpec = {
        ...validSpec,
        events: [
          {
            id: 'event1',
            name: 'Test Event',
            scenes: ['nonexistent-scene'], // Scene doesn't exist
            transitions: []
          }
        ]
      };

      expect(() => SpecParser.validate(invalidSpec)).toThrow();
    });

    it('should reject specification with duplicate IDs', () => {
      const invalidSpec = {
        ...validSpec,
        events: [
          {
            id: 'duplicate',
            name: 'Event 1',
            scenes: ['scene1'],
            transitions: []
          },
          {
            id: 'duplicate', // Duplicate ID
            name: 'Event 2',
            scenes: ['scene1'],
            transitions: []
          }
        ]
      };

      expect(() => SpecParser.validate(invalidSpec)).toThrow();
    });

    it('should validate animation tracks with proper timing', () => {
      const specWithAnimation = {
        ...validSpec,
        scenes: [
          {
            ...validSpec.scenes[0],
            layers: [
              {
                ...validSpec.scenes[0].layers[0],
                animations: [
                  {
                    property: 'opacity',
                    from: 0,
                    to: 1,
                    startMs: 0,
                    endMs: 1000,
                    easing: 'ease-in-out' as const
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = SpecParser.validate(specWithAnimation);
      expect(result.scenes[0].layers[0].animations).toHaveLength(1);
      expect(result.scenes[0].layers[0].animations[0].easing).toBe('ease-in-out');
    });

    it('should reject animation tracks with invalid timing', () => {
      const invalidSpec = {
        ...validSpec,
        scenes: [
          {
            ...validSpec.scenes[0],
            layers: [
              {
                ...validSpec.scenes[0].layers[0],
                animations: [
                  {
                    property: 'opacity',
                    from: 0,
                    to: 1,
                    startMs: 1000,
                    endMs: 500, // endMs < startMs should fail
                    easing: 'ease'
                  }
                ]
              }
            ]
          }
        ]
      };

      expect(() => SpecParser.validate(invalidSpec)).toThrow(/endMs must be greater than startMs/);
    });
  });

  describe('parse', () => {
    it('should compile a valid specification', () => {
      const result = SpecParser.parse(validSpec);
      
      expect(result).toBeDefined();
      expect(result.schemaVersion).toBe('1.0.0');
      expect(result.events.size).toBe(1);
      expect(result.scenes.size).toBe(1);
      expect(result.assets.size).toBe(0);
      expect(result.totalDuration).toBeGreaterThan(0);
      expect(result.compiledAt).toBeGreaterThan(0);
    });

    it('should compile scenes with proper timing', () => {
      const result = SpecParser.parse(validSpec);
      const scene = result.scenes.get('scene1');
      
      expect(scene).toBeDefined();
      expect(scene!.duration).toBe(5000);
      expect(scene!.startTime).toBe(0);
      expect(scene!.endTime).toBe(5000);
    });

    it('should compile layers with proper z-index ordering', () => {
      const specWithMultipleLayers = {
        ...validSpec,
        scenes: [
          {
            ...validSpec.scenes[0],
            layers: [
              {
                id: 'layer3',
                type: 'gradient' as const,
                zIndex: 3,
                config: {},
                animations: []
              },
              {
                id: 'layer1',
                type: 'image' as const,
                zIndex: 1,
                config: {},
                animations: []
              },
              {
                id: 'layer2',
                type: 'textBlock' as const,
                zIndex: 2,
                config: {},
                animations: []
              }
            ]
          }
        ]
      };

      const result = SpecParser.parse(specWithMultipleLayers);
      const scene = result.scenes.get('scene1');
      
      expect(scene!.layers).toHaveLength(3);
      // Should be sorted by z-index
      expect(scene!.layers[0].zIndex).toBe(1);
      expect(scene!.layers[1].zIndex).toBe(2);
      expect(scene!.layers[2].zIndex).toBe(3);
    });

    it('should compile animation tracks with interpolation functions', () => {
      const specWithAnimation = {
        ...validSpec,
        scenes: [
          {
            ...validSpec.scenes[0],
            layers: [
              {
                ...validSpec.scenes[0].layers[0],
                animations: [
                  {
                    property: 'opacity',
                    from: 0,
                    to: 1,
                    startMs: 0,
                    endMs: 1000,
                    easing: 'ease-in-out' as const,
                    loop: true,
                    yoyo: true
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = SpecParser.parse(specWithAnimation);
      const scene = result.scenes.get('scene1');
      const animation = scene!.layers[0].animations[0];
      
      expect(animation).toBeDefined();
      expect(animation.property).toBe('opacity');
      expect(animation.startMs).toBe(0);
      expect(animation.endMs).toBe(1000);
      expect(animation.loop).toBe(true);
      expect(animation.yoyo).toBe(true);
      expect(typeof animation.interpolate).toBe('function');
      
      // Test interpolation function
      expect(animation.interpolate(0)).toBe(0);
      expect(animation.interpolate(1)).toBe(1);
      expect(animation.interpolate(0.5)).toBeGreaterThan(0);
      expect(animation.interpolate(0.5)).toBeLessThan(1);
    });

    it('should compile assets with proper metadata', () => {
      const specWithAssets = {
        ...validSpec,
        assets: [
          {
            id: 'test-image',
            type: 'image' as const,
            src: '/test.jpg',
            preload: true,
            metadata: {
              size: 1024,
              mimeType: 'image/jpeg',
              dimensions: {
                width: 800,
                height: 600
              }
            }
          }
        ]
      };

      const result = SpecParser.parse(specWithAssets);
      const asset = result.assets.get('test-image');
      
      expect(asset).toBeDefined();
      expect(asset!.type).toBe('image');
      expect(asset!.src).toBe('/test.jpg');
      expect(asset!.metadata.size).toBe(1024);
      expect(asset!.metadata.mimeType).toBe('image/jpeg');
      expect(asset!.metadata.dimensions?.width).toBe(800);
      expect(asset!.metadata.dimensions?.height).toBe(600);
    });

    it('should handle compilation errors gracefully', () => {
      const invalidSpec = {
        ...validSpec,
        events: [
          {
            id: 'event1',
            name: 'Test Event',
            scenes: ['nonexistent-scene'], // This should cause compilation error
            transitions: []
          }
        ]
      };

      // First validate to get a "valid" spec that will fail during compilation
      try {
        SpecParser.parse(invalidSpec as any);
        expect.fail('Should have thrown compilation error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Compilation failed');
      }
    });
  });

  describe('error messages', () => {
    it('should provide descriptive error messages for validation failures', () => {
      const invalidSpec = {
        schemaVersion: '1.0.0',
        engine: {
          targetFps: -1 // Invalid negative FPS
        },
        events: [],
        scenes: []
      };

      try {
        SpecParser.validate(invalidSpec);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Specification validation failed');
      }
    });
  });
});