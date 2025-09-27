/**
 * Unit tests for InputPrompt component
 */

import React from 'react';
import { render } from 'ink-testing-library';
import { InputPrompt } from '../ui/components/InputPrompt.js';

describe('InputPrompt', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with initial state', () => {
    const { lastFrame } = render(<InputPrompt onSubmit={mockOnSubmit} />);
    
    expect(lastFrame()).toContain('🚀 Request Builder');
    expect(lastFrame()).toContain('Type /help for commands');
    expect(lastFrame()).toContain('GET - No URL set');
    expect(lastFrame()).toContain('> _');
  });

  it('should display help command output', () => {
    const { lastFrame, stdin } = render(<InputPrompt onSubmit={mockOnSubmit} />);
    
    // Type /help command
    stdin.write('/help');
    stdin.write('\r'); // Enter key
    
    expect(lastFrame()).toContain('Commands:');
    expect(lastFrame()).toContain('/url');
    expect(lastFrame()).toContain('/method');
    expect(lastFrame()).toContain('/execute');
  });

  it('should update URL when /url command is used', () => {
    const { lastFrame, stdin } = render(<InputPrompt onSubmit={mockOnSubmit} />);
    
    stdin.write('/url https://api.example.com/posts');
    stdin.write('\r');
    
    expect(lastFrame()).toContain('https://api.example.com/posts');
    expect(lastFrame()).toContain('URL set to:');
  });

  it('should update method when /method command is used', () => {
    const { lastFrame, stdin } = render(<InputPrompt onSubmit={mockOnSubmit} />);
    
    stdin.write('/method POST');
    stdin.write('\r');
    
    expect(lastFrame()).toContain('POST -');
    expect(lastFrame()).toContain('Method set to: POST');
  });

  it('should reject invalid HTTP methods', () => {
    const { lastFrame, stdin } = render(<InputPrompt onSubmit={mockOnSubmit} />);
    
    stdin.write('/method INVALID');
    stdin.write('\r');
    
    expect(lastFrame()).toContain('Error: Invalid method');
    expect(lastFrame()).toContain('GET -'); // Should remain GET
  });

  it('should add headers with /header command', () => {
    const { lastFrame, stdin } = render(<InputPrompt onSubmit={mockOnSubmit} />);
    
    stdin.write('/header Authorization:Bearer token123');
    stdin.write('\r');
    
    expect(lastFrame()).toContain('Header added:');
    expect(lastFrame()).toContain('2 headers'); // Content-Type + Authorization
  });

  it('should reject invalid header format', () => {
    const { lastFrame, stdin } = render(<InputPrompt onSubmit={mockOnSubmit} />);
    
    stdin.write('/header InvalidHeader');
    stdin.write('\r');
    
    expect(lastFrame()).toContain('Error: Header format should be key:value');
  });

  it('should set request body with /body command', () => {
    const { lastFrame, stdin } = render(<InputPrompt onSubmit={mockOnSubmit} />);
    
    stdin.write('/body {"title":"test"}');
    stdin.write('\r');
    
    expect(lastFrame()).toContain('Body set');
    expect(lastFrame()).toContain('Has body');
  });

  it('should execute request with /execute command', () => {
    const { stdin } = render(<InputPrompt onSubmit={mockOnSubmit} />);
    
    // First set a URL
    stdin.write('/url https://api.example.com/posts');
    stdin.write('\r');
    
    // Then execute
    stdin.write('/execute');
    stdin.write('\r');
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.example.com/posts',
      headers: { 'Content-Type': 'application/json' },
      body: undefined
    });
  });

  it('should not execute without URL', () => {
    const { lastFrame, stdin } = render(<InputPrompt onSubmit={mockOnSubmit} />);
    
    stdin.write('/execute');
    stdin.write('\r');
    
    expect(lastFrame()).toContain('Error: URL is required');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should clear request with /clear command', () => {
    const { lastFrame, stdin } = render(<InputPrompt onSubmit={mockOnSubmit} />);
    
    // Set some data first
    stdin.write('/url https://api.example.com/posts');
    stdin.write('\r');
    stdin.write('/method POST');
    stdin.write('\r');
    
    // Then clear
    stdin.write('/clear');
    stdin.write('\r');
    
    expect(lastFrame()).toContain('GET - No URL set');
    expect(lastFrame()).toContain('Request cleared');
  });

  it('should show command suggestions when typing slash commands', () => {
    const { lastFrame, stdin } = render(<InputPrompt onSubmit={mockOnSubmit} />);
    
    stdin.write('/u');
    
    expect(lastFrame()).toContain('Suggestions');
    expect(lastFrame()).toContain('/url');
  });

  it('should handle backspace correctly', () => {
    const { lastFrame, stdin } = render(<InputPrompt onSubmit={mockOnSubmit} />);
    
    stdin.write('/url test');
    stdin.write('\u0008'); // Backspace
    stdin.write('\u0008'); // Backspace
    
    expect(lastFrame()).toContain('> /url te_');
  });

  it('should treat non-slash input as URL shortcut', () => {
    const { lastFrame, stdin } = render(<InputPrompt onSubmit={mockOnSubmit} />);
    
    stdin.write('https://api.example.com/posts');
    stdin.write('\r');
    
    expect(lastFrame()).toContain('https://api.example.com/posts');
    expect(lastFrame()).toContain('URL set to:');
  });
});