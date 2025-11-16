# AI Screens Integration Guide

## Quick Start

This guide shows you how to integrate the three AI-powered screens into your CitizenNow Enhanced app.

---

## Step 1: Verify Files Are Created

All three screen files should exist in `/Users/a21/CitizenNow-Enhanced/src/screens/`:

```bash
# Run this to verify:
ls -lh /Users/a21/CitizenNow-Enhanced/src/screens/AI*.tsx
ls -lh /Users/a21/CitizenNow-Enhanced/src/screens/Speech*.tsx
ls -lh /Users/a21/CitizenNow-Enhanced/src/screens/N400*.tsx
```

Expected output:
```
AIInterviewScreen.tsx       (16KB)
SpeechPracticeScreen.tsx    (18KB)
N400AssistantScreen.tsx     (16KB)
```

---

## Step 2: Set Up API Keys

Create or update `/Users/a21/CitizenNow-Enhanced/.env`:

```bash
# OpenAI API Key (for Interview & Speech Practice)
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-openai-key-here

# Google Gemini API Key (for N-400 Assistant)
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-key-here
```

### Getting API Keys

**OpenAI (GPT-4 + Whisper)**:
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Paste into `.env` file

**Google Gemini**:
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API key"
3. Copy the key
4. Paste into `.env` file

---

## Step 3: Add to Navigation

### Option A: Create New Navigation File

Create `/Users/a21/CitizenNow-Enhanced/src/navigation/AppNavigator.tsx`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import existing screens
import HomeScreen from '../screens/HomeScreen';
import StudyScreen from '../screens/StudyScreen';
import FlashcardsScreen from '../screens/FlashcardsScreen';
import QuizScreen from '../screens/QuizScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Import new AI screens
import AIInterviewScreen from '../screens/AIInterviewScreen';
import SpeechPracticeScreen from '../screens/SpeechPracticeScreen';
import N400AssistantScreen from '../screens/N400AssistantScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1E40AF',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Study"
        component={StudyScreen}
        options={{ title: 'Study' }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ title: 'Progress' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E40AF',
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Main Tabs */}
        <Stack.Screen
          name="MainTabs"
          component={HomeTabs}
          options={{ headerShown: false }}
        />

        {/* Study Screens */}
        <Stack.Screen
          name="Flashcards"
          component={FlashcardsScreen}
          options={{ title: 'Flashcards' }}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ title: 'Quiz' }}
        />

        {/* NEW: AI-Powered Screens */}
        <Stack.Screen
          name="AIInterview"
          component={AIInterviewScreen}
          options={{
            title: 'AI Interview Practice',
            headerShown: false, // Screen has its own header
          }}
        />
        <Stack.Screen
          name="SpeechPractice"
          component={SpeechPracticeScreen}
          options={{
            title: 'Speech Practice',
            headerShown: false, // Screen has its own header
          }}
        />
        <Stack.Screen
          name="N400Assistant"
          component={N400AssistantScreen}
          options={{
            title: 'N-400 Assistant',
            headerShown: false, // Screen has its own header
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Option B: Update Existing App.tsx

If you're using simple navigation in `App.tsx`, update it:

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Import all screens
import HomeScreen from './src/screens/HomeScreen';
import AIInterviewScreen from './src/screens/AIInterviewScreen';
import SpeechPracticeScreen from './src/screens/SpeechPracticeScreen';
import N400AssistantScreen from './src/screens/N400AssistantScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={setCurrentScreen} />;
      case 'aiInterview':
        return <AIInterviewScreen />;
      case 'speechPractice':
        return <SpeechPracticeScreen />;
      case 'n400Assistant':
        return <N400AssistantScreen />;
      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}

      {/* Navigation Bar (if on home screen) */}
      {currentScreen === 'home' && (
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentScreen('aiInterview')}
          >
            <Text style={styles.navButtonText}>AI Interview</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentScreen('speechPractice')}
          >
            <Text style={styles.navButtonText}>Speech Practice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentScreen('n400Assistant')}
          >
            <Text style={styles.navButtonText}>N-400 Help</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Back Button (if not on home screen) */}
      {currentScreen !== 'home' && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  navButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '600',
  },
});
```

---

## Step 4: Update HomeScreen to Link to AI Features

Update `/Users/a21/CitizenNow-Enhanced/src/screens/HomeScreen.tsx`:

Add navigation buttons to the home screen:

```typescript
// In HomeScreen.tsx, add these buttons:

<TouchableOpacity
  style={styles.featureButton}
  onPress={() => navigation.navigate('AIInterview')}
>
  <Text style={styles.featureIcon}>🤖</Text>
  <Text style={styles.featureTitle}>AI Interview Practice</Text>
  <Text style={styles.featureDescription}>
    Practice with a realistic USCIS officer simulation
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.featureButton}
  onPress={() => navigation.navigate('SpeechPractice')}
>
  <Text style={styles.featureIcon}>🎤</Text>
  <Text style={styles.featureTitle}>Speech Practice</Text>
  <Text style={styles.featureDescription}>
    Get AI-powered pronunciation feedback
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.featureButton}
  onPress={() => navigation.navigate('N400Assistant')}
>
  <Text style={styles.featureIcon}>📋</Text>
  <Text style={styles.featureTitle}>N-400 Assistant</Text>
  <Text style={styles.featureDescription}>
    Explain N-400 terms in 15+ languages
  </Text>
</TouchableOpacity>

// Add styles:
const styles = StyleSheet.create({
  featureButton: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
```

---

## Step 5: Test the Integration

### Test AIInterviewScreen
```bash
# Start the app
npm start

# Navigate to AI Interview
# Tap "Start Interview"
# Type a response and tap "Send"
# Verify messages appear correctly
# Tap "End Interview & Get Feedback"
# Check feedback modal displays
```

### Test SpeechPracticeScreen
```bash
# Navigate to Speech Practice
# Grant microphone permission when prompted
# Select a question
# Tap "Start Recording"
# Speak the answer
# Tap "Stop Recording"
# Verify transcription and feedback appear
# Tap "Play Recording" to hear playback
```

### Test N400AssistantScreen
```bash
# Navigate to N-400 Assistant
# Tap language dropdown
# Select a different language
# Tap a common term (e.g., "Naturalization")
# Verify explanation appears in selected language
# Type a custom question
# Tap "Explain"
# Check custom explanation displays
# Verify recent searches save in history
```

---

## Step 6: Troubleshooting

### Issue: "Cannot find module" errors

**Solution**: Ensure imports match exact file names:
```typescript
import AIInterviewScreen from '../screens/AIInterviewScreen';
import SpeechPracticeScreen from '../screens/SpeechPracticeScreen';
import N400AssistantScreen from '../screens/N400AssistantScreen';
```

### Issue: API calls fail with 401 Unauthorized

**Solution**: Check API keys:
1. Verify `.env` file exists in project root
2. Ensure keys are prefixed with `EXPO_PUBLIC_`
3. Restart Expo dev server after adding keys
4. Check keys are valid on respective platforms

### Issue: Microphone permission denied

**Solution**: Update app permissions:

**iOS** - Add to `app.json`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSMicrophoneUsageDescription": "This app uses the microphone to help you practice pronunciation for your U.S. citizenship interview."
      }
    }
  }
}
```

**Android** - Add to `app.json`:
```json
{
  "expo": {
    "android": {
      "permissions": ["RECORD_AUDIO"]
    }
  }
}
```

### Issue: TypeScript errors

**Solution**: Types are already defined in `/Users/a21/CitizenNow-Enhanced/src/types/index.ts`. If you see type errors:

```bash
# Clean and reinstall
rm -rf node_modules
npm install

# Clear TypeScript cache
rm -rf .expo
npm start -- --clear
```

---

## Step 7: Production Considerations

### Before Deploying to Production

1. **API Key Security**:
   - Move API keys to secure backend
   - Implement proxy server to hide keys
   - Use environment-specific keys

2. **Rate Limiting**:
   - Implement server-side rate limiting
   - Add user-based quotas
   - Cache common responses

3. **Error Tracking**:
   - Add Sentry or similar for error monitoring
   - Log API failures for debugging
   - Track user drop-off points

4. **Performance**:
   - Implement request debouncing
   - Add response caching
   - Optimize bundle size

5. **Testing**:
   - Test on real iOS/Android devices
   - Test with poor network conditions
   - Test permission flows
   - Test API failure scenarios

---

## Step 8: Optional Enhancements

### Add Deep Linking

Allow users to share specific features:

```typescript
// In app.json
{
  "expo": {
    "scheme": "citizennow",
    "ios": {
      "associatedDomains": ["applinks:citizennow.app"]
    }
  }
}

// Now you can use:
// citizennow://aiInterview
// citizennow://speechPractice
// citizennow://n400Assistant
```

### Add Analytics

Track feature usage:

```typescript
import * as Analytics from 'expo-firebase-analytics';

// In each screen
useEffect(() => {
  Analytics.logEvent('screen_view', {
    screen_name: 'AIInterview',
    screen_class: 'AIInterviewScreen',
  });
}, []);

// Track API calls
Analytics.logEvent('ai_api_call', {
  feature: 'interview',
  model: 'gpt4',
});
```

### Add Onboarding

Show tutorial for first-time users:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkFirstTime = async () => {
  const hasSeenTutorial = await AsyncStorage.getItem('hasSeenAITutorial');
  if (!hasSeenTutorial) {
    // Show tutorial modal
    setShowTutorial(true);
    await AsyncStorage.setItem('hasSeenAITutorial', 'true');
  }
};
```

---

## Complete File Checklist

Make sure you have these files:

- ✅ `/Users/a21/CitizenNow-Enhanced/src/screens/AIInterviewScreen.tsx`
- ✅ `/Users/a21/CitizenNow-Enhanced/src/screens/SpeechPracticeScreen.tsx`
- ✅ `/Users/a21/CitizenNow-Enhanced/src/screens/N400AssistantScreen.tsx`
- ✅ `/Users/a21/CitizenNow-Enhanced/src/services/llmService.ts` (already exists)
- ✅ `/Users/a21/CitizenNow-Enhanced/src/types/index.ts` (already exists)
- ⚠️ `/Users/a21/CitizenNow-Enhanced/.env` (you need to create with API keys)
- 📝 `/Users/a21/CitizenNow-Enhanced/src/navigation/AppNavigator.tsx` (optional - create if needed)

---

## Quick Test Commands

```bash
# Navigate to project
cd /Users/a21/CitizenNow-Enhanced

# Install dependencies (if needed)
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web (for quick testing)
npm run web
```

---

## Support & Resources

### Documentation Links
- **OpenAI API**: https://platform.openai.com/docs
- **Google Gemini**: https://ai.google.dev/docs
- **Expo Audio**: https://docs.expo.dev/versions/latest/sdk/audio/
- **React Navigation**: https://reactnavigation.org/docs/getting-started

### Example Usage
See detailed examples in `/Users/a21/CitizenNow-Enhanced/AI_SCREENS_SUMMARY.md`

---

## Next Steps

1. ✅ Verify all files created
2. ⚠️ Add API keys to `.env`
3. 📝 Create or update navigation
4. 🧪 Test each screen
5. 🎨 Customize styling (optional)
6. 🚀 Deploy to app stores

---

**Integration Guide Complete!**

All three AI screens are ready to use. Follow the steps above to integrate them into your CitizenNow Enhanced app.

For detailed technical documentation, see `AI_SCREENS_SUMMARY.md` in the project root.
