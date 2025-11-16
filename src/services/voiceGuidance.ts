/**
 * Voice Guidance System - CitizenNow Enhanced
 *
 * Text-to-speech functionality for USCIS officer responses,
 * providing realistic audio simulation of the interview experience.
 */

import * as Speech from 'expo-speech';

export type VoiceGender = 'male' | 'female';
export type VoiceAccent = 'neutral' | 'southern' | 'northeastern' | 'midwestern' | 'western';
export type SpeakingRate = 'slow' | 'normal' | 'fast';

export interface VoiceSettings {
  enabled: boolean;
  gender: VoiceGender;
  accent: VoiceAccent;
  rate: SpeakingRate;
  pitch: number; // 0.5 to 2.0
  volume: number; // 0 to 1
  autoPlay: boolean; // Automatically speak officer responses
}

export interface VoiceProfile {
  id: string;
  name: string;
  gender: VoiceGender;
  description: string;
  language: string;
  voiceURI?: string; // Platform-specific voice identifier
}

// Default voice settings
const DEFAULT_SETTINGS: VoiceSettings = {
  enabled: true,
  gender: 'female',
  accent: 'neutral',
  rate: 'normal',
  pitch: 1.0,
  volume: 1.0,
  autoPlay: true,
};

// Speaking rate mappings
const RATE_MULTIPLIERS: Record<SpeakingRate, number> = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.25,
};

/**
 * Voice Guidance Service
 */
export class VoiceGuidanceService {
  private settings: VoiceSettings;
  private isSpeaking: boolean = false;
  private currentUtterance: string | null = null;

  constructor(settings?: Partial<VoiceSettings>) {
    this.settings = { ...DEFAULT_SETTINGS, ...settings };
  }

  /**
   * Speak text using text-to-speech
   */
  async speak(text: string, options?: { interrupt?: boolean }): Promise<void> {
    if (!this.settings.enabled) {
      return;
    }

    // Remove demo prefix if present
    const cleanText = text.replace(/^\[DEMO\]\s*/, '');

    // Stop current speech if interrupting
    if (options?.interrupt && this.isSpeaking) {
      await this.stop();
    }

    // Wait if already speaking and not interrupting
    if (this.isSpeaking && !options?.interrupt) {
      return;
    }

    try {
      this.isSpeaking = true;
      this.currentUtterance = cleanText;

      // Configure speech options
      const speechOptions: Speech.SpeechOptions = {
        language: 'en-US',
        pitch: this.settings.pitch,
        rate: this.getSpeakingRate(),
        volume: this.settings.volume,
        onDone: () => {
          this.isSpeaking = false;
          this.currentUtterance = null;
        },
        onStopped: () => {
          this.isSpeaking = false;
          this.currentUtterance = null;
        },
        onError: (error) => {
          console.error('Speech error:', error);
          this.isSpeaking = false;
          this.currentUtterance = null;
        },
      };

      // Add voice selection if available
      const voice = await this.getPreferredVoice();
      if (voice) {
        speechOptions.voice = voice.voiceURI;
      }

      await Speech.speak(cleanText, speechOptions);
    } catch (error) {
      console.error('Error in speech synthesis:', error);
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  /**
   * Stop current speech
   */
  async stop(): Promise<void> {
    if (this.isSpeaking) {
      await Speech.stop();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  /**
   * Pause current speech
   */
  async pause(): Promise<void> {
    if (this.isSpeaking) {
      await Speech.pause();
    }
  }

  /**
   * Resume paused speech
   */
  async resume(): Promise<void> {
    if (this.currentUtterance && !this.isSpeaking) {
      await Speech.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Update voice settings
   */
  updateSettings(settings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current settings
   */
  getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  /**
   * Get speaking rate based on settings
   */
  private getSpeakingRate(): number {
    return RATE_MULTIPLIERS[this.settings.rate];
  }

  /**
   * Get preferred voice based on settings
   */
  private async getPreferredVoice(): Promise<VoiceProfile | null> {
    try {
      const availableVoices = await Speech.getAvailableVoicesAsync();

      // Filter for US English voices
      const enUSVoices = availableVoices.filter(
        voice => voice.language === 'en-US' || voice.language === 'en_US'
      );

      if (enUSVoices.length === 0) {
        return null;
      }

      // Try to find voice matching gender preference
      const genderMatch = enUSVoices.find(voice => {
        const voiceName = voice.name?.toLowerCase() || '';
        const identifier = voice.identifier?.toLowerCase() || '';

        if (this.settings.gender === 'female') {
          return (
            voiceName.includes('female') ||
            voiceName.includes('woman') ||
            identifier.includes('female') ||
            // Common female voice names
            voiceName.includes('samantha') ||
            voiceName.includes('victoria') ||
            voiceName.includes('allison') ||
            voiceName.includes('ava') ||
            voiceName.includes('susan')
          );
        } else {
          return (
            voiceName.includes('male') ||
            voiceName.includes('man') ||
            identifier.includes('male') ||
            // Common male voice names
            voiceName.includes('alex') ||
            voiceName.includes('tom') ||
            voiceName.includes('daniel') ||
            voiceName.includes('fred')
          );
        }
      });

      // Return gender match if found, otherwise first available
      const selectedVoice = genderMatch || enUSVoices[0];

      return {
        id: selectedVoice.identifier,
        name: selectedVoice.name,
        gender: this.settings.gender,
        description: `${selectedVoice.name} (${selectedVoice.language})`,
        language: selectedVoice.language,
        voiceURI: selectedVoice.identifier,
      };
    } catch (error) {
      console.error('Error getting voices:', error);
      return null;
    }
  }

  /**
   * Get all available voices
   */
  async getAvailableVoices(): Promise<VoiceProfile[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();

      return voices
        .filter(voice => voice.language === 'en-US' || voice.language === 'en_US')
        .map(voice => {
          const name = voice.name?.toLowerCase() || '';
          const identifier = voice.identifier?.toLowerCase() || '';

          // Attempt to determine gender
          let gender: VoiceGender = 'female';
          if (
            name.includes('male') ||
            name.includes('alex') ||
            name.includes('tom') ||
            identifier.includes('male')
          ) {
            gender = 'male';
          }

          return {
            id: voice.identifier,
            name: voice.name,
            gender,
            description: `${voice.name} (${voice.language})`,
            language: voice.language,
            voiceURI: voice.identifier,
          };
        });
    } catch (error) {
      console.error('Error listing voices:', error);
      return [];
    }
  }

  /**
   * Test voice with sample text
   */
  async testVoice(sampleText: string = 'Hello, welcome to your naturalization interview.'): Promise<void> {
    await this.speak(sampleText, { interrupt: true });
  }

  /**
   * Speak interview question with appropriate pacing
   */
  async speakQuestion(question: string): Promise<void> {
    // Questions should be spoken clearly with slight pause at end
    const questionWithPause = `${question}... `;
    await this.speak(questionWithPause);
  }

  /**
   * Speak encouragement
   */
  async speakEncouragement(message: string): Promise<void> {
    // Encouragement should be warm and supportive
    await this.speak(message);
  }

  /**
   * Speak feedback
   */
  async speakFeedback(feedback: string): Promise<void> {
    await this.speak(feedback);
  }

  /**
   * Check if speech is available on device
   */
  async isSpeechAvailable(): Promise<boolean> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.length > 0;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Singleton instance
 */
let voiceGuidanceInstance: VoiceGuidanceService | null = null;

/**
 * Get voice guidance service instance
 */
export function getVoiceGuidanceService(settings?: Partial<VoiceSettings>): VoiceGuidanceService {
  if (!voiceGuidanceInstance) {
    voiceGuidanceInstance = new VoiceGuidanceService(settings);
  } else if (settings) {
    voiceGuidanceInstance.updateSettings(settings);
  }
  return voiceGuidanceInstance;
}

/**
 * Reset voice guidance service (for testing)
 */
export function resetVoiceGuidanceService(): void {
  if (voiceGuidanceInstance) {
    voiceGuidanceInstance.stop();
    voiceGuidanceInstance = null;
  }
}

/**
 * Pre-configured voice profiles for different officer personalities
 */
export const OFFICER_VOICE_PROFILES = {
  professional_female: {
    gender: 'female' as VoiceGender,
    rate: 'normal' as SpeakingRate,
    pitch: 1.0,
    description: 'Professional female USCIS officer',
  },
  professional_male: {
    gender: 'male' as VoiceGender,
    rate: 'normal' as SpeakingRate,
    pitch: 1.0,
    description: 'Professional male USCIS officer',
  },
  friendly_female: {
    gender: 'female' as VoiceGender,
    rate: 'normal' as SpeakingRate,
    pitch: 1.1,
    description: 'Friendly female USCIS officer',
  },
  friendly_male: {
    gender: 'male' as VoiceGender,
    rate: 'normal' as SpeakingRate,
    pitch: 1.0,
    description: 'Friendly male USCIS officer',
  },
  senior_female: {
    gender: 'female' as VoiceGender,
    rate: 'slow' as SpeakingRate,
    pitch: 0.95,
    description: 'Senior female USCIS officer (speaks slower)',
  },
  senior_male: {
    gender: 'male' as VoiceGender,
    rate: 'slow' as SpeakingRate,
    pitch: 0.9,
    description: 'Senior male USCIS officer (speaks slower)',
  },
} as const;

/**
 * Get voice profile by key
 */
export function getOfficerVoiceProfile(
  profile: keyof typeof OFFICER_VOICE_PROFILES
): Partial<VoiceSettings> {
  return OFFICER_VOICE_PROFILES[profile];
}
