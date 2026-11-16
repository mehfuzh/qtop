import React from 'react';
import { Text } from 'ink';
import type { Systeminformation as SI } from 'systeminformation';
import { Tile } from './Tile.js';

interface Props {
  width: number;
  height: number;
  procs: SI.ProcessesProcessData[];
  selected?: boolean;
}

function cpuColor(cpu: number): string | undefined {
  return cpu > 50 ? 'red' : cpu > 20 ? 'yellow' : undefined;
}

export function ProcTile({ width, height, procs, selected }: Props) {
  const inner = width - 4;
  const maxRows = Math.max(1, height - 4);
  const nameW = Math.max(8, inner - 30);
  const rows = procs.slice(0, maxRows);

  const header =
    'PID'.padStart(7) + ' ' +
    'USER'.padEnd(9) +
    'CPU%'.padStart(6) +
    'MEM%'.padStart(6) + '  ' +
    'COMMAND';

  return (
    <Tile title="Processes · top by CPU" color="cyan" width={width} height={height} selected={selected}>
      <Text dimColor wrap="truncate-end">{header}</Text>
      {rows.map((p) => (
        <Text key={p.pid} wrap="truncate-end">
          {String(p.pid).padStart(7)}{' '}
          {(p.user ?? '').slice(0, 9).padEnd(9)}
          <Text color={cpuColor(p.cpu)}>{p.cpu.toFixed(1).padStart(6)}</Text>
          {p.mem.toFixed(1).padStart(6)}{'  '}
          {p.name.slice(0, nameW)}
        </Text>
      ))}
    </Tile>
  );
}
