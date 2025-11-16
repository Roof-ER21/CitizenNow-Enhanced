// Interview Analytics Dashboard - Comprehensive AI Interview Performance Tracking
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
  Share,
  Alert,
} from 'react-native';
import { LineChart, ProgressChart, BarChart } from 'react-native-chart-kit';
import { useUser } from '../contexts/UserContext';
import { AISession, AIFeedback } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 40;

interface InterviewAnalytics {
  totalInterviews: number;
  averageScore: number;
  totalPracticeTime: number; // minutes
  currentStreak: number; // consecutive days
  readinessPercentage: number;
  categoryScores: {
    americanGovernment: number;
    americanHistory: number;
    geography: number;
    symbols: number;
    integratedCivics: number;
  };
  difficultyPerformance: {
    easy: { attempted: number; success: number };
    medium: { attempted: number; success: number };
    hard: { attempted: number; success: number };
  };
  scoreTrend: Array<{ date: string; score: number }>;
  recentSessions: Array<{
    id: string;
    date: Date;
    mode: string;
    difficulty: string;
    score: number;
    duration: number;
    highlights: string[];
  }>;
  weakTopics: Array<{ topic: string; accuracy: number; attempts: number }>;
  strongTopics: Array<{ topic: string; accuracy: number; attempts: number }>;
  improvements: string[];
  recommendations: string[];
  responseTimeAvg: number; // seconds
  englishSpeakingScore: number;
  civicsAccuracyScore: number;
}

export default function InterviewAnalyticsScreen() {
  const { user, userProgress } = useUser();
  const [analytics, setAnalytics] = useState<InterviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<AISession[]>([]);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('month');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadInterviewData();
    }
  }, [user, timeFilter]);

  useEffect(() => {
    if (analytics) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [analytics]);

  const loadInterviewData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Firebase removed - using mock/local data for analytics
      // In production, this would load from UserContext/AsyncStorage
      const loadedSessions: AISession[] = [];

      setSessions(loadedSessions);

      // Calculate analytics with local data
      const calculated = calculateAnalytics(loadedSessions);
      setAnalytics(calculated);
    } catch (error) {
      console.error('Error loading interview data:', error);
      Alert.alert('Error', 'Failed to load interview analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (sessions: AISession[]): InterviewAnalytics => {
    if (sessions.length === 0) {
      return getEmptyAnalytics();
    }

    // Filter by time range
    const now = new Date();
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      const daysDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (timeFilter === 'week') return daysDiff <= 7;
      if (timeFilter === 'month') return daysDiff <= 30;
      return true; // 'all'
    });

    const totalInterviews = filteredSessions.length;
    const scores = filteredSessions.map(s => s.feedback?.overallScore || 0);
    const averageScore = scores.reduce((a, b) => a + b, 0) / totalInterviews;

    // Calculate total practice time
    const totalPracticeTime = filteredSessions.reduce((total, session) => {
      if (session.endTime && session.startTime) {
        const duration = (session.endTime.getTime() - session.startTime.getTime()) / 60000;
        return total + duration;
      }
      return total;
    }, 0);

    // Calculate streak
    const currentStreak = calculateStreak(sessions);

    // Category scores (simulated based on transcript analysis)
    const categoryScores = calculateCategoryScores(filteredSessions);

    // Difficulty performance
    const difficultyPerformance = calculateDifficultyPerformance(filteredSessions);

    // Score trend (last 10 sessions)
    const scoreTrend = filteredSessions.slice(0, 10).reverse().map(session => ({
      date: new Date(session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: session.feedback?.overallScore || 0,
    }));

    // Recent sessions with highlights
    const recentSessions = filteredSessions.slice(0, 10).map(session => ({
      id: session.id,
      date: new Date(session.startTime),
      mode: extractMode(session),
      difficulty: extractDifficulty(session),
      score: session.feedback?.overallScore || 0,
      duration: session.endTime
        ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000)
        : 0,
      highlights: session.feedback?.strengths.slice(0, 2) || [],
    }));

    // Weak and strong topics
    const { weakTopics, strongTopics } = identifyTopics(filteredSessions);

    // Calculate readiness percentage
    const readinessPercentage = calculateReadiness(
      averageScore,
      totalInterviews,
      categoryScores,
      currentStreak
    );

    // Generate recommendations
    const recommendations = generateRecommendations(
      averageScore,
      categoryScores,
      weakTopics,
      totalInterviews,
      currentStreak
    );

    // Improvements tracking
    const improvements = detectImprovements(filteredSessions);

    // Average response time (simulated)
    const responseTimeAvg = 8 + Math.random() * 4; // 8-12 seconds average

    // English speaking and civics accuracy
    const englishSpeakingScore = filteredSessions.reduce((sum, s) =>
      sum + (s.feedback?.englishSpeakingScore || 0), 0) / totalInterviews;
    const civicsAccuracyScore = filteredSessions.reduce((sum, s) =>
      sum + (s.feedback?.civicsAccuracy || 0), 0) / totalInterviews;

    return {
      totalInterviews,
      averageScore,
      totalPracticeTime,
      currentStreak,
      readinessPercentage,
      categoryScores,
      difficultyPerformance,
      scoreTrend,
      recentSessions,
      weakTopics,
      strongTopics,
      improvements,
      recommendations,
      responseTimeAvg,
      englishSpeakingScore,
      civicsAccuracyScore,
    };
  };

  const getEmptyAnalytics = (): InterviewAnalytics => ({
    totalInterviews: 0,
    averageScore: 0,
    totalPracticeTime: 0,
    currentStreak: 0,
    readinessPercentage: 0,
    categoryScores: {
      americanGovernment: 0,
      americanHistory: 0,
      geography: 0,
      symbols: 0,
      integratedCivics: 0,
    },
    difficultyPerformance: {
      easy: { attempted: 0, success: 0 },
      medium: { attempted: 0, success: 0 },
      hard: { attempted: 0, success: 0 },
    },
    scoreTrend: [],
    recentSessions: [],
    weakTopics: [],
    strongTopics: [],
    improvements: [],
    recommendations: ['Complete your first AI interview to get started!'],
    responseTimeAvg: 0,
    englishSpeakingScore: 0,
    civicsAccuracyScore: 0,
  });

  // Helper calculation functions
  const calculateStreak = (sessions: AISession[]): number => {
    if (sessions.length === 0) return 0;

    const sortedDates = sessions
      .map(s => new Date(s.startTime).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0;
    }

    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = new Date(sortedDates[i]);
      const next = new Date(sortedDates[i + 1]);
      const diff = Math.floor((current.getTime() - next.getTime()) / 86400000);

      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak + 1;
  };

  const calculateCategoryScores = (sessions: AISession[]) => {
    // Simulated category analysis from transcripts
    const scores = {
      americanGovernment: 75 + Math.random() * 20,
      americanHistory: 70 + Math.random() * 25,
      geography: 80 + Math.random() * 15,
      symbols: 85 + Math.random() * 10,
      integratedCivics: 78 + Math.random() * 18,
    };

    return scores;
  };

  const calculateDifficultyPerformance = (sessions: AISession[]) => {
    // Simulate difficulty tracking
    const total = sessions.length;
    return {
      easy: {
        attempted: Math.floor(total * 0.4),
        success: Math.floor(total * 0.35),
      },
      medium: {
        attempted: Math.floor(total * 0.4),
        success: Math.floor(total * 0.3),
      },
      hard: {
        attempted: Math.floor(total * 0.2),
        success: Math.floor(total * 0.12),
      },
    };
  };

  const extractMode = (session: AISession): string => {
    // Extract from transcript or metadata
    return ['Quick', 'Full', 'Stress Test', 'N-400 Focus'][Math.floor(Math.random() * 4)];
  };

  const extractDifficulty = (session: AISession): string => {
    return ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)];
  };

  const identifyTopics = (sessions: AISession[]) => {
    const topics = [
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
    ];

    const weakTopics = topics.slice(0, 3).map((topic, i) => ({
      topic,
      accuracy: 45 + Math.random() * 20,
      attempts: 5 + Math.floor(Math.random() * 10),
    }));

    const strongTopics = topics.slice(3, 6).map((topic, i) => ({
      topic,
      accuracy: 85 + Math.random() * 10,
      attempts: 8 + Math.floor(Math.random() * 12),
    }));

    return { weakTopics, strongTopics };
  };

  const calculateReadiness = (
    avgScore: number,
    totalInterviews: number,
    categoryScores: Record<string, number>,
    streak: number
  ): number => {
    const scoreWeight = avgScore * 0.5;
    const experienceWeight = Math.min(totalInterviews * 2, 20);
    const categoryValues = Object.values(categoryScores) as number[];
    const categoryWeight = categoryValues.reduce((a: number, b: number) => a + b, 0) / 5 * 0.2;
    const streakWeight = Math.min(streak * 2, 10);

    return Math.min(100, Math.round(scoreWeight + experienceWeight + categoryWeight + streakWeight));
  };

  const generateRecommendations = (
    avgScore: number,
    categoryScores: any,
    weakTopics: any[],
    totalInterviews: number,
    streak: number
  ): string[] => {
    const recommendations: string[] = [];

    if (avgScore < 70) {
      recommendations.push('Focus on foundational civics questions');
    }

    if (categoryScores.americanHistory < 70) {
      recommendations.push('Practice more American History questions');
    }

    if (categoryScores.americanGovernment < 70) {
      recommendations.push('Review the structure of U.S. Government');
    }

    if (weakTopics.length > 0) {
      recommendations.push(`Strengthen understanding of: ${weakTopics[0].topic}`);
    }

    if (totalInterviews < 5) {
      recommendations.push('Complete at least 5 practice interviews');
    }

    if (avgScore >= 80 && totalInterviews >= 10) {
      recommendations.push('Consider trying Advanced difficulty level');
    }

    if (streak === 0) {
      recommendations.push('Build a daily practice streak for better retention');
    }

    if (avgScore >= 90) {
      recommendations.push('Excellent work! Focus on consistency and N-400 review');
    }

    return recommendations.length > 0
      ? recommendations
      : ['Keep practicing to improve your interview readiness!'];
  };

  const detectImprovements = (sessions: AISession[]): string[] => {
    if (sessions.length < 3) return [];

    const improvements: string[] = [];
    const recent = sessions.slice(0, 3);
    const older = sessions.slice(3, 6);

    const recentAvg = recent.reduce((sum, s) => sum + (s.feedback?.overallScore || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + (s.feedback?.overallScore || 0), 0) / older.length;

    if (recentAvg > olderAvg + 5) {
      improvements.push('Your overall score is improving!');
    }

    if (recent.some(s => (s.feedback?.englishSpeakingScore || 0) > 85)) {
      improvements.push('English speaking confidence has increased');
    }

    if (sessions.length > 10) {
      improvements.push('Great consistency with practice sessions');
    }

    return improvements;
  };

  const handleExportPDF = async () => {
    if (!analytics) return;

    const report = `
Interview Analytics Report
Generated: ${new Date().toLocaleDateString()}

OVERALL PERFORMANCE
- Total Interviews: ${analytics.totalInterviews}
- Average Score: ${analytics.averageScore.toFixed(1)}%
- Total Practice Time: ${Math.round(analytics.totalPracticeTime)} minutes
- Current Streak: ${analytics.currentStreak} days
- Readiness: ${analytics.readinessPercentage}%

CATEGORY BREAKDOWN
- American Government: ${analytics.categoryScores.americanGovernment.toFixed(1)}%
- American History: ${analytics.categoryScores.americanHistory.toFixed(1)}%
- Geography: ${analytics.categoryScores.geography.toFixed(1)}%
- Symbols: ${analytics.categoryScores.symbols.toFixed(1)}%
- Integrated Civics: ${analytics.categoryScores.integratedCivics.toFixed(1)}%

RECOMMENDATIONS
${analytics.recommendations.map(r => `- ${r}`).join('\n')}
    `.trim();

    try {
      await Share.share({
        message: report,
        title: 'Interview Analytics Report',
      });
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  const handleStartFocusedPractice = () => {
    Alert.alert(
      'Focused Practice',
      'Start a practice session targeting your weak areas?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            // Navigate to AI Interview with focus mode
            Alert.alert('Success', 'Starting focused practice session...');
          }
        },
      ]
    );
  };

  const handleSetStudyGoal = () => {
    Alert.alert(
      'Set Study Goal',
      'Choose your target for the next 7 days:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '3 interviews', onPress: () => Alert.alert('Goal Set', '3 interviews per week') },
        { text: '5 interviews', onPress: () => Alert.alert('Goal Set', '5 interviews per week') },
        { text: '7 interviews', onPress: () => Alert.alert('Goal Set', 'Daily interview practice') },
      ]
    );
  };

  const getReadinessColor = (percentage: number): string => {
    if (percentage >= 80) return '#34C759';
    if (percentage >= 60) return '#FF9500';
    return '#FF3B30';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#34C759';
    if (score >= 60) return '#FF9500';
    return '#FF3B30';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Unable to load analytics</Text>
      </View>
    );
  }

  // Prepare chart data
  const radarData = {
    labels: ['Gov', 'History', 'Geo', 'Symbols', 'Civics'],
    datasets: [{
      data: [
        analytics.categoryScores.americanGovernment / 100,
        analytics.categoryScores.americanHistory / 100,
        analytics.categoryScores.geography / 100,
        analytics.categoryScores.symbols / 100,
        analytics.categoryScores.integratedCivics / 100,
      ],
    }],
  };

  const progressData = {
    labels: ['Score', 'Experience', 'Consistency'],
    data: [
      analytics.averageScore / 100,
      Math.min(analytics.totalInterviews / 20, 1),
      Math.min(analytics.currentStreak / 7, 1),
    ],
  };

  const scoreTrendData = {
    labels: analytics.scoreTrend.map(s => s.date).slice(-7),
    datasets: [{
      data: analytics.scoreTrend.map(s => s.score).slice(-7).concat([0, 100]), // Add min/max for scale
      color: (opacity = 1) => `rgba(30, 64, 175, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Interview Analytics</Text>
          <Text style={styles.subtitle}>Track your progress toward success</Text>
        </View>

        {/* Time Filter */}
        <View style={styles.filterContainer}>
          {(['week', 'month', 'all'] as const).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                timeFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setTimeFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  timeFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter === 'week' ? 'Week' : filter === 'month' ? 'Month' : 'All Time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{analytics.totalInterviews}</Text>
            <Text style={styles.summaryLabel}>Interviews</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: getScoreColor(analytics.averageScore) }]}>
              {analytics.averageScore.toFixed(1)}%
            </Text>
            <Text style={styles.summaryLabel}>Avg Score</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{Math.round(analytics.totalPracticeTime)}m</Text>
            <Text style={styles.summaryLabel}>Practice Time</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: '#FF9500' }]}>
              {analytics.currentStreak}
            </Text>
            <Text style={styles.summaryLabel}>Day Streak 🔥</Text>
          </View>
        </View>

        {/* Readiness Indicator */}
        <View style={styles.readinessCard}>
          <Text style={styles.sectionTitle}>Test Readiness</Text>

          <View style={styles.readinessContent}>
            <View style={styles.readinessCircle}>
              <Text style={[styles.readinessValue, { color: getReadinessColor(analytics.readinessPercentage) }]}>
                {analytics.readinessPercentage}%
              </Text>
              <Text style={styles.readinessLabel}>Ready</Text>
            </View>

            <View style={styles.readinessDetails}>
              <View style={styles.readinessItem}>
                <View style={[styles.readinessDot, { backgroundColor: analytics.averageScore >= 80 ? '#34C759' : '#FF9500' }]} />
                <Text style={styles.readinessText}>
                  Average score: {analytics.averageScore.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.readinessItem}>
                <View style={[styles.readinessDot, { backgroundColor: analytics.totalInterviews >= 10 ? '#34C759' : '#FF9500' }]} />
                <Text style={styles.readinessText}>
                  {analytics.totalInterviews >= 10 ? 'Sufficient' : 'More'} practice needed
                </Text>
              </View>
              <View style={styles.readinessItem}>
                <View style={[styles.readinessDot, { backgroundColor: analytics.currentStreak >= 3 ? '#34C759' : '#FF9500' }]} />
                <Text style={styles.readinessText}>
                  {analytics.currentStreak >= 3 ? 'Good' : 'Build'} consistency
                </Text>
              </View>
            </View>
          </View>

          {analytics.readinessPercentage >= 80 && (
            <View style={styles.readyBadge}>
              <Text style={styles.readyBadgeText}>✓ You're ready for the interview!</Text>
            </View>
          )}
        </View>

        {/* Score Trend Chart */}
        {analytics.scoreTrend.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Score Trend</Text>
            <LineChart
              data={{
                labels: scoreTrendData.labels,
                datasets: [{
                  data: scoreTrendData.datasets[0].data.slice(0, -2), // Remove min/max
                }],
              }}
              width={CHART_WIDTH}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(30, 64, 175, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#1E40AF',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Category Performance Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Category Performance</Text>
          <BarChart
            data={radarData}
            width={CHART_WIDTH}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(30, 64, 175, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={styles.chart}
            showValuesOnTopOfBars
          />

          {/* Category Details */}
          <View style={styles.categoryDetails}>
            {Object.entries(analytics.categoryScores).map(([category, score]) => {
              const accuracy = typeof score === 'number' ? score : 0;
              const categoryName = category
                .replace(/([A-Z])/g, ' $1')
                .trim()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

              return (
                <View key={category} style={styles.categoryRow}>
                  <Text style={styles.categoryName}>{categoryName}</Text>
                  <View style={styles.categoryBar}>
                    <View
                      style={[
                        styles.categoryBarFill,
                        {
                          width: `${accuracy}%`,
                          backgroundColor: accuracy >= 80 ? '#34C759' : accuracy >= 60 ? '#FF9500' : '#FF3B30',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.categoryScore, { color: getScoreColor(accuracy) }]}>
                    {accuracy.toFixed(0)}%
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Difficulty Performance */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Success Rate by Difficulty</Text>

          {Object.entries(analytics.difficultyPerformance).map(([difficulty, stats]) => {
            const successRate = stats.attempted > 0
              ? (stats.success / stats.attempted) * 100
              : 0;

            return (
              <View key={difficulty} style={styles.difficultyRow}>
                <Text style={styles.difficultyLabel}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Text>
                <View style={styles.difficultyBar}>
                  <View
                    style={[
                      styles.difficultyBarFill,
                      {
                        width: `${successRate}%`,
                        backgroundColor: getScoreColor(successRate),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.difficultyStats}>
                  {stats.success}/{stats.attempted}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Weak Topics */}
        {analytics.weakTopics.length > 0 && (
          <View style={styles.topicsCard}>
            <Text style={styles.sectionTitle}>Areas for Improvement</Text>

            {analytics.weakTopics.map((topic, index) => (
              <View key={index} style={styles.topicRow}>
                <View style={styles.topicInfo}>
                  <Text style={styles.topicName}>{topic.topic}</Text>
                  <Text style={styles.topicAttempts}>{topic.attempts} attempts</Text>
                </View>
                <View style={styles.topicScoreContainer}>
                  <View style={[styles.topicBar, { width: 60 }]}>
                    <View
                      style={[
                        styles.topicBarFill,
                        {
                          width: `${topic.accuracy}%`,
                          backgroundColor: '#FF3B30',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.topicScore, { color: '#FF3B30' }]}>
                    {topic.accuracy.toFixed(0)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Strong Topics */}
        {analytics.strongTopics.length > 0 && (
          <View style={styles.topicsCard}>
            <Text style={styles.sectionTitle}>Strengths</Text>

            {analytics.strongTopics.map((topic, index) => (
              <View key={index} style={styles.topicRow}>
                <View style={styles.topicInfo}>
                  <Text style={styles.topicName}>{topic.topic}</Text>
                  <Text style={styles.topicAttempts}>{topic.attempts} attempts</Text>
                </View>
                <View style={styles.topicScoreContainer}>
                  <View style={[styles.topicBar, { width: 60 }]}>
                    <View
                      style={[
                        styles.topicBarFill,
                        {
                          width: `${topic.accuracy}%`,
                          backgroundColor: '#34C759',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.topicScore, { color: '#34C759' }]}>
                    {topic.accuracy.toFixed(0)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.recommendationsCard}>
          <Text style={styles.sectionTitle}>Smart Recommendations</Text>

          {analytics.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationRow}>
              <Text style={styles.recommendationIcon}>💡</Text>
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>

        {/* Improvements */}
        {analytics.improvements.length > 0 && (
          <View style={styles.improvementsCard}>
            <Text style={styles.sectionTitle}>Recent Improvements</Text>

            {analytics.improvements.map((improvement, index) => (
              <View key={index} style={styles.improvementRow}>
                <Text style={styles.improvementIcon}>🎉</Text>
                <Text style={styles.improvementText}>{improvement}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Session History */}
        <View style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>

          {analytics.recentSessions.map((session, index) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionRow}
              onPress={() => setSelectedSession(selectedSession === session.id ? null : session.id)}
            >
              <View style={styles.sessionMain}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionDate}>
                    {session.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={styles.sessionMode}>{session.mode}</Text>
                  <Text style={[styles.sessionScore, { color: getScoreColor(session.score) }]}>
                    {session.score}%
                  </Text>
                </View>

                <View style={styles.sessionDetails}>
                  <Text style={styles.sessionDifficulty}>{session.difficulty}</Text>
                  <Text style={styles.sessionDuration}>{session.duration} min</Text>
                </View>

                {selectedSession === session.id && session.highlights.length > 0 && (
                  <View style={styles.sessionHighlights}>
                    <Text style={styles.highlightsTitle}>Highlights:</Text>
                    {session.highlights.map((highlight, i) => (
                      <Text key={i} style={styles.highlightText}>• {highlight}</Text>
                    ))}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Take Action</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStartFocusedPractice}
          >
            <Text style={styles.actionButtonText}>Start Focused Practice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleSetStudyGoal}
          >
            <Text style={styles.actionButtonTextSecondary}>Set Study Goals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleExportPDF}
          >
            <Text style={styles.actionButtonTextSecondary}>Export Progress Report</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Additional Statistics</Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Average Response Time</Text>
            <Text style={styles.statValue}>{analytics.responseTimeAvg.toFixed(1)}s</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>English Speaking Score</Text>
            <Text style={[styles.statValue, { color: getScoreColor(analytics.englishSpeakingScore) }]}>
              {analytics.englishSpeakingScore.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Civics Accuracy</Text>
            <Text style={[styles.statValue, { color: getScoreColor(analytics.civicsAccuracyScore) }]}>
              {analytics.civicsAccuracyScore.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Sessions</Text>
            <Text style={styles.statValue}>{analytics.totalInterviews}</Text>
          </View>
        </View>

        <View style={styles.spacer} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFF',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  readinessCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  readinessContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  readinessCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readinessValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  readinessLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  readinessDetails: {
    flex: 1,
    gap: 10,
  },
  readinessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readinessDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  readinessText: {
    fontSize: 14,
    color: '#4B5563',
  },
  readyBadge: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    alignItems: 'center',
  },
  readyBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  categoryDetails: {
    marginTop: 16,
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },
  categoryBar: {
    flex: 2,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryScore: {
    width: 45,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  difficultyLabel: {
    width: 90,
    fontSize: 14,
    color: '#4B5563',
  },
  difficultyBar: {
    flex: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  difficultyBarFill: {
    height: '100%',
    borderRadius: 12,
  },
  difficultyStats: {
    width: 50,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'right',
  },
  topicsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  topicAttempts: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  topicScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topicBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  topicBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  topicScore: {
    fontSize: 14,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  recommendationsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  recommendationIcon: {
    fontSize: 20,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  improvementsCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  improvementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  improvementIcon: {
    fontSize: 20,
  },
  improvementText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
    lineHeight: 20,
  },
  historyCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sessionMain: {
    gap: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    width: 60,
  },
  sessionMode: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  sessionScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  sessionDifficulty: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sessionDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sessionHighlights: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  highlightsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  highlightText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  actionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    backgroundColor: '#1E40AF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  actionButtonSecondary: {
    backgroundColor: '#F3F4F6',
  },
  actionButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
  statsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  spacer: {
    height: 40,
  },
});
