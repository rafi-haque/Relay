/**
 * Tests for /env command functionality
 */

import React from 'react';
import { render } from 'ink-testing-library';
import { InputPrompt } from '../ui/components/InputPrompt.js';

describe('/env commands', () => {
  let mockOnSubmit: jest.Mock;
  let mockEnvironmentManager: any;

  beforeEach(() => {
    mockOnSubmit = jest.fn();
    mockEnvironmentManager = {
      setVariable: jest.fn(),
      getVariable: jest.fn(),
      getAllVariables: jest.fn(() => ({})),
      clearVariables: jest.fn(),
      loadEnvironment: jest.fn(() => true)
    };
  });

  it('should handle /env set command', () => {
    const { stdin, lastFrame } = render(
      <InputPrompt 
        onSubmit={mockOnSubmit} 
        environmentManager={mockEnvironmentManager}
      />
    );

    stdin.write('/env set API_URL https://api.example.com');
    stdin.write('\r');

    expect(mockEnvironmentManager.setVariable).toHaveBeenCalledWith('API_URL', 'https://api.example.com');
    expect(lastFrame()).toContain("Environment variable 'API_URL' set to 'https://api.example.com'");
  });

  it('should handle /env set with multi-word values', () => {
    const { stdin } = render(
      <InputPrompt 
        onSubmit={mockOnSubmit} 
        environmentManager={mockEnvironmentManager}
      />
    );

    stdin.write('/env set AUTH_TOKEN bearer token with spaces');
    stdin.write('\r');

    expect(mockEnvironmentManager.setVariable).toHaveBeenCalledWith('AUTH_TOKEN', 'bearer token with spaces');
  });

  it('should handle /env get command', () => {
    mockEnvironmentManager.getVariable.mockReturnValue('https://api.example.com');
    
    const { stdin, lastFrame } = render(
      <InputPrompt 
        onSubmit={mockOnSubmit} 
        environmentManager={mockEnvironmentManager}
      />
    );

    stdin.write('/env get API_URL');
    stdin.write('\r');

    expect(mockEnvironmentManager.getVariable).toHaveBeenCalledWith('API_URL');
    expect(lastFrame()).toContain('API_URL = https://api.example.com');
  });

  it('should handle /env get for non-existent variable', () => {
    mockEnvironmentManager.getVariable.mockReturnValue(undefined);
    
    const { stdin, lastFrame } = render(
      <InputPrompt 
        onSubmit={mockOnSubmit} 
        environmentManager={mockEnvironmentManager}
      />
    );

    stdin.write('/env get NON_EXISTENT');
    stdin.write('\r');

    expect(lastFrame()).toContain("Environment variable 'NON_EXISTENT' not found");
  });

  it('should handle /env list command with variables', () => {
    mockEnvironmentManager.getAllVariables.mockReturnValue({
      'API_URL': 'https://api.example.com',
      'AUTH_TOKEN': 'token123'
    });
    
    const { stdin, lastFrame } = render(
      <InputPrompt 
        onSubmit={mockOnSubmit} 
        environmentManager={mockEnvironmentManager}
      />
    );

    stdin.write('/env list');
    stdin.write('\r');

    const output = lastFrame();
    expect(output).toContain('Environment variables (2)');
    expect(output).toContain('API_URL=https://api.example.com');
    expect(output).toContain('AUTH_TOKEN=token123');
  });

  it('should handle /env list command with no variables', () => {
    mockEnvironmentManager.getAllVariables.mockReturnValue({});
    
    const { stdin, lastFrame } = render(
      <InputPrompt 
        onSubmit={mockOnSubmit} 
        environmentManager={mockEnvironmentManager}
      />
    );

    stdin.write('/env list');
    stdin.write('\r');

    expect(lastFrame()).toContain('No environment variables set');
  });

  it('should handle /env clear command', () => {
    const { stdin, lastFrame } = render(
      <InputPrompt 
        onSubmit={mockOnSubmit} 
        environmentManager={mockEnvironmentManager}
      />
    );

    stdin.write('/env clear');
    stdin.write('\r');

    expect(mockEnvironmentManager.clearVariables).toHaveBeenCalled();
    expect(lastFrame()).toContain('All environment variables cleared');
  });

  it('should handle /env load command', () => {
    const { stdin, lastFrame } = render(
      <InputPrompt 
        onSubmit={mockOnSubmit} 
        environmentManager={mockEnvironmentManager}
      />
    );

    stdin.write('/env load development');
    stdin.write('\r');

    expect(mockEnvironmentManager.loadEnvironment).toHaveBeenCalledWith('development');
    expect(lastFrame()).toContain("Loaded environment 'development'");
  });

  it('should handle /env load command failure', () => {
    mockEnvironmentManager.loadEnvironment.mockReturnValue(false);
    
    const { stdin, lastFrame } = render(
      <InputPrompt 
        onSubmit={mockOnSubmit} 
        environmentManager={mockEnvironmentManager}
      />
    );

    stdin.write('/env load non-existent');
    stdin.write('\r');

    expect(lastFrame()).toContain("Failed to load environment 'non-existent'");
  });

  it('should handle invalid /env commands', () => {
    const { stdin, lastFrame } = render(
      <InputPrompt 
        onSubmit={mockOnSubmit} 
        environmentManager={mockEnvironmentManager}
      />
    );

    stdin.write('/env invalid');
    stdin.write('\r');

    expect(lastFrame()).toContain('Available env commands: set, get, list, clear, load');
  });

  it('should handle /env commands with missing parameters', () => {
    const { stdin, lastFrame } = render(
      <InputPrompt 
        onSubmit={mockOnSubmit} 
        environmentManager={mockEnvironmentManager}
      />
    );

    stdin.write('/env set API_URL');
    stdin.write('\r');

    expect(lastFrame()).toContain('Error: Usage: /env set <key> <value>');
  });

  it('should handle /env without environment manager', () => {
    const { stdin, lastFrame } = render(
      <InputPrompt 
        onSubmit={mockOnSubmit} 
      />
    );

    stdin.write('/env set API_URL https://api.example.com');
    stdin.write('\r');

    expect(lastFrame()).toContain('Environment manager not available');
  });

  it('should include /env in help commands', () => {
    const { stdin, lastFrame } = render(
      <InputPrompt 
        onSubmit={mockOnSubmit} 
        environmentManager={mockEnvironmentManager}
      />
    );

    stdin.write('/help');
    stdin.write('\r');

    expect(lastFrame()).toContain('/env');
    expect(lastFrame()).toContain('Environment variables');
  });
});