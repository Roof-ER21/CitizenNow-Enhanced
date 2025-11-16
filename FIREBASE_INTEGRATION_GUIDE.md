# Firebase Integration Guide - CitizenNow Enhanced

Complete guide for integrating and using the Firebase hooks and services in CitizenNow Enhanced.

## Quick Start

### 1. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Add your configuration to `.env`:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 2. Firestore Security Rules

Apply these security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // User profiles - only owner can read/write
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User progress - only owner can read/write
    match /user_progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Study sessions - only owner can write, admins can read all
    match /study_sessions/{sessionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      request.resource.data.userId == request.auth.uid;
    }

    // AI sessions - only owner can read/write
    match /ai_sessions/{sessionId} {
      allow read, write: if request.auth != null &&
                            request.resource.data.userId == request.auth.uid;
    }

    // Leaderboard - all authenticated users can read, only system can write
    match /leaderboard/{userId} {
      allow read: if request.auth != null;
      allow write: if false; // Use Cloud Functions to update
    }
  }
}
```

### 3. Firestore Indexes

Create these composite indexes in Firebase Console:

```
Collection: study_sessions
Fields: userId (Ascending), startTime (Descending)

Collection: ai_sessions
Fields: userId (Ascending), sessionType (Ascending), startTime (Descending)

Collection: ai_sessions
Fields: userId (Ascending), startTime (Descending)

Collection: leaderboard
Fields: totalPoints (Descending)
```

---

## File Structure

```
/Users/a21/CitizenNow-Enhanced/
├── src/
│   ├── hooks/
│   │   ├── useAuth.ts                    # Authentication hook
│   │   ├── useUserProgress.ts            # Progress tracking hook
│   │   ├── useQuestions.ts               # Question management hook
│   │   ├── useSpacedRepetition.ts        # Learning algorithm hook
│   │   ├── index.ts                      # Hooks export
│   │   └── README.md                     # Hooks documentation
│   ├── services/
│   │   ├── firebase.ts                   # Firebase initialization
│   │   ├── firestoreService.ts           # Database operations
│   │   └── spacedRepetitionService.ts    # SM-2 algorithm
│   └── types/
│       └── index.ts                      # TypeScript types
```

---

## Implementation Checklist

### Phase 1: Authentication
- [x] Create `useAuth` hook
- [x] Implement signup/login/logout
- [x] Add password reset
- [x] Handle auth state changes
- [ ] Add auth screens (Login, Signup, ForgotPassword)
- [ ] Implement auth context provider
- [ ] Add protected route navigation

### Phase 2: User Progress
- [x] Create `useUserProgress` hook
- [x] Implement progress tracking
- [x] Add batch updates
- [x] Create `firestoreService`
- [ ] Add progress visualization screens
- [ ] Implement badge system UI
- [ ] Add leaderboard screen

### Phase 3: Questions & Study
- [x] Create `useQuestions` hook
- [x] Load questions from JSON
- [x] Add filtering and search
- [ ] Create flashcard screen
- [ ] Create quiz screen
- [ ] Add reading/writing practice screens

### Phase 4: Spaced Repetition
- [x] Create `useSpacedRepetition` hook
- [x] Implement SM-2 algorithm
- [x] Generate study plans
- [ ] Create study dashboard
- [ ] Add daily goals UI
- [ ] Implement notification system

---

## Usage Examples

### Example 1: Authentication Flow

```typescript
// screens/AuthScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { useAuth } from '../hooks';

export default function AuthScreen() {
  const { signUp, login, loading, error, clearError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    clearError();
    try {
      if (isSignUp) {
        await signUp(email, password, name);
        Alert.alert('Success', 'Account created!');
      } else {
        await login(email, password);
        Alert.alert('Success', 'Logged in!');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {isSignUp && (
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={{ marginBottom: 10, borderWidth: 1, padding: 10 }}
        />
      )}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ marginBottom: 10, borderWidth: 1, padding: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 10, borderWidth: 1, padding: 10 }}
      />
      {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}
      <Button
        title={isSignUp ? 'Sign Up' : 'Login'}
        onPress={handleSubmit}
        disabled={loading}
      />
      <Button
        title={isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        onPress={() => setIsSignUp(!isSignUp)}
      />
    </View>
  );
}
```

### Example 2: Quiz with Progress Tracking

```typescript
// screens/QuizScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import {
  useAuth,
  useUserProgress,
  useQuestions,
  useSpacedRepetition,
  convertToSM2Rating,
  createInitialQuestionProgress,
} from '../hooks';

export default function QuizScreen() {
  const { user } = useAuth();
  const { progress, updateQuestionProgress, updateStatistics } = useUserProgress(user?.uid);
  const { getRandomQuestions } = useQuestions();
  const { calculateNextReview } = useSpacedRepetition(progress, 20);

  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Load 10 random questions for quiz
    const questions = getRandomQuestions(10, {
      difficulty: 'medium',
    });
    setQuizQuestions(questions);
  }, []);

  const handleAnswer = async (correct: boolean) => {
    const question = quizQuestions[currentIndex];

    // Get or create progress for this question
    const currentProgress = progress?.questionProgress[question.id] ||
      createInitialQuestionProgress(question.id);

    // Calculate next review using SM-2 algorithm
    const rating = convertToSM2Rating(correct, correct ? 80 : 0);
    const updatedProgress = calculateNextReview(currentProgress, rating);

    // Update question progress
    await updateQuestionProgress(question.id, updatedProgress);

    // Update score
    if (correct) {
      setScore(score + 1);

      // Award points
      await updateStatistics({
        totalPoints: (progress?.totalPoints || 0) + 10,
      });
    }

    // Move to next question
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // Quiz complete
      alert(`Quiz complete! Score: ${score + (correct ? 1 : 0)}/${quizQuestions.length}`);
    }
  };

  if (quizQuestions.length === 0) {
    return <ActivityIndicator />;
  }

  const currentQuestion = quizQuestions[currentIndex];

  return (
    <View style={{ padding: 20 }}>
      <Text>Question {currentIndex + 1} of {quizQuestions.length}</Text>
      <Text>Score: {score}</Text>

      <Text style={{ fontSize: 18, marginVertical: 20 }}>
        {currentQuestion.question}
      </Text>

      {showAnswer && (
        <Text style={{ fontSize: 16, marginBottom: 20 }}>
          Answer: {currentQuestion.answer}
        </Text>
      )}

      {!showAnswer ? (
        <Button title="Show Answer" onPress={() => setShowAnswer(true)} />
      ) : (
        <View>
          <Button title="Correct ✓" onPress={() => handleAnswer(true)} />
          <Button title="Incorrect ✗" onPress={() => handleAnswer(false)} />
        </View>
      )}
    </View>
  );
}
```

### Example 3: Progress Dashboard

```typescript
// screens/ProgressScreen.tsx
import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth, useUserProgress, useSpacedRepetition } from '../hooks';

export default function ProgressScreen() {
  const { user, profile } = useAuth();
  const { progress, loading, calculateOverallStats } = useUserProgress(user?.uid);
  const {
    studyPlan,
    dueQuestions,
    weakCategories,
    predictPassProbability,
  } = useSpacedRepetition(progress, 20);

  if (loading) {
    return <ActivityIndicator />;
  }

  const stats = calculateOverallStats();
  const passChance = predictPassProbability(128);

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Welcome, {profile?.name}!
      </Text>

      {/* Overall Statistics */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
          Overall Progress
        </Text>
        <Text>Level: {progress?.level || 1}</Text>
        <Text>Points: {progress?.totalPoints || 0}</Text>
        <Text>Questions Attempted: {stats.totalAttempted}</Text>
        <Text>Overall Accuracy: {stats.accuracy.toFixed(1)}%</Text>
        <Text>Pass Probability: {passChance.toFixed(1)}%</Text>
        <Text>Study Streak: {progress?.streakDays || 0} days</Text>
      </View>

      {/* Study Plan */}
      {studyPlan && (
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
            Today's Study Plan
          </Text>
          <Text>Due for Review: {studyPlan.dueToday.length}</Text>
          <Text>New Questions: {studyPlan.newQuestions.length}</Text>
          <Text>Weak Area Practice: {studyPlan.weakAreaReview.length}</Text>
          <Text>Total Recommended: {studyPlan.totalRecommended}</Text>
        </View>
      )}

      {/* Weak Areas */}
      {weakCategories.length > 0 && (
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
            Focus Areas
          </Text>
          {weakCategories.map((category) => (
            <Text key={category}>• {category.replace('_', ' ')}</Text>
          ))}
        </View>
      )}

      {/* Category Breakdown */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
          Category Performance
        </Text>
        {Object.entries(progress?.categoryProgress || {}).map(([category, stats]) => (
          <View key={category} style={{ marginBottom: 10 }}>
            <Text>{category.replace('_', ' ')}</Text>
            <Text>Accuracy: {stats.accuracy.toFixed(1)}%</Text>
            <Text>Attempted: {stats.attempted}</Text>
          </View>
        ))}
      </View>

      {/* Badges */}
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
          Badges ({progress?.badges?.length || 0})
        </Text>
        {progress?.badges?.map((badge) => (
          <View key={badge.id} style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>{badge.name}</Text>
            <Text>{badge.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
```

### Example 4: Study Session with Analytics

```typescript
// screens/StudySessionScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import {
  useAuth,
  useUserProgress,
  useSpacedRepetition,
  convertToSM2Rating,
} from '../hooks';
import { firestoreService } from '../services/firestoreService';
import { StudySession } from '../types';

export default function StudySessionScreen() {
  const { user } = useAuth();
  const { progress, updateQuestionProgress } = useUserProgress(user?.uid);
  const { studyPlan, calculateNextReview } = useSpacedRepetition(progress, 20);

  const [session, setSession] = useState<StudySession | null>(null);
  const [questionsStudied, setQuestionsStudied] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    // Start new session
    const newSession: StudySession = {
      id: `session_${Date.now()}`,
      userId: user?.uid || '',
      startTime: new Date(),
      sessionType: 'flashcards',
      questionsStudied: [],
      correctAnswers: 0,
      totalQuestions: 0,
      accuracy: 0,
      durationMinutes: 0,
    };
    setSession(newSession);
  }, [user?.uid]);

  const handleAnswer = async (questionId: string, correct: boolean) => {
    if (!progress || !session) return;

    // Update question progress
    const currentProgress = progress.questionProgress[questionId];
    const rating = convertToSM2Rating(correct, correct ? 80 : 0);
    const updatedProgress = calculateNextReview(currentProgress, rating);
    await updateQuestionProgress(questionId, updatedProgress);

    // Track session stats
    setQuestionsStudied([...questionsStudied, questionId]);
    if (correct) setCorrectCount(correctCount + 1);
  };

  const endSession = async () => {
    if (!session) return;

    const endTime = new Date();
    const durationMinutes = (endTime.getTime() - session.startTime.getTime()) / 60000;

    const finalSession: StudySession = {
      ...session,
      endTime,
      questionsStudied,
      correctAnswers: correctCount,
      totalQuestions: questionsStudied.length,
      accuracy: questionsStudied.length > 0
        ? (correctCount / questionsStudied.length) * 100
        : 0,
      durationMinutes: Math.round(durationMinutes),
    };

    // Save session to Firestore
    await firestoreService.saveStudySession(finalSession);

    // Update total study time
    await firestoreService.updateUserStatistics(user?.uid || '', {
      totalStudyMinutes: (progress?.totalStudyMinutes || 0) + finalSession.durationMinutes,
    });

    alert(`Session complete!\nAccuracy: ${finalSession.accuracy.toFixed(1)}%`);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Session Duration: {session ? Math.round((Date.now() - session.startTime.getTime()) / 60000) : 0} min</Text>
      <Text>Questions Studied: {questionsStudied.length}</Text>
      <Text>Correct: {correctCount}</Text>

      <Button title="End Session" onPress={endSession} />
    </View>
  );
}
```

---

## Best Practices

### 1. Error Handling
Always handle errors gracefully:

```typescript
try {
  await updateQuestionProgress(questionId, progress);
} catch (error) {
  console.error('Failed to update progress:', error);
  Alert.alert('Error', 'Failed to save progress. Please try again.');
}
```

### 2. Loading States
Always show loading indicators:

```typescript
if (loading) {
  return <ActivityIndicator size="large" />;
}
```

### 3. Optimistic Updates
useUserProgress updates local state immediately for responsive UI.

### 4. Batch Operations
Use batch updates when updating multiple questions:

```typescript
const updates = {
  'question1': updatedProgress1,
  'question2': updatedProgress2,
  'question3': updatedProgress3,
};
await batchUpdateProgress(updates);
```

### 5. Offline Handling
Implement offline detection and queue operations:

```typescript
import NetInfo from '@react-native-community/netinfo';

const [isOnline, setIsOnline] = useState(true);

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsOnline(state.isConnected || false);
  });
  return () => unsubscribe();
}, []);
```

---

## Performance Optimization

### 1. Memoization
Hooks already use useMemo and useCallback internally.

### 2. Lazy Loading
Load questions only when needed:

```typescript
const { getRandomQuestions } = useQuestions();
// Questions are loaded once and cached
```

### 3. Firestore Caching
Firestore caches reads for 60 seconds by default.

### 4. Batch Writes
Reduce write operations by batching:

```typescript
await firestoreService.batchUpdateQuestionProgress(userId, updates);
```

---

## Troubleshooting

### Issue: "Permission denied" errors

**Solution:** Check Firestore security rules. Ensure user is authenticated and rules allow access.

### Issue: Questions not loading

**Solution:** Verify JSON files exist in `/src/data/` directory.

### Issue: Progress not syncing

**Solution:** Check network connection. Verify Firebase config is correct.

### Issue: Slow performance

**Solution:** Implement pagination for large datasets. Use batch operations.

---

## Next Steps

1. Implement UI screens using the hooks
2. Add offline support with local storage
3. Implement push notifications for study reminders
4. Add analytics tracking
5. Create admin dashboard
6. Implement social features

---

**Need Help?** Check the hook documentation in `/src/hooks/README.md`
