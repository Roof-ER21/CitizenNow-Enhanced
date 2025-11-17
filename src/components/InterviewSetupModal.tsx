// Interview Setup Modal - Pre-interview configuration
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InterviewPreferences, VoiceProfile } from '../types';

interface InterviewSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (preferences: InterviewPreferences) => void;
  defaultPreferences?: Partial<InterviewPreferences>;
}

export const InterviewSetupModal: React.FC<InterviewSetupModalProps> = ({
  visible,
  onClose,
  onStart,
  defaultPreferences = {},
}) => {
  const [voiceEnabled, setVoiceEnabled] = useState(
    defaultPreferences.voiceEnabled ?? true
  );
  const [coachingMode, setCoachingMode] = useState<'realtime' | 'minimal'>(
    defaultPreferences.coachingMode ?? 'minimal'
  );
  const [officerVoice, setOfficerVoice] = useState<VoiceProfile>(
    defaultPreferences.officerVoice ?? {
      gender: 'female',
      rate: 'normal',
      profileName: 'professional_female',
    }
  );

  const handleStart = () => {
    const preferences: InterviewPreferences = {
      voiceEnabled,
      coachingMode,
      officerVoice,
      autoSpeakQuestions: voiceEnabled,
      preferVoiceInput: voiceEnabled,
    };
    onStart(preferences);
  };

  const voiceProfiles: { name: string; profile: VoiceProfile }[] = [
    {
      name: 'Professional Female',
      profile: { gender: 'female', rate: 'normal', profileName: 'professional_female' },
    },
    {
      name: 'Professional Male',
      profile: { gender: 'male', rate: 'normal', profileName: 'professional_male' },
    },
    {
      name: 'Friendly Female',
      profile: { gender: 'female', rate: 'normal', profileName: 'friendly_female' },
    },
    {
      name: 'Friendly Male',
      profile: { gender: 'male', rate: 'normal', profileName: 'friendly_male' },
    },
    {
      name: 'Senior Female (Slower)',
      profile: { gender: 'female', rate: 'slow', profileName: 'senior_female' },
    },
    {
      name: 'Senior Male (Slower)',
      profile: { gender: 'male', rate: 'slow', profileName: 'senior_male' },
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Interview Setup</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Voice Mode Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="mic" size={24} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Voice Mode</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Enable voice interaction for a more realistic interview experience.
                The officer will speak questions, and you can respond by voice.
              </Text>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Enable Voice Interview</Text>
                <Switch
                  value={voiceEnabled}
                  onValueChange={setVoiceEnabled}
                  trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                  thumbColor={voiceEnabled ? '#3B82F6' : '#F3F4F6'}
                />
              </View>
            </View>

            {/* Officer Voice Selection */}
            {voiceEnabled && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person" size={24} color="#8B5CF6" />
                  <Text style={styles.sectionTitle}>Officer Voice</Text>
                </View>
                <Text style={styles.sectionDescription}>
                  Select the USCIS officer's voice profile.
                </Text>
                {voiceProfiles.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setOfficerVoice(item.profile)}
                    style={[
                      styles.optionButton,
                      officerVoice.profileName === item.profile.profileName &&
                        styles.selectedOption,
                    ]}
                  >
                    <View style={styles.optionContent}>
                      <Ionicons
                        name={
                          item.profile.gender === 'female' ? 'woman' : 'man'
                        }
                        size={20}
                        color={
                          officerVoice.profileName === item.profile.profileName
                            ? '#3B82F6'
                            : '#6B7280'
                        }
                      />
                      <Text
                        style={[
                          styles.optionText,
                          officerVoice.profileName === item.profile.profileName &&
                            styles.selectedOptionText,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </View>
                    {officerVoice.profileName === item.profile.profileName && (
                      <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Coaching Mode Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="school" size={24} color="#10B981" />
                <Text style={styles.sectionTitle}>Coaching Style</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Choose how you want to receive feedback during the interview.
              </Text>

              <TouchableOpacity
                onPress={() => setCoachingMode('realtime')}
                style={[
                  styles.optionButton,
                  coachingMode === 'realtime' && styles.selectedOption,
                ]}
              >
                <View style={styles.optionContent}>
                  <Ionicons
                    name="analytics"
                    size={20}
                    color={coachingMode === 'realtime' ? '#10B981' : '#6B7280'}
                  />
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionText,
                        coachingMode === 'realtime' && styles.selectedOptionText,
                      ]}
                    >
                      Real-time Coaching
                    </Text>
                    <Text style={styles.optionSubtext}>
                      Gentle hints and tips during the interview
                    </Text>
                  </View>
                </View>
                {coachingMode === 'realtime' && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCoachingMode('minimal')}
                style={[
                  styles.optionButton,
                  coachingMode === 'minimal' && styles.selectedOption,
                ]}
              >
                <View style={styles.optionContent}>
                  <Ionicons
                    name="document-text"
                    size={20}
                    color={coachingMode === 'minimal' ? '#10B981' : '#6B7280'}
                  />
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionText,
                        coachingMode === 'minimal' && styles.selectedOptionText,
                      ]}
                    >
                      Minimal (Save for End)
                    </Text>
                    <Text style={styles.optionSubtext}>
                      No interruptions - comprehensive feedback after
                    </Text>
                  </View>
                </View>
                {coachingMode === 'minimal' && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            </View>

            {/* Summary */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Your Setup:</Text>
              <Text style={styles.summaryText}>
                Voice Mode: {voiceEnabled ? 'Enabled' : 'Disabled'}
              </Text>
              {voiceEnabled && (
                <Text style={styles.summaryText}>
                  Officer Voice:{' '}
                  {voiceProfiles.find((v) => v.profile.profileName === officerVoice.profileName)?.name}
                </Text>
              )}
              <Text style={styles.summaryText}>
                Coaching:{' '}
                {coachingMode === 'realtime'
                  ? 'Real-time hints'
                  : 'Comprehensive at end'}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleStart} style={styles.startButton}>
              <Ionicons name="play" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.startButtonText}>Start Interview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedOptionText: {
    color: '#1F2937',
  },
  optionSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  summaryBox: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  startButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
