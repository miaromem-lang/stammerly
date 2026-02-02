import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Activity, Brain, Target, FileText, Grid3X3, Clock, Loader2, RefreshCw, Repeat } from "lucide-react";
import { HubNavigation } from "@/components/HubNavigation";
import PageBackground from "@/components/PageBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import {
  SurfaceCommandCentre,
  TemporalProsodyCentre,
  PhonemeTriggerHeatmap,
  TechniqueAccuracyTracker,
  IcebergCommandCentre,
  ActionCommandCentre,
  AdaptationConsistencyTracker,
} from "@/components/therapist";

// Mock patients for demo
const patients = [
  { id: "all", name: "All Patients" },
  { id: "1", name: "Alex M." },
  { id: "2", name: "Jordan S." },
  { id: "3", name: "Sam T." },
];

interface ClinicalMetrics {
  // Surface metrics
  weightedStutteringSeverity: number;
  percentSyllablesStuttered: number;
  sldCount: number;
  odCount: number;
  syllablesPerMinute: number;
  articulationRate: number;
  blocksCount: number;
  prolongationsCount: number;
  repetitionsCount: number;
  
  // Temporal/Prosodic
  initiationLagMs: number | null;
  naturalnessScore: number | null;
  linguisticPausesCount: number;
  stutterHesitationsCount: number;
  avgPauseDurationMs: number | null;
  
  // Phoneme triggers
  phonemeTriggers: Array<{
    phoneme: string;
    count: number;
    avgDurationMs: number;
    words: string[];
  }>;
  wordAvoidances: string[];
  
  // Technique tracking
  easyOnsetScore: number | null;
  easyOnsetAttempts: number;
  easyOnsetSuccesses: number;
  softContactScore: number | null;
  techniquesObserved: string[];
  
  // Iceberg metrics
  objectiveSeverity: number;
  subjectiveRating: number | null;
  
  // Adaptation & Consistency metrics
  adaptationScore: number | null;
  consistencyWords: string[];
  improvingWords: string[];
  trials: Array<{
    trialNumber: number;
    stutterCount: number;
    stutteredWords: string[];
    timestamp: string;
  }>;
  targetPhrase: string | null;
  
  // Action metrics
  totalSessions: number;
  totalPracticeMinutes: number;
  streakDays: number;
  adherenceRate: number;
  lastSessionDate: string | null;
  averageSessionsPerWeek: number;
}

const TherapistAnalyticsHub = () => {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState("all");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ClinicalMetrics | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchClinicalMetrics();
  }, [selectedPatient]);

  const fetchClinicalMetrics = async () => {
    setLoading(true);
    try {
      // Fetch practice sessions with clinical metrics
      const { data: sessions, error: sessionsError } = await supabase
        .from("practice_sessions")
        .select("*")
        .order("session_date", { ascending: false })
        .limit(50);

      if (sessionsError) throw sessionsError;

      // Fetch streak data
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("*")
        .limit(1)
        .single();

      // Fetch subjective ratings
      const { data: ratings } = await supabase
        .from("daily_fluency_ratings")
        .select("*")
        .order("rating_date", { ascending: false })
        .limit(7);

      // Aggregate metrics from sessions
      const totalSessions = sessions?.length || 0;
      const totalSeconds = sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0;
      
      // Calculate averages
      const avgFluency = sessions?.length 
        ? sessions.reduce((sum, s) => sum + (s.fluency_score || 0), 0) / sessions.length 
        : 0;
      
      const blocksTotal = sessions?.reduce((sum, s) => sum + (s.blocks_count || 0), 0) || 0;
      const prolongationsTotal = sessions?.reduce((sum, s) => sum + (s.prolongations_count || 0), 0) || 0;
      const repetitionsTotal = sessions?.reduce((sum, s) => sum + (s.repetitions_count || 0), 0) || 0;
      const interjectionsTotal = sessions?.reduce((sum, s) => sum + (s.interjections_count || 0), 0) || 0;

      // Calculate WSS approximation
      const sldCount = blocksTotal + prolongationsTotal + repetitionsTotal;
      const odCount = interjectionsTotal;
      
      // Build phoneme trigger summary from recent sessions
      const phonemeTriggers: ClinicalMetrics['phonemeTriggers'] = [];
      
      // Parse phoneme_triggers from sessions if available
      sessions?.forEach(session => {
        const triggers = session.phoneme_triggers as Array<{ phoneme: string; count: number; avgDurationMs: number; words: string[] }> | null;
        if (triggers && Array.isArray(triggers)) {
          triggers.forEach(trigger => {
            const existing = phonemeTriggers.find(p => p.phoneme === trigger.phoneme);
            if (existing) {
              existing.count += trigger.count;
              existing.words = [...new Set([...existing.words, ...trigger.words])];
            } else {
              phonemeTriggers.push({ ...trigger });
            }
          });
        }
      });

      // Sort by count
      phonemeTriggers.sort((a, b) => b.count - a.count);

      // Calculate adherence (sessions in last 7 days / 7 * 100)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentSessions = sessions?.filter(s => 
        new Date(s.session_date) >= sevenDaysAgo
      ).length || 0;
      const adherenceRate = Math.min(100, (recentSessions / 7) * 100);

      // Average sessions per week
      const firstSession = sessions?.[sessions.length - 1]?.session_date;
      const weeksSinceStart = firstSession 
        ? Math.max(1, Math.floor((Date.now() - new Date(firstSession).getTime()) / (7 * 24 * 60 * 60 * 1000)))
        : 1;
      const avgSessionsPerWeek = totalSessions / weeksSinceStart;

      // Latest subjective rating
      const latestRating = ratings?.[0]?.rating || null;

      // Build adaptation/consistency data from sessions with same target phrase
      const targetPhrase = sessions?.[0]?.target_phrase || null;
      const trialsForSamePhrase = targetPhrase 
        ? sessions?.filter(s => s.target_phrase === targetPhrase)
            .slice(0, 5) // Limit to 5 most recent trials
            .reverse() // Show oldest first
            .map((s, idx) => ({
              trialNumber: idx + 1,
              stutterCount: (s.blocks_count || 0) + (s.prolongations_count || 0) + (s.repetitions_count || 0),
              stutteredWords: [], // Would come from actual word-level analysis
              timestamp: s.session_date,
            }))
        : [];
      
      // Calculate adaptation score (% reduction from first to last trial)
      const adaptationScore = trialsForSamePhrase.length >= 2
        ? ((trialsForSamePhrase[0].stutterCount - trialsForSamePhrase[trialsForSamePhrase.length - 1].stutterCount) 
           / Math.max(1, trialsForSamePhrase[0].stutterCount)) * 100
        : null;
      
      // Extract consistency words from session data
      const consistencyWords = sessions?.[0]?.consistency_words as string[] || [];
      
      // Identify improving words (placeholder - would need word-level tracking)
      const improvingWords: string[] = [];

      setMetrics({
        // Surface
        weightedStutteringSeverity: 100 - avgFluency, // Approximate
        percentSyllablesStuttered: sldCount > 0 ? (sldCount / (totalSessions * 50)) * 100 : 0,
        sldCount,
        odCount,
        syllablesPerMinute: 120, // Would come from actual analysis
        articulationRate: 140,
        blocksCount: blocksTotal,
        prolongationsCount: prolongationsTotal,
        repetitionsCount: repetitionsTotal,
        
        // Temporal
        initiationLagMs: null,
        naturalnessScore: 5,
        linguisticPausesCount: 0,
        stutterHesitationsCount: 0,
        avgPauseDurationMs: null,
        
        // Phoneme
        phonemeTriggers,
        wordAvoidances: [],
        
        // Technique
        easyOnsetScore: sessions?.[0]?.easy_onset_score || null,
        easyOnsetAttempts: 0,
        easyOnsetSuccesses: 0,
        softContactScore: null,
        techniquesObserved: [],
        
        // Iceberg
        objectiveSeverity: 100 - avgFluency,
        subjectiveRating: latestRating,
        
        // Adaptation & Consistency
        adaptationScore,
        consistencyWords,
        improvingWords,
        trials: trialsForSamePhrase,
        targetPhrase,
        
        // Action
        totalSessions,
        totalPracticeMinutes: Math.round(totalSeconds / 60),
        streakDays: streakData?.current_streak || 0,
        adherenceRate,
        lastSessionDate: sessions?.[0]?.session_date || null,
        averageSessionsPerWeek: avgSessionsPerWeek,
      });

    } catch (error) {
      console.error("Error fetching clinical metrics:", error);
      toast.error("Failed to load clinical metrics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <PageBackground />
        <HubNavigation />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <HubNavigation />
      
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate("/therapist-hub")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Portal</span>
            </button>
            
            <h1 className="font-display font-bold text-xl text-foreground">
              Clinical Analytics Hub
            </h1>
            
            <div className="flex items-center gap-3">
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={fetchClinicalMetrics}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {metrics ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-7 w-full max-w-4xl mx-auto">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="surface" className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Surface</span>
              </TabsTrigger>
              <TabsTrigger value="temporal" className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Temporal</span>
              </TabsTrigger>
              <TabsTrigger value="phoneme" className="flex items-center gap-1">
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Phonemes</span>
              </TabsTrigger>
              <TabsTrigger value="adaptation" className="flex items-center gap-1">
                <Repeat className="w-4 h-4" />
                <span className="hidden sm:inline">Adaptation</span>
              </TabsTrigger>
              <TabsTrigger value="technique" className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Technique</span>
              </TabsTrigger>
              <TabsTrigger value="iceberg" className="flex items-center gap-1">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">Iceberg</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab - All compact cards */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-4">
                <SurfaceCommandCentre 
                  metrics={{
                    weightedStutteringSeverity: metrics.weightedStutteringSeverity,
                    percentSyllablesStuttered: metrics.percentSyllablesStuttered,
                    sldCount: metrics.sldCount,
                    odCount: metrics.odCount,
                    syllablesPerMinute: metrics.syllablesPerMinute,
                    articulationRate: metrics.articulationRate,
                    blocksCount: metrics.blocksCount,
                    prolongationsCount: metrics.prolongationsCount,
                    repetitionsCount: metrics.repetitionsCount,
                  }}
                  compact
                />
                
                <TemporalProsodyCentre 
                  metrics={{
                    initiationLagMs: metrics.initiationLagMs,
                    naturalnessScore: metrics.naturalnessScore,
                    linguisticPausesCount: metrics.linguisticPausesCount,
                    stutterHesitationsCount: metrics.stutterHesitationsCount,
                    avgPauseDurationMs: metrics.avgPauseDurationMs,
                  }}
                  compact
                />
                
                <PhonemeTriggerHeatmap 
                  triggers={metrics.phonemeTriggers}
                  wordAvoidances={metrics.wordAvoidances}
                  compact
                />
                
                <TechniqueAccuracyTracker 
                  metrics={{
                    easyOnsetScore: metrics.easyOnsetScore,
                    easyOnsetAttempts: metrics.easyOnsetAttempts,
                    easyOnsetSuccesses: metrics.easyOnsetSuccesses,
                    softContactScore: metrics.softContactScore,
                    techniquesObserved: metrics.techniquesObserved,
                  }}
                  compact
                />
                
                <IcebergCommandCentre 
                  metrics={{
                    objectiveSeverity: metrics.objectiveSeverity,
                    subjectiveRating: metrics.subjectiveRating,
                  }}
                  compact
                />
                
                <ActionCommandCentre 
                  metrics={{
                    totalSessions: metrics.totalSessions,
                    totalPracticeMinutes: metrics.totalPracticeMinutes,
                    streakDays: metrics.streakDays,
                    adherenceRate: metrics.adherenceRate,
                    lastSessionDate: metrics.lastSessionDate,
                    averageSessionsPerWeek: metrics.averageSessionsPerWeek,
                  }}
                  compact
                />
                
                <AdaptationConsistencyTracker 
                  metrics={{
                    trials: metrics.trials,
                    adaptationScore: metrics.adaptationScore,
                    consistencyWords: metrics.consistencyWords,
                    improvingWords: metrics.improvingWords,
                    targetPhrase: metrics.targetPhrase,
                  }}
                  compact
                />
              </div>
            </TabsContent>

            {/* Surface Tab */}
            <TabsContent value="surface">
              <SurfaceCommandCentre 
                metrics={{
                  weightedStutteringSeverity: metrics.weightedStutteringSeverity,
                  percentSyllablesStuttered: metrics.percentSyllablesStuttered,
                  sldCount: metrics.sldCount,
                  odCount: metrics.odCount,
                  syllablesPerMinute: metrics.syllablesPerMinute,
                  articulationRate: metrics.articulationRate,
                  blocksCount: metrics.blocksCount,
                  prolongationsCount: metrics.prolongationsCount,
                  repetitionsCount: metrics.repetitionsCount,
                }}
              />
            </TabsContent>

            {/* Temporal Tab */}
            <TabsContent value="temporal">
              <TemporalProsodyCentre 
                metrics={{
                  initiationLagMs: metrics.initiationLagMs,
                  naturalnessScore: metrics.naturalnessScore,
                  linguisticPausesCount: metrics.linguisticPausesCount,
                  stutterHesitationsCount: metrics.stutterHesitationsCount,
                  avgPauseDurationMs: metrics.avgPauseDurationMs,
                }}
              />
            </TabsContent>

            {/* Phoneme Tab */}
            <TabsContent value="phoneme">
              <PhonemeTriggerHeatmap 
                triggers={metrics.phonemeTriggers}
                wordAvoidances={metrics.wordAvoidances}
              />
            </TabsContent>

            {/* Adaptation Tab */}
            <TabsContent value="adaptation">
              <AdaptationConsistencyTracker 
                metrics={{
                  trials: metrics.trials,
                  adaptationScore: metrics.adaptationScore,
                  consistencyWords: metrics.consistencyWords,
                  improvingWords: metrics.improvingWords,
                  targetPhrase: metrics.targetPhrase,
                }}
              />
            </TabsContent>

            {/* Technique Tab */}
            <TabsContent value="technique">
              <TechniqueAccuracyTracker 
                metrics={{
                  easyOnsetScore: metrics.easyOnsetScore,
                  easyOnsetAttempts: metrics.easyOnsetAttempts,
                  easyOnsetSuccesses: metrics.easyOnsetSuccesses,
                  softContactScore: metrics.softContactScore,
                  techniquesObserved: metrics.techniquesObserved,
                }}
              />
            </TabsContent>

            {/* Iceberg Tab */}
            <TabsContent value="iceberg" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <IcebergCommandCentre 
                  metrics={{
                    objectiveSeverity: metrics.objectiveSeverity,
                    subjectiveRating: metrics.subjectiveRating,
                  }}
                />
                
                <ActionCommandCentre 
                  metrics={{
                    totalSessions: metrics.totalSessions,
                    totalPracticeMinutes: metrics.totalPracticeMinutes,
                    streakDays: metrics.streakDays,
                    adherenceRate: metrics.adherenceRate,
                    lastSessionDate: metrics.lastSessionDate,
                    averageSessionsPerWeek: metrics.averageSessionsPerWeek,
                  }}
                  relapseRisk={{
                    avoidanceTrend: 'stable',
                    fluencyTrend: metrics.weightedStutteringSeverity < 30 ? 'improving' : 'stable',
                    engagementTrend: metrics.adherenceRate > 60 ? 'stable' : 'decreasing',
                    overallRisk: metrics.adherenceRate < 40 ? 'high' : 
                                 metrics.adherenceRate < 60 ? 'medium' : 'low',
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="glass-card-strong">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No clinical data available yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Practice sessions will populate the analytics dashboard.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TherapistAnalyticsHub;
