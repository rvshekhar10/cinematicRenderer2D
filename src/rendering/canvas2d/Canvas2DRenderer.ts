/**
 * Canvas2D-based rendering backend with devicePixelRatio scaling and object pooling
 * 
 * This renderer handles particles, noise, and starfields with high performance
 * through object pooling and efficient canvas operations.
 * 
 * Requirements: 4.2, 4.4 - Canvas2D rendering with devicePixelRatio and object pooling
 */

import { RenderBackend } from '../RenderBackend';
import type { ICinematicLayer } from '../../core/interfaces/ICinematicLayer';
import type { FrameContext } from '../../core/interfaces/LayerContext';
import type { QualityLevel, PerformanceMetrics } from '../../types/QualityTypes';
import { QUALITY_PRESETS } from '../../types/QualityTypes';

/**
 * Object pool for reusing particle objects to avoid garbage collection
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    // Pool exhausted, create new object
    return this.createFn();
  }

  release(obj: T): void {
    this.resetFn(obj);
    this.pool.push(obj);
  }

  clear(): void {
    this.pool.length = 0;
  }

  get poolSize(): number {
    return this.pool.length;
  }
}

/**
 * Particle object for object pooling
 */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  active: boolean;
}

/**
 * Canvas2D renderer with devicePixelRatio scaling and performance monitoring
 */
export class Canvas2DRenderer extends RenderBackend {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private devicePixelRatio: number;
  private width: number = 0;
  private height: number = 0;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  
  // Object pools for performance
  private particlePool: ObjectPool<Particle>;
  private activeParticles: Particle[] = [];
  
  // Performance monitoring
  private performanceMetrics: PerformanceMetrics = {
    fps: 60,
    frameTime: 16.67,
    activeParticles: 0,
    activeLayers: 0,
    domNodes: 0,
    drawCalls: 0,
  };
  
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;

  constructor(container: HTMLElement) {
    super(container);
    
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    `;
    
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas2D context not available');
    }
    this.ctx = context;
    
    // Get device pixel ratio for crisp rendering
    this.devicePixelRatio = window.devicePixelRatio || 1;
    
    // Initialize object pool
    this.particlePool = new ObjectPool<Particle>(
      () => ({
        x: 0, y: 0, vx: 0, vy: 0, size: 1, opacity: 1, color: '#ffffff',
        life: 0, maxLife: 1000, rotation: 0, rotationSpeed: 0, active: false
      }),
      (particle) => {
        particle.active = false;
        particle.life = 0;
        particle.opacity = 1;
      },
      500 // Initial pool size
    );
  }

  initialize(): void {
    // Add canvas to container
    this.container.appendChild(this.canvas);
    
    // Set initial size
    const rect = this.container.getBoundingClientRect();
    this.resize(rect.width, rect.height);
    
    // Configure canvas for optimal performance
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }
  
  render(layers: ICinematicLayer[], context: FrameContext): void {
    const startTime = performance.now();
    
    // Update performance metrics
    this.updatePerformanceMetrics(context);
    
    // Clear canvas with devicePixelRatio scaling
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Save context state
    this.ctx.save();
    
    // Apply devicePixelRatio scaling
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    
    let drawCalls = 0;
    
    // Render Canvas2D layers only
    const canvas2DLayers = layers.filter(layer => 
      ['particles', 'starfield', 'dust', 'nebulaNoise'].includes(layer.type)
    );
    
    // Sort layers by zIndex for proper rendering order (Requirement 6.2)
    const sortedLayers = [...canvas2DLayers].sort((a, b) => a.zIndex - b.zIndex);
    
    for (const layer of sortedLayers) {
      this.ctx.save();
      
      // Let the layer render itself
      if (layer.type === 'particles' || layer.type === 'starfield' || layer.type === 'dust') {
        drawCalls += this.renderParticleLayer(layer, context);
      } else if (layer.type === 'nebulaNoise') {
        drawCalls += this.renderNoiseLayer(layer, context);
      }
      
      this.ctx.restore();
    }
    
    // Restore context state
    this.ctx.restore();
    
    // Update performance metrics
    this.performanceMetrics.drawCalls = drawCalls;
    this.performanceMetrics.activeLayers = canvas2DLayers.length;
    this.performanceMetrics.frameTime = performance.now() - startTime;
  }
  
  private renderParticleLayer(layer: ICinematicLayer, context: FrameContext): number {
    // Cast to access config (this is safe as we control the layer types)
    const particleLayer = layer as any;
    const config = particleLayer.config || {};
    
    const {
      count = 100,
      color = '#ffffff',
      size = 2,
      speed = 1,
      opacity = 0.8,
      type = 'circle'
    } = config;
    
    // Get quality settings
    const qualitySettings = QUALITY_PRESETS[context.quality] || QUALITY_PRESETS.medium;
    const maxParticles = Math.min(count, qualitySettings.particleCount);
    
    // Ensure we have enough active particles
    while (this.activeParticles.length < maxParticles) {
      const particle = this.particlePool.get();
      this.initializeParticle(particle, context.viewport);
      particle.color = color;
      particle.size = size;
      particle.active = true;
      this.activeParticles.push(particle);
    }
    
    // Remove excess particles
    while (this.activeParticles.length > maxParticles) {
      const particle = this.activeParticles.pop();
      if (particle) {
        this.particlePool.release(particle);
      }
    }
    
    let drawCalls = 0;
    
    // Update and render particles
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const particle = this.activeParticles[i];
      
      if (!particle || !particle.active) {
        this.activeParticles.splice(i, 1);
        if (particle) {
          this.particlePool.release(particle);
        }
        continue;
      }
      
      // Update particle
      particle.x += particle.vx * speed * context.deltaMs / 16.67;
      particle.y += particle.vy * speed * context.deltaMs / 16.67;
      particle.rotation += particle.rotationSpeed * context.deltaMs / 16.67;
      particle.life += context.deltaMs;
      
      // Check bounds and lifetime
      if (particle.x < -particle.size || particle.x > context.viewport.width + particle.size ||
          particle.y < -particle.size || particle.y > context.viewport.height + particle.size ||
          particle.life >= particle.maxLife) {
        // Respawn particle
        this.initializeParticle(particle, context.viewport);
        particle.color = color;
        particle.size = size;
      }
      
      // Render particle
      this.ctx.save();
      this.ctx.globalAlpha = particle.opacity * opacity;
      this.ctx.fillStyle = particle.color;
      
      if (type === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (type === 'star') {
        this.drawStar(particle.x, particle.y, particle.size, particle.rotation);
      }
      
      this.ctx.restore();
      drawCalls++;
    }
    
    this.performanceMetrics.activeParticles = this.activeParticles.length;
    return drawCalls;
  }
  
  private renderNoiseLayer(layer: ICinematicLayer, context: FrameContext): number {
    // Cast to access config
    const noiseLayer = layer as any;
    const config = noiseLayer.config || {};
    
    const {
      intensity = 0.5,
      scale = 1,
      opacity = 0.3,
      animated = true,
      speed = 0.01
    } = config;
    
    // Get quality settings
    const qualitySettings = QUALITY_PRESETS[context.quality] || QUALITY_PRESETS.medium;
    const resolution = qualitySettings.canvasResolution;
    
    const width = Math.floor(context.viewport.width * resolution);
    const height = Math.floor(context.viewport.height * resolution);
    
    // Create noise texture
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;
    
    const time = animated ? context.timeMs * speed : 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        // Simple noise generation (could be replaced with Perlin noise)
        const noise = this.simpleNoise(x * scale + time, y * scale + time) * intensity;
        const value = Math.floor(noise * 255);
        
        data[index] = value;     // Red
        data[index + 1] = value; // Green
        data[index + 2] = value; // Blue
        data[index + 3] = Math.floor(opacity * 255); // Alpha
      }
    }
    
    // Render noise
    this.ctx.save();
    this.ctx.putImageData(imageData, 0, 0);
    this.ctx.restore();
    
    return 1; // One draw call
  }
  
  private initializeParticle(particle: Particle, viewport: { width: number; height: number }): void {
    particle.x = Math.random() * viewport.width;
    particle.y = Math.random() * viewport.height;
    particle.vx = (Math.random() - 0.5) * 2;
    particle.vy = (Math.random() - 0.5) * 2;
    particle.size = 1 + Math.random() * 3;
    particle.opacity = 0.5 + Math.random() * 0.5;
    particle.life = 0;
    particle.maxLife = 5000 + Math.random() * 10000;
    particle.rotation = Math.random() * Math.PI * 2;
    particle.rotationSpeed = (Math.random() - 0.5) * 0.02;
    particle.active = true;
  }
  
  private drawStar(x: number, y: number, size: number, rotation: number): void {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    
    this.ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  private simpleNoise(x: number, y: number): number {
    // Simple pseudo-random noise function
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }
  
  private updatePerformanceMetrics(context: FrameContext): void {
    const currentTime = performance.now();
    
    if (this.lastFrameTime > 0) {
      const deltaTime = currentTime - this.lastFrameTime;
      this.frameCount++;
      
      // Update FPS every second
      if (currentTime - this.fpsUpdateTime >= 1000) {
        this.performanceMetrics.fps = Math.round(this.frameCount * 1000 / (currentTime - this.fpsUpdateTime));
        this.frameCount = 0;
        this.fpsUpdateTime = currentTime;
      }
    }
    
    this.lastFrameTime = currentTime;
    this.performanceMetrics.frameTime = context.deltaMs;
  }
  
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    
    // Set canvas size with devicePixelRatio scaling
    this.canvasWidth = Math.floor(width * this.devicePixelRatio);
    this.canvasHeight = Math.floor(height * this.devicePixelRatio);
    
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    
    // Set CSS size
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    
    // Reconfigure context after resize
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }
  
  destroy(): void {
    // Clear object pools
    this.particlePool.clear();
    this.activeParticles.length = 0;
    
    // Remove canvas from DOM
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
  
  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }
  
  /**
   * Create a canvas for a specific layer (used by layers that need their own canvas)
   */
  createLayerCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(width * this.devicePixelRatio);
    canvas.height = Math.floor(height * this.devicePixelRatio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    
    return canvas;
  }
}