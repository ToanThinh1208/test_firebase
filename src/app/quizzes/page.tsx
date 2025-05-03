import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Clock, BarChart3, Star } from "lucide-react"; // Icons for quiz metadata
import Link from 'next/link';
import Image from 'next/image';

interface Quiz {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;
  imageUrl: string;
  imageHint: string;
}

const quizzes: Quiz[] = [
  { id: 'q1', title: 'Present Simple Tense Quiz', description: 'Test your understanding of the present simple.', topic: 'Grammar', difficulty: 'Easy', questionCount: 10, imageUrl: 'https://picsum.photos/400/225?random=7', imageHint: 'quiz checkmark question' },
  { id: 'q2', title: 'Travel Vocabulary Challenge', description: 'How well do you know essential travel words?', topic: 'Vocabulary', difficulty: 'Medium', questionCount: 15, imageUrl: 'https://picsum.photos/400/225?random=8', imageHint: 'map compass airplane' },
  { id: 'q3', title: 'Past Tense Irregular Verbs', description: 'Identify the correct past tense forms.', topic: 'Grammar', difficulty: 'Hard', questionCount: 20, imageUrl: 'https://picsum.photos/400/225?random=9', imageHint: 'clock rewind arrow' },
  { id: 'q4', title: 'Common Phrasal Verbs', description: 'Match the phrasal verbs to their meanings.', topic: 'Vocabulary', difficulty: 'Medium', questionCount: 12, imageUrl: 'https://picsum.photos/400/225?random=10', imageHint: 'puzzle pieces connection' },
];

function getDifficultyColor(difficulty: Quiz['difficulty']) {
    switch (difficulty) {
        case 'Easy': return 'text-green-600';
        case 'Medium': return 'text-yellow-600';
        case 'Hard': return 'text-red-600';
        default: return 'text-muted-foreground';
    }
}

export default function QuizzesPage() {
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Quizzes & Challenges</h1>
        <p className="text-lg text-muted-foreground">Test your English knowledge and earn points!</p>
      </section>

      {/* TODO: Add filtering/sorting options here */}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="overflow-hidden flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-300">
            <div>
               <div className="relative aspect-video w-full">
                  <Image
                    src={quiz.imageUrl}
                    alt={quiz.title}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={quiz.imageHint}
                  />
              </div>
              <CardHeader>
                <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
                   <span className="font-medium">{quiz.topic}</span>
                   <span className={`font-semibold ${getDifficultyColor(quiz.difficulty)} flex items-center gap-1`}>
                       <Star className={`h-4 w-4 ${getDifficultyColor(quiz.difficulty)} fill-current`} /> {/* Use Star for difficulty */}
                       {quiz.difficulty}
                   </span>
                </div>
                <CardTitle className="text-xl">{quiz.title}</CardTitle>
                <CardDescription>{quiz.description}</CardDescription>
              </CardHeader>
            </div>
             <CardContent>
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><BarChart3 className="h-4 w-4" /> {quiz.questionCount} Questions</span>
                    {/* Placeholder for estimated time */}
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> ~{Math.ceil(quiz.questionCount * 0.5)} min</span>
                </div>
                <Link href={`/quizzes/${quiz.id}`} passHref>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Zap className="mr-2 h-4 w-4" /> Start Challenge
                  </Button>
                </Link>
            </CardContent>
          </Card>
        ))}
      </section>

        {/* Leaderboard Placeholder */}
        <section className="mt-12">
            <Card>
                <CardHeader>
                    <CardTitle>Leaderboard</CardTitle>
                    <CardDescription>See how you rank against other learners!</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <p>(Leaderboard feature coming soon)</p>
                </CardContent>
            </Card>
        </section>

    </div>
  );
}
