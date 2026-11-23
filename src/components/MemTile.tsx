import React from 'react';
import { Text } from 'ink';
import type { Systeminformation as SI } from 'systeminformation';
import { Tile } from './Tile.js';
import { bar, loadColor } from '../lib/graph.js';
import { fmtBytes, padPct } from '../lib/format.js';
import { COLOR_THEME, resolveColor, type Theme } from '../lib/theme.js';

interface Props {
  width: number;
  height: number;
  mem: SI.MemData;
  selected?: boolean;
  theme?: Theme;
}

export function MemTile({ width, height, mem, selected, theme = COLOR_THEME }: Props) {
  const inner = width - 4;
  const barW = Math.max(4, inner - 6);
  const used = mem.total - mem.available;
  const usedPct = (used / mem.total) * 100;
  const swapPct = mem.swaptotal > 0 ? (mem.swapused / mem.swaptotal) * 100 : 0;

  return (
    <Tile title="Memory" id="mem" theme={theme} width={width} height={height} selected={selected}>
      <Text>
        <Text color={resolveColor(theme, loadColor(usedPct))}>{bar(usedPct, barW, theme.glyphs)}</Text> {padPct(usedPct)}%
      </Text>
      <Text wrap="truncate-end">
        {fmtBytes(used)} / {fmtBytes(mem.total)}  free {fmtBytes(mem.available)}
      </Text>
      {mem.swaptotal > 0 && (
          <>
            <Text>
              <Text color={resolveColor(theme, loadColor(swapPct))}>{bar(swapPct, barW, theme.glyphs)}</Text> {padPct(swapPct)}%
            </Text>
          <Text wrap="truncate-end">
            swap {fmtBytes(mem.swapused)} / {fmtBytes(mem.swaptotal)}
          </Text>
        </>
      )}
    </Tile>
  );
}
