/**
 * Interview Scenarios Library - CitizenNow Enhanced
 *
 * Diverse applicant scenarios to provide realistic, contextual interview simulations.
 * Each scenario includes custom system prompts, relevant N-400 questions, and coaching focus areas.
 */

import { DifficultyLevel, InterviewPhase } from '../services/interviewModes';

export type ScenarioType =
  | 'first_time_standard'
  | 'first_time_nervous'
  | 'senior_65plus'
  | 'complex_travel'
  | 'employment_gaps'
  | 'name_change'
  | 'previous_visa_issues'
  | 'military_service'
  | 'multiple_marriages'
  | 'long_residence'
  | 'recent_arrival'
  | 'entrepreneur'
  | 'student_to_citizen';

export interface InterviewScenario {
  id: ScenarioType;
  name: string;
  description: string;
  applicantProfile: {
    ageRange: string;
    yearsInUS: string;
    background: string;
    challenges: string[];
    strengths: string[];
  };
  customSystemPrompt: string;
  n400FocusQuestions: string[];
  civicsQuestionPreferences?: {
    preferredCategories?: string[];
    avoidTopics?: string[];
    maxDifficulty?: DifficultyLevel;
  };
  coachingFocusAreas: string[];
  recommendedDifficulty: DifficultyLevel;
  specialConsiderations: string[];
  estimatedDuration: number; // minutes
  icon: string;
  color: string;
}

export const INTERVIEW_SCENARIOS: Record<ScenarioType, InterviewScenario> = {
  first_time_standard: {
    id: 'first_time_standard',
    name: 'Standard First-Time Applicant',
    description: 'Typical naturalization applicant with straightforward background',
    applicantProfile: {
      ageRange: '30-50',
      yearsInUS: '5-10 years',
      background: 'Employed professional with stable residence history',
      challenges: ['Some nervousness about interview process'],
      strengths: ['Good English skills', 'Well-prepared', 'Complete documentation'],
    },
    customSystemPrompt: `You are interviewing a first-time naturalization applicant who has been preparing diligently. They are somewhat nervous but confident in their knowledge. Be professional, clear, and encouraging. Follow standard USCIS interview protocol.

The applicant has:
- Lived in the US for 5-10 years
- Stable employment history
- No significant travel or legal issues
- Good English speaking ability
- Prepared well for the civics test

Conduct a thorough but supportive interview. Ask standard questions about their N-400 application, test their civics knowledge, and evaluate their English ability naturally through conversation.`,
    n400FocusQuestions: [
      'What is your current address?',
      'What is your current occupation?',
      'How long have you lived at your current address?',
      'Are you currently employed?',
      'Have you traveled outside the United States in the past 5 years?',
      'Why do you want to become a U.S. citizen?',
      'Do you understand the oath of allegiance?',
      'Have you ever failed to file a tax return since becoming a permanent resident?',
      'Have you ever claimed to be a U.S. citizen?',
      'Are you willing to take the full oath of allegiance?',
    ],
    civicsQuestionPreferences: {
      preferredCategories: ['american_government', 'american_history', 'integrated_civics'],
    },
    coachingFocusAreas: [
      'Managing interview nervousness',
      'Clear articulation of answers',
      'Confidence building',
      'Time management',
    ],
    recommendedDifficulty: 'intermediate',
    specialConsiderations: [
      'Typical interview length (15-20 minutes)',
      'Standard question progression',
      'Normal pacing',
    ],
    estimatedDuration: 18,
    icon: '👤',
    color: '#3B82F6',
  },

  first_time_nervous: {
    id: 'first_time_nervous',
    name: 'Nervous First-Timer',
    description: 'Applicant experiencing significant interview anxiety',
    applicantProfile: {
      ageRange: '25-45',
      yearsInUS: '5-8 years',
      background: 'Well-prepared but very anxious about the interview process',
      challenges: ['High anxiety', 'Fear of making mistakes', 'Tendency to overthink'],
      strengths: ['Good knowledge', 'Motivated', 'Prepared materials'],
    },
    customSystemPrompt: `You are interviewing a first-time applicant who is experiencing significant nervousness. While they know the material, their anxiety may affect their performance. Be extra patient, encouraging, and supportive.

Interview approach:
- Start with easy, confidence-building questions
- Speak slowly and clearly
- Provide reassurance when they hesitate
- Allow extra time for responses
- Rephrase questions if they seem confused
- Acknowledge their correct answers positively
- Maintain a warm, professional demeanor
- Help them relax while still conducting a thorough interview

Remember: Many applicants are nervous - this is normal. Your goal is to fairly evaluate them while helping them perform their best.`,
    n400FocusQuestions: [
      'Let\'s start with something simple - what is your full name?',
      'And your current address?',
      'What do you do for work?',
      'That sounds interesting. How long have you worked there?',
      'Why do you want to become a U.S. citizen? Take your time.',
      'Have you prepared for today\'s civics test?',
      'Do you have any questions before we begin the civics portion?',
      'Have you traveled outside the US recently?',
      'Do you understand what the oath of allegiance means?',
      'Are you ready to take the oath?',
    ],
    civicsQuestionPreferences: {
      preferredCategories: ['american_government'],
      maxDifficulty: 'intermediate',
    },
    coachingFocusAreas: [
      'Anxiety management techniques',
      'Deep breathing exercises',
      'Positive self-talk',
      'Focusing on preparation rather than perfection',
      'Building confidence through small successes',
    ],
    recommendedDifficulty: 'beginner',
    specialConsiderations: [
      'Allow extra time for responses',
      'Provide frequent reassurance',
      'Start with easiest questions first',
      'Be patient with hesitation',
    ],
    estimatedDuration: 22,
    icon: '😰',
    color: '#F59E0B',
  },

  senior_65plus: {
    id: 'senior_65plus',
    name: 'Senior (65+) Applicant',
    description: 'Applicant 65+ years old with 20+ years residence (special accommodations)',
    applicantProfile: {
      ageRange: '65+',
      yearsInUS: '20+ years',
      background: 'Long-time resident eligible for simplified civics test',
      challenges: ['May need questions repeated', 'Potential hearing difficulties'],
      strengths: ['Life experience in US', 'Strong community ties', 'Eligible for easier test'],
    },
    customSystemPrompt: `You are interviewing a senior applicant (65+) who has lived in the United States for over 20 years. They qualify for special accommodations:

1. CIVICS TEST: They may study only 20 designated questions (marked for 65+)
2. LANGUAGE: More lenient evaluation of English speaking ability
3. ACCOMMODATIONS:
   - Speak clearly and at a slower pace
   - Be prepared to repeat questions
   - Allow more time for responses
   - Be patient with processing time
   - Account for potential hearing difficulties

Maintain respect and dignity throughout the interview. This applicant has lived in the US for decades and deserves recognition of their contribution to their community. Focus on the 20 special civics questions and be supportive of their efforts.

Standard N-400 questions still apply, but be flexible with English fluency expectations.`,
    n400FocusQuestions: [
      'Good morning! How are you feeling today?',
      'I understand you\'ve lived in the United States for many years. How long exactly?',
      'Where do you currently live?',
      'Can you tell me about your family here in the US?',
      'Have you traveled outside the country recently?',
      'Why is becoming a citizen important to you after all these years?',
      'Do you understand the oath of allegiance?',
      'Are you willing to support and defend the Constitution?',
      'Do you have any questions for me?',
    ],
    civicsQuestionPreferences: {
      preferredCategories: ['american_government'],
      maxDifficulty: 'beginner',
    },
    coachingFocusAreas: [
      'Memorizing the 20 designated questions',
      'Speaking clearly despite nervousness',
      'Understanding accommodations available',
      'Confidence in life experience',
    ],
    recommendedDifficulty: 'beginner',
    specialConsiderations: [
      'Use only 20 designated civics questions',
      'Speak slowly and clearly',
      'Be prepared to repeat questions',
      'Show extra patience',
      'Acknowledge their long residence',
    ],
    estimatedDuration: 20,
    icon: '👴',
    color: '#8B5CF6',
  },

  complex_travel: {
    id: 'complex_travel',
    name: 'Complex Travel History',
    description: 'Applicant with extensive international travel requiring detailed review',
    applicantProfile: {
      ageRange: '30-55',
      yearsInUS: '5-7 years',
      background: 'Professional with frequent international travel for work or family',
      challenges: ['Multiple trips to document', 'Maintaining continuous residence'],
      strengths: ['Well-documented travel', 'Legitimate reasons', 'Strong US ties'],
    },
    customSystemPrompt: `You are interviewing an applicant with extensive international travel history. This requires careful review to ensure they maintained continuous residence and physical presence requirements.

Focus areas:
- Review travel dates and destinations carefully
- Ask about purpose of each major trip
- Verify they didn't break continuous residence (no trips over 6 months)
- Confirm they meet physical presence requirement (30+ months in US)
- Assess ties to the United States
- Evaluate if trips were temporary

Be thorough but not accusatory. Many applicants travel for legitimate work or family reasons. Your role is to verify compliance with naturalization requirements while being fair and professional.

After reviewing travel, proceed with standard civics test and other interview components.`,
    n400FocusQuestions: [
      'I see you\'ve traveled quite a bit in the past 5 years. Let\'s review your trips.',
      'Can you tell me about your trip to [country] from [dates]?',
      'What was the purpose of that trip?',
      'How long were you outside the United States?',
      'Did you maintain a residence in the US during this time?',
      'Where was your employment during this period?',
      'Did you file US taxes for all years you were a permanent resident?',
      'Do you have documentation of your travel dates?',
      'Despite the travel, do you consider the US your permanent home?',
      'Why do you want to become a US citizen?',
    ],
    coachingFocusAreas: [
      'Organizing travel documentation',
      'Calculating physical presence accurately',
      'Explaining travel purposes clearly',
      'Demonstrating US ties',
    ],
    recommendedDifficulty: 'intermediate',
    specialConsiderations: [
      'Detailed travel date review required',
      'Calculate physical presence during interview',
      'Verify continuous residence',
      'Document review critical',
    ],
    estimatedDuration: 25,
    icon: '✈️',
    color: '#06B6D4',
  },

  employment_gaps: {
    id: 'employment_gaps',
    name: 'Employment Gaps',
    description: 'Applicant with periods of unemployment requiring explanation',
    applicantProfile: {
      ageRange: '28-50',
      yearsInUS: '5-10 years',
      background: 'Applicant with gaps in employment history',
      challenges: ['Explaining unemployment periods', 'Demonstrating financial stability'],
      strengths: ['Currently employed', 'Valid reasons for gaps', 'Tax compliance'],
    },
    customSystemPrompt: `You are interviewing an applicant who has gaps in their employment history. This requires sensitive but thorough questioning to understand the circumstances while being respectful.

Approach:
- Ask about employment gaps professionally
- Allow them to explain circumstances (layoff, health, family care, education, etc.)
- Verify they filed taxes even during unemployment
- Confirm they didn't receive need-based public benefits without exception
- Assess current employment stability
- Be understanding of economic hardships

Employment gaps alone are NOT grounds for denial. Focus on:
1. Tax compliance
2. Public benefits (if any)
3. Current stability
4. Character assessment

After addressing employment, proceed with standard civics test and other requirements.`,
    n400FocusQuestions: [
      'Let\'s review your employment history. Where are you currently working?',
      'I see a gap in your employment from [dates]. Can you tell me about that period?',
      'Were you looking for work during that time?',
      'Did you file tax returns for those years?',
      'Did you receive any government benefits during unemployment?',
      'How did you support yourself financially?',
      'Are you currently employed full-time?',
      'How long have you been at your current job?',
      'Do you have any other sources of income?',
      'Have you paid all required taxes?',
    ],
    coachingFocusAreas: [
      'Preparing honest explanations for gaps',
      'Understanding tax filing requirements',
      'Knowing which benefits affect eligibility',
      'Documenting current employment',
    ],
    recommendedDifficulty: 'intermediate',
    specialConsiderations: [
      'Sensitive handling of employment gaps',
      'Verify tax compliance',
      'Review public benefits carefully',
      'Assess overall character, not just employment',
    ],
    estimatedDuration: 20,
    icon: '💼',
    color: '#84CC16',
  },

  name_change: {
    id: 'name_change',
    name: 'Name Change Applicant',
    description: 'Applicant requesting name change with naturalization',
    applicantProfile: {
      ageRange: '25-60',
      yearsInUS: '5-15 years',
      background: 'Seeking to legally change name as part of naturalization',
      challenges: ['Explaining reason for change', 'Consistency in documentation'],
      strengths: ['Clear desired name', 'Valid reasons', 'Prepared documents'],
    },
    customSystemPrompt: `You are interviewing an applicant who is requesting a legal name change as part of their naturalization. This is common and allowed, but requires verification.

Name change protocol:
1. Confirm their current legal name (as on green card)
2. Confirm their desired new name
3. Ask reason for name change (most reasons are acceptable)
4. Verify name isn't being changed for fraudulent purposes
5. Ensure they understand the name change process
6. Confirm spelling and proper format of new name

Common valid reasons:
- Americanizing a difficult-to-pronounce name
- Adopting a name used professionally
- Personal preference
- Cultural or religious reasons
- Removing names associated with past trauma

Continue with standard interview after addressing name change. The request should not affect other parts of the interview.`,
    n400FocusQuestions: [
      'I see you\'re requesting a name change. What is your current legal name?',
      'What name would you like to adopt?',
      'Can you spell the new name for the record?',
      'Why do you want to change your name?',
      'How long have you been using this name?',
      'Do you use this name professionally?',
      'Are you changing your name to avoid debts or legal obligations?',
      'Do you understand the name change will be part of your naturalization certificate?',
      'Will you use this name on all official documents going forward?',
      'Do you have any questions about the name change process?',
    ],
    coachingFocusAreas: [
      'Preparing clear explanation for name change',
      'Understanding name change procedure',
      'Spelling new name correctly',
      'Consistency in documents',
    ],
    recommendedDifficulty: 'intermediate',
    specialConsiderations: [
      'Verify spelling of new name carefully',
      'Ensure legitimate reason',
      'Explain post-naturalization name update process',
      'Check for fraudulent intent',
    ],
    estimatedDuration: 20,
    icon: '📝',
    color: '#EC4899',
  },

  previous_visa_issues: {
    id: 'previous_visa_issues',
    name: 'Previous Visa Issues',
    description: 'Applicant with past visa violations or immigration complications',
    applicantProfile: {
      ageRange: '25-55',
      yearsInUS: '5-15 years',
      background: 'Overcame previous visa issues or immigration complications',
      challenges: ['Past overstays', 'Visa violations', 'Explaining complex history'],
      strengths: ['Resolved issues', 'Maintained green card status', 'Good current record'],
    },
    customSystemPrompt: `You are interviewing a naturalization applicant who had previous visa issues but has since resolved them and maintained lawful permanent resident status. Be thorough but fair.

Previous issues may include:
1. Overstays on previous visas
2. Status violations
3. Adjustment complications
4. Re-entry issues
5. Prior inadmissibility waivers

Interview approach:
- Review the past issues thoroughly
- Verify how issues were resolved
- Confirm no new violations since becoming LPR
- Assess current good moral character
- Ensure full disclosure on N-400
- Check for any ongoing complications

The focus is on whether they have maintained good moral character since becoming a permanent resident and have been truthful about their history.`,
    n400FocusQuestions: [
      'I see you had some visa issues in the past. Can you explain what happened?',
      'When did these issues occur?',
      'How were these issues resolved?',
      'Did you receive any waivers or special permissions?',
      'Have you had any immigration violations since becoming a permanent resident?',
      'Why didn\'t you disclose this earlier? (if applicable)',
      'Have you traveled outside the US since becoming a permanent resident?',
      'Have you had any issues with re-entry?',
      'Why do you want to become a U.S. citizen?',
      'Do you understand the importance of truthfulness in this process?',
    ],
    coachingFocusAreas: [
      'Being honest about past issues',
      'Explaining how issues were resolved',
      'Demonstrating good moral character since LPR',
      'Showing complete disclosure on N-400',
    ],
    recommendedDifficulty: 'advanced',
    specialConsiderations: [
      'Thorough review of past issues',
      'Verify complete disclosure',
      'Assess truthfulness',
      'Check for ongoing complications',
    ],
    estimatedDuration: 25,
    icon: '⚠️',
    color: '#F59E0B',
  },

  military_service: {
    id: 'military_service',
    name: 'Military Service Member',
    description: 'Current or former U.S. military service member',
    applicantProfile: {
      ageRange: '22-45',
      yearsInUS: 'Varies (may qualify with less than 5 years)',
      background: 'Serving or served in U.S. Armed Forces',
      challenges: ['Deployment documentation', 'Special qualifying periods'],
      strengths: ['Service to country', 'May qualify for expedited naturalization', 'Strong character'],
    },
    customSystemPrompt: `You are interviewing a current or former U.S. military service member applying for naturalization. Show appropriate respect for their service.

Special considerations for military applicants:
1. May qualify with less than 5 years residence
2. May have expedited processing
3. Deployment time counts as physical presence
4. May have reduced fees or fee waivers
5. Strong presumption of good moral character

Interview approach:
- Thank them for their service
- Verify service details (branch, dates, discharge status)
- Confirm honorable service
- Review any deployment periods
- Standard civics test still applies
- Evaluate English through conversation

These applicants have demonstrated commitment to the United States through service. Conduct a thorough but respectful interview recognizing their contribution.`,
    n400FocusQuestions: [
      'Thank you for your service. Which branch of the military did you serve in?',
      'When did you begin your military service?',
      'Are you currently serving or have you been discharged?',
      'If discharged, what type of discharge did you receive?',
      'Were you deployed during your service?',
      'How long were you deployed?',
      'Where were you stationed in the United States?',
      'Did you maintain your permanent resident status during service?',
      'Why do you want to become a U.S. citizen?',
      'Do you understand the oath of allegiance - which is similar to your military oath?',
    ],
    coachingFocusAreas: [
      'Documenting military service properly',
      'Understanding expedited processing',
      'Deployment period documentation',
      'DD-214 or service records',
    ],
    recommendedDifficulty: 'intermediate',
    specialConsiderations: [
      'Verify honorable service',
      'May have reduced residence requirements',
      'Show respect for service',
      'Expedited processing may apply',
    ],
    estimatedDuration: 18,
    icon: '🎖️',
    color: '#DC2626',
  },

  multiple_marriages: {
    id: 'multiple_marriages',
    name: 'Multiple Marriages',
    description: 'Applicant with previous marriages requiring documentation',
    applicantProfile: {
      ageRange: '35-65',
      yearsInUS: '5-15 years',
      background: 'Has been married multiple times; needs to document all marriages',
      challenges: ['Locating divorce decrees', 'Explaining marriage history'],
      strengths: ['Current stable marriage', 'Complete documentation', 'Honesty'],
    },
    customSystemPrompt: `You are interviewing an applicant who has been married more than once. This requires careful documentation review but should be handled professionally without judgment.

Review requirements:
1. Verify current marital status
2. Document all previous marriages
3. Confirm legal termination of previous marriages (divorce/death)
4. Review marriage certificates and divorce decrees
5. If married to USC, verify marriage is genuine (not for immigration benefit)

Approach:
- Be matter-of-fact, not judgmental
- Verify documentation completeness
- Ensure all marriages were legally terminated before new marriage
- If spouse is USC, standard marriage fraud questions apply
- Focus on documentation, not personal history

Many people have multiple marriages - this alone is not an issue. The concern is proper documentation and, if applicable, genuine marriage to USC spouse.`,
    n400FocusQuestions: [
      'What is your current marital status?',
      'When did you marry your current spouse?',
      'Where were you married?',
      'Have you been married before?',
      'When was your previous marriage?',
      'How did that marriage end?',
      'Do you have the divorce decree or death certificate?',
      'If married to USC: How did you meet your current spouse?',
      'Do you and your spouse live together?',
      'Can you provide tax returns filed jointly?',
    ],
    coachingFocusAreas: [
      'Gathering all marriage and divorce documents',
      'Organizing documentation chronologically',
      'Being prepared to discuss marriage history',
      'Understanding documentation requirements',
    ],
    recommendedDifficulty: 'intermediate',
    specialConsiderations: [
      'Review all marriage/divorce documents',
      'Verify legal termination of prior marriages',
      'If spouse is USC, assess marriage genuineness',
      'Professional, non-judgmental approach',
    ],
    estimatedDuration: 22,
    icon: '💑',
    color: '#F472B6',
  },

  long_residence: {
    id: 'long_residence',
    name: 'Long-Term Resident',
    description: 'Permanent resident for 15+ years, finally pursuing citizenship',
    applicantProfile: {
      ageRange: '40-70',
      yearsInUS: '15+ years',
      background: 'Long-time green card holder finally applying for citizenship',
      challenges: ['Why waited so long', 'Extensive history to review'],
      strengths: ['Deep US ties', 'Stable history', 'Community involvement'],
    },
    customSystemPrompt: `You are interviewing someone who has been a permanent resident for 15 or more years and is now pursuing citizenship. This is increasingly common and should be viewed positively.

Interview approach:
- May ask why they waited (curiosity, not barrier)
- Long residence demonstrates stability
- Extensive US ties are an advantage
- May have older children who are citizens
- Strong community connections
- Tax compliance over many years shows character

Common reasons for delayed application:
- Previously didn't feel need for citizenship
- Children now encouraging them
- Want to vote
- Travel convenience
- Retirement security
- Always meant to, finally doing it

This is a positive application. After brief discussion of their long residence, proceed with standard interview. Their extended time in the US is a strength, not a weakness.`,
    n400FocusQuestions: [
      'I see you\'ve been a permanent resident since [year]. That\'s quite a while!',
      'What made you decide to apply for citizenship now?',
      'In all these years, have you maintained continuous residence?',
      'Have you filed tax returns for all these years?',
      'Tell me about your ties to the community.',
      'Do you have children who are U.S. citizens?',
      'Have you voted in any elections? (Should be no)',
      'Have you ever claimed to be a U.S. citizen before today?',
      'Why is becoming a citizen important to you now?',
      'Are you ready for the civics test?',
    ],
    coachingFocusAreas: [
      'Preparing brief explanation for timing',
      'Demonstrating deep US ties',
      'Organizing extensive documentation',
      'Civics study (may need refresher)',
    ],
    recommendedDifficulty: 'intermediate',
    specialConsiderations: [
      'Long residence is positive',
      'May have extensive documentation',
      'Verify tax compliance over years',
      'Appreciate community ties',
    ],
    estimatedDuration: 20,
    icon: '🏠',
    color: '#10B981',
  },

  recent_arrival: {
    id: 'recent_arrival',
    name: 'Recent Arrival (5 years)',
    description: 'Applying as soon as eligible (exactly 5 years)',
    applicantProfile: {
      ageRange: '25-45',
      yearsInUS: '5 years',
      background: 'Applying at first opportunity after meeting requirements',
      challenges: ['Limited US history', 'May still have strong ties to home country'],
      strengths: ['Eager and motivated', 'Well-prepared', 'Clear commitment'],
    },
    customSystemPrompt: `You are interviewing someone who became eligible for citizenship very recently (exactly 5 years or close to it) and is applying promptly. This shows motivation and commitment.

Interview considerations:
- They have limited but sufficient US history
- May still have strong ties to home country (this is OK)
- Likely enthusiastic about citizenship
- May have young family they want to protect
- Career advancement may be factor
- Thoroughly prepared

Assess:
- Met all time requirements (physical presence, continuous residence)
- Good moral character in the 5 years as permanent resident
- Tax compliance for all years
- English ability and civics knowledge
- Genuine commitment to US

Being eager for citizenship is positive. Verify they meet all requirements and are prepared for the responsibilities of citizenship.`,
    n400FocusQuestions: [
      'I see you\'re applying as soon as you became eligible. That\'s great!',
      'What made you decide to apply for citizenship right away?',
      'Have you been outside the US since becoming a permanent resident?',
      'Have you maintained continuous residence for the full 5 years?',
      'Where have you lived during this time?',
      'Have you been employed during these 5 years?',
      'Have you filed tax returns for all years?',
      'Do you still have family in your home country?',
      'Why do you want to become a U.S. citizen?',
      'What does citizenship mean to you?',
    ],
    coachingFocusAreas: [
      'Calculating eligibility dates precisely',
      'Documenting 5-year period completely',
      'Articulating commitment to US',
      'Civics test preparation',
    ],
    recommendedDifficulty: 'intermediate',
    specialConsiderations: [
      'Verify exact eligibility timing',
      'Assess genuine commitment',
      'Confirm all 5-year requirements met',
      'Enthusiasm is positive',
    ],
    estimatedDuration: 18,
    icon: '🌟',
    color: '#3B82F6',
  },

  entrepreneur: {
    id: 'entrepreneur',
    name: 'Entrepreneur/Business Owner',
    description: 'Self-employed applicant with own business',
    applicantProfile: {
      ageRange: '30-55',
      yearsInUS: '5-12 years',
      background: 'Owns or operates a business in the United States',
      challenges: ['Complex tax situation', 'Travel for business'],
      strengths: ['Job creation', 'Economic contribution', 'Community involvement'],
    },
    customSystemPrompt: `You are interviewing an entrepreneur or business owner applying for naturalization. These applicants contribute significantly to the U.S. economy but may have complex situations.

Focus areas:
- Verify business is legitimate and properly registered
- Review business tax returns (may be complex)
- Assess business travel (shouldn't break continuous residence)
- Confirm personal tax compliance
- Evaluate job creation/economic contribution
- Standard civics and English requirements apply

Positive indicators:
- Registered business with proper licenses
- Employees (job creation)
- Tax compliance despite complexity
- Community involvement through business
- Long-term business planning in US

Be prepared for:
- Corporate tax returns in addition to personal
- LLC, S-Corp, or other business structures
- Business-related travel
- Investment documentation

Recognize their economic contribution while ensuring compliance with all naturalization requirements.`,
    n400FocusQuestions: [
      'I see you own a business. Tell me about it.',
      'What type of business do you operate?',
      'When did you start this business?',
      'Is your business incorporated? What type of entity?',
      'Do you have any employees?',
      'Have you filed business tax returns for all years?',
      'Have you filed personal tax returns separately?',
      'Do you travel for business?',
      'Does your business require you to be outside the US?',
      'Do you plan to continue operating this business as a U.S. citizen?',
    ],
    coachingFocusAreas: [
      'Organizing business documentation',
      'Understanding tax compliance for self-employed',
      'Explaining business structure clearly',
      'Documenting business travel',
    ],
    recommendedDifficulty: 'intermediate',
    specialConsiderations: [
      'Review business and personal taxes',
      'Verify business legitimacy',
      'Assess economic contribution positively',
      'Business travel verification',
    ],
    estimatedDuration: 22,
    icon: '💼',
    color: '#059669',
  },

  student_to_citizen: {
    id: 'student_to_citizen',
    name: 'Student to Citizen',
    description: 'Came to US as student, obtained green card, now seeking citizenship',
    applicantProfile: {
      ageRange: '25-35',
      yearsInUS: '8-12 years total (5+ as permanent resident)',
      background: 'Originally came on student visa, transitioned to work visa, then green card',
      challenges: ['Multiple visa status changes', 'Complex timeline'],
      strengths: ['Educated in US', 'Strong English', 'Professional career'],
    },
    customSystemPrompt: `You are interviewing someone who came to the United States as an international student and has now progressed to seeking citizenship. This is a common and positive path.

Their journey typically:
1. Student visa (F-1) for undergraduate or graduate studies
2. Optional Practical Training (OPT) after graduation
3. H-1B or other work visa
4. Employment-based green card
5. Now applying for citizenship

Considerations:
- May have been in US 10+ years total, but only 5+ as permanent resident
- Usually highly educated with U.S. degrees
- Strong English skills from U.S. education
- Professional career established
- May have student loan debt (not an issue)
- Deep integration into U.S. society

This is an ideal naturalization candidate - educated, employed, integrated. Focus on:
- Verifying 5 years as permanent resident (not as student)
- Confirming continuous residence as permanent resident
- Standard civics test and interview
- Tax compliance since becoming permanent resident

Their path demonstrates commitment to and investment in the United States.`,
    n400FocusQuestions: [
      'I see you first came to the US as a student. Where did you study?',
      'What degree did you earn?',
      'When did you become a permanent resident?',
      'What was your path from student to permanent resident?',
      'Where are you currently employed?',
      'How does your work relate to your degree?',
      'Have you maintained continuous residence since getting your green card?',
      'Have you filed tax returns for all years as a permanent resident?',
      'Do you still have student loans? (This is fine)',
      'Why do you want to become a U.S. citizen?',
    ],
    coachingFocusAreas: [
      'Distinguishing student time from permanent resident time',
      'Explaining visa transitions clearly',
      'Documenting education credentials',
      'Professional achievement',
    ],
    recommendedDifficulty: 'intermediate',
    specialConsiderations: [
      'Verify 5 years as permanent resident specifically',
      'Student time doesn\'t count toward naturalization',
      'Usually strong English from U.S. education',
      'Positive integration path',
    ],
    estimatedDuration: 20,
    icon: '🎓',
    color: '#6366F1',
  },
};

/**
 * Get scenario by ID
 */
export function getScenario(scenarioId: ScenarioType): InterviewScenario {
  return INTERVIEW_SCENARIOS[scenarioId];
}

/**
 * Get all available scenarios
 */
export function getAllScenarios(): InterviewScenario[] {
  return Object.values(INTERVIEW_SCENARIOS);
}

/**
 * Get recommended scenario based on user profile
 */
export function getRecommendedScenario(userProfile: {
  age?: number;
  yearsInUS?: number;
  hasTravel?: boolean;
  hasEmploymentGaps?: boolean;
  isMilitary?: boolean;
}): ScenarioType {
  // Senior applicant
  if (userProfile.age && userProfile.age >= 65 && userProfile.yearsInUS && userProfile.yearsInUS >= 20) {
    return 'senior_65plus';
  }

  // Military service
  if (userProfile.isMilitary) {
    return 'military_service';
  }

  // Complex travel
  if (userProfile.hasTravel) {
    return 'complex_travel';
  }

  // Employment gaps
  if (userProfile.hasEmploymentGaps) {
    return 'employment_gaps';
  }

  // Recent arrival
  if (userProfile.yearsInUS && userProfile.yearsInUS <= 6) {
    return 'recent_arrival';
  }

  // Long-term resident
  if (userProfile.yearsInUS && userProfile.yearsInUS >= 15) {
    return 'long_residence';
  }

  // Default to standard first-time
  return 'first_time_standard';
}

/**
 * Get scenarios by difficulty
 */
export function getScenariosByDifficulty(difficulty: DifficultyLevel): InterviewScenario[] {
  return getAllScenarios().filter(scenario => scenario.recommendedDifficulty === difficulty);
}

/**
 * Get random scenario
 */
export function getRandomScenario(): InterviewScenario {
  const scenarios = getAllScenarios();
  return scenarios[Math.floor(Math.random() * scenarios.length)];
}
