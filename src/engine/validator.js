/**
 * Returns true when `tiles` forms a valid Rummikub set:
 *   - Run:   ≥3 tiles of the SAME color with CONSECUTIVE numbers
 *   - Group: 3–4 tiles of the SAME number with DISTINCT colors
 *
 * @param {Array<{color: number, number: number}>} tiles
 * @returns {boolean}
 */
export function isValidSet(tiles) {
  if (tiles.length < 3) return false;

  const sorted = [...tiles].sort((a, b) => a.number - b.number);
  const nums = sorted.map(t => t.number);
  const cols = sorted.map(t => t.color);

  const isRun =
    new Set(cols).size === 1 &&
    sorted.every((t, i) => i === 0 || t.number === sorted[i - 1].number + 1);

  const isGroup =
    new Set(nums).size === 1 &&
    new Set(cols).size === tiles.length &&
    tiles.length <= 4;

  return isRun || isGroup;
}

/**
 * Returns true when every non-empty group on the board is a valid set.
 *
 * @param {Record<string|number, Array>} groups  map of groupId → tile[]
 * @returns {boolean}
 */
export function isValidBoard(groups) {
  const nonEmpty = Object.values(groups).filter(g => g.length > 0);
  return nonEmpty.length > 0 && nonEmpty.every(isValidSet);
}
