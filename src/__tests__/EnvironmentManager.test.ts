/**
 * Tests for EnvironmentManager
 */

import { EnvironmentManager } from '../core/environment-manager.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

// Mock fs functions for testing
jest.mock('fs');
const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockWriteFileSync = writeFileSync as jest.MockedFunction<typeof writeFileSync>;
const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockMkdirSync = mkdirSync as jest.MockedFunction<typeof mkdirSync>;

describe('EnvironmentManager', () => {
  let envManager: EnvironmentManager;

  beforeEach(() => {
    jest.clearAllMocks();
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('{"name": "default", "variables": {}, "description": "Default environment"}');
    envManager = new EnvironmentManager();
  });

  describe('Variable Management', () => {
    it('should set and get variables', () => {
      envManager.setVariable('API_URL', 'https://api.example.com');
      
      expect(envManager.getVariable('API_URL')).toBe('https://api.example.com');
    });

    it('should return undefined for non-existent variables', () => {
      expect(envManager.getVariable('NON_EXISTENT')).toBeUndefined();
    });

    it('should get all variables', () => {
      envManager.setVariable('API_URL', 'https://api.example.com');
      envManager.setVariable('AUTH_TOKEN', 'token123');
      
      const allVars = envManager.getAllVariables();
      expect(allVars).toEqual({
        'API_URL': 'https://api.example.com',
        'AUTH_TOKEN': 'token123'
      });
    });

    it('should clear all variables', () => {
      envManager.setVariable('API_URL', 'https://api.example.com');
      envManager.setVariable('AUTH_TOKEN', 'token123');
      
      envManager.clearVariables();
      
      expect(envManager.getAllVariables()).toEqual({});
    });
  });

  describe('Variable Substitution', () => {
    beforeEach(() => {
      envManager.setVariable('API_URL', 'https://api.example.com');
      envManager.setVariable('USER_ID', '123');
      envManager.setVariable('AUTH_TOKEN', 'bearer-token-xyz');
    });

    it('should substitute single variable', () => {
      const result = envManager.substituteVariables('{{API_URL}}/users');
      expect(result).toBe('https://api.example.com/users');
    });

    it('should substitute multiple variables', () => {
      const result = envManager.substituteVariables('{{API_URL}}/users/{{USER_ID}}');
      expect(result).toBe('https://api.example.com/users/123');
    });

    it('should substitute variables in JSON body', () => {
      const body = '{"userId": "{{USER_ID}}", "token": "{{AUTH_TOKEN}}"}';
      const result = envManager.substituteVariables(body);
      expect(result).toBe('{"userId": "123", "token": "bearer-token-xyz"}');
    });

    it('should handle variables with spaces', () => {
      const result = envManager.substituteVariables('{{ API_URL }}/users/{{ USER_ID }}');
      expect(result).toBe('https://api.example.com/users/123');
    });

    it('should leave unknown variables as-is', () => {
      const result = envManager.substituteVariables('{{API_URL}}/{{UNKNOWN_VAR}}');
      expect(result).toBe('https://api.example.com/{{UNKNOWN_VAR}}');
    });

    it('should handle empty or null strings', () => {
      expect(envManager.substituteVariables('')).toBe('');
      expect(envManager.substituteVariables(null as any)).toBe(null);
      expect(envManager.substituteVariables(undefined as any)).toBe(undefined);
    });
  });

  describe('Variable Detection', () => {
    it('should detect variables in text', () => {
      expect(envManager.hasVariables('{{API_URL}}/users')).toBe(true);
      expect(envManager.hasVariables('https://api.example.com/users')).toBe(false);
      expect(envManager.hasVariables('{{API_URL}}/users/{{USER_ID}}')).toBe(true);
    });

    it('should extract variable names from text', () => {
      const variables = envManager.getVariablesInText('{{API_URL}}/users/{{USER_ID}}/posts/{{POST_ID}}');
      expect(variables).toEqual(['API_URL', 'USER_ID', 'POST_ID']);
    });

    it('should handle variables with spaces in extraction', () => {
      const variables = envManager.getVariablesInText('{{ API_URL }}/users/{{ USER_ID }}');
      expect(variables).toEqual(['API_URL', 'USER_ID']);
    });
  });

  describe('Environment Loading and Saving', () => {
    it('should create new environment', () => {
      envManager.createEnvironment('test-env', 'Test environment');
      
      const currentEnv = envManager.getCurrentEnvironment();
      expect(currentEnv.name).toBe('test-env');
      expect(currentEnv.description).toBe('Test environment');
      expect(currentEnv.variables).toEqual({});
    });

    it('should load environment from file', () => {
      const mockEnvData = {
        name: 'staging',
        variables: { API_URL: 'https://staging.example.com' },
        description: 'Staging environment'
      };
      
      mockReadFileSync.mockReturnValue(JSON.stringify(mockEnvData));
      
      const success = envManager.loadEnvironment('staging');
      
      expect(success).toBe(true);
      expect(envManager.getCurrentEnvironment().name).toBe('staging');
      expect(envManager.getVariable('API_URL')).toBe('https://staging.example.com');
    });

    it('should handle failed environment loading', () => {
      mockExistsSync.mockReturnValue(false);
      
      const success = envManager.loadEnvironment('non-existent');
      
      expect(success).toBe(false);
    });

    it('should save current environment', () => {
      envManager.setVariable('TEST_VAR', 'test-value');
      
      // setVariable should call saveCurrentEnvironment internally
      expect(mockWriteFileSync).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parse errors gracefully', () => {
      mockReadFileSync.mockReturnValue('invalid json');
      
      const success = envManager.loadEnvironment('invalid');
      
      expect(success).toBe(false);
    });

    it('should handle file system errors gracefully', () => {
      mockWriteFileSync.mockImplementation(() => {
        throw new Error('File system error');
      });
      
      // Should not throw, just log error
      expect(() => {
        envManager.setVariable('TEST', 'value');
      }).not.toThrow();
    });
  });
});