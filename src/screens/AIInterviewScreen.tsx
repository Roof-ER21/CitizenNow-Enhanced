import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { interviewSimulator, speechRecognition } from '../services/llmService';
import { getVoiceGuidanceService, VoiceGuidanceService } from '../services/voiceGuidance';
import { RealTimeCoach } from '../services/interviewCoaching';
import { audioRecordingService } from '../services/audioRecordingService';
import { InterviewSetupModal } from '../components/InterviewSetupModal';
import { VoiceRecordingButton } from '../components/VoiceRecordingButton';
import { AIMessage, AIFeedback, InterviewPreferences, InterviewCoachingInsight } from '../types';

export default function AIInterviewScreen() {
  // Existing state
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [apiCallCount, setApiCallCount] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Voice interview state
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [interviewPreferences, setInterviewPreferences] = useState<InterviewPreferences | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [coachingInsights, setCoachingInsights] = useState<InterviewCoachingInsight[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voiceGuidanceServiceRef = useRef<VoiceGuidanceService | null>(null);
  const realTimeCoachRef = useRef<RealTimeCoach | null>(null);

  const API_LIMIT_FREE_TIER = 10;

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Cleanup voice services on unmount
  useEffect(() => {
    return () => {
      if (voiceGuidanceServiceRef.current) {
        voiceGuidanceServiceRef.current.stop();
      }
    };
  }, []);

  const handleStartInterview = () => {
    // Show setup modal instead of starting immediately
    setShowSetupModal(true);
  };

  const handleInterviewSetupComplete = async (preferences: InterviewPreferences) => {
    setInterviewPreferences(preferences);
    setVoiceEnabled(preferences.voiceEnabled);
    setShowSetupModal(false);

    // Initialize voice guidance service if enabled
    if (preferences.voiceEnabled && preferences.officerVoice) {
      voiceGuidanceServiceRef.current = getVoiceGuidanceService({
        enabled: true,
        gender: preferences.officerVoice.gender,
        rate: preferences.officerVoice.rate,
        autoPlay: preferences.autoSpeakQuestions,
      });
    }

    // Initialize real-time coach if realtime mode
    if (preferences.coachingMode === 'realtime') {
      realTimeCoachRef.current = new RealTimeCoach();
    }

    // Start the actual interview
    await startActualInterview();
  };

  const startActualInterview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const greeting = await interviewSimulator.startInterview();
      const greetingMessage: AIMessage = {
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      };
      setMessages([greetingMessage]);
      setInterviewStarted(true);
      setIsDemoMode(interviewSimulator.isDemoSession());

      // Auto-speak greeting if voice enabled
      if (voiceEnabled && voiceGuidanceServiceRef.current) {
        setIsSpeaking(true);
        await voiceGuidanceServiceRef.current.speakQuestion(greeting);
        setIsSpeaking(false);
      }
    } catch (err) {
      setError('Failed to start interview. Please check your API key and try again.');
      console.error('Start interview error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend || isLoading) return;

    if (apiCallCount >= API_LIMIT_FREE_TIER) {
      setError(`Free tier limit reached (${API_LIMIT_FREE_TIER} API calls). Please upgrade for unlimited access.`);
      return;
    }

    setInputText('');
    setIsLoading(true);
    setError(null);

    // Add user message to UI immediately
    const newUserMessage: AIMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Real-time coaching analysis
    if (interviewPreferences?.coachingMode === 'realtime' && realTimeCoachRef.current) {
      const insights = realTimeCoachRef.current.analyzeResponse(textToSend);
      if (insights.length > 0) {
        setCoachingInsights((prev) => [...prev, ...insights]);
      }
    }

    try {
      const response = await interviewSimulator.sendMessage(textToSend);
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setApiCallCount((prev) => prev + 1);

      // Auto-speak officer response if voice enabled
      if (voiceEnabled && voiceGuidanceServiceRef.current) {
        setIsSpeaking(true);
        await voiceGuidanceServiceRef.current.speakQuestion(response);
        setIsSpeaking(false);
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Send message error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceRecording = async (uri: string, durationMs: number) => {
    setIsLoading(true);
    setIsRecording(false);
    try {
      // Convert audio URI to blob
      const audioBlob = await audioRecordingService.recordingToBlob(uri);

      // Transcribe using Whisper
      const transcribedText = await speechRecognition.transcribe(audioBlob);

      if (transcribedText) {
        // Send transcribed text as message
        await handleSendMessage(transcribedText);
      } else {
        setError('Could not transcribe audio. Please try again.');
      }
    } catch (err) {
      console.error('Voice recording error:', err);
      setError('Failed to process voice recording. Please try typing instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordingStart = () => {
    setIsRecording(true);
  };

  const handleRecordingCancel = () => {
    setIsRecording(false);
  };

  const handleEndInterview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const interviewFeedback = await interviewSimulator.getFeedback();
      setFeedback(interviewFeedback);
      setInterviewEnded(true);
      setShowFeedbackModal(true);
      setApiCallCount((prev) => prev + 1);
    } catch (err) {
      setError('Failed to get feedback. Please try again.');
      console.error('Get feedback error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetInterview = () => {
    setMessages([]);
    setInputText('');
    setInterviewStarted(false);
    setInterviewEnded(false);
    setFeedback(null);
    setShowFeedbackModal(false);
    setError(null);
    setCoachingInsights([]);
    setVoiceEnabled(false);
    setInterviewPreferences(null);
    if (voiceGuidanceServiceRef.current) {
      voiceGuidanceServiceRef.current.stop();
      voiceGuidanceServiceRef.current = null;
    }
  };

  const renderMessage = (message: AIMessage, index: number) => {
    if (message.role === 'system') return null;

    const isUser = message.role === 'user';
    return (
      <View
        key={index}
        style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}
      >
        <Text style={styles.messageLabel}>{isUser ? 'You' : 'USCIS Officer'}</Text>
        <Text style={styles.messageText}>{message.content}</Text>
        <Text style={styles.messageTimestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  const renderFeedbackModal = () => {
    if (!feedback) return null;

    return (
      <Modal
        visible={showFeedbackModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Interview Feedback</Text>

              <View style={styles.scoreContainer}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>Overall Score</Text>
                  <Text style={styles.scoreValue}>{feedback.overallScore}/100</Text>
                </View>
                {feedback.englishSpeakingScore && (
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>English Speaking</Text>
                    <Text style={styles.scoreValue}>{feedback.englishSpeakingScore}/100</Text>
                  </View>
                )}
                {feedback.civicsAccuracy && (
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Civics Accuracy</Text>
                    <Text style={styles.scoreValue}>{feedback.civicsAccuracy}/100</Text>
                  </View>
                )}
              </View>

              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackSectionTitle}>Strengths</Text>
                {feedback.strengths.map((strength, index) => (
                  <Text key={index} style={styles.feedbackItem}>
                    • {strength}
                  </Text>
                ))}
              </View>

              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackSectionTitle}>Areas for Improvement</Text>
                {feedback.areasForImprovement.map((area, index) => (
                  <Text key={index} style={styles.feedbackItem}>
                    • {area}
                  </Text>
                ))}
              </View>

              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackSectionTitle}>Detailed Feedback</Text>
                <Text style={styles.detailedFeedback}>{feedback.detailedFeedback}</Text>
              </View>

              {interviewPreferences?.coachingMode === 'minimal' && coachingInsights.length > 0 && (
                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackSectionTitle}>Speaking Analysis</Text>
                  {coachingInsights.slice(0, 5).map((insight, idx) => (
                    <Text key={idx} style={styles.feedbackItem}>
                      • {insight.message}
                    </Text>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.closeButton} onPress={() => setShowFeedbackModal(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.retryButton} onPress={handleResetInterview}>
                <Text style={styles.retryButtonText}>Start New Interview</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>AI Interview Simulator</Text>
            <Text style={styles.headerSubtitle}>
              Practice with a realistic USCIS officer simulation
              {voiceEnabled && ' • Voice Enabled'}
            </Text>
          </View>
          {isDemoMode && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>DEMO</Text>
            </View>
          )}
        </View>
        {isDemoMode && (
          <View style={styles.demoNotice}>
            <Text style={styles.demoNoticeText}>
              Demo Mode Active - Experiencing the app without API keys. Add your OpenAI key in Settings for real AI interviews.
            </Text>
          </View>
        )}
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Main Content */}
      {!interviewStarted ? (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome to Interview Practice</Text>
          <Text style={styles.welcomeText}>
            This AI-powered simulator will conduct a realistic naturalization interview. You'll be
            asked civics questions, review your N-400 application, and practice speaking English.
          </Text>
          <Text style={styles.welcomeTips}>Tips:</Text>
          <Text style={styles.welcomeTip}>• Speak naturally and clearly</Text>
          <Text style={styles.welcomeTip}>• Take your time to think before answering</Text>
          <Text style={styles.welcomeTip}>• Ask for clarification if needed</Text>
          <Text style={styles.welcomeTip}>• The interview typically lasts 15-20 minutes</Text>

          <TouchableOpacity
            style={[styles.startButton, isLoading && styles.buttonDisabled]}
            onPress={handleStartInterview}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="play" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.startButtonText}>Start Interview</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Messages List */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((message, index) => renderMessage(message, index))}
            {isLoading && (
              <View style={styles.loadingMessage}>
                <ActivityIndicator color="#1E40AF" />
                <Text style={styles.loadingText}>Officer is responding...</Text>
              </View>
            )}
            {/* Real-time Coaching Insights */}
            {interviewPreferences?.coachingMode === 'realtime' && coachingInsights.length > 0 && (
              <View style={styles.coachingPanel}>
                <View style={styles.coachingHeader}>
                  <Ionicons name="school" size={16} color="#10B981" />
                  <Text style={styles.coachingTitle}>Coaching Tips</Text>
                </View>
                {coachingInsights.slice(-3).map((insight, idx) => (
                  <View key={idx} style={[
                    styles.coachingInsight,
                    insight.type === 'positive' && styles.coachingPositive,
                    insight.type === 'warning' && styles.coachingWarning,
                    insight.type === 'critical' && styles.coachingCritical,
                  ]}>
                    <Ionicons
                      name={
                        insight.type === 'positive' ? 'checkmark-circle' :
                        insight.type === 'warning' ? 'alert-circle' :
                        insight.type === 'critical' ? 'close-circle' : 'information-circle'
                      }
                      size={14}
                      color={
                        insight.type === 'positive' ? '#10B981' :
                        insight.type === 'warning' ? '#F59E0B' :
                        insight.type === 'critical' ? '#EF4444' : '#3B82F6'
                      }
                    />
                    <Text style={styles.coachingText}>{insight.message}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          {!interviewEnded && (
            <View style={styles.inputSection}>
              {/* Voice/Text Mode Toggle */}
              {voiceEnabled && (
                <View style={styles.inputModeToggle}>
                  <TouchableOpacity
                    onPress={() => setInterviewPreferences(prev => prev ? {...prev, preferVoiceInput: false} : null)}
                    style={[styles.toggleButton, !interviewPreferences?.preferVoiceInput && styles.toggleButtonActive]}
                  >
                    <Ionicons name="text" size={20} color={interviewPreferences?.preferVoiceInput ? '#9CA3AF' : '#3B82F6'} />
                    <Text style={[styles.toggleText, !interviewPreferences?.preferVoiceInput && styles.toggleTextActive]}>
                      Text
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setInterviewPreferences(prev => prev ? {...prev, preferVoiceInput: true} : null)}
                    style={[styles.toggleButton, interviewPreferences?.preferVoiceInput && styles.toggleButtonActive]}
                  >
                    <Ionicons name="mic" size={20} color={interviewPreferences?.preferVoiceInput ? '#3B82F6' : '#9CA3AF'} />
                    <Text style={[styles.toggleText, interviewPreferences?.preferVoiceInput && styles.toggleTextActive]}>
                      Voice
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Input Controls */}
              {voiceEnabled && interviewPreferences?.preferVoiceInput ? (
                <View style={styles.voiceInputContainer}>
                  <VoiceRecordingButton
                    onRecordingComplete={handleVoiceRecording}
                    onRecordingStart={handleRecordingStart}
                    onRecordingCancel={handleRecordingCancel}
                    maxDurationMs={30000}
                    disabled={isLoading || isSpeaking}
                    size="large"
                  />
                  {isSpeaking && (
                    <Text style={styles.speakingIndicator}>
                      🔊 Officer is speaking...
                    </Text>
                  )}
                </View>
              ) : (
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Type your response..."
                    placeholderTextColor="#9CA3AF"
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={500}
                    editable={!isLoading && !isSpeaking}
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, (!inputText.trim() || isLoading || isSpeaking) && styles.buttonDisabled]}
                    onPress={() => handleSendMessage()}
                    disabled={!inputText.trim() || isLoading || isSpeaking}
                  >
                    <Ionicons name="send" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {!interviewEnded && (
              <TouchableOpacity
                style={[styles.endButton, isLoading && styles.buttonDisabled]}
                onPress={handleEndInterview}
                disabled={isLoading}
              >
                <Text style={styles.endButtonText}>End Interview & Get Feedback</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.resetButton} onPress={handleResetInterview}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Feedback Modal */}
      {renderFeedbackModal()}

      {/* Interview Setup Modal */}
      <InterviewSetupModal
        visible={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onStart={handleInterviewSetupComplete}
        defaultPreferences={interviewPreferences || undefined}
      />
    </KeyboardAvoidingView>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
  },
  demoBadge: {
    backgroundColor: '#FCD34D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  demoBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  demoNotice: {
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  demoNoticeText: {
    fontSize: 12,
    color: '#FCD34D',
    lineHeight: 16,
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
  welcomeContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  welcomeTips: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  welcomeTip: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#1E40AF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: '#DBEAFE',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  messageTimestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  loadingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  inputSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  inputModeToggle: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  voiceInputContainer: {
    padding: 16,
    alignItems: 'center',
  },
  speakingIndicator: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  textInputContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#1E40AF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachingPanel: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  coachingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  coachingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  coachingInsight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 6,
  },
  coachingPositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  coachingWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  coachingCritical: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  coachingText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  actionButtons: {
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  endButton: {
    backgroundColor: '#059669',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  endButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  feedbackSection: {
    marginBottom: 20,
  },
  feedbackSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  feedbackItem: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 4,
  },
  detailedFeedback: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#1E40AF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  retryButtonText: {
    color: '#1E40AF',
    fontSize: 16,
    fontWeight: '600',
  },
});
