import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mic, MicOff, Volume2, RefreshCw, Star, Trophy } from "lucide-react";
import { toast } from "sonner";

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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const words = ["Sally", "saw", "the", "sun"];
  
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      
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
        setShowResults(true);
        toast.success("Great job! Recording complete!");
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      setActiveWord(0);
      setShowResults(false);
      
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

  const viewAnalytics = () => {
    // Navigate to kid analytics by default, but this could be dynamic based on user role
    navigate("/analytics/kid");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-orange/10 via-sky-blue/10 to-gold/10">
      {/* Header */}
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
        {/* Noise Meter */}
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

        {/* Main Practice Card */}
        <Card className="rounded-kids overflow-hidden bg-card/90 backdrop-blur-sm border-2 border-accent-orange/30">
          <CardContent className="p-8">
            {/* Stimulus */}
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

            {/* Waveform */}
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
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full"
                onClick={() => {
                  setRecordedAudio(null);
                  setAudioUrl(null);
                  setRecordingTime(0);
                  setShowResults(false);
                }}
                disabled={isRecording}
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording 
                    ? "bg-destructive animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]" 
                    : "bg-accent-orange pulse-glow hover:scale-105"
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-10 h-10 text-destructive-foreground" />
                ) : (
                  <Mic className="w-10 h-10 text-primary-foreground" />
                )}
              </button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full"
                onClick={playRecording}
                disabled={!recordedAudio || isRecording || isPlaying}
              >
                <Volume2 className={`w-5 h-5 ${isPlaying ? "text-accent-orange animate-pulse" : ""}`} />
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {isRecording ? "Tap to stop recording" : "Tap the microphone to start!"}
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        {showResults && (
          <Card className="rounded-kids mt-6 bg-success/10 border-success/30 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-8 h-8 text-gold" />
                <h3 className="font-display font-bold text-2xl text-foreground">Awesome Job!</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <p className="text-3xl font-bold text-success">87%</p>
                  <p className="text-sm text-muted-foreground">Fluency</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent-orange">4</p>
                  <p className="text-sm text-muted-foreground">Words</p>
                </div>
                <div>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3].map((star) => (
                      <Star key={star} className="w-6 h-6 text-gold fill-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Stars Earned!</p>
                </div>
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
                  }}
                >
                  Try Again
                </Button>
                <Button 
                  className="flex-1 rounded-kids bg-accent-orange hover:bg-accent-orange/90"
                  onClick={viewAnalytics}
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
