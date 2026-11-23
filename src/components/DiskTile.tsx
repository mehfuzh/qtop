import React from 'react';
import { Text } from 'ink';
import type { Systeminformation as SI } from 'systeminformation';
import { Tile } from './Tile.js';
import { bar, loadColor } from '../lib/graph.js';
import { fmtBytes, fmtRate, padPct } from '../lib/format.js';
import { COLOR_THEME, resolveColor, type Theme } from '../lib/theme.js';

interface Props {
  width: number;
  height: number;
  disk: SI.FsSizeData | null;
  fsio: SI.FsStatsData | null;
  selected?: boolean;
  theme?: Theme;
}

export function DiskTile({ width, height, disk, fsio, selected, theme = COLOR_THEME }: Props) {
  const inner = width - 4;
  const barW = Math.max(4, inner - 6);
  return (
    <Tile title={`Disk${disk ? ` · ${disk.mount}` : ''}`} id="disk" theme={theme} width={width} height={height} selected={selected}>
      {disk ? (
        <>
          <Text>
            <Text color={resolveColor(theme, loadColor(disk.use))}>{bar(disk.use, barW, theme.glyphs)}</Text> {padPct(disk.use)}%
          </Text>
          <Text wrap="truncate-end">
            {fmtBytes(disk.used)} / {fmtBytes(disk.size)} used
          </Text>
          <Text wrap="truncate-end">
            read <Text color={resolveColor(theme, 'cyan')}>{fmtRate(fsio?.rx_sec ?? 0)}</Text>  write{' '}
            <Text color={resolveColor(theme, 'magenta')}>{fmtRate(fsio?.wx_sec ?? 0)}</Text>
          </Text>
        </>
      ) : (
        <Text dimColor>no disk data</Text>
      )}
    </Tile>
  );
}
