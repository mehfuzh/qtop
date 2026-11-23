import { UNICODE_GLYPHS, type Glyphs } from './theme.js';

/** Single-row sparkline. max=0 means auto-scale to the data. */
export function spark(values: number[], width: number, max = 100, glyphs: Glyphs = UNICODE_GLYPHS): string {
  if (width <= 0) return '';
  const vals = values.slice(-width);
  const m = Math.max(max, ...vals, 1);
  const ramp = glyphs.ramp;
  const s = vals
    .map((v) => ramp[Math.max(0, Math.min(ramp.length - 1, Math.floor((v / m) * ramp.length)))])
    .join('');
  return s.padStart(width, ' ');
}

/** Animated pseudo-3D wave graph: solid front bars with a receding back
 *  wall shifted up and right for depth. The wall ripples with `phase`
 *  (radians) — callers animate by advancing it. max=0 auto-scales.
 *  Returns `height` rows of `width` chars; height 1 degrades to a sparkline. */
export function wave3d(
  values: number[],
  width: number,
  height: number,
  phase = 0,
  max = 100,
  glyphs: Glyphs = UNICODE_GLYPHS
): string[] {
  if (width <= 0 || height <= 0) return [];
  const depth = height >= 4 ? 2 : height >= 2 ? 1 : 0;
  const frontH = height - depth;
  const vals = values.slice(-width).map((v) => Math.max(0, v));
  const m = Math.max(max, ...vals, 1);
  const padded: number[] = [...Array<string>(width - vals.length).fill('0'), ...vals].map(Number);
  const grid = Array.from({ length: height }, () => Array<string>(width).fill(' '));

  // back wall first — front bars are drawn over it (occlusion)
  for (let x = 0; x + depth < width; x++) {
    const fh = Math.min(1, padded[x] / m) * frontH;
    if (fh <= 0) continue;
    const ripple = 0.35 * Math.sin(phase + x * 0.45);
    const bh = Math.max(0.2, Math.min(frontH, fh * 0.85 + ripple));
    const cells = Math.ceil(bh);
    for (let r = 0; r < cells; r++) {
      const y = height - 1 - depth - r;
      if (y < 0) break;
      grid[y][x + depth] = r === cells - 1 ? glyphs.wall[1] : glyphs.wall[0];
    }
  }
  // front bars
  for (let x = 0; x < width; x++) {
    const fh = Math.min(1, padded[x] / m) * frontH;
    const full = Math.floor(fh);
    for (let r = 0; r < full; r++) grid[height - 1 - r][x] = glyphs.full;
    const frac = fh - full;
    if (frac > 0) grid[height - 1 - full][x] = glyphs.ramp[Math.min(glyphs.ramp.length - 1, Math.floor(frac * glyphs.ramp.length))];
  }
  return grid.map((row) => row.join(''));
}

export function bar(percent: number, width: number, glyphs: Glyphs = UNICODE_GLYPHS): string {
  if (width <= 0) return '';
  const filled = Math.max(0, Math.min(width, Math.round((percent / 100) * width)));
  return glyphs.full.repeat(filled) + glyphs.empty.repeat(width - filled);
}

export function loadColor(percent: number): string {
  return percent < 60 ? 'green' : percent < 85 ? 'yellow' : 'red';
}
