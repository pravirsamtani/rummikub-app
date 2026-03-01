import { TILE_MAX } from './tiles.js';

/**
 * Returns true when `tiles` forms a valid Rummikub set.
 * Joker tiles (isJoker: true) act as wildcards.
 *
 *   Run:   ≥3 tiles of the SAME color with CONSECUTIVE numbers (jokers fill gaps / extend ends)
 *   Group: 3–4 tiles of the SAME number with DISTINCT colors (jokers fill missing colors)
 */
export function isValidSet(tiles) {
  if (tiles.length < 3) return false;

  const jokers = tiles.filter(t => t.isJoker);
  const real   = tiles.filter(t => !t.isJoker);

  if (jokers.length === 0) {
    // Fast path — original logic, no jokers
    const sorted = [...tiles].sort((a, b) => a.number - b.number);
    const isRun =
      new Set(sorted.map(t => t.color)).size === 1 &&
      sorted.every((t, i) => i === 0 || t.number === sorted[i - 1].number + 1);
    const isGroup =
      new Set(sorted.map(t => t.number)).size === 1 &&
      new Set(sorted.map(t => t.color)).size === tiles.length &&
      tiles.length <= 4;
    return isRun || isGroup;
  }

  if (real.length === 0) return false;

  // Try as GROUP: same number on real tiles, distinct colors, total ≤ 4
  const isGroup =
    tiles.length <= 4 &&
    new Set(real.map(t => t.number)).size === 1 &&
    new Set(real.map(t => t.color)).size === real.length;

  // Try as RUN: same color on real tiles; jokers fill inner gaps and can extend ends
  const sorted = [...real].sort((a, b) => a.number - b.number);
  const isRun = (() => {
    if (new Set(sorted.map(t => t.color)).size !== 1) return false;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].number <= sorted[i - 1].number) return false; // duplicate
    }
    let innerGaps = 0;
    for (let i = 1; i < sorted.length; i++) {
      innerGaps += sorted[i].number - sorted[i - 1].number - 1;
    }
    const remaining = jokers.length - innerGaps;
    if (remaining < 0) return false;
    // Remaining jokers extend the run at one or both ends — must stay within [1, TILE_MAX]
    const roomAtStart = sorted[0].number - 1;
    const roomAtEnd   = TILE_MAX - sorted[sorted.length - 1].number;
    return roomAtStart + roomAtEnd >= remaining;
  })();

  return isGroup || isRun;
}

/**
 * Returns true when every non-empty group on the board is a valid set.
 */
export function isValidBoard(groups) {
  const nonEmpty = Object.values(groups).filter(g => g.length > 0);
  return nonEmpty.length > 0 && nonEmpty.every(isValidSet);
}
