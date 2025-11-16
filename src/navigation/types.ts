// Navigation Types for CitizenNow Enhanced
import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

// Bottom Tab Navigator Params
export type BottomTabParamList = {
  Home: undefined;
  Study: undefined;
  Progress: undefined;
  Profile: undefined;
};

// Root Stack Navigator Params
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>;
  Flashcards: { category?: string };
  Quiz: { type: 'practice' | 'mock'; questionCount?: number };
  Reading: undefined;
  Writing: undefined;
  AIInterview: undefined;
  InterviewAnalytics: undefined;
  SpeechPractice: { questionId?: string };
  N400Assistant: undefined;
  Settings: undefined;
  Leaderboard: undefined;
  SetupWizard: undefined;
  // Auth screens (for legacy LoginScreen - not actively used)
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

// Navigation Props for each screen
export type HomeScreenNavigationProp = BottomTabNavigationProp<BottomTabParamList, 'Home'>;
export type StudyScreenNavigationProp = BottomTabNavigationProp<BottomTabParamList, 'Study'>;
export type ProgressScreenNavigationProp = BottomTabNavigationProp<BottomTabParamList, 'Progress'>;
export type ProfileScreenNavigationProp = BottomTabNavigationProp<BottomTabParamList, 'Profile'>;

export type FlashcardsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Flashcards'>;
export type QuizScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Quiz'>;
export type ReadingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reading'>;
export type WritingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Writing'>;
export type AIInterviewScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AIInterview'>;
export type SpeechPracticeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SpeechPractice'>;

// Route Props for each screen
export type FlashcardsScreenRouteProp = RouteProp<RootStackParamList, 'Flashcards'>;
export type QuizScreenRouteProp = RouteProp<RootStackParamList, 'Quiz'>;
export type SpeechPracticeScreenRouteProp = RouteProp<RootStackParamList, 'SpeechPractice'>;

// Combined Props for screens
export type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

export type StudyScreenProps = {
  navigation: StudyScreenNavigationProp;
};

export type ProgressScreenProps = {
  navigation: ProgressScreenNavigationProp;
};

export type ProfileScreenProps = {
  navigation: ProfileScreenNavigationProp;
};

export type FlashcardsScreenProps = {
  navigation: FlashcardsScreenNavigationProp;
  route: FlashcardsScreenRouteProp;
};

export type QuizScreenProps = {
  navigation: QuizScreenNavigationProp;
  route: QuizScreenRouteProp;
};

export type SpeechPracticeScreenProps = {
  navigation: SpeechPracticeScreenNavigationProp;
  route: SpeechPracticeScreenRouteProp;
};

// Deep Linking Configuration
export const linkingConfig = {
  prefixes: ['citizennow://', 'https://citizennow.app'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: 'home',
          Study: 'study',
          Progress: 'progress',
          Profile: 'profile',
        },
      },
      Flashcards: 'flashcards/:category?',
      Quiz: 'quiz/:type/:questionCount?',
      Reading: 'reading',
      Writing: 'writing',
      AIInterview: 'ai-interview',
      InterviewAnalytics: 'interview-analytics',
      SpeechPractice: 'speech-practice/:questionId?',
      N400Assistant: 'n400-assistant',
      Settings: 'settings',
      Leaderboard: 'leaderboard',
      SetupWizard: 'setup-wizard',
    },
  },
};
