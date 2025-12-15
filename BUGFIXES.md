# Bug Fixes Documentation

## Overview
This document tracks all bugs discovered and fixed in the Tic-Tac-Toe Full-Stack Project.

---

## Bug #1: Infinite Loop on Win Condition

**Date Fixed:** 2025-12-15

**Severity:** Critical

**Status:** ✅ Fixed

### Description
When a player won the game, an infinite loop occurred that continuously called the stats update API endpoint, causing the browser to freeze or slow down significantly.

### Root Cause
In `client/src/components/Game/Game.jsx`, the useEffect hook that updates player stats was using state variables (`isUpdatingStats` and `statsUpdated`) to track whether stats had been updated. The problem was:

1. Game ends → `gameOver` becomes true
2. useEffect runs and updates stats via API
3. API returns updated player object → `setPlayer(data.player)` is called
4. Player object reference changes → triggers useEffect again (because `player` was in dependency array)
5. Loop continues infinitely

### Original Code (Buggy)
```javascript
export default function Game() {
  const [gameState, setGameState] = useState(createInitialGameState());
  const [player, setPlayer] = useState(null);
  const [isUpdatingStats, setIsUpdatingStats] = useState(false);
  const [statsUpdated, setStatsUpdated] = useState(false);

  useEffect(() => {
    const updateStats = async () => {
      if (gameOver && player && !isUpdatingStats && !statsUpdated) {
        setIsUpdatingStats(true);

        try {
          // Update stats...
          if (response.ok) {
            const data = await response.json();
            setPlayer(data.player);  // ❌ Causes re-render
            setStatsUpdated(true);   // ❌ Causes re-render
          }
        } finally {
          setIsUpdatingStats(false);  // ❌ Causes re-render
        }
      }
    };

    updateStats();
  }, [gameOver, winner, player?.id, statsUpdated]);  // ❌ Bad dependencies
}
```

### Fixed Code
```javascript
import { useState, useEffect, useRef } from "react";

export default function Game() {
  const [gameState, setGameState] = useState(createInitialGameState());
  const [player, setPlayer] = useState(null);
  const hasUpdatedStatsRef = useRef(false);  // ✅ Use ref instead of state

  const { board, currentPlayer, gameOver, winner, winningCombo } = gameState;

  const handleReset = () => {
    setGameState(createInitialGameState());
    hasUpdatedStatsRef.current = false;  // ✅ Reset ref on new game
  };

  useEffect(() => {
    // ✅ Early return if conditions not met
    if (!gameOver || !player || hasUpdatedStatsRef.current) {
      return;
    }

    const updateStats = async () => {
      hasUpdatedStatsRef.current = true;  // ✅ Set immediately, no re-render

      try {
        let result;
        if (winner === 'DRAW') {
          result = 'tie';
        } else if (winner === 'X') {
          result = 'win';
        } else {
          result = 'loss';
        }

        const response = await fetch(`http://localhost:3000/api/players/${player.id}/stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ result })
        });

        if (response.ok) {
          const data = await response.json();
          setPlayer(data.player);  // ✅ OK now, ref prevents re-run
          console.log('Stats updated:', data.player);
        }
      } catch (error) {
        console.error('Failed to update stats:', error);
        hasUpdatedStatsRef.current = false;  // ✅ Allow retry on error
      }
    };

    updateStats();
  }, [gameOver, winner, player]);  // ✅ Simple dependencies
}
```

### Why the Fix Works

1. **useRef instead of state:**
   - Refs don't trigger re-renders when changed
   - `hasUpdatedStatsRef.current = true` doesn't cause the component to re-render
   - Perfect for tracking "side effect already happened" scenarios

2. **Early return pattern:**
   - Checks all conditions upfront
   - Returns early if stats already updated
   - Cleaner, more readable code

3. **Simpler dependency array:**
   - `[gameOver, winner, player]` instead of `[gameOver, winner, player?.id, statsUpdated]`
   - No ref in dependencies (refs are stable across renders)
   - Player object can update without triggering infinite loop

4. **Error recovery:**
   - On error, resets ref to `false` to allow retry
   - Won't leave game in broken state if API fails

### Testing
After the fix, verified:
- ✅ Stats update exactly once when game ends
- ✅ No infinite loops
- ✅ Browser console shows single "Stats updated" log
- ✅ Network tab shows single POST request
- ✅ Stats correctly reflected in UI
- ✅ New game button resets everything properly
- ✅ Multiple games work correctly

### Important Note: Debugging Process
During debugging, we discovered the infinite loop was actually caused by a **stuck browser tab** that was making repeated requests to the server. The original code issue existed, but the persistent loop was due to:
1. Multiple browser tabs/windows open
2. One tab in a broken state continuously calling the API
3. Even after fixing the code, the stuck tab kept looping

**Lesson:** When debugging infinite loops involving API calls, always:
- Close all browser tabs completely
- Clear browser cache and localStorage
- Test with only one fresh tab
- Check the browser's Network tab to see actual request patterns

### Files Modified
- `client/src/components/Game/Game.jsx` - Main fix
- `front-end-specialist.md` - Updated documentation
- `final-presentation-specification.md` - Added to common issues section

### Lessons Learned
1. **State vs Refs:** Use refs for values that don't need to trigger re-renders
2. **Dependency Arrays:** Be careful with object/array dependencies in useEffect
3. **Early Returns:** Guard clauses at the start of effects are cleaner
4. **Side Effect Tracking:** Refs are perfect for "did this happen yet?" flags

### Related Documentation
- React Hooks: [useRef](https://react.dev/reference/react/useRef)
- React Hooks: [useEffect](https://react.dev/reference/react/useEffect)
- Guide: front-end-specialist.md lines 164-312

---

## Future Known Issues

### None currently reported

---

## How to Report Bugs

If you find a bug, please create an issue with:
1. **Title:** Brief description of the bug
2. **Steps to reproduce:** Exact steps to trigger the bug
3. **Expected behavior:** What should happen
4. **Actual behavior:** What actually happens
5. **Environment:** Browser, OS, Node version
6. **Screenshots/Logs:** If applicable
7. **Proposed fix:** If you have ideas

---

## Bug Fix Checklist

When fixing a bug:
- [ ] Identify root cause
- [ ] Write fix
- [ ] Test fix thoroughly
- [ ] Update documentation
- [ ] Add to this BUGFIXES.md file
- [ ] Update relevant specialist guides
- [ ] Commit with clear message
- [ ] Inform team members

---

**Last Updated:** 2025-12-15
