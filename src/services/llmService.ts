// LLM Service for AI Features with Intelligent Demo Mode
import { AIMessage, AIFeedback, PronunciationError } from '../types';
import { apiKeyService } from './apiKeyService';
import {
  findBestInterviewResponse,
  simulateTypingDelay,
  getDemoExplanation,
  getDemoTranscription,
  getRandomItem,
  DEMO_INTERVIEW_FEEDBACK,
} from './demoData';

// Get API keys - will be loaded dynamically
let OPENAI_API_KEY = '';
let GEMINI_API_KEY = '';

// Initialize API keys
async function loadAPIKeys() {
  const [openaiKey, geminiKey] = await Promise.all([
    apiKeyService.getOpenAIKey(),
    apiKeyService.getGeminiKey(),
  ]);
  OPENAI_API_KEY = openaiKey || '';
  GEMINI_API_KEY = geminiKey || '';
}

// Load keys on module import
loadAPIKeys();

// OpenAI GPT-4 Interview Simulator with Demo Mode
export class InterviewSimulator {
  private conversationHistory: AIMessage[] = [];
  private isDemoMode: boolean = false;
  private systemPrompt = `You are a professional USCIS officer conducting a naturalization interview. Your role is to:

1. Greet the applicant warmly and professionally
2. Evaluate their English speaking ability throughout the conversation (from the first greeting)
3. Ask civics questions from the official 100/128-question list
4. Review their N-400 application with follow-up questions
5. Ask reading and writing test questions
6. Provide a realistic interview experience

Guidelines:
- Be encouraging and professional
- Speak clearly and at a moderate pace
- Rephrase questions if the applicant doesn't understand
- Don't penalize for accents - only evaluate if meaning is clear
- Minor grammatical errors that don't affect meaning should be ignored
- Ask follow-up questions naturally based on their answers
- Complete the interview in 15-20 minutes (simulated)

Remember: The interview should feel realistic but supportive to reduce anxiety.`;

  async startInterview(): Promise<string> {
    // Reload API keys
    await loadAPIKeys();

    // Check if we should use demo mode
    this.isDemoMode = await apiKeyService.shouldUseDemoMode('openai');

    if (this.isDemoMode) {
      // DEMO MODE: Return realistic greeting
      const greeting = findBestInterviewResponse('', 0);
      const demoGreeting = `[DEMO] ${greeting}`;

      this.conversationHistory = [
        {
          role: 'system',
          content: this.systemPrompt,
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: demoGreeting,
          timestamp: new Date(),
        },
      ];

      return demoGreeting;
    }

    // REAL MODE: Initialize conversation with system prompt
    this.conversationHistory = [
      {
        role: 'system',
        content: this.systemPrompt,
        timestamp: new Date(),
      },
    ];

    // Get first greeting from AI
    try {
      const greeting = await this.sendMessage('Begin the naturalization interview');
      return greeting;
    } catch (error) {
      throw new Error(
        apiKeyService.getAPIErrorMessage('openai', error instanceof Error ? error.message : 'UNKNOWN_ERROR')
      );
    }
  }

  async sendMessage(userMessage: string): Promise<string> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    if (this.isDemoMode) {
      // DEMO MODE: Generate intelligent response
      await simulateTypingDelay(userMessage);

      const response = findBestInterviewResponse(
        userMessage,
        this.conversationHistory.length
      );
      const demoResponse = `[DEMO] ${response}`;

      this.conversationHistory.push({
        role: 'assistant',
        content: demoResponse,
        timestamp: new Date(),
      });

      return demoResponse;
    }

    // REAL MODE: Call OpenAI API
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: this.conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content.replace('[DEMO] ', ''),
          })),
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date(),
      });

      return assistantMessage;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  async getFeedback(): Promise<AIFeedback> {
    if (this.isDemoMode) {
      // DEMO MODE: Return realistic feedback
      await simulateTypingDelay('feedback');
      return getRandomItem(DEMO_INTERVIEW_FEEDBACK);
    }

    // REAL MODE: Request detailed feedback from AI
    const feedbackPrompt = `Based on this interview conversation, provide detailed feedback in JSON format:
{
  "overallScore": 0-100,
  "englishSpeakingScore": 0-100,
  "civicsAccuracy": 0-100,
  "areasForImprovement": ["area1", "area2"],
  "strengths": ["strength1", "strength2"],
  "detailedFeedback": "comprehensive paragraph"
}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            ...this.conversationHistory,
            { role: 'user', content: feedbackPrompt },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      const feedbackText = data.choices[0].message.content;

      // Parse JSON feedback
      const feedback: AIFeedback = JSON.parse(feedbackText);
      return feedback;
    } catch (error) {
      console.error('Error getting feedback:', error);
      // Return default feedback if parsing fails
      return {
        overallScore: 75,
        englishSpeakingScore: 75,
        civicsAccuracy: 75,
        areasForImprovement: ['Continue practicing speaking', 'Review civics questions'],
        strengths: ['Good effort', 'Positive attitude'],
        detailedFeedback: 'You did well overall. Keep practicing!',
      };
    }
  }

  getConversationHistory(): AIMessage[] {
    return this.conversationHistory;
  }

  isDemoSession(): boolean {
    return this.isDemoMode;
  }
}

// Whisper Speech-to-Text Service with Demo Mode
export class SpeechRecognitionService {
  private isDemoMode: boolean = false;

  async transcribe(audioBlob: Blob, language: string = 'en'): Promise<string> {
    // Reload API keys
    await loadAPIKeys();
    this.isDemoMode = await apiKeyService.shouldUseDemoMode('openai');

    if (this.isDemoMode) {
      // DEMO MODE: Return simulated transcription
      await simulateTypingDelay('transcription');
      return '[DEMO] This is a simulated transcription. Your pronunciation sounds good!';
    }

    // REAL MODE: Call Whisper API
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');
      formData.append('language', language);

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }

  async analyzePronunciation(
    audioBlob: Blob,
    expectedText: string
  ): Promise<PronunciationError[]> {
    await loadAPIKeys();
    this.isDemoMode = await apiKeyService.shouldUseDemoMode('openai');

    if (this.isDemoMode) {
      // DEMO MODE: Return realistic pronunciation feedback
      await simulateTypingDelay('analysis');
      const demoResult = getDemoTranscription(expectedText);
      return demoResult.errors;
    }

    // REAL MODE: Transcribe and analyze with GPT-4
    try {
      // First, get transcription
      const transcribedText = await this.transcribe(audioBlob);

      // Use GPT-4 to analyze pronunciation differences
      const analysisPrompt = `Compare the expected text with what was transcribed and identify pronunciation errors:

Expected: "${expectedText}"
Transcribed: "${transcribedText}"

Return JSON array of pronunciation errors:
[
  {
    "word": "word with error",
    "attemptedPronunciation": "how it sounded",
    "correctPronunciation": "correct pronunciation",
    "severity": "minor|moderate|critical",
    "suggestion": "helpful tip"
  }
]

Only include errors that affect meaning. Minor accent differences should be ignored per USCIS policy.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: analysisPrompt }],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      const analysisText = data.choices[0].message.content;

      // Parse pronunciation errors
      const errors: PronunciationError[] = JSON.parse(analysisText);
      return errors;
    } catch (error) {
      console.error('Error analyzing pronunciation:', error);
      return [];
    }
  }

  isDemoSession(): boolean {
    return this.isDemoMode;
  }
}

// Google Gemini N-400 Assistant with Demo Mode
export class N400Assistant {
  private isDemoMode: boolean = false;

  async explainTerm(term: string, userLanguage: string = 'en'): Promise<string> {
    // Reload API keys
    await loadAPIKeys();
    this.isDemoMode = await apiKeyService.shouldUseDemoMode('gemini');

    if (this.isDemoMode) {
      // DEMO MODE: Return pre-written explanation
      await simulateTypingDelay(term);
      return getDemoExplanation(term, userLanguage);
    }

    // REAL MODE: Call Gemini API
    try {
      const prompt = `Explain this N-400 application term in simple language${
        userLanguage !== 'en' ? ` and translate to ${userLanguage}` : ''
      }: "${term}"

Provide a clear, concise explanation that an English learner can understand.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 300,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const explanation = data.candidates[0].content.parts[0].text;
      return explanation;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  async generateN400Questions(n400Data: any): Promise<string[]> {
    await loadAPIKeys();
    this.isDemoMode = await apiKeyService.shouldUseDemoMode('gemini');

    if (this.isDemoMode) {
      // DEMO MODE: Return sample questions
      return [
        '[DEMO] Tell me about your employment history.',
        '[DEMO] Have you traveled outside the United States in the past 5 years?',
        '[DEMO] Why do you want to become a U.S. citizen?',
        '[DEMO] Do you understand the oath of allegiance?',
        '[DEMO] Have you ever been arrested or convicted of a crime?',
      ];
    }

    // REAL MODE: Generate with Gemini
    try {
      const prompt = `Based on this N-400 application data, generate 5 realistic questions a USCIS officer might ask during the interview:

${JSON.stringify(n400Data, null, 2)}

Return ONLY a JSON array of question strings, no other text.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      const data = await response.json();
      const questionsText = data.candidates[0].content.parts[0].text;

      // Parse JSON array of questions
      const questions: string[] = JSON.parse(questionsText);
      return questions;
    } catch (error) {
      console.error('Error generating N-400 questions:', error);
      return [
        'Tell me about your employment history.',
        'Have you traveled outside the United States in the past 5 years?',
        'Why do you want to become a U.S. citizen?',
        'Do you understand the oath of allegiance?',
        'Have you ever been arrested or convicted of a crime?',
      ];
    }
  }

  async generateExplanation(questionId: string, userLanguage: string = 'en'): Promise<string> {
    await loadAPIKeys();
    this.isDemoMode = await apiKeyService.shouldUseDemoMode('gemini');

    if (this.isDemoMode) {
      return `[DEMO] This would provide a detailed explanation of civics question #${questionId} in ${userLanguage}. Configure your Gemini API key for real explanations.`;
    }

    // REAL MODE: Generate explanation
    const prompt = `Generate a detailed, easy-to-understand explanation for this U.S. citizenship civics question (ID: ${questionId})${
      userLanguage !== 'en' ? ` in ${userLanguage}` : ''
    }. Include context, examples, and memory aids.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 400,
            },
          }),
        }
      );

      const data = await response.json();
      const explanation = data.candidates[0].content.parts[0].text;
      return explanation;
    } catch (error) {
      console.error('Error generating explanation:', error);
      return 'Unable to generate explanation at this time.';
    }
  }

  isDemoSession(): boolean {
    return this.isDemoMode;
  }
}

// Export service instances
export const interviewSimulator = new InterviewSimulator();
export const speechRecognition = new SpeechRecognitionService();
export const n400Assistant = new N400Assistant();

// Export helper to check if any feature is in demo mode
export async function getAIFeatureStatus() {
  const openaiAvailable = await apiKeyService.isFeatureAvailable('ai_interview');
  const geminiAvailable = await apiKeyService.isFeatureAvailable('n400_assistant');

  return {
    interview: {
      available: openaiAvailable,
      isDemoMode: !openaiAvailable,
    },
    speech: {
      available: openaiAvailable,
      isDemoMode: !openaiAvailable,
    },
    n400: {
      available: geminiAvailable,
      isDemoMode: !geminiAvailable,
    },
  };
}
