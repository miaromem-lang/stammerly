import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mic, MicOff, Volume2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "assistant";
  content: string;
  disfluencies?: Array<{ type: string; word: string }>;
}

const characters = [
  { id: "otter", name: "Echo the Otter", emoji: "🦦", personality: "playful and encouraging" },
  { id: "owl", name: "Luna the Owl", emoji: "🦉", personality: "wise and patient" },
  { id: "fox", name: "Finn the Fox", emoji: "🦊", personality: "clever and adventurous" },
  { id: "bunny", name: "Bella the Bunny", emoji: "🐰", personality: "gentle and kind" },
  { id: "monkey", name: "Max the Monkey", emoji: "🐵", personality: "fun and silly" },
];

const FreeTalk = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const characterEmoji = searchParams.get('character') || '🦦';
  const character = characters.find(c => c.emoji === characterEmoji) || characters[0];
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: `Hi there! I'm ${character.name}! 🎉 I'm so excited to chat with you today. What would you like to talk about? Remember to take your time and breathe - I'm here to listen!` 
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [disfluencyStats, setDisfluencyStats] = useState({
    blocks: 0,
    repetitions: 0,
    prolongations: 0,
    interjections: 0,
  });
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Speech recognition not supported in this browser");
        return;
      }

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
        if (event.error !== 'no-speech') {
          toast.error("Speech recognition error");
        }
      };

      recognitionRef.current.start();
      setIsRecording(true);
      setTranscript("");
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    
    if (transcript.trim()) {
      await sendMessage(transcript.trim());
    }
    setTranscript("");
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    
    // Add user message with disfluency analysis placeholder
    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setTextInput("");

    try {
      // Call the chat edge function
      const { data, error } = await supabase.functions.invoke('free-talk-chat', {
        body: { 
          message: text, 
          characterName: character.name,
          characterPersonality: character.personality,
          conversationHistory: messages.slice(-6), // Last 6 messages for context
        }
      });

      if (error) throw error;

      // Update disfluency stats if detected
      if (data.disfluencies) {
        setDisfluencyStats(prev => ({
          blocks: prev.blocks + (data.disfluencies.blocks || 0),
          repetitions: prev.repetitions + (data.disfluencies.repetitions || 0),
          prolongations: prev.prolongations + (data.disfluencies.prolongations || 0),
          interjections: prev.interjections + (data.disfluencies.interjections || 0),
        }));
      }

      // Add assistant response
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.response,
        disfluencies: data.userDisfluencies
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      // Fallback response
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `That's really interesting! Tell me more about that. Remember, you're doing great - take your time with your words! 🌟` 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-orange/10 via-sky-blue/10 to-gold/10 flex flex-col">
      {/* Header */}
      <header className="bg-accent-orange/20 backdrop-blur-sm border-b border-accent-orange/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate("/hub/kid")}
              className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{character.emoji}</span>
              <span className="font-display font-bold text-xl text-foreground">Chat with {character.name.split(' ')[0]}</span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-4 max-w-2xl flex flex-col">
        {/* Disfluency Stats Bar */}
        <Card className="mb-4 bg-card/80">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Session Stats:</span>
              <div className="flex gap-4">
                <span className="text-primary">Blocks: {disfluencyStats.blocks}</span>
                <span className="text-amber-500">Reps: {disfluencyStats.repetitions}</span>
                <span className="text-purple-500">Prolongs: {disfluencyStats.prolongations}</span>
                <span className="text-sky-500">Interject: {disfluencyStats.interjections}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="flex-1 mb-4 bg-card/80 overflow-hidden">
          <CardContent className="p-4 h-[50vh] overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-md' 
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}>
                    {message.role === 'assistant' && (
                      <span className="text-2xl mr-2">{character.emoji}</span>
                    )}
                    <p className="inline">{message.content}</p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-3 rounded-bl-md">
                    <span className="text-2xl mr-2">{character.emoji}</span>
                    <Loader2 className="w-4 h-4 inline animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Live Transcript */}
        {isRecording && transcript && (
          <Card className="mb-4 bg-primary/10 border-primary/30">
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">I'm hearing:</p>
              <p className="text-foreground font-medium">{transcript}</p>
            </CardContent>
          </Card>
        )}

        {/* Input Area */}
        <Card className="bg-card/90">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Input
                placeholder="Type a message or tap the mic..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isProcessing && sendMessage(textInput)}
                disabled={isRecording || isProcessing}
                className="flex-1 rounded-full"
              />
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => sendMessage(textInput)}
                disabled={!textInput.trim() || isProcessing || isRecording}
              >
                <Send className="w-5 h-5" />
              </Button>

              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? "bg-destructive animate-pulse" 
                    : "bg-accent-orange hover:bg-accent-orange/90"
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-6 h-6 text-destructive-foreground" />
                ) : (
                  <Mic className="w-6 h-6 text-primary-foreground" />
                )}
              </button>
            </div>
            
            <p className="text-center text-xs text-muted-foreground mt-2">
              {isRecording ? "Tap to stop and send" : "Tap mic to talk or type your message"}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FreeTalk;
