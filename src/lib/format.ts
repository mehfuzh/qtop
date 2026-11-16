export function fmtBytes(n: number, decimals = 1): string {
  if (!Number.isFinite(n) || n < 0) n = 0;
  const units = ['B', 'K', 'M', 'G', 'T'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : decimals)}${units[i]}`;
}

export const fmtRate = (n: number): string => `${fmtBytes(n)}/s`;

export function fmtUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`;
}

export const padPct = (n: number): string => `${Math.round(n)}`.padStart(3);
