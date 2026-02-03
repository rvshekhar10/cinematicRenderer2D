/**
 * Light Layer implementation for cinematic lighting effects
 * 
 * Provides radial, spot, ambient, and vignette lighting modes with blend modes
 * for creating dramatic moods and professional visual compositions.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import type { ICinematicLayer } from '../interfaces/ICinematicLayer';
import type { LayerMountContext, FrameContext } from '../interfaces/LayerContext';

/**
 * Light layer configuration
 */
export interface LightLayerConfig {
  /** Light mode */
  mode: 'radial' | 'spot' | 'ambient' | 'vignette';
  /** Position for radial/spot lights (pixels or percentage) */
  position?: { x: number | string; y: number | string };
  /** Radius for radial/vignette lights (pixels) */
  radius?: number;
  /** Intensity (0-1) */
  intensity?: number;
  /** Light color (CSS color) */
  color?: string;
  /** Angle for spot light (degrees) */
  angle?: number;
  /** Direction for spot light (degrees, 0 = right, 90 = down) */
  direction?: number;
  /** Blend mode */
  blendMode?: 'screen' | 'overlay' | 'soft-light' | 'multiply';
  /** Layer opacity (0-1) */
  opacity?: number;
  /** Layer z-index */
  zIndex?: number;
}

/**
 * Utility function to convert position values (pixels or percentages) to pixels
 */
function resolvePosition(value: number | string, containerSize: number): number {
  if (typeof value === 'string' && value.endsWith('%')) {
    const percentage = parseFloat(value) / 100;
    return containerSize * percentage;
  }
  return typeof value === 'number' ? value : parseFloat(value) || 0;
}

/**
 * Light Layer for cinematic lighting effects
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export class LightLayer implements ICinematicLayer {
  public readonly id: string;
  public readonly type: 'light' = 'light';
  public readonly zIndex: number;
  private config: LightLayerConfig;
  private element: HTMLElement | null = null;
  private mounted: boolean = false;

  constructor(id: string, config: LightLayerConfig) {
    this.id = id;
    this.zIndex = config.zIndex || 0;
    
    // Handle both position formats: { position: { x, y } } or { x, y }
    const configAny = config as any;
    const position = config.position || {
      x: configAny.x || '50%',
      y: configAny.y || '50%'
    };
    
    this.config = {
      ...config,
      mode: config.mode || 'radial',
      position,
      radius: config.radius || 200,
      intensity: config.intensity !== undefined ? config.intensity : 1.0,
      color: config.color || '#ffffff',
      angle: config.angle || 45,
      direction: config.direction || 0,
      blendMode: config.blendMode || 'screen',
      opacity: config.opacity !== undefined ? config.opacity : 1.0,
    };
  }

  /**
   * Mount the light layer
   * Validates: Requirements 5.1
   */
  mount(ctx: LayerMountContext): void {
    if (this.mounted) return;

    // Create DOM element through the renderer
    const domRenderer = ctx.renderer as any;
    if (domRenderer.createLayerElement) {
      this.element = domRenderer.createLayerElement(this.id, this.zIndex);
      
      if (this.element) {
        // Set base styles
        this.element.style.cssText = `
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
          mix-blend-mode: ${this.config.blendMode};
          opacity: ${this.config.opacity};
        `;
        
        // Apply light-specific rendering
        this._renderLight(ctx);
      }
    }

    this.mounted = true;
  }

  /**
   * Update the light layer
   * Validates: Requirements 5.5
   */
  update(ctx: FrameContext): void {
    if (!this.mounted || !this.element) return;

    // Update opacity if changed
    if (this.config.opacity !== undefined) {
      this.element.style.opacity = this.config.opacity.toString();
    }

    // Re-render light if position or other properties changed
    this._renderLight(ctx);
  }

  /**
   * Destroy the light layer
   */
  destroy(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.mounted = false;
  }

  /**
   * Set visibility
   */
  setVisible(visible: boolean): void {
    if (this.mounted && this.element) {
      this.element.style.display = visible ? 'block' : 'none';
    }
  }

  /**
   * Set opacity
   */
  setOpacity(opacity: number): void {
    this.config.opacity = opacity;
    if (this.mounted && this.element) {
      this.element.style.opacity = opacity.toString();
    }
  }

  /**
   * Resize handler
   */
  resize(_width: number, _height: number): void {
    // Light layers are responsive by default
  }

  /**
   * Update light position
   * Validates: Requirements 5.5
   */
  setPosition(x: number | string, y: number | string): void {
    this.config.position = { x, y };
    if (this.mounted) {
      // Trigger re-render on next update
    }
  }

  /**
   * Update light intensity
   * Validates: Requirements 5.5
   */
  setIntensity(intensity: number): void {
    this.config.intensity = Math.max(0, Math.min(1, intensity));
    if (this.mounted) {
      // Trigger re-render on next update
    }
  }

  /**
   * Update light color
   * Validates: Requirements 5.5
   */
  setColor(color: string): void {
    this.config.color = color;
    if (this.mounted) {
      // Trigger re-render on next update
    }
  }

  /**
   * Update light radius
   * Validates: Requirements 5.5
   */
  setRadius(radius: number): void {
    this.config.radius = Math.max(0, radius);
    if (this.mounted) {
      // Trigger re-render on next update
    }
  }

  /**
   * Render the light based on mode
   * Validates: Requirements 5.1, 5.2, 5.3, 5.6
   */
  private _renderLight(ctx: LayerMountContext | FrameContext): void {
    if (!this.element) return;

    const { mode } = this.config;

    switch (mode) {
      case 'radial':
        this._renderRadialLight(ctx);
        break;
      case 'spot':
        this._renderSpotLight(ctx);
        break;
      case 'ambient':
        this._renderAmbientLight();
        break;
      case 'vignette':
        this._renderVignetteLight();
        break;
    }
  }

  /**
   * Render radial light
   * Validates: Requirements 5.2
   */
  private _renderRadialLight(ctx: LayerMountContext | FrameContext): void {
    if (!this.element) return;

    const { position, radius, intensity, color } = this.config;
    
    // Get viewport dimensions - use container dimensions for mount context
    const viewportWidth = 'viewport' in ctx ? ctx.viewport.width : ctx.container.clientWidth;
    const viewportHeight = 'viewport' in ctx ? ctx.viewport.height : ctx.container.clientHeight;
    
    const x = position ? resolvePosition(position.x, viewportWidth) : viewportWidth / 2;
    const y = position ? resolvePosition(position.y, viewportHeight) : viewportHeight / 2;

    // Create radial gradient
    const alpha = intensity || 1.0;
    const gradient = `radial-gradient(circle at ${x}px ${y}px, ${this._addAlpha(color!, alpha)} 0%, transparent ${radius}px)`;
    
    this.element.style.background = gradient;
  }

  /**
   * Render spot light
   * Validates: Requirements 5.3
   */
  private _renderSpotLight(ctx: LayerMountContext | FrameContext): void {
    if (!this.element) return;

    const { position, radius, intensity, color, angle, direction } = this.config;
    
    // Get viewport dimensions - use container dimensions for mount context
    const viewportWidth = 'viewport' in ctx ? ctx.viewport.width : ctx.container.clientWidth;
    const viewportHeight = 'viewport' in ctx ? ctx.viewport.height : ctx.container.clientHeight;
    
    const x = position ? resolvePosition(position.x, viewportWidth) : viewportWidth / 2;
    const y = position ? resolvePosition(position.y, viewportHeight) : viewportHeight / 2;

    // Calculate spot light cone using conic gradient
    const alpha = intensity || 1.0;
    const halfAngle = (angle || 45) / 2;
    const dir = direction || 0;
    
    // Create a conic gradient that simulates a spot light
    const startAngle = dir - halfAngle;
    
    const gradient = `conic-gradient(from ${startAngle}deg at ${x}px ${y}px, 
      transparent 0deg, 
      ${this._addAlpha(color!, alpha)} ${halfAngle}deg, 
      ${this._addAlpha(color!, alpha)} ${halfAngle}deg, 
      transparent ${angle}deg, 
      transparent 360deg)`;
    
    this.element.style.background = gradient;
    
    // Add radial falloff
    this.element.style.maskImage = `radial-gradient(circle at ${x}px ${y}px, black 0%, transparent ${radius}px)`;
    this.element.style.webkitMaskImage = `radial-gradient(circle at ${x}px ${y}px, black 0%, transparent ${radius}px)`;
  }

  /**
   * Render ambient light
   * Validates: Requirements 5.1
   */
  private _renderAmbientLight(): void {
    if (!this.element) return;

    const { intensity, color } = this.config;
    const alpha = intensity || 1.0;
    
    // Uniform color overlay
    this.element.style.background = this._addAlpha(color!, alpha);
  }

  /**
   * Render vignette light
   * Validates: Requirements 5.1
   */
  private _renderVignetteLight(): void {
    if (!this.element) return;

    const { radius, intensity, color } = this.config;
    const alpha = intensity || 1.0;
    
    // Vignette effect - darkening at edges
    const vignetteRadius = radius || 70; // percentage
    const gradient = `radial-gradient(ellipse at center, transparent ${vignetteRadius}%, ${this._addAlpha(color!, alpha)} 100%)`;
    
    this.element.style.background = gradient;
  }

  /**
   * Add alpha channel to color
   */
  private _addAlpha(color: string, alpha: number): string {
    // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // Handle rgb/rgba colors
    if (color.startsWith('rgb')) {
      // Replace existing alpha or add it
      return color.replace(/rgba?\(([^)]+)\)/, (_, values) => {
        const parts = values.split(',').map((v: string) => v.trim());
        return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
      });
    }
    
    // Handle named colors - just return as is with opacity on element
    return color;
  }
}
