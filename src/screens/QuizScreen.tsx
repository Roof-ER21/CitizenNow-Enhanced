// Quiz Screen - Practice and Mock Test modes
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CivicsQuestion } from '../types';
import civicsQuestions from '../data/civicsQuestions.json';

type QuizMode = 'practice' | 'mock';

interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export default function QuizScreen({ route }: any) {
  const quizMode: QuizMode = route?.params?.type || 'practice';
  const questionCount = route?.params?.questionCount || (quizMode === 'mock' ? 20 : 10);

  const [questions, setQuestions] = useState<CivicsQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(quizMode === 'mock' ? 1200 : 0); // 20 minutes for mock
  const [timerActive, setTimerActive] = useState(quizMode === 'mock');
  const [startTime] = useState(new Date());

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0 && !quizComplete) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, quizComplete]);

  const loadQuestions = () => {
    setLoading(true);

    // Randomly select questions
    const allQuestions = [...(civicsQuestions as CivicsQuestion[])];
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, questionCount);

    setQuestions(selected);
    setLoading(false);
  };

  const generateMultipleChoiceOptions = (question: CivicsQuestion): string[] => {
    const correctAnswer = question.answer;
    const options = [correctAnswer];

    // Get other questions from same category for realistic wrong answers
    const otherQuestions = (civicsQuestions as CivicsQuestion[])
      .filter(q => q.id !== question.id && q.category === question.category)
      .sort(() => Math.random() - 0.5);

    // Add up to 3 wrong answers
    for (let i = 0; i < otherQuestions.length && options.length < 4; i++) {
      const wrongAnswer = otherQuestions[i].answer;
      if (!options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }

    // If we don't have enough options, add some generic wrong answers
    if (options.length < 4) {
      const genericWrong = [
        'None of the above',
        'All of the above',
        'Only on special occasions',
        'Not specified in the Constitution',
      ];
      for (const wrong of genericWrong) {
        if (options.length < 4 && !options.includes(wrong)) {
          options.push(wrong);
        }
      }
    }

    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  };

  const handleOptionSelect = (option: string) => {
    if (showResult) return; // Prevent changing answer after submission
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) {
      Alert.alert('No Answer Selected', 'Please select an answer before submitting.');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = normalizeAnswer(selectedOption) === normalizeAnswer(currentQuestion.answer);

    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: selectedOption,
      correctAnswer: currentQuestion.answer,
      isCorrect,
    };

    setAnswers([...answers, answer]);
    setShowResult(true);

    // Save progress
    saveQuestionProgress(currentQuestion.id, isCorrect);
  };

  const normalizeAnswer = (answer: string): string => {
    return answer.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      finishQuiz();
    }
  };

  const handleTimeUp = () => {
    Alert.alert('Time\'s Up!', 'The quiz time has expired.', [
      {
        text: 'View Results',
        onPress: finishQuiz,
      },
    ]);
  };

  const finishQuiz = async () => {
    setQuizComplete(true);
    setTimerActive(false);

    // Calculate final score
    const correctCount = answers.filter(a => a.isCorrect).length;
    const totalQuestions = answers.length;
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Save quiz session to Firebase
    await saveQuizSession(correctCount, totalQuestions, accuracy);

    // For mock test, check if passed (need 12/20 or 60%)
    if (quizMode === 'mock') {
      const passed = accuracy >= 60;
      Alert.alert(
        passed ? 'Congratulations!' : 'Keep Practicing',
        `You scored ${correctCount}/${totalQuestions} (${accuracy.toFixed(1)}%)\n\n` +
        (passed
          ? 'You would pass the citizenship test!'
          : 'You need at least 60% to pass. Keep studying!'),
        [{ text: 'OK' }]
      );
    }
  };

  const saveQuestionProgress = async (questionId: string, isCorrect: boolean) => {
    // Firebase removed - progress now tracked locally via UserContext
    // Local state management only
  };

  const saveQuizSession = async (correct: number, total: number, accuracy: number) => {
    // Firebase removed - session tracking now local only
    // Stats tracked in UserContext via AsyncStorage
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowResult(false);
    setQuizComplete(false);
    setTimeLeft(quizMode === 'mock' ? 1200 : 0);
    setTimerActive(quizMode === 'mock');
    loadQuestions();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </View>
    );
  }

  if (quizComplete) {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const accuracy = (correctCount / answers.length) * 100;
    const passed = accuracy >= 60;

    return (
      <ScrollView style={styles.container}>
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Quiz Complete!</Text>

          <View style={[styles.scoreCard, passed ? styles.scoreCardPass : styles.scoreCardFail]}>
            <Text style={styles.scoreText}>{correctCount}/{answers.length}</Text>
            <Text style={styles.accuracyText}>{accuracy.toFixed(1)}%</Text>
            <Text style={styles.statusText}>{passed ? 'PASS ✅' : 'NEEDS IMPROVEMENT ⚠️'}</Text>
          </View>

          {quizMode === 'mock' && (
            <Text style={styles.mockInfo}>
              Passing score: 12/20 (60%) | Your score: {correctCount}/20
            </Text>
          )}

          {/* Review Answers */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Review Your Answers</Text>
            {answers.map((answer, index) => {
              const question = questions.find(q => q.id === answer.questionId);
              if (!question) return null;

              return (
                <View
                  key={index}
                  style={[
                    styles.reviewCard,
                    answer.isCorrect ? styles.reviewCardCorrect : styles.reviewCardIncorrect,
                  ]}
                >
                  <Text style={styles.reviewQuestionNumber}>Question {index + 1}</Text>
                  <Text style={styles.reviewQuestion}>{question.question}</Text>
                  <Text style={styles.reviewYourAnswer}>
                    Your answer: <Text style={answer.isCorrect ? styles.correctText : styles.incorrectText}>
                      {answer.selectedAnswer}
                    </Text>
                  </Text>
                  {!answer.isCorrect && (
                    <Text style={styles.reviewCorrectAnswer}>
                      Correct answer: <Text style={styles.correctText}>{answer.correctAnswer}</Text>
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.restartButton} onPress={restartQuiz}>
            <Text style={styles.restartButtonText}>Take Another Quiz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const options = generateMultipleChoiceOptions(currentQuestion);
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {quizMode === 'mock' ? 'Mock Test' : 'Practice Quiz'}
          </Text>
          <Text style={styles.questionProgress}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>
        {quizMode === 'mock' && (
          <View style={styles.timerContainer}>
            <Text style={[styles.timer, timeLeft < 60 && styles.timerWarning]}>
              ⏱️ {formatTime(timeLeft)}
            </Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <ScrollView style={styles.content}>
        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          <View style={styles.questionMeta}>
            <Text style={styles.category}>{currentQuestion.category}</Text>
            <Text style={styles.difficulty}>{currentQuestion.difficulty}</Text>
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((option, index) => {
            const isSelected = selectedOption === option;
            const isCorrect = showResult && option === currentQuestion.answer;
            const isWrong = showResult && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                  isCorrect && styles.optionCorrect,
                  isWrong && styles.optionWrong,
                ]}
                onPress={() => handleOptionSelect(option)}
                disabled={showResult}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.optionCircle,
                    isSelected && styles.optionCircleSelected,
                    isCorrect && styles.optionCircleCorrect,
                    isWrong && styles.optionCircleWrong,
                  ]}>
                    {isSelected && !showResult && <View style={styles.optionDot} />}
                    {isCorrect && <Text style={styles.optionIcon}>✓</Text>}
                    {isWrong && <Text style={styles.optionIcon}>✗</Text>}
                  </View>
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}>
                    {option}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Result Feedback */}
        {showResult && (
          <View style={[
            styles.feedback,
            selectedOption === currentQuestion.answer ? styles.feedbackCorrect : styles.feedbackIncorrect,
          ]}>
            <Text style={styles.feedbackTitle}>
              {selectedOption === currentQuestion.answer ? '✅ Correct!' : '❌ Incorrect'}
            </Text>
            {selectedOption !== currentQuestion.answer && (
              <Text style={styles.feedbackText}>
                The correct answer is: {currentQuestion.answer}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        {!showResult ? (
          <TouchableOpacity
            style={[styles.submitButton, !selectedOption && styles.submitButtonDisabled]}
            onPress={handleSubmitAnswer}
            disabled={!selectedOption}
          >
            <Text style={styles.submitButtonText}>Submit Answer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  questionProgress: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  timerContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
  },
  timerWarning: {
    color: '#DC2626',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1E40AF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  },
  questionText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#1F2937',
    marginBottom: 16,
  },
  questionMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'capitalize',
  },
  difficulty: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'capitalize',
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionSelected: {
    borderColor: '#1E40AF',
    backgroundColor: '#EEF2FF',
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCircleSelected: {
    borderColor: '#1E40AF',
  },
  optionCircleCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  optionCircleWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444',
  },
  optionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E40AF',
  },
  optionIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  feedback: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  feedbackCorrect: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  feedbackIncorrect: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultsContainer: {
    padding: 20,
    paddingTop: 60,
  },
  resultsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCardPass: {
    backgroundColor: '#D1FAE5',
  },
  scoreCardFail: {
    backgroundColor: '#FEF3C7',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  accuracyText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  mockInfo: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  reviewSection: {
    marginTop: 24,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  reviewCardCorrect: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  reviewCardIncorrect: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  reviewQuestionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  reviewQuestion: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
    fontWeight: '500',
  },
  reviewYourAnswer: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  reviewCorrectAnswer: {
    fontSize: 14,
    color: '#1F2937',
    marginTop: 4,
  },
  correctText: {
    color: '#10B981',
    fontWeight: '600',
  },
  incorrectText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  restartButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
