import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BookOpen, Sparkles, Play, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const StoryExercise = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const characterEmoji = searchParams.get('character') || '🦦';
  
  const [storyTopic, setStoryTopic] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [storyLength, setStoryLength] = useState("short");
  const [generatedStory, setGeneratedStory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  const difficultySettings = {
    beginner: { label: "Beginner", description: "Simple words, short sentences" },
    intermediate: { label: "Intermediate", description: "Medium complexity, varied sentences" },
    advanced: { label: "Advanced", description: "Rich vocabulary, longer passages" },
  };

  const lengthSettings = {
    short: { label: "Short (3-5 sentences)", sentences: 4 },
    medium: { label: "Medium (6-10 sentences)", sentences: 8 },
    long: { label: "Long (10-15 sentences)", sentences: 12 },
  };

  const handleGenerateStory = async () => {
    if (!storyTopic.trim()) {
      toast.error("Please enter what you'd like your story to be about!");
      return;
    }

    setIsLoading(true);
    setGeneratedStory("");
    setCurrentSentenceIndex(0);

    try {
      const { data, error } = await supabase.functions.invoke('generate-story', {
        body: {
          topic: storyTopic,
          difficulty,
          sentenceCount: lengthSettings[storyLength as keyof typeof lengthSettings].sentences,
        }
      });

      if (error) throw error;

      setGeneratedStory(data.story);
      toast.success("Story created! Let's practice reading!");
    } catch (error) {
      console.error('Error generating story:', error);
      // Fallback story if API fails
      const fallbackStory = generateFallbackStory(storyTopic, difficulty);
      setGeneratedStory(fallbackStory);
      toast.success("Story created! Let's practice reading!");
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackStory = (topic: string, difficulty: string) => {
    const stories: Record<string, string[]> = {
      beginner: [
        `Once upon a time, there was a friendly ${topic}.`,
        `The ${topic} liked to play every day.`,
        `One sunny morning, something special happened.`,
        `The ${topic} found a new friend.`,
        `They played together until sunset.`,
        `It was the best day ever!`,
      ],
      intermediate: [
        `In a magical forest, there lived a wonderful ${topic} who loved adventures.`,
        `Every morning, the ${topic} would explore new paths through the tall trees.`,
        `One day, while walking near the sparkling stream, an unexpected discovery was made.`,
        `A mysterious map had appeared, leading to a hidden treasure.`,
        `With courage and determination, the journey began.`,
        `After many exciting challenges, the treasure was finally found.`,
        `But the real treasure was the friends made along the way.`,
        `And from that day on, the forest felt even more magical.`,
      ],
      advanced: [
        `Deep within the enchanted valley, where ancient trees whispered secrets to the wind, there lived an extraordinary ${topic}.`,
        `Unlike others of their kind, this particular ${topic} possessed an insatiable curiosity about the world beyond the familiar meadows.`,
        `One particularly misty morning, as golden sunlight filtered through the canopy, an unexpected adventure began to unfold.`,
        `A mysterious traveler arrived, bearing tales of distant lands where mountains touched the clouds and rivers flowed with liquid starlight.`,
        `Inspired by these wondrous stories, our brave ${topic} made a momentous decision that would change everything.`,
        `The journey ahead would be challenging, filled with obstacles that would test both courage and wisdom.`,
        `But with each step forward, new strengths were discovered, and old fears began to fade away.`,
        `When the adventure finally came to its conclusion, the ${topic} returned home transformed.`,
        `The village gathered to hear the incredible tales, and everyone learned that true bravery comes from following one's heart.`,
      ],
    };

    return stories[difficulty]?.join(' ') || stories.beginner.join(' ');
  };

  const sentences = generatedStory.split(/(?<=[.!?])\s+/).filter(s => s.trim());

  const handleNextSentence = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
    } else {
      toast.success("Amazing job! You finished the story! 🎉");
    }
  };

  const handlePrevSentence = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-orange/10 via-sky-blue/10 to-gold/10">
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
              <span className="text-3xl">{characterEmoji}</span>
              <span className="font-display font-bold text-xl text-foreground">Story Adventure</span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {!generatedStory ? (
          /* Story Setup */
          <Card className="rounded-kids bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BookOpen className="w-6 h-6 text-accent-orange" />
                Create Your Story!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4 animate-bounce">{characterEmoji}</div>
                <p className="text-muted-foreground">
                  Your buddy is ready to read a story with you! What would you like it to be about?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic" className="text-lg">What's your story about?</Label>
                <Input
                  id="topic"
                  placeholder="e.g., dinosaurs, space adventures, magical unicorns..."
                  value={storyTopic}
                  onChange={(e) => setStoryTopic(e.target.value)}
                  className="text-lg p-4 rounded-kids"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>How hard should it be?</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="rounded-kids">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(difficultySettings).map(([key, val]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <p className="font-medium">{val.label}</p>
                            <p className="text-xs text-muted-foreground">{val.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>How long?</Label>
                  <Select value={storyLength} onValueChange={setStoryLength}>
                    <SelectTrigger className="rounded-kids">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(lengthSettings).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Therapist Recommendation */}
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Therapist Recommendation</p>
                      <p className="text-sm text-muted-foreground">
                        Based on your progress, try <strong>intermediate difficulty</strong> with topics you love. 
                        Focus on easy onset when starting sentences!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleGenerateStory}
                disabled={isLoading || !storyTopic.trim()}
                className="w-full rounded-kids text-lg py-6 bg-accent-orange hover:bg-accent-orange/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating your story...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Create My Story!
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Story Reading */
          <div className="space-y-6">
            <Card className="rounded-kids bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BookOpen className="w-6 h-6 text-accent-orange" />
                    Your Story: {storyTopic}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {currentSentenceIndex + 1} / {sentences.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Character Buddy */}
                <div className="text-center">
                  <div className="text-6xl mb-2 animate-float">{characterEmoji}</div>
                  <p className="text-sm text-muted-foreground">Read along with your buddy!</p>
                </div>

                {/* Current Sentence */}
                <Card className="bg-accent-orange/10 border-accent-orange/30">
                  <CardContent className="p-6">
                    <p className="text-2xl text-foreground leading-relaxed text-center font-medium">
                      {sentences[currentSentenceIndex]}
                    </p>
                  </CardContent>
                </Card>

                {/* Progress */}
                <div className="bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent-orange to-gold rounded-full transition-all duration-500"
                    style={{ width: `${((currentSentenceIndex + 1) / sentences.length) * 100}%` }}
                  />
                </div>

                {/* Navigation */}
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevSentence}
                    disabled={currentSentenceIndex === 0}
                    className="flex-1 rounded-kids"
                  >
                    ← Previous
                  </Button>
                  <Button 
                    onClick={() => navigate("/practice")}
                    variant="outline"
                    className="rounded-kids"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Practice This
                  </Button>
                  <Button 
                    onClick={handleNextSentence}
                    className="flex-1 rounded-kids bg-accent-orange hover:bg-accent-orange/90"
                  >
                    {currentSentenceIndex === sentences.length - 1 ? "Finish! 🎉" : "Next →"}
                  </Button>
                </div>

                {/* Tips */}
                <Card className="bg-gold/10 border-gold/30">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">💡 Tip:</strong> Take your time! 
                      Start each sentence gently and breathe between sentences.
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Full Story Preview */}
            <Card className="rounded-kids bg-card/60">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Full Story Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {sentences.map((sentence, i) => (
                    <span 
                      key={i} 
                      className={i === currentSentenceIndex ? "text-accent-orange font-medium" : ""}
                    >
                      {sentence}{" "}
                    </span>
                  ))}
                </p>
              </CardContent>
            </Card>

            <Button 
              variant="outline" 
              onClick={() => setGeneratedStory("")}
              className="w-full rounded-kids"
            >
              Create a New Story
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default StoryExercise;
