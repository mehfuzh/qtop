import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ASCII_GLYPHS, COLOR_THEME, DARK_THEME, THEME_NAMES, WHITE_THEME,
  getTheme, isThemeName, nextTheme, parseTheme, resolveColor, tileColor,
} from '../src/lib/theme.js';

test('getTheme returns each theme and falls back to color', () => {
  assert.equal(getTheme('color'), COLOR_THEME);
  assert.equal(getTheme('white'), WHITE_THEME);
  assert.equal(getTheme('dark'), DARK_THEME);
});

test('isThemeName accepts known names only', () => {
  for (const n of THEME_NAMES) assert.ok(isThemeName(n));
  assert.ok(!isThemeName('neon'));
  assert.ok(!isThemeName(''));
});

test('nextTheme cycles in order and wraps', () => {
  assert.equal(nextTheme('color'), 'white');
  assert.equal(nextTheme('white'), 'dark');
  assert.equal(nextTheme('dark'), 'color');
});

test('parseTheme reads --theme=, --theme, -t and QTOP_THEME', () => {
  assert.equal(parseTheme(['--theme=white']), WHITE_THEME);
  assert.equal(parseTheme(['--theme', 'dark']), DARK_THEME);
  assert.equal(parseTheme(['-t', 'white']), WHITE_THEME);
  assert.equal(parseTheme([], 'dark'), DARK_THEME);
});

test('parseTheme falls back to color for unknown/missing values', () => {
  assert.equal(parseTheme([], undefined), COLOR_THEME);
  assert.equal(parseTheme(['--theme=garbage']), COLOR_THEME);
  assert.equal(parseTheme(['--theme']), COLOR_THEME);
  assert.equal(parseTheme([], 'garbage'), COLOR_THEME);
});

test('argv wins over the environment', () => {
  assert.equal(parseTheme(['--theme=white'], 'dark'), WHITE_THEME);
});

test('tileColor uses per-tile colours, mono themes collapse to fg', () => {
  assert.equal(tileColor(COLOR_THEME, 'cpu'), 'green');
  assert.equal(tileColor(WHITE_THEME, 'cpu'), 'white');
  assert.equal(tileColor(DARK_THEME, 'gpu'), 'gray');
});

test('resolveColor keeps colours on color theme, collapses on mono', () => {
  assert.equal(resolveColor(COLOR_THEME, 'red'), 'red');
  assert.equal(resolveColor(WHITE_THEME, 'red'), 'white');
  assert.equal(resolveColor(DARK_THEME, 'red'), 'gray');
  assert.equal(resolveColor(COLOR_THEME, undefined), undefined);
  assert.equal(resolveColor(WHITE_THEME, undefined), undefined);
});

test('mono themes use ASCII glyphs and ASCII marker/border', () => {
  for (const t of [WHITE_THEME, DARK_THEME]) {
    assert.equal(t.mono, true);
    assert.equal(t.glyphs, ASCII_GLYPHS);
    assert.equal(t.marker, '> ');
    assert.equal(t.borderStyle, 'classic');
  }
  assert.equal(COLOR_THEME.glyphs.ramp, '▁▂▃▄▅▆▇█');
  assert.equal(COLOR_THEME.marker, '◆ ');
});
