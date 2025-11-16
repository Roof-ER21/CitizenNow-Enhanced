# API Key Management System - Complete Guide

## Overview

The CitizenNow Enhanced app now includes a comprehensive API key management system that provides:

- **API Key Validation** - Format checking and live API testing
- **Graceful Degradation** - Demo mode when keys unavailable
- **User-Friendly Errors** - Clear, actionable error messages
- **Setup Wizard** - Step-by-step configuration guidance
- **Validation Caching** - 5-minute cache for better performance

## Architecture

### Files
- `/src/services/apiKeyService.ts` - Core API key management service
- `/src/services/llmService.ts` - Updated LLM services with API key integration

### Key Components

```typescript
// Import the service
import { apiKeyService } from './services/apiKeyService';

// Check system status
const status = await apiKeyService.getSystemStatus();
// Returns: { hasAnyAPI, isDemoMode, availableAPIs, recommendations, ... }

// Validate specific API key
const validation = await apiKeyService.validateAPIKey('openai');
// Returns: { isValid: boolean, error?: string, message?: string }

// Check feature availability
const isAvailable = await apiKeyService.isFeatureAvailable('ai_interview');
// Returns: boolean
```

## Usage Examples

### 1. Checking API Key Status

```typescript
import { apiKeyService } from '../services/apiKeyService';

async function checkAPIStatus() {
  const status = await apiKeyService.getSystemStatus();

  if (status.isDemoMode) {
    console.log('Running in demo mode');
    console.log('Recommendations:', status.recommendations);
  }

  // Check individual providers
  if (status.apiStatuses.openai.isValid) {
    console.log('OpenAI API is ready');
  } else {
    console.log('OpenAI Error:', status.apiStatuses.openai.error);
  }
}
```

### 2. Validating User-Entered Keys

```typescript
import { apiKeyService } from '../services/apiKeyService';

async function saveAPIKey(provider: 'openai' | 'gemini', key: string) {
  // Validate the key
  const validation = await apiKeyService.validateAPIKey(provider, key);

  if (!validation.isValid) {
    // Show error to user
    const errorMessage = apiKeyService.getAPIErrorMessage(provider, validation.error);
    alert(errorMessage);
    return false;
  }

  // Save the key
  if (provider === 'openai') {
    await apiKeyService.saveOpenAIKey(key);
  } else {
    await apiKeyService.saveGeminiKey(key);
  }

  alert('API key saved successfully!');
  return true;
}
```

### 3. Using AI Features with Fallback

```typescript
import { interviewSimulator } from '../services/llmService';

async function startAIInterview() {
  try {
    // This automatically checks API availability and uses demo mode if needed
    const greeting = await interviewSimulator.startInterview();
    console.log(greeting);

    // If in demo mode, greeting will include [DEMO MODE] prefix
  } catch (error) {
    // Error already contains user-friendly message
    alert(error.message);
  }
}
```

### 4. Feature Availability Check Before UI

```typescript
import { apiKeyService } from '../services/apiKeyService';

async function renderFeatureButton() {
  const isAIAvailable = await apiKeyService.isFeatureAvailable('ai_interview');

  if (isAIAvailable) {
    return (
      <Button onPress={startAIInterview}>
        Start AI Interview
      </Button>
    );
  } else {
    return (
      <Button onPress={showSetupWizard}>
        Configure API Keys (Demo Mode)
      </Button>
    );
  }
}
```

### 5. Setup Wizard Implementation

```typescript
import { apiKeyService } from '../services/apiKeyService';

function SetupWizardScreen() {
  const steps = apiKeyService.getSetupWizardSteps();

  return (
    <View>
      <Text>API Configuration Setup</Text>
      {steps.map((step, index) => (
        <Text key={index}>{step}</Text>
      ))}

      <TextInput
        placeholder="Enter OpenAI API Key (sk-...)"
        onChangeText={setOpenAIKey}
      />

      <Button
        title="Validate & Save"
        onPress={async () => {
          const valid = await saveAPIKey('openai', openAIKey);
          if (valid) {
            navigation.navigate('Home');
          }
        }}
      />
    </View>
  );
}
```

## Error Handling

### Error Codes

The system uses specific error codes for different scenarios:

- `API_KEY_MISSING` - No API key configured
- `API_KEY_PLACEHOLDER` - Placeholder value detected
- `API_KEY_INVALID_FORMAT` - Key format doesn't match expected pattern
- `API_KEY_UNAUTHORIZED` - Key is invalid or expired (401/403)
- `API_TIMEOUT` - Request timed out (10 seconds)
- `NETWORK_ERROR` - Network connectivity issue
- `API_ERROR` - Other API errors

### User-Friendly Messages

```typescript
// Get contextual error message
const errorMessage = apiKeyService.getAPIErrorMessage('openai', 'API_KEY_MISSING');

// Returns:
// "OpenAI API is not configured.
//
//  Get your API key from https://platform.openai.com/api-keys
//
//  Then add it in Settings > API Configuration"
```

## Demo Mode

Demo mode automatically activates when:
1. No API key is configured
2. API key validation fails
3. User explicitly enables demo mode

### Demo Responses

Each AI service provides realistic demo responses:

**AI Interview:**
```
"Good morning! I'm a simulated USCIS officer (DEMO MODE).
Please note: This is a demonstration. Configure your OpenAI API key..."
```

**Speech Recognition:**
```
"[DEMO MODE] This is a simulated transcription. Configure your OpenAI API key..."
```

**N-400 Assistant:**
```
"[DEMO] Tell me about your employment history."
```

## Configuration Storage

API keys are stored in two places:

1. **Environment Variables** (primary)
   - `EXPO_PUBLIC_OPENAI_API_KEY`
   - `EXPO_PUBLIC_GEMINI_API_KEY`

2. **AsyncStorage** (fallback)
   - `@citizennow_openai_key`
   - `@citizennow_gemini_key`

Priority: Environment variables are checked first, then AsyncStorage.

## Validation Caching

Validation results are cached for 5 minutes to improve performance:

```typescript
// First call - performs live validation
const result1 = await apiKeyService.validateAPIKey('openai');

// Second call within 5 minutes - uses cache
const result2 = await apiKeyService.validateAPIKey('openai');

// Force fresh validation
const result3 = await apiKeyService.validateAPIKey('openai', undefined, true);
```

## Security Best Practices

### DO:
- Store keys in environment variables for production
- Use AsyncStorage for user-entered keys in development
- Validate keys before saving
- Clear keys on logout if needed

### DON'T:
- Hardcode API keys in source code
- Commit .env files to git
- Display full API keys in UI (show masked: `sk-...abc123`)
- Store keys in plain text files

## Testing

### Manual Testing

1. **Test Demo Mode:**
   ```typescript
   // Don't configure any keys
   await apiKeyService.getSystemStatus();
   // Should show isDemoMode: true
   ```

2. **Test Invalid Key:**
   ```typescript
   const validation = await apiKeyService.validateAPIKey('openai', 'sk-invalid');
   // Should return: { isValid: false, error: 'API_KEY_UNAUTHORIZED' }
   ```

3. **Test Valid Key:**
   ```typescript
   const validation = await apiKeyService.validateAPIKey('openai', 'sk-your-valid-key');
   // Should return: { isValid: true, message: 'OpenAI API key is valid...' }
   ```

### Unit Testing

```typescript
import { apiKeyService } from '../services/apiKeyService';

describe('API Key Service', () => {
  it('should detect missing keys', async () => {
    const validation = await apiKeyService.validateAPIKey('openai', '');
    expect(validation.isValid).toBe(false);
    expect(validation.error).toBe('API_KEY_MISSING');
  });

  it('should detect invalid format', async () => {
    const validation = await apiKeyService.validateAPIKey('openai', 'invalid-key');
    expect(validation.isValid).toBe(false);
    expect(validation.error).toBe('API_KEY_INVALID_FORMAT');
  });

  it('should accept valid format', async () => {
    const validation = apiKeyService.validateKeyFormat('openai', 'sk-' + 'a'.repeat(48));
    expect(validation.isValid).toBe(true);
  });
});
```

## API Key Formats

### OpenAI
- **Pattern:** `sk-[A-Za-z0-9]{48,}`
- **Example:** `sk-proj-abcdef1234567890...` (51+ chars)
- **Get key:** https://platform.openai.com/api-keys

### Google Gemini
- **Pattern:** `AIza[A-Za-z0-9_-]{35,}`
- **Example:** `AIzaSyAbc123Def456...` (39+ chars)
- **Get key:** https://makersuite.google.com/app/apikey

## Troubleshooting

### Issue: "API key is invalid or expired"
**Solution:** Generate a new API key from the provider's dashboard

### Issue: "API request timed out"
**Solution:** Check internet connection, try again in a moment

### Issue: "API key has invalid format"
**Solution:** Ensure you copied the entire key including prefix (sk- or AIza)

### Issue: "Demo mode won't disable"
**Solution:**
```typescript
await apiKeyService.setDemoMode(false);
// Then configure and validate your API keys
```

## Migration Guide

If you have existing code using the old LLM service:

### Before:
```typescript
import { interviewSimulator } from '../services/llmService';

// Would crash with 401 if no key
const greeting = await interviewSimulator.startInterview();
```

### After:
```typescript
import { interviewSimulator } from '../services/llmService';
import { apiKeyService } from '../services/apiKeyService';

// Check availability first (optional)
const isAvailable = await apiKeyService.isFeatureAvailable('ai_interview');

// Automatically handles demo mode
const greeting = await interviewSimulator.startInterview();
// Returns demo greeting if no key, or throws user-friendly error
```

No breaking changes - existing code continues to work, but now with better error handling!

## Advanced Features

### Custom Demo Responses

You can create custom demo responses:

```typescript
const demoResponse = apiKeyService.createDemoResponse(
  { data: 'Sample data' },
  'Custom Feature'
);

// Returns:
// {
//   isDemo: true,
//   data: { data: 'Sample data' },
//   message: 'Demo Mode: This is a simulated response for Custom Feature...'
// }
```

### Monitoring API Status

```typescript
// Get real-time status for dashboard
const status = await apiKeyService.getSystemStatus();

// Display in UI
return (
  <View>
    <Text>OpenAI: {status.apiStatuses.openai.isValid ? '✅' : '❌'}</Text>
    <Text>Gemini: {status.apiStatuses.gemini.isValid ? '✅' : '❌'}</Text>

    {status.recommendations.map(rec => (
      <Text key={rec}>{rec}</Text>
    ))}
  </View>
);
```

### Clearing All Data

```typescript
// Clear all API keys and reset setup
await apiKeyService.clearAllAPIKeys();

// This will:
// - Remove OpenAI key from storage
// - Remove Gemini key from storage
// - Reset setup completion status
// - Clear validation cache
```

## Support

For issues or questions:
1. Check error message for guidance
2. Review setup wizard steps
3. Verify API key format
4. Test with demo mode enabled
5. Check provider API status pages

---

**Last Updated:** November 2025
**Version:** 1.0.0
