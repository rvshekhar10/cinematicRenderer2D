/**
 * Built-in layer type implementations
 * DOM layers fully implemented for Task 7.1
 * Canvas2D layers will be completed in Task 8.1
 */

import type { ICinematicLayer } from '../interfaces/ICinematicLayer';
import type { LayerMountContext, FrameContext } from '../interfaces/LayerContext';

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
 * Base class for built-in layers with common functionality
 */
abstract class BaseLayer implements ICinematicLayer {
  public readonly id: string;
  public readonly type: string;
  public readonly zIndex: number;
  protected config: Record<string, any>;
  protected mounted: boolean = false;

  constructor(id: string, type: string, config: Record<string, any>) {
    this.id = id;
    this.type = type;
    this.zIndex = config['zIndex'] || 0;
    this.config = config;
  }

  abstract mount(ctx: LayerMountContext): void;
  abstract update(ctx: FrameContext): void;
  
  destroy(): void {
    this.mounted = false;
  }

  setVisible(_visible: boolean): void {
    // Default implementation - can be overridden
    if (this.mounted) {
      // Will be implemented in specific renderers
    }
  }

  setOpacity(_opacity: number): void {
    // Default implementation - can be overridden
    if (this.mounted) {
      // Will be implemented in specific renderers
    }
  }

  resize(_width: number, _height: number): void {
    // Default implementation - can be overridden
    if (this.mounted) {
      // Will be implemented in specific renderers
    }
  }
}

// DOM Layer Types (fully implemented for Task 7.1)

export class GradientLayer extends BaseLayer {
  private element?: HTMLElement;

  constructor(id: string, config: Record<string, any>) {
    super(id, 'gradient', config);
  }

  mount(ctx: LayerMountContext): void {
    if (this.mounted) return;

    // Create DOM element through the renderer
    const domRenderer = ctx.renderer as any; // Type assertion for DOMRenderer methods
    if (domRenderer.createLayerElement) {
      this.element = domRenderer.createLayerElement(this.id, this.zIndex);
      
      // Apply gradient styles
      const { 
        colors = ['#000000', '#ffffff'], 
        direction = 'to bottom', 
        opacity = 1,
        width = '100%',
        height = '100%'
      } = this.config;
      const gradientColors = colors.join(', ');
      
      if (this.element) {
        this.element.style.cssText += `
          background: linear-gradient(${direction}, ${gradientColors});
          opacity: ${opacity};
          width: ${typeof width === 'number' ? width + 'px' : width};
          height: ${typeof height === 'number' ? height + 'px' : height};
          position: absolute;
        `;
      }
    }

    this.mounted = true;
  }

  update(ctx: FrameContext): void {
    if (!this.mounted || !this.element) return;

    // Resolve position values to pixels
    const { x = 0, y = 0, scale = 1, rotation = 0, opacity = 1 } = this.config;
    const resolvedX = resolvePosition(x, ctx.viewport.width);
    const resolvedY = resolvePosition(y, ctx.viewport.height);
    
    this.element.style.transform = `translate3d(${resolvedX}px, ${resolvedY}px, 0) scale(${scale}) rotate(${rotation}deg)`;
    this.element.style.opacity = opacity.toString();
  }

  override destroy(): void {
    if (this.element) {
      const domRenderer = this.element.parentElement?.parentElement as any;
      if (domRenderer && domRenderer.removeLayerElement) {
        domRenderer.removeLayerElement(this.id);
      }
    }
    super.destroy();
  }
}

export class ImageLayer extends BaseLayer {
  private element?: HTMLElement;
  private img?: HTMLImageElement;

  constructor(id: string, config: Record<string, any>) {
    super(id, 'image', config);
  }

  mount(ctx: LayerMountContext): void {
    if (this.mounted) return;

    // Create DOM element through the renderer
    const domRenderer = ctx.renderer as any;
    if (domRenderer.createLayerElement) {
      this.element = domRenderer.createLayerElement(this.id, this.zIndex);
      
      // Create image element
      this.img = document.createElement('img');
      const { src, alt = '', objectFit = 'cover', opacity = 1 } = this.config;
      
      if (this.img && this.element) {
        this.img.src = src;
        this.img.alt = alt;
        this.img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: ${objectFit};
          opacity: ${opacity};
          display: block;
        `;
        
        this.element.appendChild(this.img);
      }
    }

    this.mounted = true;
  }

  update(ctx: FrameContext): void {
    if (!this.mounted || !this.element) return;

    // Resolve position values to pixels
    const { x = 0, y = 0, scale = 1, rotation = 0, opacity = 1 } = this.config;
    const resolvedX = resolvePosition(x, ctx.viewport.width);
    const resolvedY = resolvePosition(y, ctx.viewport.height);
    
    this.element.style.transform = `translate3d(${resolvedX}px, ${resolvedY}px, 0) scale(${scale}) rotate(${rotation}deg)`;
    this.element.style.opacity = opacity.toString();
  }

  override destroy(): void {
    if (this.element) {
      const domRenderer = this.element.parentElement?.parentElement as any;
      if (domRenderer && domRenderer.removeLayerElement) {
        domRenderer.removeLayerElement(this.id);
      }
    }
    super.destroy();
  }
}

export class TextBlockLayer extends BaseLayer {
  private element?: HTMLElement;

  constructor(id: string, config: Record<string, any>) {
    super(id, 'textBlock', config);
  }

  mount(ctx: LayerMountContext): void {
    if (this.mounted) return;

    // Create DOM element through the renderer
    const domRenderer = ctx.renderer as any;
    if (domRenderer.createLayerElement) {
      this.element = domRenderer.createLayerElement(this.id, this.zIndex);
      
      // Apply text styles
      const { 
        text = '', 
        fontSize = '16px', 
        fontFamily = 'Arial, sans-serif',
        color = '#ffffff',
        textAlign = 'center',
        opacity = 1,
        textShadow = 'none',
        fontWeight = 'normal',
        letterSpacing = 'normal'
      } = this.config;
      
      if (this.element) {
        this.element.innerHTML = text;
        this.element.style.cssText += `
          font-size: ${typeof fontSize === 'number' ? fontSize + 'px' : fontSize};
          font-family: ${fontFamily};
          color: ${color};
          text-align: ${textAlign};
          opacity: ${opacity};
          text-shadow: ${textShadow};
          font-weight: ${fontWeight};
          letter-spacing: ${letterSpacing};
          display: flex;
          align-items: center;
          justify-content: ${textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center'};
          white-space: pre-wrap;
          position: absolute;
          width: auto;
          height: auto;
          min-width: max-content;
        `;
      }
    }

    this.mounted = true;
  }

  update(ctx: FrameContext): void {
    if (!this.mounted || !this.element) return;

    // Resolve position values to pixels
    const { x = 0, y = 0, scale = 1, rotation = 0, opacity = 1, textAlign = 'center' } = this.config;
    const resolvedX = resolvePosition(x, ctx.viewport.width);
    const resolvedY = resolvePosition(y, ctx.viewport.height);
    
    // Adjust positioning based on text alignment to center the text at the specified position
    let transformOrigin = 'center center';
    let translateX = '-50%';
    let translateY = '-50%';
    
    if (textAlign === 'left') {
      transformOrigin = 'left center';
      translateX = '0%';
    } else if (textAlign === 'right') {
      transformOrigin = 'right center';
      translateX = '-100%';
    }
    
    this.element.style.transformOrigin = transformOrigin;
    this.element.style.transform = `translate3d(${resolvedX}px, ${resolvedY}px, 0) translate(${translateX}, ${translateY}) scale(${scale}) rotate(${rotation}deg)`;
    this.element.style.opacity = opacity.toString();
  }

  override destroy(): void {
    if (this.element) {
      const domRenderer = this.element.parentElement?.parentElement as any;
      if (domRenderer && domRenderer.removeLayerElement) {
        domRenderer.removeLayerElement(this.id);
      }
    }
    super.destroy();
  }
}

export class VignetteLayer extends BaseLayer {
  private element?: HTMLElement;

  constructor(id: string, config: Record<string, any>) {
    super(id, 'vignette', config);
  }

  mount(ctx: LayerMountContext): void {
    if (this.mounted) return;

    // Create DOM element through the renderer
    const domRenderer = ctx.renderer as any;
    if (domRenderer.createLayerElement) {
      this.element = domRenderer.createLayerElement(this.id, this.zIndex);
      
      // Apply vignette styles
      const { 
        color = '#000000', 
        intensity = 0.5, 
        size = '50%',
        opacity = 1 
      } = this.config;
      
      if (this.element) {
        this.element.style.cssText += `
          background: radial-gradient(ellipse ${size} ${size} at center, transparent 0%, ${color} 100%);
          opacity: ${opacity * intensity};
          pointer-events: none;
        `;
      }
    }

    this.mounted = true;
  }

  update(ctx: FrameContext): void {
    if (!this.mounted || !this.element) return;

    // Resolve position values to pixels
    const { x = 0, y = 0, scale = 1, rotation = 0, opacity = 1 } = this.config;
    const resolvedX = resolvePosition(x, ctx.viewport.width);
    const resolvedY = resolvePosition(y, ctx.viewport.height);
    
    this.element.style.transform = `translate3d(${resolvedX}px, ${resolvedY}px, 0) scale(${scale}) rotate(${rotation}deg)`;
    this.element.style.opacity = opacity.toString();
  }

  override destroy(): void {
    if (this.element) {
      const domRenderer = this.element.parentElement?.parentElement as any;
      if (domRenderer && domRenderer.removeLayerElement) {
        domRenderer.removeLayerElement(this.id);
      }
    }
    super.destroy();
  }
}

export class GlowOrbLayer extends BaseLayer {
  private element?: HTMLElement;

  constructor(id: string, config: Record<string, any>) {
    super(id, 'glowOrb', config);
  }

  mount(ctx: LayerMountContext): void {
    if (this.mounted) return;

    // Create DOM element through the renderer
    const domRenderer = ctx.renderer as any;
    if (domRenderer.createLayerElement) {
      this.element = domRenderer.createLayerElement(this.id, this.zIndex);
      
      // Apply glow orb styles
      const { 
        color = '#ffffff', 
        radius = 50,
        blur = 20,
        intensity = 0.8
      } = this.config;
      
      if (this.element) {
        this.element.style.cssText += `
          background: radial-gradient(circle, ${color} 0%, transparent 70%);
          width: ${radius * 2}px;
          height: ${radius * 2}px;
          border-radius: 50%;
          filter: blur(${blur}px);
          opacity: ${intensity};
          pointer-events: none;
          position: absolute;
        `;
      }
    }

    this.mounted = true;
  }

  update(ctx: FrameContext): void {
    if (!this.mounted || !this.element) return;

    // Resolve position values to pixels and center the orb
    const { x = 0, y = 0, scale = 1, rotation = 0, intensity = 0.8, radius = 50 } = this.config;
    const resolvedX = resolvePosition(x, ctx.viewport.width) - radius;
    const resolvedY = resolvePosition(y, ctx.viewport.height) - radius;
    
    this.element.style.transform = `translate3d(${resolvedX}px, ${resolvedY}px, 0) scale(${scale}) rotate(${rotation}deg)`;
    this.element.style.opacity = intensity.toString();
  }

  override destroy(): void {
    if (this.element) {
      const domRenderer = this.element.parentElement?.parentElement as any;
      if (domRenderer && domRenderer.removeLayerElement) {
        domRenderer.removeLayerElement(this.id);
      }
    }
    super.destroy();
  }
}

export class NoiseOverlayLayer extends BaseLayer {
  private element?: HTMLElement;
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;

  constructor(id: string, config: Record<string, any>) {
    super(id, 'noiseOverlay', config);
  }

  mount(ctx: LayerMountContext): void {
    if (this.mounted) return;

    // Create DOM element through the renderer
    const domRenderer = ctx.renderer as any;
    if (domRenderer.createLayerElement) {
      this.element = domRenderer.createLayerElement(this.id, this.zIndex);
      
      // Create canvas for noise generation
      this.canvas = document.createElement('canvas');
      const canvasContext = this.canvas.getContext('2d');
      if (canvasContext) {
        this.ctx = canvasContext;
      }
      
      const { opacity = 0.1 } = this.config;
      
      if (this.canvas && this.element) {
        this.canvas.style.cssText = `
          width: 100%;
          height: 100%;
          opacity: ${opacity};
          mix-blend-mode: overlay;
          pointer-events: none;
        `;
        
        this.element.appendChild(this.canvas);
        this.generateNoise();
      }
    }

    this.mounted = true;
  }

  update(ctx: FrameContext): void {
    if (!this.mounted || !this.element) return;

    // Resolve position values to pixels
    const { x = 0, y = 0, scale = 1, rotation = 0, opacity = 0.1 } = this.config;
    const resolvedX = resolvePosition(x, ctx.viewport.width);
    const resolvedY = resolvePosition(y, ctx.viewport.height);
    
    this.element.style.transform = `translate3d(${resolvedX}px, ${resolvedY}px, 0) scale(${scale}) rotate(${rotation}deg)`;
    this.element.style.opacity = opacity.toString();

    // Optionally regenerate noise for animated effect
    const { animated = false, animationSpeed = 100 } = this.config;
    if (animated && ctx.timeMs % animationSpeed < ctx.deltaMs) {
      this.generateNoise();
    }
  }

  private generateNoise(): void {
    if (!this.canvas || !this.ctx) return;

    const { width = 256, height = 256, intensity = 0.5 } = this.config;
    
    this.canvas.width = width;
    this.canvas.height = height;
    
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255 * intensity;
      data[i] = noise;     // Red
      data[i + 1] = noise; // Green
      data[i + 2] = noise; // Blue
      data[i + 3] = 255;   // Alpha
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  override resize(_width: number, _height: number): void {
    if (this.canvas) {
      // Update canvas size and regenerate noise
      this.generateNoise();
    }
  }

  override destroy(): void {
    if (this.element) {
      const domRenderer = this.element.parentElement?.parentElement as any;
      if (domRenderer && domRenderer.removeLayerElement) {
        domRenderer.removeLayerElement(this.id);
      }
    }
    super.destroy();
  }
}

// Canvas2D Layer Types (will be fully implemented in Task 8.1)

export class ParticlesLayer extends BaseLayer {
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private particles: any[] = [];
  private canvas2DRenderer?: any;

  constructor(id: string, config: Record<string, any>) {
    super(id, 'particles', config);
  }

  mount(ctx: LayerMountContext): void {
    if (this.mounted) return;

    // Get Canvas2D renderer
    this.canvas2DRenderer = ctx.renderer;
    
    // Create dedicated canvas for this layer if needed
    if (this.canvas2DRenderer && this.canvas2DRenderer.createLayerCanvas) {
      const { width = ctx.container.clientWidth, height = ctx.container.clientHeight } = this.config;
      this.canvas = this.canvas2DRenderer.createLayerCanvas(width, height);
      if (this.canvas) {
        const context = this.canvas.getContext('2d');
        this.ctx = context || undefined;
        
        // Style the canvas
        this.canvas.style.cssText += `
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: ${this.zIndex};
        `;
        
        // Add to container
        ctx.container.appendChild(this.canvas);
      }
    }

    this.mounted = true;
  }

  update(ctx: FrameContext): void {
    if (!this.mounted || !this.canvas || !this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Get configuration
    const {
      count = 100,
      color = '#ffffff',
      size = 2,
      speed = 1,
      opacity = 0.8,
      type = 'circle',
      x = 0,
      y = 0,
      scale = 1,
      rotation = 0
    } = this.config;
    
    // Resolve position values to pixels
    const resolvedX = resolvePosition(x, ctx.viewport.width);
    const resolvedY = resolvePosition(y, ctx.viewport.height);
    
    // Apply layer transforms
    this.ctx.save();
    this.ctx.translate(resolvedX, resolvedY);
    this.ctx.scale(scale, scale);
    this.ctx.rotate(rotation * Math.PI / 180);
    this.ctx.globalAlpha = opacity;
    
    // Initialize particles if needed
    if (this.particles.length === 0) {
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * ctx.viewport.width,
          y: Math.random() * ctx.viewport.height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: size * (0.5 + Math.random() * 0.5),
          opacity: 0.5 + Math.random() * 0.5,
          life: 0,
          maxLife: 5000 + Math.random() * 10000
        });
      }
    }
    
    // Update and render particles
    this.ctx.fillStyle = color;
    for (const particle of this.particles) {
      // Update position
      particle.x += particle.vx * ctx.deltaMs / 16.67;
      particle.y += particle.vy * ctx.deltaMs / 16.67;
      particle.life += ctx.deltaMs;
      
      // Wrap around screen
      if (particle.x < 0) particle.x = ctx.viewport.width;
      if (particle.x > ctx.viewport.width) particle.x = 0;
      if (particle.y < 0) particle.y = ctx.viewport.height;
      if (particle.y > ctx.viewport.height) particle.y = 0;
      
      // Reset if lifetime exceeded
      if (particle.life >= particle.maxLife) {
        particle.x = Math.random() * ctx.viewport.width;
        particle.y = Math.random() * ctx.viewport.height;
        particle.life = 0;
      }
      
      // Render particle
      this.ctx.save();
      this.ctx.globalAlpha = particle.opacity * opacity;
      
      if (type === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (type === 'square') {
        this.ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
      }
      
      this.ctx.restore();
    }
    
    this.ctx.restore();
  }

  override destroy(): void {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.particles = [];
    super.destroy();
  }
}

export class StarfieldLayer extends BaseLayer {
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private stars: any[] = [];
  private canvas2DRenderer?: any;

  constructor(id: string, config: Record<string, any>) {
    super(id, 'starfield', config);
  }

  mount(ctx: LayerMountContext): void {
    if (this.mounted) return;

    // Get Canvas2D renderer
    this.canvas2DRenderer = ctx.renderer;
    
    // Create dedicated canvas for this layer
    if (this.canvas2DRenderer && this.canvas2DRenderer.createLayerCanvas) {
      const { width = ctx.container.clientWidth, height = ctx.container.clientHeight } = this.config;
      this.canvas = this.canvas2DRenderer.createLayerCanvas(width, height);
      if (this.canvas) {
        const context = this.canvas.getContext('2d');
        this.ctx = context || undefined;
        
        // Style the canvas
        this.canvas.style.cssText += `
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: ${this.zIndex};
        `;
        
        // Add to container
        ctx.container.appendChild(this.canvas);
      }
    }

    this.mounted = true;
  }

  update(ctx: FrameContext): void {
    if (!this.mounted || !this.canvas || !this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Get configuration
    const {
      count = 200,
      color = '#ffffff',
      minSize = 0.5,
      maxSize = 2,
      speed = 0.5,
      opacity = 0.8,
      twinkle = true,
      x = 0,
      y = 0,
      scale = 1,
      rotation = 0
    } = this.config;
    
    // Resolve position values to pixels
    const resolvedX = resolvePosition(x, ctx.viewport.width);
    const resolvedY = resolvePosition(y, ctx.viewport.height);
    
    // Apply layer transforms
    this.ctx.save();
    this.ctx.translate(resolvedX, resolvedY);
    this.ctx.scale(scale, scale);
    this.ctx.rotate(rotation * Math.PI / 180);
    this.ctx.globalAlpha = opacity;
    
    // Initialize stars if needed
    if (this.stars.length === 0) {
      for (let i = 0; i < count; i++) {
        this.stars.push({
          x: Math.random() * ctx.viewport.width,
          y: Math.random() * ctx.viewport.height,
          z: Math.random() * 1000,
          size: minSize + Math.random() * (maxSize - minSize),
          baseOpacity: 0.3 + Math.random() * 0.7,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.5 + Math.random() * 1.5
        });
      }
    }
    
    // Update and render stars
    this.ctx.fillStyle = color;
    for (const star of this.stars) {
      // Update z position for parallax effect
      star.z -= speed * ctx.deltaMs / 16.67;
      
      // Reset star when it goes behind camera
      if (star.z <= 0) {
        star.z = 1000;
        star.x = Math.random() * ctx.viewport.width;
        star.y = Math.random() * ctx.viewport.height;
      }
      
      // Calculate screen position with perspective
      const perspective = 500;
      const screenX = (star.x - ctx.viewport.width / 2) * (perspective / star.z) + ctx.viewport.width / 2;
      const screenY = (star.y - ctx.viewport.height / 2) * (perspective / star.z) + ctx.viewport.height / 2;
      
      // Calculate size based on distance
      const starSize = star.size * (perspective / star.z);
      
      // Skip if star is off screen
      if (screenX < -starSize || screenX > ctx.viewport.width + starSize ||
          screenY < -starSize || screenY > ctx.viewport.height + starSize) {
        continue;
      }
      
      // Calculate opacity with twinkling effect
      let starOpacity = star.baseOpacity;
      if (twinkle) {
        star.twinklePhase += star.twinkleSpeed * ctx.deltaMs / 1000;
        starOpacity *= 0.5 + 0.5 * Math.sin(star.twinklePhase);
      }
      
      // Render star
      this.ctx.save();
      this.ctx.globalAlpha = starOpacity * opacity;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, Math.max(0.5, starSize), 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
    
    this.ctx.restore();
  }

  override destroy(): void {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.stars = [];
    super.destroy();
  }
}

export class DustLayer extends BaseLayer {
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private dustParticles: any[] = [];
  private canvas2DRenderer?: any;

  constructor(id: string, config: Record<string, any>) {
    super(id, 'dust', config);
  }

  mount(ctx: LayerMountContext): void {
    if (this.mounted) return;

    // Get Canvas2D renderer
    this.canvas2DRenderer = ctx.renderer;
    
    // Create dedicated canvas for this layer
    if (this.canvas2DRenderer && this.canvas2DRenderer.createLayerCanvas) {
      const { width = ctx.container.clientWidth, height = ctx.container.clientHeight } = this.config;
      this.canvas = this.canvas2DRenderer.createLayerCanvas(width, height);
      if (this.canvas) {
        const context = this.canvas.getContext('2d');
        this.ctx = context || undefined;
        
        // Style the canvas
        this.canvas.style.cssText += `
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: ${this.zIndex};
        `;
        
        // Add to container
        ctx.container.appendChild(this.canvas);
      }
    }

    this.mounted = true;
  }

  update(ctx: FrameContext): void {
    if (!this.mounted || !this.canvas || !this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Get configuration
    const {
      count = 50,
      color = '#cccccc',
      minSize = 1,
      maxSize = 3,
      speed = 0.2,
      opacity = 0.4,
      drift = true,
      x = 0,
      y = 0,
      scale = 1,
      rotation = 0
    } = this.config;
    
    // Apply layer transforms
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.scale(scale, scale);
    this.ctx.rotate(rotation * Math.PI / 180);
    this.ctx.globalAlpha = opacity;
    
    // Initialize dust particles if needed
    if (this.dustParticles.length === 0) {
      for (let i = 0; i < count; i++) {
        this.dustParticles.push({
          x: Math.random() * ctx.viewport.width,
          y: Math.random() * ctx.viewport.height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: minSize + Math.random() * (maxSize - minSize),
          baseOpacity: 0.2 + Math.random() * 0.6,
          driftPhase: Math.random() * Math.PI * 2,
          driftSpeed: 0.3 + Math.random() * 0.7,
          life: 0,
          maxLife: 10000 + Math.random() * 20000
        });
      }
    }
    
    // Update and render dust particles
    this.ctx.fillStyle = color;
    for (const particle of this.dustParticles) {
      // Update position
      let vx = particle.vx;
      let vy = particle.vy;
      
      // Add drift effect
      if (drift) {
        particle.driftPhase += particle.driftSpeed * ctx.deltaMs / 1000;
        vx += Math.sin(particle.driftPhase) * 0.1;
        vy += Math.cos(particle.driftPhase * 0.7) * 0.1;
      }
      
      particle.x += vx * ctx.deltaMs / 16.67;
      particle.y += vy * ctx.deltaMs / 16.67;
      particle.life += ctx.deltaMs;
      
      // Wrap around screen
      if (particle.x < -particle.size) particle.x = ctx.viewport.width + particle.size;
      if (particle.x > ctx.viewport.width + particle.size) particle.x = -particle.size;
      if (particle.y < -particle.size) particle.y = ctx.viewport.height + particle.size;
      if (particle.y > ctx.viewport.height + particle.size) particle.y = -particle.size;
      
      // Reset if lifetime exceeded
      if (particle.life >= particle.maxLife) {
        particle.x = Math.random() * ctx.viewport.width;
        particle.y = Math.random() * ctx.viewport.height;
        particle.life = 0;
      }
      
      // Calculate opacity with subtle fading
      const lifeRatio = particle.life / particle.maxLife;
      const fadeOpacity = lifeRatio < 0.1 ? lifeRatio / 0.1 : 
                         lifeRatio > 0.9 ? (1 - lifeRatio) / 0.1 : 1;
      
      // Render dust particle
      this.ctx.save();
      this.ctx.globalAlpha = particle.baseOpacity * fadeOpacity * opacity;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
    
    this.ctx.restore();
  }

  override destroy(): void {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.dustParticles = [];
    super.destroy();
  }
}

export class NebulaNoiseLayer extends BaseLayer {
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private noiseData?: ImageData;
  private canvas2DRenderer?: any;

  constructor(id: string, config: Record<string, any>) {
    super(id, 'nebulaNoise', config);
  }

  mount(ctx: LayerMountContext): void {
    if (this.mounted) return;

    // Get Canvas2D renderer
    this.canvas2DRenderer = ctx.renderer;
    
    // Create dedicated canvas for this layer
    if (this.canvas2DRenderer && this.canvas2DRenderer.createLayerCanvas) {
      const { width = ctx.container.clientWidth, height = ctx.container.clientHeight } = this.config;
      this.canvas = this.canvas2DRenderer.createLayerCanvas(width, height);
      if (this.canvas) {
        const context = this.canvas.getContext('2d');
        this.ctx = context || undefined;
        
        // Style the canvas
        this.canvas.style.cssText += `
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: ${this.zIndex};
          mix-blend-mode: screen;
        `;
        
        // Add to container
        ctx.container.appendChild(this.canvas);
      }
    }

    this.mounted = true;
  }

  update(ctx: FrameContext): void {
    if (!this.mounted || !this.canvas || !this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Get configuration
    const {
      colors = ['#ff0080', '#0080ff', '#8000ff'],
      intensity = 0.3,
      scale = 0.01,
      opacity = 0.6,
      animated = true,
      speed = 0.001,
      octaves = 3,
      x = 0,
      y = 0,
      scaleTransform = 1,
      rotation = 0
    } = this.config;
    
    // Apply layer transforms
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.scale(scaleTransform, scaleTransform);
    this.ctx.rotate(rotation * Math.PI / 180);
    this.ctx.globalAlpha = opacity;
    
    const width = Math.floor(ctx.viewport.width / 2); // Lower resolution for performance
    const height = Math.floor(ctx.viewport.height / 2);
    
    // Create or reuse image data
    if (!this.noiseData || this.noiseData.width !== width || this.noiseData.height !== height) {
      this.noiseData = this.ctx.createImageData(width, height);
    }
    
    const data = this.noiseData.data;
    const time = animated ? ctx.timeMs * speed : 0;
    
    // Generate multi-octave noise
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const index = (py * width + px) * 4;
        
        let noise = 0;
        let amplitude = 1;
        let frequency = scale;
        
        // Multi-octave noise
        for (let octave = 0; octave < octaves; octave++) {
          noise += this.perlinNoise(px * frequency + time, py * frequency + time) * amplitude;
          amplitude *= 0.5;
          frequency *= 2;
        }
        
        // Normalize noise to 0-1 range
        noise = (noise + 1) * 0.5;
        noise = Math.max(0, Math.min(1, noise * intensity));
        
        // Apply color based on noise value
        const colorIndex = Math.floor(noise * (colors.length - 1));
        const nextColorIndex = Math.min(colorIndex + 1, colors.length - 1);
        const t = (noise * (colors.length - 1)) - colorIndex;
        
        const color1 = this.hexToRgb(colors[colorIndex]);
        const color2 = this.hexToRgb(colors[nextColorIndex]);
        
        // Interpolate between colors
        const r = Math.floor(color1.r + (color2.r - color1.r) * t);
        const g = Math.floor(color1.g + (color2.g - color1.g) * t);
        const b = Math.floor(color1.b + (color2.b - color1.b) * t);
        const a = Math.floor(noise * 255);
        
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = a;
      }
    }
    
    // Render noise with scaling
    this.ctx.putImageData(this.noiseData, 0, 0);
    this.ctx.drawImage(this.canvas, 0, 0, width, height, 0, 0, ctx.viewport.width, ctx.viewport.height);
    
    this.ctx.restore();
  }

  private perlinNoise(x: number, y: number): number {
    // Simplified Perlin-like noise function
    const n1 = this.noise(Math.floor(x), Math.floor(y));
    const n2 = this.noise(Math.floor(x) + 1, Math.floor(y));
    const n3 = this.noise(Math.floor(x), Math.floor(y) + 1);
    const n4 = this.noise(Math.floor(x) + 1, Math.floor(y) + 1);
    
    const fx = x - Math.floor(x);
    const fy = y - Math.floor(y);
    
    // Smooth interpolation
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    
    const i1 = n1 + sx * (n2 - n1);
    const i2 = n3 + sx * (n4 - n3);
    
    return i1 + sy * (i2 - i1);
  }

  private noise(x: number, y: number): number {
    // Simple pseudo-random noise function
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1; // Return value between -1 and 1
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result && result[1] && result[2] && result[3]) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      };
    }
    return { r: 255, g: 255, b: 255 };
  }

  override destroy(): void {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.noiseData = undefined;
    super.destroy();
  }
}