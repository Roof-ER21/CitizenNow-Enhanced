// Audio Recording Service - Handles voice recording for interview practice
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export interface RecordingOptions {
  quality?: 'low' | 'medium' | 'high';
  maxDurationMs?: number;
}

export interface RecordingResult {
  uri: string;
  durationMs: number;
  size: number;
}

export interface RecordingMetering {
  averagePower: number;
  peakPower: number;
}

class AudioRecordingService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private meteringCallback: ((metering: RecordingMetering) => void) | null = null;

  // Request microphone permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Microphone permission denied');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting microphone permissions:', error);
      return false;
    }
  }

  // Check if we have recording permissions
  async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  // Configure audio mode for recording
  private async configureAudioMode(): Promise<void> {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }

  // Start recording
  async startRecording(
    options: RecordingOptions = {},
    onMetering?: (metering: RecordingMetering) => void
  ): Promise<void> {
    try {
      // Check permissions
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Microphone permission required');
        }
      }

      // Stop any existing recording
      if (this.recording) {
        await this.stopRecording();
      }

      // Configure audio mode
      await this.configureAudioMode();

      // Set quality settings
      const recordingOptions = this.getRecordingOptions(options.quality || 'high');

      // Create new recording
      const { recording } = await Audio.Recording.createAsync(
        recordingOptions,
        onMetering
          ? (status) => {
              if (status.isRecording && status.metering !== undefined) {
                onMetering({
                  averagePower: status.metering,
                  peakPower: status.metering,
                });
              }
            }
          : undefined,
        onMetering ? 100 : undefined // Update interval in ms
      );

      this.recording = recording;
      this.isRecording = true;
      this.meteringCallback = onMetering || null;

      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  // Stop recording and return file URI
  async stopRecording(): Promise<RecordingResult | null> {
    try {
      if (!this.recording) {
        console.warn('No recording in progress');
        return null;
      }

      this.isRecording = false;
      this.meteringCallback = null;

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();

      this.recording = null;

      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      return {
        uri,
        durationMs: status.durationMillis || 0,
        size: 0, // expo-av doesn't provide file size directly
      };
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.recording = null;
      throw error;
    }
  }

  // Cancel recording without saving
  async cancelRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
        this.isRecording = false;
        this.meteringCallback = null;
        console.log('Recording cancelled');
      }
    } catch (error) {
      console.error('Error cancelling recording:', error);
      this.recording = null;
    }
  }

  // Get current recording status
  getStatus(): { isRecording: boolean } {
    return { isRecording: this.isRecording };
  }

  // Get recording options based on quality
  private getRecordingOptions(quality: 'low' | 'medium' | 'high') {
    const baseOptions = {
      isMeteringEnabled: true,
      android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
      },
      ios: {
        extension: '.m4a',
        audioQuality: Audio.IOSAudioQuality.HIGH,
        outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    };

    switch (quality) {
      case 'low':
        return {
          ...baseOptions,
          android: {
            ...baseOptions.android,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 64000,
          },
          ios: {
            ...baseOptions.ios,
            audioQuality: Audio.IOSAudioQuality.MIN,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 64000,
          },
        };
      case 'medium':
        return {
          ...baseOptions,
          android: {
            ...baseOptions.android,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 96000,
          },
          ios: {
            ...baseOptions.ios,
            audioQuality: Audio.IOSAudioQuality.MEDIUM,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 96000,
          },
        };
      case 'high':
      default:
        return {
          ...baseOptions,
          android: {
            ...baseOptions.android,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            ...baseOptions.ios,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
        };
    }
  }

  // Play recorded audio for verification
  async playRecording(uri: string): Promise<Audio.Sound> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      return sound;
    } catch (error) {
      console.error('Error playing recording:', error);
      throw error;
    }
  }

  // Convert recording to blob for upload (web/API)
  async recordingToBlob(uri: string): Promise<Blob> {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        return await response.blob();
      } else {
        // For mobile, we need to read the file
        const response = await fetch(uri);
        return await response.blob();
      }
    } catch (error) {
      console.error('Error converting recording to blob:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const audioRecordingService = new AudioRecordingService();
