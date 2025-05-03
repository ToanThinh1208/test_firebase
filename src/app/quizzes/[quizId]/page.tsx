'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Confetti from 'react-confetti'; // Assuming react-confetti is installed: npm install react-confetti

// --- Interfaces ---
interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string; // Store the correct answer text
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
}

type QuizState = 'loading' | 'active' | 'results' | 'error';
type AnswerStatus = 'unanswered' | 'correct' | 'incorrect';

// --- Placeholder Fetch Function ---
async function getQuizData(quizId: string): Promise<QuizData | null> {
  // In a real app, fetch this from a database or API
  const quizzes: Record<string, QuizData> = {
    q1: {
      id: 'q1',
      title: 'Present Simple Tense Quiz',
      description: 'Test your understanding of the present simple.',
      questions: [
        { id: 'q1_1', text: 'She ___ coffee every morning.', options: ['drink', 'drinks', 'is drinking', 'drank'], correctAnswer: 'drinks' },
        { id: 'q1_2', text: 'We ___ to the park on Sundays.', options: ['go', 'goes', 'are going', 'went'], correctAnswer: 'go' },
        { id: 'q1_3', text: 'The sun ___ in the east.', options: ['rise', 'rises', 'is rising', 'rose'], correctAnswer: 'rises' },
        // Add more questions...
      ],
    },
    q2: {
       id: 'q2',
        title: 'Travel Vocabulary Challenge',
        description: 'How well do you know essential travel words?',
        questions: [
            { id: 'q2_1', text: 'What document do you need to show at border control?', options: ['Ticket', 'Passport', 'Visa', 'Map'], correctAnswer: 'Passport' },
            { id: 'q2_2', text: 'Where do you typically stay overnight when travelling?', options: ['Restaurant', 'Airport', 'Hotel', 'Station'], correctAnswer: 'Hotel' },
            // Add more questions...
        ],
    }
    // Add more quizzes as needed
  };
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return quizzes[quizId] || null;
}

// --- Quiz Page Component ---
export default function QuizPage() {
  const params = useParams();
  const quizId = params.quizId as string;

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answersStatus, setAnswersStatus] = useState<Record<string, AnswerStatus>>({}); // Store status per question ID
  const [score, setScore] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false); // Show feedback after answer
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false); // Track correctness for feedback display

    // State for confetti
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });


  // Fetch quiz data
  useEffect(() => {
    if (quizId) {
      setQuizState('loading');
      getQuizData(quizId)
        .then(data => {
          if (data && data.questions.length > 0) {
            setQuizData(data);
            // Initialize answers status
            const initialStatus: Record<string, AnswerStatus> = {};
            data.questions.forEach(q => initialStatus[q.id] = 'unanswered');
            setAnswersStatus(initialStatus);
            setQuizState('active');
          } else {
            setError(data ? 'This quiz has no questions.' : 'Quiz not found.');
            setQuizState('error');
          }
        })
        .catch(err => {
          console.error("Error fetching quiz:", err);
          setError('Failed to load quiz.');
          setQuizState('error');
        });
    }
  }, [quizId]);

    // Update window size for confetti
    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== 'undefined') {
                setWindowSize({ width: window.innerWidth, height: window.innerHeight });
            }
        };
        handleResize(); // Set initial size
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


  const currentQuestion = quizData?.questions[currentQuestionIndex];

  const handleAnswerSelect = (value: string) => {
     if (showFeedback) return; // Don't allow changing answer after feedback is shown
    setSelectedAnswer(value);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const answerIsCorrect = selectedAnswer === currentQuestion.correctAnswer; // Renamed variable
    const questionId = currentQuestion.id;

    setAnswersStatus(prev => ({ ...prev, [questionId]: answerIsCorrect ? 'correct' : 'incorrect' }));
    setLastAnswerCorrect(answerIsCorrect); // Store correctness for feedback button

    if (answerIsCorrect) {
      setScore(prev => prev + 1);
    }
     setShowFeedback(true); // Show correct/incorrect styling

     // Automatically move to next question or results after a delay
     setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer(null); // Reset selection for next question

        if (currentQuestionIndex < quizData!.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setQuizState('results');
             if (answerIsCorrect) { // Trigger confetti on the last correct answer
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
            }
        }
    }, 1500); // 1.5 second delay
  };

  const handleRestartQuiz = () => {
     setCurrentQuestionIndex(0);
     setSelectedAnswer(null);
     setScore(0);
     // Reset answers status
     if (quizData) {
         const initialStatus: Record<string, AnswerStatus> = {};
         quizData.questions.forEach(q => initialStatus[q.id] = 'unanswered');
         setAnswersStatus(initialStatus);
     }
     setQuizState('active');
     setShowFeedback(false);
     setShowConfetti(false);
  };

  // --- Render Logic ---

  if (quizState === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (quizState === 'error') {
    return (
      <div className="text-center py-10">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Error Loading Quiz</h1>
        <p className="text-muted-foreground mb-4">{error || 'An unknown error occurred.'}</p>
        <Link href="/quizzes">
           <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes</Button>
        </Link>
      </div>
    );
  }

  if (quizState === 'results') {
    const totalQuestions = quizData?.questions.length ?? 0;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passed = percentage >= 70; // Example passing threshold

    return (
      <div className="max-w-2xl mx-auto text-center">
       {showConfetti && windowSize.width > 0 && (
            <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={passed ? 200 : 50}/>
        )}
        <Card className={`shadow-lg ${passed ? 'border-green-500' : 'border-red-500'}`}>
          <CardHeader>
            <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
            <CardDescription>{quizData?.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xl font-semibold">
              Your Score: {score} / {totalQuestions} ({percentage}%)
            </p>
            {passed ? (
               <p className="text-lg text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-2"><Check className="h-6 w-6"/> Great Job! You passed!</p>
            ) : (
               <p className="text-lg text-red-600 dark:text-red-400 font-medium flex items-center justify-center gap-2"><X className="h-6 w-6"/> Keep Practicing!</p>
            )}
              {/* Optional: Show review answers button */}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={handleRestartQuiz} variant="outline">
              Restart Quiz
            </Button>
            <Link href="/quizzes">
              <Button>Back to Quizzes</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Active quiz state
  if (!quizData || !currentQuestion) {
    // Should be covered by error state, but as a fallback
     setError('Quiz data is missing.');
     setQuizState('error');
    return null;
  }

  const progressValue = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
         <Link href="/quizzes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes List
        </Link>
      <Card className="shadow-lg">
        <CardHeader>
          <Progress value={progressValue} className="w-full mb-4" />
          <CardTitle className="text-2xl">{quizData.title}</CardTitle>
          <CardDescription>
            Question {currentQuestionIndex + 1} of {quizData.questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-medium">{currentQuestion.text}</p>
          <RadioGroup
             value={selectedAnswer ?? ''}
             onValueChange={handleAnswerSelect}
             className="space-y-3"
             disabled={showFeedback} // Disable options while showing feedback
          >
            {currentQuestion.options.map((option, index) => {
               const isSelected = selectedAnswer === option;
               const isCorrectOption = option === currentQuestion.correctAnswer; // Renamed variable
               let itemClass = '';
                if (showFeedback) {
                    if (isCorrectOption) {
                        itemClass = 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-700'; // Correct answer style + dark
                    } else if (isSelected && !isCorrectOption) {
                        itemClass = 'border-red-500 bg-red-50 dark:bg-red-900/30 dark:border-red-700'; // Incorrect selected answer style + dark
                    }
                }


              return (
              <Label
                 key={index}
                 htmlFor={`option-${index}`}
                 className={`flex items-center space-x-3 p-4 border rounded-md transition-colors ${itemClass} ${showFeedback ? 'cursor-default' : 'hover:bg-accent/50 cursor-pointer'}`}
                >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <span>{option}</span>
                 {showFeedback && isSelected && isCorrectOption && <Check className="ml-auto h-5 w-5 text-green-600 dark:text-green-400" />}
                 {showFeedback && isSelected && !isCorrectOption && <X className="ml-auto h-5 w-5 text-red-600 dark:text-red-400" />}
                 {showFeedback && !isSelected && isCorrectOption && <Check className="ml-auto h-5 w-5 text-green-600 dark:text-green-400 opacity-70" />} {/* Show correct if not selected */}
              </Label>
            )})}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer || showFeedback} // Disable if no answer or feedback is shown
            className={showFeedback ? (lastAnswerCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700') : ''} // Change button color based on correctness
          >
             {showFeedback ? (lastAnswerCorrect ? 'Correct!' : 'Incorrect') : 'Submit Answer'}
              {showFeedback && (lastAnswerCorrect ? <Check className="ml-2 h-4 w-4"/> : <X className="ml-2 h-4 w-4"/>) }
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
