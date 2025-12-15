// client/src/components/Game/Game.jsx
import { useState, useEffect, useRef } from "react";
import Board from "./Board";
import GameStatus from "./GameStatus";
import PlayerSetup from "../PlayerSetup";
import {
  checkForWin,
  isValidMove,
  applyMove,
  switchPlayer,
  createInitialGameState,
} from "../../utils/gameLogic";

export default function Game() {
  const [gameState, setGameState] = useState(createInitialGameState());
  const [player, setPlayer] = useState(null);
  const hasUpdatedStatsRef = useRef(false);

  const { board, currentPlayer, gameOver, winner, winningCombo } = gameState;

  const handleCellClick = (position) => {
    if (gameOver) return;

    // validate move
    const validation = isValidMove(board, position);
    if (!validation.valid) {
      console.log("Invalid move:", validation.reason);
      return;
    }
    // apply move
    const newBoard = applyMove(board, position, currentPlayer);
    // check for win/draw
    const result = checkForWin(newBoard);
    // update state
    setGameState({
      board: newBoard,
      currentPlayer: result.winner
        ? currentPlayer
        : switchPlayer(currentPlayer),
      gameOver: result.winner !== null,
      winner: result.winner,
      winningCombo: result.winningCombo,
    });
  };
  /* Reset the Game */
  const handleReset = () => {
    setGameState(createInitialGameState());
    hasUpdatedStatsRef.current = false;
  };

  // Update player stats when game ends
  useEffect(() => {
    // Only run if game is over, player exists, and we haven't already updated
    if (!gameOver || !player || hasUpdatedStatsRef.current) {
      return;
    }

    const updateStats = async () => {
      hasUpdatedStatsRef.current = true;

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
        hasUpdatedStatsRef.current = false; // Allow retry on error
      }
    };

    updateStats();
  }, [gameOver, winner, player]);

  // Show player setup if no player is logged in
  if (!player) {
    return <PlayerSetup onPlayerSet={setPlayer} />;
  }

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
        <button className={`reset-button`} onClick={handleReset}>
          New Game
        </button>
      </div>
    </>
  );
}
