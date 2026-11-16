import React from 'react';
import { Box, Text } from 'ink';

interface TileProps {
  title: string;
  color?: string;
  width?: number | string;
  height?: number | string;
  flexGrow?: number;
  children: React.ReactNode;
}

export function Tile({ title, color = 'cyan', width, height, flexGrow, children }: TileProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={color}
      width={width}
      height={height}
      flexGrow={flexGrow}
      paddingX={1}
      overflow="hidden"
    >
      <Text color={color} bold>
        {title}
      </Text>
      {children}
    </Box>
  );
}
