import React from 'react';
import { Text } from 'ink';
import type { Systeminformation as SI } from 'systeminformation';
import { Tile } from './Tile.js';
import { wave3d } from '../lib/graph.js';
import { fmtBytes, fmtRate } from '../lib/format.js';
import { COLOR_THEME, resolveColor, type Theme } from '../lib/theme.js';

interface Props {
  width: number;
  height: number;
  net: SI.NetworkStatsData | null;
  rxHist: number[];
  txHist: number[];
  selected?: boolean;
  /** animation phase in radians; advance it to move the wave */
  phase?: number;
  theme?: Theme;
}

export function NetTile({ width, height, net, rxHist, txHist, selected, phase = 0, theme = COLOR_THEME }: Props) {
  const inner = width - 4;
  const waveH = Math.max(1, Math.min(3, Math.floor((height - 5) / 2)));
  return (
    <Tile title={`Network${net ? ` · ${net.iface}` : ''}`} id="net" theme={theme} width={width} height={height} selected={selected}>
      {net ? (
        <>
          {wave3d(rxHist, inner, waveH, phase, 0, theme.glyphs).map((row, i) => (
          <Text key={`rx${i}`} color={resolveColor(theme, 'cyan')}>{row}</Text>
        ))}
          <Text wrap="truncate-end">
            ↓ <Text color={resolveColor(theme, 'cyan')} bold>{fmtRate(net.rx_sec ?? 0)}</Text>  total {fmtBytes(net.rx_bytes)}
          </Text>
          {wave3d(txHist, inner, waveH, phase, 0, theme.glyphs).map((row, i) => (
          <Text key={`tx${i}`} color={resolveColor(theme, 'magenta')}>{row}</Text>
        ))}
          <Text wrap="truncate-end">
            ↑ <Text color={resolveColor(theme, 'magenta')} bold>{fmtRate(net.tx_sec ?? 0)}</Text>  total {fmtBytes(net.tx_bytes)}
          </Text>
        </>
      ) : (
        <Text dimColor>no network data</Text>
      )}
    </Tile>
  );
}
