// Spaced Repetition Service using SuperMemo SM-2 Algorithm
import { QuestionProgress } from '../types';

export class SpacedRepetitionService {
  // SM-2 Algorithm Implementation
  calculateNextReview(
    progress: QuestionProgress,
    userRating: number // 0-5: 0=total blackout, 5=perfect response
  ): QuestionProgress {
    const { difficultyLevel, consecutiveCorrect } = progress;

    let newDifficulty = difficultyLevel;
    let newInterval = 1; // days until next review
    let newConsecutiveCorrect = consecutiveCorrect;

    if (userRating >= 3) {
      // Correct answer
      newConsecutiveCorrect++;

      if (consecutiveCorrect === 0) {
        newInterval = 1;
      } else if (consecutiveCorrect === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(
          (consecutiveCorrect - 1) * difficultyLevel
        );
      }

      // Update difficulty factor
      newDifficulty =
        difficultyLevel + (0.1 - (5 - userRating) * (0.08 + (5 - userRating) * 0.02));

      // Clamp difficulty between 1.3 and 2.5
      newDifficulty = Math.max(1.3, Math.min(2.5, newDifficulty));
    } else {
      // Incorrect answer - reset
      newConsecutiveCorrect = 0;
      newInterval = 1;
      newDifficulty = Math.max(1.3, difficultyLevel - 0.2);
    }

    const now = new Date();
    const nextReviewDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

    return {
      ...progress,
      difficultyLevel: newDifficulty,
      consecutiveCorrect: newConsecutiveCorrect,
      nextReviewDate,
      lastAttemptDate: now,
      lastAnswerCorrect: userRating >= 3,
      totalAttempts: progress.totalAttempts + 1,
      correctAttempts: progress.correctAttempts + (userRating >= 3 ? 1 : 0),
    };
  }

  // Get questions due for review today
  getDueQuestions(allProgress: { [questionId: string]: QuestionProgress }): string[] {
    const now = new Date();
    const dueQuestions: string[] = [];

    Object.entries(allProgress).forEach(([questionId, progress]) => {
      if (progress.nextReviewDate <= now) {
        dueQuestions.push(questionId);
      }
    });

    return dueQuestions;
  }

  // Get questions sorted by priority (due first, then by difficulty)
  getPrioritizedQuestions(
    allProgress: { [questionId: string]: QuestionProgress }
  ): string[] {
    const now = new Date();
    const questions = Object.entries(allProgress);

    // Sort by:
    // 1. Overdue questions first (how many days overdue)
    // 2. Never attempted questions
    // 3. Questions with low consecutive correct count
    // 4. Questions with high difficulty
    return questions
      .map(([questionId, progress]) => {
        const daysOverdue = Math.max(
          0,
          (now.getTime() - progress.nextReviewDate.getTime()) / (24 * 60 * 60 * 1000)
        );

        const priority =
          daysOverdue * 100 + // Heavily prioritize overdue
          (progress.totalAttempts === 0 ? 50 : 0) + // New questions
          (5 - progress.consecutiveCorrect) * 10 + // Struggling questions
          (3 - Math.min(progress.difficultyLevel, 3)) * 5; // Difficult questions

        return { questionId, priority };
      })
      .sort((a, b) => b.priority - a.priority)
      .map(item => item.questionId);
  }

  // Identify weak areas by category
  getWeakCategories(
    categoryProgress: {
      [category: string]: { attempted: number; correct: number; accuracy: number };
    }
  ): string[] {
    const categories = Object.entries(categoryProgress);

    // Categories with:
    // 1. Accuracy < 70%
    // 2. At least 5 attempts (to avoid small sample size)
    return categories
      .filter(([_, stats]) => stats.attempted >= 5 && stats.accuracy < 0.7)
      .sort((a, b) => a[1].accuracy - b[1].accuracy)
      .map(([category]) => category);
  }

  // Generate personalized study plan
  generateStudyPlan(
    allProgress: { [questionId: string]: QuestionProgress },
    categoryProgress: {
      [category: string]: { attempted: number; correct: number; accuracy: number };
    },
    dailyGoal: number = 20 // questions per day
  ): {
    dueToday: string[];
    newQuestions: string[];
    weakAreaReview: string[];
    totalRecommended: number;
  } {
    const prioritizedQuestions = this.getPrioritizedQuestions(allProgress);
    const dueQuestions = this.getDueQuestions(allProgress);
    const weakCategories = this.getWeakCategories(categoryProgress);

    // Split daily goal:
    // 60% due questions
    // 20% new questions
    // 20% weak area review
    const dueCount = Math.ceil(dailyGoal * 0.6);
    const newCount = Math.ceil(dailyGoal * 0.2);
    const reviewCount = Math.ceil(dailyGoal * 0.2);

    const dueToday = prioritizedQuestions.slice(0, dueCount);

    const newQuestions = prioritizedQuestions
      .filter(qId => allProgress[qId].totalAttempts === 0)
      .slice(0, newCount);

    // Weak area questions: from weak categories, not already in due list
    const weakAreaReview = prioritizedQuestions
      .filter(
        qId =>
          !dueToday.includes(qId) &&
          !newQuestions.includes(qId) &&
          weakCategories.length > 0
      )
      .slice(0, reviewCount);

    return {
      dueToday,
      newQuestions,
      weakAreaReview,
      totalRecommended: dueToday.length + newQuestions.length + weakAreaReview.length,
    };
  }

  // Calculate retention rate
  calculateRetentionRate(progress: QuestionProgress): number {
    if (progress.totalAttempts === 0) return 0;
    return (progress.correctAttempts / progress.totalAttempts) * 100;
  }

  // Predict pass probability based on current progress
  predictPassProbability(
    allProgress: { [questionId: string]: QuestionProgress },
    totalQuestions: number = 128
  ): number {
    const questionsAnswered = Object.keys(allProgress).length;
    if (questionsAnswered === 0) return 0;

    // Calculate average retention across all questions
    const totalRetention = Object.values(allProgress).reduce(
      (sum, prog) => sum + this.calculateRetentionRate(prog),
      0
    );
    const averageRetention = totalRetention / questionsAnswered;

    // Coverage: what % of total questions have been attempted
    const coverage = questionsAnswered / totalQuestions;

    // Pass probability formula:
    // - Need 60% accuracy to pass (12/20 questions correct)
    // - Account for coverage (studied all topics)
    // - Account for retention (remember what you studied)
    const passProbability =
      (averageRetention / 100) * 0.7 + // 70% weight on retention
      coverage * 0.3; // 30% weight on coverage

    return Math.min(100, passProbability * 100);
  }
}

export const spacedRepetitionService = new SpacedRepetitionService();
