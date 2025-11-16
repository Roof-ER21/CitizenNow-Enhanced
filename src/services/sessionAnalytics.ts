/**
 * Session Analytics & History Tracking - CitizenNow Enhanced
 *
 * Track user progress across multiple sessions, identify trends,
 * and provide historical insights.
 */

import { SessionAnalysis } from './interviewCoaching';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SessionHistory {
  sessionId: string;
  timestamp: Date;
  mode: string;
  difficulty: string;
  scenario?: string;
  duration: number; // minutes
  questionsAsked: number;
  correctAnswers: number;
  accuracyRate: number;
  overallScore: number;
  readinessLevel: string;
  predictedPassProbability: number;
}

export interface ProgressTrend {
  metric: 'accuracy' | 'confidence' | 'clarity' | 'overall';
  trend: 'improving' | 'stable' | 'declining';
  changePercentage: number; // positive or negative
  dataPoints: { date: Date; value: number }[];
}

export interface CategoryPerformance {
  category: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracyRate: number;
  averageResponseTime: number;
  lastPracticed: Date;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface OverallStatistics {
  totalSessions: number;
  totalPracticeTime: number; // minutes
  totalQuestions: number;
  totalCorrect: number;
  overallAccuracy: number;
  currentStreak: number; // consecutive days
  longestStreak: number;
  lastPracticeDate: Date;
  firstPracticeDate: Date;
  averageSessionDuration: number;
  favoriteMode: string;
  categoryPerformance: CategoryPerformance[];
  readinessScore: number; // 0-100
  estimatedReadyDate?: Date;
}

export interface MilestoneAchievement {
  id: string;
  name: string;
  description: string;
  achievedAt: Date;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

const STORAGE_KEYS = {
  SESSION_HISTORY: 'citizennow_session_history',
  OVERALL_STATS: 'citizennow_overall_stats',
  MILESTONES: 'citizennow_milestones',
  DAILY_STREAK: 'citizennow_daily_streak',
};

/**
 * Session Analytics Manager
 */
export class SessionAnalyticsService {
  /**
   * Save a completed session
   */
  static async saveSession(analysis: SessionAnalysis, mode: string, difficulty: string, scenario?: string): Promise<void> {
    try {
      const sessionRecord: SessionHistory = {
        sessionId: analysis.sessionId,
        timestamp: analysis.startTime,
        mode,
        difficulty,
        scenario,
        duration: (analysis.endTime.getTime() - analysis.startTime.getTime()) / 60000,
        questionsAsked: analysis.totalQuestions,
        correctAnswers: analysis.correctAnswers,
        accuracyRate: analysis.performanceMetrics.accuracyRate,
        overallScore: analysis.performanceMetrics.overallReadiness,
        readinessLevel: analysis.readinessLevel,
        predictedPassProbability: analysis.predictedPassProbability,
      };

      // Get existing history
      const history = await this.getSessionHistory();
      history.unshift(sessionRecord); // Add to beginning

      // Keep only last 100 sessions
      const trimmedHistory = history.slice(0, 100);

      // Save updated history
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(trimmedHistory));

      // Update overall statistics
      await this.updateOverallStatistics(sessionRecord);

      // Check for milestone achievements
      await this.checkMilestones(trimmedHistory);

      // Update daily streak
      await this.updateDailyStreak();
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  /**
   * Get session history
   */
  static async getSessionHistory(limit?: number): Promise<SessionHistory[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
      if (!data) return [];

      const history: SessionHistory[] = JSON.parse(data);
      // Convert timestamp strings back to Date objects
      const parsedHistory = history.map(session => ({
        ...session,
        timestamp: new Date(session.timestamp),
      }));

      return limit ? parsedHistory.slice(0, limit) : parsedHistory;
    } catch (error) {
      console.error('Error getting session history:', error);
      return [];
    }
  }

  /**
   * Update overall statistics
   */
  private static async updateOverallStatistics(session: SessionHistory): Promise<void> {
    try {
      const stats = await this.getOverallStatistics();

      stats.totalSessions += 1;
      stats.totalPracticeTime += session.duration;
      stats.totalQuestions += session.questionsAsked;
      stats.totalCorrect += session.correctAnswers;
      stats.overallAccuracy = (stats.totalCorrect / stats.totalQuestions) * 100;
      stats.lastPracticeDate = session.timestamp;
      stats.averageSessionDuration = stats.totalPracticeTime / stats.totalSessions;

      // Update favorite mode
      const history = await this.getSessionHistory();
      const modeCounts: { [key: string]: number } = {};
      history.forEach(s => {
        modeCounts[s.mode] = (modeCounts[s.mode] || 0) + 1;
      });
      stats.favoriteMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'full';

      // Update readiness score (weighted average of recent sessions)
      const recentSessions = history.slice(0, 10);
      if (recentSessions.length > 0) {
        stats.readinessScore = recentSessions.reduce((sum, s) => sum + s.overallScore, 0) / recentSessions.length;
      }

      // Estimate ready date if not ready yet
      if (stats.readinessScore < 80) {
        stats.estimatedReadyDate = this.estimateReadyDate(history);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.OVERALL_STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  }

  /**
   * Get overall statistics
   */
  static async getOverallStatistics(): Promise<OverallStatistics> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OVERALL_STATS);
      if (!data) {
        return this.getDefaultStatistics();
      }

      const stats: OverallStatistics = JSON.parse(data);
      // Convert date strings back to Date objects
      stats.lastPracticeDate = new Date(stats.lastPracticeDate);
      stats.firstPracticeDate = new Date(stats.firstPracticeDate);
      if (stats.estimatedReadyDate) {
        stats.estimatedReadyDate = new Date(stats.estimatedReadyDate);
      }

      return stats;
    } catch (error) {
      console.error('Error getting statistics:', error);
      return this.getDefaultStatistics();
    }
  }

  /**
   * Get default statistics for new users
   */
  private static getDefaultStatistics(): OverallStatistics {
    return {
      totalSessions: 0,
      totalPracticeTime: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      overallAccuracy: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: new Date(),
      firstPracticeDate: new Date(),
      averageSessionDuration: 0,
      favoriteMode: 'full',
      categoryPerformance: [],
      readinessScore: 0,
    };
  }

  /**
   * Calculate progress trends
   */
  static async getProgressTrends(metric: ProgressTrend['metric'], days: number = 30): Promise<ProgressTrend> {
    const history = await this.getSessionHistory();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentSessions = history.filter(s => new Date(s.timestamp) >= cutoffDate);

    let dataPoints: { date: Date; value: number }[] = [];

    switch (metric) {
      case 'accuracy':
        dataPoints = recentSessions.map(s => ({
          date: new Date(s.timestamp),
          value: s.accuracyRate,
        }));
        break;
      case 'overall':
        dataPoints = recentSessions.map(s => ({
          date: new Date(s.timestamp),
          value: s.overallScore,
        }));
        break;
      default:
        dataPoints = recentSessions.map(s => ({
          date: new Date(s.timestamp),
          value: s.overallScore,
        }));
    }

    // Calculate trend
    const { trend, changePercentage } = this.calculateTrend(dataPoints);

    return {
      metric,
      trend,
      changePercentage,
      dataPoints: dataPoints.reverse(), // Oldest to newest for charting
    };
  }

  /**
   * Calculate trend direction and percentage change
   */
  private static calculateTrend(dataPoints: { date: Date; value: number }[]): {
    trend: 'improving' | 'stable' | 'declining';
    changePercentage: number;
  } {
    if (dataPoints.length < 2) {
      return { trend: 'stable', changePercentage: 0 };
    }

    // Compare first half to second half
    const midpoint = Math.floor(dataPoints.length / 2);
    const firstHalf = dataPoints.slice(0, midpoint);
    const secondHalf = dataPoints.slice(midpoint);

    const firstAvg = firstHalf.reduce((sum, dp) => sum + dp.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, dp) => sum + dp.value, 0) / secondHalf.length;

    const changePercentage = ((secondAvg - firstAvg) / firstAvg) * 100;

    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (changePercentage > 5) trend = 'improving';
    else if (changePercentage < -5) trend = 'declining';

    return { trend, changePercentage: Math.round(changePercentage * 10) / 10 };
  }

  /**
   * Update daily streak
   */
  private static async updateDailyStreak(): Promise<void> {
    try {
      const stats = await this.getOverallStatistics();
      const today = new Date().toDateString();
      const lastPractice = new Date(stats.lastPracticeDate).toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (today === lastPractice) {
        // Already practiced today, streak continues
        return;
      } else if (yesterdayStr === lastPractice) {
        // Practiced yesterday, increment streak
        stats.currentStreak += 1;
        if (stats.currentStreak > stats.longestStreak) {
          stats.longestStreak = stats.currentStreak;
        }
      } else {
        // Broke the streak
        stats.currentStreak = 1;
      }

      await AsyncStorage.setItem(STORAGE_KEYS.OVERALL_STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }

  /**
   * Get current streak
   */
  static async getCurrentStreak(): Promise<number> {
    const stats = await this.getOverallStatistics();
    return stats.currentStreak;
  }

  /**
   * Estimate when user will be ready
   */
  private static estimateReadyDate(history: SessionHistory[]): Date | undefined {
    if (history.length < 3) return undefined;

    const recentSessions = history.slice(0, 10);
    const trend = this.calculateTrend(
      recentSessions.map(s => ({ date: new Date(s.timestamp), value: s.overallScore }))
    );

    if (trend.trend !== 'improving') return undefined;

    // Current score
    const currentScore = recentSessions[0].overallScore;
    const targetScore = 80;

    if (currentScore >= targetScore) return undefined;

    // Points needed
    const pointsNeeded = targetScore - currentScore;

    // Average improvement per session
    const avgImprovement = Math.abs(trend.changePercentage) / recentSessions.length;

    if (avgImprovement === 0) return undefined;

    // Sessions needed
    const sessionsNeeded = Math.ceil(pointsNeeded / avgImprovement);

    // Estimate date (assuming 2 sessions per week)
    const weeksNeeded = Math.ceil(sessionsNeeded / 2);
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + weeksNeeded * 7);

    return estimatedDate;
  }

  /**
   * Check and award milestones
   */
  private static async checkMilestones(history: SessionHistory[]): Promise<void> {
    const stats = await this.getOverallStatistics();
    const milestones = await this.getMilestones();
    const newMilestones: MilestoneAchievement[] = [];

    // First interview milestone
    if (stats.totalSessions === 1 && !milestones.find(m => m.id === 'first_interview')) {
      newMilestones.push({
        id: 'first_interview',
        name: 'First Steps',
        description: 'Completed your first interview practice session',
        achievedAt: new Date(),
        icon: '🎯',
        rarity: 'common',
      });
    }

    // 10 sessions milestone
    if (stats.totalSessions === 10 && !milestones.find(m => m.id === 'ten_sessions')) {
      newMilestones.push({
        id: 'ten_sessions',
        name: 'Dedicated Learner',
        description: 'Completed 10 interview practice sessions',
        achievedAt: new Date(),
        icon: '📚',
        rarity: 'uncommon',
      });
    }

    // 50 sessions milestone
    if (stats.totalSessions === 50 && !milestones.find(m => m.id === 'fifty_sessions')) {
      newMilestones.push({
        id: 'fifty_sessions',
        name: 'Interview Master',
        description: 'Completed 50 interview practice sessions',
        achievedAt: new Date(),
        icon: '🏆',
        rarity: 'rare',
      });
    }

    // 7-day streak
    if (stats.currentStreak === 7 && !milestones.find(m => m.id === 'week_streak')) {
      newMilestones.push({
        id: 'week_streak',
        name: 'Week Warrior',
        description: 'Practiced for 7 consecutive days',
        achievedAt: new Date(),
        icon: '🔥',
        rarity: 'uncommon',
      });
    }

    // 30-day streak
    if (stats.currentStreak === 30 && !milestones.find(m => m.id === 'month_streak')) {
      newMilestones.push({
        id: 'month_streak',
        name: 'Unstoppable',
        description: 'Practiced for 30 consecutive days',
        achievedAt: new Date(),
        icon: '🔥🔥',
        rarity: 'epic',
      });
    }

    // Perfect score
    const perfectSession = history.find(s => s.accuracyRate === 100);
    if (perfectSession && !milestones.find(m => m.id === 'perfect_score')) {
      newMilestones.push({
        id: 'perfect_score',
        name: 'Flawless Victory',
        description: 'Achieved 100% accuracy in a session',
        achievedAt: new Date(),
        icon: '💯',
        rarity: 'rare',
      });
    }

    // Ready for test
    if (stats.readinessScore >= 80 && !milestones.find(m => m.id === 'ready_for_test')) {
      newMilestones.push({
        id: 'ready_for_test',
        name: 'Interview Ready',
        description: 'Achieved readiness score of 80 or higher',
        achievedAt: new Date(),
        icon: '🌟',
        rarity: 'epic',
      });
    }

    // Expert level
    if (stats.readinessScore >= 95 && !milestones.find(m => m.id === 'expert_level')) {
      newMilestones.push({
        id: 'expert_level',
        name: 'Citizenship Expert',
        description: 'Achieved expert-level readiness (95+)',
        achievedAt: new Date(),
        icon: '👑',
        rarity: 'legendary',
      });
    }

    // Save new milestones
    if (newMilestones.length > 0) {
      const updatedMilestones = [...milestones, ...newMilestones];
      await AsyncStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(updatedMilestones));
    }
  }

  /**
   * Get all milestones
   */
  static async getMilestones(): Promise<MilestoneAchievement[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MILESTONES);
      if (!data) return [];

      const milestones: MilestoneAchievement[] = JSON.parse(data);
      return milestones.map(m => ({
        ...m,
        achievedAt: new Date(m.achievedAt),
      }));
    } catch (error) {
      console.error('Error getting milestones:', error);
      return [];
    }
  }

  /**
   * Get new milestones (last 24 hours)
   */
  static async getNewMilestones(): Promise<MilestoneAchievement[]> {
    const milestones = await this.getMilestones();
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    return milestones.filter(m => new Date(m.achievedAt) >= oneDayAgo);
  }

  /**
   * Clear all data (for testing/reset)
   */
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SESSION_HISTORY,
        STORAGE_KEYS.OVERALL_STATS,
        STORAGE_KEYS.MILESTONES,
        STORAGE_KEYS.DAILY_STREAK,
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  /**
   * Export data (for backup or sharing)
   */
  static async exportData(): Promise<{
    history: SessionHistory[];
    stats: OverallStatistics;
    milestones: MilestoneAchievement[];
  }> {
    const history = await this.getSessionHistory();
    const stats = await this.getOverallStatistics();
    const milestones = await this.getMilestones();

    return { history, stats, milestones };
  }

  /**
   * Import data (from backup)
   */
  static async importData(data: {
    history: SessionHistory[];
    stats: OverallStatistics;
    milestones: MilestoneAchievement[];
  }): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(data.history));
      await AsyncStorage.setItem(STORAGE_KEYS.OVERALL_STATS, JSON.stringify(data.stats));
      await AsyncStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(data.milestones));
    } catch (error) {
      console.error('Error importing data:', error);
    }
  }
}
