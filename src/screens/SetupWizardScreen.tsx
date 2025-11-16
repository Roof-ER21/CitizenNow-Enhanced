import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { apiKeyService, APIValidationResult } from '../services/apiKeyService';

type SetupWizardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SetupWizard'>;

interface SetupWizardScreenProps {
  navigation: SetupWizardScreenNavigationProp;
}

type SetupStep = 'welcome' | 'openai' | 'gemini' | 'review';

export default function SetupWizardScreen({ navigation }: SetupWizardScreenProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome');
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiValidated, setOpenaiValidated] = useState(false);
  const [geminiValidated, setGeminiValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Load existing keys if any
  useEffect(() => {
    loadExistingKeys();
  }, []);

  const loadExistingKeys = async () => {
    try {
      const [existingOpenai, existingGemini] = await Promise.all([
        apiKeyService.getOpenAIKey(),
        apiKeyService.getGeminiKey(),
      ]);

      if (existingOpenai) {
        setOpenaiKey(existingOpenai);
        setOpenaiValidated(true);
      }
      if (existingGemini) {
        setGeminiKey(existingGemini);
        setGeminiValidated(true);
      }
    } catch (error) {
      console.error('Error loading existing keys:', error);
    }
  };

  const handleSkipSetup = async () => {
    Alert.alert(
      'Skip API Setup?',
      'You can use basic features without API keys. AI features (Interview, Speech Practice, N-400 Assistant) will be unavailable.\n\nYou can always set up APIs later in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'default',
          onPress: async () => {
            await apiKeyService.markSetupSkipped();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleContinueWithAPIs = () => {
    setCurrentStep('openai');
  };

  const handleValidateOpenAI = async () => {
    if (!openaiKey.trim()) {
      Alert.alert('Error', 'Please enter an OpenAI API key');
      return;
    }

    setIsValidating(true);
    try {
      const result: APIValidationResult = await apiKeyService.validateAPIKey('openai', openaiKey);

      if (result.isValid) {
        await apiKeyService.saveOpenAIKey(openaiKey);
        setOpenaiValidated(true);
        Alert.alert('Success', result.message || 'OpenAI API key is valid!');
      } else {
        setOpenaiValidated(false);
        Alert.alert('Validation Failed', result.error || 'Invalid API key');
      }
    } catch (error) {
      console.error('Error validating OpenAI key:', error);
      Alert.alert('Error', 'Failed to validate API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleValidateGemini = async () => {
    if (!geminiKey.trim()) {
      Alert.alert('Error', 'Please enter a Gemini API key');
      return;
    }

    setIsValidating(true);
    try {
      const result: APIValidationResult = await apiKeyService.validateAPIKey('gemini', geminiKey);

      if (result.isValid) {
        await apiKeyService.saveGeminiKey(geminiKey);
        setGeminiValidated(true);
        Alert.alert('Success', result.message || 'Gemini API key is valid!');
      } else {
        setGeminiValidated(false);
        Alert.alert('Validation Failed', result.error || 'Invalid API key');
      }
    } catch (error) {
      console.error('Error validating Gemini key:', error);
      Alert.alert('Error', 'Failed to validate API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'openai') {
      setCurrentStep('gemini');
    } else if (currentStep === 'gemini') {
      setCurrentStep('review');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'gemini') {
      setCurrentStep('openai');
    } else if (currentStep === 'review') {
      setCurrentStep('gemini');
    } else if (currentStep === 'openai') {
      setCurrentStep('welcome');
    }
  };

  const handleComplete = async () => {
    try {
      await apiKeyService.markSetupCompleted();
      Alert.alert(
        'Setup Complete!',
        'Your API keys have been saved securely. You can now use all features of CitizenNow Enhanced.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error completing setup:', error);
      Alert.alert('Error', 'Failed to save setup. Please try again.');
    }
  };

  const handleRemoveKey = async (keyType: 'openai' | 'gemini') => {
    Alert.alert(
      'Remove API Key?',
      `Are you sure you want to remove your ${keyType === 'openai' ? 'OpenAI' : 'Gemini'} API key?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              if (keyType === 'openai') {
                await apiKeyService.removeOpenAIKey();
                setOpenaiKey('');
                setOpenaiValidated(false);
              } else {
                await apiKeyService.removeGeminiKey();
                setGeminiKey('');
                setGeminiValidated(false);
              }
              Alert.alert('Success', 'API key removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove API key');
            }
          },
        },
      ]
    );
  };

  const openURL = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };

  // Render different steps
  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>🚀</Text>
      <Text style={styles.stepTitle}>Welcome to CitizenNow Enhanced</Text>
      <Text style={styles.stepDescription}>
        Let's set up your AI-powered features to help you prepare for your citizenship interview.
      </Text>

      <View style={styles.featureSection}>
        <Text style={styles.featureSectionTitle}>Available Without API Keys (Free)</Text>
        <FeatureItem icon="✓" text="Civics Questions Flashcards" />
        <FeatureItem icon="✓" text="Practice Quizzes" />
        <FeatureItem icon="✓" text="Reading & Writing Practice" />
        <FeatureItem icon="✓" text="Progress Tracking" />
        <FeatureItem icon="✓" text="Study Reminders" />
      </View>

      <View style={styles.featureSection}>
        <Text style={styles.featureSectionTitle}>With API Keys (Premium Features)</Text>
        <FeatureItem icon="🤖" text="AI Mock Interview Simulator" apiRequired />
        <FeatureItem icon="🎤" text="Speech Practice with Feedback" apiRequired />
        <FeatureItem icon="📋" text="N-400 Form Assistant" apiRequired />
        <FeatureItem icon="🔊" text="Pronunciation Analysis" apiRequired />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleContinueWithAPIs}>
          <Text style={styles.primaryButtonText}>Set Up API Keys</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSkipSetup}>
          <Text style={styles.secondaryButtonText}>Continue Without APIs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOpenAISetup = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 1: OpenAI API Key</Text>
      <Text style={styles.stepDescription}>
        OpenAI powers the AI Interview Simulator and Speech Practice features using GPT-4 and Whisper.
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>What you'll get:</Text>
        <Text style={styles.infoText}>• Realistic USCIS interview simulation</Text>
        <Text style={styles.infoText}>• Speech-to-text transcription</Text>
        <Text style={styles.infoText}>• Pronunciation feedback</Text>
        <Text style={styles.infoText}>• Personalized interview practice</Text>
      </View>

      <View style={styles.apiKeyInputSection}>
        <Text style={styles.label}>OpenAI API Key</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, openaiValidated && styles.inputValidated]}
            value={openaiKey}
            onChangeText={(text) => {
              setOpenaiKey(text);
              setOpenaiValidated(false);
            }}
            placeholder="sk-..."
            secureTextEntry={!showOpenaiKey}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isValidating}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowOpenaiKey(!showOpenaiKey)}
          >
            <Text style={styles.eyeIcon}>{showOpenaiKey ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>

        {openaiValidated && (
          <View style={styles.validatedBadge}>
            <Text style={styles.validatedText}>✓ Validated</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.testButton, isValidating && styles.testButtonDisabled]}
          onPress={handleValidateOpenAI}
          disabled={isValidating}
        >
          {isValidating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.testButtonText}>
              {openaiValidated ? 'Re-test Connection' : 'Test Connection'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>How to get an API key:</Text>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => openURL('https://platform.openai.com/api-keys')}
        >
          <Text style={styles.linkText}>1. Visit OpenAI Platform →</Text>
        </TouchableOpacity>
        <Text style={styles.helpText}>2. Sign in or create an account</Text>
        <Text style={styles.helpText}>3. Click "Create new secret key"</Text>
        <Text style={styles.helpText}>4. Copy and paste the key above</Text>
        <Text style={styles.helpNote}>
          Note: API usage is billed by OpenAI. Typical interview costs $0.10-0.30.
        </Text>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.backButton} onPress={handlePreviousStep}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !openaiValidated && styles.nextButtonDisabled]}
          onPress={handleNextStep}
          disabled={!openaiValidated}
        >
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.skipStepButton} onPress={handleNextStep}>
        <Text style={styles.skipStepText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGeminiSetup = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 2: Google Gemini API Key</Text>
      <Text style={styles.stepDescription}>
        Gemini provides intelligent N-400 form assistance and explanations in multiple languages.
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>What you'll get:</Text>
        <Text style={styles.infoText}>• N-400 form help in your language</Text>
        <Text style={styles.infoText}>• Complex term explanations</Text>
        <Text style={styles.infoText}>• Personalized practice questions</Text>
        <Text style={styles.infoText}>• Multi-language support</Text>
      </View>

      <View style={styles.apiKeyInputSection}>
        <Text style={styles.label}>Gemini API Key</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, geminiValidated && styles.inputValidated]}
            value={geminiKey}
            onChangeText={(text) => {
              setGeminiKey(text);
              setGeminiValidated(false);
            }}
            placeholder="AIza..."
            secureTextEntry={!showGeminiKey}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isValidating}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowGeminiKey(!showGeminiKey)}
          >
            <Text style={styles.eyeIcon}>{showGeminiKey ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>

        {geminiValidated && (
          <View style={styles.validatedBadge}>
            <Text style={styles.validatedText}>✓ Validated</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.testButton, isValidating && styles.testButtonDisabled]}
          onPress={handleValidateGemini}
          disabled={isValidating}
        >
          {isValidating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.testButtonText}>
              {geminiValidated ? 'Re-test Connection' : 'Test Connection'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>How to get an API key:</Text>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => openURL('https://makersuite.google.com/app/apikey')}
        >
          <Text style={styles.linkText}>1. Visit Google AI Studio →</Text>
        </TouchableOpacity>
        <Text style={styles.helpText}>2. Sign in with your Google account</Text>
        <Text style={styles.helpText}>3. Click "Get API Key"</Text>
        <Text style={styles.helpText}>4. Copy and paste the key above</Text>
        <Text style={styles.helpNote}>
          Note: Gemini has a generous free tier. Most users won't incur charges.
        </Text>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.backButton} onPress={handlePreviousStep}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !geminiValidated && styles.nextButtonDisabled]}
          onPress={handleNextStep}
          disabled={!geminiValidated}
        >
          <Text style={styles.nextButtonText}>Review →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.skipStepButton} onPress={handleNextStep}>
        <Text style={styles.skipStepText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReview = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>✓</Text>
      <Text style={styles.stepTitle}>Setup Review</Text>
      <Text style={styles.stepDescription}>
        Review your API configuration before completing setup.
      </Text>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusIcon}>🤖</Text>
            <View>
              <Text style={styles.statusTitle}>OpenAI API</Text>
              <Text style={styles.statusSubtitle}>Interview & Speech Practice</Text>
            </View>
          </View>
          <View style={styles.statusRight}>
            {openaiValidated ? (
              <>
                <View style={styles.statusBadgeGreen}>
                  <Text style={styles.statusBadgeText}>✓ Configured</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveKey('openai')}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.statusBadgeRed}>
                <Text style={styles.statusBadgeText}>Not configured</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.statusRow, { marginTop: 16 }]}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusIcon}>📋</Text>
            <View>
              <Text style={styles.statusTitle}>Gemini API</Text>
              <Text style={styles.statusSubtitle}>N-400 Assistant</Text>
            </View>
          </View>
          <View style={styles.statusRight}>
            {geminiValidated ? (
              <>
                <View style={styles.statusBadgeGreen}>
                  <Text style={styles.statusBadgeText}>✓ Configured</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveKey('gemini')}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.statusBadgeRed}>
                <Text style={styles.statusBadgeText}>Not configured</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📱 Available Features:</Text>
        {openaiValidated && (
          <>
            <Text style={styles.infoText}>✓ AI Mock Interview Simulator</Text>
            <Text style={styles.infoText}>✓ Speech Practice with Feedback</Text>
            <Text style={styles.infoText}>✓ Pronunciation Analysis</Text>
          </>
        )}
        {geminiValidated && (
          <>
            <Text style={styles.infoText}>✓ N-400 Form Assistant</Text>
            <Text style={styles.infoText}>✓ Multi-language Explanations</Text>
          </>
        )}
        {!openaiValidated && !geminiValidated && (
          <Text style={styles.infoText}>No AI features configured. You can add them later in Settings.</Text>
        )}
      </View>

      <View style={styles.securityNote}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>
          Your API keys are stored securely on your device and never sent to our servers.
        </Text>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.backButton} onPress={handlePreviousStep}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Complete Setup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>API Setup</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Progress Indicator */}
      {currentStep !== 'welcome' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    currentStep === 'openai'
                      ? '33%'
                      : currentStep === 'gemini'
                      ? '66%'
                      : '100%',
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep === 'openai'
              ? 'Step 1 of 3'
              : currentStep === 'gemini'
              ? 'Step 2 of 3'
              : 'Step 3 of 3'}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentStep === 'welcome' && renderWelcome()}
        {currentStep === 'openai' && renderOpenAISetup()}
        {currentStep === 'gemini' && renderGeminiSetup()}
        {currentStep === 'review' && renderReview()}
      </ScrollView>
    </SafeAreaView>
  );
}

// Feature Item Component
const FeatureItem = ({ icon, text, apiRequired = false }: { icon: string; text: string; apiRequired?: boolean }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={[styles.featureText, apiRequired && styles.featureTextPremium]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6B7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  featureSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  featureSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  featureTextPremium: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    marginBottom: 4,
    lineHeight: 20,
  },
  apiKeyInputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    paddingRight: 50,
    fontSize: 14,
    color: '#1F2937',
  },
  inputValidated: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  validatedBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  validatedText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  testButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  helpNote: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 8,
  },
  linkButton: {
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipStepButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  skipStepText: {
    color: '#6B7280',
    fontSize: 14,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusRight: {
    alignItems: 'flex-end',
  },
  statusBadgeGreen: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusBadgeRed: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  removeText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  securityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  securityText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
});
