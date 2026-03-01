import { useState, useRef, useCallback } from "react";

const COLORS = ["#E63946", "#2196F3", "#FF9800", "#2E7D32"];
const COLOR_NAMES = ["red", "blue", "orange", "green"];
const COLOR_LIGHT = ["#FFEBEE", "#E3F2FD", "#FFF3E0", "#E8F5E9"];

function makeTile(color, number) {
  return { id: `${COLOR_NAMES[color]}-${number}`, color, number };
}

function isValidSet(tiles) {
  if (tiles.length < 3) return false;
  const nums = tiles.map(t => t.number);
  const cols = tiles.map(t => t.color);
  // Run: same color, consecutive numbers
  const sorted = [...tiles].sort((a, b) => a.number - b.number);
  const isRun =
    new Set(sorted.map(t => t.color)).size === 1 &&
    sorted.every((t, i) => i === 0 || t.number === sorted[i - 1].number + 1);
  // Group: same number, different colors
  const isGroup =
    new Set(nums).size === 1 && new Set(cols).size === tiles.length && tiles.length <= 4;
  return isRun || isGroup;
}

function generatePuzzle() {
  // Build a valid board state, then create a puzzle where one tile (the hand tile) needs to be inserted
  // Strategy: make 2-3 valid sets, then pull one tile out that could extend or merge a set
  const sets = [
    [makeTile(0, 5), makeTile(0, 6), makeTile(0, 7), makeTile(0, 8)], // red run 5-8
    [makeTile(0, 3), makeTile(1, 3), makeTile(2, 3)],                  // group of 3s
    [makeTile(1, 9), makeTile(1, 10), makeTile(1, 11)],                // blue run 9-11
  ];
  // Hand tile: red 9, which can extend the red run or be placed with a rearrangement
  const handTile = makeTile(0, 9);
  
  // Flatten board tiles with group metadata
  const boardTiles = sets.flatMap((set, si) =>
    set.map((tile, ti) => ({ ...tile, groupId: si, pos: ti }))
  );

  return { boardTiles, handTile, sets };
}

// ─── Tile Component ────────────────────────────────────────────────────────────
function Tile({ tile, size = "md", dragging = false, onDragStart, ghost = false, glow = false }) {
  const sz = size === "sm" ? 44 : size === "lg" ? 64 : 52;
  const fs = size === "sm" ? 15 : size === "lg" ? 22 : 18;

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      style={{
        width: sz,
        height: sz + 8,
        borderRadius: 6,
        background: ghost
          ? "transparent"
          : `linear-gradient(145deg, #fffff8, #f0ede0)`,
        border: `2px solid ${ghost ? "#ccc4" : glow ? COLORS[tile.color] : "#d4c9a8"}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: onDragStart ? "grab" : "default",
        opacity: dragging ? 0.4 : ghost ? 0.3 : 1,
        boxShadow: ghost
          ? "none"
          : glow
          ? `0 0 12px ${COLORS[tile.color]}88, 2px 3px 6px #0002`
          : "2px 3px 6px #0002, inset 0 1px 0 #fff8",
        transition: "box-shadow 0.2s, border-color 0.2s",
        userSelect: "none",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {!ghost && (
        <>
          <span style={{ fontSize: fs, fontWeight: 800, color: COLORS[tile.color], fontFamily: "'Georgia', serif", lineHeight: 1 }}>
            {tile.number}
          </span>
          <span style={{ fontSize: 7, color: COLORS[tile.color] + "99", marginTop: 1, fontFamily: "Georgia, serif" }}>
            {tile.number}
          </span>
        </>
      )}
    </div>
  );
}

// ─── Group on Board ────────────────────────────────────────────────────────────
function TileGroup({ tiles, groupId, onDragStartTile, dragState, onDropOnGroup, onDropBetween, valid }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: "10px 12px",
        borderRadius: 10,
        background: valid === false ? "#ff000011" : valid === true ? "#00ff0011" : "#ffffff18",
        border: `1.5px solid ${valid === false ? "#f006" : valid === true ? "#0f06" : "#ffffff22"}`,
        transition: "background 0.3s, border-color 0.3s",
        position: "relative",
        alignItems: "center",
      }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.stopPropagation(); onDropOnGroup(groupId); }}
    >
      {tiles.map((tile, i) => (
        <div key={tile.id} style={{ position: "relative", display: "flex", alignItems: "center" }}>
          {/* Drop zone between tiles */}
          <div
            style={{ width: 8, height: 60, position: "absolute", left: -6, zIndex: 2, cursor: "crosshair" }}
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
        style={{ width: 16, minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.4 }}
        onDragOver={e => { e.preventDefault(); }}
        onDrop={e => { e.stopPropagation(); onDropBetween(groupId, tiles.length); }}
      >
        <span style={{ color: "#fff5", fontSize: 20 }}>+</span>
      </div>
    </div>
  );
}

// ─── Main Game ─────────────────────────────────────────────────────────────────
export default function RummikubPuzzle() {
  const [puzzle] = useState(() => generatePuzzle());
  const [groups, setGroups] = useState(() => {
    const g = {};
    puzzle.sets.forEach((set, i) => { g[i] = set; });
    return g;
  });
  const [handTile, setHandTile] = useState(puzzle.handTile);
  const [dragState, setDragState] = useState(null);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [validationMap, setValidationMap] = useState({});
  const nextGroupId = useRef(Object.keys(puzzle.sets).length);

  const validateAll = useCallback((grps) => {
    const vm = {};
    Object.entries(grps).forEach(([gid, tiles]) => {
      if (tiles.length === 0) { vm[gid] = null; return; }
      vm[gid] = isValidSet(tiles);
    });
    setValidationMap(vm);
    const allValid = Object.values(vm).every(v => v === true || v === null);
    return allValid;
  }, []);

  const handleDragStartTile = (e, tile, fromGroupId) => {
    setDragState({ tile, fromGroupId, fromHand: false });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragStartHand = (e) => {
    setDragState({ tile: handTile, fromHand: true });
    e.dataTransfer.effectAllowed = "move";
  };

  const removeTileFromSource = (grps, ds) => {
    if (ds.fromHand) return grps;
    return {
      ...grps,
      [ds.fromGroupId]: grps[ds.fromGroupId].filter(t => t.id !== ds.tile.id)
    };
  };

  const handleDropOnGroup = (toGroupId) => {
    if (!dragState) return;
    let grps = removeTileFromSource({ ...groups }, dragState);
    grps[toGroupId] = [...(grps[toGroupId] || []), dragState.tile];
    if (dragState.fromHand) setHandTile(null);
    setGroups(grps);
    const allValid = validateAll(grps);
    if (allValid && !handTile && !dragState.fromHand) setSolved(true);
    if (allValid && dragState.fromHand) setSolved(true);
    setDragState(null);
  };

  const handleDropBetween = (toGroupId, index) => {
    if (!dragState) return;
    let grps = removeTileFromSource({ ...groups }, dragState);
    const arr = [...(grps[toGroupId] || [])];
    arr.splice(index, 0, dragState.tile);
    grps[toGroupId] = arr;
    if (dragState.fromHand) setHandTile(null);
    setGroups(grps);
    const allValid = validateAll(grps);
    if (allValid && dragState.fromHand) setSolved(true);
    setDragState(null);
  };

  const handleDropNewGroup = (e) => {
    e.preventDefault();
    if (!dragState) return;
    const id = nextGroupId.current++;
    let grps = removeTileFromSource({ ...groups }, dragState);
    grps[id] = [dragState.tile];
    if (dragState.fromHand) setHandTile(null);
    setGroups(grps);
    validateAll(grps);
    setDragState(null);
  };

  const hint = "Try placing your Red 9 at the end of the Red run (5-6-7-8) to make 5-6-7-8-9!";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      fontFamily: "'Georgia', serif",
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 24,
    }}>
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{
          margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: 2,
          background: "linear-gradient(90deg, #f4d03f, #f39c12)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          fontFamily: "Georgia, serif",
        }}>RUMMIKUB</h1>
        <p style={{ color: "#a0aec0", margin: "4px 0 0", fontSize: 13, letterSpacing: 3, textTransform: "uppercase" }}>
          Puzzle Mode · Level 1
        </p>
      </div>

      {/* Objective */}
      <div style={{
        background: "#ffffff0a", border: "1px solid #ffffff18", borderRadius: 10,
        padding: "10px 20px", color: "#e2e8f0", fontSize: 14, textAlign: "center", maxWidth: 480,
      }}>
        🎯 Place your tile on the board by rearranging the existing tiles into valid sets and runs.
      </div>

      {/* Board */}
      <div style={{ width: "100%", maxWidth: 640 }}>
        <div style={{ color: "#718096", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
          Board
        </div>
        <div
          style={{
            minHeight: 180, background: "#0d1b2a", borderRadius: 14,
            border: "1.5px solid #ffffff15", padding: 16,
            display: "flex", flexWrap: "wrap", gap: 12, alignContent: "flex-start",
          }}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDropNewGroup}
        >
          {Object.entries(groups).map(([gid, tiles]) =>
            tiles.length > 0 ? (
              <TileGroup
                key={gid}
                groupId={Number(gid)}
                tiles={tiles}
                onDragStartTile={handleDragStartTile}
                dragState={dragState}
                onDropOnGroup={handleDropOnGroup}
                onDropBetween={handleDropBetween}
                valid={validationMap[gid]}
              />
            ) : null
          )}
          <div style={{ color: "#ffffff18", fontSize: 12, alignSelf: "center", marginLeft: 8 }}>
            Drop here to start a new group
          </div>
        </div>
      </div>

      {/* Hand */}
      <div style={{ width: "100%", maxWidth: 640 }}>
        <div style={{ color: "#718096", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
          Your Tile
        </div>
        <div style={{
          minHeight: 90, background: "#1a0a00", borderRadius: 14,
          border: "1.5px solid #f39c1233", padding: 16,
          display: "flex", gap: 8, alignItems: "center",
        }}>
          {handTile ? (
            <Tile tile={handTile} onDragStart={handleDragStartHand} glow size="lg" />
          ) : (
            <span style={{ color: "#f39c1255", fontSize: 13 }}>Tile placed ✓</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => setShowHint(h => !h)}
          style={{
            padding: "10px 22px", borderRadius: 8, border: "1.5px solid #f39c1244",
            background: showHint ? "#f39c1222" : "transparent",
            color: "#f39c12", cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif",
            letterSpacing: 1,
          }}
        >
          💡 {showHint ? "Hide" : "Show"} Hint
        </button>
        <button
          onClick={() => { window.location.reload(); }}
          style={{
            padding: "10px 22px", borderRadius: 8, border: "1.5px solid #4a5568",
            background: "transparent", color: "#a0aec0", cursor: "pointer", fontSize: 13,
            fontFamily: "Georgia, serif", letterSpacing: 1,
          }}
        >
          ↺ New Puzzle
        </button>
      </div>

      {/* Hint */}
      {showHint && (
        <div style={{
          maxWidth: 480, background: "#f39c1211", border: "1px solid #f39c1233",
          borderRadius: 10, padding: "12px 18px", color: "#f39c12", fontSize: 14, textAlign: "center",
        }}>
          {hint}
        </div>
      )}

      {/* Win overlay */}
      {solved && (
        <div style={{
          position: "fixed", inset: 0, background: "#000a",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1a1a2e, #0f3460)",
            border: "2px solid #f4d03f", borderRadius: 20, padding: "40px 60px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 48 }}>🏆</div>
            <h2 style={{ color: "#f4d03f", fontSize: 28, margin: "12px 0 8px" }}>Puzzle Solved!</h2>
            <p style={{ color: "#a0aec0", fontSize: 14 }}>Excellent rearrangement.</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 20, padding: "12px 32px", borderRadius: 10,
                background: "linear-gradient(90deg, #f4d03f, #f39c12)",
                border: "none", color: "#1a1a2e", fontWeight: 800, fontSize: 15,
                cursor: "pointer", fontFamily: "Georgia, serif",
              }}
            >Next Puzzle →</button>
          </div>
        </div>
      )}
    </div>
  );
}
