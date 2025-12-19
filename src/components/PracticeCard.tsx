import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, RefreshCw, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const PracticeCard = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(24).fill(0.3));
  const [activeWord, setActiveWord] = useState(-1);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const words = ["Sally", "saw", "the", "sun"];
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
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
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true,
          autoGainControl: true 
        } 
      });
      
      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      // Set up MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        setAudioUrl(URL.createObjectURL(audioBlob));
        
        stream.getTracks().forEach(track => track.stop());
        toast.success("Recording saved! Ready for analysis.");
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      setActiveWord(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start waveform animation
      updateWaveform();
      
      // Simulate word highlighting while recording
      let wordIndex = 0;
      const wordInterval = setInterval(() => {
        wordIndex = (wordIndex + 1) % words.length;
        setActiveWord(wordIndex);
      }, 600);
      
      // Store interval for cleanup
      mediaRecorderRef.current.addEventListener('stop', () => {
        clearInterval(wordInterval);
      });
      
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
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
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

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setRecordedAudio(null);
    setAudioUrl(null);
    setRecordingTime(0);
    toast.info("Recording deleted");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            Technical Preview
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Activity Preview: Easy Onset Quest
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Record your speech and receive AI-powered fluency analysis in real-time
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card variant="glassStrong" className="overflow-hidden">
            {/* Noise Meter */}
            <div className="bg-secondary/50 px-6 py-3 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Volume2 className="w-4 h-4" />
                <span>Environment:</span>
                <span className="text-success font-medium">Quiet ✓</span>
              </div>
              <div className="flex items-center gap-4">
                {isRecording && (
                  <span className="text-destructive font-mono text-sm animate-pulse">
                    ● REC {formatTime(recordingTime)}
                  </span>
                )}
                <div className="flex gap-1">
                  {[1,2,3,4].map((i) => (
                    <div 
                      key={i}
                      className={`w-2 h-4 rounded-full ${i <= 2 ? "bg-success" : "bg-muted"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <CardContent className="p-8">
              {/* Stimulus Card */}
              <div className="bg-gradient-to-br from-gold/20 to-accent-orange/20 rounded-2xl p-8 mb-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">Say this sentence slowly:</p>
                
                {/* Word-by-word Highlight */}
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
              
              {/* Waveform Ribbon */}
              <div className="bg-foreground/5 rounded-xl p-4 mb-8">
                <div className="flex items-end justify-center gap-1 h-20">
                  {waveformBars.map((height, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-full transition-all duration-75 ${
                        isRecording 
                          ? height > 0.6 
                            ? "bg-gold" 
                            : "bg-success"
                          : recordedAudio
                            ? "bg-primary/50"
                            : "bg-muted"
                      }`}
                      style={{ height: `${height * 100}%` }}
                    />
                  ))}
                </div>
                {isRecording && (
                  <p className="text-center text-sm text-success mt-3 font-medium">
                    🎤 Recording... Speak clearly into your microphone
                  </p>
                )}
                {recordedAudio && !isRecording && (
                  <p className="text-center text-sm text-primary mt-3 font-medium">
                    ✓ Recording complete - {formatTime(recordingTime)} captured
                  </p>
                )}
              </div>
              
              {/* Recording Controls */}
              <div className="flex items-center justify-center gap-4">
                {recordedAudio && !isRecording && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full"
                    onClick={deleteRecording}
                  >
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full"
                  onClick={() => {
                    setRecordedAudio(null);
                    setAudioUrl(null);
                    setRecordingTime(0);
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
                      : "bg-accent pulse-glow hover:scale-105"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-10 h-10 text-destructive-foreground" />
                  ) : (
                    <Mic className="w-10 h-10 text-accent-foreground" />
                  )}
                </button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full"
                  onClick={playRecording}
                  disabled={!recordedAudio || isRecording || isPlaying}
                >
                  <Volume2 className={`w-5 h-5 ${isPlaying ? "text-primary animate-pulse" : ""}`} />
                </Button>
                
                {recordedAudio && !isRecording && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full"
                    onClick={() => {
                      if (audioUrl) {
                        const a = document.createElement('a');
                        a.href = audioUrl;
                        a.download = 'stammerly-recording.webm';
                        a.click();
                      }
                    }}
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                )}
              </div>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                {isRecording ? "Tap to stop recording" : "Tap to start recording"}
              </p>
              
              {/* AI Analysis Preview */}
              {recordedAudio && !isRecording && (
                <div className="mt-8 p-4 bg-secondary/50 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-medium text-foreground">AI Analysis Ready</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-success">87%</p>
                      <p className="text-xs text-muted-foreground">Fluency Score</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">4</p>
                      <p className="text-xs text-muted-foreground">Words Detected</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gold">Good</p>
                      <p className="text-xs text-muted-foreground">Easy Onset</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
