// Writing Screen - Writing test practice with input comparison
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import * as Speech from 'expo-speech';
import { WritingSentence } from '../types';
import writingSentences from '../data/writingSentences.json';

interface WritingAttempt {
  sentenceId: string;
  correctSentence: string;
  userInput: string;
  isCorrect: boolean;
  errorCount: number;
}

export default function WritingScreen() {
  const [sentences, setSentences] = useState<WritingSentence[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [attempts, setAttempts] = useState<WritingAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [startTime] = useState(new Date());
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    loadSentences();
    return () => {
      Speech.stop();
    };
  }, []);

  const loadSentences = () => {
    setLoading(true);

    // Select 3 random sentences for practice (mimics real test)
    const allSentences = [...(writingSentences as WritingSentence[])];
    const shuffled = allSentences.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    setSentences(selected);
    setLoading(false);
  };

  const handleListen = async () => {
    const currentSentence = sentences[currentSentenceIndex];

    try {
      setIsSpeaking(true);

      await Speech.speak(currentSentence.sentence, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.7, // Slower for dictation
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

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/\s+/g, ' ');
  };

  const calculateErrors = (input: string, correct: string): number => {
    const inputNorm = normalizeText(input);
    const correctNorm = normalizeText(correct);

    if (inputNorm === correctNorm) return 0;

    // Count word differences
    const inputWords = inputNorm.split(' ');
    const correctWords = correctNorm.split(' ');

    let errors = Math.abs(inputWords.length - correctWords.length);

    const minLength = Math.min(inputWords.length, correctWords.length);
    for (let i = 0; i < minLength; i++) {
      if (inputWords[i] !== correctWords[i]) {
        errors++;
      }
    }

    return errors;
  };

  const getDifferences = (input: string, correct: string): { input: string[]; correct: string[] } => {
    const inputWords = input.trim().split(/\s+/);
    const correctWords = correct.trim().split(/\s+/);

    return {
      input: inputWords,
      correct: correctWords,
    };
  };

  const handleSubmit = () => {
    if (!userInput.trim()) {
      Alert.alert('Empty Input', 'Please type the sentence before submitting.');
      return;
    }

    Keyboard.dismiss();

    const currentSentence = sentences[currentSentenceIndex];
    const errors = calculateErrors(userInput, currentSentence.sentence);
    const isCorrect = errors === 0;

    const attempt: WritingAttempt = {
      sentenceId: currentSentence.id,
      correctSentence: currentSentence.sentence,
      userInput: userInput,
      isCorrect,
      errorCount: errors,
    };

    setAttempts([...attempts, attempt]);
    setShowResult(true);

    // Save progress
    saveProgress(currentSentence.id, isCorrect, errors);
  };

  const saveProgress = async (sentenceId: string, isCorrect: boolean, errors: number) => {
    // Firebase removed - writing progress now tracked locally
    // Local state management only
  };

  const handleNext = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setUserInput('');
      setShowResult(false);
      setHintVisible(false);
    } else {
      finishSession();
    }
  };

  const finishSession = async () => {
    setSessionComplete(true);

    const endTime = new Date();
    const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
    const correctCount = attempts.filter(a => a.isCorrect).length;
    const accuracy = (correctCount / sentences.length) * 100;

    // Firebase removed - session tracking now local only
    // Stats tracked in UserContext via AsyncStorage
  };

  const restartSession = () => {
    setCurrentSentenceIndex(0);
    setUserInput('');
    setShowResult(false);
    setAttempts([]);
    setSessionComplete(false);
    setHintVisible(false);
    loadSentences();
  };

  const toggleHint = () => {
    setHintVisible(!hintVisible);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Loading writing practice...</Text>
      </View>
    );
  }

  if (sessionComplete) {
    const correctCount = attempts.filter(a => a.isCorrect).length;
    const accuracy = (correctCount / sentences.length) * 100;
    const passed = accuracy >= 66.67; // Need to write at least 2 out of 3 correctly

    return (
      <ScrollView style={styles.container}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeTitle}>Writing Practice Complete!</Text>

          <View style={[styles.scoreCard, passed ? styles.scoreCardPass : styles.scoreCardFail]}>
            <Text style={styles.scoreText}>
              {correctCount}/{sentences.length}
            </Text>
            <Text style={styles.accuracyText}>{accuracy.toFixed(0)}%</Text>
            <Text style={styles.statusText}>
              {passed ? 'EXCELLENT ✅' : 'KEEP PRACTICING ⚠️'}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>✍️ About the Writing Test</Text>
            <Text style={styles.infoText}>
              During your citizenship interview, the officer will read one out of three sentences
              and you must write it correctly to demonstrate your ability to write English.
            </Text>
            <Text style={styles.infoText}>
              You must write one sentence without making significant errors. Minor spelling or
              capitalization errors may be acceptable.
            </Text>
          </View>

          {/* Review attempts */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Your Writing Attempts</Text>
            {attempts.map((attempt, index) => {
              const sentence = sentences.find(s => s.id === attempt.sentenceId);
              if (!sentence) return null;

              const differences = getDifferences(attempt.userInput, attempt.correctSentence);

              return (
                <View
                  key={index}
                  style={[
                    styles.reviewCard,
                    attempt.isCorrect ? styles.reviewCardCorrect : styles.reviewCardIncorrect,
                  ]}
                >
                  <Text style={styles.reviewNumber}>Sentence {index + 1}</Text>

                  <View style={styles.comparisonBox}>
                    <Text style={styles.comparisonLabel}>Correct Sentence:</Text>
                    <Text style={styles.comparisonTextCorrect}>{attempt.correctSentence}</Text>
                  </View>

                  <View style={styles.comparisonBox}>
                    <Text style={styles.comparisonLabel}>Your Writing:</Text>
                    <Text style={[
                      styles.comparisonTextUser,
                      attempt.isCorrect ? styles.comparisonTextCorrect : styles.comparisonTextIncorrect,
                    ]}>
                      {attempt.userInput}
                    </Text>
                  </View>

                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewStatus}>
                      {attempt.isCorrect ? '✅ Perfect!' : `⚠️ ${attempt.errorCount} error${attempt.errorCount > 1 ? 's' : ''}`}
                    </Text>
                    <Text style={styles.reviewMetaItem}>{sentence.difficulty}</Text>
                  </View>
                </View>
              );
            })}
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
        <Text style={styles.headerTitle}>Writing Practice</Text>
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
          <Text style={styles.instructionsTitle}>✍️ Instructions</Text>
          <Text style={styles.instructionsText}>
            Listen to the sentence and write it exactly as you hear it. Tap "Listen" to hear it again.
          </Text>
        </View>

        {/* Audio Controls */}
        <View style={styles.audioControls}>
          <TouchableOpacity
            style={[styles.audioButton, isSpeaking && styles.audioButtonActive]}
            onPress={isSpeaking ? stopSpeaking : handleListen}
          >
            <Text style={styles.audioButtonIcon}>
              {isSpeaking ? '⏸️' : '🔊'}
            </Text>
            <Text style={styles.audioButtonText}>
              {isSpeaking ? 'Stop' : 'Listen to Sentence'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hintButton} onPress={toggleHint}>
            <Text style={styles.hintButtonText}>
              {hintVisible ? '🙈 Hide' : '👁️ Show'} Hint
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hint (hidden by default) */}
        {hintVisible && (
          <View style={styles.hintBox}>
            <Text style={styles.hintLabel}>Hint (for practice only):</Text>
            <Text style={styles.hintText}>{currentSentence.sentence}</Text>
          </View>
        )}

        {/* Writing Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>WRITE THE SENTENCE HERE:</Text>
          <TextInput
            style={styles.input}
            placeholder="Type what you hear..."
            placeholderTextColor="#9CA3AF"
            value={userInput}
            onChangeText={setUserInput}
            multiline
            autoCapitalize="sentences"
            autoCorrect={false}
            editable={!showResult}
          />
          <Text style={styles.characterCount}>
            {userInput.length} characters
          </Text>
        </View>

        {/* Result */}
        {showResult && (
          <View style={styles.resultCard}>
            {userInput.trim() && (
              <>
                <Text style={styles.resultTitle}>
                  {calculateErrors(userInput, currentSentence.sentence) === 0 ? '✅ Perfect!' : '⚠️ Compare Your Writing'}
                </Text>

                <View style={styles.comparisonContainer}>
                  <View style={styles.comparisonBox}>
                    <Text style={styles.comparisonLabel}>Correct:</Text>
                    <Text style={styles.comparisonTextCorrect}>{currentSentence.sentence}</Text>
                  </View>

                  <View style={styles.comparisonBox}>
                    <Text style={styles.comparisonLabel}>Your Writing:</Text>
                    <Text style={[
                      styles.comparisonTextUser,
                      calculateErrors(userInput, currentSentence.sentence) === 0
                        ? styles.comparisonTextCorrect
                        : styles.comparisonTextIncorrect,
                    ]}>
                      {userInput}
                    </Text>
                  </View>

                  {calculateErrors(userInput, currentSentence.sentence) > 0 && (
                    <Text style={styles.errorCount}>
                      {calculateErrors(userInput, currentSentence.sentence)} error(s) detected
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>💡 Writing Tips</Text>
          <Text style={styles.tipText}>• Listen carefully to each word</Text>
          <Text style={styles.tipText}>• Use correct capitalization and punctuation</Text>
          <Text style={styles.tipText}>• Write legibly (or type carefully)</Text>
          <Text style={styles.tipText}>• You can ask to hear the sentence up to 3 times</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{attempts.filter(a => a.isCorrect).length}</Text>
            <Text style={styles.statLabel}>Written Correctly</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{attempts.length}</Text>
            <Text style={styles.statLabel}>Total Attempts</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        {!showResult ? (
          <TouchableOpacity
            style={[styles.submitButton, !userInput.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!userInput.trim()}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentSentenceIndex < sentences.length - 1 ? 'Next Sentence' : 'Finish Session'}
            </Text>
          </TouchableOpacity>
        )}
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
  audioControls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  audioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: '#1E40AF',
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  hintButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
  },
  hintButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hintBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
  },
  hintLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 16,
    color: '#1F2937',
    fontStyle: 'italic',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 12,
  },
  input: {
    fontSize: 18,
    lineHeight: 28,
    color: '#1F2937',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'right',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonContainer: {
    gap: 12,
  },
  comparisonBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  comparisonTextCorrect: {
    fontSize: 16,
    lineHeight: 24,
    color: '#10B981',
  },
  comparisonTextUser: {
    fontSize: 16,
    lineHeight: 24,
  },
  comparisonTextIncorrect: {
    color: '#EF4444',
  },
  errorCount: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
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
  submitButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
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
    marginBottom: 12,
  },
  reviewStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
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
