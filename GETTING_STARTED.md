# Getting Started with CitizenNow Enhanced

This guide will help you set up and run the CitizenNow Enhanced app on your local machine.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Expo CLI** - Install globally: `npm install -g expo-cli`
- **Git** - [Download here](https://git-scm.com/)

### For iOS Development (Mac only)
- **Xcode** - Install from App Store
- **iOS Simulator** - Included with Xcode

### For Android Development
- **Android Studio** - [Download here](https://developer.android.com/studio)
- **Android Emulator** - Configured through Android Studio

---

## 🚀 Quick Start (5 Minutes)

### 1. Navigate to the Project
```bash
cd /Users/a21/CitizenNow-Enhanced
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
cp .env.example .env
```

### 4. Start the Development Server
```bash
npm start
```

This will open Expo Dev Tools in your browser. You can then:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Press `w` to open in web browser
- Scan QR code with Expo Go app on your phone

---

## 🔑 Setting Up API Keys

### Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or use existing project
3. Give it a name (e.g., "CitizenNow Enhanced")
4. Enable Google Analytics (optional)

5. **Add a Web App:**
   - Click "Web" icon (</>)
   - Register app name
   - Copy the config object

6. **Update `.env` file:**
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

7. **Enable Services:**
   - **Authentication**: Enable Email/Password
   - **Firestore**: Create database in test mode
   - **Storage**: Create storage bucket

### Step 2: OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Click "Create new secret key"
5. Copy the key (save it somewhere safe!)
6. Add to `.env`:
```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Important:** Set up billing and usage limits to avoid unexpected charges.

### Step 3: Google Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create a new API key in Google Cloud Project
4. Copy the key
5. Add to `.env`:
```env
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here
```

---

## 📱 Running the App

### Option 1: Expo Go App (Fastest)

1. Install Expo Go on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start the dev server:
```bash
npm start
```

3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

### Option 2: iOS Simulator (Mac only)

```bash
npm run ios
```

This will:
- Build the app
- Launch iOS Simulator
- Install the app
- Open the app

### Option 3: Android Emulator

```bash
npm run android
```

Make sure you have an Android emulator running in Android Studio.

### Option 4: Web Browser

```bash
npm run web
```

Opens in your default browser at http://localhost:19006

---

## 🧪 Testing the App

### Test Basic Functionality

1. **App Loads**
   - You should see "CitizenNow Enhanced" splash screen
   - Lists all features with checkmarks

2. **Data Files Load**
   - Check browser console (web) or Expo logs
   - No errors loading questions/sentences

3. **Navigation Works**
   - Bottom tabs should be visible (once implemented)
   - Can navigate between screens

### Test AI Features (Requires API Keys)

Once you implement the AI screens:

1. **AI Interview**
   - Start a mock interview
   - Verify OpenAI API responds
   - Check conversation flows naturally

2. **Speech Recognition**
   - Record your voice
   - Verify transcription appears
   - Check pronunciation feedback

3. **N-400 Assistant**
   - Ask for term explanation
   - Verify Gemini responds
   - Check translations work

---

## 🐛 Troubleshooting

### Common Issues

#### "Cannot find module" errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

#### "Metro bundler failed to start"
```bash
# Kill existing Metro process
killall node
npm start --reset-cache
```

#### "Expo Dev Tools won't open"
```bash
# Manually open in browser
open http://localhost:19002
```

#### Firebase errors
- Verify API keys in `.env` are correct
- Check Firebase project settings
- Ensure services (Auth, Firestore) are enabled

#### OpenAI API errors
- Verify API key is valid
- Check billing is set up
- Confirm you have credits

### Getting Help

If you're stuck:

1. **Check Expo docs**: https://docs.expo.dev
2. **Firebase docs**: https://firebase.google.com/docs
3. **OpenAI docs**: https://platform.openai.com/docs
4. **Project README**: See README.md for more details
5. **Project Summary**: See PROJECT_SUMMARY.md for architecture

---

## 📂 Understanding the Project Structure

```
CitizenNow-Enhanced/
├── App.tsx                  # Main app entry point - START HERE
├── package.json             # Dependencies and scripts
├── .env                     # Your API keys (DON'T COMMIT THIS!)
├── .env.example             # Template for API keys
│
├── src/
│   ├── data/                # 📊 Test questions and sentences
│   │   ├── civicsQuestions.json
│   │   ├── readingSentences.json
│   │   └── writingSentences.json
│   │
│   ├── services/            # 🔧 API integrations
│   │   ├── firebase.ts      # Firebase config
│   │   ├── llmService.ts    # AI/LLM APIs
│   │   └── spacedRepetitionService.ts
│   │
│   ├── types/               # 📝 TypeScript definitions
│   │   └── index.ts
│   │
│   └── [other folders]      # To be implemented
```

---

## 🎯 Next Steps

Now that you have the app running, here's what to do next:

### For Developers

1. **Explore the Data**
   - Open `src/data/civicsQuestions.json`
   - See how questions are structured
   - Note the categories and metadata

2. **Review Services**
   - Check `src/services/llmService.ts`
   - Understand how AI APIs work
   - Look at `spacedRepetitionService.ts`

3. **Understand Types**
   - Open `src/types/index.ts`
   - See all data models
   - Understand the app's data structure

4. **Start Building Screens**
   - Create `src/screens/HomeScreen.tsx`
   - Build `src/components/QuestionCard.tsx`
   - Implement navigation

### For Non-Developers

1. **Test the UI** (once screens are built)
   - Navigate through all screens
   - Try all features
   - Report bugs or suggestions

2. **Content Review**
   - Verify USCIS questions are accurate
   - Check for typos
   - Suggest improvements

3. **User Experience**
   - Is the app intuitive?
   - Are instructions clear?
   - What's confusing?

---

## 📖 Learning Resources

### New to React Native?
- [React Native Tutorial](https://reactnative.dev/docs/tutorial)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native School (free videos)](https://www.reactnative.school/)

### New to Firebase?
- [Firebase Get Started](https://firebase.google.com/docs/web/setup)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase YouTube Channel](https://www.youtube.com/user/Firebase)

### New to TypeScript?
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript in 5 Minutes](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

---

## ✅ Checklist

Before you start developing, make sure:

- [ ] Node.js and npm are installed
- [ ] Expo CLI is installed globally
- [ ] Project dependencies are installed (`npm install`)
- [ ] `.env` file is created with API keys
- [ ] Firebase project is set up
- [ ] OpenAI API key is obtained and added
- [ ] Gemini API key is obtained and added
- [ ] Dev server starts without errors (`npm start`)
- [ ] App loads on simulator/emulator/web
- [ ] You've read README.md and PROJECT_SUMMARY.md

---

## 🎉 You're Ready!

You now have CitizenNow Enhanced running locally. The foundation is complete:

✅ Project structure
✅ All official USCIS test data
✅ AI/LLM service integrations
✅ Adaptive learning algorithm
✅ Firebase configuration

**What's next?**
- Build the UI screens
- Implement navigation
- Connect services to UI
- Test with real users
- Deploy to app stores

Happy coding! 🚀

---

**Need Help?**
- Check PROJECT_SUMMARY.md for architecture details
- See README.md for full documentation
- Review code comments in source files
