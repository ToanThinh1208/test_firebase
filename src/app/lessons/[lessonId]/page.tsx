'use client'; // Keep as client component for potential interactivity

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, Mic } from 'lucide-react'; // Added Mic
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react'; // Use state for dynamic content loading

// Placeholder lesson content structure
interface LessonContent {
  id: string;
  title: string;
  type: string;
  level: string;
  imageUrl: string;
  imageHint: string;
  content: string; // Markdown or HTML content
  interactiveElement?: React.ReactNode; // Optional interactive component
}

// Placeholder function to fetch lesson data
async function getLessonData(lessonId: string): Promise<LessonContent | null> {
  // In a real app, fetch this from a database or API
  const lessons: Record<string, LessonContent> = {
    g1: { id: 'g1', title: 'Mastering the Present Simple', type: 'Grammar', level: 'Beginner', imageUrl: 'https://picsum.photos/800/400?random=1', imageHint: 'grammar book pencil', content: `
### Understanding the Present Simple
The present simple tense is used for:
*   Facts and general truths (e.g., The sun rises in the east.)
*   Habits and routines (e.g., I drink coffee every morning.)
*   Scheduled events (e.g., The train leaves at 8:00 AM.)

**Structure:**
*   Positive: Subject + Base Verb (+s/es for he/she/it)
*   Negative: Subject + do/does + not + Base Verb
*   Question: Do/Does + Subject + Base Verb?
`, interactiveElement: <SimpleQuiz /> },
    v1: { id: 'v1', title: 'Essential Travel Vocabulary', type: 'Vocabulary', level: 'Beginner', imageUrl: 'https://picsum.photos/800/400?random=2', imageHint: 'travel suitcase map', content: `
### Key Travel Phrases
Learn these words before your trip:
*   **Passport:** Your travel document.
*   **Ticket:** Allows you to board a plane/train.
*   **Hotel:** Where you stay.
*   **Restaurant:** Where you eat.
*   **Hello / Goodbye:** Basic greetings.
*   **Thank you / Please:** Politeness matters!
*   **How much is this?:** Useful for shopping.
`, interactiveElement: <Flashcards /> },
    p1: { id: 'p1', title: 'The "th" Sound', type: 'Pronunciation', level: 'Intermediate', imageUrl: 'https://picsum.photos/800/400?random=3', imageHint: 'mouth speaking soundwave', content: `
### Voiced vs. Unvoiced "th"
The "th" sound can be tricky!
*   **Unvoiced /θ/:** Like in "think", "three", "path". Your vocal cords don't vibrate. Put your tongue between your teeth and blow air.
*   **Voiced /ð/:** Like in "this", "that", "mother". Your vocal cords vibrate. Put your tongue between your teeth and make a sound.

Listen and repeat the examples. Try recording yourself!
`, interactiveElement: <PronunciationInfo textToPractice="The thirty-three thieves thought that they thrilled the throne throughout Thursday." /> }, // Keep this component
    // Add more lessons as needed
  };
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  return lessons[lessonId] || null;
}

// Placeholder Interactive Components
function SimpleQuiz() {
  return <div className="mt-4 p-4 border rounded bg-secondary/50"><p className="font-semibold">Interactive Quiz Placeholder</p><p className="text-sm text-muted-foreground">A simple multiple-choice quiz about the present simple will appear here.</p></div>;
}

function Flashcards() {
  return <div className="mt-4 p-4 border rounded bg-secondary/50"><p className="font-semibold">Flashcards Placeholder</p><p className="text-sm text-muted-foreground">Interactive vocabulary flashcards will appear here.</p></div>;
}

// PronunciationInfo component - No AI needed here, just displays practice text and link
function PronunciationInfo({ textToPractice }: { textToPractice: string }) {
    return (
        <div className="mt-4 p-4 border rounded bg-secondary/50 space-y-2">
            <p className="font-semibold">Pronunciation Practice</p>
            <p className="italic text-lg">Practice saying: "{textToPractice}"</p>
            <p className="text-sm text-muted-foreground">Use the <Link href="/pronunciation" className="text-primary underline font-medium">Pronunciation Practice</Link> tool to record yourself and listen back.</p>
            {/* Recording button/feedback removed as AI is gone */}
        </div>
    );
}


export default function LessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  const [lessonData, setLessonData] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lessonId) {
      setIsLoading(true);
      getLessonData(lessonId)
        .then(data => {
          if (data) {
            setLessonData(data);
          } else {
            setError('Lesson not found.');
          }
        })
        .catch(err => {
          console.error("Error fetching lesson:", err);
          setError('Failed to load lesson.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [lessonId]);

  if (isLoading) {
    return <LessonLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Error</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Link href="/lessons">
           <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Lessons</Button>
        </Link>
      </div>
    );
  }

  if (!lessonData) {
    // This case should ideally be handled by the error state, but added for robustness
    return <div>Lesson not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/lessons" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lessons List
        </Link>

      <Card className="overflow-hidden">
         <div className="relative aspect-[2/1] w-full">
             <Image
                src={lessonData.imageUrl}
                alt={lessonData.title}
                fill // Use fill instead of layout="fill"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Add sizes prop
                style={{ objectFit: 'cover' }} // Use style object for objectFit
                data-ai-hint={lessonData.imageHint}
                priority // Load image faster as it's key content
              />
        </div>
        <CardHeader>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-primary">{lessonData.type}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                       lessonData.level === 'Beginner' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : // Added dark mode styles
                       lessonData.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                       'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                   }`}>
              {lessonData.level}
            </span>
          </div>
          <CardTitle className="text-3xl">{lessonData.title}</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none dark:prose-invert">
          {/* Render Markdown/HTML content safely here */}
          {/* For simplicity, directly using split/map; use react-markdown in a real app */}
          {lessonData.content.split('\n').map((paragraph, index) => {
             if (paragraph.startsWith('### ')) {
                 return <h3 key={index} className="font-semibold text-xl mt-4 mb-2">{paragraph.substring(4)}</h3>;
             }
             if (paragraph.startsWith('*   ')) {
                  // Check if it's a list item, handle potential list start/end logic if needed
                  return <li key={index} className="ml-4 ">{paragraph.substring(4)}</li>; // Removed list-disc, handled by prose
             }
              if (paragraph.startsWith('**')) {
                   // Basic bold handling, limited - better handled by prose or markdown renderer
                   const parts = paragraph.split('**');
                   return <p key={index}>{parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</p>
              }
              // Ensure empty paragraphs are not rendered or render a break
               if (paragraph.trim() === '') {
                  return null; // Don't render empty paragraphs
               }
             return <p key={index}>{paragraph}</p>;
           })}

          {/* Interactive Element */}
          {lessonData.interactiveElement}

          <div className="mt-8 flex justify-between items-center border-t pt-4">
             {/* Add logic for previous/next lesson links */}
            <Button variant="outline" disabled>Previous Lesson</Button>
             <Button variant="default" disabled>
                Next Lesson <CheckCircle className="ml-2 h-4 w-4" />
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


// Skeleton Loading Component
function LessonLoadingSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="h-6 w-32 bg-muted rounded"></div> {/* Back link skeleton */}

            <Card className="overflow-hidden">
                <div className="aspect-[2/1] w-full bg-muted rounded-t-lg"></div> {/* Image skeleton */}
                <CardHeader>
                    <div className="flex justify-between items-center mb-1">
                        <div className="h-4 w-16 bg-muted rounded"></div> {/* Type skeleton */}
                        <div className="h-4 w-20 bg-muted rounded-full"></div> {/* Level skeleton */}
                    </div>
                    <div className="h-8 w-3/4 bg-muted rounded mb-2"></div> {/* Title skeleton */}
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-5/6 bg-muted rounded"></div>
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-3/4 bg-muted rounded"></div>

                     {/* Interactive element skeleton */}
                     <div className="mt-4 p-4 border rounded bg-muted/50 h-24"></div>

                    <div className="mt-8 flex justify-between items-center border-t pt-4">
                        <div className="h-10 w-32 bg-muted rounded"></div> {/* Button skeleton */}
                        <div className="h-10 w-32 bg-muted rounded"></div> {/* Button skeleton */}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
