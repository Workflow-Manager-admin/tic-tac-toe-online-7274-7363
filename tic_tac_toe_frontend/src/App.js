import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Utility to detect a winner or tie in a Tic Tac Toe game board.
 * @param {Array<string|null>} board - Array of 9 elements ['X','O',null,...]
 * @returns {{winner: string|null, line: Array<number>|null, tie: boolean}}
 */
function calculateWinner(board) {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (let line of lines) {
    const [a,b,c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {winner: board[a], line, tie: false};
    }
  }
  if (board.every(cell => cell)) {
    return {winner: null, line: null, tie: true};
  }
  return {winner: null, line: null, tie: false};
}

/**
 * Computer AI using basic strategy: (1) win if possible, (2) block, (3) center, (4) corner, (5) any.
 * @param {Array<string|null>} board 
 * @param {string} ai 
 * @param {string} human 
 * @returns {number}
 */
function computeAIMove(board, ai, human) {
  // 1. Win
  for (let i=0; i<9; ++i) {
    if (!board[i]) {
      const copy = board.slice();
      copy[i] = ai;
      if (calculateWinner(copy).winner === ai) return i;
    }
  }
  // 2. Block
  for (let i=0; i<9; ++i) {
    if (!board[i]) {
      const copy = board.slice();
      copy[i] = human;
      if (calculateWinner(copy).winner === human) return i;
    }
  }
  // 3. Center
  if (!board[4]) return 4;
  // 4. Corners
  const corners = [0,2,6,8].filter(i => !board[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  // 5. Sides
  const sides = [1,3,5,7].filter(i => !board[i]);
  if (sides.length) return sides[Math.floor(Math.random() * sides.length)];
  // Fallback
  return board.findIndex(cell => !cell);
}

// PUBLIC_INTERFACE
function App() {
  // State for game
  const [mode, setMode] = useState(null); // null/PVP/AI
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isX, setIsX] = useState(true); // X starts
  const [status, setStatus] = useState('playing'); // playing/won/tie
  const [winner, setWinner] = useState(null);
  const [highlight, setHighlight] = useState([]);
  const [alertMsg, setAlertMsg] = useState('');
  const [gameNumber, setGameNumber] = useState(0); // for "New Game"

  // Sync status
  useEffect(() => {
    const {winner, line, tie} = calculateWinner(board);
    if (winner) {
      setStatus('won');
      setWinner(winner);
      setHighlight(line);
      setAlertMsg(`Player ${winner} wins!`);
    } else if (tie) {
      setStatus('tie');
      setWinner(null);
      setHighlight([]);
      setAlertMsg('It\'s a tie!');
    } else {
      setStatus('playing');
      setWinner(null);
      setHighlight([]);
      setAlertMsg('');
    }
  }, [board]);

  // AI Move for "Player vs AI"
  useEffect(() => {
    if (mode === "AI" && status === "playing" && !isX) {
      // 'O' is always computer for simplicity
      const move = computeAIMove(board, 'O', 'X');
      if (move !== -1) {
        setTimeout(() => {
          setBoard(b => {
            if (b[move]) return b; // Already filled by user click
            const newBoard = b.slice();
            newBoard[move] = 'O';
            return newBoard;
          });
          setIsX(true);
        }, 350); // Slight delay for realism
      }
    }
  // eslint-disable-next-line
  }, [mode, board, isX, status]);

  // Color variables per spec
  const COLORS = {
    primary: '#3498db', // light blue
    secondary: '#2ecc71', // green
    accent: '#e67e22' // orange
  };

  // Reset board state
  function handleReset() {
    setBoard(Array(9).fill(null));
    setIsX(true);
    setStatus('playing');
    setWinner(null);
    setHighlight([]);
    setAlertMsg('');
  }

  // Start a new game (select mode again)
  function handleNewGame() {
    setMode(null);
    setGameNumber(n => n + 1);
    handleReset();
  }

  // PUBLIC_INTERFACE
  function handleClick(idx) {
    if (status !== "playing" || board[idx]) return;
    if (mode === "AI" && !isX) return; // prevent user click during AI turn
    setBoard(b => {
      const nb = b.slice();
      nb[idx] = isX ? 'X' : 'O';
      return nb;
    });
    setIsX(ix => !ix);
  }

  // PUBLIC_INTERFACE
  function handleSelectMode(selected) {
    setMode(selected);
    setBoard(Array(9).fill(null));
    setIsX(true);
    setStatus('playing');
    setWinner(null);
    setHighlight([]);
    setAlertMsg('');
  }

  // Determine player label
  const playerLabel = 
    mode === "PVP" ? 
      (status === "playing" ? `Player ${isX ? 'X' : 'O'}'s turn` : '') :
      (mode === "AI" ? 
        (status === "playing" ? (isX ? 'Your turn (X)' : "AI's turn (O)") : '') : '');

  return (
    <div className="app-bg" style={{
      background: 'var(--bg-primary)',
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, Arial, sans-serif'
    }}>
      <div className="ttt-main-container" key={gameNumber}>
        <h1 className="ttt-title" data-testid="game-title" style={{
          color: COLORS.primary,
          marginBottom: 8,
          fontWeight: '700'
        }}>
          Tic Tac Toe
        </h1>
        <p className="ttt-desc" style={{
          color:"#333", fontSize: 17, marginBottom: 22, textAlign:'center', fontWeight: 500
        }}>
          { mode == null ? "Pick a mode to start playing" : "Enjoy a classic game of strategy" }
        </p>

        {// Mode Selector
        mode == null &&
        <div style={{
          display:'flex', gap:14, justifyContent:'center', marginBottom:30
        }}>
          <button className="ttt-btn mode-btn" style={{backgroundColor: COLORS.primary}}
            onClick={() => handleSelectMode("PVP")}>Player vs Player</button>
          <button className="ttt-btn mode-btn" style={{backgroundColor: COLORS.accent}}
            onClick={() => handleSelectMode("AI")}>Player vs AI</button>
        </div>
        }

        {/* Game board */}
        {mode &&
        <>
        <div className="ttt-status-indicator" style={{
          marginBottom:12, minHeight: 23,
          color: status==='won' ? COLORS.secondary : (status==='tie' ? COLORS.accent : COLORS.primary),
          fontWeight: 600, fontSize:18, letterSpacing: 1
        }}>
          {alertMsg || playerLabel}
        </div>
        <div className="ttt-board-outer">
          <div
            className="ttt-board"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: "repeat(3, 1fr)",
              gap: 0,
              background: "var(--bg-secondary)",
              borderRadius: 18,
              boxShadow: "0 8px 32px 0 rgba(30,60,150,0.10)",
              border: `2.5px solid ${COLORS.primary}`,
              width: "clamp(260px, 37vw, 392px)",
              aspectRatio: "1"
            }}
          >
            {board.map((cell, idx) => (
              <button
                className="ttt-cell"
                key={idx}
                style={{
                  border: `1.2px solid ${COLORS.primary}`,
                  borderRight: [2,5,8].includes(idx) ? 'none' : `1.2px solid ${COLORS.primary}`,
                  borderBottom: [6,7,8].includes(idx) ? 'none' : `1.2px solid ${COLORS.primary}`,
                  background: highlight && highlight.includes(idx) ? COLORS.secondary : "var(--bg-primary)",
                  color: cell==='X'
                    ? COLORS.primary
                    : (cell==='O' ? COLORS.accent : COLORS.primary),
                  fontSize: "clamp(35px,7vw,55px)",
                  fontWeight: '800',
                  width: '100%', height: '100%',
                  outline: 'none',
                  transition: 'background 0.19s, color 0.18s'
                }}
                aria-label={`Cell ${idx} ${cell ? cell : ''}`}
                onClick={() => handleClick(idx)}
                disabled={!!cell || status !== "playing" || (mode==="AI" && !isX)}
                tabIndex={cell ? -1 : 0}
                data-testid={`cell-${idx}`}
              >
                {cell ? cell : ''}
              </button>
            ))}
          </div>
        </div>
        {/* Controls */}
        <div className="ttt-controls-area" style={{
          display: "flex", gap: 14, justifyContent: "center", marginTop: 25, flexWrap:'wrap'
        }}>
          <button className="ttt-btn" style={{backgroundColor: COLORS.secondary}} onClick={handleReset}>
            Reset
          </button>
          <button className="ttt-btn" style={{backgroundColor: COLORS.accent}} onClick={handleNewGame}>
            New Game
          </button>
        </div>
        {/* Footer / Player Marker */}
        <div className="ttt-footer-area" style={{
          marginTop:18, fontSize:15, color: COLORS.primary, minHeight:22, textAlign:'center'
        }}>
          {status==='playing' && playerLabel ? playerLabel : ''}
        </div>
        </>
        }
        <div style={{marginTop:mode?24:46, fontSize:13, color:'#666', opacity:0.5}}>
          Minimal Tic Tac Toe &middot; React
        </div>
      </div>
    </div>
  );
}

export default App;
