# Full-Stack Tic-Tac-Toe Game - Winter 2025

A complete full-stack tic-tac-toe game with player management, statistics tracking, and a leaderboard.

## Features

- **Player Management**: Create and manage player accounts
- **Game Logic**: Complete tic-tac-toe implementation with win/loss/draw detection
- **Statistics Tracking**: Automatic win/loss/tie tracking for each player
- **Leaderboard**: View top players ranked by wins
- **Persistent Data**: SQLite database for data persistence
- **Responsive UI**: Clean, modern interface built with React

## Tech Stack

### Frontend
- React 19
- Vite
- CSS3
- Fetch API

### Backend
- Node.js
- Express
- SQLite (native `node:sqlite`)
- CORS

## Project Structure

```
final-project-repo-final/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── styles/        # CSS files
│   │   └── utils/         # Game logic utilities
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── services/      # Business logic
│   │   └── server.js      # Main server file
│   └── package.json
├── BUGFIXES.md            # Bug tracking and fixes
├── front-end-specialist.md
├── server-specialist.md
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd final-project-repo-final
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

**Terminal 1 - Start the backend server:**
```bash
cd server
npm run dev
```
Server will run on http://localhost:3000

**Terminal 2 - Start the frontend:**
```bash
cd client
npm run dev
```
Frontend will run on http://localhost:5173

### Usage

1. Open http://localhost:5173 in your browser
2. Enter your name to create a player
3. Play tic-tac-toe!
4. Your wins, losses, and ties are automatically tracked
5. Check the leaderboard to see top players

## API Endpoints

- `POST /api/players` - Create a new player
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get player by ID
- `GET /api/players/name/:name` - Get player by name
- `POST /api/players/:id/stats` - Update player stats (win/loss/tie)
- `GET /api/leaderboard` - Get top players

## Known Issues & Fixes

See [BUGFIXES.md](BUGFIXES.md) for detailed information about bugs and their fixes.

### Recently Fixed
- **Infinite Loop on Win Condition** - Fixed by using `useRef` instead of state to track stats updates

## Development Notes

### Important: Multiple Browser Tabs
If you experience infinite API calls, make sure to:
- Close all browser tabs running the app
- Clear localStorage: `localStorage.clear()`
- Refresh with only one tab open

### Database
The SQLite database is created automatically at `server/database/tictactoe.db` on first run.

To reset the database:
```bash
rm server/database/tictactoe.db
# Database will be recreated on next server start
```

## Documentation

- **Front-End Developer Guide**: [front-end-specialist.md](front-end-specialist.md)
- **Back-End Developer Guide**: [server-specialist.md](server-specialist.md)
- **Git Manager Guide**: [repo-specialist.md](repo-specialist.md)
- **Integration & Presentation**: [final-presentation-specification.md](final-presentation-specification.md)
- **Bug Fixes**: [BUGFIXES.md](BUGFIXES.md)

## Contributing

This is a school project, but contributions and improvements are welcome!

## License

ISC

---

**Last Updated:** December 2025