/**
 * Tests for IShapeRenderer interface
 * 
 * These tests verify that the interface is properly defined and can be implemented.
 */

import { describe, it, expect } from 'vitest';
import type { IShapeRenderer, ShapeLayerConfig } from './IShapeRenderer';
import type { FrameContext } from '../interfaces/LayerContext';

describe('IShapeRenderer Interface', () => {
  it('should be implementable by a concrete class', () => {
    // Create a mock implementation to verify the interface contract
    class MockShapeRenderer implements IShapeRenderer {
      private visible = true;
      private opacity = 1.0;
      
      mount(container: HTMLElement, config: ShapeLayerConfig): void {
        // Mock implementation
        expect(container).toBeDefined();
        expect(config).toBeDefined();
      }
      
      render(config: ShapeLayerConfig, ctx: FrameContext): void {
        // Mock implementation
        expect(config).toBeDefined();
        expect(ctx).toBeDefined();
      }
      
      destroy(): void {
        // Mock implementation
      }
      
      setVisible(visible: boolean): void {
        this.visible = visible;
      }
      
      setOpacity(opacity: number): void {
        this.opacity = opacity;
      }
    }
    
    // Verify we can instantiate the mock implementation
    const renderer = new MockShapeRenderer();
    expect(renderer).toBeDefined();
    
    // Verify all methods exist
    expect(typeof renderer.mount).toBe('function');
    expect(typeof renderer.render).toBe('function');
    expect(typeof renderer.destroy).toBe('function');
    expect(typeof renderer.setVisible).toBe('function');
    expect(typeof renderer.setOpacity).toBe('function');
  });
  
  it('should accept valid ShapeLayerConfig', () => {
    const config: ShapeLayerConfig = {
      shapeType: 'circle',
      radius: 50,
      x: 100,
      y: 100,
      fillColor: '#ff6b6b',
      strokeColor: '#ffffff',
      strokeWidth: 2,
      opacity: 0.8,
      rotation: 45,
      scaleX: 1.5,
      scaleY: 1.5,
    };
    
    expect(config.shapeType).toBe('circle');
    expect(config.radius).toBe(50);
    expect(config.fillColor).toBe('#ff6b6b');
  });
  
  it('should accept all supported shape types', () => {
    const shapeTypes: Array<ShapeLayerConfig['shapeType']> = [
      'rectangle',
      'square',
      'circle',
      'ellipse',
      'triangle',
      'trapezoid',
      'polygon',
      'star',
    ];
    
    shapeTypes.forEach(shapeType => {
      const config: ShapeLayerConfig = { shapeType };
      expect(config.shapeType).toBe(shapeType);
    });
  });
  
  it('should accept percentage values for position', () => {
    const config: ShapeLayerConfig = {
      shapeType: 'rectangle',
      x: '50%',
      y: '25%',
      width: 100,
      height: 50,
    };
    
    expect(config.x).toBe('50%');
    expect(config.y).toBe('25%');
  });
  
  it('should accept perspective transform properties', () => {
    const config: ShapeLayerConfig = {
      shapeType: 'square',
      size: 100,
      perspective: 1000,
      rotateX: 45,
      rotateY: 30,
      rotateZ: 15,
      translateZ: 50,
    };
    
    expect(config.perspective).toBe(1000);
    expect(config.rotateX).toBe(45);
    expect(config.rotateY).toBe(30);
    expect(config.rotateZ).toBe(15);
    expect(config.translateZ).toBe(50);
  });
  
  it('should accept camera integration flag', () => {
    const config: ShapeLayerConfig = {
      shapeType: 'circle',
      radius: 50,
      ignoreCameraTransform: true,
    };
    
    expect(config.ignoreCameraTransform).toBe(true);
  });
});
