// Flashcards Screen - Swipeable card stack with category filtering
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { CivicsQuestion } from '../types';
import civicsQuestions from '../data/civicsQuestions.json';

const { width, height } = Dimensions.get('window');

export default function FlashcardsScreen() {
  const [questions, setQuestions] = useState<CivicsQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  const flipAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'american_government', label: 'American Government' },
    { value: 'american_history', label: 'American History' },
    { value: 'integrated_civics', label: 'Integrated Civics' },
    { value: 'geography', label: 'Geography' },
    { value: 'symbols', label: 'Symbols' },
  ];

  useEffect(() => {
    loadQuestions();
  }, [selectedCategory, isShuffled]);

  const loadQuestions = () => {
    setLoading(true);
    let filtered = civicsQuestions as CivicsQuestion[];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    // Shuffle if enabled
    if (isShuffled) {
      filtered = [...filtered].sort(() => Math.random() - 0.5);
    }

    setQuestions(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
    setLoading(false);
  };

  const flipCard = () => {
    if (isFlipped) {
      // Flip back to question
      Animated.timing(flipAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Flip to answer
      Animated.timing(flipAnimation, {
        toValue: 180,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    setIsFlipped(!isFlipped);
  };

  const handleCardSwipe = (direction: 'left' | 'right') => {
    const toValue = direction === 'left' ? -width * 1.5 : width * 1.5;

    Animated.timing(slideAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      slideAnimation.setValue(0);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
        flipAnimation.setValue(0);
      }
    });
  };

  const markAsKnown = async () => {
    const currentQuestion = questions[currentIndex];
    const newKnown = new Set(knownCards);
    newKnown.add(currentQuestion.id);
    setKnownCards(newKnown);

    // Remove from unknown if it was there
    const newUnknown = new Set(unknownCards);
    newUnknown.delete(currentQuestion.id);
    setUnknownCards(newUnknown);

    // Save to Firebase
    await saveProgress(currentQuestion.id, true);

    handleCardSwipe('right');
  };

  const markAsUnknown = async () => {
    const currentQuestion = questions[currentIndex];
    const newUnknown = new Set(unknownCards);
    newUnknown.add(currentQuestion.id);
    setUnknownCards(newUnknown);

    // Remove from known if it was there
    const newKnown = new Set(knownCards);
    newKnown.delete(currentQuestion.id);
    setKnownCards(newKnown);

    // Save to Firebase
    await saveProgress(currentQuestion.id, false);

    handleCardSwipe('left');
  };

  const saveProgress = async (questionId: string, known: boolean) => {
    // Firebase removed - flashcard progress now tracked locally
    // Local state management only
  };

  const playAudio = async () => {
    const currentQuestion = questions[currentIndex];
    try {
      // Use text-to-speech for the question
      await Speech.speak(currentQuestion.question, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not play audio');
      console.error('Audio playback error:', error);
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const resetProgress = () => {
    setCurrentIndex(0);
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setIsFlipped(false);
    flipAnimation.setValue(0);
    slideAnimation.setValue(0);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Loading flashcards...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No questions available</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={styles.buttonText}>Show All Questions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (currentIndex >= questions.length) {
    return (
      <View style={styles.completeContainer}>
        <Text style={styles.completeTitle}>Session Complete!</Text>
        <Text style={styles.completeStats}>
          Known: {knownCards.size} | Unknown: {unknownCards.size}
        </Text>
        <Text style={styles.completeStats}>
          Total: {questions.length} cards
        </Text>
        <TouchableOpacity style={styles.button} onPress={resetProgress}>
          <Text style={styles.buttonText}>Start Over</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Flashcards</Text>
        <Text style={styles.progress}>
          {currentIndex + 1} / {questions.length}
        </Text>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => setShowCategoryMenu(!showCategoryMenu)}
        >
          <Text style={styles.categoryButtonText}>
            {categories.find(c => c.value === selectedCategory)?.label || 'All'}
          </Text>
          <Text style={styles.categoryButtonIcon}>{showCategoryMenu ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shuffleButton, isShuffled && styles.shuffleButtonActive]}
          onPress={toggleShuffle}
        >
          <Text style={styles.shuffleButtonText}>🔀 Shuffle</Text>
        </TouchableOpacity>
      </View>

      {/* Category Menu */}
      {showCategoryMenu && (
        <ScrollView style={styles.categoryMenu}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryMenuItem,
                selectedCategory === cat.value && styles.categoryMenuItemActive,
              ]}
              onPress={() => {
                setSelectedCategory(cat.value);
                setShowCategoryMenu(false);
              }}
            >
              <Text
                style={[
                  styles.categoryMenuItemText,
                  selectedCategory === cat.value && styles.categoryMenuItemTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX: slideAnimation },
                { rotateY: frontInterpolate },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.cardTouchable}
            onPress={flipCard}
            activeOpacity={0.9}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>
                {isFlipped ? 'ANSWER' : 'QUESTION'}
              </Text>
              <Text style={styles.cardText}>
                {isFlipped ? currentQuestion.answer : currentQuestion.question}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardCategory}>{currentQuestion.category}</Text>
                <Text style={styles.cardDifficulty}>{currentQuestion.difficulty}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Tap to flip hint */}
        {!isFlipped && (
          <Text style={styles.flipHint}>Tap card to reveal answer</Text>
        )}
      </View>

      {/* Audio Button */}
      <TouchableOpacity style={styles.audioButton} onPress={playAudio}>
        <Text style={styles.audioButtonText}>🔊 Listen</Text>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.unknownButton]}
          onPress={markAsUnknown}
        >
          <Text style={styles.actionButtonText}>❌</Text>
          <Text style={styles.actionButtonLabel}>Don't Know</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.knownButton]}
          onPress={markAsKnown}
        >
          <Text style={styles.actionButtonText}>✅</Text>
          <Text style={styles.actionButtonLabel}>Know It</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{knownCards.size}</Text>
          <Text style={styles.statLabel}>Known</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{unknownCards.size}</Text>
          <Text style={styles.statLabel}>Unknown</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {questions.length - currentIndex - 1}
          </Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 20,
  },
  completeStats: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progress: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  categoryButtonIcon: {
    fontSize: 12,
    color: '#6B7280',
  },
  shuffleButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shuffleButtonActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#1E40AF',
  },
  shuffleButtonText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  categoryMenu: {
    maxHeight: 300,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryMenuItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryMenuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  categoryMenuItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  categoryMenuItemTextActive: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: width - 40,
    height: height * 0.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 8,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
  cardTouchable: {
    flex: 1,
  },
  cardContent: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1,
  },
  cardText: {
    fontSize: 22,
    lineHeight: 32,
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
    marginVertical: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardCategory: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  cardDifficulty: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  flipHint: {
    marginTop: 16,
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  audioButton: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1E40AF',
    borderRadius: 24,
    marginVertical: 16,
  },
  audioButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  unknownButton: {
    backgroundColor: '#EF4444',
  },
  knownButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 32,
    marginBottom: 4,
  },
  actionButtonLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#1E40AF',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
