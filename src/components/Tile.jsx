import { COLORS } from '../engine/tiles.js';

const SIZE = { sm: [44, 15], md: [52, 18], lg: [64, 22] };

/**
 * A single Rummikub tile.
 *
 * @param {{ tile, size?, dragging?, onDragStart?, ghost?, glow? }} props
 */
export default function Tile({ tile, size = 'md', dragging = false, onDragStart, ghost = false, glow = false }) {
  const [sz, fs] = SIZE[size] ?? SIZE.md;

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      style={{
        width: sz,
        height: sz + 8,
        borderRadius: 6,
        background: ghost ? 'transparent' : 'linear-gradient(145deg, #fffff8, #f0ede0)',
        border: `2px solid ${ghost ? '#ccc4' : glow ? COLORS[tile.color] : '#d4c9a8'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onDragStart ? 'grab' : 'default',
        opacity: dragging ? 0.4 : ghost ? 0.3 : 1,
        boxShadow: ghost
          ? 'none'
          : glow
          ? `0 0 12px ${COLORS[tile.color]}88, 2px 3px 6px #0002`
          : '2px 3px 6px #0002, inset 0 1px 0 #fff8',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        userSelect: 'none',
        flexShrink: 0,
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
