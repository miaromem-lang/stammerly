import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Conversation {
  id: string;
  quest_id: string | null;
  role: string;
  message: string;
  created_at: string;
}

interface Quest {
  id: string;
  quest_title: string;
  therapist_reason: string;
  ai_agrees: boolean | null;
  ai_feedback: string | null;
  ai_alternative_suggestion: string | null;
  chosen_recommendation: string | null;
  created_at: string;
}

interface GroupedConversation {
  quest: Quest;
  messages: Conversation[];
}

export const AILearningHistory = () => {
  const [groupedConversations, setGroupedConversations] = useState<GroupedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuests, setExpandedQuests] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalConversations: 0,
    agreementRate: 0,
    therapistChosenRate: 0,
    aiChosenRate: 0,
    learningMoments: 0,
  });

  useEffect(() => {
    fetchLearningHistory();
  }, []);

  const fetchLearningHistory = async () => {
    try {
      // Fetch all quests with AI feedback
      const { data: quests, error: questsError } = await supabase
        .from("therapist_assigned_quests")
        .select("*")
        .not("ai_feedback", "is", null)
        .order("created_at", { ascending: false });

      if (questsError) throw questsError;

      // Fetch all conversations
      const { data: conversations, error: convError } = await supabase
        .from("therapist_ai_conversations")
        .select("*")
        .order("created_at", { ascending: true });

      if (convError) throw convError;

      // Group conversations by quest
      const grouped: GroupedConversation[] = (quests || []).map((quest) => ({
        quest: quest as Quest,
        messages: (conversations || []).filter((c) => c.quest_id === quest.id) as Conversation[],
      }));

      setGroupedConversations(grouped);

      // Calculate stats
      const totalQuests = quests?.length || 0;
      const agreedQuests = quests?.filter((q) => q.ai_agrees === true).length || 0;
      const therapistChosen = quests?.filter((q) => q.chosen_recommendation === "therapist").length || 0;
      const aiChosen = quests?.filter((q) => q.chosen_recommendation === "ai").length || 0;
      const questsWithConversations = grouped.filter((g) => g.messages.length > 0).length;

      setStats({
        totalConversations: conversations?.length || 0,
        agreementRate: totalQuests > 0 ? Math.round((agreedQuests / totalQuests) * 100) : 0,
        therapistChosenRate: totalQuests > 0 ? Math.round((therapistChosen / totalQuests) * 100) : 0,
        aiChosenRate: totalQuests > 0 ? Math.round((aiChosen / totalQuests) * 100) : 0,
        learningMoments: questsWithConversations,
      });
    } catch (err) {
      console.error("Error fetching learning history:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (questId: string) => {
    setExpandedQuests((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questId)) {
        newSet.delete(questId);
      } else {
        newSet.add(questId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <Card variant="dark" className="border-background/10">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-background/50" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="dark" className="border-background/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-background">
          <GraduationCap className="w-5 h-5 text-accent-sky" />
          AI Learning History
        </CardTitle>
        <p className="text-sm text-background/60">
          Track how AI and therapist recommendations evolve through collaboration
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-background/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-background">{stats.totalConversations}</div>
            <div className="text-xs text-background/60">Total Messages</div>
          </div>
          <div className="bg-background/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-success">{stats.agreementRate}%</div>
            <div className="text-xs text-background/60">AI Agreement</div>
          </div>
          <div className="bg-background/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-accent-sky">{stats.therapistChosenRate}%</div>
            <div className="text-xs text-background/60">Therapist Chosen</div>
          </div>
          <div className="bg-background/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gold">{stats.learningMoments}</div>
            <div className="text-xs text-background/60">Discussions</div>
          </div>
        </div>

        {/* Conversation Timeline */}
        <ScrollArea className="h-[400px] pr-4">
          {groupedConversations.length === 0 ? (
            <div className="text-center py-8 text-background/50">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No AI-therapist conversations yet</p>
              <p className="text-sm mt-1">Start assigning quests to begin collaborating with AI</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedConversations.map((group) => (
                <div
                  key={group.quest.id}
                  className="bg-background/5 rounded-lg border border-background/10 overflow-hidden"
                >
                  {/* Quest Header */}
                  <button
                    onClick={() => toggleExpand(group.quest.id)}
                    className="w-full p-4 flex items-start gap-3 hover:bg-background/10 transition-colors text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-background">{group.quest.quest_title}</span>
                        {group.quest.ai_agrees ? (
                          <Badge variant="outline" className="bg-success/20 text-success border-success/30 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            AI Agreed
                          </Badge>
                        ) : group.quest.ai_agrees === false ? (
                          <Badge variant="outline" className="bg-accent-orange/20 text-accent-orange border-accent-orange/30 text-xs">
                            <XCircle className="w-3 h-3 mr-1" />
                            AI Disagreed
                          </Badge>
                        ) : null}
                        {group.quest.chosen_recommendation && (
                          <Badge variant="outline" className="bg-accent-sky/20 text-accent-sky border-accent-sky/30 text-xs">
                            {group.quest.chosen_recommendation === "therapist" ? "Therapist" : "AI"} Chosen
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-background/50">
                        <Clock className="w-3 h-3" />
                        {format(new Date(group.quest.created_at), "MMM d, yyyy")}
                        <span className="mx-1">•</span>
                        <MessageSquare className="w-3 h-3" />
                        {group.messages.length} messages
                      </div>
                    </div>
                    {expandedQuests.has(group.quest.id) ? (
                      <ChevronUp className="w-5 h-5 text-background/50" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-background/50" />
                    )}
                  </button>

                  {/* Expanded Content */}
                  {expandedQuests.has(group.quest.id) && (
                    <div className="px-4 pb-4 space-y-3 border-t border-background/10 pt-3">
                      {/* Initial Context */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-background/70">Therapist's Reasoning:</div>
                        <p className="text-sm text-background/80 bg-background/10 rounded p-2">
                          {group.quest.therapist_reason}
                        </p>
                      </div>

                      {group.quest.ai_feedback && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-background/70">AI Feedback:</div>
                          <p className="text-sm text-background/80 bg-accent-sky/10 rounded p-2">
                            {group.quest.ai_feedback}
                          </p>
                        </div>
                      )}

                      {group.quest.ai_alternative_suggestion && !group.quest.ai_agrees && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-background/70">AI Alternative:</div>
                          <p className="text-sm text-background/80 bg-gold/10 rounded p-2">
                            {group.quest.ai_alternative_suggestion}
                          </p>
                        </div>
                      )}

                      {/* Conversation Thread */}
                      {group.messages.length > 0 && (
                        <div className="space-y-2 mt-4">
                          <div className="text-xs font-medium text-background/70 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Discussion Thread
                          </div>
                          <div className="space-y-2">
                            {group.messages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`p-2 rounded text-sm ${
                                  msg.role === "therapist"
                                    ? "bg-accent-sky/10 text-background ml-0 mr-8"
                                    : "bg-success/10 text-background ml-8 mr-0"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium capitalize">
                                    {msg.role === "therapist" ? "👨‍⚕️ Therapist" : "🤖 AI"}
                                  </span>
                                  <span className="text-xs text-background/50">
                                    {format(new Date(msg.created_at), "MMM d, h:mm a")}
                                  </span>
                                </div>
                                <p className="text-background/80">{msg.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
