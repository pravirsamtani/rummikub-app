import Tile from './Tile.jsx';

/**
 * Renders one group of tiles on the board, with drop zones between tiles.
 *
 * @param {{
 *   tiles:           Array,
 *   groupId:         number,
 *   valid:           boolean|null,
 *   dragState:       object|null,
 *   onDragStartTile: Function,
 *   onDropOnGroup:   Function,
 *   onDropBetween:   Function,
 * }} props
 */
export default function TileGroup({ tiles, groupId, valid, dragState, onDragStartTile, onDropOnGroup, onDropBetween }) {
  const borderColor =
    valid === false ? '#f006' :
    valid === true  ? '#0f06' :
                      '#ffffff22';
  const bgColor =
    valid === false ? '#ff000011' :
    valid === true  ? '#00ff0011' :
                      '#ffffff18';

  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        padding: '10px 12px',
        borderRadius: 10,
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        transition: 'background 0.3s, border-color 0.3s',
        alignItems: 'center',
        position: 'relative',
      }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.stopPropagation(); onDropOnGroup(groupId); }}
    >
      {tiles.map((tile, i) => (
        <div key={tile.id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {/* Drop zone before this tile */}
          <div
            style={{ width: 8, height: 60, position: 'absolute', left: -6, zIndex: 2, cursor: 'crosshair' }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.stopPropagation(); onDropBetween(groupId, i); }}
          />
          <Tile
            tile={tile}
            onDragStart={e => onDragStartTile(e, tile, groupId)}
            dragging={dragState?.tile?.id === tile.id}
          />
        </div>
      ))}

      {/* Drop zone after last tile */}
      <div
        style={{ width: 16, minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.stopPropagation(); onDropBetween(groupId, tiles.length); }}
      >
        <span style={{ color: '#fff5', fontSize: 20 }}>+</span>
      </div>
    </div>
  );
}
