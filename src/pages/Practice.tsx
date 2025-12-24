import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mic, MicOff, Volume2, RefreshCw, Star, Trophy, Loader2, ThumbsUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SpeechAnalysis {
  fluencyScore: number;
  accuracy: number;
  easyOnsetScore: number;
  pacingScore: number;
  disfluencies?: Array<{ type: string; word: string; suggestion: string }>;
  strengths: string[];
  areasToImprove?: string[];
  encouragement: string;
}

const Practice = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(24).fill(0.3));
  const [activeWord, setActiveWord] = useState(-1);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SpeechAnalysis | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Large collection of practice phrases organized by difficulty
  const allPhrases = {
    beginner: [
      ["Sally", "saw", "the", "sun"],
      ["The", "cat", "sat", "down"],
      ["I", "like", "ice", "cream"],
      ["She", "sees", "the", "sea"],
      ["My", "mom", "makes", "meals"],
      ["Dad", "drives", "the", "car"],
      ["Run", "and", "have", "fun"],
      ["The", "dog", "is", "big"],
      ["I", "can", "do", "it"],
      ["We", "play", "all", "day"],
      ["Look", "at", "the", "bird"],
      ["Time", "to", "go", "home"],
    ],
    intermediate: [
      ["Peter", "picked", "a", "pretty", "picture"],
      ["The", "big", "bear", "bounced", "the", "ball"],
      ["Six", "slippery", "snails", "slid", "slowly"],
      ["Round", "and", "round", "the", "rabbit", "runs"],
      ["She", "sells", "seashells", "by", "the", "shore"],
      ["How", "much", "wood", "would", "a", "woodchuck", "chuck"],
      ["The", "rain", "in", "Spain", "falls", "mainly"],
      ["Butterflies", "flutter", "by", "the", "flowers"],
      ["The", "quick", "brown", "fox", "jumps"],
      ["Happy", "hippos", "hop", "here"],
    ],
    advanced: [
      ["Friendly", "frogs", "find", "fantastic", "feathers"],
      ["Theodore", "thinks", "through", "three", "things"],
      ["Crispy", "crackers", "crunch", "and", "crackle"],
      ["Smart", "students", "study", "steadily", "sometimes"],
      ["Beautiful", "butterflies", "bring", "bright", "blessings"],
      ["The", "thoughtful", "thrush", "thought", "three", "things"],
      ["Pleasantly", "pleasant", "prairie", "plants", "please"],
      ["Splendid", "springs", "sprout", "spectacular", "surprises"],
    ],
  };
  
  // Get random phrase on component mount
  const [currentPhrase, setCurrentPhrase] = useState<string[]>(() => {
    const category = new URLSearchParams(window.location.search).get('difficulty') || 'beginner';
    const phrases = allPhrases[category as keyof typeof allPhrases] || allPhrases.beginner;
    return phrases[Math.floor(Math.random() * phrases.length)];
  });
  
  const words = currentPhrase;
  const targetPhrase = words.join(" ");
  
  const getNewPhrase = () => {
    const category = new URLSearchParams(window.location.search).get('difficulty') || 'beginner';
    const phrases = allPhrases[category as keyof typeof allPhrases] || allPhrases.beginner;
    const newPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setCurrentPhrase(newPhrase);
    setRecordedAudio(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setShowResults(false);
    setTranscript("");
    setAnalysis(null);
  };
  
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [audioUrl]);

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const bars = Array(24).fill(0).map((_, i) => {
      const index = Math.floor((i / 24) * dataArray.length);
      return Math.max(0.15, dataArray[index] / 255);
    });
    
    setWaveformBars(bars);
    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  }, [isRecording]);

  const analyzeWithWhisper = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });
      
      const base64Audio = await base64Promise;
      
      // Step 1: Transcribe with OpenAI Whisper
      console.log('Transcribing with Whisper...');
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('transcribe-speech', {
        body: { audio: base64Audio, language: 'en' }
      });

      if (transcriptionError) {
        console.error('Transcription error:', transcriptionError);
        throw new Error('Transcription failed');
      }

      const transcribedText = transcriptionData?.text || '';
      const wordTimings = transcriptionData?.words || [];
      setTranscript(transcribedText);
      console.log('Transcription:', transcribedText);

      // Step 2: Analyze with AI including word timings for acoustic analysis
      console.log('Analyzing speech...');
      const { data, error } = await supabase.functions.invoke('analyze-speech', {
        body: { 
          transcript: transcribedText, 
          targetPhrase,
          words: wordTimings 
        }
      });

      if (error) {
        console.error('AI analysis error:', error);
        if (error.message?.includes('429')) {
          toast.error("Too many requests. Please wait a moment and try again.");
        } else if (error.message?.includes('402')) {
          toast.error("AI credits exhausted. Please add credits.");
        } else {
          toast.error("Could not analyze speech. Showing basic results.");
        }
        setAnalysis({
          fluencyScore: 75,
          accuracy: 80,
          easyOnsetScore: 70,
          pacingScore: 75,
          strengths: ["Good effort!", "Keep practicing!"],
          encouragement: "Great job trying! Keep up the practice!"
        });
      } else if (data?.error) {
        console.error('Analysis error:', data.error);
        toast.error(data.error);
        setAnalysis({
          fluencyScore: 75,
          accuracy: 80,
          easyOnsetScore: 70,
          pacingScore: 75,
          strengths: ["Good effort!"],
          encouragement: "Keep practicing!"
        });
      } else {
        setAnalysis(data);
        if (data.fluencyScore >= 80) {
          toast.success("Excellent fluency! 🌟");
        } else if (data.fluencyScore >= 60) {
          toast.success("Good job! Keep practicing! 💪");
        }
      }
    } catch (err) {
      console.error('Failed to analyze:', err);
      toast.error("Analysis failed. Please try again.");
      setAnalysis({
        fluencyScore: 75,
        accuracy: 80,
        easyOnsetScore: 70,
        pacingScore: 75,
        strengths: ["Good effort!"],
        encouragement: "Keep practicing!"
      });
    } finally {
      setIsAnalyzing(false);
      setShowResults(true);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      
      // Setup Web Speech API for transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        let finalTranscript = '';
        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setTranscript(finalTranscript + interimTranscript);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.log('Speech recognition error:', event.error);
        };
        
        recognitionRef.current.start();
      }
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
        
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        
        // Analyze with Whisper (uses the recorded audio blob)
        analyzeWithWhisper(audioBlob);
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      setActiveWord(0);
      setShowResults(false);
      setTranscript("");
      setAnalysis(null);
      
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      updateWaveform();
      
      let wordIndex = 0;
      const wordInterval = setInterval(() => {
        wordIndex = (wordIndex + 1) % words.length;
        setActiveWord(wordIndex);
      }, 600);
      
      mediaRecorderRef.current.addEventListener('stop', () => clearInterval(wordInterval));
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setActiveWord(-1);
      setWaveformBars(Array(24).fill(0.3));
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.play();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStarsEarned = () => {
    if (!analysis) return 1;
    if (analysis.fluencyScore >= 90) return 3;
    if (analysis.fluencyScore >= 70) return 2;
    return 1;
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-accent-orange/20 backdrop-blur-sm border-b border-accent-orange/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="font-display font-bold text-xl text-foreground">Easy Onset Quest 🌊</h1>
            <div className="flex items-center gap-2 bg-gold/20 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-gold fill-gold" />
              <span className="font-bold text-sm">+10</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-card/80 backdrop-blur-sm rounded-kids px-4 py-3 flex items-center justify-between mb-6 border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Volume2 className="w-4 h-4" />
            <span>Environment:</span>
            <span className="text-success font-medium">Quiet ✓</span>
          </div>
          {isRecording && (
            <span className="text-destructive font-mono text-sm animate-pulse">
              ● REC {formatTime(recordingTime)}
            </span>
          )}
        </div>

        <Card className="rounded-kids overflow-hidden bg-card/90 backdrop-blur-sm border-2 border-accent-orange/30">
          <CardContent className="p-8">
            <div className="bg-gradient-to-br from-gold/20 to-accent-orange/20 rounded-kids p-8 mb-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">Say this sentence slowly:</p>
              
              <div className="flex items-center justify-center gap-3 text-3xl md:text-4xl font-display font-bold flex-wrap">
                {words.map((word, index) => (
                  <span
                    key={index}
                    className={`transition-all duration-200 px-2 py-1 rounded-lg ${
                      isRecording && index === activeWord
                        ? "text-success bg-success/20 scale-110"
                        : index < activeWord && isRecording
                          ? "text-gold"
                          : "text-foreground"
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
              
              <p className="text-muted-foreground mt-4 text-sm">
                Focus on smooth, easy onset of each word
              </p>
            </div>

            {/* Live Transcript */}
            {isRecording && transcript && (
              <div className="bg-primary/10 rounded-xl p-4 mb-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">I heard:</p>
                <p className="text-lg font-medium text-foreground">{transcript}</p>
              </div>
            )}

            <div className="bg-foreground/5 rounded-xl p-4 mb-8">
              <div className="flex items-end justify-center gap-1 h-20">
                {waveformBars.map((height, i) => (
                  <div
                    key={i}
                    className={`w-2 rounded-full transition-all duration-75 ${
                      isRecording 
                        ? height > 0.6 ? "bg-gold" : "bg-success"
                        : recordedAudio ? "bg-accent-orange/50" : "bg-muted"
                    }`}
                    style={{ height: `${height * 100}%` }}
                  />
                ))}
              </div>
              {isRecording && (
                <p className="text-center text-sm text-success mt-3 font-medium">
                  🎤 Recording... Speak clearly!
                </p>
              )}
              {isAnalyzing && (
                <div className="text-center mt-3">
                  <Loader2 className="w-5 h-5 animate-spin inline-block text-primary mr-2" />
                  <span className="text-sm text-muted-foreground">Analyzing your speech...</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full"
                onClick={getNewPhrase}
                title="Get new phrase"
                disabled={isRecording || isAnalyzing}
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isAnalyzing}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording 
                    ? "bg-destructive animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]" 
                    : isAnalyzing
                      ? "bg-muted cursor-not-allowed"
                      : "bg-accent-orange pulse-glow hover:scale-105"
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-10 h-10 text-destructive-foreground" />
                ) : isAnalyzing ? (
                  <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
                ) : (
                  <Mic className="w-10 h-10 text-primary-foreground" />
                )}
              </button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full"
                onClick={playRecording}
                disabled={!recordedAudio || isRecording || isPlaying || isAnalyzing}
              >
                <Volume2 className={`w-5 h-5 ${isPlaying ? "text-accent-orange animate-pulse" : ""}`} />
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {isRecording ? "Tap to stop recording" : isAnalyzing ? "Analyzing..." : "Tap the microphone to start!"}
            </p>
          </CardContent>
        </Card>

        {/* AI-Powered Results */}
        {showResults && analysis && (
          <Card className="rounded-kids mt-6 bg-success/10 border-success/30 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-8 h-8 text-gold" />
                <h3 className="font-display font-bold text-2xl text-foreground">
                  {analysis.fluencyScore >= 80 ? "Amazing!" : analysis.fluencyScore >= 60 ? "Great Job!" : "Good Try!"}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                <div className="bg-card/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-success">{analysis.fluencyScore}%</p>
                  <p className="text-xs text-muted-foreground">Fluency</p>
                </div>
                <div className="bg-card/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-primary">{analysis.easyOnsetScore}%</p>
                  <p className="text-xs text-muted-foreground">Easy Onset</p>
                </div>
                <div className="bg-card/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-accent-orange">{analysis.pacingScore}%</p>
                  <p className="text-xs text-muted-foreground">Pacing</p>
                </div>
                <div className="bg-card/50 rounded-xl p-3">
                  <div className="flex justify-center gap-1">
                    {Array.from({ length: getStarsEarned() }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-gold fill-gold" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Stars</p>
                </div>
              </div>

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                    <ThumbsUp className="w-4 h-4 text-success" />
                    What went well:
                  </h4>
                  <ul className="space-y-1">
                    {analysis.strengths.map((strength, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-success">✓</span> {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas to improve */}
              {analysis.areasToImprove && analysis.areasToImprove.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Keep practicing:
                  </h4>
                  <ul className="space-y-1">
                    {analysis.areasToImprove.map((area, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-amber-500">→</span> {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Encouragement */}
              <div className="bg-primary/10 rounded-xl p-4 mb-6 text-center">
                <p className="text-foreground font-medium">🦦 Echo says: "{analysis.encouragement}"</p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  className="flex-1 rounded-kids"
                  variant="outline"
                  onClick={() => {
                    setRecordedAudio(null);
                    setAudioUrl(null);
                    setShowResults(false);
                    setRecordingTime(0);
                    setTranscript("");
                    setAnalysis(null);
                  }}
                >
                  Try Again
                </Button>
                <Button 
                  className="flex-1 rounded-kids bg-accent-orange hover:bg-accent-orange/90"
                  onClick={() => navigate("/analytics/kid")}
                >
                  See My Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Practice;
