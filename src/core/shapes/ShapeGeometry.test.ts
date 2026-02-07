/**
 * Unit tests for ShapeGeometry
 */

import { ShapeGeometry, PathData, Point } from './ShapeGeometry';

describe('ShapeGeometry', () => {
  describe('generateRectangle', () => {
    it('should generate rectangle path data centered at origin', () => {
      const result = ShapeGeometry.generateRectangle(100, 60);
      
      expect(result.svgPath).toBe('M -50 -30 L 50 -30 L 50 30 L -50 30 Z');
      expect(result.canvasCommands).toHaveLength(5);
      expect(result.canvasCommands[0]).toEqual({ type: 'moveTo', args: [-50, -30] });
      expect(result.canvasCommands[4]).toEqual({ type: 'closePath', args: [] });
    });

    it('should handle zero dimensions', () => {
      const result = ShapeGeometry.generateRectangle(0, 0);
      
      expect(result.svgPath).toBe('M 0 0 L 0 0 L 0 0 L 0 0 Z');
      expect(result.canvasCommands).toHaveLength(5);
    });

    it('should handle negative dimensions', () => {
      const result = ShapeGeometry.generateRectangle(-100, -60);
      
      expect(result.svgPath).toBe('M 50 30 L -50 30 L -50 -30 L 50 -30 Z');
      expect(result.canvasCommands).toHaveLength(5);
    });
  });

  describe('generateSquare', () => {
    it('should generate square path data', () => {
      const result = ShapeGeometry.generateSquare(80);
      
      expect(result.svgPath).toBe('M -40 -40 L 40 -40 L 40 40 L -40 40 Z');
      expect(result.canvasCommands).toHaveLength(5);
    });

    it('should produce same result as rectangle with equal dimensions', () => {
      const square = ShapeGeometry.generateSquare(100);
      const rectangle = ShapeGeometry.generateRectangle(100, 100);
      
      expect(square.svgPath).toBe(rectangle.svgPath);
      expect(square.canvasCommands).toEqual(rectangle.canvasCommands);
    });
  });

  describe('generateCircle', () => {
    it('should generate circle path data centered at origin', () => {
      const result = ShapeGeometry.generateCircle(50);
      
      expect(result.svgPath).toBe('M 50 0 A 50 50 0 0 1 -50 0 A 50 50 0 0 1 50 0 Z');
      expect(result.canvasCommands).toHaveLength(1);
      expect(result.canvasCommands[0].type).toBe('arc');
      expect(result.canvasCommands[0].args).toEqual([0, 0, 50, 0, Math.PI * 2]);
    });

    it('should handle small radius', () => {
      const result = ShapeGeometry.generateCircle(1);
      
      expect(result.svgPath).toBe('M 1 0 A 1 1 0 0 1 -1 0 A 1 1 0 0 1 1 0 Z');
      expect(result.canvasCommands[0].args[2]).toBe(1);
    });

    it('should handle large radius', () => {
      const result = ShapeGeometry.generateCircle(1000);
      
      expect(result.svgPath).toContain('1000');
      expect(result.canvasCommands[0].args[2]).toBe(1000);
    });
  });

  describe('generateEllipse', () => {
    it('should generate ellipse path data', () => {
      const result = ShapeGeometry.generateEllipse(80, 50);
      
      expect(result.svgPath).toBe('M 80 0 A 80 50 0 0 1 -80 0 A 80 50 0 0 1 80 0 Z');
      expect(result.canvasCommands).toHaveLength(6); // moveTo + 4 bezier curves + closePath
      expect(result.canvasCommands[0].type).toBe('moveTo');
      expect(result.canvasCommands[1].type).toBe('bezierCurveTo');
      expect(result.canvasCommands[5].type).toBe('closePath');
    });

    it('should handle equal radii (circle)', () => {
      const result = ShapeGeometry.generateEllipse(50, 50);
      
      expect(result.svgPath).toBe('M 50 0 A 50 50 0 0 1 -50 0 A 50 50 0 0 1 50 0 Z');
    });

    it('should use bezier curve approximation for canvas', () => {
      const result = ShapeGeometry.generateEllipse(100, 60);
      
      // Check that bezier curves are used
      const bezierCommands = result.canvasCommands.filter(cmd => cmd.type === 'bezierCurveTo');
      expect(bezierCommands).toHaveLength(4); // 4 quadrants
    });
  });

  describe('generateTriangle', () => {
    it('should generate triangle path data from vertices', () => {
      const vertices: Point[] = [
        { x: 0, y: -50 },
        { x: 43.3, y: 25 },
        { x: -43.3, y: 25 }
      ];
      
      const result = ShapeGeometry.generateTriangle(vertices);
      
      expect(result.svgPath).toBe('M 0 -50 L 43.3 25 L -43.3 25 Z');
      expect(result.canvasCommands).toHaveLength(4);
      expect(result.canvasCommands[0]).toEqual({ type: 'moveTo', args: [0, -50] });
      expect(result.canvasCommands[3]).toEqual({ type: 'closePath', args: [] });
    });

    it('should throw error if not exactly 3 vertices', () => {
      expect(() => {
        ShapeGeometry.generateTriangle([{ x: 0, y: 0 }, { x: 1, y: 1 }]);
      }).toThrow('Triangle requires exactly 3 vertices');
      
      expect(() => {
        ShapeGeometry.generateTriangle([
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
          { x: 3, y: 3 }
        ]);
      }).toThrow('Triangle requires exactly 3 vertices');
    });

    it('should handle negative coordinates', () => {
      const vertices: Point[] = [
        { x: -10, y: -10 },
        { x: -20, y: -30 },
        { x: -30, y: -10 }
      ];
      
      const result = ShapeGeometry.generateTriangle(vertices);
      
      expect(result.svgPath).toContain('-10');
      expect(result.svgPath).toContain('-20');
      expect(result.svgPath).toContain('-30');
    });
  });

  describe('generateTrapezoid', () => {
    it('should generate trapezoid path data centered at origin', () => {
      const result = ShapeGeometry.generateTrapezoid(60, 100, 80);
      
      expect(result.svgPath).toBe('M -30 -40 L 30 -40 L 50 40 L -50 40 Z');
      expect(result.canvasCommands).toHaveLength(5);
      expect(result.canvasCommands[0]).toEqual({ type: 'moveTo', args: [-30, -40] });
      expect(result.canvasCommands[4]).toEqual({ type: 'closePath', args: [] });
    });

    it('should handle equal top and bottom widths (rectangle)', () => {
      const result = ShapeGeometry.generateTrapezoid(100, 100, 60);
      
      expect(result.svgPath).toBe('M -50 -30 L 50 -30 L 50 30 L -50 30 Z');
    });

    it('should handle inverted trapezoid (top wider than bottom)', () => {
      const result = ShapeGeometry.generateTrapezoid(100, 60, 80);
      
      expect(result.svgPath).toBe('M -50 -40 L 50 -40 L 30 40 L -30 40 Z');
    });
  });

  describe('generatePolygon', () => {
    it('should generate triangle (3-sided polygon)', () => {
      const result = ShapeGeometry.generatePolygon(3, 50);
      
      expect(result.canvasCommands).toHaveLength(4); // moveTo + 2 lineTo + closePath
      expect(result.canvasCommands[0].type).toBe('moveTo');
      expect(result.canvasCommands[3].type).toBe('closePath');
    });

    it('should generate square (4-sided polygon)', () => {
      const result = ShapeGeometry.generatePolygon(4, 50);
      
      expect(result.canvasCommands).toHaveLength(5); // moveTo + 3 lineTo + closePath
    });

    it('should generate hexagon (6-sided polygon)', () => {
      const result = ShapeGeometry.generatePolygon(6, 50);
      
      expect(result.canvasCommands).toHaveLength(7); // moveTo + 5 lineTo + closePath
    });

    it('should generate octagon (8-sided polygon)', () => {
      const result = ShapeGeometry.generatePolygon(8, 50);
      
      expect(result.canvasCommands).toHaveLength(9); // moveTo + 7 lineTo + closePath
    });

    it('should throw error for less than 3 sides', () => {
      expect(() => {
        ShapeGeometry.generatePolygon(2, 50);
      }).toThrow('Polygon must have at least 3 sides');
      
      expect(() => {
        ShapeGeometry.generatePolygon(0, 50);
      }).toThrow('Polygon must have at least 3 sides');
    });

    it('should start from top vertex', () => {
      const result = ShapeGeometry.generatePolygon(4, 50);
      const firstMove = result.canvasCommands[0];
      
      // First vertex should be at top (y should be negative and close to -radius)
      expect(firstMove.args[1]).toBeLessThan(0);
      expect(Math.abs(firstMove.args[1] + 50)).toBeLessThan(1); // Close to -50
    });
  });

  describe('generateStar', () => {
    it('should generate 5-pointed star', () => {
      const result = ShapeGeometry.generateStar(5, 20, 50);
      
      // Star has 2 vertices per point (outer and inner)
      expect(result.canvasCommands).toHaveLength(11); // moveTo + 9 lineTo + closePath
      expect(result.canvasCommands[0].type).toBe('moveTo');
      expect(result.canvasCommands[10].type).toBe('closePath');
    });

    it('should generate 6-pointed star', () => {
      const result = ShapeGeometry.generateStar(6, 25, 50);
      
      expect(result.canvasCommands).toHaveLength(13); // moveTo + 11 lineTo + closePath
    });

    it('should throw error for less than 3 points', () => {
      expect(() => {
        ShapeGeometry.generateStar(2, 20, 50);
      }).toThrow('Star must have at least 3 points');
    });

    it('should alternate between outer and inner radii', () => {
      const result = ShapeGeometry.generateStar(5, 20, 50);
      
      // Check that vertices alternate between outer and inner radii distances
      const commands = result.canvasCommands.filter(cmd => cmd.type === 'moveTo' || cmd.type === 'lineTo');
      
      for (let i = 0; i < commands.length - 1; i++) {
        const [x, y] = commands[i].args;
        const distance = Math.sqrt(x * x + y * y);
        
        // Should be close to either innerRadius or outerRadius
        const isOuter = Math.abs(distance - 50) < 1;
        const isInner = Math.abs(distance - 20) < 1;
        expect(isOuter || isInner).toBe(true);
      }
    });

    it('should start from top point', () => {
      const result = ShapeGeometry.generateStar(5, 20, 50);
      const firstMove = result.canvasCommands[0];
      
      // First vertex should be at top (y should be negative and close to -outerRadius)
      expect(firstMove.args[1]).toBeLessThan(0);
      expect(Math.abs(firstMove.args[1] + 50)).toBeLessThan(1); // Close to -50
    });
  });

  describe('Helper functions', () => {
    describe('degreesToRadians', () => {
      it('should convert 0 degrees to 0 radians', () => {
        expect(ShapeGeometry.degreesToRadians(0)).toBe(0);
      });

      it('should convert 90 degrees to π/2 radians', () => {
        expect(ShapeGeometry.degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
      });

      it('should convert 180 degrees to π radians', () => {
        expect(ShapeGeometry.degreesToRadians(180)).toBeCloseTo(Math.PI);
      });

      it('should convert 360 degrees to 2π radians', () => {
        expect(ShapeGeometry.degreesToRadians(360)).toBeCloseTo(Math.PI * 2);
      });

      it('should handle negative degrees', () => {
        expect(ShapeGeometry.degreesToRadians(-90)).toBeCloseTo(-Math.PI / 2);
      });
    });

    describe('radiansToDegrees', () => {
      it('should convert 0 radians to 0 degrees', () => {
        expect(ShapeGeometry.radiansToDegrees(0)).toBe(0);
      });

      it('should convert π/2 radians to 90 degrees', () => {
        expect(ShapeGeometry.radiansToDegrees(Math.PI / 2)).toBeCloseTo(90);
      });

      it('should convert π radians to 180 degrees', () => {
        expect(ShapeGeometry.radiansToDegrees(Math.PI)).toBeCloseTo(180);
      });

      it('should convert 2π radians to 360 degrees', () => {
        expect(ShapeGeometry.radiansToDegrees(Math.PI * 2)).toBeCloseTo(360);
      });

      it('should handle negative radians', () => {
        expect(ShapeGeometry.radiansToDegrees(-Math.PI / 2)).toBeCloseTo(-90);
      });
    });
  });

  describe('PathData structure', () => {
    it('should always include both svgPath and canvasCommands', () => {
      const shapes = [
        ShapeGeometry.generateRectangle(100, 60),
        ShapeGeometry.generateSquare(80),
        ShapeGeometry.generateCircle(50),
        ShapeGeometry.generateEllipse(80, 50),
        ShapeGeometry.generateTriangle([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }]),
        ShapeGeometry.generateTrapezoid(60, 100, 80),
        ShapeGeometry.generatePolygon(6, 50),
        ShapeGeometry.generateStar(5, 20, 50)
      ];

      shapes.forEach(shape => {
        expect(shape).toHaveProperty('svgPath');
        expect(shape).toHaveProperty('canvasCommands');
        expect(typeof shape.svgPath).toBe('string');
        expect(Array.isArray(shape.canvasCommands)).toBe(true);
      });
    });

    it('should have valid SVG path format', () => {
      const shapes = [
        ShapeGeometry.generateRectangle(100, 60),
        ShapeGeometry.generateCircle(50),
        ShapeGeometry.generatePolygon(5, 50)
      ];

      shapes.forEach(shape => {
        // SVG path should start with M (moveTo) and end with Z (closePath)
        expect(shape.svgPath).toMatch(/^M\s/);
        expect(shape.svgPath).toMatch(/Z$/);
      });
    });

    it('should have valid canvas commands', () => {
      const shapes = [
        ShapeGeometry.generateRectangle(100, 60),
        ShapeGeometry.generateCircle(50),
        ShapeGeometry.generatePolygon(5, 50)
      ];

      shapes.forEach(shape => {
        shape.canvasCommands.forEach(cmd => {
          expect(cmd).toHaveProperty('type');
          expect(cmd).toHaveProperty('args');
          expect(Array.isArray(cmd.args)).toBe(true);
          expect(['moveTo', 'lineTo', 'arc', 'arcTo', 'bezierCurveTo', 'quadraticCurveTo', 'closePath']).toContain(cmd.type);
        });
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle very small dimensions', () => {
      expect(() => ShapeGeometry.generateRectangle(0.1, 0.1)).not.toThrow();
      expect(() => ShapeGeometry.generateCircle(0.1)).not.toThrow();
      expect(() => ShapeGeometry.generatePolygon(3, 0.1)).not.toThrow();
    });

    it('should handle very large dimensions', () => {
      expect(() => ShapeGeometry.generateRectangle(10000, 10000)).not.toThrow();
      expect(() => ShapeGeometry.generateCircle(10000)).not.toThrow();
      expect(() => ShapeGeometry.generatePolygon(100, 10000)).not.toThrow();
    });

    it('should handle fractional dimensions', () => {
      const rect = ShapeGeometry.generateRectangle(100.5, 60.7);
      expect(rect.svgPath).toContain('50.25');
      expect(rect.svgPath).toContain('30.35');
    });
  });
});
