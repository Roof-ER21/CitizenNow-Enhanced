/**
 * useSpacedRepetition Hook - Spaced repetition learning algorithm
 *
 * Manages spaced repetition system using SM-2 algorithm for optimal
 * learning and retention. Provides study plans and tracks review intervals.
 *
 * @module useSpacedRepetition
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { spacedRepetitionService } from '../services/spacedRepetitionService';
import { QuestionProgress, UserProgress } from '../types';

interface StudyPlan {
  dueToday: string[];
  newQuestions: string[];
  weakAreaReview: string[];
  totalRecommended: number;
}

interface UseSpacedRepetitionReturn {
  studyPlan: StudyPlan | null;
  dueQuestions: string[];
  weakCategories: string[];
  loading: boolean;
  calculateNextReview: (
    progress: QuestionProgress,
    userRating: number
  ) => QuestionProgress;
  getDueQuestions: (allProgress: { [questionId: string]: QuestionProgress }) => string[];
  generateStudyPlan: (dailyGoal?: number) => StudyPlan | null;
  getPrioritizedQuestions: () => string[];
  calculateRetentionRate: (progress: QuestionProgress) => number;
  predictPassProbability: (totalQuestions?: number) => number;
  refreshStudyPlan: () => void;
}

/**
 * Custom hook for spaced repetition learning algorithm
 *
 * @param {UserProgress | null} userProgress - Current user progress data
 * @param {number} dailyGoal - Target questions per day (default: 20)
 * @returns {UseSpacedRepetitionReturn} Spaced repetition state and methods
 *
 * @example
 * ```tsx
 * const {
 *   studyPlan,
 *   dueQuestions,
 *   calculateNextReview,
 *   predictPassProbability
 * } = useSpacedRepetition(progress, 20);
 *
 * // After user answers a question
 * const handleAnswer = (questionId: string, correct: boolean) => {
 *   const currentProgress = progress.questionProgress[questionId] || {
 *     questionId,
 *     totalAttempts: 0,
 *     correctAttempts: 0,
 *     lastAttemptDate: new Date(),
 *     lastAnswerCorrect: false,
 *     nextReviewDate: new Date(),
 *     difficultyLevel: 2.5,
 *     consecutiveCorrect: 0,
 *   };
 *
 *   // Rate: 0-5 (0=total blackout, 3-5=correct)
 *   const rating = correct ? 4 : 1;
 *   const updatedProgress = calculateNextReview(currentProgress, rating);
 *
 *   // Save updatedProgress to database
 * };
 * ```
 */
export const useSpacedRepetition = (
  userProgress: UserProgress | null,
  dailyGoal: number = 20
): UseSpacedRepetitionReturn => {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Calculate due questions
   */
  const dueQuestions = useMemo(() => {
    if (!userProgress) return [];
    return spacedRepetitionService.getDueQuestions(userProgress.questionProgress);
  }, [userProgress]);

  /**
   * Identify weak categories
   */
  const weakCategories = useMemo(() => {
    if (!userProgress) return [];
    return spacedRepetitionService.getWeakCategories(userProgress.categoryProgress);
  }, [userProgress]);

  /**
   * Generate initial study plan
   */
  useEffect(() => {
    if (!userProgress) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const plan = spacedRepetitionService.generateStudyPlan(
        userProgress.questionProgress,
        userProgress.categoryProgress,
        dailyGoal
      );
      setStudyPlan(plan);
      setLoading(false);
    } catch (error) {
      console.error('Error generating study plan:', error);
      setLoading(false);
    }
  }, [userProgress, dailyGoal]);

  /**
   * Calculate next review schedule for a question
   * Uses SM-2 algorithm with user rating (0-5)
   */
  const calculateNextReview = useCallback(
    (progress: QuestionProgress, userRating: number): QuestionProgress => {
      return spacedRepetitionService.calculateNextReview(progress, userRating);
    },
    []
  );

  /**
   * Get all questions due for review today
   */
  const getDueQuestions = useCallback(
    (allProgress: { [questionId: string]: QuestionProgress }): string[] => {
      return spacedRepetitionService.getDueQuestions(allProgress);
    },
    []
  );

  /**
   * Generate new study plan with custom daily goal
   */
  const generateStudyPlan = useCallback(
    (customDailyGoal?: number): StudyPlan | null => {
      if (!userProgress) return null;

      const plan = spacedRepetitionService.generateStudyPlan(
        userProgress.questionProgress,
        userProgress.categoryProgress,
        customDailyGoal || dailyGoal
      );

      setStudyPlan(plan);
      return plan;
    },
    [userProgress, dailyGoal]
  );

  /**
   * Get questions sorted by priority
   * (overdue first, then new, then by difficulty)
   */
  const getPrioritizedQuestions = useCallback((): string[] => {
    if (!userProgress) return [];
    return spacedRepetitionService.getPrioritizedQuestions(userProgress.questionProgress);
  }, [userProgress]);

  /**
   * Calculate retention rate for a specific question
   */
  const calculateRetentionRate = useCallback(
    (progress: QuestionProgress): number => {
      return spacedRepetitionService.calculateRetentionRate(progress);
    },
    []
  );

  /**
   * Predict probability of passing the test
   * Based on current progress and retention rates
   */
  const predictPassProbability = useCallback(
    (totalQuestions: number = 128): number => {
      if (!userProgress) return 0;
      return spacedRepetitionService.predictPassProbability(
        userProgress.questionProgress,
        totalQuestions
      );
    },
    [userProgress]
  );

  /**
   * Manually refresh study plan
   */
  const refreshStudyPlan = useCallback(() => {
    if (!userProgress) return;

    const plan = spacedRepetitionService.generateStudyPlan(
      userProgress.questionProgress,
      userProgress.categoryProgress,
      dailyGoal
    );
    setStudyPlan(plan);
  }, [userProgress, dailyGoal]);

  return {
    studyPlan,
    dueQuestions,
    weakCategories,
    loading,
    calculateNextReview,
    getDueQuestions,
    generateStudyPlan,
    getPrioritizedQuestions,
    calculateRetentionRate,
    predictPassProbability,
    refreshStudyPlan,
  };
};

/**
 * Helper function to convert answer correctness to SM-2 rating
 *
 * @param {boolean} correct - Whether answer was correct
 * @param {number} confidence - Confidence level (0-100)
 * @returns {number} SM-2 rating (0-5)
 *
 * @example
 * ```tsx
 * // Perfect recall
 * const rating1 = convertToSM2Rating(true, 100); // Returns 5
 *
 * // Correct but hesitant
 * const rating2 = convertToSM2Rating(true, 60); // Returns 3
 *
 * // Incorrect
 * const rating3 = convertToSM2Rating(false, 0); // Returns 0
 * ```
 */
export const convertToSM2Rating = (correct: boolean, confidence: number = 80): number => {
  if (!correct) {
    return confidence < 30 ? 0 : 1; // Total blackout vs. incorrect
  }

  // Correct answers with varying confidence
  if (confidence >= 90) return 5; // Perfect response
  if (confidence >= 75) return 4; // Correct with hesitation
  return 3; // Correct with difficulty
};

/**
 * Helper function to create initial QuestionProgress
 *
 * @param {string} questionId - Question ID
 * @returns {QuestionProgress} Initial progress object
 */
export const createInitialQuestionProgress = (questionId: string): QuestionProgress => {
  return {
    questionId,
    totalAttempts: 0,
    correctAttempts: 0,
    lastAttemptDate: new Date(),
    lastAnswerCorrect: false,
    nextReviewDate: new Date(), // Due immediately for first attempt
    difficultyLevel: 2.5, // Default SM-2 difficulty
    consecutiveCorrect: 0,
  };
};

/**
 * Helper function to calculate study streak
 *
 * @param {Date[]} studyDates - Array of study dates
 * @returns {number} Current streak in days
 */
export const calculateStudyStreak = (studyDates: Date[]): number => {
  if (studyDates.length === 0) return 0;

  // Sort dates in descending order
  const sortedDates = studyDates
    .map((d) => new Date(d).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);

  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 86400000; // 24 hours in ms

  // Check if studied today or yesterday
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0; // Streak broken
  }

  let streak = 1;
  let currentDate = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const diff = currentDate - sortedDates[i];

    // If exactly 1 day apart, continue streak
    if (diff === 86400000) {
      streak++;
      currentDate = sortedDates[i];
    } else if (diff === 0) {
      // Same day, skip
      continue;
    } else {
      // Gap in dates, streak ends
      break;
    }
  }

  return streak;
};

/**
 * Helper function to estimate time to mastery
 *
 * @param {QuestionProgress} progress - Question progress
 * @returns {number} Estimated days until mastery (consecutiveCorrect >= 5)
 */
export const estimateTimeToMastery = (progress: QuestionProgress): number => {
  const { consecutiveCorrect, difficultyLevel } = progress;

  if (consecutiveCorrect >= 5) return 0; // Already mastered

  // Estimate based on current progress and difficulty
  const attemptsNeeded = 5 - consecutiveCorrect;
  const daysPerAttempt = Math.ceil(difficultyLevel);

  return attemptsNeeded * daysPerAttempt;
};
