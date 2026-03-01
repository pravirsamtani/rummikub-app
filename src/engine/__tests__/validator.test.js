import { describe, it, expect } from 'vitest';
import { isValidSet, isValidBoard } from '../validator.js';
import { makeTile } from '../tiles.js';

// helpers
const R = n => makeTile(0, n); // red
const B = n => makeTile(1, n); // blue
const O = n => makeTile(2, n); // orange
const G = n => makeTile(3, n); // green

describe('isValidSet — runs', () => {
  it('accepts a valid run of 3', () => {
    expect(isValidSet([R(5), R(6), R(7)])).toBe(true);
  });

  it('accepts a valid run of 5', () => {
    expect(isValidSet([B(1), B(2), B(3), B(4), B(5)])).toBe(true);
  });

  it('accepts a run given in scrambled order', () => {
    expect(isValidSet([R(8), R(6), R(7)])).toBe(true);
  });

  it('rejects a run with a gap', () => {
    expect(isValidSet([R(5), R(7), R(8)])).toBe(false);
  });

  it('rejects tiles with same numbers (not consecutive)', () => {
    expect(isValidSet([R(5), R(5), R(5)])).toBe(false);
  });

  it('rejects a run with mixed colors', () => {
    expect(isValidSet([R(5), B(6), R(7)])).toBe(false);
  });
});

describe('isValidSet — groups', () => {
  it('accepts a valid group of 3 (distinct colors, same number)', () => {
    expect(isValidSet([R(7), B(7), O(7)])).toBe(true);
  });

  it('accepts a valid group of 4', () => {
    expect(isValidSet([R(7), B(7), O(7), G(7)])).toBe(true);
  });

  it('rejects a group with a duplicate color', () => {
    expect(isValidSet([R(7), R(7), B(7)])).toBe(false);
  });

  it('rejects a group with mixed numbers', () => {
    expect(isValidSet([R(7), B(8), O(7)])).toBe(false);
  });

  it('rejects a group of 5 (too many tiles)', () => {
    // Rummikub only has 4 colors so this is also impossible naturally,
    // but the validator must reject it by the length rule.
    const tiles = [R(7), B(7), O(7), G(7), makeTile(0, 7)]; // color 0 repeated
    expect(isValidSet(tiles)).toBe(false);
  });
});

describe('isValidSet — minimum size', () => {
  it('rejects sets with fewer than 3 tiles', () => {
    expect(isValidSet([])).toBe(false);
    expect(isValidSet([R(5)])).toBe(false);
    expect(isValidSet([R(5), R(6)])).toBe(false);
  });
});

describe('isValidBoard', () => {
  it('returns true when all groups are valid', () => {
    const groups = {
      0: [R(1), R(2), R(3)],
      1: [B(5), O(5), G(5)],
    };
    expect(isValidBoard(groups)).toBe(true);
  });

  it('returns false when any group is invalid', () => {
    const groups = {
      0: [R(1), R(2), R(3)],
      1: [B(5), B(6)], // only 2 tiles
    };
    expect(isValidBoard(groups)).toBe(false);
  });

  it('ignores empty groups', () => {
    const groups = {
      0: [R(1), R(2), R(3)],
      1: [], // empty — ignored
    };
    expect(isValidBoard(groups)).toBe(true);
  });

  it('returns false for an all-empty board', () => {
    expect(isValidBoard({ 0: [], 1: [] })).toBe(false);
  });
});
