# Firebase Setup Guide for CitizenNow Enhanced

Complete step-by-step guide for setting up Firebase for production deployment.

---

## Table of Contents

1. [Creating Firebase Project](#1-creating-firebase-project)
2. [Configuring Authentication](#2-configuring-authentication)
3. [Setting Up Firestore Database](#3-setting-up-firestore-database)
4. [Configuring Storage](#4-configuring-storage)
5. [Security Rules](#5-security-rules)
6. [Environment Configuration](#6-environment-configuration)
7. [Cost Optimization](#7-cost-optimization)
8. [Monitoring & Analytics](#8-monitoring--analytics)
9. [Backup & Disaster Recovery](#9-backup--disaster-recovery)

---

## 1. Creating Firebase Project

### Step 1.1: Create Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project details:
   - **Project name:** `CitizenNow-Production`
   - **Project ID:** Will be auto-generated (note this down)
4. **Google Analytics:** Enable (recommended)
   - Select or create Analytics account
   - Choose location (United States recommended)
5. Click **"Create project"**
6. Wait for project creation (30-60 seconds)

### Step 1.2: Register Apps

#### For Web App

1. In Firebase Console, click **"Web"** icon (`</>`)
2. Register app:
   - **App nickname:** `CitizenNow Web`
   - **Firebase Hosting:** Check this if deploying web version
3. Click **"Register app"**
4. **Copy Firebase configuration** - you'll need this!

```javascript
// Save this configuration - you'll add it to .env.production
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "citizennow-production.firebaseapp.com",
  projectId: "citizennow-production",
  storageBucket: "citizennow-production.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

#### For iOS App

1. Click **"iOS"** icon
2. Enter iOS bundle ID: `com.citizennow.app`
3. **App nickname:** `CitizenNow iOS`
4. **App Store ID:** (leave blank for now, add after submission)
5. Download `GoogleService-Info.plist`
6. Click **"Continue"** through SDK setup (EAS Build handles this)

#### For Android App

1. Click **"Android"** icon
2. Enter Android package name: `com.citizennow.app`
3. **App nickname:** `CitizenNow Android`
4. Download `google-services.json`
5. Click **"Continue"** through SDK setup (EAS Build handles this)

### Step 1.3: Optional - Create Staging Project

Repeat above steps for staging:
- **Project name:** `CitizenNow-Staging`
- Use different bundle IDs:
  - iOS: `com.citizennow.staging`
  - Android: `com.citizennow.staging`

---

## 2. Configuring Authentication

### Step 2.1: Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click **"Get started"**

### Step 2.2: Enable Sign-in Methods

#### Email/Password Authentication

1. Click **"Sign-in method"** tab
2. Click **"Email/Password"**
3. Enable **"Email/Password"**
4. **Email link (passwordless):** Optional, can enable later
5. Click **"Save"**

#### Optional: Additional Sign-in Methods

For future enhancements:

**Google Sign-In:**
1. Click **"Google"**
2. Enable
3. Enter support email
4. Click **"Save"**

**Apple Sign-In (Required for iOS if using social login):**
1. Click **"Apple"**
2. Enable
3. Configure Apple Developer account
4. Add Service ID and Team ID

**Facebook, GitHub, etc.:**
- Configure as needed based on requirements

### Step 2.3: Configure Settings

1. Go to **Settings** tab
2. **Authorized domains:**
   - Add your production domain (e.g., `citizennow.com`)
   - `localhost` should already be there for testing
3. **User account management:**
   - Email verification: Recommended to enable
   - Password reset: Automatically enabled
4. Customize email templates:
   - Go to **Templates** tab
   - Edit "Email verification" template
   - Edit "Password reset" template
   - Customize with your branding

---

## 3. Setting Up Firestore Database

### Step 3.1: Create Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **Production mode** (we'll add security rules next)
4. Select **location** (choose closest to your users):
   - `us-central` (Iowa)
   - `us-east1` (South Carolina)
   - `us-west1` (Oregon)
   - `europe-west1` (Belgium)
   - `asia-northeast1` (Tokyo)
   - **Note:** Location cannot be changed after creation!
5. Click **"Enable"**

### Step 3.2: Create Collections Structure

Create these collections (manually or via app):

```
users/
  {userId}/
    - email: string
    - displayName: string
    - createdAt: timestamp
    - lastLoginAt: timestamp
    - studyProgress: object
    - preferences: object

study-progress/
  {userId}/
    - completedModules: array
    - currentModule: string
    - score: number
    - lastStudyDate: timestamp
    - totalStudyTime: number

practice-tests/
  {testId}/
    - userId: string
    - score: number
    - answers: array
    - completedAt: timestamp
    - timeSpent: number

ai-conversations/
  {conversationId}/
    - userId: string
    - messages: array
    - topic: string
    - createdAt: timestamp
    - updatedAt: timestamp

flashcards/
  {cardId}/
    - userId: string
    - question: string
    - answer: string
    - category: string
    - difficulty: string
    - lastReviewed: timestamp
    - reviewCount: number
```

### Step 3.3: Create Indexes

For better query performance:

1. Go to **Indexes** tab
2. Create composite indexes as needed:

```
Collection: study-progress
Fields: userId (Ascending), lastStudyDate (Descending)

Collection: practice-tests
Fields: userId (Ascending), completedAt (Descending)

Collection: ai-conversations
Fields: userId (Ascending), createdAt (Descending)
```

Firebase will also prompt you to create indexes when needed during app usage.

---

## 4. Configuring Storage

### Step 4.1: Enable Storage

1. Go to **Build → Storage**
2. Click **"Get started"**
3. Start in **Production mode**
4. Select **location** (same as Firestore)
5. Click **"Done"**

### Step 4.2: Create Folder Structure

Create folders for organized storage:

```
users/
  {userId}/
    profile-photos/
    documents/
    notes/

study-materials/
  civics/
  history/
  government/

user-uploads/
  {userId}/
    images/
    audio/
```

---

## 5. Security Rules

### Step 5.1: Firestore Security Rules

1. Go to **Firestore Database → Rules**
2. Replace default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      // Users can read and write their own data
      allow read, write: if isOwner(userId);

      // Allow creation during sign up
      allow create: if isAuthenticated() && request.auth.uid == userId;
    }

    // Study progress
    match /study-progress/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Practice tests
    match /practice-tests/{testId} {
      // Users can read their own tests
      allow read: if isAuthenticated() &&
                     resource.data.userId == request.auth.uid;

      // Users can create tests for themselves
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid;

      // Users can update/delete their own tests
      allow update, delete: if isAuthenticated() &&
                               resource.data.userId == request.auth.uid;
    }

    // AI conversations
    match /ai-conversations/{conversationId} {
      allow read: if isAuthenticated() &&
                     resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() &&
                               resource.data.userId == request.auth.uid;
    }

    // Flashcards
    match /flashcards/{cardId} {
      allow read: if isAuthenticated() &&
                     resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() &&
                               resource.data.userId == request.auth.uid;
    }

    // Shared study materials (read-only for all authenticated users)
    match /study-materials/{materialId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only admins can write (add via console or cloud functions)
    }
  }
}
```

3. Click **"Publish"**
4. **Test rules** using the Rules Playground

### Step 5.2: Storage Security Rules

1. Go to **Storage → Rules**
2. Replace default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper function
    function isAuthenticated() {
      return request.auth != null;
    }

    // User profile photos
    match /users/{userId}/profile-photos/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }

    // User documents
    match /users/{userId}/documents/{fileName} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }

    // User notes
    match /users/{userId}/notes/{fileName} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }

    // User uploads with size limit (10MB)
    match /user-uploads/{userId}/{allPaths=**} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated() &&
                      request.auth.uid == userId &&
                      request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }

    // Study materials (public read)
    match /study-materials/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if false; // Only via console or admin
    }
  }
}
```

3. Click **"Publish"**

---

## 6. Environment Configuration

### Step 6.1: Copy Firebase Configuration

From Firebase Console, copy your configuration values to `.env.production`:

```bash
# Firebase Configuration (from Firebase Console)
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=citizennow-production.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=citizennow-production
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=citizennow-production.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 6.2: Validate Configuration

```bash
node env-validator.js production
```

Should show all Firebase variables as ✅

---

## 7. Cost Optimization

### Step 7.1: Understanding Firebase Pricing

Firebase has a **generous free tier** (Spark Plan):

**Firestore:**
- 50,000 document reads/day
- 20,000 document writes/day
- 20,000 document deletes/day
- 1 GB storage

**Storage:**
- 5 GB storage
- 1 GB/day download
- 20,000 uploads/day

**Authentication:**
- Unlimited users (free)

**Hosting:**
- 10 GB storage
- 360 MB/day bandwidth

### Step 7.2: Set Budget Alerts

1. Go to **Project Settings → Usage and billing**
2. Click **"Set budget alert"**
3. Recommended alerts:
   - Alert at **50% of expected monthly cost**
   - Alert at **90% of expected monthly cost**
   - Alert at **100% of expected monthly cost**

### Step 7.3: Optimize Queries

**Best Practices:**

1. **Use pagination** - Don't load all documents at once
   ```javascript
   // Good
   const first = query(collection(db, "tests"), limit(25));

   // Bad
   const all = getDocs(collection(db, "tests"));
   ```

2. **Use where clauses** - Reduce documents read
   ```javascript
   const q = query(
     collection(db, "tests"),
     where("userId", "==", uid),
     limit(10)
   );
   ```

3. **Cache data locally** - Use AsyncStorage
   ```javascript
   // Cache frequently accessed data
   await AsyncStorage.setItem('userData', JSON.stringify(data));
   ```

4. **Batch operations** - Group writes
   ```javascript
   const batch = writeBatch(db);
   batch.set(doc1Ref, data1);
   batch.set(doc2Ref, data2);
   await batch.commit(); // 1 write instead of 2
   ```

### Step 7.4: Monitor Usage

1. Go to **Usage** tab
2. Monitor daily:
   - Document reads/writes
   - Storage usage
   - Bandwidth usage
3. Set up weekly email reports

---

## 8. Monitoring & Analytics

### Step 8.1: Enable Firebase Analytics

Already enabled during project creation. To verify:

1. Go to **Analytics → Dashboard**
2. Should see basic events after app launch

### Step 8.2: Enable Crashlytics

1. Go to **Release & Monitor → Crashlytics**
2. Click **"Enable Crashlytics"**
3. Follow integration instructions (handled by EAS Build)

### Step 8.3: Enable Performance Monitoring

1. Go to **Release & Monitor → Performance**
2. Click **"Get started"**
3. Will automatically track:
   - App startup time
   - Screen rendering
   - Network requests

### Step 8.4: Custom Events

Track important user actions:

```javascript
import { logEvent } from 'firebase/analytics';

// Track study session start
logEvent(analytics, 'study_session_start', {
  module: 'civics_101'
});

// Track test completion
logEvent(analytics, 'test_completed', {
  score: 85,
  testType: 'practice'
});
```

---

## 9. Backup & Disaster Recovery

### Step 9.1: Enable Backups

Unfortunately, Firestore doesn't have automatic backups in free tier.

**Manual Backup Options:**

1. **Export via Console:**
   - Use `gcloud firestore export` (requires Cloud SDK)

2. **Automated Exports (Blaze Plan required):**
   ```bash
   gcloud firestore export gs://[BUCKET_NAME]
   ```

### Step 9.2: Data Export Script

Create a backup script (requires Blaze plan):

```javascript
// backup-firestore.js
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function backupCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const data = {};

  snapshot.forEach(doc => {
    data[doc.id] = doc.data();
  });

  require('fs').writeFileSync(
    `./backups/${collectionName}-${Date.now()}.json`,
    JSON.stringify(data, null, 2)
  );

  console.log(`Backed up ${collectionName}`);
}

// Run backups
['users', 'study-progress', 'practice-tests'].forEach(backupCollection);
```

### Step 9.3: Disaster Recovery Plan

1. **Data Loss Prevention:**
   - Implement soft deletes (mark as deleted instead of removing)
   - Log all destructive operations
   - Require confirmation for deletions

2. **Recovery Procedures:**
   - Keep latest backup locally
   - Document restore procedure
   - Test restore process regularly

---

## Firebase Setup Verification Checklist

- [ ] Firebase project created
- [ ] Web app registered
- [ ] iOS app registered (if building iOS)
- [ ] Android app registered (if building Android)
- [ ] Authentication enabled
- [ ] Email/Password sign-in enabled
- [ ] Firestore database created
- [ ] Firestore location selected
- [ ] Storage enabled
- [ ] Security rules deployed (Firestore)
- [ ] Security rules deployed (Storage)
- [ ] Environment variables configured
- [ ] Configuration validated
- [ ] Budget alerts set
- [ ] Analytics enabled
- [ ] Crashlytics enabled
- [ ] Performance monitoring enabled

---

## Common Issues & Solutions

### Issue: "Permission denied" errors

**Solution:** Check security rules, ensure user is authenticated

### Issue: High costs

**Solution:**
- Review query patterns
- Implement caching
- Use pagination
- Check for infinite loops

### Issue: Slow queries

**Solution:**
- Create indexes
- Limit result sets
- Use where clauses effectively

### Issue: Storage full

**Solution:**
- Implement image compression
- Set file size limits
- Clean up unused files

---

## Additional Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **Pricing Calculator:** https://firebase.google.com/pricing
- **Status Dashboard:** https://status.firebase.google.com
- **Stack Overflow:** https://stackoverflow.com/questions/tagged/firebase
- **Firebase YouTube Channel:** https://www.youtube.com/firebase

---

## Support

For Firebase-specific issues:
- **Console:** https://console.firebase.google.com
- **Support:** https://firebase.google.com/support
- **Community:** https://firebase.google.com/community

---

**Last Updated:** 2025-11-15
**Version:** 1.0.0
