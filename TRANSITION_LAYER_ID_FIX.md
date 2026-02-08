# Transition Layer ID Fix - Critical Issue Resolved

## The Problem

Transitions were not executing even though the transition system was fully integrated. The debug logs showed:
- ✅ Scenes were changing
- ✅ Transition configs were found
- ✅ TransitionEngine was available
- ❌ But `layersChanged` was always `false` after the first scene

## Root Cause

**All scenes were using the same layer IDs!**

```json
// Scene 1
"layers": [
  { "id": "bg", ... },      // ❌ Same ID
  { "id": "icon", ... },    // ❌ Same ID
  { "id": "text", ... },    // ❌ Same ID
  { "id": "subtitle", ... } // ❌ Same ID
]

// Scene 2
"layers": [
  { "id": "bg", ... },      // ❌ Same ID
  { "id": "icon", ... },    // ❌ Same ID
  { "id": "text", ... },    // ❌ Same ID
  { "id": "subtitle", ... } // ❌ Same ID
]
```

### Why This Broke Transitions

The `_updateCurrentSceneLayers()` method checks if layers have changed:

```typescript
const layersChanged = newSceneLayers.length !== this._currentSceneLayers.length ||
  newSceneLayers.some(layer => !this._currentSceneLayers.includes(layer));
```

Since all scenes had the same layer IDs:
1. Scene 1 loads with layers: `bg`, `icon`, `text`, `subtitle`
2. Scene 2 tries to load with layers: `bg`, `icon`, `text`, `subtitle`
3. System sees: "Same layer IDs = no change needed"
4. `layersChanged = false`
5. No transition executed!

## The Solution

**Made all layer IDs unique per scene:**

```json
// Scene 1
"layers": [
  { "id": "bg1", ... },      // ✅ Unique
  { "id": "icon1", ... },    // ✅ Unique
  { "id": "text1", ... },    // ✅ Unique
  { "id": "subtitle1", ... } // ✅ Unique
]

// Scene 2
"layers": [
  { "id": "bg2", ... },      // ✅ Unique
  { "id": "icon2", ... },    // ✅ Unique
  { "id": "text2", ... },    // ✅ Unique
  { "id": "subtitle2", ... } // ✅ Unique
]
```

## Layer ID Naming Convention

For multi-scene specs, use this pattern:

```
{layerPurpose}{sceneNumber}
```

Examples:
- `bg1`, `bg2`, `bg3` - Background layers
- `icon1`, `icon2`, `icon3` - Icon/shape layers
- `text1`, `text2`, `text3` - Text layers
- `hero1`, `hero2`, `hero3` - Hero elements
- `overlay1`, `overlay2`, `overlay3` - Overlay layers

## Updated Scenes

All 6 scenes in `transition-types.json` now have unique IDs:

| Scene | Layer IDs |
|-------|-----------|
| Scene 1 (Crossfade) | `bg1`, `icon1`, `text1`, `subtitle1` |
| Scene 2 (Slide) | `bg2`, `icon2`, `text2`, `subtitle2` |
| Scene 3 (Zoom) | `bg3`, `icon3`, `text3`, `subtitle3` |
| Scene 4 (Wipe) | `bg4`, `icon4`, `text4`, `subtitle4` |
| Scene 5 (Dissolve) | `bg5`, `icon5`, `text5`, `subtitle5` |
| Scene 6 (Blur) | `bg6`, `icon6`, `text6`, `subtitle6` |

## Expected Behavior Now

With unique layer IDs, the transition flow works correctly:

1. **Scene 1 → Scene 2:**
   - Old layers: `bg1`, `icon1`, `text1`, `subtitle1`
   - New layers: `bg2`, `icon2`, `text2`, `subtitle2`
   - `layersChanged = true` ✅
   - Executes **crossfade** transition

2. **Scene 2 → Scene 3:**
   - Old layers: `bg2`, `icon2`, `text2`, `subtitle2`
   - New layers: `bg3`, `icon3`, `text3`, `subtitle3`
   - `layersChanged = true` ✅
   - Executes **slide** transition

3. And so on for all 6 scenes...

## Debug Logs to Watch For

After this fix, you should see:

```
Scene change detected: {
  currentScene: 'scene2',
  hasTransition: true,
  transitionConfig: { type: 'crossfade', duration: 1800, ... },
  hasLifecycleManager: true,
  willUseTransition: true
}
🎬 Using transition: crossfade
Executing transition: { type: 'crossfade', duration: 1800, ... }
Found old layer element: bg1
Found old layer element: icon1
Found old layer element: text1
Found old layer element: subtitle1
Old layer elements: 4
Starting transition with containers: { oldElements: 4, newElements: 4 }
Transition complete
```

## Testing

1. Reload the playground
2. Load "Transition Types" example
3. Create renderer and play
4. Watch the console for transition logs
5. Observe smooth transitions between all 6 scenes!

## Key Takeaway

**Layer IDs must be unique across all scenes in an event** to enable proper scene transitions. Reusing the same IDs prevents the system from detecting scene changes and executing transitions.
