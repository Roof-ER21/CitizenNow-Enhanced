import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Badge as BadgeType } from '../types';

interface BadgeProps {
  badge: BadgeType;
  size?: 'small' | 'medium' | 'large';
  isLocked?: boolean;
  onPress?: () => void;
  showAnimation?: boolean;
}

/**
 * Badge Component
 *
 * Displays achievement badges with earned/locked states and animations.
 *
 * Features:
 * - Icon display with emoji support
 * - Badge name and description
 * - Earned/locked visual states
 * - Celebration animation when earned
 * - Responsive sizing (small/medium/large)
 * - Accessible design with proper labels
 *
 * @param {BadgeType} badge - The badge object to display
 * @param {'small' | 'medium' | 'large'} size - Badge size (default: 'medium')
 * @param {boolean} isLocked - Show badge in locked state
 * @param {function} onPress - Callback when badge is pressed
 * @param {boolean} showAnimation - Play earn animation (default: false)
 */
const Badge: React.FC<BadgeProps> = ({
  badge,
  size = 'medium',
  isLocked = false,
  onPress,
  showAnimation = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showAnimation && !isLocked) {
      // Celebration animation when badge is earned
      Animated.sequence([
        // Scale up and rotate
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.3,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        // Scale back to normal
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Glow effect
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
        ]),
        { iterations: 3 }
      ).start();
    }
  }, [showAnimation, isLocked]);

  // Get size dimensions
  const getSizeDimensions = () => {
    const dimensions = {
      small: {
        container: 80,
        icon: 32,
        fontSize: 10,
        nameSize: 12,
        descSize: 10,
      },
      medium: {
        container: 120,
        icon: 48,
        fontSize: 14,
        nameSize: 16,
        descSize: 12,
      },
      large: {
        container: 160,
        icon: 64,
        fontSize: 18,
        nameSize: 20,
        descSize: 14,
      },
    };
    return dimensions[size];
  };

  // Get badge type color
  const getBadgeColor = (type: string): string => {
    const colorMap: { [key: string]: string } = {
      streak: '#F59E0B',
      mastery: '#1E40AF',
      milestone: '#7C3AED',
      special: '#DC2626',
    };
    return colorMap[type] || '#6B7280';
  };

  // Get badge icon emoji based on type
  const getBadgeIcon = (): string => {
    if (badge.iconUrl && badge.iconUrl.startsWith('emoji:')) {
      return badge.iconUrl.replace('emoji:', '');
    }

    // Default icons based on type
    const defaultIcons: { [key: string]: string } = {
      streak: '🔥',
      mastery: '🎓',
      milestone: '🏆',
      special: '⭐',
    };
    return defaultIcons[badge.type] || '🏅';
  };

  const dims = getSizeDimensions();
  const badgeColor = getBadgeColor(badge.type);
  const iconEmoji = getBadgeIcon();

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowInterpolate = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  const ContainerComponent = onPress ? TouchableOpacity : View;

  return (
    <ContainerComponent
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={`${badge.name} badge. ${badge.description}. ${
        isLocked ? 'Locked' : 'Earned'
      }`}
      accessibilityState={{ disabled: isLocked }}
    >
      <Animated.View
        style={[
          styles.badgeContainer,
          {
            width: dims.container,
            height: dims.container,
            transform: [{ scale: scaleAnim }, { rotate: rotateInterpolate }],
          },
        ]}
      >
        {/* Glow effect for earned badges */}
        {!isLocked && (
          <Animated.View
            style={[
              styles.glowContainer,
              {
                width: dims.container + 20,
                height: dims.container + 20,
                borderRadius: (dims.container + 20) / 2,
                backgroundColor: badgeColor,
                opacity: glowInterpolate.interpolate({
                  inputRange: [0, 8],
                  outputRange: [0, 0.3],
                }),
              },
            ]}
          />
        )}

        {/* Badge circle */}
        <View
          style={[
            styles.badgeCircle,
            {
              width: dims.container,
              height: dims.container,
              borderRadius: dims.container / 2,
              borderColor: badgeColor,
              backgroundColor: isLocked ? '#E5E7EB' : '#FFFFFF',
              opacity: isLocked ? 0.5 : 1,
            },
          ]}
        >
          {/* Badge icon */}
          <Text
            style={[
              styles.iconText,
              {
                fontSize: dims.icon,
                opacity: isLocked ? 0.3 : 1,
              },
            ]}
          >
            {isLocked ? '🔒' : iconEmoji}
          </Text>

          {/* Badge type indicator */}
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor: badgeColor,
                opacity: isLocked ? 0.5 : 1,
              },
            ]}
          >
            <Text style={[styles.typeText, { fontSize: dims.fontSize - 2 }]}>
              {badge.type.toUpperCase()}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Badge name */}
      <Text
        style={[
          styles.badgeName,
          {
            fontSize: dims.nameSize,
            color: isLocked ? '#9CA3AF' : '#1F2937',
          },
        ]}
        numberOfLines={2}
      >
        {badge.name}
      </Text>

      {/* Badge description */}
      {size !== 'small' && (
        <Text
          style={[
            styles.badgeDescription,
            {
              fontSize: dims.descSize,
              color: isLocked ? '#9CA3AF' : '#6B7280',
            },
          ]}
          numberOfLines={size === 'medium' ? 2 : 3}
        >
          {badge.description}
        </Text>
      )}

      {/* Earned date */}
      {!isLocked && badge.earnedAt && size !== 'small' && (
        <Text style={styles.earnedDate}>
          Earned: {new Date(badge.earnedAt).toLocaleDateString()}
        </Text>
      )}

      {/* Locked overlay text */}
      {isLocked && size !== 'small' && (
        <View style={styles.lockedOverlay}>
          <Text style={styles.lockedText}>🔒 Locked</Text>
          <Text style={styles.lockedHint}>Keep studying to unlock!</Text>
        </View>
      )}
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  badgeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  glowContainer: {
    position: 'absolute',
    zIndex: 0,
  },
  badgeCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  iconText: {
    textAlign: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: -8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeName: {
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  badgeDescription: {
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
    lineHeight: 16,
  },
  earnedDate: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    fontStyle: 'italic',
  },
  lockedOverlay: {
    marginTop: 8,
    alignItems: 'center',
  },
  lockedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  lockedHint: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
    fontStyle: 'italic',
  },
});

export default Badge;
