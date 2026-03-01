import { describe, it, expect } from 'vitest';
import { makeTile, COLORS, COLOR_NAMES, TILE_MAX } from '../tiles.js';

describe('makeTile', () => {
  it('creates a tile with the correct id', () => {
    expect(makeTile(0, 5).id).toBe('red-5');
    expect(makeTile(1, 12).id).toBe('blue-12');
    expect(makeTile(2, 1).id).toBe('orange-1');
    expect(makeTile(3, 13).id).toBe('green-13');
  });

  it('stores the color index', () => {
    [0, 1, 2, 3].forEach(c => {
      expect(makeTile(c, 7).color).toBe(c);
    });
  });

  it('stores the number', () => {
    [1, 5, 9, 13].forEach(n => {
      expect(makeTile(0, n).number).toBe(n);
    });
  });

  it('id uses COLOR_NAMES, not the COLORS hex value', () => {
    COLOR_NAMES.forEach((name, c) => {
      expect(makeTile(c, 1).id.startsWith(name)).toBe(true);
    });
  });

  it('COLORS and COLOR_NAMES have the same length', () => {
    expect(COLORS.length).toBe(COLOR_NAMES.length);
  });

  it('TILE_MAX is 13', () => {
    expect(TILE_MAX).toBe(13);
  });
});
