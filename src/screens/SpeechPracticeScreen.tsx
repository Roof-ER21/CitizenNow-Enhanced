import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
// Note: Audio recording disabled - expo-av removed. Feature requires native audio implementation.
import { speechRecognition } from '../services/llmService';
import { PronunciationError } from '../types';

// Stub Audio types (expo-av removed)
const Audio = {
  Recording: class {},
  Sound: class {},
  requestPermissionsAsync: async () => ({ status: 'denied' }),
  setAudioModeAsync: async () => {},
  RecordingOptionsPresets: { HIGH_QUALITY: {} },
};

// Sample civics questions for practice
const PRACTICE_QUESTIONS = [
  { id: '1', question: 'What is the supreme law of the land?', answer: 'The Constitution' },
  { id: '2', question: 'What does the Constitution do?', answer: 'Sets up the government, defines the government, protects basic rights of Americans' },
  { id: '3', question: 'The idea of self-government is in the first three words of the Constitution. What are these words?', answer: 'We the People' },
  { id: '4', question: 'What is an amendment?', answer: 'A change to the Constitution, an addition to the Constitution' },
  { id: '5', question: 'What do we call the first ten amendments to the Constitution?', answer: 'The Bill of Rights' },
  { id: '6', question: 'What is one right or freedom from the First Amendment?', answer: 'Speech, religion, assembly, press, petition the government' },
  { id: '7', question: 'How many amendments does the Constitution have?', answer: 'Twenty-seven (27)' },
  { id: '8', question: 'What did the Declaration of Independence do?', answer: 'Announced our independence from Great Britain, declared our independence from Great Britain' },
  { id: '9', question: 'What are two rights in the Declaration of Independence?', answer: 'Life, liberty, pursuit of happiness' },
  { id: '10', question: 'What is freedom of religion?', answer: 'You can practice any religion, or not practice a religion' },
];

export default function SpeechPracticeScreen() {
  const [selectedQuestion, setSelectedQuestion] = useState(PRACTICE_QUESTIONS[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [pronunciationErrors, setPronunciationErrors] = useState<PronunciationError[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioWaveform, setAudioWaveform] = useState<number[]>([]);
  const [apiCallCount, setApiCallCount] = useState(0);

  const API_LIMIT_FREE_TIER = 5; // Lower limit for Whisper API (more expensive)

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    // Simulate waveform animation during recording
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioWaveform((prev) => {
          const newWave = [...prev, Math.random() * 100];
          return newWave.slice(-20); // Keep last 20 samples
        });
      }, 100);
    } else {
      setAudioWaveform([]);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Microphone permission is required for speech practice.');
        return false;
      }
      return true;
    } catch (err) {
      setError('Failed to request microphone permission.');
      return false;
    }
  };

  const startRecording = async () => {
    if (apiCallCount >= API_LIMIT_FREE_TIER) {
      setError(`Free tier limit reached (${API_LIMIT_FREE_TIER} API calls). Please upgrade for unlimited access.`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      setError(null);
      setTranscription(null);
      setPronunciationErrors([]);
      setRecordedUri(null);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      setError('Failed to start recording. Please try again.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);

      // Analyze the recording
      if (uri) {
        await analyzeRecording(uri);
      }
    } catch (err) {
      setError('Failed to stop recording.');
      console.error('Stop recording error:', err);
    }
  };

  const analyzeRecording = async (uri: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Fetch the audio file
      const response = await fetch(uri);
      const blob = await response.blob();

      // Transcribe the audio
      const transcribedText = await speechRecognition.transcribe(blob, 'en');
      setTranscription(transcribedText);

      // Analyze pronunciation
      const errors = await speechRecognition.analyzePronunciation(blob, selectedQuestion.answer);
      setPronunciationErrors(errors);

      setApiCallCount((prev) => prev + 2); // Transcription + Analysis
    } catch (err) {
      setError('Failed to analyze recording. Please check your API key and try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playRecording = async () => {
    if (!recordedUri) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordedUri });
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      await newSound.playAsync();
    } catch (err) {
      setError('Failed to play recording.');
      console.error('Playback error:', err);
    }
  };

  const getSeverityColor = (severity: 'minor' | 'moderate' | 'critical') => {
    switch (severity) {
      case 'minor':
        return '#FCD34D';
      case 'moderate':
        return '#F59E0B';
      case 'critical':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      accessible={false}
      accessibilityRole="none"
    >
      {/* Header */}
      <View
        style={styles.header}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel={`Speech Practice. Practice pronunciation with AI feedback. API calls used: ${apiCallCount} of ${API_LIMIT_FREE_TIER}`}
      >
        <Text style={styles.headerTitle}>Speech Practice</Text>
        <Text style={styles.headerSubtitle}>Practice pronunciation with AI feedback</Text>
        <Text style={styles.apiCounter}>
          API Calls: {apiCallCount}/{API_LIMIT_FREE_TIER} (Free Tier)
        </Text>
      </View>

      {/* Error Display */}
      {error && (
        <View
          style={styles.errorContainer}
          accessible={true}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          accessibilityLabel={`Error: ${error}`}
        >
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Question Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select a Question</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.questionScroll}
          accessible={false}
          accessibilityRole="none"
        >
          {PRACTICE_QUESTIONS.map((q) => (
            <TouchableOpacity
              key={q.id}
              style={[
                styles.questionChip,
                selectedQuestion.id === q.id && styles.questionChipSelected,
              ]}
              onPress={() => {
                setSelectedQuestion(q);
                setTranscription(null);
                setPronunciationErrors([]);
                setRecordedUri(null);
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Question ${q.id}: ${q.question}`}
              accessibilityState={{
                selected: selectedQuestion.id === q.id,
              }}
              accessibilityHint="Double tap to select this practice question"
            >
              <Text
                style={[
                  styles.questionChipText,
                  selectedQuestion.id === q.id && styles.questionChipTextSelected,
                ]}
              >
                Q{q.id}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Selected Question Display */}
      <View style={styles.section}>
        <View
          style={styles.questionCard}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`Selected question: ${selectedQuestion.question}. Expected answer: ${selectedQuestion.answer}`}
        >
          <Text style={styles.questionLabel}>Question:</Text>
          <Text style={styles.questionText}>{selectedQuestion.question}</Text>
          <Text style={styles.answerLabel}>Expected Answer:</Text>
          <Text style={styles.answerText}>{selectedQuestion.answer}</Text>
        </View>
      </View>

      {/* Recording Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Record Your Answer</Text>
        <View style={styles.recordingContainer}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
              (isAnalyzing || apiCallCount >= API_LIMIT_FREE_TIER) && styles.buttonDisabled,
            ]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isAnalyzing || apiCallCount >= API_LIMIT_FREE_TIER}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isRecording ? 'Stop recording your answer' : 'Start recording your answer'}
            accessibilityState={{
              disabled: isAnalyzing || apiCallCount >= API_LIMIT_FREE_TIER,
              busy: isRecording,
            }}
            accessibilityHint={isRecording ? 'Double tap to stop recording' : 'Double tap to start recording your answer'}
          >
            <View style={[styles.recordIcon, isRecording && styles.recordIconActive]} />
            <Text style={styles.recordButtonText}>
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Text>
          </TouchableOpacity>

          {recordedUri && (
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.buttonDisabled]}
              onPress={playRecording}
              disabled={isPlaying}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? 'Currently playing recording' : 'Play your recording'}
              accessibilityState={{
                disabled: isPlaying,
                busy: isPlaying,
              }}
              accessibilityHint="Double tap to play back your recorded answer"
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? 'Playing...' : 'Play Recording'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Waveform Visualization */}
        {isRecording && (
          <View
            style={styles.waveformContainer}
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel="Audio waveform visualization"
            accessibilityHint="Visual representation of your voice while recording"
          >
            {audioWaveform.map((height, index) => (
              <View
                key={index}
                style={[
                  styles.waveformBar,
                  { height: Math.max(height, 10) },
                ]}
                accessible={false}
                importantForAccessibility="no"
              />
            ))}
          </View>
        )}
      </View>

      {/* Analysis Loading */}
      {isAnalyzing && (
        <View
          style={styles.loadingContainer}
          accessible={true}
          accessibilityRole="progressbar"
          accessibilityLabel="Analyzing your pronunciation"
          accessibilityLiveRegion="polite"
        >
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Analyzing your pronunciation...</Text>
        </View>
      )}

      {/* Transcription Display */}
      {transcription && !isAnalyzing && (
        <View
          style={styles.section}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`Your transcription: ${transcription}`}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.sectionTitle}>What You Said</Text>
          <View style={styles.transcriptionCard}>
            <Text style={styles.transcriptionText}>{transcription}</Text>
          </View>
        </View>
      )}

      {/* Pronunciation Feedback */}
      {pronunciationErrors.length > 0 && !isAnalyzing && (
        <View
          style={styles.section}
          accessible={true}
          accessibilityRole="summary"
          accessibilityLabel={`Pronunciation feedback: ${pronunciationErrors.length} pronunciation errors found`}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.sectionTitle}>Pronunciation Feedback</Text>
          {pronunciationErrors.map((error, index) => (
            <View
              key={index}
              style={[
                styles.errorCard,
                { borderLeftColor: getSeverityColor(error.severity) },
              ]}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`Word: ${error.word}. Severity: ${error.severity}. You said: ${error.attemptedPronunciation}. Correct pronunciation: ${error.correctPronunciation}. Suggestion: ${error.suggestion}`}
            >
              <View style={styles.errorHeader}>
                <Text style={styles.errorWord}>{error.word}</Text>
                <Text
                  style={[
                    styles.errorSeverity,
                    { color: getSeverityColor(error.severity) },
                  ]}
                >
                  {error.severity}
                </Text>
              </View>
              <Text style={styles.errorAttempt}>
                You said: <Text style={styles.errorAttemptText}>{error.attemptedPronunciation}</Text>
              </Text>
              <Text style={styles.errorCorrect}>
                Correct: <Text style={styles.errorCorrectText}>{error.correctPronunciation}</Text>
              </Text>
              <Text style={styles.errorSuggestion}>{error.suggestion}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Success Message */}
      {transcription && pronunciationErrors.length === 0 && !isAnalyzing && (
        <View
          style={styles.successContainer}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel="Success! Your pronunciation is clear and accurate. Keep up the great work!"
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.successTitle}>Excellent!</Text>
          <Text style={styles.successText}>
            Your pronunciation is clear and accurate. Keep up the great work!
          </Text>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.instructionsTitle}>Tips for Success</Text>
        <Text style={styles.instructionText}>• Speak clearly and at a moderate pace</Text>
        <Text style={styles.instructionText}>• Practice in a quiet environment</Text>
        <Text style={styles.instructionText}>• Focus on clarity over accent</Text>
        <Text style={styles.instructionText}>• Record multiple times to improve</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#1E40AF',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
    marginBottom: 8,
  },
  apiCounter: {
    fontSize: 12,
    color: '#FCD34D',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  questionScroll: {
    flexDirection: 'row',
  },
  questionChip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  questionChipSelected: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  questionChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  questionChipTextSelected: {
    color: '#FFF',
  },
  questionCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  questionText: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 24,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
    lineHeight: 22,
  },
  recordingContainer: {
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#1E40AF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  recordButtonActive: {
    backgroundColor: '#EF4444',
  },
  recordIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    marginRight: 12,
  },
  recordIconActive: {
    borderRadius: 4,
  },
  recordButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
  },
  playButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    marginTop: 16,
    gap: 4,
  },
  waveformBar: {
    width: 4,
    backgroundColor: '#1E40AF',
    borderRadius: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  transcriptionCard: {
    backgroundColor: '#DBEAFE',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1E40AF',
  },
  transcriptionText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  errorCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorWord: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  errorSeverity: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  errorAttempt: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  errorAttemptText: {
    fontWeight: '600',
    color: '#EF4444',
  },
  errorCorrect: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  errorCorrectText: {
    fontWeight: '600',
    color: '#059669',
  },
  errorSuggestion: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  successContainer: {
    backgroundColor: '#D1FAE5',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 20,
  },
});
