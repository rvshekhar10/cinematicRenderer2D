# React Integration Guide

This guide covers how to integrate cinematicRenderer2D into React applications, including setup, usage patterns, and best practices.

## Installation

```bash
npm install cinematic-renderer2d
```

## Basic Setup

### Import the React Adapter

```tsx
import { CinematicPlayer } from 'cinematic-renderer2d/react';
import type { CinematicSpec } from 'cinematic-renderer2d';
```

### Basic Component Usage

```tsx
import React from 'react';
import { CinematicPlayer } from 'cinematic-renderer2d/react';

const cinematicSpec: CinematicSpec = {
  schemaVersion: '1.0.0',
  engine: {
    targetFps: 60,
    quality: 'auto'
  },
  events: [{
    id: 'intro',
    name: 'Introduction',
    scenes: ['scene1']
  }],
  scenes: [{
    id: 'scene1',
    name: 'Opening Scene',
    duration: 5000,
    layers: [{
      id: 'background',
      type: 'gradient',
      zIndex: 1,
      config: {
        colors: ['#000000', '#333333']
      }
    }]
  }]
};

function App() {
  return (
    <div className="app">
      <CinematicPlayer
        spec={cinematicSpec}
        autoplay={true}
        onPlay={() => console.log('Started playing')}
        onEnd={() => console.log('Playback completed')}
      />
    </div>
  );
}

export default App;
```

## Component Props

### Required Props

```tsx
interface CinematicPlayerProps {
  spec: CinematicSpec;           // JSON specification (required)
}
```

### Optional Props

```tsx
interface CinematicPlayerProps {
  // Playback options
  autoplay?: boolean;            // Auto-start playback (default: false)
  quality?: QualityLevel;        // Quality level (default: 'auto')
  debug?: boolean;               // Enable debug overlay (default: false)
  editorMode?: boolean | Partial<EditorModeConfig>; // Enable editor mode (default: false)
  
  // Event handlers
  onPlay?: () => void;           // Playback started
  onPause?: () => void;          // Playback paused
  onStop?: () => void;           // Playback stopped
  onEnd?: () => void;            // Playback completed
  onError?: (error: Error) => void; // Error occurred
  onQualityChange?: (quality: QualityLevel) => void; // Quality changed
  onSceneChange?: (sceneId: string) => void; // Scene changed
  onEventChange?: (eventId: string) => void; // Event changed
  
  // Styling
  className?: string;            // CSS class name
  style?: React.CSSProperties;   // Inline styles
}

// Editor Mode Configuration
interface EditorModeConfig {
  enabled: boolean;
  showTimeline?: boolean;              // Show timeline scrubber (default: true)
  showBoundingBoxes?: boolean;         // Show layer bounding boxes (default: true)
  showPropertyInspector?: boolean;     // Show property inspector (default: true)
  showPerformanceMetrics?: boolean;    // Show performance metrics (default: true)
  autoEnableWithDebug?: boolean;       // Auto-enable with debug mode (default: true)
}
```

## Advanced Usage Patterns

### Imperative API Access

The `CinematicPlayer` component exposes a comprehensive imperative API through refs:

```tsx
import React, { useRef } from 'react';
import { CinematicPlayer, type CinematicPlayerRef } from 'cinematic-renderer2d/react';

function ImperativeAPIExample() {
  const playerRef = useRef<CinematicPlayerRef>(null);

  // Playback control
  const handlePlay = () => playerRef.current?.play();
  const handlePause = () => playerRef.current?.pause();
  const handleStop = () => playerRef.current?.stop();
  const handleSeek = (time: number) => playerRef.current?.seek(time);
  
  // Navigation
  const goToEvent = (eventId: string) => playerRef.current?.goToEvent(eventId);
  const goToScene = (sceneId: string) => playerRef.current?.goToScene(sceneId);
  
  // Quality control
  const setQuality = (level: QualityLevel) => playerRef.current?.setQuality(level);
  
  // Debug and editor mode
  const toggleDebug = () => playerRef.current?.toggleDebug();
  const toggleEditor = () => playerRef.current?.toggleEditorMode();
  const showDebug = () => playerRef.current?.showDebug();
  const hideDebug = () => playerRef.current?.hideDebug();
  const showEditor = () => playerRef.current?.showEditorMode();
  const hideEditor = () => playerRef.current?.hideEditorMode();
  
  // State queries
  const getCurrentTime = () => playerRef.current?.getCurrentTime() ?? 0;
  const getDuration = () => playerRef.current?.getDuration() ?? 0;
  const isPlaying = () => playerRef.current?.isPlaying() ?? false;
  const getCurrentFps = () => playerRef.current?.getCurrentFps() ?? 0;
  
  // Audio control
  const setVolume = (volume: number) => playerRef.current?.setMasterVolume(volume);
  const getVolume = () => playerRef.current?.getMasterVolume() ?? 1;

  return (
    <div>
      <CinematicPlayer ref={playerRef} spec={cinematicSpec} />
      
      <div className="controls">
        <button onClick={handlePlay}>Play</button>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleStop}>Stop</button>
        <button onClick={() => handleSeek(5000)}>Seek to 5s</button>
        <button onClick={toggleDebug}>Toggle Debug</button>
        <button onClick={toggleEditor}>Toggle Editor</button>
        <button onClick={() => setVolume(0.5)}>50% Volume</button>
      </div>
      
      <div className="info">
        <p>Time: {getCurrentTime()}ms / {getDuration()}ms</p>
        <p>FPS: {getCurrentFps()}</p>
        <p>Playing: {isPlaying() ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}
```

### Editor Mode Usage

```tsx
import React, { useRef } from 'react';
import { CinematicPlayer, type CinematicPlayerRef } from 'cinematic-renderer2d/react';

function EditorModeExample() {
  const playerRef = useRef<CinematicPlayerRef>(null);

  const toggleEditor = () => {
    playerRef.current?.toggleEditorMode();
  };

  const toggleDebug = () => {
    playerRef.current?.toggleDebug();
  };

  return (
    <div className="editor-example">
      <CinematicPlayer
        ref={playerRef}
        spec={cinematicSpec}
        editorMode={true}  // Enable editor mode
        debug={false}
      />
      
      <div className="controls">
        <button onClick={toggleEditor}>
          Toggle Editor Mode
        </button>
        <button onClick={toggleDebug}>
          Toggle Debug Overlay
        </button>
      </div>
    </div>
  );
}

// Advanced editor mode configuration
function AdvancedEditorMode() {
  const playerRef = useRef<CinematicPlayerRef>(null);

  return (
    <CinematicPlayer
      ref={playerRef}
      spec={cinematicSpec}
      editorMode={{
        enabled: true,
        showTimeline: true,
        showBoundingBoxes: true,
        showPropertyInspector: true,
        showPerformanceMetrics: true,
        autoEnableWithDebug: true
      }}
    />
  );
}
```

### Editor Mode Features

The editor mode provides several visual development tools:

- **Timeline Scrubber**: Visual timeline with scene markers and draggable scrubber for precise time navigation
- **Bounding Boxes**: Visual outlines around all layers with click-to-inspect functionality
- **Property Inspector**: Real-time property viewer for selected layers
- **Performance Metrics**: Integrated debug overlay showing FPS, frame time, and quality settings
- **Keyboard Shortcuts**: Press `Ctrl+E` (or `Cmd+E` on Mac) to toggle editor mode

```tsx
// Example: Using editor mode with keyboard shortcuts
function EditorWithShortcuts() {
  const playerRef = useRef<CinematicPlayerRef>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+E or Cmd+E toggles editor mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        playerRef.current?.toggleEditorMode();
      }
      // Ctrl+D or Cmd+D toggles debug overlay
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        playerRef.current?.toggleDebug();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <CinematicPlayer
      ref={playerRef}
      spec={cinematicSpec}
      editorMode={true}
    />
  );
}
```

### State Management with Hooks

```tsx
import React, { useState, useCallback, useRef } from 'react';
import { CinematicPlayer, type CinematicPlayerRef } from 'cinematic-renderer2d/react';
import type { QualityLevel } from 'cinematic-renderer2d';

function CinematicApp() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<QualityLevel>('auto');
  const [error, setError] = useState<Error | null>(null);
  const rendererRef = useRef<CinematicPlayerRef | null>(null);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setError(null);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleError = useCallback((err: Error) => {
    setError(err);
    setIsPlaying(false);
  }, []);

  const handleQualityChange = useCallback((quality: QualityLevel) => {
    setCurrentQuality(quality);
  }, []);

  // Manual control methods
  const seekTo = useCallback((timeMs: number) => {
    rendererRef.current?.seek(timeMs);
  }, []);

  const changeQuality = useCallback((quality: QualityLevel) => {
    rendererRef.current?.setQuality(quality);
  }, []);

  const toggleDebug = useCallback(() => {
    rendererRef.current?.toggleDebug();
  }, []);

  const toggleEditor = useCallback(() => {
    rendererRef.current?.toggleEditorMode();
  }, []);

  return (
    <div className="cinematic-app">
      <CinematicPlayer
        ref={rendererRef}
        spec={cinematicSpec}
        autoplay={false}
        quality={currentQuality}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        onQualityChange={handleQualityChange}
        className="cinematic-player"
      />
      
      {/* Control Panel */}
      <div className="controls">
        <button onClick={() => rendererRef.current?.play()}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={() => seekTo(0)}>Restart</button>
        <button onClick={toggleDebug}>Toggle Debug</button>
        <button onClick={toggleEditor}>Toggle Editor</button>
        <select 
          value={currentQuality} 
          onChange={(e) => changeQuality(e.target.value as QualityLevel)}
        >
          <option value="auto">Auto</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="ultra">Ultra</option>
        </select>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="error">
          Error: {error.message}
        </div>
      )}
      
      {/* Status Display */}
      <div className="status">
        Status: {isPlaying ? 'Playing' : 'Paused'} | Quality: {currentQuality}
      </div>
    </div>
  );
}
```

### Dynamic Specification Loading

```tsx
import React, { useState, useEffect } from 'react';
import { CinematicPlayer } from 'cinematic-renderer2d/react';
import type { CinematicSpec } from 'cinematic-renderer2d';

function DynamicCinematicPlayer({ specUrl }: { specUrl: string }) {
  const [spec, setSpec] = useState<CinematicSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSpec() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(specUrl);
        if (!response.ok) {
          throw new Error(`Failed to load spec: ${response.statusText}`);
        }
        
        const specData = await response.json();
        setSpec(specData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadSpec();
  }, [specUrl]);

  if (loading) {
    return <div className="loading">Loading cinematic experience...</div>;
  }

  if (error) {
    return <div className="error">Error loading spec: {error}</div>;
  }

  if (!spec) {
    return <div className="error">No specification loaded</div>;
  }

  return (
    <CinematicPlayer
      spec={spec}
      autoplay={true}
      onError={(err) => setError(err.message)}
    />
  );
}
```

### Custom Hook for Cinematic Control

```tsx
import { useRef, useCallback, useState, useEffect } from 'react';
import type { CinematicRenderer2D, QualityLevel } from 'cinematic-renderer2d';

interface UseCinematicReturn {
  rendererRef: React.RefObject<CinematicRenderer2D>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  quality: QualityLevel;
  fps: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (timeMs: number) => void;
  setQuality: (quality: QualityLevel) => void;
  goToEvent: (eventId: string) => void;
  goToScene: (sceneId: string) => void;
  setCameraState: (state: Partial<CameraState>) => void;
  setMasterVolume: (volume: number) => void;
}

export function useCinematic(): UseCinematicReturn {
  const rendererRef = useRef<CinematicRenderer2D>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quality, setQualityState] = useState<QualityLevel>('auto');
  const [fps, setFps] = useState(60);

  // Update FPS periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (rendererRef.current) {
        setFps(rendererRef.current.getCurrentFps());
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const play = useCallback(() => {
    rendererRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    rendererRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    rendererRef.current?.stop();
  }, []);

  const seek = useCallback((timeMs: number) => {
    rendererRef.current?.seek(timeMs);
  }, []);

  const setQuality = useCallback((newQuality: QualityLevel) => {
    rendererRef.current?.setQuality(newQuality);
    setQualityState(newQuality);
  }, []);

  const goToEvent = useCallback((eventId: string) => {
    rendererRef.current?.goToEvent(eventId);
  }, []);

  const goToScene = useCallback((sceneId: string) => {
    rendererRef.current?.goToScene(sceneId);
  }, []);

  const setCameraState = useCallback((state: Partial<CameraState>) => {
    rendererRef.current?.setCameraState(state);
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    rendererRef.current?.setMasterVolume(volume);
  }, []);

  return {
    rendererRef,
    isPlaying,
    currentTime,
    duration,
    quality,
    fps,
    play,
    pause,
    stop,
    seek,
    setQuality,
    goToEvent,
    goToScene,
    setCameraState,
    setMasterVolume
  };
}

// Usage example
function CinematicWithCustomHook() {
  const {
    rendererRef,
    isPlaying,
    fps,
    play,
    pause,
    seek,
    setQuality,
    setCameraState,
    setMasterVolume
  } = useCinematic();

  return (
    <div>
      <CinematicPlayer
        ref={rendererRef}
        spec={cinematicSpec}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <div className="controls">
        <button onClick={isPlaying ? pause : play}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={() => seek(0)}>Restart</button>
        <button onClick={() => setQuality('high')}>High Quality</button>
        <button onClick={() => setCameraState({ zoom: 2.0 })}>Zoom In</button>
        <button onClick={() => setMasterVolume(0.5)}>50% Volume</button>
      </div>
      
      <div className="stats">
        FPS: {fps}
      </div>
    </div>
  );
}
```

## Styling and Layout

### CSS Styling

```css
/* Basic styling for the cinematic player */
.cinematic-player {
  width: 100%;
  height: 100vh;
  background: #000;
  position: relative;
  overflow: hidden;
}

/* Responsive design */
.cinematic-player {
  aspect-ratio: 16/9;
  max-width: 100%;
  max-height: 100vh;
}

/* Custom controls overlay */
.cinematic-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 1000;
}

.cinematic-controls button {
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.cinematic-controls button:hover {
  background: rgba(0, 0, 0, 0.9);
}

/* Loading state */
.cinematic-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #000;
  color: white;
  font-size: 18px;
}

/* Error state */
.cinematic-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #1a1a1a;
  color: #ff6b6b;
  font-size: 16px;
  text-align: center;
  padding: 20px;
}
```

### Styled Components Example

```tsx
import styled from 'styled-components';
import { CinematicPlayer } from 'cinematic-renderer2d/react';

const StyledCinematicPlayer = styled(CinematicPlayer)`
  width: 100%;
  height: 100vh;
  background: linear-gradient(45deg, #000, #333);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const PlayerContainer = styled.div`
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const ControlsOverlay = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 1000;
`;

const ControlButton = styled.button`
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

function StyledCinematicApp() {
  return (
    <PlayerContainer>
      <StyledCinematicPlayer
        spec={cinematicSpec}
        autoplay={true}
      />
      <ControlsOverlay>
        <ControlButton>Play/Pause</ControlButton>
        <ControlButton>Restart</ControlButton>
        <ControlButton>Settings</ControlButton>
      </ControlsOverlay>
    </PlayerContainer>
  );
}
```

## Performance Optimization

### Memoization and Optimization

```tsx
import React, { memo, useMemo, useCallback } from 'react';
import { CinematicPlayer } from 'cinematic-renderer2d/react';

// Memoize the component to prevent unnecessary re-renders
const OptimizedCinematicPlayer = memo(function OptimizedCinematicPlayer({
  spec,
  autoplay,
  onPlay,
  onPause
}: {
  spec: CinematicSpec;
  autoplay: boolean;
  onPlay: () => void;
  onPause: () => void;
}) {
  // Memoize event handlers to prevent re-renders
  const handlePlay = useCallback(() => {
    onPlay();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    onPause();
  }, [onPause]);

  // Memoize the spec if it's computed
  const memoizedSpec = useMemo(() => spec, [spec]);

  return (
    <CinematicPlayer
      spec={memoizedSpec}
      autoplay={autoplay}
      onPlay={handlePlay}
      onPause={handlePause}
    />
  );
});
```

### Lazy Loading

```tsx
import React, { lazy, Suspense } from 'react';

// Lazy load the cinematic player for code splitting
const CinematicPlayer = lazy(() => 
  import('cinematic-renderer2d/react').then(module => ({
    default: module.CinematicPlayer
  }))
);

function LazyLoadedCinematic() {
  return (
    <Suspense fallback={<div>Loading cinematic player...</div>}>
      <CinematicPlayer
        spec={cinematicSpec}
        autoplay={true}
      />
    </Suspense>
  );
}
```

## Error Handling

### Error Boundaries

```tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class CinematicErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Cinematic player error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="cinematic-error-boundary">
          <h2>Something went wrong with the cinematic player</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <CinematicErrorBoundary>
      <CinematicPlayer spec={cinematicSpec} />
    </CinematicErrorBoundary>
  );
}
```

## Testing

### Unit Testing with Jest and React Testing Library

```tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CinematicPlayer } from 'cinematic-renderer2d/react';
import type { CinematicSpec } from 'cinematic-renderer2d';

const mockSpec: CinematicSpec = {
  schemaVersion: '1.0.0',
  engine: { targetFps: 60 },
  events: [{ id: 'test', name: 'Test', scenes: ['scene1'] }],
  scenes: [{
    id: 'scene1',
    name: 'Test Scene',
    duration: 1000,
    layers: [{
      id: 'layer1',
      type: 'gradient',
      zIndex: 1,
      config: { colors: ['#000', '#fff'] }
    }]
  }]
};

describe('CinematicPlayer', () => {
  it('renders without crashing', () => {
    render(<CinematicPlayer spec={mockSpec} />);
  });

  it('calls onPlay when playback starts', async () => {
    const onPlay = jest.fn();
    render(
      <CinematicPlayer 
        spec={mockSpec} 
        autoplay={true}
        onPlay={onPlay}
      />
    );

    await waitFor(() => {
      expect(onPlay).toHaveBeenCalled();
    });
  });

  it('handles errors gracefully', () => {
    const onError = jest.fn();
    const invalidSpec = { ...mockSpec, scenes: [] }; // Invalid spec

    render(
      <CinematicPlayer 
        spec={invalidSpec as any}
        onError={onError}
      />
    );

    expect(onError).toHaveBeenCalled();
  });
});
```

## TypeScript Integration

### Type-Safe Specifications

```tsx
import type { CinematicSpec, LayerSpec } from 'cinematic-renderer2d';

// Create type-safe layer configurations
const createGradientLayer = (
  id: string, 
  colors: string[], 
  zIndex: number = 1
): LayerSpec => ({
  id,
  type: 'gradient',
  zIndex,
  config: {
    colors,
    direction: 'to bottom'
  }
});

const createTextLayer = (
  id: string,
  text: string,
  fontSize: string = '24px',
  zIndex: number = 2
): LayerSpec => ({
  id,
  type: 'textBlock',
  zIndex,
  config: {
    text,
    fontSize,
    color: '#ffffff',
    textAlign: 'center'
  }
});

// Type-safe spec builder
const buildCinematicSpec = (): CinematicSpec => ({
  schemaVersion: '1.0.0',
  engine: {
    targetFps: 60,
    quality: 'auto'
  },
  events: [{
    id: 'intro',
    name: 'Introduction',
    scenes: ['scene1']
  }],
  scenes: [{
    id: 'scene1',
    name: 'Opening Scene',
    duration: 5000,
    layers: [
      createGradientLayer('bg', ['#000000', '#333333']),
      createTextLayer('title', 'Welcome to CinematicRenderer2D', '48px')
    ]
  }]
});
```

## Best Practices

### 1. Specification Management

- Store specifications in separate JSON files or TypeScript modules
- Use type-safe builders for complex specifications
- Validate specifications during development with the CLI tool

### 2. Performance

- Use `memo()` for components that don't need frequent re-renders
- Memoize event handlers with `useCallback()`
- Consider lazy loading for large cinematic experiences

### 3. Error Handling

- Always provide error handlers for production applications
- Use error boundaries to catch rendering errors
- Implement fallback UI for failed cinematic loads

### 4. Accessibility

- Provide alternative content for users who can't view cinematic experiences
- Respect `prefers-reduced-motion` settings
- Include proper ARIA labels and descriptions

### 5. Testing

- Test both successful playback and error scenarios
- Mock the cinematic renderer for unit tests
- Use integration tests for complex user interactions

This guide covers the essential patterns for integrating cinematicRenderer2D into React applications. For more advanced usage and custom layer development, refer to the main API documentation.