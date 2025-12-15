---

# **2-Day Team Project: Full-Stack Tic-Tac-Toe with Authentication**

## **Project Overview**

### **Starting Point (End of Step 2):**
Each student has a local project with:
- ✅ Basic Express server
- ✅ SQLite database with players table
- ✅ `POST /api/players` - Create player
- ✅ `GET /api/players/:id` - Get player by ID
- ✅ Test file (`test-api.http`)

### **Team Roles:**
1. **Backend Developer** - Scoring system + stats tracking
2. **Frontend Developer** - React player setup component
3. **Git Manager/PM** - Repository setup + team coordination

### **Day 1 Goal:**
Combine individual work into a functioning full-stack app with player management and stats

### **Day 2 Goal:**
Add authentication system and present working project

---

## **Part 1: Git Manager/Project Manager Guide**

I'll start with the Git Manager since they need to set up the infrastructure first, then move to Backend and Frontend guides.

---

# **GIT MANAGER / PROJECT MANAGER - Complete Guide**

## **Your Mission:**
You are the **glue** that holds the team together. Your job is to:
1. Create a shared repository
2. Set up the project structure
3. Help teammates merge their work
4. Resolve merge conflicts
5. Coordinate integration
6. Assist teammates when blocked

---

## **Day 1: Repository Setup & Integration**

### **Phase 1: Pre-Project Setup (30 minutes)**

#### **Step 1: Create GitHub Repository**

```bash
# 1. Go to GitHub.com
# 2. Click "New Repository"
# 3. Name: "team-tictactoe-fullstack"
# 4. Description: "Full-stack tic-tac-toe with authentication"
# 5. Select: Private (or Public)
# 6. DO NOT initialize with README (we'll add it)
# 7. Click "Create Repository"
```

#### **Step 2: Create Local Project Structure**

```bash
# Create project directory
mkdir team-tictactoe-fullstack
cd team-tictactoe-fullstack

# Initialize git
git init
```

#### **Step 3: Create Base Project Structure**

```bash
# Create folders
mkdir server
mkdir client

# Create root files
touch .gitignore
touch README.md
```

**Create: `.gitignore`** (root level)
```gitignore
# Dependencies
node_modules/

# Environment
.env
.env.local

# Database
*.db
*.db-journal

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Logs
*.log
```

**Create: `README.md`**
```markdown
# Team Tic-Tac-Toe Full-Stack Project

## Team Members
- **Backend Developer:** [Name]
- **Frontend Developer:** [Name]
- **Git Manager/PM:** [Name]

## Project Structure
```
team-tictactoe-fullstack/
├── server/          # Backend (Express + SQLite)
├── client/          # Frontend (React)
└── README.md
```

## Setup Instructions

### Server Setup
```bash
cd server
npm install
npm run dev
```

### Client Setup
```bash
cd client
npm install
npm run dev
```

## Features
- [ ] Player registration
- [ ] Player stats tracking
- [ ] Authentication
- [ ] Game logic

## Day 1 Checklist
- [ ] Backend: Scoring system implemented
- [ ] Frontend: Player setup component working
- [ ] Integration: Frontend calls backend API

## Day 2 Checklist
- [ ] Authentication system
- [ ] Full integration
- [ ] Presentation ready
```

#### **Step 4: Initial Commit**

```bash
git add .
git commit -m "Initial project structure"

# Connect to GitHub
git remote add origin https://github.com/YOUR-USERNAME/team-tictactoe-fullstack.git
git branch -M main
git push -u origin main
```

---

### **Phase 2: Collect Team Member Code (30 minutes)**

#### **Step 5: Create Feature Branches**

```bash
# Create branches for each team member
git checkout -b feature/backend-scoring
git push -u origin feature/backend-scoring

git checkout main
git checkout -b feature/frontend-setup
git push -u origin feature/frontend-setup

git checkout main
```

#### **Step 6: Add Backend Developer's Code**

```bash
git checkout feature/backend-scoring

# Have backend dev send you their server/ folder
# Copy their files into server/ directory

# Or have them clone and push:
# git clone [repo-url]
# cd team-tictactoe-fullstack
# git checkout feature/backend-scoring
# [copy their code to server/]
# git add server/
# git commit -m "Add backend scoring system"
# git push
```

**Important files they should provide:**
```
server/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── services/
│   │   └── playerService.js
│   └── server.js
├── database/
│   └── .gitkeep
├── .env.example
├── package.json
└── test-api.http
```

#### **Step 7: Add Frontend Developer's Code**

```bash
git checkout feature/frontend-setup

# Have frontend dev send you their client/ folder
# Copy their files into client/ directory

# Or have them clone and push (same process as backend)
```

**Important files they should provide:**
```
client/
├── src/
│   ├── components/
│   │   └── PlayerSetup.jsx
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── index.html
```

---

### **Phase 3: Integration (1-2 hours)**

#### **Step 8: Merge Backend Code**

```bash
git checkout main
git merge feature/backend-scoring

# If conflicts, resolve them:
# 1. Open conflicted files
# 2. Look for <<<<<<< HEAD markers
# 3. Choose which code to keep
# 4. Remove conflict markers
# 5. git add [resolved-file]
# 6. git commit
```

#### **Step 9: Merge Frontend Code**

```bash
git merge feature/frontend-setup

# Resolve any conflicts
```

#### **Step 10: Test Integration**

```bash
# Terminal 1: Start backend
cd server
npm install
npm run dev

# Terminal 2: Start frontend
cd client
npm install
npm run dev

# Terminal 3: Test API
cd server
# Use test-api.http file
```

**Integration Test Checklist:**
- [ ] Backend server starts on port 3000
- [ ] Frontend starts on port 5173
- [ ] Can create player via API
- [ ] Can retrieve player via API
- [ ] Frontend form can connect to backend
- [ ] CORS is configured properly

#### **Step 11: Fix CORS (If Needed)**

If frontend can't connect to backend, ensure CORS is set up:

**In `server/src/server.js`:**
```javascript
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

### **Phase 4: Documentation & Coordination (Ongoing)**

#### **Create Integration Guide**

**Create: `INTEGRATION.md`**
```markdown
# Integration Guide

## Current Status
- ✅ Backend scoring API working
- ✅ Frontend player setup component working
- ⏳ Frontend → Backend connection (in progress)

## API Endpoints

### Create Player
```
POST http://localhost:3000/api/players
Content-Type: application/json

{
  "name": "Ryan"
}
```

**Response:**
```json
{
  "success": true,
  "player": {
    "id": "uuid-here",
    "name": "Ryan",
    "wins": 0,
    "losses": 0,
    "ties": 0
  }
}
```

### Update Stats
```
POST http://localhost:3000/api/players/:id/stats
Content-Type: application/json

{
  "result": "win"
}
```

## Frontend Integration

**In PlayerSetup.jsx:**
```javascript
const response = await fetch('http://localhost:3000/api/players', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: playerName })
});
```

## Common Issues

### CORS Error
**Problem:** `Access to fetch blocked by CORS policy`
**Solution:** Add CORS middleware in server.js

### Port Already in Use
**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`
**Solution:** Kill the process: `npx kill-port 3000`

### Module Not Found
**Problem:** `Cannot find module 'express'`
**Solution:** Run `npm install` in server directory
```

---

### **Phase 5: Coordinate Team (Throughout Day 1)**

#### **Your Coordination Checklist:**

**Every Hour, Check:**
- [ ] Is backend dev stuck? Help debug
- [ ] Is frontend dev stuck? Help with API calls
- [ ] Any merge conflicts? Resolve together
- [ ] Code pushed to repo? Remind to commit

**Communication Template:**

```
Team Status Update - [Time]

Backend Progress: [X/Y tasks complete]
- Current task: ___________
- Blockers: ___________

Frontend Progress: [X/Y tasks complete]
- Current task: ___________
- Blockers: ___________

Integration Status:
- [ ] Backend API tested
- [ ] Frontend component working
- [ ] Frontend → Backend connected
- [ ] Data flowing correctly

Next Steps:
1. ___________
2. ___________
```

---

### **Phase 6: End of Day 1 Deliverables**

#### **Step 12: Create Pull Request**

```bash
# Make sure all features are merged to main
git checkout main
git pull

# Tag Day 1 completion
git tag -a v1.0-day1 -m "Day 1 complete: Player management working"
git push origin v1.0-day1
```

#### **Step 13: Day 1 Demo Preparation**

**Create: `DAY1_DEMO.md`**
```markdown
# Day 1 Demo Script

## What We Built Today

### Backend (Scoring System)
- ✅ Player creation with UUID
- ✅ Win/Loss/Tie tracking
- ✅ Stats update endpoint
- ✅ Leaderboard endpoint

### Frontend (Player Setup)
- ✅ Player name input form
- ✅ Form validation
- ✅ API integration
- ✅ Error handling

### Integration
- ✅ Frontend sends player name to backend
- ✅ Backend creates player in database
- ✅ Frontend receives player ID
- ✅ Stats can be updated

## Demo Flow
1. Show backend test file working
2. Show frontend form working
3. Create player via frontend
4. Show player in database
5. Update stats via API
6. Show updated stats

## What's Next (Day 2)
- Authentication system
- Login/Register pages
- Protected routes
- Full game integration
```

---

**That's Part 1 - Git Manager Guide complete!**