import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Activity, Brain, Target, FileText, Grid3X3, Clock, Loader2, RefreshCw, Repeat, MapPin, Pause, Shield, Camera } from "lucide-react";
import { HubNavigation } from "@/components/HubNavigation";
import PageBackground from "@/components/PageBackground";
import AIInsightsExplainer from "@/components/AIInsightsExplainer";
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
  PauseArchitectureTracker,
  WordAvoidanceTracker,
  SituationalHeatmap,
  SOAPNoteGenerator,
  PredictiveRelapseRisk,
  ConcomitantMovementTracker,
  MoodFluencyCorrelation,
} from "@/components/therapist";

// Mock patients for demo
const patients = [
  { id: "all", name: "All Patients" },
  { id: "1", name: "Alex M." },
  { id: "2", name: "Jordan S." },
  { id: "3", name: "Sam T." },
];

interface EnvironmentData {
  environment: string;
  sessionCount: number;
  avgFluency: number;
  avgAnxiety?: number | null;
  trend?: 'improving' | 'stable' | 'declining';
}

interface TaskTypeData {
  category: string;
  percentSS: number;
  sessionCount: number;
}

interface AcousticOnsetData {
  easyOnsetSignatures: number;
  partialOnsetSignatures: number;
  hardOnsetSignatures: number;
  overallEasyOnsetScore: number;
}

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
  
  // Task type breakdown for %SS comparison
  taskTypeData: TaskTypeData[];
  
  // Temporal/Prosodic
  initiationLagMs: number | null;
  naturalnessScore: number | null;
  linguisticPausesCount: number;
  stutterHesitationsCount: number;
  avgPauseDurationMs: number | null;
  longestBlockMs: number | null;
  secondLongestBlockMs: number | null;
  thirdLongestBlockMs: number | null;
  
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
  acousticAnalysis: AcousticOnsetData | null;
  
  // Iceberg metrics
  objectiveSeverity: number;
  subjectiveRating: number | null;
  
  // Environment data
  environmentData: EnvironmentData[];
  
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
  
  // Historical for relapse risk
  previousAdherence: number;
  previousFluency: number;
  previousAvoidanceCount: number;
  previousTechniqueSuccessRate: number;
}

const TherapistAnalyticsHub = () => {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState("all");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ClinicalMetrics | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [moodData, setMoodData] = useState<{ recentMoodAvg: number | null; recentAnxietyAvg: number | null; moodTrend: "improving" | "declining" | "stable" | null; moodCheckinCount: number }>({ recentMoodAvg: null, recentAnxietyAvg: null, moodTrend: null, moodCheckinCount: 0 });

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

      // Build environment data from sessions
      const envMap = new Map<string, { count: number; totalFluency: number }>();
      sessions?.forEach(s => {
        const env = s.environment_type || 'app';
        const existing = envMap.get(env) || { count: 0, totalFluency: 0 };
        existing.count++;
        existing.totalFluency += s.fluency_score || 0;
        envMap.set(env, existing);
      });
      
      const environmentData: EnvironmentData[] = Array.from(envMap.entries()).map(([env, data]) => ({
        environment: env,
        sessionCount: data.count,
        avgFluency: data.count > 0 ? data.totalFluency / data.count : 0,
      }));
      
      // Build task type data for %SS comparison chart
      const categoryMap = new Map<string, { count: number; totalSLD: number; totalSyllables: number }>();
      sessions?.forEach(s => {
        const category = s.exercise_category || 'other';
        const existing = categoryMap.get(category) || { count: 0, totalSLD: 0, totalSyllables: 0 };
        existing.count++;
        existing.totalSLD += (s.sld_count || 0);
        // Estimate syllables from duration (assuming ~120 SPM average)
        const estimatedSyllables = s.duration_seconds ? Math.round((s.duration_seconds / 60) * 120) : 50;
        existing.totalSyllables += estimatedSyllables;
        categoryMap.set(category, existing);
      });
      
      const taskTypeData: TaskTypeData[] = Array.from(categoryMap.entries())
        .filter(([_, data]) => data.count >= 1)
        .map(([category, data]) => ({
          category,
          percentSS: data.totalSyllables > 0 ? (data.totalSLD / data.totalSyllables) * 100 : 0,
          sessionCount: data.count,
        }))
        .sort((a, b) => b.sessionCount - a.sessionCount);
      
      // Collect word avoidances from sessions
      const allWordAvoidances: string[] = [];
      sessions?.forEach(s => {
        const avoidances = s.word_avoidances as string[] | null;
        if (avoidances && Array.isArray(avoidances)) {
          allWordAvoidances.push(...avoidances);
        }
      });
      const uniqueWordAvoidances = [...new Set(allWordAvoidances)];
      
      // Get pause metrics from most recent session
      const latestSession = sessions?.[0];
      const linguisticPausesCount = latestSession?.linguistic_pauses_count || 0;
      const stutterHesitationsCount = latestSession?.stutter_hesitations_count || 0;
      const avgPauseDurationMs = latestSession?.avg_pause_duration_ms || null;
      const longestBlockMs = latestSession?.longest_block_ms || null;
      const secondLongestBlockMs = latestSession?.second_longest_block_ms || null;
      const thirdLongestBlockMs = latestSession?.third_longest_block_ms || null;
      
      // Calculate previous period metrics for relapse risk (sessions 8-14 days ago)
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const previousPeriodSessions = sessions?.filter(s => {
        const date = new Date(s.session_date);
        return date >= fourteenDaysAgo && date < sevenDaysAgo;
      }) || [];
      
      const previousAdherence = Math.min(100, (previousPeriodSessions.length / 7) * 100);
      const previousFluency = previousPeriodSessions.length > 0
        ? previousPeriodSessions.reduce((sum, s) => sum + (s.fluency_score || 0), 0) / previousPeriodSessions.length
        : avgFluency;
      
      // Calculate technique success rates
      const totalAttempts = sessions?.reduce((sum, s) => sum + (s.easy_onset_attempts || 0), 0) || 0;
      const totalSuccesses = sessions?.reduce((sum, s) => sum + (s.easy_onset_successes || 0), 0) || 0;
      const techniqueSuccessRate = totalAttempts > 0 ? (totalSuccesses / totalAttempts) * 100 : 50;
      
      const prevAttempts = previousPeriodSessions.reduce((sum, s) => sum + (s.easy_onset_attempts || 0), 0);
      const prevSuccesses = previousPeriodSessions.reduce((sum, s) => sum + (s.easy_onset_successes || 0), 0);
      const previousTechniqueSuccessRate = prevAttempts > 0 ? (prevSuccesses / prevAttempts) * 100 : techniqueSuccessRate;
      
      // Calculate acoustic analysis placeholder (would come from actual audio analysis in practice)
      // In production, this would aggregate acoustic data stored in sessions
      const acousticAnalysis: AcousticOnsetData | null = totalAttempts > 0 ? {
        easyOnsetSignatures: totalSuccesses,
        partialOnsetSignatures: Math.floor((totalAttempts - totalSuccesses) * 0.6),
        hardOnsetSignatures: Math.floor((totalAttempts - totalSuccesses) * 0.4),
        overallEasyOnsetScore: totalAttempts > 0 ? Math.round((totalSuccesses / totalAttempts) * 100) : 50
      } : null;
      
      // Count avoidances in previous period
      let previousAvoidanceCount = 0;
      previousPeriodSessions.forEach(s => {
        const avoidances = s.word_avoidances as string[] | null;
        if (avoidances && Array.isArray(avoidances)) {
          previousAvoidanceCount += avoidances.length;
        }
      });

      setMetrics({
        // Surface
        weightedStutteringSeverity: 100 - avgFluency, // Approximate
        percentSyllablesStuttered: sldCount > 0 ? (sldCount / (totalSessions * 50)) * 100 : 0,
        sldCount,
        odCount,
        syllablesPerMinute: latestSession?.syllables_per_minute || 120,
        articulationRate: latestSession?.articulation_rate || 140,
        blocksCount: blocksTotal,
        prolongationsCount: prolongationsTotal,
        repetitionsCount: repetitionsTotal,
        
        // Task type data for %SS chart
        taskTypeData,
        
        // Temporal
        initiationLagMs: latestSession?.initiation_lag_ms || null,
        naturalnessScore: latestSession?.naturalness_score || 5,
        linguisticPausesCount,
        stutterHesitationsCount,
        avgPauseDurationMs,
        longestBlockMs,
        secondLongestBlockMs,
        thirdLongestBlockMs,
        
        // Phoneme
        phonemeTriggers,
        wordAvoidances: uniqueWordAvoidances,
        
        // Technique
        easyOnsetScore: sessions?.[0]?.easy_onset_score || null,
        easyOnsetAttempts: totalAttempts,
        easyOnsetSuccesses: totalSuccesses,
        softContactScore: latestSession?.soft_contact_score || null,
        techniquesObserved: [],
        acousticAnalysis,
        
        // Iceberg
        objectiveSeverity: 100 - avgFluency,
        subjectiveRating: latestRating,
        
        // Environment
        environmentData,
        
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
        
        // Historical for relapse risk
        previousAdherence,
        previousFluency,
        previousAvoidanceCount,
        previousTechniqueSuccessRate,
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
              onClick={() => navigate("/hub/therapist")}
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
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full max-w-5xl mx-auto">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                <span className="hidden lg:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="fluency" className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                <span className="hidden lg:inline">Fluency</span>
              </TabsTrigger>
              <TabsTrigger value="temporal" className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="hidden lg:inline">Temporal</span>
              </TabsTrigger>
              <TabsTrigger value="clinical" className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span className="hidden lg:inline">Clinical</span>
              </TabsTrigger>
              <TabsTrigger value="physicality" className="flex items-center gap-1">
                <Camera className="w-4 h-4" />
                <span className="hidden lg:inline">Physicality</span>
              </TabsTrigger>
              <TabsTrigger value="action" className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span className="hidden lg:inline">Action</span>
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
                    acousticAnalysis: metrics.acousticAnalysis,
                  }}
                  compact
                />
                
                <ConcomitantMovementTracker compact />
                
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
                
                <PauseArchitectureTracker 
                  metrics={{
                    linguisticPausesCount: metrics.linguisticPausesCount,
                    stutterHesitationsCount: metrics.stutterHesitationsCount,
                    avgPauseDurationMs: metrics.avgPauseDurationMs,
                    longestBlockMs: metrics.longestBlockMs,
                    secondLongestBlockMs: metrics.secondLongestBlockMs,
                    thirdLongestBlockMs: metrics.thirdLongestBlockMs,
                  }}
                  compact
                />
                
                <WordAvoidanceTracker 
                  avoidances={metrics.wordAvoidances}
                  compact
                />
                
                <PredictiveRelapseRisk 
                  data={{
                    currentAdherence: metrics.adherenceRate,
                    currentFluency: 100 - metrics.weightedStutteringSeverity,
                    currentAvoidanceCount: metrics.wordAvoidances.length,
                    previousAdherence: metrics.previousAdherence,
                    previousFluency: metrics.previousFluency,
                    previousAvoidanceCount: metrics.previousAvoidanceCount,
                    daysSinceLastSession: metrics.lastSessionDate 
                      ? Math.floor((Date.now() - new Date(metrics.lastSessionDate).getTime()) / (1000 * 60 * 60 * 24))
                      : 0,
                    sessionsThisWeek: Math.round(metrics.adherenceRate / 100 * 7),
                    averageSessionsPerWeek: metrics.averageSessionsPerWeek,
                    techniqueSuccessRate: metrics.easyOnsetAttempts > 0 
                      ? (metrics.easyOnsetSuccesses / metrics.easyOnsetAttempts) * 100 
                      : 50,
                    previousTechniqueSuccessRate: metrics.previousTechniqueSuccessRate,
                  }}
                  compact
                />
              </div>
              
              {/* AI Insights Explainer */}
              <Card className="glass-card-strong">
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    AI Analysis Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIInsightsExplainer />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fluency Tab - Surface + Adaptation + Phonemes */}
            <TabsContent value="fluency" className="space-y-6">
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
                taskTypeData={metrics.taskTypeData}
              />
              
              <div className="grid lg:grid-cols-2 gap-6">
                <AdaptationConsistencyTracker 
                  metrics={{
                    trials: metrics.trials,
                    adaptationScore: metrics.adaptationScore,
                    consistencyWords: metrics.consistencyWords,
                    improvingWords: metrics.improvingWords,
                    targetPhrase: metrics.targetPhrase,
                  }}
                />
                
                <PhonemeTriggerHeatmap 
                  triggers={metrics.phonemeTriggers}
                  wordAvoidances={metrics.wordAvoidances}
                />
              </div>
              
            </TabsContent>

            {/* Temporal Tab - Temporal + Pause */}
            <TabsContent value="temporal" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <TemporalProsodyCentre 
                  metrics={{
                    initiationLagMs: metrics.initiationLagMs,
                    naturalnessScore: metrics.naturalnessScore,
                    linguisticPausesCount: metrics.linguisticPausesCount,
                    stutterHesitationsCount: metrics.stutterHesitationsCount,
                    avgPauseDurationMs: metrics.avgPauseDurationMs,
                  }}
                />
                
                <PauseArchitectureTracker 
                  metrics={{
                    linguisticPausesCount: metrics.linguisticPausesCount,
                    stutterHesitationsCount: metrics.stutterHesitationsCount,
                    avgPauseDurationMs: metrics.avgPauseDurationMs,
                    longestBlockMs: metrics.longestBlockMs,
                    secondLongestBlockMs: metrics.secondLongestBlockMs,
                  thirdLongestBlockMs: metrics.thirdLongestBlockMs,
                }}
              />
              </div>
              
              <WordAvoidanceTracker 
                avoidances={metrics.wordAvoidances}
                fearedPhonemes={metrics.phonemeTriggers.slice(0, 5).map(p => p.phoneme)}
              />
            </TabsContent>

            {/* Clinical Tab - Technique + Iceberg */}
            <TabsContent value="clinical" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <TechniqueAccuracyTracker 
                  metrics={{
                    easyOnsetScore: metrics.easyOnsetScore,
                    easyOnsetAttempts: metrics.easyOnsetAttempts,
                    easyOnsetSuccesses: metrics.easyOnsetSuccesses,
                    softContactScore: metrics.softContactScore,
                    techniquesObserved: metrics.techniquesObserved,
                    acousticAnalysis: metrics.acousticAnalysis,
                  }}
                />
                
                <IcebergCommandCentre 
                  metrics={{
                    objectiveSeverity: metrics.objectiveSeverity,
                    subjectiveRating: metrics.subjectiveRating,
                  }}
                  environmentData={metrics.environmentData}
                />
              </div>
              
              <SituationalHeatmap 
                environmentData={metrics.environmentData}
              />

              {/* Mood-Fluency Correlation */}
              <MoodFluencyCorrelation patientId={selectedPatient} />
            </TabsContent>

            {/* Physicality Tab - Concomitant Behaviours */}
            <TabsContent value="physicality" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <ConcomitantMovementTracker />
                
                <Card className="glass-card-strong">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Camera className="w-5 h-5 text-primary" />
                      About Physicality Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      The Concomitant Movement Tracker uses real-time face detection to identify 
                      physical secondary behaviours that often accompany speech blocks:
                    </p>
                    <div className="space-y-3">
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <p className="text-sm font-medium text-foreground">Eye Blinks</p>
                        <p className="text-xs text-muted-foreground">
                          Rapid or prolonged blinking during speech may indicate tension or 
                          struggle behaviours.
                        </p>
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <p className="text-sm font-medium text-foreground">Jaw Tension</p>
                        <p className="text-xs text-muted-foreground">
                          Monitors lip and jaw movements to detect tension patterns during 
                          blocks or difficult sounds.
                        </p>
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-lg">
                        <p className="text-sm font-medium text-foreground">Head Movements</p>
                        <p className="text-xs text-muted-foreground">
                          Tracks rapid head movements that may be used as escape behaviours 
                          during moments of stuttering.
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      <strong>Privacy:</strong> All video processing happens locally in the browser. 
                      No video is recorded or sent to any server.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Action Tab */}
            <TabsContent value="action" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <ActionCommandCentre 
                  metrics={{
                    totalSessions: metrics.totalSessions,
                    totalPracticeMinutes: metrics.totalPracticeMinutes,
                    streakDays: metrics.streakDays,
                    adherenceRate: metrics.adherenceRate,
                    lastSessionDate: metrics.lastSessionDate,
                    averageSessionsPerWeek: metrics.averageSessionsPerWeek,
                  }}
                />
                
                <PredictiveRelapseRisk 
                  data={{
                    currentAdherence: metrics.adherenceRate,
                    currentFluency: 100 - metrics.weightedStutteringSeverity,
                    currentAvoidanceCount: metrics.wordAvoidances.length,
                    previousAdherence: metrics.previousAdherence,
                    previousFluency: metrics.previousFluency,
                    previousAvoidanceCount: metrics.previousAvoidanceCount,
                    daysSinceLastSession: metrics.lastSessionDate 
                      ? Math.floor((Date.now() - new Date(metrics.lastSessionDate).getTime()) / (1000 * 60 * 60 * 24))
                      : 0,
                    sessionsThisWeek: Math.round(metrics.adherenceRate / 100 * 7),
                    averageSessionsPerWeek: metrics.averageSessionsPerWeek,
                    techniqueSuccessRate: metrics.easyOnsetAttempts > 0 
                      ? (metrics.easyOnsetSuccesses / metrics.easyOnsetAttempts) * 100 
                      : 50,
                    previousTechniqueSuccessRate: metrics.previousTechniqueSuccessRate,
                  }}
                />
              </div>
              
              {/* S.O.A.P. Note Generator */}
              <SOAPNoteGenerator 
                clinicalData={{
                  weightedStutteringSeverity: metrics.weightedStutteringSeverity,
                  percentSyllablesStuttered: metrics.percentSyllablesStuttered,
                  sldCount: metrics.sldCount,
                  odCount: metrics.odCount,
                  initiationLagMs: metrics.initiationLagMs,
                  naturalnessScore: metrics.naturalnessScore,
                  blocksCount: metrics.blocksCount,
                  prolongationsCount: metrics.prolongationsCount,
                  repetitionsCount: metrics.repetitionsCount,
                  easyOnsetScore: metrics.easyOnsetScore,
                  easyOnsetAttempts: metrics.easyOnsetAttempts,
                  easyOnsetSuccesses: metrics.easyOnsetSuccesses,
                  totalSessions: metrics.totalSessions,
                  adherenceRate: metrics.adherenceRate,
                  streakDays: metrics.streakDays,
                }}
              />
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
