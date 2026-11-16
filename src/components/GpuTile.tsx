import React from 'react';
import { Text } from 'ink';
import type { GpuStats } from '../lib/stats.js';
import { Tile } from './Tile.js';
import { bar, spark, loadColor } from '../lib/graph.js';
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
  const barW = Math.max(4, inner - 6);
  return (
    <Tile title="GPU" color="magenta" width={width} height={height} selected={selected}>
      <Text wrap="truncate-end">{gpu.name}</Text>
      {gpu.util != null ? (
        <>
          <Text color={loadColor(gpu.util)}>{spark(history, inner)}</Text>
          <Text>
            <Text color={loadColor(gpu.util)}>{bar(gpu.util, barW)}</Text> {padPct(gpu.util)}%
          </Text>
        </>
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
