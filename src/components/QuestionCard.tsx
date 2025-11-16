import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
  Platform,
} from 'react-native';
import { CivicsQuestion } from '../types';

interface QuestionCardProps {
  question: CivicsQuestion;
  onAnswer?: (correct: boolean) => void;
  showAnswerProp?: boolean;
  mode: 'flashcard' | 'quiz';
  multipleChoiceOptions?: string[];
  selectedAnswer?: string;
  onSelectAnswer?: (answer: string) => void;
  showAudioButton?: boolean;
  onPlayAudio?: () => void;
}

/**
 * QuestionCard Component
 *
 * A versatile card component for displaying civics questions in both flashcard and quiz modes.
 *
 * Features:
 * - Flip animation for flashcard mode
 * - Multiple choice display for quiz mode
 * - Audio playback button
 * - Category badge and difficulty indicator
 * - Accessible design with proper ARIA attributes
 *
 * @param {CivicsQuestion} question - The question object to display
 * @param {function} onAnswer - Callback when answer is submitted (quiz mode)
 * @param {boolean} showAnswerProp - Control answer visibility externally
 * @param {'flashcard' | 'quiz'} mode - Display mode
 * @param {string[]} multipleChoiceOptions - Options for quiz mode
 * @param {string} selectedAnswer - Currently selected answer
 * @param {function} onSelectAnswer - Callback for answer selection
 * @param {boolean} showAudioButton - Show audio playback button
 * @param {function} onPlayAudio - Callback for audio playback
 */
const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  showAnswerProp = false,
  mode = 'flashcard',
  multipleChoiceOptions = [],
  selectedAnswer,
  onSelectAnswer,
  showAudioButton = true,
  onPlayAudio,
}) => {
  const [showAnswer, setShowAnswer] = useState(showAnswerProp);
  const [flipAnimation] = useState(new Animated.Value(0));
  const [isFlipping, setIsFlipping] = useState(false);

  // Flip animation for flashcard mode
  const handleFlip = () => {
    if (isFlipping || mode === 'quiz') return;

    setIsFlipping(true);
    const toValue = showAnswer ? 0 : 1;

    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start(() => {
      setShowAnswer(!showAnswer);
      setIsFlipping(false);
    });
  };

  // Handle answer selection in quiz mode
  const handleAnswerSelect = (answer: string) => {
    if (onSelectAnswer) {
      onSelectAnswer(answer);
    }

    // Check if answer is correct
    if (onAnswer) {
      const isCorrect = answer.toLowerCase().trim() === question.answer.toLowerCase().trim();
      onAnswer(isCorrect);
    }
  };

  // Get category display name
  const getCategoryDisplay = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      american_government: 'American Government',
      american_history: 'American History',
      integrated_civics: 'Integrated Civics',
      geography: 'Geography',
      symbols: 'Symbols',
    };
    return categoryMap[category] || category;
  };

  // Get category color
  const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      american_government: '#DC2626',
      american_history: '#EA580C',
      integrated_civics: '#059669',
      geography: '#0891B2',
      symbols: '#7C3AED',
    };
    return colorMap[category] || '#6B7280';
  };

  // Get difficulty indicator
  const getDifficultyIndicator = (difficulty: string): string => {
    const indicators: { [key: string]: string } = {
      easy: '●',
      medium: '●●',
      hard: '●●●',
    };
    return indicators[difficulty] || '●';
  };

  // Interpolate flip animation
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <View style={styles.container}>
      {/* Header with category and difficulty */}
      <View style={styles.header}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(question.category) },
          ]}
        >
          <Text style={styles.categoryText}>
            {getCategoryDisplay(question.category)}
          </Text>
        </View>
        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyText}>
            {getDifficultyIndicator(question.difficulty)}
          </Text>
        </View>
      </View>

      {/* Flashcard Mode */}
      {mode === 'flashcard' && (
        <Pressable
          onPress={handleFlip}
          style={styles.cardPressable}
          accessibilityRole="button"
          accessibilityLabel={showAnswer ? 'Show question' : 'Show answer'}
          accessibilityHint="Tap to flip the card"
        >
          <Animated.View
            style={[
              styles.card,
              frontAnimatedStyle,
              showAnswer && styles.cardHidden,
            ]}
          >
            <View style={styles.cardContent}>
              <Text style={styles.questionNumber}>
                Question {question.questionNumber}
              </Text>
              <Text style={styles.questionText}>{question.question}</Text>
              {showAudioButton && question.audioUrl && (
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onPlayAudio?.();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Play audio"
                >
                  <Text style={styles.audioIcon}>🔊</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              backAnimatedStyle,
              !showAnswer && styles.cardHidden,
            ]}
          >
            <View style={styles.cardContent}>
              <Text style={styles.answerLabel}>Answer:</Text>
              <Text style={styles.answerText}>{question.answer}</Text>
              <TouchableOpacity
                style={styles.showQuestionButton}
                onPress={handleFlip}
                accessibilityRole="button"
                accessibilityLabel="Show question again"
              >
                <Text style={styles.showQuestionText}>Tap to see question</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      )}

      {/* Quiz Mode */}
      {mode === 'quiz' && (
        <View style={styles.quizContainer}>
          <Text style={styles.questionNumber}>
            Question {question.questionNumber}
          </Text>
          <Text style={styles.questionText}>{question.question}</Text>

          {showAudioButton && question.audioUrl && (
            <TouchableOpacity
              style={[styles.audioButton, styles.audioButtonQuiz]}
              onPress={onPlayAudio}
              accessibilityRole="button"
              accessibilityLabel="Play audio"
            >
              <Text style={styles.audioIcon}>🔊</Text>
              <Text style={styles.audioText}>Listen</Text>
            </TouchableOpacity>
          )}

          {/* Multiple Choice Options */}
          {multipleChoiceOptions.length > 0 && (
            <View style={styles.optionsContainer}>
              {multipleChoiceOptions.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect =
                  showAnswerProp &&
                  option.toLowerCase().trim() === question.answer.toLowerCase().trim();
                const isWrong = showAnswerProp && isSelected && !isCorrect;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionSelected,
                      isCorrect && showAnswerProp && styles.optionCorrect,
                      isWrong && styles.optionWrong,
                    ]}
                    onPress={() => !showAnswerProp && handleAnswerSelect(option)}
                    disabled={showAnswerProp}
                    accessibilityRole="button"
                    accessibilityLabel={`Option ${index + 1}: ${option}`}
                    accessibilityState={{
                      selected: isSelected,
                      disabled: showAnswerProp,
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        (isSelected || (isCorrect && showAnswerProp)) &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    {showAnswerProp && isCorrect && (
                      <Text style={styles.optionIcon}>✓</Text>
                    )}
                    {showAnswerProp && isWrong && (
                      <Text style={styles.optionIcon}>✗</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Show Answer Button (for flashcard-style quiz) */}
          {!showAnswerProp && multipleChoiceOptions.length === 0 && (
            <TouchableOpacity
              style={styles.showAnswerButton}
              onPress={() => setShowAnswer(!showAnswer)}
              accessibilityRole="button"
              accessibilityLabel={showAnswer ? 'Hide answer' : 'Show answer'}
            >
              <Text style={styles.showAnswerText}>
                {showAnswer ? '👆 Hide Answer' : '👁️ Show Answer'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Answer Display */}
          {showAnswer && multipleChoiceOptions.length === 0 && (
            <View style={styles.answerContainer}>
              <Text style={styles.answerLabel}>Correct Answer:</Text>
              <Text style={styles.answerTextQuiz}>{question.answer}</Text>
            </View>
          )}
        </View>
      )}

      {/* Special indicators */}
      {question.isFor65Plus && (
        <View style={styles.specialBadge}>
          <Text style={styles.specialBadgeText}>65+ Question</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexShrink: 1,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  cardPressable: {
    height: 280,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
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
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backgroundColor: '#EFF6FF',
  },
  cardHidden: {
    opacity: 0,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 26,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  answerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'center',
    lineHeight: 28,
  },
  audioButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  audioButtonQuiz: {
    position: 'relative',
    width: 'auto',
    height: 'auto',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
    alignSelf: 'center',
  },
  audioIcon: {
    fontSize: 24,
  },
  audioText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  showQuestionButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#93C5FD',
    borderRadius: 12,
  },
  showQuestionText: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '600',
  },
  quizContainer: {
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
  optionsContainer: {
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  optionCorrect: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  optionWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  optionText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  optionTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  optionIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  showAnswerButton: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  showAnswerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  answerContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#059669',
  },
  answerTextQuiz: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'center',
  },
  specialBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  specialBadgeText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default QuestionCard;
