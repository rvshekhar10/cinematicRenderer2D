/**
 * Scene Templates Usage Demo
 * 
 * This example demonstrates how to use the pre-built scene templates
 * with customization options.
 */

import {
  CinematicRenderer2D,
  SceneTemplates,
  SceneTemplateManager,
  type CinematicSpec,
  type TemplateCustomization
} from '../src/index';

// Example 1: Using templates with default settings
function createBasicTemplateSpec(): CinematicSpec {
  return {
    version: '1.0.0',
    metadata: {
      title: 'Basic Template Demo',
      description: 'Using scene templates with default settings',
      author: 'cinematicRenderer2D'
    },
    assets: {},
    events: [
      {
        id: 'sunrise',
        name: 'Sunrise',
        startMs: 0,
        endMs: 8000,
        scenes: [SceneTemplates.sunrise()]
      },
      {
        id: 'cosmic',
        name: 'Cosmic Birth',
        startMs: 8000,
        endMs: 18000,
        scenes: [SceneTemplates.cosmicBirth()]
      },
      {
        id: 'rain',
        name: 'Rain',
        startMs: 18000,
        endMs: 30000,
        scenes: [SceneTemplates.rain()]
      }
    ]
  };
}

// Example 2: Using templates with customization
function createCustomizedTemplateSpec(): CinematicSpec {
  // Customize sunrise with red/orange theme
  const customSunrise = SceneTemplates.sunrise({
    colors: {
      primary: '#FF4500',    // Orange red
      secondary: '#FFA500',  // Orange
      accent: '#FFD700'      // Gold
    },
    timing: {
      duration: 10000,       // 10 seconds
      fadeInDuration: 3000,
      fadeOutDuration: 3000
    },
    effects: {
      particleCount: 100,
      intensity: 0.5,
      speed: 0.8
    }
  });

  // Customize cosmic birth with purple/pink theme
  const customCosmic = SceneTemplates.cosmicBirth({
    colors: {
      primary: '#4B0082',    // Indigo
      secondary: '#FF1493',  // Deep pink
      accent: '#00CED1'      // Dark turquoise
    },
    effects: {
      particleCount: 300,
      speed: 3.0
    }
  });

  return {
    version: '1.0.0',
    metadata: {
      title: 'Customized Template Demo',
      description: 'Using scene templates with custom colors and effects'
    },
    assets: {},
    events: [
      {
        id: 'custom-sunrise',
        name: 'Custom Sunrise',
        startMs: 0,
        endMs: 10000,
        scenes: [customSunrise]
      },
      {
        id: 'custom-cosmic',
        name: 'Custom Cosmic',
        startMs: 10000,
        endMs: 20000,
        scenes: [customCosmic]
      }
    ]
  };
}

// Example 3: Using the Template Manager
function createTemplateWithManager(): CinematicSpec {
  // Get available templates
  const templates = SceneTemplateManager.getAvailableTemplates();
  console.log('Available templates:', templates.map(t => t.name));

  // Validate customization before creating
  const customization: TemplateCustomization = {
    colors: {
      primary: '#0074D9',
      secondary: '#7FDBFF',
      accent: '#39CCCC'
    },
    timing: {
      duration: 20000
    },
    effects: {
      particleCount: 150,
      speed: 0.5
    }
  };

  const validation = SceneTemplateManager.validateCustomization('underwater', customization);
  
  if (!validation.valid) {
    console.error('Invalid customization:', validation.errors);
    throw new Error('Invalid template customization');
  }

  // Create scene using manager
  const underwaterScene = SceneTemplateManager.createScene('underwater', customization);

  return {
    version: '1.0.0',
    metadata: {
      title: 'Template Manager Demo',
      description: 'Using SceneTemplateManager for validation and creation'
    },
    assets: {},
    events: [
      {
        id: 'underwater',
        name: 'Underwater',
        startMs: 0,
        endMs: 20000,
        scenes: [underwaterScene]
      }
    ]
  };
}

// Example 4: Creating a complete cinematic with all templates
function createCompleteTemplateShowcase(): CinematicSpec {
  return {
    version: '1.0.0',
    metadata: {
      title: 'Complete Template Showcase',
      description: 'All five scene templates in sequence',
      author: 'cinematicRenderer2D',
      duration: 55000
    },
    assets: {},
    events: [
      {
        id: 'sunrise',
        name: 'Sunrise',
        startMs: 0,
        endMs: 8000,
        scenes: [SceneTemplates.sunrise()]
      },
      {
        id: 'cosmic',
        name: 'Cosmic Birth',
        startMs: 8000,
        endMs: 18000,
        scenes: [SceneTemplates.cosmicBirth()]
      },
      {
        id: 'rain',
        name: 'Rain',
        startMs: 18000,
        endMs: 30000,
        scenes: [SceneTemplates.rain()]
      },
      {
        id: 'divine',
        name: 'Divine Aura',
        startMs: 30000,
        endMs: 40000,
        scenes: [SceneTemplates.divineAura()]
      },
      {
        id: 'underwater',
        name: 'Underwater',
        startMs: 40000,
        endMs: 55000,
        scenes: [SceneTemplates.underwater()]
      }
    ]
  };
}

// Example usage
async function runDemo() {
  const container = document.getElementById('cinematic-container');
  if (!container) {
    console.error('Container element not found');
    return;
  }

  // Choose which demo to run
  const spec = createCompleteTemplateShowcase();
  // const spec = createBasicTemplateSpec();
  // const spec = createCustomizedTemplateSpec();
  // const spec = createTemplateWithManager();

  const renderer = new CinematicRenderer2D({
    container,
    spec,
    quality: 'auto',
    debug: false
  });

  // Listen for scene changes
  renderer.on('sceneChange', (sceneId) => {
    console.log('Scene changed:', sceneId);
  });

  // Start playback
  await renderer.mount();
  renderer.play();
}

// Export for use in other modules
export {
  createBasicTemplateSpec,
  createCustomizedTemplateSpec,
  createTemplateWithManager,
  createCompleteTemplateShowcase,
  runDemo
};

// Run demo if this file is executed directly
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', runDemo);
}
