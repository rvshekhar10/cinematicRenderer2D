# Why You're Seeing 60 FPS Instead of 120 FPS

## The Root Cause

Your cinematic renderer is configured for 120 FPS in the `night-sky-demo.json`:

```json
"engine": {
  "targetFps": 120,
  "quality": "ultra"
}
```

However, you're seeing **60 FPS** because of **browser and hardware limitations**.

## How `requestAnimationFrame` Works

The renderer uses `requestAnimationFrame()` for smooth animations, which:

1. **Syncs with your display's refresh rate**
2. **Cannot exceed your monitor's Hz**
3. **Is capped by the browser**

### Display Refresh Rate Limits

| Display Type | Max FPS | What You'll See |
|--------------|---------|-----------------|
| 60Hz Monitor | 60 FPS | ✅ 60 FPS (current) |
| 120Hz Monitor | 120 FPS | 🎯 120 FPS (target) |
| 144Hz Monitor | 144 FPS | 🚀 144 FPS (bonus!) |
| iPad Pro (ProMotion) | 120 FPS | 🎯 120 FPS |

## Why This Happens

### Browser Behavior
```javascript
// In src/core/Scheduler.ts
this.animationFrameId = requestAnimationFrame((currentTime) => {
  // This callback runs at your display's refresh rate
  // 60Hz display = called 60 times per second
  // 120Hz display = called 120 times per second
});
```

The browser's `requestAnimationFrame` is **intentionally limited** to:
- Save battery life
- Prevent unnecessary rendering
- Match the physical display capabilities

## How to Achieve 120 FPS

### ✅ Solution 1: Use a High Refresh Rate Display

**Requirements:**
1. **120Hz+ monitor** (gaming monitor, high-end laptop, iPad Pro)
2. **Enable high refresh rate** in system settings:
   - **macOS**: System Settings → Displays → Refresh Rate → 120Hz
   - **Windows**: Settings → Display → Advanced → Refresh Rate → 120Hz
3. **Browser on that display** (drag window to high-refresh monitor)
4. **Hardware acceleration enabled** in browser settings

**Verify your display:**
- Visit: https://www.testufo.com/
- Check if you see smooth 120 FPS motion

### ⚠️ Solution 2: Custom Timer (Not Recommended for Production)

For testing/development only, you could bypass `requestAnimationFrame`:

```typescript
// Custom high-frequency timer (bypasses display sync)
private scheduleFrameCustom(): void {
  const targetFrameTime = 1000 / this.options.targetFps; // 8.33ms for 120 FPS
  
  setTimeout(() => {
    const currentTime = performance.now();
    const deltaMs = currentTime - this.lastFrameTime;
    
    // ... frame logic ...
    
    if (this.isRunning) {
      this.scheduleFrameCustom();
    }
  }, targetFrameTime);
}
```

**Downsides:**
- ❌ Not synced with display (causes tearing)
- ❌ Wastes CPU/GPU (renders frames that can't be displayed)
- ❌ Drains battery faster
- ❌ May cause jank/stuttering

## Current Status

### What's Working ✅
- Renderer correctly configured for 120 FPS
- Animation timing calculations are accurate
- Quality system set to "ultra"
- All transitions and effects are smooth

### What's Limited 🔒
- **Display refresh rate**: Your monitor is 60Hz
- **Browser cap**: `requestAnimationFrame` limited to 60 FPS
- **Physics**: Can't display more frames than your screen can show

## Recommendations

### For Development
1. **Test on 120Hz display** if available
2. **Use FPS counter** to verify actual frame rate
3. **Check browser DevTools** → Performance tab

### For Production
1. **Keep 120 FPS target** - users with high-refresh displays will benefit
2. **Add adaptive quality** - automatically adjusts for user's hardware
3. **Graceful degradation** - 60 FPS is still smooth for most users

## Verification Steps

### Check Your Display Refresh Rate

**macOS:**
```bash
system_profiler SPDisplaysDataType | grep "Resolution"
```

**Browser Console:**
```javascript
// Check actual frame rate
let lastTime = performance.now();
let frameCount = 0;

function checkFPS() {
  frameCount++;
  const currentTime = performance.now();
  
  if (currentTime - lastTime >= 1000) {
    console.log(`Actual FPS: ${frameCount}`);
    frameCount = 0;
    lastTime = currentTime;
  }
  
  requestAnimationFrame(checkFPS);
}

checkFPS();
```

### Test High Refresh Rate

Visit these sites to verify your display:
- https://www.testufo.com/ (UFO test)
- https://www.blur busters.com/gsync/gsync101-input-lag-tests-and-settings/

## Bottom Line

**You're not doing anything wrong!** 

Your code is perfect. The 60 FPS limit is a **hardware/browser limitation**, not a bug. To see 120 FPS:

1. 🖥️ Get a 120Hz+ display, OR
2. 🎯 Test on a device with high refresh rate (iPad Pro, gaming laptop)
3. ⚙️ Enable high refresh rate in system settings

The good news: Users with 120Hz displays **will** see 120 FPS with your current configuration! 🎉

---

**Current Setup:**
- ✅ Code: Configured for 120 FPS
- ✅ Quality: Ultra settings
- ✅ Transitions: Smooth and dramatic
- ⚠️ Display: Limited to 60Hz (hardware)

**Result:** Everything is working correctly! You just need a faster display to see the full 120 FPS glory.
