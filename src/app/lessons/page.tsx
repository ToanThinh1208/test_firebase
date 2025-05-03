import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, BookText, Ear } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'Grammar' | 'Vocabulary' | 'Pronunciation' | 'Conversation';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  imageUrl: string;
  imageHint: string;
}

const lessons: Lesson[] = [
  { id: 'g1', title: 'Mastering the Present Simple', description: 'Understand and use the present simple tense correctly.', type: 'Grammar', level: 'Beginner', imageUrl: 'https://picsum.photos/400/200?random=1', imageHint: 'grammar book pencil' },
  { id: 'v1', title: 'Essential Travel Vocabulary', description: 'Learn key words and phrases for your next trip.', type: 'Vocabulary', level: 'Beginner', imageUrl: 'https://picsum.photos/400/200?random=2', imageHint: 'travel suitcase map' },
  { id: 'p1', title: 'The "th" Sound', description: 'Practice the voiced and unvoiced "th" sounds.', type: 'Pronunciation', level: 'Intermediate', imageUrl: 'https://picsum.photos/400/200?random=3', imageHint: 'mouth speaking soundwave' },
  { id: 'c1', title: 'Ordering Food at a Restaurant', description: 'Practice common phrases for dining out.', type: 'Conversation', level: 'Beginner', imageUrl: 'https://picsum.photos/400/200?random=4', imageHint: 'restaurant menu food' },
  { id: 'g2', title: 'Introduction to Conditionals', description: 'Learn the basics of zero and first conditional sentences.', type: 'Grammar', level: 'Intermediate', imageUrl: 'https://picsum.photos/400/200?random=5', imageHint: 'question mark logic flow' },
  { id: 'v2', title: 'Business English Essentials', description: 'Key vocabulary for meetings and emails.', type: 'Vocabulary', level: 'Advanced', imageUrl: 'https://picsum.photos/400/200?random=6', imageHint: 'business meeting handshake' },
];

function getIconForType(type: Lesson['type']) {
  switch (type) {
    case 'Grammar': return <BookText className="h-5 w-5 text-primary" />;
    case 'Vocabulary': return <BookText className="h-5 w-5 text-yellow-500" />; // Adjusted icon/color
    case 'Pronunciation': return <Ear className="h-5 w-5 text-accent" />;
    case 'Conversation': return <PlayCircle className="h-5 w-5 text-purple-500" />; // Adjusted icon/color
    default: return <BookText className="h-5 w-5 text-muted-foreground" />;
  }
}

export default function LessonsPage() {
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Interactive English Lessons</h1>
        <p className="text-lg text-muted-foreground">Choose a lesson below to start improving your English skills.</p>
      </section>

      {/* TODO: Add filtering/sorting options here */}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="overflow-hidden flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-300">
            <div>
              <div className="relative aspect-video w-full">
                <Image
                  src={lesson.imageUrl}
                  alt={lesson.title}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={lesson.imageHint}
                 />
              </div>
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                   {getIconForType(lesson.type)}
                   <span className="text-sm font-medium text-muted-foreground">{lesson.type}</span>
                  </div>
                   <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                       lesson.level === 'Beginner' ? 'bg-blue-100 text-blue-800' :
                       lesson.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                       'bg-red-100 text-red-800' // Consider using theme colors
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
