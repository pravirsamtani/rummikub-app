import Tile from './Tile.jsx';

/** Displays the player's hand tiles (the ones they must place). */
export default function Hand({ handTiles, onDragStart }) {
  const count = handTiles.length;

  return (
    <div style={{ width: '100%', maxWidth: 680 }}>
      <div style={{ color: '#718096', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
        Your {count !== 1 ? 'Tiles' : 'Tile'}
        {count > 0 && (
          <span style={{ color: '#f39c1288', marginLeft: 8 }}>({count} remaining)</span>
        )}
      </div>
      <div style={{
        minHeight: 90,
        background: '#1a0a00',
        borderRadius: 14,
        border: '1.5px solid #f39c1233',
        padding: 16,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}>
        {count > 0
          ? handTiles.map(tile => (
              <Tile
                key={tile.id}
                tile={tile}
                onDragStart={(e) => onDragStart(e, tile)}
                glow
                size="lg"
              />
            ))
          : <span style={{ color: '#f39c1255', fontSize: 13 }}>All tiles placed ✓</span>
        }
      </div>
    </div>
  );
}
