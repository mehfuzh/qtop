# qtop

A btop-like tiled system monitor for your terminal, built with TypeScript, Ink, and systeminformation.

## Tiles
- **CPU** — overall load, history graph, per-core bars
- **GPU** — live utilization (macOS via `ioreg`, NVIDIA via `nvidia-smi`), VRAM when available
- **Memory** — RAM + swap usage
- **Network** — download/upload rates with auto-scaling sparklines
- **Disk** — root filesystem usage + read/write throughput
- **Processes** — top processes by CPU

## Run
```sh
npm install
npm run dev
```

## Keys
- `q` / `Esc` / `Ctrl+C` — quit
- `space` — pause/resume sampling

## Build
```sh
npm run build
npm start
```

## Launch as `qtop`
Install the `bin` entry globally so you can type `qtop` in any terminal:
```sh
npm run build
chmod +x dist/index.js
npm link
```
Then run `qtop` from anywhere (needs a real terminal at least 80×24).
The link points at this folder's `dist/`, so after changing the source just
re-run `npm run build` — no relink needed. To remove the global command:
```sh
npm unlink -g qtop
```

## Test
Automated tests (Node's built-in test runner via tsx — no extra dependencies):
```sh
npm test
```
- `tests/format.test.ts` / `tests/graph.test.ts` — unit tests for formatting and graph rendering
- `tests/stats.test.ts` — smoke test that collects real stats from this machine and checks they're sane

Type-check without emitting:
```sh
npm run typecheck
```

Manual test of the TUI (needs a real terminal at least 80×24):
1. `npm start` (built) or `npm run dev` (source)
2. Check each tile updates ~once per second; sparklines grow over time
3. Generate load (e.g. a download or `yes > /dev/null`) and watch CPU/network/process tiles react
4. `space` pauses sampling (header shows ⏸ PAUSED), `space` again resumes
5. Resize the terminal — layout should reflow; below 80×24 a warning is shown
6. `q` or `Esc` quits cleanly
