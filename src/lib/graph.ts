const BLOCKS = '▁▂▃▄▅▆▇█';

/** Single-row sparkline. max=0 means auto-scale to the data. */
export function spark(values: number[], width: number, max = 100): string {
  if (width <= 0) return '';
  const vals = values.slice(-width);
  const m = Math.max(max, ...vals, 1);
  const s = vals
    .map((v) => BLOCKS[Math.max(0, Math.min(7, Math.floor((v / m) * 8)))])
    .join('');
  return s.padStart(width, ' ');
}

export function bar(percent: number, width: number): string {
  if (width <= 0) return '';
  const filled = Math.max(0, Math.min(width, Math.round((percent / 100) * width)));
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

export function loadColor(percent: number): string {
  return percent < 60 ? 'green' : percent < 85 ? 'yellow' : 'red';
}
