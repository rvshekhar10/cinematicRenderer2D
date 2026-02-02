/**
 * Tests for React adapter
 */

import './test-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { CinematicPlayer } from './index';
import type { CinematicSpec } from '../../types/CinematicSpec';

// Mock the core engine
vi.mock('../../core/CinematicRenderer2D', () => ({
  CinematicRenderer2D: vi.fn().mockImplementation(() => ({
    mount: vi.fn().mockResolvedValue(undefined),
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    destroy: vi.fn(),
    seek: vi.fn(),
    goToEvent: vi.fn(),
    goToScene: vi.fn(),
    setQuality: vi.fn(),
    resize: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    getCurrentTime: vi.fn().mockReturnValue(0),
    getDuration: vi.fn().mockReturnValue(1000),
    isPlaying: vi.fn().mockReturnValue(false),
    isPaused: vi.fn().mockReturnValue(false),
    getCurrentEvent: vi.fn().mockReturnValue(null),
    getCurrentScene: vi.fn().mockReturnValue(null),
    getState: vi.fn().mockReturnValue('idle'),
    getQuality: vi.fn().mockReturnValue('auto'),
    isMounted: vi.fn().mockReturnValue(false),
    getCurrentFps: vi.fn().mockReturnValue(60),
    getPerformanceMetrics: vi.fn().mockReturnValue({}),
    getQualitySettings: vi.fn().mockReturnValue({}),
    getDeviceCapabilities: vi.fn().mockReturnValue({}),
    setMasterVolume: vi.fn(),
    getMasterVolume: vi.fn().mockReturnValue(1),
    isWebAudioAvailable: vi.fn().mockReturnValue(true),
    getActiveAudioTrackCount: vi.fn().mockReturnValue(0),
  })),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('CinematicPlayer React Component', () => {
  const mockSpec: CinematicSpec = {
    schemaVersion: '1.0.0',
    engine: {
      targetFps: 60,
      quality: 'auto',
    },
    events: [
      {
        id: 'event1',
        name: 'Test Event',
        scenes: ['scene1'],
      },
    ],
    scenes: [
      {
        id: 'scene1',
        name: 'Test Scene',
        duration: 1000,
        layers: [],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(<CinematicPlayer spec={mockSpec} />);
    
    // Should render a div container
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
  });

  it('should apply custom className and styles', () => {
    const customClass = 'custom-player';
    const customStyle = { backgroundColor: 'red' };
    
    const { container } = render(
      <CinematicPlayer 
        spec={mockSpec} 
        className={customClass}
        style={customStyle}
      />
    );
    
    const playerDiv = container.firstChild as HTMLElement;
    expect(playerDiv).toHaveClass(customClass);
    expect(playerDiv).toHaveStyle('background-color: rgb(255, 0, 0)');
  });

  it('should have correct default styles', () => {
    const { container } = render(<CinematicPlayer spec={mockSpec} />);
    
    const playerDiv = container.firstChild as HTMLElement;
    expect(playerDiv).toHaveStyle({
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    });
  });
});