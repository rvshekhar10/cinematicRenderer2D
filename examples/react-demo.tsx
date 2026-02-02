/**
 * React Demo for cinematicRenderer2D
 * 
 * This example demonstrates how to use the CinematicPlayer React component
 * to integrate cinematic experiences into React applications.
 */

import React, { useRef, useState } from 'react';
import { CinematicPlayer, type CinematicPlayerRef, type CinematicSpec } from '../src/react';

// Example cinematic specification
const exampleSpec: CinematicSpec = {
  schemaVersion: '1.0.0',
  engine: {
    targetFps: 60,
    quality: 'auto',
    debug: true,
  },
  events: [
    {
      id: 'intro',
      name: 'Introduction',
      scenes: ['welcome'],
    },
  ],
  scenes: [
    {
      id: 'welcome',
      name: 'Welcome Scene',
      duration: 5000,
      layers: [
        {
          id: 'background',
          type: 'gradient',
          zIndex: 1,
          config: {
            colors: ['#1a1a2e', '#16213e', '#0f3460'],
            direction: 'diagonal',
          },
        },
        {
          id: 'title',
          type: 'textBlock',
          zIndex: 2,
          config: {
            text: 'Welcome to cinematicRenderer2D',
            fontSize: '2rem',
            color: '#ffffff',
            textAlign: 'center',
          },
          animations: [
            {
              property: 'opacity',
              from: 0,
              to: 1,
              startMs: 0,
              endMs: 1000,
              easing: 'ease-out',
            },
            {
              property: 'transform.scale',
              from: 0.8,
              to: 1,
              startMs: 0,
              endMs: 1000,
              easing: 'ease-out',
            },
          ],
        },
      ],
    },
  ],
};

export const ReactDemo: React.FC = () => {
  const playerRef = useRef<CinematicPlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high' | 'ultra' | 'auto'>('auto');

  const handlePlay = () => {
    playerRef.current?.play();
  };

  const handlePause = () => {
    playerRef.current?.pause();
  };

  const handleStop = () => {
    playerRef.current?.stop();
  };

  const handleSeek = (time: number) => {
    playerRef.current?.seek(time);
  };

  const handleQualityChange = (newQuality: typeof quality) => {
    setQuality(newQuality);
    playerRef.current?.setQuality(newQuality);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>cinematicRenderer2D React Demo</h1>
      
      {/* Player Container */}
      <div style={{ 
        width: '800px', 
        height: '450px', 
        border: '2px solid #333',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <CinematicPlayer
          ref={playerRef}
          spec={exampleSpec}
          quality={quality}
          onReady={() => console.log('Player ready')}
          onPlay={(event) => {
            console.log('Playing:', event);
            setIsPlaying(true);
          }}
          onPause={(event) => {
            console.log('Paused:', event);
            setIsPlaying(false);
          }}
          onStop={(event) => {
            console.log('Stopped:', event);
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          onFrame={(event) => {
            setCurrentTime(event.currentTime);
          }}
          onError={(error) => {
            console.error('Player error:', error);
          }}
        />
      </div>

      {/* Controls */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handlePlay} disabled={isPlaying}>
          Play
        </button>
        <button onClick={handlePause} disabled={!isPlaying} style={{ marginLeft: '10px' }}>
          Pause
        </button>
        <button onClick={handleStop} style={{ marginLeft: '10px' }}>
          Stop
        </button>
      </div>

      {/* Timeline */}
      <div style={{ marginBottom: '20px' }}>
        <label>Timeline: </label>
        <input
          type="range"
          min={0}
          max={playerRef.current?.getDuration() || 5000}
          value={currentTime}
          onChange={(e) => handleSeek(Number(e.target.value))}
          style={{ width: '300px' }}
        />
        <span style={{ marginLeft: '10px' }}>
          {Math.round(currentTime)}ms / {playerRef.current?.getDuration() || 5000}ms
        </span>
      </div>

      {/* Quality Control */}
      <div style={{ marginBottom: '20px' }}>
        <label>Quality: </label>
        <select 
          value={quality} 
          onChange={(e) => handleQualityChange(e.target.value as typeof quality)}
        >
          <option value="auto">Auto</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="ultra">Ultra</option>
        </select>
      </div>

      {/* Player Info */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <h3>Player Status</h3>
        <p><strong>State:</strong> {playerRef.current?.getState() || 'idle'}</p>
        <p><strong>Playing:</strong> {isPlaying ? 'Yes' : 'No'}</p>
        <p><strong>Current Time:</strong> {Math.round(currentTime)}ms</p>
        <p><strong>Duration:</strong> {playerRef.current?.getDuration() || 0}ms</p>
        <p><strong>Quality:</strong> {quality}</p>
        <p><strong>FPS:</strong> {playerRef.current?.getCurrentFps() || 0}</p>
        <p><strong>Current Event:</strong> {playerRef.current?.getCurrentEvent() || 'None'}</p>
        <p><strong>Current Scene:</strong> {playerRef.current?.getCurrentScene() || 'None'}</p>
      </div>
    </div>
  );
};

export default ReactDemo;