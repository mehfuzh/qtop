import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_LAYOUT, SLOT_COUNT, moveTile, cycleSelection, type TileState } from '../src/lib/layout.js';

const initial = (): TileState => ({ layout: [...DEFAULT_LAYOUT], sel: 0 });

test('default layout fills all six slots', () => {
  assert.equal(DEFAULT_LAYOUT.length, SLOT_COUNT);
  assert.deepEqual(DEFAULT_LAYOUT, ['cpu', 'gpu', 'mem', 'net', 'disk', 'proc']);
});

test('move right swaps CPU with GPU and selection follows', () => {
  const s = moveTile(initial(), 'right');
  assert.equal(s.layout[0], 'gpu');
  assert.equal(s.layout[1], 'cpu');
  assert.equal(s.sel, 1);
});

test('move down from top-left swaps with mid-left', () => {
  const s = moveTile(initial(), 'down');
  assert.equal(s.layout[0], 'net');
  assert.equal(s.layout[3], 'cpu');
  assert.equal(s.sel, 3);
});

test('moves at the grid edge are no-ops', () => {
  const s = initial();
  assert.equal(moveTile(s, 'up'), s);
  assert.equal(moveTile(s, 'left'), s);
  assert.equal(moveTile({ layout: [...DEFAULT_LAYOUT], sel: 5 }, 'down').layout[5], 'proc');
});

test('moving out and back restores the original arrangement', () => {
  const s = moveTile(moveTile(initial(), 'right'), 'left');
  assert.deepEqual(s.layout, DEFAULT_LAYOUT);
  assert.equal(s.sel, 0);
});

test('move does not mutate the input state', () => {
  const s = initial();
  moveTile(s, 'down');
  assert.deepEqual(s.layout, DEFAULT_LAYOUT);
  assert.equal(s.sel, 0);
});

test('up/down chain through the right column', () => {
  // gpu(1) -> down -> mem slot(2) -> down -> disk slot(4) -> up -> back to 2
  let s = moveTile({ layout: [...DEFAULT_LAYOUT], sel: 1 }, 'down');
  assert.equal(s.sel, 2);
  s = moveTile(s, 'down');
  assert.equal(s.sel, 4);
  s = moveTile(s, 'up');
  assert.equal(s.sel, 2);
});

test('cycleSelection wraps forwards and backwards', () => {
  let s = initial();
  for (let i = 0; i < SLOT_COUNT; i++) s = cycleSelection(s);
  assert.equal(s.sel, 0);
  assert.equal(cycleSelection(initial(), true).sel, SLOT_COUNT - 1);
});
