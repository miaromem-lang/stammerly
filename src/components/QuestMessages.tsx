import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Loader2, User, Stethoscope, Baby } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  quest_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
}

interface QuestMessagesProps {
  questId: string;
  questTitle: string;
  senderRole: "therapist" | "parent" | "child";
  senderName: string;
  compact?: boolean;
  unreadCount?: number;
  onOpen?: () => void;
}

export const QuestMessages = ({ 
  questId, 
  questTitle, 
  senderRole, 
  senderName,
  compact = false,
  unreadCount = 0,
  onOpen
}: QuestMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`quest-messages-${questId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quest_messages',
          filter: `quest_id=eq.${questId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [questId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("quest_messages")
      .select("*")
      .eq("quest_id", questId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    const { error } = await supabase
      .from("quest_messages")
      .insert({
        quest_id: questId,
        sender_name: senderName,
        sender_role: senderRole,
        message: newMessage.trim()
      });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "therapist":
        return <Stethoscope className="w-3 h-3" />;
      case "parent":
        return <User className="w-3 h-3" />;
      case "child":
        return <Baby className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "therapist":
        return "bg-accent-sky/20 text-accent-sky border-accent-sky/30";
      case "parent":
        return "bg-primary/20 text-primary border-primary/30";
      case "child":
        return "bg-success/20 text-success border-success/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
    onOpen?.();
  };

  if (compact && !isExpanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExpand}
        className="text-muted-foreground hover:text-foreground gap-2 relative"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-xs">
          {messages.length > 0 ? `${messages.length} messages` : "Start chat"}
        </span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden",
      compact ? "mt-3" : "h-full flex flex-col"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium truncate max-w-[200px]">
            {compact ? "Discussion" : questTitle}
          </span>
        </div>
        {compact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-xs h-6 px-2"
          >
            Collapse
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea 
        ref={scrollRef}
        className={cn(
          "flex-1 p-3",
          compact ? "max-h-48" : "min-h-[200px] max-h-[400px]"
        )}
      >
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No messages yet. Start the conversation!
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isOwnMessage = msg.sender_role === senderRole;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-1",
                    isOwnMessage ? "items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-medium",
                      getRoleColor(msg.sender_role)
                    )}>
                      {getRoleIcon(msg.sender_role)}
                      {msg.sender_name}
                    </span>
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString([], { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </span>
                  </div>
                  <div className={cn(
                    "px-3 py-2 rounded-lg max-w-[85%] text-sm",
                    isOwnMessage 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}>
                    {msg.message}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t bg-background">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            className="flex-1 h-9 text-sm"
          />
          <Button
            size="sm"
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="h-9 px-3"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
