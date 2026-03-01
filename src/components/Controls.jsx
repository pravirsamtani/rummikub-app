const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];

const DIFF_COLORS = {
  easy:   { active: '#27ae60', border: '#27ae6044', bg: '#27ae6022' },
  medium: { active: '#f39c12', border: '#f39c1244', bg: '#f39c1222' },
  hard:   { active: '#e74c3c', border: '#e74c3c44', bg: '#e74c3c22' },
  expert: { active: '#9b59b6', border: '#9b59b644', bg: '#9b59b622' },
};

/** Difficulty selector + hint toggle + New Puzzle button row. */
export default function Controls({ difficulty, showHint, hint, onNewPuzzle, onToggleHint }) {
  return (
    <>
      {/* Difficulty selector */}
      <div style={{ display: 'flex', gap: 6 }}>
        {DIFFICULTIES.map(d => {
          const active = d === difficulty;
          const col = DIFF_COLORS[d];
          return (
            <button
              key={d}
              onClick={() => onNewPuzzle(d)}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: `1.5px solid ${active ? col.active : col.border}`,
                background: active ? col.bg : 'transparent',
                color: active ? col.active : '#718096',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'Georgia, serif',
                letterSpacing: 1,
                textTransform: 'capitalize',
                fontWeight: active ? 700 : 400,
                transition: 'all 0.2s',
              }}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onToggleHint}
          style={{
            padding: '10px 22px',
            borderRadius: 8,
            border: '1.5px solid #f39c1244',
            background: showHint ? '#f39c1222' : 'transparent',
            color: '#f39c12',
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'Georgia, serif',
            letterSpacing: 1,
          }}
        >
          {showHint ? 'Hide' : 'Show'} Hint
        </button>
        <button
          onClick={() => onNewPuzzle(difficulty)}
          style={{
            padding: '10px 22px',
            borderRadius: 8,
            border: '1.5px solid #4a5568',
            background: 'transparent',
            color: '#a0aec0',
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'Georgia, serif',
            letterSpacing: 1,
          }}
        >
          ↺ New Puzzle
        </button>
      </div>

      {showHint && (
        <div style={{
          maxWidth: 480,
          background: '#f39c1211',
          border: '1px solid #f39c1233',
          borderRadius: 10,
          padding: '12px 18px',
          color: '#f39c12',
          fontSize: 14,
          textAlign: 'center',
        }}>
          {hint}
        </div>
      )}
    </>
  );
}
