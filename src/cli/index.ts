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
  command: 'validate' | 'preview';
  file: string;
  verbose?: boolean;
  output?: string;
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
        
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
        break;
        
      default:
        // If no command is set and this doesn't start with -, treat as file
        if (arg && !options.command && !arg.startsWith('-')) {
          throw new Error(`Unknown command: ${arg}. Use 'validate' or 'preview'.`);
        } else if (arg && !options.file && !arg.startsWith('-')) {
          options.file = arg;
        } else if (arg) {
          throw new Error(`Unknown option: ${arg}`);
        }
    }
  }
  
  if (!options.command) {
    throw new Error('No command specified. Use "validate" or "preview".');
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
      throw new Error(`Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown JSON error'}`);
    }
    
    // Validate the specification
    const validatedSpec = SpecParser.validate(jsonSpec);
    
    // Compile the specification to check for compilation errors
    const compiledSpec = SpecParser.parse(validatedSpec);
    
    // Success output
    console.log('✅ Specification is valid!');
    
    if (options.verbose) {
      console.log('\nSpecification Details:');
      console.log(`  Schema Version: ${validatedSpec.schemaVersion}`);
      console.log(`  Events: ${validatedSpec.events.length}`);
      console.log(`  Scenes: ${validatedSpec.scenes.length}`);
      console.log(`  Assets: ${validatedSpec.assets?.length || 0}`);
      console.log(`  Total Duration: ${compiledSpec.totalDuration}ms`);
      console.log(`  Target FPS: ${validatedSpec.engine.targetFps}`);
      console.log(`  Quality: ${validatedSpec.engine.quality}`);
      
      // Show layer types used
      const layerTypes = new Set(validatedSpec.scenes.flatMap(s => s.layers.map(l => l.type)));
      console.log(`  Layer Types: ${Array.from(layerTypes).join(', ')}`);
      
      // Show audio tracks
      const audioTracks = validatedSpec.scenes.flatMap(s => s.audio || []);
      if (audioTracks.length > 0) {
        console.log(`  Audio Tracks: ${audioTracks.length}`);
        const audioTypes = new Set(audioTracks.map(a => a.type));
        console.log(`  Audio Types: ${Array.from(audioTypes).join(', ')}`);
      }
    }
    
    // Save validation report if output specified
    if (options.output) {
      const report = {
        valid: true,
        file: filePath,
        validatedAt: new Date().toISOString(),
        spec: {
          schemaVersion: validatedSpec.schemaVersion,
          events: validatedSpec.events.length,
          scenes: validatedSpec.scenes.length,
          assets: validatedSpec.assets?.length || 0,
          totalDuration: compiledSpec.totalDuration,
          targetFps: validatedSpec.engine.targetFps,
          quality: validatedSpec.engine.quality
        }
      };
      
      const { writeFileSync } = await import('fs');
      writeFileSync(options.output, JSON.stringify(report, null, 2));
      console.log(`📄 Validation report saved to: ${options.output}`);
    }
    
  } catch (error) {
    console.error('❌ Specification validation failed:');
    console.error(error instanceof Error ? error.message : 'Unknown validation error');
    
    // Save error report if output specified
    if (options.output) {
      const errorReport = {
        valid: false,
        file: filePath,
        validatedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown validation error'
      };
      
      const { writeFileSync } = await import('fs');
      writeFileSync(options.output, JSON.stringify(errorReport, null, 2));
      console.log(`📄 Error report saved to: ${options.output}`);
    }
    
    process.exit(1);
  }
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
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cinematic Preview - ${spec.events[0]?.name || 'Untitled'}</title>
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
        .controls {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 30px;
        }
        .btn {
            padding: 10px 20px;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .btn:hover {
            background: #005a9e;
        }
        .btn:disabled {
            background: #333;
            cursor: not-allowed;
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
        .warning {
            background: #ff6b35;
            color: white;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 Cinematic Preview</h1>
            <p>Specification: <code>${filePath}</code></p>
        </div>
        
        <div class="warning">
            <strong>⚠️ Preview Mode:</strong> This is a static preview of your specification. 
            For full interactive playback, integrate the cinematic-renderer2d library into your application.
        </div>
        
        <div class="preview-area">
            <div class="placeholder">
                <h2>🎭 Cinematic Renderer Preview</h2>
                <p>Interactive preview would appear here</p>
                <p>Total Duration: ${compiledSpec.totalDuration}ms</p>
            </div>
        </div>
        
        <div class="controls">
            <button class="btn" disabled>▶️ Play</button>
            <button class="btn" disabled>⏸️ Pause</button>
            <button class="btn" disabled>⏹️ Stop</button>
            <button class="btn" disabled>⏮️ Previous</button>
            <button class="btn" disabled>⏭️ Next</button>
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

OPTIONS:
  -f, --file <path>     Specification file to process (required)
  -v, --verbose         Show detailed output
  -o, --output <path>   Output file path (optional)
  -h, --help           Show this help message

EXAMPLES:
  # Validate a specification
  cinematic-cli validate --file my-spec.json

  # Validate with verbose output
  cinematic-cli validate --file my-spec.json --verbose

  # Generate preview
  cinematic-cli preview --file my-spec.json

  # Save preview to specific file
  cinematic-cli preview --file my-spec.json --output preview.html

  # Save validation report
  cinematic-cli validate --file my-spec.json --output report.json
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