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
    >
      <Box justifyContent="center">
        <Gradient colors={colors.gradient}>
          <Text>{displayLogo}</Text>
        </Gradient>
      </Box>
      
      {showVersion && (
        <Box justifyContent="flex-end">
          <Text color={colors.secondary}>
            HTTP Client v{version}
          </Text>
        </Box>
      )}

      <Box>
        <Text color={colors.secondary}>
          Use /help for commands • Try /file get-user.json
        </Text>
      </Box>
    </Box>
  );
};