/**
 * Response History component for Relay CLI
 * Manages scrollable history of all requests and responses with gradient colors
 */

import React from 'react';
import { Box, Text, useStdout } from 'ink';
import Gradient from 'ink-gradient';
import { colors } from '../colors.js';
import { HttpResponse, HttpError } from '../../core/http-client.js';
import { HttpMethod } from './InputPrompt.js';

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  request: {
    method: HttpMethod;
    url: string;
    headers: Record<string, string>;
    body?: string;
  };
  response?: HttpResponse;
  error?: HttpError;
  loading?: boolean;
}

interface ResponseHistoryProps {
  history: HistoryEntry[];
  maxHeight?: number;
}

const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const getStatusColor = (status?: number): string => {
  if (!status) return colors.secondary;
  if (status >= 200 && status < 300) return colors.success;
  if (status >= 300 && status < 400) return colors.warning;
  if (status >= 400) return colors.error;
  return colors.secondary;
};

const RequestBox: React.FC<{ entry: HistoryEntry; terminalWidth?: number }> = ({ entry, terminalWidth = 80 }) => {
  const { request, response, error, loading, timestamp } = entry;
  
  // Calculate dynamic URL truncation based on terminal width with more conservative approach
  const urlMaxLength = Math.max(Math.floor(terminalWidth * 0.5), 30);

  return (
    <Box flexDirection="column" marginBottom={0}>
      {/* Request Info */}
      <Box borderStyle="round" borderColor={colors.primary} padding={1}>
        <Box flexDirection="column">
          {/* Header: Method, Timestamp, and Status on one line */}
          <Box>
            <Text color={colors.accent} bold>{request.method.toUpperCase()}</Text>
            <Text color={colors.secondary}> • {formatTimestamp(timestamp)}</Text>
            {response && (
              <>
                <Text color={colors.secondary}> • </Text>
                <Text color={getStatusColor(response.status)} bold>
                  {response.status} {response.statusText}
                </Text>
                <Text color={colors.secondary}> • {typeof response.data === 'object' ? 'JSON' : 'Text'}</Text>
              </>
            )}
            {loading && (
              <>
                <Text color={colors.secondary}> • </Text>
                <Text color={colors.info}>Loading...</Text>
              </>
            )}
            {error && (
              <>
                <Text color={colors.secondary}> • </Text>
                <Text color={colors.error}>Error</Text>
              </>
            )}
          </Box>
          
          {/* URL on separate line */}
          <Box>
            <Text color={colors.primary}>
              {request.url.length > urlMaxLength 
                ? request.url.slice(0, urlMaxLength) + '...'
                : request.url
              }
            </Text>
          </Box>

          {/* Response Content Preview - Gradient only for JSON keys */}
          {response && (
            <Box marginTop={1} borderStyle="single" borderColor={colors.accent} padding={1}>
              {typeof response.data === 'string' ? (
                <Text color={colors.primary}>
                  {response.data.length > terminalWidth * 4 
                    ? response.data.slice(0, terminalWidth * 4) + '\n\n... (response truncated - ' + (response.data.length - terminalWidth * 4) + ' more characters)'
                    : response.data
                  }
                </Text>
              ) : (
                <Box flexDirection="column">
                  {(() => {
                    const formatted = JSON.stringify(response.data, null, 2);
                    // Reduce content size based on terminal width
                    const maxContentLength = Math.max(terminalWidth * 4, 300);
                    const content = formatted.length > maxContentLength 
                      ? formatted.slice(0, maxContentLength) + '\n\n... (response truncated - ' + (formatted.length - maxContentLength) + ' more characters)'
                      : formatted;
                    
                    // Apply gradient only to JSON keys (text between quotes followed by colon)
                    return content.split('\n').map((line, index) => {
                      // Truncate long lines to prevent box overflow
                      const truncatedLine = line.length > terminalWidth - 20 
                        ? line.slice(0, terminalWidth - 20) + '...'
                        : line;
                        
                      const keyMatch = truncatedLine.match(/^(\s*)"([^"]+)"(\s*:\s*)(.*)/);
                      if (keyMatch) {
                        const [, indent, key, colon, value] = keyMatch;
                        return (
                          <Box key={index}>
                            <Text color={colors.secondary}>{indent}"</Text>
                            <Gradient colors={['#ff4757', '#ff6348', '#ff7675', '#fd79a8', '#6c5ce7', '#74b9ff', '#00b894']}>
                              <Text>{key}</Text>
                            </Gradient>
                            <Text color={colors.secondary}>"</Text>
                            <Text color={colors.secondary}>{colon}</Text>
                            <Text color={colors.primary}>{value}</Text>
                          </Box>
                        );
                      }
                      return <Text key={index} color={colors.primary}>{truncatedLine}</Text>;
                    });
                  })()}
                </Box>
              )}
            </Box>
          )}

          {/* Error Details */}
          {error && error.status && (
            <Box marginTop={1} borderStyle="single" borderColor={colors.error} padding={1}>
              <Text color={colors.error}>
                Status: {error.status} {error.statusText}
              </Text>
              {error.message && (
                <Box marginTop={1}>
                  <Text color={colors.error}>{error.message.slice(0, 200)}</Text>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export const ResponseHistory: React.FC<ResponseHistoryProps> = ({ history }) => {
  const { stdout } = useStdout();
  const terminalWidth = stdout?.columns || 80;
  const terminalHeight = stdout?.rows || 24;
  
  // Calculate available height for history (leave space for input and header)
  const availableHeight = Math.max(Math.min(terminalHeight - 15, 20), 5);
  const maxEntries = Math.max(Math.floor(availableHeight / 8), 1); // More conservative calculation

  if (history.length === 0) {
    return (
      <Box flexDirection="column" paddingX={1} paddingY={2}>
        <Text color={colors.secondary} dimColor>
          Ready to make requests. Use slash commands to get started!
        </Text>
        <Box marginTop={1}>
          <Text color={colors.accent}>💡 Try: /url https://jsonplaceholder.typicode.com/posts/1</Text>
        </Box>
        <Box marginTop={1}>
          <Text color={colors.accent}>Then: /execute</Text>
        </Box>
        <Box marginTop={1}>
          <Text color={colors.accent}>Or try: /file get-user.json</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1} width={Math.min(terminalWidth - 4, 100)}>
      {/* Show current request/response only */}
      {history.map((entry) => (
        <RequestBox 
          key={entry.id} 
          entry={entry} 
          terminalWidth={Math.min(terminalWidth - 4, 100)} 
        />
      ))}
    </Box>
  );
};