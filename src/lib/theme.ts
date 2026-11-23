import type { TileId } from './layout.js';

/** Character set used to draw bars and waves. */
export interface Glyphs {
  /** eight-level ramp, low → high */
  ramp: string;
  /** solid "full" cell */
  full: string;
  /** empty cell */
  empty: string;
  /** back-wall shading, far → near */
  wall: [string, string];
}

/** Box-drawing/block glyphs used by the colour theme. */
export const UNICODE_GLYPHS: Glyphs = {
  ramp: '▁▂▃▄▅▆▇█',
  full: '█',
  empty: '░',
  wall: ['░', '▒'],
};

/** Plain ASCII set for the retro themes (no box-drawing/blocks). */
export const ASCII_GLYPHS: Glyphs = {
  ramp: '_.-~=+*#',
  full: '#',
  empty: '.',
  wall: [':', ';'],
};

export type ThemeName = 'color' | 'white' | 'dark';

export interface Theme {
  name: ThemeName;
  label: string;
  /** single colour used by the mono themes */
  mono: boolean;
  /** main foreground colour */
  fg: string;
  /** dimmed text colour */
  muted: string;
  /** colour of the selected tile */
  accent: string;
  /** per-tile colours (ignored by mono themes) */
  tileColors: Record<TileId, string>;
  /** border style for the tiles */
  borderStyle: 'single' | 'round' | 'bold' | 'double' | 'classic' | 'arrow';
  glyphs: Glyphs;
  /** marker drawn in front of the selected tile title */
  marker: string;
}

/** Default theme: btop-like colours with block glyphs. */
export const COLOR_THEME: Theme = {
  name: 'color',
  label: 'color',
  mono: false,
  fg: 'white',
  muted: 'gray',
  accent: 'white',
  tileColors: {
    cpu: 'green',
    gpu: 'magenta',
    mem: 'yellow',
    net: 'blue',
    disk: 'red',
    proc: 'cyan',
  },
  borderStyle: 'round',
  glyphs: UNICODE_GLYPHS,
  marker: '◆ ',
};

/** One-colour "white" theme, like a plain `ls` listing: everything in white. */
export const WHITE_THEME: Theme = {
  name: 'white',
  label: 'white',
  mono: true,
  fg: 'white',
  muted: 'gray',
  accent: 'white',
  tileColors: {
    cpu: 'white',
    gpu: 'white',
    mem: 'white',
    net: 'white',
    disk: 'white',
    proc: 'white',
  },
  borderStyle: 'classic',
  glyphs: ASCII_GLYPHS,
  marker: '> ',
};

/** One-colour "dark" theme: dimmed, ASCII-only, retro terminal look. */
export const DARK_THEME: Theme = {
  name: 'dark',
  label: 'dark',
  mono: true,
  fg: 'gray',
  muted: 'gray',
  accent: 'white',
  tileColors: {
    cpu: 'gray',
    gpu: 'gray',
    mem: 'gray',
    net: 'gray',
    disk: 'gray',
    proc: 'gray',
  },
  borderStyle: 'classic',
  glyphs: ASCII_GLYPHS,
  marker: '> ',
};

/** Every theme, in cycle order. */
export const THEME_NAMES: ThemeName[] = ['color', 'white', 'dark'];

export function isThemeName(value: string): value is ThemeName {
  return (THEME_NAMES as string[]).includes(value);
}

/** The theme with that name; unknown names fall back to the colour theme. */
export function getTheme(name: ThemeName): Theme {
  switch (name) {
    case 'white':
      return WHITE_THEME;
    case 'dark':
      return DARK_THEME;
    default:
      return COLOR_THEME;
  }
}

/** The theme after `name` in the cycle (used by the `t` key). */
export function nextTheme(name: ThemeName): ThemeName {
  const i = THEME_NAMES.indexOf(name);
  return THEME_NAMES[(i + 1) % THEME_NAMES.length];
}

/**
 * Resolve the theme from the command line and the environment.
 * Accepts `--theme=name`, `--theme name`, `-t name` and `QTOP_THEME`.
 */
export function parseTheme(argv: string[] = [], env?: string): Theme {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] ?? '';
    if (arg === '--theme' || arg === '-t') {
      const value = argv[i + 1];
      if (value && isThemeName(value)) return getTheme(value);
      i++;
    } else if (arg.startsWith('--theme=')) {
      const value = arg.slice('--theme='.length);
      if (isThemeName(value)) return getTheme(value);
    }
  }
  if (env && isThemeName(env)) return getTheme(env);
  return COLOR_THEME;
}

/** Colour of a tile in this theme — mono themes use their single colour. */
export function tileColor(theme: Theme, id: TileId): string {
  if (theme.mono) return theme.fg;
  return theme.tileColors[id] ?? theme.fg;
}

/**
 * Map a semantic colour (green/yellow/red/…) onto the theme: the mono
 * themes collapse every colour to their single foreground colour.
 */
export function resolveColor(theme: Theme, color?: string): string | undefined {
  if (!color) return undefined;
  if (!theme.mono) return color;
  return theme.fg;
}
