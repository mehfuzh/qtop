import React from 'react';
import { Text } from 'ink';
import type { Systeminformation as SI } from 'systeminformation';
import { Tile } from './Tile.js';
import { bar, wave3d, loadColor } from '../lib/graph.js';
import { padPct } from '../lib/format.js';
import { COLOR_THEME, resolveColor, type Theme } from '../lib/theme.js';

interface Props {
  width: number;
  height: number;
  brand: string;
  load: SI.CurrentLoadData;
  history: number[];
  selected?: boolean;
  /** animation phase in radians; advance it to move the wave */
  phase?: number;
  theme?: Theme;
}

export function CpuTile({ width, height, brand, load, history, selected, phase = 0, theme = COLOR_THEME }: Props) {
  const inner = width - 4;
  const overall = load.currentLoad;
  const waveH = Math.max(1, Math.min(3, height - 8));
  const maxCores = Math.max(1, height - 6 - waveH);
  const barW = Math.max(4, inner - 10);
  const cores = load.cpus.slice(0, maxCores);

  // "Busy" = load > 50% (matches btop's active-core definition).
  const totalCores = load.cpus.length;
  const busyCores = load.cpus.filter((c) => c.load > 50).length;
  const busyPct = totalCores > 0 ? (busyCores / totalCores) * 100 : 0;
  const busyBarW = Math.max(4, inner - 17);

  return (
    <Tile title="CPU" id="cpu" theme={theme} width={width} height={height} selected={selected}>
      <Text wrap="truncate-end">
        {brand}  <Text color={resolveColor(theme, loadColor(overall))} bold>{padPct(overall)}%</Text>
      </Text>
      {wave3d(history, inner, waveH, phase, 100, theme.glyphs).map((row, i) => (
        <Text key={`w${i}`} color={resolveColor(theme, loadColor(overall))}>{row}</Text>
      ))}
      <Text wrap="truncate-end">
        Busy{' '}
        <Text color={resolveColor(theme, loadColor(busyPct))}>{`${busyCores}/${totalCores}`}</Text>{' '}
        <Text color={resolveColor(theme, loadColor(busyPct))}>{bar(busyPct, busyBarW, theme.glyphs)}</Text>{' '}
        {padPct(busyPct)}%
      </Text>
      {cores.map((c, i) => (
        <Text key={i}>
          {`C${i + 1}`.padStart(3)} <Text color={resolveColor(theme, loadColor(c.load))}>{bar(c.load, barW, theme.glyphs)}</Text>
          {padPct(c.load)}%
        </Text>
      ))}
      {load.cpus.length > maxCores && (
        <Text dimColor>… {load.cpus.length - maxCores} more cores</Text>
      )}
    </Tile>
  );
}
