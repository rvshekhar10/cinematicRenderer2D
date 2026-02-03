/**
 * Editor Mode for cinematicRenderer2D
 * 
 * Provides visual development tools including timeline scrubbing,
 * layer inspection, bounding boxes, and property inspector.
 */

import type { CinematicRenderer2D } from '../core/CinematicRenderer2D';
import type { ICinematicLayer } from '../core/interfaces/ICinematicLayer';
import { DebugOverlay } from '../debug/DebugOverlay';

export interface EditorModeConfig {
  enabled: boolean;
  showTimeline?: boolean;
  showBoundingBoxes?: boolean;
  showPropertyInspector?: boolean;
  showPerformanceMetrics?: boolean;
  autoEnableWithDebug?: boolean; // Auto-enable when debug mode is active
}

export interface TimelineMarker {
  time: number;
  label: string;
  type: 'scene' | 'event' | 'custom';
  color?: string;
}

export class EditorMode {
  private config: EditorModeConfig;
  private renderer: CinematicRenderer2D;
  private container: HTMLElement;
  private debugOverlay: DebugOverlay | null = null;
  private editorContainer: HTMLElement | null = null;
  private timelineElement: HTMLElement | null = null;
  private inspectorElement: HTMLElement | null = null;
  private boundingBoxContainer: HTMLElement | null = null;
  private markers: TimelineMarker[] = [];
  private selectedLayer: ICinematicLayer | null = null;
  private isDraggingScrubber: boolean = false;
  private isEnabled: boolean = false;

  constructor(renderer: CinematicRenderer2D, container: HTMLElement, config: EditorModeConfig) {
    this.renderer = renderer;
    this.container = container;
    this.config = {
      enabled: config.enabled,
      showTimeline: config.showTimeline !== false,
      showBoundingBoxes: config.showBoundingBoxes !== false,
      showPropertyInspector: config.showPropertyInspector !== false,
      showPerformanceMetrics: config.showPerformanceMetrics !== false,
      autoEnableWithDebug: config.autoEnableWithDebug !== false,
    };

    if (this.config.enabled) {
      this.enable();
    }

    // Auto-enable with debug mode if configured
    if (this.config.autoEnableWithDebug) {
      this.setupDebugModeIntegration();
    }
  }

  /**
   * Enable editor mode
   */
  enable(): void {
    if (this.isEnabled) return;

    this.isEnabled = true;
    this.createEditorUI();
    this.setupEventListeners();

    // Enable debug overlay if performance metrics are requested
    if (this.config.showPerformanceMetrics) {
      this.enableDebugOverlay();
    }

    // Extract timeline markers from renderer spec
    this.extractTimelineMarkers();
  }

  /**
   * Disable editor mode
   */
  disable(): void {
    if (!this.isEnabled) return;

    this.isEnabled = false;
    this.destroyEditorUI();

    if (this.debugOverlay) {
      this.debugOverlay.hide();
    }
  }

  /**
   * Toggle editor mode on/off
   */
  toggle(): void {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * Set editor mode configuration
   */
  setConfig(config: Partial<EditorModeConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.isEnabled) {
      // Recreate UI with new config
      this.destroyEditorUI();
      this.createEditorUI();
    }
  }

  /**
   * Show timeline scrubber
   */
  showTimeline(): void {
    if (this.timelineElement) {
      this.timelineElement.style.display = 'block';
    }
  }

  /**
   * Hide timeline scrubber
   */
  hideTimeline(): void {
    if (this.timelineElement) {
      this.timelineElement.style.display = 'none';
    }
  }

  /**
   * Show bounding boxes around all layers
   */
  showBoundingBoxes(): void {
    if (!this.boundingBoxContainer) {
      this.createBoundingBoxContainer();
    }
    this.updateBoundingBoxes();
  }

  /**
   * Hide bounding boxes
   */
  hideBoundingBoxes(): void {
    if (this.boundingBoxContainer) {
      this.boundingBoxContainer.style.display = 'none';
    }
  }

  /**
   * Show property inspector for a specific layer
   */
  showPropertyInspector(layerId: string): void {
    const layer = this.findLayerById(layerId);
    if (!layer) return;

    this.selectedLayer = layer;
    this.updatePropertyInspector();

    if (this.inspectorElement) {
      this.inspectorElement.style.display = 'block';
    }
  }

  /**
   * Hide property inspector
   */
  hidePropertyInspector(): void {
    if (this.inspectorElement) {
      this.inspectorElement.style.display = 'none';
    }
    this.selectedLayer = null;
  }

  /**
   * Add a custom timeline marker
   */
  addMarker(marker: TimelineMarker): void {
    this.markers.push(marker);
    if (this.timelineElement) {
      this.renderTimeline();
    }
  }

  /**
   * Remove a timeline marker
   */
  removeMarker(time: number): void {
    this.markers = this.markers.filter(m => m.time !== time);
    if (this.timelineElement) {
      this.renderTimeline();
    }
  }

  /**
   * Handle timeline scrubbing
   */
  onTimelineScrub(time: number): void {
    // Seek renderer to the specified time
    this.renderer.seek(time);
    this.updateTimeline();
  }

  /**
   * Handle layer click
   */
  onLayerClick(layerId: string): void {
    this.showPropertyInspector(layerId);
    this.highlightLayer(layerId);
  }

  /**
   * Destroy editor mode and clean up resources
   */
  destroy(): void {
    this.disable();
    this.destroyEditorUI();

    if (this.debugOverlay) {
      this.debugOverlay.destroy();
      this.debugOverlay = null;
    }
  }

  /**
   * Setup integration with debug mode
   * Auto-enables editor mode when debug mode is activated
   */
  private setupDebugModeIntegration(): void {
    // Listen for debug mode events from renderer
    // When debug mode is enabled, automatically enable editor mode
    this.renderer.on('debugModeChanged', (enabled: boolean) => {
      if (enabled && !this.isEnabled) {
        this.enable();
      }
    });

    // Check if debug mode is already enabled
    // Note: This assumes the renderer has a method to check debug status
    // If not available, this will be a no-op
    if (typeof (this.renderer as any).isDebugEnabled === 'function') {
      const isDebugEnabled = (this.renderer as any).isDebugEnabled();
      if (isDebugEnabled && !this.isEnabled) {
        this.enable();
      }
    }
  }

  /**
   * Create the editor UI elements
   */
  private createEditorUI(): void {
    // Create main editor container
    this.editorContainer = document.createElement('div');
    this.editorContainer.className = 'cinematic-editor-mode';
    this.editorContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;

    // Create timeline if enabled
    if (this.config.showTimeline) {
      this.createTimeline();
    }

    // Create property inspector if enabled
    if (this.config.showPropertyInspector) {
      this.createPropertyInspector();
    }

    // Create bounding box container if enabled
    if (this.config.showBoundingBoxes) {
      this.createBoundingBoxContainer();
    }

    this.container.appendChild(this.editorContainer);
  }

  /**
   * Destroy the editor UI elements
   */
  private destroyEditorUI(): void {
    if (this.editorContainer && this.editorContainer.parentNode) {
      this.editorContainer.parentNode.removeChild(this.editorContainer);
    }

    this.editorContainer = null;
    this.timelineElement = null;
    this.inspectorElement = null;
    this.boundingBoxContainer = null;
  }

  /**
   * Create timeline UI
   */
  private createTimeline(): void {
    this.timelineElement = document.createElement('div');
    this.timelineElement.className = 'cinematic-timeline';
    this.timelineElement.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 80px;
      background: rgba(0, 0, 0, 0.9);
      border-top: 2px solid #00ff88;
      pointer-events: auto;
      padding: 10px;
      box-sizing: border-box;
    `;

    this.renderTimeline();
    this.editorContainer?.appendChild(this.timelineElement);
  }

  /**
   * Render timeline content
   */
  private renderTimeline(): void {
    if (!this.timelineElement) return;

    const duration = this.renderer.getDuration();
    const currentTime = this.renderer.getCurrentTime();
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    this.timelineElement.innerHTML = `
      <div style="color: #fff; font-family: monospace; font-size: 12px; margin-bottom: 5px;">
        Timeline: ${this.formatTime(currentTime)} / ${this.formatTime(duration)}
      </div>
      <div style="position: relative; height: 30px; background: rgba(255,255,255,0.1); border-radius: 4px; cursor: pointer;" class="timeline-track">
        ${this.renderMarkers()}
        <div class="timeline-scrubber" style="
          position: absolute;
          left: ${progress}%;
          top: 0;
          width: 3px;
          height: 100%;
          background: #00ff88;
          cursor: ew-resize;
          box-shadow: 0 0 10px rgba(0,255,136,0.5);
        "></div>
      </div>
      <div style="color: #888; font-family: monospace; font-size: 10px; margin-top: 5px;">
        Click or drag to scrub timeline
      </div>
    `;

    this.setupTimelineInteraction();
  }

  /**
   * Render timeline markers
   */
  private renderMarkers(): string {
    const duration = this.renderer.getDuration();
    if (duration === 0) return '';

    return this.markers.map(marker => {
      const position = (marker.time / duration) * 100;
      const color = marker.color || this.getMarkerColor(marker.type);

      return `
        <div style="
          position: absolute;
          left: ${position}%;
          top: 0;
          width: 2px;
          height: 100%;
          background: ${color};
          opacity: 0.7;
        " title="${marker.label}"></div>
      `;
    }).join('');
  }

  /**
   * Get marker color based on type
   */
  private getMarkerColor(type: string): string {
    switch (type) {
      case 'scene': return '#ffcc00';
      case 'event': return '#00ccff';
      case 'custom': return '#ff00ff';
      default: return '#ffffff';
    }
  }

  /**
   * Setup timeline interaction (click and drag)
   */
  private setupTimelineInteraction(): void {
    if (!this.timelineElement) return;

    const track = this.timelineElement.querySelector('.timeline-track') as HTMLElement;
    const scrubber = this.timelineElement.querySelector('.timeline-scrubber') as HTMLElement;

    if (!track || !scrubber) return;

    const handleScrub = (event: MouseEvent) => {
      const rect = track.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const progress = Math.max(0, Math.min(1, x / rect.width));
      const time = progress * this.renderer.getDuration();
      this.onTimelineScrub(time);
    };

    // Click to scrub
    track.addEventListener('click', handleScrub);

    // Drag to scrub
    scrubber.addEventListener('mousedown', (event) => {
      event.preventDefault();
      this.isDraggingScrubber = true;

      const handleMouseMove = (e: MouseEvent) => {
        if (this.isDraggingScrubber) {
          handleScrub(e);
        }
      };

      const handleMouseUp = () => {
        this.isDraggingScrubber = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });
  }

  /**
   * Update timeline display
   */
  private updateTimeline(): void {
    if (!this.timelineElement) return;
    this.renderTimeline();
  }

  /**
   * Create property inspector UI
   */
  private createPropertyInspector(): void {
    this.inspectorElement = document.createElement('div');
    this.inspectorElement.className = 'cinematic-property-inspector';
    this.inspectorElement.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 80%;
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #00ff88;
      border-radius: 4px;
      pointer-events: auto;
      padding: 15px;
      box-sizing: border-box;
      overflow-y: auto;
      display: none;
    `;

    this.editorContainer?.appendChild(this.inspectorElement);
  }

  /**
   * Update property inspector content
   */
  private updatePropertyInspector(): void {
    if (!this.inspectorElement || !this.selectedLayer) return;

    const layer = this.selectedLayer;
    const properties = this.getLayerProperties(layer);

    this.inspectorElement.innerHTML = `
      <div style="color: #00ff88; font-family: monospace; font-size: 14px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #00ff88; padding-bottom: 5px;">
        Layer Inspector
      </div>
      <div style="color: #fff; font-family: monospace; font-size: 12px;">
        <div style="margin-bottom: 10px;">
          <div style="color: #888;">ID:</div>
          <div style="color: #ffcc00;">${layer.id}</div>
        </div>
        <div style="margin-bottom: 10px;">
          <div style="color: #888;">Type:</div>
          <div style="color: #00ccff;">${layer.type}</div>
        </div>
        <div style="margin-bottom: 10px;">
          <div style="color: #888;">Z-Index:</div>
          <div>${layer.zIndex}</div>
        </div>
        ${this.renderProperties(properties)}
      </div>
      <button style="
        margin-top: 10px;
        padding: 5px 10px;
        background: #00ff88;
        color: #000;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-family: monospace;
        font-size: 11px;
      " onclick="this.parentElement.style.display='none'">Close</button>
    `;
  }

  /**
   * Get layer properties for inspection
   */
  private getLayerProperties(layer: ICinematicLayer): Record<string, any> {
    // Extract properties from layer instance
    // This is a simplified version - in reality, we'd need to access layer-specific properties
    const properties: Record<string, any> = {};

    // Try to get common properties
    if ('opacity' in layer) properties['opacity'] = (layer as any).opacity;
    if ('x' in layer) properties['x'] = (layer as any).x;
    if ('y' in layer) properties['y'] = (layer as any).y;
    if ('scale' in layer) properties['scale'] = (layer as any).scale;
    if ('rotation' in layer) properties['rotation'] = (layer as any).rotation;

    return properties;
  }

  /**
   * Render properties in inspector
   */
  private renderProperties(properties: Record<string, any>): string {
    if (Object.keys(properties).length === 0) {
      return '<div style="color: #888; font-style: italic;">No properties available</div>';
    }

    return Object.entries(properties).map(([key, value]) => `
      <div style="margin-bottom: 8px;">
        <div style="color: #888;">${key}:</div>
        <div style="color: #fff;">${this.formatPropertyValue(value)}</div>
      </div>
    `).join('');
  }

  /**
   * Format property value for display
   */
  private formatPropertyValue(value: any): string {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  /**
   * Create bounding box container
   */
  private createBoundingBoxContainer(): void {
    this.boundingBoxContainer = document.createElement('div');
    this.boundingBoxContainer.className = 'cinematic-bounding-boxes';
    this.boundingBoxContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9998;
    `;

    this.editorContainer?.appendChild(this.boundingBoxContainer);
    this.updateBoundingBoxes();
  }

  /**
   * Update bounding boxes for all layers
   */
  private updateBoundingBoxes(): void {
    if (!this.boundingBoxContainer) return;

    // Clear existing boxes
    this.boundingBoxContainer.innerHTML = '';

    // Get all active layers from renderer
    const layers = this.getAllLayers();

    layers.forEach(layer => {
      const box = this.createBoundingBox(layer);
      if (box) {
        this.boundingBoxContainer?.appendChild(box);
      }
    });
  }

  /**
   * Create bounding box for a layer
   */
  private createBoundingBox(layer: ICinematicLayer): HTMLElement | null {
    // Try to get layer element from DOM
    const layerElement = this.container.querySelector(`[data-layer-id="${layer.id}"]`) as HTMLElement;
    if (!layerElement) return null;

    const rect = layerElement.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    const box = document.createElement('div');
    box.className = 'layer-bounding-box';
    box.style.cssText = `
      position: absolute;
      left: ${rect.left - containerRect.left}px;
      top: ${rect.top - containerRect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 2px solid #00ff88;
      pointer-events: auto;
      cursor: pointer;
      box-sizing: border-box;
    `;

    // Add label
    const label = document.createElement('div');
    label.style.cssText = `
      position: absolute;
      top: -20px;
      left: 0;
      background: #00ff88;
      color: #000;
      padding: 2px 6px;
      font-family: monospace;
      font-size: 10px;
      font-weight: bold;
      border-radius: 2px;
      white-space: nowrap;
    `;
    label.textContent = `${layer.type}:${layer.id}`;
    box.appendChild(label);

    // Add click handler
    box.addEventListener('click', () => {
      this.onLayerClick(layer.id);
    });

    return box;
  }

  /**
   * Highlight a specific layer
   */
  private highlightLayer(layerId: string): void {
    // Remove existing highlights
    const boxes = this.boundingBoxContainer?.querySelectorAll('.layer-bounding-box');
    boxes?.forEach(box => {
      (box as HTMLElement).style.border = '2px solid #00ff88';
    });

    // Highlight selected layer
    const selectedBox = this.boundingBoxContainer?.querySelector(`[data-layer-id="${layerId}"]`) as HTMLElement;
    if (selectedBox) {
      selectedBox.style.border = '3px solid #ffcc00';
      selectedBox.style.boxShadow = '0 0 10px rgba(255,204,0,0.5)';
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for renderer events
    this.renderer.on('frame', () => {
      if (this.config.showTimeline) {
        this.updateTimeline();
      }
      if (this.config.showBoundingBoxes) {
        this.updateBoundingBoxes();
      }
      if (this.config.showPropertyInspector && this.selectedLayer) {
        this.updatePropertyInspector();
      }
    });

    // Listen for keyboard shortcuts (E key to toggle editor mode)
    document.addEventListener('keydown', (event) => {
      if (event.key === 'e' || event.key === 'E') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.toggle();
        }
      }
    });
  }

  /**
   * Enable debug overlay for performance metrics
   */
  private enableDebugOverlay(): void {
    if (!this.debugOverlay) {
      this.debugOverlay = new DebugOverlay(this.renderer, this.container, {
        position: 'top-left',
        showPerformanceGraph: true,
      });
    }
    this.debugOverlay.show();
  }

  /**
   * Extract timeline markers from renderer spec
   */
  private extractTimelineMarkers(): void {
    // Get scenes from renderer and create markers
    // TODO: Implement getScenes() method in CinematicRenderer2D
    // const scenes = this.renderer.getScenes();
    // scenes.forEach((scene: any) => {
    //   this.addMarker({
    //     time: scene.startTime,
    //     label: scene.name || scene.id,
    //     type: 'scene',
    //   });
    // });
  }

  /**
   * Find layer by ID
   */
  private findLayerById(layerId: string): ICinematicLayer | null {
    const layers = this.getAllLayers();
    return layers.find(layer => layer.id === layerId) || null;
  }

  /**
   * Get all active layers from renderer
   */
  private getAllLayers(): ICinematicLayer[] {
    // This would need to be implemented in the renderer
    // For now, return empty array
    return [];
  }

  /**
   * Format time in MM:SS.mmm format
   */
  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const remainingMs = Math.floor(ms % 1000);

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMs.toString().padStart(3, '0')}`;
    } else {
      return `${remainingSeconds}.${remainingMs.toString().padStart(3, '0')}s`;
    }
  }
}
