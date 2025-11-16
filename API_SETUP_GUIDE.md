# API Setup Wizard - CitizenNow Enhanced

## Overview

The API Setup Wizard is a comprehensive onboarding experience that helps users configure their OpenAI and Google Gemini API keys to unlock premium AI features in CitizenNow Enhanced.

## Features

### 1. Welcome Step
- Clear explanation of features available with/without API keys
- Visual distinction between free and premium features
- Two paths: "Set Up API Keys" or "Continue Without APIs"

### 2. OpenAI API Setup
- **Purpose**: Powers AI Interview Simulator and Speech Practice
- **What users get**:
  - Realistic USCIS interview simulation with GPT-4
  - Speech-to-text transcription with Whisper
  - Pronunciation feedback and analysis
  - Personalized interview practice

- **Setup process**:
  - Clear instructions on how to get API key
  - Link to OpenAI Platform (https://platform.openai.com/api-keys)
  - Input field with show/hide toggle
  - Real-time validation with test connection
  - Visual feedback (green checkmark when validated)
  - Cost transparency note

### 3. Gemini API Setup
- **Purpose**: Powers N-400 Form Assistant
- **What users get**:
  - N-400 form help in multiple languages
  - Complex term explanations
  - Personalized practice questions
  - Multi-language support

- **Setup process**:
  - Clear instructions on how to get API key
  - Link to Google AI Studio (https://makersuite.google.com/app/apikey)
  - Input field with show/hide toggle
  - Real-time validation with test connection
  - Visual feedback (green checkmark when validated)
  - Free tier information

### 4. Review & Complete
- Status dashboard showing configured APIs
- Feature availability summary
- Security note about local storage
- Options to remove/edit keys
- Complete setup button

## Technical Implementation

### Files Created

1. **src/services/apiKeyService.ts**
   - Secure API key storage using AsyncStorage
   - Format validation (pattern matching)
   - Live API validation (actual test calls)
   - Caching to prevent excessive validation calls
   - Error handling with user-friendly messages
   - Setup status tracking

2. **src/screens/SetupWizardScreen.tsx**
   - Multi-step wizard interface
   - Progress indicator
   - Input validation
   - Test connection functionality
   - Help sections with external links
   - Responsive design for all screen sizes

### Navigation Integration

- Added `SetupWizard` route to RootStackParamList
- Configured as modal presentation
- Accessible from Profile screen ("API Setup" menu item)
- Deep linking support at `/setup-wizard`

### API Key Validation

#### OpenAI
- Format check: Must start with `sk-`
- Live test: GET request to `/v1/models`
- Handles: 200 (valid), 401 (invalid), 429 (rate limited)
- 10-second timeout

#### Gemini
- Format check: Must start with `AIza`
- Live test: GET request to `/v1/models`
- Handles: 200 (valid), 400/403 (invalid), 429 (rate limited)
- 10-second timeout

### Security

- API keys stored locally using AsyncStorage
- Never sent to CitizenNow servers
- Encrypted at rest by iOS/Android
- Can be removed at any time
- No cloud backup

## User Experience Flow

```
Profile Screen
    ↓
Click "API Setup" (🔑)
    ↓
Welcome Screen
    ├─→ "Continue Without APIs" → Back to Profile (marked as skipped)
    └─→ "Set Up API Keys" → Step 1: OpenAI
                                    ↓
                            Enter OpenAI Key
                            Test Connection
                                    ↓
                            Step 2: Gemini
                            Enter Gemini Key
                            Test Connection
                                    ↓
                            Step 3: Review
                            Confirm Setup
                                    ↓
                            Complete → Back to Profile
```

## API Key Sources

### OpenAI
1. Visit https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Name your key (e.g., "CitizenNow")
5. Copy the key (starts with `sk-`)
6. Paste into the app

**Cost**: Pay-per-use
- GPT-4 Interview: ~$0.10-0.30 per session
- Whisper transcription: ~$0.006 per minute

### Google Gemini
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Get API Key"
4. Select project or create new
5. Copy the key (starts with `AIza`)
6. Paste into the app

**Cost**: Generous free tier
- 60 requests per minute
- Most users won't incur charges

## Available Features by API

| Feature | Required API | Fallback Without API |
|---------|-------------|---------------------|
| Flashcards | None | Full access |
| Practice Quizzes | None | Full access |
| Reading Practice | None | Full access |
| Writing Practice | None | Full access |
| Progress Tracking | None | Full access |
| **AI Interview Simulator** | OpenAI | Demo/Disabled |
| **Speech Practice** | OpenAI | Demo/Disabled |
| **Pronunciation Analysis** | OpenAI | Demo/Disabled |
| **N-400 Form Assistant** | Gemini | Demo/Disabled |
| **Multi-language Explanations** | Gemini | Demo/Disabled |

## Setup Status Tracking

The app tracks three states:
1. **Setup Completed**: User configured at least one API
2. **Setup Skipped**: User chose to continue without APIs
3. **Setup Pending**: First-time user, hasn't decided yet

This allows the app to:
- Show one-time setup prompts
- Enable/disable features based on configuration
- Provide helpful guidance when features require APIs

## Error Handling

### Common Errors

1. **Invalid Format**
   - Message: "OpenAI keys start with 'sk-'"
   - Action: Check key format

2. **Unauthorized**
   - Message: "Invalid API key. Please check your key."
   - Action: Verify key or generate new one

3. **Network Error**
   - Message: "Network error. Please check your connection."
   - Action: Check internet connection

4. **Timeout**
   - Message: "API request timed out"
   - Action: Retry or check connection

5. **Rate Limited**
   - Message: "API key is valid (rate limited)"
   - Status: Still considered valid

## Testing

### Manual Testing Checklist

- [ ] Welcome screen displays correctly
- [ ] "Continue Without APIs" saves skip status
- [ ] "Set Up API Keys" proceeds to Step 1
- [ ] OpenAI input accepts text
- [ ] Show/hide toggle works for OpenAI
- [ ] Test connection validates OpenAI key
- [ ] Invalid OpenAI key shows error
- [ ] Valid OpenAI key shows success
- [ ] Can proceed to Gemini step
- [ ] Gemini input accepts text
- [ ] Show/hide toggle works for Gemini
- [ ] Test connection validates Gemini key
- [ ] Invalid Gemini key shows error
- [ ] Valid Gemini key shows success
- [ ] Review screen shows correct status
- [ ] Can remove configured keys
- [ ] Complete button saves setup
- [ ] Navigation back to Profile works
- [ ] Keys persist after app restart
- [ ] Profile shows API Setup menu item

### API Validation Testing

```typescript
// Test OpenAI validation
const openaiValid = await apiKeyService.validateOpenAIKey('sk-...');
console.log(openaiValid); // { valid: true, message: '...' }

// Test Gemini validation
const geminiValid = await apiKeyService.validateGeminiKey('AIza...');
console.log(geminiValid); // { valid: true, message: '...' }

// Get system status
const status = await apiKeyService.getAPIKeyStatus();
console.log(status); // { openai: {...}, gemini: {...}, setupCompleted: true }
```

## Future Enhancements

### Planned Features
1. **Batch validation**: Test all keys at once
2. **Usage tracking**: Show API usage statistics
3. **Cost estimation**: Estimate monthly costs
4. **Key rotation**: Schedule key refresh reminders
5. **Multiple keys**: Support backup keys for failover
6. **Environment detection**: Auto-load from .env in dev mode
7. **Health dashboard**: Real-time API status monitoring

### Potential Improvements
- Add video tutorial walkthrough
- In-app FAQ section
- One-click key copy from external sources
- QR code scanning for API keys
- Key sharing across devices (encrypted)
- Offline mode with cached responses

## Accessibility

- All buttons have clear labels
- Input fields have descriptive placeholders
- Error messages are announced
- Color indicators have text alternatives
- Supports screen readers
- Large touch targets (44x44pt minimum)

## Localization

Ready for multi-language support:
- All text strings are extractable
- Instructions can be translated
- Help links can be localized
- Error messages support i18n

## Developer Notes

### Adding New API Providers

To add a new API provider:

1. Update `apiKeyService.ts`:
```typescript
async saveNewProviderKey(key: string): Promise<void> {
  await AsyncStorage.setItem('@citizennow_newprovider_key', key);
}

async validateNewProviderKey(key: string): Promise<APIValidationResult> {
  // Validation logic
}
```

2. Add new step in `SetupWizardScreen.tsx`:
```typescript
type SetupStep = 'welcome' | 'openai' | 'gemini' | 'newprovider' | 'review';
```

3. Update navigation flow
4. Add UI components for new provider

### Customizing Validation

Modify validation logic in `apiKeyService.ts`:
- Adjust timeout values (default: 10 seconds)
- Change cache duration (default: 5 minutes)
- Update regex patterns for key formats
- Add custom error handling

## Support

For issues or questions:
1. Check error messages in the app
2. Review API provider documentation
3. Verify API key permissions
4. Check internet connection
5. Try regenerating API keys

## License

Part of CitizenNow Enhanced - proprietary software for U.S. citizenship test preparation.

---

**Last Updated**: November 15, 2025
**Version**: 1.0.0
**Author**: CitizenNow Development Team
