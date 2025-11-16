/**
 * Interview Coaching System - CitizenNow Enhanced
 *
 * Real-time coaching, analysis, and personalized feedback to improve
 * interview performance and build confidence.
 */

import { AIMessage } from '../types';

export interface CoachingInsight {
  type: 'positive' | 'warning' | 'suggestion' | 'critical';
  category: 'pacing' | 'clarity' | 'grammar' | 'content' | 'confidence' | 'filler_words';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

export interface SpeakingPattern {
  fillerWords: { word: string; count: number }[];
  averageResponseLength: number;
  speakingPace: 'too_slow' | 'good' | 'too_fast';
  clarityScore: number; // 0-100
  confidenceScore: number; // 0-100
  hesitationCount: number;
}

export interface PerformanceMetrics {
  responseTimeAvg: number; // seconds
  responseTimeTrend: 'improving' | 'stable' | 'declining';
  accuracyRate: number; // 0-100
  completenessScore: number; // 0-100
  englishQualityScore: number; // 0-100
  overallReadiness: number; // 0-100
}

export interface SessionAnalysis {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  totalQuestions: number;
  correctAnswers: number;
  speakingPatterns: SpeakingPattern;
  performanceMetrics: PerformanceMetrics;
  insights: CoachingInsight[];
  strengths: string[];
  weaknesses: string[];
  improvementAreas: ImprovementArea[];
  readinessLevel: 'not_ready' | 'needs_practice' | 'almost_ready' | 'ready' | 'very_ready';
  predictedPassProbability: number; // 0-100
}

export interface ImprovementArea {
  area: string;
  currentLevel: number; // 0-100
  targetLevel: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  practiceExercises: string[];
}

export interface CoachingRecommendation {
  title: string;
  description: string;
  type: 'study' | 'practice' | 'strategy' | 'mindset';
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number; // 0-100
  timeRequired: string; // e.g., "10 minutes daily"
}

// Common filler words to detect
const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'i mean', 'basically', 'actually',
  'literally', 'sort of', 'kind of', 'well', 'so', 'right', 'okay'
];

// Nervous language patterns
const NERVOUS_PATTERNS = [
  'i think', 'maybe', 'probably', 'i\'m not sure', 'i guess',
  'i don\'t know if', 'hopefully', 'perhaps', 'possibly'
];

/**
 * Analyze real-time speaking patterns during interview
 */
export class RealTimeCoach {
  private insights: CoachingInsight[] = [];
  private responseTimes: number[] = [];
  private lastQuestionTime: Date | null = null;

  /**
   * Analyze a user response in real-time
   */
  analyzeResponse(userMessage: string, questionAsked: string): CoachingInsight[] {
    const newInsights: CoachingInsight[] = [];

    // Track response time
    if (this.lastQuestionTime) {
      const responseTime = (new Date().getTime() - this.lastQuestionTime.getTime()) / 1000;
      this.responseTimes.push(responseTime);

      // Too slow (> 15 seconds for simple question)
      if (responseTime > 15) {
        newInsights.push({
          type: 'suggestion',
          category: 'pacing',
          message: 'Try to respond more quickly. Long pauses may indicate uncertainty.',
          timestamp: new Date(),
          severity: 'medium',
        });
      }

      // Too fast (< 2 seconds for complex question)
      if (responseTime < 2 && questionAsked.length > 50) {
        newInsights.push({
          type: 'warning',
          category: 'pacing',
          message: 'Take a moment to think before answering. It\'s okay to pause briefly.',
          timestamp: new Date(),
          severity: 'low',
        });
      }
    }

    // Check for filler words
    const fillerWordCount = this.countFillerWords(userMessage);
    if (fillerWordCount.total > 3) {
      newInsights.push({
        type: 'suggestion',
        category: 'filler_words',
        message: `Try to reduce filler words like "${fillerWordCount.words.join('", "')}" - pause instead.`,
        timestamp: new Date(),
        severity: 'medium',
      });
    }

    // Check for nervous language
    const nervousCount = this.countNervousPatterns(userMessage);
    if (nervousCount > 2) {
      newInsights.push({
        type: 'suggestion',
        category: 'confidence',
        message: 'Speak more confidently. Avoid phrases like "I think" or "maybe" - state facts clearly.',
        timestamp: new Date(),
        severity: 'medium',
      });
    }

    // Check response length
    const wordCount = userMessage.split(/\s+/).length;
    if (wordCount < 5 && !this.isSimpleAnswer(userMessage)) {
      newInsights.push({
        type: 'suggestion',
        category: 'content',
        message: 'Your answer seems brief. Provide a complete response when needed.',
        timestamp: new Date(),
        severity: 'low',
      });
    }

    // Check for unclear grammar
    const grammarIssues = this.detectGrammarIssues(userMessage);
    if (grammarIssues.length > 0) {
      newInsights.push({
        type: 'warning',
        category: 'grammar',
        message: `Grammar tip: ${grammarIssues[0]}`,
        timestamp: new Date(),
        severity: 'low',
      });
    }

    // Positive reinforcement for good responses
    if (wordCount >= 10 && wordCount <= 40 && fillerWordCount.total === 0) {
      newInsights.push({
        type: 'positive',
        category: 'clarity',
        message: 'Great response! Clear and well-structured.',
        timestamp: new Date(),
        severity: 'low',
      });
    }

    this.insights.push(...newInsights);
    return newInsights;
  }

  /**
   * Mark when a new question is asked
   */
  questionAsked(): void {
    this.lastQuestionTime = new Date();
  }

  /**
   * Get all insights from the session
   */
  getAllInsights(): CoachingInsight[] {
    return this.insights;
  }

  /**
   * Count filler words in text
   */
  private countFillerWords(text: string): { total: number; words: string[] } {
    const lowerText = text.toLowerCase();
    const foundWords: string[] = [];

    FILLER_WORDS.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches && matches.length > 0) {
        foundWords.push(filler);
      }
    });

    return {
      total: foundWords.length,
      words: foundWords,
    };
  }

  /**
   * Count nervous patterns in text
   */
  private countNervousPatterns(text: string): number {
    const lowerText = text.toLowerCase();
    let count = 0;

    NERVOUS_PATTERNS.forEach(pattern => {
      if (lowerText.includes(pattern)) {
        count++;
      }
    });

    return count;
  }

  /**
   * Check if answer is a simple one-word/phrase answer
   */
  private isSimpleAnswer(text: string): boolean {
    const simple = ['yes', 'no', 'true', 'false', 'correct', 'right', 'wrong'];
    return simple.includes(text.toLowerCase().trim());
  }

  /**
   * Detect basic grammar issues
   */
  private detectGrammarIssues(text: string): string[] {
    const issues: string[] = [];

    // Subject-verb agreement (basic detection)
    if (/\b(I|you|we|they)\s+is\b/i.test(text)) {
      issues.push('Use "am" with "I" or "are" with "you/we/they", not "is"');
    }

    // Double negatives
    if (/\b(don't|doesn't|didn't|won't|can't)\s+\w*\s*(no|nothing|never|nobody)\b/i.test(text)) {
      issues.push('Avoid double negatives in English');
    }

    return issues;
  }

  /**
   * Calculate average response time
   */
  getAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    return this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }
}

/**
 * Post-session comprehensive analysis
 */
export class SessionAnalyzer {
  /**
   * Analyze complete interview session
   */
  static analyzeSession(
    messages: AIMessage[],
    insights: CoachingInsight[],
    correctAnswers: number,
    totalQuestions: number,
    startTime: Date,
    endTime: Date
  ): SessionAnalysis {
    // Extract user messages only
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);

    // Analyze speaking patterns
    const speakingPatterns = this.analyzeSpeakingPatterns(userMessages);

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(
      userMessages,
      correctAnswers,
      totalQuestions,
      startTime,
      endTime
    );

    // Identify strengths and weaknesses
    const { strengths, weaknesses } = this.identifyStrengthsWeaknesses(
      speakingPatterns,
      performanceMetrics,
      insights
    );

    // Generate improvement areas
    const improvementAreas = this.generateImprovementAreas(
      speakingPatterns,
      performanceMetrics,
      weaknesses
    );

    // Calculate readiness level
    const readinessLevel = this.calculateReadinessLevel(performanceMetrics);

    // Predict pass probability
    const predictedPassProbability = this.predictPassProbability(performanceMetrics);

    return {
      sessionId: `session_${Date.now()}`,
      startTime,
      endTime,
      totalQuestions,
      correctAnswers,
      speakingPatterns,
      performanceMetrics,
      insights,
      strengths,
      weaknesses,
      improvementAreas,
      readinessLevel,
      predictedPassProbability,
    };
  }

  /**
   * Analyze speaking patterns across all responses
   */
  private static analyzeSpeakingPatterns(userMessages: string[]): SpeakingPattern {
    const allText = userMessages.join(' ');
    const totalWords = allText.split(/\s+/).length;
    const avgLength = totalWords / Math.max(userMessages.length, 1);

    // Count filler words
    const fillerWords: { word: string; count: number }[] = [];
    FILLER_WORDS.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = allText.match(regex);
      if (matches && matches.length > 0) {
        fillerWords.push({ word: filler, count: matches.length });
      }
    });

    // Determine speaking pace
    let speakingPace: 'too_slow' | 'good' | 'too_fast' = 'good';
    if (avgLength < 8) speakingPace = 'too_slow';
    if (avgLength > 50) speakingPace = 'too_fast';

    // Calculate clarity score
    const clarityScore = this.calculateClarityScore(userMessages, fillerWords.length);

    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(allText);

    // Count hesitations (um, uh)
    const hesitationCount = (allText.match(/\b(um|uh)\b/gi) || []).length;

    return {
      fillerWords: fillerWords.sort((a, b) => b.count - a.count).slice(0, 5),
      averageResponseLength: Math.round(avgLength),
      speakingPace,
      clarityScore,
      confidenceScore,
      hesitationCount,
    };
  }

  /**
   * Calculate clarity score based on grammar, structure, filler words
   */
  private static calculateClarityScore(messages: string[], fillerWordCount: number): number {
    let score = 100;

    // Penalize for filler words
    score -= Math.min(fillerWordCount * 5, 30);

    // Penalize for very short responses
    const avgLength = messages.reduce((sum, msg) => sum + msg.split(/\s+/).length, 0) / messages.length;
    if (avgLength < 5) score -= 20;

    // Penalize for very long, rambling responses
    if (avgLength > 60) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate confidence score based on nervous patterns
   */
  private static calculateConfidenceScore(text: string): number {
    let score = 100;
    const lowerText = text.toLowerCase();

    // Count nervous patterns
    let nervousCount = 0;
    NERVOUS_PATTERNS.forEach(pattern => {
      const matches = lowerText.match(new RegExp(`\\b${pattern}\\b`, 'g'));
      if (matches) nervousCount += matches.length;
    });

    // Penalize for nervous language
    score -= Math.min(nervousCount * 5, 40);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate performance metrics
   */
  private static calculatePerformanceMetrics(
    userMessages: string[],
    correctAnswers: number,
    totalQuestions: number,
    startTime: Date,
    endTime: Date
  ): PerformanceMetrics {
    const accuracyRate = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    const durationMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
    const responseTimeAvg = durationMinutes * 60 / Math.max(userMessages.length, 1);

    // Completeness: did they answer fully?
    const avgResponseLength = userMessages.reduce((sum, msg) => sum + msg.split(/\s+/).length, 0) / userMessages.length;
    const completenessScore = Math.min(100, (avgResponseLength / 15) * 100);

    // English quality
    const englishQualityScore = this.calculateEnglishQuality(userMessages);

    // Overall readiness
    const overallReadiness = (accuracyRate * 0.4 + completenessScore * 0.2 + englishQualityScore * 0.4);

    return {
      responseTimeAvg: Math.round(responseTimeAvg * 10) / 10,
      responseTimeTrend: 'stable',
      accuracyRate: Math.round(accuracyRate),
      completenessScore: Math.round(completenessScore),
      englishQualityScore: Math.round(englishQualityScore),
      overallReadiness: Math.round(overallReadiness),
    };
  }

  /**
   * Calculate English quality score
   */
  private static calculateEnglishQuality(messages: string[]): number {
    const allText = messages.join(' ');
    let score = 100;

    // Check for complete sentences
    const sentenceCount = (allText.match(/[.!?]+/g) || []).length;
    const wordCount = allText.split(/\s+/).length;
    if (sentenceCount === 0 && wordCount > 20) score -= 20;

    // Check for variety in vocabulary (basic)
    const uniqueWords = new Set(allText.toLowerCase().split(/\s+/));
    const vocabularyRichness = uniqueWords.size / wordCount;
    if (vocabularyRichness < 0.4) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Identify strengths and weaknesses
   */
  private static identifyStrengthsWeaknesses(
    patterns: SpeakingPattern,
    metrics: PerformanceMetrics,
    insights: CoachingInsight[]
  ): { strengths: string[]; weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Analyze accuracy
    if (metrics.accuracyRate >= 80) {
      strengths.push('Strong knowledge of civics questions');
    } else if (metrics.accuracyRate < 60) {
      weaknesses.push('Need to improve civics knowledge - study more');
    }

    // Analyze confidence
    if (patterns.confidenceScore >= 80) {
      strengths.push('Confident speaking style');
    } else if (patterns.confidenceScore < 60) {
      weaknesses.push('Reduce nervous language and speak more confidently');
    }

    // Analyze clarity
    if (patterns.clarityScore >= 80) {
      strengths.push('Clear and articulate responses');
    } else if (patterns.clarityScore < 60) {
      weaknesses.push('Work on clarity - reduce filler words and organize thoughts');
    }

    // Analyze completeness
    if (metrics.completenessScore >= 75) {
      strengths.push('Provides complete, thorough answers');
    } else if (metrics.completenessScore < 50) {
      weaknesses.push('Give more complete answers - elaborate on your responses');
    }

    // Analyze English quality
    if (metrics.englishQualityScore >= 80) {
      strengths.push('Excellent English communication');
    } else if (metrics.englishQualityScore < 65) {
      weaknesses.push('Practice English grammar and sentence structure');
    }

    return { strengths, weaknesses };
  }

  /**
   * Generate specific improvement areas with recommendations
   */
  private static generateImprovementAreas(
    patterns: SpeakingPattern,
    metrics: PerformanceMetrics,
    weaknesses: string[]
  ): ImprovementArea[] {
    const areas: ImprovementArea[] = [];

    // Civics knowledge
    if (metrics.accuracyRate < 80) {
      areas.push({
        area: 'Civics Knowledge',
        currentLevel: metrics.accuracyRate,
        targetLevel: 100,
        priority: metrics.accuracyRate < 60 ? 'critical' : 'high',
        recommendations: [
          'Study flashcards daily (15-20 minutes)',
          'Take practice quizzes regularly',
          'Focus on questions you answered incorrectly',
          'Join a study group or use spaced repetition',
        ],
        practiceExercises: [
          'Complete 20 flashcard reviews daily',
          'Take a full practice test weekly',
          'Teach the material to someone else',
        ],
      });
    }

    // Speaking confidence
    if (patterns.confidenceScore < 70) {
      areas.push({
        area: 'Speaking Confidence',
        currentLevel: patterns.confidenceScore,
        targetLevel: 85,
        priority: 'high',
        recommendations: [
          'Practice speaking aloud daily',
          'Record yourself and listen back',
          'Replace "I think" with definitive statements',
          'Take deep breaths before answering',
        ],
        practiceExercises: [
          'Practice answers in front of a mirror',
          'Do mock interviews with family/friends',
          'Record video responses to practice questions',
        ],
      });
    }

    // Filler words
    if (patterns.fillerWords.length > 0 && patterns.fillerWords[0].count > 5) {
      areas.push({
        area: 'Filler Word Reduction',
        currentLevel: Math.max(0, 100 - patterns.hesitationCount * 10),
        targetLevel: 90,
        priority: 'medium',
        recommendations: [
          `You used "${patterns.fillerWords[0].word}" ${patterns.fillerWords[0].count} times - be aware of this`,
          'Pause silently instead of using filler words',
          'Slow down and think before speaking',
          'Practice mindful speaking',
        ],
        practiceExercises: [
          'Record yourself and count filler words',
          'Have someone signal when you use fillers',
          'Practice 30-second responses without fillers',
        ],
      });
    }

    // English quality
    if (metrics.englishQualityScore < 75) {
      areas.push({
        area: 'English Communication',
        currentLevel: metrics.englishQualityScore,
        targetLevel: 85,
        priority: 'high',
        recommendations: [
          'Practice forming complete sentences',
          'Read English news articles daily',
          'Listen to English podcasts',
          'Work with an English tutor if possible',
        ],
        practiceExercises: [
          'Write out answers to practice questions',
          'Read aloud for 10 minutes daily',
          'Use language learning apps',
        ],
      });
    }

    return areas.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Calculate overall readiness level
   */
  private static calculateReadinessLevel(metrics: PerformanceMetrics): SessionAnalysis['readinessLevel'] {
    const score = metrics.overallReadiness;

    if (score >= 90) return 'very_ready';
    if (score >= 80) return 'ready';
    if (score >= 70) return 'almost_ready';
    if (score >= 50) return 'needs_practice';
    return 'not_ready';
  }

  /**
   * Predict pass probability based on performance
   */
  private static predictPassProbability(metrics: PerformanceMetrics): number {
    // Weighted calculation
    const civicsWeight = 0.5; // 50% weight (most important)
    const englishWeight = 0.3; // 30% weight
    const completenessWeight = 0.2; // 20% weight

    const probability =
      metrics.accuracyRate * civicsWeight +
      metrics.englishQualityScore * englishWeight +
      metrics.completenessScore * completenessWeight;

    return Math.round(Math.min(100, Math.max(0, probability)));
  }
}

/**
 * Generate personalized coaching recommendations
 */
export function generateCoachingRecommendations(
  analysis: SessionAnalysis
): CoachingRecommendation[] {
  const recommendations: CoachingRecommendation[] = [];

  // Based on readiness level
  if (analysis.readinessLevel === 'not_ready') {
    recommendations.push({
      title: 'Intensive Study Plan Needed',
      description: 'Your current performance suggests you need significant preparation. Focus on daily study and practice.',
      type: 'study',
      priority: 'high',
      estimatedImpact: 90,
      timeRequired: '2-3 hours daily for 2-4 weeks',
    });
  }

  // Based on accuracy
  if (analysis.performanceMetrics.accuracyRate < 70) {
    recommendations.push({
      title: 'Master the Civics Questions',
      description: 'Your civics knowledge needs improvement. Use flashcards and take practice quizzes daily.',
      type: 'study',
      priority: 'high',
      estimatedImpact: 85,
      timeRequired: '30 minutes daily',
    });
  }

  // Based on confidence
  if (analysis.speakingPatterns.confidenceScore < 70) {
    recommendations.push({
      title: 'Build Speaking Confidence',
      description: 'Practice speaking answers aloud. Record yourself and reduce nervous language patterns.',
      type: 'practice',
      priority: 'high',
      estimatedImpact: 70,
      timeRequired: '15 minutes daily',
    });
  }

  // Based on filler words
  if (analysis.speakingPatterns.hesitationCount > 10) {
    recommendations.push({
      title: 'Eliminate Filler Words',
      description: 'You use filler words frequently. Practice pausing silently instead of saying "um" or "uh".',
      type: 'practice',
      priority: 'medium',
      estimatedImpact: 60,
      timeRequired: '10 minutes daily',
    });
  }

  // Mindset recommendation for nervous applicants
  if (analysis.speakingPatterns.confidenceScore < 60) {
    recommendations.push({
      title: 'Develop Interview Confidence',
      description: 'Practice relaxation techniques. Remember: the officer wants you to succeed!',
      type: 'mindset',
      priority: 'high',
      estimatedImpact: 75,
      timeRequired: '5 minutes before practice',
    });
  }

  // Strategy recommendation
  recommendations.push({
    title: 'Take Regular Mock Interviews',
    description: 'Practice with full interview simulations weekly to build familiarity and comfort.',
    type: 'strategy',
    priority: 'medium',
    estimatedImpact: 80,
    timeRequired: '20 minutes weekly',
  });

  return recommendations.sort((a, b) => b.estimatedImpact - a.estimatedImpact);
}
