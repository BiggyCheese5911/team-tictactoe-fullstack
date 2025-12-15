# **PART 4: Integration Checklist & Day 2 Guide**

---

## **END OF DAY 1: Integration Checklist**

### **Git Manager: Pre-Integration Checklist**

Before merging branches, verify each team member has completed:

#### **Backend Developer Deliverables:**
- [ ] Database schema updated with stats columns
- [ ] `updatePlayerStats()` function working
- [ ] `getLeaderboard()` function working
- [ ] All routes added to server.js
- [ ] CORS configured for http://localhost:5173
- [ ] Test file (`test-api.http`) updated
- [ ] API documentation created
- [ ] Code pushed to `feature/backend-scoring`

#### **Frontend Developer Deliverables:**
- [ ] PlayerSetup component created
- [ ] Game.jsx integrated with PlayerSetup
- [ ] localStorage persistence working
- [ ] Error handling implemented
- [ ] Styling complete and responsive
- [ ] Component documentation created
- [ ] Code pushed to `feature/frontend-setup`

---

## **INTEGRATION PROCESS (Git Manager Leads)**

### **Step 1: Merge Backend First**

```bash
# Switch to main
git checkout main
git pull origin main

# Merge backend
git merge feature/backend-scoring

# If conflicts, resolve them
# git add [resolved-files]
# git commit

# Push
git push origin main
```

---

### **Step 2: Test Backend Independently**

```bash
cd server
npm install
npm run dev
```

**In separate terminal, test with `test-api.http`:**

```http
### Quick Backend Validation
POST http://localhost:3000/api/players
Content-Type: application/json

{
  "name": "TestPlayer"
}

### Should return 201 with player data including stats
```

**Expected Response:**
```json
{
  "success": true,
  "player": {
    "id": "some-uuid",
    "name": "TestPlayer",
    "wins": 0,
    "losses": 0,
    "ties": 0,
    "totalGames": 0,
    "createdAt": 1702310400000
  }
}
```

✅ **Backend working? Continue.**

---

### **Step 3: Merge Frontend**

```bash
# Make sure backend server is still running
git checkout main
git merge feature/frontend-setup

# Resolve conflicts if any
# git add [resolved-files]
# git commit

# Push
git push origin main
```

---

### **Step 4: Full Integration Test**

```bash
# Terminal 1: Backend
cd server
npm install
npm run dev
# Should show: Server running on http://localhost:3000

# Terminal 2: Frontend
cd client
npm install
npm run dev
# Should show: Local: http://localhost:5173
```

---

### **Step 5: End-to-End Testing**

#### **Test Flow 1: Create New Player**

1. Open browser: `http://localhost:5173`
2. Should see PlayerSetup component
3. Enter name: "TeamTest"
4. Click "Start Game"
5. **Expected:**
   - Button shows "Creating Player..."
   - API call to backend
   - Player created in database
   - Transitions to game screen
   - Shows "Welcome, TeamTest!"

#### **Test Flow 2: Verify Data Persistence**

1. With TeamTest logged in, refresh page
2. **Expected:**
   - Skips PlayerSetup
   - Goes straight to game
   - Still shows "Welcome, TeamTest!"

#### **Test Flow 3: Logout**

1. Click "Logout" button
2. **Expected:**
   - Returns to PlayerSetup
   - localStorage cleared
   - Can create new player

#### **Test Flow 4: Check Database**

```http
### In test-api.http
GET http://localhost:3000/api/players

### Should show TeamTest in database with stats
```

---

### **Step 6: Common Integration Issues & Fixes**

#### **Issue 1: CORS Error**

**Error in browser console:**
```
Access to fetch at 'http://localhost:3000/api/players' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**Fix in `server/src/server.js`:**
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

#### **Issue 2: Database Schema Mismatch**

**Error:**
```
Error: no such column: wins
```

**Fix:**
```bash
# Delete old database
rm server/database/tictactoe.db

# Restart server (will recreate with new schema)
npm run dev
```

---

#### **Issue 3: Port Already in Use**

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Fix:**
```bash
# Kill the process
npx kill-port 3000

# Or manually find and kill
# Mac/Linux:
lsof -ti:3000 | xargs kill

# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

---

#### **Issue 4: Module Not Found**

**Error:**
```
Cannot find module 'express'
```

**Fix:**
```bash
cd server
npm install

cd ../client
npm install
```

---

#### **Issue 5: Infinite Loop on Win Condition**

**Error:**
```
Game continuously updates stats when player wins
Stats API called repeatedly
Browser freezes/slows down
```

**Problem:**
In `Game.jsx`, the useEffect that updates player stats was using state variables in the dependency array, causing it to re-run whenever the player object was updated with new stats.

**Fix:**
Use `useRef` instead of state to track if stats have been updated for the current game:

```javascript
// client/src/components/Game/Game.jsx
import { useState, useEffect, useRef } from "react";

export default function Game() {
  // ... other state
  const hasUpdatedStatsRef = useRef(false);  // ✅ Use ref, not state

  const handleReset = () => {
    setGameState(createInitialGameState());
    hasUpdatedStatsRef.current = false;  // ✅ Reset ref on new game
  };

  useEffect(() => {
    // Early return if conditions not met
    if (!gameOver || !player || hasUpdatedStatsRef.current) {
      return;
    }

    const updateStats = async () => {
      hasUpdatedStatsRef.current = true;  // ✅ Set immediately

      try {
        // ... update stats API call
        if (response.ok) {
          const data = await response.json();
          setPlayer(data.player);
        }
      } catch (error) {
        hasUpdatedStatsRef.current = false;  // ✅ Allow retry on error
      }
    };

    updateStats();
  }, [gameOver, winner, player]);  // ✅ Simple dependencies
}
```

**Why This Works:**
- Refs don't trigger re-renders when changed
- Early return pattern prevents duplicate calls
- Dependencies don't include the ref itself
- No infinite loop when player object updates

---

### **Step 7: Tag Day 1 Complete**

```bash
git checkout main
git tag -a v1.0-day1 -m "Day 1 Complete: Player management working"
git push origin v1.0-day1
```

---

## **END OF DAY 1: Team Demo Preparation**

### **Create Demo Script**

**Create: `DAY1_DEMO_SCRIPT.md`**

```markdown
# Day 1 Team Demo Script

## Team: [Team Name]
## Members:
- Backend: [Name]
- Frontend: [Name]
- Git Manager/PM: [Name]

---

## Demo Flow (5 minutes)

### 1. Show Project Structure (30 seconds)
**Git Manager shows:**
```
team-tictactoe-fullstack/
├── server/    ← Backend (Express + SQLite)
├── client/    ← Frontend (React)
└── README.md
```

### 2. Backend Demo (2 minutes)
**Backend Developer shows:**

```http
### Create Player
POST http://localhost:3000/api/players
Content-Type: application/json

{
  "name": "DemoUser"
}
```

**Show response with stats:**
```json
{
  "success": true,
  "player": {
    "id": "...",
    "name": "DemoUser",
    "wins": 0,
    "losses": 0,
    "ties": 0,
    "totalGames": 0
  }
}
```

**Update stats:**
```http
POST http://localhost:3000/api/players/[ID]/stats
Content-Type: application/json

{ "result": "win" }
```

**Show leaderboard:**
```http
GET http://localhost:3000/api/leaderboard
```

### 3. Frontend Demo (2 minutes)
**Frontend Developer shows:**

1. Open `http://localhost:5173`
2. Enter name in PlayerSetup
3. Click "Start Game"
4. Show transition to game screen
5. Show player name displayed
6. Refresh page (persists)
7. Click Logout (returns to setup)

### 4. Integration Demo (30 seconds)
**Git Manager shows browser DevTools:**

**Network tab:**
- Show POST request to backend
- Show 201 Created response

**Application tab → Local Storage:**
```
playerId: "uuid-here"
playerName: "DemoUser"
```

---

## What We Built

### Backend Features ✅
- Player creation with UUID
- Stats tracking (wins/losses/ties)
- Stats update endpoint
- Leaderboard with win rate calculation
- SQLite persistence

### Frontend Features ✅
- Player setup form
- API integration
- localStorage persistence
- Error handling
- Loading states
- Logout functionality

### Integration ✅
- Frontend → Backend communication
- Data flows correctly
- Persistence working
- CORS configured

---

## Technical Highlights

### Backend Tech Stack
- Node.js + Express
- Native SQLite (node:sqlite)
- UUID for player IDs
- RESTful API design

### Frontend Tech Stack
- React 19
- Vite
- CSS with custom properties
- Fetch API for HTTP requests

### Git Workflow
- Feature branches
- Pull requests
- Merge conflict resolution
- Team collaboration

---

## Challenges Overcome

1. **CORS Configuration** - Solved by configuring cors middleware
2. **Database Schema** - Added stats columns to players table
3. **State Management** - Used localStorage for persistence
4. **Merge Conflicts** - Resolved with team coordination

---

## Next Steps (Day 2)

- [ ] Add authentication system
- [ ] Login/Register pages
- [ ] Protected routes
- [ ] JWT tokens
- [ ] Password hashing
- [ ] Full game integration

---

## Bonus Goals (If Time Permits)

- [ ] Display player stats in game
- [ ] Real-time leaderboard
- [ ] Multiple game modes
- [ ] Apply to our own games
```

---

## **DAY 2 PREVIEW**

### **Day 2 Overview**

**Goal:** Add authentication system and complete full integration

**Timeline:**
- Morning (2 hours): Implement authentication
- Afternoon (2 hours): Full integration & polish
- End of Day: Presentations

---

### **Day 2 Role Assignments**

#### **Backend Developer Tasks:**

1. **Create Auth Service** (1 hour)
   - Password hashing with bcrypt
   - JWT token generation
   - Login/Register functions

2. **Add Auth Middleware** (30 minutes)
   - Token verification
   - Protected route middleware

3. **Update Database Schema** (30 minutes)
   - Add email and password_hash columns
   - Migration strategy

#### **Frontend Developer Tasks:**

1. **Create Auth Components** (1 hour)
   - Login.jsx
   - Register.jsx
   - ProtectedRoute.jsx

2. **Add Routing** (30 minutes)
   - Install react-router-dom
   - Set up routes
   - Navigation

3. **Create Auth Context** (1 hour)
   - Global auth state
   - Token management
   - API integration

#### **Git Manager Tasks:**

1. **Coordinate Integration** (ongoing)
   - Merge auth branches
   - Resolve conflicts
   - Test integration

2. **Prepare Presentation** (1 hour)
   - Demo script
   - Slides (optional)
   - Backup plan

3. **Bonus Features** (if time)
   - Help implement bonus features
   - Apply to other games
   - Documentation

---

## **Day 2: Detailed Backend Guide**

### **Backend Developer - Day 2 Tasks**

#### **Task 1: Update Database Schema (30 minutes)**

**Update: `server/src/config/database.js`**

```javascript
// Add to table creation
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    last_login INTEGER
  )
`);
```

**Migration Note:**
```bash
# Delete old database to recreate with new schema
rm server/database/tictactoe.db
# Restart server
```

---

#### **Task 2: Create Auth Service (1 hour)**

**Create: `server/src/services/authService.js`**

```javascript
// server/src/services/authService.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new user
 */
export async function registerUser(name, email, password) {
  try {
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const playerId = uuidv4();
    const createdAt = Date.now();

    // Insert user
    db.prepare(`
      INSERT INTO players (id, name, email, password_hash, wins, losses, ties, total_games, created_at)
      VALUES (?, ?, ?, ?, 0, 0, 0, 0, ?)
    `).run(playerId, name, email, passwordHash, createdAt);

    // Generate token
    const token = generateToken(playerId);

    // Return user without password
    return {
      player: {
        id: playerId,
        name,
        email,
        wins: 0,
        losses: 0,
        ties: 0,
        totalGames: 0,
        createdAt
      },
      token
    };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return { error: 'Email already registered', status: 400 };
    }
    throw error;
  }
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  try {
    // Find user
    const user = db.prepare(`
      SELECT id, name, email, password_hash, wins, losses, ties, total_games, created_at
      FROM players
      WHERE email = ?
    `).get(email);

    if (!user) {
      return { error: 'Invalid credentials', status: 401 };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return { error: 'Invalid credentials', status: 401 };
    }

    // Update last login
    db.prepare(`
      UPDATE players SET last_login = ? WHERE id = ?
    `).run(Date.now(), user.id);

    // Generate token
    const token = generateToken(user.id);

    // Return user without password
    return {
      player: {
        id: user.id,
        name: user.name,
        email: user.email,
        wins: user.wins,
        losses: user.losses,
        ties: user.ties,
        totalGames: user.total_games,
        createdAt: user.created_at
      },
      token
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Generate JWT token
 */
export function generateToken(playerId) {
  return jwt.sign(
    { userId: playerId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Get player by ID (without password)
 */
export function getPlayerById(playerId) {
  const player = db.prepare(`
    SELECT id, name, email, wins, losses, ties, total_games, created_at
    FROM players
    WHERE id = ?
  `).get(playerId);

  if (!player) {
    return { error: 'Player not found', status: 404 };
  }

  return {
    id: player.id,
    name: player.name,
    email: player.email,
    wins: player.wins,
    losses: player.losses,
    ties: player.ties,
    totalGames: player.total_games,
    createdAt: player.created_at
  };
}
```

---

#### **Task 3: Create Auth Middleware (30 minutes)**

**Create: `server/src/middleware/auth.js`**

```javascript
// server/src/middleware/auth.js
import { verifyToken } from '../services/authService.js';

/**
 * Middleware to authenticate JWT tokens
 */
export function authenticateToken(req, res, next) {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  // Verify token
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }

  // Attach user to request
  req.user = decoded;
  next();
}
```

---

#### **Task 4: Add Auth Routes (30 minutes)**

**Create: `server/src/routes/auth.routes.js`**

```javascript
// server/src/routes/auth.routes.js
import express from 'express';
import { registerUser, loginUser, getPlayerById } from '../services/authService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }

    const result = await registerUser(name.trim(), email.trim(), password);

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        error: result.error
      });
    }

    res.status(201).json({
      success: true,
      player: result.player,
      token: result.token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await loginUser(email.trim(), password);

    if (result.error) {
      return res.status(result.status).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      player: result.player,
      token: result.token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

/**
 * GET /api/auth/me
 * Protected route - requires token
 */
router.get('/me', authenticateToken, (req, res) => {
  try {
    const player = getPlayerById(req.user.userId);

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
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    });
  }
});

export default router;
```

---

#### **Task 5: Update Server with Auth Routes (15 minutes)**

**Update: `server/src/server.js`**

```javascript
// Add imports
import authRoutes from './routes/auth.routes.js';
import { authenticateToken } from './middleware/auth.js';

// Add auth routes
app.use('/api/auth', authRoutes);

// Protect existing stats route
app.post("/api/players/:id/stats", authenticateToken, (req, res) => {
  // ... existing code
});
```

---

#### **Task 6: Update Environment Variables**

**Update: `server/.env.example`**

```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL=./database/tictactoe.db

# JWT Authentication (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

**Update your actual `.env`:**
```env
JWT_SECRET=dev-secret-key-12345-change-me
```

---

#### **Task 7: Test Auth Endpoints**

**Update: `server/test-api.http`**

```http
### ==========================================
### AUTHENTICATION
### ==========================================

### Register New User
# @name register
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Ryan",
  "email": "ryan@example.com",
  "password": "Password123"
}

### Login
# @name login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "ryan@example.com",
  "password": "Password123"
}

### Get Current User (use token from login)
GET http://localhost:3000/api/auth/me
Authorization: Bearer YOUR-TOKEN-HERE

### Update Stats (Protected - needs token)
POST http://localhost:3000/api/players/PLAYER-ID/stats
Authorization: Bearer YOUR-TOKEN-HERE
Content-Type: application/json

{
  "result": "win"
}
```

---

**Backend Day 2 Complete! ✅**

---

## **Day 2: Detailed Frontend Guide**

### **Frontend Developer - Day 2 Tasks**

#### **Task 1: Install React Router (5 minutes)**

```bash
cd client
npm install react-router-dom
```

---

#### **Task 2: Create Auth Context (45 minutes)**

**Create: `client/src/context/AuthContext.jsx`**

```javascript
// client/src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const savedToken = localStorage.getItem('token');

    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.player);
        setToken(savedToken);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.player);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.player);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    register,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

#### **Task 3: Create Login Component (30 minutes)**

**Create: `client/src/components/Auth/Login.jsx`**

```javascript
// client/src/components/Auth/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/game');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back!</h2>
        <p className="subtitle">Login to continue playing</p>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-toggle">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
```

---

#### **Task 4: Create Register Component (30 minutes)**

**Create: `client/src/components/Auth/Register.jsx`**

```javascript
// client/src/components/Auth/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const result = await register(name, email, password);

    if (result.success) {
      navigate('/game');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="subtitle">Join us and start playing!</p>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="auth-toggle">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
```

---

#### **Task 5: Create ProtectedRoute Component (15 minutes)**

**Create: `client/src/components/Auth/ProtectedRoute.jsx`**

```javascript
// client/src/components/Auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

---

#### **Task 6: Update App with Routing (30 minutes)**

**Update: `client/src/App.jsx`**

```javascript
// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Game from './components/Game/Game';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/game"
            element={
              <ProtectedRoute>
                <Game />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/game" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

---

#### **Task 7: Update Game Component (15 minutes)**

**Update: `client/src/components/Game/Game.jsx`**

```javascript
// Remove PlayerSetup import and usage
// Update to use AuthContext

import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Game() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ... existing game state

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="game-container">
      <div className="player-info">
        <h1>Welcome, {user.name}! 👋</h1>
        <button onClick={handleLogout} className="btn btn-secondary btn-small">
          Logout
        </button>
      </div>

      {/* ... rest of game component */}
    </div>
  );
}
```

---

#### **Task 8: Add Auth Styles (15 minutes)**

**Update: `client/src/styles/main.css`**

```css
/* ==========================================
   AUTH COMPONENTS
   ========================================== */

.auth-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.auth-card {
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 100%;
}

.auth-card h2 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 2rem;
  text-align: center;
}

.auth-card .subtitle {
  color: #666;
  margin-bottom: 2rem;
  text-align: center;
}

.auth-form {
  margin-bottom: 1.5rem;
}

.auth-form .form-group {
  margin-bottom: 1.5rem;
}

.auth-form input {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.auth-form input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.auth-toggle {
  text-align: center;
  color: #666;
  font-size: 0.95rem;
}

.auth-toggle a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.auth-toggle a:hover {
  text-decoration: underline;
}

.loading-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  font-size: 1.5rem;
  color: #667eea;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

**Frontend Day 2 Complete! ✅**

---

## **FINAL INTEGRATION & PRESENTATION**

### **Final Integration Checklist**

#### **All Team Members:**

- [ ] Backend auth routes working
- [ ] Frontend auth components working
- [ ] Login flow works end-to-end
- [ ] Register flow works end-to-end
- [ ] Protected routes require authentication
- [ ] Logout works correctly
- [ ] Token persistence working
- [ ] Game playable after authentication
- [ ] Stats tracking still works
- [ ] No console errors

---

### **Final Testing Procedure**

**Complete Flow Test:**

1. **Register new user:**
   - Go to `/register`
   - Fill in name, email, password
   - Submit
   - Should redirect to `/game`
   - Should show user name

2. **Logout:**
   - Click logout
   - Should redirect to `/login`
   - Should clear token

3. **Login:**
   - Enter credentials
   - Should redirect to `/game`
   - Should show user name

4. **Refresh page:**
   - Should stay logged in
   - Token should persist

5. **Try accessing `/game` without login:**
   - Should redirect to `/login`

---

### **Presentation Preparation (30 minutes)**

**Create: `FINAL_PRESENTATION.md`**

```markdown
# Team Tic-Tac-Toe - Final Presentation

## Team Members
- Backend: [Name]
- Frontend: [Name]
- Git Manager/PM: [Name]

---

## Project Overview

Full-stack tic-tac-toe game with:
- Player authentication
- Stats tracking
- Leaderboard
- Persistent data

---

## Tech Stack

### Backend
- Node.js + Express
- SQLite (native)
- JWT authentication
- bcrypt password hashing

### Frontend
- React 19
- React Router
- Context API
- Vite

### Tools
- Git/GitHub
- REST Client
- npm

---

## Demo

### 1. Registration (1 min)
[Show registering new user]

### 2. Login (30 sec)
[Show login flow]

### 3. Game Play (1 min)
[Play a game, show stats update]

### 4. Leaderboard (30 sec)
[Show leaderboard]

### 5. Persistence (30 sec)
[Refresh page, still logged in]

---

## Features Implemented

### Authentication ✅
- User registration with password hashing
- Login with JWT tokens
- Protected routes
- Token persistence
- Logout functionality

### Player Management ✅
- Create players
- Track statistics
- Leaderboard with win rates
- Lookup by ID or name

### Game Logic ✅
- Full tic-tac-toe game
- Win detection
- Draw detection
- Stats update after games

---

## Technical Highlights

### Security
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for stateless auth
- Protected API endpoints
- CORS configured

### Data Persistence
- SQLite database
- localStorage for tokens
- Stats survive server restart

### User Experience
- Loading states
- Error handling
- Responsive design
- Form validation

---

## Challenges & Solutions

### Challenge 1: CORS
**Problem:** Frontend couldn't connect to backend
**Solution:** Configured CORS middleware with correct origin

### Challenge 2: Password Security
**Problem:** Storing passwords safely
**Solution:** Used bcrypt with salt rounds

### Challenge 3: State Management
**Problem:** Auth state across components
**Solution:** React Context API

---

## Bonus Features Implemented

[If applicable]
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

---

## Future Enhancements

- Real-time multiplayer with WebSockets
- Profile pictures
- Friend system
- Tournament mode
- Mobile app

---

## Lessons Learned

### Backend Developer
- JWT authentication flow
- Password hashing best practices
- SQLite schema design
- Protected routes

### Frontend Developer
- React Router
- Context API for global state
- Token management
- Form validation

### Git Manager
- Merge conflict resolution
- Feature branch workflow
- Team coordination
- Integration testing

---

## Thank You!

Questions?
```

---

## **BONUS: Applying to Your Own Game**

If time permits after completing the main project:

### **Backend Developer:**
Apply stats tracking to your own game:
```javascript
// Example: Rock Paper Scissors
export function updateRPSStats(playerId, result) {
  // Similar to tic-tac-toe stats
  return updatePlayerStats(playerId, result);
}
```

### **Frontend Developer:**
Use the same auth system:
```javascript
// Your game component
import { useAuth } from '../context/AuthContext';

export default function YourGame() {
  const { user } = useAuth();

  // Use user.id to track stats
  // Use user.name to display
}
```

---

## **Final Deliverables Checklist**

### **Code:**
- [ ] All features working
- [ ] No console errors
- [ ] Code commented
- [ ] README updated

### **Documentation:**
- [ ] API documentation
- [ ] Component documentation
- [ ] Setup instructions
- [ ] Presentation slides

### **Git:**
- [ ] All code pushed to main
- [ ] Tagged as v2.0-final
- [ ] Clean commit history
- [ ] No sensitive data in repo

### **Presentation:**
- [ ] Demo prepared
- [ ] Talking points ready
- [ ] Backup plan (screenshots/video)
- [ ] Questions anticipated

---

**🎉 CONGRATULATIONS! 🎉**

**You've built a complete full-stack application with:**
- ✅ Authentication system
- ✅ Database persistence
- ✅ RESTful API
- ✅ React frontend
- ✅ Team collaboration
- ✅ Git workflow

**This is a portfolio-worthy project!**

---