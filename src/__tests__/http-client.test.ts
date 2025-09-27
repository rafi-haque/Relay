/**
 * Unit tests for RelayHttpClient
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { RelayHttpClient, HttpRequestOptions, HttpResponse, HttpError } from '../core/http-client.js';

describe('RelayHttpClient', () => {
  let httpClient: RelayHttpClient;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    httpClient = new RelayHttpClient();
    mockAxios = new MockAdapter(axios);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('sendRequest', () => {
    it('should send a successful GET request', async () => {
      const mockData = { id: 1, title: 'Test Post' };
      mockAxios.onGet('https://api.example.com/posts/1').reply(200, mockData);

      const request: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/posts/1',
        headers: { 'Content-Type': 'application/json' }
      };

      const response: HttpResponse = await httpClient.sendRequest(request);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockData);
      expect(response.headers).toBeDefined();
    });

    it('should send a successful POST request with data', async () => {
      const requestData = { title: 'New Post', body: 'Post content' };
      const responseData = { id: 2, ...requestData };
      
      mockAxios.onPost('https://api.example.com/posts', requestData).reply(201, responseData);

      const request: HttpRequestOptions = {
        method: 'POST',
        url: 'https://api.example.com/posts',
        headers: { 'Content-Type': 'application/json' },
        data: requestData
      };

      const response: HttpResponse = await httpClient.sendRequest(request);

      expect(response.status).toBe(201);
      expect(response.data).toEqual(responseData);
    });

    it('should handle PUT requests', async () => {
      const updateData = { id: 1, title: 'Updated Post' };
      mockAxios.onPut('https://api.example.com/posts/1', updateData).reply(200, updateData);

      const request: HttpRequestOptions = {
        method: 'PUT',
        url: 'https://api.example.com/posts/1',
        headers: { 'Content-Type': 'application/json' },
        data: updateData
      };

      const response: HttpResponse = await httpClient.sendRequest(request);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(updateData);
    });

    it('should handle DELETE requests', async () => {
      mockAxios.onDelete('https://api.example.com/posts/1').reply(204);

      const request: HttpRequestOptions = {
        method: 'DELETE',
        url: 'https://api.example.com/posts/1',
        headers: {}
      };

      const response: HttpResponse = await httpClient.sendRequest(request);

      expect(response.status).toBe(204);
    });

    it('should handle PATCH requests', async () => {
      const patchData = { title: 'Patched Title' };
      const responseData = { id: 1, title: 'Patched Title', body: 'Original body' };
      
      mockAxios.onPatch('https://api.example.com/posts/1', patchData).reply(200, responseData);

      const request: HttpRequestOptions = {
        method: 'PATCH',
        url: 'https://api.example.com/posts/1',
        headers: { 'Content-Type': 'application/json' },
        data: patchData
      };

      const response: HttpResponse = await httpClient.sendRequest(request);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(responseData);
    });

    it('should handle 404 responses', async () => {
      mockAxios.onGet('https://api.example.com/posts/999').reply(404, {
        error: 'Not Found',
        message: 'Post not found'
      });

      const request: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/posts/999',
        headers: {}
      };

      const response: HttpResponse = await httpClient.sendRequest(request);
      expect(response.status).toBe(404);
      expect(response.data).toEqual({
        error: 'Not Found',
        message: 'Post not found'
      });
    });

    it('should handle 500 server responses', async () => {
      mockAxios.onGet('https://api.example.com/error').reply(500, {
        error: 'Internal Server Error'
      });

      const request: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/error',
        headers: {}
      };

      const response: HttpResponse = await httpClient.sendRequest(request);
      expect(response.status).toBe(500);
      expect(response.data).toEqual({
        error: 'Internal Server Error'
      });
    });

    it('should handle network errors', async () => {
      mockAxios.onGet('https://api.example.com/network-error').networkError();

      const request: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/network-error',
        headers: {}
      };

      await expect(httpClient.sendRequest(request)).rejects.toMatchObject({
        message: expect.stringContaining('Network Error')
      } as HttpError);
    });

    it('should handle timeout errors', async () => {
      mockAxios.onGet('https://api.example.com/timeout').timeout();

      const request: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/timeout',
        headers: {}
      };

      await expect(httpClient.sendRequest(request)).rejects.toMatchObject({
        message: expect.stringContaining('timeout')
      } as HttpError);
    });

    it('should include custom headers in requests', async () => {
      mockAxios.onGet('https://api.example.com/posts').reply(function(config) {
        expect(config.headers).toMatchObject({
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'custom-value'
        });
        return [200, { data: 'success' }];
      });

      const request: HttpRequestOptions = {
        method: 'GET',
        url: 'https://api.example.com/posts',
        headers: {
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'custom-value'
        }
      };

      await httpClient.sendRequest(request);
    });

    it('should handle empty response bodies', async () => {
      mockAxios.onDelete('https://api.example.com/posts/1').reply(204, '');

      const request: HttpRequestOptions = {
        method: 'DELETE',
        url: 'https://api.example.com/posts/1',
        headers: {}
      };

      const response: HttpResponse = await httpClient.sendRequest(request);

      expect(response.status).toBe(204);
      expect(response.data).toBe('');
    });
  });
});