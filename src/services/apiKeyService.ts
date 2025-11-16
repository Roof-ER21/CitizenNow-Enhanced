/**
 * Enhanced API Key Management Service for CitizenNow Enhanced
 *
 * Features:
 * - API key validation (format + live testing)
 * - Graceful degradation when keys unavailable
 * - Demo mode with mock responses
 * - User-friendly error messages
 * - Setup wizard guidance
 * - Validation result caching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  OPENAI_API_KEY: '@citizennow_openai_key',
  GEMINI_API_KEY: '@citizennow_gemini_key',
  API_SETUP_COMPLETED: '@citizennow_api_setup_completed',
  SETUP_SKIPPED: '@citizennow_setup_skipped',
  VALIDATION_CACHE: '@citizennow_validation_cache',
  DEMO_MODE_ENABLED: '@citizennow_demo_mode',
};

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface APIKeyStatus {
  provider: 'openai' | 'gemini';
  isConfigured: boolean;
  isValid: boolean;
  isDemo: boolean;
  error?: string;
  lastValidated?: Date;
}

export interface APIValidationResult {
  isValid: boolean;
  error?: string;
  message?: string;
}

export interface SystemStatus {
  hasAnyAPI: boolean;
  isDemoMode: boolean;
  availableAPIs: string[];
  unavailableAPIs: string[];
  apiStatuses: { [key: string]: APIKeyStatus };
  recommendations: string[];
}

export interface DemoResponse<T> {
  isDemo: true;
  data: T;
  message: string;
}

// ============================================================================
// Constants
// ============================================================================

const API_KEY_PATTERNS = {
  openai: /^sk-[A-Za-z0-9]{48,}$/,
  gemini: /^AIza[A-Za-z0-9_-]{35,}$/,
};

const VALIDATION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// API Key Service Class
// ============================================================================

class APIKeyService {
  private validationCache: Map<string, { result: APIValidationResult; timestamp: number }> = new Map();

  // ==========================================================================
  // Storage Operations
  // ==========================================================================

  async saveOpenAIKey(key: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OPENAI_API_KEY, key.trim());
      this.clearValidationCache('openai');
    } catch (error) {
      console.error('Error saving OpenAI key:', error);
      throw new Error('Failed to save OpenAI API key');
    }
  }

  async saveGeminiKey(key: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key.trim());
      this.clearValidationCache('gemini');
    } catch (error) {
      console.error('Error saving Gemini key:', error);
      throw new Error('Failed to save Gemini API key');
    }
  }

  async getOpenAIKey(): Promise<string | null> {
    try {
      // Check environment variable first (for Expo)
      const envKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (envKey && envKey.length > 0 && !envKey.includes('your-')) {
        return envKey;
      }
      // Fall back to AsyncStorage
      return await AsyncStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY);
    } catch (error) {
      console.error('Error getting OpenAI key:', error);
      return null;
    }
  }

  async getGeminiKey(): Promise<string | null> {
    try {
      // Check environment variable first (for Expo)
      const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (envKey && envKey.length > 0 && !envKey.includes('your-')) {
        return envKey;
      }
      // Fall back to AsyncStorage
      return await AsyncStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY);
    } catch (error) {
      console.error('Error getting Gemini key:', error);
      return null;
    }
  }

  async removeOpenAIKey(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.OPENAI_API_KEY);
      this.clearValidationCache('openai');
    } catch (error) {
      console.error('Error removing OpenAI key:', error);
      throw new Error('Failed to remove OpenAI API key');
    }
  }

  async removeGeminiKey(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
      this.clearValidationCache('gemini');
    } catch (error) {
      console.error('Error removing Gemini key:', error);
      throw new Error('Failed to remove Gemini API key');
    }
  }

  // ==========================================================================
  // Validation - Format Checking
  // ==========================================================================

  validateKeyFormat(provider: 'openai' | 'gemini', key: string): APIValidationResult {
    if (!key || key.trim().length === 0) {
      return {
        isValid: false,
        error: 'API_KEY_MISSING',
        message: `${this.getProviderName(provider)} API key is not configured`,
      };
    }

    // Check for placeholder values
    if (key.includes('your-') || key.includes('_here') || key === 'undefined') {
      return {
        isValid: false,
        error: 'API_KEY_PLACEHOLDER',
        message: `${this.getProviderName(provider)} API key appears to be a placeholder`,
      };
    }

    // Validate format pattern
    const pattern = API_KEY_PATTERNS[provider];
    if (pattern && !pattern.test(key.trim())) {
      return {
        isValid: false,
        error: 'API_KEY_INVALID_FORMAT',
        message: `${this.getProviderName(provider)} API key has invalid format`,
      };
    }

    return {
      isValid: true,
      message: `${this.getProviderName(provider)} API key format is valid`,
    };
  }

  // ==========================================================================
  // Validation - Live API Testing
  // ==========================================================================

  private async testOpenAIKeyLive(apiKey: string): Promise<APIValidationResult> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        return {
          isValid: true,
          message: 'OpenAI API key is valid and working',
        };
      }

      if (response.status === 401) {
        return {
          isValid: false,
          error: 'API_KEY_UNAUTHORIZED',
          message: 'OpenAI API key is invalid or expired',
        };
      }

      if (response.status === 429) {
        return {
          isValid: true, // Key is valid but rate limited
          message: 'OpenAI API key is valid (rate limited)',
        };
      }

      return {
        isValid: false,
        error: 'API_ERROR',
        message: `OpenAI API error: ${response.status}`,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            isValid: false,
            error: 'API_TIMEOUT',
            message: 'OpenAI API request timed out',
          };
        }
        return {
          isValid: false,
          error: 'NETWORK_ERROR',
          message: `Network error: ${error.message}`,
        };
      }
      return {
        isValid: false,
        error: 'UNKNOWN_ERROR',
        message: 'Unknown error occurred',
      };
    }
  }

  private async testGeminiKeyLive(apiKey: string): Promise<APIValidationResult> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
        {
          method: 'GET',
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (response.ok) {
        return {
          isValid: true,
          message: 'Gemini API key is valid and working',
        };
      }

      if (response.status === 400 || response.status === 403) {
        return {
          isValid: false,
          error: 'API_KEY_UNAUTHORIZED',
          message: 'Gemini API key is invalid',
        };
      }

      if (response.status === 429) {
        return {
          isValid: true, // Key is valid but rate limited
          message: 'Gemini API key is valid (rate limited)',
        };
      }

      return {
        isValid: false,
        error: 'API_ERROR',
        message: `Gemini API error: ${response.status}`,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            isValid: false,
            error: 'API_TIMEOUT',
            message: 'Gemini API request timed out',
          };
        }
        return {
          isValid: false,
          error: 'NETWORK_ERROR',
          message: `Network error: ${error.message}`,
        };
      }
      return {
        isValid: false,
        error: 'UNKNOWN_ERROR',
        message: 'Unknown error occurred',
      };
    }
  }

  async validateAPIKey(
    provider: 'openai' | 'gemini',
    key?: string,
    skipCache: boolean = false
  ): Promise<APIValidationResult> {
    // Get key from parameter or storage
    let apiKey = key;
    if (!apiKey) {
      apiKey = provider === 'openai'
        ? (await this.getOpenAIKey()) || ''
        : (await this.getGeminiKey()) || '';
    }

    // First check format
    const formatCheck = this.validateKeyFormat(provider, apiKey);
    if (!formatCheck.isValid) {
      return formatCheck;
    }

    // Check cache
    const cacheKey = `${provider}_${apiKey.slice(0, 10)}`;
    if (!skipCache && this.validationCache.has(cacheKey)) {
      const cached = this.validationCache.get(cacheKey)!;
      const age = Date.now() - cached.timestamp;
      if (age < VALIDATION_CACHE_DURATION) {
        return cached.result;
      }
    }

    // Perform live validation
    let result: APIValidationResult;
    if (provider === 'openai') {
      result = await this.testOpenAIKeyLive(apiKey);
    } else {
      result = await this.testGeminiKeyLive(apiKey);
    }

    // Cache the result
    this.validationCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
    });

    return result;
  }

  // ==========================================================================
  // System Status & Health Check
  // ==========================================================================

  async getSystemStatus(): Promise<SystemStatus> {
    const providers: Array<'openai' | 'gemini'> = ['openai', 'gemini'];
    const apiStatuses: { [key: string]: APIKeyStatus } = {};
    const availableAPIs: string[] = [];
    const unavailableAPIs: string[] = [];

    for (const provider of providers) {
      const key = provider === 'openai'
        ? await this.getOpenAIKey()
        : await this.getGeminiKey();

      const isConfigured = !!key && key.length > 0;
      let isValid = false;
      let error: string | undefined;

      if (isConfigured) {
        try {
          const validation = await this.validateAPIKey(provider);
          isValid = validation.isValid;
          error = validation.error || validation.message;
        } catch (err) {
          isValid = false;
          error = err instanceof Error ? err.message : 'Validation failed';
        }
      }

      apiStatuses[provider] = {
        provider,
        isConfigured,
        isValid,
        isDemo: !isConfigured || !isValid,
        error,
        lastValidated: isConfigured ? new Date() : undefined,
      };

      if (isValid) {
        availableAPIs.push(provider);
      } else {
        unavailableAPIs.push(provider);
      }
    }

    const hasAnyAPI = availableAPIs.length > 0;
    const isDemoMode = !hasAnyAPI;

    // Generate recommendations
    const recommendations: string[] = [];
    if (isDemoMode) {
      recommendations.push('All APIs are in demo mode. Configure API keys for full functionality.');
    }
    if (!apiStatuses.openai.isValid) {
      recommendations.push('Configure OpenAI API key for AI interview and speech features.');
    }
    if (!apiStatuses.gemini.isValid) {
      recommendations.push('Configure Gemini API key for N-400 assistance and explanations.');
    }

    return {
      hasAnyAPI,
      isDemoMode,
      availableAPIs,
      unavailableAPIs,
      apiStatuses,
      recommendations,
    };
  }

  async isFeatureAvailable(
    feature: 'ai_interview' | 'speech_recognition' | 'n400_assistant'
  ): Promise<boolean> {
    const featureProviderMap = {
      ai_interview: 'openai' as const,
      speech_recognition: 'openai' as const,
      n400_assistant: 'gemini' as const,
    };

    const provider = featureProviderMap[feature];
    const validation = await this.validateAPIKey(provider);
    return validation.isValid;
  }

  // ==========================================================================
  // Error Messages & User Guidance
  // ==========================================================================

  getAPIErrorMessage(provider: 'openai' | 'gemini', error?: string): string {
    const providerNames = {
      openai: 'OpenAI',
      gemini: 'Google Gemini',
    };

    const setupInstructions = {
      openai: 'Get your API key from https://platform.openai.com/api-keys',
      gemini: 'Get your API key from https://makersuite.google.com/app/apikey',
    };

    const name = providerNames[provider];
    const setup = setupInstructions[provider];

    if (!error || error === 'API_KEY_MISSING') {
      return `${name} API is not configured.\n\n${setup}\n\nThen add it in Settings > API Configuration`;
    }

    if (error === 'API_KEY_PLACEHOLDER') {
      return `${name} API key appears to be a placeholder value.\n\nPlease enter a real API key.\n\n${setup}`;
    }

    if (error === 'API_KEY_INVALID_FORMAT') {
      return `${name} API key has an invalid format.\n\nExpected format:\n${provider === 'openai' ? 'sk-...' : 'AIza...'}\n\n${setup}`;
    }

    if (error === 'API_KEY_UNAUTHORIZED') {
      return `${name} API key is invalid or has expired.\n\nPlease check your API key or generate a new one.\n\n${setup}`;
    }

    if (error === 'API_TIMEOUT') {
      return `${name} API request timed out.\n\nPlease check your internet connection and try again.`;
    }

    if (error === 'NETWORK_ERROR') {
      return `Unable to connect to ${name} API.\n\nPlease check your internet connection.`;
    }

    return `${name} API error: ${error}\n\nTry enabling demo mode or check your API configuration.`;
  }

  getSetupWizardSteps(): string[] {
    return [
      '1. Open Settings in the app',
      '2. Navigate to API Configuration',
      '3. Get OpenAI API key: https://platform.openai.com/api-keys',
      '4. Get Gemini API key: https://makersuite.google.com/app/apikey',
      '5. Paste your keys in the respective fields',
      '6. Tap "Validate & Save" to test the connection',
      '7. Enable features that require API access',
    ];
  }

  // ==========================================================================
  // Demo Mode
  // ==========================================================================

  async isDemoModeEnabled(): Promise<boolean> {
    try {
      const demoMode = await AsyncStorage.getItem(STORAGE_KEYS.DEMO_MODE_ENABLED);
      return demoMode === 'true';
    } catch {
      return false;
    }
  }

  async setDemoMode(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DEMO_MODE_ENABLED, enabled ? 'true' : 'false');
    } catch (error) {
      console.error('Error setting demo mode:', error);
    }
  }

  createDemoResponse<T>(data: T, feature: string): DemoResponse<T> {
    return {
      isDemo: true,
      data,
      message: `Demo Mode: This is a simulated response for ${feature}. Configure API keys for real AI features.`,
    };
  }

  async shouldUseDemoMode(provider: 'openai' | 'gemini'): Promise<boolean> {
    const isDemoEnabled = await this.isDemoModeEnabled();
    if (isDemoEnabled) return true;

    const key = provider === 'openai'
      ? await this.getOpenAIKey()
      : await this.getGeminiKey();

    return !key || key.length === 0;
  }

  // ==========================================================================
  // Setup Status (Legacy compatibility)
  // ==========================================================================

  async getAPIKeyStatus() {
    const [openaiKey, geminiKey, setupCompleted, setupSkipped] = await Promise.all([
      this.getOpenAIKey(),
      this.getGeminiKey(),
      AsyncStorage.getItem(STORAGE_KEYS.API_SETUP_COMPLETED),
      AsyncStorage.getItem(STORAGE_KEYS.SETUP_SKIPPED),
    ]);

    return {
      openai: {
        configured: !!openaiKey,
        tested: false,
      },
      gemini: {
        configured: !!geminiKey,
        tested: false,
      },
      setupCompleted: setupCompleted === 'true',
      setupSkipped: setupSkipped === 'true',
    };
  }

  async markSetupCompleted(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.API_SETUP_COMPLETED, 'true');
    await AsyncStorage.removeItem(STORAGE_KEYS.SETUP_SKIPPED);
  }

  async markSetupSkipped(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SETUP_SKIPPED, 'true');
    await AsyncStorage.removeItem(STORAGE_KEYS.API_SETUP_COMPLETED);
  }

  async resetSetupStatus(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.API_SETUP_COMPLETED);
    await AsyncStorage.removeItem(STORAGE_KEYS.SETUP_SKIPPED);
  }

  async clearAllAPIKeys(): Promise<void> {
    await Promise.all([
      this.removeOpenAIKey(),
      this.removeGeminiKey(),
      this.resetSetupStatus(),
    ]);
    this.validationCache.clear();
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  private getProviderName(provider: 'openai' | 'gemini'): string {
    return provider === 'openai' ? 'OpenAI' : 'Google Gemini';
  }

  private clearValidationCache(provider?: 'openai' | 'gemini'): void {
    if (provider) {
      // Clear specific provider cache
      const keysToDelete: string[] = [];
      this.validationCache.forEach((_, key) => {
        if (key.startsWith(provider)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.validationCache.delete(key));
    } else {
      // Clear all cache
      this.validationCache.clear();
    }
  }
}

// Export singleton instance
export const apiKeyService = new APIKeyService();
