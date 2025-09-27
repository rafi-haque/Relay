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
  onSaveResponse?: (filename: string) => void;
  environmentManager?: any; // Will be properly typed when imported
}

// Available slash commands
const COMMANDS = {
  '/url': 'Set the request URL',
  '/method': 'Set HTTP method (GET, POST, PUT, DELETE, PATCH)',
  '/header': 'Add a header (format: key:value)',
  '/body': 'Set request body (JSON)',
  '/file': 'Load request from JSON file (format: /file filename.json)',
  '/execute': 'Execute the current request (Ctrl+E)',
  '/clear': 'Clear the current request (Ctrl+C)',
  '/save': 'Save last response to file (Ctrl+S)',
  '/env': 'Environment variables (Ctrl+L to list)',
  '/help': 'Show available commands (Ctrl+H)'
};

export const InputPrompt: React.FC<InputPromptProps> = ({ onSubmit, onSaveResponse, environmentManager }) => {
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

  const handleEnvironmentCommand = (envCommand: string) => {
    if (!environmentManager) {
      setLastCommand('Environment manager not available');
      return;
    }

    const parts = envCommand.split(' ');
    const action = parts[0];

    switch (action) {
      case 'set':
        if (parts.length >= 3) {
          const key = parts[1];
          const value = parts.slice(2).join(' ');
          environmentManager.setVariable(key, value);
          setLastCommand(`Environment variable '${key}' set to '${value}'`);
        } else {
          setLastCommand('Error: Usage: /env set <key> <value>');
        }
        break;

      case 'get':
        if (parts.length >= 2) {
          const key = parts[1];
          const value = environmentManager.getVariable(key);
          if (value !== undefined) {
            setLastCommand(`${key} = ${value}`);
          } else {
            setLastCommand(`Environment variable '${key}' not found`);
          }
        } else {
          setLastCommand('Error: Usage: /env get <key>');
        }
        break;

      case 'list':
        const allVars = environmentManager.getAllVariables();
        const varCount = Object.keys(allVars).length;
        if (varCount === 0) {
          setLastCommand('No environment variables set');
        } else {
          const varList = Object.entries(allVars)
            .map(([key, value]) => `${key}=${value}`)
            .join(', ');
          setLastCommand(`Environment variables (${varCount}): ${varList}`);
        }
        break;

      case 'clear':
        environmentManager.clearVariables();
        setLastCommand('All environment variables cleared');
        break;

      case 'load':
        if (parts.length >= 2) {
          const envName = parts[1];
          const success = environmentManager.loadEnvironment(envName);
          if (success) {
            setLastCommand(`Loaded environment '${envName}'`);
          } else {
            setLastCommand(`Failed to load environment '${envName}'`);
          }
        } else {
          setLastCommand('Error: Usage: /env load <environment-name>');
        }
        break;

      default:
        setLastCommand('Error: Available env commands: set, get, list, clear, load');
        break;
    }
  };

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

    if (trimmed.startsWith('/save ')) {
      const filename = trimmed.substring(6).trim();
      if (filename) {
        if (onSaveResponse) {
          onSaveResponse(filename);
          setLastCommand(`Attempting to save response to ${filename}`);
        } else {
          setLastCommand('No response to save');
        }
      } else {
        setLastCommand('Error: Filename is required. Usage: /save <filename.json>');
      }
      setShowHelp(false);
      return;
    }

    if (trimmed.startsWith('/env ')) {
      const envCommand = trimmed.substring(5).trim();
      handleEnvironmentCommand(envCommand);
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
    // Handle keyboard shortcuts
    if (key.ctrl) {
      if (input === 'e') {
        // Ctrl+E: Execute request
        executeCommand('/execute');
        return;
      } else if (input === 'c' && !key.shift) {
        // Ctrl+C: Clear request (without shift to avoid terminal interrupt)
        executeCommand('/clear');
        return;
      } else if (input === 'h') {
        // Ctrl+H: Show help
        executeCommand('/help');
        return;
      } else if (input === 's') {
        // Ctrl+S: Save response (if available)
        if (onSaveResponse) {
          const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
          onSaveResponse(`response-${timestamp}.json`);
          setLastCommand(`Saving response to response-${timestamp}.json`);
        }
        return;
      } else if (input === 'l') {
        // Ctrl+L: List environment variables
        executeCommand('/env list');
        return;
      }
    }

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
            <Gradient name="atlas">
              <Text>⌨️  Keyboard Shortcuts</Text>
            </Gradient>
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Box marginBottom={0}>
              <Text color={colors.accent}>{'Ctrl+E'.padEnd(20)}</Text>
              <Text color={colors.secondary}>Execute current request</Text>
            </Box>
            <Box marginBottom={0}>
              <Text color={colors.accent}>{'Ctrl+C'.padEnd(20)}</Text>
              <Text color={colors.secondary}>Clear current request</Text>
            </Box>
            <Box marginBottom={0}>
              <Text color={colors.accent}>{'Ctrl+H'.padEnd(20)}</Text>
              <Text color={colors.secondary}>Show/hide this help</Text>
            </Box>
            <Box marginBottom={0}>
              <Text color={colors.accent}>{'Ctrl+S'.padEnd(20)}</Text>
              <Text color={colors.secondary}>Save last response to file</Text>
            </Box>
            <Box marginBottom={0}>
              <Text color={colors.accent}>{'Ctrl+L'.padEnd(20)}</Text>
              <Text color={colors.secondary}>List environment variables</Text>
            </Box>
            <Box marginBottom={0}>
              <Text color={colors.accent}>{'↑↓ Arrows'.padEnd(20)}</Text>
              <Text color={colors.secondary}>Navigate command history</Text>
            </Box>
            <Box marginBottom={0}>
              <Text color={colors.accent}>{'Tab'.padEnd(20)}</Text>
              <Text color={colors.secondary}>Auto-complete commands/files</Text>
            </Box>
          </Box>
          <Box marginTop={1}>
            <Text color={colors.secondary} dimColor>
              💡 Tip: Type any command or press Ctrl+H to hide this help
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

      {/* Keyboard shortcuts hint */}
      {currentInput === '' && !showHelp && (
        <Box marginTop={1}>
          <Text color={colors.secondary} dimColor>
            Ctrl+E Execute • Ctrl+C Clear • Ctrl+H Help • Ctrl+S Save • Ctrl+L List vars • ↑↓ History
          </Text>
        </Box>
      )}

      {/* Command history hint when there's history but no shortcuts shown */}
      {commandHistory.length > 0 && historyIndex === -1 && currentInput !== '' && (
        <Box marginTop={1}>
          <Text color={colors.secondary} dimColor>↑↓ Navigate history • Tab to complete</Text>
        </Box>
      )}
    </Box>
  );
};