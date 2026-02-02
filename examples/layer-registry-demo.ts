/**
 * LayerRegistry Demo - Demonstrates the layer plugin system
 * 
 * This example shows how to:
 * 1. Use built-in layer types
 * 2. Register custom layer types
 * 3. Create layer instances
 * 4. Manage layer registry
 */

import { LayerRegistry } from '../src/core/LayerRegistry';
import type { ICinematicLayer } from '../src/core/interfaces/ICinematicLayer';
import type { LayerMountContext, FrameContext } from '../src/core/interfaces/LayerContext';

// Example custom layer implementation
class CustomFireworksLayer implements ICinematicLayer {
  public readonly id: string;
  public readonly type: string;
  public readonly zIndex: number;
  private config: Record<string, any>;
  private particles: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = [];

  constructor(id: string, config: Record<string, any>) {
    this.id = id;
    this.type = 'fireworks';
    this.zIndex = config.zIndex || 0;
    this.config = config;
  }

  mount(ctx: LayerMountContext): void {
    console.log(`🎆 Fireworks layer ${this.id} mounted with config:`, this.config);
    
    // Initialize particles
    const particleCount = this.config.particleCount || 50;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * (ctx.layerConfig.width || 800),
        y: Math.random() * (ctx.layerConfig.height || 600),
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: Math.random()
      });
    }
  }

  update(ctx: FrameContext): void {
    // Update particle positions
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= ctx.deltaMs / 1000;
      
      // Reset particle if it dies
      if (particle.life <= 0) {
        particle.x = Math.random() * ctx.viewport.width;
        particle.y = Math.random() * ctx.viewport.height;
        particle.vx = (Math.random() - 0.5) * 4;
        particle.vy = (Math.random() - 0.5) * 4;
        particle.life = Math.random();
      }
    });
  }

  destroy(): void {
    console.log(`🎆 Fireworks layer ${this.id} destroyed`);
    this.particles = [];
  }

  getParticleCount(): number {
    return this.particles.length;
  }
}

// Demo function
function demonstrateLayerRegistry() {
  console.log('🎬 LayerRegistry Demo Starting...\n');

  // Create a new registry instance
  const registry = new LayerRegistry();

  // 1. Show built-in layer types
  console.log('📋 Built-in Layer Types:');
  const builtInTypes = registry.getBuiltInTypes();
  console.log('  DOM layers:', builtInTypes.dom.join(', '));
  console.log('  Canvas2D layers:', builtInTypes.canvas2d.join(', '));
  console.log('  Total built-in types:', registry.getRegisteredTypes().length);
  console.log();

  // 2. Create built-in layer instances
  console.log('🏗️  Creating Built-in Layers:');
  
  const gradientLayer = registry.createLayer('gradient', 'bg-gradient', {
    zIndex: 1,
    colors: ['#ff6b6b', '#4ecdc4'],
    direction: 'diagonal'
  });
  console.log(`  ✅ Created ${gradientLayer.type} layer: ${gradientLayer.id} (z-index: ${gradientLayer.zIndex})`);

  const particlesLayer = registry.createLayer('particles', 'space-dust', {
    zIndex: 10,
    count: 1000,
    speed: 2.5,
    color: '#ffffff'
  });
  console.log(`  ✅ Created ${particlesLayer.type} layer: ${particlesLayer.id} (z-index: ${particlesLayer.zIndex})`);

  const imageLayer = registry.createLayer('image', 'hero-image', {
    zIndex: 5,
    src: 'hero.jpg',
    opacity: 0.8
  });
  console.log(`  ✅ Created ${imageLayer.type} layer: ${imageLayer.id} (z-index: ${imageLayer.zIndex})`);
  console.log();

  // 3. Register custom layer type
  console.log('🔌 Registering Custom Layer Type:');
  registry.registerLayerType('fireworks', (id, config) => new CustomFireworksLayer(id, config));
  console.log('  ✅ Registered "fireworks" layer type');
  console.log();

  // 4. Create custom layer instance
  console.log('🎆 Creating Custom Layer:');
  const fireworksLayer = registry.createLayer('fireworks', 'celebration', {
    zIndex: 15,
    particleCount: 100,
    colors: ['#ff0000', '#00ff00', '#0000ff'],
    intensity: 'high'
  }) as CustomFireworksLayer;
  console.log(`  ✅ Created ${fireworksLayer.type} layer: ${fireworksLayer.id} (z-index: ${fireworksLayer.zIndex})`);
  console.log(`  🎯 Particle count: ${fireworksLayer.getParticleCount()}`);
  console.log();

  // 5. Show registry status
  console.log('📊 Registry Status:');
  console.log(`  Total registered types: ${registry.getRegisteredTypes().length}`);
  console.log(`  Built-in types: ${registry.getBuiltInTypes().dom.length + registry.getBuiltInTypes().canvas2d.length}`);
  console.log(`  Custom types: ${registry.getCustomTypes().length}`);
  console.log(`  Custom types: [${registry.getCustomTypes().join(', ')}]`);
  console.log();

  // 6. Demonstrate layer lifecycle
  console.log('🔄 Layer Lifecycle Demo:');
  
  // Mock contexts for demonstration
  const mockMountContext: LayerMountContext = {
    container: document.createElement('div'),
    renderer: {} as any,
    assetManager: {} as any,
    layerConfig: { width: 1920, height: 1080 }
  };

  const mockFrameContext: FrameContext = {
    timeMs: 1000,
    deltaMs: 16.67,
    quality: 'high',
    viewport: { width: 1920, height: 1080 },
    devicePixelRatio: 1
  };

  // Mount and update custom layer
  fireworksLayer.mount(mockMountContext);
  fireworksLayer.update(mockFrameContext);
  console.log(`  🎯 After update - Particle count: ${fireworksLayer.getParticleCount()}`);
  
  // Cleanup
  fireworksLayer.destroy();
  console.log();

  // 7. Error handling demonstration
  console.log('⚠️  Error Handling Demo:');
  try {
    registry.createLayer('nonexistent', 'test', {});
  } catch (error) {
    console.log(`  ✅ Caught expected error: ${(error as Error).message}`);
  }
  console.log();

  // 8. Registry management
  console.log('🧹 Registry Management Demo:');
  console.log(`  Before cleanup - Custom types: ${registry.getCustomTypes().length}`);
  
  // Add more custom types
  registry.registerLayerType('lightning', (id, config) => new CustomFireworksLayer(id, config));
  registry.registerLayerType('rain', (id, config) => new CustomFireworksLayer(id, config));
  console.log(`  After adding types - Custom types: ${registry.getCustomTypes().length}`);
  
  // Clear custom types
  registry.clearCustomTypes();
  console.log(`  After cleanup - Custom types: ${registry.getCustomTypes().length}`);
  console.log(`  Built-in types still available: ${registry.hasLayerType('gradient')}`);
  console.log();

  // 9. Singleton pattern demonstration
  console.log('🔄 Singleton Pattern Demo:');
  const globalRegistry1 = LayerRegistry.getInstance();
  const globalRegistry2 = LayerRegistry.getInstance();
  console.log(`  Same instance: ${globalRegistry1 === globalRegistry2}`);
  console.log(`  Global registry has built-ins: ${globalRegistry1.hasLayerType('particles')}`);
  console.log();

  console.log('🎬 LayerRegistry Demo Complete!');
  console.log('✨ The LayerRegistry provides a flexible plugin system for extending');
  console.log('   the cinematic renderer with custom layer types while maintaining');
  console.log('   all built-in functionality.');
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demonstrateLayerRegistry();
}

export { demonstrateLayerRegistry, CustomFireworksLayer };