// User Context - Global state management for user data, progress, and gamification (local-only)
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  UserProgress,
  StudySession,
  Badge,
  DailyChallenge,
  QuestionProgress,
} from '../types';
import { gamificationService } from '../services/gamificationService';
import { spacedRepetitionService } from '../services/spacedRepetitionService';

// Local user type (no Firebase dependency)
interface LocalUser {
  uid: string;
  email?: string;
  displayName?: string;
}

// AsyncStorage keys
const STORAGE_KEYS = {
  USER: '@citizennow_user',
  USER_PROFILE: '@citizennow_user_profile',
  USER_PROGRESS: '@citizennow_user_progress',
  STUDY_SESSIONS: '@citizennow_study_sessions',
  DAILY_CHALLENGES: '@citizennow_daily_challenges',
};

interface UserContextType {
  // Auth
  user: LocalUser | null;
  userProfile: UserProfile | null;
  loading: boolean;

  // Progress
  userProgress: UserProgress | null;
  studySessions: StudySession[];
  dailyChallenges: DailyChallenge[];

  // Actions
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  recordStudySession: (session: Omit<StudySession, 'id'>) => Promise<void>;
  updateQuestionProgress: (questionId: string, correct: boolean, rating: number) => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;

  // Computed values
  level: number;
  pointsToNextLevel: { current: number; needed: number; percentage: number };
  engagementScore: number;
  passProbability: number;

  // Utils
  refreshProgress: () => Promise<void>;
  signOut: () => Promise<void>;

  // Local-only: Initialize user (replaces Firebase auth)
  initializeUser: (userData: LocalUser, profileData?: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user data from AsyncStorage on mount
  useEffect(() => {
    loadLocalUserData();
  }, []);

  // Load user data from AsyncStorage
  const loadLocalUserData = async () => {
    try {
      setLoading(true);

      // Load user
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (userJson) {
        const localUser: LocalUser = JSON.parse(userJson);
        setUser(localUser);
        await loadUserData(localUser.uid);
      } else {
        // No user stored, create a default guest user
        const guestUser: LocalUser = {
          uid: `guest_${Date.now()}`,
          email: undefined,
          displayName: 'Guest User',
        };
        await initializeUser(guestUser);
      }
    } catch (error) {
      console.error('Error loading local user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize user (replaces Firebase auth)
  const initializeUser = async (userData: LocalUser, profileData?: Partial<UserProfile>) => {
    try {
      // Save user to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      setUser(userData);

      // Create or update user profile
      const defaultProfile: UserProfile = {
        userId: userData.uid,
        email: userData.email || '',
        displayName: userData.displayName || 'User',
        photoURL: undefined,
        createdAt: new Date(),
        lastActiveAt: new Date(),
        testDate: undefined,
        studyGoalMinutesPerDay: 30,
        notificationsEnabled: true,
        preferences: {
          theme: 'light',
          studyReminders: true,
          soundEffects: true,
          hapticFeedback: true,
        },
        ...profileData,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(defaultProfile));
      setUserProfile(defaultProfile);

      // Load or initialize user data
      await loadUserData(userData.uid);
    } catch (error) {
      console.error('Error initializing user:', error);
      throw error;
    }
  };

  // Load user data from AsyncStorage
  const loadUserData = async (uid: string) => {
    try {
      // Load user profile
      const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (profileJson) {
        const data = JSON.parse(profileJson);
        setUserProfile({
          ...data,
          createdAt: new Date(data.createdAt),
          lastActiveAt: new Date(data.lastActiveAt),
          testDate: data.testDate ? new Date(data.testDate) : undefined,
        } as UserProfile);
      }

      // Load user progress
      const progressJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
      if (progressJson) {
        const data = JSON.parse(progressJson);
        setUserProgress({
          ...data,
          lastStudyDate: new Date(data.lastStudyDate),
          badges: data.badges?.map((b: any) => ({
            ...b,
            earnedAt: new Date(b.earnedAt),
          })) || [],
          questionProgress: data.questionProgress || {},
        } as UserProgress);
      } else {
        // Initialize progress for new user
        const initialProgress: UserProgress = {
          userId: uid,
          totalQuestionsAttempted: 0,
          totalCorrectAnswers: 0,
          overallAccuracy: 0,
          streakDays: 0,
          lastStudyDate: new Date(),
          totalStudyMinutes: 0,
          totalPoints: 0,
          level: 1,
          badges: [],
          questionProgress: {},
          categoryProgress: {},
        };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(initialProgress));
        setUserProgress(initialProgress);
      }

      // Load study sessions
      const sessionsJson = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
      if (sessionsJson) {
        const sessions = JSON.parse(sessionsJson).map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined,
        })) as StudySession[];
        setStudySessions(sessions);
      } else {
        setStudySessions([]);
      }

      // Load or generate daily challenges
      const challengesJson = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGES);
      const today = new Date().toISOString().split('T')[0];

      if (challengesJson) {
        const storedData = JSON.parse(challengesJson);
        // Check if challenges are for today
        if (storedData.date === today) {
          setDailyChallenges(storedData.challenges);
        } else {
          // Generate new challenges for today
          const newChallenges = gamificationService.generateDailyChallenges();
          await AsyncStorage.setItem(
            STORAGE_KEYS.DAILY_CHALLENGES,
            JSON.stringify({ date: today, challenges: newChallenges })
          );
          setDailyChallenges(newChallenges);
        }
      } else {
        // Generate initial challenges
        const newChallenges = gamificationService.generateDailyChallenges();
        await AsyncStorage.setItem(
          STORAGE_KEYS.DAILY_CHALLENGES,
          JSON.stringify({ date: today, challenges: newChallenges })
        );
        setDailyChallenges(newChallenges);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return;

    try {
      const updatedProfile = {
        ...userProfile,
        ...updates,
        lastActiveAt: new Date(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Record a study session
  const recordStudySession = async (session: Omit<StudySession, 'id'>) => {
    if (!user || !userProgress) return;

    try {
      // Create new session with ID
      const newSession: StudySession = {
        ...session,
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.uid,
        endTime: session.endTime || new Date(),
      };

      // Add to sessions list (keep last 50)
      const updatedSessions = [newSession, ...studySessions].slice(0, 50);
      await AsyncStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(updatedSessions));
      setStudySessions(updatedSessions);

      // Calculate points earned
      const { points } = gamificationService.awardPoints(
        'STUDY_SESSION_COMPLETE',
        userProgress
      );

      // Bonus points for high accuracy
      let bonusPoints = 0;
      if (session.accuracy === 100) {
        bonusPoints += gamificationService.calculatePoints('PERFECT_SESSION');
      }

      // Update user progress
      const newTotalPoints = userProgress.totalPoints + points + bonusPoints;
      const newLevel = gamificationService.calculateLevel(newTotalPoints);
      const newTotalMinutes = userProgress.totalStudyMinutes + session.durationMinutes;

      // Check for streak
      const lastStudyDate = new Date(userProgress.lastStudyDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastStudyDate.setHours(0, 0, 0, 0);

      const daysSinceLastStudy = Math.floor(
        (today.getTime() - lastStudyDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      let newStreakDays = userProgress.streakDays;
      if (daysSinceLastStudy === 1) {
        newStreakDays += 1;
      } else if (daysSinceLastStudy > 1) {
        newStreakDays = 1;
      }

      // Check for new badges
      const newBadges = gamificationService.checkBadges(
        { ...userProgress, totalPoints: newTotalPoints, streakDays: newStreakDays },
        updatedSessions,
        userProgress.badges
      );

      // Award badge points
      const badgePoints = newBadges.reduce((sum, badge) => {
        const badgeInfo = gamificationService.getBadgeInfo(badge.id);
        return sum + (badgeInfo?.points || 0);
      }, 0);

      const updatedProgress: UserProgress = {
        ...userProgress,
        totalStudyMinutes: newTotalMinutes,
        totalPoints: newTotalPoints + badgePoints,
        level: newLevel,
        streakDays: newStreakDays,
        lastStudyDate: new Date(),
        badges: [...userProgress.badges, ...newBadges],
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(updatedProgress));
      setUserProgress(updatedProgress);

    } catch (error) {
      console.error('Error recording study session:', error);
      throw error;
    }
  };

  // Update question progress
  const updateQuestionProgress = async (
    questionId: string,
    correct: boolean,
    rating: number
  ) => {
    if (!user || !userProgress) return;

    try {
      const existingProgress = userProgress.questionProgress[questionId] || {
        questionId,
        totalAttempts: 0,
        correctAttempts: 0,
        lastAttemptDate: new Date(),
        lastAnswerCorrect: false,
        nextReviewDate: new Date(),
        difficultyLevel: 2.5,
        consecutiveCorrect: 0,
      };

      // Calculate new progress using spaced repetition
      const newProgress = spacedRepetitionService.calculateNextReview(
        existingProgress,
        rating
      );

      // Update overall stats
      const newTotalAttempted = userProgress.totalQuestionsAttempted + 1;
      const newTotalCorrect = userProgress.totalCorrectAnswers + (correct ? 1 : 0);
      const newAccuracy = (newTotalCorrect / newTotalAttempted) * 100;

      // Calculate points
      const pointsAction = correct
        ? (existingProgress.totalAttempts === 0 ? 'FIRST_ATTEMPT_CORRECT' : 'CORRECT_ANSWER')
        : 'CORRECT_ANSWER';

      const { points } = correct
        ? gamificationService.awardPoints(pointsAction, userProgress)
        : { points: 0 };

      const updatedProgress: UserProgress = {
        ...userProgress,
        questionProgress: {
          ...userProgress.questionProgress,
          [questionId]: newProgress,
        },
        totalQuestionsAttempted: newTotalAttempted,
        totalCorrectAnswers: newTotalCorrect,
        overallAccuracy: newAccuracy,
        totalPoints: userProgress.totalPoints + points,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(updatedProgress));
      setUserProgress(updatedProgress);

    } catch (error) {
      console.error('Error updating question progress:', error);
      throw error;
    }
  };

  // Complete a daily challenge
  const completeChallenge = async (challengeId: string) => {
    if (!user || !userProgress) return;

    try {
      const challenge = dailyChallenges.find(c => c.id === challengeId);
      if (!challenge || challenge.completed) return;

      // Mark challenge as completed
      const updatedChallenges = dailyChallenges.map(c =>
        c.id === challengeId ? { ...c, completed: true } : c
      );

      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(
        STORAGE_KEYS.DAILY_CHALLENGES,
        JSON.stringify({ date: today, challenges: updatedChallenges })
      );
      setDailyChallenges(updatedChallenges);

      // Award points
      const { points } = gamificationService.awardPoints('CHALLENGE_COMPLETE', userProgress);

      const updatedProgress: UserProgress = {
        ...userProgress,
        totalPoints: userProgress.totalPoints + points,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(updatedProgress));
      setUserProgress(updatedProgress);

    } catch (error) {
      console.error('Error completing challenge:', error);
      throw error;
    }
  };

  // Refresh progress data
  const refreshProgress = async () => {
    if (!user) return;
    await loadUserData(user.uid);
  };

  // Sign out (clear all local data)
  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.USER_PROGRESS,
        STORAGE_KEYS.STUDY_SESSIONS,
        STORAGE_KEYS.DAILY_CHALLENGES,
      ]);

      setUser(null);
      setUserProfile(null);
      setUserProgress(null);
      setStudySessions([]);
      setDailyChallenges([]);

      // Re-initialize with guest user
      await loadLocalUserData();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Computed values
  const level = userProgress ? gamificationService.calculateLevel(userProgress.totalPoints) : 1;
  const pointsToNextLevel = userProgress
    ? gamificationService.getPointsToNextLevel(userProgress.totalPoints)
    : { current: 0, needed: 100, percentage: 0 };
  const engagementScore = userProgress
    ? gamificationService.calculateEngagementScore(userProgress, studySessions)
    : 0;
  const passProbability = userProgress
    ? spacedRepetitionService.predictPassProbability(userProgress.questionProgress, 128)
    : 0;

  const value: UserContextType = {
    user,
    userProfile,
    loading,
    userProgress,
    studySessions,
    dailyChallenges,
    updateUserProfile,
    recordStudySession,
    updateQuestionProgress,
    completeChallenge,
    level,
    pointsToNextLevel,
    engagementScore,
    passProbability,
    refreshProgress,
    signOut,
    initializeUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
