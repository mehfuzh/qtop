import React from 'react';
import { Text } from 'ink';
import type { GpuStats } from '../lib/stats.js';
import { Tile } from './Tile.js';
import { spark } from '../lib/graph.js';
import { fmtBytes, padPct } from '../lib/format.js';

interface Props {
  width: number;
  height: number;
  gpu: GpuStats;
  history: number[];
  selected?: boolean;
}

export function GpuTile({ width, height, gpu, history, selected }: Props) {
  const inner = width - 4;
  return (
    <Tile title="GPU" width={width} height={height} selected={selected}>
      <Text wrap="truncate-end">
        {gpu.util != null && (
          <Text bold>{padPct(gpu.util)}% </Text>
        )}
        {gpu.name}
      </Text>
      {gpu.util != null ? (
        <Text>{spark(history, inner)}</Text>
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
