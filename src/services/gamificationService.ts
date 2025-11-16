// Gamification Service - Points, Badges, Levels, and Achievements
import { Badge, UserProgress, StudySession, DailyChallenge } from '../types';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  condition: (progress: UserProgress, sessions: StudySession[]) => boolean;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface PointsBreakdown {
  action: string;
  points: number;
  multiplier?: number;
  timestamp: Date;
}

export class GamificationService {
  // Points system
  private readonly POINTS = {
    CORRECT_ANSWER: 10,
    PERFECT_SESSION: 50, // 100% accuracy
    DAILY_LOGIN: 5,
    STREAK_BONUS: 25, // Per week of streak
    FIRST_ATTEMPT_CORRECT: 15,
    COMPLETE_CATEGORY: 100,
    MOCK_EXAM_PASS: 200,
    AI_INTERVIEW_COMPLETE: 75,
    SPEECH_PRACTICE: 20,
    STUDY_SESSION_COMPLETE: 30,
    READING_PRACTICE: 15,
    WRITING_PRACTICE: 15,
    CHALLENGE_COMPLETE: 100,
  };

  // Level thresholds (exponential growth)
  private readonly LEVEL_THRESHOLDS = [
    0,     // Level 1
    100,   // Level 2
    300,   // Level 3
    600,   // Level 4
    1000,  // Level 5
    1500,  // Level 6
    2200,  // Level 7
    3000,  // Level 8
    4000,  // Level 9
    5500,  // Level 10
  ];

  // Badge definitions
  private readonly BADGES: Achievement[] = [
    // Streak Badges
    {
      id: 'streak_3',
      name: 'Getting Started',
      description: 'Study for 3 days in a row',
      icon: '🔥',
      points: 50,
      tier: 'bronze',
      condition: (progress) => progress.streakDays >= 3,
    },
    {
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Study for 7 days in a row',
      icon: '⚡',
      points: 100,
      tier: 'silver',
      condition: (progress) => progress.streakDays >= 7,
    },
    {
      id: 'streak_30',
      name: 'Month Master',
      description: 'Study for 30 days in a row',
      icon: '💎',
      points: 300,
      tier: 'gold',
      condition: (progress) => progress.streakDays >= 30,
    },
    {
      id: 'streak_100',
      name: 'Dedication Legend',
      description: 'Study for 100 days in a row',
      icon: '👑',
      points: 1000,
      tier: 'platinum',
      condition: (progress) => progress.streakDays >= 100,
    },

    // Mastery Badges
    {
      id: 'accuracy_90',
      name: 'Sharp Mind',
      description: 'Achieve 90% accuracy on 50+ questions',
      icon: '🎯',
      points: 150,
      tier: 'silver',
      condition: (progress) =>
        progress.totalQuestionsAttempted >= 50 && progress.overallAccuracy >= 90,
    },
    {
      id: 'accuracy_95',
      name: 'Precision Expert',
      description: 'Achieve 95% accuracy on 100+ questions',
      icon: '🏆',
      points: 300,
      tier: 'gold',
      condition: (progress) =>
        progress.totalQuestionsAttempted >= 100 && progress.overallAccuracy >= 95,
    },
    {
      id: 'perfect_100',
      name: 'Perfection',
      description: 'Achieve 100% accuracy on 50+ questions',
      icon: '⭐',
      points: 500,
      tier: 'platinum',
      condition: (progress) =>
        progress.totalQuestionsAttempted >= 50 && progress.overallAccuracy === 100,
    },

    // Milestone Badges
    {
      id: 'questions_50',
      name: 'Quick Learner',
      description: 'Answer 50 questions',
      icon: '📚',
      points: 75,
      tier: 'bronze',
      condition: (progress) => progress.totalQuestionsAttempted >= 50,
    },
    {
      id: 'questions_100',
      name: 'Civic Scholar',
      description: 'Answer 100 questions',
      icon: '🎓',
      points: 150,
      tier: 'silver',
      condition: (progress) => progress.totalQuestionsAttempted >= 100,
    },
    {
      id: 'questions_500',
      name: 'Civic Master',
      description: 'Answer 500 questions',
      icon: '🏅',
      points: 500,
      tier: 'gold',
      condition: (progress) => progress.totalQuestionsAttempted >= 500,
    },
    {
      id: 'all_categories',
      name: 'Complete Understanding',
      description: 'Master all categories with 80%+ accuracy',
      icon: '🌟',
      points: 400,
      tier: 'gold',
      condition: (progress) => {
        const categories = Object.values(progress.categoryProgress);
        return categories.length >= 5 &&
               categories.every(cat => cat.attempted >= 10 && cat.accuracy >= 80);
      },
    },

    // Special Badges
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Study before 7 AM (5 times)',
      icon: '🌅',
      points: 100,
      tier: 'bronze',
      condition: (progress, sessions) => {
        const earlyBirdSessions = sessions.filter(s => {
          const hour = new Date(s.startTime).getHours();
          return hour >= 5 && hour < 7;
        });
        return earlyBirdSessions.length >= 5;
      },
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Study after 10 PM (5 times)',
      icon: '🦉',
      points: 100,
      tier: 'bronze',
      condition: (progress, sessions) => {
        const nightOwlSessions = sessions.filter(s => {
          const hour = new Date(s.startTime).getHours();
          return hour >= 22 || hour < 5;
        });
        return nightOwlSessions.length >= 5;
      },
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete a 20-question quiz in under 5 minutes',
      icon: '⚡',
      points: 200,
      tier: 'silver',
      condition: (progress, sessions) => {
        return sessions.some(s =>
          s.sessionType === 'quiz' &&
          s.totalQuestions >= 20 &&
          s.durationMinutes < 5
        );
      },
    },
    {
      id: 'study_marathon',
      name: 'Study Marathon',
      description: 'Study for 60+ minutes in one session',
      icon: '🏃',
      points: 150,
      tier: 'silver',
      condition: (progress, sessions) => {
        return sessions.some(s => s.durationMinutes >= 60);
      },
    },
    {
      id: 'ai_champion',
      name: 'AI Interview Champion',
      description: 'Complete 10 AI interview sessions',
      icon: '🤖',
      points: 250,
      tier: 'gold',
      condition: (progress, sessions) => {
        const aiSessions = sessions.filter(s => s.sessionType === 'ai_interview');
        return aiSessions.length >= 10;
      },
    },
    {
      id: 'ready_for_test',
      name: 'Ready for the Test',
      description: 'Pass 3 consecutive mock exams with 85%+',
      icon: '🎖️',
      points: 500,
      tier: 'platinum',
      condition: (progress, sessions) => {
        const mockExams = sessions
          .filter(s => s.sessionType === 'quiz')
          .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
          .slice(0, 3);

        return mockExams.length === 3 &&
               mockExams.every(exam => exam.accuracy >= 85);
      },
    },
  ];

  // Calculate points for an action
  calculatePoints(action: keyof typeof this.POINTS, multiplier: number = 1): number {
    return Math.round(this.POINTS[action] * multiplier);
  }

  // Calculate streak multiplier
  getStreakMultiplier(streakDays: number): number {
    if (streakDays >= 30) return 2.0;
    if (streakDays >= 14) return 1.5;
    if (streakDays >= 7) return 1.25;
    return 1.0;
  }

  // Award points for a study action
  awardPoints(
    action: keyof typeof this.POINTS,
    progress: UserProgress,
    additionalMultiplier: number = 1
  ): { points: number; breakdown: PointsBreakdown } {
    const streakMultiplier = this.getStreakMultiplier(progress.streakDays);
    const totalMultiplier = streakMultiplier * additionalMultiplier;
    const points = this.calculatePoints(action, totalMultiplier);

    return {
      points,
      breakdown: {
        action,
        points: this.POINTS[action],
        multiplier: totalMultiplier,
        timestamp: new Date(),
      },
    };
  }

  // Calculate user level based on total points
  calculateLevel(totalPoints: number): number {
    for (let i = this.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalPoints >= this.LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  // Get points needed for next level
  getPointsToNextLevel(totalPoints: number): { current: number; needed: number; percentage: number } {
    const currentLevel = this.calculateLevel(totalPoints);

    if (currentLevel >= this.LEVEL_THRESHOLDS.length) {
      return { current: 0, needed: 0, percentage: 100 };
    }

    const currentThreshold = this.LEVEL_THRESHOLDS[currentLevel - 1];
    const nextThreshold = this.LEVEL_THRESHOLDS[currentLevel];
    const pointsInCurrentLevel = totalPoints - currentThreshold;
    const pointsNeededForLevel = nextThreshold - currentThreshold;
    const percentage = (pointsInCurrentLevel / pointsNeededForLevel) * 100;

    return {
      current: pointsInCurrentLevel,
      needed: pointsNeededForLevel - pointsInCurrentLevel,
      percentage: Math.min(100, percentage),
    };
  }

  // Check for newly earned badges
  checkBadges(
    progress: UserProgress,
    sessions: StudySession[],
    currentBadges: Badge[]
  ): Badge[] {
    const newBadges: Badge[] = [];
    const earnedBadgeIds = currentBadges.map(b => b.id);

    for (const achievement of this.BADGES) {
      if (!earnedBadgeIds.includes(achievement.id)) {
        if (achievement.condition(progress, sessions)) {
          newBadges.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            iconUrl: achievement.icon,
            earnedAt: new Date(),
            type: this.getBadgeType(achievement.id),
          });
        }
      }
    }

    return newBadges;
  }

  private getBadgeType(badgeId: string): Badge['type'] {
    if (badgeId.startsWith('streak')) return 'streak';
    if (badgeId.startsWith('accuracy') || badgeId.includes('perfect')) return 'mastery';
    if (badgeId.startsWith('questions') || badgeId.includes('all')) return 'milestone';
    return 'special';
  }

  // Generate daily challenges
  generateDailyChallenges(date: Date = new Date()): DailyChallenge[] {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    const challenges: DailyChallenge[] = [];

    // Daily challenge: answer questions correctly
    challenges.push({
      id: `${dateStr}_correct_answers`,
      date: dateStr,
      challengeType: 'quiz',
      description: 'Answer 20 questions correctly today',
      requirement: 20,
      reward: 100,
      completed: false,
    });

    // Weekday-specific challenges
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend: Study marathon
      challenges.push({
        id: `${dateStr}_weekend_study`,
        date: dateStr,
        challengeType: 'quiz',
        description: 'Study for 30 minutes this weekend',
        requirement: 30,
        reward: 150,
        completed: false,
      });
    } else {
      // Weekday: Consistency challenge
      challenges.push({
        id: `${dateStr}_streak`,
        date: dateStr,
        challengeType: 'streak',
        description: 'Maintain your study streak',
        requirement: 1,
        reward: 50,
        completed: false,
      });
    }

    // Category-specific challenge (rotates by day of week)
    const categories = [
      'american_government',
      'american_history',
      'integrated_civics',
      'geography',
      'symbols',
    ];
    const categoryIndex = dayOfWeek % categories.length;
    const category = categories[categoryIndex];

    challenges.push({
      id: `${dateStr}_category_${category}`,
      date: dateStr,
      challengeType: 'category_mastery',
      description: `Master ${category.replace(/_/g, ' ')} with 80%+ accuracy (10 questions)`,
      requirement: 10,
      reward: 125,
      completed: false,
    });

    return challenges;
  }

  // Calculate study statistics
  calculateStudyStats(sessions: StudySession[]): {
    totalSessions: number;
    totalMinutes: number;
    averageAccuracy: number;
    bestStreak: number;
    favoriteSessionType: string;
    mostActiveHour: number;
    weeklyProgress: { week: string; minutes: number }[];
  } {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalMinutes: 0,
        averageAccuracy: 0,
        bestStreak: 0,
        favoriteSessionType: 'None',
        mostActiveHour: 12,
        weeklyProgress: [],
      };
    }

    const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0);
    const averageAccuracy = totalAccuracy / sessions.length;

    // Find favorite session type
    const sessionTypeCounts: { [key: string]: number } = {};
    sessions.forEach(s => {
      sessionTypeCounts[s.sessionType] = (sessionTypeCounts[s.sessionType] || 0) + 1;
    });
    const favoriteSessionType = Object.entries(sessionTypeCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    // Find most active hour
    const hourCounts: { [hour: number]: number } = {};
    sessions.forEach(s => {
      const hour = new Date(s.startTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const mostActiveHour = parseInt(
      Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '12'
    );

    // Calculate weekly progress (last 12 weeks)
    const weeklyProgress = this.calculateWeeklyProgress(sessions);

    return {
      totalSessions: sessions.length,
      totalMinutes: Math.round(totalMinutes),
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      bestStreak: 0, // Will be calculated from UserProgress
      favoriteSessionType,
      mostActiveHour,
      weeklyProgress,
    };
  }

  private calculateWeeklyProgress(sessions: StudySession[]): { week: string; minutes: number }[] {
    const weeklyData: { [week: string]: number } = {};
    const now = new Date();
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

    sessions
      .filter(s => new Date(s.startTime) >= twelveWeeksAgo)
      .forEach(s => {
        const weekStart = this.getWeekStart(new Date(s.startTime));
        const weekKey = weekStart.toISOString().split('T')[0];
        weeklyData[weekKey] = (weeklyData[weekKey] || 0) + s.durationMinutes;
      });

    return Object.entries(weeklyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([week, minutes]) => ({ week, minutes: Math.round(minutes) }));
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  // Get badge by ID
  getBadgeInfo(badgeId: string): Achievement | undefined {
    return this.BADGES.find(b => b.id === badgeId);
  }

  // Get all available badges
  getAllBadges(): Achievement[] {
    return [...this.BADGES];
  }

  // Calculate engagement score (0-100)
  calculateEngagementScore(progress: UserProgress, sessions: StudySession[]): number {
    let score = 0;

    // Streak contribution (0-30 points)
    score += Math.min(30, progress.streakDays * 2);

    // Accuracy contribution (0-25 points)
    score += (progress.overallAccuracy / 100) * 25;

    // Activity contribution (0-25 points)
    const recentSessions = sessions.filter(s => {
      const daysSince = (Date.now() - new Date(s.startTime).getTime()) / (24 * 60 * 60 * 1000);
      return daysSince <= 7;
    });
    score += Math.min(25, recentSessions.length * 5);

    // Progress contribution (0-20 points)
    const completionRate = progress.totalQuestionsAttempted / 128; // 128 total questions
    score += Math.min(20, completionRate * 20);

    return Math.round(Math.min(100, score));
  }
}

export const gamificationService = new GamificationService();
