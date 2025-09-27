/**
 * Environment Variables Manager for Relay CLI
 * Handles variable storage, substitution, and persistence
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

export interface Environment {
  name: string;
  variables: Record<string, string>;
  description?: string;
}

export class EnvironmentManager {
  private currentEnv: Environment;
  private envDir: string;

  constructor() {
    this.envDir = join(process.cwd(), 'environments');
    this.currentEnv = {
      name: 'default',
      variables: {},
      description: 'Default environment'
    };
    this.ensureEnvDirectory();
    this.loadDefaultEnvironment();
  }

  private ensureEnvDirectory(): void {
    if (!existsSync(this.envDir)) {
      mkdirSync(this.envDir, { recursive: true });
    }
  }

  private loadDefaultEnvironment(): void {
    const defaultPath = join(this.envDir, 'default.json');
    if (existsSync(defaultPath)) {
      try {
        const data = readFileSync(defaultPath, 'utf-8');
        this.currentEnv = JSON.parse(data);
      } catch (error) {
        console.warn('Failed to load default environment, using empty environment');
      }
    }
  }

  /**
   * Set a variable in the current environment
   */
  setVariable(key: string, value: string): void {
    this.currentEnv.variables[key] = value;
    this.saveCurrentEnvironment();
  }

  /**
   * Get a variable from the current environment
   */
  getVariable(key: string): string | undefined {
    return this.currentEnv.variables[key];
  }

  /**
   * Get all variables in the current environment
   */
  getAllVariables(): Record<string, string> {
    return { ...this.currentEnv.variables };
  }

  /**
   * Clear all variables
   */
  clearVariables(): void {
    this.currentEnv.variables = {};
    this.saveCurrentEnvironment();
  }

  /**
   * Load an environment from file
   */
  loadEnvironment(name: string): boolean {
    const envPath = join(this.envDir, `${name}.json`);
    if (!existsSync(envPath)) {
      return false;
    }

    try {
      const data = readFileSync(envPath, 'utf-8');
      this.currentEnv = JSON.parse(data);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Save current environment to file
   */
  saveCurrentEnvironment(): void {
    const envPath = join(this.envDir, `${this.currentEnv.name}.json`);
    try {
      writeFileSync(envPath, JSON.stringify(this.currentEnv, null, 2));
    } catch (error) {
      console.error('Failed to save environment:', error);
    }
  }

  /**
   * Create a new environment
   */
  createEnvironment(name: string, description?: string): void {
    this.currentEnv = {
      name,
      variables: {},
      description: description || `${name} environment`
    };
    this.saveCurrentEnvironment();
  }

  /**
   * Get current environment info
   */
  getCurrentEnvironment(): Environment {
    return { ...this.currentEnv };
  }

  /**
   * Substitute variables in a string using {{variable}} syntax
   */
  substituteVariables(text: string): string {
    if (!text) return text;

    return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const trimmedName = variableName.trim();
      const value = this.getVariable(trimmedName);
      
      if (value === undefined) {
        console.warn(`Environment variable '${trimmedName}' not found`);
        return match; // Return original if variable not found
      }
      
      return value;
    });
  }

  /**
   * Check if text contains variables
   */
  hasVariables(text: string): boolean {
    return /\{\{[^}]+\}\}/.test(text);
  }

  /**
   * Get list of variables used in text
   */
  getVariablesInText(text: string): string[] {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    
    return matches.map(match => match.replace(/[{}]/g, '').trim());
  }
}