/**
 * useQuestions Hook - Question management and filtering
 *
 * Handles loading questions from JSON files, filtering by category,
 * getting random questions, and tracking answered questions.
 *
 * @module useQuestions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CivicsQuestion, ReadingSentence, WritingSentence } from '../types';

// Import JSON data files
import civicsQuestionsData from '../data/civicsQuestions.json';
import readingSentencesData from '../data/readingSentences.json';
import writingSentencesData from '../data/writingSentences.json';

interface UseQuestionsReturn {
  questions: CivicsQuestion[];
  loading: boolean;
  error: string | null;
  getQuestionById: (id: string) => CivicsQuestion | undefined;
  getQuestionsByCategory: (
    category: CivicsQuestion['category']
  ) => CivicsQuestion[];
  getQuestionsByDifficulty: (
    difficulty: CivicsQuestion['difficulty']
  ) => CivicsQuestion[];
  getRandomQuestions: (count: number, filter?: QuestionFilter) => CivicsQuestion[];
  get65PlusQuestions: () => CivicsQuestion[];
  searchQuestions: (searchTerm: string) => CivicsQuestion[];
  totalCount: number;
  categoryCounts: { [key: string]: number };
}

interface UseReadingSentencesReturn {
  sentences: ReadingSentence[];
  loading: boolean;
  error: string | null;
  getSentenceById: (id: string) => ReadingSentence | undefined;
  getSentencesByCategory: (
    category: ReadingSentence['category']
  ) => ReadingSentence[];
  getRandomSentences: (count: number) => ReadingSentence[];
  totalCount: number;
}

interface UseWritingSentencesReturn {
  sentences: WritingSentence[];
  loading: boolean;
  error: string | null;
  getSentenceById: (id: string) => WritingSentence | undefined;
  getSentencesByCategory: (
    category: WritingSentence['category']
  ) => WritingSentence[];
  getRandomSentences: (count: number) => WritingSentence[];
  totalCount: number;
}

interface QuestionFilter {
  category?: CivicsQuestion['category'];
  difficulty?: CivicsQuestion['difficulty'];
  is65Plus?: boolean;
  era?: string;
  excludeIds?: string[];
}

/**
 * Custom hook for managing civics questions
 *
 * @returns {UseQuestionsReturn} Questions state and filtering methods
 *
 * @example
 * ```tsx
 * const {
 *   questions,
 *   loading,
 *   getRandomQuestions,
 *   getQuestionsByCategory
 * } = useQuestions();
 *
 * // Get 10 random history questions
 * const historyQuestions = getRandomQuestions(10, {
 *   category: 'american_history'
 * });
 * ```
 */
export const useQuestions = (): UseQuestionsReturn => {
  const [questions, setQuestions] = useState<CivicsQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load questions from JSON file
   */
  useEffect(() => {
    try {
      setLoading(true);
      const loadedQuestions = civicsQuestionsData as CivicsQuestion[];
      setQuestions(loadedQuestions);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading questions:', err);
      setError('Failed to load questions');
      setLoading(false);
    }
  }, []);

  /**
   * Get question by ID
   */
  const getQuestionById = useCallback(
    (id: string): CivicsQuestion | undefined => {
      return questions.find((q) => q.id === id);
    },
    [questions]
  );

  /**
   * Get questions by category
   */
  const getQuestionsByCategory = useCallback(
    (category: CivicsQuestion['category']): CivicsQuestion[] => {
      return questions.filter((q) => q.category === category);
    },
    [questions]
  );

  /**
   * Get questions by difficulty
   */
  const getQuestionsByDifficulty = useCallback(
    (difficulty: CivicsQuestion['difficulty']): CivicsQuestion[] => {
      return questions.filter((q) => q.difficulty === difficulty);
    },
    [questions]
  );

  /**
   * Get random questions with optional filtering
   */
  const getRandomQuestions = useCallback(
    (count: number, filter?: QuestionFilter): CivicsQuestion[] => {
      let filteredQuestions = [...questions];

      // Apply filters
      if (filter) {
        if (filter.category) {
          filteredQuestions = filteredQuestions.filter(
            (q) => q.category === filter.category
          );
        }
        if (filter.difficulty) {
          filteredQuestions = filteredQuestions.filter(
            (q) => q.difficulty === filter.difficulty
          );
        }
        if (filter.is65Plus !== undefined) {
          filteredQuestions = filteredQuestions.filter(
            (q) => q.isFor65Plus === filter.is65Plus
          );
        }
        if (filter.era) {
          filteredQuestions = filteredQuestions.filter((q) => q.era === filter.era);
        }
        if (filter.excludeIds && filter.excludeIds.length > 0) {
          filteredQuestions = filteredQuestions.filter(
            (q) => !filter.excludeIds!.includes(q.id)
          );
        }
      }

      // Shuffle and return
      const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    },
    [questions]
  );

  /**
   * Get special 20 questions for 65+ applicants
   */
  const get65PlusQuestions = useCallback((): CivicsQuestion[] => {
    return questions.filter((q) => q.isFor65Plus === true);
  }, [questions]);

  /**
   * Search questions by text
   */
  const searchQuestions = useCallback(
    (searchTerm: string): CivicsQuestion[] => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return questions;

      return questions.filter(
        (q) =>
          q.question.toLowerCase().includes(term) ||
          q.answer.toLowerCase().includes(term) ||
          q.category.toLowerCase().includes(term)
      );
    },
    [questions]
  );

  /**
   * Calculate category counts
   */
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    questions.forEach((q) => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });
    return counts;
  }, [questions]);

  return {
    questions,
    loading,
    error,
    getQuestionById,
    getQuestionsByCategory,
    getQuestionsByDifficulty,
    getRandomQuestions,
    get65PlusQuestions,
    searchQuestions,
    totalCount: questions.length,
    categoryCounts,
  };
};

/**
 * Custom hook for managing reading sentences
 *
 * @returns {UseReadingSentencesReturn} Reading sentences state and methods
 *
 * @example
 * ```tsx
 * const { sentences, getRandomSentences } = useReadingSentences();
 * const practiceSentences = getRandomSentences(5);
 * ```
 */
export const useReadingSentences = (): UseReadingSentencesReturn => {
  const [sentences, setSentences] = useState<ReadingSentence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load sentences from JSON file
   */
  useEffect(() => {
    try {
      setLoading(true);
      const loadedSentences = readingSentencesData as ReadingSentence[];
      setSentences(loadedSentences);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading reading sentences:', err);
      setError('Failed to load reading sentences');
      setLoading(false);
    }
  }, []);

  /**
   * Get sentence by ID
   */
  const getSentenceById = useCallback(
    (id: string): ReadingSentence | undefined => {
      return sentences.find((s) => s.id === id);
    },
    [sentences]
  );

  /**
   * Get sentences by category
   */
  const getSentencesByCategory = useCallback(
    (category: ReadingSentence['category']): ReadingSentence[] => {
      return sentences.filter((s) => s.category === category);
    },
    [sentences]
  );

  /**
   * Get random sentences
   */
  const getRandomSentences = useCallback(
    (count: number): ReadingSentence[] => {
      const shuffled = [...sentences].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    },
    [sentences]
  );

  return {
    sentences,
    loading,
    error,
    getSentenceById,
    getSentencesByCategory,
    getRandomSentences,
    totalCount: sentences.length,
  };
};

/**
 * Custom hook for managing writing sentences
 *
 * @returns {UseWritingSentencesReturn} Writing sentences state and methods
 *
 * @example
 * ```tsx
 * const { sentences, getRandomSentences } = useWritingSentences();
 * const practiceSentences = getRandomSentences(5);
 * ```
 */
export const useWritingSentences = (): UseWritingSentencesReturn => {
  const [sentences, setSentences] = useState<WritingSentence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load sentences from JSON file
   */
  useEffect(() => {
    try {
      setLoading(true);
      const loadedSentences = writingSentencesData as WritingSentence[];
      setSentences(loadedSentences);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading writing sentences:', err);
      setError('Failed to load writing sentences');
      setLoading(false);
    }
  }, []);

  /**
   * Get sentence by ID
   */
  const getSentenceById = useCallback(
    (id: string): WritingSentence | undefined => {
      return sentences.find((s) => s.id === id);
    },
    [sentences]
  );

  /**
   * Get sentences by category
   */
  const getSentencesByCategory = useCallback(
    (category: WritingSentence['category']): WritingSentence[] => {
      return sentences.filter((s) => s.category === category);
    },
    [sentences]
  );

  /**
   * Get random sentences
   */
  const getRandomSentences = useCallback(
    (count: number): WritingSentence[] => {
      const shuffled = [...sentences].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    },
    [sentences]
  );

  return {
    sentences,
    loading,
    error,
    getSentenceById,
    getSentencesByCategory,
    getRandomSentences,
    totalCount: sentences.length,
  };
};
