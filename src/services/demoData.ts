// Demo Mode Data - Realistic mock responses for AI features
// This allows users to experience the full app without API keys

import { AIFeedback, PronunciationError } from '../types';

// Interview Conversation Flows
export const DEMO_INTERVIEW_FLOWS = {
  greeting: [
    "Good morning! Please raise your right hand. Do you swear to tell the truth, the whole truth, and nothing but the truth?",
    "Good afternoon. Welcome to your naturalization interview. Please raise your right hand and take the oath to tell the truth.",
    "Hello and welcome. Let's begin by having you take the oath. Please raise your right hand. Do you promise to tell the truth during this interview?",
  ],

  responses: [
    // Civics questions
    {
      triggers: ["yes", "i do", "i swear", "oath"],
      responses: [
        "Thank you. Please have a seat. Let's start with some civics questions. What is the supreme law of the land?",
        "Very good. Please be seated. We'll begin with the civics portion of the test. Can you tell me what the Constitution does?",
        "Excellent. Let's get started. First question: What do we call the first ten amendments to the Constitution?",
      ]
    },
    // Constitution answers
    {
      triggers: ["constitution", "supreme law"],
      responses: [
        "Correct! Next question: How many amendments does the Constitution have?",
        "That's right. Now, what is an amendment?",
        "Very good. Let me ask you this: The idea of self-government is in the first three words of the Constitution. What are these words?",
      ]
    },
    // Amendment count
    {
      triggers: ["27", "twenty-seven", "twenty seven"],
      responses: [
        "Perfect! Now let's talk about rights. What is one right or freedom from the First Amendment?",
        "Excellent. What do we call the first ten amendments to the Constitution?",
        "That's correct. Can you name two rights in the Declaration of Independence?",
      ]
    },
    // Rights answers
    {
      triggers: ["speech", "religion", "assembly", "press", "petition"],
      responses: [
        "Very good! Let's move to some history questions. Who wrote the Declaration of Independence?",
        "Correct. Now, when was the Declaration of Independence adopted?",
        "Excellent. What did the Declaration of Independence do?",
      ]
    },
    // History answers
    {
      triggers: ["jefferson", "thomas jefferson", "1776", "july"],
      responses: [
        "That's right. Now let's discuss your N-400 application. I see you've been a permanent resident since [date]. Can you tell me about your employment during this time?",
        "Correct! Let me review your application now. Have you traveled outside the United States in the past five years?",
        "Very good. Looking at your application, can you explain why you want to become a U.S. citizen?",
      ]
    },
    // N-400 discussion
    {
      triggers: ["work", "job", "employed", "company", "yes", "no", "citizen", "america"],
      responses: [
        "I understand. Have you ever been arrested or convicted of a crime?",
        "Thank you for that information. Do you understand the oath of allegiance?",
        "Good. Are you willing to take the full oath of allegiance to the United States?",
      ]
    },
    // Final questions
    {
      triggers: ["no crime", "never", "yes", "willing", "understand"],
      responses: [
        "Excellent. Let's do the reading test now. Please read this sentence out loud: 'Who can vote?'",
        "Very good. For the writing test, I'll say a sentence and you write it down. Ready? Write: 'Citizens can vote.'",
        "Perfect. Now I need you to sign your name here on the application to confirm the information is correct.",
      ]
    },
    // Completion
    {
      triggers: ["who can vote", "citizens", "signed", "signature"],
      responses: [
        "Excellent work today. Based on your performance, I'm recommending you for approval. You should receive your oath ceremony notice in 2-4 weeks. Congratulations!",
        "Very good! You've done well on all parts of the test. I'll be recommending approval of your application. You'll receive notification about your oath ceremony soon.",
        "Great job! You passed the English and civics requirements. Your application will be approved, and you'll get a letter about your naturalization ceremony. Well done!",
      ]
    },
  ],

  // Generic fallbacks
  fallbacks: [
    "I see. Can you elaborate on that a bit more?",
    "Interesting. Tell me more about that.",
    "Could you please repeat that? I want to make sure I understand correctly.",
    "That's helpful to know. Let's continue with the next question.",
    "I appreciate you sharing that. Let's move forward.",
  ]
};

// Interview Feedback Templates
export const DEMO_INTERVIEW_FEEDBACK: AIFeedback[] = [
  {
    overallScore: 92,
    englishSpeakingScore: 90,
    civicsAccuracy: 95,
    areasForImprovement: [
      "Practice speaking more slowly and clearly",
      "Review questions about the judicial branch",
      "Work on expanding your answers with more detail"
    ],
    strengths: [
      "Excellent knowledge of the Constitution",
      "Clear pronunciation and good vocabulary",
      "Confident and well-prepared responses",
      "Good understanding of U.S. history"
    ],
    detailedFeedback: "You performed exceptionally well in this practice interview. Your civics knowledge is strong, particularly regarding the Constitution and American government structure. Your English speaking ability is clear and understandable - the USCIS officer will have no trouble communicating with you. To further improve, focus on speaking at a moderate pace and providing slightly more detailed answers when discussing your N-400 application. Overall, you're well-prepared for your actual interview. Keep practicing and you'll do great!"
  },
  {
    overallScore: 85,
    englishSpeakingScore: 82,
    civicsAccuracy: 88,
    areasForImprovement: [
      "Review questions about the legislative branch",
      "Practice pronunciation of government terms",
      "Prepare more detailed answers about your N-400 application"
    ],
    strengths: [
      "Good understanding of American history",
      "Willing to ask for clarification when needed",
      "Honest and straightforward responses",
      "Strong motivation to become a citizen"
    ],
    detailedFeedback: "You demonstrated solid preparation for the naturalization interview. Your civics knowledge is good, though reviewing a few more questions about Congress and the legislative process would be beneficial. Your English is understandable, which is the key requirement - remember, USCIS focuses on whether they can communicate with you, not on perfect grammar or accent. Consider practicing answers about your work history and reasons for wanting citizenship, as these personal questions often come up. You're on the right track - keep studying!"
  },
  {
    overallScore: 78,
    englishSpeakingScore: 75,
    civicsAccuracy: 82,
    areasForImprovement: [
      "Study more civics questions, especially about holidays and symbols",
      "Practice speaking English more frequently",
      "Review your N-400 application thoroughly before the interview",
      "Work on answering questions with complete sentences"
    ],
    strengths: [
      "Basic civics knowledge is developing well",
      "Enthusiastic and positive attitude",
      "Willing to learn and improve",
      "Understood most questions correctly"
    ],
    detailedFeedback: "You're making good progress in your preparation. Your civics knowledge shows promise, but spending more time with the 100 civics questions will help build your confidence. Your English communication is functional - the officer could understand you, which is what matters most. Focus on practicing speaking out loud, not just reading silently. Review each section of your N-400 application and practice explaining your work history, addresses, and travel. Remember, the interview is also evaluating if you can handle the English requirement, so practice is key. With more preparation, you'll be ready!"
  }
];

// Speech Practice Mock Transcriptions
export const DEMO_TRANSCRIPTIONS: { [key: string]: { transcription: string; errors: PronunciationError[] } } = {
  "The Constitution": {
    transcription: "The Constitution",
    errors: []
  },
  "Sets up the government, defines the government, protects basic rights of Americans": {
    transcription: "Sets up the government, defines the government, protects basic rights of Americans",
    errors: []
  },
  "We the People": {
    transcription: "We the People",
    errors: []
  },
  "A change to the Constitution, an addition to the Constitution": {
    transcription: "A change to the Constitution, an addition to the Constitution",
    errors: []
  },
  "The Bill of Rights": {
    transcription: "The Bill of Rights",
    errors: []
  },
  "Speech, religion, assembly, press, petition the government": {
    transcription: "Speech, religion, assembly, press, petition the government",
    errors: [
      {
        word: "assembly",
        attemptedPronunciation: "ah-SEM-lee",
        correctPronunciation: "uh-SEM-blee",
        severity: "minor",
        suggestion: "The first syllable sounds like 'uh' not 'ah'. Practice: uh-SEM-blee. This is a very minor difference and wouldn't affect your interview."
      }
    ]
  },
  "Twenty-seven (27)": {
    transcription: "Twenty seven",
    errors: []
  },
  "Announced our independence from Great Britain, declared our independence from Great Britain": {
    transcription: "Announced our independence from Great Britain",
    errors: []
  },
  "Life, liberty, pursuit of happiness": {
    transcription: "Life, liberty, pursuit of happiness",
    errors: []
  },
  "You can practice any religion, or not practice a religion": {
    transcription: "You can practice any religion, or not practice a religion",
    errors: []
  }
};

// N-400 Term Explanations (20+ pre-written)
export interface DemoExplanation {
  term: string;
  explanation: string;
  translatedExplanations?: { [languageCode: string]: string };
}

export const DEMO_N400_EXPLANATIONS: DemoExplanation[] = [
  {
    term: "Naturalization",
    explanation: "Naturalization is the process of becoming a U.S. citizen if you were born outside the United States. Think of it like 'officially joining the American family.' After living in the U.S. as a permanent resident (green card holder) for several years, you can apply to become a full citizen with all the rights and responsibilities that come with it, including the right to vote."
  },
  {
    term: "Oath of Allegiance",
    explanation: "The Oath of Allegiance is a promise you make at the very end of the naturalization process. It's like a pledge where you promise to be loyal to the United States, follow its laws, and defend the country if needed. You take this oath at a special ceremony, and it's the final step before you officially become a U.S. citizen. The oath includes giving up loyalty to other countries and promising to support the U.S. Constitution."
  },
  {
    term: "Good Moral Character",
    explanation: "Good Moral Character means being an honest, law-abiding person. USCIS wants to know that you follow the rules, pay your taxes, don't commit crimes, and are a responsible member of society. Think of it as proving you're a 'good person' who will be a positive addition to the country. They look at your behavior during the 5 years before you apply (3 years if you're married to a U.S. citizen)."
  },
  {
    term: "Continuous Residence",
    explanation: "Continuous Residence means you've lived in the United States without taking long trips outside the country. For naturalization, you need to live in the U.S. for at least 5 years continuously (or 3 years if married to a U.S. citizen). If you leave the U.S. for more than 6 months at a time, it might 'break' your continuous residence, and you may need to start counting the years over again. Short trips and vacations are usually fine."
  },
  {
    term: "Physical Presence",
    explanation: "Physical Presence means the actual number of days you've been physically inside the United States. For naturalization, you need to be physically present in the U.S. for at least half of the required time period - that's 30 months out of 5 years (or 18 months out of 3 years if married to a U.S. citizen). This is counted by adding up all your days in the U.S., including short stays. It's different from continuous residence."
  },
  {
    term: "Lawful Permanent Resident",
    explanation: "A Lawful Permanent Resident (LPR) is someone who has been given permission to live and work in the United States permanently. This is also called having a 'green card.' As an LPR, you can live in the U.S. indefinitely, work any legal job, and have many of the same rights as citizens - but you cannot vote in federal elections. Being an LPR for a certain number of years is required before you can apply for citizenship."
  },
  {
    term: "Biometrics Appointment",
    explanation: "A Biometrics Appointment is when you go to a USCIS office to have your fingerprints, photo, and signature taken. Think of it like getting your picture and fingerprints taken at the DMV, but for immigration purposes. USCIS uses this information to run background checks and create your permanent record. This appointment usually happens a few weeks after you submit your N-400 application and takes about 20-30 minutes."
  },
  {
    term: "Interview Process",
    explanation: "The Interview Process is a meeting with a USCIS officer where they review your application and test your English and civics knowledge. It's like a combination of a conversation and a test. The officer will ask you questions about your N-400 form (like your work history and travel), test your ability to read and write English, and ask you civics questions about U.S. history and government. The interview usually takes 15-30 minutes, and the officer will tell you at the end whether they're recommending approval."
  },
  {
    term: "Civic Knowledge",
    explanation: "Civic Knowledge means understanding basic facts about U.S. history, government, and how the country works. For the citizenship test, you need to study 100 civics questions (or 128 questions starting in 2025). Topics include the Constitution, the branches of government, American history, and current government leaders. During your interview, the officer will ask you up to 10 questions, and you need to answer 6 correctly to pass."
  },
  {
    term: "English Proficiency",
    explanation: "English Proficiency means your ability to understand, speak, read, and write basic English. For naturalization, you don't need perfect English - you just need to be able to communicate at a basic level. USCIS will test your speaking ability during the interview conversation, ask you to read one simple sentence correctly, and have you write one simple sentence. Some applicants over 50 or 65 years old with many years as permanent residents may be exempt from the English requirement."
  },
  {
    term: "Form N-400",
    explanation: "Form N-400 is the official 'Application for Naturalization' - it's the main form you fill out to apply for U.S. citizenship. It's a long form (about 20 pages) that asks detailed questions about your background, where you've lived, your work history, your family, your trips outside the U.S., and whether you've had any legal problems. Think of it as your complete biography for USCIS. You must answer all questions truthfully because you'll review these answers during your interview."
  },
  {
    term: "USCIS",
    explanation: "USCIS stands for U.S. Citizenship and Immigration Services. It's the government agency that handles all immigration matters, including citizenship applications, green cards, work permits, and more. Think of USCIS as the 'immigration office' of the U.S. government. They process your N-400 application, conduct your interview, and approve or deny your citizenship application. USCIS is part of the Department of Homeland Security."
  },
  {
    term: "Green Card",
    explanation: "A Green Card is the common name for a Permanent Resident Card. It's a plastic card that proves you have permission to live and work permanently in the United States. Even though it's called a 'green card,' newer versions are actually different colors. Your green card has your photo, name, and an expiration date (usually 10 years). Having a green card for several years is required before you can apply to become a citizen."
  },
  {
    term: "Deportation",
    explanation: "Deportation (also called 'removal') is when the U.S. government forces someone to leave the country and return to their home country. This can happen if someone violates immigration laws, commits certain crimes, or entered the country illegally. Even permanent residents (green card holders) can be deported for serious crimes or immigration violations. As part of your N-400 application, you must answer questions about your criminal history to show you're not at risk of deportation."
  },
  {
    term: "Asylum",
    explanation: "Asylum is protection that the United States gives to people who have fled their home country because they face persecution or danger. If someone fears being harmed because of their race, religion, nationality, political opinion, or membership in a particular social group, they can apply for asylum. People granted asylum can eventually apply for a green card and later citizenship. Your N-400 form asks if you've ever applied for asylum."
  },
  {
    term: "Selective Service",
    explanation: "Selective Service is a system that requires almost all male U.S. citizens and male immigrants (including green card holders) to register with the government between ages 18-26. It's basically a list of people who could be called for military service if there was ever a draft. Even though there's no draft now, males must register by law. On your N-400 form, you'll need to show proof you registered if you were required to. Failing to register when required can affect your naturalization."
  },
  {
    term: "Conditional Residence",
    explanation: "Conditional Residence is a temporary 2-year green card that some people get, usually if they got their green card through a recent marriage to a U.S. citizen or through investment. It's called 'conditional' because you must prove after 2 years that the marriage is real (or that the investment conditions were met) to remove the conditions and get a permanent 10-year green card. You can only apply for citizenship after the conditions are removed."
  },
  {
    term: "Adjustment of Status",
    explanation: "Adjustment of Status is the process of applying for a green card while you're already inside the United States, rather than applying from your home country. It's called an 'adjustment' because you're changing (adjusting) your legal status from temporary visitor or refugee to permanent resident. Many people who later become citizens first went through adjustment of status to get their green card."
  },
  {
    term: "Naturalization Ceremony",
    explanation: "The Naturalization Ceremony is the final celebration where you officially become a U.S. citizen! After your interview is approved, you'll receive an invitation to a ceremony (sometimes the same day, sometimes weeks later). At the ceremony, you'll take the Oath of Allegiance along with other new citizens, receive your Certificate of Naturalization, and often hear speeches welcoming you. It's an emotional and proud moment - many people bring family to celebrate."
  },
  {
    term: "Certificate of Naturalization",
    explanation: "A Certificate of Naturalization is the official document that proves you're a U.S. citizen. You receive it at your naturalization ceremony after taking the Oath of Allegiance. This certificate is very important - it's legal proof of your citizenship. You'll need it to apply for a U.S. passport, and you should keep it in a safe place. Unlike a green card, it doesn't expire and doesn't need to be renewed."
  },
  {
    term: "Priority Date",
    explanation: "Priority Date is the date when USCIS officially receives your immigration petition or application. Think of it as 'getting in line' - your priority date marks your place in line for processing. For naturalization (N-400), your priority date is when USCIS receives your complete application. This date is important because it's used to track how long your application has been pending and estimate when it will be processed."
  },
  {
    term: "Affidavit of Support",
    explanation: "An Affidavit of Support is a legal document where someone (usually a U.S. citizen or permanent resident) promises to financially support an immigrant if needed. It's like a contract saying 'I will help support this person so they won't need government assistance.' While this is more common for family-based green cards, you may be asked about it on your N-400 if someone sponsored you for your green card. It shows you have financial support in the U.S."
  },
  {
    term: "Removal Proceedings",
    explanation: "Removal Proceedings are legal court processes to decide if someone should be deported from the United States. It's like a trial where an immigration judge hears evidence and decides if the person can stay in the U.S. or must leave. Your N-400 application asks if you've ever been in removal proceedings because it's important for USCIS to know your full immigration history. Being in removal proceedings can affect your citizenship application."
  },
  {
    term: "Exemption",
    explanation: "An Exemption is a special exception to a requirement. For naturalization, some people qualify for exemptions from certain requirements. For example: people over 50 who have been permanent residents for 20+ years may be exempt from the English test, or people with disabilities may be exempt from the civics test. Exemptions recognize that not everyone can meet every requirement, and provide alternative ways to qualify for citizenship."
  },
  {
    term: "Accommodation",
    explanation: "An Accommodation is a modification or assistance provided to applicants with disabilities or special needs during the naturalization process. For example, if you have hearing loss, USCIS can provide sign language interpreters. If you have a physical disability, they can arrange a wheelchair-accessible interview location. If you have a mental disability, you might take a simplified civics test. You request accommodations on Form N-648 (Disability Exception) when you apply."
  }
];

// Helper function to get a random item from an array
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to simulate typing delay
export async function simulateTypingDelay(text: string): Promise<void> {
  // Simulate realistic typing speed: 50-100ms per character
  const baseDelay = 800; // Base delay
  const charDelay = text.length * 2; // 2ms per character
  const totalDelay = Math.min(baseDelay + charDelay, 2500); // Max 2.5 seconds

  return new Promise(resolve => setTimeout(resolve, totalDelay));
}

// Function to find best matching response based on user input
export function findBestInterviewResponse(userInput: string, conversationLength: number): string {
  const lowerInput = userInput.toLowerCase().trim();

  // If this is the first message (start), return greeting
  if (conversationLength === 0) {
    return getRandomItem(DEMO_INTERVIEW_FLOWS.greeting);
  }

  // Check all response patterns
  for (const pattern of DEMO_INTERVIEW_FLOWS.responses) {
    for (const trigger of pattern.triggers) {
      if (lowerInput.includes(trigger.toLowerCase())) {
        return getRandomItem(pattern.responses);
      }
    }
  }

  // If no match found, use fallback
  return getRandomItem(DEMO_INTERVIEW_FLOWS.fallbacks);
}

// Function to get demo explanation
export function getDemoExplanation(term: string, language: string = 'en'): string {
  const explanation = DEMO_N400_EXPLANATIONS.find(
    e => e.term.toLowerCase() === term.toLowerCase()
  );

  if (!explanation) {
    return `[DEMO] "${term}" is an important immigration and citizenship term. In a real application, you would receive a detailed explanation here from Google Gemini AI in ${language === 'en' ? 'English' : 'your selected language'}. This demo mode provides sample explanations to help you understand how the feature works.\n\nTo get real, personalized explanations in 15+ languages, please add your Gemini API key in Settings.`;
  }

  let response = `[DEMO] ${explanation.explanation}`;

  // Add language note if not English
  if (language !== 'en') {
    response += `\n\n(In a real session, this explanation would be translated to your selected language using Google Gemini AI. Add your API key in Settings to enable real translations.)`;
  }

  return response;
}

// Function to get demo transcription and pronunciation feedback
export function getDemoTranscription(expectedText: string): { transcription: string; errors: PronunciationError[] } {
  // Check if we have a pre-made demo for this text
  const demo = DEMO_TRANSCRIPTIONS[expectedText];
  if (demo) {
    return demo;
  }

  // Generate a generic successful transcription
  return {
    transcription: expectedText,
    errors: []
  };
}
