/**
 * Utility Types for cinematicRenderer2D
 * 
 * Common utility types used throughout the cinematic rendering system.
 * These provide type safety and consistency across all modules.
 */

/** Viewport dimensions and properties */
export interface Viewport {
  /** Viewport width in pixels */
  width: number;
  /** Viewport height in pixels */
  height: number;
  /** Device pixel ratio */
  devicePixelRatio: number;
  /** Aspect ratio (width / height) */
  aspectRatio: number;
}

/** 2D point coordinates */
export interface Point2D {
  x: number;
  y: number;
}

/** 2D vector with magnitude and direction */
export interface Vector2D extends Point2D {
  /** Vector magnitude */
  magnitude?: number;
  /** Vector angle in radians */
  angle?: number;
}

/** Rectangle bounds */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Color representation in various formats */
export interface Color {
  /** Red component (0-255) */
  r: number;
  /** Green component (0-255) */
  g: number;
  /** Blue component (0-255) */
  b: number;
  /** Alpha component (0-1) */
  a?: number;
}

/** HSL color representation */
export interface HSLColor {
  /** Hue (0-360) */
  h: number;
  /** Saturation (0-100) */
  s: number;
  /** Lightness (0-100) */
  l: number;
  /** Alpha component (0-1) */
  a?: number;
}

/** Time-based value for animations */
export interface TimeValue {
  /** Value at this time */
  value: any;
  /** Time in milliseconds */
  time: number;
  /** Easing function to next keyframe */
  easing?: string;
}

/** Event listener callback signature */
export type EventCallback<T = any> = (data: T) => void;

/** Disposable resource interface */
export interface Disposable {
  /** Clean up resources */
  dispose(): void;
  /** Whether the resource has been disposed */
  isDisposed: boolean;
}

/** Observable pattern for event emission */
export interface Observable<T> {
  /** Subscribe to events */
  subscribe(callback: EventCallback<T>): () => void;
  /** Unsubscribe from events */
  unsubscribe(callback: EventCallback<T>): void;
  /** Emit an event */
  emit(data: T): void;
}

/** Promise-like interface for async operations */
export interface Thenable<T> {
  then<U>(onFulfilled?: (value: T) => U | Thenable<U>): Thenable<U>;
  catch<U>(onRejected?: (reason: any) => U | Thenable<U>): Thenable<U>;
}

/** Configuration object with validation */
export interface ValidatedConfig<T> {
  /** The configuration data */
  data: T;
  /** Whether the configuration is valid */
  isValid: boolean;
  /** Validation errors if any */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
}

/** Generic factory interface */
export interface Factory<T, TOptions = any> {
  /** Create a new instance */
  create(options: TOptions): T;
  /** Check if the factory can create the requested type */
  canCreate(type: string): boolean;
  /** Get supported types */
  getSupportedTypes(): string[];
}

/** Plugin interface for extensibility */
export interface Plugin {
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Initialize the plugin */
  initialize(context: any): void;
  /** Destroy the plugin */
  destroy(): void;
  /** Whether the plugin is active */
  isActive: boolean;
}

/** Serializable data interface */
export interface Serializable {
  /** Serialize to JSON */
  toJSON(): any;
  /** Deserialize from JSON */
  fromJSON(data: any): void;
}

/** Deep partial type for configuration objects */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Make all properties required recursively */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/** Extract function parameter types */
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

/** Extract function return type */
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

/** Create a type with specific keys omitted */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/** Create a type with specific keys made optional */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Create a type with specific keys made required */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Union to intersection type conversion */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

/** Extract keys of a specific type */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/** Brand type for nominal typing */
export type Brand<T, B> = T & { __brand: B };

/** Opaque type for hiding implementation details */
export type Opaque<T, K> = T & { readonly __opaque: K };