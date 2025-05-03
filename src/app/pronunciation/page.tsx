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
// Remove AI-related imports
// import { getPronunciationFeedback } from '@/ai/flows/pronunciation-feedback-flow';
// import type { PronunciationOutput } from '@/ai/flows/pronunciation-feedback-flow';

// Adjusted RecordingState: removed 'processing'
type RecordingState = 'idle' | 'recording' | 'stopped' | 'error';

export default function PronunciationPage() {
  const [text, setText] = useState<string>('The quick brown fox jumps over the lazy dog.');
  // Remove feedback state
  // const [feedback, setFeedback] = useState<PronunciationOutput | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); // Keep progress for recording timer

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
    // Reset progress when cleaning up after recording or error
    setProgress(0);
  };

   useEffect(() => {
    // Ensure cleanup happens when the component unmounts
    return () => {
      cleanupRecording();
    };
  }, []);


  const startRecording = async () => {
    // Allow starting again from 'stopped' or 'error' state
    if (recordingState === 'recording') return;

    setRecordingState('recording');
    setError(null);
    // Remove feedback reset
    // setFeedback(null);
    setAudioDataUri(null);
    audioChunksRef.current = [];
    setProgress(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        // Change state directly to stopped, remove processing
        setRecordingState('stopped');

        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' }); // Use mimeType from recorder if available
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);

        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          if (!base64Audio) {
             setError('Failed to read audio data.');
             setRecordingState('error'); // Set error state
             cleanupRecording();
             return;
          }
          setAudioDataUri(base64Audio); // Store for playback
          // --- AI Call Removed ---
          // Reset progress to 0 after recording is complete and processed
           setProgress(0);
           toast({
            title: "Recording Saved",
            description: "You can now play back your recording.",
           });
           cleanupRecording(); // Cleanup stream and interval
        };

         reader.onerror = () => {
            setError('Failed to process audio file.');
            setRecordingState('error');
            cleanupRecording(); // Ensure cleanup on error
         }

         // Clear the interval if it exists from the recording phase
         if (progressIntervalRef.current) {
             clearInterval(progressIntervalRef.current);
             progressIntervalRef.current = null;
         }
      };

      recorder.start();

      // Progress during recording (e.g., up to 15 seconds max)
      const maxRecordTime = 15000; // 15 seconds
      let elapsedTime = 0;
       progressIntervalRef.current = setInterval(() => {
         elapsedTime += 100;
         const currentProgress = Math.min(100, (elapsedTime / maxRecordTime) * 100);
         setProgress(currentProgress);

         if (elapsedTime >= maxRecordTime) {
             stopRecording(); // Auto-stop after max time
         }
       }, 100); // Update progress every 100ms

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please ensure permission is granted.');
      setRecordingState('error');
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
       // State change and cleanup is handled in recorder.onstop
       // Clear interval here as well
       if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      // Don't set progress here, let onstop handle it after processing blob
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
    <div className="max-w-3xl mx-auto space-y-8">
       <section className="text-center">
         <h1 className="text-3xl md:text-4xl font-bold mb-2">Pronunciation Practice</h1>
         {/* Updated description */}
         <p className="text-lg text-muted-foreground">Record yourself reading the text below and listen to your playback.</p>
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
            disabled={recordingState === 'recording'} // Only disable during recording
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Button Logic Adjusted */}
            {recordingState === 'recording' ? (
              <Button onClick={stopRecording} variant="destructive" size="lg">
                <Square className="mr-2 h-5 w-5" /> Stop Recording
              </Button>
            ) : (
                // Show Start Recording button if idle, stopped, or error
               <Button onClick={startRecording} size="lg" disabled={!text.trim()}>
                 <Mic className="mr-2 h-5 w-5" /> Start Recording
               </Button>
            )}
            {/* Play button visible only when stopped and audio is available */}
             {audioDataUri && recordingState === 'stopped' && (
                 <Button onClick={playAudio} variant="outline" size="lg">
                    <Play className="mr-2 h-5 w-5" /> Play Recording {/* Changed Icon */}
                 </Button>
             )}
             {/* Removed Processing button */}
          </div>
          {/* Progress bar only during recording */}
           {recordingState === 'recording' && (
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

      {/* --- AI Feedback Section Removed --- */}

    </div>
  );
}
