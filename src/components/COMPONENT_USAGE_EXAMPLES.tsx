/**
 * CitizenNow Enhanced - Component Usage Examples
 *
 * This file demonstrates how to use all core UI components
 * in your screens and features.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  QuestionCard,
  ProgressBar,
  Badge,
  StreakCounter,
  ScoreCard,
} from './index';
import { CivicsQuestion, Badge as BadgeType } from '../types';

/**
 * Example 1: QuestionCard in Flashcard Mode
 */
export const FlashcardExample = () => {
  const sampleQuestion: CivicsQuestion = {
    id: '1',
    questionNumber: 1,
    question: 'What is the supreme law of the land?',
    answer: 'The Constitution',
    category: 'american_government',
    difficulty: 'easy',
    audioUrl: 'https://example.com/audio/q1.mp3',
  };

  return (
    <QuestionCard
      question={sampleQuestion}
      mode="flashcard"
      showAudioButton={true}
      onPlayAudio={() => console.log('Playing audio...')}
    />
  );
};

/**
 * Example 2: QuestionCard in Quiz Mode with Multiple Choice
 */
export const QuizExample = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState(false);

  const sampleQuestion: CivicsQuestion = {
    id: '2',
    questionNumber: 2,
    question: 'What does the Constitution do?',
    answer: 'Sets up the government',
    category: 'american_government',
    difficulty: 'medium',
  };

  const options = [
    'Sets up the government',
    'Declares independence',
    'Establishes the military',
    'Creates state laws',
  ];

  return (
    <QuestionCard
      question={sampleQuestion}
      mode="quiz"
      multipleChoiceOptions={options}
      selectedAnswer={selectedAnswer}
      onSelectAnswer={setSelectedAnswer}
      showAnswerProp={showAnswer}
      onAnswer={(correct) => {
        setShowAnswer(true);
        console.log('Answer was:', correct ? 'correct' : 'incorrect');
      }}
    />
  );
};

/**
 * Example 3: ProgressBar with Different States
 */
export const ProgressBarExamples = () => {
  return (
    <View style={styles.container}>
      {/* Basic progress bar */}
      <ProgressBar progress={75} label="Overall Progress" />

      {/* With custom color scheme */}
      <ProgressBar
        progress={45}
        label="Category Progress"
        colorScheme="warning"
      />

      {/* Large progress bar */}
      <ProgressBar
        progress={95}
        label="Quiz Score"
        height={20}
        showPercentage={true}
      />

      {/* Without animation */}
      <ProgressBar
        progress={60}
        label="Mastery Level"
        animated={false}
      />
    </View>
  );
};

/**
 * Example 4: Badge Component in Different States
 */
export const BadgeExamples = () => {
  const earnedBadge: BadgeType = {
    id: 'badge1',
    name: '7 Day Streak',
    description: 'Studied for 7 consecutive days',
    iconUrl: 'emoji:🔥',
    earnedAt: new Date(),
    type: 'streak',
  };

  const lockedBadge: BadgeType = {
    id: 'badge2',
    name: 'Master',
    description: 'Achieve 100% accuracy on all categories',
    iconUrl: 'emoji:🎓',
    earnedAt: new Date(),
    type: 'mastery',
  };

  return (
    <View style={styles.badgeContainer}>
      {/* Small earned badge */}
      <Badge badge={earnedBadge} size="small" />

      {/* Medium earned badge with animation */}
      <Badge
        badge={earnedBadge}
        size="medium"
        showAnimation={true}
        onPress={() => console.log('Badge pressed')}
      />

      {/* Large locked badge */}
      <Badge badge={lockedBadge} size="large" isLocked={true} />
    </View>
  );
};

/**
 * Example 5: StreakCounter with Calendar
 */
export const StreakCounterExample = () => {
  // Sample study dates (last 30 days with some gaps)
  const studyDates = [
    new Date(), // Today
    new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
  ];

  return (
    <StreakCounter
      streakDays={3}
      lastStudyDate={new Date()}
      showCalendar={true}
      studyDates={studyDates}
      maxCalendarDays={30}
    />
  );
};

/**
 * Example 6: ScoreCard with Different Results
 */
export const ScoreCardExamples = () => {
  return (
    <ScrollView style={styles.scrollContainer}>
      {/* Perfect score */}
      <ScoreCard
        score={20}
        totalQuestions={20}
        passingScore={60}
        timeTaken={480} // 8 minutes
        accuracy={100}
        showAnimation={true}
        onReview={() => console.log('Review pressed')}
        onRetry={() => console.log('Retry pressed')}
        onHome={() => console.log('Home pressed')}
      />

      {/* Passing score */}
      <ScoreCard
        score={15}
        totalQuestions={20}
        passingScore={60}
        timeTaken={600} // 10 minutes
        onReview={() => console.log('Review pressed')}
        onRetry={() => console.log('Retry pressed')}
      />

      {/* Failing score */}
      <ScoreCard
        score={8}
        totalQuestions={20}
        passingScore={60}
        timeTaken={720} // 12 minutes
        onRetry={() => console.log('Retry pressed')}
        onHome={() => console.log('Home pressed')}
      />
    </ScrollView>
  );
};

/**
 * Example 7: Complete Screen Integration
 */
export const CompleteScreenExample = () => {
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);

  const sampleQuestion: CivicsQuestion = {
    id: '1',
    questionNumber: 1,
    question: 'What is the supreme law of the land?',
    answer: 'The Constitution',
    category: 'american_government',
    difficulty: 'easy',
  };

  const earnedBadge: BadgeType = {
    id: 'badge1',
    name: 'Quick Learner',
    description: 'Complete your first quiz',
    iconUrl: 'emoji:⚡',
    earnedAt: new Date(),
    type: 'milestone',
  };

  return (
    <ScrollView style={styles.screenContainer}>
      {/* Progress Section */}
      <View style={styles.section}>
        <ProgressBar progress={65} label="Overall Progress" />
      </View>

      {/* Streak Section */}
      <View style={styles.section}>
        <StreakCounter
          streakDays={7}
          lastStudyDate={new Date()}
          showCalendar={true}
          studyDates={[new Date()]}
        />
      </View>

      {/* Question or Score */}
      <View style={styles.section}>
        {!quizComplete ? (
          <QuestionCard
            question={sampleQuestion}
            mode="quiz"
            multipleChoiceOptions={[
              'The Constitution',
              'The Declaration of Independence',
              'The Bill of Rights',
              'The Articles of Confederation',
            ]}
            onAnswer={(correct) => {
              if (correct) setScore(score + 1);
              setQuizComplete(true);
            }}
          />
        ) : (
          <ScoreCard
            score={score}
            totalQuestions={20}
            timeTaken={600}
            onRetry={() => {
              setQuizComplete(false);
              setScore(0);
            }}
          />
        )}
      </View>

      {/* Badges Section */}
      <View style={styles.badgeSection}>
        <Badge badge={earnedBadge} size="medium" showAnimation={true} />
      </View>
    </ScrollView>
  );
};

/**
 * Styles for examples
 */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  section: {
    margin: 16,
    marginBottom: 24,
  },
  badgeSection: {
    margin: 16,
    alignItems: 'center',
  },
});

export default {
  FlashcardExample,
  QuizExample,
  ProgressBarExamples,
  BadgeExamples,
  StreakCounterExample,
  ScoreCardExamples,
  CompleteScreenExample,
};
