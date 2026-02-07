/**
 * Shape Animation Demo
 * 
 * Demonstrates all shape properties being animated through the existing animation system.
 * This example shows:
 * - Position animations (x, y)
 * - Rotation animations
 * - Scale animations (scaleX, scaleY)
 * - Color animations (fillColor, strokeColor)
 * - Opacity animations
 * - Stroke width animations
 * - Easing functions
 * - Simultaneous property animations
 * - Keyframe animations
 * - Looping and yoyo animations
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8
 */

import { CinematicRenderer2D } from '../src/index';
import type { CinematicSpec } from '../src/types/CinematicSpec';

// Create the animation demo spec
const animationDemoSpec: CinematicSpec = {
  schemaVersion: '1.0.0',
  engine: {
    targetFps: 60,
    quality: 'high',
    debug: true,
    autoplay: true,
  },
  events: [
    {
      id: 'animation-showcase',
      name: 'Shape Animation Showcase',
      scenes: ['position-animation', 'rotation-animation', 'scale-animation', 'color-animation', 'combined-animation'],
    },
  ],
  scenes: [
    // Scene 1: Position Animation
    {
      id: 'position-animation',
      name: 'Position Animation',
      duration: 3000,
      layers: [
        {
          id: 'moving-circle',
          type: 'shape',
          zIndex: 10,
          config: {
            shapeType: 'circle',
            radius: 40,
            x: 100,
            y: 300,
            fillColor: '#ff6b6b',
            strokeColor: '#ffffff',
            strokeWidth: 3,
          },
          animations: [
            {
              property: 'x',
              from: 100,
              to: 700,
              startMs: 0,
              endMs: 3000,
              easing: 'ease-in-out',
            },
            {
              property: 'y',
              from: 300,
              to: 300,
              startMs: 0,
              endMs: 3000,
              easing: 'ease-in-out',
              keyframes: [
                { time: 0, value: 300 },
                { time: 0.25, value: 200, easing: 'ease-out' },
                { time: 0.5, value: 300, easing: 'ease-in' },
                { time: 0.75, value: 400, easing: 'ease-out' },
                { time: 1, value: 300, easing: 'ease-in' },
              ],
            },
          ],
        },
      ],
    },
    
    // Scene 2: Rotation Animation
    {
      id: 'rotation-animation',
      name: 'Rotation Animation',
      duration: 4000,
      layers: [
        {
          id: 'spinning-square',
          type: 'shape',
          zIndex: 10,
          config: {
            shapeType: 'square',
            size: 80,
            x: 400,
            y: 300,
            rotation: 0,
            fillColor: '#4ecdc4',
            strokeColor: '#ffffff',
            strokeWidth: 2,
          },
          animations: [
            {
              property: 'rotation',
              from: 0,
              to: 720, // Two full rotations
              startMs: 0,
              endMs: 4000,
              easing: 'ease-in-out',
            },
          ],
        },
        {
          id: 'spinning-triangle',
          type: 'shape',
          zIndex: 11,
          config: {
            shapeType: 'triangle',
            vertices: [
              { x: 0, y: -50 },
              { x: 43, y: 25 },
              { x: -43, y: 25 },
            ],
            x: 600,
            y: 300,
            rotation: 0,
            fillColor: '#ffe66d',
            strokeColor: '#ffffff',
            strokeWidth: 2,
          },
          animations: [
            {
              property: 'rotation',
              from: 0,
              to: -360,
              startMs: 0,
              endMs: 4000,
              easing: 'linear',
              loop: true,
            },
          ],
        },
      ],
    },
    
    // Scene 3: Scale Animation
    {
      id: 'scale-animation',
      name: 'Scale Animation',
      duration: 3000,
      layers: [
        {
          id: 'pulsing-star',
          type: 'shape',
          zIndex: 10,
          config: {
            shapeType: 'star',
            points: 5,
            innerRadius: 30,
            outerRadius: 60,
            x: 400,
            y: 300,
            scaleX: 1,
            scaleY: 1,
            fillColor: '#ffd93d',
            strokeColor: '#ff6b6b',
            strokeWidth: 3,
          },
          animations: [
            {
              property: 'scaleX',
              from: 1,
              to: 1.5,
              startMs: 0,
              endMs: 3000,
              easing: 'ease-in-out',
              loop: true,
              yoyo: true,
            },
            {
              property: 'scaleY',
              from: 1,
              to: 1.5,
              startMs: 0,
              endMs: 3000,
              easing: 'ease-in-out',
              loop: true,
              yoyo: true,
            },
          ],
        },
      ],
    },
    
    // Scene 4: Color and Opacity Animation
    {
      id: 'color-animation',
      name: 'Color and Opacity Animation',
      duration: 4000,
      layers: [
        {
          id: 'fading-polygon',
          type: 'shape',
          zIndex: 10,
          config: {
            shapeType: 'polygon',
            sides: 6,
            radius: 60,
            x: 300,
            y: 300,
            fillColor: '#ff6b6b',
            strokeColor: '#ffffff',
            strokeWidth: 2,
            opacity: 1,
          },
          animations: [
            {
              property: 'opacity',
              from: 1,
              to: 0.2,
              startMs: 0,
              endMs: 4000,
              easing: 'ease-in-out',
              loop: true,
              yoyo: true,
            },
            {
              property: 'strokeWidth',
              from: 2,
              to: 8,
              startMs: 0,
              endMs: 4000,
              easing: 'ease-in-out',
              loop: true,
              yoyo: true,
            },
          ],
        },
        {
          id: 'color-changing-ellipse',
          type: 'shape',
          zIndex: 11,
          config: {
            shapeType: 'ellipse',
            radiusX: 80,
            radiusY: 50,
            x: 500,
            y: 300,
            fillColor: '#4ecdc4',
            strokeColor: '#ffe66d',
            strokeWidth: 3,
          },
          animations: [
            {
              property: 'fillColor',
              from: '#4ecdc4',
              to: '#ff6b6b',
              startMs: 0,
              endMs: 4000,
              easing: 'linear',
              loop: true,
              yoyo: true,
            },
          ],
        },
      ],
    },
    
    // Scene 5: Combined Animations
    {
      id: 'combined-animation',
      name: 'Combined Animations',
      duration: 5000,
      layers: [
        {
          id: 'complex-rectangle',
          type: 'shape',
          zIndex: 10,
          config: {
            shapeType: 'rectangle',
            width: 100,
            height: 60,
            x: 100,
            y: 100,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            fillColor: '#ff6b6b',
            strokeColor: '#ffffff',
            strokeWidth: 2,
            opacity: 1,
          },
          animations: [
            // Position animation
            {
              property: 'x',
              from: 100,
              to: 700,
              startMs: 0,
              endMs: 5000,
              easing: 'ease-in-out',
            },
            {
              property: 'y',
              from: 100,
              to: 500,
              startMs: 0,
              endMs: 5000,
              easing: 'ease-in-out',
            },
            // Rotation animation
            {
              property: 'rotation',
              from: 0,
              to: 360,
              startMs: 0,
              endMs: 5000,
              easing: 'linear',
            },
            // Scale animation
            {
              property: 'scaleX',
              from: 1,
              to: 2,
              startMs: 0,
              endMs: 5000,
              easing: 'ease-out',
            },
            {
              property: 'scaleY',
              from: 1,
              to: 0.5,
              startMs: 0,
              endMs: 5000,
              easing: 'ease-in',
            },
            // Opacity animation
            {
              property: 'opacity',
              from: 1,
              to: 0.3,
              startMs: 0,
              endMs: 5000,
              easing: 'ease-in-out',
            },
            // Stroke width animation
            {
              property: 'strokeWidth',
              from: 2,
              to: 8,
              startMs: 0,
              endMs: 5000,
              easing: 'linear',
            },
          ],
        },
        {
          id: 'orbiting-circles',
          type: 'shape',
          zIndex: 11,
          config: {
            shapeType: 'circle',
            radius: 20,
            x: 400,
            y: 300,
            fillColor: '#4ecdc4',
          },
          animations: [
            {
              property: 'x',
              from: 400,
              to: 400,
              startMs: 0,
              endMs: 5000,
              easing: 'linear',
              loop: true,
              keyframes: [
                { time: 0, value: 400 },
                { time: 0.25, value: 550 },
                { time: 0.5, value: 400 },
                { time: 0.75, value: 250 },
                { time: 1, value: 400 },
              ],
            },
            {
              property: 'y',
              from: 300,
              to: 300,
              startMs: 0,
              endMs: 5000,
              easing: 'linear',
              loop: true,
              keyframes: [
                { time: 0, value: 150 },
                { time: 0.25, value: 300 },
                { time: 0.5, value: 450 },
                { time: 0.75, value: 300 },
                { time: 1, value: 150 },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Initialize the renderer
export function initShapeAnimationDemo(container: HTMLElement): CinematicRenderer2D {
  const renderer = new CinematicRenderer2D({
    container,
    spec: animationDemoSpec,
    autoplay: true,
    quality: 'high',
    debug: true,
  });

  // Mount and play
  renderer.mount().then(() => {
    console.log('Shape Animation Demo mounted and playing');
    
    // Add event listeners for debugging
    renderer.on('frame', (data: any) => {
      if (Math.floor(data.currentTime) % 1000 === 0) {
        console.log(`Frame: ${Math.floor(data.currentTime)}ms, Scene: ${data.currentScene}`);
      }
    });
    
    renderer.on('sceneChange', (sceneId: string) => {
      console.log(`Scene changed to: ${sceneId}`);
    });
  });

  return renderer;
}

// Auto-initialize if running in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('cinematic-container');
    if (container) {
      initShapeAnimationDemo(container);
    }
  });
}
