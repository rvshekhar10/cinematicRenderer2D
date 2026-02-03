/**
 * State Machine for managing renderer and scene states with strict transition rules
 */

export enum RendererState {
  IDLE = 'idle',
  READY = 'ready',
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  DESTROYED = 'destroyed'
}

export enum SceneState {
  CREATED = 'created',
  MOUNTED = 'mounted',
  ACTIVE = 'active',
  EXITING = 'exiting',
  UNMOUNTED = 'unmounted'
}

export type State = RendererState | SceneState;

export interface StateTransition {
  from: State;
  to: State;
  guard?: () => boolean;
  action?: () => void | Promise<void>;
}

export type StateChangeListener = (from: State, to: State) => void;

/**
 * StateMachine manages state transitions with validation and event emission
 */
export class StateMachine {
  private currentState: State;
  private transitions: Map<string, StateTransition>;
  private listeners: Set<StateChangeListener>;
  private sceneStates: Map<string, SceneState>;
  private activeSceneId: string | null;

  constructor(initialState: State) {
    this.currentState = initialState;
    this.transitions = new Map();
    this.listeners = new Set();
    this.sceneStates = new Map();
    this.activeSceneId = null;
    this._registerDefaultTransitions();
  }

  /**
   * Register default valid transitions for renderer and scene states
   */
  private _registerDefaultTransitions(): void {
    // Renderer state transitions
    this.registerTransition({ from: RendererState.IDLE, to: RendererState.READY });
    this.registerTransition({ from: RendererState.READY, to: RendererState.PLAYING });
    this.registerTransition({ from: RendererState.PLAYING, to: RendererState.PAUSED });
    this.registerTransition({ from: RendererState.PLAYING, to: RendererState.STOPPED });
    this.registerTransition({ from: RendererState.PAUSED, to: RendererState.PLAYING });
    this.registerTransition({ from: RendererState.PAUSED, to: RendererState.STOPPED });
    this.registerTransition({ from: RendererState.STOPPED, to: RendererState.PLAYING });
    
    // Allow transition to DESTROYED from any state
    for (const state of Object.values(RendererState)) {
      if (state !== RendererState.DESTROYED) {
        this.registerTransition({ from: state as RendererState, to: RendererState.DESTROYED });
      }
    }

    // Scene state transitions
    this.registerTransition({ from: SceneState.CREATED, to: SceneState.MOUNTED });
    this.registerTransition({ from: SceneState.MOUNTED, to: SceneState.ACTIVE });
    this.registerTransition({ from: SceneState.ACTIVE, to: SceneState.EXITING });
    this.registerTransition({ from: SceneState.EXITING, to: SceneState.UNMOUNTED });
    this.registerTransition({ from: SceneState.UNMOUNTED, to: SceneState.CREATED });
  }

  /**
   * Register a valid state transition
   */
  registerTransition(transition: StateTransition): void {
    const key = this._getTransitionKey(transition.from, transition.to);
    this.transitions.set(key, transition);
  }

  /**
   * Check if a transition from current state to target state is valid
   */
  canTransition(to: State): boolean {
    const key = this._getTransitionKey(this.currentState, to);
    const transition = this.transitions.get(key);
    
    if (!transition) {
      return false;
    }

    if (transition.guard) {
      return transition.guard();
    }

    return true;
  }

  /**
   * Attempt to transition to a new state
   * @throws Error if transition is invalid
   */
  async transition(to: State): Promise<void> {
    if (!this.canTransition(to)) {
      throw new Error(
        `Invalid state transition: ${this.currentState} -> ${to}. ` +
        `Valid transitions from ${this.currentState}: ${this._getValidTransitions().join(', ')}`
      );
    }

    const key = this._getTransitionKey(this.currentState, to);
    const transition = this.transitions.get(key);
    const from = this.currentState;

    // Execute transition action if provided
    if (transition?.action) {
      await transition.action();
    }

    // Update state
    this.currentState = to;

    // Notify listeners
    this._notifyListeners(from, to);
  }

  /**
   * Get current state
   */
  getState(): State {
    return this.currentState;
  }

  /**
   * Add a state change listener
   */
  addListener(listener: StateChangeListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove a state change listener
   */
  removeListener(listener: StateChangeListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Get list of valid transitions from current state
   */
  private _getValidTransitions(): string[] {
    const validTransitions: string[] = [];
    
    for (const [key, transition] of this.transitions.entries()) {
      if (transition.from === this.currentState) {
        if (!transition.guard || transition.guard()) {
          validTransitions.push(transition.to);
        }
      }
    }

    return validTransitions;
  }

  /**
   * Generate transition key for lookup
   */
  private _getTransitionKey(from: State, to: State): string {
    return `${from}->${to}`;
  }

  /**
   * Notify all listeners of state change
   */
  private _notifyListeners(from: State, to: State): void {
    for (const listener of this.listeners) {
      try {
        listener(from, to);
      } catch (error) {
        console.error('Error in state change listener:', error);
      }
    }
  }

  /**
   * Set scene state and enforce single active scene invariant
   * @throws Error if trying to activate a scene when another is already active
   */
  setSceneState(sceneId: string, state: SceneState): void {
    // Enforce single active scene invariant
    if (state === SceneState.ACTIVE) {
      if (this.activeSceneId !== null && this.activeSceneId !== sceneId) {
        throw new Error(
          `Cannot activate scene "${sceneId}": scene "${this.activeSceneId}" is already active. ` +
          `Only one scene can be active at a time.`
        );
      }
      this.activeSceneId = sceneId;
    }

    // Clear active scene when transitioning away from ACTIVE
    if (this.activeSceneId === sceneId && state !== SceneState.ACTIVE) {
      this.activeSceneId = null;
    }

    this.sceneStates.set(sceneId, state);
  }

  /**
   * Get scene state
   */
  getSceneState(sceneId: string): SceneState | undefined {
    return this.sceneStates.get(sceneId);
  }

  /**
   * Get currently active scene ID
   */
  getActiveSceneId(): string | null {
    return this.activeSceneId;
  }

  /**
   * Check if a scene is active
   */
  isSceneActive(sceneId: string): boolean {
    return this.activeSceneId === sceneId;
  }

  /**
   * Get all scene states
   */
  getAllSceneStates(): Map<string, SceneState> {
    return new Map(this.sceneStates);
  }
}
