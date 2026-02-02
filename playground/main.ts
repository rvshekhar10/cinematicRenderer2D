/**
 * Playground application for testing cinematicRenderer2D
 * Modern macOS-inspired interface with fullscreen mode and floating glass panel
 */

import { CinematicRenderer2D } from 'cinematic-renderer2d';
import type { CinematicSpec } from 'cinematic-renderer2d';

// Example specifications
const EXAMPLES = {
  simple: {
    name: 'Simple Demo',
    url: '/examples/simple-demo-spec.json'
  },
  story: {
    name: 'Story Narration',
    url: '/examples/story-narration-spec.json'
  },
  daynight: {
    name: 'Day & Night Story',
    url: '/examples/day-night-story-spec.json'
  }
};

class Playground {
  private renderer: CinematicRenderer2D | null = null;
  private specEditor: HTMLTextAreaElement;
  private rendererContainer: HTMLElement;
  private rendererViewport: HTMLElement;
  private statusDisplay: HTMLElement;
  private performanceInfo: HTMLElement;
  private examplesDropdown: HTMLSelectElement;
  private controlPanel: HTMLElement;
  
  // UI Elements
  private validateBtn: HTMLButtonElement;
  private renderBtn: HTMLButtonElement;
  private playBtn: HTMLButtonElement;
  private pauseBtn: HTMLButtonElement;
  private stopBtn: HTMLButtonElement;
  private debugBtn: HTMLButtonElement;
  private destroyBtn: HTMLButtonElement;
  private fullscreenToggle: HTMLButtonElement;
  
  // State
  private isValidSpec: boolean = false;
  private performanceTimer: number | null = null;
  private isFullscreen: boolean = false;
  
  constructor() {
    this.specEditor = document.getElementById('specEditor') as HTMLTextAreaElement;
    this.rendererContainer = document.getElementById('rendererContainer') as HTMLElement;
    this.rendererViewport = document.getElementById('rendererViewport') as HTMLElement;
    this.statusDisplay = document.getElementById('statusDisplay') as HTMLElement;
    this.performanceInfo = document.getElementById('performanceInfo') as HTMLElement;
    this.examplesDropdown = document.getElementById('examplesDropdown') as HTMLSelectElement;
    this.controlPanel = document.getElementById('controlPanel') as HTMLElement;
    this.fullscreenToggle = document.getElementById('fullscreenToggle') as HTMLButtonElement;
    
    // Get button references
    this.validateBtn = document.getElementById('validateBtn') as HTMLButtonElement;
    this.renderBtn = document.getElementById('renderBtn') as HTMLButtonElement;
    this.playBtn = document.getElementById('playBtn') as HTMLButtonElement;
    this.pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
    this.stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
    this.debugBtn = document.getElementById('debugBtn') as HTMLButtonElement;
    this.destroyBtn = document.getElementById('destroyBtn') as HTMLButtonElement;
    
    this.setupEventListeners();
    this.initializeBackgroundAnimation();
    this.validateSpec(); // Validate initial spec
  }
  
  private setupEventListeners(): void {
    // Button event listeners
    this.validateBtn.addEventListener('click', () => this.validateSpec());
    this.renderBtn.addEventListener('click', () => this.createRenderer());
    this.playBtn.addEventListener('click', () => this.play());
    this.pauseBtn.addEventListener('click', () => this.pause());
    this.stopBtn.addEventListener('click', () => this.stop());
    this.debugBtn.addEventListener('click', () => this.toggleDebug());
    this.destroyBtn.addEventListener('click', () => this.destroyRenderer());
    
    // Fullscreen toggle
    this.fullscreenToggle.addEventListener('click', () => this.toggleFullscreen());
    
    // Examples dropdown
    this.examplesDropdown.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      if (target.value && target.value !== 'custom') {
        this.loadExample(target.value);
      }
    });
    
    // Auto-validate on spec changes (debounced)
    let validationTimeout: number;
    this.specEditor.addEventListener('input', () => {
      clearTimeout(validationTimeout);
      validationTimeout = window.setTimeout(() => {
        this.validateSpec();
      }, 500);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            if (this.isValidSpec && !this.renderer) {
              this.createRenderer();
            } else if (this.renderer && !this.renderer.isPlaying()) {
              this.play();
            }
            break;
          case ' ':
            e.preventDefault();
            if (this.renderer) {
              if (this.renderer.isPlaying()) {
                this.pause();
              } else {
                this.play();
              }
            }
            break;
          case 'f':
            e.preventDefault();
            this.toggleFullscreen();
            break;
        }
      }
      
      // Escape key to exit fullscreen
      if (e.key === 'Escape') {
        if (this.isFullscreen) {
          this.toggleFullscreen();
        }
      }
    });
    
    // Handle fullscreen change events
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
      this.updateFullscreenUI();
    });
  }
  
  private initializeBackgroundAnimation(): void {
    const bgParticles = document.getElementById('bgParticles');
    if (!bgParticles) return;
    
    // Create floating particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (15 + Math.random() * 10) + 's';
      bgParticles.appendChild(particle);
    }
  }
  
  private toggleFullscreen(): void {
    if (!this.isFullscreen) {
      this.rendererViewport.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }
  
  private updateFullscreenUI(): void {
    this.rendererViewport.classList.toggle('fullscreen', this.isFullscreen);
    
    // Update fullscreen button icon
    const icon = this.fullscreenToggle.querySelector('svg');
    if (icon) {
      if (this.isFullscreen) {
        icon.innerHTML = '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>';
      } else {
        icon.innerHTML = '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>';
      }
    }
  }
  
  private async loadExample(exampleKey: string): Promise<void> {
    const example = EXAMPLES[exampleKey as keyof typeof EXAMPLES];
    if (!example) return;
    
    try {
      this.showStatus('Loading example...', 'info');
      
      const response = await fetch(example.url);
      if (!response.ok) {
        throw new Error(`Failed to load example: ${response.statusText}`);
      }
      
      const spec = await response.json();
      this.specEditor.value = JSON.stringify(spec, null, 2);
      
      this.showStatus(`Loaded "${example.name}" example`, 'success');
      this.validateSpec();
      
    } catch (error) {
      this.showStatus(`Failed to load example: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }
  
  private validateSpec(): void {
    try {
      const specText = this.specEditor.value.trim();
      if (!specText) {
        this.showStatus('Specification is empty', 'error');
        this.isValidSpec = false;
        this.updateButtonStates();
        return;
      }
      
      const spec = JSON.parse(specText) as CinematicSpec;
      
      // Basic validation
      if (!spec.schemaVersion) {
        throw new Error('Missing schemaVersion');
      }
      if (!spec.events || !Array.isArray(spec.events) || spec.events.length === 0) {
        throw new Error('At least one event is required');
      }
      if (!spec.scenes || !Array.isArray(spec.scenes) || spec.scenes.length === 0) {
        throw new Error('At least one scene is required');
      }
      
      this.showStatus('✅ Specification is valid', 'success');
      this.isValidSpec = true;
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown validation error';
      this.showStatus(`❌ Validation failed: ${message}`, 'error');
      this.isValidSpec = false;
    }
    
    this.updateButtonStates();
  }
  
  private async createRenderer(): Promise<void> {
    if (!this.isValidSpec) {
      this.showStatus('Please fix validation errors first', 'error');
      return;
    }
    
    try {
      // Destroy existing renderer
      if (this.renderer) {
        this.destroyRenderer();
      }
      
      const specText = this.specEditor.value;
      const spec = JSON.parse(specText) as CinematicSpec;
      
      this.showStatus('Creating renderer...', 'info');
      
      // Clear the container
      this.rendererContainer.innerHTML = '';
      
      // Create renderer with debug enabled
      this.renderer = new CinematicRenderer2D({
        container: this.rendererContainer,
        spec,
        debug: true,
      });
      
      // Set up renderer event listeners
      this.setupRendererEventListeners();
      
      // Mount the renderer
      await this.renderer.mount();
      
      this.showStatus('✅ Renderer created successfully', 'success');
      this.updateButtonStates();
      
      // Start performance monitoring
      this.startPerformanceMonitoring();
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.showStatus(`❌ Renderer creation failed: ${message}`, 'error');
      this.renderer = null;
      this.updateButtonStates();
    }
  }
  
  private setupRendererEventListeners(): void {
    if (!this.renderer) return;
    
    this.renderer.on('ready', () => {
      console.log('Renderer ready');
    });
    
    this.renderer.on('play', (data: any) => {
      console.log('Playback started:', data);
      this.updateButtonStates();
    });
    
    this.renderer.on('pause', (data: any) => {
      console.log('Playback paused:', data);
      this.updateButtonStates();
    });
    
    this.renderer.on('stop', (data: any) => {
      console.log('Playback stopped:', data);
      this.updateButtonStates();
    });
    
    this.renderer.on('ended', () => {
      console.log('Playback ended');
      this.updateButtonStates();
    });
    
    this.renderer.on('error', (error: any) => {
      console.error('Renderer error:', error);
      this.showStatus(`Renderer error: ${error.message || error}`, 'error');
    });
    
    this.renderer.on('frame', (data: any) => {
      // Update performance info
      this.updatePerformanceDisplay(data);
    });
    
    this.renderer.on('qualityChange', (data: any) => {
      console.log('Quality changed:', data);
      this.showStatus(`Quality changed to: ${data.currentQuality}`, 'info');
    });
  }
  
  private play(): void {
    if (this.renderer) {
      this.renderer.play();
    }
  }
  
  private pause(): void {
    if (this.renderer) {
      this.renderer.pause();
    }
  }
  
  private stop(): void {
    if (this.renderer) {
      this.renderer.stop();
    }
  }
  
  private toggleDebug(): void {
    if (this.renderer && this.renderer.isDebugEnabled()) {
      this.renderer.toggleDebug();
    }
  }
  
  private destroyRenderer(): void {
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
      
      this.stopPerformanceMonitoring();
      
      // Clear container and show placeholder
      this.rendererContainer.innerHTML = `
        <div class="renderer-placeholder">
          <div class="icon">🎬</div>
          <h2>cinematicRenderer2D</h2>
          <p>Load a specification and create a renderer to begin</p>
        </div>
      `;
      
      this.showStatus('Renderer destroyed', 'info');
      this.updateButtonStates();
    }
  }
  
  private startPerformanceMonitoring(): void {
    this.performanceInfo.classList.add('visible');
    
    const updatePerformance = () => {
      if (this.renderer) {
        const fps = this.renderer.getCurrentFps();
        const quality = this.renderer.getQuality();
        const isPlaying = this.renderer.isPlaying();
        
        this.performanceInfo.textContent = `FPS: ${fps.toFixed(1)} | Quality: ${quality.toUpperCase()} | ${isPlaying ? '▶️' : '⏸️'}`;
        
        this.performanceTimer = window.setTimeout(updatePerformance, 100);
      }
    };
    
    updatePerformance();
  }
  
  private stopPerformanceMonitoring(): void {
    if (this.performanceTimer) {
      clearTimeout(this.performanceTimer);
      this.performanceTimer = null;
    }
    this.performanceInfo.classList.remove('visible');
  }
  
  private updatePerformanceDisplay(frameData: any): void {
    // This is called from the frame event, so we don't need to poll
    if (this.performanceInfo && this.performanceInfo.classList.contains('visible')) {
      const quality = this.renderer?.getQuality() || 'unknown';
      const isPlaying = this.renderer?.isPlaying() || false;
      
      this.performanceInfo.textContent = `FPS: ${frameData.fps.toFixed(1)} | Quality: ${quality.toUpperCase()} | ${isPlaying ? '▶️' : '⏸️'}`;
    }
  }
  
  private showStatus(message: string, type: 'success' | 'error' | 'info'): void {
    this.statusDisplay.innerHTML = `<div class="status-message ${type}">${message}</div>`;
    
    // Auto-clear success and info messages after 3 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        if (this.statusDisplay.innerHTML.includes(message)) {
          this.statusDisplay.innerHTML = '';
        }
      }, 3000);
    }
  }
  
  private updateButtonStates(): void {
    const hasRenderer = this.renderer !== null;
    const isPlaying = hasRenderer && this.renderer!.isPlaying();
    const isPaused = hasRenderer && this.renderer!.isPaused();
    
    // Validate button is always enabled
    this.validateBtn.disabled = false;
    
    // Render button enabled when spec is valid and no renderer exists
    this.renderBtn.disabled = !this.isValidSpec || hasRenderer;
    
    // Playback buttons enabled when renderer exists
    this.playBtn.disabled = !hasRenderer || isPlaying;
    this.pauseBtn.disabled = !hasRenderer || !isPlaying;
    this.stopBtn.disabled = !hasRenderer || (!isPlaying && !isPaused);
    
    // Debug and destroy buttons enabled when renderer exists
    this.debugBtn.disabled = !hasRenderer;
    this.destroyBtn.disabled = !hasRenderer;
    
    // Update button text and effects based on state
    if (isPlaying) {
      this.playBtn.textContent = 'Playing...';
      this.playBtn.classList.add('btn-playing');
    } else {
      this.playBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5,3 19,12 5,21"/>
        </svg>
        Play
      `;
      this.playBtn.classList.remove('btn-playing');
    }
  }
}

// Initialize playground when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Playground();
});