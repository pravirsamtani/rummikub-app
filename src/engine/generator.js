import { makeTile, COLOR_NAMES, TILE_MAX } from './tiles.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateFillerSet(usedIds) {
  for (let attempt = 0; attempt < 30; attempt++) {
    if (Math.random() < 0.5) {
      const color = Math.floor(Math.random() * 4);
      const length = Math.floor(Math.random() * 2) + 3;
      const maxStart = TILE_MAX - length + 1;
      const start = Math.floor(Math.random() * maxStart) + 1;
      const tiles = Array.from({ length }, (_, i) => makeTile(color, start + i));
      if (tiles.every(t => !usedIds.has(t.id))) return tiles;
    } else {
      const number = Math.floor(Math.random() * TILE_MAX) + 1;
      const colors = shuffle([0, 1, 2, 3]).slice(0, 3);
      const tiles = colors.map(c => makeTile(c, number));
      if (tiles.every(t => !usedIds.has(t.id))) return tiles;
    }
  }
  return null;
}

// ─── Easy ─────────────────────────────────────────────────────────────────────
// One hand tile drops directly onto an incomplete set. No rearranging needed.

function generateEasyPuzzle() {
  const usedIds = new Set();
  const boardGroups = [];
  let handTile;
  let hint;

  const puzzleType = Math.random() < 0.5 ? 'run-extension' : 'group-completion';

  if (puzzleType === 'run-extension') {
    const color = Math.floor(Math.random() * 4);
    const runLength = Math.floor(Math.random() * 2) + 3;
    const handAtEnd = Math.random() < 0.5;

    let start, handNum;
    if (handAtEnd) {
      const maxStart = TILE_MAX - runLength;
      start = Math.floor(Math.random() * maxStart) + 1;
      handNum = start + runLength;
    } else {
      const maxStart = TILE_MAX - runLength + 1;
      start = Math.floor(Math.random() * (maxStart - 1)) + 2;
      handNum = start - 1;
    }

    const run = Array.from({ length: runLength }, (_, i) => makeTile(color, start + i));
    handTile = makeTile(color, handNum);
    run.forEach(t => usedIds.add(t.id));
    usedIds.add(handTile.id);
    boardGroups.push(run);

    const side = handAtEnd ? 'right end' : 'left end';
    hint =
      `Place the ${COLOR_NAMES[color]} ${handNum} at the ${side} of the ` +
      `${COLOR_NAMES[color]} run (${start}–${start + runLength - 1}) to extend it.`;
  } else {
    const number = Math.floor(Math.random() * TILE_MAX) + 1;
    const colorOrder = shuffle([0, 1, 2, 3]);
    const groupColors = colorOrder.slice(0, 3);
    const handColor = colorOrder[3];

    const group = groupColors.map(c => makeTile(c, number));
    handTile = makeTile(handColor, number);
    group.forEach(t => usedIds.add(t.id));
    usedIds.add(handTile.id);
    boardGroups.push(group);

    hint =
      `Add the ${COLOR_NAMES[handColor]} ${number} to complete the group of ` +
      `${number}s (all four colors).`;
  }

  const numFillers = Math.floor(Math.random() * 2) + 1;
  for (let f = 0; f < numFillers; f++) {
    const filler = generateFillerSet(usedIds);
    if (filler) { filler.forEach(t => usedIds.add(t.id)); boardGroups.push(filler); }
  }

  return { boardGroups, handTiles: [handTile], hint };
}

// ─── Medium ───────────────────────────────────────────────────────────────────
// One hand tile that cannot be placed directly.
// Board has a 4-color group of M and a same-color run stopping just before M.
// Solution: extract color C from the group (leaving a valid 3-color group),
// attach it to the run, then place the hand tile at the end.

function generateMediumPuzzle() {
  for (let attempt = 0; attempt < 50; attempt++) {
    const usedIds = new Set();
    const boardGroups = [];

    const C = Math.floor(Math.random() * 4);
    const L = Math.floor(Math.random() * 2) + 3;
    const forward = Math.random() < 0.5;

    let M, run, handNum, runStart, runEnd;

    if (forward) {
      const minM = L + 1, maxM = TILE_MAX - 1;
      if (minM > maxM) continue;
      M = minM + Math.floor(Math.random() * (maxM - minM + 1));
      const A = M - L;
      run = Array.from({ length: L }, (_, i) => makeTile(C, A + i));
      handNum = M + 1;
      runStart = A; runEnd = M - 1;
    } else {
      const minM = 2, maxM = TILE_MAX - L;
      if (minM > maxM) continue;
      M = minM + Math.floor(Math.random() * (maxM - minM + 1));
      run = Array.from({ length: L }, (_, i) => makeTile(C, M + 1 + i));
      handNum = M - 1;
      runStart = M + 1; runEnd = M + L;
    }

    const group4 = [0, 1, 2, 3].map(c => makeTile(c, M));
    const handTile = makeTile(C, handNum);
    const allTiles = [...run, ...group4, handTile];

    if (allTiles.some(t => usedIds.has(t.id))) continue;
    allTiles.forEach(t => usedIds.add(t.id));
    boardGroups.push(group4, run);

    const direction = forward ? 'after' : 'before';
    const hint =
      `Move the ${COLOR_NAMES[C]} ${M} out of the group of ${M}s — ` +
      `that bridges it to the ${COLOR_NAMES[C]} run (${runStart}–${runEnd}). ` +
      `Then place your hand tile ${direction} the extended run.`;

    const filler = generateFillerSet(usedIds);
    if (filler) { filler.forEach(t => usedIds.add(t.id)); boardGroups.push(filler); }

    return { boardGroups, handTiles: [handTile], hint };
  }

  return generateEasyPuzzle();
}

// ─── Shared sub-builders ──────────────────────────────────────────────────────

/**
 * "Extraction pair": two independent single-extraction sub-puzzles on different colors.
 * Each hand tile requires exactly one extraction move.
 * Returns { boardGroups, handTiles, hint } or null on failure.
 */
function buildExtractionPair(numFillers) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const usedIds = new Set();
    const boardGroups = [];
    const handTiles = [];
    const hintParts = [];
    const colors = shuffle([0, 1, 2, 3]);
    let success = true;

    for (let i = 0; i < 2; i++) {
      const C = colors[i];
      const L = Math.floor(Math.random() * 2) + 3;
      const forward = Math.random() < 0.5;

      let M, run, handNum, runStart, runEnd;
      if (forward) {
        const minM = L + 1, maxM = TILE_MAX - 1;
        if (minM > maxM) { success = false; break; }
        M = minM + Math.floor(Math.random() * (maxM - minM + 1));
        const A = M - L;
        run = Array.from({ length: L }, (_, k) => makeTile(C, A + k));
        handNum = M + 1; runStart = A; runEnd = M - 1;
      } else {
        const minM = 2, maxM = TILE_MAX - L;
        if (minM > maxM) { success = false; break; }
        M = minM + Math.floor(Math.random() * (maxM - minM + 1));
        run = Array.from({ length: L }, (_, k) => makeTile(C, M + 1 + k));
        handNum = M - 1; runStart = M + 1; runEnd = M + L;
      }

      const group4 = [0, 1, 2, 3].map(c => makeTile(c, M));
      const handTile = makeTile(C, handNum);
      const allNew = [...run, ...group4, handTile];

      if (allNew.some(t => usedIds.has(t.id))) { success = false; break; }
      allNew.forEach(t => usedIds.add(t.id));
      boardGroups.push(group4, run);
      handTiles.push(handTile);

      const dir = forward ? 'after' : 'before';
      hintParts.push(
        `(${i + 1}) Move the ${COLOR_NAMES[C]} ${M} out of the group of ${M}s ` +
        `to extend the ${COLOR_NAMES[C]} run (${runStart}–${runEnd}), ` +
        `then place the ${COLOR_NAMES[C]} ${handNum} ${dir} it`,
      );
    }

    if (!success) continue;

    for (let f = 0; f < numFillers; f++) {
      const filler = generateFillerSet(usedIds);
      if (filler) { filler.forEach(t => usedIds.add(t.id)); boardGroups.push(filler); }
    }

    return { boardGroups, handTiles, hint: hintParts.join('. ') + '.' };
  }
  return null;
}

/**
 * "Reformation": a 3-tile run must be dismantled to complete two 3-color groups,
 * leaving the run's final tile for the player to combine with 2 hand tiles into a new group.
 * The hand tiles CANNOT be placed directly anywhere on the board.
 * numFillers controls how full the board feels.
 */
function buildReformation(numFillers) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const usedIds = new Set();
    const boardGroups = [];

    // N+2 must be <= TILE_MAX
    const N = 1 + Math.floor(Math.random() * (TILE_MAX - 2));
    const [Cr, C1, C2, C3] = shuffle([0, 1, 2, 3]);

    // Board: run [Cr N, N+1, N+2], group of N [C1,C2,C3], group of N+1 [C1,C2,C3]
    const run     = [makeTile(Cr, N), makeTile(Cr, N + 1), makeTile(Cr, N + 2)];
    const groupN  = [makeTile(C1, N), makeTile(C2, N),     makeTile(C3, N)];
    const groupN1 = [makeTile(C1, N + 1), makeTile(C2, N + 1), makeTile(C3, N + 1)];

    // Hand: C1 and C2 at N+2  (with Cr N+2 from the run, forms a 3-color group)
    const hand1 = makeTile(C1, N + 2);
    const hand2 = makeTile(C2, N + 2);

    const allTiles = [...run, ...groupN, ...groupN1, hand1, hand2];
    // All 11 tiles are unique by construction (distinct color-number combos), but check anyway
    if (allTiles.some(t => usedIds.has(t.id))) continue;
    allTiles.forEach(t => usedIds.add(t.id));
    boardGroups.push(run, groupN, groupN1);

    for (let f = 0; f < numFillers; f++) {
      const filler = generateFillerSet(usedIds);
      if (filler) { filler.forEach(t => usedIds.add(t.id)); boardGroups.push(filler); }
    }

    const hint =
      `The ${COLOR_NAMES[Cr]} run hides the missing tiles for the two groups of ${N}s and ${N + 1}s. ` +
      `Move ${COLOR_NAMES[Cr]} ${N} into the group of ${N}s, ` +
      `then ${COLOR_NAMES[Cr]} ${N + 1} into the group of ${N + 1}s. ` +
      `Now place both hand tiles alongside the remaining ${COLOR_NAMES[Cr]} ${N + 2} to form a new group.`;

    return { boardGroups, handTiles: [hand1, hand2], hint };
  }
  return null;
}

// ─── Hard ─────────────────────────────────────────────────────────────────────
// Two hand tiles. Varies between:
//   A) Two independent single-extractions (different structure each game)
//   B) Reformation: dismantle a run to fill two 3-color groups, then place 2 hand tiles

function generateHardPuzzle() {
  const useReformation = Math.random() < 0.5;
  const result = useReformation
    ? buildReformation(1)
    : buildExtractionPair(1);
  return result ?? generateMediumPuzzle();
}

// ─── Expert ───────────────────────────────────────────────────────────────────
// Varies between two structurally different, multi-step patterns:
//   A) "Double Chain": placing one hand tile requires 2 sequential extractions
//      (extract C M, then C M+1 from two separate groups to extend a run,
//      then place C at M+2). Second hand tile uses a single extraction.
//   B) "Heavy Reformation": same as hard reformation but with 3 extra filler
//      sets to fill the board. Requires careful sequential thinking.

function generateExpertDoubleChain() {
  for (let attempt = 0; attempt < 60; attempt++) {
    const usedIds = new Set();
    const boardGroups = [];
    const handTiles = [];
    const hintParts = [];
    const colors = shuffle([0, 1, 2, 3]);
    const C1 = colors[0]; // color for the double-chain hand tile
    const C2 = colors[1]; // color for the single-extraction hand tile

    // ── Sub-puzzle 1: double chain for C1 ──────────────────────────────────
    // Board: group4 of M, group4 of M+1, run of C1 from A to M-1
    // Hand:  C1 at M+2  (needs 2 extractions before it can be placed)
    const L1 = Math.floor(Math.random() * 2) + 3;
    const minM1 = L1 + 1, maxM1 = TILE_MAX - 2; // M+2 <= TILE_MAX
    if (minM1 > maxM1) continue;
    const M1 = minM1 + Math.floor(Math.random() * (maxM1 - minM1 + 1));
    const A1 = M1 - L1;

    const run1    = Array.from({ length: L1 }, (_, i) => makeTile(C1, A1 + i));
    const g4_M1   = [0, 1, 2, 3].map(c => makeTile(c, M1));
    const g4_M1p1 = [0, 1, 2, 3].map(c => makeTile(c, M1 + 1));
    const hand1   = makeTile(C1, M1 + 2);

    const tiles1 = [...run1, ...g4_M1, ...g4_M1p1, hand1];
    if (tiles1.some(t => usedIds.has(t.id))) continue;
    tiles1.forEach(t => usedIds.add(t.id));
    boardGroups.push(g4_M1, g4_M1p1, run1);
    handTiles.push(hand1);
    hintParts.push(
      `(1) Extract ${COLOR_NAMES[C1]} ${M1} then ${COLOR_NAMES[C1]} ${M1 + 1} ` +
      `from their groups to extend the ${COLOR_NAMES[C1]} run (${A1}–${M1 - 1}), ` +
      `then place the ${COLOR_NAMES[C1]} ${M1 + 2}`,
    );

    // ── Sub-puzzle 2: single extraction for C2 ─────────────────────────────
    const L2 = Math.floor(Math.random() * 2) + 3;
    const forward2 = Math.random() < 0.5;
    let placed2 = false;

    for (let t2 = 0; t2 < 30; t2++) {
      let M2, run2, handNum2, runStart2, runEnd2;
      if (forward2) {
        const minM2 = L2 + 1, maxM2 = TILE_MAX - 1;
        if (minM2 > maxM2) break;
        M2 = minM2 + Math.floor(Math.random() * (maxM2 - minM2 + 1));
        const A2 = M2 - L2;
        run2 = Array.from({ length: L2 }, (_, i) => makeTile(C2, A2 + i));
        handNum2 = M2 + 1; runStart2 = A2; runEnd2 = M2 - 1;
      } else {
        const minM2 = 2, maxM2 = TILE_MAX - L2;
        if (minM2 > maxM2) break;
        M2 = minM2 + Math.floor(Math.random() * (maxM2 - minM2 + 1));
        run2 = Array.from({ length: L2 }, (_, i) => makeTile(C2, M2 + 1 + i));
        handNum2 = M2 - 1; runStart2 = M2 + 1; runEnd2 = M2 + L2;
      }

      const g4_M2 = [0, 1, 2, 3].map(c => makeTile(c, M2));
      const hand2 = makeTile(C2, handNum2);
      const tiles2 = [...run2, ...g4_M2, hand2];
      if (tiles2.some(t => usedIds.has(t.id))) continue;

      tiles2.forEach(t => usedIds.add(t.id));
      boardGroups.push(g4_M2, run2);
      handTiles.push(hand2);
      const dir = forward2 ? 'after' : 'before';
      hintParts.push(
        `(2) Move ${COLOR_NAMES[C2]} ${M2} out of the group of ${M2}s ` +
        `to extend the ${COLOR_NAMES[C2]} run (${runStart2}–${runEnd2}), ` +
        `then place the ${COLOR_NAMES[C2]} ${handNum2} ${dir} it`,
      );
      placed2 = true;
      break;
    }
    if (!placed2) continue;

    // Add 2 fillers to pack the board
    for (let f = 0; f < 2; f++) {
      const filler = generateFillerSet(usedIds);
      if (filler) { filler.forEach(t => usedIds.add(t.id)); boardGroups.push(filler); }
    }

    return { boardGroups, handTiles, hint: hintParts.join('. ') + '.' };
  }
  return null;
}

function generateExpertPuzzle() {
  if (Math.random() < 0.5) {
    const result = generateExpertDoubleChain();
    if (result) return result;
  }
  // Heavy reformation: same structure as hard reformation but a much fuller board
  const result = buildReformation(3);
  return result ?? generateHardPuzzle();
}

// ─── Entry point ──────────────────────────────────────────────────────────────

/**
 * @param {'easy'|'medium'|'hard'|'expert'} difficulty
 */
export function generatePuzzle(difficulty = 'easy') {
  if (difficulty === 'medium') return generateMediumPuzzle();
  if (difficulty === 'hard')   return generateHardPuzzle();
  if (difficulty === 'expert') return generateExpertPuzzle();
  return generateEasyPuzzle();
}
