/**
 * Shape Z-Index and Layering Demo
 * 
 * Demonstrates z-index sorting, overlapping shapes, and blend modes
 * for the ShapeLayer system.
 * 
 * Requirements: 2.2, 6.1, 6.2, 6.3
 */

import { CinematicRenderer2D } from '../src/core/CinematicRenderer2D';
import type { CinematicSpec } from '../src/types/CinematicSpec';

// Create a demo scene showcasing z-index layering
const zIndexDemo: CinematicSpec = {
  version: '1.0',
  metadata: {
    title: 'Shape Z-Index and Layering Demo',
    description: 'Demonstrates z-index sorting, overlapping shapes, and blend modes',
    author: 'CinematicRenderer2D',
    duration: 15000
  },
  engine: {
    targetFps: 60,
    quality: 'high',
    backend: 'dom'
  },
  assets: [],
  scenes: [
    {
      id: 'z-index-showcase',
      duration: 15000,
      layers: [
        // Background gradient
        {
          id: 'background',
          type: 'gradient',
          zIndex: 0,
          config: {
            type: 'linear',
            angle: 135,
            stops: [
              { offset: 0, color: '#0f0f1e' },
              { offset: 1, color: '#1a1a2e' }
            ]
          }
        },
        
        // Section 1: Basic Z-Index Ordering
        // Three overlapping circles with different z-index values
        {
          id: 'circle-back',
          type: 'shape',
          zIndex: 1,
          config: {
            shapeType: 'circle',
            radius: 80,
            x: 150,
            y: 200,
            fillColor: '#ff6b6b',
            strokeColor: '#ffffff',
            strokeWidth: 2,
            opacity: 0.9
          }
        },
        {
          id: 'circle-middle',
          type: 'shape',
          zIndex: 2,
          config: {
            shapeType: 'circle',
            radius: 80,
            x: 200,
            y: 200,
            fillColor: '#4ecdc4',
            strokeColor: '#ffffff',
            strokeWidth: 2,
            opacity: 0.9
          }
        },
        {
          id: 'circle-front',
          type: 'shape',
          zIndex: 3,
          config: {
            shapeType: 'circle',
            radius: 80,
            x: 175,
            y: 250,
            fillColor: '#ffe66d',
            strokeColor: '#ffffff',
            strokeWidth: 2,
            opacity: 0.9
          }
        },
        
        // Section 2: Blend Modes with Overlapping Shapes
        // Two overlapping circles with multiply blend mode
        {
          id: 'blend-base',
          type: 'shape',
          zIndex: 4,
          config: {
            shapeType: 'circle',
            radius: 70,
            x: 500,
            y: 200,
            fillColor: '#ff0080',
            opacity: 0.7
          }
        },
        {
          id: 'blend-overlay',
          type: 'shape',
          zIndex: 5,
          config: {
            shapeType: 'circle',
            radius: 70,
            x: 550,
            y: 200,
            fillColor: '#00ffff',
            opacity: 0.7,
            blendMode: 'multiply'
          }
        },
        
        // Section 3: Complex Layering with Multiple Shapes
        // Star behind, square in middle, triangle in front
        {
          id: 'star-back',
          type: 'shape',
          zIndex: 6,
          config: {
            shapeType: 'star',
            points: 8,
            innerRadius: 40,
            outerRadius: 90,
            x: 850,
            y: 200,
            fillColor: '#a8dadc',
            opacity: 0.8
          }
        },
        {
          id: 'square-middle',
          type: 'shape',
          zIndex: 7,
          config: {
            shapeType: 'square',
            size: 100,
            x: 850,
            y: 200,
            fillColor: '#f1faee',
            strokeColor: '#457b9d',
            strokeWidth: 3,
            opacity: 0.9
          }
        },
        {
          id: 'triangle-front',
          type: 'shape',
          zIndex: 8,
          config: {
            shapeType: 'triangle',
            vertices: [
              { x: 0, y: -40 },
              { x: -40, y: 40 },
              { x: 40, y: 40 }
            ],
            x: 850,
            y: 200,
            fillColor: '#e63946',
            opacity: 0.85
          }
        },
        
        // Section 4: Animated Z-Index Changes
        // Shapes that swap z-index over time (simulated with opacity)
        {
          id: 'animated-rect-1',
          type: 'shape',
          zIndex: 9,
          config: {
            shapeType: 'rectangle',
            width: 120,
            height: 80,
            x: 150,
            y: 500,
            fillColor: '#ff6b6b',
            rotation: 15,
            opacity: 1
          },
          animations: [
            {
              property: 'rotation',
              keyframes: [
                { time: 0, value: 15 },
                { time: 3000, value: 45 },
                { time: 6000, value: 15 }
              ],
              easing: 'easeInOutQuad',
              loop: true
            }
          ]
        },
        {
          id: 'animated-rect-2',
          type: 'shape',
          zIndex: 10,
          config: {
            shapeType: 'rectangle',
            width: 120,
            height: 80,
            x: 180,
            y: 520,
            fillColor: '#4ecdc4',
            rotation: -15,
            opacity: 0.9
          },
          animations: [
            {
              property: 'rotation',
              keyframes: [
                { time: 0, value: -15 },
                { time: 3000, value: -45 },
                { time: 6000, value: -15 }
              ],
              easing: 'easeInOutQuad',
              loop: true
            }
          ]
        },
        
        // Section 5: Many Overlapping Shapes with Different Blend Modes
        {
          id: 'blend-circle-1',
          type: 'shape',
          zIndex: 11,
          config: {
            shapeType: 'circle',
            radius: 60,
            x: 500,
            y: 500,
            fillColor: '#ff0000',
            opacity: 0.6,
            blendMode: 'normal'
          }
        },
        {
          id: 'blend-circle-2',
          type: 'shape',
          zIndex: 12,
          config: {
            shapeType: 'circle',
            radius: 60,
            x: 540,
            y: 480,
            fillColor: '#00ff00',
            opacity: 0.6,
            blendMode: 'screen'
          }
        },
        {
          id: 'blend-circle-3',
          type: 'shape',
          zIndex: 13,
          config: {
            shapeType: 'circle',
            radius: 60,
            x: 520,
            y: 520,
            fillColor: '#0000ff',
            opacity: 0.6,
            blendMode: 'overlay'
          }
        },
        
        // Section 6: Polygon Stack with Varying Opacity
        {
          id: 'polygon-1',
          type: 'shape',
          zIndex: 14,
          config: {
            shapeType: 'polygon',
            sides: 6,
            radius: 70,
            x: 850,
            y: 500,
            fillColor: '#ff6b6b',
            opacity: 0.3,
            rotation: 0
          },
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
        {
          id: 'polygon-2',
          type: 'shape',
          zIndex: 15,
          config: {
            shapeType: 'polygon',
            sides: 6,
            radius: 60,
            x: 850,
            y: 500,
            fillColor: '#4ecdc4',
            opacity: 0.4,
            rotation: 30
          },
          animations: [
            {
              property: 'rotation',
              keyframes: [
                { time: 0, value: 30 },
                { time: 5000, value: 390 }
              ],
              easing: 'linear',
              loop: true
            }
          ]
        },
        {
          id: 'polygon-3',
          type: 'shape',
          zIndex: 16,
          config: {
            shapeType: 'polygon',
            sides: 6,
            radius: 50,
            x: 850,
            y: 500,
            fillColor: '#ffe66d',
            opacity: 0.5,
            rotation: 60
          },
          animations: [
            {
              property: 'rotation',
              keyframes: [
                { time: 0, value: 60 },
                { time: 5000, value: 420 }
              ],
              easing: 'linear',
              loop: true
            }
          ]
        }
      ]
    }
  ],
  events: [
    {
      id: 'main-event',
      type: 'scene',
      startTime: 0,
      duration: 15000,
      sceneId: 'z-index-showcase'
    }
  ]
};

// Initialize the renderer
const container = document.getElementById('cinematic-container');
if (!container) {
  throw new Error('Container element not found');
}

const renderer = new CinematicRenderer2D({
  container,
  spec: zIndexDemo,
  autoplay: true,
  quality: 'high',
  debug: true
});

console.log('Shape Z-Index Demo initialized');
console.log('This demo showcases:');
console.log('1. Basic z-index ordering with overlapping circles');
console.log('2. Blend modes (multiply, screen, overlay) with overlapping shapes');
console.log('3. Complex layering with multiple shape types');
console.log('4. Animated shapes with rotation');
console.log('5. Multiple overlapping shapes with different blend modes');
console.log('6. Rotating polygon stack with varying opacity');
