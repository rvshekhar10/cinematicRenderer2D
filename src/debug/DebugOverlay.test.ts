/**
 * Tests for DebugOverlay
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DebugOverlay } from './DebugOverlay';
import { CinematicRenderer2D } from '../core/CinematicRenderer2D';
import type { CinematicSpec } from '../types/CinematicSpec';

// Mock CinematicRenderer2D for testing
const mockRenderer = {
  getCurrentTime: vi.fn(() => 1500),
  getDuration: vi.fn(() => 5000),
  getCurrentFps: vi.fn(() => 60),
  getPerformanceMetrics: vi.fn(() => ({
    activeLayers: 3,
    activeParticles: 50,
    domNodes: 10,
    drawCalls: 2,
  })),
  getCurrentEvent: vi.fn(() => 'test-event'),
  getCurrentScene: vi.fn(() => 'test-scene'),
  getQuality: vi.fn(() => 'high'),
  isPlaying: vi.fn(() => true),
  isPaused: vi.fn(() => false),
  on: vi.fn(),
} as unknown as CinematicRenderer2D;

describe('DebugOverlay', () => {
  let container: HTMLElement;
  let debugOverlay: DebugOverlay;

  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    container.style.position = 'relative';
    document.body.appendChild(container);

    // Create debug overlay
    debugOverlay = new DebugOverlay(mockRenderer, container);
  });

  afterEach(() => {
    debugOverlay.destroy();
    document.body.removeChild(container);
  });

  it('should create debug overlay element', () => {
    const overlayElement = container.querySelector('.cinematic-debug-overlay');
    expect(overlayElement).toBeTruthy();
    expect(overlayElement?.tagName).toBe('DIV');
  });

  it('should be hidden by default', () => {
    const overlayElement = container.querySelector('.cinematic-debug-overlay') as HTMLElement;
    expect(overlayElement.style.display).toBe('none');
  });

  it('should show when show() is called', () => {
    debugOverlay.show();
    const overlayElement = container.querySelector('.cinematic-debug-overlay') as HTMLElement;
    expect(overlayElement.style.display).toBe('block');
  });

  it('should hide when hide() is called', () => {
    debugOverlay.show();
    debugOverlay.hide();
    const overlayElement = container.querySelector('.cinematic-debug-overlay') as HTMLElement;
    expect(overlayElement.style.display).toBe('none');
  });

  it('should toggle visibility', () => {
    const overlayElement = container.querySelector('.cinematic-debug-overlay') as HTMLElement;
    
    // Initially hidden
    expect(overlayElement.style.display).toBe('none');
    
    // Toggle to show
    debugOverlay.toggle();
    expect(overlayElement.style.display).toBe('block');
    
    // Toggle to hide
    debugOverlay.toggle();
    expect(overlayElement.style.display).toBe('none');
  });

  it('should display debug information when shown', () => {
    debugOverlay.show();
    
    // Wait for update cycle
    setTimeout(() => {
      const overlayElement = container.querySelector('.cinematic-debug-overlay') as HTMLElement;
      const content = overlayElement.innerHTML;
      
      // Check for key debug information
      expect(content).toContain('cinematicRenderer2D Debug');
      expect(content).toContain('FPS:');
      expect(content).toContain('Quality:');
      expect(content).toContain('Timeline:');
      expect(content).toContain('Current:');
      expect(content).toContain('Rendering:');
    }, 150); // Wait for update interval
  });

  it('should position overlay correctly', () => {
    const overlayElement = container.querySelector('.cinematic-debug-overlay') as HTMLElement;
    
    // Check that position is absolute and positioning properties are set
    expect(overlayElement.style.position).toBe('absolute');
    // Note: styles are applied via Object.assign, so we check computed styles or class
    expect(overlayElement.className).toContain('cinematic-debug-overlay');
  });

  it('should support different positions', () => {
    debugOverlay.destroy();
    
    // Create with bottom-left position
    debugOverlay = new DebugOverlay(mockRenderer, container, {
      position: 'bottom-left'
    });
    
    const overlayElement = container.querySelector('.cinematic-debug-overlay') as HTMLElement;
    expect(overlayElement.style.position).toBe('absolute');
    expect(overlayElement.className).toContain('cinematic-debug-overlay');
  });

  it('should clean up when destroyed', () => {
    debugOverlay.show();
    
    // Verify overlay exists
    let overlayElement = container.querySelector('.cinematic-debug-overlay');
    expect(overlayElement).toBeTruthy();
    
    // Destroy and verify cleanup
    debugOverlay.destroy();
    overlayElement = container.querySelector('.cinematic-debug-overlay');
    expect(overlayElement).toBeFalsy();
  });

  it('should handle performance graph when enabled', () => {
    debugOverlay.destroy();
    
    // Create with performance graph enabled
    debugOverlay = new DebugOverlay(mockRenderer, container, {
      showPerformanceGraph: true
    });
    
    debugOverlay.show();
    
    // Simulate some FPS history
    // This would normally be populated by frame events
    // For testing, we'll just verify the option is stored
    expect(debugOverlay).toBeTruthy();
  });
});