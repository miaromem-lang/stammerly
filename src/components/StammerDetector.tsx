/**
 * StammerDetector.lovable.tsx — Stammerly v2
 * ============================================
 * Self-contained drop-in for Lovable.dev.
 *
 * HOW TO ADD TO LOVABLE
 * ---------------------
 * 1. In Lovable, open the file explorer (left sidebar)
 * 2. Create a new file: src/components/StammerDetector.tsx
 * 3. Paste this entire file
 * 4. In any page/component, add:
 *      import { StammerDetector } from '@/components/StammerDetector'
 *      // then in JSX:
 *      <StammerDetector childName="Leo" />
 *
 * WHAT'S INCLUDED
 * ---------------
 * • useStammerDetector hook — Web Audio + Web Speech detection (no audio stored)
 * • useGamification hook — XP, levels, badges, streaks (localStorage)
 * • StammerDetector component — Child / Parent / Therapist views
 * • Audio profile switching — quiet / classroom / cafeteria / outdoor / auto
 *
 * NO EXTERNAL PACKAGES REQUIRED beyond React + Tailwind (already in Lovable).
 *
 * BROWSER SUPPORT
 * ---------------
 * Chrome / Edge: full (Web Audio + Web Speech API)
 * Firefox: partial (Web Audio works; Web Speech not supported — repetition/interjection detection disabled)
 * Safari: partial (Web Audio works; Web Speech requires user flag)
 */

import { useState, useRef, useCallback, useEffect } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: TYPES
// ─────────────────────────────────────────────────────────────────────────────

type MarkerType = 'PROLONGATION' | 'BLOCK' | 'REPETITION' | 'INTERJECTION'
type AudioProfile = 'quiet' | 'classroom' | 'cafeteria' | 'outdoor'

interface StammerEvent {
  id:         string
  type:       MarkerType
  confidence: number
  durationMs: number
  timestamp:  Date
  detail:     string
}

interface AudioProfileConfig {
  vadMultiplier:  number
  zcrTensionCeil: number
  f0ToleranceHz:  number
  minSpeechRms:   number
  label:          string
}

interface Badge {
  id:          string
  label:       string
  emoji:       string
  earnedAt:    Date
  description: string
}

interface GamificationState {
  xpTotal:       number
  xpToday:       number
  level:         number
  currentStreak: number
  longestStreak: number
  badges:        Badge[]
  lastSessionDate: string | null   // ISO date string (date only, no time)
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const FRAME_MS = 30
const FFT_SIZE = 2048

const DEBOUNCE_MS: Record<MarkerType, number> = {
  BLOCK: 600, PROLONGATION: 400, REPETITION: 250, INTERJECTION: 1500,
}

const BASE_CONF: Record<MarkerType, number> = {
  REPETITION: 0.91, INTERJECTION: 0.86, BLOCK: 0.74, PROLONGATION: 0.67,
}

const FILLERS = [
  'um', 'uh', 'er', 'ah', 'hmm', 'em',
  'like', 'so', 'well', 'right',
  'basically', 'literally', 'actually',
  'you know', 'i mean', 'kind of', 'sort of',
]

const AUDIO_PROFILES: Record<AudioProfile, AudioProfileConfig> = {
  quiet:     { vadMultiplier: 3.0, zcrTensionCeil: 0.15, f0ToleranceHz: 40, minSpeechRms: 0.012, label: 'Quiet (home / therapy room)' },
  classroom: { vadMultiplier: 4.5, zcrTensionCeil: 0.20, f0ToleranceHz: 50, minSpeechRms: 0.025, label: 'Classroom' },
  cafeteria: { vadMultiplier: 7.0, zcrTensionCeil: 0.28, f0ToleranceHz: 60, minSpeechRms: 0.045, label: 'Cafeteria / playground' },
  outdoor:   { vadMultiplier: 6.0, zcrTensionCeil: 0.25, f0ToleranceHz: 55, minSpeechRms: 0.035, label: 'Outdoor' },
}

const BADGE_DEFS: Record<string, Omit<Badge, 'earnedAt'>> = {
  first_session:  { id: 'first_session',  label: 'First Words',   emoji: '🎤', description: 'Completed your first Stammerly session!' },
  three_sessions: { id: 'three_sessions', label: 'Consistent',    emoji: '🌟', description: 'Completed 3 sessions — building a habit!' },
  five_streak:    { id: 'five_streak',    label: '5-Day Streak',  emoji: '🔥', description: '5 sessions in a row — incredible dedication!' },
  brave_speaker:  { id: 'brave_speaker',  label: 'Brave Speaker', emoji: '🦁', description: 'Kept speaking through a tricky moment!' },
  level_5:        { id: 'level_5',        label: 'Rising Star',   emoji: '⭐', description: 'Reached Level 5!' },
  level_10:       { id: 'level_10',       label: 'Champion',      emoji: '🏆', description: 'Reached Level 10 — a Stammerly champion!' },
}

const MARKER_META: Record<MarkerType, { label: string; colour: string; bg: string; icon: string; parentTip: string }> = {
  PROLONGATION: { label: 'Prolongation', colour: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',   icon: '〰', parentTip: 'Try gentle vocal warm-ups and slow reading tonight.' },
  BLOCK:        { label: 'Block',        colour: 'text-red-600',    bg: 'bg-red-50 border-red-200',     icon: '●', parentTip: 'Focus on low-pressure, turn-taking conversation at dinner.' },
  REPETITION:   { label: 'Repetition',  colour: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200', icon: '↩', parentTip: 'Pause together before tricky words — no rushing.' },
  INTERJECTION: { label: 'Interjection',colour: 'text-purple-600', bg: 'bg-purple-50 border-purple-200',icon: '…', parentTip: 'Relaxed reading aloud can help build word confidence.' },
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: AUDIO HELPERS (pure functions — no React)
// ─────────────────────────────────────────────────────────────────────────────

function rms(buf: Float32Array): number {
  let s = 0
  for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]
  return Math.sqrt(s / buf.length)
}

function zcr(buf: Float32Array): number {
  let c = 0
  for (let i = 1; i < buf.length; i++) {
    if ((buf[i] >= 0) !== (buf[i - 1] >= 0)) c++
  }
  return c / buf.length
}

function estimateF0(buf: Float32Array, sampleRate: number): number {
  const minLag = Math.floor(sampleRate / 500)
  const maxLag = Math.floor(sampleRate / 70)
  const N      = Math.min(buf.length, 1024)
  let mean = 0
  for (let i = 0; i < N; i++) mean += buf[i]
  mean /= N
  let bestLag = 0, bestCorr = -1
  for (let lag = minLag; lag <= Math.min(maxLag, N >> 1); lag++) {
    let num = 0, den = 0
    for (let i = 0; i < N - lag; i++) {
      const xi = buf[i] - mean, xl = buf[i + lag] - mean
      num += xi * xl; den += xi * xi
    }
    const corr = den > 1e-10 ? num / den : 0
    if (corr > bestCorr) { bestCorr = corr; bestLag = lag }
  }
  return (bestLag > 0 && bestCorr >= 0.3) ? sampleRate / bestLag : 0
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: useStammerDetector HOOK
// ─────────────────────────────────────────────────────────────────────────────

function useStammerDetector(options: {
  onEvent?:         (e: StammerEvent) => void
  minBlockMs?:      number
  maxBlockMs?:      number
  audioProfile?:    AudioProfile | 'auto'
  onProfileChange?: (p: AudioProfile) => void
} = {}) {
  const { onEvent, minBlockMs = 120, maxBlockMs = 850, audioProfile: initProfile = 'quiet', onProfileChange } = options
  const autoMode = initProfile === 'auto'

  const [isRecording,   setIsRecording]   = useState(false)
  const [micGranted,    setMicGranted]    = useState(false)
  const [events,        setEvents]        = useState<StammerEvent[]>([])
  const [error,         setError]         = useState<string | null>(null)
  const [sessionStart,  setSessionStart]  = useState<Date | null>(null)
  const [calibrating,   setCalibrating]   = useState(false)
  const [vadThreshold,  setVadThreshold]  = useState(0.025)
  const [activeProfile, setActiveProfile] = useState<AudioProfile>(autoMode ? 'quiet' : initProfile as AudioProfile)

  const isRecordingRef    = useRef(false)
  const audioCtxRef       = useRef<AudioContext | null>(null)
  const analyserRef       = useRef<AnalyserNode | null>(null)
  const streamRef         = useRef<MediaStream | null>(null)
  const intervalRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const recognitionRef    = useRef<SpeechRecognition | null>(null)
  const timeBufRef        = useRef<Float32Array | null>(null)
  const freqBufRef        = useRef<Float32Array | null>(null)
  const wasSpeakingRef    = useRef(false)
  const silenceStartRef   = useRef<number | null>(null)
  const preBlockZCRRef    = useRef(0)
  const f0HistRef         = useRef<number[]>([])
  const prolongStartRef   = useRef<number | null>(null)
  const prolongF0Ref      = useRef(0)
  const lastWordsRef      = useRef<string[]>([])
  const finalTranscriptRef = useRef('')
  const lastEmitRef       = useRef<Record<MarkerType, number>>({ BLOCK: 0, PROLONGATION: 0, REPETITION: 0, INTERJECTION: 0 })
  const vadThresholdRef   = useRef(0.025)
  const activeProfileRef  = useRef<AudioProfile>(autoMode ? 'quiet' : initProfile as AudioProfile)
  const profileConfigRef  = useRef<AudioProfileConfig>(AUDIO_PROFILES[activeProfileRef.current])
  const onProfileChangeRef = useRef(onProfileChange)
  useEffect(() => { onProfileChangeRef.current = onProfileChange }, [onProfileChange])
  const energyHistRef     = useRef<number[]>([])
  const processAudioFrameRef = useRef<(() => void) | null>(null)
  const onEventRef        = useRef(onEvent)
  useEffect(() => { onEventRef.current = onEvent }, [onEvent])

  const setAudioProfile = useCallback((profile: AudioProfile) => {
    const baseline = vadThresholdRef.current / profileConfigRef.current.vadMultiplier
    activeProfileRef.current = profile
    profileConfigRef.current = AUDIO_PROFILES[profile]
    setActiveProfile(profile)
    const newThreshold = Math.max(profileConfigRef.current.minSpeechRms, baseline * profileConfigRef.current.vadMultiplier)
    vadThresholdRef.current = newThreshold
    setVadThreshold(newThreshold)
  }, [])

  const emit = useCallback((ev: Omit<StammerEvent, 'id' | 'timestamp'>) => {
    const now = Date.now()
    if (now - lastEmitRef.current[ev.type] < DEBOUNCE_MS[ev.type]) return
    lastEmitRef.current[ev.type] = now
    const full: StammerEvent = { ...ev, id: crypto.randomUUID(), timestamp: new Date() }
    setEvents(prev => [full, ...prev.slice(0, 499)])
    onEventRef.current?.(full)
  }, [])

  processAudioFrameRef.current = () => {
    const analyser = analyserRef.current, ctx = audioCtxRef.current, timeBuf = timeBufRef.current
    if (!analyser || !ctx || !timeBuf) return
    analyser.getFloatTimeDomainData(timeBuf)
    const energy = rms(timeBuf), crossRate = zcr(timeBuf)
    const isSpeech = energy > vadThresholdRef.current
    const now = Date.now(), profCfg = profileConfigRef.current

    // Auto-profile detection
    if (autoMode && !isSpeech) {
      energyHistRef.current.push(energy)
      if (energyHistRef.current.length > 60) energyHistRef.current.shift()
      if (energyHistRef.current.length >= 60) {
        const sorted = [...energyHistRef.current].sort((a, b) => a - b)
        const med = sorted[30]
        const detected: AudioProfile = med < 0.015 ? 'quiet' : med < 0.030 ? 'classroom' : med < 0.055 ? 'outdoor' : 'cafeteria'
        if (detected !== activeProfileRef.current) {
          activeProfileRef.current = detected
          profileConfigRef.current = AUDIO_PROFILES[detected]
          setActiveProfile(detected)
          onProfileChangeRef.current?.(detected)
          energyHistRef.current = []
        }
      }
    }

    // Block detection — two-edge state machine
    if (!isSpeech && wasSpeakingRef.current) {
      silenceStartRef.current = now
      preBlockZCRRef.current  = crossRate
    }
    if (isSpeech && !wasSpeakingRef.current && silenceStartRef.current !== null) {
      const dur = now - silenceStartRef.current
      if (dur >= minBlockMs && dur <= maxBlockMs) {
        const tension = preBlockZCRRef.current > profCfg.zcrTensionCeil
        emit({ type: 'BLOCK', confidence: Math.min(0.96, BASE_CONF.BLOCK + (tension ? 0.09 : 0)), durationMs: dur, detail: `Silent block — ${dur}ms${tension ? ' (articulatory tension)' : ''}` })
      }
      silenceStartRef.current = null
      preBlockZCRRef.current  = 0
    }
    wasSpeakingRef.current = isSpeech

    // Prolongation detection — autocorrelation F0 stability
    if (isSpeech) {
      const f0 = estimateF0(timeBuf, ctx.sampleRate)
      if (f0 > 0) {
        f0HistRef.current.push(f0)
        if (f0HistRef.current.length > 12) f0HistRef.current.shift()
        if (f0HistRef.current.length >= 8) {
          const hist = f0HistRef.current
          const mean = hist.reduce((a, b) => a + b, 0) / hist.length
          let maxDev = 0
          for (const v of hist) { const d = Math.abs(v - mean); if (d > maxDev) maxDev = d }
          if (maxDev <= profCfg.f0ToleranceHz) {
            if (prolongStartRef.current === null) { prolongStartRef.current = now; prolongF0Ref.current = mean }
            const dur = now - prolongStartRef.current
            if (dur > 350) emit({ type: 'PROLONGATION', confidence: BASE_CONF.PROLONGATION, durationMs: dur, detail: `Sustained ~${Math.round(prolongF0Ref.current)}Hz — ${Math.round(dur)}ms` })
          } else { prolongStartRef.current = null }
        }
      } else { f0HistRef.current = []; prolongStartRef.current = null }
    } else { f0HistRef.current = []; prolongStartRef.current = null }
  }

  const analyzeTranscript = useCallback((text: string, isFinal: boolean) => {
    const raw = text.trim().toLowerCase()
    const words = raw.replace(/[^a-z\s'-]/g, '').split(/\s+/).filter(w => w.length > 0)
    for (let i = 0; i < words.length - 1; i++) {
      const w = words[i].replace(/[^a-z]/g, '')
      if (w.length > 1 && w === words[i + 1].replace(/[^a-z]/g, ''))
        emit({ type: 'REPETITION', confidence: BASE_CONF.REPETITION, durationMs: 0, detail: `Word repeated: "${w}"` })
    }
    for (let i = 0; i < words.length - 3; i++) {
      if (words[i] === words[i + 2] && words[i + 1] === words[i + 3] && words[i].length > 1)
        emit({ type: 'REPETITION', confidence: BASE_CONF.REPETITION - 0.04, durationMs: 0, detail: `Phrase repeated: "${words[i]} ${words[i + 1]}"` })
    }
    for (const word of words) {
      if (/^([a-z]{1,3})-\1(-\1)+/.test(word))
        emit({ type: 'REPETITION', confidence: BASE_CONF.REPETITION, durationMs: 0, detail: `Sound repetition: "${word}"` })
    }
    const prevWords = lastWordsRef.current
    lastWordsRef.current = [...prevWords, ...words].slice(-20)
    if (prevWords.length > 0 && words.length > 0) {
      const last = prevWords[prevWords.length - 1]?.replace(/[^a-z]/g, '') ?? ''
      const first = words[0].replace(/[^a-z]/g, '')
      if (last.length > 2 && last === first)
        emit({ type: 'REPETITION', confidence: BASE_CONF.REPETITION - 0.08, durationMs: 0, detail: `Cross-utterance repeat: "${last}"` })
    }
    if (isFinal) {
      for (const filler of FILLERS) {
        const esc = filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        if (new RegExp(`(?:^|\\s)${esc}(?:\\s|[,.]|$)`).test(raw))
          emit({ type: 'INTERJECTION', confidence: BASE_CONF.INTERJECTION, durationMs: 0, detail: `Filler: "${filler}"` })
      }
      finalTranscriptRef.current += raw + ' '
    }
  }, [emit])

  const buildRecognition = useCallback((): SpeechRecognition | null => {
    const SpeechRec = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SpeechRec) return null
    const rec: SpeechRecognition = new SpeechRec()
    rec.continuous = true; rec.interimResults = true; rec.lang = 'en-GB'
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      for (let i = ev.resultIndex; i < ev.results.length; i++)
        analyzeTranscript(ev.results[i][0].transcript, ev.results[i].isFinal)
    }
    rec.onerror = (ev: SpeechRecognitionErrorEvent) => {
      if (ev.error !== 'no-speech' && ev.error !== 'aborted')
        console.warn('[Stammerly] SpeechRecognition error:', ev.error)
    }
    rec.onend = () => {
      if (isRecordingRef.current)
        setTimeout(() => { if (isRecordingRef.current) try { rec.start() } catch { /* ok */ } }, 100)
    }
    return rec
  }, [analyzeTranscript])

  const calibrateNoiseFloor = useCallback(async (analyser: AnalyserNode): Promise<number> => {
    setCalibrating(true)
    const buf = new Float32Array(analyser.frequencyBinCount)
    const readings: number[] = []
    await new Promise<void>(resolve => {
      const id = setInterval(() => {
        analyser.getFloatTimeDomainData(buf)
        readings.push(rms(buf))
        if (readings.length >= 20) { clearInterval(id); resolve() }
      }, FRAME_MS)
    })
    readings.sort((a, b) => a - b)
    const threshold = Math.max(0.012, readings[Math.floor(readings.length * 0.9)] * profileConfigRef.current.vadMultiplier)
    vadThresholdRef.current = threshold; setVadThreshold(threshold); setCalibrating(false)
    return threshold
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false, channelCount: 1 },
      })
    } catch { setError('Microphone access denied. Allow microphone access in browser settings.'); return }
    streamRef.current = stream; setMicGranted(true)
    const ctx = new AudioContext()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = FFT_SIZE; analyser.smoothingTimeConstant = 0
    ctx.createMediaStreamSource(stream).connect(analyser)
    audioCtxRef.current = ctx; analyserRef.current = analyser
    const N = analyser.frequencyBinCount
    timeBufRef.current = new Float32Array(N); freqBufRef.current = new Float32Array(N)
    wasSpeakingRef.current = false; silenceStartRef.current = null; preBlockZCRRef.current = 0
    f0HistRef.current = []; prolongStartRef.current = null; prolongF0Ref.current = 0
    lastWordsRef.current = []; finalTranscriptRef.current = ''; energyHistRef.current = []
    lastEmitRef.current = { BLOCK: 0, PROLONGATION: 0, REPETITION: 0, INTERJECTION: 0 }
    await calibrateNoiseFloor(analyser)
    intervalRef.current = setInterval(() => processAudioFrameRef.current?.(), FRAME_MS)
    const rec = buildRecognition()
    if (rec) { recognitionRef.current = rec; try { rec.start() } catch { /* ok */ } }
    isRecordingRef.current = true; setIsRecording(true); setSessionStart(new Date()); setEvents([])
  }, [calibrateNoiseFloor, buildRecognition])

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    try { recognitionRef.current?.stop() } catch { /* ok */ }
    recognitionRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null
    audioCtxRef.current?.close(); audioCtxRef.current = null
    analyserRef.current = null; timeBufRef.current = null; freqBufRef.current = null
    setIsRecording(false)
  }, [])

  useEffect(() => () => { if (isRecordingRef.current) stopRecording() }, [stopRecording])

  const counts = events.reduce((acc, e) => ({ ...acc, [e.type]: (acc[e.type] ?? 0) + 1 }), {} as Partial<Record<MarkerType, number>>)
  const sessionMs = sessionStart ? Date.now() - sessionStart.getTime() : 0
  const sessionMin = Math.max(0.05, sessionMs / 60_000)

  return {
    isRecording, micGranted, calibrating, error, events, sessionStart, vadThreshold, activeProfile,
    startRecording, stopRecording, setAudioProfile,
    counts,
    totalEvents:    events.length,
    eventsPerMin:   sessionMs > 5_000 ? +(events.length / sessionMin).toFixed(1) : 0,
    dominantMarker: Object.entries(counts).sort(([,a],[,b]) => (b??0)-(a??0))[0]?.[0] as MarkerType | undefined,
    fullTranscript: finalTranscriptRef.current,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: useGamification HOOK (localStorage — no backend required)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_GAMI: GamificationState = {
  xpTotal: 0, xpToday: 0, level: 1, currentStreak: 0, longestStreak: 0,
  badges: [], lastSessionDate: null,
}

function loadGami(childId: string): GamificationState {
  try {
    const raw = localStorage.getItem(`stammerly_gami_${childId}`)
    if (!raw) return { ...DEFAULT_GAMI }
    const d = JSON.parse(raw)
    return { ...DEFAULT_GAMI, ...d, badges: (d.badges ?? []).map((b: any) => ({ ...b, earnedAt: new Date(b.earnedAt) })) }
  } catch { return { ...DEFAULT_GAMI } }
}

function saveGami(childId: string, state: GamificationState) {
  try { localStorage.setItem(`stammerly_gami_${childId}`, JSON.stringify(state)) } catch { /* ok */ }
}

function computeSessionXP(blocks: number, durationMs: number, totalEvents: number): number {
  const durationMin = Math.min(30, durationMs / 60_000)
  const epm = durationMs > 0 ? totalEvents / (durationMs / 60_000) : 0
  let xp = 10 + Math.round(durationMin) + blocks * 2
  if (epm < 1.0 && totalEvents > 0) xp += 5
  return xp
}

function useGamification(childId: string) {
  const [state, setState] = useState<GamificationState>(() => loadGami(childId))
  const sessionCountRef = useRef(0)

  const awardSession = useCallback((blocks: number, durationMs: number, totalEvents: number): Badge[] => {
    sessionCountRef.current++
    const count = sessionCountRef.current
    const xp = computeSessionXP(blocks, durationMs, totalEvents)
    const today = new Date().toISOString().slice(0, 10)

    setState(prev => {
      const newXpTotal = prev.xpTotal + xp
      const newLevel = Math.max(1, Math.floor(newXpTotal / 100))
      const existing = new Set(prev.badges.map(b => b.id))

      // Streak logic
      let streak = prev.currentStreak, longest = prev.longestStreak
      if (!prev.lastSessionDate) streak = 1
      else {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
        const yStr = yesterday.toISOString().slice(0, 10)
        if (prev.lastSessionDate === today) { /* same day — no change */ }
        else if (prev.lastSessionDate === yStr) { streak++; longest = Math.max(longest, streak) }
        else { streak = 1 }
      }

      // Badge evaluation
      const newBadges: Badge[] = []
      const maybe = (id: string, cond: boolean) => {
        if (cond && !existing.has(id))
          newBadges.push({ ...BADGE_DEFS[id], earnedAt: new Date() })
      }
      maybe('first_session',  count >= 1)
      maybe('three_sessions', count >= 3)
      maybe('five_streak',    streak >= 5)
      maybe('brave_speaker',  blocks >= 3)
      maybe('level_5',        newLevel >= 5)
      maybe('level_10',       newLevel >= 10)

      const next: GamificationState = {
        xpTotal: newXpTotal,
        xpToday: prev.lastSessionDate === today ? prev.xpToday + xp : xp,
        level: newLevel,
        currentStreak: streak,
        longestStreak: longest,
        badges: [...prev.badges, ...newBadges],
        lastSessionDate: today,
      }
      saveGami(childId, next)
      return next
    })

    // Return new badges synchronously by computing again (state update is async)
    const cur = loadGami(childId)
    const existingIds = new Set(cur.badges.map(b => b.id))
    const earned: Badge[] = []
    const newXp = cur.xpTotal + xp
    const newLvl = Math.max(1, Math.floor(newXp / 100))
    if (count >= 1  && !existingIds.has('first_session'))  earned.push({ ...BADGE_DEFS.first_session,  earnedAt: new Date() })
    if (count >= 3  && !existingIds.has('three_sessions')) earned.push({ ...BADGE_DEFS.three_sessions, earnedAt: new Date() })
    if (blocks >= 3 && !existingIds.has('brave_speaker'))  earned.push({ ...BADGE_DEFS.brave_speaker,  earnedAt: new Date() })
    if (newLvl >= 5 && !existingIds.has('level_5'))        earned.push({ ...BADGE_DEFS.level_5,        earnedAt: new Date() })
    if (newLvl >= 10 && !existingIds.has('level_10'))      earned.push({ ...BADGE_DEFS.level_10,       earnedAt: new Date() })
    return earned
  }, [childId])

  return {
    state,
    awardSession,
    xpProgressPct: state.xpTotal % 100,
    xpToNextLevel: 100 - (state.xpTotal % 100),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: UI SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

type ViewMode = 'child' | 'parent' | 'therapist'
type DetectorReturn = ReturnType<typeof useStammerDetector>

function RecordButton({ isRecording, calibrating, onStart, onStop }: {
  isRecording: boolean; calibrating: boolean; onStart: () => void; onStop: () => void
}) {
  return (
    <button
      onClick={isRecording ? onStop : onStart}
      disabled={calibrating}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-all disabled:opacity-60 ${
        isRecording ? 'border-red-400 text-red-600 hover:bg-red-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {calibrating ? (
        <><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />Calibrating…</>
      ) : isRecording ? (
        <><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />Stop session</>
      ) : (
        <><span className="w-2 h-2 rounded-full bg-gray-400" />Start session</>
      )}
    </button>
  )
}

function StatCard({ label, value, colour }: { label: string; value: string | number; colour?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-medium ${colour ?? 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

function EventItem({ event }: { event: StammerEvent }) {
  const meta = MARKER_META[event.type]
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0 text-sm">
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${meta.bg} ${meta.colour}`}>{meta.label}</span>
      <span className="text-gray-500 text-xs">{event.detail}</span>
      <span className="text-gray-400 text-xs ml-auto">{event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
    </div>
  )
}

function ProfileSelector({ active, onChange }: { active: AudioProfile; onChange: (p: AudioProfile) => void }) {
  const profiles: AudioProfile[] = ['quiet', 'classroom', 'cafeteria', 'outdoor']
  const icons: Record<AudioProfile, string> = { quiet: '🏠', classroom: '📚', cafeteria: '🍽', outdoor: '🌳' }
  return (
    <div className="flex gap-1">
      {profiles.map(p => (
        <button key={p} onClick={() => onChange(p)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg border transition-colors ${
            active === p ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {icons[p]} {AUDIO_PROFILES[p].label.split(' ')[0]}
        </button>
      ))}
    </div>
  )
}

function BadgeDisplay({ badges }: { badges: Badge[] }) {
  if (!badges.length) return null
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-3">
      {badges.map(b => (
        <div key={b.id} className="flex flex-col items-center gap-1" title={b.description}>
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-lg">{b.emoji}</div>
          <span className="text-xs text-gray-500">{b.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Child view ─────────────────────────────────────────────────────────────────

function ChildView({ name, detector, gami }: { name: string; detector: DetectorReturn; gami: ReturnType<typeof useGamification> }) {
  const { state, xpProgressPct, xpToNextLevel } = gami
  const happy = !detector.isRecording || detector.totalEvents < 3
  return (
    <div>
      <div className="flex flex-col items-center py-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-3 transition-colors ${detector.isRecording ? 'bg-green-100' : 'bg-blue-50'}`}>
          {happy ? '👻' : '⭐'}
        </div>
        <p className="text-base font-medium text-gray-900">{detector.isRecording ? `${name} is speaking!` : 'Ziggy is ready!'}</p>
        <p className="text-sm text-gray-500 mt-1">{detector.isRecording ? 'Great job — keep going!' : 'Press start session to begin your speaking adventure'}</p>
        <div className="w-full max-w-xs mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Level {state.level} XP</span>
            <span>{xpProgressPct} / 100 ({xpToNextLevel} to next level)</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${xpProgressPct}%` }} />
          </div>
        </div>
        {state.currentStreak > 1 && (
          <p className="text-sm text-amber-600 mt-2">🔥 {state.currentStreak}-day streak!</p>
        )}
      </div>
      <div className="bg-gray-50 rounded-2xl p-4 text-center max-w-sm mx-auto mb-4">
        <p className="text-2xl mb-2">🏆</p>
        <p className="text-sm font-medium text-gray-900 mb-1.5">Today's challenge</p>
        <p className="text-sm text-gray-500">
          {detector.dominantMarker === 'BLOCK' ? 'Try breathing slowly before your next words — you can do it!'
            : detector.dominantMarker === 'REPETITION' ? 'Pausing before tricky words is a superpower. Practise it!'
            : 'Take your time with each word — slow and steady wins the race!'}
        </p>
      </div>
      <BadgeDisplay badges={state.badges} />
      {detector.events.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Ziggy noticed…</p>
          <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-36 overflow-y-auto">
            {detector.events.slice(0, 8).map(e => (
              <div key={e.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                <span>{MARKER_META[e.type].icon}</span>
                <span className="text-gray-700">{MARKER_META[e.type].label}</span>
                <span className="text-gray-400 text-xs ml-auto">{e.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Parent view ────────────────────────────────────────────────────────────────

function ParentView({ name, detector }: { name: string; detector: DetectorReturn }) {
  const top = detector.dominantMarker
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <StatCard label="Events today"  value={detector.totalEvents || '—'} />
        <StatCard label="Most common"   value={top ? MARKER_META[top].label : '—'} />
        <StatCard label="Rate / min"    value={detector.eventsPerMin > 0 ? detector.eventsPerMin : '—'} />
        <StatCard label="Blocks"        value={detector.counts.BLOCK ?? 0} colour="text-red-600" />
      </div>
      <div className="mb-5">
        <p className="text-sm font-medium text-gray-700 mb-2.5">Session breakdown</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(MARKER_META) as MarkerType[]).map(mk => {
            const count = detector.counts[mk] ?? 0
            const pct = detector.totalEvents > 0 ? (count / detector.totalEvents) * 100 : 0
            const meta = MARKER_META[mk]
            return (
              <div key={mk} className={`p-3 rounded-xl border ${meta.bg}`}>
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`text-xs font-medium ${meta.colour}`}>{meta.label}</span>
                  <span className={`text-lg font-medium ${meta.colour}`}>{count}</span>
                </div>
                <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${mk === 'BLOCK' ? 'bg-red-400' : mk === 'REPETITION' ? 'bg-amber-400' : mk === 'PROLONGATION' ? 'bg-blue-400' : 'bg-purple-400'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {detector.totalEvents > 0 ? (
        <div className="space-y-2.5">
          {(detector.counts.BLOCK ?? 0) > 2 && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100">
              <p className="text-sm font-medium text-red-700 mb-0.5">High-tension blocks detected</p>
              <p className="text-sm text-gray-600">{name} had {detector.counts.BLOCK} blocking moments. Try relaxed reading together tonight.</p>
            </div>
          )}
          {(detector.counts.REPETITION ?? 0) > (detector.counts.BLOCK ?? 0) && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-medium text-amber-700 mb-0.5">Repetitions were the main pattern</p>
              <p className="text-sm text-gray-600">Repetitions often increase when a child feels excited or rushed. No-pressure conversation works well.</p>
            </div>
          )}
          {top && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm font-medium text-blue-700 mb-0.5">Tonight's suggestion</p>
              <p className="text-sm text-gray-600">{MARKER_META[top].parentTip}</p>
            </div>
          )}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500">🔒 No audio was recorded or stored. Only event metadata (type, duration, timestamp) is logged locally.</p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-gray-50 text-center">
          <p className="text-sm text-gray-500">Start a session to see personalised insights for {name}.</p>
        </div>
      )}
    </div>
  )
}

// ── Therapist view ─────────────────────────────────────────────────────────────

function TherapistView({ name, detector }: { name: string; detector: DetectorReturn }) {
  const exportCSV = () => {
    if (!detector.events.length) return
    const rows = ['timestamp,type,confidence,duration_ms,detail', ...detector.events.map(e => `${e.timestamp.toISOString()},${e.type},${e.confidence.toFixed(3)},${e.durationMs},"${e.detail}"`)]
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }))
    a.download = `stammerly_${name}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <StatCard label="Prolongations" value={detector.counts.PROLONGATION ?? 0} colour="text-blue-600" />
        <StatCard label="Blocks"        value={detector.counts.BLOCK        ?? 0} colour="text-red-600" />
        <StatCard label="Repetitions"   value={detector.counts.REPETITION   ?? 0} colour="text-amber-600" />
        <StatCard label="Interjections" value={detector.counts.INTERJECTION ?? 0} colour="text-purple-600" />
      </div>
      {detector.totalEvents > 0 && (
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <StatCard label="Total events"  value={detector.totalEvents} />
          <StatCard label="Events / min"  value={detector.eventsPerMin} />
          <StatCard label="VAD threshold" value={detector.vadThreshold.toFixed(4)} />
        </div>
      )}
      {detector.totalEvents > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">AI pattern analysis</p>
          {(detector.counts.BLOCK ?? 0) > 2 && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-800">
              {detector.counts.BLOCK} blocks detected — consider reviewing diaphragmatic breath-support and easy onset technique.
            </div>
          )}
          {(detector.counts.REPETITION ?? 0) > (detector.counts.BLOCK ?? 0) && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-800">
              Repetitions ({detector.counts.REPETITION}) exceed blocks ({detector.counts.BLOCK ?? 0}) — pattern consistent with anticipatory anxiety. Consider pull-out techniques.
            </div>
          )}
          {(detector.counts.INTERJECTION ?? 0) > 3 && (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-sm text-purple-800">
              High interjection count ({detector.counts.INTERJECTION}) — may indicate avoidance strategy. Discuss word substitution awareness.
            </div>
          )}
        </div>
      )}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700">Event log</p>
          {detector.events.length > 0 && (
            <button onClick={exportCSV} className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors">↓ Export CSV</button>
          )}
        </div>
        <div className="border border-gray-100 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
          {detector.events.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No events yet — start a session</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {detector.events.map(e => <EventItem key={e.id} event={e} />)}
            </div>
          )}
        </div>
      </div>
      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
        <p className="text-xs font-medium text-gray-600 mb-1.5">Detection method reference</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>🔵 Prolongation — pitch stability (autocorrelation F0)</span>
          <span>🔴 Block — silence window + ZCR tension signal</span>
          <span>🟡 Repetition — transcript analysis (4 patterns)</span>
          <span>🟣 Interjection — filler word match (final results only)</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: MAIN COMPONENT (default export)
// ─────────────────────────────────────────────────────────────────────────────

interface StammerDetectorProps {
  /** Child's display name shown in UI. Default: "Leo" */
  childName?: string
  /** Unique ID for gamification persistence. Default: "child_001" */
  childId?: string
  /** Starting view. Default: "parent" */
  defaultView?: ViewMode
  /** Starting audio profile. Default: "quiet" */
  defaultProfile?: AudioProfile | 'auto'
  /** Called on every detected event (for logging to your own API) */
  onEvent?: (event: StammerEvent) => void
}

export function StammerDetector({
  childName    = 'Leo',
  childId      = 'child_001',
  defaultView  = 'parent',
  defaultProfile = 'quiet',
  onEvent,
}: StammerDetectorProps) {
  const [view,          setView]          = useState<ViewMode>(defaultView)
  const [newBadgeQueue, setNewBadgeQueue] = useState<Badge[]>([])

  const detector = useStammerDetector({
    audioProfile: defaultProfile,
    onEvent: (e) => {
      onEvent?.(e)
      console.log('[Stammerly]', e.type, e.detail, `conf=${e.confidence.toFixed(2)}`)
    },
    onProfileChange: (p) => console.log('[Stammerly] auto-switched profile →', p),
  })

  const gami = useGamification(childId)

  // Award XP when a session ends
  const prevRecording = useRef(false)
  useEffect(() => {
    if (prevRecording.current && !detector.isRecording && detector.events.length > 0) {
      const sessionMs = detector.sessionStart ? Date.now() - detector.sessionStart.getTime() : 60_000
      const newBadges = gami.awardSession(detector.counts.BLOCK ?? 0, sessionMs, detector.totalEvents)
      if (newBadges.length > 0) {
        setNewBadgeQueue(newBadges)
        setTimeout(() => setNewBadgeQueue([]), 4000)
      }
    }
    prevRecording.current = detector.isRecording
  }, [detector.isRecording])

  return (
    <div className="w-full max-w-2xl mx-auto font-sans">

      {/* New badge toast */}
      {newBadgeQueue.map(b => (
        <div key={b.id} className="fixed top-4 right-4 z-50 bg-white border border-amber-200 rounded-2xl shadow-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-3xl">{b.emoji}</span>
          <div>
            <p className="text-sm font-medium text-gray-900">New badge: {b.label}!</p>
            <p className="text-xs text-gray-500">{b.description}</p>
          </div>
        </div>
      ))}

      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5 flex-wrap">
        <span className="text-base font-medium text-gray-900 flex items-center gap-1.5">🎙 Stammerly</span>
        <div className="flex gap-1.5 flex-1">
          {(['child', 'parent', 'therapist'] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 text-sm rounded-lg border transition-colors ${view === v ? 'bg-gray-100 border-gray-300 text-gray-900 font-medium' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              {v === 'child' ? '🐣' : v === 'parent' ? '🏠' : '🩺'} {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <RecordButton isRecording={detector.isRecording} calibrating={detector.calibrating} onStart={detector.startRecording} onStop={detector.stopRecording} />
      </div>

      {/* Audio profile row (shown to therapist / parent) */}
      {view !== 'child' && detector.isRecording && (
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-500">Environment:</span>
          <ProfileSelector active={detector.activeProfile} onChange={detector.setAudioProfile} />
          <span className="text-xs text-gray-400 ml-auto">VAD: {detector.vadThreshold.toFixed(4)}</span>
        </div>
      )}

      {/* Error banner */}
      {detector.error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{detector.error}</div>
      )}

      {/* Views */}
      {view === 'child'     && <ChildView     name={childName} detector={detector} gami={gami} />}
      {view === 'parent'    && <ParentView    name={childName} detector={detector} />}
      {view === 'therapist' && <TherapistView name={childName} detector={detector} />}
    </div>
  )
}

export default StammerDetector
