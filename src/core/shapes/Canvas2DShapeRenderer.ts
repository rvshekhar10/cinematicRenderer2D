/**
 * Canvas2DShapeRenderer - Canvas API-based shape renderer for Canvas2D backend
 * 
 * Renders shapes using HTML Canvas 2D context with full support for:
 * - All shape types via Canvas2D path API
 * - 2D transforms (translate, rotate, scale, skew)
 * - Visual properties (fill, stroke, opacity, blend modes)
 * 
 * Requirements: 8.1, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5
 */

import type { IShapeRenderer, ShapeLayerConfig } from './IShapeRenderer';
import type { FrameContext } from '../interfaces/LayerContext';
import { ShapeGeometry, type CanvasCommand } from './ShapeGeometry';

/**
 * Canvas2D-based shape renderer implementation
 * 
 * Creates and manages canvas elements for shape rendering with full transform
 * and visual property support using Canvas 2D API.
 */
export class Canvas2DShapeRenderer implements IShapeRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private container: HTMLElement | null = null;
  private currentConfig: ShapeLayerConfig | null = null;
  private visible: boolean = true;
  private explicitOpacity: number = 1.0;

  /**
   * Mount the renderer to a container element
   * 
   * Creates canvas element and gets 2D context, applies initial configuration.
   * 
   * @param container - The HTML element to mount the renderer into
   * @param config - Initial shape configuration
   */
  mount(container: HTMLElement, config: ShapeLayerConfig): void {
    this.container = container;
    this.currentConfig = config;

    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';

    // Set canvas size to match container
    this.canvas.width = container.clientWidth || 1920;
    this.canvas.height = container.clientHeight || 1080;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';

    // Get 2D context
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    // Add canvas to container
    container.appendChild(this.canvas);

    // Apply initial rendering
    this.render(config, this.createDummyFrameContext());
  }

  /**
   * Render the shape with current configuration
   * 
   * Clears canvas, applies transforms, draws shape, and applies visual properties.
   * Transforms are applied using context save/restore and transform methods.
   * 
   * @param config - Current shape configuration (may have animated values)
   * @param ctx - Frame context with timing and viewport information
   */
  render(config: ShapeLayerConfig, frameCtx: FrameContext): void {
    if (!this.ctx || !this.canvas) {
      return;
    }

    this.currentConfig = config;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Skip rendering if not visible
    if (!this.visible) {
      return;
    }

    // Save context state
    this.ctx.save();

    try {
      // Apply transforms
      this.applyTransforms(config, frameCtx);

      // Begin path
      this.ctx.beginPath();

      // Draw shape using canvas commands
      this.drawShape(config);

      // Apply visual properties and render
      this.applyVisualProperties(config);

    } finally {
      // Restore context state
      this.ctx.restore();
    }
  }

  /**
   * Destroy the renderer and clean up resources
   * 
   * Removes canvas element and releases references.
   */
  destroy(): void {
    if (this.canvas && this.container) {
      this.container.removeChild(this.canvas);
    }
    
    this.canvas = null;
    this.ctx = null;
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
    if (this.currentConfig) {
      this.render(this.currentConfig, this.createDummyFrameContext());
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
      this.render(this.currentConfig, this.createDummyFrameContext());
    }
  }

  /**
   * Draw the shape using Canvas2D path commands
   * 
   * @param config - Shape configuration
   */
  private drawShape(config: ShapeLayerConfig): void {
    if (!this.ctx) {
      return;
    }

    // Generate shape path data
    const pathData = this.generatePathData(config);

    // Execute canvas commands
    for (const command of pathData.canvasCommands) {
      this.executeCanvasCommand(command);
    }
  }

  /**
   * Execute a single canvas drawing command
   * 
   * @param command - Canvas command to execute
   */
  private executeCanvasCommand(command: CanvasCommand): void {
    if (!this.ctx) {
      return;
    }

    switch (command.type) {
      case 'moveTo':
        this.ctx.moveTo(command.args[0]!, command.args[1]!);
        break;

      case 'lineTo':
        this.ctx.lineTo(command.args[0]!, command.args[1]!);
        break;

      case 'arc':
        // arc(x, y, radius, startAngle, endAngle, counterclockwise?)
        this.ctx.arc(
          command.args[0]!,
          command.args[1]!,
          command.args[2]!,
          command.args[3]!,
          command.args[4]!,
          command.args[5] !== undefined ? !!command.args[5] : false
        );
        break;

      case 'arcTo':
        // arcTo(x1, y1, x2, y2, radius)
        this.ctx.arcTo(
          command.args[0]!,
          command.args[1]!,
          command.args[2]!,
          command.args[3]!,
          command.args[4]!
        );
        break;

      case 'bezierCurveTo':
        // bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)
        this.ctx.bezierCurveTo(
          command.args[0]!,
          command.args[1]!,
          command.args[2]!,
          command.args[3]!,
          command.args[4]!,
          command.args[5]!
        );
        break;

      case 'quadraticCurveTo':
        // quadraticCurveTo(cpx, cpy, x, y)
        this.ctx.quadraticCurveTo(
          command.args[0]!,
          command.args[1]!,
          command.args[2]!,
          command.args[3]!
        );
        break;

      case 'closePath':
        this.ctx.closePath();
        break;

      default:
        console.warn(`Unknown canvas command type: ${(command as CanvasCommand).type}`);
    }
  }

  /**
   * Generate path data for the current shape type
   * 
   * @param config - Shape configuration
   * @returns PathData with canvas commands
   */
  private generatePathData(config: ShapeLayerConfig): { canvasCommands: CanvasCommand[] } {
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
   * Apply visual properties to the shape
   * 
   * Handles fill, stroke, opacity, and blend modes.
   * Fills and/or strokes the current path based on configuration.
   * 
   * @param config - Shape configuration
   */
  private applyVisualProperties(config: ShapeLayerConfig): void {
    if (!this.ctx) {
      return;
    }

    // Opacity (combine config opacity with explicit opacity)
    const configOpacity = config.opacity ?? 1.0;
    const finalOpacity = configOpacity * this.explicitOpacity;
    this.ctx.globalAlpha = finalOpacity;

    // Blend mode (default: source-over which is 'normal')
    if (config.blendMode) {
      // Map CSS blend modes to Canvas composite operations
      this.ctx.globalCompositeOperation = this.mapBlendModeToCompositeOp(config.blendMode);
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
    }

    // Determine if we should fill and/or stroke
    const hasFill = config.fillColor !== undefined && config.fillColor !== 'none';
    const hasStroke = config.strokeColor !== undefined && 
                      config.strokeColor !== 'none' && 
                      (config.strokeWidth ?? 0) > 0;

    // Apply fill
    if (hasFill) {
      this.ctx.fillStyle = config.fillColor ?? '#000000';
      this.ctx.fill();
    }

    // Apply stroke
    if (hasStroke) {
      this.ctx.strokeStyle = config.strokeColor!;
      this.ctx.lineWidth = config.strokeWidth ?? 1;
      this.ctx.stroke();
    }

    // If neither fill nor stroke specified, default to fill with black
    if (!hasFill && !hasStroke) {
      this.ctx.fillStyle = '#000000';
      this.ctx.fill();
    }
  }

  /**
   * Map CSS blend mode to Canvas composite operation
   * 
   * @param blendMode - CSS blend mode string
   * @returns Canvas globalCompositeOperation value
   */
  private mapBlendModeToCompositeOp(blendMode: string): GlobalCompositeOperation {
    // Canvas2D supports many blend modes directly
    const supportedModes: Record<string, GlobalCompositeOperation> = {
      'normal': 'source-over',
      'multiply': 'multiply',
      'screen': 'screen',
      'overlay': 'overlay',
      'darken': 'darken',
      'lighten': 'lighten',
      'color-dodge': 'color-dodge',
      'color-burn': 'color-burn',
      'hard-light': 'hard-light',
      'soft-light': 'soft-light',
      'difference': 'difference',
      'exclusion': 'exclusion',
      'hue': 'hue',
      'saturation': 'saturation',
      'color': 'color',
      'luminosity': 'luminosity'
    };

    return supportedModes[blendMode] ?? 'source-over';
  }

  /**
   * Apply transforms to the canvas context
   * 
   * Applies transforms in order: translate, rotate, scale, skew.
   * Uses canvas context transform methods.
   * 
   * @param config - Shape configuration
   * @param frameCtx - Frame context with viewport information
   */
  private applyTransforms(config: ShapeLayerConfig, frameCtx: FrameContext): void {
    if (!this.ctx || !this.canvas) {
      return;
    }

    // 1. Translate to position
    const x = this.resolvePosition(config.x ?? 0, frameCtx.viewport.width);
    const y = this.resolvePosition(config.y ?? 0, frameCtx.viewport.height);
    this.ctx.translate(x, y);

    // 2. Rotate (around current origin)
    const rotation = config.rotation ?? 0;
    if (rotation !== 0) {
      const radians = (rotation * Math.PI) / 180;
      this.ctx.rotate(radians);
    }

    // 3. Scale
    const scaleX = config.scaleX ?? 1;
    const scaleY = config.scaleY ?? 1;
    if (scaleX !== 1 || scaleY !== 1) {
      this.ctx.scale(scaleX, scaleY);
    }

    // 4. Skew (using transform matrix)
    const skewX = config.skewX ?? 0;
    const skewY = config.skewY ?? 0;
    if (skewX !== 0 || skewY !== 0) {
      const skewXRad = (skewX * Math.PI) / 180;
      const skewYRad = (skewY * Math.PI) / 180;
      // Apply skew using transform matrix: [1, tan(skewY), tan(skewX), 1, 0, 0]
      this.ctx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
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
