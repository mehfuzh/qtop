import React from 'react';
import { Writable, PassThrough } from 'node:stream';
import { mkdirSync, writeFileSync } from 'node:fs';
import { render } from 'ink';
import { Dashboard } from '../src/App.js';
import { getMeta, collect, type Sample } from '../src/lib/stats.js';
import type { History } from '../src/hooks/useStats.js';
import { ansiToSvg } from './ansi-svg.js';

const COLS = 110;
const ROWS = 34;
const SAMPLES = 48;

class Capture extends Writable {
  frames: string[] = [];
  columns = COLS;
  rows = ROWS;
  isTTY = true;
  override _write(chunk: unknown, _enc: unknown, cb: () => void) {
    this.frames.push(String(chunk));
    cb();
  }
}

/** Ink also emits control-only frames (e.g. cursor hide/show) — skip those. */
const hasVisibleText = (frame: string): boolean =>
  frame.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').trim().length > 0;

async function main() {
  const meta = await getMeta();
  const hist: History = { cpu: [], gpu: [], rx: [], tx: [] };
  let sample: Sample | null = null;

  process.stderr.write(`collecting ${SAMPLES} samples…\n`);
  for (let i = 0; i < SAMPLES; i++) {
    sample = await collect(meta);
    hist.cpu.push(sample.cpu.currentLoad);
    if (sample.gpu.util != null) hist.gpu.push(sample.gpu.util);
    hist.rx.push(sample.net?.rx_sec ?? 0);
    hist.tx.push(sample.net?.tx_sec ?? 0);
  }

  const stdout = new Capture();
  const stdin = new PassThrough() as PassThrough & { isTTY: boolean; setRawMode: () => void };
  stdin.isTTY = false;
  stdin.setRawMode = () => {};

  const app = render(
    <Dashboard sample={sample!} meta={meta} hist={hist} paused={false} columns={COLS} rows={ROWS} />,
    // debug: write each full frame verbatim, no cursor/erase sequences
    { stdout: stdout as never, stdin: stdin as never, debug: true, exitOnCtrlC: false, patchConsole: false }
  );
  await new Promise((r) => setTimeout(r, 500));
  const frame = ([...stdout.frames].reverse().find(hasVisibleText) ?? '').replace(/\n$/, '');
  app.unmount();

  if (!frame) throw new Error('no frame captured');
  mkdirSync('docs', { recursive: true });
  writeFileSync('docs/screenshot.svg', ansiToSvg(frame, { columns: COLS, rows: ROWS, title: 'qtop' }));
  process.stderr.write('wrote docs/screenshot.svg\n');
}

void main();
