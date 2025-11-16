import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  height?: number;
  animated?: boolean;
  colorScheme?: 'default' | 'success' | 'warning' | 'danger';
}

/**
 * ProgressBar Component
 *
 * A visual progress indicator with smooth animations and color-coded states.
 *
 * Features:
 * - Animated progress transitions
 * - Color coding based on score (red/yellow/green)
 * - Percentage display
 * - Customizable label text
 * - Accessible design
 *
 * @param {number} progress - Progress value from 0 to 100
 * @param {string} label - Optional label text
 * @param {boolean} showPercentage - Show percentage text (default: true)
 * @param {number} height - Bar height in pixels (default: 12)
 * @param {boolean} animated - Enable animation (default: true)
 * @param {'default' | 'success' | 'warning' | 'danger'} colorScheme - Color scheme override
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  height = 12,
  animated = true,
  colorScheme,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    if (animated) {
      Animated.spring(animatedWidth, {
        toValue: normalizedProgress,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(normalizedProgress);
    }
  }, [normalizedProgress, animated]);

  // Determine color based on progress
  const getProgressColor = (): string => {
    if (colorScheme) {
      const colorMap: { [key: string]: string } = {
        default: '#3B82F6',
        success: '#059669',
        warning: '#F59E0B',
        danger: '#DC2626',
      };
      return colorMap[colorScheme];
    }

    if (normalizedProgress < 40) {
      return '#DC2626'; // Red - Needs improvement
    } else if (normalizedProgress < 70) {
      return '#F59E0B'; // Yellow - Getting there
    } else {
      return '#059669'; // Green - Excellent
    }
  };

  // Get background color for the bar container
  const getBackgroundColor = (): string => {
    if (normalizedProgress < 40) {
      return '#FEE2E2'; // Light red
    } else if (normalizedProgress < 70) {
      return '#FEF3C7'; // Light yellow
    } else {
      return '#D1FAE5'; // Light green
    }
  };

  // Get text color for percentage
  const getTextColor = (): string => {
    if (normalizedProgress < 40) {
      return '#DC2626';
    } else if (normalizedProgress < 70) {
      return '#92400E';
    } else {
      return '#059669';
    }
  };

  const progressColor = getProgressColor();
  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Label and Percentage Row */}
      {(label || showPercentage) && (
        <View style={styles.headerRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={[styles.percentage, { color: textColor }]}>
              {Math.round(normalizedProgress)}%
            </Text>
          )}
        </View>
      )}

      {/* Progress Bar */}
      <View
        style={[
          styles.progressBarContainer,
          { height, backgroundColor },
        ]}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: normalizedProgress,
        }}
        accessibilityLabel={`Progress: ${Math.round(normalizedProgress)} percent`}
      >
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: widthInterpolation,
              backgroundColor: progressColor,
              height: height - 4,
            },
          ]}
        />
      </View>

      {/* Progress Status Text */}
      {normalizedProgress > 0 && (
        <Text style={[styles.statusText, { color: textColor }]}>
          {getStatusMessage(normalizedProgress)}
        </Text>
      )}
    </View>
  );
};

// Helper function to get encouraging status message
const getStatusMessage = (progress: number): string => {
  if (progress === 100) {
    return 'Perfect! 🎉';
  } else if (progress >= 90) {
    return 'Excellent work! 🌟';
  } else if (progress >= 80) {
    return 'Great job! 💪';
  } else if (progress >= 70) {
    return 'Good progress! 👍';
  } else if (progress >= 60) {
    return 'Keep going! 🚀';
  } else if (progress >= 50) {
    return 'You\'re halfway there! 💯';
  } else if (progress >= 40) {
    return 'Making progress! 📈';
  } else if (progress >= 25) {
    return 'Keep practicing! 📚';
  } else if (progress > 0) {
    return 'Just getting started! 🎯';
  }
  return '';
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  progressBarContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  progressBarFill: {
    borderRadius: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default ProgressBar;
