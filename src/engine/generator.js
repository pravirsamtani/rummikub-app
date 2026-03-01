import { makeTile, makeJoker, resetJokerSeq, TILE_MAX } from './tiles.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Filler ───────────────────────────────────────────────────────────────────

/**
 * Generate one additional valid set whose tiles are all unused.
 * jokerChance (0–1): probability of replacing one tile with a joker wildcard.
 */
function generateFillerSet(usedIds, jokerChance = 0) {
  for (let attempt = 0; attempt < 30; attempt++) {
    let tiles;
    if (Math.random() < 0.5) {
      const color = Math.floor(Math.random() * 4);
      const length = Math.floor(Math.random() * 2) + 3;
      const maxStart = TILE_MAX - length + 1;
      const start = Math.floor(Math.random() * maxStart) + 1;
      tiles = Array.from({ length }, (_, i) => makeTile(color, start + i));
    } else {
      const number = Math.floor(Math.random() * TILE_MAX) + 1;
      const colors = shuffle([0, 1, 2, 3]).slice(0, 3);
      tiles = colors.map(c => makeTile(c, number));
    }

    if (!tiles.every(t => !usedIds.has(t.id))) continue;

    if (jokerChance > 0 && Math.random() < jokerChance) {
      // Replace one tile with a joker — the set remains valid by construction
      const idx = Math.floor(Math.random() * tiles.length);
      const withJoker = [...tiles];
      withJoker[idx] = makeJoker();
      return withJoker;
    }

    return tiles;
  }
  return null;
}

// ─── Sub-builders ─────────────────────────────────────────────────────────────

/**
 * Build N independent single-extraction sub-puzzles on N different colors.
 * Each hand tile requires one extraction: drag color C out of a 4-color group
 * to extend a run, then place the hand tile at the run's new end.
 */
function buildExtractionN(n, numFillers, jokerChance = 0) {
  for (let attempt = 0; attempt < 80; attempt++) {
    const usedIds = new Set();
    const boardGroups = [];
    const handTiles = [];
    const hintParts = [];
    const colors = shuffle([0, 1, 2, 3]);
    let success = true;

    for (let i = 0; i < n; i++) {
      const C = colors[i];
      const L = Math.floor(Math.random() * 2) + 3;
      const forward = Math.random() < 0.5;

      let M, run, handNum;
      if (forward) {
        const minM = L + 1, maxM = TILE_MAX - 1;
        if (minM > maxM) { success = false; break; }
        M = minM + Math.floor(Math.random() * (maxM - minM + 1));
        const A = M - L;
        run = Array.from({ length: L }, (_, k) => makeTile(C, A + k));
        handNum = M + 1;
      } else {
        const minM = 2, maxM = TILE_MAX - L;
        if (minM > maxM) { success = false; break; }
        M = minM + Math.floor(Math.random() * (maxM - minM + 1));
        run = Array.from({ length: L }, (_, k) => makeTile(C, M + 1 + k));
        handNum = M - 1;
      }

      const group4   = [0, 1, 2, 3].map(c => makeTile(c, M));
      const handTile = makeTile(C, handNum);
      const allNew   = [...run, ...group4, handTile];

      if (allNew.some(t => usedIds.has(t.id))) { success = false; break; }
      allNew.forEach(t => usedIds.add(t.id));
      boardGroups.push(group4, run);
      handTiles.push(handTile);

      hintParts.push(
        n === 1
          ? `One of the groups has a tile that belongs in a run — free it first.`
          : `(${i + 1}) A tile locked inside one of the groups belongs in a run. Free it, then place your hand tile.`,
      );
    }

    if (!success) continue;

    for (let f = 0; f < numFillers; f++) {
      const filler = generateFillerSet(usedIds, jokerChance);
      if (filler) { filler.forEach(t => usedIds.add(t.id)); boardGroups.push(filler); }
    }

    return { boardGroups, handTiles, hint: hintParts.join('. ') + '.' };
  }
  return null;
}

/**
 * "Reformation": a 3-tile run must be dismantled to complete two 3-color groups.
 * The last run tile is left alone; the 2 hand tiles combine with it into a new group.
 * Solution requires thinking backwards from the goal state.
 */
function buildReformation(numFillers, jokerChance = 0) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const usedIds = new Set();
    const boardGroups = [];

    const N = 1 + Math.floor(Math.random() * (TILE_MAX - 2));
    const [Cr, C1, C2, C3] = shuffle([0, 1, 2, 3]);

    const run     = [makeTile(Cr, N), makeTile(Cr, N + 1), makeTile(Cr, N + 2)];
    const groupN  = [makeTile(C1, N),     makeTile(C2, N),     makeTile(C3, N)];
    const groupN1 = [makeTile(C1, N + 1), makeTile(C2, N + 1), makeTile(C3, N + 1)];
    const hand1   = makeTile(C1, N + 2);
    const hand2   = makeTile(C2, N + 2);

    const allTiles = [...run, ...groupN, ...groupN1, hand1, hand2];
    if (allTiles.some(t => usedIds.has(t.id))) continue;
    allTiles.forEach(t => usedIds.add(t.id));
    boardGroups.push(run, groupN, groupN1);

    for (let f = 0; f < numFillers; f++) {
      const filler = generateFillerSet(usedIds, jokerChance);
      if (filler) { filler.forEach(t => usedIds.add(t.id)); boardGroups.push(filler); }
    }

    const hint =
      `A run on the board is hiding tiles that two incomplete groups are missing. ` +
      `Breaking it up could open new possibilities.`;

    return { boardGroups, handTiles: [hand1, hand2], hint };
  }
  return null;
}

/**
 * "Double Chain": placing the first hand tile requires 2 sequential extractions
 * (extract C M, then C M+1 from two separate groups), forcing planned multi-step play.
 * A second hand tile uses a standard single extraction.
 */
function buildDoubleChain(jokerChance = 0) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const usedIds = new Set();
    const boardGroups = [];
    const handTiles = [];
    const hintParts = [];
    const colors = shuffle([0, 1, 2, 3]);
    const C1 = colors[0];
    const C2 = colors[1];

    // Sub-puzzle 1: double chain for C1
    const L1 = Math.floor(Math.random() * 2) + 3;
    const minM1 = L1 + 1, maxM1 = TILE_MAX - 2;
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
      `(1) One hand tile needs two consecutive tiles freed from separate groups before it can be placed.`,
    );

    // Sub-puzzle 2: single extraction for C2
    const L2 = Math.floor(Math.random() * 2) + 3;
    const forward2 = Math.random() < 0.5;
    let placed2 = false;

    for (let t2 = 0; t2 < 30; t2++) {
      let M2, run2, handNum2;
      if (forward2) {
        const minM2 = L2 + 1, maxM2 = TILE_MAX - 1;
        if (minM2 > maxM2) break;
        M2 = minM2 + Math.floor(Math.random() * (maxM2 - minM2 + 1));
        const A2 = M2 - L2;
        run2 = Array.from({ length: L2 }, (_, i) => makeTile(C2, A2 + i));
        handNum2 = M2 + 1;
      } else {
        const minM2 = 2, maxM2 = TILE_MAX - L2;
        if (minM2 > maxM2) break;
        M2 = minM2 + Math.floor(Math.random() * (maxM2 - minM2 + 1));
        run2 = Array.from({ length: L2 }, (_, i) => makeTile(C2, M2 + 1 + i));
        handNum2 = M2 - 1;
      }

      const g4_M2 = [0, 1, 2, 3].map(c => makeTile(c, M2));
      const hand2 = makeTile(C2, handNum2);
      const tiles2 = [...run2, ...g4_M2, hand2];
      if (tiles2.some(t => usedIds.has(t.id))) continue;

      tiles2.forEach(t => usedIds.add(t.id));
      boardGroups.push(g4_M2, run2);
      handTiles.push(hand2);
      hintParts.push(
        `(2) Your other hand tile needs a single tile freed from a group to extend a run.`,
      );
      placed2 = true;
      break;
    }
    if (!placed2) continue;

    for (let f = 0; f < 2; f++) {
      const filler = generateFillerSet(usedIds, jokerChance);
      if (filler) { filler.forEach(t => usedIds.add(t.id)); boardGroups.push(filler); }
    }

    return { boardGroups, handTiles, hint: hintParts.join('. ') + '.' };
  }
  return null;
}

// ─── Entry point ──────────────────────────────────────────────────────────────

/**
 * Difficulty levels:
 *   easy   — 1 hand tile, one extraction needed (no rearranging required on easy)
 *   medium — 2 hand tiles, two extractions OR a reformation (was "hard")
 *   hard   — 2 hand tiles, double chain OR heavy reformation (was "expert")
 *   expert — 3–4 hand tiles, jokers appear in ~35% of filler sets
 *
 * @param {'easy'|'medium'|'hard'|'expert'} difficulty
 */
export function generatePuzzle(difficulty = 'easy') {
  resetJokerSeq();

  if (difficulty === 'easy') {
    const numFillers = Math.random() < 0.5 ? 1 : 2;
    return buildExtractionN(1, numFillers, 0)
        ?? buildExtractionN(1, 1, 0);
  }

  if (difficulty === 'medium') {
    const useReformation = Math.random() < 0.5;
    return (useReformation ? buildReformation(1, 0) : buildExtractionN(2, 1, 0))
        ?? buildExtractionN(2, 1, 0)
        ?? buildExtractionN(1, 1, 0);
  }

  if (difficulty === 'hard') {
    const useDoubleChain = Math.random() < 0.5;
    return (useDoubleChain ? buildDoubleChain(0.2) : buildReformation(3, 0.2))
        ?? buildDoubleChain(0)
        ?? buildReformation(2, 0);
  }

  // Expert: 3 or 4 hand tiles, jokers in ~35% of fillers
  const n = Math.random() < 0.6 ? 3 : 4;
  return buildExtractionN(n, 2, 0.35)
      ?? buildExtractionN(3, 2, 0.35)
      ?? buildExtractionN(2, 2, 0.2);
}
