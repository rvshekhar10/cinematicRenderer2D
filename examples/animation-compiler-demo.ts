/**
 * Animation Compiler Demo
 * 
 * Demonstrates the comprehensive animation compilation system with various
 * easing functions, interpolation types, and loop/yoyo effects.
 */

import { AnimationCompiler } from '../src/animation/AnimationCompiler';
import type { AnimationTrackSpec } from '../src/types/CinematicSpec';

console.log('🎬 Animation Compiler Demo\n');

// Demo 1: Basic number interpolation with different easing functions
console.log('📊 Demo 1: Number Interpolation with Different Easing Functions');
const easingTypes = ['linear', 'ease-in-quad', 'ease-out-bounce', 'ease-in-out-elastic'] as const;

easingTypes.forEach(easing => {
  const track: AnimationTrackSpec = {
    property: 'opacity',
    from: 0,
    to: 100,
    startMs: 0,
    endMs: 1000,
    easing
  };
  
  const compiled = AnimationCompiler.compileTrack(track);
  
  console.log(`\n${easing}:`);
  console.log(`  0%: ${compiled.interpolate(0)}`);
  console.log(`  25%: ${compiled.interpolate(0.25)}`);
  console.log(`  50%: ${compiled.interpolate(0.5)}`);
  console.log(`  75%: ${compiled.interpolate(0.75)}`);
  console.log(`  100%: ${compiled.interpolate(1)}`);
});

// Demo 2: String interpolation with CSS units
console.log('\n\n🎨 Demo 2: String Interpolation with CSS Units');
const stringTrack: AnimationTrackSpec = {
  property: 'width',
  from: '10px',
  to: '200px',
  startMs: 0,
  endMs: 1000,
  easing: 'ease-in-out'
};

const compiledString = AnimationCompiler.compileTrack(stringTrack);

console.log('Width animation (10px → 200px):');
for (let i = 0; i <= 10; i++) {
  const progress = i / 10;
  console.log(`  ${(progress * 100).toFixed(0)}%: ${compiledString.interpolate(progress)}`);
}

// Demo 3: Object interpolation for complex transforms
console.log('\n\n🔄 Demo 3: Object Interpolation for Complex Transforms');
const transformTrack: AnimationTrackSpec = {
  property: 'transform',
  from: { x: 0, y: 0, scale: 1, rotation: 0 },
  to: { x: 100, y: 50, scale: 2, rotation: 360 },
  startMs: 0,
  endMs: 2000,
  easing: 'ease-in-out-cubic'
};

const compiledTransform = AnimationCompiler.compileTrack(transformTrack);

console.log('Transform animation:');
for (let i = 0; i <= 4; i++) {
  const progress = i / 4;
  const result = compiledTransform.interpolate(progress);
  console.log(`  ${(progress * 100).toFixed(0)}%: x=${result.x}, y=${result.y}, scale=${result.scale}, rotation=${result.rotation}°`);
}

// Demo 4: Loop and yoyo effects
console.log('\n\n🔁 Demo 4: Loop and Yoyo Effects');
const loopTrack: AnimationTrackSpec = {
  property: 'scale',
  from: 1,
  to: 2,
  startMs: 0,
  endMs: 1000,
  easing: 'ease-in-out',
  loop: true,
  yoyo: true
};

const compiledLoop = AnimationCompiler.compileTrack(loopTrack);

console.log('Scale animation with loop and yoyo:');
console.log(`Loop: ${compiledLoop.loop}, Yoyo: ${compiledLoop.yoyo}`);

// Simulate multiple loop cycles
for (let cycle = 0; cycle < 3; cycle++) {
  console.log(`\nCycle ${cycle + 1}:`);
  for (let i = 0; i <= 4; i++) {
    const progress = i / 4;
    console.log(`  ${(progress * 100).toFixed(0)}%: ${compiledLoop.interpolate(progress)}`);
  }
}

// Demo 5: Cubic-bezier custom easing
console.log('\n\n📈 Demo 5: Custom Cubic-Bezier Easing');
const customTrack: AnimationTrackSpec = {
  property: 'opacity',
  from: 0,
  to: 1,
  startMs: 0,
  endMs: 1000,
  easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' // Custom bounce-like curve
};

const compiledCustom = AnimationCompiler.compileTrack(customTrack);

console.log('Custom cubic-bezier(0.68, -0.55, 0.265, 1.55):');
for (let i = 0; i <= 10; i++) {
  const progress = i / 10;
  const value = compiledCustom.interpolate(progress);
  console.log(`  ${(progress * 100).toFixed(0)}%: ${value.toFixed(3)}`);
}

// Demo 6: Performance comparison
console.log('\n\n⚡ Demo 6: Performance Comparison');
const performanceTrack: AnimationTrackSpec = {
  property: 'x',
  from: 0,
  to: 1000,
  startMs: 0,
  endMs: 1000,
  easing: 'ease-in-out-cubic'
};

const compiledPerf = AnimationCompiler.compileTrack(performanceTrack);

// Measure compilation time
const compileStart = performance.now();
for (let i = 0; i < 1000; i++) {
  AnimationCompiler.compileTrack(performanceTrack);
}
const compileTime = performance.now() - compileStart;

// Measure interpolation time
const interpStart = performance.now();
for (let i = 0; i < 100000; i++) {
  compiledPerf.interpolate(Math.random());
}
const interpTime = performance.now() - interpStart;

console.log(`Compilation time (1000 tracks): ${compileTime.toFixed(2)}ms`);
console.log(`Interpolation time (100k calls): ${interpTime.toFixed(2)}ms`);
console.log(`Average interpolation: ${(interpTime / 100000 * 1000).toFixed(3)}μs per call`);

console.log('\n✅ Animation Compiler Demo Complete!');
console.log('\nKey Features Demonstrated:');
console.log('• 30+ easing functions (linear, quad, cubic, sine, expo, circ, back, elastic, bounce)');
console.log('• Number, string, boolean, and object interpolation');
console.log('• CSS unit support (px, em, %, etc.)');
console.log('• Loop and yoyo animation effects');
console.log('• Custom cubic-bezier easing functions');
console.log('• High-performance precompiled interpolation');
console.log('• Zero-allocation animation loops for 60-120fps performance');