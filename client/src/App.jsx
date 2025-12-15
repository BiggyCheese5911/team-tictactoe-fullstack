// src/App.jsx
import Game from './components/Game/Game'
import Leaderboard from './components/Leaderboard'

function App() {
  return (
    <div className="app">
      <div className="main-content">
        <Game />
      </div>
      <aside className="sidebar">
        <Leaderboard />
      </aside>
    </div>
  )
}

export default App
