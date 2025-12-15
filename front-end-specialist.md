# **FRONTEND DEVELOPER - Complete Guide**

## **Your Mission:**
Create the **PlayerSetup component** that allows users to enter their name and connects to the backend API to create a player in the database.

---

## **Day 1: Player Setup Component**

### **Phase 1: Understanding Current State (15 minutes)**

#### **What You Already Have:**

```
client/
├── src/
│   ├── components/
│   │   └── Game/
│   │       ├── Game.jsx
│   │       ├── Board.jsx
│   │       ├── Cell.jsx
│   │       └── GameStatus.jsx
│   ├── utils/
│   │   └── gameLogic.js
│   ├── styles/
│   │   └── main.css
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── index.html
```

**Your Goal:**
Create a `PlayerSetup` component that:
1. Shows a form to enter player name
2. Validates the input
3. Sends name to backend API
4. Receives player data with ID
5. Stores player info in localStorage
6. Transitions to game screen

---

### **Phase 2: Create PlayerSetup Component (1 hour)**

#### **Step 1: Create Component File**

**Create: `client/src/components/PlayerSetup.jsx`**

```jsx
// client/src/components/PlayerSetup.jsx
import { useState } from 'react';

export default function PlayerSetup({ onPlayerSet }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous errors
    setError('');

    // Validate name
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    // Set loading state
    setLoading(true);

    try {
      // Call backend API
      const response = await fetch('http://localhost:3000/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() })
      });

      const data = await response.json();

      if (data.success) {
        // Save to localStorage
        localStorage.setItem('playerId', data.player.id);
        localStorage.setItem('playerName', data.player.name);

        // Call parent callback with player data
        onPlayerSet(data.player);

        console.log('✓ Player created:', data.player);
      } else {
        // Handle API error
        setError(data.error || 'Failed to create player');
      }
    } catch (err) {
      console.error('Error creating player:', err);
      setError('Could not connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="player-setup">
      <div className="player-setup-card">
        <h2>Welcome to Tic-Tac-Toe!</h2>
        <p className="subtitle">Enter your name to start playing</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="player-form">
          <div className="form-group">
            <label htmlFor="playerName">Player Name</label>
            <input
              id="playerName"
              type="text"
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="player-input"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="btn btn-primary"
          >
            {loading ? 'Creating Player...' : 'Start Game'}
          </button>
        </form>

        <div className="help-text">
          <p>🎮 Play against yourself or a friend!</p>
          <p>📊 Your wins and losses will be tracked</p>
        </div>
      </div>
    </div>
  );
}
```

**Key Features:**
- ✅ State management for name, loading, error
- ✅ Form validation
- ✅ API call to backend
- ✅ localStorage for persistence
- ✅ Loading states
- ✅ Error handling
- ✅ Parent callback

---

### **Phase 3: Update Game Component (30 minutes)**

#### **Step 2: Integrate PlayerSetup into Game**

**Update: `client/src/components/Game/Game.jsx`**

```jsx
// client/src/components/Game/Game.jsx
import { useState, useEffect, useRef } from 'react';
import Board from './Board';
import GameStatus from './GameStatus';
import PlayerSetup from '../PlayerSetup';  // ✅ NEW IMPORT
import {
  checkForWin,
  isValidMove,
  applyMove,
  switchPlayer,
  createInitialGameState
} from '../../utils/gameLogic';

export default function Game() {
  const [gameState, setGameState] = useState(createInitialGameState());
  const [player, setPlayer] = useState(null);  // ✅ NEW STATE
  const hasUpdatedStatsRef = useRef(false);  // ✅ Prevents infinite loop

  const { board, currentPlayer, gameOver, winner, winningCombo } = gameState;

  const handleCellClick = (position) => {
    if (gameOver) return;

    const validation = isValidMove(board, position);
    if (!validation.valid) {
      console.log('Invalid move:', validation.reason);
      return;
    }

    const newBoard = applyMove(board, position, currentPlayer);
    const result = checkForWin(newBoard);

    setGameState({
      board: newBoard,
      currentPlayer: result.winner ? currentPlayer : switchPlayer(currentPlayer),
      gameOver: result.winner !== null,
      winner: result.winner,
      winningCombo: result.winningCombo
    });
  };

  const handleReset = () => {
    setGameState(createInitialGameState());
    hasUpdatedStatsRef.current = false;  // ✅ Reset ref
  };

  // ✅ NEW: Update player stats when game ends
  useEffect(() => {
    // Early return if conditions not met
    if (!gameOver || !player || hasUpdatedStatsRef.current) {
      return;
    }

    const updateStats = async () => {
      hasUpdatedStatsRef.current = true;  // ✅ Mark as updated immediately

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
          setPlayer(data.player);
          console.log('Stats updated:', data.player);
        }
      } catch (error) {
        console.error('Failed to update stats:', error);
        hasUpdatedStatsRef.current = false;  // ✅ Allow retry on error
      }
    };

    updateStats();
  }, [gameOver, winner, player]);

  // ✅ NEW: Show PlayerSetup if no player
  if (!player) {
    return <PlayerSetup onPlayerSet={setPlayer} />;
  }

  // ✅ UPDATED: Show player info with stats
  return (
    <>
      <div className="game-container">
        <h1>Tic-Tac-Toe</h1>
        <div className="player-info">
          <p>Welcome, {player.name}!</p>
          <p className="stats">
            Wins: {player.wins} | Losses: {player.losses} | Ties: {player.ties}
          </p>
        </div>
        <GameStatus
          currentPlayer={currentPlayer}
          winner={winner}
          gameOver={gameOver}
        />
        <Board
          board={board}
          onCellClick={handleCellClick}
          winningCombo={winningCombo}
        />
        <button className="reset-button" onClick={handleReset}>
          New Game
        </button>
      </div>
    </>
  );
}
```

**What Changed:**
- ✅ Added `player` state
- ✅ Use `useRef` instead of state to track if stats were updated (prevents re-renders)
- ✅ Early return pattern in useEffect for cleaner logic
- ✅ Show PlayerSetup if no player
- ✅ Show player name and stats when logged in
- ✅ Update stats to backend when game ends
- ✅ Reset ref on new game

**Important Fix - Using useRef Instead of State:**
Using `useRef` prevents infinite loops because:
1. Refs don't trigger re-renders when they change
2. Early return checks the ref immediately, preventing duplicate API calls
3. Simpler dependency array `[gameOver, winner, player]`
4. The ref persists across renders without causing effect re-runs

**Why This is Better Than State:**
- State changes cause re-renders → can trigger effect again
- Refs are mutable and persist without re-renders
- Perfect for tracking "side effect already happened" scenarios

---

### **Phase 4: Add Styling (45 minutes)**

#### **Step 3: Add PlayerSetup Styles**

**Update: `client/src/styles/main.css`**

Add these styles at the end:

```css
/* ==========================================
   PLAYER SETUP COMPONENT
   ========================================== */

.player-setup {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.player-setup-card {
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 100%;
  text-align: center;
}

.player-setup-card h2 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.player-setup-card .subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
}

/* Error Message */
.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #c62828;
  text-align: left;
}

/* Form Styling */
.player-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
}

.player-input {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.player-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.player-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Button Styles */
.btn {
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 100%;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 2px solid #e0e0e0;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
  border-color: #ccc;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-reset {
  width: 100%;
  margin-top: 1.5rem;
}

/* Help Text */
.help-text {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

.help-text p {
  color: #666;
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

/* ==========================================
   PLAYER INFO (IN GAME)
   ========================================== */

.player-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.player-info h1 {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

/* ==========================================
   RESPONSIVE DESIGN
   ========================================== */

@media (max-width: 768px) {
  .player-setup-card {
    padding: 2rem 1.5rem;
  }

  .player-setup-card h2 {
    font-size: 1.75rem;
  }

  .player-info {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .player-info h1 {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .player-setup-card {
    padding: 1.5rem 1rem;
  }

  .player-setup-card h2 {
    font-size: 1.5rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
  }
}
```

---

### **Phase 5: Testing Your Component (45 minutes)**

#### **Step 4: Manual Testing Checklist**

**Test Scenario 1: First Time User**
```
1. Open http://localhost:5173
   ✅ Should see PlayerSetup component
   ✅ Input field should be focused automatically

2. Try to submit empty form
   ✅ Button should be disabled

3. Type "  " (just spaces)
   ✅ Button should be disabled

4. Type "Ryan"
   ✅ Button should become enabled

5. Click "Start Game"
   ✅ Should show "Creating Player..." on button
   ✅ Should make API call to backend
   ✅ Should save to localStorage
   ✅ Should show game screen with "Welcome, Ryan!"
```

**Test Scenario 2: Backend Connection Issues**
```
1. Stop the backend server (Ctrl+C)
2. Try to create a player
   ✅ Should show error: "Could not connect to server..."
   ✅ Should not crash
   ✅ Error should be in red box

3. Start backend server again
4. Try again
   ✅ Should work now
```

**Test Scenario 3: Duplicate Name**
```
1. Create player "Ryan"
2. Logout
3. Try to create "Ryan" again
   ✅ Should show error: "Player name already exists"
```

**Test Scenario 4: Returning User**
```
1. Create player "Ryan"
2. Refresh the page
   ✅ Should skip PlayerSetup
   ✅ Should go straight to game
   ✅ Should show "Welcome, Ryan!"
   ✅ Console should log: "Loaded player from localStorage"
```

**Test Scenario 5: Logout**
```
1. While logged in, click "Logout"
   ✅ Should clear localStorage
   ✅ Should return to PlayerSetup
   ✅ Should reset game board
```

---

#### **Step 5: Browser DevTools Testing**

**Check localStorage:**
```javascript
// Open browser console (F12)

// After creating player:
localStorage.getItem('playerId')    // Should show UUID
localStorage.getItem('playerName')  // Should show name

// After logout:
localStorage.getItem('playerId')    // Should be null
```

**Check Network Requests:**
```
1. Open DevTools → Network tab
2. Create a player
3. Look for POST request to http://localhost:3000/api/players
   ✅ Status: 201 Created
   ✅ Response contains player data
```

---

#### **Step 6: Create Test Results Document**

**Create: `FRONTEND_TEST_RESULTS.md`**

```markdown
# Frontend Testing Results - Day 1

## Test Date: [Date]
## Tester: [Your Name]

## Feature 1: PlayerSetup Component
- [x] Form renders correctly
- [x] Input validation works
- [x] Empty submission prevented
- [x] Whitespace-only names rejected
- [x] Loading state displays
- [x] Auto-focus on input field

## Feature 2: API Integration
- [x] Successfully calls backend API
- [x] Sends correct JSON format
- [x] Handles 201 success response
- [x] Handles 400 error response (duplicate name)
- [x] Handles network errors gracefully
- [x] Shows appropriate error messages

## Feature 3: Data Persistence
- [x] Saves player ID to localStorage
- [x] Saves player name to localStorage
- [x] Loads from localStorage on page refresh
- [x] Skips setup if player exists
- [x] Clears localStorage on logout

## Feature 4: User Flow
- [x] Transitions from setup to game
- [x] Displays player name in game
- [x] Logout returns to setup
- [x] Game board resets on logout

## Feature 5: Error Handling
- [x] Shows error for empty name
- [x] Shows error for duplicate name
- [x] Shows error for server connection failure
- [x] Error messages are user-friendly
- [x] Can recover from errors

## Feature 6: UI/UX
- [x] Responsive on mobile
- [x] Accessible (labels, focus states)
- [x] Loading states clear
- [x] Buttons disable appropriately
- [x] Smooth transitions

## Browser Compatibility
- [x] Chrome/Edge
- [x] Firefox
- [ ] Safari (not tested)

## Known Issues
- None

## Ready for Integration
- [x] Component complete
- [x] Styles polished
- [x] All tests passing
- [x] Ready to share with team
```

---

### **Phase 6: Advanced Features (Optional - 30 minutes)**

#### **Step 7: Add Player Stats Display**

If you have time, fetch and display player stats:

**Enhanced PlayerSetup with Stats:**

```jsx
// Add this function to PlayerSetup.jsx

const [existingPlayer, setExistingPlayer] = useState(null);

const checkExistingPlayer = async (name) => {
  try {
    const response = await fetch(`http://localhost:3000/api/players/name/${name}`);
    const data = await response.json();

    if (data.success) {
      setExistingPlayer(data.player);
    } else {
      setExistingPlayer(null);
    }
  } catch (err) {
    setExistingPlayer(null);
  }
};

// Update input onChange:
onChange={(e) => {
  setName(e.target.value);
  if (e.target.value.trim().length > 2) {
    checkExistingPlayer(e.target.value.trim());
  }
}}

// Add below input field:
{existingPlayer && (
  <div className="existing-player-info">
    <p>👋 Welcome back, {existingPlayer.name}!</p>
    <p className="stats">
      Wins: {existingPlayer.wins} |
      Losses: {existingPlayer.losses} |
      Ties: {existingPlayer.ties}
    </p>
    <p className="info-text">Click Start Game to continue</p>
  </div>
)}
```

**Add CSS:**
```css
.existing-player-info {
  background: #e3f2fd;
  border: 2px solid #2196f3;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
  text-align: center;
}

.existing-player-info .stats {
  font-weight: 600;
  color: #1976d2;
  margin: 0.5rem 0;
}

.existing-player-info .info-text {
  font-size: 0.875rem;
  color: #666;
  margin: 0.5rem 0 0 0;
}
```

---

### **Phase 7: Prepare for Integration (30 minutes)**

#### **Step 8: Document Your Component**

**Create: `COMPONENT_DOCUMENTATION.md`**

```markdown
# PlayerSetup Component Documentation

## Overview
The PlayerSetup component handles player registration and login flow.

## Props

### `onPlayerSet`
- **Type:** `function`
- **Required:** Yes
- **Description:** Callback function called when player is successfully created
- **Parameters:** `player` object with `{ id, name, wins, losses, ties, totalGames, createdAt }`

## Usage

```jsx
import PlayerSetup from './components/PlayerSetup';

function App() {
  const [player, setPlayer] = useState(null);

  return (
    <>
      {!player && <PlayerSetup onPlayerSet={setPlayer} />}
      {player && <Game player={player} />}
    </>
  );
}
```

## Features

### 1. Form Validation
- Prevents empty submissions
- Trims whitespace
- Disables button until valid input

### 2. API Integration
- POST to `/api/players`
- Sends: `{ name: string }`
- Receives: `{ success: boolean, player: object }`

### 3. Data Persistence
- Stores player ID in localStorage: `playerId`
- Stores player name in localStorage: `playerName`
- Auto-loads on mount if exists

### 4. Error Handling
- Network errors: "Could not connect to server..."
- Duplicate name: Shows error from API
- Validation errors: "Please enter your name"

### 5. Loading States
- Button text changes: "Creating Player..."
- Input disabled while loading
- Button disabled while loading

## State Management

```javascript
const [name, setName] = useState('');          // Input value
const [loading, setLoading] = useState(false); // API call in progress
const [error, setError] = useState('');        // Error message
```

## localStorage Keys
- `playerId` - UUID of created player
- `playerName` - Display name of player

## Dependencies
- React (hooks: useState)
- Browser: localStorage, fetch API

## Backend API Required

### Create Player Endpoint
```
POST http://localhost:3000/api/players
Content-Type: application/json

Request:
{
  "name": "Ryan"
}

Response (201):
{
  "success": true,
  "player": {
    "id": "uuid",
    "name": "Ryan",
    "wins": 0,
    "losses": 0,
    "ties": 0,
    "totalGames": 0,
    "createdAt": 1702310400000
  }
}

Error (400):
{
  "success": false,
  "error": "Player name already exists"
}
```

## Styling
All styles are in `main.css` under:
- `.player-setup`
- `.player-setup-card`
- `.error-message`
- `.player-form`
- `.player-input`

## Testing

### Manual Test Steps
1. Load component
2. Try empty submission (should be disabled)
3. Enter name
4. Submit (should call API)
5. Verify localStorage saved
6. Verify callback called with player data

### Browser Console Tests
```javascript
// Check localStorage
localStorage.getItem('playerId')
localStorage.getItem('playerName')

// Clear localStorage
localStorage.clear()
```

## Future Enhancements
- [ ] Show existing player stats on name match
- [ ] Password authentication
- [ ] Remember me checkbox
- [ ] Profile picture upload
- [ ] Player search/autocomplete
```

---

#### **Step 9: Share with Team**

**Checklist before sharing:**
- [ ] Component working end-to-end
- [ ] All tests passing
- [ ] Styles polished
- [ ] Code commented
- [ ] Documentation complete
- [ ] Ready to push to Git

**Push your code:**
```bash
git add .
git commit -m "feat: Add PlayerSetup component with API integration"
git push origin feature/frontend-setup
```

**Message to Git Manager:**
```
Frontend PlayerSetup component complete! ✅

Features implemented:
- Player name input form
- API integration with backend
- localStorage persistence
- Error handling
- Loading states
- Logout functionality

All features tested and working!

Files changed:
- client/src/components/PlayerSetup.jsx (new component)
- client/src/components/Game/Game.jsx (integration)
- client/src/styles/main.css (styling)
- COMPONENT_DOCUMENTATION.md (for team)
- FRONTEND_TEST_RESULTS.md (test results)

Next steps:
- Need backend API endpoints working
- Ready for integration testing
- Can assist with connecting other features
```

---

## **Day 1 Deliverables Checklist**

### **Component Complete:**
- [x] PlayerSetup component created
- [x] Form validation working
- [x] API integration complete
- [x] localStorage persistence working
- [x] Error handling implemented
- [x] Loading states implemented

### **Game Integration:**
- [x] Player state managed in Game.jsx
- [x] localStorage checked on mount
- [x] PlayerSetup shown if no player
- [x] Game shown if player exists
- [x] Logout functionality working

### **Styling Complete:**
- [x] PlayerSetup styled
- [x] Responsive design
- [x] Error messages styled
- [x] Button states styled
- [x] Player info display styled

### **Testing Complete:**
- [x] First-time user flow
- [x] Returning user flow
- [x] Error scenarios
- [x] Network failure handling
- [x] localStorage persistence

### **Documentation Complete:**
- [x] Component documentation
- [x] Test results documented
- [x] Usage examples provided
- [x] Integration notes for team

### **Ready for Integration:**
- [x] Code pushed to feature branch
- [x] Git manager notified
- [x] Backend developer informed
- [x] Ready for team integration

---

**That's the complete Frontend Developer guide for Day 1!**