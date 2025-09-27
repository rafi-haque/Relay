/**
 * Main App component for Relay CLI
 * Orchestrates the entire application
 */

import React, { useState } from 'react';
import { Box, useStdout } from 'ink';
import { Header } from './components/Header.js';
import { InputPrompt, HttpMethod } from './components/InputPrompt.js';
import { ResponseHistory, HistoryEntry } from './components/ResponseHistory.js';
import { RelayHttpClient, HttpResponse, HttpError } from '../core/http-client.js';

const httpClient = new RelayHttpClient();

export const App: React.FC = () => {
  const { stdout } = useStdout();
  const columns = stdout?.columns || 80;
  const rows = stdout?.rows || 24;
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentLoading, setCurrentLoading] = useState<string | null>(null);

  const handleRequest = async (data: {
    method: HttpMethod;
    url: string;
    headers: Record<string, string>;
    body?: string;
  }) => {
    const entryId = Date.now().toString();
    
    // Create new history entry
    const newEntry: HistoryEntry = {
      id: entryId,
      timestamp: new Date(),
      request: data,
      loading: true
    };
    
    // Add to history and set loading
    setHistory(prev => [...prev, newEntry]);
    setCurrentLoading(entryId);

    try {
      const result = await httpClient.sendRequest({
        method: data.method,
        url: data.url,
        headers: data.headers,
        data: data.body ? JSON.parse(data.body) : undefined,
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
      <Box flexShrink={0} paddingX={1} paddingBottom={1}>
        <Box borderStyle="round" borderColor="#6366f1" padding={1}>
          <InputPrompt onSubmit={handleRequest} />
        </Box>
      </Box>
    </Box>
  );
};