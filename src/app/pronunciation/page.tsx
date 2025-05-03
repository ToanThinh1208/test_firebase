'use client';

import { useState, useRef, useEffect } from 'react';
import { pronunciationFeedback, PronunciationFeedbackInput, PronunciationFeedbackOutput } from '@/ai/flows/pronunciation-feedback';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mic, Square, Loader2, AlertCircle, CheckCircle, Volume2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

type RecordingState = 'idle' | 'recording' | 'processing' | 'finished' | 'error';

export default function PronunciationPage() {
  const [text, setText] = useState<string>('The quick brown fox jumps over the lazy dog.');
  const [feedback, setFeedback] = useState<string | null>(null);
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
    setProgress(0); // Reset progress
  };

   useEffect(() => {
    // Ensure cleanup happens when the component unmounts
    return () => {
      cleanupRecording();
    };
  }, []);


  const startRecording = async () => {
    if (recordingState !== 'idle' && recordingState !== 'finished' && recordingState !== 'error') return;

    setRecordingState('recording');
    setError(null);
    setFeedback(null);
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
        cleanupRecording(); // Clean up stream tracks
        setRecordingState('processing');
        setProgress(50); // Indicate processing start

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Use webm or adjust based on browser support
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          if (!base64Audio) {
             setError('Failed to read audio data.');
             setRecordingState('error');
             setProgress(0);
             return;
          }
          setAudioDataUri(base64Audio); // Store for potential playback

          const input: PronunciationFeedbackInput = {
            text,
            audioDataUri: base64Audio,
          };

          try {
            const result: PronunciationFeedbackOutput = await pronunciationFeedback(input);
            setFeedback(result.feedback);
            setRecordingState('finished');
            setProgress(100);
             toast({
              title: "Feedback Received",
              description: "Your pronunciation feedback is ready.",
              variant: "default", // Or use "success" if defined
            });
          } catch (err) {
            console.error('Error getting pronunciation feedback:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during feedback generation.');
            setRecordingState('error');
             setProgress(0);
             toast({
              title: "Error Getting Feedback",
              description: "Could not process your recording. Please try again.",
              variant: "destructive",
            });
          } finally {
              // Clear the interval if it exists from the recording phase
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
              }
          }
        };
         reader.onerror = () => {
            setError('Failed to process audio file.');
            setRecordingState('error');
            setProgress(0);
            cleanupRecording();
         }
      };

      recorder.start();

      // Simulate progress during recording (e.g., up to 10 seconds)
      const maxRecordTime = 10000; // 10 seconds
       progressIntervalRef.current = setInterval(() => {
         setProgress(prev => {
             const nextProgress = prev + (100 / (maxRecordTime / 100));
             if (nextProgress >= 50) { // Cap at 50% during recording phase
                 clearInterval(progressIntervalRef.current!);
                 progressIntervalRef.current = null;
                 if(mediaRecorderRef.current?.state === 'recording') {
                     mediaRecorderRef.current.stop(); // Auto-stop after max time
                 }
                 return 50;
             }
             return nextProgress;
         });
       }, 100);


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
      }
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
         <p className="text-lg text-muted-foreground">Record yourself reading the text below and get instant AI feedback.</p>
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
            {recordingState === 'idle' || recordingState === 'finished' || recordingState === 'error' ? (
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
             {audioDataUri && (recordingState === 'finished' || recordingState === 'error') && (
                 <Button onClick={playAudio} variant="outline" size="lg">
                    <Volume2 className="mr-2 h-5 w-5" /> Play Recording
                 </Button>
             )}
          </div>
           {(recordingState === 'recording' || recordingState === 'processing' || recordingState === 'finished') && (
            <Progress value={progress} className="w-full mt-4" />
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recordingState === 'finished' && feedback && (
        <Card className="shadow-lg border-accent">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-accent" /> Pronunciation Feedback
             </CardTitle>
             <CardDescription>Here's how you can improve your pronunciation:</CardDescription>
          </CardHeader>
          <CardContent>
             {/* Improve formatting of feedback */}
             <div className="prose dark:prose-invert max-w-none">
              {feedback.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
              ))}
            </div>
          </CardContent>
           <CardFooter>
              <Button onClick={startRecording} variant="link" className="text-primary">
                Try again?
              </Button>
           </CardFooter>
        </Card>
      )}
    </div>
  );
}
