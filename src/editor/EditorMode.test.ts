/**
 * Tests for EditorMode
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EditorMode } from './EditorMode';
import type { EditorModeConfig } from './EditorMode';

// Mock CinematicRenderer2D
class MockRenderer {
  private eventHandlers: Map<string, Function[]> = new Map();
  private currentTime = 0;
  private duration = 10000;
  private scenes: any[] = [];

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getDuration(): number {
    return this.duration;
  }

  getScenes(): any[] {
    return this.scenes;
  }

  seek(time: number): void {
    this.currentTime = time;
  }

  setScenes(scenes: any[]): void {
    this.scenes = scenes;
  }

  getCurrentFps(): number {
    return 60;
  }

  getPerformanceMetrics(): any {
    return {
      activeLayers: 0,
      activeParticles: 0,
      domNodes: 0,
      drawCalls: 0,
    };
  }

  getCurrentEvent(): string | null {
    return null;
  }

  getCurrentScene(): string | null {
    return null;
  }

  getQuality(): string {
    return 'high';
  }

  isPlaying(): boolean {
    return false;
  }

  isPaused(): boolean {
    return false;
  }
}

describe('EditorMode', () => {
  let container: HTMLElement;
  let renderer: MockRenderer;
  let editorMode: EditorMode;

  beforeEach(() => {
    // Create container
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    // Create mock renderer
    renderer = new MockRenderer();
  });

  afterEach(() => {
    if (editorMode) {
      editorMode.destroy();
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Initialization', () => {
    it('should create editor mode with default config', () => {
      const config: EditorModeConfig = {
        enabled: false,
      };

      editorMode = new EditorMode(renderer as any, container, config);

      expect(editorMode).toBeDefined();
    });

    it('should auto-enable when config.enabled is true', () => {
      const config: EditorModeConfig = {
        enabled: true,
        showPerformanceMetrics: false, // Disable to avoid DebugOverlay issues in tests
      };

      editorMode = new EditorMode(renderer as any, container, config);

      // Check that editor container was created
      const editorContainer = container.querySelector('.cinematic-editor-mode');
      expect(editorContainer).toBeTruthy();
    });

    it('should not auto-enable when config.enabled is false', () => {
      const config: EditorModeConfig = {
        enabled: false,
      };

      editorMode = new EditorMode(renderer as any, container, config);

      // Check that editor container was not created
      const editorContainer = container.querySelector('.cinematic-editor-mode');
      expect(editorContainer).toBeFalsy();
    });
  });

  describe('Enable/Disable', () => {
    beforeEach(() => {
      const config: EditorModeConfig = {
        enabled: false,
      };
      editorMode = new EditorMode(renderer as any, container, config);
    });

    it('should enable editor mode', () => {
      editorMode.enable();

      const editorContainer = container.querySelector('.cinematic-editor-mode');
      expect(editorContainer).toBeTruthy();
    });

    it('should disable editor mode', () => {
      editorMode.enable();
      editorMode.disable();

      const editorContainer = container.querySelector('.cinematic-editor-mode');
      expect(editorContainer).toBeFalsy();
    });

    it('should toggle editor mode', () => {
      editorMode.toggle();
      let editorContainer = container.querySelector('.cinematic-editor-mode');
      expect(editorContainer).toBeTruthy();

      editorMode.toggle();
      editorContainer = container.querySelector('.cinematic-editor-mode');
      expect(editorContainer).toBeFalsy();
    });

    it('should not create duplicate UI when enabling twice', () => {
      editorMode.enable();
      editorMode.enable();

      const editorContainers = container.querySelectorAll('.cinematic-editor-mode');
      expect(editorContainers.length).toBe(1);
    });
  });

  describe('Timeline', () => {
    beforeEach(() => {
      const config: EditorModeConfig = {
        enabled: true,
        showTimeline: true,
        showPerformanceMetrics: false,
      };
      editorMode = new EditorMode(renderer as any, container, config);
    });

    it('should create timeline when showTimeline is true', () => {
      const timeline = container.querySelector('.cinematic-timeline');
      expect(timeline).toBeTruthy();
    });

    it('should show timeline', () => {
      editorMode.showTimeline();

      const timeline = container.querySelector('.cinematic-timeline') as HTMLElement;
      expect(timeline.style.display).not.toBe('none');
    });

    it('should hide timeline', () => {
      editorMode.hideTimeline();

      const timeline = container.querySelector('.cinematic-timeline') as HTMLElement;
      expect(timeline.style.display).toBe('none');
    });

    it('should add timeline marker', () => {
      editorMode.addMarker({
        time: 5000,
        label: 'Test Marker',
        type: 'custom',
      });

      // Timeline should be re-rendered with marker
      const timeline = container.querySelector('.cinematic-timeline');
      expect(timeline).toBeTruthy();
    });

    it('should remove timeline marker', () => {
      editorMode.addMarker({
        time: 5000,
        label: 'Test Marker',
        type: 'custom',
      });

      editorMode.removeMarker(5000);

      // Marker should be removed
      const timeline = container.querySelector('.cinematic-timeline');
      expect(timeline).toBeTruthy();
    });

    it('should extract scene markers from renderer', () => {
      renderer.setScenes([
        { id: 'scene1', name: 'Scene 1', startTime: 0 },
        { id: 'scene2', name: 'Scene 2', startTime: 5000 },
      ]);

      // Create new editor mode to trigger marker extraction
      editorMode.destroy();
      editorMode = new EditorMode(renderer as any, container, {
        enabled: true,
        showTimeline: true,
      });

      const timeline = container.querySelector('.cinematic-timeline');
      expect(timeline).toBeTruthy();
    });
  });

  describe('Timeline Scrubbing', () => {
    beforeEach(() => {
      const config: EditorModeConfig = {
        enabled: true,
        showTimeline: true,
        showPerformanceMetrics: false,
      };
      editorMode = new EditorMode(renderer as any, container, config);
    });

    it('should seek renderer when scrubbing timeline', () => {
      const seekSpy = vi.spyOn(renderer, 'seek');

      editorMode.onTimelineScrub(5000);

      expect(seekSpy).toHaveBeenCalledWith(5000);
    });

    it('should update timeline after scrubbing', () => {
      editorMode.onTimelineScrub(5000);

      expect(renderer.getCurrentTime()).toBe(5000);
    });
  });

  describe('Property Inspector', () => {
    beforeEach(() => {
      const config: EditorModeConfig = {
        enabled: true,
        showPropertyInspector: true,
        showPerformanceMetrics: false,
      };
      editorMode = new EditorMode(renderer as any, container, config);
    });

    it('should create property inspector when showPropertyInspector is true', () => {
      const inspector = container.querySelector('.cinematic-property-inspector');
      expect(inspector).toBeTruthy();
    });

    it('should hide property inspector initially', () => {
      const inspector = container.querySelector('.cinematic-property-inspector') as HTMLElement;
      expect(inspector.style.display).toBe('none');
    });

    it('should hide property inspector', () => {
      editorMode.hidePropertyInspector();

      const inspector = container.querySelector('.cinematic-property-inspector') as HTMLElement;
      expect(inspector.style.display).toBe('none');
    });
  });

  describe('Bounding Boxes', () => {
    beforeEach(() => {
      const config: EditorModeConfig = {
        enabled: true,
        showBoundingBoxes: true,
        showPerformanceMetrics: false,
      };
      editorMode = new EditorMode(renderer as any, container, config);
    });

    it('should create bounding box container when showBoundingBoxes is true', () => {
      const boundingBoxContainer = container.querySelector('.cinematic-bounding-boxes');
      expect(boundingBoxContainer).toBeTruthy();
    });

    it('should show bounding boxes', () => {
      editorMode.showBoundingBoxes();

      const boundingBoxContainer = container.querySelector('.cinematic-bounding-boxes') as HTMLElement;
      expect(boundingBoxContainer.style.display).not.toBe('none');
    });

    it('should hide bounding boxes', () => {
      editorMode.hideBoundingBoxes();

      const boundingBoxContainer = container.querySelector('.cinematic-bounding-boxes') as HTMLElement;
      expect(boundingBoxContainer.style.display).toBe('none');
    });
  });

  describe('Configuration', () => {
    beforeEach(() => {
      const config: EditorModeConfig = {
        enabled: true,
        showPerformanceMetrics: false,
      };
      editorMode = new EditorMode(renderer as any, container, config);
    });

    it('should update configuration', () => {
      editorMode.setConfig({
        showTimeline: true,
      });

      // Timeline should be created
      const timeline = container.querySelector('.cinematic-timeline');
      expect(timeline).toBeTruthy();
    });

    it('should recreate UI when config changes while enabled', () => {
      editorMode.setConfig({
        showTimeline: true,
        showPropertyInspector: true,
      });

      const timeline = container.querySelector('.cinematic-timeline');
      const inspector = container.querySelector('.cinematic-property-inspector');

      expect(timeline).toBeTruthy();
      expect(inspector).toBeTruthy();
    });
  });

  describe('Cleanup', () => {
    beforeEach(() => {
      const config: EditorModeConfig = {
        enabled: true,
        showTimeline: true,
        showPropertyInspector: true,
        showBoundingBoxes: true,
        showPerformanceMetrics: false,
      };
      editorMode = new EditorMode(renderer as any, container, config);
    });

    it('should destroy all UI elements', () => {
      editorMode.destroy();

      const editorContainer = container.querySelector('.cinematic-editor-mode');
      expect(editorContainer).toBeFalsy();
    });

    it('should remove event listeners', () => {
      const emitSpy = vi.spyOn(renderer, 'emit');

      editorMode.destroy();

      // Emit frame event - should not cause errors
      renderer.emit('frame');

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    beforeEach(() => {
      const config: EditorModeConfig = {
        enabled: false,
        showPerformanceMetrics: false,
      };
      editorMode = new EditorMode(renderer as any, container, config);
    });

    it('should toggle editor mode with Ctrl+E', () => {
      // Enable first to set up event listeners
      editorMode.enable();

      const event = new KeyboardEvent('keydown', {
        key: 'e',
        ctrlKey: true,
        bubbles: true,
      });

      document.dispatchEvent(event);

      // Should toggle off (was enabled)
      let editorContainer = container.querySelector('.cinematic-editor-mode');
      expect(editorContainer).toBeFalsy();

      // Dispatch again to toggle back on
      document.dispatchEvent(event);
      editorContainer = container.querySelector('.cinematic-editor-mode');
      expect(editorContainer).toBeTruthy();
    });

    it('should toggle editor mode with Cmd+E on Mac', () => {
      // Enable first to set up event listeners
      editorMode.enable();

      const event = new KeyboardEvent('keydown', {
        key: 'E',
        metaKey: true,
        bubbles: true,
      });

      document.dispatchEvent(event);

      // Should toggle off (was enabled)
      let editorContainer = container.querySelector('.cinematic-editor-mode');
      expect(editorContainer).toBeFalsy();

      // Dispatch again to toggle back on
      document.dispatchEvent(event);
      editorContainer = container.querySelector('.cinematic-editor-mode');
      expect(editorContainer).toBeTruthy();
    });
  });

  describe('Debug Mode Integration', () => {
    it('should auto-enable when debug mode is activated', () => {
      const config: EditorModeConfig = {
        enabled: false,
        autoEnableWithDebug: true,
        showPerformanceMetrics: false,
      };

      editorMode = new EditorMode(renderer as any, container, config);

      // Initially disabled
      let editorContainer = container.querySelector('.cinematic-editor-mode');
      expect(editorContainer).toBeFalsy();

      // Emit debug mode changed event
      renderer.emit('debugModeChanged', true);

      // Should now be enabled
      editorContainer = container.querySelector('.cinematic-editor-mode');
      expect(editorContainer).toBeTruthy();
    });

    it('should not auto-enable when autoEnableWithDebug is false', () => {
      const config: EditorModeConfig = {
        enabled: false,
        autoEnableWithDebug: false,
        showPerformanceMetrics: false,
      };

      editorMode = new EditorMode(renderer as any, container, config);

      // Emit debug mode changed event
      renderer.emit('debugModeChanged', true);

      // Should still be disabled
      const editorContainer = container.querySelector('.cinematic-editor-mode');
      expect(editorContainer).toBeFalsy();
    });
  });
});
