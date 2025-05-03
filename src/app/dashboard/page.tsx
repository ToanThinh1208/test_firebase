// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, BookOpen, Mic, Trophy, Star, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getProfile } from '@/services/profile-service'; // Import profile service
import type { Database } from '@/lib/supabase/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];


// Placeholder data structures
interface Recommendation {
  id: string;
  title: string;
  type: 'Lesson' | 'Quiz' | 'Practice';
  icon: React.ElementType;
  link: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface ProgressStats {
  lessonsCompleted: number;
  quizzesPassed: number;
  averageScore: number;
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  overallProgress: number; // Percentage
}

// Placeholder function to fetch dashboard data (replace with actual API calls later)
async function getDashboardData(userId: string): Promise<{ recommendations: Recommendation[], progress: ProgressStats }> {
    // Simulate fetching data
    await new Promise(resolve => setTimeout(resolve, 500));

    // Static placeholder data
    const recommendations: Recommendation[] = [
        { id: 'g1', title: 'Review Present Simple', type: 'Lesson', icon: BookOpen, link: '/lessons/g1', level: 'Beginner' },
        { id: 'q1', title: 'Present Simple Quiz', type: 'Quiz', icon: Trophy, link: '/quizzes/q1', level: 'Beginner' },
        { id: 'p1', title: 'Practice "th" Sound', type: 'Practice', icon: Mic, link: '/pronunciation', level: 'Intermediate' },
        { id: 'v1', title: 'Learn Travel Vocabulary', type: 'Lesson', icon: BookOpen, link: '/lessons/v1', level: 'Beginner' },
    ];

    const progress: ProgressStats = {
        lessonsCompleted: 5,
        quizzesPassed: 2,
        averageScore: 85,
        currentLevel: 'Beginner',
        overallProgress: 30, // 30% complete
    };

    return { recommendations, progress };
}


export default function DashboardPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [progress, setProgress] = useState<ProgressStats | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // Add profile state
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileAndDashboard = useCallback(async () => {
     if (!currentUser) return;
     setLoadingData(true);
     setError(null);
     try {
         // Fetch profile and dashboard data in parallel
         const [profileData, dashboardData] = await Promise.all([
             getProfile(currentUser.id),
             getDashboardData(currentUser.id)
         ]);
         setProfile(profileData);
         setRecommendations(dashboardData.recommendations);
         setProgress(dashboardData.progress);
     } catch (err) {
         console.error("Error fetching dashboard or profile data:", err);
         setError("Failed to load dashboard data.");
     } finally {
         setLoadingData(false);
     }
  }, [currentUser]);


  useEffect(() => {
    // Redirect if not logged in and auth check is complete
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
     if (currentUser) {
        fetchProfileAndDashboard();
     }
  }, [currentUser, fetchProfileAndDashboard]);

  // Show loading state while checking auth or fetching data
  if (authLoading || (!currentUser && !authLoading) || loadingData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

   if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        <p>{error}</p>
         <Button variant="outline" onClick={() => router.push('/')} className="mt-4">Go Home</Button>
      </div>
    );
  }


  if (!progress) return null; // Should be covered by loading/error states

   // Determine the display name: use username if available, otherwise fallback to email prefix
  const displayName = profile?.username || currentUser.email?.split('@')[0] || 'Learner';


  return (
    <div className="space-y-8">
       <section>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {displayName}!</h1>
        <p className="text-lg text-muted-foreground">Here's your learning dashboard.</p>
      </section>

        {/* Overall Progress */}
         <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" />
                    Your Learning Journey
                </CardTitle>
                <CardDescription>Your overall progress towards mastering English.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                 <Progress value={progress.overallProgress} className="w-full h-3" />
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Overall Progress: {progress.overallProgress}%</span>
                     <Badge variant={
                       progress.currentLevel === 'Beginner' ? 'default' :
                       progress.currentLevel === 'Intermediate' ? 'secondary' : 'outline' // Adjust badge variants as needed
                     } className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Level: {progress.currentLevel}
                     </Badge>
                 </div>
            </CardContent>
        </Card>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommendations Section */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              Recommended Next Steps
            </CardTitle>
            <CardDescription>Based on your progress, here are some suggestions to focus on.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.length > 0 ? (
              recommendations.map(rec => (
                <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <rec.icon className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium">{rec.title}</p>
                      <span className="text-sm text-muted-foreground">{rec.type}{rec.level ? ` (${rec.level})` : ''}</span>
                    </div>
                  </div>
                  <Link href={rec.link}>
                    <Button variant="ghost" size="sm">
                      Start <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No recommendations right now. Explore lessons!</p>
            )}
              <div className="pt-4 text-center">
                  <Link href="/lessons">
                      <Button variant="outline">Browse All Lessons</Button>
                  </Link>
              </div>
          </CardContent>
        </Card>

        {/* Progress Summary Section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-6 w-6 text-accent" />
              Your Achievements
            </CardTitle>
            <CardDescription>Keep up the great work!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-medium">Lessons Completed</span>
              </div>
              <span className="font-semibold text-lg">{progress.lessonsCompleted}</span>
            </div>
             <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Quizzes Passed</span>
              </div>
              <span className="font-semibold text-lg">{progress.quizzesPassed}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Average Score</span>
              </div>
              <span className="font-semibold text-lg">{progress.averageScore}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

       {/* Placeholder for recent activity or badges earned */}
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-center">
                (Feature coming soon: See your recently completed lessons and quizzes)
            </CardContent>
        </Card>

    </div>
  );
}
