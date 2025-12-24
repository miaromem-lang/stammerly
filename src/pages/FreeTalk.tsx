import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mic, MicOff, Loader2, Send, Sparkles, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import PageBackground from "@/components/PageBackground";

interface Message {
  role: "user" | "assistant";
  content: string;
  disfluencies?: Array<{ type: string; word: string }>;
}

interface TopicPrompt {
  id: string;
  emoji: string;
  title: string;
  description: string;
  starterPrompt: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const topicPrompts: TopicPrompt[] = [
  // Beginner - Scripted/Guided
  { id: 'ordering', emoji: '☕', title: 'Order a Drink', description: 'Practice ordering at a café', starterPrompt: "Let's pretend I work at a café! What would you like to order today?", difficulty: 'beginner' },
  { id: 'intro', emoji: '👋', title: 'Say Hello', description: 'Practice introducing yourself', starterPrompt: "Let's practice introductions! Pretend we just met. Tell me your name and one thing you like!", difficulty: 'beginner' },
  { id: 'describe', emoji: '🖼️', title: 'Describe Something', description: 'Tell me about what you see', starterPrompt: "Look around you! Can you describe 3 things you see right now? I'm so curious!", difficulty: 'beginner' },
  { id: 'daily', emoji: '📅', title: 'My Day', description: 'Tell me about your day', starterPrompt: "I'd love to hear about your day! What did you do today? Start from when you woke up!", difficulty: 'beginner' },
  { id: 'weather', emoji: '🌤️', title: 'Weather Report', description: 'Be a weather reporter', starterPrompt: "You're a weather reporter on TV! Tell me about today's weather in 3 sentences!", difficulty: 'beginner' },
  
  // Intermediate - Controlled Persona
  { id: 'historian', emoji: '📚', title: 'The Historian', description: 'Share a cool fact', starterPrompt: "You're a historian! Tell me one interesting fact about history that you find amazing!", difficulty: 'intermediate' },
  { id: 'tech-guide', emoji: '📱', title: 'Tech Helper', description: 'Explain an app', starterPrompt: "Pretend I've never used a phone before! Can you teach me how to use your favorite app?", difficulty: 'intermediate' },
  { id: 'travel', emoji: '✈️', title: 'Travel Agent', description: 'Recommend a place', starterPrompt: "You're a travel agent! Recommend a city I should visit and tell me 3 reasons why!", difficulty: 'intermediate' },
  { id: 'chef', emoji: '👨‍🍳', title: 'The Chef', description: 'Teach me to cook', starterPrompt: "You're a chef on a cooking show! Teach me how to make something simple, step by step!", difficulty: 'intermediate' },
  { id: 'librarian', emoji: '📖', title: 'Book Expert', description: 'Tell me a story', starterPrompt: "You're a librarian! Tell me about your favorite book or movie - what's it about?", difficulty: 'intermediate' },
  
  // Advanced - Open-Ended
  { id: 'debate', emoji: '🤔', title: 'Silly Debate', description: 'Argue a fun topic', starterPrompt: "Let's have a silly debate! Here's the question: Is a hot dog a sandwich? What do YOU think?", difficulty: 'advanced' },
  { id: 'future', emoji: '🚀', title: 'Future Me', description: 'Imagine your future', starterPrompt: "Close your eyes and imagine... What will your life be like in 10 years? Tell me everything!", difficulty: 'advanced' },
  { id: 'alien', emoji: '👽', title: 'Explain to an Alien', description: 'Describe everyday things', starterPrompt: "I'm an alien who just landed on Earth! Can you explain what a 'school' is? I have no idea!", difficulty: 'advanced' },
  { id: 'critic', emoji: '🎬', title: 'Movie Critic', description: 'Review something', starterPrompt: "You're a movie critic! Tell me about a movie you watched recently - what did you love or not love?", difficulty: 'advanced' },
  { id: 'interview', emoji: '🎤', title: 'Big Questions', description: 'Answer tough questions', starterPrompt: "Imagine you're being interviewed! Here's a big question: What do you think is the most important thing kids should learn?", difficulty: 'advanced' },
];

const characters = [
  { id: "otter", name: "Echo the Otter", emoji: "🦦", personality: "playful and encouraging" },
  { id: "owl", name: "Luna the Owl", emoji: "🦉", personality: "wise and patient" },
  { id: "fox", name: "Finn the Fox", emoji: "🦊", personality: "clever and adventurous" },
  { id: "bunny", name: "Bella the Bunny", emoji: "🐰", personality: "gentle and kind" },
  { id: "monkey", name: "Max the Monkey", emoji: "🐵", personality: "fun and silly" },
];

const getDifficultyStyle = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return { color: 'bg-success/20 text-success border-success/30', label: 'Easy', emoji: '🌱' };
    case 'intermediate':
      return { color: 'bg-amber-500/20 text-amber-600 border-amber-500/30', label: 'Medium', emoji: '🌟' };
    case 'advanced':
      return { color: 'bg-purple-500/20 text-purple-600 border-purple-500/30', label: 'Challenge', emoji: '🏆' };
    default:
      return { color: 'bg-muted text-muted-foreground border-border', label: difficulty, emoji: '📚' };
  }
};

const FreeTalk = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const characterEmoji = searchParams.get('character') || '🦦';
  const character = characters.find(c => c.emoji === characterEmoji) || characters[0];
  
  const [showTopicPicker, setShowTopicPicker] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<TopicPrompt | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
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

  const startWithTopic = (topic: TopicPrompt) => {
    setSelectedTopic(topic);
    setShowTopicPicker(false);
    setMessages([
      { 
        role: "assistant", 
        content: `${topic.starterPrompt}` 
      }
    ]);
  };

  const startFreeTalk = () => {
    setShowTopicPicker(false);
    setSelectedTopic(null);
    setMessages([
      { 
        role: "assistant", 
        content: `Hi there! I'm ${character.name}! 🎉 I'm so excited to chat with you today. What would you like to talk about? I'm here to listen!` 
      }
    ]);
  };

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
    <div className="min-h-screen relative flex flex-col">
      <PageBackground />
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
        {/* Topic Picker */}
        {showTopicPicker ? (
          <div className="flex-1 flex flex-col">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 animate-bounce">{character.emoji}</div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                What should we talk about?
              </h2>
              <p className="text-muted-foreground">
                Pick a topic to practice, or just chat freely!
              </p>
            </div>

            {/* Free Talk Option */}
            <Card 
              className="mb-6 cursor-pointer hover:scale-[1.02] transition-all bg-gradient-to-r from-accent-orange/20 to-gold/20 border-accent-orange/30"
              onClick={startFreeTalk}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-orange/30 flex items-center justify-center text-2xl">
                  <MessageCircle className="w-6 h-6 text-accent-orange" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground">Just Chat!</h3>
                  <p className="text-sm text-muted-foreground">Talk about anything you want</p>
                </div>
                <Sparkles className="w-5 h-5 text-accent-orange" />
              </CardContent>
            </Card>

            {/* Topic Categories */}
            <div className="space-y-4 overflow-y-auto flex-1">
              {['beginner', 'intermediate', 'advanced'].map((difficulty) => {
                const style = getDifficultyStyle(difficulty);
                const topics = topicPrompts.filter(t => t.difficulty === difficulty);
                
                return (
                  <div key={difficulty}>
                    <div className="flex items-center gap-2 mb-2">
                      <span>{style.emoji}</span>
                      <h3 className="font-medium text-sm text-muted-foreground">{style.label} Topics</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {topics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => startWithTopic(topic)}
                          className={`p-3 rounded-kids text-left transition-all hover:scale-[1.02] border ${style.color}`}
                        >
                          <span className="text-2xl block mb-1">{topic.emoji}</span>
                          <h4 className="font-medium text-sm text-foreground">{topic.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">{topic.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Current Topic Badge */}
            {selectedTopic && (
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${getDifficultyStyle(selectedTopic.difficulty).color}`}>
                  <span>{selectedTopic.emoji}</span>
                  <span className="font-medium">{selectedTopic.title}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowTopicPicker(true)}
                  className="text-muted-foreground"
                >
                  Change Topic
                </Button>
              </div>
            )}

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
              <CardContent className="p-4 h-[45vh] overflow-y-auto">
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
          </>
        )}

        {/* Live Transcript - only show when not on topic picker */}
        {!showTopicPicker && isRecording && transcript && (
          <Card className="mb-4 bg-primary/10 border-primary/30">
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">I'm hearing:</p>
              <p className="text-foreground font-medium">{transcript}</p>
            </CardContent>
          </Card>
        )}

        {/* Input Area - only show when not on topic picker */}
        {!showTopicPicker && (
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
        )}
      </main>
    </div>
  );
};

export default FreeTalk;
