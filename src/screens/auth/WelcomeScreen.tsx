// Welcome Screen - First-time user setup with name and PIN
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { pinAuthService } from '../../services/pinAuthService';

export default function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'name' | 'pin' | 'confirm'>('name');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNameNext = () => {
    const validation = pinAuthService.validateNameFormat(name);
    if (!validation.valid) {
      Alert.alert('Invalid Name', validation.message);
      return;
    }
    setStep('pin');
  };

  const handlePinNext = () => {
    const validation = pinAuthService.validatePinFormat(pin);
    if (!validation.valid) {
      Alert.alert('Invalid PIN', validation.message);
      return;
    }
    setStep('confirm');
  };

  const handleComplete = async () => {
    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');
      setConfirmPin('');
      return;
    }

    setLoading(true);
    try {
      await pinAuthService.createAccount(name.trim(), pin);
      Alert.alert(
        'Welcome!',
        `Great to meet you, ${name}! Your account has been created. Remember your PIN to access the app.`,
        [{ text: 'Get Started', onPress: onComplete }]
      );
    } catch (error: any) {
      console.error('Account creation error:', error);
      Alert.alert('Error', error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderNameStep = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.title}>Welcome to CitizenNow!</Text>
        <Text style={styles.subtitle}>
          Your journey to U.S. citizenship starts here
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>What's your name?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          textContentType="name"
          autoComplete="name"
          maxLength={50}
        />
        <Text style={styles.hint}>This will be used to personalize your experience</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, !name.trim() && styles.buttonDisabled]}
        onPress={handleNameNext}
        disabled={!name.trim()}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </>
  );

  const renderPinStep = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.title}>Create Your PIN</Text>
        <Text style={styles.subtitle}>
          Choose a 4-6 digit PIN to protect your account
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>Choose a PIN</Text>
        <TextInput
          style={[styles.input, styles.pinInput]}
          placeholder="••••"
          placeholderTextColor="#94a3b8"
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
        />
        <Text style={styles.hint}>Use 4-6 numbers that you'll remember</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => setStep('name')}
        >
          <Text style={styles.buttonSecondaryText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, pin.length < 4 && styles.buttonDisabled]}
          onPress={handlePinNext}
          disabled={pin.length < 4}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderConfirmStep = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.emoji}>✅</Text>
        <Text style={styles.title}>Confirm Your PIN</Text>
        <Text style={styles.subtitle}>
          Re-enter your PIN to make sure it's correct
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>Enter PIN again</Text>
        <TextInput
          style={[styles.input, styles.pinInput]}
          placeholder="••••"
          placeholderTextColor="#94a3b8"
          value={confirmPin}
          onChangeText={setConfirmPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
        />
        {confirmPin.length > 0 && confirmPin !== pin && (
          <Text style={styles.errorText}>PINs do not match</Text>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => {
            setStep('pin');
            setConfirmPin('');
          }}
          disabled={loading}
        >
          <Text style={styles.buttonSecondaryText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonPrimary,
            (confirmPin.length < 4 || confirmPin !== pin || loading) && styles.buttonDisabled,
          ]}
          onPress={handleComplete}
          disabled={confirmPin.length < 4 || confirmPin !== pin || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 <Text style={styles.footerBold}>Tip:</Text> Save your PIN somewhere safe. You'll need
          it to access your account!
        </Text>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'name' && renderNameStep()}
        {step === 'pin' && renderPinStep()}
        {step === 'confirm' && renderConfirmStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    marginBottom: 32,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  input: {
    height: 56,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 8,
  },
  pinInput: {
    fontSize: 32,
    letterSpacing: 8,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
    fontWeight: '500',
  },
  button: {
    height: 56,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    flex: 1,
    marginLeft: 8,
  },
  buttonSecondary: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dbeafe',
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  footerBold: {
    fontWeight: '600',
    color: '#1e293b',
  },
});
