import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bar, spark } from '../src/lib/graph.js';

test('bar fills proportionally', () => {
  assert.equal(bar(50, 10), '█'.repeat(5) + '░'.repeat(5));
  assert.equal(bar(0, 4), '░░░░');
  assert.equal(bar(100, 4), '████');
});

test('bar clamps out-of-range percentages and widths', () => {
  assert.equal(bar(150, 4), '████');
  assert.equal(bar(-10, 4), '░░░░');
  assert.equal(bar(50, 0), '');
  assert.equal(bar(50, -3), '');
});

test('spark scales to fixed max of 100 by default', () => {
  assert.equal(spark([0, 50, 100], 3), '▁▅█');
});

test('spark auto-scales when max=0', () => {
  // values 0, 5, 10 with auto max 10 -> same shape as 0/50/100
  assert.equal(spark([0, 5, 10], 3, 0), '▁▅█');
});

test('spark pads to width and keeps only the latest values', () => {
  assert.equal(spark([], 5), '     ');
  const s = spark([10, 20, 30, 40], 2);
  assert.equal(s.length, 2);
  assert.equal(s, spark([30, 40], 2));
  assert.equal(spark([50], 0), '');
});
