import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { StammerEvent } from '@/hooks/useStammerDetector';

interface WordTiming {
  word: string;
  start: number;
  end: number;
  duration: number;
}

interface Disfluency {
  type: string;
  word: string;
  severity: string;
  suggestion: string;
}

interface PhonemeTrigger {
  phoneme: string;
  count: number;
  avgDurationMs: number;
  words: string[];
}

interface AnalysisResult {
  fluencyScore: number;
  accuracy: number;
  easyOnsetScore: number;
  pacingScore: number;
  syllablesPerMinute: number;
  percentSyllablesStuttered: number;
  disfluencies: Disfluency[];
  strengths: string[];
  areasToImprove: string[];
  techniquesObserved: string[];
  clinicalNote: string;
  encouragement: string;
  
  // Clinical metrics - Surface Command Centre
  weightedStutteringSeverity?: number;
  weightedStutteringSeverityCI?: { low: number; high: number };
  percentSyllablesStutteredCI?: { low: number; high: number };
  totalSyllables?: number;
  sampleAdequacy?: 'low' | 'moderate' | 'adequate';
  articulationRate?: number;
  sldCount?: number;
  odCount?: number;
  
  // Temporal & Prosodic
  initiationLagMs?: number | null;
  naturalnessScore?: number | null;
  
  // Disfluency breakdown
  blocksCount?: number;
  prolongationsCount?: number;
  soundRepetitionsCount?: number;
  syllableRepetitionsCount?: number;
  wordRepetitionsCount?: number;
  phraseRepetitionsCount?: number;
  revisionsCount?: number;
  interjectionsCount?: number;
  
  // Technique tracking
  easyOnsetAttempts?: number;
  easyOnsetSuccesses?: number;
  softContactScore?: number | null;
  
  // Pause architecture
  linguisticPausesCount?: number;
  stutterHesitationsCount?: number;
  avgPauseDurationMs?: number | null;
  
  // Phoneme triggers
  phonemeTriggers?: PhonemeTrigger[];
  wordAvoidances?: string[];
  
  // Longest blocks
  longestBlockMs?: number | null;
  secondLongestBlockMs?: number | null;
  thirdLongestBlockMs?: number | null;
  
  // Context
  sessionContext?: string;
  environmentType?: string;
}

interface TranscriptionResult {
  text: string;
  words: WordTiming[];
  segments?: Array<{ id?: number | null; start: number; end: number; text?: string }>;
  duration: number;
  audioFilePath?: string | null;
}

export function useSpeechAnalysis() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [audioFilePath, setAudioFilePath] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      setTranscript('');
      setAnalysis(null);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback(async (targetPhrase: string, acousticEvents: StammerEvent[] = []) => {
    if (!mediaRecorderRef.current) return;

    return new Promise<void>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;
      
      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());

        try {
          // Create blob from chunks
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          console.log('Audio blob size:', audioBlob.size);

          // Convert to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            try {
              // Step 1: Transcribe with Whisper
              console.log('Transcribing audio...');
              const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('transcribe-speech', {
                body: { audio: base64Audio, language: 'en' }
              });

              if (transcriptionError) {
                throw new Error(transcriptionError.message || 'Transcription failed');
              }

              const transcription = transcriptionData as TranscriptionResult;
              console.log('Transcription result:', transcription);
              setTranscript(transcription.text);
              if (transcription.audioFilePath) {
                setAudioFilePath(transcription.audioFilePath);
              }

              // Step 2: Analyze with word timings
              console.log('Analyzing speech...');
              const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-speech', {
                body: {
                  transcript: transcription.text,
                  targetPhrase,
                  words: transcription.words,
                  segments: transcription.segments ?? [],
                  acousticEvents,
                }
              });

              if (analysisError) {
                throw new Error(analysisError.message || 'Analysis failed');
              }

              console.log('Analysis result:', analysisData);
              setAnalysis(analysisData as AnalysisResult);
              
              toast.success('Analysis complete!');
            } catch (error) {
              console.error('Processing error:', error);
              toast.error(error instanceof Error ? error.message : 'Failed to process speech');
            } finally {
              setIsProcessing(false);
              resolve();
            }
          };
        } catch (error) {
          console.error('Error processing recording:', error);
          setIsProcessing(false);
          toast.error('Failed to process recording');
          resolve();
        }
      };

      mediaRecorder.stop();
    });
  }, []);

  const reset = useCallback(() => {
      setTranscript('');
      setAnalysis(null);
      setAudioFilePath(null);
      setRecordingTime(0);
    setIsProcessing(false);
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    isRecording,
    isProcessing,
    transcript,
    analysis,
    audioFilePath,
    recordingTime,
    startRecording,
    stopRecording,
    reset
  };
}
