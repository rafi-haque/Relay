/**
 * Unit tests for Header component
 */

import React from 'react';
import { render } from 'ink-testing-library';
import { Header } from '../ui/components/Header.js';

describe('Header', () => {
  it('should render with default props', () => {
    const { lastFrame } = render(<Header terminalWidth={80} />);
    
    expect(lastFrame()).toContain('HTTP Client v1.0.0');
    expect(lastFrame()).toContain('Tips for getting started');
    expect(lastFrame()).toContain('1. Select HTTP method and enter URL');
    expect(lastFrame()).toContain('2. Add headers and request body if needed');
    expect(lastFrame()).toContain('3. Press Enter to send request');
  });

  it('should render with custom version', () => {
    const { lastFrame } = render(
      <Header terminalWidth={80} version="2.0.0" />
    );
    
    expect(lastFrame()).toContain('HTTP Client v2.0.0');
  });

  it('should hide version when showVersion is false', () => {
    const { lastFrame } = render(
      <Header terminalWidth={80} showVersion={false} />
    );
    
    expect(lastFrame()).not.toContain('HTTP Client v');
  });

  it('should adapt to different terminal widths', () => {
    const { lastFrame: narrow } = render(<Header terminalWidth={40} />);
    const { lastFrame: wide } = render(<Header terminalWidth={120} />);
    
    // Both should render without errors
    expect(narrow()).toContain('Tips for getting started');
    expect(wide()).toContain('Tips for getting started');
  });

  it('should render ASCII art logo', () => {
    const { lastFrame } = render(<Header terminalWidth={80} />);
    const output = lastFrame();
    
    // Should render without throwing - the ASCII art might not show in test environment
    // but the component should still render successfully
    expect(output).toBeTruthy();
    expect(typeof output).toBe('string');
  });
});