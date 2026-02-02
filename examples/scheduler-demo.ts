/**
 * Demo showing the Scheduler and QualitySystem working together
 */

import { Scheduler } from '../src/core/Scheduler';
import { QualitySystem } from '../src/performance/QualitySystem';

// Create a demo container
const container = document.createElement('div');
container.style.width = '800px';
container.style.height = '600px';
container.style.border = '1px solid #ccc';
container.style.position = 'relative';
container.style.backgroundColor = '#000';
document.body.appendChild(container);

// Create info display
const infoDiv = document.createElement('div');
infoDiv.style.position = 'absolute';
infoDiv.style.top = '10px';
infoDiv.style.left = '10px';
infoDiv.style.color = 'white';
infoDiv.style.fontFamily = 'monospace';
infoDiv.style.fontSize = '12px';
infoDiv.style.zIndex = '1000';
container.appendChild(infoDiv);

// Initialize systems
const scheduler = new Scheduler({
  targetFps: 60,
  enableAdaptiveQuality: true,
  monitoringInterval: 1000,
});

const qualitySystem = new QualitySystem({
  monitoringInterval: 1000,
  fpsThreshold: 50,
  badFrameThreshold: 3,
  goodFrameThreshold: 10,
  useDeviceDetection: true,
});

// Connect scheduler to quality system
scheduler.addQualityChangeCallback((metrics) => {
  qualitySystem.updatePerformanceMetrics(metrics);
});

// Listen for quality changes
qualitySystem.addEventListener((event) => {
  if (event.type === 'quality-change') {
    console.log(`Quality changed from ${event.previousQuality} to ${event.newQuality}`);
  } else if (event.type === 'fps-drop') {
    console.log(`FPS drop detected: ${event.metrics.fps.toFixed(1)} FPS`);
  } else if (event.type === 'performance-good') {
    console.log(`Good performance: ${event.metrics.fps.toFixed(1)} FPS`);
  }
});

// Simulate some particles for visual feedback
const particles: Array<{
  x: number;
  y: number;
  vx: number;
  vy: number;
  element: HTMLElement;
}> = [];

function createParticle() {
  const particle = {
    x: Math.random() * 800,
    y: Math.random() * 600,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    element: document.createElement('div'),
  };
  
  particle.element.style.position = 'absolute';
  particle.element.style.width = '4px';
  particle.element.style.height = '4px';
  particle.element.style.backgroundColor = '#00ff00';
  particle.element.style.borderRadius = '50%';
  container.appendChild(particle.element);
  
  return particle;
}

// Create initial particles based on quality
function updateParticleCount() {
  const settings = qualitySystem.getCurrentSettings();
  const targetCount = Math.floor(settings.particleCount / 4); // Scale down for demo
  
  // Add particles if needed
  while (particles.length < targetCount) {
    particles.push(createParticle());
  }
  
  // Remove particles if needed
  while (particles.length > targetCount) {
    const particle = particles.pop();
    if (particle) {
      container.removeChild(particle.element);
    }
  }
}

// Animation loop
scheduler.addFrameCallback((context) => {
  // Update particle count based on quality
  updateParticleCount();
  
  // Update particles
  particles.forEach(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    
    // Bounce off walls
    if (particle.x <= 0 || particle.x >= 796) particle.vx *= -1;
    if (particle.y <= 0 || particle.y >= 596) particle.vy *= -1;
    
    // Keep in bounds
    particle.x = Math.max(0, Math.min(796, particle.x));
    particle.y = Math.max(0, Math.min(596, particle.y));
    
    // Update DOM
    particle.element.style.left = `${particle.x}px`;
    particle.element.style.top = `${particle.y}px`;
  });
  
  // Update performance metrics
  scheduler.updateMetrics({
    activeParticles: particles.length,
    activeLayers: 1,
    domNodes: particles.length + 2, // particles + container + info
    drawCalls: particles.length,
  });
  
  // Update info display
  const metrics = scheduler.getPerformanceMetrics();
  const quality = qualitySystem.getCurrentQuality();
  const settings = qualitySystem.getCurrentSettings();
  
  infoDiv.innerHTML = `
    <div>FPS: ${context.fps.toFixed(1)}</div>
    <div>Frame Time: ${context.deltaMs.toFixed(1)}ms</div>
    <div>Quality: ${quality}</div>
    <div>Particles: ${particles.length}/${settings.particleCount}</div>
    <div>Performance Grade: ${scheduler.getPerformanceGrade()}</div>
    <div>Stable: ${scheduler.isPerformanceStable() ? 'Yes' : 'No'}</div>
  `;
});

// Start the demo
scheduler.start();

// Add controls
const controls = document.createElement('div');
controls.style.marginTop = '10px';
document.body.appendChild(controls);

// Quality selector
const qualitySelect = document.createElement('select');
['auto', 'low', 'medium', 'high', 'ultra'].forEach(quality => {
  const option = document.createElement('option');
  option.value = quality;
  option.textContent = quality.charAt(0).toUpperCase() + quality.slice(1);
  qualitySelect.appendChild(option);
});

qualitySelect.addEventListener('change', () => {
  qualitySystem.setQuality(qualitySelect.value as any);
});

controls.appendChild(document.createTextNode('Quality: '));
controls.appendChild(qualitySelect);

// Performance stress test button
const stressButton = document.createElement('button');
stressButton.textContent = 'Stress Test (Add Load)';
stressButton.style.marginLeft = '10px';

let stressInterval: number | null = null;
stressButton.addEventListener('click', () => {
  if (stressInterval) {
    clearInterval(stressInterval);
    stressInterval = null;
    stressButton.textContent = 'Stress Test (Add Load)';
  } else {
    // Add CPU load to simulate poor performance
    stressInterval = setInterval(() => {
      const start = performance.now();
      while (performance.now() - start < 10) {
        // Busy wait to consume CPU
        Math.random();
      }
    }, 16) as any;
    stressButton.textContent = 'Stop Stress Test';
  }
});

controls.appendChild(stressButton);

console.log('Scheduler and QualitySystem demo started!');
console.log('- Watch the FPS and quality metrics in the top-left corner');
console.log('- Try changing quality levels with the dropdown');
console.log('- Use the stress test button to simulate poor performance');
console.log('- In auto mode, quality should adapt automatically');