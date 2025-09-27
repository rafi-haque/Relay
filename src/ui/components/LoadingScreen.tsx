/**
 * Loading Screen component for Relay CLI
 * Shows animated loading with gradient branding
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import { colors } from '../colors.js';
import { selectLogoByWidth } from './AsciiArt.js';

interface LoadingScreenProps {
  terminalWidth: number;
  onComplete: () => void;
  duration?: number;
}

const LoadingAnimation: React.FC<{ frame: number }> = ({ frame }) => {
  const spinners = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const dots = '.'.repeat((frame % 4) + 1);
  
  return (
    <Box flexDirection="column" alignItems="center">
      <Text color={colors.accent}>
        {spinners[frame % spinners.length]} Initializing relay-cli{dots}
      </Text>
    </Box>
  );
};

const ProgressBar: React.FC<{ progress: number; width: number }> = ({ progress, width }) => {
  const barWidth = Math.min(width - 10, 40);
  const filled = Math.floor((progress / 100) * barWidth);
  const empty = barWidth - filled;
  
  return (
    <Box marginTop={1}>
      <Text color={colors.secondary}>[</Text>
      <Gradient colors={colors.gradient}>
        <Text>{'█'.repeat(filled)}</Text>
      </Gradient>
      <Text color={colors.secondary}>{'░'.repeat(empty)}]</Text>
      <Text color={colors.primary}> {progress}%</Text>
    </Box>
  );
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  terminalWidth, 
  onComplete, 
  duration = 2000 
}) => {
  const [frame, setFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  
  const displayLogo = selectLogoByWidth(terminalWidth);

  useEffect(() => {
    // Show logo after a brief delay
    const logoTimer = setTimeout(() => setShowLogo(true), 300);
    
    // Animation frame counter
    const frameInterval = setInterval(() => {
      setFrame(prev => prev + 1);
    }, 100);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 4;
      });
    }, duration / 25);

    // Complete loading
    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(completeTimer);
      clearInterval(frameInterval);
      clearInterval(progressInterval);
    };
  }, [duration, onComplete]);

  return (
    <Box 
      flexDirection="column" 
      justifyContent="center" 
      alignItems="center" 
      paddingY={2}
      minHeight={15}
    >
      {showLogo && (
        <Box marginBottom={2}>
          <Gradient colors={colors.gradient}>
            <Text>{displayLogo}</Text>
          </Gradient>
        </Box>
      )}
      
      <LoadingAnimation frame={frame} />
      
      <ProgressBar progress={progress} width={terminalWidth} />
      
      <Box marginTop={2}>
        <Text color={colors.secondary} dimColor>
          Starting HTTP client...
        </Text>
      </Box>
    </Box>
  );
};