import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, FileText, MessageSquare, StickyNote } from "lucide-react";

const emojiOptions = [
  { emoji: "😃", label: "Great", value: "great" },
  { emoji: "😐", label: "Okay", value: "okay" },
  { emoji: "😟", label: "Struggled", value: "struggled" },
];

const commentBank = [
  "Student demonstrates improved fluency during structured activities.",
  "Requires additional wait time during verbal responses.",
  "Shows confidence when using learned techniques.",
  "Benefits from visual supports and cues.",
  "Engages well in small group discussions.",
  "Self-corrects during moments of disfluency.",
];

export const TeacherPortal = () => {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [selectedComment, setSelectedComment] = useState("");

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            Teacher Portal
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Actionable Insights for Inclusive Classrooms
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Frictionless tools designed for busy educators
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Pinned Strategy - Sticky Note */}
          <Card className="bg-gold/20 border-gold/30 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <StickyNote className="w-6 h-6 text-gold" />
                <span className="text-sm font-medium text-gold">Current Focus</span>
              </div>
              <p className="font-display text-xl font-semibold text-foreground leading-relaxed">
                "Give 5 seconds of 'Wait Time' after asking a question"
              </p>
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Set by SLP on 15 Dec 2024</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick-Action Widget */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-primary" />
                Quick Log
              </CardTitle>
              <p className="text-sm text-muted-foreground">One-tap observation</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                How did today's lesson go?
              </p>
              <div className="flex justify-center gap-4 mb-6">
                {emojiOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedEmoji(option.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                      selectedEmoji === option.value
                        ? "bg-primary/10 scale-110 shadow-lg"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <span className="text-4xl">{option.emoji}</span>
                    <span className="text-xs text-muted-foreground">{option.label}</span>
                  </button>
                ))}
              </div>
              <Button variant="navy" className="w-full" disabled={!selectedEmoji}>
                Submit Log
              </Button>
            </CardContent>
          </Card>
          
          {/* Comment Bank */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                IEP Comment Bank
              </CardTitle>
              <p className="text-sm text-muted-foreground">Evidence-based comments</p>
            </CardHeader>
            <CardContent>
              <Select value={selectedComment} onValueChange={setSelectedComment}>
                <SelectTrigger className="w-full mb-4">
                  <SelectValue placeholder="Select a comment..." />
                </SelectTrigger>
                <SelectContent>
                  {commentBank.map((comment, index) => (
                    <SelectItem key={index} value={comment}>
                      {comment.slice(0, 40)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedComment && (
                <div className="p-3 bg-secondary/50 rounded-lg text-sm text-foreground mb-4">
                  {selectedComment}
                </div>
              )}
              
              <Button variant="secondary" className="w-full">
                Copy to Clipboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
