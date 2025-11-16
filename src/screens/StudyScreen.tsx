import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StudyScreenProps } from '../navigation/types';
import { RootStackParamList } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function StudyScreen({ navigation }: StudyScreenProps) {
  const rootNavigation = useNavigation<RootNavigationProp>();

  const studyModes = [
    {
      title: 'Flashcards',
      icon: '💭',
      description: 'Review questions with instant feedback',
      color: '#3B82F6',
      route: 'Flashcards' as const,
    },
    {
      title: 'Practice Quiz',
      icon: '📝',
      description: 'Test yourself with timed questions',
      color: '#8B5CF6',
      route: 'Quiz' as const,
      params: { type: 'practice' as const, questionCount: 10 },
    },
    {
      title: 'Mock Interview',
      icon: '🤖',
      description: 'AI-powered citizenship interview simulation',
      color: '#10B981',
      route: 'AIInterview' as const,
    },
    {
      title: 'Reading Practice',
      icon: '📖',
      description: 'Practice reading English sentences',
      color: '#F59E0B',
      route: 'Reading' as const,
    },
    {
      title: 'Writing Practice',
      icon: '✍️',
      description: 'Practice writing English sentences',
      color: '#EF4444',
      route: 'Writing' as const,
    },
    {
      title: 'Speech Practice',
      icon: '🎤',
      description: 'Improve pronunciation with AI feedback',
      color: '#EC4899',
      route: 'SpeechPractice' as const,
    },
  ];

  const handleStudyMode = (route: string, params?: any) => {
    rootNavigation.navigate(route as any, params);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Study</Text>
          <Text style={styles.subtitle}>Choose your learning method</Text>
        </View>

        {/* Study Modes */}
        <View style={styles.modesContainer}>
          {studyModes.map((mode, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.modeCard, { borderLeftColor: mode.color }]}
              onPress={() => handleStudyMode(mode.route, mode.params)}
            >
              <View style={styles.modeHeader}>
                <Text style={styles.modeIcon}>{mode.icon}</Text>
                <View style={styles.modeInfo}>
                  <Text style={styles.modeTitle}>{mode.title}</Text>
                  <Text style={styles.modeDescription}>{mode.description}</Text>
                </View>
              </View>
              <View style={[styles.startButton, { backgroundColor: mode.color }]}>
                <Text style={styles.startButtonText}>Start</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Study Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Study Tips</Text>
          <Text style={styles.tipText}>
            • Study for 15-20 minutes daily for best results
          </Text>
          <Text style={styles.tipText}>
            • Focus on categories where you have lower accuracy
          </Text>
          <Text style={styles.tipText}>
            • Use speech practice to improve pronunciation
          </Text>
          <Text style={styles.tipText}>
            • Take mock interviews before your actual test
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  modesContainer: {
    marginBottom: 24,
  },
  modeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modeIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  startButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#78350F',
    marginBottom: 8,
    lineHeight: 20,
  },
});
