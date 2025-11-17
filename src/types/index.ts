// Core Types for CitizenNow Enhanced

export interface CivicsQuestion {
  id: string;
  questionNumber: number;
  question: string;
  answer: string;
  category: 'american_government' | 'american_history' | 'integrated_civics' | 'geography' | 'symbols';
  difficulty: 'easy' | 'medium' | 'hard';
  audioUrl?: string;
  imageUrl?: string;
  era?: string; // For 2025 test vs 2008 test
  isFor65Plus?: boolean; // Special 20 questions for 65+ applicants
}

export interface ReadingSentence {
  id: string;
  sentence: string;
  category: 'civics' | 'daily_life';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface WritingSentence {
  id: string;
  sentence: string;
  category: 'civics' | 'daily_life';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  language: string;
  testDate?: Date;
  testVersion: '2008' | '2025'; // N-400 filed before/after Oct 20, 2025
  is65Plus?: boolean;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface N400Data {
  // Encrypted sensitive data
  hasN400Data: boolean;
  travelHistory?: boolean;
  employmentHistory?: boolean;
  maritalStatus?: string;
  // Other N-400 fields will be encrypted
}

export interface QuestionProgress {
  questionId: string;
  totalAttempts: number;
  correctAttempts: number;
  lastAttemptDate: Date;
  lastAnswerCorrect: boolean;
  nextReviewDate: Date; // For spaced repetition
  difficultyLevel: number; // SM-2 algorithm difficulty
  consecutiveCorrect: number;
}

export interface StudySession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  sessionType: 'flashcards' | 'quiz' | 'reading' | 'writing' | 'ai_interview' | 'speech_practice';
  questionsStudied: string[];
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  durationMinutes: number;
}

export interface UserProgress {
  userId: string;
  totalQuestionsAttempted: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  streakDays: number;
  lastStudyDate: Date;
  totalStudyMinutes: number;
  totalPoints: number;
  level: number;
  badges: Badge[];
  questionProgress: { [questionId: string]: QuestionProgress };
  categoryProgress: {
    [category: string]: {
      attempted: number;
      correct: number;
      accuracy: number;
    };
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: Date;
  type: 'streak' | 'mastery' | 'milestone' | 'special';
}

export interface AISession {
  id: string;
  userId: string;
  sessionType: 'interview' | 'speech_practice' | 'n400_assistant';
  startTime: Date;
  endTime?: Date;
  transcript: AIMessage[];
  feedback?: AIFeedback;
  rating?: number; // User rating of AI session
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  audioUrl?: string; // For speech practice
}

export interface AIFeedback {
  overallScore: number;
  englishSpeakingScore?: number;
  civicsAccuracy?: number;
  areasForImprovement: string[];
  strengths: string[];
  detailedFeedback: string;
  pronunciationErrors?: PronunciationError[];
}

export interface PronunciationError {
  word: string;
  attemptedPronunciation: string;
  correctPronunciation: string;
  severity: 'minor' | 'moderate' | 'critical';
  suggestion: string;
}

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  challengeType: 'quiz' | 'streak' | 'category_mastery';
  description: string;
  requirement: number; // e.g., answer 10 questions correctly
  reward: number; // points
  completed: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalPoints: number;
  rank: number;
  badge?: string; // Top badge earned
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// LLM API Types
export interface OpenAIInterviewRequest {
  userId: string;
  conversationHistory: AIMessage[];
  userResponse?: string;
}

export interface WhisperTranscriptionRequest {
  audioBlob: Blob;
  language?: string;
}

export interface GeminiExplanationRequest {
  questionId: string;
  userLanguage: string;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Study: undefined;
  Flashcards: { category?: string };
  Quiz: { type: 'practice' | 'mock'; questionCount?: number };
  Reading: undefined;
  Writing: undefined;
  AIInterview: undefined;
  SpeechPractice: { questionId?: string };
  N400Assistant: undefined;
  Progress: undefined;
  Profile: undefined;
  Settings: undefined;
  Leaderboard: undefined;
  SetupWizard: undefined;
  // Auth screens (for legacy LoginScreen - not actively used)
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

// Component Props
export interface QuestionCardProps {
  question: CivicsQuestion;
  onAnswer: (correct: boolean) => void;
  showAnswer: boolean;
  mode: 'flashcard' | 'quiz';
}

export interface ProgressChartProps {
  data: UserProgress;
  timeRange: 'week' | 'month' | 'all';
}

export interface BadgeDisplayProps {
  badge: Badge;
  size: 'small' | 'medium' | 'large';
}

// Interview Enhancement Types
export interface InterviewSessionConfig {
  mode: 'quick' | 'full' | 'stress' | 'confidence' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  scenario?: string;
  customSettings?: {
    categories?: string[];
    questionCount?: number;
    focusAreas?: string[];
  };
  voiceEnabled?: boolean;
  showHints?: boolean;
  showScore?: boolean;
  coachingMode?: 'realtime' | 'minimal';
  officerVoice?: VoiceProfile;
}

// Voice Interview Types
export interface VoiceProfile {
  gender: 'male' | 'female';
  rate: 'slow' | 'normal' | 'fast';
  pitch?: number;
  profileName?: 'professional_female' | 'professional_male' | 'friendly_female' | 'friendly_male' | 'senior_female' | 'senior_male';
}

export interface InterviewPreferences {
  voiceEnabled: boolean;
  coachingMode: 'realtime' | 'minimal';
  officerVoice: VoiceProfile;
  autoSpeakQuestions: boolean;
  preferVoiceInput: boolean;
}

export interface InterviewState {
  phase: 'setup' | 'oath' | 'civics' | 'n400' | 'reading' | 'writing' | 'closing' | 'feedback';
  currentQuestionIndex: number;
  questionsAsked: number;
  correctAnswers: number;
  startTime: Date;
  pausedAt?: Date;
  isPaused: boolean;
  hintsUsed: number;
  timeElapsed: number; // seconds
}

export interface InterviewCoachingInsight {
  type: 'positive' | 'warning' | 'suggestion' | 'critical';
  category: 'pacing' | 'clarity' | 'grammar' | 'content' | 'confidence' | 'filler_words';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

export interface EnhancedAIFeedback extends AIFeedback {
  speakingPatterns?: {
    fillerWords: { word: string; count: number }[];
    averageResponseLength: number;
    clarityScore: number;
    confidenceScore: number;
  };
  performanceMetrics?: {
    responseTimeAvg: number;
    accuracyRate: number;
    completenessScore: number;
    englishQualityScore: number;
    overallReadiness: number;
  };
  improvementAreas?: {
    area: string;
    currentLevel: number;
    targetLevel: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  }[];
  readinessLevel?: 'not_ready' | 'needs_practice' | 'almost_ready' | 'ready' | 'very_ready';
  predictedPassProbability?: number;
}
