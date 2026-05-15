/**
 * useStammerDetector.ts — v2
 * ──────────────────────────
 * Production-grade stammer detection hook for Stammerly.com
 *
 * Detection runs entirely in the browser — no audio leaves the device.
 * Two layers run in parallel every 30ms:
 *
 *   Layer A — Web Audio API:
 *     • BLOCK        — voiced speech → silence (120–850ms) → speech resumes
 *                      confidence boosted when pre-silence ZCR is elevated
 *                      (elevated ZCR = articulatory tension = likely block, not pause)
 *     • PROLONGATION — autocorrelation F0 estimate stays stable (±40Hz) for >350ms
 *                      autocorrelation is used instead of FFT peak because harmonics
 *                      routinely beat the fundamental in FFT magnitude, giving wrong Hz
 *
 *   Layer B — Web Speech API transcript:
 *     • REPETITION   — consecutive identical words, 2-word phrase repeats,
 *                      syllable repetitions (b-b-ball), cross-utterance sliding window
 *     • INTERJECTION — filler word matching on final transcripts only
 *                      (interim results produce too many false positives)
 *
 * Key v2 fixes over v1:
 *   ✓ setInterval(30ms) replaces requestAnimationFrame (wrong rate for audio)
 *   ✓ Pre-allocated Float32Array buffers — no GC pressure in the hot loop
 *   ✓ isRecordingRef fixes stale closure in rec.onend (auto-restart now works)
 *   ✓ Autocorrelation replaces FFT peak for F0 (dramatically more accurate)
 *   ✓ noiseSuppression: false — browser NS removes block silence + tension signals
 *   ✓ Noise floor calibration (600ms ambient sample, adaptive VAD threshold)
 *   ✓ ZCR boost for block confidence (articulatory tension signal)
 *   ✓ Per-event-type debounce (prevents event spam)
 *   ✓ processAudioFrameRef pattern — avoids duplicate audio loops on re-render
 *   ✓ Clean two-edge block state machine (only fires on speech→silence→speech)
 *   ✓ analyser.smoothingTimeConstant = 0 (smoothing masks block onset)
 */

import { useState, useRef, useCallback, useEffect } from 'react'

// ── Public types ───────────────────────────────────────────────────────────────

export type MarkerType = 'PROLONGATION' | 'BLOCK' | 'REPETITION' | 'INTERJECTION'

export interface StammerEvent {
  id:         string
  type:       MarkerType
  confidence: number      // 0–1
  durationMs: number
  timestamp:  Date
  detail:     string      // e.g. 'Silent block — 340ms (tension detected)'
}

export type AudioProfile = 'quiet' | 'classroom' | 'cafeteria' | 'outdoor'

/** Per-profile VAD and detection parameters. */
export interface AudioProfileConfig {
  /** Noise-floor baseline × this multiplier = VAD threshold */
  vadMultiplier:   number
  /** ZCR above this = articulatory tension signal */
  zcrTensionCeil:  number
  /** ±Hz tolerance for prolongation F0 stability */
  f0ToleranceHz:   number
  /** Absolute minimum RMS to declare speech (floor safety net) */
  minSpeechRms:    number
  label:           string
}

export const AUDIO_PROFILES: Record<AudioProfile, AudioProfileConfig> = {
  quiet: {
    vadMultiplier:  3.0,
    zcrTensionCeil: 0.15,
    f0ToleranceHz:  40,
    minSpeechRms:   0.012,
    label:          'Quiet (home / therapy room)',
  },
  classroom: {
    vadMultiplier:  4.5,
    zcrTensionCeil: 0.20,
    f0ToleranceHz:  50,
    minSpeechRms:   0.025,
    label:          'Classroom',
  },
  cafeteria: {
    vadMultiplier:  7.0,
    zcrTensionCeil: 0.28,
    f0ToleranceHz:  60,
    minSpeechRms:   0.045,
    label:          'Cafeteria / playground',
  },
  outdoor: {
    vadMultiplier:  6.0,
    zcrTensionCeil: 0.25,
    f0ToleranceHz:  55,
    minSpeechRms:   0.035,
    label:          'Outdoor',
  },
}

// Rolling energy window for auto-profile detection (last 60 frames = 1.8s)
const AUTO_PROFILE_WINDOW = 60

export interface DetectorOptions {
  childId?:    string
  onEvent?:    (event: StammerEvent) => void
  /** Minimum silence to qualify as a block (ms). Default: 120 */
  minBlockMs?: number
  /** Maximum silence before it's treated as a natural pause (ms). Default: 850 */
  maxBlockMs?: number
  /**
   * Starting audio profile. Default: 'quiet'.
   * Can be changed at any time via setAudioProfile().
   * Pass 'auto' to enable automatic environment detection.
   */
  audioProfile?: AudioProfile | 'auto'
  /** Called when the auto-detector switches profiles. */
  onProfileChange?: (profile: AudioProfile) => void
  /**
   * Optional speaker-gate predicate. Return false to ignore this audio
   * frame (e.g. it belongs to another speaker). Typically supplied by
   * useSpeakerProfile().scoreFrame. When omitted the gate is open.
   */
  scoreFrame?: (timeBuf: Float32Array, f0Hz: number) => boolean
}

// ── Internal constants ────────────────────────────────────────────────────────

const FRAME_MS  = 30     // Audio frame interval in ms (matches standard VAD frame size)
const FFT_SIZE  = 2048   // ~128ms window at 16kHz; gives 8Hz frequency resolution

// Minimum ms between consecutive events of the same type.
// Without this, one prolongation fires hundreds of times per second.
const DEBOUNCE_MS: Record<MarkerType, number> = {
  BLOCK:        600,
  PROLONGATION: 400,
  REPETITION:   250,
  INTERJECTION: 1500,   // Same filler word shouldn't fire more than once per 1.5s
}

// Base confidence scores. Transcript-based methods are most reliable because
// they work at the semantic level, not the noisy raw-audio level.
const BASE_CONF: Record<MarkerType, number> = {
  REPETITION:   0.91,
  INTERJECTION: 0.86,
  BLOCK:        0.74,
  PROLONGATION: 0.67,
}

// Filler words to detect as interjections.
// Multi-word entries ("you know") are handled by the regex in analyzeTranscript.
const FILLERS = [
  'um', 'uh', 'er', 'ah', 'hmm', 'em',
  'like', 'so', 'well', 'right',
  'basically', 'literally', 'actually',
  'you know', 'i mean', 'kind of', 'sort of',
]

// ── Audio-only helpers (no React, no closures) ────────────────────────────────

/** RMS energy — explicit loop, faster than Float32Array.reduce on hot path */
function rms(buf: Float32Array): number {
  let s = 0
  for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]
  return Math.sqrt(s / buf.length)
}

/**
 * Zero-crossing rate — fraction of samples where the signal crosses zero.
 * High ZCR in voiced speech = fricative consonants or articulatory tension.
 * When ZCR is elevated just before a silence, it's a tension signal that
 * distinguishes a stutter block from a natural breath pause.
 */
function zcr(buf: Float32Array): number {
  let c = 0
  for (let i = 1; i < buf.length; i++) {
    if ((buf[i] >= 0) !== (buf[i - 1] >= 0)) c++
  }
  return c / buf.length
}

/**
 * Autocorrelation-based fundamental frequency (F0) estimation.
 *
 * Why autocorrelation instead of FFT peak?
 * In voiced speech the fundamental (F0) is often WEAKER than its harmonics
 * (2×F0, 3×F0 etc.) in the FFT magnitude spectrum. The FFT peak method
 * therefore routinely returns 2× or 3× the true F0. Autocorrelation finds
 * the period of the periodic signal directly, bypassing this problem.
 *
 * Returns estimated F0 in Hz, or 0 if no voiced pitch is detected.
 * Range: 70–500 Hz covers children (150–400Hz) and adults (80–250Hz).
 */
function estimateF0(buf: Float32Array, sampleRate: number): number {
  const minLag = Math.floor(sampleRate / 500)   // upper F0 limit
  const maxLag = Math.floor(sampleRate / 70)    // lower F0 limit
  const N      = Math.min(buf.length, 1024)

  // Mean-subtract (removes DC offset, improves accuracy)
  let mean = 0
  for (let i = 0; i < N; i++) mean += buf[i]
  mean /= N

  let bestLag = 0, bestCorr = -1
  for (let lag = minLag; lag <= Math.min(maxLag, N >> 1); lag++) {
    let num = 0, den = 0
    for (let i = 0; i < N - lag; i++) {
      const xi = buf[i] - mean
      const xl = buf[i + lag] - mean
      num += xi * xl
      den += xi * xi
    }
    const corr = den > 1e-10 ? num / den : 0
    if (corr > bestCorr) { bestCorr = corr; bestLag = lag }
  }

  // Require correlation ≥ 0.3 — below this is noise / unvoiced
  return (bestLag > 0 && bestCorr >= 0.3) ? sampleRate / bestLag : 0
}

// ── Main hook ─────────────────────────────────────────────────────────────────

export function useStammerDetector(options: DetectorOptions = {}) {
  const {
    onEvent,
    minBlockMs   = 120,
    maxBlockMs   = 850,
    audioProfile: initialProfile = 'quiet',
    onProfileChange,
    scoreFrame,
  } = options

  const autoMode = initialProfile === 'auto'

  // Stable ref so the hot loop always reads the latest gate without recreating
  const scoreFrameRef = useRef(scoreFrame)
  useEffect(() => { scoreFrameRef.current = scoreFrame }, [scoreFrame])

  // ── React state (only what drives re-renders) ─────────────────────────────
  const [isRecording,   setIsRecording]   = useState(false)
  const [micGranted,    setMicGranted]    = useState(false)
  const [events,        setEvents]        = useState<StammerEvent[]>([])
  const [error,         setError]         = useState<string | null>(null)
  const [sessionStart,  setSessionStart]  = useState<Date | null>(null)
  const [calibrating,   setCalibrating]   = useState(false)
  const [vadThreshold,  setVadThreshold]  = useState(0.025)
  const [activeProfile, setActiveProfile] = useState<AudioProfile>(
    autoMode ? 'quiet' : (initialProfile as AudioProfile)
  )

  // ── Stable refs ───────────────────────────────────────────────────────────
  const isRecordingRef   = useRef(false)   // avoids stale closure in rec.onend
  const audioCtxRef      = useRef<AudioContext | null>(null)
  const analyserRef      = useRef<AnalyserNode | null>(null)
  const streamRef        = useRef<MediaStream | null>(null)
  const intervalRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const recognitionRef   = useRef<any>(null)

  // Pre-allocated buffers — created once per session, reused every 30ms frame.
  // Allocating Float32Array inside the hot loop would trigger GC constantly.
  const timeBufRef = useRef<Float32Array | null>(null)
  const freqBufRef = useRef<Float32Array | null>(null)

  // ── Block detection state ─────────────────────────────────────────────────
  const wasSpeakingRef   = useRef(false)
  const silenceStartRef  = useRef<number | null>(null)
  const preBlockZCRRef   = useRef(0)

  // ── Prolongation detection state ──────────────────────────────────────────
  // f0HistRef: ring buffer of recent F0 readings (one per 30ms frame)
  // 12 frames = 360ms window — enough to confirm a prolongation
  const f0HistRef       = useRef<number[]>([])
  const prolongStartRef = useRef<number | null>(null)
  const prolongF0Ref    = useRef(0)

  // ── Transcript state ──────────────────────────────────────────────────────
  const lastWordsRef       = useRef<string[]>([])  // sliding window (last 20 words)
  const finalTranscriptRef = useRef('')

  // ── Debounce state ────────────────────────────────────────────────────────
  const lastEmitRef = useRef<Record<MarkerType, number>>({
    BLOCK: 0, PROLONGATION: 0, REPETITION: 0, INTERJECTION: 0,
  })

  // ── VAD threshold ref (adaptive, updated after calibration) ──────────────
  const vadThresholdRef = useRef(0.025)

  // ── Audio profile refs ────────────────────────────────────────────────────
  // Stored in refs so the hot audio loop always reads the current profile
  // without needing to be recreated.
  const activeProfileRef  = useRef<AudioProfile>(autoMode ? 'quiet' : (initialProfile as AudioProfile))
  const profileConfigRef  = useRef<AudioProfileConfig>(AUDIO_PROFILES[activeProfileRef.current])
  const onProfileChangeRef = useRef(onProfileChange)
  useEffect(() => { onProfileChangeRef.current = onProfileChange }, [onProfileChange])

  // Rolling energy buffer for auto-profile detection
  const energyHistRef = useRef<number[]>([])

  // ── processAudioFrame ref ─────────────────────────────────────────────────
  // Storing the frame processor in a ref and calling it via setInterval means
  // the interval never needs to be recreated when callbacks change. Without
  // this pattern, a new useCallback would create a second audio loop.
  const processAudioFrameRef = useRef<(() => void) | null>(null)

  // ── Audio profile switching ───────────────────────────────────────────────

  /**
   * Manually switch the audio profile. Immediately recalculates the VAD
   * threshold from the calibrated noise floor and the new profile multiplier.
   *
   * Call this from your UI or from a context-switching signal
   * (e.g. the child's timetable says it's now lunchtime → 'cafeteria').
   */
  const setAudioProfile = useCallback((profile: AudioProfile) => {
    activeProfileRef.current  = profile
    profileConfigRef.current  = AUDIO_PROFILES[profile]
    setActiveProfile(profile)

    // Recalculate VAD threshold for new profile without recalibrating
    // (we keep the baseline noise floor, just apply a different multiplier)
    // The baseline is stored implicitly: threshold / current multiplier = baseline
    const currentThreshold = vadThresholdRef.current
    const currentConfig    = AUDIO_PROFILES[activeProfileRef.current]
    const baseline         = currentThreshold / currentConfig.vadMultiplier
    const newThreshold     = Math.max(
      profileConfigRef.current.minSpeechRms,
      baseline * profileConfigRef.current.vadMultiplier
    )
    vadThresholdRef.current = newThreshold
    setVadThreshold(newThreshold)
  }, [])

  // ── Emit (with per-type debounce) ─────────────────────────────────────────
  // Stored in a ref so the audio loop can call it without stale onEvent closure
  const onEventRef = useRef(onEvent)
  useEffect(() => { onEventRef.current = onEvent }, [onEvent])

  const emit = useCallback((ev: Omit<StammerEvent, 'id' | 'timestamp'>) => {
    const now = Date.now()
    if (now - lastEmitRef.current[ev.type] < DEBOUNCE_MS[ev.type]) return
    lastEmitRef.current[ev.type] = now

    const full: StammerEvent = { ...ev, id: crypto.randomUUID(), timestamp: new Date() }
    setEvents(prev => [full, ...prev.slice(0, 499)])
    onEventRef.current?.(full)
  }, [])

  // ── Assign frame processor ────────────────────────────────────────────────
  // Written as a ref assignment (not useCallback) so it always has the latest
  // references to analyserRef, timeBufRef etc. without recreating the interval.
  processAudioFrameRef.current = () => {
    const analyser = analyserRef.current
    const ctx      = audioCtxRef.current
    const timeBuf  = timeBufRef.current
    if (!analyser || !ctx || !timeBuf) return

    analyser.getFloatTimeDomainData(timeBuf as any)

    const energy    = rms(timeBuf)
    const crossRate = zcr(timeBuf)
    const threshold = vadThresholdRef.current
    const isSpeech  = energy > threshold
    const now       = Date.now()
    const profCfg   = profileConfigRef.current

    // ── SPEAKER GATE ───────────────────────────────────────────────────────
    // If a speaker fingerprint is enrolled, drop frames that don't plausibly
    // come from the enrolled child (other voices in the room, loud ambient).
    // Estimating F0 here is cheap and reused below for prolongation tracking.
    const gate = scoreFrameRef.current
    if (gate) {
      const f0ForGate = isSpeech ? estimateF0(timeBuf, ctx.sampleRate) : 0
      if (!gate(timeBuf, f0ForGate)) return
    }

    // ── AUTO PROFILE DETECTION ─────────────────────────────────────────────
    // Maintains a rolling window of RMS energy. If the median ambient energy
    // in silence periods exceeds the expected range for the current profile,
    // automatically switch to a noisier profile.
    //
    // Only runs in auto mode and only on silence frames (to measure ambient
    // noise, not foreground speech).
    if (autoMode && !isSpeech) {
      energyHistRef.current.push(energy)
      if (energyHistRef.current.length > AUTO_PROFILE_WINDOW) {
        energyHistRef.current.shift()
      }
      if (energyHistRef.current.length >= AUTO_PROFILE_WINDOW) {
        const sorted  = [...energyHistRef.current].sort((a, b) => a - b)
        const medianE = sorted[Math.floor(sorted.length / 2)]

        // Map median ambient RMS to a profile — thresholds are empirical
        let detected: AudioProfile =
          medianE < 0.015 ? 'quiet'     :
          medianE < 0.030 ? 'classroom' :
          medianE < 0.055 ? 'outdoor'   :
                            'cafeteria'

        if (detected !== activeProfileRef.current) {
          activeProfileRef.current = detected
          profileConfigRef.current = AUDIO_PROFILES[detected]
          setActiveProfile(detected)
          onProfileChangeRef.current?.(detected)
          energyHistRef.current = []   // Reset after switch
        }
      }
    }

    // ── BLOCK DETECTION ────────────────────────────────────────────────────
    //
    // State machine (two clean edges only):
    //   SPEAKING → SILENCE  : record silence start + ZCR at that moment
    //   SILENCE  → SPEAKING : measure gap; if in block window → emit BLOCK
    //
    // ZCR confidence boost:
    //   Articulatory tension (the physical struggle of a block) produces
    //   turbulent airflow which elevates ZCR just before the silent block.
    //   A natural breath pause does not. Threshold of 0.15 (empirical).

    if (!isSpeech && wasSpeakingRef.current) {
      // Falling edge: speech ended — start timing the silence
      silenceStartRef.current = now
      preBlockZCRRef.current  = crossRate
    }

    if (isSpeech && !wasSpeakingRef.current && silenceStartRef.current !== null) {
      // Rising edge: speech resumed — evaluate the silence window
      const silenceDur = now - silenceStartRef.current
      if (silenceDur >= minBlockMs && silenceDur <= maxBlockMs) {
        const tensionDetected = preBlockZCRRef.current > profCfg.zcrTensionCeil
        emit({
          type:       'BLOCK',
          confidence: Math.min(0.96, BASE_CONF.BLOCK + (tensionDetected ? 0.09 : 0)),
          durationMs: silenceDur,
          detail:     `Silent block — ${silenceDur}ms${tensionDetected ? ' (articulatory tension)' : ''}`,
        })
      }
      silenceStartRef.current = null
      preBlockZCRRef.current  = 0
    }

    wasSpeakingRef.current = isSpeech

    // ── PROLONGATION DETECTION ─────────────────────────────────────────────
    //
    // Algorithm:
    //   1. Estimate F0 via autocorrelation every frame
    //   2. Push to a 12-sample ring buffer (360ms window)
    //   3. If all readings in the buffer are within ±40Hz of the buffer mean
    //      → F0 is stable → voiced phoneme is being sustained → PROLONGATION
    //
    // The ±40Hz tolerance accounts for natural F0 micro-variation in speech.
    // We reject unvoiced frames (F0 = 0) which reset the history.

    if (isSpeech) {
      const f0 = estimateF0(timeBuf, ctx.sampleRate)

      if (f0 > 0) {
        // Voiced frame
        f0HistRef.current.push(f0)
        if (f0HistRef.current.length > 12) f0HistRef.current.shift()

        if (f0HistRef.current.length >= 8) {
          const hist   = f0HistRef.current
          const mean   = hist.reduce((a, b) => a + b, 0) / hist.length
          let   maxDev = 0
          for (const v of hist) { const d = Math.abs(v - mean); if (d > maxDev) maxDev = d }

          if (maxDev <= profCfg.f0ToleranceHz) {
            // F0 stable — prolongation in progress
            if (prolongStartRef.current === null) {
              prolongStartRef.current = now
              prolongF0Ref.current    = mean
            }
            const dur = now - prolongStartRef.current
            if (dur > 350) {
              emit({
                type:       'PROLONGATION',
                confidence: BASE_CONF.PROLONGATION,
                durationMs: dur,
                detail:     `Sustained ~${Math.round(prolongF0Ref.current)}Hz — ${Math.round(dur)}ms`,
              })
            }
          } else {
            prolongStartRef.current = null
          }
        }
      } else {
        // Unvoiced frame (consonant, fricative) — reset
        f0HistRef.current   = []
        prolongStartRef.current = null
      }
    } else {
      // Silence — reset
      f0HistRef.current   = []
      prolongStartRef.current = null
    }
  }

  // ── Transcript analysis ───────────────────────────────────────────────────

  const analyzeTranscript = useCallback((text: string, isFinal: boolean) => {
    // Normalise: lowercase, strip punctuation, split into words
    const raw   = text.trim().toLowerCase()
    const words = raw
      .replace(/[^a-z\s'-]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 0)

    // ── Consecutive word repetitions ─────────────────────────────────────
    // e.g. "I I want", "the the the cat"
    for (let i = 0; i < words.length - 1; i++) {
      const w = words[i].replace(/[^a-z]/g, '')
      if (w.length > 1 && w === words[i + 1].replace(/[^a-z]/g, '')) {
        emit({ type: 'REPETITION', confidence: BASE_CONF.REPETITION, durationMs: 0, detail: `Word repeated: "${w}"` })
      }
    }

    // ── Two-word phrase repetitions ───────────────────────────────────────
    // e.g. "I want to I want to go"
    for (let i = 0; i < words.length - 3; i++) {
      if (
        words[i]     === words[i + 2] &&
        words[i + 1] === words[i + 3] &&
        words[i].length > 1
      ) {
        emit({
          type: 'REPETITION',
          confidence: BASE_CONF.REPETITION - 0.04,
          durationMs: 0,
          detail: `Phrase repeated: "${words[i]} ${words[i + 1]}"`,
        })
      }
    }

    // ── Sound/syllable repetitions ────────────────────────────────────────
    // Speech APIs sometimes preserve hyphen notation: b-b-ball, t-t-table
    for (const word of words) {
      if (/^([a-z]{1,3})-\1(-\1)+/.test(word)) {
        emit({ type: 'REPETITION', confidence: BASE_CONF.REPETITION, durationMs: 0, detail: `Sound repetition: "${word}"` })
      }
    }

    // ── Cross-utterance sliding window ────────────────────────────────────
    // Catches repetitions that span utterance boundaries — e.g. the end of
    // one interim result and the start of the next. Keep last 20 words.
    const prevWords = lastWordsRef.current
    lastWordsRef.current = [...prevWords, ...words].slice(-20)
    if (prevWords.length > 0 && words.length > 0) {
      const lastPrev = prevWords[prevWords.length - 1]?.replace(/[^a-z]/g, '') ?? ''
      const firstNew = words[0].replace(/[^a-z]/g, '')
      if (lastPrev.length > 2 && lastPrev === firstNew) {
        emit({ type: 'REPETITION', confidence: BASE_CONF.REPETITION - 0.08, durationMs: 0, detail: `Cross-utterance repeat: "${lastPrev}"` })
      }
    }

    // ── Interjections (final results only) ────────────────────────────────
    // Using interim results causes huge false positive rates. Wait for final.
    if (isFinal) {
      for (const filler of FILLERS) {
        // Escape regex special chars (handles multi-word fillers safely)
        const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        // Word-boundary aware: won't match "like" inside "likewise"
        if (new RegExp(`(?:^|\\s)${escaped}(?:\\s|[,.]|$)`).test(raw)) {
          emit({ type: 'INTERJECTION', confidence: BASE_CONF.INTERJECTION, durationMs: 0, detail: `Filler: "${filler}"` })
        }
      }
      finalTranscriptRef.current += raw + ' '
    }
  }, [emit])

  // ── Build Web Speech Recognition ──────────────────────────────────────────

  const buildRecognition = useCallback((): any => {
    const SpeechRec = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SpeechRec) return null

    const rec: any = new SpeechRec()
    rec.continuous     = true
    rec.interimResults = true
    rec.lang           = 'en-GB'

    rec.onresult = (ev: SpeechRecognitionEvent) => {
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i]
        analyzeTranscript(r[0].transcript, r.isFinal)
      }
    }

    rec.onerror = (ev: SpeechRecognitionErrorEvent) => {
      if (ev.error !== 'no-speech' && ev.error !== 'aborted') {
        console.warn('[Stammerly] SpeechRecognition error:', ev.error)
      }
    }

    // IMPORTANT: uses isRecordingRef (not isRecording state).
    // If rec.onend used the isRecording state variable directly, it would
    // always see false (the initial value captured when buildRecognition ran).
    // isRecordingRef is mutated synchronously so it's always current.
    rec.onend = () => {
      if (isRecordingRef.current) {
        setTimeout(() => {
          if (isRecordingRef.current) {
            try { rec.start() } catch { /* already starting */ }
          }
        }, 100)
      }
    }

    return rec
  }, [analyzeTranscript])

  // ── Noise floor calibration ───────────────────────────────────────────────
  // Samples 600ms of ambient audio before starting detection.
  // Uses the 90th-percentile RMS reading as the noise floor estimate.
  // VAD threshold = noise floor × 3 (conservative multiplier).
  //
  // This is critical for real-world accuracy: a fixed threshold of 0.018
  // will be too sensitive in a quiet room and miss all speech in a classroom.

  const calibrateNoiseFloor = useCallback(async (analyser: AnalyserNode): Promise<number> => {
    setCalibrating(true)
    const N      = analyser.frequencyBinCount
    const buf    = new Float32Array(N)
    const readings: number[] = []

    await new Promise<void>(resolve => {
      const id = setInterval(() => {
        analyser.getFloatTimeDomainData(buf)
        readings.push(rms(buf))
        if (readings.length >= 20) { clearInterval(id); resolve() }  // 20 × 30ms = 600ms
      }, FRAME_MS)
    })

    readings.sort((a, b) => a - b)
    const noiseFloor = readings[Math.floor(readings.length * 0.9)]  // 90th percentile
    const threshold  = Math.max(0.012, noiseFloor * 3.0)

    vadThresholdRef.current = threshold
    setVadThreshold(threshold)
    setCalibrating(false)
    return threshold
  }, [])

  // ── Start recording ───────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    setError(null)

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,   // OK — doesn't affect dysfluency signals
          noiseSuppression: false,  // MUST be false — browser NS removes block
                                    // silence and pre-block tension turbulence
          autoGainControl:  false,  // Keep gain stable for RMS thresholding
          channelCount: 1,
        },
      })
    } catch {
      setError('Microphone access denied. Allow microphone access in browser settings.')
      return
    }

    streamRef.current = stream
    setMicGranted(true)

    const ctx      = new AudioContext()
    const analyser = ctx.createAnalyser()
    analyser.fftSize               = FFT_SIZE
    analyser.smoothingTimeConstant = 0.0  // Raw frames only — smoothing masks block onset
    ctx.createMediaStreamSource(stream).connect(analyser)
    audioCtxRef.current = ctx
    analyserRef.current = analyser

    // Allocate buffers once per session
    const N = analyser.frequencyBinCount
    timeBufRef.current = new Float32Array(N)
    freqBufRef.current = new Float32Array(N)

    // Reset all detection state
    wasSpeakingRef.current     = false
    silenceStartRef.current    = null
    preBlockZCRRef.current     = 0
    f0HistRef.current          = []
    prolongStartRef.current    = null
    prolongF0Ref.current       = 0
    lastWordsRef.current       = []
    finalTranscriptRef.current = ''
    lastEmitRef.current        = { BLOCK: 0, PROLONGATION: 0, REPETITION: 0, INTERJECTION: 0 }
    energyHistRef.current      = []

    // Calibrate VAD threshold against ambient noise (600ms)
    await calibrateNoiseFloor(analyser)

    // Start processing interval (30ms = 1 VAD frame)
    intervalRef.current = setInterval(() => processAudioFrameRef.current?.(), FRAME_MS)

    // Start speech recognition
    const rec = buildRecognition()
    if (rec) {
      recognitionRef.current = rec
      try { rec.start() } catch { /* ok */ }
    }

    isRecordingRef.current = true
    setIsRecording(true)
    setSessionStart(new Date())
    setEvents([])
  }, [calibrateNoiseFloor, buildRecognition])

  // ── Stop recording ────────────────────────────────────────────────────────

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false

    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    try { recognitionRef.current?.stop() } catch { /* ok */ }
    recognitionRef.current = null

    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null

    audioCtxRef.current?.close()
    audioCtxRef.current = null
    analyserRef.current = null
    timeBufRef.current  = null
    freqBufRef.current  = null

    setIsRecording(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => () => { if (isRecordingRef.current) stopRecording() }, [stopRecording])

  // ── Derived stats ─────────────────────────────────────────────────────────

  const counts = events.reduce(
    (acc, e) => ({ ...acc, [e.type]: (acc[e.type] ?? 0) + 1 }),
    {} as Partial<Record<MarkerType, number>>
  )

  const sessionMs  = sessionStart ? Date.now() - sessionStart.getTime() : 0
  const sessionMin = Math.max(0.05, sessionMs / 60_000)

  return {
    // State
    isRecording,
    micGranted,
    calibrating,
    error,
    events,
    sessionStart,
    vadThreshold,     // exposed so the UI can show 'calibrated to Xms threshold'

    // Actions
    startRecording,
    stopRecording,
    setAudioProfile,

    // Audio profile
    activeProfile,
    audioProfiles: AUDIO_PROFILES,

    // Derived
    counts,
    totalEvents:    events.length,
    eventsPerMin:   sessionMs > 5_000 ? +(events.length / sessionMin).toFixed(1) : 0,
    dominantMarker: (
      Object.entries(counts)
        .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0]?.[0] as MarkerType | undefined
    ),
    fullTranscript: finalTranscriptRef.current,
  }
}

// ── ONNX model hook (slot in your trained model here) ────────────────────────
//
// When stammerly.onnx has been exported from the Python training pipeline:
//   1. npm install onnxruntime-web
//   2. Uncomment the code below
//   3. Call loadOnnxModel('/models/stammerly.onnx') in a useEffect
//   4. Pass the returned `inferMarker` function to useStammerDetector
//      (add an `onnxInfer` option to DetectorOptions)
//
// The ONNX model takes the same 124-dimensional features the Python pipeline
// computes (MFCC×3 + pitch + voiced + energy + ZCR) and returns a log-softmax
// over 5 classes. It replaces the heuristic block + prolongation detection.
//
// import * as ort from 'onnxruntime-web'
// export type OnnxInfer = (features: Float32Array) => Promise<MarkerType>
//
// export async function loadOnnxModel(modelUrl: string): Promise<OnnxInfer> {
//   const session = await ort.InferenceSession.create(modelUrl, {
//     executionProviders: ['wasm'],
//   })
//   const LABELS = ['FLUENT','PROLONGATION','BLOCK','REPETITION','INTERJECTION'] as const
//   return async (features: Float32Array): Promise<MarkerType> => {
//     const tensor  = new ort.Tensor('float32', features, [1, 300, 124])
//     const outputs = await session.run({ features: tensor })
//     const logits  = outputs['log_probs'].data as Float32Array
//     let best = 0
//     for (let i = 1; i < logits.length; i++) if (logits[i] > logits[best]) best = i
//     return LABELS[best] as MarkerType
//   }
// }
