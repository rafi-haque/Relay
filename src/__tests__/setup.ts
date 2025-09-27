/**
 * Jest setup file for Relay CLI tests
 */

import React from 'react';

// Mock ink-gradient to avoid rendering issues in tests
// Mock ink-gradient
jest.mock('ink-gradient', () => {
  const React = require('react');
  return React.forwardRef(({ children, ...props }: { children: any, [key: string]: any }, ref: any) => {
    return React.createElement('text', { ...props, ref }, children);
  });
});

// Don't mock ink-testing-library - let it work naturally

// Mock process.stdout for consistent terminal dimensions in tests
Object.defineProperty(process, 'stdout', {
  value: {
    columns: 80,
    rows: 24,
    write: jest.fn(),
  },
  writable: true,
});

// Set up test environment
process.env.NODE_ENV = 'test';
process.env.FORCE_COLOR = '0'; // Disable colors in tests