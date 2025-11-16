# Quick Start - API Key Management

## For Developers - 5 Minute Setup

### 1. Configure Your API Keys

Create a `.env` file in the project root:

```bash
# .env
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-openai-key-here
EXPO_PUBLIC_GEMINI_API_KEY=AIza-your-gemini-key-here
```

Get your keys:
- **OpenAI:** https://platform.openai.com/api-keys
- **Gemini:** https://makersuite.google.com/app/apikey

### 2. Import the Service

```typescript
import { apiKeyService } from './src/services/apiKeyService';
import { interviewSimulator } from './src/services/llmService';
```

### 3. Use AI Features

```typescript
// Just use the features - they handle everything automatically!

// AI Interview
const greeting = await interviewSimulator.startInterview();
const response = await interviewSimulator.sendMessage('Hello');

// Speech Recognition
const transcription = await speechRecognition.transcribe(audioBlob);

// N-400 Assistant
const explanation = await n400Assistant.explainTerm('naturalization');
```

**That's it!** The system automatically:
- Checks if API keys are configured
- Falls back to demo mode if missing
- Shows user-friendly errors
- Provides clear guidance

### 4. Optional: Check Status First

```typescript
// Check if feature is available
const isAvailable = await apiKeyService.isFeatureAvailable('ai_interview');

if (isAvailable) {
  // Use real API
  const greeting = await interviewSimulator.startInterview();
} else {
  // Show setup guide or use demo mode
  navigation.navigate('APIConfiguration');
}
```

### 5. Add Configuration Screen (Optional)

```typescript
// In your navigation
import APIConfigurationScreen from './src/components/APIConfigurationScreen';

<Stack.Screen
  name="APIConfiguration"
  component={APIConfigurationScreen}
  options={{ title: 'API Configuration' }}
/>
```

## For End Users - Setup Guide

### Without Developer Access

1. Open the app
2. Navigate to **Settings**
3. Tap **API Configuration**
4. Follow the setup wizard:
   - Get OpenAI key from platform.openai.com/api-keys
   - Get Gemini key from makersuite.google.com/app/apikey
   - Paste keys and tap "Validate & Save"
5. Start using AI features!

### Demo Mode

- No API keys? No problem!
- The app works in demo mode automatically
- All features available with simulated responses
- Configure keys anytime for real AI

## Common Code Patterns

### Pattern 1: Basic Usage
```typescript
// The simplest way - just use it!
try {
  const result = await interviewSimulator.startInterview();
  console.log(result);
} catch (error) {
  alert(error.message); // User-friendly error
}
```

### Pattern 2: Feature Gate
```typescript
// Show different UI based on availability
const renderAIButton = async () => {
  const available = await apiKeyService.isFeatureAvailable('ai_interview');

  return available
    ? <Button>Start AI Interview</Button>
    : <Button>Setup API Keys</Button>;
};
```

### Pattern 3: Status Dashboard
```typescript
// Show system status
const SystemStatus = () => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    apiKeyService.getSystemStatus().then(setStatus);
  }, []);

  return (
    <View>
      <Text>OpenAI: {status?.apiStatuses.openai.isValid ? '✅' : '❌'}</Text>
      <Text>Gemini: {status?.apiStatuses.gemini.isValid ? '✅' : '❌'}</Text>
    </View>
  );
};
```

### Pattern 4: Save User Key
```typescript
// Validate and save from user input
const handleSaveKey = async (key: string) => {
  const validation = await apiKeyService.validateAPIKey('openai', key);

  if (validation.isValid) {
    await apiKeyService.saveOpenAIKey(key);
    alert('Saved!');
  } else {
    const error = apiKeyService.getAPIErrorMessage('openai', validation.error);
    alert(error);
  }
};
```

## Error Messages Reference

| Error Code | User Sees | Action |
|------------|-----------|--------|
| `API_KEY_MISSING` | "API not configured. Get key from..." | Add key in settings |
| `API_KEY_INVALID_FORMAT` | "Invalid format. Expected sk-..." | Check key format |
| `API_KEY_UNAUTHORIZED` | "Invalid or expired key" | Generate new key |
| `API_TIMEOUT` | "Request timed out" | Check internet |
| `NETWORK_ERROR` | "Unable to connect" | Check connection |

## Key Features

✅ **Auto Demo Mode** - Works without keys
✅ **User-Friendly Errors** - Clear, actionable messages
✅ **Validation Caching** - Fast repeated checks (5 min cache)
✅ **Format Validation** - Instant feedback on key format
✅ **Live Validation** - Tests keys with real API call
✅ **Setup Wizard** - Step-by-step guidance
✅ **Secure Storage** - Environment + AsyncStorage
✅ **No Breaking Changes** - Existing code still works

## Testing

### Test Demo Mode
```typescript
// Don't configure any keys
const status = await apiKeyService.getSystemStatus();
console.log(status.isDemoMode); // true

const greeting = await interviewSimulator.startInterview();
console.log(greeting); // [DEMO] Good morning! ...
```

### Test Real Mode
```bash
# Add to .env
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-real-key

# Restart app
npm start
```

```typescript
const greeting = await interviewSimulator.startInterview();
console.log(greeting); // Real AI response (no [DEMO] prefix)
```

## Troubleshooting

### "Cannot find module 'apiKeyService'"
```typescript
// Use correct import path
import { apiKeyService } from './src/services/apiKeyService';
// NOT '../services/apiKeyService' (depends on your file location)
```

### "Demo mode won't disable"
```typescript
// Force validation
const result = await apiKeyService.validateAPIKey('openai', undefined, true);

// Or clear and restart
await apiKeyService.clearAllAPIKeys();
```

### "Keys not loading from .env"
```bash
# Restart Expo dev server
npm start

# Or clear cache
npm start -- --clear
```

## API Endpoints Used

### OpenAI
- **Models List:** `GET https://api.openai.com/v1/models` (for validation)
- **Chat:** `POST https://api.openai.com/v1/chat/completions` (for AI interview)
- **Whisper:** `POST https://api.openai.com/v1/audio/transcriptions` (for speech)

### Gemini
- **Models List:** `GET https://generativelanguage.googleapis.com/v1/models` (for validation)
- **Generate:** `POST https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent` (for assistance)

## Security Notes

🔒 **Environment variables** checked first (recommended)
🔒 **AsyncStorage** as fallback (for user-entered keys)
🔒 **Keys masked** in UI (sk-...abc123)
🔒 **HTTPS only** for all API calls
🔒 **10-second timeout** prevents hanging
🔒 **No logging** of sensitive data

## Full Documentation

- **Detailed Guide:** `/src/services/API_KEY_MANAGEMENT_GUIDE.md`
- **Summary:** `/API_KEY_MANAGEMENT_SUMMARY.md`
- **Source Code:** `/src/services/apiKeyService.ts`
- **UI Component:** `/src/components/APIConfigurationScreen.tsx`

## Need Help?

1. Check error message - it has guidance!
2. Review setup wizard steps
3. Verify API key format
4. Test with demo mode enabled
5. Check provider status pages

---

**Quick Links:**
- OpenAI Dashboard: https://platform.openai.com/account/api-keys
- Gemini Dashboard: https://makersuite.google.com/app/apikey
- OpenAI Pricing: https://openai.com/pricing
- Gemini Pricing: https://ai.google.dev/pricing

**That's all you need to know to get started!** 🚀
