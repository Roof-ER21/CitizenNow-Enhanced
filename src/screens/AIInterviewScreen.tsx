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
import { interviewSimulator } from '../services/llmService';
import { AIMessage, AIFeedback } from '../types';

export default function AIInterviewScreen() {
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

  const API_LIMIT_FREE_TIER = 10; // Free tier limit for demo

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleStartInterview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const greeting = await interviewSimulator.startInterview();
      setMessages([
        {
          role: 'assistant',
          content: greeting,
          timestamp: new Date(),
        },
      ]);
      setInterviewStarted(true);
      setIsDemoMode(interviewSimulator.isDemoSession());
    } catch (err) {
      setError('Failed to start interview. Please check your API key and try again.');
      console.error('Start interview error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    if (apiCallCount >= API_LIMIT_FREE_TIER) {
      setError(`Free tier limit reached (${API_LIMIT_FREE_TIER} API calls). Please upgrade for unlimited access.`);
      return;
    }

    const userMessage = inputText.trim();
    setInputText('');
    setIsLoading(true);
    setError(null);

    // Add user message to UI immediately
    const newUserMessage: AIMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const response = await interviewSimulator.sendMessage(userMessage);
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setApiCallCount((prev) => prev + 1);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Send message error:', err);
    } finally {
      setIsLoading(false);
    }
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
              <Text style={styles.startButtonText}>Start Interview</Text>
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
          </ScrollView>

          {/* Input Area */}
          {!interviewEnded && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type your response..."
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.buttonDisabled]}
                onPress={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
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
    marginTop: 24,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
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
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
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
