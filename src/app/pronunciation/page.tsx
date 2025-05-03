// src/app/pronunciation/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mic, Square, Loader2, AlertCircle, Volume2, Play } from 'lucide-react'; // Added Play icon
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
// AI Imports commented out as AI features are disabled
// import { getPronunciationFeedback } from '@/ai/flows/pronunciation-feedback-flow.ts';
// import type { PronunciationOutput } from '@/ai/flows/pronunciation-feedback-flow.ts';

// Type definition moved here to avoid dependency when AI is disabled
interface PronunciationOutput {
  overallScore: number;
  overallAssessment: string;
  wordScores?: Array<{ word: string; score: number }>;
  suggestions?: string[];
}


type RecordingState = 'idle' | 'recording' | 'stopped' | 'processing' | 'error';

export default function PronunciationPage() {
  const [text, setText] = useState<string>('The quick brown fox jumps over the lazy dog.');
  const [feedback, setFeedback] = useState<PronunciationOutput | null>(null); // Keep state for potential future re-enablement
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

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
    return () => {
      cleanupRecording();
    };
  }, []);

  const startRecording = async () => {
    if (recordingState === 'recording' || recordingState === 'processing') return;

    setRecordingState('recording');
    setError(null);
    setFeedback(null); // Clear previous feedback
    setAudioDataUri(null);
    audioChunksRef.current = [];
    setProgress(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      // Attempt common MIME types, starting with opus in webm for better compression
      const mimeTypes = [
          'audio/webm;codecs=opus',
          'audio/ogg;codecs=opus',
          'audio/webm', // Fallback webm
          'audio/ogg',  // Fallback ogg
          'audio/wav', // Less ideal, larger files
          'audio/mp4', // Sometimes supported
      ];
      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

      if (!supportedMimeType) {
          throw new Error("No suitable audio format supported by this browser.");
      }
       console.log("Using MIME type:", supportedMimeType);

      const recorder = new MediaRecorder(stream, { mimeType: supportedMimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => { // Make onstop async
        // Since AI is disabled, skip processing state and go directly to stopped
        // setRecordingState('processing'); // Skip processing state

        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);

        reader.onloadend = async () => { // Make onloadend async
          const base64Audio = reader.result as string;
          if (!base64Audio) {
             setError('Failed to read audio data.');
             setRecordingState('error');
             cleanupRecording();
             return;
          }
          setAudioDataUri(base64Audio); // Store for playback

          // --- AI Call Disabled ---
          /*
          try {
            console.log("Sending to AI:", { text: text.trim(), audioDataUri: base64Audio.substring(0, 50) + "..." }); // Log snippet
            const aiFeedback = await getPronunciationFeedback({
                textToPronounce: text.trim(), // Ensure text is trimmed
                audioDataUri: base64Audio,
            });
            setFeedback(aiFeedback);
            toast({
                title: "Feedback Received",
                description: "AI has analyzed your pronunciation.",
            });
          } catch (aiError) {
             console.error("Error getting AI feedback:", aiError);
             let errorMessage = 'Failed to get AI feedback.';
             if (aiError instanceof Error) {
                 errorMessage = aiError.message;
                 if (errorMessage.startsWith('Genkit not initialized') || errorMessage.startsWith('Genkit initialization failed')) {
                     errorMessage = 'AI features are currently unavailable. Please ensure the API key is configured correctly.';
                 } else if (errorMessage.includes('service is busy or rate limited') || errorMessage.includes('The provided audio or text could not be processed') ) {
                     errorMessage = aiError.message;
                 }
             }
             setError(errorMessage);
             toast({
               title: "AI Feedback Error",
               description: errorMessage,
               variant: "destructive",
             });
             setRecordingState('stopped'); // Keep state as 'stopped' if AI fails, allowing playback
             cleanupRecording();
             return; // Exit here if AI fails
          }
          */
           // --- End AI Call ---

          // Set state to stopped as AI is disabled
          setRecordingState('stopped');
          toast({ title: "Recording Saved", description: "You can now play back your recording." });
          setProgress(0); // Reset progress bar
          cleanupRecording(); // Cleanup stream and interval
        };

         reader.onerror = () => {
            setError('Failed to process audio file.');
            setRecordingState('error');
            cleanupRecording();
         }

         if (progressIntervalRef.current) {
             clearInterval(progressIntervalRef.current);
             progressIntervalRef.current = null;
         }
      };

      recorder.start();

      const maxRecordTime = 15000; // 15 seconds
      let elapsedTime = 0;
       progressIntervalRef.current = setInterval(() => {
         elapsedTime += 100;
         const currentProgress = Math.min(100, (elapsedTime / maxRecordTime) * 100);
         setProgress(currentProgress);

         if (elapsedTime >= maxRecordTime) {
             stopRecording();
         }
       }, 100);

    } catch (err) {
      console.error('Error accessing microphone or recording:', err);
       const message = err instanceof Error ? err.message : 'Could not access microphone or start recording. Please ensure permission is granted and your browser supports the required audio formats.';
      setError(message);
      setRecordingState('error');
      cleanupRecording();
       toast({
        title: "Recording Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
       if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      // State change is handled in recorder.onstop
    }
  };

   const playAudio = () => {
    if (audioDataUri) {
      const audio = new Audio(audioDataUri);
      audio.play().catch(e => {
          console.error("Error playing audio:", e);
           toast({
               title: "Playback Error",
               description: "Could not play the audio.",
               variant: "destructive",
           });
      });
    }
  };


  return (
    // Use container and mx-auto for centering
    <div className="container mx-auto px-4 max-w-3xl space-y-8">
       <section className="text-center">
         <h1 className="text-3xl md:text-4xl font-bold mb-2">Pronunciation Practice</h1>
         <p className="text-lg text-muted-foreground">Record yourself reading the text below and listen back.</p> {/* Removed AI part */}
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
            disabled={recordingState === 'recording'} // Only disable while actively recording
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Button Logic */}
            {recordingState === 'recording' && (
              <Button onClick={stopRecording} variant="destructive" size="lg">
                <Square className="mr-2 h-5 w-5" /> Stop Recording
              </Button>
            )}
             {/* Removed Processing Button as AI is disabled */}
             {(recordingState === 'idle' || recordingState === 'stopped' || recordingState === 'error') && (
               <Button onClick={startRecording} size="lg" disabled={!text.trim()}>
                 <Mic className="mr-2 h-5 w-5" /> Start Recording
               </Button>
             )}
             {audioDataUri && (recordingState === 'stopped' || recordingState === 'error') && ( // Allow playback when stopped or on error
                 <Button onClick={playAudio} variant="outline" size="lg">
                    <Play className="mr-2 h-5 w-5" /> Play Recording
                 </Button>
             )}
          </div>
          {recordingState === 'recording' && ( // Only show progress while recording
            <Progress value={progress} className="w-full mt-4 h-2" />
          )}
        </CardContent>
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

      {/* --- AI Feedback Section Disabled --- */}
      {/*
      {recordingState === 'stopped' && feedback && (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>AI Pronunciation Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Alert variant={feedback.overallScore >= 70 ? "default" : "destructive"} className={feedback.overallScore >= 70 ? "border-green-500 bg-green-50 dark:bg-green-900/30" : ""}>
                    <AlertTitle className="font-semibold">Overall Assessment: {feedback.overallAssessment}</AlertTitle>
                    <AlertDescription>Score: {feedback.overallScore}/100</AlertDescription>
                 </Alert>

                 {feedback.wordScores && feedback.wordScores.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-2">Word Breakdown:</h4>
                        <div className="flex flex-wrap gap-2">
                            {feedback.wordScores.map((word, index) => (
                                <Badge
                                    key={index}
                                    variant={word.score >= 80 ? 'default' : word.score >= 50 ? 'secondary' : 'destructive'}
                                    className="text-base px-3 py-1"
                                >
                                    {word.word} ({word.score})
                                </Badge>
                            ))}
                        </div>
                    </div>
                 )}

                {feedback.suggestions && feedback.suggestions.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-2">Suggestions for Improvement:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            {feedback.suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
      )}
      */}
       {/* Add a placeholder if feedback was expected */}
        {recordingState === 'stopped' && !error && (
             <Alert variant="default" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>AI Feedback Disabled</AlertTitle>
                <AlertDescription>
                    Pronunciation analysis by the AI agent is currently disabled. You can still record and play back your audio.
                </AlertDescription>
             </Alert>
        )}
    </div>
  );
}
