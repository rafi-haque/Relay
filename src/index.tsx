#!/usr/bin/env node

/**
 * Entry point for Relay CLI
 * Beautiful HTTP client inspired by Gemini CLI
 */

import React from 'react';
import { render } from 'ink';
import { App } from './ui/App.js';

// Render the app
const { clear } = render(<App />);

// Handle cleanup
process.on('SIGINT', () => {
  clear();
  process.exit(0);
});

process.on('SIGTERM', () => {
  clear();
  process.exit(0);
});