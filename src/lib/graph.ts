/** Block glyphs used to draw bars and sparklines. */
export const BLOCK_GLYPHS = {
  ramp: '▁▂▃▄▅▆▇█',
  full: '█',
  empty: '░',
};
export type Glyphs = typeof BLOCK_GLYPHS;

/** Single-row sparkline. max=0 means auto-scale to the data. */
export function spark(values: number[], width: number, max = 100, glyphs: Glyphs = BLOCK_GLYPHS): string {
  if (width <= 0) return '';
  const vals = values.slice(-width);
  const m = Math.max(max, ...vals, 1);
  const ramp = glyphs.ramp;
  const s = vals
    .map((v) => ramp[Math.max(0, Math.min(ramp.length - 1, Math.floor((v / m) * ramp.length)))])
    .join('');
  return s.padStart(width, ' ');
}

export function bar(percent: number, width: number, glyphs: Glyphs = BLOCK_GLYPHS): string {
  if (width <= 0) return '';
  const filled = Math.max(0, Math.min(width, Math.round((percent / 100) * width)));
  return glyphs.full.repeat(filled) + glyphs.empty.repeat(width - filled);
}
