/**
 * CLI tool tests
 * 
 * Tests the CLI validation and preview functionality.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('CLI Tool', () => {
  const cliPath = resolve('dist/cli/index.js');
  const testSpecPath = resolve('test-cli-spec.json');
  const testOutputPath = resolve('test-cli-output.html');
  
  const validSpec = {
    schemaVersion: '1.0.0',
    engine: {
      targetFps: 60,
      quality: 'auto'
    },
    events: [
      {
        id: 'event1',
        name: 'Test Event',
        scenes: ['scene1']
      }
    ],
    scenes: [
      {
        id: 'scene1',
        name: 'Test Scene',
        duration: 5000,
        layers: [
          {
            id: 'layer1',
            type: 'gradient',
            zIndex: 1,
            config: {
              opacity: 1
            }
          }
        ]
      }
    ]
  };
  
  beforeEach(() => {
    // Create test spec file
    writeFileSync(testSpecPath, JSON.stringify(validSpec, null, 2));
  });
  
  afterEach(() => {
    // Clean up test files
    if (existsSync(testSpecPath)) {
      unlinkSync(testSpecPath);
    }
    if (existsSync(testOutputPath)) {
      unlinkSync(testOutputPath);
    }
  });
  
  it('should show help when no arguments provided', async () => {
    const { stdout } = await execAsync(`node ${cliPath}`);
    expect(stdout).toContain('Cinematic Renderer 2D CLI');
    expect(stdout).toContain('USAGE:');
    expect(stdout).toContain('COMMANDS:');
  });
  
  it('should show help with --help flag', async () => {
    const { stdout } = await execAsync(`node ${cliPath} --help`);
    expect(stdout).toContain('Cinematic Renderer 2D CLI');
    expect(stdout).toContain('validate');
    expect(stdout).toContain('preview');
  });
  
  it('should validate a valid specification', async () => {
    const { stdout } = await execAsync(`node ${cliPath} validate --file ${testSpecPath}`);
    expect(stdout).toContain('✅ Specification is valid!');
  });
  
  it('should validate with verbose output', async () => {
    const { stdout } = await execAsync(`node ${cliPath} validate --file ${testSpecPath} --verbose`);
    expect(stdout).toContain('✅ Specification is valid!');
    expect(stdout).toContain('📋 Detailed Information:');
    expect(stdout).toContain('Schema Version: 1.0.0');
    expect(stdout).toContain('Events: 1');
    expect(stdout).toContain('Scenes: 1');
  });
  
  it('should generate preview HTML', async () => {
    const { stdout } = await execAsync(`node ${cliPath} preview --file ${testSpecPath} --output ${testOutputPath}`);
    expect(stdout).toContain('🎬 Preview saved to:');
    expect(existsSync(testOutputPath)).toBe(true);
    
    const htmlContent = readFileSync(testOutputPath, 'utf-8');
    expect(htmlContent).toContain('<!DOCTYPE html>');
    expect(htmlContent).toContain('Cinematic Preview');
    expect(htmlContent).toContain('Test Event');
  });
  
  it('should handle invalid JSON format', async () => {
    const invalidJsonPath = resolve('test-invalid.json');
    writeFileSync(invalidJsonPath, '{ invalid json }');
    
    try {
      await execAsync(`node ${cliPath} validate --file ${invalidJsonPath}`);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.stderr).toContain('❌ JSON Parsing Error:');
      expect(error.stderr).toContain('Expected property name');
    } finally {
      if (existsSync(invalidJsonPath)) {
        unlinkSync(invalidJsonPath);
      }
    }
  });
  
  it('should handle missing file', async () => {
    try {
      await execAsync(`node ${cliPath} validate --file nonexistent.json`);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.stderr).toContain('File not found:');
    }
  });
  
  it('should handle invalid specification', async () => {
    const invalidSpec = {
      schemaVersion: '1.0.0',
      engine: {},
      events: [],
      scenes: []
    };
    
    const invalidSpecPath = resolve('test-invalid-spec.json');
    writeFileSync(invalidSpecPath, JSON.stringify(invalidSpec, null, 2));
    
    try {
      await execAsync(`node ${cliPath} validate --file ${invalidSpecPath}`);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.stderr).toContain('❌ Specification validation failed:');
    } finally {
      if (existsSync(invalidSpecPath)) {
        unlinkSync(invalidSpecPath);
      }
    }
  });
  
  it('should handle missing command', async () => {
    try {
      await execAsync(`node ${cliPath} --file ${testSpecPath}`);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.stderr).toContain('No command specified');
    }
  });
  
  it('should handle missing file argument', async () => {
    try {
      await execAsync(`node ${cliPath} validate`);
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.stderr).toContain('No file specified');
    }
  });
});