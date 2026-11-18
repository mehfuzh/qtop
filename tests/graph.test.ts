import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bar, spark, wave3d, loadColor } from '../src/lib/graph.js';

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

test('wave3d returns height rows of width chars', () => {
  const rows = wave3d([10, 50, 90], 3, 3);
  assert.equal(rows.length, 3);
  for (const r of rows) assert.equal(r.length, 3);
});

test('wave3d guards and padding', () => {
  assert.deepEqual(wave3d([50], 0, 3), []);
  assert.deepEqual(wave3d([50], 3, 0), []);
  const rows = wave3d([], 4, 2);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows, ['    ', '    ']);
});

test('wave3d zero values stay blank, full load fills the front', () => {
  for (const r of wave3d([0, 0], 2, 3)) assert.equal(r, '  ');
  const rows = wave3d([100], 1, 4); // depth 2, front height 2
  assert.equal(rows[3], '█');
  assert.equal(rows[2], '█');
  assert.equal(wave3d([100], 1, 1)[0], '█');
});

test('wave3d back wall ripples with phase', () => {
  const a = wave3d([50, 50, 50, 50], 4, 3, 0).join('\n');
  const b = wave3d([50, 50, 50, 50], 4, 3, Math.PI).join('\n');
  assert.notEqual(a, b);
  assert.ok(a.includes('▒') || a.includes('░'));
});

test('loadColor thresholds', () => {
  assert.equal(loadColor(0), 'green');
  assert.equal(loadColor(59.9), 'green');
  assert.equal(loadColor(60), 'yellow');
  assert.equal(loadColor(84.9), 'yellow');
  assert.equal(loadColor(85), 'red');
  assert.equal(loadColor(100), 'red');
});
