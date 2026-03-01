import { describe, it, expect } from 'vitest';
import { generatePuzzle } from '../generator.js';
import { isValidSet } from '../validator.js';
import { TILE_MAX } from '../tiles.js';

// ─── Solver used only for solvability test ────────────────────────────────────
// Returns true if the hand tile can be inserted into any board group (at any
// position) while keeping all other groups valid.
function canSolve(boardGroups, handTile) {
  for (let gi = 0; gi < boardGroups.length; gi++) {
    const group = boardGroups[gi];
    for (let i = 0; i <= group.length; i++) {
      const candidate = [...group];
      candidate.splice(i, 0, handTile);
      if (
        isValidSet(candidate) &&
        boardGroups.every((g, j) => j === gi || isValidSet(g))
      ) {
        return true;
      }
    }
  }
  return false;
}

// Run each property check N times to catch failures in random generators
const RUNS = 40;

describe('generatePuzzle — structure', () => {
  it('returns boardGroups, handTile, and hint', () => {
    const puzzle = generatePuzzle();
    expect(puzzle).toHaveProperty('boardGroups');
    expect(puzzle).toHaveProperty('handTile');
    expect(puzzle).toHaveProperty('hint');
    expect(Array.isArray(puzzle.boardGroups)).toBe(true);
    expect(typeof puzzle.hint).toBe('string');
    expect(puzzle.hint.length).toBeGreaterThan(0);
  });

  it('always produces at least one board group', () => {
    for (let i = 0; i < RUNS; i++) {
      expect(generatePuzzle().boardGroups.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('generatePuzzle — hand tile validity', () => {
  it('hand tile has id, color, and number', () => {
    for (let i = 0; i < RUNS; i++) {
      const { handTile } = generatePuzzle();
      expect(handTile).toHaveProperty('id');
      expect(handTile).toHaveProperty('color');
      expect(handTile).toHaveProperty('number');
    }
  });

  it('hand tile color is 0–3', () => {
    for (let i = 0; i < RUNS; i++) {
      const { handTile } = generatePuzzle();
      expect(handTile.color).toBeGreaterThanOrEqual(0);
      expect(handTile.color).toBeLessThanOrEqual(3);
    }
  });

  it('hand tile number is 1–13', () => {
    for (let i = 0; i < RUNS; i++) {
      const { handTile } = generatePuzzle();
      expect(handTile.number).toBeGreaterThanOrEqual(1);
      expect(handTile.number).toBeLessThanOrEqual(TILE_MAX);
    }
  });
});

describe('generatePuzzle — board integrity', () => {
  it('all board groups are initially valid sets', () => {
    for (let i = 0; i < RUNS; i++) {
      const { boardGroups } = generatePuzzle();
      boardGroups.forEach(group => {
        expect(isValidSet(group)).toBe(true);
      });
    }
  });

  it('hand tile id does not appear in any board group', () => {
    for (let i = 0; i < RUNS; i++) {
      const { boardGroups, handTile } = generatePuzzle();
      const boardIds = boardGroups.flat().map(t => t.id);
      expect(boardIds).not.toContain(handTile.id);
    }
  });

  it('no tile id appears twice on the board', () => {
    for (let i = 0; i < RUNS; i++) {
      const { boardGroups } = generatePuzzle();
      const ids = boardGroups.flat().map(t => t.id);
      expect(ids.length).toBe(new Set(ids).size);
    }
  });
});

describe('generatePuzzle — solvability', () => {
  it('the hand tile can always be placed to produce all-valid groups', () => {
    for (let i = 0; i < RUNS; i++) {
      const { boardGroups, handTile } = generatePuzzle();
      expect(canSolve(boardGroups, handTile)).toBe(true);
    }
  });
});
