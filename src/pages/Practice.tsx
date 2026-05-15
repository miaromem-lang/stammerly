import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mic, MicOff, Volume2, RefreshCw, Star, Trophy, Loader2, ThumbsUp, AlertCircle, Radio, BookOpen, UserCheck, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSpeakerProfile } from "@/hooks/useSpeakerProfile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useActiveQuest } from "@/hooks/useActiveQuest";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useAchievements } from "@/hooks/useAchievements";
import PageBackground from "@/components/PageBackground";
import { StammerDetector } from "@/components/StammerDetector";
import { useStammerDetector, type StammerEvent } from "@/hooks/useStammerDetector";
import { HubNavigation } from "@/components/HubNavigation";
import { loadSavedName, loadSavedProfile } from "@/pages/Settings";
import { useAuth } from "@/hooks/useAuth";
import { WSSExplainabilityPanel } from "@/components/clinical/WSSExplainabilityPanel";
import { AcousticTimeline, type AcousticEventRow, type WordTimingLite } from "@/components/clinical/AcousticTimeline";
import { limitAcousticEvents } from "@/lib/acousticEvents";

type LiveRole = "parent" | "therapist" | "child";

interface SpeechAnalysis {
  fluencyScore: number;
  accuracy: number;
  easyOnsetScore: number;
  pacingScore: number;
  disfluencies?: Array<{ type: string; word: string; suggestion: string }>;
  strengths: string[];
  areasToImprove?: string[];
  encouragement: string;
  wssExplain?: import("@/components/clinical/WSSExplainabilityPanel").WSSExplain;
}

const Practice = () => {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const isClinician =
    role === "therapist" ||
    role === "admin" ||
    (typeof window !== "undefined" && sessionStorage.getItem("dev_admin_bypass") === "true");
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode: "exercise" | "live" = searchParams.get("mode") === "live" ? "live" : "exercise";
  const [mode, setMode] = useState<"exercise" | "live">(initialMode);

  // Live Session state (merged from former /session page)
  const [liveChildName, setLiveChildName] = useState(() => loadSavedName());
  const [liveRole, setLiveRole] = useState<LiveRole>("parent");
  const [liveStarted, setLiveStarted] = useState(false);
  const [liveAudioProfile] = useState(() => loadSavedProfile());

  const switchMode = (next: "exercise" | "live") => {
    setMode(next);
    const sp = new URLSearchParams(searchParams);
    if (next === "live") sp.set("mode", "live"); else sp.delete("mode");
    setSearchParams(sp, { replace: true });
  };

  const { getActiveQuest, clearActiveQuest } = useActiveQuest();
  const { addGemsAndStars, progress } = useUserProgress();
  const { checkAndAwardAchievements } = useAchievements();
  const [isRecording, setIsRecording] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(24).fill(0.3));
  const [activeWord, setActiveWord] = useState(-1);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SpeechAnalysis | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<any>(null);

  // Live acoustic-event capture for the exercise mode. Events emitted by
  // useStammerDetector run in parallel with the MediaRecorder so we can ship
  // ground-truth disfluency markers to analyze-speech alongside the transcript.
  const acousticEventsRef = useRef<StammerEvent[]>([]);
  const recordingStartedAtRef = useRef<number>(0);
  const [detectorStatus, setDetectorStatus] = useState<'idle' | 'starting' | 'running' | 'skipped'>('idle');
  const [detectorSkipReason, setDetectorSkipReason] = useState<string | null>(null);
  const [liveAcousticEventCount, setLiveAcousticEventCount] = useState(0);
  const speakerChildId = user?.id ?? "anonymous";
  const speaker = useSpeakerProfile({
    childId: speakerChildId,
    sampleRate: 44100,
    onEnrolled: () => toast.success("Voice enrolment complete — detector will now focus on this speaker."),
    onEnrollError: (reason) => toast.error(reason),
  });

  // Speaker-gate debug overlay (toggle with `?debugGate=1` or via the button).
  const [showGateDebug, setShowGateDebug] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debugGate") === "1",
  );
  type GateReason = "no-profile" | "voiced-in-band" | "voiced-out-of-band" | "unvoiced-quiet" | "unvoiced-loud";
  const gateStatsRef = useRef({
    accepted: 0,
    rejected: 0,
    lastReason: "no-profile" as GateReason,
    lastF0: 0,
    lastRms: 0,
  });
  const [gateStats, setGateStats] = useState(gateStatsRef.current);
  const gateFlushRef = useRef<number>(0);

  const wrappedScoreFrame = useCallback(
    (timeBuf: Float32Array, f0Hz: number) => {
      const fp = speaker.fingerprint;
      let reason: GateReason;
      let accept: boolean;
      let rmsVal = 0;
      if (!fp) {
        reason = "no-profile";
        accept = true;
      } else if (f0Hz > 0) {
        const inBand = f0Hz >= fp.f0P10 - 30 && f0Hz <= fp.f0P90 + 30;
        reason = inBand ? "voiced-in-band" : "voiced-out-of-band";
        accept = inBand;
      } else {
        let s = 0;
        for (let i = 0; i < timeBuf.length; i++) s += timeBuf[i] * timeBuf[i];
        rmsVal = Math.sqrt(s / timeBuf.length);
        const quiet = rmsVal <= fp.energyP75 * 1.5;
        reason = quiet ? "unvoiced-quiet" : "unvoiced-loud";
        accept = quiet;
      }
      const stats = gateStatsRef.current;
      if (accept) stats.accepted++;
      else stats.rejected++;
      stats.lastReason = reason;
      stats.lastF0 = f0Hz;
      stats.lastRms = rmsVal;
      // Throttle React updates to ~10 fps to keep the hot loop cheap.
      const now = performance.now();
      if (now - gateFlushRef.current > 100) {
        gateFlushRef.current = now;
        setGateStats({ ...stats });
      }
      return accept;
    },
    [speaker.fingerprint],
  );

  const exerciseDetector = useStammerDetector({
    audioProfile: loadSavedProfile(),
    scoreFrame: wrappedScoreFrame,
    onEvent: (ev) => {
      acousticEventsRef.current.push(ev);
      setLiveAcousticEventCount(acousticEventsRef.current.length);
    },
  });

  const resetGateStats = () => {
    gateStatsRef.current = { accepted: 0, rejected: 0, lastReason: "no-profile", lastF0: 0, lastRms: 0 };
    setGateStats({ ...gateStatsRef.current });
  };


  // Snapshots used by the clinician-only AcousticTimeline in the results card.
  const [lastWordTimings, setLastWordTimings] = useState<WordTimingLite[]>([]);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [lastAcousticRows, setLastAcousticRows] = useState<AcousticEventRow[]>([]);

  // Large collection of practice phrases organized by difficulty
  const allPhrases = {
    beginner: [
      ["Sally", "saw", "the", "sun"],
      ["The", "cat", "sat", "down"],
      ["I", "like", "ice", "cream"],
      ["She", "sees", "the", "sea"],
      ["My", "mom", "makes", "meals"],
      ["Dad", "drives", "the", "car"],
      ["Run", "and", "have", "fun"],
      ["The", "dog", "is", "big"],
      ["I", "can", "do", "it"],
      ["We", "play", "all", "day"],
      ["Look", "at", "the", "bird"],
      ["Time", "to", "go", "home"],
    ],
    intermediate: [
      ["Peter", "picked", "a", "pretty", "picture"],
      ["The", "big", "bear", "bounced", "the", "ball"],
      ["Six", "slippery", "snails", "slid", "slowly"],
      ["Round", "and", "round", "the", "rabbit", "runs"],
      ["She", "sells", "seashells", "by", "the", "shore"],
      ["How", "much", "wood", "would", "a", "woodchuck", "chuck"],
      ["The", "rain", "in", "Spain", "falls", "mainly"],
      ["Butterflies", "flutter", "by", "the", "flowers"],
      ["The", "quick", "brown", "fox", "jumps"],
      ["Happy", "hippos", "hop", "here"],
    ],
    advanced: [
      ["Friendly", "frogs", "find", "fantastic", "feathers"],
      ["Theodore", "thinks", "through", "three", "things"],
      ["Crispy", "crackers", "crunch", "and", "crackle"],
      ["Smart", "students", "study", "steadily", "sometimes"],
      ["Beautiful", "butterflies", "bring", "bright", "blessings"],
      ["The", "thoughtful", "thrush", "thought", "three", "things"],
      ["Pleasantly", "pleasant", "prairie", "plants", "please"],
      ["Splendid", "springs", "sprout", "spectacular", "surprises"],
    ],
  };
  
  // Get random phrase on component mount
  const [currentPhrase, setCurrentPhrase] = useState<string[]>(() => {
    const category = new URLSearchParams(window.location.search).get('difficulty') || 'beginner';
    const phrases = allPhrases[category as keyof typeof allPhrases] || allPhrases.beginner;
    return phrases[Math.floor(Math.random() * phrases.length)];
  });
  
  const words = currentPhrase;
  const targetPhrase = words.join(" ");
  
  const getNewPhrase = () => {
    const category = new URLSearchParams(window.location.search).get('difficulty') || 'beginner';
    const phrases = allPhrases[category as keyof typeof allPhrases] || allPhrases.beginner;
    const newPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setCurrentPhrase(newPhrase);
    setRecordedAudio(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setShowResults(false);
    setTranscript("");
    setAnalysis(null);
  };
  
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [audioUrl]);

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const bars = Array(24).fill(0).map((_, i) => {
      const index = Math.floor((i / 24) * dataArray.length);
      return Math.max(0.15, dataArray[index] / 255);
    });
    
    setWaveformBars(bars);
    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  }, [isRecording]);

  const analyzeWithWhisper = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });
      
      const base64Audio = await base64Promise;
      
      // Step 1: Transcribe with OpenAI Whisper
      console.log('Transcribing with Whisper...');
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('transcribe-speech', {
        body: { audio: base64Audio, language: 'en' }
      });

      if (transcriptionError) {
        console.error('Transcription error:', transcriptionError);
        throw new Error('Transcription failed');
      }

      const transcribedText = transcriptionData?.text || '';
      const wordTimings = transcriptionData?.words || [];
      const segmentTimings = transcriptionData?.segments || [];
      setTranscript(transcribedText);
      // Snapshot timings for the clinician-only acoustic timeline.
      setLastWordTimings(wordTimings.map((w: any) => ({ word: w.word, start: w.start, end: w.end })));
      setLastTranscript(transcribedText);
      console.log('Transcription:', transcribedText);

      // Step 2: Analyze with AI including word + segment timings (segments
      // enable intra-word block detection) and live acoustic events. Cap +
      // chunk on the client so the edge function never receives more than
      // its supported number of events per take.
      console.log('Analyzing speech...');
      const limited = limitAcousticEvents(acousticEventsRef.current);
      if (limited.truncated) {
        console.warn(
          `Trimmed acoustic events for analyze-speech: kept ${limited.kept}/${limited.total} (dropped ${limited.dropped}).`,
        );
        toast.message(
          `Captured ${limited.total} acoustic events — sending top ${limited.kept} for analysis.`,
        );
      }
      // Snapshot acoustic events as DB-shaped rows so the clinician timeline
      // can render the just-finished take without an extra round-trip.
      const startedAt = recordingStartedAtRef.current || Date.now();
      setLastAcousticRows(
        limited.events.map((ev, i) => ({
          id: ev.id ?? `live-${i}`,
          session_id: 'in-memory',
          user_id: 'in-memory',
          event_type: ev.type,
          duration_ms: Math.max(0, Math.round(ev.durationMs || 0)),
          confidence: Math.max(0, Math.min(1, ev.confidence ?? 0)),
          occurred_at_ms: Math.max(
            0,
            (ev.timestamp instanceof Date ? ev.timestamp.getTime() : Date.now()) - startedAt,
          ),
          detail: ev.detail ?? null,
        })),
      );
      const { data, error } = await supabase.functions.invoke('analyze-speech', {
        body: {
          transcript: transcribedText,
          targetPhrase,
          words: wordTimings,
          segments: segmentTimings,
          acousticEvents: limited.events,
        }
      });

      if (error) {
        console.error('AI analysis error:', error);
        if (error.message?.includes('429')) {
          toast.error("Too many requests. Please wait a moment and try again.");
        } else if (error.message?.includes('402')) {
          toast.error("AI credits exhausted. Please add credits.");
        } else {
          toast.error("Could not analyze speech. Showing basic results.");
        }
        setAnalysis({
          fluencyScore: 75,
          accuracy: 80,
          easyOnsetScore: 70,
          pacingScore: 75,
          strengths: ["Good effort!", "Keep practicing!"],
          encouragement: "Great job trying! Keep up the practice!"
        });
      } else if (data?.error) {
        console.error('Analysis error:', data.error);
        toast.error(data.error);
        const fallbackAnalysis = {
          fluencyScore: 75,
          accuracy: 80,
          easyOnsetScore: 70,
          pacingScore: 75,
          strengths: ["Good effort!"],
          encouragement: "Keep practicing!"
        };
        setAnalysis(fallbackAnalysis);
        await saveSessionToDatabase(fallbackAnalysis, transcribedText);
      } else {
        setAnalysis(data);
        await saveSessionToDatabase(data, transcribedText);
        if (data.fluencyScore >= 80) {
          toast.success("Excellent fluency! 🌟");
        } else if (data.fluencyScore >= 60) {
          toast.success("Good job! Keep practicing! 💪");
        }
      }
    } catch (err) {
      console.error('Failed to analyze:', err);
      toast.error("Analysis failed. Please try again.");
      const fallbackAnalysis = {
        fluencyScore: 75,
        accuracy: 80,
        easyOnsetScore: 70,
        pacingScore: 75,
        strengths: ["Good effort!"],
        encouragement: "Keep practicing!"
      };
      setAnalysis(fallbackAnalysis);
      await saveSessionToDatabase(fallbackAnalysis, '');
    } finally {
      setIsAnalyzing(false);
      setShowResults(true);
    }
  };

  const saveSessionToDatabase = async (analysisData: SpeechAnalysis, transcriptText: string) => {
    try {
      const category = new URLSearchParams(window.location.search).get('category') || 'onset';
      const difficulty = new URLSearchParams(window.location.search).get('difficulty') || 'beginner';
      const exerciseName = new URLSearchParams(window.location.search).get('title') || 'Easy Onset Quest';

      const starsEarned = analysisData.fluencyScore >= 90 ? 3 : analysisData.fluencyScore >= 70 ? 2 : 1;
      const gemsEarned = Math.floor(analysisData.fluencyScore / 10);

      // Count disfluencies by type
      let blocksCount = 0;
      let repetitionsCount = 0;
      let prolongationsCount = 0;
      let interjectionsCount = 0;

      if (analysisData.disfluencies) {
        analysisData.disfluencies.forEach(d => {
          const type = d.type.toLowerCase();
          if (type.includes('block')) blocksCount++;
          else if (type.includes('repetition')) repetitionsCount++;
          else if (type.includes('prolongation')) prolongationsCount++;
          else if (type.includes('interjection')) interjectionsCount++;
        });
      }

      // Insert practice session
      const { data: sessionData, error } = await supabase.from('practice_sessions').insert({
        exercise_name: exerciseName,
        exercise_category: category,
        exercise_difficulty: difficulty,
        target_phrase: targetPhrase,
        transcript: transcriptText,
        fluency_score: analysisData.fluencyScore,
        accuracy_score: analysisData.accuracy,
        easy_onset_score: analysisData.easyOnsetScore,
        pacing_score: analysisData.pacingScore,
        duration_seconds: recordingTime,
        stars_earned: starsEarned,
        gems_earned: gemsEarned,
        blocks_count: blocksCount,
        repetitions_count: repetitionsCount,
        prolongations_count: prolongationsCount,
        interjections_count: interjectionsCount,
      }).select('id').single();

      if (error) {
        console.error('Error saving session:', error);
      } else {
        console.log('Session saved to database:', sessionData?.id);

        // Persist captured live acoustic events for this session so therapists/admins
        // can replay the timeline later. Owner-scoped via RLS.
        const events = acousticEventsRef.current;
        const startedAt = recordingStartedAtRef.current || Date.now();
        if (sessionData?.id && events.length > 0) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const rows = events.slice(0, 500).map(ev => ({
              session_id: sessionData.id,
              user_id: user.id,
              event_type: ev.type,
              duration_ms: Math.max(0, Math.round(ev.durationMs || 0)),
              confidence: Math.max(0, Math.min(1, ev.confidence ?? 0)),
              occurred_at_ms: Math.max(0, (ev.timestamp instanceof Date ? ev.timestamp.getTime() : Date.now()) - startedAt),
              detail: ev.detail ?? null,
            }));
            const { error: aeError } = await supabase.from('acoustic_events').insert(rows);
            if (aeError) console.warn('Failed to persist acoustic events:', aeError);
          }
        }

        // Update user progress with gems and stars, and update streak
        await addGemsAndStars(gemsEarned, starsEarned);
        
        // Check for achievements based on updated progress
        await checkAndAwardAchievements({
          totalSessions: (progress.totalSessions || 0) + 1,
          currentStreak: progress.currentStreak,
          totalGems: (progress.totalGems || 0) + gemsEarned,
          totalStars: (progress.totalStars || 0) + starsEarned,
          fluencyScore: analysisData.fluencyScore,
        });
        
        // Link session to active quest if one exists
        const activeQuest = getActiveQuest();
        if (activeQuest && sessionData?.id) {
          const { error: questError } = await supabase
            .from('therapist_assigned_quests')
            .update({
              linked_session_id: sessionData.id,
              outcome_fluency_score: analysisData.fluencyScore,
              outcome_accuracy_score: analysisData.accuracy,
              outcome_notes: `Completed with ${starsEarned} stars. Fluency: ${analysisData.fluencyScore}%, Accuracy: ${analysisData.accuracy}%`,
              status: 'completed'
            })
            .eq('id', activeQuest.questId);
          
          if (questError) {
            console.error('Error updating quest outcome:', questError);
          } else {
            console.log('Quest outcome linked to session');
            clearActiveQuest();
          }
        }
      }
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      
      // Setup Web Speech API for transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
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
        };
        
        recognitionRef.current.start();
      }
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
        
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        
        // Analyze with Whisper (uses the recorded audio blob)
        analyzeWithWhisper(audioBlob);
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      // Reset and start the headless stammer detector for this take
      acousticEventsRef.current = [];
      setLiveAcousticEventCount(0);
      setDetectorSkipReason(null);
      setDetectorStatus('starting');
      recordingStartedAtRef.current = Date.now();
      exerciseDetector
        .startRecording()
        .then(() => setDetectorStatus('running'))
        .catch((err) => {
          console.warn('Stammer detector failed to start (continuing without acoustic events):', err);
          setDetectorStatus('skipped');
          setDetectorSkipReason(err?.message ?? 'detector unavailable');
        });
      setRecordingTime(0);
      setActiveWord(0);
      setShowResults(false);
      setTranscript("");
      setAnalysis(null);
      
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      updateWaveform();
      
      let wordIndex = 0;
      const wordInterval = setInterval(() => {
        wordIndex = (wordIndex + 1) % words.length;
        setActiveWord(wordIndex);
      }, 600);
      
      mediaRecorderRef.current.addEventListener('stop', () => clearInterval(wordInterval));
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setActiveWord(-1);
      setWaveformBars(Array(24).fill(0.3));
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
      if (timerRef.current) clearInterval(timerRef.current);
      try { exerciseDetector.stopRecording(); } catch { /* noop */ }
      setDetectorStatus('idle');
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.play();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStarsEarned = () => {
    if (!analysis) return 1;
    if (analysis.fluencyScore >= 90) return 3;
    if (analysis.fluencyScore >= 70) return 2;
    return 1;
  };

  // Live Session mode (merged from former /session) ----------------------
  if (mode === "live") {
    const handleLiveStart = (e: React.FormEvent) => {
      e.preventDefault();
      if (!liveChildName.trim()) return;
      setLiveStarted(true);
    };
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/15 via-primary/5 to-background">
        <Helmet>
          <title>Live Session | Stammerly</title>
          <meta name="description" content="Real-time stammer detection session with Stammerly." />
          <link rel="canonical" href="/practice?mode=live" />
        </Helmet>
        <HubNavigation />
        <main className="container mx-auto px-2 sm:px-4 py-6 sm:py-10 pb-24 sm:pb-10 flex justify-center">
          <div className="w-full max-w-5xl bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-xl p-4 sm:p-6 md:p-10">
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" onClick={() => switchMode("exercise")}>
                <BookOpen className="w-4 h-4 mr-2" /> Switch to Exercise
              </Button>
            </div>
            {!liveStarted ? (
              <form onSubmit={handleLiveStart} className="max-w-md mx-auto space-y-6">
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-display font-bold text-primary">Live Session</h1>
                  <p className="text-sm text-muted-foreground">
                    Tell us a little about who's using Stammerly today.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liveChildName">Child's name</Label>
                  <Input
                    id="liveChildName"
                    value={liveChildName}
                    onChange={(e) => setLiveChildName(e.target.value)}
                    placeholder="e.g. Leo"
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>I am a…</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["parent", "therapist", "child"] as LiveRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setLiveRole(r)}
                        className={`px-3 py-2 rounded-lg border text-sm capitalize transition-colors ${
                          liveRole === r
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border bg-card text-muted-foreground hover:text-foreground"
                        }`}
                        aria-pressed={liveRole === r}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={!liveChildName.trim()}>
                  Continue
                </Button>
              </form>
            ) : (
              <>
                <h1 className="sr-only">Live Stammer Detection Session</h1>
                <StammerDetector
                  childName={liveChildName}
                  childId="child_001"
                  defaultView={liveRole}
                  defaultProfile={liveAudioProfile}
                  environmentType={typeof liveAudioProfile === 'string' ? liveAudioProfile : 'quiet'}
                />
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Exercise mode (default) ----------------------------------------------
  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <header className="bg-accent-orange/20 backdrop-blur-sm border-b border-accent-orange/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="font-display font-bold text-xl text-foreground">Easy Onset Quest 🌊</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => switchMode("live")}>
                <Radio className="w-4 h-4 mr-1" /> Live Session
              </Button>
              <div className="flex items-center gap-2 bg-gold/20 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-gold fill-gold" />
                <span className="font-bold text-sm">+10</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-card/80 backdrop-blur-sm rounded-kids px-4 py-3 flex items-center justify-between mb-6 border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Volume2 className="w-4 h-4" />
            <span>Environment:</span>
            <span className="text-success font-medium">Quiet ✓</span>
          </div>
          {isRecording && (
            <span className="text-destructive font-mono text-sm animate-pulse">
              ● REC {formatTime(recordingTime)}
            </span>
          )}
          {detectorStatus !== 'idle' && (
            <span
              className={
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium " +
                (detectorStatus === 'running'
                  ? "border-success/40 bg-success/10 text-success"
                  : detectorStatus === 'starting'
                  ? "border-muted-foreground/30 bg-muted text-muted-foreground"
                  : "border-destructive/40 bg-destructive/10 text-destructive")
              }
              role="status"
              aria-live="polite"
              title={
                detectorStatus === 'skipped' && detectorSkipReason
                  ? `Acoustic events skipped: ${detectorSkipReason}`
                  : undefined
              }
            >
              <span
                className={
                  "h-1.5 w-1.5 rounded-full " +
                  (detectorStatus === 'running'
                    ? "bg-success animate-pulse"
                    : detectorStatus === 'starting'
                    ? "bg-muted-foreground"
                    : "bg-destructive")
                }
              />
              {detectorStatus === 'running' && (
                <>Detector live · {liveAcousticEventCount} event{liveAcousticEventCount === 1 ? '' : 's'} captured</>
              )}
              {detectorStatus === 'starting' && <>Detector starting…</>}
              {detectorStatus === 'skipped' && <>Acoustic events skipped</>}
            </span>
          )}
        </div>

        <Card className="rounded-kids bg-card/80 backdrop-blur-sm border border-border mb-6">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${speaker.isEnrolled ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-sm text-foreground">
                    Voice enrolment {speaker.isEnrolled && <span className="text-success">· Active</span>}
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-md">
                    {speaker.isEnrolling
                      ? "Keep speaking naturally for 10 seconds — try counting or describing your day."
                      : speaker.isEnrolled
                      ? "Your child's voice fingerprint is saved. The detector will ignore other voices nearby."
                      : "Record a 10-second sample so the detector can focus on your child and ignore background voices."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {speaker.isEnrolling ? (
                  <Button variant="outline" size="sm" onClick={speaker.cancelEnrollment}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                ) : (
                  <>
                    {speaker.isEnrolled && (
                      <Button variant="ghost" size="sm" onClick={speaker.clearProfile}>
                        Clear
                      </Button>
                    )}
                    <Button
                      variant={speaker.isEnrolled ? "outline" : "default"}
                      size="sm"
                      onClick={() => { void speaker.startEnrollment(); }}
                      disabled={isRecording || isAnalyzing}
                    >
                      <Mic className="w-4 h-4 mr-1" />
                      {speaker.isEnrolled ? "Re-enrol voice" : "Start 10s enrolment"}
                    </Button>
                  </>
                )}
              </div>
            </div>
            {speaker.isEnrolling && speaker.enrollProgress !== null && (
              <div className="mt-4 space-y-1">
                <Progress value={Math.round(speaker.enrollProgress * 100)} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {Math.round(speaker.enrollProgress * 100)}% — {Math.max(0, Math.ceil(10 - speaker.enrollProgress * 10))}s left
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-kids overflow-hidden bg-card/90 backdrop-blur-sm border-2 border-accent-orange/30">
          <CardContent className="p-8">
            <div className="bg-gradient-to-br from-gold/20 to-accent-orange/20 rounded-kids p-8 mb-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">Say this sentence slowly:</p>
              
              <div className="flex items-center justify-center gap-3 text-3xl md:text-4xl font-display font-bold flex-wrap">
                {words.map((word, index) => (
                  <span
                    key={index}
                    className={`transition-all duration-200 px-2 py-1 rounded-lg ${
                      isRecording && index === activeWord
                        ? "text-success bg-success/20 scale-110"
                        : index < activeWord && isRecording
                          ? "text-gold"
                          : "text-foreground"
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
              
              <p className="text-muted-foreground mt-4 text-sm">
                Focus on smooth, easy onset of each word
              </p>
            </div>

            {/* Live Transcript */}
            {isRecording && transcript && (
              <div className="bg-primary/10 rounded-xl p-4 mb-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">I heard:</p>
                <p className="text-lg font-medium text-foreground">{transcript}</p>
              </div>
            )}

            <div className="bg-foreground/5 rounded-xl p-4 mb-8">
              <div className="flex items-end justify-center gap-1 h-20">
                {waveformBars.map((height, i) => (
                  <div
                    key={i}
                    className={`w-2 rounded-full transition-all duration-75 ${
                      isRecording 
                        ? height > 0.6 ? "bg-gold" : "bg-success"
                        : recordedAudio ? "bg-accent-orange/50" : "bg-muted"
                    }`}
                    style={{ height: `${height * 100}%` }}
                  />
                ))}
              </div>
              {isRecording && (
                <p className="text-center text-sm text-success mt-3 font-medium">
                  🎤 Recording... Speak clearly!
                </p>
              )}
              {isAnalyzing && (
                <div className="text-center mt-3">
                  <Loader2 className="w-5 h-5 animate-spin inline-block text-primary mr-2" />
                  <span className="text-sm text-muted-foreground">Analyzing your speech...</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full"
                onClick={getNewPhrase}
                title="Get new phrase"
                disabled={isRecording || isAnalyzing}
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isAnalyzing}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording 
                    ? "bg-destructive animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]" 
                    : isAnalyzing
                      ? "bg-muted cursor-not-allowed"
                      : "bg-accent-orange pulse-glow hover:scale-105"
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-10 h-10 text-destructive-foreground" />
                ) : isAnalyzing ? (
                  <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
                ) : (
                  <Mic className="w-10 h-10 text-primary-foreground" />
                )}
              </button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full"
                onClick={playRecording}
                disabled={!recordedAudio || isRecording || isPlaying || isAnalyzing}
              >
                <Volume2 className={`w-5 h-5 ${isPlaying ? "text-accent-orange animate-pulse" : ""}`} />
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {isRecording ? "Tap to stop recording" : isAnalyzing ? "Analyzing..." : "Tap the microphone to start!"}
            </p>
          </CardContent>
        </Card>

        {/* AI-Powered Results */}
        {showResults && analysis && (
          <Card className="rounded-kids mt-6 bg-success/10 border-success/30 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-8 h-8 text-gold" />
                <h3 className="font-display font-bold text-2xl text-foreground">
                  {analysis.fluencyScore >= 80 ? "Amazing!" : analysis.fluencyScore >= 60 ? "Great Job!" : "Good Try!"}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                <div className="bg-card/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-success">{analysis.fluencyScore}%</p>
                  <p className="text-xs text-muted-foreground">Fluency</p>
                </div>
                <div className="bg-card/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-primary">{analysis.easyOnsetScore}%</p>
                  <p className="text-xs text-muted-foreground">Easy Onset</p>
                </div>
                <div className="bg-card/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-accent-orange">{analysis.pacingScore}%</p>
                  <p className="text-xs text-muted-foreground">Pacing</p>
                </div>
                <div className="bg-card/50 rounded-xl p-3">
                  <div className="flex justify-center gap-1">
                    {Array.from({ length: getStarsEarned() }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-gold fill-gold" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Stars</p>
                </div>
              </div>

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                    <ThumbsUp className="w-4 h-4 text-success" />
                    What went well:
                  </h4>
                  <ul className="space-y-1">
                    {analysis.strengths.map((strength, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-success">✓</span> {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas to improve */}
              {analysis.areasToImprove && analysis.areasToImprove.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Keep practicing:
                  </h4>
                  <ul className="space-y-1">
                    {analysis.areasToImprove.map((area, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-amber-500">→</span> {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Clinician-only WSS explainability + acoustic timeline */}
              {isClinician && analysis.wssExplain && (
                <div className="mb-6">
                  <WSSExplainabilityPanel explain={analysis.wssExplain} />
                </div>
              )}
              {isClinician && lastAcousticRows.length > 0 && (
                <div className="mb-6">
                  <AcousticTimeline
                    events={lastAcousticRows}
                    words={lastWordTimings}
                    transcript={lastTranscript}
                    durationSeconds={recordingTime}
                    title="Acoustic events × transcript timing (this take)"
                  />
                </div>
              )}

              {/* Encouragement */}
              <div className="bg-primary/10 rounded-xl p-4 mb-6 text-center">
                <p className="text-foreground font-medium">🦦 Echo says: "{analysis.encouragement}"</p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  className="flex-1 rounded-kids"
                  variant="outline"
                  onClick={() => {
                    setRecordedAudio(null);
                    setAudioUrl(null);
                    setShowResults(false);
                    setRecordingTime(0);
                    setTranscript("");
                    setAnalysis(null);
                  }}
                >
                  Try Again
                </Button>
                <Button 
                  className="flex-1 rounded-kids bg-accent-orange hover:bg-accent-orange/90"
                  onClick={() => navigate("/analytics/kid")}
                >
                  See My Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Practice;
