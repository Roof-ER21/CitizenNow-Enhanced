/**
 * Firestore Service - DEPRECATED
 *
 * Firebase/Firestore has been removed from this application.
 * All data is now stored locally using AsyncStorage via UserContext.
 * This file is kept as a stub for backward compatibility.
 *
 * @deprecated Use UserContext for local data management
 * @module firestoreService
 */

import {
  UserProfile,
  UserProgress,
  QuestionProgress,
  StudySession,
  AISession,
  Badge,
} from '../types';

/**
 * FirestoreService class - STUBBED OUT
 * All methods throw errors directing to use UserContext instead
 */
export class FirestoreService {
  async saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    throw new Error('Firestore disabled. Use UserContext for local user management.');
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    throw new Error('Firestore disabled. Use UserContext for local user management.');
  }

  async saveUserProgress(userId: string, progress: UserProgress): Promise<void> {
    throw new Error('Firestore disabled. Use UserContext for local progress tracking.');
  }

  async getUserProgress(userId: string): Promise<UserProgress | null> {
    throw new Error('Firestore disabled. Use UserContext for local progress tracking.');
  }

  async updateQuestionProgress(
    userId: string,
    questionId: string,
    progress: QuestionProgress
  ): Promise<void> {
    throw new Error('Firestore disabled. Use UserContext for local progress tracking.');
  }

  async batchUpdateQuestionProgress(
    userId: string,
    progressUpdates: { [questionId: string]: QuestionProgress }
  ): Promise<void> {
    throw new Error('Firestore disabled. Use UserContext for local progress tracking.');
  }

  async saveStudySession(session: StudySession): Promise<void> {
    throw new Error('Firestore disabled. Use UserContext for local session tracking.');
  }

  async getRecentStudySessions(
    userId: string,
    limitCount: number = 10
  ): Promise<StudySession[]> {
    throw new Error('Firestore disabled. Use UserContext for local session tracking.');
  }

  async saveAISession(session: AISession): Promise<void> {
    throw new Error('Firestore disabled. Use UserContext for local session tracking.');
  }

  async getRecentAISessions(
    userId: string,
    sessionType?: 'interview' | 'speech_practice' | 'n400_assistant',
    limitCount: number = 10
  ): Promise<AISession[]> {
    throw new Error('Firestore disabled. Use UserContext for local session tracking.');
  }

  async addBadge(userId: string, badge: Badge): Promise<void> {
    throw new Error('Firestore disabled. Use UserContext for local badge management.');
  }

  async updateUserStatistics(
    userId: string,
    updates: {
      totalPoints?: number;
      level?: number;
      streakDays?: number;
      totalStudyMinutes?: number;
    }
  ): Promise<void> {
    throw new Error('Firestore disabled. Use UserContext for local statistics.');
  }

  async updateLeaderboard(
    userId: string,
    userName: string,
    totalPoints: number
  ): Promise<void> {
    // No-op - leaderboard not available in local-only mode
    console.warn('Leaderboard not available in local-only mode');
  }

  async getLeaderboard(limitCount: number = 50) {
    // Return empty leaderboard
    return [];
  }

  async deleteUserData(userId: string): Promise<void> {
    throw new Error('Firestore disabled. Use UserContext for local data management.');
  }
}

// Export singleton instance (stubbed)
export const firestoreService = new FirestoreService();
