// Root Stack Navigator - Main navigation container
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList, linkingConfig } from './types';

// Import navigators
import BottomTabNavigator from './BottomTabNavigator';

// Import modal/stack screens
import FlashcardsScreen from '../screens/FlashcardsScreen';
import QuizScreen from '../screens/QuizScreen';
import AIInterviewScreen from '../screens/AIInterviewScreen';
import InterviewAnalyticsScreen from '../screens/InterviewAnalyticsScreen';
import SpeechPracticeScreen from '../screens/SpeechPracticeScreen';
import ReadingScreen from '../screens/ReadingScreen';
import N400AssistantScreen from '../screens/N400AssistantScreen';
import SetupWizardScreen from '../screens/SetupWizardScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer linking={linkingConfig as any}>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E40AF',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: 'Back',
          presentation: 'card',
        }}
      >
        {/* Main Tab Navigator */}
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{
            headerShown: false,
          }}
        />

        {/* Modal/Stack Screens */}
        <Stack.Screen
          name="Flashcards"
          component={FlashcardsScreen}
          options={{
            title: 'Flashcards',
            presentation: 'modal',
          }}
        />

        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={({ route }) => ({
            title: route.params.type === 'practice' ? 'Practice Quiz' : 'Mock Test',
            presentation: 'modal',
          })}
        />

        <Stack.Screen
          name="AIInterview"
          component={AIInterviewScreen}
          options={{
            title: 'AI Interview Practice',
            presentation: 'modal',
            headerStyle: {
              backgroundColor: '#10B981',
            },
          }}
        />

        <Stack.Screen
          name="InterviewAnalytics"
          component={InterviewAnalyticsScreen}
          options={{
            title: 'Interview Analytics',
            headerStyle: {
              backgroundColor: '#1E40AF',
            },
          }}
        />

        <Stack.Screen
          name="SpeechPractice"
          component={SpeechPracticeScreen}
          options={{
            title: 'Speech Practice',
            presentation: 'modal',
            headerStyle: {
              backgroundColor: '#8B5CF6',
            },
          }}
        />

        {/* Additional Stack Screens */}
        <Stack.Screen
          name="Reading"
          component={ReadingScreen}
          options={{
            title: 'Reading Practice',
          }}
        />

        <Stack.Screen
          name="Writing"
          component={PlaceholderScreen}
          options={{
            title: 'Writing Practice',
          }}
        />

        <Stack.Screen
          name="N400Assistant"
          component={N400AssistantScreen}
          options={{
            title: 'N-400 Assistant',
          }}
        />

        <Stack.Screen
          name="Settings"
          component={PlaceholderScreen}
          options={{
            title: 'Settings',
          }}
        />

        <Stack.Screen
          name="Leaderboard"
          component={PlaceholderScreen}
          options={{
            title: 'Leaderboard',
          }}
        />

        <Stack.Screen
          name="SetupWizard"
          component={SetupWizardScreen}
          options={{
            title: 'API Setup',
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Placeholder component for screens not yet implemented
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

function PlaceholderScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={placeholderStyles.container}>
      <View style={placeholderStyles.content}>
        <Text style={placeholderStyles.emoji}>🚧</Text>
        <Text style={placeholderStyles.title}>Coming Soon</Text>
        <Text style={placeholderStyles.description}>
          This feature is under development
        </Text>
        <TouchableOpacity
          style={placeholderStyles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={placeholderStyles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#1E40AF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
