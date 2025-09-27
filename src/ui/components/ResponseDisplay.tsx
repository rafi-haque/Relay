/**
 * Response Display component for Relay CLI
 * Shows HTTP response with beautiful formatting
 */

import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../colors.js';
import { HttpResponse, HttpError } from '../../core/http-client.js';

interface ResponseDisplayProps {
  response?: HttpResponse;
  error?: HttpError;
  loading?: boolean;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ 
  response, 
  error, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Box flexDirection="column" marginTop={2}>
        <Text color={colors.info}>⚡ Sending request...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column" marginTop={2}>
        <Box>
          <Text color={colors.error}>❌ Request failed</Text>
        </Box>
        <Box marginTop={1}>
          <Text color={colors.secondary}>Error: </Text>
          <Text color={colors.error}>{error.message}</Text>
        </Box>
        {error.status && (
          <Box>
            <Text color={colors.secondary}>Status: </Text>
            <Text color={colors.error}>{error.status} {error.statusText}</Text>
          </Box>
        )}
      </Box>
    );
  }

  if (!response) {
    return (
      <Box flexDirection="column" marginTop={2}>
        <Text color={colors.secondary}>
          Ready to send HTTP requests!
        </Text>
        <Text color={colors.secondary}>
          Select a method and enter a URL to get started.
        </Text>
      </Box>
    );
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return colors.success;
    if (status >= 400) return colors.error;
    return colors.warning;
  };

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return '✅';
    if (status >= 400) return '❌';
    return '⚠️';
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatJson = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <Box flexDirection="column" marginTop={2}>
      {/* Status Line */}
      <Box>
        <Text color={getStatusColor(response.status)}>
          {getStatusIcon(response.status)} {response.status} {response.statusText}
        </Text>
        <Text color={colors.secondary}> | </Text>
        <Text color={colors.info}>{response.responseTime}ms</Text>
        <Text color={colors.secondary}> | </Text>
        <Text color={colors.primary}>{formatSize(response.size)}</Text>
      </Box>

      {/* Headers */}
      <Box flexDirection="column" marginTop={1}>
        <Text color={colors.info}>Response Headers:</Text>
        {Object.entries(response.headers).map(([key, value]) => (
          <Box key={key}>
            <Text color={colors.secondary}>  {key}: </Text>
            <Text color={colors.primary}>{String(value)}</Text>
          </Box>
        ))}
      </Box>

      {/* Body */}
      <Box flexDirection="column" marginTop={1}>
        <Text color={colors.info}>Response Body:</Text>
        <Box marginTop={1} padding={1} borderStyle="single" borderColor={colors.secondary}>
          <Text color={colors.primary}>
            {formatJson(response.data)}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};