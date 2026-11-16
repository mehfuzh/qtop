import React from 'react';
import os from 'node:os';
import { Box, Text, useApp, useInput } from 'ink';
import { useStats, type History } from './hooks/useStats.js';
import { useTerminalSize } from './hooks/useTerminalSize.js';
import { CpuTile } from './components/CpuTile.js';
import { GpuTile } from './components/GpuTile.js';
import { MemTile } from './components/MemTile.js';
import { NetTile } from './components/NetTile.js';
import { DiskTile } from './components/DiskTile.js';
import { ProcTile } from './components/ProcTile.js';
import { fmtUptime } from './lib/format.js';
import type { Meta, Sample } from './lib/stats.js';

export interface DashboardProps {
  sample: Sample;
  meta: Meta;
  hist: History;
  paused: boolean;
  columns: number;
  rows: number;
}

/** Pure layout: everything the dashboard draws, with no hooks or I/O. */
export function Dashboard({ sample, meta, hist, paused, columns, rows }: DashboardProps) {
  const leftW = Math.floor(columns * 0.62);
  const rightW = columns - leftW;
  const topH = Math.max(12, Math.floor(rows * 0.44));
  const midH = Math.max(9, Math.floor(rows * 0.24));
  const procH = Math.max(6, rows - topH - midH - 2);
  const gpuH = Math.max(6, Math.floor(topH * 0.45));
  const clock = new Date().toLocaleTimeString();

  return (
    <Box flexDirection="column" width={columns} height={rows}>
      <Box height={1} justifyContent="space-between" paddingX={1}>
        <Text bold color="magenta">qtop</Text>
        <Text dimColor>
          {os.hostname()} · up {fmtUptime(os.uptime())}
        </Text>
        <Text color={paused ? 'yellow' : undefined}>
          {paused ? '⏸ PAUSED · ' : ''}{clock}
        </Text>
      </Box>

      <Box height={topH}>
        <CpuTile width={leftW} height={topH} brand={meta.cpuBrand} load={sample.cpu} history={hist.cpu} />
        <Box flexDirection="column" width={rightW}>
          <GpuTile width={rightW} height={gpuH} gpu={sample.gpu} history={hist.gpu} />
          <MemTile width={rightW} height={topH - gpuH} mem={sample.mem} />
        </Box>
      </Box>

      <Box height={midH}>
        <NetTile width={leftW} height={midH} net={sample.net} rxHist={hist.rx} txHist={hist.tx} />
        <DiskTile width={rightW} height={midH} disk={sample.disk} fsio={sample.fsio} />
      </Box>

      <ProcTile width={columns} height={procH} procs={sample.procs} />

      <Box height={1} paddingX={1}>
        <Text dimColor>q quit · space pause/resume</Text>
      </Box>
    </Box>
  );
}

export default function App() {
  const { exit } = useApp();
  const { sample, meta, hist, paused, setPaused } = useStats(1000);
  const { columns, rows } = useTerminalSize();

  useInput((input, key) => {
    if (input === 'q' || key.escape) exit();
    if (input === ' ') setPaused((p) => !p);
  });

  if (columns < 80 || rows < 24) {
    return <Text color="red">qtop needs a terminal of at least 80×24 (got {columns}×{rows})</Text>;
  }
  if (!sample || !meta) {
    return <Text color="cyan">qtop: collecting stats…</Text>;
  }

  return (
    <Dashboard sample={sample} meta={meta} hist={hist} paused={paused} columns={columns} rows={rows} />
  );
}
