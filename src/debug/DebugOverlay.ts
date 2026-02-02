/**
 * Debug overlay system for cinematicRenderer2D
 * 
 * Provides real-time debugging information including FPS counter,
 * timeline info, layer status, and performance metrics.
 */

import type { CinematicRenderer2D } from '../core/CinematicRenderer2D';
import type { QualityLevel } from '../types/QualityTypes';

export interface DebugInfo {
  fps: number;
  currentTime: number;
  duration: number;
  currentEvent: string | null;
  currentScene: string | null;
  quality: QualityLevel;
  activeLayers: number;
  activeParticles: number;
  domNodes: number;
  drawCalls: number;
  memoryUsage?: number;
  isPlaying: boolean;
  isPaused: boolean;
}

export interface DebugOverlayOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  opacity?: number;
  fontSize?: number;
  updateInterval?: number;
  showPerformanceGraph?: boolean;
  maxGraphPoints?: number;
}

export class DebugOverlay {
  private renderer: CinematicRenderer2D;
  private container: HTMLElement;
  private overlayElement: HTMLElement | null = null;
  private options: Required<DebugOverlayOptions>;
  private updateTimer: number | null = null;
  private isVisible: boolean = false;
  
  // Performance graph data
  private fpsHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private lastUpdateTime: number = 0;
  
  constructor(renderer: CinematicRenderer2D, container: HTMLElement, options: DebugOverlayOptions = {}) {
    this.renderer = renderer;
    this.container = container;
    
    // Set default options
    this.options = {
      position: options.position || 'top-left',
      opacity: options.opacity || 0.9,
      fontSize: options.fontSize || 12,
      updateInterval: options.updateInterval || 100, // Update every 100ms
      showPerformanceGraph: options.showPerformanceGraph || true,
      maxGraphPoints: options.maxGraphPoints || 60, // 6 seconds at 10fps update rate
    };
    
    this.createOverlay();
    this.setupEventListeners();
  }
  
  show(): void {
    if (this.isVisible) return;
    
    this.isVisible = true;
    if (this.overlayElement) {
      this.overlayElement.style.display = 'block';
    }
    
    this.startUpdating();
  }
  
  hide(): void {
    if (!this.isVisible) return;
    
    this.isVisible = false;
    if (this.overlayElement) {
      this.overlayElement.style.display = 'none';
    }
    
    this.stopUpdating();
  }
  
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  destroy(): void {
    this.stopUpdating();
    
    if (this.overlayElement && this.overlayElement.parentNode) {
      this.overlayElement.parentNode.removeChild(this.overlayElement);
    }
    
    this.overlayElement = null;
  }
  
  private createOverlay(): void {
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'cinematic-debug-overlay';
    
    // Apply styles
    const styles = this.getOverlayStyles();
    Object.assign(this.overlayElement.style, styles);
    
    // Initially hidden
    this.overlayElement.style.display = 'none';
    
    // Add to container
    this.container.appendChild(this.overlayElement);
  }
  
  private getOverlayStyles(): Partial<CSSStyleDeclaration> {
    const baseStyles: Partial<CSSStyleDeclaration> = {
      position: 'fixed', // Changed from absolute to fixed to ensure it's above everything
      zIndex: '10000', // Increased z-index to be above control panel (2000)
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#ffffff',
      fontFamily: 'Monaco, Menlo, "Courier New", monospace',
      fontSize: `${this.options.fontSize}px`,
      lineHeight: '1.4',
      padding: '12px',
      borderRadius: '4px',
      opacity: this.options.opacity.toString(),
      pointerEvents: 'none',
      userSelect: 'none',
      minWidth: '200px',
      maxWidth: '300px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(4px)',
    };
    
    // Position-specific styles
    switch (this.options.position) {
      case 'top-left':
        baseStyles.top = '10px';
        baseStyles.left = '10px';
        break;
      case 'top-right':
        baseStyles.top = '10px';
        baseStyles.right = '10px';
        break;
      case 'bottom-left':
        baseStyles.bottom = '10px';
        baseStyles.left = '10px';
        break;
      case 'bottom-right':
        baseStyles.bottom = '10px';
        baseStyles.right = '10px';
        break;
    }
    
    return baseStyles;
  }
  
  private setupEventListeners(): void {
    // Listen for renderer events to update debug info
    this.renderer.on('frame', (frameData: any) => {
      this.updatePerformanceHistory(frameData.fps, frameData.deltaMs);
    });
    
    // Listen for keyboard shortcuts (D key to toggle debug)
    document.addEventListener('keydown', (event) => {
      if (event.key === 'd' || event.key === 'D') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.toggle();
        }
      }
    });
  }
  
  private startUpdating(): void {
    if (this.updateTimer) return;
    
    const update = () => {
      if (this.isVisible) {
        this.updateDisplay();
        this.updateTimer = window.setTimeout(update, this.options.updateInterval);
      }
    };
    
    update();
  }
  
  private stopUpdating(): void {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
  }
  
  private updateDisplay(): void {
    if (!this.overlayElement) return;
    
    const debugInfo = this.gatherDebugInfo();
    const html = this.generateDebugHTML(debugInfo);
    
    this.overlayElement.innerHTML = html;
  }
  
  private gatherDebugInfo(): DebugInfo {
    const currentTime = this.renderer.getCurrentTime();
    const duration = this.renderer.getDuration();
    const fps = this.renderer.getCurrentFps();
    const metrics = this.renderer.getPerformanceMetrics();
    
    return {
      fps: Math.round(fps * 10) / 10,
      currentTime,
      duration,
      currentEvent: this.renderer.getCurrentEvent(),
      currentScene: this.renderer.getCurrentScene(),
      quality: this.renderer.getQuality(),
      activeLayers: metrics.activeLayers || 0,
      activeParticles: metrics.activeParticles || 0,
      domNodes: metrics.domNodes || 0,
      drawCalls: metrics.drawCalls || 0,
      memoryUsage: this.getMemoryUsage(),
      isPlaying: this.renderer.isPlaying(),
      isPaused: this.renderer.isPaused(),
    };
  }
  
  private generateDebugHTML(info: DebugInfo): string {
    const formatTime = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      const remainingMs = Math.floor(ms % 1000);
      
      if (minutes > 0) {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMs.toString().padStart(3, '0')}`;
      } else {
        return `${remainingSeconds}.${remainingMs.toString().padStart(3, '0')}s`;
      }
    };
    
    const formatPercent = (current: number, total: number) => {
      if (total === 0) return '0%';
      return `${Math.round((current / total) * 100)}%`;
    };
    
    const playbackIcon = info.isPlaying ? '▶️' : info.isPaused ? '⏸️' : '⏹️';
    const qualityColor = this.getQualityColor(info.quality);
    
    let html = `
      <div style="margin-bottom: 8px; font-weight: bold; color: #00ff88;">
        🎬 cinematicRenderer2D Debug
      </div>
      
      <div style="margin-bottom: 6px;">
        <span style="color: #888;">FPS:</span> 
        <span style="color: ${this.getFpsColor(info.fps)}; font-weight: bold;">
          ${info.fps}
        </span>
        <span style="color: #888;"> / Target: ${this.getTargetFps()}</span>
      </div>
      
      <div style="margin-bottom: 6px;">
        <span style="color: #888;">Quality:</span> 
        <span style="color: ${qualityColor}; font-weight: bold;">
          ${info.quality.toUpperCase()}
        </span>
      </div>
      
      <div style="margin-bottom: 8px;">
        <span style="color: #888;">Timeline:</span> ${playbackIcon}
        <div style="margin-left: 10px; font-size: ${this.options.fontSize - 1}px;">
          ${formatTime(info.currentTime)} / ${formatTime(info.duration)}
          <div style="color: #666;">
            ${formatPercent(info.currentTime, info.duration)} complete
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 8px;">
        <span style="color: #888;">Current:</span>
        <div style="margin-left: 10px; font-size: ${this.options.fontSize - 1}px;">
          <div>Event: <span style="color: #88ccff;">${info.currentEvent || 'None'}</span></div>
          <div>Scene: <span style="color: #ffcc88;">${info.currentScene || 'None'}</span></div>
        </div>
      </div>
      
      <div style="margin-bottom: 8px;">
        <span style="color: #888;">Rendering:</span>
        <div style="margin-left: 10px; font-size: ${this.options.fontSize - 1}px;">
          <div>Layers: <span style="color: #88ff88;">${info.activeLayers}</span></div>
          <div>Particles: <span style="color: #ff8888;">${info.activeParticles}</span></div>
          <div>DOM Nodes: <span style="color: #8888ff;">${info.domNodes}</span></div>
          <div>Draw Calls: <span style="color: #ffff88;">${info.drawCalls}</span></div>
        </div>
      </div>
    `;
    
    // Add memory usage if available
    if (info.memoryUsage !== undefined) {
      html += `
        <div style="margin-bottom: 8px;">
          <span style="color: #888;">Memory:</span> 
          <span style="color: #ff88ff;">${(info.memoryUsage / 1024 / 1024).toFixed(1)} MB</span>
        </div>
      `;
    }
    
    // Add performance graph if enabled
    if (this.options.showPerformanceGraph && this.fpsHistory.length > 1) {
      html += this.generatePerformanceGraph();
    }
    
    // Add keyboard shortcut hint
    html += `
      <div style="margin-top: 8px; font-size: ${this.options.fontSize - 2}px; color: #666; border-top: 1px solid #333; padding-top: 4px;">
        Press Ctrl+D to toggle debug overlay
      </div>
    `;
    
    return html;
  }
  
  private generatePerformanceGraph(): string {
    const width = 180;
    const height = 40;
    const maxFps = Math.max(60, Math.max(...this.fpsHistory));
    const minFps = Math.min(0, Math.min(...this.fpsHistory));
    const fpsRange = maxFps - minFps;
    
    if (fpsRange === 0) return '';
    
    const points = this.fpsHistory.map((fps, index) => {
      const x = (index / (this.fpsHistory.length - 1)) * width;
      const y = height - ((fps - minFps) / fpsRange) * height;
      return `${x},${y}`;
    }).join(' ');
    
    return `
      <div style="margin-top: 8px;">
        <div style="color: #888; font-size: ${this.options.fontSize - 2}px; margin-bottom: 2px;">
          FPS Graph (${minFps.toFixed(1)} - ${maxFps.toFixed(1)})
        </div>
        <svg width="${width}" height="${height}" style="background: rgba(255,255,255,0.1); border-radius: 2px;">
          <polyline 
            points="${points}" 
            fill="none" 
            stroke="#00ff88" 
            stroke-width="1.5"
            opacity="0.8"
          />
          <line 
            x1="0" y1="${height - ((60 - minFps) / fpsRange) * height}" 
            x2="${width}" y2="${height - ((60 - minFps) / fpsRange) * height}" 
            stroke="#ffff00" 
            stroke-width="1" 
            opacity="0.5"
            stroke-dasharray="2,2"
          />
        </svg>
      </div>
    `;
  }
  
  private updatePerformanceHistory(fps: number, deltaMs: number): void {
    const now = performance.now();
    
    // Only update history at a reasonable rate (10fps)
    if (now - this.lastUpdateTime < 100) return;
    
    this.lastUpdateTime = now;
    
    this.fpsHistory.push(fps);
    this.frameTimeHistory.push(deltaMs);
    
    // Keep history within limits
    if (this.fpsHistory.length > this.options.maxGraphPoints) {
      this.fpsHistory.shift();
      this.frameTimeHistory.shift();
    }
  }
  
  private getFpsColor(fps: number): string {
    if (fps >= 55) return '#00ff88'; // Green - good
    if (fps >= 45) return '#ffff00'; // Yellow - okay
    if (fps >= 30) return '#ff8800'; // Orange - poor
    return '#ff4444'; // Red - bad
  }
  
  private getQualityColor(quality: QualityLevel): string {
    switch (quality) {
      case 'ultra': return '#ff00ff';
      case 'high': return '#00ff88';
      case 'medium': return '#ffff00';
      case 'low': return '#ff8800';
      case 'auto': return '#88ccff';
      default: return '#ffffff';
    }
  }
  
  private getTargetFps(): number {
    // Get target FPS from renderer spec
    return 60; // Default, could be made configurable
  }
  
  private getMemoryUsage(): number | undefined {
    // Use Performance API if available
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return undefined;
  }
}