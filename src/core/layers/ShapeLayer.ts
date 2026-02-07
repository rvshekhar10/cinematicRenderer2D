/**
 * ShapeLayer - Layer for rendering 2D geometric shapes
 * 
 * Provides native shape rendering capabilities with full animation support,
 * visual styling, and integration with the existing layer architecture.
 * Supports both DOM/SVG and Canvas2D rendering backends.
 * 
 * Requirements: 7.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8
 */

import type { ICinematicLayer } from '../interfaces/ICinematicLayer';
import type { LayerMountContext, FrameContext } from '../interfaces/LayerContext';
import type { IShapeRenderer, ShapeLayerConfig } from '../shapes/IShapeRenderer';
import { DOMShapeRenderer } from '../shapes/DOMShapeRenderer';
import { Canvas2DShapeRenderer } from '../shapes/Canvas2DShapeRenderer';

/**
 * ShapeLayer class for rendering geometric shapes
 * 
 * Implements ICinematicLayer interface and delegates rendering to
 * backend-specific renderers (DOM or Canvas2D).
 * 
 * Validates: Requirements 7.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8
 */
export class ShapeLayer implements ICinematicLayer {
  public readonly id: string;
  public readonly type: 'shape' = 'shape';
  public readonly zIndex: number;
  
  private config: ShapeLayerConfig;
  private renderer: IShapeRenderer | null = null;
  private mounted: boolean = false;
  private visible: boolean = true;
  private explicitOpacity: number = 1.0;

  /**
   * Create a new ShapeLayer
   * 
   * @param id - Unique identifier for the layer
   * @param config - Shape configuration
   * @throws Error if shape type is invalid or required parameters are missing
   */
  constructor(id: string, config: ShapeLayerConfig) {
    this.id = id;
    this.zIndex = config.zIndex ?? 0;
    
    // Validate shape type
    this.validateShapeType(config.shapeType);
    
    // Validate shape-specific parameters
    this.validateShapeParameters(config);
    
    // Apply default values
    this.config = this.applyDefaults(config);
  }

  /**
   * Mount the shape layer
   * 
   * Creates appropriate renderer based on backend type and initializes rendering.
   * 
   * @param ctx - Layer mount context with container and renderer information
   */
  mount(ctx: LayerMountContext): void {
    if (this.mounted) {
      return;
    }

    // Determine which renderer to use based on backend type
    const renderer = ctx.renderer;
    const rendererType = renderer.constructor.name;
    
    // Create appropriate renderer based on backend
    if (rendererType === 'Canvas2DRenderer' || rendererType.includes('Canvas')) {
      this.renderer = new Canvas2DShapeRenderer();
    } else {
      // Default to DOM renderer for DOMRenderer and other backends
      this.renderer = new DOMShapeRenderer();
    }

    // Mount the renderer
    this.renderer.mount(ctx.container, this.config);
    
    this.mounted = true;
  }

  /**
   * Update the shape layer
   * 
   * Updates shape rendering with current configuration and frame context.
   * Handles animated property values.
   * 
   * @param ctx - Frame context with timing and viewport information
   */
  update(ctx: FrameContext): void {
    if (!this.mounted || !this.renderer) {
      return;
    }

    // Update visibility
    this.renderer.setVisible(this.visible);
    
    // Update opacity (combine config opacity with explicit opacity)
    const configOpacity = this.config.opacity ?? 1.0;
    const finalOpacity = configOpacity * this.explicitOpacity;
    this.renderer.setOpacity(finalOpacity);

    // Render with current configuration
    this.renderer.render(this.config, ctx);
  }

  /**
   * Destroy the shape layer
   * 
   * Cleans up renderer and releases resources.
   */
  destroy(): void {
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }
    
    this.mounted = false;
  }

  /**
   * Resize handler
   * 
   * Called when viewport size changes. Shape layers are responsive by default
   * through percentage-based positioning.
   * 
   * @param _width - New viewport width
   * @param _height - New viewport height
   */
  resize(_width: number, _height: number): void {
    // Shape layers handle resize through percentage-based positioning
    // No explicit action needed as next update() will use new viewport dimensions
  }

  /**
   * Set visibility
   * 
   * @param visible - Whether the shape should be visible
   */
  setVisible(visible: boolean): void {
    this.visible = visible;
    if (this.renderer) {
      this.renderer.setVisible(visible);
    }
  }

  /**
   * Set opacity
   * 
   * @param opacity - Opacity value from 0.0 (transparent) to 1.0 (opaque)
   */
  setOpacity(opacity: number): void {
    this.explicitOpacity = Math.max(0, Math.min(1, opacity));
    if (this.renderer) {
      const configOpacity = this.config.opacity ?? 1.0;
      const finalOpacity = configOpacity * this.explicitOpacity;
      this.renderer.setOpacity(finalOpacity);
    }
  }

  /**
   * Update shape configuration
   * 
   * Allows updating shape properties dynamically (useful for animations).
   * 
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<ShapeLayerConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }

  /**
   * Get current configuration
   * 
   * @returns Current shape configuration
   */
  getConfig(): Readonly<ShapeLayerConfig> {
    return this.config;
  }

  /**
   * Validate shape type
   * 
   * @param shapeType - Shape type to validate
   * @throws Error if shape type is not supported
   */
  private validateShapeType(shapeType: string): void {
    const validTypes = [
      'rectangle',
      'square',
      'circle',
      'ellipse',
      'triangle',
      'trapezoid',
      'polygon',
      'star'
    ];

    if (!validTypes.includes(shapeType)) {
      throw new Error(
        `Invalid shape type: '${shapeType}'. Supported types: ${validTypes.join(', ')}`
      );
    }
  }

  /**
   * Validate shape-specific parameters
   * 
   * Ensures required parameters are present for each shape type.
   * 
   * @param config - Shape configuration to validate
   * @throws Error if required parameters are missing
   */
  private validateShapeParameters(config: ShapeLayerConfig): void {
    switch (config.shapeType) {
      case 'rectangle':
        if (config.width === undefined || config.height === undefined) {
          throw new Error(
            "Missing required parameter 'width' or 'height' for shape type 'rectangle'"
          );
        }
        if (config.width <= 0 || config.height <= 0) {
          throw new Error(
            `Invalid value for 'width' or 'height': must be positive numbers`
          );
        }
        break;

      case 'square':
        if (config.size === undefined) {
          throw new Error(
            "Missing required parameter 'size' for shape type 'square'"
          );
        }
        if (config.size <= 0) {
          throw new Error(
            `Invalid value for 'size': ${config.size}. Expected positive number`
          );
        }
        break;

      case 'circle':
        if (config.radius === undefined) {
          throw new Error(
            "Missing required parameter 'radius' for shape type 'circle'"
          );
        }
        if (config.radius <= 0) {
          throw new Error(
            `Invalid value for 'radius': ${config.radius}. Expected positive number`
          );
        }
        break;

      case 'ellipse':
        if (config.radiusX === undefined || config.radiusY === undefined) {
          throw new Error(
            "Missing required parameter 'radiusX' or 'radiusY' for shape type 'ellipse'"
          );
        }
        if (config.radiusX <= 0 || config.radiusY <= 0) {
          throw new Error(
            `Invalid value for 'radiusX' or 'radiusY': must be positive numbers`
          );
        }
        break;

      case 'triangle':
        if (!config.vertices || config.vertices.length !== 3) {
          throw new Error(
            "Missing required parameter 'vertices' for shape type 'triangle'. Expected array of 3 vertices"
          );
        }
        break;

      case 'trapezoid':
        if (
          config.topWidth === undefined ||
          config.bottomWidth === undefined ||
          config.height === undefined
        ) {
          throw new Error(
            "Missing required parameter 'topWidth', 'bottomWidth', or 'height' for shape type 'trapezoid'"
          );
        }
        if (config.topWidth <= 0 || config.bottomWidth <= 0 || config.height <= 0) {
          throw new Error(
            `Invalid value for 'topWidth', 'bottomWidth', or 'height': must be positive numbers`
          );
        }
        break;

      case 'polygon':
        if (config.sides === undefined || config.radius === undefined) {
          throw new Error(
            "Missing required parameter 'sides' or 'radius' for shape type 'polygon'"
          );
        }
        if (config.sides < 3) {
          throw new Error(
            `Invalid value for 'sides': ${config.sides}. Expected at least 3`
          );
        }
        if (config.radius <= 0) {
          throw new Error(
            `Invalid value for 'radius': ${config.radius}. Expected positive number`
          );
        }
        break;

      case 'star':
        if (
          config.points === undefined ||
          config.innerRadius === undefined ||
          config.outerRadius === undefined
        ) {
          throw new Error(
            "Missing required parameter 'points', 'innerRadius', or 'outerRadius' for shape type 'star'"
          );
        }
        if (config.points < 3) {
          throw new Error(
            `Invalid value for 'points': ${config.points}. Expected at least 3`
          );
        }
        if (config.innerRadius <= 0 || config.outerRadius <= 0) {
          throw new Error(
            `Invalid value for 'innerRadius' or 'outerRadius': must be positive numbers`
          );
        }
        if (config.innerRadius >= config.outerRadius) {
          throw new Error(
            `Invalid value for 'innerRadius': ${config.innerRadius}. Expected less than outerRadius (${config.outerRadius})`
          );
        }
        break;
    }
  }

  /**
   * Apply default values to configuration
   * 
   * Provides sensible defaults for optional properties.
   * Transform order: translate, rotate, scale, skew (as per requirements 2.7)
   * 
   * @param config - Shape configuration
   * @returns Configuration with defaults applied
   */
  private applyDefaults(config: ShapeLayerConfig): ShapeLayerConfig {
    return {
      ...config,
      // Transform properties (defaults per requirement 2.8)
      x: config.x ?? 0,
      y: config.y ?? 0,
      rotation: config.rotation ?? 0,
      scaleX: config.scaleX ?? 1,
      scaleY: config.scaleY ?? 1,
      skewX: config.skewX ?? 0,
      skewY: config.skewY ?? 0,
      // Visual properties (defaults per requirement 3.8)
      fillColor: config.fillColor ?? '#000000',
      strokeColor: config.strokeColor,
      strokeWidth: config.strokeWidth ?? 0,
      opacity: config.opacity ?? 1.0,
      blendMode: config.blendMode,
      // Camera integration
      ignoreCameraTransform: config.ignoreCameraTransform ?? false
    };
  }
}
