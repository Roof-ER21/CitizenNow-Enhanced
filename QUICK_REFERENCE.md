# API Setup Wizard - Quick Reference Card

## Files at a Glance

### New Files (3)
```
/Users/a21/CitizenNow-Enhanced/src/services/apiKeyService.ts
/Users/a21/CitizenNow-Enhanced/src/screens/SetupWizardScreen.tsx
/Users/a21/CitizenNow-Enhanced/API_SETUP_GUIDE.md
```

### Modified Files (4)
```
/Users/a21/CitizenNow-Enhanced/src/navigation/types.ts
/Users/a21/CitizenNow-Enhanced/src/types/index.ts
/Users/a21/CitizenNow-Enhanced/src/navigation/RootNavigator.tsx
/Users/a21/CitizenNow-Enhanced/src/screens/ProfileScreen.tsx
```

---

## Key Code Snippets

### Using the API Key Service

```typescript
import { apiKeyService } from '../services/apiKeyService';

// Save a key
await apiKeyService.saveOpenAIKey('sk-...');

// Get a key
const key = await apiKeyService.getOpenAIKey();

// Validate a key
const result = await apiKeyService.validateOpenAIKey('sk-...');
if (result.valid) {
  console.log('Valid!');
} else {
  console.log('Error:', result.error);
}

// Get status
const status = await apiKeyService.getAPIKeyStatus();
console.log('OpenAI configured?', status.openai.configured);
```

### Navigating to Setup Wizard

```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();
navigation.navigate('SetupWizard');
```

### Checking if Feature is Available

```typescript
// In your AI Interview screen
const openaiKey = await apiKeyService.getOpenAIKey();
if (!openaiKey) {
  Alert.alert(
    'API Key Required',
    'Please configure your OpenAI API key in Profile > API Setup'
  );
  return;
}
```

---

## API Configuration URLs

### OpenAI
- **Get API Key**: https://platform.openai.com/api-keys
- **Pricing**: https://openai.com/pricing
- **Docs**: https://platform.openai.com/docs

### Google Gemini
- **Get API Key**: https://makersuite.google.com/app/apikey
- **Pricing**: https://ai.google.dev/pricing
- **Docs**: https://ai.google.dev/docs

---

## Testing Checklist

### Basic Flow
- [ ] Profile → API Setup menu item exists
- [ ] Clicking opens wizard modal
- [ ] Welcome screen shows feature comparison
- [ ] "Set Up API Keys" advances to step 1
- [ ] "Continue Without APIs" closes wizard

### OpenAI Setup
- [ ] Input accepts text
- [ ] Show/hide toggle works
- [ ] Invalid key shows error
- [ ] Valid key shows success
- [ ] "Skip" advances to next step
- [ ] "Next" only works when validated

### Gemini Setup
- [ ] Input accepts text
- [ ] Show/hide toggle works
- [ ] Invalid key shows error
- [ ] Valid key shows success
- [ ] "Skip" advances to review
- [ ] "Next" only works when validated

### Review & Complete
- [ ] Shows correct status for both APIs
- [ ] "Remove" buttons work
- [ ] Security note is visible
- [ ] "Complete Setup" saves and closes
- [ ] Returns to Profile screen

### Persistence
- [ ] Keys survive app restart
- [ ] Status flags persist
- [ ] Validation cache works

---

## Common Issues & Solutions

### Issue: "Module not found: apiKeyService"
**Solution**: Check import path
```typescript
import { apiKeyService } from '../services/apiKeyService';
```

### Issue: "Cannot navigate to SetupWizard"
**Solution**: Verify navigation setup
1. Check RootNavigator.tsx has SetupWizard screen
2. Check types.ts has SetupWizard in RootStackParamList
3. Restart Metro bundler

### Issue: Validation always fails
**Solution**: Check network connection and API key format
- OpenAI: Must start with `sk-`
- Gemini: Must start with `AIza`

### Issue: Keys not persisting
**Solution**: Check AsyncStorage permissions
```typescript
// Test AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('test', 'value');
const value = await AsyncStorage.getItem('test');
console.log(value); // Should be 'value'
```

---

## Feature Flags

Based on API configuration, these features are enabled/disabled:

| Feature | OpenAI | Gemini | Neither |
|---------|--------|--------|---------|
| Flashcards | ✓ | ✓ | ✓ |
| Quizzes | ✓ | ✓ | ✓ |
| Reading | ✓ | ✓ | ✓ |
| Writing | ✓ | ✓ | ✓ |
| AI Interview | ✓ | ✗ | ✗ |
| Speech Practice | ✓ | ✗ | ✗ |
| N-400 Assistant | ✗ | ✓ | ✗ |

---

## Cost Estimates

### OpenAI (Pay-per-use)
- **AI Interview**: $0.10 - $0.30 per 15-min session
- **Speech Practice**: $0.006 per minute of audio
- **Average Monthly**: $5-15 for moderate use

### Gemini (Free Tier)
- **Free Quota**: 60 requests/minute
- **Cost**: $0 for most users
- **Paid Tier**: Only if exceeding free limits

---

## Environment Variables (Optional)

For development, you can use `.env` files:

```bash
# .env
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key-here
EXPO_PUBLIC_GEMINI_API_KEY=AIza-your-key-here
```

The service will check env vars before AsyncStorage.

---

## Architecture Overview

```
┌──────────────────────────────────────────────┐
│              SetupWizardScreen               │
│  (UI + User Interaction)                     │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│              apiKeyService                   │
│  (Business Logic + Validation)               │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│              AsyncStorage                    │
│  (Secure Local Storage)                      │
└──────────────────────────────────────────────┘
```

---

## Support Matrix

| Screen Size | Supported | Notes |
|-------------|-----------|-------|
| iPhone SE | ✓ | Scrollable |
| iPhone 14 | ✓ | Optimal |
| iPhone 14 Pro Max | ✓ | Optimal |
| iPad | ✓ | Centered |
| Android Small | ✓ | Scrollable |
| Android Large | ✓ | Optimal |

---

## Next Steps After Implementation

1. **Test thoroughly** on real devices
2. **Add analytics** to track setup completion rate
3. **Create video tutorial** for users
4. **Add FAQ section** for common issues
5. **Monitor API costs** for users
6. **Implement usage dashboard** (optional)

---

**Quick Reference v1.0**
**Last Updated**: November 15, 2025
