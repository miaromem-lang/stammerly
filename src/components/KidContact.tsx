import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Send, Loader2, User, Stethoscope, GraduationCap, Check, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KidMessage {
  id: string;
  recipient_role: "therapist" | "teacher";
  message: string;
  read_at: string | null;
  created_at: string;
}

interface KidContactProps {
  characterName: string;
  characterEmoji: string;
}

export const KidContact = ({ characterName, characterEmoji }: KidContactProps) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<KidMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"therapist" | "teacher">("therapist");
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      fetchMessages();
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("kid_messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data as KidMessage[]);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || sending) return;

    setSending(true);
    const msg = messageText.trim();
    setMessageText("");

    try {
      const { error } = await supabase.from("kid_messages").insert({
        recipient_role: activeTab,
        message: msg,
      });

      if (error) throw error;

      // Add to local state
      setMessages((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          recipient_role: activeTab,
          message: msg,
          read_at: null,
          created_at: new Date().toISOString(),
        },
      ]);

      toast.success(`Message sent to ${activeTab}! 📬`);
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Oops! Couldn't send your message. Try again!");
      setMessageText(msg);
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter((m) => m.recipient_role === activeTab);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-kids gap-2 bg-accent-sky/10 border-accent-sky/30 hover:bg-accent-sky/20">
          <MessageCircle className="w-5 h-5 text-accent-sky" />
          <span className="hidden sm:inline">Talk to My Team</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md h-[70vh] flex flex-col rounded-kids">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">{characterEmoji}</span>
            Send a Message!
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {characterName} can help you write to your therapist or teacher
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "therapist" | "teacher")} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 rounded-kids">
            <TabsTrigger value="therapist" className="rounded-kids gap-2">
              <Stethoscope className="w-4 h-4" />
              Therapist
            </TabsTrigger>
            <TabsTrigger value="teacher" className="rounded-kids gap-2">
              <GraduationCap className="w-4 h-4" />
              Teacher
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 flex flex-col mt-4">
            <ScrollArea className="flex-1 pr-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">{activeTab === "therapist" ? "🩺" : "📚"}</div>
                  <p className="text-muted-foreground text-sm">
                    No messages yet! Say hi to your {activeTab}!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  {filteredMessages.map((msg) => (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[80%] bg-accent-sky text-primary-foreground rounded-kids rounded-br-sm p-3">
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] opacity-70">{formatTime(msg.created_at)}</span>
                          {msg.read_at ? (
                            <CheckCheck className="w-3 h-3 text-success" />
                          ) : (
                            <Check className="w-3 h-3 opacity-70" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>
              )}
            </ScrollArea>

            {/* Quick message buttons */}
            <div className="flex gap-2 flex-wrap py-2">
              {activeTab === "therapist" ? (
                <>
                  <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setMessageText("I need help with an exercise!")}>
                    🆘 Need help
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setMessageText("I practiced today! 🎉")}>
                    ✅ I practiced!
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setMessageText("Can we try something new?")}>
                    🌟 Something new
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setMessageText("I spoke up in class today!")}>
                    🙋 Spoke in class
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setMessageText("I used my techniques at school!")}>
                    💪 Used techniques
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setMessageText("I read aloud today!")}>
                    📖 Read aloud
                  </Button>
                </>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2 pt-2 border-t">
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Write a message to your ${activeTab}...`}
                disabled={sending}
                className="flex-1 min-h-[60px] max-h-[100px] rounded-kids resize-none"
              />
              <Button
                onClick={sendMessage}
                disabled={sending || !messageText.trim()}
                className="rounded-kids self-end"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
