import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Activity, Brain, Calendar, TrendingUp, Settings, FileBarChart } from "lucide-react";

const spmData = [
  { label: "Mon", home: 145, clinic: 160 },
  { label: "Tue", home: 152, clinic: 158 },
  { label: "Wed", home: 148, clinic: 165 },
  { label: "Thu", home: 155, clinic: 162 },
  { label: "Fri", home: 160, clinic: 168 },
];

const exercises = [
  { id: 1, name: "Easy Onset Practice", duration: "5 min", type: "Fluency" },
  { id: 2, name: "Breathing Exercises", duration: "3 min", type: "Foundation" },
  { id: 3, name: "Word Chains", duration: "8 min", type: "Fluency" },
  { id: 4, name: "Story Retell", duration: "10 min", type: "Carryover" },
];

export const TherapistPortal = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const maxSPM = 180;

  return (
    <section className="py-24 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-accent-sky/20 text-accent-sky px-4 py-2 rounded-full text-sm font-medium mb-4">
            Clinical Portal
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Precision Analytics & Clinical Accountability
          </h2>
          <p className="text-lg text-background/70 max-w-2xl mx-auto">
            Deep data insights for evidence-based therapy decisions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* SPM Graph */}
          <Card variant="dark" className="lg:col-span-2 border-background/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-background">
                  <TrendingUp className="w-5 h-5 text-accent-sky" />
                  Syllables Per Minute (SPM)
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-background/60">Show Overlay</span>
                  <Switch checked={showOverlay} onCheckedChange={setShowOverlay} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-sky" />
                  <span className="text-sm text-background/70">Clinic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-orange" />
                  <span className="text-sm text-background/70">Home</span>
                </div>
                {showOverlay && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-background/30" />
                    <span className="text-sm text-background/70">Baseline</span>
                  </div>
                )}
              </div>
              
              <div className="h-48 flex items-end gap-4">
                {spmData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex gap-1 items-end h-40">
                      <div 
                        className="flex-1 bg-accent-orange rounded-t transition-all duration-300"
                        style={{ height: `${(day.home / maxSPM) * 100}%` }}
                      />
                      <div 
                        className="flex-1 bg-accent-sky rounded-t transition-all duration-300"
                        style={{ height: `${(day.clinic / maxSPM) * 100}%` }}
                      />
                      {showOverlay && (
                        <div 
                          className="flex-1 bg-background/30 rounded-t"
                          style={{ height: "75%" }}
                        />
                      )}
                    </div>
                    <span className="text-xs text-background/60">{day.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* AI Confidence Score */}
          <Card variant="dark" className="border-background/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-background">
                <Brain className="w-5 h-5 text-success" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-background/20"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${0.92 * 352} 352`}
                      className="text-success"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-display font-bold text-background">92%</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-background/70 text-center">
                AI is <span className="text-success font-medium">92% confident</span> in this block detection
              </p>
              <p className="text-xs text-background/50 text-center mt-2">
                Always verify with clinical judgement
              </p>
            </CardContent>
          </Card>
          
          {/* Session Planner */}
          <Card variant="dark" className="lg:col-span-2 border-background/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-background">
                <Calendar className="w-5 h-5 text-accent-sky" />
                Session Planner
              </CardTitle>
              <p className="text-sm text-background/60">Drag exercises to push to child's app</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="p-4 rounded-lg bg-background/10 border border-background/20 cursor-move hover:bg-background/20 transition-colors"
                    draggable
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-background">{exercise.name}</span>
                      <span className="text-xs text-accent-sky">{exercise.type}</span>
                    </div>
                    <span className="text-xs text-background/60">{exercise.duration}</span>
                  </div>
                ))}
              </div>
              <Button variant="sky" className="w-full mt-4">
                Push to Child's App
              </Button>
            </CardContent>
          </Card>
          
          {/* Quick Stats */}
          <Card variant="dark" className="border-background/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-background">
                <FileBarChart className="w-5 h-5 text-accent-sky" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-background/70">Sessions this week</span>
                <span className="font-semibold text-background">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-background/70">Home practice %</span>
                <span className="font-semibold text-success">87%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-background/70">Avg. fluency score</span>
                <span className="font-semibold text-accent-sky">7.2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-background/70">Goal progress</span>
                <span className="font-semibold text-gold">65%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
