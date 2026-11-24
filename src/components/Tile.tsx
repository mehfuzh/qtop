import React from 'react';
import { Box, Text } from 'ink';

interface TileProps {
  title: string;
  width?: number | string;
  height?: number | string;
  flexGrow?: number;
  selected?: boolean;
  children: React.ReactNode;
}

export function Tile({ title, width, height, flexGrow, selected = false, children }: TileProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      width={width}
      height={height}
      flexGrow={flexGrow}
      paddingX={1}
      overflow="hidden"
    >
      <Text bold wrap="truncate-end">{selected ? '◆ ' : ''}{title}</Text>
      {children}
    </Box>
  );
}
