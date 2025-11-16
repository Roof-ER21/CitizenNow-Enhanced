import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';

interface ScoreCardProps {
  score: number;
  totalQuestions: number;
  passingScore?: number;
  timeTaken?: number; // in seconds
  accuracy?: number; // 0-100
  onReview?: () => void;
  onRetry?: () => void;
  onHome?: () => void;
  showAnimation?: boolean;
}

/**
 * ScoreCard Component
 *
 * Displays quiz results with detailed scoring and actions.
 *
 * Features:
 * - Score display (X/20) with visual feedback
 * - Pass/fail status with color coding
 * - Accuracy percentage
 * - Time taken display
 * - Review answers button
 * - Retry quiz option
 * - Celebration animation for passing scores
 * - Accessible design
 *
 * @param {number} score - Number of correct answers
 * @param {number} totalQuestions - Total number of questions
 * @param {number} passingScore - Minimum score to pass (default: 60%)
 * @param {number} timeTaken - Time taken in seconds
 * @param {number} accuracy - Accuracy percentage (calculated if not provided)
 * @param {function} onReview - Callback for review button
 * @param {function} onRetry - Callback for retry button
 * @param {function} onHome - Callback for home button
 * @param {boolean} showAnimation - Play celebration animation (default: true)
 */
const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  totalQuestions,
  passingScore = 60,
  timeTaken,
  accuracy,
  onReview,
  onRetry,
  onHome,
  showAnimation = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  const calculatedAccuracy = accuracy ?? Math.round((score / totalQuestions) * 100);
  const passed = calculatedAccuracy >= passingScore;

  useEffect(() => {
    if (showAnimation) {
      // Scale up animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Confetti animation if passed
      if (passed) {
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }).start();
      }
    } else {
      scaleAnim.setValue(1);
      fadeAnim.setValue(1);
    }
  }, [showAnimation, passed]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) {
      return `${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  // Get status message
  const getStatusMessage = (): string => {
    if (calculatedAccuracy === 100) {
      return 'Perfect Score! 🎉';
    } else if (calculatedAccuracy >= 90) {
      return 'Excellent! 🌟';
    } else if (calculatedAccuracy >= 80) {
      return 'Great Job! 💪';
    } else if (calculatedAccuracy >= passingScore) {
      return 'You Passed! ✓';
    } else if (calculatedAccuracy >= 50) {
      return 'Keep Practicing! 📚';
    } else {
      return 'Study More & Try Again! 💡';
    }
  };

  // Get color based on score
  const getScoreColor = (): string => {
    if (calculatedAccuracy >= 90) return '#059669';
    if (calculatedAccuracy >= passingScore) return '#3B82F6';
    if (calculatedAccuracy >= 50) return '#F59E0B';
    return '#DC2626';
  };

  const scoreColor = getScoreColor();
  const statusMessage = getStatusMessage();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Confetti Effect */}
      {passed && (
        <Animated.View
          style={[
            styles.confettiContainer,
            {
              opacity: confettiAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1, 0],
              }),
            },
          ]}
        >
          <Text style={styles.confetti}>🎉</Text>
          <Text style={styles.confetti}>✨</Text>
          <Text style={styles.confetti}>🎊</Text>
          <Text style={styles.confetti}>⭐</Text>
        </Animated.View>
      )}

      {/* Status Badge */}
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: passed ? '#D1FAE5' : '#FEE2E2' },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            { color: passed ? '#059669' : '#DC2626' },
          ]}
        >
          {passed ? '✓ PASSED' : '✗ NEEDS IMPROVEMENT'}
        </Text>
      </View>

      {/* Main Score Display */}
      <View style={styles.scoreContainer}>
        <Text
          style={[styles.scoreText, { color: scoreColor }]}
          accessibilityLabel={`You scored ${score} out of ${totalQuestions}`}
        >
          {score}
          <Text style={styles.scoreDivider}>/</Text>
          {totalQuestions}
        </Text>
        <Text style={styles.scoreLabel}>Correct Answers</Text>
      </View>

      {/* Status Message */}
      <Text style={[styles.statusMessage, { color: scoreColor }]}>
        {statusMessage}
      </Text>

      {/* Statistics Grid */}
      <View style={styles.statsGrid}>
        {/* Accuracy */}
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{calculatedAccuracy}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
          <View
            style={[
              styles.statIndicator,
              {
                backgroundColor:
                  calculatedAccuracy >= passingScore ? '#059669' : '#DC2626',
              },
            ]}
          />
        </View>

        {/* Passing Score */}
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{passingScore}%</Text>
          <Text style={styles.statLabel}>Pass Mark</Text>
          <View
            style={[
              styles.statIndicator,
              { backgroundColor: '#3B82F6' },
            ]}
          />
        </View>

        {/* Time Taken */}
        {timeTaken !== undefined && (
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatTime(timeTaken)}</Text>
            <Text style={styles.statLabel}>Time Taken</Text>
            <View
              style={[
                styles.statIndicator,
                { backgroundColor: '#F59E0B' },
              ]}
            />
          </View>
        )}
      </View>

      {/* Performance Feedback */}
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackTitle}>Performance Analysis:</Text>
        {calculatedAccuracy >= 90 && (
          <Text style={styles.feedbackText}>
            ✓ Outstanding performance! You're ready for the test.
          </Text>
        )}
        {calculatedAccuracy >= passingScore && calculatedAccuracy < 90 && (
          <Text style={styles.feedbackText}>
            ✓ Good work! Review missed questions to improve further.
          </Text>
        )}
        {calculatedAccuracy < passingScore && calculatedAccuracy >= 50 && (
          <Text style={styles.feedbackText}>
            ! You're close to passing. Focus on weak areas and try again.
          </Text>
        )}
        {calculatedAccuracy < 50 && (
          <Text style={styles.feedbackText}>
            ! More study time needed. Review the material and practice regularly.
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {onReview && (
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={onReview}
            accessibilityRole="button"
            accessibilityLabel="Review answers"
          >
            <Text style={styles.buttonTextPrimary}>📋 Review Answers</Text>
          </TouchableOpacity>
        )}

        {onRetry && (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry quiz"
          >
            <Text style={styles.buttonTextSecondary}>🔄 Try Again</Text>
          </TouchableOpacity>
        )}

        {onHome && (
          <TouchableOpacity
            style={[styles.button, styles.buttonOutline]}
            onPress={onHome}
            accessibilityRole="button"
            accessibilityLabel="Go to home"
          >
            <Text style={styles.buttonTextOutline}>🏠 Home</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Next Steps */}
      <View style={styles.nextStepsContainer}>
        <Text style={styles.nextStepsTitle}>Next Steps:</Text>
        {passed ? (
          <>
            <Text style={styles.nextStepItem}>
              ✓ Continue practicing with more quizzes
            </Text>
            <Text style={styles.nextStepItem}>
              ✓ Try the AI interview practice
            </Text>
            <Text style={styles.nextStepItem}>
              ✓ Review categories where you struggled
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.nextStepItem}>
              • Review the questions you missed
            </Text>
            <Text style={styles.nextStepItem}>
              • Study with flashcards for weak categories
            </Text>
            <Text style={styles.nextStepItem}>
              • Take another practice quiz
            </Text>
          </>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  confettiContainer: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 1,
  },
  confetti: {
    fontSize: 40,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 72,
    fontWeight: '900',
    lineHeight: 80,
  },
  scoreDivider: {
    fontSize: 48,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  statusMessage: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  statIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  feedbackContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#1E40AF',
    ...Platform.select({
      ios: {
        shadowColor: '#1E40AF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonSecondary: {
    backgroundColor: '#3B82F6',
  },
  buttonOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextSecondary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextOutline: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  nextStepsContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  nextStepsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 12,
  },
  nextStepItem: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 20,
    marginBottom: 6,
  },
});

export default ScoreCard;
