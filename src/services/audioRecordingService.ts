// Audio Recording Service - Handles voice recording for interview practice
//
// Built on expo-audio (expo-av is deprecated and slated for removal from the
// SDK). The public surface is unchanged from the expo-av version, so
// AIInterviewScreen / VoiceRecordingButton consume it exactly as before.
import {
  AudioModule,
  AudioQuality,
  IOSOutputFormat,
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioRecorder,
  type RecordingOptions as ExpoRecordingOptions,
} from 'expo-audio';
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

const METERING_INTERVAL_MS = 100;

class AudioRecordingService {
  private recorder: AudioRecorder | null = null;
  private isRecording = false;
  private meteringTimer: ReturnType<typeof setInterval> | null = null;

  // Request microphone permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        console.warn('Microphone permission denied');
      }
      return granted;
    } catch (error) {
      console.error('Error requesting microphone permissions:', error);
      return false;
    }
  }

  // Check if we have recording permissions
  async hasPermissions(): Promise<boolean> {
    try {
      const { granted } = await AudioModule.getRecordingPermissionsAsync();
      return granted;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  // Configure audio mode for recording
  private async configureAudioMode(): Promise<void> {
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
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
      if (this.recorder) {
        await this.stopRecording();
      }

      // Configure audio mode
      await this.configureAudioMode();

      // Create and start a new recorder
      const recordingOptions = this.getRecordingOptions(options.quality || 'high');
      this.recorder = new AudioModule.AudioRecorder(recordingOptions);
      await this.recorder.prepareToRecordAsync();
      this.recorder.record();
      this.isRecording = true;

      // expo-audio has no status-update callback on the imperative recorder —
      // poll getStatus() to keep the expo-av-style metering behavior.
      if (onMetering) {
        this.meteringTimer = setInterval(() => {
          try {
            const status = this.recorder?.getStatus();
            if (status?.isRecording && typeof status.metering === 'number') {
              onMetering({ averagePower: status.metering, peakPower: status.metering });
            }
          } catch {
            // recorder released mid-tick — the timer is about to be cleared
          }
        }, METERING_INTERVAL_MS);
      }

      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      this.clearMeteringTimer();
      throw error;
    }
  }

  // Stop recording and return file URI
  async stopRecording(): Promise<RecordingResult | null> {
    try {
      if (!this.recorder) {
        console.warn('No recording in progress');
        return null;
      }

      this.isRecording = false;
      this.clearMeteringTimer();

      // Capture duration before stop — the recorder resets its status after.
      const durationMs = this.recorder.getStatus()?.durationMillis || 0;
      await this.recorder.stop();
      const uri = this.recorder.uri;

      this.releaseRecorder();

      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      return {
        uri,
        durationMs,
        size: 0, // file size is not part of the recorder status
      };
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.releaseRecorder();
      throw error;
    }
  }

  // Cancel recording without saving
  async cancelRecording(): Promise<void> {
    try {
      if (this.recorder) {
        this.isRecording = false;
        this.clearMeteringTimer();
        await this.recorder.stop();
        this.releaseRecorder();
        console.log('Recording cancelled');
      }
    } catch (error) {
      console.error('Error cancelling recording:', error);
      this.releaseRecorder();
    }
  }

  // Get current recording status
  getStatus(): { isRecording: boolean } {
    return { isRecording: this.isRecording };
  }

  private clearMeteringTimer(): void {
    if (this.meteringTimer) {
      clearInterval(this.meteringTimer);
      this.meteringTimer = null;
    }
  }

  private releaseRecorder(): void {
    try {
      this.recorder?.release();
    } catch {
      // already released
    }
    this.recorder = null;
    this.isRecording = false;
  }

  // Get recording options based on quality
  private getRecordingOptions(quality: 'low' | 'medium' | 'high'): ExpoRecordingOptions {
    const base = {
      extension: '.m4a',
      isMeteringEnabled: true,
      android: {
        outputFormat: 'mpeg4' as const,
        audioEncoder: 'aac' as const,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    };

    switch (quality) {
      case 'low':
        return {
          ...base,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 64000,
          ios: {
            outputFormat: IOSOutputFormat.MPEG4AAC,
            audioQuality: AudioQuality.MIN,
          },
        };
      case 'medium':
        return {
          ...base,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 96000,
          ios: {
            outputFormat: IOSOutputFormat.MPEG4AAC,
            audioQuality: AudioQuality.MEDIUM,
          },
        };
      case 'high':
      default:
        return {
          ...base,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          ios: {
            outputFormat: IOSOutputFormat.MPEG4AAC,
            audioQuality: AudioQuality.HIGH,
          },
        };
    }
  }

  // Play recorded audio for verification. Caller should .remove() the player
  // when finished to free the native resource.
  async playRecording(uri: string): Promise<AudioPlayer> {
    try {
      const player = createAudioPlayer({ uri });
      player.play();
      return player;
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
