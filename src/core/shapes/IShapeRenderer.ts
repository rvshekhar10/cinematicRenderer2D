/**
 * Interface for shape renderer implementations
 * 
 * This interface defines the contract for backend-specific shape renderers.
 * Implementations include DOMShapeRenderer (SVG-based) and Canvas2DShapeRenderer.
 * 
 * Requirements: 8.1, 8.2
 */

import type { FrameContext } from '../interfaces/LayerContext';

/**
 * Configuration for a shape layer
 */
export interface ShapeLayerConfig {
  // Shape definition
  shapeType: 'rectangle' | 'square' | 'circle' | 'ellipse' | 
             'triangle' | 'trapezoid' | 'polygon' | 'star';
  
  // Shape-specific properties
  width?: number;           // rectangle, trapezoid
  height?: number;          // rectangle, trapezoid
  size?: number;            // square
  radius?: number;          // circle, polygon, star
  radiusX?: number;         // ellipse
  radiusY?: number;         // ellipse
  vertices?: Array<{x: number, y: number}>;  // triangle
  topWidth?: number;        // trapezoid
  bottomWidth?: number;     // trapezoid
  sides?: number;           // polygon
  points?: number;          // star
  innerRadius?: number;     // star
  outerRadius?: number;     // star
  
  // Transform properties
  x?: number | string;      // position (pixels or percentage)
  y?: number | string;      // position (pixels or percentage)
  zIndex?: number;          // layering order
  rotation?: number;        // degrees
  scaleX?: number;          // scale factor
  scaleY?: number;          // scale factor
  skewX?: number;           // degrees
  skewY?: number;           // degrees
  
  // Visual properties
  fillColor?: string;       // CSS color format
  strokeColor?: string;     // CSS color format
  strokeWidth?: number;     // pixels
  opacity?: number;         // 0.0 to 1.0
  blendMode?: string;       // CSS blend mode
  
  // Perspective properties
  perspective?: number;     // perspective distance
  rotateX?: number;         // 3D rotation (degrees)
  rotateY?: number;         // 3D rotation (degrees)
  rotateZ?: number;         // 3D rotation (degrees)
  translateZ?: number;      // depth positioning
  
  // Camera integration
  ignoreCameraTransform?: boolean;  // opt-out from camera effects
}

/**
 * Interface for backend-specific shape renderers
 * 
 * Implementations must handle:
 * - Creating and managing rendering elements (SVG or Canvas)
 * - Applying transforms (translate, rotate, scale, skew)
 * - Applying visual properties (fill, stroke, opacity, blend modes)
 * - Applying perspective transforms (3D effects)
 * - Visibility and opacity control
 * - Cleanup on destroy
 */
export interface IShapeRenderer {
  /**
   * Mount the renderer to a container element
   * 
   * @param container - The HTML element to mount the renderer into
   * @param config - Initial shape configuration
   */
  mount(container: HTMLElement, config: ShapeLayerConfig): void;
  
  /**
   * Render the shape with current configuration
   * 
   * @param config - Current shape configuration (may have animated values)
   * @param ctx - Frame context with timing and viewport information
   */
  render(config: ShapeLayerConfig, ctx: FrameContext): void;
  
  /**
   * Destroy the renderer and clean up resources
   * 
   * Removes all DOM elements and releases any held resources
   */
  destroy(): void;
  
  /**
   * Set the visibility of the shape
   * 
   * @param visible - Whether the shape should be visible
   */
  setVisible(visible: boolean): void;
  
  /**
   * Set the opacity of the shape
   * 
   * @param opacity - Opacity value from 0.0 (transparent) to 1.0 (opaque)
   */
  setOpacity(opacity: number): void;
}
