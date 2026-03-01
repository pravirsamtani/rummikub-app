import { useState } from 'react';

const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];

const DIFF_META = {
  easy:   { color: '#27ae60', border: '#27ae6044', bg: '#27ae6022', desc: '1 tile to place · one rearranging move needed' },
  medium: { color: '#f39c12', border: '#f39c1244', bg: '#f39c1222', desc: '2 tiles to place · multiple moves needed' },
  hard:   { color: '#e74c3c', border: '#e74c3c44', bg: '#e74c3c22', desc: '2 tiles · sequential extractions or reformations' },
  expert: { color: '#9b59b6', border: '#9b59b644', bg: '#9b59b622', desc: '3–4 tiles · complex board · jokers in the mix' },
};

export default function StartScreen({ onStart, onInfo }) {
  const [selected, setSelected] = useState('easy');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: 'Georgia, serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: 32,
    }}>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          margin: 0,
          fontSize: 52,
          fontWeight: 900,
          letterSpacing: 4,
          background: 'linear-gradient(90deg, #f4d03f, #f39c12)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          RUMMIKUB
        </h1>
        <p style={{ color: '#a0aec0', margin: '8px 0 0', fontSize: 14, letterSpacing: 4, textTransform: 'uppercase' }}>
          Puzzle Mode
        </p>
        <p style={{ color: '#4a5568', margin: '6px 0 0', fontSize: 13 }}>
          Rearrange the board · place your tiles · win
        </p>
      </div>

      {/* Difficulty picker */}
      <div style={{ width: '100%', maxWidth: 420 }}>
        <p style={{ color: '#718096', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
          Choose difficulty
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DIFFICULTIES.map(d => {
            const { color, border, bg, desc } = DIFF_META[d];
            const active = d === selected;
            return (
              <button
                key={d}
                onClick={() => setSelected(d)}
                style={{
                  padding: '14px 20px',
                  borderRadius: 10,
                  border: `1.5px solid ${active ? color : border}`,
                  background: active ? bg : 'transparent',
                  color: active ? color : '#718096',
                  cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 15, fontWeight: active ? 700 : 400, textTransform: 'capitalize' }}>
                  {d}
                </span>
                <span style={{ fontSize: 12, color: active ? color + 'cc' : '#4a5568' }}>
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Play button */}
      <button
        onClick={() => onStart(selected)}
        style={{
          padding: '14px 60px',
          borderRadius: 12,
          background: 'linear-gradient(90deg, #f4d03f, #f39c12)',
          border: 'none',
          color: '#1a1a2e',
          fontWeight: 900,
          fontSize: 18,
          cursor: 'pointer',
          fontFamily: 'Georgia, serif',
          letterSpacing: 2,
          boxShadow: '0 4px 20px #f39c1244',
          transition: 'transform 0.1s',
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        PLAY
      </button>

      {/* How to Play */}
      <button
        onClick={onInfo}
        style={{
          background: 'none',
          border: 'none',
          color: '#4a5568',
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: 'Georgia, serif',
          textDecoration: 'underline',
          padding: 0,
        }}
      >
        How to Play
      </button>
    </div>
  );
}
