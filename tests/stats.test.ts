import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getMeta, collect } from '../src/lib/stats.js';

// Smoke test against the real machine: verifies the collector returns
// sane data on this platform (macOS here), not exact values.

test('getMeta returns non-empty metadata', async () => {
  const meta = await getMeta();
  assert.equal(typeof meta.cpuBrand, 'string');
  assert.ok(meta.cpuBrand.length > 0);
  assert.equal(typeof meta.gpuName, 'string');
  assert.equal(typeof meta.iface, 'string');
});

test('collect returns a valid sample', async () => {
  const meta = await getMeta();
  const s = await collect(meta);

  assert.ok(s.cpu.currentLoad >= 0 && s.cpu.currentLoad <= 100);
  assert.ok(Array.isArray(s.cpu.cpus) && s.cpu.cpus.length > 0);
  for (const c of s.cpu.cpus) {
    assert.ok(c.load >= 0 && c.load <= 100);
  }

  assert.ok(s.mem.total > 0);
  assert.ok(s.mem.available >= 0 && s.mem.available <= s.mem.total);

  assert.ok(Array.isArray(s.procs) && s.procs.length > 0);
  // sorted by CPU desc, then MEM desc
  for (let i = 1; i < s.procs.length; i++) {
    const a = s.procs[i - 1];
    const b = s.procs[i];
    assert.ok(a.cpu > b.cpu || (a.cpu === b.cpu && a.mem >= b.mem));
  }

  assert.equal(typeof s.gpu.name, 'string');
  if (s.gpu.util != null) {
    assert.ok(s.gpu.util >= 0 && s.gpu.util <= 100);
  }

  if (s.disk) {
    assert.ok(s.disk.size > 0);
    assert.ok(s.disk.use >= 0 && s.disk.use <= 100);
  }
  if (s.net) {
    assert.ok(typeof s.net.iface === 'string' && s.net.iface.length > 0);
  }
});
