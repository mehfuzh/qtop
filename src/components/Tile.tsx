import React from 'react';
import { Box, Text } from 'ink';

interface TileProps {
  title: string;
  color?: string;
  width?: number | string;
  height?: number | string;
  flexGrow?: number;
  selected?: boolean;
  children: React.ReactNode;
}

export function Tile({ title, color = 'cyan', width, height, flexGrow, selected = false, children }: TileProps) {
  const borderColor = selected ? 'white' : color;
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={borderColor}
      width={width}
      height={height}
      flexGrow={flexGrow}
      paddingX={1}
      overflow="hidden"
    >
      <Text color={selected ? 'white' : color} bold>
        {selected ? '◆ ' : ''}{title}
      </Text>
      {children}
    </Box>
  );
}
