# Voice Interview Integration Guide

## Overview
This guide details the exact changes needed to enhance AIInterviewScreen.tsx with voice capabilities.

## Step 1: Add Imports

Add these imports after line 15:

```typescript
import { Ionicons } from '@expo/vector-icons';
import { InterviewSetupModal } from '../components/InterviewSetupModal';
import { VoiceRecordingButton } from '../components/VoiceRecordingButton';
import { getVoiceGuidanceService, VoiceGuidanceService } from '../services/voiceGuidance';
import { RealTimeCoach } from '../services/interviewCoaching';
import { speechRecognition } from '../services/llmService';
import { audioRecordingService } from '../services/audioRecordingService';
import { InterviewPreferences, InterviewCoachingInsight } from '../types';
```

## Step 2: Add State Variables

After line 28, add these new state hooks:

```typescript
// Voice interview state
const [showSetupModal, setShowSetupModal] = useState(false);
const [interviewPreferences, setInterviewPreferences] = useState<InterviewPreferences | null>(null);
const [voiceEnabled, setVoiceEnabled] = useState(false);
const [coachingInsights, setCoachingInsights] = useState<InterviewCoachingInsight[]>([]);
const [isRecording, setIsRecording] = useState(false);
const [isSpeaking, setIsSpeaking] = useState(false);
const voiceGuidanceServiceRef = useRef<VoiceGuidanceService | null>(null);
const realTimeCoachRef = useRef<RealTimeCoach | null>(null);
```

## Step 3: Modify handleStartInterview

Replace lines 38-58 with:

```typescript
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
```

## Step 4: Enhance handleSendMessage

Replace lines 60-96 with:

```typescript
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
```

## Step 5: Add Voice Recording Handler

Add this new function after handleSendMessage:

```typescript
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
```

## Step 6: Add Voice/Text Toggle UI

Find the input section (around line 295-313) and replace with:

```typescript
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

    {/* Input Area */}
    {interviewPreferences?.preferVoiceInput ? (
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
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your answer..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={500}
          editable={!isLoading && !isSpeaking}
        />
        <TouchableOpacity
          onPress={() => handleSendMessage()}
          style={[styles.sendButton, (!inputText.trim() || isLoading || isSpeaking) && styles.sendButtonDisabled]}
          disabled={!inputText.trim() || isLoading || isSpeaking}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    )}
  </View>
)}
```

## Step 7: Add Coaching Insights Display

After the loading indicator (around line 286-291), add:

```typescript
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
```

## Step 8: Add Interview Setup Modal

Before the closing KeyboardAvoidingView (around line 337), add:

```typescript
{/* Interview Setup Modal */}
<InterviewSetupModal
  visible={showSetupModal}
  onClose={() => setShowSetupModal(false)}
  onStart={handleInterviewSetupComplete}
  defaultPreferences={interviewPreferences || undefined}
/>
```

## Step 9: Add New Styles

Add these styles to the StyleSheet (after existing styles):

```typescript
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
```

## Step 10: Cleanup on Unmount

Add this useEffect for cleanup (after other useEffect hooks):

```typescript
useEffect(() => {
  return () => {
    // Cleanup voice services on unmount
    if (voiceGuidanceServiceRef.current) {
      voiceGuidanceServiceRef.current.stop();
    }
  };
}, []);
```

## Testing Checklist

1. ✅ Setup modal appears when starting interview
2. ✅ Voice mode toggle works
3. ✅ Officer speaks questions via TTS
4. ✅ Microphone button records audio
5. ✅ Audio transcribes correctly
6. ✅ User can switch between voice/text anytime
7. ✅ Real-time coaching appears when enabled
8. ✅ Minimal coaching mode shows no hints during interview
9. ✅ Interview ends properly with feedback

## Additional Enhancements (Optional)

- Add waveform visualization during officer speech
- Implement pause/resume for long officer responses
- Add voice playback preview before sending
- Show transcription confidence score
- Add pronunciation feedback integration
