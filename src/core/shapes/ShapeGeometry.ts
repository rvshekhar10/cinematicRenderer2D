/**
 * ShapeGeometry - Core geometry generator for shape layers
 * 
 * Generates path data for various geometric shapes in formats suitable for
 * both SVG (DOM renderer) and Canvas2D rendering backends.
 * 
 * Supports: rectangle, square, circle, ellipse, triangle, trapezoid, polygon, star
 */

/**
 * Path data structure containing both SVG path strings and Canvas2D commands
 */
export interface PathData {
  /** SVG path string for DOM/SVG renderer */
  svgPath: string;
  /** Canvas2D drawing commands for Canvas2D renderer */
  canvasCommands: CanvasCommand[];
}

/**
 * Canvas2D drawing command
 */
export interface CanvasCommand {
  type: 'moveTo' | 'lineTo' | 'arc' | 'arcTo' | 'bezierCurveTo' | 'quadraticCurveTo' | 'closePath';
  args: number[];
}

/**
 * Point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * ShapeGeometry class - Static methods for generating shape path data
 */
export class ShapeGeometry {
  /**
   * Generate rectangle geometry
   * @param width Rectangle width in pixels
   * @param height Rectangle height in pixels
   * @returns PathData for rectangle
   */
  static generateRectangle(width: number, height: number): PathData {
    // Rectangle centered at origin
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const svgPath = `M ${-halfWidth} ${-halfHeight} L ${halfWidth} ${-halfHeight} L ${halfWidth} ${halfHeight} L ${-halfWidth} ${halfHeight} Z`;

    const canvasCommands: CanvasCommand[] = [
      { type: 'moveTo', args: [-halfWidth, -halfHeight] },
      { type: 'lineTo', args: [halfWidth, -halfHeight] },
      { type: 'lineTo', args: [halfWidth, halfHeight] },
      { type: 'lineTo', args: [-halfWidth, halfHeight] },
      { type: 'closePath', args: [] }
    ];

    return { svgPath, canvasCommands };
  }

  /**
   * Generate square geometry
   * @param size Square side length in pixels
   * @returns PathData for square
   */
  static generateSquare(size: number): PathData {
    // Square is just a rectangle with equal width and height
    return this.generateRectangle(size, size);
  }

  /**
   * Generate circle geometry
   * @param radius Circle radius in pixels
   * @returns PathData for circle
   */
  static generateCircle(radius: number): PathData {
    // SVG path for circle using arc commands
    // Move to rightmost point, then draw two 180-degree arcs
    const svgPath = `M ${radius} 0 A ${radius} ${radius} 0 0 1 ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0 Z`;

    const canvasCommands: CanvasCommand[] = [
      { type: 'arc', args: [0, 0, radius, 0, Math.PI * 2] }
    ];

    return { svgPath, canvasCommands };
  }

  /**
   * Generate ellipse geometry
   * @param radiusX Horizontal radius in pixels
   * @param radiusY Vertical radius in pixels
   * @returns PathData for ellipse
   */
  static generateEllipse(radiusX: number, radiusY: number): PathData {
    // SVG path for ellipse using arc commands
    const svgPath = `M ${radiusX} 0 A ${radiusX} ${radiusY} 0 0 1 ${-radiusX} 0 A ${radiusX} ${radiusY} 0 0 1 ${radiusX} 0 Z`;

    // Canvas2D uses ellipse method (if available) or approximates with bezier curves
    const canvasCommands: CanvasCommand[] = [
      // Using arc approximation with scale for ellipse
      // Note: Modern browsers support ctx.ellipse(), but we'll use a compatible approach
      { type: 'moveTo', args: [radiusX, 0] },
      // Top right quadrant
      { type: 'bezierCurveTo', args: [radiusX, radiusY * 0.5522847498, radiusX * 0.5522847498, radiusY, 0, radiusY] },
      // Top left quadrant
      { type: 'bezierCurveTo', args: [-radiusX * 0.5522847498, radiusY, -radiusX, radiusY * 0.5522847498, -radiusX, 0] },
      // Bottom left quadrant
      { type: 'bezierCurveTo', args: [-radiusX, -radiusY * 0.5522847498, -radiusX * 0.5522847498, -radiusY, 0, -radiusY] },
      // Bottom right quadrant
      { type: 'bezierCurveTo', args: [radiusX * 0.5522847498, -radiusY, radiusX, -radiusY * 0.5522847498, radiusX, 0] },
      { type: 'closePath', args: [] }
    ];

    return { svgPath, canvasCommands };
  }

  /**
   * Generate triangle geometry
   * @param vertices Array of 3 points defining the triangle vertices
   * @returns PathData for triangle
   */
  static generateTriangle(vertices: Point[]): PathData {
    if (vertices.length !== 3) {
      throw new Error('Triangle requires exactly 3 vertices');
    }

    const p1 = vertices[0]!;
    const p2 = vertices[1]!;
    const p3 = vertices[2]!;

    const svgPath = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} Z`;

    const canvasCommands: CanvasCommand[] = [
      { type: 'moveTo', args: [p1.x, p1.y] },
      { type: 'lineTo', args: [p2.x, p2.y] },
      { type: 'lineTo', args: [p3.x, p3.y] },
      { type: 'closePath', args: [] }
    ];

    return { svgPath, canvasCommands };
  }

  /**
   * Generate trapezoid geometry
   * @param topWidth Width of top edge in pixels
   * @param bottomWidth Width of bottom edge in pixels
   * @param height Height in pixels
   * @returns PathData for trapezoid
   */
  static generateTrapezoid(topWidth: number, bottomWidth: number, height: number): PathData {
    // Trapezoid centered at origin
    const halfTopWidth = topWidth / 2;
    const halfBottomWidth = bottomWidth / 2;
    const halfHeight = height / 2;

    const svgPath = `M ${-halfTopWidth} ${-halfHeight} L ${halfTopWidth} ${-halfHeight} L ${halfBottomWidth} ${halfHeight} L ${-halfBottomWidth} ${halfHeight} Z`;

    const canvasCommands: CanvasCommand[] = [
      { type: 'moveTo', args: [-halfTopWidth, -halfHeight] },
      { type: 'lineTo', args: [halfTopWidth, -halfHeight] },
      { type: 'lineTo', args: [halfBottomWidth, halfHeight] },
      { type: 'lineTo', args: [-halfBottomWidth, halfHeight] },
      { type: 'closePath', args: [] }
    ];

    return { svgPath, canvasCommands };
  }

  /**
   * Generate regular polygon geometry
   * @param sides Number of sides (must be >= 3)
   * @param radius Radius from center to vertices in pixels
   * @returns PathData for polygon
   */
  static generatePolygon(sides: number, radius: number): PathData {
    if (sides < 3) {
      throw new Error('Polygon must have at least 3 sides');
    }

    const vertices = this.calculatePolygonVertices(sides, radius);
    
    // Build SVG path
    const firstVertex = vertices[0]!;
    let svgPath = `M ${firstVertex.x} ${firstVertex.y}`;
    for (let i = 1; i < vertices.length; i++) {
      const vertex = vertices[i]!;
      svgPath += ` L ${vertex.x} ${vertex.y}`;
    }
    svgPath += ' Z';

    // Build canvas commands
    const canvasCommands: CanvasCommand[] = [
      { type: 'moveTo', args: [firstVertex.x, firstVertex.y] }
    ];
    for (let i = 1; i < vertices.length; i++) {
      const vertex = vertices[i]!;
      canvasCommands.push({ type: 'lineTo', args: [vertex.x, vertex.y] });
    }
    canvasCommands.push({ type: 'closePath', args: [] });

    return { svgPath, canvasCommands };
  }

  /**
   * Generate star geometry
   * @param points Number of star points (must be >= 3)
   * @param innerRadius Radius to inner vertices in pixels
   * @param outerRadius Radius to outer vertices (points) in pixels
   * @returns PathData for star
   */
  static generateStar(points: number, innerRadius: number, outerRadius: number): PathData {
    if (points < 3) {
      throw new Error('Star must have at least 3 points');
    }

    const vertices = this.calculateStarVertices(points, innerRadius, outerRadius);
    
    // Build SVG path
    const firstVertex = vertices[0]!;
    let svgPath = `M ${firstVertex.x} ${firstVertex.y}`;
    for (let i = 1; i < vertices.length; i++) {
      const vertex = vertices[i]!;
      svgPath += ` L ${vertex.x} ${vertex.y}`;
    }
    svgPath += ' Z';

    // Build canvas commands
    const canvasCommands: CanvasCommand[] = [
      { type: 'moveTo', args: [firstVertex.x, firstVertex.y] }
    ];
    for (let i = 1; i < vertices.length; i++) {
      const vertex = vertices[i]!;
      canvasCommands.push({ type: 'lineTo', args: [vertex.x, vertex.y] });
    }
    canvasCommands.push({ type: 'closePath', args: [] });

    return { svgPath, canvasCommands };
  }

  /**
   * Helper: Calculate vertices for a regular polygon
   * @param sides Number of sides
   * @param radius Radius from center to vertices
   * @returns Array of vertex points
   */
  private static calculatePolygonVertices(sides: number, radius: number): Point[] {
    const vertices: Point[] = [];
    const angleStep = (Math.PI * 2) / sides;
    // Start from top (rotate by -90 degrees)
    const startAngle = -Math.PI / 2;

    for (let i = 0; i < sides; i++) {
      const angle = startAngle + angleStep * i;
      vertices.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }

    return vertices;
  }

  /**
   * Helper: Calculate vertices for a star shape
   * @param points Number of star points
   * @param innerRadius Radius to inner vertices
   * @param outerRadius Radius to outer vertices (points)
   * @returns Array of vertex points (alternating outer and inner)
   */
  private static calculateStarVertices(points: number, innerRadius: number, outerRadius: number): Point[] {
    const vertices: Point[] = [];
    const angleStep = Math.PI / points; // Half the angle between points
    // Start from top (rotate by -90 degrees)
    const startAngle = -Math.PI / 2;

    for (let i = 0; i < points * 2; i++) {
      const angle = startAngle + angleStep * i;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      vertices.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }

    return vertices;
  }

  /**
   * Helper: Convert degrees to radians
   * @param degrees Angle in degrees
   * @returns Angle in radians
   */
  static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Helper: Convert radians to degrees
   * @param radians Angle in radians
   * @returns Angle in degrees
   */
  static radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }
}
