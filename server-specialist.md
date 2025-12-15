# **BACKEND DEVELOPER - Complete Guide**

## **Your Mission:**
Implement the **scoring and statistics tracking system** for players. You'll add the ability to track wins, losses, ties, and create a leaderboard.

---

## **Day 1: Player Statistics System**

### **Phase 1: Understanding Current State (15 minutes)**

#### **What You Already Have:**

```
server/
├── src/
│   ├── config/
│   │   └── database.js           # SQLite connection
│   ├── services/
│   │   └── playerService.js      # createPlayer, getPlayer
│   └── server.js                 # Main server
├── database/
│   └── tictactoe.db
├── .env
├── package.json
└── test-api.http
```

**Current Database Schema:**
```sql
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
)
```

**Existing Functions:**
- `createPlayer(name)` - Creates a player with UUID
- `getPlayer(playerId)` - Gets player by ID
- `getAllPlayers()` - Gets all players

---

### **Phase 2: Update Database Schema (30 minutes)**

#### **Step 1: Add Statistics Columns**

**Update: `server/src/config/database.js`**

Find the table creation code and update it:

```javascript
// server/src/config/database.js
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../../database');
const dbPath = path.join(dbDir, 'tictactoe.db');

// Create folder if doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`📁 Created database directory: ${dbDir}`);
}

console.log(`📁 Database location: ${dbPath}`);

const db = new DatabaseSync(dbPath);

// ✅ UPDATED: Add statistics columns
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  )
`);

console.log('✅ Database initialized with player stats tracking');

export default db;
```

**What Changed:**
- Added `wins INTEGER DEFAULT 0`
- Added `losses INTEGER DEFAULT 0`
- Added `ties INTEGER DEFAULT 0`
- Added `total_games INTEGER DEFAULT 0`

#### **Step 2: Delete Old Database (If Needed)**

If you already have a database without these columns:

```bash
# In terminal
cd server
rm database/tictactoe.db

# Restart server - it will recreate with new schema
npm run dev
```

---

### **Phase 3: Update Player Service (1 hour)**

#### **Step 3: Update createPlayer Function**

**Update: `server/src/services/playerService.js`**

```javascript
// server/src/services/playerService.js
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

/**
 * Create a new player with stats initialized to 0
 */
export function createPlayer(name) {
  const playerId = uuidv4();
  const createdAt = Date.now();

  try {
    db.prepare(`
      INSERT INTO players (id, name, wins, losses, ties, total_games, created_at)
      VALUES (?, ?, 0, 0, 0, 0, ?)
    `).run(playerId, name, createdAt);

    console.log(`✓ Player created: ${name} (${playerId})`);

    return {
      id: playerId,
      name: name,
      wins: 0,
      losses: 0,
      ties: 0,
      totalGames: 0,
      createdAt: createdAt
    };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return { error: 'Player name already exists', status: 400 };
    }
    throw error;
  }
}

/**
 * Get player by ID (with stats)
 */
export function getPlayer(playerId) {
  const player = db.prepare(`
    SELECT id, name, wins, losses, ties, total_games, created_at
    FROM players
    WHERE id = ?
  `).get(playerId);

  if (!player) {
    return { error: 'Player not found', status: 404 };
  }

  return {
    id: player.id,
    name: player.name,
    wins: player.wins,
    losses: player.losses,
    ties: player.ties,
    totalGames: player.total_games,
    createdAt: player.created_at
  };
}

/**
 * Get all players (sorted by wins)
 */
export function getAllPlayers() {
  const players = db.prepare(`
    SELECT id, name, wins, losses, ties, total_games, created_at
    FROM players
    ORDER BY wins DESC, name ASC
  `).all();

  return players.map(p => ({
    id: p.id,
    name: p.name,
    wins: p.wins,
    losses: p.losses,
    ties: p.ties,
    totalGames: p.total_games,
    createdAt: p.created_at
  }));
}

/**
 * ✅ NEW: Update player stats after a game
 * @param {string} playerId
 * @param {string} result - 'win', 'loss', or 'tie'
 */
export function updatePlayerStats(playerId, result) {
  try {
    // Validate result
    if (!['win', 'loss', 'tie'].includes(result)) {
      return { error: 'Invalid result. Must be win, loss, or tie', status: 400 };
    }

    // Determine which column to increment
    let updateColumn;
    if (result === 'win') {
      updateColumn = 'wins';
    } else if (result === 'loss') {
      updateColumn = 'losses';
    } else {
      updateColumn = 'ties';
    }

    // Update the stat AND total_games
    db.prepare(`
      UPDATE players
      SET ${updateColumn} = ${updateColumn} + 1,
          total_games = total_games + 1
      WHERE id = ?
    `).run(playerId);

    console.log(`✓ Updated ${playerId}: ${result}`);

    // Return updated player
    return getPlayer(playerId);
  } catch (error) {
    console.error('Error updating player stats:', error);
    throw error;
  }
}

/**
 * ✅ NEW: Get leaderboard (top players by wins)
 * @param {number} limit - How many players to return (default 10)
 */
export function getLeaderboard(limit = 10) {
  const players = db.prepare(`
    SELECT id, name, wins, losses, ties, total_games
    FROM players
    WHERE total_games > 0
    ORDER BY wins DESC, (wins * 1.0 / total_games) DESC
    LIMIT ?
  `).all(limit);

  return players.map(p => ({
    id: p.id,
    name: p.name,
    wins: p.wins,
    losses: p.losses,
    ties: p.ties,
    totalGames: p.total_games,
    winRate: p.total_games > 0
      ? (p.wins / p.total_games * 100).toFixed(1)
      : '0.0'
  }));
}

/**
 * ✅ NEW: Get player by name (for lookup)
 */
export function getPlayerByName(name) {
  const player = db.prepare(`
    SELECT id, name, wins, losses, ties, total_games, created_at
    FROM players
    WHERE name = ?
  `).get(name);

  if (!player) {
    return { error: 'Player not found', status: 404 };
  }

  return {
    id: player.id,
    name: player.name,
    wins: player.wins,
    losses: player.losses,
    ties: player.ties,
    totalGames: player.total_games,
    createdAt: player.created_at
  };
}
```

---

### **Phase 4: Add New API Routes (45 minutes)**

#### **Step 4: Update Server with Stats Routes**

**Update: `server/src/server.js`**

```javascript
// server/src/server.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import {
  createPlayer,
  getPlayer,
  getAllPlayers,
  updatePlayerStats,    // ✅ NEW
  getLeaderboard,       // ✅ NEW
  getPlayerByName       // ✅ NEW
} from './services/playerService.js';

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(cors({
  origin: NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ==========================================
// ROUTES
// ==========================================

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Tic-Tac-Toe API",
    version: "1.0.0",
    status: "running"
  });
});

// ==========================================
// PLAYER ROUTES
// ==========================================

/**
 * POST /api/players
 * Create a new player
 */
app.post("/api/players", (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Name is required"
      });
    }

    const player = createPlayer(name.trim());

    if (player.error) {
      return res.status(player.status).json({
        success: false,
        error: player.error
      });
    }

    res.status(201).json({
      success: true,
      player
    });
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create player"
    });
  }
});

/**
 * GET /api/players
 * Get all players
 */
app.get("/api/players", (req, res) => {
  try {
    const players = getAllPlayers();
    res.json({
      success: true,
      players,
      count: players.length
    });
  } catch (error) {
    console.error("Error getting players:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get players"
    });
  }
});

/**
 * GET /api/players/:id
 * Get player by ID
 */
app.get("/api/players/:id", (req, res) => {
  try {
    const player = getPlayer(req.params.id);

    if (player.error) {
      return res.status(player.status).json({
        success: false,
        error: player.error
      });
    }

    res.json({
      success: true,
      player
    });
  } catch (error) {
    console.error("Error getting player:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get player"
    });
  }
});

/**
 * ✅ NEW: POST /api/players/:id/stats
 * Update player stats after a game
 */
app.post("/api/players/:id/stats", (req, res) => {
  try {
    const { result } = req.body;

    if (!result || !['win', 'loss', 'tie'].includes(result)) {
      return res.status(400).json({
        success: false,
        error: "Result must be 'win', 'loss', or 'tie'"
      });
    }

    const player = updatePlayerStats(req.params.id, result);

    if (player.error) {
      return res.status(player.status).json({
        success: false,
        error: player.error
      });
    }

    res.json({
      success: true,
      player,
      message: `Player stats updated: ${result}`
    });
  } catch (error) {
    console.error("Error updating stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update player stats"
    });
  }
});

/**
 * ✅ NEW: GET /api/leaderboard
 * Get top players by wins
 */
app.get("/api/leaderboard", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = getLeaderboard(limit);

    res.json({
      success: true,
      leaderboard,
      count: leaderboard.length
    });
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get leaderboard"
    });
  }
});

/**
 * ✅ NEW: GET /api/players/name/:name
 * Get player by name
 */
app.get("/api/players/name/:name", (req, res) => {
  try {
    const player = getPlayerByName(req.params.name);

    if (player.error) {
      return res.status(player.status).json({
        success: false,
        error: player.error
      });
    }

    res.json({
      success: true,
      player
    });
  } catch (error) {
    console.error("Error getting player by name:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get player"
    });
  }
});

// ==========================================
// ERROR HANDLERS
// ==========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for http://localhost:5173`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  POST   /api/players`);
  console.log(`  GET    /api/players`);
  console.log(`  GET    /api/players/:id`);
  console.log(`  GET    /api/players/name/:name`);
  console.log(`  POST   /api/players/:id/stats`);
  console.log(`  GET    /api/leaderboard\n`);
});
```

---

### **Phase 5: Create Comprehensive Tests (30 minutes)**

#### **Step 5: Update Test File**

**Update: `server/test-api.http`**

```http
### ==========================================
### PLAYER CREATION & RETRIEVAL
### ==========================================

### Health Check
GET http://localhost:3000/

### Create Player - Ryan
# @name createRyan
POST http://localhost:3000/api/players
Content-Type: application/json

{
  "name": "Ryan"
}

### Create Player - Alice
# @name createAlice
POST http://localhost:3000/api/players
Content-Type: application/json

{
  "name": "Alice"
}

### Create Player - Bob
POST http://localhost:3000/api/players
Content-Type: application/json

{
  "name": "Bob"
}

### Get All Players
GET http://localhost:3000/api/players

### Get Player by ID (replace with actual ID from create response)
GET http://localhost:3000/api/players/PLAYER-ID-HERE

### Get Player by Name
GET http://localhost:3000/api/players/name/Ryan

### ==========================================
### STATS TRACKING
### ==========================================

### Ryan Wins (replace with Ryan's ID)
POST http://localhost:3000/api/players/RYAN-ID-HERE/stats
Content-Type: application/json

{
  "result": "win"
}

### Ryan Wins Again
POST http://localhost:3000/api/players/RYAN-ID-HERE/stats
Content-Type: application/json

{
  "result": "win"
}

### Ryan Loses
POST http://localhost:3000/api/players/RYAN-ID-HERE/stats
Content-Type: application/json

{
  "result": "loss"
}

### Alice Wins
POST http://localhost:3000/api/players/ALICE-ID-HERE/stats
Content-Type: application/json

{
  "result": "win"
}

### Alice Ties
POST http://localhost:3000/api/players/ALICE-ID-HERE/stats
Content-Type: application/json

{
  "result": "tie"
}

### ==========================================
### LEADERBOARD
### ==========================================

### Get Top 10 Leaderboard
GET http://localhost:3000/api/leaderboard

### Get Top 5 Leaderboard
GET http://localhost:3000/api/leaderboard?limit=5

### ==========================================
### ERROR TESTING
### ==========================================

### Try to Create Player with No Name (should fail)
POST http://localhost:3000/api/players
Content-Type: application/json

{}

### Try to Create Duplicate Player (should fail)
POST http://localhost:3000/api/players
Content-Type: application/json

{
  "name": "Ryan"
}

### Try Invalid Stats Result (should fail)
POST http://localhost:3000/api/players/PLAYER-ID-HERE/stats
Content-Type: application/json

{
  "result": "invalid"
}

### Try to Get Non-existent Player (should fail)
GET http://localhost:3000/api/players/fake-id-12345
```

---

### **Phase 6: Testing Your Work (45 minutes)**

#### **Step 6: Manual Testing Sequence**

**Test Scenario 1: Create Players**
```
1. POST /api/players with name "Ryan"
   ✅ Should return: id, name, wins: 0, losses: 0, ties: 0

2. POST /api/players with name "Alice"
   ✅ Should return: same structure

3. POST /api/players with name "Ryan" again
   ❌ Should return: 400 error "Player name already exists"
```

**Test Scenario 2: Update Stats**
```
1. Copy Ryan's ID from creation response
2. POST /api/players/{ryan-id}/stats with result: "win"
   ✅ Should return: wins: 1, total_games: 1

3. POST same endpoint with result: "win" again
   ✅ Should return: wins: 2, total_games: 2

4. POST same endpoint with result: "loss"
   ✅ Should return: wins: 2, losses: 1, total_games: 3
```

**Test Scenario 3: Leaderboard**
```
1. Create multiple players
2. Give them different win counts
3. GET /api/leaderboard
   ✅ Should return: players sorted by wins (highest first)
   ✅ Should include: winRate calculated correctly
```

#### **Step 7: Create Test Results Document**

**Create: `BACKEND_TEST_RESULTS.md`**

```markdown
# Backend Testing Results - Day 1

## Test Date: [Date]
## Tester: [Your Name]

## Feature 1: Player Creation
- [x] Can create player with unique name
- [x] Returns player with all stats initialized to 0
- [x] Rejects duplicate player names
- [x] Rejects empty names
- [x] Returns proper error messages

## Feature 2: Stats Tracking
- [x] Can record wins
- [x] Can record losses
- [x] Can record ties
- [x] Total games increments correctly
- [x] Stats persist after server restart

## Feature 3: Leaderboard
- [x] Returns players sorted by wins
- [x] Calculates win rate correctly
- [x] Respects limit parameter
- [x] Only shows players with games played

## Feature 4: Player Lookup
- [x] Can get player by ID
- [x] Can get player by name
- [x] Returns 404 for non-existent players
- [x] Returns all player stats

## API Response Times
- Create Player: ~10ms
- Update Stats: ~8ms
- Get Leaderboard: ~15ms

## Known Issues
- None

## Ready for Integration
- [x] All tests passing
- [x] Code documented
- [x] Error handling complete
- [x] Ready to share with team
```

---

### **Phase 7: Prepare for Integration (30 minutes)**

#### **Step 8: Document Your API**

**Create: `API_DOCUMENTATION.md`**

```markdown
# Backend API Documentation

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Create Player
**POST** `/api/players`

**Request:**
```json
{
  "name": "Ryan"
}
```

**Response (201):**
```json
{
  "success": true,
  "player": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ryan",
    "wins": 0,
    "losses": 0,
    "ties": 0,
    "totalGames": 0,
    "createdAt": 1702310400000
  }
}
```

**Errors:**
- 400: Name is required
- 400: Player name already exists

---

### 2. Get All Players
**GET** `/api/players`

**Response (200):**
```json
{
  "success": true,
  "players": [
    {
      "id": "...",
      "name": "Ryan",
      "wins": 5,
      "losses": 2,
      "ties": 1,
      "totalGames": 8,
      "createdAt": 1702310400000
    }
  ],
  "count": 1
}
```

---

### 3. Get Player by ID
**GET** `/api/players/:id`

**Response (200):**
```json
{
  "success": true,
  "player": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ryan",
    "wins": 5,
    "losses": 2,
    "ties": 1,
    "totalGames": 8,
    "createdAt": 1702310400000
  }
}
```

**Errors:**
- 404: Player not found

---

### 4. Get Player by Name
**GET** `/api/players/name/:name`

**Response (200):**
Same as Get Player by ID

**Errors:**
- 404: Player not found

---

### 5. Update Player Stats
**POST** `/api/players/:id/stats`

**Request:**
```json
{
  "result": "win"
}
```
*Valid results: "win", "loss", "tie"*

**Response (200):**
```json
{
  "success": true,
  "player": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ryan",
    "wins": 6,
    "losses": 2,
    "ties": 1,
    "totalGames": 9,
    "createdAt": 1702310400000
  },
  "message": "Player stats updated: win"
}
```

**Errors:**
- 400: Result must be 'win', 'loss', or 'tie'
- 404: Player not found

---

### 6. Get Leaderboard
**GET** `/api/leaderboard?limit=10`

**Query Parameters:**
- `limit` (optional): Number of players to return (default: 10)

**Response (200):**
```json
{
  "success": true,
  "leaderboard": [
    {
      "id": "...",
      "name": "Ryan",
      "wins": 15,
      "losses": 5,
      "ties": 2,
      "totalGames": 22,
      "winRate": "68.2"
    }
  ],
  "count": 1
}
```

## Frontend Integration Notes

### CORS
Server accepts requests from: `http://localhost:5173`

### Example Fetch Call
```javascript
// Create player
const response = await fetch('http://localhost:3000/api/players', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'Ryan' })
});
const data = await response.json();

if (data.success) {
  console.log('Player created:', data.player);
}
```

### Update Stats After Game
```javascript
// After player wins
await fetch(`http://localhost:3000/api/players/${playerId}/stats`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ result: 'win' })
});
```
```

---

#### **Step 9: Share with Team**

**Checklist before sharing:**
- [ ] All tests pass
- [ ] API documentation complete
- [ ] Code has comments
- [ ] `.env.example` file created
- [ ] Database schema documented
- [ ] Ready to push to Git

**Push your code:**
```bash
git add .
git commit -m "feat: Add player stats tracking and leaderboard"
git push origin feature/backend-scoring
```

**Message to Git Manager:**
```
Backend scoring system complete! ✅

Features implemented:
- Player stats (wins/losses/ties)
- Stats update endpoint
- Leaderboard with win rate
- Lookup by name or ID

All endpoints tested and documented.
Ready for integration!

Files changed:
- server/src/config/database.js (added stats columns)
- server/src/services/playerService.js (stats functions)
- server/src/server.js (new routes)
- server/test-api.http (comprehensive tests)
- API_DOCUMENTATION.md (for frontend dev)

Next: Need frontend to call these endpoints!
```

---

## **Day 1 Deliverables Checklist**

### **Code Complete:**
- [x] Database schema updated with stats columns
- [x] `updatePlayerStats()` function working
- [x] `getLeaderboard()` function working
- [x] All new routes added to server
- [x] CORS configured for frontend

### **Testing Complete:**
- [x] Can create players with stats
- [x] Can update wins/losses/ties
- [x] Leaderboard sorts correctly
- [x] All error cases handled
- [x] Test file comprehensive

### **Documentation Complete:**
- [x] API documentation written
- [x] Test results documented
- [x] Code commented
- [x] Integration notes for frontend

### **Ready for Integration:**
- [x] Code pushed to feature branch
- [x] Git manager notified
- [x] Frontend developer has API docs
- [x] Ready to assist with integration

---

**That's the complete Backend Developer guide for Day 1!**