/**
 * HTTP Client for Relay CLI
 * Handles all HTTP requests with proper error handling
 */

import axios, { AxiosResponse, AxiosError, Method } from 'axios';

export interface HttpRequestOptions {
  method: Method;
  url: string;
  headers?: Record<string, string>;
  data?: any;
  timeout?: number;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  responseTime: number;
  size: number;
}

export interface HttpError {
  message: string;
  status?: number;
  statusText?: string;
  response?: any;
}

export class RelayHttpClient {
  private defaultTimeout = 30000; // 30 seconds

  async sendRequest(options: HttpRequestOptions): Promise<HttpResponse> {
    const startTime = Date.now();
    
    try {
      const response: AxiosResponse = await axios({
        method: options.method,
        url: options.url,
        headers: options.headers,
        data: options.data,
        timeout: options.timeout || this.defaultTimeout,
        validateStatus: () => true, // Don't throw for any status code
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Calculate response size
      const size = this.calculateResponseSize(response);

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        data: response.data,
        responseTime,
        size,
      };
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw {
          message: axiosError.message,
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          response: axiosError.response?.data,
        } as HttpError;
      }

      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      } as HttpError;
    }
  }

  private calculateResponseSize(response: AxiosResponse): number {
    try {
      const dataStr = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      return new Blob([dataStr]).size;
    } catch {
      return 0;
    }
  }

  // Utility methods for common HTTP methods
  async get(url: string, headers?: Record<string, string>): Promise<HttpResponse> {
    return this.sendRequest({ method: 'GET', url, headers });
  }

  async post(url: string, data?: any, headers?: Record<string, string>): Promise<HttpResponse> {
    return this.sendRequest({ method: 'POST', url, data, headers });
  }

  async put(url: string, data?: any, headers?: Record<string, string>): Promise<HttpResponse> {
    return this.sendRequest({ method: 'PUT', url, data, headers });
  }

  async delete(url: string, headers?: Record<string, string>): Promise<HttpResponse> {
    return this.sendRequest({ method: 'DELETE', url, headers });
  }

  async patch(url: string, data?: any, headers?: Record<string, string>): Promise<HttpResponse> {
    return this.sendRequest({ method: 'PATCH', url, data, headers });
  }
}