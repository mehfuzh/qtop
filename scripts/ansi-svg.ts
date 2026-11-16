/** Minimal ANSI (SGR) -> SVG renderer for terminal screenshots. */

const PALETTE: Record<number, string> = {
  30: '#565f89', 31: '#f7768e', 32: '#9ece6a', 33: '#e0af68',
  34: '#7aa2f7', 35: '#bb9af7', 36: '#7dcfff', 37: '#c0caf5',
  90: '#565f89', 91: '#f7768e', 92: '#9ece6a', 93: '#e0af68',
  94: '#7aa2f7', 95: '#bb9af7', 96: '#7dcfff', 97: '#c0caf5',
};

const BG = '#1a1b26';
const FG = '#c0caf5';
const FONT = "Menlo, Monaco, 'Courier New', monospace";
const FONT_SIZE = 14;
const CHAR_W = FONT_SIZE * 0.6;
const LINE_H = 17;
const PAD_X = 16;
const PAD_Y = 12;
const CHROME_H = 36;

interface Run {
  text: string;
  fg: string;
  bold: boolean;
  dim: boolean;
}

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function parseLine(line: string, state: { fg: string; bold: boolean; dim: boolean }): Run[] {
  const runs: Run[] = [];
  const re = /\x1b\[([0-9;?]*)([A-Za-z])/g;
  let pos = 0;
  let m: RegExpExecArray | null;

  const pushText = (text: string) => {
    if (text.length > 0) runs.push({ text, ...state });
  };

  while ((m = re.exec(line)) !== null) {
    pushText(line.slice(pos, m.index));
    pos = re.lastIndex;
    if (m[2] !== 'm') continue; // ignore cursor movement etc.
    const codes = (m[1] || '0').split(';').map(Number);
    for (let i = 0; i < codes.length; i++) {
      const c = codes[i];
      if (c === 0) { state.fg = FG; state.bold = false; state.dim = false; }
      else if (c === 1) state.bold = true;
      else if (c === 2) state.dim = true;
      else if (c === 22) { state.bold = false; state.dim = false; }
      else if (c === 39) state.fg = FG;
      else if (PALETTE[c]) state.fg = PALETTE[c];
      else if (c === 38 && codes[i + 1] === 2) {
        state.fg = `rgb(${codes[i + 2]},${codes[i + 3]},${codes[i + 4]})`;
        i += 4;
      } else if (c === 38 && codes[i + 1] === 5) {
        i += 2; // 256-color: fall back to current fg
      }
    }
  }
  pushText(line.slice(pos));
  return runs;
}

export function ansiToSvg(ansi: string, opts: { columns: number; rows: number; title: string }): string {
  const { columns, rows, title } = opts;
  const width = Math.ceil(PAD_X * 2 + columns * CHAR_W);
  const height = CHROME_H + PAD_Y * 2 + rows * LINE_H;
  const state = { fg: FG, bold: false, dim: false };

  const lines = ansi.split('\n').slice(0, rows).map((line, i) => {
    const y = CHROME_H + PAD_Y + i * LINE_H + 13;
    const tspans = parseLine(line, state)
      .map((r) => {
        const attrs =
          (r.fg !== FG ? ` fill="${r.fg}"` : '') +
          (r.bold ? ' font-weight="bold"' : '') +
          (r.dim ? ' opacity="0.6"' : '');
        return `<tspan${attrs}>${esc(r.text)}</tspan>`;
      })
      .join('');
    return `  <text x="${PAD_X}" y="${y}" xml:space="preserve">${tspans}</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="${FONT}" font-size="${FONT_SIZE}" fill="${FG}">
  <rect width="${width}" height="${height}" rx="10" fill="${BG}"/>
  <circle cx="20" cy="18" r="6" fill="#ff5f56"/>
  <circle cx="40" cy="18" r="6" fill="#ffbd2e"/>
  <circle cx="60" cy="18" r="6" fill="#27c93f"/>
  <text x="${width / 2}" y="23" text-anchor="middle" fill="#565f89">${esc(title)}</text>
${lines.join('\n')}
</svg>
`;
}
