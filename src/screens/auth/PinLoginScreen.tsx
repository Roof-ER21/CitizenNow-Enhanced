// PIN Login Screen - Returning user authentication
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { pinAuthService, UserData } from '../../services/pinAuthService';

export default function PinLoginScreen({ onSuccess }: { onSuccess: (user: UserData) => void }) {
  const [pin, setPin] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const shakeAnimation = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await pinAuthService.getUserData();
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePinSubmit = async () => {
    if (pin.length < 4) {
      return;
    }

    try {
      const user = await pinAuthService.verifyPin(pin);

      if (user) {
        // Success!
        onSuccess(user);
      } else {
        // Incorrect PIN
        shake();
        setPin('');
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 3) {
          Alert.alert(
            'Too Many Attempts',
            'You have entered an incorrect PIN 3 times. Please try again later or reset your account.',
            [
              { text: 'Try Again', onPress: () => setAttempts(0) },
              {
                text: 'Reset Account',
                style: 'destructive',
                onPress: handleResetAccount,
              },
            ]
          );
        } else {
          Alert.alert(
            'Incorrect PIN',
            `Please try again. ${3 - newAttempts} attempt${3 - newAttempts !== 1 ? 's' : ''} remaining.`
          );
        }
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      Alert.alert('Error', 'Failed to verify PIN. Please try again.');
      setPin('');
    }
  };

  const handleResetAccount = () => {
    Alert.alert(
      'Reset Account?',
      'This will delete all your data and progress. Are you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await pinAuthService.deleteAccount();
              Alert.alert('Account Reset', 'Your account has been reset. Please create a new account.');
              // Parent component will detect no account and show welcome screen
            } catch (error) {
              console.error('Error resetting account:', error);
              Alert.alert('Error', 'Failed to reset account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleNumberPress = (num: string) => {
    if (pin.length < 6) {
      setPin(pin + num);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  useEffect(() => {
    // Auto-submit when PIN length reaches 4-6 digits
    if (pin.length >= 4 && pin.length <= 6) {
      // Small delay to show the last digit
      const timer = setTimeout(handlePinSubmit, 300);
      return () => clearTimeout(timer);
    }
  }, [pin]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{userData?.name || 'User'}!</Text>
      </View>

      {/* PIN Display */}
      <Animated.View
        style={[styles.pinDisplay, { transform: [{ translateX: shakeAnimation }] }]}
      >
        <Text style={styles.pinLabel}>Enter your PIN</Text>
        <View style={styles.pinDots}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index < pin.length && styles.dotFilled,
                index >= 4 && styles.dotOptional,
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* Number Pad */}
      <View style={styles.numPad}>
        <View style={styles.numRow}>
          <TouchableOpacity style={styles.numButton} onPress={() => handleNumberPress('1')}>
            <Text style={styles.numText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numButton} onPress={() => handleNumberPress('2')}>
            <Text style={styles.numText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numButton} onPress={() => handleNumberPress('3')}>
            <Text style={styles.numText}>3</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.numRow}>
          <TouchableOpacity style={styles.numButton} onPress={() => handleNumberPress('4')}>
            <Text style={styles.numText}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numButton} onPress={() => handleNumberPress('5')}>
            <Text style={styles.numText}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numButton} onPress={() => handleNumberPress('6')}>
            <Text style={styles.numText}>6</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.numRow}>
          <TouchableOpacity style={styles.numButton} onPress={() => handleNumberPress('7')}>
            <Text style={styles.numText}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numButton} onPress={() => handleNumberPress('8')}>
            <Text style={styles.numText}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numButton} onPress={() => handleNumberPress('9')}>
            <Text style={styles.numText}>9</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.numRow}>
          <View style={styles.numButton} />
          <TouchableOpacity style={styles.numButton} onPress={() => handleNumberPress('0')}>
            <Text style={styles.numText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numButton} onPress={handleBackspace}>
            <Text style={styles.backspaceText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Forgot PIN */}
      <TouchableOpacity style={styles.forgotButton} onPress={handleResetAccount}>
        <Text style={styles.forgotText}>Forgot PIN? Reset Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 20,
    color: '#64748b',
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
  },
  pinDisplay: {
    alignItems: 'center',
    marginBottom: 60,
  },
  pinLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    fontWeight: '500',
  },
  pinDots: {
    flexDirection: 'row',
    gap: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
  },
  dotOptional: {
    opacity: 0.4,
  },
  dotFilled: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  numPad: {
    gap: 16,
  },
  numRow: {
    flexDirection: 'row',
    gap: 16,
  },
  numButton: {
    flex: 1,
    aspectRatio: 1.2,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  numText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1e293b',
  },
  backspaceText: {
    fontSize: 28,
    color: '#64748b',
  },
  forgotButton: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 16,
  },
  forgotText: {
    fontSize: 14,
    color: '#64748b',
    textDecorationLine: 'underline',
  },
});
