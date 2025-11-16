/**
 * useUserProgress Hook - User progress tracking and management
 *
 * Handles loading, updating, and syncing user progress data with Firestore.
 * Provides real-time progress statistics and question-level tracking.
 *
 * @module useUserProgress
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { firestoreService } from '../services/firestoreService';
import { UserProgress, QuestionProgress, Badge } from '../types';

interface UseUserProgressReturn {
  progress: UserProgress | null;
  loading: boolean;
  error: string | null;
  updateQuestionProgress: (questionId: string, progress: QuestionProgress) => Promise<void>;
  batchUpdateProgress: (updates: { [questionId: string]: QuestionProgress }) => Promise<void>;
  addBadge: (badge: Badge) => Promise<void>;
  updateStatistics: (updates: {
    totalPoints?: number;
    level?: number;
    streakDays?: number;
    totalStudyMinutes?: number;
  }) => Promise<void>;
  refreshProgress: () => Promise<void>;
  getQuestionProgress: (questionId: string) => QuestionProgress | null;
  getCategoryStatistics: (category: string) => {
    attempted: number;
    correct: number;
    accuracy: number;
  } | null;
  calculateOverallStats: () => {
    totalAttempted: number;
    totalCorrect: number;
    accuracy: number;
    averageRetention: number;
  };
}

/**
 * Custom hook for managing user progress
 *
 * @param {string} userId - User ID to track progress for
 * @param {boolean} autoSync - Whether to automatically sync changes to Firestore (default: true)
 * @returns {UseUserProgressReturn} Progress state and management methods
 *
 * @example
 * ```tsx
 * const {
 *   progress,
 *   loading,
 *   updateQuestionProgress,
 *   calculateOverallStats
 * } = useUserProgress(user.uid);
 *
 * const handleAnswer = async (questionId: string, correct: boolean) => {
 *   const updatedProgress = {
 *     questionId,
 *     totalAttempts: (progress?.questionProgress[questionId]?.totalAttempts || 0) + 1,
 *     correctAttempts: (progress?.questionProgress[questionId]?.correctAttempts || 0) + (correct ? 1 : 0),
 *     lastAttemptDate: new Date(),
 *     lastAnswerCorrect: correct,
 *     nextReviewDate: new Date(Date.now() + 86400000), // +1 day
 *     difficultyLevel: 2.5,
 *     consecutiveCorrect: correct ? (progress?.questionProgress[questionId]?.consecutiveCorrect || 0) + 1 : 0,
 *   };
 *   await updateQuestionProgress(questionId, updatedProgress);
 * };
 * ```
 */
export const useUserProgress = (
  userId: string | null,
  autoSync: boolean = true
): UseUserProgressReturn => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user progress from Firestore
   */
  const loadProgress = useCallback(async () => {
    if (!userId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userProgress = await firestoreService.getUserProgress(userId);
      setProgress(userProgress);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading user progress:', err);
      setError(err.message || 'Failed to load progress');
      setLoading(false);
    }
  }, [userId]);

  /**
   * Initial load of user progress
   */
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  /**
   * Update single question progress
   */
  const updateQuestionProgress = useCallback(
    async (questionId: string, questionProgress: QuestionProgress): Promise<void> => {
      if (!userId) {
        throw new Error('No user ID provided');
      }

      try {
        // Update local state immediately for optimistic UI
        setProgress((prev) => {
          if (!prev) return prev;

          const updatedQuestionProgress = {
            ...prev.questionProgress,
            [questionId]: questionProgress,
          };

          // Recalculate overall statistics
          const totalAttempted = Object.keys(updatedQuestionProgress).length;
          let totalCorrect = 0;

          Object.values(updatedQuestionProgress).forEach((qp) => {
            totalCorrect += qp.correctAttempts;
          });

          const overallAccuracy = totalAttempted > 0
            ? (totalCorrect / Object.values(updatedQuestionProgress).reduce(
                (sum, qp) => sum + qp.totalAttempts, 0
              )) * 100
            : 0;

          return {
            ...prev,
            questionProgress: updatedQuestionProgress,
            totalQuestionsAttempted: totalAttempted,
            totalCorrectAnswers: totalCorrect,
            overallAccuracy,
            lastStudyDate: new Date(),
          };
        });

        // Sync to Firestore if enabled
        if (autoSync) {
          await firestoreService.updateQuestionProgress(userId, questionId, questionProgress);
        }
      } catch (err: any) {
        console.error('Error updating question progress:', err);
        setError(err.message || 'Failed to update progress');
        throw err;
      }
    },
    [userId, autoSync]
  );

  /**
   * Batch update multiple question progress items
   */
  const batchUpdateProgress = useCallback(
    async (updates: { [questionId: string]: QuestionProgress }): Promise<void> => {
      if (!userId) {
        throw new Error('No user ID provided');
      }

      try {
        // Update local state
        setProgress((prev) => {
          if (!prev) return prev;

          const updatedQuestionProgress = {
            ...prev.questionProgress,
            ...updates,
          };

          // Recalculate statistics
          const totalAttempted = Object.keys(updatedQuestionProgress).length;
          let totalCorrect = 0;
          let totalAttempts = 0;

          Object.values(updatedQuestionProgress).forEach((qp) => {
            totalCorrect += qp.correctAttempts;
            totalAttempts += qp.totalAttempts;
          });

          const overallAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

          return {
            ...prev,
            questionProgress: updatedQuestionProgress,
            totalQuestionsAttempted: totalAttempted,
            totalCorrectAnswers: totalCorrect,
            overallAccuracy,
            lastStudyDate: new Date(),
          };
        });

        // Sync to Firestore if enabled
        if (autoSync) {
          await firestoreService.batchUpdateQuestionProgress(userId, updates);
        }
      } catch (err: any) {
        console.error('Error batch updating progress:', err);
        setError(err.message || 'Failed to batch update progress');
        throw err;
      }
    },
    [userId, autoSync]
  );

  /**
   * Add a new badge
   */
  const addBadge = useCallback(
    async (badge: Badge): Promise<void> => {
      if (!userId) {
        throw new Error('No user ID provided');
      }

      try {
        // Update local state
        setProgress((prev) => {
          if (!prev) return prev;

          // Check if badge already exists
          if (prev.badges.some((b) => b.id === badge.id)) {
            return prev;
          }

          return {
            ...prev,
            badges: [...prev.badges, badge],
          };
        });

        // Sync to Firestore if enabled
        if (autoSync) {
          await firestoreService.addBadge(userId, badge);
        }
      } catch (err: any) {
        console.error('Error adding badge:', err);
        setError(err.message || 'Failed to add badge');
        throw err;
      }
    },
    [userId, autoSync]
  );

  /**
   * Update user statistics
   */
  const updateStatistics = useCallback(
    async (updates: {
      totalPoints?: number;
      level?: number;
      streakDays?: number;
      totalStudyMinutes?: number;
    }): Promise<void> => {
      if (!userId) {
        throw new Error('No user ID provided');
      }

      try {
        // Update local state
        setProgress((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            ...updates,
          };
        });

        // Sync to Firestore if enabled
        if (autoSync) {
          await firestoreService.updateUserStatistics(userId, updates);
        }
      } catch (err: any) {
        console.error('Error updating statistics:', err);
        setError(err.message || 'Failed to update statistics');
        throw err;
      }
    },
    [userId, autoSync]
  );

  /**
   * Manually refresh progress from Firestore
   */
  const refreshProgress = useCallback(async (): Promise<void> => {
    await loadProgress();
  }, [loadProgress]);

  /**
   * Get progress for a specific question
   */
  const getQuestionProgress = useCallback(
    (questionId: string): QuestionProgress | null => {
      if (!progress) return null;
      return progress.questionProgress[questionId] || null;
    },
    [progress]
  );

  /**
   * Get statistics for a specific category
   */
  const getCategoryStatistics = useCallback(
    (category: string) => {
      if (!progress) return null;
      return progress.categoryProgress[category] || null;
    },
    [progress]
  );

  /**
   * Calculate overall statistics
   */
  const calculateOverallStats = useCallback(() => {
    if (!progress) {
      return {
        totalAttempted: 0,
        totalCorrect: 0,
        accuracy: 0,
        averageRetention: 0,
      };
    }

    const questionProgresses = Object.values(progress.questionProgress);
    const totalAttempted = questionProgresses.length;
    let totalCorrect = 0;
    let totalAttempts = 0;

    questionProgresses.forEach((qp) => {
      totalCorrect += qp.correctAttempts;
      totalAttempts += qp.totalAttempts;
    });

    const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

    // Average retention: average of individual question retention rates
    const averageRetention = totalAttempted > 0
      ? questionProgresses.reduce((sum, qp) => {
          const retention = qp.totalAttempts > 0
            ? (qp.correctAttempts / qp.totalAttempts) * 100
            : 0;
          return sum + retention;
        }, 0) / totalAttempted
      : 0;

    return {
      totalAttempted,
      totalCorrect,
      accuracy,
      averageRetention,
    };
  }, [progress]);

  return {
    progress,
    loading,
    error,
    updateQuestionProgress,
    batchUpdateProgress,
    addBadge,
    updateStatistics,
    refreshProgress,
    getQuestionProgress,
    getCategoryStatistics,
    calculateOverallStats,
  };
};
