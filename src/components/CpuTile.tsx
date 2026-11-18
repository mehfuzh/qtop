import React from 'react';
import { Text } from 'ink';
import type { Systeminformation as SI } from 'systeminformation';
import { Tile } from './Tile.js';
import { bar, wave3d, loadColor } from '../lib/graph.js';
import { padPct } from '../lib/format.js';

interface Props {
  width: number;
  height: number;
  brand: string;
  load: SI.CurrentLoadData;
  history: number[];
  selected?: boolean;
  /** animation phase in radians; advance it to move the wave */
  phase?: number;
}

export function CpuTile({ width, height, brand, load, history, selected, phase = 0 }: Props) {
  const inner = width - 4;
  const overall = load.currentLoad;
  const waveH = Math.max(1, Math.min(3, height - 8));
  const maxCores = Math.max(1, height - 5 - waveH);
  const barW = Math.max(4, inner - 10);
  const cores = load.cpus.slice(0, maxCores);

  return (
    <Tile title="CPU" color="green" width={width} height={height} selected={selected}>
      <Text wrap="truncate-end">
        {brand}  <Text color={loadColor(overall)} bold>{padPct(overall)}%</Text>
      </Text>
      {wave3d(history, inner, waveH, phase).map((row, i) => (
        <Text key={`w${i}`} color={loadColor(overall)}>{row}</Text>
      ))}
      {cores.map((c, i) => (
        <Text key={i}>
          {`C${i + 1}`.padStart(3)} <Text color={loadColor(c.load)}>{bar(c.load, barW)}</Text>
          {padPct(c.load)}%
        </Text>
      ))}
      {load.cpus.length > maxCores && (
        <Text dimColor>… {load.cpus.length - maxCores} more cores</Text>
      )}
    </Tile>
  );
}
