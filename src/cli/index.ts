/**
 * CLI tool for cinematic-renderer2d
 * 
 * Provides commands for spec validation and preview functionality.
 * 
 * Requirements: 11.5
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { SpecParser } from '../parsing/SpecParser';

interface CLIOptions {
  command: 'validate' | 'preview' | 'dev';
  file: string;
  verbose?: boolean;
  output?: string;
  port?: number;
  open?: boolean;
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    process.exit(0);
  }
  
  try {
    const options = parseArgs(args);
    await executeCommand(options);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(args: string[]): CLIOptions {
  const options: Partial<CLIOptions> = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case 'validate':
      case 'preview':
      case 'dev':
        if (options.command) {
          throw new Error('Multiple commands specified. Use only one command.');
        }
        options.command = arg;
        break;
        
      case '-f':
      case '--file':
        if (i + 1 >= args.length) {
          throw new Error('--file requires a file path');
        }
        const fileArg = args[i + 1];
        if (!fileArg) {
          throw new Error('--file requires a file path');
        }
        options.file = fileArg;
        i++; // Skip the next argument since we consumed it
        break;
        
      case '-v':
      case '--verbose':
        options.verbose = true;
        break;
        
      case '-o':
      case '--output':
        if (i + 1 >= args.length) {
          throw new Error('--output requires a file path');
        }
        const outputArg = args[i + 1];
        if (!outputArg) {
          throw new Error('--output requires a file path');
        }
        options.output = outputArg;
        i++; // Skip the next argument since we consumed it
        break;
        
      case '-p':
      case '--port':
        if (i + 1 >= args.length) {
          throw new Error('--port requires a port number');
        }
        const portArg = args[i + 1];
        if (!portArg) {
          throw new Error('--port requires a port number');
        }
        options.port = parseInt(portArg, 10);
        if (isNaN(options.port)) {
          throw new Error('--port must be a valid number');
        }
        i++; // Skip the next argument since we consumed it
        break;
        
      case '--open':
        options.open = true;
        break;
        
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
        break;
        
      default:
        // If no command is set and this doesn't start with -, treat as file
        if (arg && !options.command && !arg.startsWith('-')) {
          throw new Error(`Unknown command: ${arg}. Use 'validate', 'preview', or 'dev'.`);
        } else if (arg && !options.file && !arg.startsWith('-')) {
          options.file = arg;
        } else if (arg) {
          throw new Error(`Unknown option: ${arg}`);
        }
    }
  }
  
  if (!options.command) {
    throw new Error('No command specified. Use "validate", "preview", or "dev".');
  }
  
  if (!options.file) {
    throw new Error('No file specified. Use --file or provide file path.');
  }
  
  return options as CLIOptions;
}

/**
 * Execute the specified command
 */
async function executeCommand(options: CLIOptions): Promise<void> {
  switch (options.command) {
    case 'validate':
      await validateCommand(options);
      break;
    case 'preview':
      await previewCommand(options);
      break;
    case 'dev':
      await devCommand(options);
      break;
    default:
      throw new Error(`Unknown command: ${options.command}`);
  }
}

/**
 * Validate command implementation
 */
async function validateCommand(options: CLIOptions): Promise<void> {
  const filePath = resolve(options.file);
  
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  if (options.verbose) {
    console.log(`Validating specification: ${filePath}`);
  }
  
  try {
    // Read and parse the JSON file
    const fileContent = readFileSync(filePath, 'utf-8');
    let jsonSpec: unknown;
    
    try {
      jsonSpec = JSON.parse(fileContent);
    } catch (parseError) {
      const errorDetails = extractJsonError(parseError, fileContent);
      console.error('❌ JSON Parsing Error:');
      console.error(`   ${errorDetails.message}`);
      if (errorDetails.line) {
        console.error(`   Line ${errorDetails.line}: ${errorDetails.context}`);
      }
      if (errorDetails.suggestion) {
        console.error(`   💡 Suggestion: ${errorDetails.suggestion}`);
      }
      process.exit(1);
    }
    
    // Validate the specification
    const validatedSpec = SpecParser.validate(jsonSpec);
    
    // Compile the specification to check for compilation errors
    const compiledSpec = SpecParser.parse(validatedSpec);
    
    // Calculate statistics
    const stats = calculateSpecStats(validatedSpec, compiledSpec);
    
    // Success output
    console.log('✅ Specification is valid!');
    console.log('\n📊 Specification Statistics:');
    console.log(`   Events: ${stats.eventCount}`);
    console.log(`   Scenes: ${stats.sceneCount}`);
    console.log(`   Layers: ${stats.layerCount}`);
    console.log(`   Total Duration: ${(stats.totalDuration / 1000).toFixed(2)}s`);
    console.log(`   Assets: ${stats.assetCount}`);
    
    if (options.verbose) {
      console.log('\n📋 Detailed Information:');
      console.log(`   Schema Version: ${validatedSpec.schemaVersion}`);
      console.log(`   Target FPS: ${validatedSpec.engine.targetFps}`);
      console.log(`   Quality: ${validatedSpec.engine.quality}`);
      console.log(`   Layer Types: ${stats.layerTypes.join(', ')}`);
      
      if (stats.audioTrackCount > 0) {
        console.log(`   Audio Tracks: ${stats.audioTrackCount}`);
        console.log(`   Audio Types: ${stats.audioTypes.join(', ')}`);
      }
      
      // Show scene breakdown
      console.log('\n🎬 Scene Breakdown:');
      validatedSpec.scenes.forEach((scene: any, index: number) => {
        const sceneDuration = scene.duration || 0;
        console.log(`   ${index + 1}. ${scene.name || `Scene ${index + 1}`}`);
        console.log(`      Duration: ${(sceneDuration / 1000).toFixed(2)}s`);
        console.log(`      Layers: ${scene.layers.length}`);
        if (scene.audio && scene.audio.length > 0) {
          console.log(`      Audio: ${scene.audio.length} track(s)`);
        }
      });
    }
    
    // Save validation report if output specified
    if (options.output) {
      const report = {
        valid: true,
        file: filePath,
        validatedAt: new Date().toISOString(),
        stats,
        spec: {
          schemaVersion: validatedSpec.schemaVersion,
          targetFps: validatedSpec.engine.targetFps,
          quality: validatedSpec.engine.quality
        }
      };
      
      const { writeFileSync } = await import('fs');
      writeFileSync(options.output, JSON.stringify(report, null, 2));
      console.log(`\n📄 Validation report saved to: ${options.output}`);
    }
    
  } catch (error) {
    const errorDetails = extractValidationError(error);
    console.error('❌ Specification validation failed:');
    console.error(`   ${errorDetails.message}`);
    
    if (errorDetails.path) {
      console.error(`   Path: ${errorDetails.path}`);
    }
    
    if (errorDetails.suggestion) {
      console.error(`   💡 Suggestion: ${errorDetails.suggestion}`);
    }
    
    // Save error report if output specified
    if (options.output) {
      const errorReport = {
        valid: false,
        file: filePath,
        validatedAt: new Date().toISOString(),
        error: errorDetails
      };
      
      const { writeFileSync } = await import('fs');
      writeFileSync(options.output, JSON.stringify(errorReport, null, 2));
      console.log(`\n📄 Error report saved to: ${options.output}`);
    }
    
    process.exit(1);
  }
}

/**
 * Extract detailed error information from JSON parsing errors
 */
function extractJsonError(error: unknown, content: string): {
  message: string;
  line?: number;
  context?: string;
  suggestion?: string;
} {
  const errorMessage = error instanceof Error ? error.message : 'Unknown JSON error';
  
  // Try to extract line number from error message
  const lineMatch = errorMessage.match(/line (\d+)/i) || errorMessage.match(/position (\d+)/i);
  let line: number | undefined;
  let context: string | undefined;
  let suggestion: string | undefined;
  
  if (lineMatch && lineMatch[1]) {
    line = parseInt(lineMatch[1], 10);
    const lines = content.split('\n');
    if (line > 0 && line <= lines.length) {
      const lineContent = lines[line - 1];
      if (lineContent) {
        context = lineContent.trim();
      }
    }
  }
  
  // Provide suggestions based on common errors
  if (errorMessage.includes('Unexpected token')) {
    suggestion = 'Check for missing commas, brackets, or quotes';
  } else if (errorMessage.includes('Unexpected end')) {
    suggestion = 'Check for unclosed brackets or braces';
  } else if (errorMessage.includes('Unexpected string')) {
    suggestion = 'Check for missing commas between properties';
  }
  
  return { message: errorMessage, line, context, suggestion };
}

/**
 * Extract detailed error information from validation errors
 */
function extractValidationError(error: unknown): {
  message: string;
  path?: string;
  suggestion?: string;
} {
  const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
  let path: string | undefined;
  let suggestion: string | undefined;
  
  // Try to extract path from error message
  const pathMatch = errorMessage.match(/at path: ([^\s]+)/i);
  if (pathMatch) {
    path = pathMatch[1];
  }
  
  // Provide suggestions based on common validation errors
  if (errorMessage.includes('required') || errorMessage.includes('missing')) {
    suggestion = 'Ensure all required fields are present in your specification';
  } else if (errorMessage.includes('type')) {
    suggestion = 'Check that field values match the expected types (string, number, etc.)';
  } else if (errorMessage.includes('schemaVersion')) {
    suggestion = 'Ensure schemaVersion is set to "1.0.0"';
  } else if (errorMessage.includes('layer')) {
    suggestion = 'Check layer configuration - ensure type and required properties are correct';
  } else if (errorMessage.includes('scene')) {
    suggestion = 'Check scene configuration - ensure name, duration, and layers are defined';
  } else if (errorMessage.includes('animation')) {
    suggestion = 'Check animation tracks - ensure property, from, to, and timing are correct';
  }
  
  return { message: errorMessage, path, suggestion };
}

/**
 * Calculate specification statistics
 */
function calculateSpecStats(spec: any, compiledSpec: any): {
  eventCount: number;
  sceneCount: number;
  layerCount: number;
  totalDuration: number;
  assetCount: number;
  layerTypes: string[];
  audioTrackCount: number;
  audioTypes: string[];
} {
  const layerTypes = new Set<string>();
  const audioTypes = new Set<string>();
  let layerCount = 0;
  let audioTrackCount = 0;
  
  spec.scenes.forEach((scene: any) => {
    layerCount += scene.layers.length;
    scene.layers.forEach((layer: any) => {
      layerTypes.add(layer.type);
    });
    
    if (scene.audio) {
      audioTrackCount += scene.audio.length;
      scene.audio.forEach((track: any) => {
        audioTypes.add(track.type);
      });
    }
  });
  
  return {
    eventCount: spec.events.length,
    sceneCount: spec.scenes.length,
    layerCount,
    totalDuration: compiledSpec.totalDuration,
    assetCount: spec.assets?.length || 0,
    layerTypes: Array.from(layerTypes),
    audioTrackCount,
    audioTypes: Array.from(audioTypes)
  };
}

/**
 * Dev command implementation - starts a live preview server with hot reload
 */
async function devCommand(options: CLIOptions): Promise<void> {
  const filePath = resolve(options.file);
  
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  const port = options.port || 3000;
  
  console.log('🚀 Starting development server...');
  console.log(`   File: ${filePath}`);
  console.log(`   Port: ${port}`);
  
  try {
    const http = await import('http');
    const fs = await import('fs');
    const path = await import('path');
    
    let currentSpec: any = null;
    let currentHtml: string = '';
    
    // Load initial specification
    const loadSpec = () => {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const jsonSpec = JSON.parse(fileContent);
        const validatedSpec = SpecParser.validate(jsonSpec);
        const compiledSpec = SpecParser.parse(validatedSpec);
        currentSpec = validatedSpec;
        currentHtml = generateDevPreviewHtml(validatedSpec, compiledSpec, filePath, port);
        console.log('✅ Specification loaded successfully');
        return true;
      } catch (error) {
        console.error('❌ Error loading specification:', error instanceof Error ? error.message : 'Unknown error');
        currentHtml = generateErrorHtml(error);
        return false;
      }
    };
    
    // Initial load
    loadSpec();
    
    // Watch for file changes
    let reloadTimeout: NodeJS.Timeout | null = null;
    fs.watch(filePath, (eventType) => {
      if (eventType === 'change') {
        // Debounce file changes
        if (reloadTimeout) {
          clearTimeout(reloadTimeout);
        }
        reloadTimeout = setTimeout(() => {
          console.log('📝 File changed, reloading...');
          if (loadSpec()) {
            console.log('🔄 Hot reload ready');
          }
        }, 100);
      }
    });
    
    // Create HTTP server
    const server = http.createServer((req, res) => {
      if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(currentHtml);
      } else if (req.url === '/api/spec') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(currentSpec));
      } else if (req.url === '/api/reload') {
        // SSE endpoint for hot reload
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });
        
        // Send initial connection message
        res.write('data: connected\n\n');
        
        // Watch for file changes and notify client
        const watcher = fs.watch(filePath, (eventType) => {
          if (eventType === 'change') {
            setTimeout(() => {
              res.write('data: reload\n\n');
            }, 200);
          }
        });
        
        // Clean up on connection close
        req.on('close', () => {
          watcher.close();
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });
    
    server.listen(port, () => {
      console.log(`\n✨ Development server running at http://localhost:${port}`);
      console.log('   Press Ctrl+C to stop\n');
      
      // Try to open in browser if --open flag is set
      if (options.open) {
        const { exec } = require('child_process');
        const command = process.platform === 'darwin' ? 'open' : 
                       process.platform === 'win32' ? 'start' : 'xdg-open';
        exec(`${command} http://localhost:${port}`);
      }
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n👋 Shutting down development server...');
      server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start development server:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

/**
 * Generate HTML for dev server with hot reload
 */
function generateDevPreviewHtml(spec: any, compiledSpec: any, filePath: string, _port: number): string {
  const specJson = JSON.stringify(spec, null, 2);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dev Server - ${spec.events[0]?.name || 'Untitled'}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a1a;
            color: #ffffff;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .dev-badge {
            display: inline-block;
            background: #00ff00;
            color: #000;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .preview-area {
            background: #000;
            border-radius: 8px;
            margin-bottom: 30px;
            position: relative;
            aspect-ratio: 16/9;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #333;
        }
        .placeholder {
            text-align: center;
            color: #666;
        }
        .info-panel {
            background: #2a2a2a;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .info-item {
            background: #333;
            padding: 15px;
            border-radius: 4px;
        }
        .info-label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 16px;
            font-weight: 600;
        }
        .reload-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00ff00;
            color: #000;
            padding: 10px 15px;
            border-radius: 4px;
            font-weight: bold;
            display: none;
            animation: fadeIn 0.3s;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .spec-details {
            background: #2a2a2a;
            border-radius: 8px;
            padding: 20px;
        }
        .spec-json {
            background: #1a1a1a;
            border-radius: 4px;
            padding: 15px;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 12px;
            line-height: 1.4;
            max-height: 400px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="reload-indicator" id="reloadIndicator">🔄 Reloading...</div>
    
    <div class="container">
        <div class="header">
            <div class="dev-badge">🚀 DEV MODE - HOT RELOAD ENABLED</div>
            <h1>🎬 Cinematic Development Server</h1>
            <p>Specification: <code>${filePath}</code></p>
            <p style="color: #999; font-size: 14px;">Changes will automatically reload</p>
        </div>
        
        <div class="preview-area">
            <div class="placeholder">
                <h2>🎭 Cinematic Renderer Preview</h2>
                <p>Interactive preview would appear here</p>
                <p>Total Duration: ${compiledSpec.totalDuration}ms</p>
            </div>
        </div>
        
        <div class="info-panel">
            <h3>Specification Overview</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Schema Version</div>
                    <div class="info-value">${spec.schemaVersion}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Events</div>
                    <div class="info-value">${spec.events.length}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Scenes</div>
                    <div class="info-value">${spec.scenes.length}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Assets</div>
                    <div class="info-value">${spec.assets?.length || 0}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Target FPS</div>
                    <div class="info-value">${spec.engine.targetFps}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Quality</div>
                    <div class="info-value">${spec.engine.quality}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Duration</div>
                    <div class="info-value">${Math.round(compiledSpec.totalDuration / 1000)}s</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Layer Types</div>
                    <div class="info-value">${Array.from(new Set(spec.scenes.flatMap((s: any) => s.layers.map((l: any) => l.type)))).join(', ')}</div>
                </div>
            </div>
        </div>
        
        <div class="spec-details">
            <h3>Specification Details</h3>
            <pre class="spec-json">${specJson}</pre>
        </div>
    </div>
    
    <script>
        // Hot reload via Server-Sent Events
        const eventSource = new EventSource('/api/reload');
        const indicator = document.getElementById('reloadIndicator');
        
        eventSource.onmessage = (event) => {
            if (event.data === 'reload') {
                indicator.style.display = 'block';
                setTimeout(() => {
                    location.reload();
                }, 500);
            }
        };
        
        eventSource.onerror = () => {
            console.error('Lost connection to dev server');
            eventSource.close();
        };
    </script>
</body>
</html>`;
}

/**
 * Generate error HTML for dev server
 */
function generateErrorHtml(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - Dev Server</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a1a;
            color: #ffffff;
        }
        .container {
            max-width: 800px;
            margin: 50px auto;
            text-align: center;
        }
        .error-box {
            background: #ff4444;
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .error-message {
            font-family: monospace;
            font-size: 14px;
            text-align: left;
            background: rgba(0,0,0,0.3);
            padding: 15px;
            border-radius: 4px;
            margin-top: 15px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-box">
            <h1>❌ Specification Error</h1>
            <p>Fix the error in your specification file and save to reload</p>
            <div class="error-message">${errorMessage}</div>
        </div>
        <p style="color: #999;">The page will automatically reload when you fix the error</p>
    </div>
    
    <script>
        // Keep trying to reload
        const eventSource = new EventSource('/api/reload');
        eventSource.onmessage = (event) => {
            if (event.data === 'reload') {
                setTimeout(() => location.reload(), 500);
            }
        };
    </script>
</body>
</html>`;
}

/**
 * Preview command implementation
 */
async function previewCommand(options: CLIOptions): Promise<void> {
  const filePath = resolve(options.file);
  
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  if (options.verbose) {
    console.log(`Generating preview for: ${filePath}`);
  }
  
  try {
    // Read and validate the specification first
    const fileContent = readFileSync(filePath, 'utf-8');
    let jsonSpec: unknown;
    
    try {
      jsonSpec = JSON.parse(fileContent);
    } catch (parseError) {
      throw new Error(`Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown JSON error'}`);
    }
    
    const validatedSpec = SpecParser.validate(jsonSpec);
    const compiledSpec = SpecParser.parse(validatedSpec);
    
    // Generate HTML preview
    const previewHtml = generatePreviewHtml(validatedSpec, compiledSpec, filePath);
    
    // Save or display preview
    if (options.output) {
      const { writeFileSync } = await import('fs');
      writeFileSync(options.output, previewHtml);
      console.log(`🎬 Preview saved to: ${options.output}`);
      console.log(`   Open in browser to view the cinematic experience.`);
    } else {
      // Create temporary file and try to open it
      const { tmpdir } = await import('os');
      const { join } = await import('path');
      const tempFile = join(tmpdir(), `cinematic-preview-${Date.now()}.html`);
      
      const { writeFileSync } = await import('fs');
      writeFileSync(tempFile, previewHtml);
      
      console.log(`🎬 Preview generated: ${tempFile}`);
      console.log(`   Open this file in your browser to view the cinematic experience.`);
      
      // Try to open in default browser (optional)
      try {
        const { exec } = await import('child_process');
        const command = process.platform === 'darwin' ? 'open' : 
                       process.platform === 'win32' ? 'start' : 'xdg-open';
        exec(`${command} "${tempFile}"`);
        console.log(`   Opening in default browser...`);
      } catch {
        // Silently fail if can't open browser
      }
    }
    
  } catch (error) {
    console.error('❌ Preview generation failed:');
    console.error(error instanceof Error ? error.message : 'Unknown preview error');
    process.exit(1);
  }
}

/**
 * Generate HTML preview for the specification
 */
function generatePreviewHtml(spec: any, compiledSpec: any, filePath: string): string {
  const specJson = JSON.stringify(spec, null, 2);
  const title = spec.events[0]?.name || 'Untitled Cinematic';
  const description = spec.events[0]?.description || 'A cinematic experience created with cinematic-renderer2d';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Cinematic Preview</title>
    
    <!-- Sharing Metadata -->
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    
    <!-- Generator Info -->
    <meta name="generator" content="cinematic-renderer2d">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #ffffff;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            backdrop-filter: blur(10px);
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .header p {
            color: #999;
            font-size: 1.1em;
        }
        
        .preview-area {
            background: #000;
            border-radius: 12px;
            margin-bottom: 30px;
            position: relative;
            aspect-ratio: 16/9;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            overflow: hidden;
        }
        
        .preview-area::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at center, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
            pointer-events: none;
        }
        
        .placeholder {
            text-align: center;
            color: #666;
            z-index: 1;
        }
        
        .placeholder h2 {
            font-size: 2em;
            margin-bottom: 15px;
            color: #888;
        }
        
        .placeholder p {
            font-size: 1.1em;
            margin: 10px 0;
        }
        
        .controls {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 40px;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .btn:active {
            transform: translateY(0);
        }
        
        .btn:disabled {
            background: #333;
            cursor: not-allowed;
            box-shadow: none;
            opacity: 0.5;
        }
        
        .info-panel {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .info-panel h3 {
            font-size: 1.5em;
            margin-bottom: 20px;
            color: #fff;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .info-item {
            background: rgba(0, 0, 0, 0.3);
            padding: 20px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
        }
        
        .info-item:hover {
            background: rgba(0, 0, 0, 0.4);
            border-color: rgba(102, 126, 234, 0.3);
            transform: translateY(-2px);
        }
        
        .info-label {
            font-size: 11px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            font-weight: 600;
        }
        
        .info-value {
            font-size: 18px;
            font-weight: 700;
            color: #fff;
        }
        
        .spec-details {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 30px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .spec-details h3 {
            font-size: 1.5em;
            margin-bottom: 20px;
            color: #fff;
        }
        
        .spec-json {
            background: rgba(0, 0, 0, 0.5);
            border-radius: 8px;
            padding: 20px;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.6;
            max-height: 500px;
            overflow-y: auto;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .spec-json::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        
        .spec-json::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
        }
        
        .spec-json::-webkit-scrollbar-thumb {
            background: rgba(102, 126, 234, 0.5);
            border-radius: 4px;
        }
        
        .spec-json::-webkit-scrollbar-thumb:hover {
            background: rgba(102, 126, 234, 0.7);
        }
        
        .warning {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }
        
        .warning strong {
            display: block;
            margin-bottom: 5px;
            font-size: 1.1em;
        }
        
        .footer {
            text-align: center;
            margin-top: 50px;
            padding: 30px;
            color: #666;
            font-size: 0.9em;
        }
        
        .footer a {
            color: #667eea;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .footer a:hover {
            color: #764ba2;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8em;
            }
            
            .info-grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
            }
            
            .controls {
                gap: 10px;
            }
            
            .btn {
                padding: 10px 18px;
                font-size: 13px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 ${title}</h1>
            <p>${description}</p>
            <p style="margin-top: 10px; font-size: 0.9em;">
                <code>${filePath}</code>
            </p>
        </div>
        
        <div class="warning">
            <strong>⚠️ Standalone Preview Mode</strong>
            This is a static preview of your cinematic specification. 
            For full interactive playback with all features, integrate the cinematic-renderer2d library into your application.
        </div>
        
        <div class="preview-area">
            <div class="placeholder">
                <h2>🎭 Cinematic Renderer</h2>
                <p>Interactive preview would render here</p>
                <p style="margin-top: 15px; font-size: 1.2em; color: #888;">
                    Duration: ${(compiledSpec.totalDuration / 1000).toFixed(1)}s
                </p>
            </div>
        </div>
        
        <div class="controls">
            <button class="btn" disabled>▶️ Play</button>
            <button class="btn" disabled>⏸️ Pause</button>
            <button class="btn" disabled>⏹️ Stop</button>
            <button class="btn" disabled>⏮️ Previous Scene</button>
            <button class="btn" disabled>⏭️ Next Scene</button>
        </div>
        
        <div class="info-panel">
            <h3>📊 Specification Overview</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Schema Version</div>
                    <div class="info-value">${spec.schemaVersion}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Events</div>
                    <div class="info-value">${spec.events.length}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Scenes</div>
                    <div class="info-value">${spec.scenes.length}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Layers</div>
                    <div class="info-value">${spec.scenes.reduce((sum: number, s: any) => sum + s.layers.length, 0)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Assets</div>
                    <div class="info-value">${spec.assets?.length || 0}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Target FPS</div>
                    <div class="info-value">${spec.engine.targetFps}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Quality</div>
                    <div class="info-value">${spec.engine.quality}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Duration</div>
                    <div class="info-value">${(compiledSpec.totalDuration / 1000).toFixed(1)}s</div>
                </div>
            </div>
        </div>
        
        <div class="info-panel">
            <h3>🎨 Content Breakdown</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Layer Types</div>
                    <div class="info-value" style="font-size: 14px;">
                        ${Array.from(new Set(spec.scenes.flatMap((s: any) => s.layers.map((l: any) => l.type)))).join(', ')}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Audio Tracks</div>
                    <div class="info-value">
                        ${spec.scenes.reduce((sum: number, s: any) => sum + (s.audio?.length || 0), 0)}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Animations</div>
                    <div class="info-value">
                        ${spec.scenes.reduce((sum: number, s: any) => 
                          sum + s.layers.reduce((layerSum: number, l: any) => 
                            layerSum + (l.animations?.length || 0), 0), 0)}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Avg Scene Duration</div>
                    <div class="info-value">
                        ${(compiledSpec.totalDuration / spec.scenes.length / 1000).toFixed(1)}s
                    </div>
                </div>
            </div>
        </div>
        
        <div class="spec-details">
            <h3>📄 Specification Details</h3>
            <pre class="spec-json">${specJson}</pre>
        </div>
        
        <div class="footer">
            <p>Generated by <a href="https://github.com/yourusername/cinematic-renderer2d" target="_blank">cinematic-renderer2d</a></p>
            <p style="margin-top: 10px;">Created on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Show CLI help information
 */
function showHelp(): void {
  console.log(`
🎬 Cinematic Renderer 2D CLI

USAGE:
  cinematic-cli <command> [options]

COMMANDS:
  validate    Validate a JSON specification file
  preview     Generate an HTML preview of the specification
  dev         Start a live preview server with hot reload

OPTIONS:
  -f, --file <path>     Specification file to process (required)
  -v, --verbose         Show detailed output
  -o, --output <path>   Output file path (for validate and preview)
  -p, --port <number>   Port number for dev server (default: 3000)
  --open                Open browser automatically (for dev command)
  -h, --help           Show this help message

EXAMPLES:
  # Validate a specification
  cinematic-cli validate --file my-spec.json

  # Validate with verbose output and save report
  cinematic-cli validate --file my-spec.json --verbose --output report.json

  # Generate preview
  cinematic-cli preview --file my-spec.json

  # Save preview to specific file
  cinematic-cli preview --file my-spec.json --output preview.html

  # Start development server
  cinematic-cli dev --file my-spec.json

  # Start dev server on custom port and open browser
  cinematic-cli dev --file my-spec.json --port 8080 --open
`);
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main as runCLI };