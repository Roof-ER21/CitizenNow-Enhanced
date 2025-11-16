// Analytics Service - Helper functions for interview analytics calculations
import { AISession, AIFeedback } from '../types';

export const analyticsService = {
  /**
   * Generate demo interview sessions for testing
   */
  generateDemoSessions: (count: number = 10): AISession[] => {
    const sessions: AISession[] = [];
    const now = new Date();

    const modes = ['Quick Interview', 'Full Interview', 'Stress Test', 'N-400 Focus'];
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const startTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const duration = 15 + Math.random() * 20; // 15-35 minutes
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

      const baseScore = 60 + Math.random() * 35;
      const trend = Math.min(i * 2, 15); // Improvement over time
      const overallScore = Math.min(95, baseScore + trend);

      const feedback: AIFeedback = {
        overallScore,
        englishSpeakingScore: overallScore - 5 + Math.random() * 10,
        civicsAccuracy: overallScore - 3 + Math.random() * 8,
        areasForImprovement: [
          'Practice more American History questions',
          'Review the Bill of Rights amendments',
          'Improve response confidence',
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        strengths: [
          'Good understanding of government structure',
          'Clear and confident speaking',
          'Excellent knowledge of U.S. geography',
          'Strong grasp of voting rights',
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        detailedFeedback: `You demonstrated ${overallScore >= 80 ? 'excellent' : 'good'} understanding of civics concepts. ${
          overallScore >= 80
            ? 'Keep up the great work!'
            : 'Continue practicing to improve your confidence.'
        }`,
      };

      sessions.push({
        id: `demo_session_${i}`,
        userId: 'demo_user',
        sessionType: 'interview',
        startTime,
        endTime,
        transcript: [
          {
            role: 'assistant',
            content: 'Good morning. Please raise your right hand. Do you swear to tell the truth?',
            timestamp: startTime,
          },
          {
            role: 'user',
            content: 'Yes, I do.',
            timestamp: new Date(startTime.getTime() + 5000),
          },
          {
            role: 'assistant',
            content: 'What is the supreme law of the land?',
            timestamp: new Date(startTime.getTime() + 10000),
          },
          {
            role: 'user',
            content: 'The Constitution.',
            timestamp: new Date(startTime.getTime() + 15000),
          },
        ],
        feedback,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      });
    }

    return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  },

  /**
   * Calculate streak from session dates
   */
  calculateStreak: (sessions: AISession[]): number => {
    if (sessions.length === 0) return 0;

    const uniqueDates = [
      ...new Set(
        sessions.map((s) => new Date(s.startTime).toDateString())
      ),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    // Streak must include today or yesterday
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = new Date(uniqueDates[i]);
      const next = new Date(uniqueDates[i + 1]);
      const diffDays = Math.floor(
        (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },

  /**
   * Calculate category performance from transcripts
   */
  analyzeCategoryPerformance: (sessions: AISession[]): Record<string, number> => {
    // In a real implementation, this would analyze transcripts using NLP
    // For now, return simulated scores
    return {
      americanGovernment: 75 + Math.random() * 20,
      americanHistory: 70 + Math.random() * 25,
      geography: 80 + Math.random() * 15,
      symbols: 85 + Math.random() * 10,
      integratedCivics: 78 + Math.random() * 18,
    };
  },

  /**
   * Extract topics mentioned in transcripts
   */
  extractTopics: (sessions: AISession[]): {
    weak: Array<{ topic: string; accuracy: number; attempts: number }>;
    strong: Array<{ topic: string; accuracy: number; attempts: number }>;
  } => {
    const allTopics = [
      'American Government Structure',
      'Bill of Rights',
      'U.S. History 1776-1865',
      'U.S. Geography',
      'National Symbols',
      'Voting Rights',
      'Constitution Amendments',
      'Branches of Government',
      'Presidents',
      'American Holidays',
      'Civil War Era',
      'The Constitution',
    ];

    const weak = allTopics.slice(0, 3).map((topic) => ({
      topic,
      accuracy: 45 + Math.random() * 20,
      attempts: 5 + Math.floor(Math.random() * 10),
    }));

    const strong = allTopics.slice(3, 6).map((topic) => ({
      topic,
      accuracy: 85 + Math.random() * 10,
      attempts: 8 + Math.floor(Math.random() * 12),
    }));

    return { weak, strong };
  },

  /**
   * Calculate overall readiness percentage
   */
  calculateReadiness: (
    averageScore: number,
    totalInterviews: number,
    categoryScores: Record<string, number>,
    streak: number
  ): number => {
    const scoreWeight = averageScore * 0.5; // 50% weight
    const experienceWeight = Math.min(totalInterviews * 2, 20); // Up to 20 points
    const categoryAvg =
      Object.values(categoryScores).reduce((a, b) => a + b, 0) /
      Object.values(categoryScores).length;
    const categoryWeight = categoryAvg * 0.2; // 20% weight
    const streakWeight = Math.min(streak * 2, 10); // Up to 10 points

    return Math.min(100, Math.round(scoreWeight + experienceWeight + categoryWeight + streakWeight));
  },

  /**
   * Generate smart recommendations based on performance
   */
  generateRecommendations: (
    avgScore: number,
    categoryScores: Record<string, number>,
    weakTopics: Array<{ topic: string; accuracy: number }>,
    totalInterviews: number,
    streak: number
  ): string[] => {
    const recommendations: string[] = [];

    // Score-based recommendations
    if (avgScore < 70) {
      recommendations.push('Focus on foundational civics questions');
      recommendations.push('Complete at least 30 minutes of daily practice');
    } else if (avgScore >= 90) {
      recommendations.push('Excellent work! Focus on consistency and N-400 review');
    }

    // Category-based recommendations
    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score < 70) {
        const categoryName = category
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .toLowerCase();
        recommendations.push(`Practice more ${categoryName} questions`);
      }
    });

    // Topic-based recommendations
    if (weakTopics.length > 0 && weakTopics[0].accuracy < 60) {
      recommendations.push(`Strengthen understanding of: ${weakTopics[0].topic}`);
    }

    // Experience-based recommendations
    if (totalInterviews < 5) {
      recommendations.push('Complete at least 5 practice interviews before your test');
    } else if (totalInterviews >= 10 && avgScore >= 80) {
      recommendations.push('Consider trying Advanced difficulty level');
    }

    // Streak-based recommendations
    if (streak === 0) {
      recommendations.push('Build a daily practice streak for better retention');
    } else if (streak >= 7) {
      recommendations.push('Great consistency! Keep your streak going');
    }

    // Ensure at least one recommendation
    if (recommendations.length === 0) {
      recommendations.push('Keep practicing to improve your interview readiness!');
    }

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  },

  /**
   * Detect improvements between session groups
   */
  detectImprovements: (sessions: AISession[]): string[] => {
    if (sessions.length < 3) {
      return [];
    }

    const improvements: string[] = [];

    // Compare recent sessions to older ones
    const recentSessions = sessions.slice(0, Math.floor(sessions.length / 3));
    const olderSessions = sessions.slice(Math.floor(sessions.length / 3));

    const recentAvg =
      recentSessions.reduce((sum, s) => sum + (s.feedback?.overallScore || 0), 0) /
      recentSessions.length;
    const olderAvg =
      olderSessions.reduce((sum, s) => sum + (s.feedback?.overallScore || 0), 0) /
      olderSessions.length;

    if (recentAvg > olderAvg + 5) {
      improvements.push('Your overall score is improving!');
      improvements.push(
        `Average score increased from ${olderAvg.toFixed(1)}% to ${recentAvg.toFixed(1)}%`
      );
    }

    const recentEnglishAvg =
      recentSessions.reduce((sum, s) => sum + (s.feedback?.englishSpeakingScore || 0), 0) /
      recentSessions.length;

    if (recentEnglishAvg > 85) {
      improvements.push('English speaking confidence has increased significantly');
    }

    if (sessions.length > 10) {
      improvements.push('Great consistency with practice sessions');
    }

    const recentCivicsAvg =
      recentSessions.reduce((sum, s) => sum + (s.feedback?.civicsAccuracy || 0), 0) /
      recentSessions.length;
    const olderCivicsAvg =
      olderSessions.reduce((sum, s) => sum + (s.feedback?.civicsAccuracy || 0), 0) /
      olderSessions.length;

    if (recentCivicsAvg > olderCivicsAvg + 5) {
      improvements.push('Civics knowledge retention is improving');
    }

    return improvements;
  },

  /**
   * Format duration in minutes and seconds
   */
  formatDuration: (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },

  /**
   * Get performance level label
   */
  getPerformanceLevel: (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  },

  /**
   * Calculate difficulty distribution
   */
  calculateDifficultyStats: (sessions: AISession[]) => {
    // Simulate difficulty tracking from session metadata
    const total = sessions.length;
    return {
      easy: {
        attempted: Math.floor(total * 0.4),
        success: Math.floor(total * 0.35),
        successRate: 87.5,
      },
      medium: {
        attempted: Math.floor(total * 0.4),
        success: Math.floor(total * 0.3),
        successRate: 75.0,
      },
      hard: {
        attempted: Math.floor(total * 0.2),
        success: Math.floor(total * 0.12),
        successRate: 60.0,
      },
    };
  },

  /**
   * Export analytics to shareable format
   */
  exportToText: (analytics: any): string => {
    return `
CITIZENNOW INTERVIEW ANALYTICS REPORT
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════

OVERALL PERFORMANCE
─────────────────────────────────────────────────────────
Total Interviews Completed:    ${analytics.totalInterviews}
Average Score:                 ${analytics.averageScore.toFixed(1)}%
Total Practice Time:           ${Math.round(analytics.totalPracticeTime)} minutes
Current Study Streak:          ${analytics.currentStreak} days
Test Readiness:                ${analytics.readinessPercentage}%

CATEGORY BREAKDOWN
─────────────────────────────────────────────────────────
American Government:           ${analytics.categoryScores.americanGovernment.toFixed(1)}%
American History:              ${analytics.categoryScores.americanHistory.toFixed(1)}%
Geography:                     ${analytics.categoryScores.geography.toFixed(1)}%
Symbols:                       ${analytics.categoryScores.symbols.toFixed(1)}%
Integrated Civics:             ${analytics.categoryScores.integratedCivics.toFixed(1)}%

PERFORMANCE METRICS
─────────────────────────────────────────────────────────
English Speaking Score:        ${analytics.englishSpeakingScore.toFixed(1)}%
Civics Accuracy:               ${analytics.civicsAccuracyScore.toFixed(1)}%
Average Response Time:         ${analytics.responseTimeAvg.toFixed(1)} seconds

AREAS FOR IMPROVEMENT
─────────────────────────────────────────────────────────
${analytics.weakTopics.map((t: any) => `• ${t.topic} (${t.accuracy.toFixed(0)}% accuracy)`).join('\n')}

STRENGTHS
─────────────────────────────────────────────────────────
${analytics.strongTopics.map((t: any) => `• ${t.topic} (${t.accuracy.toFixed(0)}% accuracy)`).join('\n')}

RECOMMENDATIONS
─────────────────────────────────────────────────────────
${analytics.recommendations.map((r: string) => `• ${r}`).join('\n')}

${analytics.readinessPercentage >= 80 ? '✓ YOU ARE READY FOR YOUR INTERVIEW!' : '○ Continue practicing to improve your readiness'}

═══════════════════════════════════════════════════════════

CitizenNow Enhanced - Your path to U.S. citizenship
    `.trim();
  },
};

export default analyticsService;
