// Voice Recording Button - Interactive microphone button with waveform visualization
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioRecordingService, RecordingMetering } from '../services/audioRecordingService';

interface VoiceRecordingButtonProps {
  onRecordingComplete: (uri: string, durationMs: number) => void;
  onRecordingStart?: () => void;
  onRecordingCancel?: () => void;
  maxDurationMs?: number;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const VoiceRecordingButton: React.FC<VoiceRecordingButtonProps> = ({
  onRecordingComplete,
  onRecordingStart,
  onRecordingCancel,
  maxDurationMs = 120000, // 2 minutes default
  disabled = false,
  size = 'large',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [metering, setMetering] = useState<RecordingMetering | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        audioRecordingService.cancelRecording();
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [isRecording]);

  // Pulse animation when recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const checkPermissions = async () => {
    const granted = await audioRecordingService.hasPermissions();
    setHasPermission(granted);
  };

  const startRecording = async () => {
    try {
      // Request permission if needed
      if (!hasPermission) {
        const granted = await audioRecordingService.requestPermissions();
        setHasPermission(granted);
        if (!granted) {
          alert('Microphone permission is required to record voice.');
          return;
        }
      }

      onRecordingStart?.();
      setIsRecording(true);
      setDuration(0);

      // Start recording with metering
      await audioRecordingService.startRecording(
        { quality: 'high', maxDurationMs },
        (meteringData) => {
          setMetering(meteringData);
        }
      );

      // Start duration counter
      durationInterval.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 100;
          if (newDuration >= maxDurationMs) {
            stopRecording();
            return prev;
          }
          return newDuration;
        });
      }, 100);

      // Animate button press
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      alert('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      const result = await audioRecordingService.stopRecording();
      setIsRecording(false);
      setMetering(null);

      if (result) {
        onRecordingComplete(result.uri, result.durationMs);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      alert('Failed to save recording. Please try again.');
    }
  };

  const cancelRecording = async () => {
    try {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      await audioRecordingService.cancelRecording();
      setIsRecording(false);
      setMetering(null);
      setDuration(0);
      onRecordingCancel?.();
    } catch (error) {
      console.error('Error cancelling recording:', error);
    }
  };

  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 50;
      case 'medium':
        return 64;
      case 'large':
      default:
        return 72;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 32;
      case 'large':
      default:
        return 36;
    }
  };

  const buttonSize = getButtonSize();
  const iconSize = getIconSize();

  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={styles.recordingInfo}>
          <Text style={styles.durationText}>{formatDuration(duration)}</Text>
          <View style={styles.waveformContainer}>
            {/* Simple visual feedback based on metering */}
            <View
              style={[
                styles.waveformBar,
                {
                  height: metering
                    ? Math.max(4, Math.min(40, (metering.averagePower + 160) / 2))
                    : 4,
                },
              ]}
            />
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {isRecording && (
          <TouchableOpacity
            onPress={cancelRecording}
            style={[styles.secondaryButton, { marginRight: 12 }]}
          >
            <Ionicons name="close" size={24} color="#EF4444" />
          </TouchableOpacity>
        )}

        <Animated.View
          style={{
            transform: [{ scale: isRecording ? pulseAnim : scaleAnim }],
          }}
        >
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            style={[
              styles.micButton,
              {
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
              },
              isRecording && styles.recording,
              disabled && styles.disabled,
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={iconSize}
              color="white"
            />
          </TouchableOpacity>
        </Animated.View>

        {isRecording && (
          <TouchableOpacity
            onPress={stopRecording}
            style={[styles.secondaryButton, { marginLeft: 12 }]}
          >
            <Ionicons name="checkmark" size={24} color="#10B981" />
          </TouchableOpacity>
        )}
      </View>

      {!isRecording && (
        <Text style={styles.hint}>
          {hasPermission === false
            ? 'Microphone permission required'
            : 'Tap to start recording'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  durationText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  waveformBar: {
    width: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    marginHorizontal: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  micButton: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  recording: {
    backgroundColor: '#EF4444',
  },
  disabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  hint: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
