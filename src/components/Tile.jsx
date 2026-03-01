import { COLORS } from '../engine/tiles.js';

const SIZE = { sm: [44, 15], md: [52, 18], lg: [64, 22] };

export default function Tile({ tile, size = 'md', dragging = false, onDragStart, ghost = false, glow = false }) {
  const [sz, fs] = SIZE[size] ?? SIZE.md;

  const base = {
    width: sz,
    height: sz + 8,
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: onDragStart ? 'grab' : 'default',
    opacity: dragging ? 0.4 : ghost ? 0.3 : 1,
    transition: 'box-shadow 0.2s, border-color 0.2s',
    userSelect: 'none',
    flexShrink: 0,
  };

  // ── Joker tile ───────────────────────────────────────────────────────────────
  if (tile.isJoker) {
    return (
      <div
        draggable={!!onDragStart}
        onDragStart={onDragStart}
        style={{
          ...base,
          background: ghost ? 'transparent' : 'linear-gradient(145deg, #12001a, #1a002a)',
          border: `2px solid ${ghost ? '#ccc4' : glow ? '#f4d03f' : '#f4d03f88'}`,
          boxShadow: ghost
            ? 'none'
            : glow
            ? '0 0 14px #f4d03faa, 2px 3px 6px #0002'
            : '0 0 6px #f4d03f44, 2px 3px 6px #0002',
        }}
      >
        {!ghost && (
          <span style={{
            fontSize: fs + 4,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #f4d03f, #e74c3c, #9b59b6, #2196F3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            ★
          </span>
        )}
      </div>
    );
  }

  // ── Normal tile ──────────────────────────────────────────────────────────────
  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      style={{
        ...base,
        background: ghost ? 'transparent' : 'linear-gradient(145deg, #fffff8, #f0ede0)',
        border: `2px solid ${ghost ? '#ccc4' : glow ? COLORS[tile.color] : '#d4c9a8'}`,
        boxShadow: ghost
          ? 'none'
          : glow
          ? `0 0 12px ${COLORS[tile.color]}88, 2px 3px 6px #0002`
          : '2px 3px 6px #0002, inset 0 1px 0 #fff8',
      }}
    >
      {!ghost && (
        <>
          <span style={{ fontSize: fs, fontWeight: 800, color: COLORS[tile.color], fontFamily: 'Georgia, serif', lineHeight: 1 }}>
            {tile.number}
          </span>
          <span style={{ fontSize: 7, color: COLORS[tile.color] + '99', marginTop: 1, fontFamily: 'Georgia, serif' }}>
            {tile.number}
          </span>
        </>
      )}
    </div>
  );
}
