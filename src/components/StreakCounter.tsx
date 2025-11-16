import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';

interface StreakCounterProps {
  streakDays: number;
  lastStudyDate?: Date;
  showCalendar?: boolean;
  studyDates?: Date[]; // Array of dates when user studied
  maxCalendarDays?: number; // Number of days to show in calendar
}

/**
 * StreakCounter Component
 *
 * Displays the user's daily study streak with visual feedback.
 *
 * Features:
 * - Fire emoji with animated number display
 * - Calendar grid showing active study days
 * - Encouragement text based on streak
 * - Visual feedback for streak milestones
 * - Accessible design
 *
 * @param {number} streakDays - Current streak count
 * @param {Date} lastStudyDate - Date of last study session
 * @param {boolean} showCalendar - Show calendar grid (default: true)
 * @param {Date[]} studyDates - Array of dates when user studied
 * @param {number} maxCalendarDays - Days to show in calendar (default: 30)
 */
const StreakCounter: React.FC<StreakCounterProps> = ({
  streakDays,
  lastStudyDate,
  showCalendar = true,
  studyDates = [],
  maxCalendarDays = 30,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for active streaks
    if (streakDays > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [streakDays]);

  // Get streak message
  const getStreakMessage = (): string => {
    if (streakDays === 0) {
      return 'Start your streak today!';
    } else if (streakDays === 1) {
      return 'Great start! Keep it going!';
    } else if (streakDays < 7) {
      return `${streakDays} days strong! 💪`;
    } else if (streakDays < 14) {
      return `One week streak! 🌟`;
    } else if (streakDays < 30) {
      return `${streakDays} days! You\'re on fire! 🔥`;
    } else if (streakDays < 100) {
      return `${streakDays} days! Incredible! 🎉`;
    } else {
      return `${streakDays} days! Legend status! 👑`;
    }
  };

  // Get streak color based on count
  const getStreakColor = (): string => {
    if (streakDays === 0) return '#9CA3AF';
    if (streakDays < 7) return '#F59E0B';
    if (streakDays < 30) return '#EF4444';
    return '#DC2626';
  };

  // Check if today is a study day
  const isToday = (): boolean => {
    if (!lastStudyDate) return false;
    const today = new Date();
    const lastStudy = new Date(lastStudyDate);
    return (
      today.getDate() === lastStudy.getDate() &&
      today.getMonth() === lastStudy.getMonth() &&
      today.getFullYear() === lastStudy.getFullYear()
    );
  };

  // Generate calendar data
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();

    for (let i = maxCalendarDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const hasStudied = studyDates.some((studyDate) => {
        const sd = new Date(studyDate);
        return (
          sd.getDate() === date.getDate() &&
          sd.getMonth() === date.getMonth() &&
          sd.getFullYear() === date.getFullYear()
        );
      });

      const isCurrentDay =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      days.push({
        date,
        hasStudied,
        isCurrentDay,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
      });
    }

    return days;
  };

  const streakColor = getStreakColor();
  const calendarDays = showCalendar ? generateCalendarDays() : [];

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      {/* Main Streak Display */}
      <View style={styles.streakDisplay}>
        <Animated.View
          style={[
            styles.fireContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Glow effect */}
          {streakDays > 0 && (
            <Animated.View
              style={[
                styles.glow,
                {
                  backgroundColor: streakColor,
                  opacity: glowOpacity,
                },
              ]}
            />
          )}

          <Text style={styles.fireEmoji}>
            {streakDays > 0 ? '🔥' : '⚪'}
          </Text>
        </Animated.View>

        <View style={styles.streakInfo}>
          <Text
            style={[styles.streakNumber, { color: streakColor }]}
            accessibilityLabel={`${streakDays} day streak`}
          >
            {streakDays}
          </Text>
          <Text style={styles.streakLabel}>
            {streakDays === 1 ? 'Day Streak' : 'Days Streak'}
          </Text>
        </View>
      </View>

      {/* Streak Message */}
      <Text style={[styles.streakMessage, { color: streakColor }]}>
        {getStreakMessage()}
      </Text>

      {/* Today's Status */}
      <View style={styles.todayStatus}>
        {isToday() ? (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>✓ Studied Today</Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, styles.statusBadgeWarning]}>
            <Text style={[styles.statusText, styles.statusTextWarning]}>
              Study today to keep your streak!
            </Text>
          </View>
        )}
      </View>

      {/* Calendar Grid */}
      {showCalendar && calendarDays.length > 0 && (
        <View style={styles.calendarSection}>
          <Text style={styles.calendarTitle}>Last 30 Days</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarScroll}
          >
            {calendarDays.map((day, index) => (
              <View
                key={index}
                style={styles.dayContainer}
                accessibilityLabel={`${day.dayName} ${day.dayNumber}. ${
                  day.hasStudied ? 'Studied' : 'Not studied'
                }`}
                accessibilityRole="text"
              >
                <Text style={styles.dayName}>{day.dayName[0]}</Text>
                <View
                  style={[
                    styles.dayCircle,
                    day.hasStudied && styles.dayCircleActive,
                    day.isCurrentDay && styles.dayCircleCurrent,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      day.hasStudied && styles.dayNumberActive,
                      day.isCurrentDay && styles.dayNumberCurrent,
                    ]}
                  >
                    {day.dayNumber}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Milestone Indicators */}
      <View style={styles.milestonesContainer}>
        <MilestoneIndicator
          days={7}
          reached={streakDays >= 7}
          label="1 Week"
          emoji="⭐"
        />
        <MilestoneIndicator
          days={30}
          reached={streakDays >= 30}
          label="1 Month"
          emoji="🏆"
        />
        <MilestoneIndicator
          days={100}
          reached={streakDays >= 100}
          label="100 Days"
          emoji="👑"
        />
      </View>
    </View>
  );
};

// Milestone indicator sub-component
interface MilestoneIndicatorProps {
  days: number;
  reached: boolean;
  label: string;
  emoji: string;
}

const MilestoneIndicator: React.FC<MilestoneIndicatorProps> = ({
  days,
  reached,
  label,
  emoji,
}) => {
  return (
    <View
      style={[styles.milestone, reached && styles.milestoneReached]}
      accessibilityLabel={`Milestone: ${label}. ${reached ? 'Reached' : 'Not reached yet'}`}
    >
      <Text style={[styles.milestoneEmoji, !reached && styles.milestoneEmojiLocked]}>
        {reached ? emoji : '🔒'}
      </Text>
      <Text style={[styles.milestoneLabel, reached && styles.milestoneLabelReached]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  streakDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fireContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  fireEmoji: {
    fontSize: 64,
  },
  streakInfo: {
    alignItems: 'flex-start',
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 52,
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  streakMessage: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  todayStatus: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#059669',
  },
  statusBadgeWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  statusText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  statusTextWarning: {
    color: '#92400E',
  },
  calendarSection: {
    marginTop: 12,
  },
  calendarTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  calendarScroll: {
    paddingRight: 8,
  },
  dayContainer: {
    alignItems: 'center',
    marginRight: 8,
  },
  dayName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  dayCircleActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  dayCircleCurrent: {
    borderColor: '#1E40AF',
    borderWidth: 3,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  dayNumberActive: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  dayNumberCurrent: {
    color: '#1E40AF',
  },
  milestonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  milestone: {
    alignItems: 'center',
    opacity: 0.5,
  },
  milestoneReached: {
    opacity: 1,
  },
  milestoneEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  milestoneEmojiLocked: {
    opacity: 0.3,
  },
  milestoneLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  milestoneLabelReached: {
    color: '#1E40AF',
  },
});

export default StreakCounter;
