

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, BookText, Mic, Edit3, Headphones, BookOpen } from "lucide-react"; // Added Mic, Edit3, Headphones, BookOpen
import Link from 'next/link';
import Image from 'next/image';

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'Grammar' | 'Vocabulary' | 'Pronunciation' | 'Conversation' | 'Reading' | 'Listening' | 'Writing'; // Added Reading, Listening, Writing
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  imageUrl: string;
  imageHint: string;
}

// Export the lessons array
export const lessons: Lesson[] = [
  { id: 'g1', title: 'Mastering the Present Simple', description: 'Understand and use the present simple tense correctly.', type: 'Grammar', level: 'Beginner', imageUrl: 'https://picsum.photos/400/200?random=1', imageHint: 'grammar book pencil' },
  { id: 'v1', title: 'Essential Travel Vocabulary', description: 'Learn key words and phrases for your next trip.', type: 'Vocabulary', level: 'Beginner', imageUrl: 'https://picsum.photos/400/200?random=2', imageHint: 'travel suitcase map' },
  { id: 'p1', title: 'The "th" Sound', description: 'Practice the voiced and unvoiced "th" sounds.', type: 'Pronunciation', level: 'Intermediate', imageUrl: 'https://picsum.photos/400/200?random=3', imageHint: 'mouth speaking soundwave' },
  { id: 'c1', title: 'Ordering Food at a Restaurant', description: 'Practice common phrases for dining out.', type: 'Conversation', level: 'Beginner', imageUrl: 'https://picsum.photos/400/200?random=4', imageHint: 'restaurant menu food' },
  { id: 'g2', title: 'Introduction to Conditionals', description: 'Learn the basics of zero and first conditional sentences.', type: 'Grammar', level: 'Intermediate', imageUrl: 'https://picsum.photos/400/200?random=5', imageHint: 'question mark logic flow' },
  { id: 'v2', title: 'Business English Essentials', description: 'Key vocabulary for meetings and emails.', type: 'Vocabulary', level: 'Advanced', imageUrl: 'https://picsum.photos/400/200?random=6', imageHint: 'business meeting handshake' },
  { id: 'r1', title: 'Reading Short Stories', description: 'Improve comprehension by reading simple stories.', type: 'Reading', level: 'Beginner', imageUrl: 'https://picsum.photos/400/200?random=11', imageHint: 'open book story reading' },
  { id: 'l1', title: 'Listening to Basic Conversations', description: 'Practice understanding everyday spoken English.', type: 'Listening', level: 'Beginner', imageUrl: 'https://picsum.photos/400/200?random=12', imageHint: 'headphones listening audio' },
  { id: 'w1', title: 'Writing Simple Sentences', description: 'Learn to construct basic English sentences.', type: 'Writing', level: 'Beginner', imageUrl: 'https://picsum.photos/400/200?random=13', imageHint: 'pencil writing paper' },
  { id: 'r2', title: 'Understanding News Headlines', description: 'Practice reading and interpreting news headlines.', type: 'Reading', level: 'Intermediate', imageUrl: 'https://picsum.photos/400/200?random=14', imageHint: 'newspaper headlines reading' },
  { id: 'l2', title: 'Listening to Short Talks', description: 'Improve comprehension of longer spoken passages.', type: 'Listening', level: 'Intermediate', imageUrl: 'https://picsum.photos/400/200?random=15', imageHint: 'person speaking lecture audio' },
];

function getIconForType(type: Lesson['type']) {
  switch (type) {
    case 'Grammar': return <BookText className="h-5 w-5 text-primary" />;
    case 'Vocabulary': return <BookText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    case 'Pronunciation': return <Mic className="h-5 w-5 text-accent" />; // Changed Icon
    case 'Conversation': return <PlayCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    case 'Reading': return <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />; // New Icon
    case 'Listening': return <Headphones className="h-5 w-5 text-blue-600 dark:text-blue-400" />; // New Icon
    case 'Writing': return <Edit3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />; // New Icon
    default: return <BookText className="h-5 w-5 text-muted-foreground" />;
  }
}

export default function LessonsPage() {
  return (
    // Use container and mx-auto to center the content
    <div className="container mx-auto px-4 space-y-8">
      <section className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Interactive English Lessons</h1>
        <p className="text-lg text-muted-foreground">Choose a lesson below to start improving your English skills.</p>
      </section>

      {/* TODO: Add filtering/sorting options here */}

      {/* Ensure the grid itself is centered if the container isn't enough, but typically container handles it */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="overflow-hidden flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-300">
            <div>
              <div className="relative aspect-video w-full">
                <Image
                  src={lesson.imageUrl}
                  alt={lesson.title}
                  fill // Use fill instead of layout="fill"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Add sizes prop
                  style={{ objectFit: 'cover' }} // Use style object for objectFit
                  data-ai-hint={lesson.imageHint}
                 />
              </div>
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                   {getIconForType(lesson.type)}
                   <span className="text-sm font-medium text-muted-foreground">{lesson.type}</span>
                  </div>
                   {/* Use theme colors and add dark mode support */}
                   <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                       lesson.level === 'Beginner' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                       lesson.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                       'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                   }`}>
                       {lesson.level}
                   </span>
                </div>
                <CardTitle className="text-xl">{lesson.title}</CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
              </CardHeader>
            </div>
            <CardContent>
               <Link href={`/lessons/${lesson.id}`} passHref>
                  <Button className="w-full">
                    <PlayCircle className="mr-2 h-4 w-4" /> Start Lesson
                  </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

