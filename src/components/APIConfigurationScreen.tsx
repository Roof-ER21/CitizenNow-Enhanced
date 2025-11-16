/**
 * API Configuration Screen Component
 *
 * Provides UI for users to configure and validate their API keys.
 * Shows real-time validation status and helpful setup guidance.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { apiKeyService, APIKeyStatus } from '../services/apiKeyService';

export default function APIConfigurationScreen() {
  // State
  const [openAIKey, setOpenAIKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [isValidatingOpenAI, setIsValidatingOpenAI] = useState(false);
  const [isValidatingGemini, setIsValidatingGemini] = useState(false);
  const [openAIStatus, setOpenAIStatus] = useState<APIKeyStatus | null>(null);
  const [geminiStatus, setGeminiStatus] = useState<APIKeyStatus | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Load initial status on mount
  useEffect(() => {
    loadAPIStatus();
  }, []);

  // Load current API key status
  const loadAPIStatus = async () => {
    try {
      const status = await apiKeyService.getSystemStatus();
      setOpenAIStatus(status.apiStatuses.openai as APIKeyStatus);
      setGeminiStatus(status.apiStatuses.gemini as APIKeyStatus);

      const demoMode = await apiKeyService.isDemoModeEnabled();
      setIsDemoMode(demoMode);

      // Load existing keys (masked)
      const existingOpenAI = await apiKeyService.getOpenAIKey();
      const existingGemini = await apiKeyService.getGeminiKey();

      if (existingOpenAI) {
        setOpenAIKey(maskAPIKey(existingOpenAI));
      }
      if (existingGemini) {
        setGeminiKey(maskAPIKey(existingGemini));
      }
    } catch (error) {
      console.error('Error loading API status:', error);
    }
  };

  // Mask API key for display
  const maskAPIKey = (key: string): string => {
    if (key.length <= 10) return key;
    return key.slice(0, 10) + '...' + key.slice(-4);
  };

  // Validate and save OpenAI key
  const handleSaveOpenAI = async () => {
    if (!openAIKey || openAIKey.includes('...')) {
      Alert.alert('Error', 'Please enter a valid OpenAI API key');
      return;
    }

    setIsValidatingOpenAI(true);

    try {
      // Validate the key
      const validation = await apiKeyService.validateAPIKey('openai', openAIKey);

      if (!validation.isValid) {
        const errorMessage = apiKeyService.getAPIErrorMessage('openai', validation.error);
        Alert.alert('Validation Failed', errorMessage);
        setOpenAIStatus({
          provider: 'openai',
          isConfigured: true,
          isValid: false,
          isDemo: true,
          error: validation.error,
        });
      } else {
        // Save the key
        await apiKeyService.saveOpenAIKey(openAIKey);
        Alert.alert('Success', 'OpenAI API key saved and validated successfully!');

        setOpenAIStatus({
          provider: 'openai',
          isConfigured: true,
          isValid: true,
          isDemo: false,
          lastValidated: new Date(),
        });

        // Mask the key after saving
        setOpenAIKey(maskAPIKey(openAIKey));
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save API key');
    } finally {
      setIsValidatingOpenAI(false);
    }
  };

  // Validate and save Gemini key
  const handleSaveGemini = async () => {
    if (!geminiKey || geminiKey.includes('...')) {
      Alert.alert('Error', 'Please enter a valid Gemini API key');
      return;
    }

    setIsValidatingGemini(true);

    try {
      // Validate the key
      const validation = await apiKeyService.validateAPIKey('gemini', geminiKey);

      if (!validation.isValid) {
        const errorMessage = apiKeyService.getAPIErrorMessage('gemini', validation.error);
        Alert.alert('Validation Failed', errorMessage);
        setGeminiStatus({
          provider: 'gemini',
          isConfigured: true,
          isValid: false,
          isDemo: true,
          error: validation.error,
        });
      } else {
        // Save the key
        await apiKeyService.saveGeminiKey(geminiKey);
        Alert.alert('Success', 'Gemini API key saved and validated successfully!');

        setGeminiStatus({
          provider: 'gemini',
          isConfigured: true,
          isValid: true,
          isDemo: false,
          lastValidated: new Date(),
        });

        // Mask the key after saving
        setGeminiKey(maskAPIKey(geminiKey));
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save API key');
    } finally {
      setIsValidatingGemini(false);
    }
  };

  // Remove OpenAI key
  const handleRemoveOpenAI = async () => {
    Alert.alert('Confirm Removal', 'Are you sure you want to remove the OpenAI API key?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await apiKeyService.removeOpenAIKey();
          setOpenAIKey('');
          setOpenAIStatus({
            provider: 'openai',
            isConfigured: false,
            isValid: false,
            isDemo: true,
          });
          Alert.alert('Removed', 'OpenAI API key has been removed');
        },
      },
    ]);
  };

  // Remove Gemini key
  const handleRemoveGemini = async () => {
    Alert.alert('Confirm Removal', 'Are you sure you want to remove the Gemini API key?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await apiKeyService.removeGeminiKey();
          setGeminiKey('');
          setGeminiStatus({
            provider: 'gemini',
            isConfigured: false,
            isValid: false,
            isDemo: true,
          });
          Alert.alert('Removed', 'Gemini API key has been removed');
        },
      },
    ]);
  };

  // Toggle demo mode
  const handleToggleDemoMode = async (value: boolean) => {
    await apiKeyService.setDemoMode(value);
    setIsDemoMode(value);

    if (value) {
      Alert.alert('Demo Mode Enabled', 'All AI features will use simulated responses.');
    } else {
      Alert.alert('Demo Mode Disabled', 'AI features will use real API calls (requires valid keys).');
    }
  };

  // Show setup wizard
  const showSetupWizard = () => {
    const steps = apiKeyService.getSetupWizardSteps();
    Alert.alert('Setup Guide', steps.join('\n\n'));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API Configuration</Text>
        <Text style={styles.subtitle}>Configure your AI service API keys</Text>
      </View>

      {/* Setup Guide Button */}
      <TouchableOpacity style={styles.guideButton} onPress={showSetupWizard}>
        <Text style={styles.guideButtonText}>View Setup Guide</Text>
      </TouchableOpacity>

      {/* Demo Mode Toggle */}
      <View style={styles.demoModeSection}>
        <View style={styles.demoModeHeader}>
          <Text style={styles.sectionTitle}>Demo Mode</Text>
          <Switch value={isDemoMode} onValueChange={handleToggleDemoMode} />
        </View>
        <Text style={styles.helperText}>
          {isDemoMode
            ? 'Using simulated AI responses. Disable to use real API calls.'
            : 'Using real API calls (requires valid keys below).'}
        </Text>
      </View>

      {/* OpenAI Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>OpenAI API Key</Text>
        <Text style={styles.helperText}>
          Required for: AI Interview, Speech Recognition, Pronunciation Analysis
        </Text>

        {/* Status Indicator */}
        {openAIStatus && (
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusText,
                openAIStatus.isValid ? styles.statusValid : styles.statusInvalid,
              ]}
            >
              {openAIStatus.isValid ? '✅ Valid' : '❌ ' + (openAIStatus.error || 'Not configured')}
            </Text>
            {openAIStatus.lastValidated && (
              <Text style={styles.statusDate}>
                Validated: {openAIStatus.lastValidated.toLocaleString()}
              </Text>
            )}
          </View>
        )}

        {/* Key Input */}
        <TextInput
          style={styles.input}
          placeholder="sk-proj-..."
          value={openAIKey}
          onChangeText={setOpenAIKey}
          secureTextEntry={!showOpenAIKey}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity onPress={() => setShowOpenAIKey(!showOpenAIKey)}>
          <Text style={styles.toggleText}>{showOpenAIKey ? 'Hide' : 'Show'} Key</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSaveOpenAI}
            disabled={isValidatingOpenAI}
          >
            {isValidatingOpenAI ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Validate & Save</Text>
            )}
          </TouchableOpacity>

          {openAIStatus?.isConfigured && (
            <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleRemoveOpenAI}>
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Get Key Link */}
        <Text style={styles.linkText}>
          Get your key: https://platform.openai.com/api-keys
        </Text>
      </View>

      {/* Gemini Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Google Gemini API Key</Text>
        <Text style={styles.helperText}>
          Required for: N-400 Assistant, Question Explanations, Study Assistance
        </Text>

        {/* Status Indicator */}
        {geminiStatus && (
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusText,
                geminiStatus.isValid ? styles.statusValid : styles.statusInvalid,
              ]}
            >
              {geminiStatus.isValid ? '✅ Valid' : '❌ ' + (geminiStatus.error || 'Not configured')}
            </Text>
            {geminiStatus.lastValidated && (
              <Text style={styles.statusDate}>
                Validated: {geminiStatus.lastValidated.toLocaleString()}
              </Text>
            )}
          </View>
        )}

        {/* Key Input */}
        <TextInput
          style={styles.input}
          placeholder="AIza..."
          value={geminiKey}
          onChangeText={setGeminiKey}
          secureTextEntry={!showGeminiKey}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity onPress={() => setShowGeminiKey(!showGeminiKey)}>
          <Text style={styles.toggleText}>{showGeminiKey ? 'Hide' : 'Show'} Key</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSaveGemini}
            disabled={isValidatingGemini}
          >
            {isValidatingGemini ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Validate & Save</Text>
            )}
          </TouchableOpacity>

          {geminiStatus?.isConfigured && (
            <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleRemoveGemini}>
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Get Key Link */}
        <Text style={styles.linkText}>
          Get your key: https://makersuite.google.com/app/apikey
        </Text>
      </View>

      {/* Information Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>About API Keys</Text>
        <Text style={styles.infoText}>
          • API keys are stored securely on your device{'\n'}
          • Keys are validated before saving{'\n'}
          • You can use demo mode to try features without keys{'\n'}
          • Keys are never sent to our servers{'\n'}
          • Both providers offer free tier access
        </Text>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  guideButton: {
    margin: 16,
    padding: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
  },
  guideButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  demoModeSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  demoModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statusContainer: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusValid: {
    color: '#4CAF50',
  },
  statusInvalid: {
    color: '#F44336',
  },
  statusDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  toggleText: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 12,
  },
  infoSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  spacer: {
    height: 40,
  },
});
