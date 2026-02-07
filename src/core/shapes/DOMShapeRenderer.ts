/**
 * DOMShapeRenderer - SVG-based shape renderer for DOM backend
 * 
 * Renders shapes using SVG elements with full support for:
 * - All shape types via SVG path elements
 * - 2D transforms (translate, rotate, scale, skew)
 * - Visual properties (fill, stroke, opacity, blend modes)
 * - 3D perspective transforms using CSS transforms
 * 
 * Requirements: 8.2, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3
 */

import type { IShapeRenderer, ShapeLayerConfig } from './IShapeRenderer';
import type { FrameContext } from '../interfaces/LayerContext';
import { ShapeGeometry } from './ShapeGeometry';

/**
 * DOM/SVG-based shape renderer implementation
 * 
 * Creates and manages SVG elements for shape rendering with full transform
 * and visual property support.
 */
export class DOMShapeRenderer implements IShapeRenderer {
  private svgElement: SVGSVGElement | null = null;
  private shapeElement: SVGPathElement | null = null;
  private container: HTMLElement | null = null;
  private currentConfig: ShapeLayerConfig | null = null;
  private visible: boolean = true;
  private explicitOpacity: number = 1.0;

  /**
   * Mount the renderer to a container element
   * 
   * Creates SVG container and shape element, applies initial configuration.
   * 
   * @param container - The HTML element to mount the renderer into
   * @param config - Initial shape configuration
   */
  mount(container: HTMLElement, config: ShapeLayerConfig): void {
    this.container = container;
    this.currentConfig = config;

    // Create SVG container
    this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgElement.style.position = 'absolute';
    this.svgElement.style.top = '0';
    this.svgElement.style.left = '0';
    this.svgElement.style.width = '100%';
    this.svgElement.style.height = '100%';
    this.svgElement.style.pointerEvents = 'none';
    this.svgElement.style.overflow = 'visible';

    // Create shape path element
    this.shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Add shape to SVG
    this.svgElement.appendChild(this.shapeElement);
    
    // Add SVG to container
    container.appendChild(this.svgElement);

    // Apply initial rendering
    this.render(config, this.createDummyFrameContext());
  }

  /**
   * Render the shape with current configuration
   * 
   * Updates shape path, transforms, and visual properties based on config.
   * Applies transforms in order: translate, rotate, scale, skew, perspective.
   * 
   * @param config - Current shape configuration (may have animated values)
   * @param ctx - Frame context with timing and viewport information
   */
  render(config: ShapeLayerConfig, ctx: FrameContext): void {
    if (!this.shapeElement || !this.svgElement) {
      return;
    }

    this.currentConfig = config;

    // Generate shape path data
    const pathData = this.generatePathData(config);
    this.shapeElement.setAttribute('d', pathData.svgPath);

    // Apply visual properties
    this.applyVisualProperties(config);

    // Apply transforms
    this.applyTransforms(config, ctx);

    // Apply visibility
    if (!this.visible) {
      this.svgElement.style.display = 'none';
    } else {
      this.svgElement.style.display = 'block';
    }
  }

  /**
   * Destroy the renderer and clean up resources
   * 
   * Removes all DOM elements and releases references.
   */
  destroy(): void {
    if (this.svgElement && this.container) {
      this.container.removeChild(this.svgElement);
    }
    
    this.svgElement = null;
    this.shapeElement = null;
    this.container = null;
    this.currentConfig = null;
  }

  /**
   * Set the visibility of the shape
   * 
   * @param visible - Whether the shape should be visible
   */
  setVisible(visible: boolean): void {
    this.visible = visible;
    if (this.svgElement) {
      this.svgElement.style.display = visible ? 'block' : 'none';
    }
  }

  /**
   * Set the opacity of the shape
   * 
   * @param opacity - Opacity value from 0.0 (transparent) to 1.0 (opaque)
   */
  setOpacity(opacity: number): void {
    this.explicitOpacity = opacity;
    if (this.currentConfig) {
      this.applyVisualProperties(this.currentConfig);
    }
  }

  /**
   * Generate path data for the current shape type
   * 
   * @param config - Shape configuration
   * @returns PathData with SVG path string
   */
  private generatePathData(config: ShapeLayerConfig): { svgPath: string } {
    switch (config.shapeType) {
      case 'rectangle':
        if (config.width === undefined || config.height === undefined) {
          throw new Error('Rectangle requires width and height');
        }
        return ShapeGeometry.generateRectangle(config.width, config.height);

      case 'square':
        if (config.size === undefined) {
          throw new Error('Square requires size');
        }
        return ShapeGeometry.generateSquare(config.size);

      case 'circle':
        if (config.radius === undefined) {
          throw new Error('Circle requires radius');
        }
        return ShapeGeometry.generateCircle(config.radius);

      case 'ellipse':
        if (config.radiusX === undefined || config.radiusY === undefined) {
          throw new Error('Ellipse requires radiusX and radiusY');
        }
        return ShapeGeometry.generateEllipse(config.radiusX, config.radiusY);

      case 'triangle':
        if (!config.vertices || config.vertices.length !== 3) {
          throw new Error('Triangle requires exactly 3 vertices');
        }
        return ShapeGeometry.generateTriangle(config.vertices);

      case 'trapezoid':
        if (config.topWidth === undefined || config.bottomWidth === undefined || config.height === undefined) {
          throw new Error('Trapezoid requires topWidth, bottomWidth, and height');
        }
        return ShapeGeometry.generateTrapezoid(config.topWidth, config.bottomWidth, config.height);

      case 'polygon':
        if (config.sides === undefined || config.radius === undefined) {
          throw new Error('Polygon requires sides and radius');
        }
        return ShapeGeometry.generatePolygon(config.sides, config.radius);

      case 'star':
        if (config.points === undefined || config.innerRadius === undefined || config.outerRadius === undefined) {
          throw new Error('Star requires points, innerRadius, and outerRadius');
        }
        return ShapeGeometry.generateStar(config.points, config.innerRadius, config.outerRadius);

      default:
        throw new Error(`Unsupported shape type: ${config.shapeType}`);
    }
  }

  /**
   * Apply visual properties to the shape element
   * 
   * Handles fill, stroke, opacity, and blend modes.
   * 
   * @param config - Shape configuration
   */
  private applyVisualProperties(config: ShapeLayerConfig): void {
    if (!this.shapeElement) {
      return;
    }

    // Fill color (default: black)
    const fillColor = config.fillColor ?? '#000000';
    this.shapeElement.setAttribute('fill', fillColor);

    // Stroke color (default: none)
    const strokeColor = config.strokeColor ?? 'none';
    this.shapeElement.setAttribute('stroke', strokeColor);

    // Stroke width (default: 0)
    const strokeWidth = config.strokeWidth ?? 0;
    this.shapeElement.setAttribute('stroke-width', strokeWidth.toString());

    // Opacity (combine config opacity with explicit opacity)
    const configOpacity = config.opacity ?? 1.0;
    const finalOpacity = configOpacity * this.explicitOpacity;
    this.shapeElement.setAttribute('opacity', finalOpacity.toString());

    // Blend mode (default: normal)
    if (config.blendMode) {
      this.shapeElement.style.mixBlendMode = config.blendMode;
    } else {
      this.shapeElement.style.mixBlendMode = 'normal';
    }
  }

  /**
   * Apply transforms to the shape element
   * 
   * Applies transforms in order: translate, rotate, scale, skew, perspective.
   * Handles both 2D transforms (via SVG transform attribute) and 3D perspective
   * transforms (via CSS transform on the SVG container).
   * 
   * @param config - Shape configuration
   * @param ctx - Frame context with viewport information
   */
  private applyTransforms(config: ShapeLayerConfig, ctx: FrameContext): void {
    if (!this.shapeElement || !this.svgElement) {
      return;
    }

    // Build 2D transform string for SVG transform attribute
    const transforms: string[] = [];

    // 1. Translate (position)
    const x = this.resolvePosition(config.x ?? 0, ctx.viewport.width);
    const y = this.resolvePosition(config.y ?? 0, ctx.viewport.height);
    transforms.push(`translate(${x}, ${y})`);

    // 2. Rotate (around center)
    const rotation = config.rotation ?? 0;
    if (rotation !== 0) {
      transforms.push(`rotate(${rotation})`);
    }

    // 3. Scale
    const scaleX = config.scaleX ?? 1;
    const scaleY = config.scaleY ?? 1;
    if (scaleX !== 1 || scaleY !== 1) {
      transforms.push(`scale(${scaleX}, ${scaleY})`);
    }

    // 4. Skew
    const skewX = config.skewX ?? 0;
    const skewY = config.skewY ?? 0;
    if (skewX !== 0) {
      transforms.push(`skewX(${skewX})`);
    }
    if (skewY !== 0) {
      transforms.push(`skewY(${skewY})`);
    }

    // Apply 2D transforms to shape element
    this.shapeElement.setAttribute('transform', transforms.join(' '));

    // 5. Perspective transforms (3D) - applied to SVG container via CSS
    if (this.hasPerspectiveTransforms(config)) {
      this.applyPerspectiveTransforms(config);
    } else {
      // Clear perspective transforms if not specified
      this.svgElement.style.transform = '';
      this.svgElement.style.transformStyle = '';
      this.svgElement.style.perspective = '';
    }
  }

  /**
   * Check if config has any perspective transform properties
   * 
   * @param config - Shape configuration
   * @returns True if any perspective properties are defined
   */
  private hasPerspectiveTransforms(config: ShapeLayerConfig): boolean {
    return !!(
      config.perspective ||
      config.rotateX ||
      config.rotateY ||
      config.rotateZ ||
      config.translateZ
    );
  }

  /**
   * Apply 3D perspective transforms to the SVG container
   * 
   * Uses CSS 3D transforms for perspective effects.
   * 
   * @param config - Shape configuration
   */
  private applyPerspectiveTransforms(config: ShapeLayerConfig): void {
    if (!this.svgElement) {
      return;
    }

    // Enable 3D transform context
    this.svgElement.style.transformStyle = 'preserve-3d';

    // Set perspective distance
    if (config.perspective) {
      this.svgElement.style.perspective = `${config.perspective}px`;
    }

    // Build 3D transform string
    const transforms3D: string[] = [];

    if (config.rotateX) {
      transforms3D.push(`rotateX(${config.rotateX}deg)`);
    }
    if (config.rotateY) {
      transforms3D.push(`rotateY(${config.rotateY}deg)`);
    }
    if (config.rotateZ) {
      transforms3D.push(`rotateZ(${config.rotateZ}deg)`);
    }
    if (config.translateZ) {
      transforms3D.push(`translateZ(${config.translateZ}px)`);
    }

    if (transforms3D.length > 0) {
      this.svgElement.style.transform = transforms3D.join(' ');
    }
  }

  /**
   * Resolve position value (pixels or percentage) to pixels
   * 
   * @param value - Position value (number in pixels or string percentage)
   * @param dimension - Viewport dimension (width or height)
   * @returns Position in pixels
   */
  private resolvePosition(value: number | string, dimension: number): number {
    if (typeof value === 'string') {
      // Parse percentage string (e.g., "50%")
      if (value.endsWith('%')) {
        const percentage = parseFloat(value);
        return (percentage / 100) * dimension;
      }
      // Try to parse as number
      return parseFloat(value);
    }
    return value;
  }

  /**
   * Create a dummy frame context for initial render
   * 
   * Used during mount when no real frame context is available.
   * 
   * @returns Dummy FrameContext
   */
  private createDummyFrameContext(): FrameContext {
    return {
      timeMs: 0,
      deltaMs: 0,
      quality: 'high' as const,
      viewport: {
        width: this.container?.clientWidth ?? 1920,
        height: this.container?.clientHeight ?? 1080
      },
      devicePixelRatio: window.devicePixelRatio ?? 1
    };
  }
}
