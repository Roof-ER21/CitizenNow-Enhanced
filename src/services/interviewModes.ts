/**
 * Interview Practice Modes - CitizenNow Enhanced
 *
 * Comprehensive interview mode configurations with varying difficulty levels,
 * focus areas, and time constraints for realistic USCIS interview preparation.
 */

export type InterviewMode = 'quick' | 'full' | 'stress' | 'confidence' | 'custom';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type InterviewPhase = 'oath' | 'civics' | 'n400' | 'reading' | 'writing' | 'closing';

export interface InterviewModeConfig {
  id: InterviewMode;
  name: string;
  description: string;
  duration: number; // minutes
  phases: InterviewPhase[];
  civicsQuestionCount: number;
  n400QuestionCount: number;
  readingSentenceCount: number;
  writingSentenceCount: number;
  allowPause: boolean;
  allowHints: boolean;
  showRealTimeScore: boolean;
  timePerQuestion: number; // seconds (0 = unlimited)
  supportedDifficulties: DifficultyLevel[];
  icon: string;
  color: string;
}

export interface DifficultyConfig {
  level: DifficultyLevel;
  name: string;
  description: string;
  questionComplexity: 'simple' | 'standard' | 'complex';
  speakingPace: 'slow' | 'moderate' | 'fast' | 'rapid';
  allowRephrasing: boolean;
  hintsAvailable: number; // per session
  encouragementLevel: 'high' | 'moderate' | 'low' | 'minimal';
  stressLevel: 'low' | 'moderate' | 'high' | 'very_high';
  timePressure: boolean;
  strictEvaluation: boolean;
  feedbackDetail: 'basic' | 'detailed' | 'comprehensive' | 'expert';
}

export interface CustomModeSettings {
  categories: string[];
  questionCount: number;
  difficulty: DifficultyLevel;
  includeN400: boolean;
  includeReading: boolean;
  includeWriting: boolean;
  timeLimit?: number;
  focusAreas: string[];
}

// Interview Mode Configurations
export const INTERVIEW_MODES: Record<InterviewMode, InterviewModeConfig> = {
  quick: {
    id: 'quick',
    name: 'Quick Practice',
    description: 'Fast 5-10 minute civics-focused session for daily practice',
    duration: 10,
    phases: ['civics'],
    civicsQuestionCount: 6,
    n400QuestionCount: 0,
    readingSentenceCount: 0,
    writingSentenceCount: 0,
    allowPause: true,
    allowHints: true,
    showRealTimeScore: true,
    timePerQuestion: 0,
    supportedDifficulties: ['beginner', 'intermediate', 'advanced', 'expert'],
    icon: '⚡',
    color: '#10B981',
  },

  full: {
    id: 'full',
    name: 'Full Interview',
    description: 'Complete 15-20 minute simulation with all interview components',
    duration: 20,
    phases: ['oath', 'civics', 'n400', 'reading', 'writing', 'closing'],
    civicsQuestionCount: 10,
    n400QuestionCount: 5,
    readingSentenceCount: 3,
    writingSentenceCount: 3,
    allowPause: true,
    allowHints: true,
    showRealTimeScore: false,
    timePerQuestion: 0,
    supportedDifficulties: ['beginner', 'intermediate', 'advanced', 'expert'],
    icon: '🎯',
    color: '#1E40AF',
  },

  stress: {
    id: 'stress',
    name: 'Stress Test',
    description: 'Rapid-fire questions with challenging pace and difficult pronunciations',
    duration: 10,
    phases: ['civics', 'n400'],
    civicsQuestionCount: 15,
    n400QuestionCount: 5,
    readingSentenceCount: 0,
    writingSentenceCount: 0,
    allowPause: false,
    allowHints: false,
    showRealTimeScore: true,
    timePerQuestion: 30,
    supportedDifficulties: ['advanced', 'expert'],
    icon: '🔥',
    color: '#DC2626',
  },

  confidence: {
    id: 'confidence',
    name: 'Confidence Builder',
    description: 'Supportive session with easier questions and encouragement',
    duration: 10,
    phases: ['oath', 'civics', 'closing'],
    civicsQuestionCount: 8,
    n400QuestionCount: 0,
    readingSentenceCount: 0,
    writingSentenceCount: 0,
    allowPause: true,
    allowHints: true,
    showRealTimeScore: true,
    timePerQuestion: 0,
    supportedDifficulties: ['beginner', 'intermediate'],
    icon: '🌟',
    color: '#F59E0B',
  },

  custom: {
    id: 'custom',
    name: 'Custom Practice',
    description: 'Build your own interview with custom categories and settings',
    duration: 15,
    phases: ['civics'],
    civicsQuestionCount: 0, // Will be set by user
    n400QuestionCount: 0,
    readingSentenceCount: 0,
    writingSentenceCount: 0,
    allowPause: true,
    allowHints: true,
    showRealTimeScore: true,
    timePerQuestion: 0,
    supportedDifficulties: ['beginner', 'intermediate', 'advanced', 'expert'],
    icon: '⚙️',
    color: '#8B5CF6',
  },
};

// Difficulty Level Configurations
export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  beginner: {
    level: 'beginner',
    name: 'Beginner',
    description: 'Perfect for new learners with simple questions and lots of support',
    questionComplexity: 'simple',
    speakingPace: 'slow',
    allowRephrasing: true,
    hintsAvailable: 5,
    encouragementLevel: 'high',
    stressLevel: 'low',
    timePressure: false,
    strictEvaluation: false,
    feedbackDetail: 'detailed',
  },

  intermediate: {
    level: 'intermediate',
    name: 'Intermediate',
    description: 'Standard difficulty with balanced support and challenge',
    questionComplexity: 'standard',
    speakingPace: 'moderate',
    allowRephrasing: true,
    hintsAvailable: 3,
    encouragementLevel: 'moderate',
    stressLevel: 'moderate',
    timePressure: false,
    strictEvaluation: false,
    feedbackDetail: 'detailed',
  },

  advanced: {
    level: 'advanced',
    name: 'Advanced',
    description: 'Challenging questions with realistic pressure and less support',
    questionComplexity: 'complex',
    speakingPace: 'fast',
    allowRephrasing: false,
    hintsAvailable: 1,
    encouragementLevel: 'low',
    stressLevel: 'high',
    timePressure: true,
    strictEvaluation: true,
    feedbackDetail: 'comprehensive',
  },

  expert: {
    level: 'expert',
    name: 'Expert',
    description: 'Maximum challenge with rapid pace and strict evaluation',
    questionComplexity: 'complex',
    speakingPace: 'rapid',
    allowRephrasing: false,
    hintsAvailable: 0,
    encouragementLevel: 'minimal',
    stressLevel: 'very_high',
    timePressure: true,
    strictEvaluation: true,
    feedbackDetail: 'expert',
  },
};

// Category Focus Areas
export const CATEGORY_FOCUS_AREAS = {
  american_government: 'American Government & System',
  american_history: 'American History',
  integrated_civics: 'Integrated Civics (Geography, Symbols, Holidays)',
  geography: 'U.S. Geography',
  symbols: 'National Symbols',
  presidents: 'Presidents & Leaders',
  constitution: 'Constitution & Amendments',
  rights_responsibilities: 'Rights & Responsibilities',
} as const;

// Interview Phase Descriptions
export const PHASE_DESCRIPTIONS: Record<InterviewPhase, { name: string; description: string; duration: number }> = {
  oath: {
    name: 'Oath of Allegiance',
    description: 'Understanding and affirming commitment to the United States',
    duration: 2,
  },
  civics: {
    name: 'Civics Test',
    description: 'Official civics questions about U.S. government, history, and geography',
    duration: 8,
  },
  n400: {
    name: 'N-400 Review',
    description: 'Questions about your application and personal history',
    duration: 5,
  },
  reading: {
    name: 'Reading Test',
    description: 'Read English sentences aloud correctly',
    duration: 2,
  },
  writing: {
    name: 'Writing Test',
    description: 'Write English sentences correctly from dictation',
    duration: 2,
  },
  closing: {
    name: 'Closing',
    description: 'Final questions and interview conclusion',
    duration: 1,
  },
};

/**
 * Get interview mode configuration
 */
export function getInterviewMode(mode: InterviewMode): InterviewModeConfig {
  return INTERVIEW_MODES[mode];
}

/**
 * Get difficulty configuration
 */
export function getDifficulty(level: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_CONFIGS[level];
}

/**
 * Calculate estimated interview duration based on mode and difficulty
 */
export function calculateEstimatedDuration(
  mode: InterviewMode,
  difficulty: DifficultyLevel
): number {
  const modeConfig = INTERVIEW_MODES[mode];
  const diffConfig = DIFFICULTY_CONFIGS[difficulty];

  let baseDuration = modeConfig.duration;

  // Adjust for difficulty
  if (diffConfig.speakingPace === 'slow') {
    baseDuration *= 1.3;
  } else if (diffConfig.speakingPace === 'rapid') {
    baseDuration *= 0.7;
  }

  return Math.round(baseDuration);
}

/**
 * Get available categories for custom mode
 */
export function getAvailableCategories(): string[] {
  return Object.keys(CATEGORY_FOCUS_AREAS);
}

/**
 * Validate custom mode settings
 */
export function validateCustomSettings(settings: Partial<CustomModeSettings>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (settings.questionCount && settings.questionCount < 1) {
    errors.push('Question count must be at least 1');
  }

  if (settings.questionCount && settings.questionCount > 50) {
    errors.push('Question count cannot exceed 50');
  }

  if (settings.categories && settings.categories.length === 0) {
    errors.push('At least one category must be selected');
  }

  if (settings.timeLimit && settings.timeLimit < 1) {
    errors.push('Time limit must be at least 1 minute');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get recommended mode for user based on their progress
 */
export function getRecommendedMode(
  overallAccuracy: number,
  totalSessions: number
): InterviewMode {
  // New users (< 3 sessions) should start with confidence builder
  if (totalSessions < 3) {
    return 'confidence';
  }

  // Low accuracy (< 60%) should use confidence builder
  if (overallAccuracy < 60) {
    return 'confidence';
  }

  // Good accuracy (60-80%) should use full interview
  if (overallAccuracy < 80) {
    return 'full';
  }

  // High accuracy (80%+) can handle stress test
  return 'stress';
}

/**
 * Get recommended difficulty for user
 */
export function getRecommendedDifficulty(
  overallAccuracy: number,
  totalSessions: number
): DifficultyLevel {
  // New users start at beginner
  if (totalSessions < 5) {
    return 'beginner';
  }

  // Progress through difficulties based on accuracy
  if (overallAccuracy < 70) {
    return 'beginner';
  } else if (overallAccuracy < 80) {
    return 'intermediate';
  } else if (overallAccuracy < 90) {
    return 'advanced';
  } else {
    return 'expert';
  }
}

/**
 * Generate system prompt for AI based on mode and difficulty
 */
export function generateSystemPrompt(
  mode: InterviewMode,
  difficulty: DifficultyLevel,
  customSettings?: CustomModeSettings
): string {
  const modeConfig = INTERVIEW_MODES[mode];
  const diffConfig = DIFFICULTY_CONFIGS[difficulty];

  let basePrompt = `You are a professional USCIS officer conducting a naturalization interview. `;

  // Add mode-specific instructions
  switch (mode) {
    case 'quick':
      basePrompt += `This is a quick civics practice session (${modeConfig.duration} minutes). Focus on civics questions only. `;
      break;
    case 'full':
      basePrompt += `This is a complete naturalization interview simulation (${modeConfig.duration} minutes). Follow the standard USCIS interview structure. `;
      break;
    case 'stress':
      basePrompt += `This is a stress test simulation. Ask questions rapidly with minimal waiting time. Maintain professional pressure to test the applicant's performance under stress. `;
      break;
    case 'confidence':
      basePrompt += `This is a confidence-building session. Be extra encouraging and supportive. Use simpler questions and provide positive reinforcement frequently. `;
      break;
    case 'custom':
      basePrompt += `This is a custom practice session focusing on: ${customSettings?.focusAreas?.join(', ') || 'various topics'}. `;
      break;
  }

  // Add difficulty-specific instructions
  basePrompt += `\n\nDifficulty Level: ${diffConfig.name}\n`;
  basePrompt += `Speaking Pace: ${diffConfig.speakingPace}\n`;
  basePrompt += `Encouragement: ${diffConfig.encouragementLevel}\n`;

  if (diffConfig.allowRephrasing) {
    basePrompt += `- Rephrase questions if the applicant doesn't understand\n`;
  }

  if (diffConfig.encouragementLevel === 'high') {
    basePrompt += `- Provide frequent positive reinforcement\n`;
    basePrompt += `- Be patient and understanding\n`;
  }

  if (diffConfig.strictEvaluation) {
    basePrompt += `- Evaluate answers strictly but fairly\n`;
    basePrompt += `- Note even minor errors in responses\n`;
  } else {
    basePrompt += `- Be lenient with minor grammatical errors that don't affect meaning\n`;
    basePrompt += `- Focus on whether the applicant understands the content\n`;
  }

  // Add phase-specific instructions
  basePrompt += `\n\nInterview Phases to Complete:\n`;
  modeConfig.phases.forEach(phase => {
    const phaseInfo = PHASE_DESCRIPTIONS[phase];
    basePrompt += `- ${phaseInfo.name}: ${phaseInfo.description}\n`;
  });

  // Add question counts
  if (modeConfig.civicsQuestionCount > 0) {
    basePrompt += `\nAsk ${modeConfig.civicsQuestionCount} civics questions from the official 100/128-question list.\n`;
  }

  if (modeConfig.n400QuestionCount > 0) {
    basePrompt += `Ask ${modeConfig.n400QuestionCount} questions about the applicant's N-400 application.\n`;
  }

  // General guidelines
  basePrompt += `\n\nGeneral Guidelines:
- Maintain a professional and respectful tone
- Clearly articulate each question
- Listen carefully to responses
- Provide appropriate feedback based on difficulty level
- Complete the interview naturally within the time limit
- Remember: The goal is to help the applicant prepare while maintaining realism`;

  return basePrompt;
}

/**
 * Calculate score weights based on mode
 */
export function getScoreWeights(mode: InterviewMode): {
  civics: number;
  english: number;
  n400: number;
  reading: number;
  writing: number;
} {
  switch (mode) {
    case 'quick':
      return { civics: 100, english: 0, n400: 0, reading: 0, writing: 0 };
    case 'full':
      return { civics: 40, english: 20, n400: 20, reading: 10, writing: 10 };
    case 'stress':
      return { civics: 60, english: 20, n400: 20, reading: 0, writing: 0 };
    case 'confidence':
      return { civics: 80, english: 20, n400: 0, reading: 0, writing: 0 };
    case 'custom':
      return { civics: 50, english: 25, n400: 25, reading: 0, writing: 0 };
    default:
      return { civics: 40, english: 20, n400: 20, reading: 10, writing: 10 };
  }
}
