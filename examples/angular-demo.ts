/**
 * Angular Demo for cinematicRenderer2D
 * 
 * This example demonstrates how to use the CinematicPlayerComponent Angular component
 * to integrate cinematic experiences into Angular applications.
 */

import { Component, ViewChild } from '@angular/core';
import { CinematicPlayerComponent, type CinematicSpec } from '../src/angular';

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

@Component({
  selector: 'app-angular-demo',
  template: `
    <div class="demo-container">
      <h1>cinematicRenderer2D Angular Demo</h1>
      
      <!-- Player Container -->
      <div class="player-container">
        <cinematic-player
          #player
          [spec]="cinematicSpec"
          [quality]="quality"
          [debug]="true"
          (ready)="onReady()"
          (play)="onPlay($event)"
          (pause)="onPause($event)"
          (stop)="onStop($event)"
          (frame)="onFrame($event)"
          (error)="onError($event)"
          containerClass="cinematic-container">
        </cinematic-player>
      </div>

      <!-- Controls -->
      <div class="controls">
        <button (click)="play()" [disabled]="isPlaying">Play</button>
        <button (click)="pause()" [disabled]="!isPlaying">Pause</button>
        <button (click)="stop()">Stop</button>
      </div>

      <!-- Timeline -->
      <div class="timeline">
        <label>Timeline: </label>
        <input
          type="range"
          [min]="0"
          [max]="duration"
          [value]="currentTime"
          (input)="seek($event)"
          class="timeline-slider">
        <span class="time-display">
          {{ Math.round(currentTime) }}ms / {{ duration }}ms
        </span>
      </div>

      <!-- Quality Control -->
      <div class="quality-control">
        <label>Quality: </label>
        <select [(ngModel)]="quality" (change)="changeQuality()">
          <option value="auto">Auto</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="ultra">Ultra</option>
        </select>
      </div>

      <!-- Player Info -->
      <div class="player-info">
        <h3>Player Status</h3>
        <p><strong>State:</strong> {{ playerState }}</p>
        <p><strong>Playing:</strong> {{ isPlaying ? 'Yes' : 'No' }}</p>
        <p><strong>Current Time:</strong> {{ Math.round(currentTime) }}ms</p>
        <p><strong>Duration:</strong> {{ duration }}ms</p>
        <p><strong>Quality:</strong> {{ quality }}</p>
        <p><strong>FPS:</strong> {{ currentFps }}</p>
        <p><strong>Current Event:</strong> {{ currentEvent || 'None' }}</p>
        <p><strong>Current Scene:</strong> {{ currentScene || 'None' }}</p>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .player-container {
      width: 800px;
      height: 450px;
      border: 2px solid #333;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .cinematic-container {
      width: 100%;
      height: 100%;
    }

    .controls {
      margin-bottom: 20px;
    }

    .controls button {
      margin-right: 10px;
      padding: 8px 16px;
      border: 1px solid #ccc;
      background: #f5f5f5;
      cursor: pointer;
    }

    .controls button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .timeline {
      margin-bottom: 20px;
    }

    .timeline-slider {
      width: 300px;
      margin: 0 10px;
    }

    .quality-control {
      margin-bottom: 20px;
    }

    .quality-control select {
      margin-left: 10px;
      padding: 4px 8px;
    }

    .player-info {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      font-size: 14px;
    }

    .player-info h3 {
      margin-top: 0;
    }

    .player-info p {
      margin: 5px 0;
    }
  `]
})
export class AngularDemoComponent {
  @ViewChild('player') player!: CinematicPlayerComponent;

  cinematicSpec = exampleSpec;
  quality: 'low' | 'medium' | 'high' | 'ultra' | 'auto' = 'auto';
  
  // Player state
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  playerState = 'idle';
  currentFps = 0;
  currentEvent: string | null = null;
  currentScene: string | null = null;

  // Expose Math for template
  Math = Math;

  onReady(): void {
    console.log('Player ready');
    this.duration = this.player.getDuration();
    this.playerState = this.player.getState();
  }

  onPlay(event: any): void {
    console.log('Playing:', event);
    this.isPlaying = true;
    this.playerState = this.player.getState();
  }

  onPause(event: any): void {
    console.log('Paused:', event);
    this.isPlaying = false;
    this.playerState = this.player.getState();
  }

  onStop(event: any): void {
    console.log('Stopped:', event);
    this.isPlaying = false;
    this.currentTime = 0;
    this.playerState = this.player.getState();
  }

  onFrame(event: any): void {
    this.currentTime = event.currentTime;
    this.currentFps = event.fps;
    this.currentEvent = event.currentEvent;
    this.currentScene = event.currentScene;
  }

  onError(error: Error): void {
    console.error('Player error:', error);
  }

  play(): void {
    this.player.playEngine();
  }

  pause(): void {
    this.player.pauseEngine();
  }

  stop(): void {
    this.player.stopEngine();
  }

  seek(event: Event): void {
    const target = event.target as HTMLInputElement;
    const time = Number(target.value);
    this.player.seekEngine(time);
  }

  changeQuality(): void {
    this.player.setQuality(this.quality);
  }
}

// Angular Module Example
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AngularDemoComponent,
    CinematicPlayerComponent, // Import the cinematic player component
  ],
  imports: [
    BrowserModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AngularDemoComponent]
})
export class AngularDemoModule { }

export default AngularDemoComponent;