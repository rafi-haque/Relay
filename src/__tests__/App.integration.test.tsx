/**
 * Integration tests for the complete App workflow
 */

import React from 'react';
import { render } from 'ink-testing-library';
import { App } from '../ui/App.js';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('App Integration Tests', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    // Mock process.stdout for consistent dimensions
    Object.defineProperty(process, 'stdout', {
      value: { columns: 100, rows: 30 },
      configurable: true
    });
    
    // Mock fs operations to prevent file system interactions during tests
    jest.mock('fs', () => ({
      existsSync: jest.fn(() => false),
      mkdirSync: jest.fn(),
      readFileSync: jest.fn(() => '{"name": "default", "variables": {}}'),
      writeFileSync: jest.fn()
    }));
  });

  afterEach(() => {
    mockAxios.restore();
    jest.clearAllMocks();
  });

  it('should render app with loading screen initially', () => {
    const { lastFrame } = render(<App />);
    
    // Should show loading screen first
    expect(lastFrame()).toContain('Initializing relay-cli');
    expect(lastFrame()).toContain('No requests yet');
  });

  it('should handle basic app lifecycle', () => {
    // Simple test to ensure app renders without crashing
    const { unmount } = render(<App />);
    expect(() => unmount()).not.toThrow();
  });
});