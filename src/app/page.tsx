
'use client'; // Make homepage a client component to use auth state

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Mic, Trophy } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context'; // Import useAuth

export default function Home() {
  const { currentUser, loading } = useAuth(); // Get auth state

  return (
    <div className="flex flex-col items-center space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 lg:py-32">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          Unlock Your English Potential with <span className="text-primary">LinguaLeap</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Master grammar, perfect your pronunciation, and conquer vocabulary with our engaging lessons and interactive tools.
        </p>
        {/* Conditional CTA Button */}
        {!loading && (
          <Link href={currentUser ? "/lessons" : "/signup"}>
            <Button size="lg">
              {currentUser ? 'Explore Lessons' : 'Start Learning Today'}
            </Button>
          </Link>
        )}
        {loading && <Button size="lg" disabled>Loading...</Button>} {/* Optional loading state for button */}

        <div className="mt-12 relative aspect-video max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg">
           <Image
              src="https://picsum.photos/1200/675"
              alt="Person learning English online"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              style={{ objectFit: 'cover' }}
              data-ai-hint="language learning online class"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
             <div className="absolute bottom-4 left-4 text-white p-4 rounded bg-black/30 backdrop-blur-sm">
                <p className="text-sm font-semibold">Featured Lesson: Mastering Present Perfect</p>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Interactive Lessons</CardTitle>
            <CardDescription>Engage with dynamic lessons covering grammar, vocabulary, and real-world conversations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/lessons">
              <Button variant="outline">Explore Lessons</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
             <div className="mx-auto bg-accent/10 p-3 rounded-full w-fit mb-4">
              <Mic className="h-8 w-8 text-accent" />
            </div>
            <CardTitle>Pronunciation Practice</CardTitle>
            <CardDescription>Record yourself and listen back to improve your speaking clarity and confidence.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pronunciation">
              <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                Practice Speaking
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="mx-auto bg-secondary p-3 rounded-full w-fit mb-4">
              <Trophy className="h-8 w-8 text-secondary-foreground" />
            </div>
            <CardTitle>Quizzes & Challenges</CardTitle>
            <CardDescription>Test your knowledge and track your progress with fun, gamified quizzes and challenges.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/quizzes">
              <Button variant="outline">Take a Quiz</Button>
            </Link>
          </CardContent>
        </Card>
      </section>

        {/* Conditional Call to Action */}
        {!loading && !currentUser && ( // Show only if not loading and not logged in
            <section className="text-center py-16">
                <h2 className="text-3xl font-semibold mb-4">Ready to Take the Leap?</h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join thousands of learners improving their English skills every day.</p>
                <Link href="/signup">
                    <Button size="lg" variant="default">Sign Up for Free</Button>
                </Link>
            </section>
        )}
    </div>
  );
}
