import { useState, useRef } from 'react';
import { generatePuzzle } from '../engine/generator.js';
import { isValidSet } from '../engine/validator.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildGameState(puzzle) {
  const groups = {};
  puzzle.boardGroups.forEach((group, i) => { groups[i] = group; });
  return { puzzle, groups, handTiles: puzzle.handTiles };
}

function computeValidationMap(groups) {
  const vm = {};
  Object.entries(groups).forEach(([gid, tiles]) => {
    vm[gid] = tiles.length === 0 ? null : isValidSet(tiles);
  });
  return vm;
}

function isWon(groups, handTiles) {
  if (handTiles.length > 0) return false;
  const nonEmpty = Object.values(groups).filter(g => g.length > 0);
  return nonEmpty.length > 0 && nonEmpty.every(isValidSet);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameState() {
  const [difficulty, setDifficulty] = useState('easy');
  const [gs, setGs] = useState(() => buildGameState(generatePuzzle('easy')));
  const [dragState, setDragState] = useState(null);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [validationMap, setValidationMap] = useState({});
  const nextGroupId = useRef(gs.puzzle.boardGroups.length);

  // ── New puzzle ──────────────────────────────────────────────────────────────
  const newPuzzle = (newDifficulty = difficulty) => {
    const puzzle = generatePuzzle(newDifficulty);
    nextGroupId.current = puzzle.boardGroups.length;
    setGs(buildGameState(puzzle));
    setDragState(null);
    setSolved(false);
    setShowHint(false);
    setValidationMap({});
    if (newDifficulty !== difficulty) setDifficulty(newDifficulty);
  };

  // ── Drag start ──────────────────────────────────────────────────────────────
  const onDragStartTile = (e, tile, fromGroupId) => {
    setDragState({ tile, fromGroupId, fromHand: false });
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragStartHand = (e, tile) => {
    setDragState({ tile, fromHand: true });
    e.dataTransfer.effectAllowed = 'move';
  };

  // ── Core drop logic ─────────────────────────────────────────────────────────
  const commitDrop = (toGroupId, insertIndex) => {
    if (!dragState) return;

    const grps = { ...gs.groups };

    if (!dragState.fromHand) {
      grps[dragState.fromGroupId] = gs.groups[dragState.fromGroupId].filter(
        t => t.id !== dragState.tile.id,
      );
    }

    const dest = [...(grps[toGroupId] || [])];
    if (insertIndex !== undefined) {
      dest.splice(insertIndex, 0, dragState.tile);
    } else {
      dest.push(dragState.tile);
    }
    grps[toGroupId] = dest;

    const newHandTiles = dragState.fromHand
      ? gs.handTiles.filter(t => t.id !== dragState.tile.id)
      : gs.handTiles;

    setGs(prev => ({ ...prev, groups: grps, handTiles: newHandTiles }));
    setValidationMap(computeValidationMap(grps));
    if (isWon(grps, newHandTiles)) setSolved(true);
    setDragState(null);
  };

  const onDropOnGroup = (toGroupId) => commitDrop(toGroupId, undefined);

  const onDropBetween = (toGroupId, index) => commitDrop(toGroupId, index);

  const onDropNewGroup = (e) => {
    e.preventDefault();
    if (!dragState) return;
    const id = nextGroupId.current++;
    commitDrop(id, undefined);
  };

  const onToggleHint = () => setShowHint(h => !h);

  return {
    groups: gs.groups,
    handTiles: gs.handTiles,
    hint: gs.puzzle.hint,
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
  };
}
