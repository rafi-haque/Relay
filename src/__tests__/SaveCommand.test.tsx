/**
 * Tests for /save command functionality
 */

import React from 'react';
import { render } from 'ink-testing-library';
import { InputPrompt } from '../ui/components/InputPrompt.js';

describe('/save command', () => {
  it('should call onSaveResponse when /save command is used with filename', () => {
    const mockOnSubmit = jest.fn();
    const mockOnSaveResponse = jest.fn();
    
    const { stdin } = render(
      <InputPrompt 
        onSubmit={mockOnSubmit} 
        onSaveResponse={mockOnSaveResponse}
      />
    );

    // Type /save command with filename
    stdin.write('/save test-response.json');
    stdin.write('\r'); // Enter key

    expect(mockOnSaveResponse).toHaveBeenCalledWith('test-response.json');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show error when /save is used without filename', () => {
    const mockOnSubmit = jest.fn();
    const mockOnSaveResponse = jest.fn();
    
    const { stdin, lastFrame } = render(
      <InputPrompt 
        onSubmit={mockOnSubmit} 
        onSaveResponse={mockOnSaveResponse}
      />
    );

    // Type /save command without filename
    stdin.write('/save');
    stdin.write('\r'); // Enter key

    expect(lastFrame()).toContain('Error: Filename is required');
    expect(mockOnSaveResponse).not.toHaveBeenCalled();
  });

  it('should show appropriate message when /save is used without callback', () => {
    const mockOnSubmit = jest.fn();
    
    const { stdin, lastFrame } = render(
      <InputPrompt onSubmit={mockOnSubmit} />
    );

    // Type /save command
    stdin.write('/save response.json');
    stdin.write('\r'); // Enter key

    expect(lastFrame()).toContain('No response to save');
  });

  it('should include /save in help commands', () => {
    const mockOnSubmit = jest.fn();
    
    const { stdin, lastFrame } = render(
      <InputPrompt onSubmit={mockOnSubmit} />
    );

    // Type /help command
    stdin.write('/help');
    stdin.write('\r'); // Enter key

    expect(lastFrame()).toContain('/save');
    expect(lastFrame()).toContain('Save last response to file');
  });
});