# CitizenNow Enhanced 🇺🇸

## The Ultimate AI-Powered US Citizenship Test Preparation App

CitizenNow Enhanced is a comprehensive React Native mobile application that helps aspiring US citizens prepare for their naturalization test with cutting-edge AI technology.

---

## 🌟 Features

### Core Study Tools
- ✅ **128 Official USCIS Civics Questions (2025 Test)**
- 📖 **Reading Test Practice** - 40 official sentences
- ✍️ **Writing Test Practice** - 35 official sentences
- 🎴 **Flashcards Mode** - Study at your own pace
- 📝 **Practice Quizzes** - Simulated test experience
- 🎯 **Mock Tests** - 20 questions, timed format

### AI-Powered Features
- 🤖 **AI Interview Simulator** - Practice with realistic USCIS officer roleplay (OpenAI GPT-4)
- 🎤 **Speech Recognition** - Real-time pronunciation feedback (Whisper API)
- 📋 **N-400 Application Assistant** - Personalized help with complex terms (Google Gemini)
- 🧠 **Adaptive Learning Engine** - Smart spaced repetition (SuperMemo SM-2 algorithm)

### Gamification & Progress
- 🏆 **Points, Badges, and Streaks** - Stay motivated
- 📊 **Detailed Progress Dashboard** - Track your improvement
- 🎯 **Daily Challenges** - Build consistent study habits
- 🥇 **Leaderboard** - Compare with other learners
- 📈 **Pass Probability Predictor** - Know when you're ready

### Accessibility
- 🌍 **Multilingual Support** - 15+ languages
- 🔊 **Text-to-Speech** - Audio for all questions
- 📱 **Offline Mode** - Study anywhere (Premium)
- 🎨 **User-Friendly Interface** - Clean, intuitive design

---

## 🏗️ Tech Stack

### Frontend
- **React Native** with **Expo** - Cross-platform mobile framework
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation and routing
- **Expo AV** - Audio playback and recording

### Backend & Services
- **Firebase**
  - Authentication (email/password, Google, Apple)
  - Firestore (NoSQL database for user data)
  - Cloud Functions (serverless API)
  - Storage (audio/image files)

### AI/LLM APIs
- **OpenAI GPT-4** - AI interview conversations
- **Whisper API** - Speech-to-text transcription
- **Google Gemini** - Content generation and explanations

### Algorithms
- **SuperMemo SM-2** - Spaced repetition scheduling

---

## 📁 Project Structure

```
CitizenNow-Enhanced/
├── App.tsx                    # Main app entry point
├── src/
│   ├── components/            # Reusable UI components
│   ├── screens/               # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── FlashcardsScreen.tsx
│   │   ├── QuizScreen.tsx
│   │   ├── AIInterviewScreen.tsx
│   │   ├── SpeechPracticeScreen.tsx
│   │   ├── N400AssistantScreen.tsx
│   │   ├── ProgressScreen.tsx
│   │   └── ...
│   ├── services/              # API and business logic
│   │   ├── firebase.ts        # Firebase config
│   │   ├── llmService.ts      # OpenAI, Whisper, Gemini APIs
│   │   └── spacedRepetitionService.ts
│   ├── data/                  # Static data files
│   │   ├── civicsQuestions.json       # 128 USCIS questions
│   │   ├── readingSentences.json      # Reading test sentences
│   │   └── writingSentences.json      # Writing test sentences
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                 # Helper functions
│   ├── navigation/            # Navigation configuration
│   ├── hooks/                 # Custom React hooks
│   └── contexts/              # React contexts (global state)
├── .env.example               # Environment variables template
├── package.json
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- Firebase project
- OpenAI API key
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CitizenNow-Enhanced
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_key
EXPO_PUBLIC_OPENAI_API_KEY=sk-your_openai_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

4. **Set up Firebase**
- Create a Firebase project at https://console.firebase.google.com
- Enable Authentication (Email/Password, Google, Apple)
- Create a Firestore database
- Add your Firebase config to `.env`

5. **Run the app**
```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

---

## 🔧 Configuration

### Firebase Setup

1. **Authentication**
   - Enable Email/Password
   - Enable Google Sign-In (optional)
   - Enable Apple Sign-In (optional, iOS only)

2. **Firestore Database Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Questions are read-only for all authenticated users
    match /questions/{questionId} {
      allow read: if request.auth != null;
    }

    // Leaderboard is read-only
    match /leaderboard/{entry} {
      allow read: if request.auth != null;
    }
  }
}
```

3. **Storage Rules**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /audio/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### API Key Management

**IMPORTANT:** Never commit API keys to version control!

- Store all keys in `.env` file
- Add `.env` to `.gitignore`
- Use `.env.example` as a template for others

---

## 📖 Features In Detail

### 1. AI Interview Simulator

The AI Interview Simulator uses OpenAI's GPT-4 to create a realistic USCIS officer interview experience.

**How it works:**
- Greets the user naturally
- Evaluates English speaking from the first interaction
- Asks civics questions from the official 128-question bank
- Reviews N-400 application with follow-up questions
- Provides detailed feedback at the end

**Usage:**
```typescript
import { interviewSimulator } from './src/services/llmService';

// Start interview
const greeting = await interviewSimulator.startInterview();

// Send user response
const response = await interviewSimulator.sendMessage('I am ready.');

// Get feedback at end
const feedback = await interviewSimulator.getFeedback();
```

### 2. Speech Recognition & Pronunciation Feedback

Uses OpenAI's Whisper API for accurate speech-to-text and pronunciation analysis.

**Features:**
- Transcribes spoken answers
- Compares with expected text
- Identifies pronunciation errors
- Focuses on meaning-affecting errors only (per USCIS policy)

**Usage:**
```typescript
import { speechRecognition } from './src/services/llmService';

// Transcribe audio
const text = await speechRecognition.transcribe(audioBlob, 'en');

// Analyze pronunciation
const errors = await speechRecognition.analyzePronunciation(
  audioBlob,
  'The President lives in the White House'
);
```

### 3. N-400 Application Assistant

Powered by Google Gemini to help users understand complex N-400 application terminology.

**Features:**
- Explains legal terms in simple language
- Generates personalized practice questions based on user's application
- Multilingual support

**Usage:**
```typescript
import { n400Assistant } from './src/services/llmService';

// Explain a term
const explanation = await n400Assistant.explainTerm('naturalization', 'es');

// Generate practice questions
const questions = await n400Assistant.generateN400Questions(userN400Data);
```

### 4. Adaptive Learning with Spaced Repetition

Uses the proven SuperMemo SM-2 algorithm to optimize study schedules.

**How it works:**
- Tracks user performance on each question
- Calculates optimal review intervals
- Prioritizes weak areas
- Predicts pass probability

**Usage:**
```typescript
import { spacedRepetitionService } from './src/services/spacedRepetitionService';

// Update progress after question attempt
const updatedProgress = spacedRepetitionService.calculateNextReview(
  currentProgress,
  userRating // 0-5
);

// Get study plan for today
const studyPlan = spacedRepetitionService.generateStudyPlan(
  allProgress,
  categoryProgress,
  20 // daily goal
);

// Predict pass probability
const passProbability = spacedRepetitionService.predictPassProbability(
  allProgress,
  128 // total questions
);
```

---

## 💰 Pricing Model

### Free Tier
- Access to all 128 civics questions
- Reading and writing practice
- Basic flashcards and quizzes
- 3 AI interview sessions per week
- Basic progress tracking

### Premium ($9.99/month or $49.99/year)
- ✨ Unlimited AI interview practice
- ✨ Advanced speech analysis
- ✨ N-400 assistant with personalized questions
- ✨ Offline mode
- ✨ Ad-free experience
- ✨ Priority support
- ✨ Detailed analytics

---

## 📊 Analytics & Metrics

The app tracks the following metrics (anonymized):

### User Engagement
- Daily Active Users (DAU)
- Session length and frequency
- Feature adoption rates
- Quiz completion rates

### Learning Effectiveness
- Pre/post-test score improvement
- Spaced repetition retention rates
- Time to proficiency
- Category-wise accuracy

### Business Metrics
- Free-to-paid conversion rate
- Churn rate
- Net Promoter Score (NPS)
- App store ratings

---

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests (Detox)
```bash
# iOS
npm run test:e2e:ios

# Android
npm run test:e2e:android
```

---

## 🚀 Deployment

### Building for Production

**iOS:**
```bash
# Create production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

**Android:**
```bash
# Create production build
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

### Environment-Specific Builds

The app supports multiple environments:
- `development` - Local development
- `staging` - Testing before production
- `production` - Live app

Set via `.env`:
```
EXPO_PUBLIC_ENV=production
```

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **USCIS** - Official civics questions and test materials
- **OpenAI** - GPT-4 and Whisper APIs
- **Google** - Gemini API
- **Expo** - React Native framework
- **Firebase** - Backend infrastructure

---

## 📞 Support

For questions or issues:
- Email: support@citizennow-enhanced.com
- GitHub Issues: [Create an issue](repository-url/issues)
- Documentation: [Full docs](repository-url/wiki)

---

## 🗺️ Roadmap

### Version 1.1 (Q2 2025)
- [ ] Video mock interview analysis
- [ ] Community features (study groups)
- [ ] More languages (20+ total)

### Version 1.2 (Q3 2025)
- [ ] Apple Watch app
- [ ] Widget for daily practice
- [ ] Integration with study calendar apps

### Version 2.0 (Q4 2025)
- [ ] AR flashcards
- [ ] Live group study sessions
- [ ] AI tutor customization

---

## 📈 Success Stories

> "I passed my citizenship test on the first try thanks to the AI interview practice! It felt just like the real thing." - Maria S., New York

> "The speech recognition helped me improve my pronunciation so much. I felt confident speaking English during my interview." - Chen L., California

> "The adaptive learning system was perfect. It focused on exactly what I needed to study." - Ahmed K., Texas

---

**Made with ❤️ for aspiring US citizens**

**CitizenNow Enhanced - Your path to citizenship starts here!** 🇺🇸
