// Reading Screen - Reading test practice with text-to-speech
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Speech from 'expo-speech';
import { ReadingSentence } from '../types';
import readingSentences from '../data/readingSentences.json';

export default function ReadingScreen() {
  const [sentences, setSentences] = useState<ReadingSentence[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [readCorrectly, setReadCorrectly] = useState<Set<string>>(new Set());
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [startTime] = useState(new Date());

  useEffect(() => {
    loadSentences();
    return () => {
      // Stop any ongoing speech when component unmounts
      Speech.stop();
    };
  }, []);

  const loadSentences = () => {
    setLoading(true);

    // Select 3 random sentences for practice (mimics real test)
    const allSentences = [...(readingSentences as ReadingSentence[])];
    const shuffled = allSentences.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    setSentences(selected);
    setLoading(false);
  };

  const handleReadAloud = async () => {
    const currentSentence = sentences[currentSentenceIndex];

    try {
      setIsSpeaking(true);

      await Speech.speak(currentSentence.sentence, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.75, // Slower rate for learning
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      Alert.alert('Error', 'Could not play audio');
      console.error('Text-to-speech error:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const markAsRead = async (correctly: boolean) => {
    const currentSentence = sentences[currentSentenceIndex];

    if (correctly) {
      const newReadCorrectly = new Set(readCorrectly);
      newReadCorrectly.add(currentSentence.id);
      setReadCorrectly(newReadCorrectly);
    }

    setTotalAttempts(totalAttempts + 1);

    // Save progress to Firebase
    await saveProgress(currentSentence.id, correctly);

    // Move to next sentence or finish
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
    } else {
      finishSession();
    }
  };

  const saveProgress = async (sentenceId: string, readCorrectly: boolean) => {
    // Firebase removed - reading progress now tracked locally
    // Local state management only
  };

  const finishSession = async () => {
    setSessionComplete(true);

    const endTime = new Date();
    const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
    const accuracy = (readCorrectly.size / sentences.length) * 100;

    // Firebase removed - session tracking now local only
    // Stats tracked in UserContext via AsyncStorage
  };

  const restartSession = () => {
    setCurrentSentenceIndex(0);
    setReadCorrectly(new Set());
    setTotalAttempts(0);
    setSessionComplete(false);
    loadSentences();
  };

  const skipSentence = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
    } else {
      finishSession();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Loading reading practice...</Text>
      </View>
    );
  }

  if (sessionComplete) {
    const accuracy = (readCorrectly.size / sentences.length) * 100;
    const passed = accuracy >= 66.67; // Need to read at least 2 out of 3 correctly

    return (
      <ScrollView style={styles.container}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeTitle}>Reading Practice Complete!</Text>

          <View style={[styles.scoreCard, passed ? styles.scoreCardPass : styles.scoreCardFail]}>
            <Text style={styles.scoreText}>
              {readCorrectly.size}/{sentences.length}
            </Text>
            <Text style={styles.accuracyText}>{accuracy.toFixed(0)}%</Text>
            <Text style={styles.statusText}>
              {passed ? 'EXCELLENT ✅' : 'KEEP PRACTICING ⚠️'}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📖 About the Reading Test</Text>
            <Text style={styles.infoText}>
              During your citizenship interview, you will read one out of three sentences correctly
              to demonstrate your ability to read English.
            </Text>
            <Text style={styles.infoText}>
              The officer will only ask you to read up to three sentences. You must read one
              sentence without extended pauses correctly to pass.
            </Text>
          </View>

          {/* Review sentences */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Sentences Practiced</Text>
            {sentences.map((sentence, index) => (
              <View
                key={sentence.id}
                style={[
                  styles.reviewCard,
                  readCorrectly.has(sentence.id) ? styles.reviewCardCorrect : styles.reviewCardIncorrect,
                ]}
              >
                <Text style={styles.reviewNumber}>Sentence {index + 1}</Text>
                <Text style={styles.reviewSentence}>{sentence.sentence}</Text>
                <Text style={styles.reviewStatus}>
                  {readCorrectly.has(sentence.id) ? '✅ Read Correctly' : '⚠️ Needs Practice'}
                </Text>
                <View style={styles.reviewMeta}>
                  <Text style={styles.reviewMetaItem}>{sentence.category}</Text>
                  <Text style={styles.reviewMetaItem}>{sentence.difficulty}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.restartButton} onPress={restartSession}>
            <Text style={styles.restartButtonText}>Practice Again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const currentSentence = sentences[currentSentenceIndex];
  const progress = ((currentSentenceIndex + 1) / sentences.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reading Practice</Text>
        <Text style={styles.progress}>
          {currentSentenceIndex + 1} / {sentences.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <ScrollView style={styles.content}>
        {/* Instructions */}
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>📖 Instructions</Text>
          <Text style={styles.instructionsText}>
            Read the sentence below out loud. Tap "Listen" to hear it first, then practice reading it yourself.
          </Text>
        </View>

        {/* Sentence Card */}
        <View style={styles.sentenceCard}>
          <Text style={styles.sentenceLabel}>READ THIS SENTENCE:</Text>
          <Text style={styles.sentenceText}>{currentSentence.sentence}</Text>

          <View style={styles.sentenceMeta}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{currentSentence.category}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{currentSentence.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* Audio Controls */}
        <View style={styles.audioControls}>
          <TouchableOpacity
            style={[styles.audioButton, isSpeaking && styles.audioButtonActive]}
            onPress={isSpeaking ? stopSpeaking : handleReadAloud}
          >
            <Text style={styles.audioButtonIcon}>
              {isSpeaking ? '⏸️' : '🔊'}
            </Text>
            <Text style={styles.audioButtonText}>
              {isSpeaking ? 'Stop' : 'Listen'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>💡 Reading Tips</Text>
          <Text style={styles.tipText}>• Read slowly and clearly</Text>
          <Text style={styles.tipText}>• Pronounce each word carefully</Text>
          <Text style={styles.tipText}>• Don't pause too long between words</Text>
          <Text style={styles.tipText}>• It's okay to make a small mistake</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{readCorrectly.size}</Text>
            <Text style={styles.statLabel}>Read Correctly</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalAttempts}</Text>
            <Text style={styles.statLabel}>Total Attempts</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={skipSentence}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.needsPracticeButton]}
            onPress={() => markAsRead(false)}
          >
            <Text style={styles.actionButtonText}>Need Practice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.readCorrectlyButton]}
            onPress={() => markAsRead(true)}
          >
            <Text style={styles.actionButtonText}>Read Correctly ✓</Text>
          </TouchableOpacity>
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
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1E40AF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionsBox: {
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1E40AF',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  sentenceCard: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 4,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    minHeight: 200,
  },
  sentenceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 16,
  },
  sentenceText: {
    fontSize: 28,
    lineHeight: 40,
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
    marginVertical: 20,
  },
  sentenceMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  metaBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  metaBadgeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  audioControls: {
    alignItems: 'center',
    marginBottom: 24,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#1E40AF',
    borderRadius: 24,
    elevation: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  audioButtonActive: {
    backgroundColor: '#EF4444',
  },
  audioButtonIcon: {
    fontSize: 24,
  },
  audioButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tipsBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 24,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  needsPracticeButton: {
    backgroundColor: '#F59E0B',
  },
  readCorrectlyButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  completeContainer: {
    padding: 20,
    paddingTop: 60,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCardPass: {
    backgroundColor: '#D1FAE5',
  },
  scoreCardFail: {
    backgroundColor: '#FEF3C7',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  accuracyText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  infoBox: {
    backgroundColor: '#EEF2FF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewSection: {
    marginTop: 8,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  reviewCardCorrect: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  reviewCardIncorrect: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  reviewNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  reviewSentence: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 24,
  },
  reviewStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  reviewMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewMetaItem: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    textTransform: 'capitalize',
  },
  restartButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
