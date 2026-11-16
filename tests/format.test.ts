import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fmtBytes, fmtRate, fmtUptime, padPct } from '../src/lib/format.js';

test('fmtBytes scales through units', () => {
  assert.equal(fmtBytes(0), '0B');
  assert.equal(fmtBytes(512), '512B');
  assert.equal(fmtBytes(1024), '1.0K');
  assert.equal(fmtBytes(1536), '1.5K');
  assert.equal(fmtBytes(1024 * 1024), '1.0M');
  assert.equal(fmtBytes(3.5 * 1024 ** 3), '3.5G');
  assert.equal(fmtBytes(2 * 1024 ** 4), '2.0T');
});

test('fmtBytes clamps invalid input to 0', () => {
  assert.equal(fmtBytes(-5), '0B');
  assert.equal(fmtBytes(NaN), '0B');
  assert.equal(fmtBytes(Infinity), '0B');
});

test('fmtRate appends /s', () => {
  assert.equal(fmtRate(2048), '2.0K/s');
});

test('fmtUptime shows days when >= 1 day, hours/minutes otherwise', () => {
  assert.equal(fmtUptime(90061), '1d 1h');
  assert.equal(fmtUptime(3661), '1h 1m');
  assert.equal(fmtUptime(59), '0h 0m');
});

test('padPct rounds and pads to 3 chars', () => {
  assert.equal(padPct(5), '  5');
  assert.equal(padPct(99.6), '100');
  assert.equal(padPct(0), '  0');
});
