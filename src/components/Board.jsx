import TileGroup from './TileGroup.jsx';

/**
 * The main board area showing all tile groups.
 * Dropping onto the board background starts a new group.
 */
export default function Board({ groups, dragState, validationMap, onDragStartTile, onDropOnGroup, onDropBetween, onDropNewGroup }) {
  return (
    <div style={{ width: '100%', maxWidth: 680 }}>
      <div style={{ color: '#718096', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
        Board
      </div>
      <div
        style={{
          minHeight: 180,
          background: '#0d1b2a',
          borderRadius: 14,
          border: '1.5px solid #ffffff15',
          padding: 16,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignContent: 'flex-start',
        }}
        onDragOver={e => e.preventDefault()}
        onDrop={onDropNewGroup}
      >
        {Object.entries(groups).map(([gid, tiles]) =>
          tiles.length > 0 ? (
            <TileGroup
              key={gid}
              groupId={Number(gid)}
              tiles={tiles}
              valid={validationMap[gid] ?? null}
              dragState={dragState}
              onDragStartTile={onDragStartTile}
              onDropOnGroup={onDropOnGroup}
              onDropBetween={onDropBetween}
            />
          ) : null
        )}
        <div style={{ color: '#ffffff18', fontSize: 12, alignSelf: 'center', marginLeft: 4 }}>
          Drop here to start a new group
        </div>
      </div>
    </div>
  );
}
