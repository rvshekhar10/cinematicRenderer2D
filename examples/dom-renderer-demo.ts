/**
 * Demo showcasing the DOM renderer and layer types
 */

import { DOMRenderer } from '../src/rendering/dom/DOMRenderer';
import { 
  GradientLayer, 
  ImageLayer, 
  TextBlockLayer, 
  VignetteLayer, 
  GlowOrbLayer, 
  NoiseOverlayLayer 
} from '../src/core/layers/BuiltInLayers';
import type { LayerMountContext, FrameContext } from '../src/core/interfaces/LayerContext';
import type { AssetManager } from '../src/assets/AssetManager';

// Mock asset manager for demo
const mockAssetManager = {} as AssetManager;

// Create container element
const container = document.createElement('div');
container.style.cssText = `
  width: 800px;
  height: 600px;
  position: relative;
  background: #000;
  margin: 20px auto;
  border: 1px solid #333;
`;
document.body.appendChild(container);

// Create DOM renderer
const renderer = new DOMRenderer(container);
renderer.initialize();

// Create demo layers
const layers = [
  // Background gradient
  new GradientLayer('bg-gradient', {
    zIndex: 1,
    colors: ['#1a1a2e', '#16213e', '#0f3460'],
    direction: 'to bottom',
    opacity: 1
  }),

  // Vignette overlay
  new VignetteLayer('vignette', {
    zIndex: 10,
    color: '#000000',
    intensity: 0.6,
    size: '60%',
    opacity: 0.8
  }),

  // Text block
  new TextBlockLayer('title', {
    zIndex: 5,
    text: 'DOM Renderer Demo\nCinematic Layers in Action',
    fontSize: '32px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    textAlign: 'center',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    opacity: 0.9,
    y: -100
  }),

  // Glow orb
  new GlowOrbLayer('orb1', {
    zIndex: 3,
    color: '#00ffff',
    size: '150px',
    blur: '30px',
    opacity: 0.6,
    centerX: '20%',
    centerY: '30%'
  }),

  // Another glow orb
  new GlowOrbLayer('orb2', {
    zIndex: 3,
    color: '#ff00ff',
    size: '120px',
    blur: '25px',
    opacity: 0.5,
    centerX: '80%',
    centerY: '70%'
  }),

  // Noise overlay
  new NoiseOverlayLayer('noise', {
    zIndex: 8,
    opacity: 0.15,
    width: 512,
    height: 512,
    intensity: 0.3,
    animated: true,
    animationSpeed: 200
  })
];

// Mount all layers
const mountContext: LayerMountContext = {
  container,
  renderer,
  assetManager: mockAssetManager,
  layerConfig: {}
};

layers.forEach(layer => {
  layer.mount(mountContext);
});

// Animation loop
let startTime = Date.now();
let animationId: number;

function animate() {
  const currentTime = Date.now();
  const elapsed = currentTime - startTime;
  
  const frameContext: FrameContext = {
    timeMs: elapsed,
    deltaMs: 16.67, // ~60fps
    quality: 'medium',
    viewport: { width: 800, height: 600 },
    devicePixelRatio: window.devicePixelRatio || 1
  };

  // Animate some properties
  const titleLayer = layers.find(l => l.id === 'title') as TextBlockLayer;
  if (titleLayer) {
    titleLayer['config'].y = -100 + Math.sin(elapsed * 0.001) * 20;
    titleLayer['config'].opacity = 0.7 + Math.sin(elapsed * 0.002) * 0.3;
  }

  const orb1 = layers.find(l => l.id === 'orb1') as GlowOrbLayer;
  if (orb1) {
    orb1['config'].x = Math.sin(elapsed * 0.0015) * 50;
    orb1['config'].y = Math.cos(elapsed * 0.001) * 30;
    orb1['config'].scale = 1 + Math.sin(elapsed * 0.003) * 0.2;
  }

  const orb2 = layers.find(l => l.id === 'orb2') as GlowOrbLayer;
  if (orb2) {
    orb2['config'].x = Math.cos(elapsed * 0.0012) * 40;
    orb2['config'].y = Math.sin(elapsed * 0.0018) * 35;
    orb2['config'].scale = 1 + Math.cos(elapsed * 0.0025) * 0.15;
  }

  // Render frame
  renderer.render(layers, frameContext);

  animationId = requestAnimationFrame(animate);
}

// Start animation
animate();

// Add controls
const controls = document.createElement('div');
controls.style.cssText = `
  text-align: center;
  margin: 20px;
  color: #fff;
  font-family: Arial, sans-serif;
`;

const stopButton = document.createElement('button');
stopButton.textContent = 'Stop Animation';
stopButton.onclick = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
};

const startButton = document.createElement('button');
startButton.textContent = 'Start Animation';
startButton.onclick = () => {
  startTime = Date.now();
  animate();
};

controls.appendChild(startButton);
controls.appendChild(stopButton);
document.body.appendChild(controls);

console.log('DOM Renderer Demo loaded successfully!');
console.log('Layers created:', layers.map(l => `${l.type}:${l.id}`));