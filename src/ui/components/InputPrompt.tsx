/**
 * Input Prompt component for Relay CLI
 * Handles slash commands for building HTTP requests like Postman
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import Gradient from 'ink-gradient';
import { colors } from '../colors.js';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestBuilder {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

interface InputPromptProps {
  onSubmit: (data: RequestBuilder) => void;
}

// Available slash commands
const COMMANDS = {
  '/url': 'Set the request URL',
  '/method': 'Set HTTP method (GET, POST, PUT, DELETE, PATCH)',
  '/header': 'Add a header (format: key:value)',
  '/body': 'Set request body (JSON)',
  '/file': 'Load request from JSON file (format: /file filename.json)',
  '/execute': 'Execute the current request',
  '/clear': 'Clear the current request',
  '/full': 'Show last response in full (no truncation)',
  '/help': 'Show available commands'
};

export const InputPrompt: React.FC<InputPromptProps> = ({ onSubmit }) => {
  const [currentInput, setCurrentInput] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [requestBuilder, setRequestBuilder] = useState<RequestBuilder>({
    method: 'GET',
    url: '',
    headers: { 'Content-Type': 'application/json' },
    body: undefined
  });
  const [lastCommand, setLastCommand] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const getAvailableFiles = (): string[] => {
    try {
      const requestsDir = join(process.cwd(), 'requests');
      if (!existsSync(requestsDir)) {
        return [];
      }
      return readdirSync(requestsDir)
        .filter(file => file.endsWith('.json'))
        .sort();
    } catch (error) {
      return [];
    }
  };

  const loadRequestFromFile = (filename: string) => {
    try {
      // Support both absolute paths and relative paths from requests folder
      let filePath = filename;
      if (!filename.includes('/')) {
        filePath = join(process.cwd(), 'requests', filename);
      }

      if (!existsSync(filePath)) {
        setLastCommand(`Error: File not found: ${filename}`);
        return;
      }

      const fileContent = readFileSync(filePath, 'utf-8');
      const requestData = JSON.parse(fileContent);

      // Validate required fields
      if (!requestData.method || !requestData.url) {
        setLastCommand('Error: File must contain "method" and "url" fields');
        return;
      }

      // Validate method
      const method = requestData.method.toUpperCase() as HttpMethod;
      if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        setLastCommand('Error: Invalid method in file. Use GET, POST, PUT, DELETE, or PATCH');
        return;
      }

      // Load the request data
      setRequestBuilder({
        method,
        url: requestData.url,
        headers: requestData.headers || { 'Content-Type': 'application/json' },
        body: requestData.body
      });

      setLastCommand(`Request loaded from ${filename}: ${method} ${requestData.url}`);
      setShowHelp(false);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setLastCommand('Error: Invalid JSON format in file');
      } else {
        setLastCommand(`Error loading file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      setShowHelp(false);
    }
  };

  const executeCommand = (input: string) => {
    const trimmed = input.trim();
    
    if (trimmed === '/help') {
      setShowHelp(true);
      setLastCommand('');
      return;
    }

    if (trimmed === '/clear') {
      setRequestBuilder({
        method: 'GET',
        url: '',
        headers: { 'Content-Type': 'application/json' },
        body: undefined
      });
      setLastCommand('Request cleared');
      setShowHelp(false);
      return;
    }

    if (trimmed === '/execute') {
      if (!requestBuilder.url) {
        setLastCommand('Error: URL is required. Use /url <url>');
        setShowHelp(false);
        return;
      }
      onSubmit(requestBuilder);
      setLastCommand('Request executed!');
      setShowHelp(false);
      return;
    }

    if (trimmed.startsWith('/url ')) {
      const url = trimmed.substring(5).trim();
      if (url) {
        setRequestBuilder(prev => ({ ...prev, url }));
        setLastCommand('URL set to: ' + url);
      } else {
        setLastCommand('Error: URL cannot be empty');
      }
      setShowHelp(false);
      return;
    }

    if (trimmed.startsWith('/method ')) {
      const method = trimmed.substring(8).trim().toUpperCase() as HttpMethod;
      if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        setRequestBuilder(prev => ({ ...prev, method }));
        setLastCommand('Method set to: ' + method);
      } else {
        setLastCommand('Error: Invalid method. Use GET, POST, PUT, DELETE, or PATCH');
      }
      setShowHelp(false);
      return;
    }

    if (trimmed.startsWith('/header ')) {
      const headerStr = trimmed.substring(8).trim();
      const colonIndex = headerStr.indexOf(':');
      if (colonIndex > 0) {
        const key = headerStr.substring(0, colonIndex).trim();
        const value = headerStr.substring(colonIndex + 1).trim();
        setRequestBuilder(prev => ({
          ...prev,
          headers: { ...prev.headers, [key]: value }
        }));
        setLastCommand('Header added: ' + key + ': ' + value);
      } else {
        setLastCommand('Error: Header format should be key:value');
      }
      setShowHelp(false);
      return;
    }

    if (trimmed.startsWith('/body ')) {
      const body = trimmed.substring(6).trim();
      setRequestBuilder(prev => ({ ...prev, body }));
      setLastCommand('Body set (' + body.length + ' characters)');
      setShowHelp(false);
      return;
    }

    if (trimmed.startsWith('/file ')) {
      const filename = trimmed.substring(6).trim();
      if (filename) {
        loadRequestFromFile(filename);
      } else {
        setLastCommand('Error: Filename is required. Usage: /file <filename.json>');
      }
      setShowHelp(false);
      return;
    }

    // If no command matched and it's not empty, try as URL shortcut
    if (trimmed && !trimmed.startsWith('/')) {
      setRequestBuilder(prev => ({ ...prev, url: trimmed }));
      setLastCommand('URL set to: ' + trimmed + ' (tip: use /execute to run)');
      setShowHelp(false);
      return;
    }

    // Unknown command
    if (trimmed.startsWith('/')) {
      setLastCommand('Unknown command. Type /help for available commands');
      setShowHelp(false);
    }
  };

  // Update suggestions based on current input
  const updateSuggestions = (input: string) => {
    if (!input.startsWith('/')) {
      setSuggestions([]);
      return;
    }
    
    // Handle /file command with file suggestions
    if (input.startsWith('/file ')) {
      const fileInput = input.substring(6);
      const availableFiles = getAvailableFiles();
      const matchingFiles = availableFiles.filter(file => 
        file.toLowerCase().includes(fileInput.toLowerCase())
      );
      setSuggestions(matchingFiles.slice(0, 5)); // Show max 5 file suggestions
      return;
    }
    
    // Handle regular command suggestions
    const matchingCommands = Object.keys(COMMANDS).filter(cmd => 
      cmd.toLowerCase().startsWith(input.toLowerCase())
    );
    setSuggestions(matchingCommands.slice(0, 3)); // Show max 3 command suggestions
  };

  useInput((input, key) => {
    if (key.return) {
      if (currentInput.trim()) {
        // Add to history
        setCommandHistory(prev => [...prev, currentInput]);
        setHistoryIndex(-1);
        executeCommand(currentInput);
        setCurrentInput('');
        setCursorPosition(0);
        setSuggestions([]);
      }
    } else if (key.upArrow) {
      // Navigate up in history
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        const historyInput = commandHistory[newIndex];
        setCurrentInput(historyInput);
        setCursorPosition(historyInput.length);
        setSuggestions([]);
      }
    } else if (key.downArrow) {
      // Navigate down in history
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
          setCursorPosition(0);
        } else {
          setHistoryIndex(newIndex);
          const historyInput = commandHistory[newIndex];
          setCurrentInput(historyInput);
          setCursorPosition(historyInput.length);
        }
        setSuggestions([]);
      }
    } else if (key.leftArrow) {
      // Move cursor left
      setCursorPosition(prev => Math.max(0, prev - 1));
    } else if (key.rightArrow) {
      // Move cursor right
      setCursorPosition(prev => Math.min(currentInput.length, prev + 1));
    } else if (key.tab && suggestions.length > 0) {
      // Tab completion
      const suggestion = suggestions[0];
      // For file suggestions, complete with /file prefix
      if (currentInput.startsWith('/file ')) {
        const newInput = '/file ' + suggestion;
        setCurrentInput(newInput);
        setCursorPosition(newInput.length);
      } else {
        setCurrentInput(suggestion);
        setCursorPosition(suggestion.length);
      }
      setSuggestions([]);
    } else if (key.backspace || key.delete) {
      if (cursorPosition > 0) {
        const newInput = currentInput.slice(0, cursorPosition - 1) + currentInput.slice(cursorPosition);
        setCurrentInput(newInput);
        setCursorPosition(prev => prev - 1);
        updateSuggestions(newInput);
        if (showHelp && newInput.length > 0) {
          setShowHelp(false);
        }
      }
    } else if (input) {
      const newInput = currentInput.slice(0, cursorPosition) + input + currentInput.slice(cursorPosition);
      setCurrentInput(newInput);
      setCursorPosition(prev => prev + 1);
      updateSuggestions(newInput);
      if (showHelp) {
        setShowHelp(false);
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Gradient name="atlas">
        <Text>🚀 Request Builder • Type /help for commands</Text>
      </Gradient>
      
      <Box marginTop={1}>
        <Text color={colors.primary}>
          {requestBuilder.method} - {requestBuilder.url || 'No URL set'}
        </Text>
        {Object.keys(requestBuilder.headers).length > 1 && (
          <Text color={colors.secondary}> • {Object.keys(requestBuilder.headers).length} headers</Text>
        )}
        {requestBuilder.body && (
          <Text color={colors.secondary}> • Has body</Text>
        )}
      </Box>

      {lastCommand ? (
        <Box marginTop={1}>
          <Text color={colors.success}>💡 {lastCommand}</Text>
        </Box>
      ) : null}

      {showHelp && (
        <Box marginTop={1} flexDirection="column">
          <Gradient name="atlas">
            <Text>📚 Available Commands</Text>
          </Gradient>
          <Box marginTop={1} flexDirection="column">
            {Object.entries(COMMANDS).map(([command, description]) => (
              <Box key={command} marginBottom={0}>
                <Text color={colors.accent}>{command.padEnd(20)}</Text>
                <Text color={colors.secondary}>{description}</Text>
              </Box>
            ))}
          </Box>
          <Box marginTop={1}>
            <Text color={colors.secondary} dimColor>
              💡 Tip: Type any command above to hide this help
            </Text>
          </Box>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color={colors.secondary}>&gt; </Text>
        <Text color={colors.primary}>
          {currentInput.slice(0, cursorPosition)}
        </Text>
        <Text color={colors.accent}>_</Text>
        <Text color={colors.primary}>
          {currentInput.slice(cursorPosition)}
        </Text>
      </Box>

      {/* Command and file suggestions */}
      {suggestions.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text color={colors.secondary} dimColor>
            {currentInput.startsWith('/file ') ? 'Available files (Tab to complete):' : 'Suggestions (Tab to complete):'}
          </Text>
          {suggestions.map((suggestion, index) => (
            <Box key={suggestion}>
              <Text color={colors.accent}>  {suggestion}</Text>
              {!currentInput.startsWith('/file ') && COMMANDS[suggestion as keyof typeof COMMANDS] && (
                <Text color={colors.secondary}> - {COMMANDS[suggestion as keyof typeof COMMANDS]}</Text>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Command history hint */}
      {commandHistory.length > 0 && historyIndex === -1 && currentInput === '' && (
        <Box marginTop={1}>
          <Text color={colors.secondary} dimColor>↑↓ Navigate history • Tab to complete • /help for commands</Text>
        </Box>
      )}
    </Box>
  );
};