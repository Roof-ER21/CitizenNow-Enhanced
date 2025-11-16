# CitizenNow Enhanced - Core UI Components

This directory contains the core reusable UI components for the CitizenNow Enhanced app. All components are built with TypeScript, React Native, and follow accessibility best practices.

## Design System

**Color Theme:**
- Primary: `#1E40AF` (Deep Blue)
- Secondary: `#3B82F6` (Blue)
- Accent: `#93C5FD` (Light Blue)
- Success: `#059669` (Green)
- Warning: `#F59E0B` (Orange)
- Danger: `#DC2626` (Red)

## Components Overview

### 1. QuestionCard

A versatile card component for displaying civics questions in both flashcard and quiz modes.

**File:** `/Users/a21/CitizenNow-Enhanced/src/components/QuestionCard.tsx`

**Features:**
- Flip animation for flashcard mode
- Multiple choice display for quiz mode
- Audio playback button
- Category badge and difficulty indicator
- Accessible design with proper ARIA attributes

**Props:**

```typescript
interface QuestionCardProps {
  question: CivicsQuestion;
  onAnswer?: (correct: boolean) => void;
  showAnswerProp?: boolean;
  mode: 'flashcard' | 'quiz';
  multipleChoiceOptions?: string[];
  selectedAnswer?: string;
  onSelectAnswer?: (answer: string) => void;
  showAudioButton?: boolean;
  onPlayAudio?: () => void;
}
```

**Usage:**

```tsx
import { QuestionCard } from '../components';

// Flashcard mode
<QuestionCard
  question={civicsQuestion}
  mode="flashcard"
  showAudioButton={true}
  onPlayAudio={handlePlayAudio}
/>

// Quiz mode
<QuestionCard
  question={civicsQuestion}
  mode="quiz"
  multipleChoiceOptions={['Option 1', 'Option 2', 'Option 3', 'Option 4']}
  selectedAnswer={selectedAnswer}
  onSelectAnswer={setSelectedAnswer}
  onAnswer={(correct) => console.log('Answer was correct:', correct)}
/>
```

**Key Features:**
- 3D flip animation using React Native Animated API
- Color-coded categories (Government, History, Civics, Geography, Symbols)
- Difficulty indicators (●, ●●, ●●●)
- Special badge for 65+ questions
- Platform-specific shadows (iOS & Android)

---

### 2. ProgressBar

A visual progress indicator with smooth animations and color-coded states.

**File:** `/Users/a21/CitizenNow-Enhanced/src/components/ProgressBar.tsx`

**Features:**
- Animated progress transitions
- Color coding based on score (red < 40%, yellow 40-70%, green > 70%)
- Percentage display
- Customizable label text
- Encouraging status messages

**Props:**

```typescript
interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  height?: number;
  animated?: boolean;
  colorScheme?: 'default' | 'success' | 'warning' | 'danger';
}
```

**Usage:**

```tsx
import { ProgressBar } from '../components';

<ProgressBar
  progress={75}
  label="Overall Progress"
  showPercentage={true}
  height={12}
  animated={true}
/>

// With custom color scheme
<ProgressBar
  progress={45}
  label="Category Progress"
  colorScheme="warning"
/>
```

**Status Messages:**
- 100%: "Perfect! 🎉"
- 90-99%: "Excellent work! 🌟"
- 80-89%: "Great job! 💪"
- 70-79%: "Good progress! 👍"
- 60-69%: "Keep going! 🚀"
- 50-59%: "You're halfway there! 💯"
- 40-49%: "Making progress! 📈"
- 25-39%: "Keep practicing! 📚"
- 0-24%: "Just getting started! 🎯"

---

### 3. Badge

Displays achievement badges with earned/locked states and animations.

**File:** `/Users/a21/CitizenNow-Enhanced/src/components/Badge.tsx`

**Features:**
- Icon display with emoji support
- Badge name and description
- Earned/locked visual states
- Celebration animation when earned
- Responsive sizing (small/medium/large)
- Glow effect for earned badges

**Props:**

```typescript
interface BadgeProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  isLocked?: boolean;
  onPress?: () => void;
  showAnimation?: boolean;
}
```

**Usage:**

```tsx
import { Badge } from '../components';

const earnedBadge: BadgeType = {
  id: 'streak_7',
  name: '7 Day Streak',
  description: 'Studied for 7 consecutive days',
  iconUrl: 'emoji:🔥',
  earnedAt: new Date(),
  type: 'streak',
};

<Badge
  badge={earnedBadge}
  size="medium"
  showAnimation={true}
  onPress={() => console.log('Badge details')}
/>

// Locked badge
<Badge
  badge={lockedBadge}
  size="large"
  isLocked={true}
/>
```

**Badge Types:**
- `streak` - Daily study streaks (🔥 Orange)
- `mastery` - Category mastery (🎓 Blue)
- `milestone` - Achievement milestones (🏆 Purple)
- `special` - Special achievements (⭐ Red)

**Sizes:**
- Small: 80x80 container, 32px icon, 12px name
- Medium: 120x120 container, 48px icon, 16px name
- Large: 160x160 container, 64px icon, 20px name

---

### 4. StreakCounter

Displays the user's daily study streak with visual feedback.

**File:** `/Users/a21/CitizenNow-Enhanced/src/components/StreakCounter.tsx`

**Features:**
- Fire emoji with animated number display
- Calendar grid showing active study days
- Encouragement text based on streak
- Visual feedback for streak milestones
- Today's study status indicator

**Props:**

```typescript
interface StreakCounterProps {
  streakDays: number;
  lastStudyDate?: Date;
  showCalendar?: boolean;
  studyDates?: Date[];
  maxCalendarDays?: number;
}
```

**Usage:**

```tsx
import { StreakCounter } from '../components';

<StreakCounter
  streakDays={7}
  lastStudyDate={new Date()}
  showCalendar={true}
  studyDates={[
    new Date(),
    new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  ]}
  maxCalendarDays={30}
/>
```

**Milestones:**
- 7 days: "⭐ 1 Week"
- 30 days: "🏆 1 Month"
- 100 days: "👑 100 Days"

**Animations:**
- Pulse animation for active streaks
- Glow effect on fire emoji
- Color changes based on streak length

---

### 5. ScoreCard

Displays quiz results with detailed scoring and actions.

**File:** `/Users/a21/CitizenNow-Enhanced/src/components/ScoreCard.tsx`

**Features:**
- Score display (X/20) with visual feedback
- Pass/fail status with color coding
- Accuracy percentage
- Time taken display
- Action buttons (Review, Retry, Home)
- Performance analysis feedback
- Celebration animation for passing scores

**Props:**

```typescript
interface ScoreCardProps {
  score: number;
  totalQuestions: number;
  passingScore?: number;
  timeTaken?: number; // in seconds
  accuracy?: number; // 0-100
  onReview?: () => void;
  onRetry?: () => void;
  onHome?: () => void;
  showAnimation?: boolean;
}
```

**Usage:**

```tsx
import { ScoreCard } from '../components';

<ScoreCard
  score={18}
  totalQuestions={20}
  passingScore={60}
  timeTaken={480} // 8 minutes
  accuracy={90}
  showAnimation={true}
  onReview={() => navigation.navigate('ReviewAnswers')}
  onRetry={() => navigation.navigate('Quiz')}
  onHome={() => navigation.navigate('Home')}
/>
```

**Status Messages:**
- 100%: "Perfect Score! 🎉"
- 90-99%: "Excellent! 🌟"
- 80-89%: "Great Job! 💪"
- 60-79%: "You Passed! ✓"
- 50-59%: "Keep Practicing! 📚"
- 0-49%: "Study More & Try Again! 💡"

**Performance Feedback:**
- 90%+: "Outstanding performance! You're ready for the test."
- 60-89%: "Good work! Review missed questions to improve further."
- 50-59%: "You're close to passing. Focus on weak areas and try again."
- <50%: "More study time needed. Review the material and practice regularly."

---

## Import Methods

### Individual Imports

```tsx
import QuestionCard from './components/QuestionCard';
import ProgressBar from './components/ProgressBar';
import Badge from './components/Badge';
import StreakCounter from './components/StreakCounter';
import ScoreCard from './components/ScoreCard';
```

### Barrel Import (Recommended)

```tsx
import {
  QuestionCard,
  ProgressBar,
  Badge,
  StreakCounter,
  ScoreCard,
} from './components';
```

---

## Accessibility Features

All components include:

- Proper `accessibilityRole` attributes
- Descriptive `accessibilityLabel` text
- `accessibilityHint` for interactive elements
- `accessibilityState` for stateful components
- Screen reader-friendly text
- Keyboard navigation support (where applicable)

---

## Platform Support

All components are optimized for:

- **iOS**: Native shadows using `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`
- **Android**: Elevation system using `elevation` property
- **Web**: Graceful fallbacks for native features

---

## Animation Details

### QuestionCard
- Flip animation: 3D rotation using `rotateY`
- Spring physics: `friction: 8`, `tension: 10`

### ProgressBar
- Width animation: Spring animation
- Duration: Adapts to progress change

### Badge
- Scale animation: Spring effect on earn
- Rotation: 360° celebration spin
- Glow: Pulsing opacity (3 iterations)

### StreakCounter
- Pulse animation: 1-second cycles
- Glow effect: Synchronized with pulse

### ScoreCard
- Scale up: Spring animation on mount
- Fade in: 500ms timing
- Confetti: 2-second fade for passing scores

---

## Testing

To test components in isolation, see:
`/Users/a21/CitizenNow-Enhanced/src/components/COMPONENT_USAGE_EXAMPLES.tsx`

---

## File Structure

```
src/components/
├── QuestionCard.tsx          (575 lines)
├── ProgressBar.tsx           (244 lines)
├── Badge.tsx                 (380 lines)
├── StreakCounter.tsx         (487 lines)
├── ScoreCard.tsx             (528 lines)
├── index.ts                  (8 lines - barrel export)
├── README.md                 (this file)
└── COMPONENT_USAGE_EXAMPLES.tsx  (usage examples)
```

**Total:** 2,222 lines of TypeScript code

---

## Next Steps

1. Create screen components that use these core components
2. Implement navigation between screens
3. Connect components to Firebase for data persistence
4. Add state management (Context API or Redux)
5. Implement AI features (interview practice, speech recognition)

---

## Contributing

When creating new components:

1. Follow TypeScript strict mode
2. Use proper prop typing with interfaces
3. Include comprehensive JSDoc comments
4. Implement accessibility attributes
5. Support both iOS and Android styling
6. Add usage examples to COMPONENT_USAGE_EXAMPLES.tsx
7. Document the component in this README

---

**Last Updated:** November 11, 2025
**Project:** CitizenNow Enhanced
**Location:** `/Users/a21/CitizenNow-Enhanced/src/components/`
