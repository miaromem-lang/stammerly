import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, RefreshCw, Sun } from "lucide-react";

export const PracticeCard = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(20).fill(0.3));
  const [activePhoneme, setActivePhoneme] = useState(0);
  
  const phonemes = ["S", "-", "S", "-", "Sun"];
  
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setWaveformBars(prev => prev.map(() => 0.2 + Math.random() * 0.8));
        setActivePhoneme(prev => (prev + 1) % phonemes.length);
      }, 300);
      return () => clearInterval(interval);
    } else {
      setWaveformBars(Array(20).fill(0.3));
      setActivePhoneme(0);
    }
  }, [isRecording]);

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
            Our AI-powered speech analysis provides real-time feedback on fluency patterns
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
              <div className="flex gap-1">
                {[1,2,3,4].map((i) => (
                  <div 
                    key={i}
                    className={`w-2 h-4 rounded-full ${i <= 2 ? "bg-success" : "bg-muted"}`}
                  />
                ))}
              </div>
            </div>
            
            <CardContent className="p-8">
              {/* Stimulus Card */}
              <div className="bg-gradient-to-br from-gold/20 to-accent-orange/20 rounded-2xl p-8 mb-8 text-center">
                <div className="text-8xl mb-4">
                  <Sun className="w-24 h-24 mx-auto text-gold" />
                </div>
                
                {/* Phoneme Highlight */}
                <div className="flex items-center justify-center gap-1 text-4xl font-display font-bold">
                  {phonemes.map((phoneme, index) => (
                    <span
                      key={index}
                      className={`transition-all duration-200 ${
                        isRecording && index === activePhoneme
                          ? "text-success scale-125"
                          : index < activePhoneme && isRecording
                            ? "text-gold"
                            : "text-foreground"
                      }`}
                    >
                      {phoneme}
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground mt-2">Practice saying this word slowly</p>
              </div>
              
              {/* Waveform Ribbon */}
              <div className="bg-foreground/5 rounded-xl p-4 mb-8">
                <div className="flex items-end justify-center gap-1 h-16">
                  {waveformBars.map((height, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-full transition-all duration-150 ${
                        isRecording 
                          ? height > 0.6 
                            ? "bg-gold" 
                            : "bg-success"
                          : "bg-muted"
                      }`}
                      style={{ height: `${height * 100}%` }}
                    />
                  ))}
                </div>
                {isRecording && (
                  <p className="text-center text-sm text-success mt-2 font-medium">
                    Great flow detected! Keep going...
                  </p>
                )}
              </div>
              
              {/* Microphone Widget */}
              <div className="flex items-center justify-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full"
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
                
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording 
                      ? "bg-destructive animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]" 
                      : "bg-accent-sky pulse-glow"
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
                >
                  <Volume2 className="w-5 h-5" />
                </Button>
              </div>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                {isRecording ? "Tap to stop recording" : "Tap to start recording"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
