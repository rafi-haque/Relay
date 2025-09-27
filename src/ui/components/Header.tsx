/**
 * Header component for Relay CLI
 * Displays beautiful gradient ASCII art logo
 */

import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import { colors } from '../colors.js';
import { selectLogoByWidth, getAsciiArtWidth } from './AsciiArt.js';

interface HeaderProps {
  terminalWidth: number;
  version?: string;
  showVersion?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  terminalWidth, 
  version = '1.0.0',
  showVersion = true 
}) => {
  const displayLogo = selectLogoByWidth(terminalWidth);
  const artWidth = getAsciiArtWidth(displayLogo);

  return (
    <Box
      flexShrink={0}
      flexDirection="column"
      paddingX={1}
      paddingY={1}
    >
      {/* Centered Logo */}
      <Box justifyContent="center" width="100%">
        <Gradient colors={colors.gradient}>
          <Text>{displayLogo}</Text>
        </Gradient>
      </Box>
      
      {/* Centered Version Info */}
      {showVersion && (
        <Box justifyContent="center" marginTop={1}>
          <Text color={colors.secondary}>
            🚀 Professional HTTP Client v{version} 🚀
          </Text>
        </Box>
      )}

      {/* Centered Quick Tips */}
      <Box justifyContent="center" marginTop={1}>
        <Text color={colors.secondary}>
          Press Ctrl+H for help • Ctrl+E to execute • Try /env load jsonplaceholder
        </Text>
      </Box>
    </Box>
  );
};