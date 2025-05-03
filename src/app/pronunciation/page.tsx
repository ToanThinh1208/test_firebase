// src/app/pronunciation/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mic, Square, Loader2, AlertCircle, Volume2, Star, MessageCircle, Zap, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { getPronunciationFeedback } from '@/ai/flows/pronunciation-feedback-flow'; // Import the AI flow
import type { PronunciationOutput } from '@/ai/flows/pronunciation-feedback-flow'; // Import the output type

type RecordingState = 'idle' | 'recording' | 'processing' | 'stopped' | 'error';

export default function PronunciationPage() {
  const [text, setText] = useState<string>('The quick brown fox jumps over the lazy dog.');
  const [feedback, setFeedback] = useState<PronunciationOutput | null>(null); // State for AI feedback
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); // Progress for visual feedback

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  // Cleanup function for stopping recording and stream
  const cleanupRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
     if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    // Don't reset progress here immediately, let the flow manage it
  };

   useEffect(() => {
    // Ensure cleanup happens when the component unmounts
    return () => {
      cleanupRecording();
    };
  }, []);


  const startRecording = async () => {
    if (recordingState !== 'idle' && recordingState !== 'stopped' && recordingState !== 'error') return;

    setRecordingState('recording');
    setError(null);
    setFeedback(null); // Clear previous feedback
    setAudioDataUri(null);
    audioChunksRef.current = [];
    setProgress(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; // Store stream for cleanup
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        setRecordingState('processing');
        setProgress(50); // Indicate processing start

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' }); // Specify codec if known, helps AI
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);

        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          if (!base64Audio) {
             setError('Failed to read audio data.');
             setRecordingState('error');
             setProgress(0);
             cleanupRecording();
             return;
          }
          setAudioDataUri(base64Audio); // Store for playback

          // --- Call AI Feedback ---
          try {
             toast({
                title: "Processing Audio...",
                description: "Getting pronunciation feedback from AI.",
             });
             setProgress(75); // Indicate AI processing

            // Ensure text is not empty before sending
             if (!text.trim()) {
                 throw new Error("Text to practice cannot be empty.");
             }

             const aiFeedback = await getPronunciationFeedback({
                textToPractice: text.trim(),
                audioDataUri: base64Audio,
             });
             setFeedback(aiFeedback);
             setRecordingState('stopped');
             setProgress(100);
             toast({
                title: "Feedback Ready!",
                description: "AI pronunciation feedback has been generated.",
                variant: "default",
             });

          } catch (aiError: any) {
            console.error("AI Feedback Error:", aiError);
             const errorMessage = aiError instanceof Error ? aiError.message : "An unknown error occurred while getting AI feedback.";
             setError(`AI Feedback Error: ${errorMessage}`);
             setRecordingState('error'); // Set state to error if AI fails
             setProgress(0); // Reset progress on error
             toast({
                title: "AI Error",
                description: errorMessage.substring(0, 100), // Show truncated error in toast
                variant: "destructive",
             });
          } finally {
             cleanupRecording(); // Ensure cleanup after processing attempt
          }
          // --- End AI Feedback ---
        };

         reader.onerror = () => {
            setError('Failed to process audio file.');
            setRecordingState('error');
            setProgress(0);
            cleanupRecording(); // Ensure cleanup on error
         }
         // Clear the interval if it exists from the recording phase
         if (progressIntervalRef.current) {
             clearInterval(progressIntervalRef.current);
             progressIntervalRef.current = null;
         }
      };

      recorder.start();

      // Simulate progress during recording (e.g., up to 15 seconds max)
      const maxRecordTime = 15000; // 15 seconds
       progressIntervalRef.current = setInterval(() => {
         setProgress(prev => {
             // Calculate progress increment based on 50% total during recording
             const nextProgress = prev + (50 / (maxRecordTime / 100));
             // Cap at 50% during recording phase, stop recorder if time limit reached
             if (nextProgress >= 50) {
                 clearInterval(progressIntervalRef.current!);
                 progressIntervalRef.current = null;
                 if(mediaRecorderRef.current?.state === 'recording') {
                     mediaRecorderRef.current.stop(); // Auto-stop after max time
                 }
                 return 50;
             }
             return nextProgress;
         });
       }, 100); // Update progress every 100ms

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please ensure permission is granted.');
      setRecordingState('error');
      setProgress(0);
      cleanupRecording(); // Ensure cleanup on error
       toast({
        title: "Microphone Error",
        description: "Could not access the microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
       // Processing state is set in the onstop handler
       // Clear interval here as well
       if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
        // Set progress to 50 as recording stopped manually before time limit
        setProgress(50);
      }
      // Cleanup is handled in onstop after processing attempt
    }
  };

   const playAudio = () => {
    if (audioDataUri) {
      const audio = new Audio(audioDataUri);
      audio.play().catch(e => console.error("Error playing audio:", e));
    }
  };


  return (
    <div className="max-w-3xl mx-auto space-y-8">
       <section className="text-center">
         <h1 className="text-3xl md:text-4xl font-bold mb-2">Pronunciation Practice</h1>
         {/* Updated description */}
         <p className="text-lg text-muted-foreground">Record yourself reading the text below and get AI feedback.</p>
       </section>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Practice Text</CardTitle>
          <CardDescription>Enter or use the default text you want to practice pronouncing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the text to practice..."
            rows={3}
            className="mb-4"
            disabled={recordingState === 'recording' || recordingState === 'processing'}
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Button Logic Adjusted */}
            {recordingState === 'idle' || recordingState === 'stopped' || recordingState === 'error' ? (
              <Button onClick={startRecording} size="lg" disabled={!text.trim()}>
                <Mic className="mr-2 h-5 w-5" /> Start Recording
              </Button>
            ) : recordingState === 'recording' ? (
              <Button onClick={stopRecording} variant="destructive" size="lg">
                <Square className="mr-2 h-5 w-5" /> Stop Recording
              </Button>
            ) : ( // processing
              <Button disabled size="lg">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
              </Button>
            )}
             {audioDataUri && (recordingState === 'stopped' || recordingState === 'error' || recordingState === 'processing') && ( // Allow playback even during processing error
                 <Button onClick={playAudio} variant="outline" size="lg" disabled={recordingState === 'processing'}>
                    <Volume2 className="mr-2 h-5 w-5" /> Play Recording
                 </Button>
             )}
          </div>
           {(recordingState === 'recording' || recordingState === 'processing' || (recordingState === 'stopped' && progress > 0)) && (
            <Progress value={progress} className="w-full mt-4 h-2" />
          )}
        </CardContent>
        {/* Footer for Try Again Button */}
        {(recordingState === 'stopped' || recordingState === 'error') && (
             <CardFooter className="justify-center pt-4 border-t">
                <Button onClick={startRecording} variant="link" className="text-primary">
                    Record again?
                </Button>
            </CardFooter>
         )}
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* --- Display AI Feedback --- */}
      {recordingState === 'stopped' && feedback && (
        <Card className="shadow-lg border-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500" /> AI Feedback
                </CardTitle>
                 <CardDescription>Here's the analysis of your pronunciation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {/* Overall Score */}
                <div className="text-center">
                     <p className="text-sm font-medium text-muted-foreground mb-1">Overall Score</p>
                    <p className="text-5xl font-bold text-primary">{feedback.overallScore}<span className="text-2xl text-muted-foreground">/100</span></p>
                </div>

                {/* General Feedback */}
                <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" /> General Comments</h3>
                    <p className="text-muted-foreground bg-secondary/50 p-3 rounded-md">{feedback.feedback}</p>
                </div>

                {/* Word-Level Feedback */}
                 {feedback.wordLevelFeedback && feedback.wordLevelFeedback.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Word Analysis</h3>
                        <div className="flex flex-wrap gap-2">
                            {feedback.wordLevelFeedback.map((wordFeedback, index) => (
                                <Badge
                                    key={index}
                                    variant={wordFeedback.isCorrect ? 'default' : 'destructive'}
                                    className="text-sm font-normal"
                                    title={wordFeedback.comment || (wordFeedback.isCorrect ? 'Pronounced correctly' : 'Needs improvement')} // Tooltip for comment
                                >
                                     {wordFeedback.isCorrect ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                                    {wordFeedback.word}
                                </Badge>
                            ))}
                        </div>
                         <p className="text-xs text-muted-foreground mt-2">Hover over words for specific comments.</p>
                    </div>
                 )}


                {/* Suggestions */}
                {feedback.suggestions && feedback.suggestions.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Zap className="h-5 w-5 text-accent" /> Suggestions for Improvement</h3>
                        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                            {feedback.suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                        </ul>
                    </div>
                 )}

            </CardContent>
            {/* Optionally add a footer if needed */}
        </Card>
      )}
      {/* End AI Feedback Display */}

    </div>
  );
}
