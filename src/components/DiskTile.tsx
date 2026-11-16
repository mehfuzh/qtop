import React from 'react';
import { Text } from 'ink';
import type { Systeminformation as SI } from 'systeminformation';
import { Tile } from './Tile.js';
import { bar, loadColor } from '../lib/graph.js';
import { fmtBytes, fmtRate, padPct } from '../lib/format.js';

interface Props {
  width: number;
  height: number;
  disk: SI.FsSizeData | null;
  fsio: SI.FsStatsData | null;
  selected?: boolean;
}

export function DiskTile({ width, height, disk, fsio, selected }: Props) {
  const inner = width - 4;
  const barW = Math.max(4, inner - 6);
  return (
    <Tile title={`Disk${disk ? ` · ${disk.mount}` : ''}`} color="red" width={width} height={height} selected={selected}>
      {disk ? (
        <>
          <Text>
            <Text color={loadColor(disk.use)}>{bar(disk.use, barW)}</Text> {padPct(disk.use)}%
          </Text>
          <Text wrap="truncate-end">
            {fmtBytes(disk.used)} / {fmtBytes(disk.size)} used
          </Text>
          <Text wrap="truncate-end">
            read <Text color="cyan">{fmtRate(fsio?.rx_sec ?? 0)}</Text>  write{' '}
            <Text color="magenta">{fmtRate(fsio?.wx_sec ?? 0)}</Text>
          </Text>
        </>
      ) : (
        <Text dimColor>no disk data</Text>
      )}
    </Tile>
  );
}
