/**
 * Angular Module Example for cinematicRenderer2D
 * 
 * This example shows how to properly import and configure the CinematicPlayerComponent
 * in an Angular module.
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CinematicPlayerComponent } from '../src/angular';

// Your app component that uses the cinematic player
import { Component } from '@angular/core';
import type { CinematicSpec } from '../src/angular';

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <h1>My Angular App with Cinematic Player</h1>
      
      <cinematic-player
        [spec]="mySpec"
        [autoplay]="false"
        [quality]="'auto'"
        [debug]="true"
        (ready)="onPlayerReady()"
        (play)="onPlayerPlay($event)"
        (error)="onPlayerError($event)">
      </cinematic-player>
      
      <div class="controls">
        <button (click)="playVideo()">Play</button>
        <button (click)="pauseVideo()">Pause</button>
        <button (click)="stopVideo()">Stop</button>
      </div>
    </div>
  `,
  styles: [`
    .app {
      padding: 20px;
    }
    
    cinematic-player {
      display: block;
      width: 800px;
      height: 450px;
      border: 1px solid #ccc;
      margin: 20px 0;
    }
    
    .controls button {
      margin-right: 10px;
      padding: 8px 16px;
    }
  `]
})
export class AppComponent {
  mySpec: CinematicSpec = {
    schemaVersion: '1.0.0',
    engine: {
      targetFps: 60,
      quality: 'auto',
    },
    events: [
      {
        id: 'main',
        name: 'Main Event',
        scenes: ['scene1'],
      },
    ],
    scenes: [
      {
        id: 'scene1',
        name: 'First Scene',
        duration: 3000,
        layers: [
          {
            id: 'bg',
            type: 'gradient',
            zIndex: 1,
            config: {
              colors: ['#ff6b6b', '#4ecdc4'],
              direction: 'diagonal',
            },
          },
        ],
      },
    ],
  };

  onPlayerReady(): void {
    console.log('Cinematic player is ready!');
  }

  onPlayerPlay(event: any): void {
    console.log('Player started playing:', event);
  }

  onPlayerError(error: Error): void {
    console.error('Player error:', error);
  }

  playVideo(): void {
    // Access player methods through ViewChild if needed
    // this.player.playEngine();
  }

  pauseVideo(): void {
    // this.player.pauseEngine();
  }

  stopVideo(): void {
    // this.player.stopEngine();
  }
}

@NgModule({
  declarations: [
    AppComponent,
    CinematicPlayerComponent, // Declare the cinematic player component
  ],
  imports: [
    BrowserModule,
    FormsModule, // If you need two-way binding for controls
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

export { AppModule, AppComponent };