import { useGameState } from './game/useGameState.js';
import Board from './components/Board.jsx';
import Hand from './components/Hand.jsx';
import Controls from './components/Controls.jsx';
import WinOverlay from './components/WinOverlay.jsx';

export default function App() {
  const {
    groups,
    handTiles,
    hint,
    difficulty,
    dragState,
    solved,
    showHint,
    validationMap,
    onDragStartTile,
    onDragStartHand,
    onDropOnGroup,
    onDropBetween,
    onDropNewGroup,
    onToggleHint,
    newPuzzle,
  } = useGameState();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: 'Georgia, serif',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 24,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          margin: 0,
          fontSize: 32,
          fontWeight: 900,
          letterSpacing: 2,
          background: 'linear-gradient(90deg, #f4d03f, #f39c12)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'Georgia, serif',
        }}>
          RUMMIKUB
        </h1>
        <p style={{ color: '#a0aec0', margin: '4px 0 0', fontSize: 13, letterSpacing: 3, textTransform: 'uppercase' }}>
          Puzzle Mode
        </p>
      </div>

      {/* Objective banner */}
      <div style={{
        background: '#ffffff0a',
        border: '1px solid #ffffff18',
        borderRadius: 10,
        padding: '10px 20px',
        color: '#e2e8f0',
        fontSize: 14,
        textAlign: 'center',
        maxWidth: 480,
      }}>
        🎯 Rearrange the tiles into valid sets and runs, then place your hand tile(s) to solve the puzzle.
      </div>

      <Board
        groups={groups}
        dragState={dragState}
        validationMap={validationMap}
        onDragStartTile={onDragStartTile}
        onDropOnGroup={onDropOnGroup}
        onDropBetween={onDropBetween}
        onDropNewGroup={onDropNewGroup}
      />

      <Hand handTiles={handTiles} onDragStart={onDragStartHand} />

      <Controls
        difficulty={difficulty}
        showHint={showHint}
        hint={hint}
        onToggleHint={onToggleHint}
        onNewPuzzle={newPuzzle}
      />

      <WinOverlay solved={solved} onNewPuzzle={newPuzzle} />
    </div>
  );
}
