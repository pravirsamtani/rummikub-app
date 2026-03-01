/** Full-screen modal shown when the puzzle is solved. */
export default function WinOverlay({ solved, onNewPuzzle }) {
  if (!solved) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#000a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
        border: '2px solid #f4d03f',
        borderRadius: 20,
        padding: '40px 60px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48 }}>🏆</div>
        <h2 style={{ color: '#f4d03f', fontSize: 28, margin: '12px 0 8px', fontFamily: 'Georgia, serif' }}>
          Puzzle Solved!
        </h2>
        <p style={{ color: '#a0aec0', fontSize: 14, fontFamily: 'Georgia, serif' }}>
          Excellent rearrangement.
        </p>
        <button
          onClick={() => onNewPuzzle()}
          style={{
            marginTop: 20,
            padding: '12px 32px',
            borderRadius: 10,
            background: 'linear-gradient(90deg, #f4d03f, #f39c12)',
            border: 'none',
            color: '#1a1a2e',
            fontWeight: 800,
            fontSize: 15,
            cursor: 'pointer',
            fontFamily: 'Georgia, serif',
          }}
        >
          Next Puzzle →
        </button>
      </div>
    </div>
  );
}
