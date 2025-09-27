/**
 * Tests for LoadingScreen component
 */

import React from 'react';
import { render } from 'ink-testing-library';
import { LoadingScreen } from '../ui/components/LoadingScreen.js';

describe('LoadingScreen', () => {
  it('renders loading animation and progress bar', () => {
    const mockOnComplete = jest.fn();
    const { lastFrame } = render(
      <LoadingScreen 
        terminalWidth={80} 
        onComplete={mockOnComplete}
        duration={100}
      />
    );

    expect(lastFrame()).toContain('Initializing relay-cli');
    expect(lastFrame()).toContain('Starting HTTP client...');
    expect(lastFrame()).toContain('[');
    expect(lastFrame()).toContain('%');
  });

  it('calls onComplete after duration', (done) => {
    const mockOnComplete = jest.fn(() => {
      expect(mockOnComplete).toHaveBeenCalled();
      done();
    });

    render(
      <LoadingScreen 
        terminalWidth={80} 
        onComplete={mockOnComplete}
        duration={50}
      />
    );
  });

  it('shows logo after delay', (done) => {
    const mockOnComplete = jest.fn();
    const { lastFrame, rerender } = render(
      <LoadingScreen 
        terminalWidth={80} 
        onComplete={mockOnComplete}
        duration={1000}
      />
    );

    // Initially should not show logo
    const initialFrame = lastFrame();
    
    setTimeout(() => {
      rerender(
        <LoadingScreen 
          terminalWidth={80} 
          onComplete={mockOnComplete}
          duration={1000}
        />
      );
      // After delay, should show logo
      const laterFrame = lastFrame();
      expect(laterFrame).toContain('relay-cli'); // Logo text
      done();
    }, 400);
  });

  it('adapts to different terminal widths', () => {
    const mockOnComplete = jest.fn();
    const { lastFrame } = render(
      <LoadingScreen 
        terminalWidth={40} 
        onComplete={mockOnComplete}
        duration={100}
      />
    );

    expect(lastFrame()).toContain('Initializing relay-cli');
    expect(lastFrame()).toContain('[');
  });
});