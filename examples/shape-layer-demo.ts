/**
 * Shape Layer Demo
 * 
 * Demonstrates the ShapeLayer system with various geometric shapes,
 * transforms, and visual properties.
 */

import { CinematicRenderer2D } from '../src/core/CinematicRenderer2D';
import { LayerRegistry } from '../src/core/LayerRegistry';
import { ShapeLayer } from '../src/core/layers/ShapeLayer';
import type { ShapeLayerConfig } from '../src/core/shapes/IShapeRenderer';

// Register the shape layer type
LayerRegistry.registerLayer('shape', (id: string, config: any) => {
  return new ShapeLayer(id, config as ShapeLayerConfig);
});

// Create a demo scene with various shapes
const shapeDemo = {
  version: '1.0',
  metadata: {
    title: 'Shape Layer Demo',
    description: 'Demonstration of the ShapeLayer system with various geometric shapes',
    author: 'CinematicRenderer2D',
    duration: 10000
  },
  assets: [],
  events: [
    {
      id: 'main-scene',
      startTime: 0,
      duration: 10000,
      type: 'scene' as const,
      scene: {
        id: 'shapes-showcase',
        layers: [
          // Background
          {
            id: 'background',
            type: 'gradient' as const,
            zIndex: 0,
            gradient: {
              type: 'linear',
              angle: 135,
              stops: [
                { offset: 0, color: '#1a1a2e' },
                { offset: 1, color: '#16213e' }
              ]
            }
          },
          // Circle
          {
            id: 'circle',
            type: 'shape' as const,
            zIndex: 1,
            shapeType: 'circle',
            radius: 50,
            x: 200,
            y: 200,
            fillColor: '#ff6b6b',
            strokeColor: '#ffffff',
            strokeWidth: 3,
            animations: [
              {
                property: 'scaleX',
                keyframes: [
                  { time: 0, value: 1 },
                  { time: 2000, value: 1.5 },
                  { time: 4000, value: 1 }
                ],
                easing: 'easeInOutQuad',
                loop: true
              },
              {
                property: 'scaleY',
                keyframes: [
                  { time: 0, value: 1 },
                  { time: 2000, value: 1.5 },
                  { time: 4000, value: 1 }
                ],
                easing: 'easeInOutQuad',
                loop: true
              }
            ]
          },
          // Rectangle
          {
            id: 'rectangle',
            type: 'shape' as const,
            zIndex: 1,
            shapeType: 'rectangle',
            width: 120,
            height: 80,
            x: 400,
            y: 200,
            fillColor: '#4ecdc4',
            rotation: 0,
            animations: [
              {
                property: 'rotation',
                keyframes: [
                  { time: 0, value: 0 },
                  { time: 5000, value: 360 }
                ],
                easing: 'linear',
                loop: true
              }
            ]
          },
          // Star
          {
            id: 'star',
            type: 'shape' as const,
            zIndex: 1,
            shapeType: 'star',
            points: 5,
            innerRadius: 30,
            outerRadius: 60,
            x: 600,
            y: 200,
            fillColor: '#ffe66d',
            strokeColor: '#ff6b6b',
            strokeWidth: 2,
            animations: [
              {
                property: 'rotation',
                keyframes: [
                  { time: 0, value: 0 },
                  { time: 3000, value: 360 }
                ],
                easing: 'linear',
                loop: true
              }
            ]
          },
          // Triangle
          {
            id: 'triangle',
            type: 'shape' as const,
            zIndex: 1,
            shapeType: 'triangle',
            vertices: [
              { x: 0, y: -50 },
              { x: -50, y: 50 },
              { x: 50, y: 50 }
            ],
            x: 200,
            y: 400,
            fillColor: '#a8dadc',
            animations: [
              {
                property: 'y',
                keyframes: [
                  { time: 0, value: 400 },
                  { time: 2000, value: 350 },
                  { time: 4000, value: 400 }
                ],
                easing: 'easeInOutQuad',
                loop: true
              }
            ]
          },
          // Polygon (Hexagon)
          {
            id: 'hexagon',
            type: 'shape' as const,
            zIndex: 1,
            shapeType: 'polygon',
            sides: 6,
            radius: 50,
            x: 400,
            y: 400,
            fillColor: '#f1faee',
            strokeColor: '#457b9d',
            strokeWidth: 3,
            animations: [
              {
                property: 'scaleX',
                keyframes: [
                  { time: 0, value: 1 },
                  { time: 1500, value: 1.3 },
                  { time: 3000, value: 1 }
                ],
                easing: 'easeInOutQuad',
                loop: true
              },
              {
                property: 'scaleY',
                keyframes: [
                  { time: 0, value: 1 },
                  { time: 1500, value: 1.3 },
                  { time: 3000, value: 1 }
                ],
                easing: 'easeInOutQuad',
                loop: true
              }
            ]
          },
          // Ellipse
          {
            id: 'ellipse',
            type: 'shape' as const,
            zIndex: 1,
            shapeType: 'ellipse',
            radiusX: 80,
            radiusY: 40,
            x: 600,
            y: 400,
            fillColor: '#e63946',
            opacity: 0.8,
            animations: [
              {
                property: 'rotation',
                keyframes: [
                  { time: 0, value: 0 },
                  { time: 4000, value: 360 }
                ],
                easing: 'linear',
                loop: true
              }
            ]
          }
        ]
      }
    }
  ]
};

// Initialize the renderer
const container = document.getElementById('cinematic-container');
if (!container) {
  throw new Error('Container element not found');
}

const renderer = new CinematicRenderer2D(container, {
  backend: 'dom',
  quality: 'high',
  enableDebug: true
});

// Load and play the demo
renderer.loadSpec(shapeDemo as any).then(() => {
  console.log('Shape demo loaded successfully');
  renderer.play();
}).catch((error) => {
  console.error('Failed to load shape demo:', error);
});

// Add controls
const playButton = document.getElementById('play-btn');
const pauseButton = document.getElementById('pause-btn');
const restartButton = document.getElementById('restart-btn');

if (playButton) {
  playButton.addEventListener('click', () => renderer.play());
}

if (pauseButton) {
  pauseButton.addEventListener('click', () => renderer.pause());
}

if (restartButton) {
  restartButton.addEventListener('click', () => {
    renderer.seek(0);
    renderer.play();
  });
}

console.log('Shape Layer Demo initialized');
