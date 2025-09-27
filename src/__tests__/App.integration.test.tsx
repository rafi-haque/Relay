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
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('should render initial app state', () => {
    const { lastFrame } = render(<App />);
    
    expect(lastFrame()).toContain('RELAY');
    expect(lastFrame()).toContain('HTTP Client');
    expect(lastFrame()).toContain('Tips for getting started');
    expect(lastFrame()).toContain('🚀 Request Builder');
    expect(lastFrame()).toContain('No requests yet');
  });

  it('should complete full request workflow', async () => {
    const mockData = { id: 1, title: 'Test Post', body: 'Test content' };
    mockAxios.onGet('https://jsonplaceholder.typicode.com/posts/1').reply(200, mockData);

    const { lastFrame, stdin } = render(<App />);
    
    // Set URL
    stdin.write('/url https://jsonplaceholder.typicode.com/posts/1');
    stdin.write('\r');
    
    // Execute request
    stdin.write('/execute');
    stdin.write('\r');
    
    // Wait a bit for async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalOutput = lastFrame();
    expect(finalOutput).toContain('✅ 200 OK');
    expect(finalOutput).toContain('Test Post');
  });

  it('should handle POST requests with body', async () => {
    const requestData = { title: 'New Post', body: 'New content' };
    const responseData = { id: 2, ...requestData };
    
    mockAxios.onPost('https://jsonplaceholder.typicode.com/posts', requestData).reply(201, responseData);

    const { lastFrame, stdin } = render(<App />);
    
    // Set method to POST
    stdin.write('/method POST');
    stdin.write('\r');
    
    // Set URL
    stdin.write('/url https://jsonplaceholder.typicode.com/posts');
    stdin.write('\r');
    
    // Set body
    stdin.write('/body {"title":"New Post","body":"New content"}');
    stdin.write('\r');
    
    // Execute request
    stdin.write('/execute');
    stdin.write('\r');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalOutput = lastFrame();
    expect(finalOutput).toContain('POST');
    expect(finalOutput).toContain('New Post');
  });

  it('should handle request errors', async () => {
    mockAxios.onGet('https://jsonplaceholder.typicode.com/posts/999').reply(404, {
      error: 'Not Found'
    });

    const { lastFrame, stdin } = render(<App />);
    
    stdin.write('/url https://jsonplaceholder.typicode.com/posts/999');
    stdin.write('\r');
    
    stdin.write('/execute');
    stdin.write('\r');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalOutput = lastFrame();
    expect(finalOutput).toContain('❌');
    expect(finalOutput).toContain('404');
  });

  it('should maintain request history', async () => {
    const mockData1 = { id: 1, title: 'First Post' };
    const mockData2 = { id: 2, title: 'Second Post' };
    
    mockAxios.onGet('https://jsonplaceholder.typicode.com/posts/1').reply(200, mockData1);
    mockAxios.onGet('https://jsonplaceholder.typicode.com/posts/2').reply(200, mockData2);

    const { lastFrame, stdin } = render(<App />);
    
    // First request
    stdin.write('/url https://jsonplaceholder.typicode.com/posts/1');
    stdin.write('\r');
    stdin.write('/execute');
    stdin.write('\r');
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Second request
    stdin.write('/url https://jsonplaceholder.typicode.com/posts/2');
    stdin.write('\r');
    stdin.write('/execute');
    stdin.write('\r');
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const finalOutput = lastFrame();
    expect(finalOutput).toContain('First Post');
    expect(finalOutput).toContain('Second Post');
  });

  it('should show loading state during requests', async () => {
    mockAxios.onGet('https://jsonplaceholder.typicode.com/posts/1').reply(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve([200, { id: 1, title: 'Test' }]), 200);
      });
    });

    const { lastFrame, stdin } = render(<App />);
    
    stdin.write('/url https://jsonplaceholder.typicode.com/posts/1');
    stdin.write('\r');
    stdin.write('/execute');
    stdin.write('\r');
    
    // Check loading state immediately
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(lastFrame()).toContain('⚡ Loading...');
    
    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(lastFrame()).toContain('✅ 200 OK');
  });

  it('should handle custom headers', async () => {
    mockAxios.onGet('https://api.example.com/protected').reply(function(config) {
      if (config.headers?.['Authorization'] === 'Bearer token123') {
        return [200, { message: 'Authorized' }];
      }
      return [401, { error: 'Unauthorized' }];
    });

    const { lastFrame, stdin } = render(<App />);
    
    stdin.write('/url https://api.example.com/protected');
    stdin.write('\r');
    
    stdin.write('/header Authorization:Bearer token123');
    stdin.write('\r');
    
    stdin.write('/execute');
    stdin.write('\r');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalOutput = lastFrame();
    expect(finalOutput).toContain('✅ 200 OK');
    expect(finalOutput).toContain('Authorized');
  });

  it('should clear request builder state', () => {
    const { lastFrame, stdin } = render(<App />);
    
    // Set some data
    stdin.write('/method POST');
    stdin.write('\r');
    stdin.write('/url https://api.example.com/posts');
    stdin.write('\r');
    stdin.write('/body {"test":true}');
    stdin.write('\r');
    
    expect(lastFrame()).toContain('POST');
    expect(lastFrame()).toContain('Has body');
    
    // Clear
    stdin.write('/clear');
    stdin.write('\r');
    
    expect(lastFrame()).toContain('GET - No URL set');
    expect(lastFrame()).toContain('Request cleared');
  });

  it('should handle network errors gracefully', async () => {
    mockAxios.onGet('https://api.example.com/unreachable').networkError();

    const { lastFrame, stdin } = render(<App />);
    
    stdin.write('/url https://api.example.com/unreachable');
    stdin.write('\r');
    stdin.write('/execute');
    stdin.write('\r');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalOutput = lastFrame();
    expect(finalOutput).toContain('❌');
    expect(finalOutput).toContain('Network Error');
  });

  it('should validate URL before execution', () => {
    const { lastFrame, stdin } = render(<App />);
    
    // Try to execute without URL
    stdin.write('/execute');
    stdin.write('\r');
    
    expect(lastFrame()).toContain('Error: URL is required');
  });
});