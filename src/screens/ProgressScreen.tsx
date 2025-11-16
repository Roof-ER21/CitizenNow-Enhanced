// Progress Screen - Complete dashboard with charts and statistics
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
} from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { useUser } from '../contexts/UserContext';
import { gamificationService } from '../services/gamificationService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 40;

export const ProgressScreen: React.FC = () => {
  const {
    userProgress,
    studySessions,
    level,
    pointsToNextLevel,
    passProbability,
    engagementScore,
  } = useUser();

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!userProgress) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  // Calculate study stats
  const stats = gamificationService.calculateStudyStats(studySessions);

  // Prepare category data for pie chart
  const categoryData = Object.entries(userProgress.categoryProgress).map(([category, data], index) => {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
    return {
      name: category.replace(/_/g, ' ').substring(0, 12),
      population: data.attempted,
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 12,
    };
  });

  // Prepare accuracy trend data
  const accuracyTrendData = {
    labels: stats.weeklyProgress.slice(-6).map(w => {
      const date = new Date(w.week);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: stats.weeklyProgress.slice(-6).map(w => Math.min(100, (w.minutes / 60) * 100)),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  // Category accuracy bars
  const categoryAccuracyData = {
    labels: Object.keys(userProgress.categoryProgress)
      .map(c => c.replace(/_/g, ' ').substring(0, 8))
      .slice(0, 5),
    datasets: [
      {
        data: Object.values(userProgress.categoryProgress)
          .map(c => c.accuracy)
          .slice(0, 5),
      },
    ],
  };

  // Ready for test indicator
  const isReady = passProbability >= 80 && userProgress.totalQuestionsAttempted >= 100;
  const readyColor = isReady ? '#34C759' : passProbability >= 60 ? '#FF9500' : '#FF3B30';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your journey to citizenship</Text>
        </View>

        {/* Overall Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <Text style={styles.statValue}>{userProgress.overallAccuracy.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Overall Accuracy</Text>
          </View>

          <View style={[styles.statCard, styles.statCardSuccess]}>
            <Text style={styles.statValue}>{userProgress.streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>

          <View style={[styles.statCard, styles.statCardInfo]}>
            <Text style={styles.statValue}>{userProgress.totalQuestionsAttempted}</Text>
            <Text style={styles.statLabel}>Questions Studied</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWarning]}>
            <Text style={styles.statValue}>{Math.floor(stats.totalMinutes / 60)}h</Text>
            <Text style={styles.statLabel}>Total Study Time</Text>
          </View>
        </View>

        {/* Pass Probability Indicator */}
        <View style={[styles.readyCard, { borderColor: readyColor }]}>
          <View style={styles.readyHeader}>
            <Text style={styles.readyTitle}>Test Readiness</Text>
            <Text style={[styles.readyBadge, { backgroundColor: readyColor }]}>
              {isReady ? '✓ Ready' : passProbability >= 60 ? 'Almost Ready' : 'Keep Studying'}
            </Text>
          </View>

          <View style={styles.probabilityContainer}>
            <View style={styles.probabilityCircle}>
              <Text style={[styles.probabilityValue, { color: readyColor }]}>
                {passProbability.toFixed(0)}%
              </Text>
              <Text style={styles.probabilityLabel}>Pass Probability</Text>
            </View>

            <View style={styles.readyChecklist}>
              <View style={styles.checklistItem}>
                <Text style={styles.checkIcon}>
                  {userProgress.totalQuestionsAttempted >= 100 ? '✓' : '○'}
                </Text>
                <Text style={styles.checklistText}>
                  100+ questions studied ({userProgress.totalQuestionsAttempted}/100)
                </Text>
              </View>
              <View style={styles.checklistItem}>
                <Text style={styles.checkIcon}>
                  {userProgress.overallAccuracy >= 80 ? '✓' : '○'}
                </Text>
                <Text style={styles.checklistText}>
                  80%+ accuracy ({userProgress.overallAccuracy.toFixed(0)}%)
                </Text>
              </View>
              <View style={styles.checklistItem}>
                <Text style={styles.checkIcon}>
                  {Object.keys(userProgress.categoryProgress).length >= 5 ? '✓' : '○'}
                </Text>
                <Text style={styles.checklistText}>
                  All categories covered ({Object.keys(userProgress.categoryProgress).length}/5)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Level Progress */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelLabel}>Current Level</Text>
              <Text style={styles.levelValue}>Level {level}</Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsValue}>{userProgress.totalPoints}</Text>
              <Text style={styles.pointsLabel}>Total Points</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${pointsToNextLevel.percentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {pointsToNextLevel.needed} points to Level {level + 1}
            </Text>
          </View>
        </View>

        {/* Category Breakdown Pie Chart */}
        {categoryData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Questions by Category</Text>
            <PieChart
              data={categoryData}
              width={CHART_WIDTH}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}

        {/* Category Accuracy Bar Chart */}
        {Object.keys(userProgress.categoryProgress).length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Accuracy by Category</Text>
            <BarChart
              data={categoryAccuracyData}
              width={CHART_WIDTH}
              height={220}
              yAxisLabel=""
              yAxisSuffix="%"
              chartConfig={chartConfig}
              verticalLabelRotation={30}
              fromZero
              showValuesOnTopOfBars
            />
          </View>
        )}

        {/* Study Time Trend */}
        {stats.weeklyProgress.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Study Progress (Last 6 Weeks)</Text>
            <LineChart
              data={accuracyTrendData}
              width={CHART_WIDTH}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots
              withShadow={false}
              withInnerLines={false}
            />
          </View>
        )}

        {/* Study Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Study Statistics</Text>

          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Total Sessions</Text>
            <Text style={styles.statRowValue}>{stats.totalSessions}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Average Accuracy</Text>
            <Text style={styles.statRowValue}>{stats.averageAccuracy.toFixed(1)}%</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Favorite Study Mode</Text>
            <Text style={styles.statRowValue}>{stats.favoriteSessionType}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Most Active Time</Text>
            <Text style={styles.statRowValue}>
              {stats.mostActiveHour}:00 - {stats.mostActiveHour + 1}:00
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Engagement Score</Text>
            <Text style={[styles.statRowValue, { color: getEngagementColor(engagementScore) }]}>
              {engagementScore}/100
            </Text>
          </View>
        </View>

        {/* Recent Activity Timeline */}
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>Recent Activity</Text>

          {studySessions.slice(0, 5).map((session, index) => (
            <View key={session.id} style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityType}>
                  {session.sessionType.replace(/_/g, ' ')}
                </Text>
                <Text style={styles.activityDetails}>
                  {session.correctAnswers}/{session.totalQuestions} correct •{' '}
                  {session.accuracy.toFixed(0)}% • {session.durationMinutes}min
                </Text>
                <Text style={styles.activityTime}>
                  {formatTimeAgo(new Date(session.startTime))}
                </Text>
              </View>
              <Text
                style={[
                  styles.activityBadge,
                  { backgroundColor: session.accuracy >= 80 ? '#34C759' : '#FF9500' },
                ]}
              >
                {session.accuracy.toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>

        {/* Badges Earned */}
        <View style={styles.badgesCard}>
          <Text style={styles.badgesTitle}>
            Badges Earned ({userProgress.badges.length})
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {userProgress.badges.map((badge) => (
              <View key={badge.id} style={styles.badgeItem}>
                <Text style={styles.badgeIcon}>{badge.iconUrl}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}

            {userProgress.badges.length === 0 && (
              <Text style={styles.noBadgesText}>
                Complete challenges to earn badges!
              </Text>
            )}
          </ScrollView>
        </View>

        <View style={styles.spacer} />
      </Animated.View>
    </ScrollView>
  );
};

// Helper functions
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const getEngagementColor = (score: number): string => {
  if (score >= 80) return '#34C759';
  if (score >= 60) return '#007AFF';
  if (score >= 40) return '#FF9500';
  return '#FF3B30';
};

// Chart configuration
const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#007AFF',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  statCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  statCardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#5856D6',
  },
  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  readyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  readyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  readyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  readyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  probabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  probabilityCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  probabilityValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  probabilityLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  readyChecklist: {
    flex: 1,
    gap: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkIcon: {
    fontSize: 20,
    color: '#34C759',
  },
  checklistText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  levelCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  levelValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  pointsBadge: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statRowLabel: {
    fontSize: 14,
    color: '#666',
  },
  statRowValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E5EA',
    paddingLeft: 16,
    position: 'relative',
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    position: 'absolute',
    left: -6,
    top: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textTransform: 'capitalize',
  },
  activityDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  badgesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  badgeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  noBadgesText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  spacer: {
    height: 40,
  },
});

export default ProgressScreen;
