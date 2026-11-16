import React from 'react';
import { Text } from 'ink';
import type { Systeminformation as SI } from 'systeminformation';
import { Tile } from './Tile.js';
import { spark } from '../lib/graph.js';
import { fmtBytes, fmtRate } from '../lib/format.js';

interface Props {
  width: number;
  height: number;
  net: SI.NetworkStatsData | null;
  rxHist: number[];
  txHist: number[];
  selected?: boolean;
}

export function NetTile({ width, height, net, rxHist, txHist, selected }: Props) {
  const inner = width - 4;
  return (
    <Tile title={`Network${net ? ` · ${net.iface}` : ''}`} color="blue" width={width} height={height} selected={selected}>
      {net ? (
        <>
          <Text color="cyan">{spark(rxHist, inner, 0)}</Text>
          <Text wrap="truncate-end">
            ↓ <Text color="cyan" bold>{fmtRate(net.rx_sec ?? 0)}</Text>  total {fmtBytes(net.rx_bytes)}
          </Text>
          <Text color="magenta">{spark(txHist, inner, 0)}</Text>
          <Text wrap="truncate-end">
            ↑ <Text color="magenta" bold>{fmtRate(net.tx_sec ?? 0)}</Text>  total {fmtBytes(net.tx_bytes)}
          </Text>
        </>
      ) : (
        <Text dimColor>no network data</Text>
      )}
    </Tile>
  );
}
