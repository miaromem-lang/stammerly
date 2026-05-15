/**
 * useSpeakerProfile.ts — Stammerly Voice Enrollment & Speaker Gating
 * ===================================================================
 * Records a 10-second voice fingerprint for a child, then exposes a
 * `scoreFrame()` predicate that gates real-time audio frames so only
 * frames plausibly from the enrolled child reach the stammer detector.
 *
 * Pass `scoreFrame` into useStammerDetector({ scoreFrame }) — when no
 * profile is enrolled the gate fails open (returns true) so detection
 * continues to work for un-enrolled users.
 *
 * Persistence: localStorage, keyed by `stammerly_speaker_${childId}`.
 */

import { useState, useRef, useCallback, useEffect } from "react";

// ── Constants ────────────────────────────────────────────────────────────────
const ENROLL_DURATION_S      = 10;
const F0_MARGIN_HZ           = 30;
const ENERGY_HEADROOM        = 1.5;
const VOICED_RMS_THRESHOLD   = 0.01;
const MIN_VOICED_FRAMES      = 40;
const STORAGE_KEY_PREFIX     = "stammerly_speaker_";

// ── Types ────────────────────────────────────────────────────────────────────
export interface SpeakerFingerprint {
  childId: string;
  enrolledAt: string;
  f0Median: number;
  f0P10: number;
  f0P90: number;
  energyP75: number;
  voicedFrameCount: number;
  totalFrameCount: number;
  sampleRate: number;
}

export interface SpeakerProfileOptions {
  childId: string;
  sampleRate: number;
  enrollDurationS?: number;
  onProgress?: (progress: number) => void;
  onEnrolled?: (fp: SpeakerFingerprint) => void;
  onEnrollError?: (reason: string) => void;
}

export interface UseSpeakerProfileReturn {
  isEnrolled: boolean;
  enrollProgress: number | null;
  isEnrolling: boolean;
  fingerprint: SpeakerFingerprint | null;
  startEnrollment: () => Promise<SpeakerFingerprint | null>;
  cancelEnrollment: () => void;
  /**
   * Gate a real-time audio frame.
   * @param timeBuf  Float32Array from AnalyserNode.getFloatTimeDomainData()
   * @param f0Hz     Estimated fundamental frequency (0 if unvoiced)
   */
  scoreFrame: (timeBuf: Float32Array, f0Hz: number) => boolean;
  clearProfile: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function rms(buf: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
  return Math.sqrt(sum / buf.length);
}

function estimateF0(buf: Float32Array, sampleRate: number): number {
  const N = buf.length;
  const minPeriod = Math.floor(sampleRate / 500);
  const maxPeriod = Math.min(Math.floor(sampleRate / 70), N - 1);

  const nacVals = new Float32Array(maxPeriod + 2);
  for (let lag = minPeriod; lag <= maxPeriod; lag++) {
    let r = 0, norm = 0;
    for (let i = 0; i < N - lag; i++) {
      r += buf[i] * buf[i + lag];
      norm += buf[i] * buf[i] + buf[i + lag] * buf[i + lag];
    }
    nacVals[lag] = norm > 0 ? (2 * r) / norm : 0;
  }

  let bestLag = 0, bestNAC = -1;
  for (let lag = minPeriod + 1; lag < maxPeriod; lag++) {
    if (
      nacVals[lag] >= nacVals[lag - 1] &&
      nacVals[lag] >= nacVals[lag + 1] &&
      nacVals[lag] > bestNAC
    ) {
      bestNAC = nacVals[lag];
      bestLag = lag;
    }
  }

  if (bestNAC < 0.4 || bestLag === 0) return 0;

  // Octave correction — if half the period also correlates strongly, prefer it
  const halfLag = Math.floor(bestLag / 2);
  if (halfLag >= minPeriod && nacVals[halfLag] >= 0.85 * bestNAC) bestLag = halfLag;

  return sampleRate / bestLag;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.max(
    0,
    Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))
  );
  return sorted[idx];
}

const storageKey = (childId: string) => `${STORAGE_KEY_PREFIX}${childId}`;

function loadFingerprint(childId: string): SpeakerFingerprint | null {
  try {
    const raw = localStorage.getItem(storageKey(childId));
    return raw ? (JSON.parse(raw) as SpeakerFingerprint) : null;
  } catch {
    return null;
  }
}

function saveFingerprint(fp: SpeakerFingerprint): void {
  try {
    localStorage.setItem(storageKey(fp.childId), JSON.stringify(fp));
  } catch { /* localStorage unavailable */ }
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useSpeakerProfile(
  options: SpeakerProfileOptions
): UseSpeakerProfileReturn {
  const {
    childId,
    sampleRate,
    enrollDurationS = ENROLL_DURATION_S,
    onProgress,
    onEnrolled,
    onEnrollError,
  } = options;

  const [fingerprint, setFingerprint]       = useState<SpeakerFingerprint | null>(() => loadFingerprint(childId));
  const [isEnrolling, setIsEnrolling]       = useState(false);
  const [enrollProgress, setEnrollProgress] = useState<number | null>(null);

  const streamRef    = useRef<MediaStream | null>(null);
  const contextRef   = useRef<AudioContext | null>(null);
  const cancelledRef = useRef(false);

  const fingerprintRef = useRef<SpeakerFingerprint | null>(fingerprint);
  useEffect(() => { fingerprintRef.current = fingerprint; }, [fingerprint]);

  useEffect(() => { setFingerprint(loadFingerprint(childId)); }, [childId]);

  const startEnrollment = useCallback(async (): Promise<SpeakerFingerprint | null> => {
    if (isEnrolling) return null;

    cancelledRef.current = false;
    setIsEnrolling(true);
    setEnrollProgress(0);

    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate,
        },
      });
      streamRef.current = stream;

      audioCtx = new AudioContext({ sampleRate });
      contextRef.current = audioCtx;

      const source   = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const frameSize   = analyser.fftSize;
      const frameBuf    = new Float32Array(frameSize);
      const frameMs     = (frameSize / sampleRate) * 1000;
      const totalFrames = Math.ceil((enrollDurationS * 1000) / frameMs);

      const allEnergies: number[] = [];
      const voicedF0s: number[]   = [];
      let frameCount = 0;

      await new Promise<void>((resolve, reject) => {
        const tick = () => {
          if (cancelledRef.current) { reject(new Error("cancelled")); return; }

          analyser.getFloatTimeDomainData(frameBuf);
          const energy = rms(frameBuf);
          allEnergies.push(energy);

          if (energy > VOICED_RMS_THRESHOLD) {
            const f0 = estimateF0(frameBuf, sampleRate);
            if (f0 > 70 && f0 < 500) voicedF0s.push(f0);
          }

          frameCount++;
          const progress = Math.min(1, frameCount / totalFrames);
          setEnrollProgress(progress);
          onProgress?.(progress);

          if (frameCount >= totalFrames) resolve();
          else setTimeout(tick, frameMs);
        };
        setTimeout(tick, 100);
      });

      if (cancelledRef.current) return null;

      if (voicedF0s.length < MIN_VOICED_FRAMES) {
        onEnrollError?.(
          `Enrolment failed: only ${voicedF0s.length} voiced frames detected (need ${MIN_VOICED_FRAMES}). Please speak continuously during enrolment.`
        );
        return null;
      }

      voicedF0s.sort((a, b) => a - b);
      allEnergies.sort((a, b) => a - b);

      const fp: SpeakerFingerprint = {
        childId,
        enrolledAt:       new Date().toISOString(),
        f0Median:         percentile(voicedF0s, 50),
        f0P10:            percentile(voicedF0s, 10),
        f0P90:            percentile(voicedF0s, 90),
        energyP75:        percentile(allEnergies, 75),
        voicedFrameCount: voicedF0s.length,
        totalFrameCount:  allEnergies.length,
        sampleRate,
      };

      saveFingerprint(fp);
      setFingerprint(fp);
      onEnrolled?.(fp);
      return fp;
    } catch (err) {
      if (!cancelledRef.current) {
        onEnrollError?.(err instanceof Error ? err.message : String(err));
      }
      return null;
    } finally {
      stream?.getTracks().forEach(t => t.stop());
      audioCtx?.close().catch(() => {});
      streamRef.current  = null;
      contextRef.current = null;
      setIsEnrolling(false);
      setEnrollProgress(null);
    }
  }, [childId, sampleRate, enrollDurationS, isEnrolling, onProgress, onEnrolled, onEnrollError]);

  const cancelEnrollment = useCallback(() => {
    cancelledRef.current = true;
    streamRef.current?.getTracks().forEach(t => t.stop());
    contextRef.current?.close().catch(() => {});
    setIsEnrolling(false);
    setEnrollProgress(null);
  }, []);

  const scoreFrame = useCallback((timeBuf: Float32Array, f0Hz: number): boolean => {
    const fp = fingerprintRef.current;
    if (!fp) return true; // fail-open when not enrolled

    if (f0Hz > 0) {
      // Voiced frame — must fall in the child's habitual pitch band
      return f0Hz >= fp.f0P10 - F0_MARGIN_HZ && f0Hz <= fp.f0P90 + F0_MARGIN_HZ;
    }
    // Unvoiced frame — pass quiet ambient, block loud non-child voices
    return rms(timeBuf) <= fp.energyP75 * ENERGY_HEADROOM;
  }, []);

  const clearProfile = useCallback(() => {
    try { localStorage.removeItem(storageKey(childId)); } catch { /* ignore */ }
    setFingerprint(null);
  }, [childId]);

  return {
    isEnrolled: fingerprint !== null,
    enrollProgress,
    isEnrolling,
    fingerprint,
    startEnrollment,
    cancelEnrollment,
    scoreFrame,
    clearProfile,
  };
}
