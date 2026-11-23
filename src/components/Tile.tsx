import React from 'react';
import { Box, Text } from 'ink';
import { COLOR_THEME, tileColor, type Theme } from '../lib/theme.js';
import type { TileId } from '../lib/layout.js';

interface TileProps {
  title: string;
  /** which tile kind this is — picks the theme colour */
  id: TileId;
  theme?: Theme;
  width?: number | string;
  height?: number | string;
  flexGrow?: number;
  selected?: boolean;
  children: React.ReactNode;
}

export function Tile({ title, id, theme = COLOR_THEME, width, height, flexGrow, selected = false, children }: TileProps) {
  const base = tileColor(theme, id);
  const borderColor = selected ? theme.accent : base;
  return (
    <Box
      flexDirection="column"
      borderStyle={theme.borderStyle}
      borderColor={borderColor}
      width={width}
      height={height}
      flexGrow={flexGrow}
      paddingX={1}
      overflow="hidden"
    >
      <Text color={selected ? theme.accent : base} bold>
        {selected ? theme.marker : ''}{title}
      </Text>
      {children}
    </Box>
  );
}
