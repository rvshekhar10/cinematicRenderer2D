import { beforeAll, afterEach } from 'vitest';

// Mock DOM APIs that might not be available in jsdom
beforeAll(() => {
  // Mock requestAnimationFrame
  global.requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(Date.now()), 16);
  };

  global.cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
  };

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock Web Audio API
  global.AudioContext = class MockAudioContext {
    createGain() {
      return {
        connect: () => {},
        disconnect: () => {},
        gain: { value: 1 },
      };
    }
    createBufferSource() {
      return {
        connect: () => {},
        disconnect: () => {},
        start: () => {},
        stop: () => {},
      };
    }
    destination = {};
  } as any;

  // Mock HTMLCanvasElement methods
  HTMLCanvasElement.prototype.getContext = function(contextId: string) {
    if (contextId === '2d') {
      return {
        fillRect: () => {},
        clearRect: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray(4) }),
        putImageData: () => {},
        createImageData: () => ({ data: new Uint8ClampedArray(4) }),
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        fill: () => {},
        measureText: () => ({ width: 0 }),
        canvas: this,
      };
    }
    return null;
  };
});

// Clean up after each test
afterEach(() => {
  // Clear any timers
  vi.clearAllTimers();
  
  // Reset DOM if available
  if (typeof document !== 'undefined' && document.body) {
    document.body.innerHTML = '';
  }
});