# Firebase Setup Guide for CitizenNow Enhanced

This guide will help you set up Firebase for authentication, Firestore database, and Cloud Functions.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `CitizenNow-Enhanced`
4. (Optional) Enable Google Analytics
5. Click "Create project"

## Step 2: Register Your Apps

### For Web App:
1. In Project Overview, click the Web icon (`</>`)
2. Register app with nickname: `CitizenNow Web`
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object (you'll need this for `.env`)

### For iOS App:
1. Click the iOS icon
2. iOS bundle ID: `com.citizennow.app` (or your custom ID from app.config.js)
3. Download `GoogleService-Info.plist`
4. Place it in the project root (already .gitignored)

### For Android App:
1. Click the Android icon
2. Android package name: `com.citizennow.app` (or your custom ID from app.config.js)
3. Download `google-services.json`
4. Place it in the project root (already .gitignored)

## Step 3: Enable Firebase Authentication

1. In Firebase Console, go to **Authentication** in left sidebar
2. Click "Get started"
3. Click on "Sign-in method" tab
4. Enable these providers:
   - **Email/Password**: Click → Enable → Save
   - **Google**: Click → Enable → Add support email → Save

### Configure Google Sign-In:
- For **Web**: No additional setup needed
- For **iOS**: Download new `GoogleService-Info.plist` after enabling
- For **Android**: Download new `google-services.json` after enabling

## Step 4: Set Up Firestore Database

1. Go to **Firestore Database** in left sidebar
2. Click "Create database"
3. Choose **"Start in production mode"** (we'll add rules later)
4. Select a location (choose closest to your users, e.g., `us-central`)
5. Click "Enable"

### Initial Firestore Structure:
The app will create these collections automatically:
- `users/` - User profiles and metadata
- `progress/` - User study progress and stats
- `sessions/` - Study session history
- `achievements/` - Badges and milestones

## Step 5: Configure Firestore Security Rules

1. Go to Firestore → **Rules** tab
2. Replace default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuth() {
      return request.auth != null;
    }

    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuth() && request.auth.uid == userId;
    }

    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Progress collection - users can only access their own progress
    match /progress/{userId} {
      allow read, write: if isOwner(userId);

      // Sub-collections under progress
      match /{document=**} {
        allow read, write: if isOwner(userId);
      }
    }

    // Sessions collection - users can only access their own sessions
    match /sessions/{sessionId} {
      allow read, write: if isAuth() && resource.data.userId == request.auth.uid;
      allow create: if isAuth() && request.resource.data.userId == request.auth.uid;
    }

    // Achievements collection - users can only access their own achievements
    match /achievements/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Public read-only collections (if needed in future)
    match /leaderboard/{entry} {
      allow read: if isAuth();
      allow write: if false; // Only Cloud Functions can write
    }
  }
}
```

3. Click "Publish"

## Step 6: Update .env File

Copy your Firebase config and add to `.env`:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Note**: These values are safe to expose in a client app (they identify your Firebase project, not authenticate requests - security comes from Firestore rules).

## Step 7: Enable Firebase Storage (Optional)

If you want users to upload profile pictures or N-400 documents:

1. Go to **Storage** in left sidebar
2. Click "Get started"
3. Choose "Start in production mode"
4. Click "Done"

### Storage Security Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 8: Set Up Cloud Functions (Phase 3)

This will be covered in Sprint 3, but here's the prep:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize Functions: `firebase init functions`
   - Select your project
   - Choose TypeScript
   - Install dependencies

## Step 9: Test the Connection

After updating `.env`, restart your Expo app:

```bash
# Kill existing server
lsof -ti:8081 | xargs kill -9

# Restart
npm start
```

The app should now connect to Firebase! Check:
1. No Firebase errors in console
2. Firebase Analytics events appearing in console (after ~24 hours)

## Step 10: Configure Email Templates (Optional)

Customize authentication emails:

1. Go to **Authentication** → **Templates** tab
2. Edit templates for:
   - Email verification
   - Password reset
   - Email address change

Add your app name and customize the message.

---

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Double-check all EXPO_PUBLIC_FIREBASE_* values in `.env`
- Ensure you restarted the Expo server after editing `.env`

### "Firebase: Error (auth/unauthorized-domain)"
- Go to Authentication → Settings → Authorized domains
- Add `localhost` for development
- Add your production domain when deploying

### Google Sign-In not working on iOS
- Ensure `GoogleService-Info.plist` is in project root
- Run `npx expo prebuild` to regenerate native projects
- Check `CLIENT_ID` in the plist file

### Google Sign-In not working on Android
- Ensure `google-services.json` is in project root
- Get SHA-1 certificate fingerprint: `keytool -list -v -keystore ~/.android/debug.keystore`
- Add SHA-1 to Firebase Console → Project Settings → Your apps → Android app

---

## Next Steps

Once Firebase is set up:
1. ✅ Authentication screens will connect to Firebase Auth
2. ✅ User progress will sync to Firestore
3. ✅ Cloud Functions will proxy AI API calls
4. ✅ Analytics will track user behavior

For detailed implementation, see:
- `src/screens/auth/` - Authentication screens
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/services/firebase.ts` - Firebase initialization
- `src/services/firestoreService.ts` - Database operations
