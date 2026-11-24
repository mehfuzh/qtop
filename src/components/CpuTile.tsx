import React from 'react';
import { Text } from 'ink';
import type { Systeminformation as SI } from 'systeminformation';
import { Tile } from './Tile.js';
import { bar } from '../lib/graph.js';
import { padPct } from '../lib/format.js';

interface Props {
  width: number;
  height: number;
  brand: string;
  load: SI.CurrentLoadData;
  selected?: boolean;
}

export function CpuTile({ width, height, brand, load, selected }: Props) {
  const inner = width - 4;
  const overall = load.currentLoad;
  const maxCores = Math.max(1, height - 7);
  const barW = Math.max(4, inner - 10);
  const cores = load.cpus.slice(0, maxCores);

  // "Busy" = load > 50% (matches btop's active-core definition).
  const totalCores = load.cpus.length;
  const busyCores = load.cpus.filter((c) => c.load > 50).length;
  const busyPct = totalCores > 0 ? (busyCores / totalCores) * 100 : 0;
  const busyBarW = Math.max(4, inner - 17);

  return (
    <Tile title="CPU" width={width} height={height} selected={selected}>
      <Text wrap="truncate-end">
        {brand}  <Text bold>{padPct(overall)}%</Text>
      </Text>
      <Text wrap="truncate-end">
        Busy {`${busyCores}/${totalCores}`} {bar(busyPct, busyBarW)} {padPct(busyPct)}%
      </Text>
      {cores.map((c, i) => (
        <Text key={i}>
          {`C${i + 1}`.padStart(3)} {bar(c.load, barW)}
          {padPct(c.load)}%
        </Text>
      ))}
      {load.cpus.length > maxCores && (
        <Text dimColor>… {load.cpus.length - maxCores} more cores</Text>
      )}
    </Tile>
  );
}
