/**
 * Custom Hooks Export
 *
 * Centralized export point for all custom React hooks in CitizenNow Enhanced.
 *
 * @module hooks
 */

// Authentication
export { useAuth } from './useAuth';

// User Progress
export { useUserProgress } from './useUserProgress';

// Questions Management
export {
  useQuestions,
  useReadingSentences,
  useWritingSentences,
} from './useQuestions';

// Spaced Repetition
export {
  useSpacedRepetition,
  convertToSM2Rating,
  createInitialQuestionProgress,
  calculateStudyStreak,
  estimateTimeToMastery,
} from './useSpacedRepetition';
