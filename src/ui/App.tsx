/**
 * Main App component for Relay CLI
 * Orchestrates the entire application
 */

import React, { useState, useEffect } from 'react';
import { Box, useStdout } from 'ink';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { Header } from './components/Header.js';
import { InputPrompt, HttpMethod } from './components/InputPrompt.js';
import { ResponseHistory, HistoryEntry } from './components/ResponseHistory.js';
import { LoadingScreen } from './components/LoadingScreen.js';
import { RelayHttpClient, HttpResponse, HttpError } from '../core/http-client.js';
import { EnvironmentManager } from '../core/environment-manager.js';

const httpClient = new RelayHttpClient();

export const App: React.FC = () => {
  const { stdout } = useStdout();
  const columns = stdout?.columns || 80;
  const rows = stdout?.rows || 24;
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentLoading, setCurrentLoading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [environmentManager] = useState(() => new EnvironmentManager());

  const handleRequest = async (data: {
    method: HttpMethod;
    url: string;
    headers: Record<string, string>;
    body?: string;
  }) => {
    const entryId = Date.now().toString();
    
    // Substitute environment variables in request data
    const processedData = {
      ...data,
      url: environmentManager.substituteVariables(data.url),
      headers: Object.entries(data.headers).reduce((acc, [key, value]) => {
        acc[key] = environmentManager.substituteVariables(value);
        return acc;
      }, {} as Record<string, string>),
      body: data.body ? environmentManager.substituteVariables(data.body) : data.body
    };
    
    // Create new history entry with processed data
    const newEntry: HistoryEntry = {
      id: entryId,
      timestamp: new Date(),
      request: processedData,
      loading: true
    };
    
    // Clear previous history and show only the new request
    setHistory([newEntry]);
    setCurrentLoading(entryId);

    try {
      const result = await httpClient.sendRequest({
        method: processedData.method,
        url: processedData.url,
        headers: processedData.headers,
        data: processedData.body ? JSON.parse(processedData.body) : undefined,
      });
      
      // Update history entry with response
      setHistory(prev => prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, response: result, loading: false }
          : entry
      ));
    } catch (err) {
      // Update history entry with error
      setHistory(prev => prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, error: err as HttpError, loading: false }
          : entry
      ));
    } finally {
      setCurrentLoading(null);
    }
  };

  const handleSaveResponse = (filename: string) => {
    if (history.length === 0) {
      return;
    }

    const currentEntry = history[0]; // Since we only keep one entry now
    if (!currentEntry.response) {
      return;
    }

    try {
      // Ensure filename has .json extension
      const jsonFilename = filename.endsWith('.json') ? filename : filename + '.json';
      const fullPath = join(process.cwd(), 'responses', jsonFilename);
      
      // Create responses directory if it doesn't exist
      const responseDir = dirname(fullPath);
      if (!existsSync(responseDir)) {
        mkdirSync(responseDir, { recursive: true });
      }

      // Save the response data
      const responseData = {
        timestamp: currentEntry.timestamp,
        request: currentEntry.request,
        response: {
          status: currentEntry.response.status,
          statusText: currentEntry.response.statusText,
          headers: currentEntry.response.headers,
          data: currentEntry.response.data
        }
      };

      writeFileSync(fullPath, JSON.stringify(responseData, null, 2));
      console.log(`Response saved to ${fullPath}`);
    } catch (error) {
      console.error('Failed to save response:', error);
    }
  };

  // Show loading screen first
  if (isLoading) {
    return (
      <LoadingScreen 
        terminalWidth={columns} 
        onComplete={() => setIsLoading(false)}
        duration={1800}
      />
    );
  }

  return (
    <Box flexDirection="column" minHeight={rows}>
      {/* Header - Fixed at top */}
      <Box flexShrink={0}>
        <Header terminalWidth={columns} />
      </Box>
      
      {/* Scrollable Response History - Takes available space */}
      <Box flexGrow={1}>
        <ResponseHistory history={history} />
      </Box>
      
      {/* Fixed Input at Bottom */}
      <Box flexShrink={0} paddingX={1}>
        <Box borderStyle="round" borderColor="#6366f1" padding={1}>
          <InputPrompt 
            onSubmit={handleRequest} 
            onSaveResponse={handleSaveResponse}
            environmentManager={environmentManager}
          />
        </Box>
      </Box>
    </Box>
  );
};