import React, { useState } from 'react';
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
import { DEFAULT_LAYOUT, moveTile, cycleSelection, type TileId, type TileState, type Dir } from './lib/layout.js';
import type { Meta, Sample } from './lib/stats.js';

export interface DashboardProps {
  sample: Sample;
  meta: Meta;
  hist: History;
  paused: boolean;
  columns: number;
  rows: number;
  /** slot -> tile assignment; defaults to the standard arrangement */
  layout?: TileId[];
  /** selected slot, or -1 for no selection highlight */
  selected?: number;
}

/** Pure layout: everything the dashboard draws, with no hooks or I/O. */
export function Dashboard({
  sample, meta, hist, paused, columns, rows,
  layout = DEFAULT_LAYOUT, selected = -1,
}: DashboardProps) {
  const leftW = Math.floor(columns * 0.62);
  const rightW = columns - leftW;
  const topH = Math.max(12, Math.floor(rows * 0.44));
  const midH = Math.max(9, Math.floor(rows * 0.24));
  const procH = Math.max(6, rows - topH - midH - 2);
  const gpuH = Math.max(6, Math.floor(topH * 0.45));
  const clock = new Date().toLocaleTimeString();

  const tile = (slot: number, width: number, height: number) => {
    const isSelected = slot === selected;
    switch (layout[slot]) {
      case 'cpu':
        return <CpuTile width={width} height={height} brand={meta.cpuBrand} load={sample.cpu} history={hist.cpu} selected={isSelected} />;
      case 'gpu':
        return <GpuTile width={width} height={height} gpu={sample.gpu} history={hist.gpu} selected={isSelected} />;
      case 'mem':
        return <MemTile width={width} height={height} mem={sample.mem} selected={isSelected} />;
      case 'net':
        return <NetTile width={width} height={height} net={sample.net} rxHist={hist.rx} txHist={hist.tx} selected={isSelected} />;
      case 'disk':
        return <DiskTile width={width} height={height} disk={sample.disk} fsio={sample.fsio} selected={isSelected} />;
      case 'proc':
        return <ProcTile width={width} height={height} procs={sample.procs} selected={isSelected} />;
    }
  };

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
        {tile(0, leftW, topH)}
        <Box flexDirection="column" width={rightW}>
          {tile(1, rightW, gpuH)}
          {tile(2, rightW, topH - gpuH)}
        </Box>
      </Box>

      <Box height={midH}>
        {tile(3, leftW, midH)}
        {tile(4, rightW, midH)}
      </Box>

      {tile(5, columns, procH)}

      <Box height={1} paddingX={1}>
        <Text dimColor>q quit · space pause · tab select tile · ←↑↓→ move tile</Text>
      </Box>
    </Box>
  );
}

export default function App() {
  const { exit } = useApp();
  const { sample, meta, hist, paused, setPaused } = useStats(1000);
  const { columns, rows } = useTerminalSize();
  const [tiles, setTiles] = useState<TileState>({ layout: DEFAULT_LAYOUT, sel: 0 });

  useInput((input, key) => {
    if (input === 'q' || key.escape) exit();
    if (input === ' ') setPaused((p) => !p);
    if (key.tab) setTiles((t) => cycleSelection(t, key.shift));
    const dir: Dir | null = key.upArrow ? 'up'
      : key.downArrow ? 'down'
      : key.leftArrow ? 'left'
      : key.rightArrow ? 'right'
      : null;
    if (dir) setTiles((t) => moveTile(t, dir));
  });

  if (columns < 80 || rows < 24) {
    return <Text color="red">qtop needs a terminal of at least 80×24 (got {columns}×{rows})</Text>;
  }
  if (!sample || !meta) {
    return <Text color="cyan">qtop: collecting stats…</Text>;
  }

  return (
    <Dashboard
      sample={sample}
      meta={meta}
      hist={hist}
      paused={paused}
      columns={columns}
      rows={rows}
      layout={tiles.layout}
      selected={tiles.sel}
    />
  );
}
