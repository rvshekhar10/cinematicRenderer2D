/**
 * Tests for Angular adapter
 */

import { describe, it, expect } from 'vitest';
import { CinematicPlayerComponent } from './index';

describe('CinematicPlayerComponent Angular Component', () => {
  it('should create component class', () => {
    expect(CinematicPlayerComponent).toBeDefined();
    expect(typeof CinematicPlayerComponent).toBe('function');
  });

  it('should have required Angular decorators and metadata', () => {
    // Check that the component has Angular metadata
    const component = CinematicPlayerComponent as any;
    expect(component).toBeDefined();
    
    // The component should be a class constructor
    expect(typeof component).toBe('function');
    expect(component.prototype).toBeDefined();
  });

  it('should have lifecycle methods', () => {
    const componentInstance = Object.create(CinematicPlayerComponent.prototype);
    
    expect(typeof componentInstance.ngOnInit).toBe('function');
    expect(typeof componentInstance.ngOnDestroy).toBe('function');
    expect(typeof componentInstance.ngOnChanges).toBe('function');
  });

  it('should have public API methods', () => {
    const componentInstance = Object.create(CinematicPlayerComponent.prototype);
    
    expect(typeof componentInstance.playEngine).toBe('function');
    expect(typeof componentInstance.pauseEngine).toBe('function');
    expect(typeof componentInstance.stopEngine).toBe('function');
    expect(typeof componentInstance.seekEngine).toBe('function');
    expect(typeof componentInstance.goToEvent).toBe('function');
    expect(typeof componentInstance.goToScene).toBe('function');
    expect(typeof componentInstance.setQuality).toBe('function');
    expect(typeof componentInstance.resizeEngine).toBe('function');
  });

  it('should have state getter methods', () => {
    const componentInstance = Object.create(CinematicPlayerComponent.prototype);
    
    expect(typeof componentInstance.getCurrentTime).toBe('function');
    expect(typeof componentInstance.getDuration).toBe('function');
    expect(typeof componentInstance.isPlaying).toBe('function');
    expect(typeof componentInstance.isPaused).toBe('function');
    expect(typeof componentInstance.getCurrentEvent).toBe('function');
    expect(typeof componentInstance.getCurrentScene).toBe('function');
    expect(typeof componentInstance.getState).toBe('function');
    expect(typeof componentInstance.getQuality).toBe('function');
    expect(typeof componentInstance.isMounted).toBe('function');
  });

  it('should have performance monitoring methods', () => {
    const componentInstance = Object.create(CinematicPlayerComponent.prototype);
    
    expect(typeof componentInstance.getCurrentFps).toBe('function');
    expect(typeof componentInstance.getPerformanceMetrics).toBe('function');
    expect(typeof componentInstance.getQualitySettings).toBe('function');
    expect(typeof componentInstance.getDeviceCapabilities).toBe('function');
  });

  it('should have audio control methods', () => {
    const componentInstance = Object.create(CinematicPlayerComponent.prototype);
    
    expect(typeof componentInstance.setMasterVolume).toBe('function');
    expect(typeof componentInstance.getMasterVolume).toBe('function');
    expect(typeof componentInstance.isWebAudioAvailable).toBe('function');
    expect(typeof componentInstance.getActiveAudioTrackCount).toBe('function');
  });

  it('should have engine access method', () => {
    const componentInstance = Object.create(CinematicPlayerComponent.prototype);
    
    expect(typeof componentInstance.getEngine).toBe('function');
  });
});