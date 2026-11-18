import React from 'react';
import { Text } from 'ink';
import type { GpuStats } from '../lib/stats.js';
import { Tile } from './Tile.js';
import { wave3d, loadColor } from '../lib/graph.js';
import { fmtBytes, padPct } from '../lib/format.js';

interface Props {
  width: number;
  height: number;
  gpu: GpuStats;
  history: number[];
  selected?: boolean;
  /** animation phase in radians; advance it to move the wave */
  phase?: number;
}

export function GpuTile({ width, height, gpu, history, selected, phase = 0 }: Props) {
  const inner = width - 4;
  const hasVram = gpu.vramTotal != null && gpu.vramUsed != null;
  const waveH = Math.max(1, Math.min(4, height - 4 - (hasVram ? 1 : 0)));
  return (
    <Tile title="GPU" color="magenta" width={width} height={height} selected={selected}>
      <Text wrap="truncate-end">
        {gpu.util != null && (
          <Text color={loadColor(gpu.util)} bold>{padPct(gpu.util)}% </Text>
        )}
        {gpu.name}
      </Text>
      {gpu.util != null ? (
        wave3d(history, inner, waveH, phase).map((row, i) => (
          <Text key={`w${i}`} color={loadColor(gpu.util!)}>{row}</Text>
        ))
      ) : (
        <Text dimColor>utilization unavailable</Text>
      )}
      {gpu.vramTotal != null && gpu.vramUsed != null && (
        <Text wrap="truncate-end">
          VRAM {fmtBytes(gpu.vramUsed)} / {fmtBytes(gpu.vramTotal)}
        </Text>
      )}
    </Tile>
  );
}
