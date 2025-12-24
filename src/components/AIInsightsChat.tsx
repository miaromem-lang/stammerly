import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Send, Loader2, MessageSquare, Sparkles, User, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "therapist" | "ai";
  message: string;
  created_at: string;
}

interface QuestContext {
  questId: string;
  questTitle: string;
  exerciseCategory: string;
  therapistReason: string;
  aiFeedback: string | null;
  aiAgrees: boolean | null;
  aiAlternativeSuggestion: string | null;
  childAnalytics?: {
    totalSessions: number;
    avgFluency: number;
    totalBlocks: number;
    totalRepetitions: number;
    totalProlongations: number;
  };
}

interface AIInsightsChatProps {
  quest: QuestContext;
  trigger?: React.ReactNode;
}

export const AIInsightsChat = ({ quest, trigger }: AIInsightsChatProps) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      fetchConversation();
    }
  }, [open, quest.questId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchConversation = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("therapist_ai_conversations")
      .select("*")
      .eq("quest_id", quest.questId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setSending(true);

    // Optimistically add therapist message
    const tempId = `temp-${Date.now()}`;
    const therapistMsg: Message = {
      id: tempId,
      role: "therapist",
      message: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, therapistMsg]);

    try {
      // Save therapist message to DB
      await supabase.from("therapist_ai_conversations").insert({
        quest_id: quest.questId,
        role: "therapist",
        message: userMessage,
      });

      // Get AI response
      const { data, error } = await supabase.functions.invoke("therapist-ai-chat", {
        body: {
          questId: quest.questId,
          message: userMessage,
          conversationHistory: messages,
          questContext: quest,
        },
      });

      if (error) throw error;

      const aiMessage = data.message;

      // Save AI message to DB
      await supabase.from("therapist_ai_conversations").insert({
        quest_id: quest.questId,
        role: "ai",
        message: aiMessage,
      });

      // Add AI message to UI
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "ai",
          message: aiMessage,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to get AI response");
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInput(userMessage);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat with AI
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Insights Discussion
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Discuss recommendations for: <span className="font-medium">{quest.questTitle}</span>
          </p>
        </DialogHeader>

        {/* Quest Context Summary */}
        <Card className="bg-secondary/50 border-border/50">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-accent-sky" />
                  <span className="text-xs font-medium text-muted-foreground">Your reasoning:</span>
                </div>
                <p className="text-sm">{quest.therapistReason}</p>
              </div>
              <Badge variant={quest.aiAgrees ? "success" : "warning"} className="shrink-0">
                {quest.aiAgrees ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    AI Agrees
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    AI Differs
                  </>
                )}
              </Badge>
            </div>
            {quest.aiFeedback && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">AI's initial feedback:</span>
                </div>
                <p className="text-sm">{quest.aiFeedback}</p>
                {quest.aiAlternativeSuggestion && (
                  <p className="text-sm mt-2 p-2 bg-gold/10 rounded border border-gold/20">
                    <strong>Alternative:</strong> {quest.aiAlternativeSuggestion}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary/50" />
              <p className="text-sm">Start a conversation with AI about this recommendation.</p>
              <p className="text-xs mt-1">Ask questions, share observations, or discuss alternatives.</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "therapist" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Brain className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      msg.role === "therapist"
                        ? "bg-accent-sky text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  {msg.role === "therapist" && (
                    <div className="w-8 h-8 rounded-full bg-accent-sky/20 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-accent-sky" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 pt-2 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question or share your thoughts..."
            disabled={sending}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={sending || !input.trim()}>
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
