/**
 * SpecParser Demo - Demonstrates JSON specification validation and compilation
 */

import { SpecParser } from '../src/parsing/SpecParser';
import type { CinematicSpec } from '../src/types/CinematicSpec';

// Example valid specification
const exampleSpec: CinematicSpec = {
  schemaVersion: '1.0.0',
  engine: {
    targetFps: 60,
    quality: 'auto',
    debug: false,
    autoplay: true
  },
  events: [
    {
      id: 'intro',
      name: 'Introduction Sequence',
      scenes: ['welcome', 'features'],
      transitions: [
        {
          type: 'fade',
          duration: 1000,
          easing: 'ease-in-out'
        }
      ]
    }
  ],
  scenes: [
    {
      id: 'welcome',
      name: 'Welcome Scene',
      duration: 3000,
      layers: [
        {
          id: 'background',
          type: 'gradient',
          zIndex: 1,
          config: {
            opacity: 1,
            visible: true,
            colors: ['#1a1a2e', '#16213e']
          },
          animations: [
            {
              property: 'opacity',
              from: 0,
              to: 1,
              startMs: 0,
              endMs: 1000,
              easing: 'ease-in'
            }
          ]
        },
        {
          id: 'title',
          type: 'textBlock',
          zIndex: 2,
          config: {
            text: 'Welcome to CinematicRenderer2D',
            fontSize: 48,
            color: '#ffffff',
            textAlign: 'center'
          },
          animations: [
            {
              property: 'transform.y',
              from: -100,
              to: 0,
              startMs: 500,
              endMs: 1500,
              easing: 'ease-out'
            }
          ]
        }
      ],
      audio: [
        {
          id: 'welcome-music',
          type: 'ambience',
          src: '/audio/welcome.mp3',
          startMs: 0,
          volume: 0.7,
          fadeIn: 500
        }
      ]
    },
    {
      id: 'features',
      name: 'Features Scene',
      duration: 4000,
      layers: [
        {
          id: 'particles',
          type: 'particles',
          zIndex: 1,
          config: {
            count: 100,
            color: '#4a90e2',
            speed: 2
          }
        },
        {
          id: 'feature-list',
          type: 'textBlock',
          zIndex: 2,
          config: {
            text: 'High Performance • Framework Agnostic • TypeScript',
            fontSize: 24,
            color: '#ffffff'
          }
        }
      ]
    }
  ],
  assets: [
    {
      id: 'welcome-audio',
      type: 'audio',
      src: '/audio/welcome.mp3',
      preload: true,
      metadata: {
        size: 2048000,
        mimeType: 'audio/mpeg',
        duration: 10000
      }
    }
  ]
};

// Demonstrate validation and compilation
console.log('=== SpecParser Demo ===\n');

try {
  // 1. Validate the specification
  console.log('1. Validating specification...');
  const validatedSpec = SpecParser.validate(exampleSpec);
  console.log('✅ Specification is valid!');
  console.log(`   Schema version: ${validatedSpec.schemaVersion}`);
  console.log(`   Events: ${validatedSpec.events.length}`);
  console.log(`   Scenes: ${validatedSpec.scenes.length}`);
  console.log(`   Assets: ${validatedSpec.assets?.length || 0}\n`);

  // 2. Compile the specification
  console.log('2. Compiling specification...');
  const compiledSpec = SpecParser.parse(validatedSpec);
  console.log('✅ Specification compiled successfully!');
  console.log(`   Total duration: ${compiledSpec.totalDuration}ms`);
  console.log(`   Compiled events: ${compiledSpec.events.size}`);
  console.log(`   Compiled scenes: ${compiledSpec.scenes.size}`);
  console.log(`   Compiled assets: ${compiledSpec.assets.size}\n`);

  // 3. Demonstrate compiled scene details
  console.log('3. Compiled scene details:');
  for (const [sceneId, scene] of compiledSpec.scenes) {
    console.log(`   Scene "${sceneId}":`);
    console.log(`     Duration: ${scene.duration}ms`);
    console.log(`     Layers: ${scene.layers.length}`);
    console.log(`     Audio tracks: ${scene.audioTracks.length}`);
    
    // Show animation details
    scene.layers.forEach(layer => {
      if (layer.animations.length > 0) {
        console.log(`     Layer "${layer.id}" animations:`);
        layer.animations.forEach(anim => {
          console.log(`       ${anim.property}: ${anim.startMs}ms → ${anim.endMs}ms (${anim.easingType})`);
        });
      }
    });
  }

} catch (error) {
  console.error('❌ Error:', error instanceof Error ? error.message : error);
}

// Demonstrate error handling with invalid specification
console.log('\n4. Testing error handling with invalid specification...');

const invalidSpec = {
  schemaVersion: '1.0.0',
  engine: {
    targetFps: -1 // Invalid negative FPS
  },
  events: [], // Empty events array
  scenes: []
};

try {
  SpecParser.validate(invalidSpec);
  console.log('❌ Should have failed validation');
} catch (error) {
  console.log('✅ Correctly caught validation error:');
  console.log(`   ${error instanceof Error ? error.message : error}`);
}

console.log('\n=== Demo Complete ===');