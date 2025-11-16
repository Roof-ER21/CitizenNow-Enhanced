# AI Interview System - Usage Examples

## Table of Contents

1. [Quick Start Examples](#quick-start-examples)
2. [Mode Selection Examples](#mode-selection-examples)
3. [Scenario-Based Examples](#scenario-based-examples)
4. [Coaching Integration](#coaching-integration)
5. [Voice Guidance Examples](#voice-guidance-examples)
6. [Analytics Examples](#analytics-examples)
7. [Complete Interview Flow](#complete-interview-flow)
8. [UI Component Examples](#ui-component-examples)

---

## Quick Start Examples

### Example 1: Simple Quick Practice

```typescript
import { interviewSimulator } from '../services/llmService';
import { getInterviewMode } from '../services/interviewModes';

async function quickPractice() {
  // Get quick practice mode config
  const mode = getInterviewMode('quick');
  console.log(`Starting ${mode.name} - ${mode.duration} minutes`);

  // Start interview
  const greeting = await interviewSimulator.startInterview();
  console.log('Officer:', greeting);

  // User responds
  const response = await interviewSimulator.sendMessage('Ready to begin!');
  console.log('Officer:', response);

  // Continue for 6 civics questions...

  // Get feedback
  const feedback = await interviewSimulator.getFeedback();
  console.log(`Score: ${feedback.overallScore}/100`);
}
```

### Example 2: Full Interview with Voice

```typescript
import { interviewSimulator } from '../services/llmService';
import { getVoiceGuidanceService } from '../services/voiceGuidance';

async function fullInterviewWithVoice() {
  // Setup voice
  const voice = getVoiceGuidanceService({
    enabled: true,
    gender: 'female',
    rate: 'normal',
    autoPlay: true
  });

  // Start interview
  const greeting = await interviewSimulator.startInterview();
  await voice.speak(greeting);

  // Interview continues with voice...

  // Cleanup
  await voice.stop();
}
```

### Example 3: Confidence Builder for Beginners

```typescript
import { getInterviewMode, getDifficulty, generateSystemPrompt } from '../services/interviewModes';

async function confidenceBuilderSession() {
  const mode = getInterviewMode('confidence');
  const difficulty = getDifficulty('beginner');

  // Mode provides:
  // - Easy questions
  // - 5 hints available
  // - High encouragement
  // - No time pressure

  console.log(`${mode.icon} ${mode.name}`);
  console.log(`Difficulty: ${difficulty.name}`);
  console.log(`Hints: ${difficulty.hintsAvailable}`);

  // Use these settings in your interview UI...
}
```

---

## Mode Selection Examples

### Example 4: Smart Mode Recommendation

```typescript
import { getRecommendedMode, getRecommendedDifficulty } from '../services/interviewModes';
import { SessionAnalyticsService } from '../services/sessionAnalytics';

async function getSmartRecommendation() {
  // Get user's statistics
  const stats = await SessionAnalyticsService.getOverallStatistics();

  // Get recommendations
  const recommendedMode = getRecommendedMode(
    stats.overallAccuracy,
    stats.totalSessions
  );

  const recommendedDifficulty = getRecommendedDifficulty(
    stats.overallAccuracy,
    stats.totalSessions
  );

  console.log(`Recommended Mode: ${recommendedMode}`);
  console.log(`Recommended Difficulty: ${recommendedDifficulty}`);

  // Use in UI to suggest best practice mode
}
```

### Example 5: Custom Practice Setup

```typescript
import { getInterviewMode, validateCustomSettings } from '../services/interviewModes';

function setupCustomPractice() {
  const customSettings = {
    categories: ['american_government', 'american_history'],
    questionCount: 15,
    difficulty: 'intermediate',
    includeN400: true,
    includeReading: false,
    includeWriting: false,
    timeLimit: 20,
    focusAreas: ['Constitution', 'Presidents']
  };

  // Validate settings
  const validation = validateCustomSettings(customSettings);

  if (validation.valid) {
    console.log('Custom mode ready!');
    // Start custom interview
  } else {
    console.error('Errors:', validation.errors);
  }
}
```

### Example 6: Duration Calculation

```typescript
import { calculateEstimatedDuration } from '../services/interviewModes';

function showEstimatedDuration() {
  const fullDuration = calculateEstimatedDuration('full', 'intermediate');
  // Returns: ~20 minutes

  const stressDuration = calculateEstimatedDuration('stress', 'expert');
  // Returns: ~7 minutes (faster pace)

  const beginnerDuration = calculateEstimatedDuration('full', 'beginner');
  // Returns: ~26 minutes (slower pace)

  console.log(`Full/Intermediate: ${fullDuration} min`);
  console.log(`Stress/Expert: ${stressDuration} min`);
  console.log(`Full/Beginner: ${beginnerDuration} min`);
}
```

---

## Scenario-Based Examples

### Example 7: Senior (65+) Applicant

```typescript
import { getScenario } from '../data/interviewScenarios';
import { generateSystemPrompt } from '../services/interviewModes';

async function seniorApplicantInterview() {
  // Get senior scenario
  const scenario = getScenario('senior_65plus');

  console.log(`Scenario: ${scenario.name}`);
  console.log(`Description: ${scenario.description}`);

  // Use custom system prompt
  const systemPrompt = scenario.customSystemPrompt;

  // Scenario includes:
  // - Only 20 designated questions
  // - Slower speaking pace
  // - More patient approach
  // - Special accommodations

  // Focus questions specific to seniors
  console.log('N-400 Questions:', scenario.n400FocusQuestions);

  // Coaching focus
  console.log('Focus Areas:', scenario.coachingFocusAreas);
  // ['Memorizing 20 questions', 'Speaking clearly', ...]
}
```

### Example 8: Nervous First-Timer Support

```typescript
import { getScenario } from '../data/interviewScenarios';

async function nervousApplicantInterview() {
  const scenario = getScenario('first_time_nervous');

  // Scenario customizes the experience:
  // - Extra encouraging language
  // - Starts with easiest questions
  // - Allows more time for responses
  // - Provides frequent reassurance

  console.log('Special Considerations:');
  scenario.specialConsiderations.forEach(consideration => {
    console.log(`- ${consideration}`);
  });

  // Output:
  // - Allow extra time for responses
  // - Provide frequent reassurance
  // - Start with easiest questions first
  // - Be patient with hesitation
}
```

### Example 9: Auto-Select Scenario

```typescript
import { getRecommendedScenario } from '../data/interviewScenarios';

function autoSelectScenario(userProfile) {
  const scenario = getRecommendedScenario({
    age: 67,
    yearsInUS: 22,
    hasTravel: false,
    hasEmploymentGaps: false,
    isMilitary: false
  });

  console.log(`Recommended Scenario: ${scenario}`);
  // Returns: 'senior_65plus'

  const youngApplicant = getRecommendedScenario({
    age: 28,
    yearsInUS: 5,
    hasTravel: true,
    isMilitary: false
  });

  console.log(`Recommended Scenario: ${youngApplicant}`);
  // Returns: 'complex_travel' or 'recent_arrival'
}
```

---

## Coaching Integration

### Example 10: Real-Time Coaching During Interview

```typescript
import { RealTimeCoach } from '../services/interviewCoaching';

async function interviewWithCoaching() {
  const coach = new RealTimeCoach();

  // Question asked
  coach.questionAsked();
  const question = "What is the supreme law of the land?";

  // User responds
  const userResponse = "Um, I think it's, like, the Constitution?";

  // Analyze response
  const insights = coach.analyzeResponse(userResponse, question);

  // Insights might include:
  insights.forEach(insight => {
    console.log(`[${insight.type}] ${insight.category}: ${insight.message}`);
  });

  // Example output:
  // [suggestion] filler_words: Try to reduce filler words like "um", "like" - pause instead.
  // [suggestion] confidence: Speak more confidently. Avoid phrases like "I think" - state facts clearly.
  // [positive] content: Correct answer!
}
```

### Example 11: Post-Session Analysis

```typescript
import { SessionAnalyzer } from '../services/interviewCoaching';

async function analyzeCompletedSession() {
  // After interview completes
  const messages = [/* AIMessage[] */];
  const insights = [/* CoachingInsight[] */];
  const correctAnswers = 8;
  const totalQuestions = 10;
  const startTime = new Date('2025-01-15T10:00:00');
  const endTime = new Date('2025-01-15T10:18:00');

  const analysis = SessionAnalyzer.analyzeSession(
    messages,
    insights,
    correctAnswers,
    totalQuestions,
    startTime,
    endTime
  );

  console.log('=== SESSION ANALYSIS ===');
  console.log(`Accuracy: ${analysis.performanceMetrics.accuracyRate}%`);
  console.log(`Confidence Score: ${analysis.speakingPatterns.confidenceScore}/100`);
  console.log(`Clarity Score: ${analysis.speakingPatterns.clarityScore}/100`);
  console.log(`Readiness: ${analysis.readinessLevel}`);
  console.log(`Pass Probability: ${analysis.predictedPassProbability}%`);

  console.log('\nSTRENGTHS:');
  analysis.strengths.forEach(s => console.log(`✓ ${s}`));

  console.log('\nWEAKNESSES:');
  analysis.weaknesses.forEach(w => console.log(`✗ ${w}`));
}
```

### Example 12: Coaching Recommendations

```typescript
import { generateCoachingRecommendations } from '../services/interviewCoaching';

function getPersonalizedCoaching(sessionAnalysis) {
  const recommendations = generateCoachingRecommendations(sessionAnalysis);

  console.log('=== PERSONALIZED RECOMMENDATIONS ===\n');

  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.title} [${rec.priority.toUpperCase()}]`);
    console.log(`   ${rec.description}`);
    console.log(`   Type: ${rec.type}`);
    console.log(`   Impact: ${rec.estimatedImpact}/100`);
    console.log(`   Time: ${rec.timeRequired}`);
    console.log('');
  });

  // Example output:
  // 1. Master the Civics Questions [HIGH]
  //    Your civics knowledge needs improvement...
  //    Type: study
  //    Impact: 85/100
  //    Time: 30 minutes daily
}
```

---

## Voice Guidance Examples

### Example 13: Basic Voice Setup

```typescript
import { getVoiceGuidanceService } from '../services/voiceGuidance';

async function setupVoice() {
  const voice = getVoiceGuidanceService({
    enabled: true,
    gender: 'female',
    rate: 'normal',
    pitch: 1.0,
    volume: 0.8,
    autoPlay: true
  });

  // Test voice
  await voice.testVoice();

  // Speak question
  await voice.speakQuestion("What is the supreme law of the land?");

  // Check if available
  const available = await voice.isSpeechAvailable();
  console.log(`Speech available: ${available}`);
}
```

### Example 14: Officer Voice Profiles

```typescript
import { getOfficerVoiceProfile, getVoiceGuidanceService } from '../services/voiceGuidance';

async function useOfficerProfiles() {
  const voice = getVoiceGuidanceService();

  // Professional female officer
  voice.updateSettings(getOfficerVoiceProfile('professional_female'));
  await voice.speak("Good morning. Please have a seat.");

  // Senior male officer (slower)
  voice.updateSettings(getOfficerVoiceProfile('senior_male'));
  await voice.speak("Let's begin with some civics questions.");

  // Friendly female officer
  voice.updateSettings(getOfficerVoiceProfile('friendly_female'));
  await voice.speakEncouragement("You're doing great! Keep it up!");
}
```

### Example 15: Voice Playback Control

```typescript
async function controlVoicePlayback(voiceService) {
  // Start speaking long text
  voiceService.speak("This is a long text that will take time to speak...");

  // User clicks pause
  if (voiceService.getIsSpeaking()) {
    await voiceService.pause();
    console.log('Paused');
  }

  // User clicks resume
  await voiceService.resume();
  console.log('Resumed');

  // User clicks stop
  await voiceService.stop();
  console.log('Stopped');
}
```

### Example 16: Available Voices

```typescript
import { getVoiceGuidanceService } from '../services/voiceGuidance';

async function listAvailableVoices() {
  const voice = getVoiceGuidanceService();
  const voices = await voice.getAvailableVoices();

  console.log('Available English Voices:');
  voices.forEach(v => {
    console.log(`- ${v.name} (${v.gender}) - ${v.description}`);
  });

  // Example output:
  // - Samantha (female) - Samantha (en-US)
  // - Alex (male) - Alex (en-US)
  // - Victoria (female) - Victoria (en-US)
}
```

---

## Analytics Examples

### Example 17: Session History

```typescript
import { SessionAnalyticsService } from '../services/sessionAnalytics';

async function viewSessionHistory() {
  // Get last 10 sessions
  const history = await SessionAnalyticsService.getSessionHistory(10);

  console.log('=== RECENT SESSIONS ===\n');
  history.forEach(session => {
    console.log(`Date: ${session.timestamp.toLocaleDateString()}`);
    console.log(`Mode: ${session.mode} | Difficulty: ${session.difficulty}`);
    console.log(`Accuracy: ${session.accuracyRate}%`);
    console.log(`Score: ${session.overallScore}/100`);
    console.log(`Duration: ${session.duration.toFixed(1)} min`);
    console.log('---');
  });
}
```

### Example 18: Overall Statistics

```typescript
import { SessionAnalyticsService } from '../services/sessionAnalytics';

async function viewOverallStats() {
  const stats = await SessionAnalyticsService.getOverallStatistics();

  console.log('=== YOUR PROGRESS ===\n');
  console.log(`Total Sessions: ${stats.totalSessions}`);
  console.log(`Practice Time: ${Math.round(stats.totalPracticeTime)} minutes`);
  console.log(`Questions Attempted: ${stats.totalQuestions}`);
  console.log(`Overall Accuracy: ${stats.overallAccuracy.toFixed(1)}%`);
  console.log(`Current Streak: ${stats.currentStreak} days 🔥`);
  console.log(`Longest Streak: ${stats.longestStreak} days`);
  console.log(`\nReadiness Score: ${stats.readinessScore}/100`);

  if (stats.estimatedReadyDate) {
    console.log(`Estimated Ready: ${stats.estimatedReadyDate.toLocaleDateString()}`);
  } else {
    console.log('Status: READY FOR INTERVIEW! ✅');
  }
}
```

### Example 19: Progress Trends

```typescript
import { SessionAnalyticsService } from '../services/sessionAnalytics';

async function viewProgressTrends() {
  // Get accuracy trend over last 30 days
  const accuracyTrend = await SessionAnalyticsService.getProgressTrends('accuracy', 30);

  console.log(`=== ACCURACY TREND (30 days) ===`);
  console.log(`Direction: ${accuracyTrend.trend} ${getTrendEmoji(accuracyTrend.trend)}`);
  console.log(`Change: ${accuracyTrend.changePercentage > 0 ? '+' : ''}${accuracyTrend.changePercentage}%`);

  // Chart data
  console.log('\nProgress Chart:');
  accuracyTrend.dataPoints.forEach(point => {
    const bar = '█'.repeat(Math.round(point.value / 5));
    console.log(`${point.date.toLocaleDateString()}: ${bar} ${point.value}%`);
  });
}

function getTrendEmoji(trend) {
  return trend === 'improving' ? '📈' : trend === 'declining' ? '📉' : '➡️';
}
```

### Example 20: Milestones

```typescript
import { SessionAnalyticsService } from '../services/sessionAnalytics';

async function checkMilestones() {
  const milestones = await SessionAnalyticsService.getMilestones();
  const newMilestones = await SessionAnalyticsService.getNewMilestones();

  // Show new achievements
  if (newMilestones.length > 0) {
    console.log('🎉 NEW ACHIEVEMENTS! 🎉\n');
    newMilestones.forEach(m => {
      console.log(`${m.icon} ${m.name}`);
      console.log(`   ${m.description}`);
      console.log(`   Rarity: ${m.rarity.toUpperCase()}`);
      console.log('');
    });
  }

  // Show all achievements
  console.log('=== ALL ACHIEVEMENTS ===\n');
  const byRarity = groupByRarity(milestones);

  Object.entries(byRarity).forEach(([rarity, items]) => {
    console.log(`${rarity.toUpperCase()}:`);
    items.forEach(m => console.log(`${m.icon} ${m.name}`));
    console.log('');
  });
}

function groupByRarity(milestones) {
  return milestones.reduce((acc, m) => {
    acc[m.rarity] = acc[m.rarity] || [];
    acc[m.rarity].push(m);
    return acc;
  }, {});
}
```

---

## Complete Interview Flow

### Example 21: Full Interview Implementation

```typescript
import { interviewSimulator } from '../services/llmService';
import { getInterviewMode, getDifficulty, generateSystemPrompt } from '../services/interviewModes';
import { getScenario } from '../data/interviewScenarios';
import { RealTimeCoach, SessionAnalyzer, generateCoachingRecommendations } from '../services/interviewCoaching';
import { SessionAnalyticsService } from '../services/sessionAnalytics';
import { getVoiceGuidanceService } from '../services/voiceGuidance';

async function completeInterviewFlow() {
  // 1. SETUP
  const mode = 'full';
  const difficulty = 'intermediate';
  const scenario = 'first_time_standard';

  const modeConfig = getInterviewMode(mode);
  const diffConfig = getDifficulty(difficulty);
  const scenarioConfig = getScenario(scenario);

  // Setup coaching
  const coach = new RealTimeCoach();

  // Setup voice
  const voice = getVoiceGuidanceService({
    enabled: true,
    gender: 'female',
    rate: 'normal'
  });

  // 2. START INTERVIEW
  const startTime = new Date();
  console.log(`Starting ${modeConfig.name} (${diffConfig.name})`);

  const greeting = await interviewSimulator.startInterview();
  await voice.speak(greeting);

  // 3. CONDUCT INTERVIEW
  const messages = [{ role: 'assistant', content: greeting, timestamp: new Date() }];
  let correctAnswers = 0;
  let totalQuestions = 0;

  // Question loop (simplified)
  for (let i = 0; i < modeConfig.civicsQuestionCount; i++) {
    coach.questionAsked();

    // Get user response (from UI input)
    const userResponse = await getUserInput();
    messages.push({ role: 'user', content: userResponse, timestamp: new Date() });

    // Analyze with coach
    const insights = coach.analyzeResponse(userResponse, lastQuestion);
    insights.forEach(insight => {
      if (insight.type === 'positive') console.log(`✓ ${insight.message}`);
      else if (insight.severity === 'high') console.warn(`⚠ ${insight.message}`);
    });

    // Get AI response
    const response = await interviewSimulator.sendMessage(userResponse);
    messages.push({ role: 'assistant', content: response, timestamp: new Date() });
    await voice.speak(response);

    // Track score (determine if correct)
    const wasCorrect = checkAnswer(userResponse, expectedAnswer);
    if (wasCorrect) correctAnswers++;
    totalQuestions++;
  }

  // 4. END INTERVIEW
  await voice.speak("That concludes our interview. Thank you.");
  const endTime = new Date();

  // 5. GET FEEDBACK
  const feedback = await interviewSimulator.getFeedback();

  // 6. ANALYZE SESSION
  const analysis = SessionAnalyzer.analyzeSession(
    messages,
    coach.getAllInsights(),
    correctAnswers,
    totalQuestions,
    startTime,
    endTime
  );

  // 7. SAVE SESSION
  await SessionAnalyticsService.saveSession(analysis, mode, difficulty, scenario);

  // 8. GENERATE RECOMMENDATIONS
  const recommendations = generateCoachingRecommendations(analysis);

  // 9. DISPLAY RESULTS
  console.log('\n=== INTERVIEW COMPLETE ===');
  console.log(`Score: ${analysis.performanceMetrics.overallReadiness}/100`);
  console.log(`Readiness: ${analysis.readinessLevel}`);
  console.log(`Pass Probability: ${analysis.predictedPassProbability}%`);

  console.log('\nSTRENGTHS:');
  analysis.strengths.forEach(s => console.log(`✓ ${s}`));

  console.log('\nIMPROVEMENT AREAS:');
  analysis.improvementAreas.forEach(area => {
    console.log(`\n${area.area} [${area.priority.toUpperCase()}]`);
    console.log(`Current: ${area.currentLevel}/100 → Target: ${area.targetLevel}/100`);
    area.recommendations.forEach(rec => console.log(`  • ${rec}`));
  });

  // 10. CLEANUP
  await voice.stop();
}

// Helper functions
async function getUserInput() {
  // Get from UI input
  return "Mock user response";
}

function checkAnswer(userResponse, expectedAnswer) {
  // Implement answer checking logic
  return true;
}
```

---

## UI Component Examples

### Example 22: Mode Selection Screen

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { INTERVIEW_MODES } from '../services/interviewModes';

export function ModeSelectionScreen({ onSelectMode }) {
  return (
    <View>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Choose Interview Mode
      </Text>

      {Object.values(INTERVIEW_MODES).map(mode => (
        <TouchableOpacity
          key={mode.id}
          style={{
            padding: 20,
            margin: 10,
            backgroundColor: mode.color,
            borderRadius: 12
          }}
          onPress={() => onSelectMode(mode.id)}
        >
          <Text style={{ fontSize: 32 }}>{mode.icon}</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFF' }}>
            {mode.name}
          </Text>
          <Text style={{ fontSize: 14, color: '#FFF', opacity: 0.9 }}>
            {mode.description}
          </Text>
          <Text style={{ fontSize: 12, color: '#FFF', marginTop: 8 }}>
            Duration: {mode.duration} minutes • {mode.civicsQuestionCount} questions
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

### Example 23: Coaching Insights Display

```typescript
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { CoachingInsight } from '../services/interviewCoaching';

export function CoachingInsightsPanel({ insights }: { insights: CoachingInsight[] }) {
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#3B82F6';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return '✓';
      case 'warning': return '⚠';
      case 'critical': return '✗';
      default: return 'ℹ';
    }
  };

  return (
    <ScrollView style={{ maxHeight: 200, backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8 }}>
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
        Live Coaching
      </Text>

      {insights.slice(-5).reverse().map((insight, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            padding: 8,
            marginBottom: 6,
            backgroundColor: '#FFF',
            borderLeftWidth: 3,
            borderLeftColor: getInsightColor(insight.type),
            borderRadius: 4
          }}
        >
          <Text style={{ marginRight: 8, fontSize: 16 }}>
            {getInsightIcon(insight.type)}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>
              {insight.category.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={{ fontSize: 13, color: '#6B7280' }}>
              {insight.message}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
```

### Example 24: Progress Dashboard

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SessionAnalyticsService } from '../services/sessionAnalytics';

export function ProgressDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const data = await SessionAnalyticsService.getOverallStatistics();
    setStats(data);
  }

  if (!stats) return <Text>Loading...</Text>;

  const getReadinessColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getReadinessLabel = (score: number) => {
    if (score >= 90) return 'Very Ready ⭐';
    if (score >= 80) return 'Ready ✓';
    if (score >= 70) return 'Almost Ready';
    if (score >= 50) return 'Needs Practice';
    return 'Not Ready';
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Your Progress
      </Text>

      {/* Readiness Score */}
      <View style={{
        backgroundColor: getReadinessColor(stats.readinessScore),
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20
      }}>
        <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#FFF' }}>
          {stats.readinessScore}
        </Text>
        <Text style={{ fontSize: 18, color: '#FFF' }}>
          {getReadinessLabel(stats.readinessScore)}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <StatCard
          icon="📊"
          label="Sessions"
          value={stats.totalSessions}
        />
        <StatCard
          icon="⏱"
          label="Practice Time"
          value={`${Math.round(stats.totalPracticeTime)} min`}
        />
        <StatCard
          icon="🎯"
          label="Accuracy"
          value={`${stats.overallAccuracy.toFixed(1)}%`}
        />
        <StatCard
          icon="🔥"
          label="Streak"
          value={`${stats.currentStreak} days`}
        />
      </View>
    </View>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <View style={{
      flex: 1,
      minWidth: 150,
      backgroundColor: '#FFF',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center'
    }}>
      <Text style={{ fontSize: 32 }}>{icon}</Text>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: '#6B7280' }}>
        {label}
      </Text>
    </View>
  );
}
```

---

## Conclusion

These examples demonstrate how to integrate all components of the AI Interview Enhancement System. The system is designed to be:

- **Easy to integrate** - Clear APIs and type safety
- **Flexible** - Customizable for different use cases
- **Powerful** - Comprehensive features for complete preparation
- **User-friendly** - Intuitive UI components and feedback

Use these examples as starting points for building the best citizenship interview preparation app!
