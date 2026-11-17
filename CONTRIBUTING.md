# Contributing to qtop

Thanks for your interest in improving qtop! This guide covers how to set up,
make changes, and get them merged.

## License

qtop is released under the [MIT License](LICENSE). By contributing, you agree
that your contributions will be licensed under the same terms. All runtime
dependencies (Ink, React, systeminformation) are MIT-licensed as well — please
keep new dependencies compatible with MIT.

## Getting started

Requirements: Node.js 18+ and npm (the same floor the `install.sh` installer
enforces).

```sh
git clone git@github.com:mehfuzh/system-monitor.git
cd system-monitor
npm install
npm run dev        # run the TUI from source (needs a real terminal ≥ 80×24)
```

## Project layout

- `src/lib/` — pure logic: stats collection (`stats.ts`), formatting
  (`format.ts`), graph rendering (`graph.ts`), tile layout (`layout.ts`).
  Keep logic here testable and free of React/Ink imports.
- `src/components/` — one file per tile, plus the shared `Tile` frame.
- `src/hooks/` — sampling loop and terminal size.
- `src/App.tsx` — `Dashboard` is a pure layout component (no hooks or I/O);
  `App` wires up input and state.
- `tests/` — Node's built-in test runner via tsx, no extra test dependencies.
- `scripts/` — screenshot generation (ANSI → SVG).

## Before you open a pull request

1. **Type-check:** `npm run typecheck` must pass (strict mode, no emit).
2. **Tests:** `npm test` must pass. Notes:
   - Unit tests use `node:test` and `node:assert/strict` — follow the existing
     style in `tests/graph.test.ts` (small focused `test()` blocks, exact
     `assert.equal` on rendered strings, edge cases like clamping and empty
     input).
   - `tests/stats.test.ts` is a smoke test against the real machine; it checks
     ranges and invariants, not exact values. Keep it platform-tolerant.
   - Add tests for any new logic in `src/lib/` or new tile behaviour.
3. **Manual TUI check** (real terminal ≥ 80×24), per the README checklist:
   tiles update ~1/s, `space` pauses/resumes, resize reflows the layout,
   `Tab` + arrows move tiles, `q`/`Esc` quits cleanly.
4. If your change affects the UI, regenerate the screenshot:
   ```sh
   npm run screenshot
   rsvg-convert --zoom=2 -o docs/screenshot.png docs/screenshot.svg   # brew install librsvg
   ```

## Pull request guidelines

- Branch off `main`; keep PRs focused — one feature or fix per PR.
- Write a clear description: what changed, why, and how you tested it
  (include your OS/terminal, since stats collection is platform-specific:
  macOS via `ioreg`, NVIDIA via `nvidia-smi`).
- Match the existing code style: TypeScript strict, ESM (`.js` import
  specifiers), functional components, no new dependencies without discussion.
- Don't commit build output (`dist/`) or `node_modules/`.

## Reporting bugs

Open an issue at https://github.com/mehfuzh/system-monitor/issues with:
- OS and version, Node version (`node --version`), terminal emulator and size
- Steps to reproduce, expected vs. actual behaviour
- Which tile(s) are affected, and whether `npm test` passes on your machine

## Releases (maintainers)

Per the README and `install.sh`: bump `version` in `package.json`, update the
`QTOP_VERSION` default in `install.sh`, then tag and publish:

```sh
git tag -a vX.Y.Z -m "…" && git push origin vX.Y.Z
gh release create vX.Y.Z
```

The curl installer downloads the tagged tarball, so the tag, `package.json`
version, and `install.sh` default must stay in sync.
