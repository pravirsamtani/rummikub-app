export const COLORS = ['#E63946', '#2196F3', '#FF9800', '#2E7D32'];
export const COLOR_NAMES = ['red', 'blue', 'orange', 'green'];
export const TILE_MAX = 13;

/**
 * @param {number} color  0-3 index into COLORS / COLOR_NAMES
 * @param {number} number 1-13
 * @returns {{ id: string, color: number, number: number }}
 */
export function makeTile(color, number) {
  return { id: `${COLOR_NAMES[color]}-${number}`, color, number };
}

/** Joker counter — reset at the start of each puzzle generation. */
let _jokerSeq = 0;
export function resetJokerSeq() { _jokerSeq = 0; }

/** Returns a wildcard joker tile. */
export function makeJoker() {
  return { id: `joker-${_jokerSeq++}`, isJoker: true, color: -1, number: -1 };
}
