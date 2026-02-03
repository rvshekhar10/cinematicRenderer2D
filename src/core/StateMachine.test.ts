import { describe, it, expect, vi } from 'vitest';
import { StateMachine, RendererState, SceneState, type State } from './StateMachine';

describe('StateMachine', () => {
  describe('Renderer State Transitions', () => {
    it('should start in IDLE state', () => {
      const sm = new StateMachine(RendererState.IDLE);
      expect(sm.getState()).toBe(RendererState.IDLE);
    });

    it('should allow IDLE -> READY transition', async () => {
      const sm = new StateMachine(RendererState.IDLE);
      await sm.transition(RendererState.READY);
      expect(sm.getState()).toBe(RendererState.READY);
    });

    it('should allow READY -> PLAYING transition', async () => {
      const sm = new StateMachine(RendererState.IDLE);
      await sm.transition(RendererState.READY);
      await sm.transition(RendererState.PLAYING);
      expect(sm.getState()).toBe(RendererState.PLAYING);
    });

    it('should allow PLAYING -> PAUSED transition', async () => {
      const sm = new StateMachine(RendererState.IDLE);
      await sm.transition(RendererState.READY);
      await sm.transition(RendererState.PLAYING);
      await sm.transition(RendererState.PAUSED);
      expect(sm.getState()).toBe(RendererState.PAUSED);
    });

    it('should allow PAUSED -> PLAYING transition', async () => {
      const sm = new StateMachine(RendererState.IDLE);
      await sm.transition(RendererState.READY);
      await sm.transition(RendererState.PLAYING);
      await sm.transition(RendererState.PAUSED);
      await sm.transition(RendererState.PLAYING);
      expect(sm.getState()).toBe(RendererState.PLAYING);
    });

    it('should allow PLAYING -> STOPPED transition', async () => {
      const sm = new StateMachine(RendererState.IDLE);
      await sm.transition(RendererState.READY);
      await sm.transition(RendererState.PLAYING);
      await sm.transition(RendererState.STOPPED);
      expect(sm.getState()).toBe(RendererState.STOPPED);
    });

    it('should allow STOPPED -> PLAYING transition', async () => {
      const sm = new StateMachine(RendererState.IDLE);
      await sm.transition(RendererState.READY);
      await sm.transition(RendererState.PLAYING);
      await sm.transition(RendererState.STOPPED);
      await sm.transition(RendererState.PLAYING);
      expect(sm.getState()).toBe(RendererState.PLAYING);
    });

    it('should allow transition to DESTROYED from any state', async () => {
      const states: RendererState[] = [
        RendererState.IDLE,
        RendererState.READY,
        RendererState.PLAYING,
        RendererState.PAUSED,
        RendererState.STOPPED
      ];

      for (const state of states) {
        const sm = new StateMachine(state);
        await sm.transition(RendererState.DESTROYED);
        expect(sm.getState()).toBe(RendererState.DESTROYED);
      }
    });

    it('should reject invalid IDLE -> PLAYING transition', async () => {
      const sm = new StateMachine(RendererState.IDLE);
      await expect(sm.transition(RendererState.PLAYING)).rejects.toThrow(
        /Invalid state transition/
      );
    });

    it('should reject invalid READY -> PAUSED transition', async () => {
      const sm = new StateMachine(RendererState.IDLE);
      await sm.transition(RendererState.READY);
      await expect(sm.transition(RendererState.PAUSED)).rejects.toThrow(
        /Invalid state transition/
      );
    });
  });

  describe('Scene State Transitions', () => {
    it('should allow CREATED -> MOUNTED transition', async () => {
      const sm = new StateMachine(SceneState.CREATED);
      await sm.transition(SceneState.MOUNTED);
      expect(sm.getState()).toBe(SceneState.MOUNTED);
    });

    it('should allow MOUNTED -> ACTIVE transition', async () => {
      const sm = new StateMachine(SceneState.CREATED);
      await sm.transition(SceneState.MOUNTED);
      await sm.transition(SceneState.ACTIVE);
      expect(sm.getState()).toBe(SceneState.ACTIVE);
    });

    it('should allow ACTIVE -> EXITING transition', async () => {
      const sm = new StateMachine(SceneState.CREATED);
      await sm.transition(SceneState.MOUNTED);
      await sm.transition(SceneState.ACTIVE);
      await sm.transition(SceneState.EXITING);
      expect(sm.getState()).toBe(SceneState.EXITING);
    });

    it('should allow EXITING -> UNMOUNTED transition', async () => {
      const sm = new StateMachine(SceneState.CREATED);
      await sm.transition(SceneState.MOUNTED);
      await sm.transition(SceneState.ACTIVE);
      await sm.transition(SceneState.EXITING);
      await sm.transition(SceneState.UNMOUNTED);
      expect(sm.getState()).toBe(SceneState.UNMOUNTED);
    });

    it('should allow UNMOUNTED -> CREATED transition (scene reuse)', async () => {
      const sm = new StateMachine(SceneState.CREATED);
      await sm.transition(SceneState.MOUNTED);
      await sm.transition(SceneState.ACTIVE);
      await sm.transition(SceneState.EXITING);
      await sm.transition(SceneState.UNMOUNTED);
      await sm.transition(SceneState.CREATED);
      expect(sm.getState()).toBe(SceneState.CREATED);
    });

    it('should reject invalid CREATED -> ACTIVE transition', async () => {
      const sm = new StateMachine(SceneState.CREATED);
      await expect(sm.transition(SceneState.ACTIVE)).rejects.toThrow(
        /Invalid state transition/
      );
    });
  });

  describe('canTransition', () => {
    it('should return true for valid transitions', () => {
      const sm = new StateMachine(RendererState.IDLE);
      expect(sm.canTransition(RendererState.READY)).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      const sm = new StateMachine(RendererState.IDLE);
      expect(sm.canTransition(RendererState.PLAYING)).toBe(false);
    });

    it('should respect guard functions', () => {
      const sm = new StateMachine(RendererState.IDLE);
      let guardResult = false;
      
      sm.registerTransition({
        from: RendererState.IDLE,
        to: RendererState.PLAYING,
        guard: () => guardResult
      });

      expect(sm.canTransition(RendererState.PLAYING)).toBe(false);
      
      guardResult = true;
      expect(sm.canTransition(RendererState.PLAYING)).toBe(true);
    });
  });

  describe('State Change Listeners', () => {
    it('should notify listeners on state change', async () => {
      const sm = new StateMachine(RendererState.IDLE);
      const listener = vi.fn();
      
      sm.addListener(listener);
      await sm.transition(RendererState.READY);
      
      expect(listener).toHaveBeenCalledWith(RendererState.IDLE, RendererState.READY);
    });

    it('should support multiple listeners', async () => {
      const sm = new StateMachine(RendererState.IDLE);
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      sm.addListener(listener1);
      sm.addListener(listener2);
      await sm.transition(RendererState.READY);
      
      expect(listener1).toHaveBeenCalledWith(RendererState.IDLE, RendererState.READY);
      expect(listener2).toHaveBeenCalledWith(RendererState.IDLE, RendererState.READY);
    });

    it('should allow removing listeners', async () => {
      const sm = new StateMachine(RendererState.IDLE);
      const listener = vi.fn();
      
      sm.addListener(listener);
      sm.removeListener(listener);
      await sm.transition(RendererState.READY);
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', async () => {
      const sm = new StateMachine(RendererState.IDLE);
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const goodListener = vi.fn();
      
      sm.addListener(errorListener);
      sm.addListener(goodListener);
      
      // Should not throw
      await sm.transition(RendererState.READY);
      
      expect(errorListener).toHaveBeenCalled();
      expect(goodListener).toHaveBeenCalled();
    });
  });

  describe('Transition Actions', () => {
    it('should execute action on transition', async () => {
      const sm = new StateMachine(RendererState.IDLE);
      const action = vi.fn();
      
      sm.registerTransition({
        from: RendererState.IDLE,
        to: RendererState.READY,
        action
      });
      
      await sm.transition(RendererState.READY);
      expect(action).toHaveBeenCalled();
    });

    it('should support async actions', async () => {
      const sm = new StateMachine(RendererState.IDLE);
      let actionCompleted = false;
      
      sm.registerTransition({
        from: RendererState.IDLE,
        to: RendererState.READY,
        action: async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          actionCompleted = true;
        }
      });
      
      await sm.transition(RendererState.READY);
      expect(actionCompleted).toBe(true);
    });
  });

  describe('Error Messages', () => {
    it('should provide helpful error messages for invalid transitions', async () => {
      const sm = new StateMachine(RendererState.IDLE);
      
      try {
        await sm.transition(RendererState.PLAYING);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Invalid state transition');
        expect((error as Error).message).toContain('idle -> playing');
        expect((error as Error).message).toContain('Valid transitions from idle');
      }
    });
  });

  describe('Single Active Scene Invariant', () => {
    it('should allow setting scene state', () => {
      const sm = new StateMachine(RendererState.IDLE);
      sm.setSceneState('scene1', SceneState.CREATED);
      expect(sm.getSceneState('scene1')).toBe(SceneState.CREATED);
    });

    it('should track active scene when set to ACTIVE', () => {
      const sm = new StateMachine(RendererState.IDLE);
      sm.setSceneState('scene1', SceneState.ACTIVE);
      expect(sm.getActiveSceneId()).toBe('scene1');
      expect(sm.isSceneActive('scene1')).toBe(true);
    });

    it('should prevent multiple scenes from being active simultaneously', () => {
      const sm = new StateMachine(RendererState.IDLE);
      sm.setSceneState('scene1', SceneState.ACTIVE);
      
      expect(() => {
        sm.setSceneState('scene2', SceneState.ACTIVE);
      }).toThrow(/Cannot activate scene "scene2": scene "scene1" is already active/);
    });

    it('should allow reactivating the same scene', () => {
      const sm = new StateMachine(RendererState.IDLE);
      sm.setSceneState('scene1', SceneState.ACTIVE);
      
      // Should not throw
      sm.setSceneState('scene1', SceneState.ACTIVE);
      expect(sm.getActiveSceneId()).toBe('scene1');
    });

    it('should clear active scene when transitioning away from ACTIVE', () => {
      const sm = new StateMachine(RendererState.IDLE);
      sm.setSceneState('scene1', SceneState.ACTIVE);
      expect(sm.getActiveSceneId()).toBe('scene1');
      
      sm.setSceneState('scene1', SceneState.EXITING);
      expect(sm.getActiveSceneId()).toBe(null);
    });

    it('should allow activating a new scene after previous scene exits', () => {
      const sm = new StateMachine(RendererState.IDLE);
      sm.setSceneState('scene1', SceneState.ACTIVE);
      sm.setSceneState('scene1', SceneState.EXITING);
      
      // Should not throw
      sm.setSceneState('scene2', SceneState.ACTIVE);
      expect(sm.getActiveSceneId()).toBe('scene2');
    });

    it('should track multiple scene states independently', () => {
      const sm = new StateMachine(RendererState.IDLE);
      sm.setSceneState('scene1', SceneState.CREATED);
      sm.setSceneState('scene2', SceneState.MOUNTED);
      sm.setSceneState('scene3', SceneState.UNMOUNTED);
      
      expect(sm.getSceneState('scene1')).toBe(SceneState.CREATED);
      expect(sm.getSceneState('scene2')).toBe(SceneState.MOUNTED);
      expect(sm.getSceneState('scene3')).toBe(SceneState.UNMOUNTED);
    });

    it('should return undefined for unknown scene', () => {
      const sm = new StateMachine(RendererState.IDLE);
      expect(sm.getSceneState('unknown')).toBe(undefined);
    });

    it('should return all scene states', () => {
      const sm = new StateMachine(RendererState.IDLE);
      sm.setSceneState('scene1', SceneState.CREATED);
      sm.setSceneState('scene2', SceneState.MOUNTED);
      
      const allStates = sm.getAllSceneStates();
      expect(allStates.size).toBe(2);
      expect(allStates.get('scene1')).toBe(SceneState.CREATED);
      expect(allStates.get('scene2')).toBe(SceneState.MOUNTED);
    });

    it('should enforce single active scene across scene lifecycle', () => {
      const sm = new StateMachine(RendererState.IDLE);
      
      // Scene 1 lifecycle
      sm.setSceneState('scene1', SceneState.CREATED);
      sm.setSceneState('scene1', SceneState.MOUNTED);
      sm.setSceneState('scene1', SceneState.ACTIVE);
      expect(sm.getActiveSceneId()).toBe('scene1');
      
      // Try to activate scene 2 while scene 1 is active - should fail
      sm.setSceneState('scene2', SceneState.CREATED);
      sm.setSceneState('scene2', SceneState.MOUNTED);
      expect(() => {
        sm.setSceneState('scene2', SceneState.ACTIVE);
      }).toThrow(/Cannot activate scene/);
      
      // Exit scene 1
      sm.setSceneState('scene1', SceneState.EXITING);
      expect(sm.getActiveSceneId()).toBe(null);
      
      // Now scene 2 can be activated
      sm.setSceneState('scene2', SceneState.ACTIVE);
      expect(sm.getActiveSceneId()).toBe('scene2');
    });
  });
});
