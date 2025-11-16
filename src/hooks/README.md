# CitizenNow Enhanced - Custom Hooks Documentation

This directory contains custom React hooks that provide Firebase integration and business logic for the CitizenNow Enhanced application.

## Table of Contents

1. [useAuth](#useauth)
2. [useUserProgress](#useuserprogress)
3. [useQuestions](#usequestions)
4. [useSpacedRepetition](#usespacedrepetition)
5. [Example Usage](#example-usage)

---

## useAuth

**File:** `useAuth.ts`

Manages user authentication using Firebase Auth.

### Features

- User signup with email/password
- User login
- Logout
- Password reset
- Profile management
- Automatic auth state synchronization

### API

```typescript
const {
  user,              // Firebase User object or null
  profile,           // UserProfile from Firestore or null
  loading,           // Loading state
  error,             // Error message or null
  signUp,            // Sign up function
  login,             // Login function
  logout,            // Logout function
  resetPassword,     // Send password reset email
  updateUserProfile, // Update user profile
  refreshProfile,    // Manually refresh profile
  clearError,        // Clear error message
} = useAuth();
```

### Example

```typescript
import { useAuth } from '../hooks';

function LoginScreen() {
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      // Navigate to home screen
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <View>
      {loading && <ActivityIndicator />}
      {error && <Text>{error}</Text>}
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
```

---

## useUserProgress

**File:** `useUserProgress.ts`

Tracks and manages user progress including question attempts, statistics, badges, and achievements.

### Features

- Load user progress from Firestore
- Update question progress (single or batch)
- Add badges
- Update statistics (points, level, streak)
- Real-time synchronization
- Optimistic UI updates
- Calculate overall statistics

### API

```typescript
const {
  progress,              // UserProgress object or null
  loading,               // Loading state
  error,                 // Error message or null
  updateQuestionProgress,// Update single question
  batchUpdateProgress,   // Batch update multiple questions
  addBadge,              // Add a new badge
  updateStatistics,      // Update user stats
  refreshProgress,       // Manually refresh from DB
  getQuestionProgress,   // Get progress for specific question
  getCategoryStatistics, // Get stats for category
  calculateOverallStats, // Calculate overall statistics
} = useUserProgress(userId, autoSync);
```

### Example

```typescript
import { useUserProgress } from '../hooks';

function QuizScreen() {
  const { user } = useAuth();
  const {
    progress,
    updateQuestionProgress,
    calculateOverallStats
  } = useUserProgress(user?.uid);

  const handleAnswer = async (questionId: string, correct: boolean) => {
    const currentProgress = progress?.questionProgress[questionId] || {
      questionId,
      totalAttempts: 0,
      correctAttempts: 0,
      lastAttemptDate: new Date(),
      lastAnswerCorrect: false,
      nextReviewDate: new Date(),
      difficultyLevel: 2.5,
      consecutiveCorrect: 0,
    };

    const updatedProgress = {
      ...currentProgress,
      totalAttempts: currentProgress.totalAttempts + 1,
      correctAttempts: currentProgress.correctAttempts + (correct ? 1 : 0),
      lastAttemptDate: new Date(),
      lastAnswerCorrect: correct,
      consecutiveCorrect: correct ? currentProgress.consecutiveCorrect + 1 : 0,
    };

    await updateQuestionProgress(questionId, updatedProgress);
  };

  const stats = calculateOverallStats();

  return (
    <View>
      <Text>Accuracy: {stats.accuracy.toFixed(1)}%</Text>
      <Text>Questions Attempted: {stats.totalAttempted}</Text>
    </View>
  );
}
```

---

## useQuestions

**File:** `useQuestions.ts`

Manages civics questions, reading sentences, and writing sentences from JSON data files.

### Features

- Load questions from JSON
- Filter by category or difficulty
- Get random questions
- Search questions
- Special 65+ question set
- Category statistics

### API

#### useQuestions (Civics Questions)

```typescript
const {
  questions,             // All civics questions
  loading,               // Loading state
  error,                 // Error message
  getQuestionById,       // Get question by ID
  getQuestionsByCategory,// Filter by category
  getQuestionsByDifficulty, // Filter by difficulty
  getRandomQuestions,    // Get random questions with filters
  get65PlusQuestions,    // Get 65+ special questions
  searchQuestions,       // Search by text
  totalCount,            // Total question count
  categoryCounts,        // Questions per category
} = useQuestions();
```

#### useReadingSentences

```typescript
const {
  sentences,             // All reading sentences
  loading,
  error,
  getSentenceById,
  getSentencesByCategory,
  getRandomSentences,
  totalCount,
} = useReadingSentences();
```

#### useWritingSentences

```typescript
const {
  sentences,             // All writing sentences
  loading,
  error,
  getSentenceById,
  getSentencesByCategory,
  getRandomSentences,
  totalCount,
} = useWritingSentences();
```

### Example

```typescript
import { useQuestions } from '../hooks';

function QuizSetupScreen() {
  const {
    questions,
    getRandomQuestions,
    getQuestionsByCategory,
    categoryCounts
  } = useQuestions();

  // Get 10 random history questions
  const historyQuiz = getRandomQuestions(10, {
    category: 'american_history',
    difficulty: 'medium',
    excludeIds: ['q1', 'q2'], // Already answered
  });

  // Display category breakdown
  return (
    <View>
      <Text>Total Questions: {questions.length}</Text>
      <Text>History: {categoryCounts.american_history}</Text>
      <Text>Government: {categoryCounts.american_government}</Text>
    </View>
  );
}
```

---

## useSpacedRepetition

**File:** `useSpacedRepetition.ts`

Implements spaced repetition learning algorithm (SM-2) for optimal retention and study planning.

### Features

- SM-2 algorithm implementation
- Personalized study plans
- Due question calculation
- Weak area identification
- Pass probability prediction
- Retention rate tracking
- Priority-based question ordering

### API

```typescript
const {
  studyPlan,             // Daily study plan
  dueQuestions,          // Questions due today
  weakCategories,        // Categories needing review
  loading,               // Loading state
  calculateNextReview,   // Calculate next review date
  getDueQuestions,       // Get all due questions
  generateStudyPlan,     // Generate custom study plan
  getPrioritizedQuestions, // Get prioritized question list
  calculateRetentionRate, // Calculate retention %
  predictPassProbability, // Predict test pass probability
  refreshStudyPlan,      // Manually refresh plan
} = useSpacedRepetition(userProgress, dailyGoal);
```

### Helper Functions

```typescript
// Convert answer to SM-2 rating (0-5)
const rating = convertToSM2Rating(correct, confidence);

// Create initial question progress
const initialProgress = createInitialQuestionProgress(questionId);

// Calculate study streak
const streak = calculateStudyStreak(studyDates);

// Estimate days to mastery
const days = estimateTimeToMastery(progress);
```

### Example

```typescript
import { useSpacedRepetition, convertToSM2Rating } from '../hooks';

function StudyScreen() {
  const { progress } = useUserProgress(user?.uid);
  const {
    studyPlan,
    dueQuestions,
    weakCategories,
    calculateNextReview,
    predictPassProbability
  } = useSpacedRepetition(progress, 20);

  const handleAnswer = async (questionId: string, correct: boolean, confidence: number) => {
    const currentProgress = progress?.questionProgress[questionId];

    // Convert to SM-2 rating (0-5)
    const rating = convertToSM2Rating(correct, confidence);

    // Calculate next review schedule
    const updatedProgress = calculateNextReview(currentProgress, rating);

    // Save to database
    await updateQuestionProgress(questionId, updatedProgress);
  };

  const passChance = predictPassProbability(128);

  return (
    <View>
      <Text>Due Today: {dueQuestions.length}</Text>
      <Text>Pass Probability: {passChance.toFixed(1)}%</Text>
      {studyPlan && (
        <>
          <Text>Recommended Study:</Text>
          <Text>- Review: {studyPlan.dueToday.length}</Text>
          <Text>- New: {studyPlan.newQuestions.length}</Text>
          <Text>- Weak Areas: {studyPlan.weakAreaReview.length}</Text>
        </>
      )}
      {weakCategories.length > 0 && (
        <Text>Focus on: {weakCategories.join(', ')}</Text>
      )}
    </View>
  );
}
```

---

## Complete Integration Example

Here's a complete example showing how to use all hooks together:

```typescript
import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import {
  useAuth,
  useUserProgress,
  useQuestions,
  useSpacedRepetition,
  convertToSM2Rating,
} from '../hooks';

function StudyFlowScreen() {
  const { user, profile, loading: authLoading } = useAuth();
  const {
    progress,
    loading: progressLoading,
    updateQuestionProgress,
    updateStatistics,
    addBadge,
  } = useUserProgress(user?.uid);
  const {
    getRandomQuestions,
    getQuestionById,
  } = useQuestions();
  const {
    studyPlan,
    calculateNextReview,
    predictPassProbability,
  } = useSpacedRepetition(progress, 20);

  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const startStudySession = () => {
    if (!studyPlan) return;

    // Get first due question or new question
    const questionId = studyPlan.dueToday[0] || studyPlan.newQuestions[0];
    setCurrentQuestionId(questionId);
    setShowAnswer(false);
  };

  const handleAnswer = async (correct: boolean, confidence: number = 80) => {
    if (!currentQuestionId || !progress) return;

    const currentProgress = progress.questionProgress[currentQuestionId] || {
      questionId: currentQuestionId,
      totalAttempts: 0,
      correctAttempts: 0,
      lastAttemptDate: new Date(),
      lastAnswerCorrect: false,
      nextReviewDate: new Date(),
      difficultyLevel: 2.5,
      consecutiveCorrect: 0,
    };

    // Calculate next review using SM-2
    const rating = convertToSM2Rating(correct, confidence);
    const updatedProgress = calculateNextReview(currentProgress, rating);

    // Update question progress
    await updateQuestionProgress(currentQuestionId, updatedProgress);

    // Award points
    const points = correct ? 10 : 5;
    await updateStatistics({
      totalPoints: (progress.totalPoints || 0) + points,
    });

    // Check for badge achievements
    if (progress.totalQuestionsAttempted === 10) {
      await addBadge({
        id: 'first_10',
        name: 'Getting Started',
        description: 'Answered 10 questions',
        iconUrl: 'badge_10.png',
        earnedAt: new Date(),
        type: 'milestone',
      });
    }

    // Move to next question
    setCurrentQuestionId(null);
  };

  if (authLoading || progressLoading) {
    return <ActivityIndicator />;
  }

  if (!user) {
    return <Text>Please log in</Text>;
  }

  const currentQuestion = currentQuestionId ? getQuestionById(currentQuestionId) : null;
  const passChance = predictPassProbability(128);

  return (
    <View>
      <Text>Welcome, {profile?.name}!</Text>
      <Text>Pass Probability: {passChance.toFixed(1)}%</Text>
      <Text>Points: {progress?.totalPoints || 0}</Text>
      <Text>Level: {progress?.level || 1}</Text>

      {studyPlan && (
        <View>
          <Text>Today's Plan:</Text>
          <Text>Due: {studyPlan.dueToday.length}</Text>
          <Text>New: {studyPlan.newQuestions.length}</Text>
          <Text>Review: {studyPlan.weakAreaReview.length}</Text>
        </View>
      )}

      {currentQuestion ? (
        <View>
          <Text>{currentQuestion.question}</Text>
          {showAnswer && <Text>Answer: {currentQuestion.answer}</Text>}

          {!showAnswer ? (
            <Button title="Show Answer" onPress={() => setShowAnswer(true)} />
          ) : (
            <View>
              <Button
                title="I knew it! (100%)"
                onPress={() => handleAnswer(true, 100)}
              />
              <Button
                title="Got it (80%)"
                onPress={() => handleAnswer(true, 80)}
              />
              <Button
                title="Struggled (60%)"
                onPress={() => handleAnswer(true, 60)}
              />
              <Button
                title="Wrong"
                onPress={() => handleAnswer(false, 0)}
              />
            </View>
          )}
        </View>
      ) : (
        <Button title="Start Study Session" onPress={startStudySession} />
      )}
    </View>
  );
}

export default StudyFlowScreen;
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      React Components                        │
│         (Screens, UI Components, Navigation)                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      Custom Hooks                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   useAuth   │  │ useProgress │  │ useQuestions│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────────────────────────────────────────┐       │
│  │         useSpacedRepetition                      │       │
│  └─────────────────────────────────────────────────┘       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                        Services                              │
│  ┌──────────────────┐  ┌──────────────────────────┐        │
│  │ firestoreService │  │ spacedRepetitionService  │        │
│  └──────────────────┘  └──────────────────────────┘        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Services                         │
│     (Auth, Firestore, Functions, Storage)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Best Practices

1. **Always handle loading states** - All hooks provide a `loading` boolean
2. **Handle errors gracefully** - Display error messages to users
3. **Use optimistic updates** - useUserProgress updates local state immediately
4. **Batch operations when possible** - Use `batchUpdateProgress` for multiple updates
5. **Implement retry logic** - Firebase operations can fail, implement retry mechanisms
6. **Monitor performance** - Track Firestore read/write counts
7. **Use memoization** - Hooks use `useMemo` and `useCallback` to prevent unnecessary re-renders

---

## Testing

```typescript
// Mock Firebase services for testing
jest.mock('../services/firebase', () => ({
  auth: {},
  db: {},
  functions: {},
  storage: {},
}));

// Test component using hooks
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../hooks';

test('useAuth should login user', async () => {
  const { result } = renderHook(() => useAuth());

  await act(async () => {
    await result.current.login('test@example.com', 'password');
  });

  expect(result.current.user).toBeTruthy();
  expect(result.current.error).toBeNull();
});
```

---

## Performance Considerations

- **Firestore reads are cached** for 60 seconds by default
- **Optimistic updates** reduce perceived latency
- **Batch operations** reduce database round trips
- **Lazy loading** - Questions loaded once, cached in memory
- **Debouncing** - Consider debouncing rapid progress updates

---

## Security

- All Firestore operations use security rules
- User data is scoped by user ID
- Sensitive data (N-400) should be encrypted
- Authentication required for all operations
- Leaderboard data is anonymized

---

## Future Enhancements

- [ ] Offline support with local caching
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Social features (friend challenges)
- [ ] Achievement system expansion
- [ ] Multi-language support
- [ ] Voice command integration
- [ ] AR/VR study modes

---

**Last Updated:** 2025-11-11
**Version:** 1.0.0
**Author:** CitizenNow Development Team
