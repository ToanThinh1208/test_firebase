
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

// Function to get Tailwind classes for difficulty
function getDifficultyClasses(difficulty: Quiz['difficulty']) {
    switch (difficulty) {
        case 'Easy': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900';
        case 'Medium': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900';
        case 'Hard': return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900';
        default: return 'text-muted-foreground bg-muted';
    }
}

export default function QuizzesPage() {
  return (
    // Use container and mx-auto to center the content
    <div className="container mx-auto px-4 space-y-8">
      <section className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Quizzes & Challenges</h1>
        <p className="text-lg text-muted-foreground">Test your English knowledge and earn points!</p>
      </section>

      {/* TODO: Add filtering/sorting options here */}

      {/* Ensure the grid itself is centered if the container isn't enough */}
      {/* Added `justify-center` to the grid container to explicitly center items when they don't fill the row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="overflow-hidden flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-300 w-full max-w-sm mx-auto"> {/* Added max-w-sm and mx-auto for card sizing and centering within grid cell */}
            <div>
               <div className="relative aspect-video w-full">
                  <Image
                    src={quiz.imageUrl}
                    alt={quiz.title}
                    fill // Use fill instead of layout="fill"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Add sizes prop
                    style={{ objectFit: 'cover' }} // Use style object for objectFit
                    data-ai-hint={quiz.imageHint}
                  />
              </div>
              <CardHeader>
                <div className="flex justify-between items-center mb-2 text-sm ">
                   <span className="font-medium text-muted-foreground">{quiz.topic}</span>
                   {/* Updated Difficulty Badge */}
                   <span className={`font-semibold px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getDifficultyClasses(quiz.difficulty)}`}>
                       <Star className={`h-3 w-3 fill-current`} /> {/* Adjusted icon size */}
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

        {/* Leaderboard Placeholder - centered within the container */}
        <section className="mt-12 max-w-2xl mx-auto"> {/* Added max-w and mx-auto for centering */}
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

