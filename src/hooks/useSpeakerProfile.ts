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
const ENROLL_DURATION_S          = 10;
const DEFAULT_F0_MARGIN_HZ       = 30;
const DEFAULT_ENERGY_HEADROOM    = 1.5;
const VOICED_RMS_THRESHOLD       = 0.01;
const MIN_VOICED_FRAMES          = 40;
const STORAGE_KEY_PREFIX         = "stammerly_speaker_";
const SETTINGS_KEY_PREFIX        = "stammerly_speaker_settings_";

// Settings clamps — keep values in a sensible, debuggable range.
export const F0_MARGIN_MIN_HZ    = 0;
export const F0_MARGIN_MAX_HZ    = 120;
export const ENERGY_HEADROOM_MIN = 1.0;
export const ENERGY_HEADROOM_MAX = 4.0;

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

export interface SpeakerGateSettings {
  /** Hz of leeway added on each side of the [P10, P90] pitch band. */
  f0MarginHz: number;
  /** Multiplier on energyP75 before an unvoiced frame is rejected. */
  energyHeadroom: number;
}

export const DEFAULT_GATE_SETTINGS: SpeakerGateSettings = {
  f0MarginHz: DEFAULT_F0_MARGIN_HZ,
  energyHeadroom: DEFAULT_ENERGY_HEADROOM,
};

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
  /** Per-child gate strictness, persisted in localStorage. */
  settings: SpeakerGateSettings;
  updateSettings: (partial: Partial<SpeakerGateSettings>) => void;
  resetSettings: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
export function rms(buf: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
  return Math.sqrt(sum / buf.length);
}

/**
 * estimateF0 — robust pitch estimation using the YIN algorithm
 * (de Cheveigné & Kawahara, 2002).
 *
 * 1. Difference function:  d(τ) = Σ (x[i] − x[i+τ])²
 * 2. Cumulative mean normalised difference (CMND): suppresses the τ=0 dip
 *    and removes the need for a pre-set absolute threshold.
 * 3. Absolute threshold: pick the first τ where CMND(τ) < threshold AND τ is
 *    a local minimum. Falls back to global minimum if none found.
 * 4. Parabolic interpolation around the chosen lag for sub-sample precision.
 *
 * Returns 0 when the signal is unvoiced or the candidate is not confident
 * (CMND > unvoicedCutoff) so callers can treat 0 as "no pitch".
 *
 * Search range defaults to 70–500 Hz (covers child & adult voices).
 */
export function estimateF0(
  buf: Float32Array,
  sampleRate: number,
  opts: { fMin?: number; fMax?: number; threshold?: number; unvoicedCutoff?: number } = {},
): number {
  const fMin           = opts.fMin           ?? 70;
  const fMax           = opts.fMax           ?? 500;
  const threshold      = opts.threshold      ?? 0.15;
  const unvoicedCutoff = opts.unvoicedCutoff ?? 0.4;

  const N = buf.length;
  const minPeriod = Math.max(2, Math.floor(sampleRate / fMax));
  const maxPeriod = Math.min(Math.floor(sampleRate / fMin), Math.floor(N / 2) - 1);
  if (maxPeriod <= minPeriod + 1) return 0;

  // Step 1 — difference function over [0, maxPeriod]
  const d = new Float32Array(maxPeriod + 1);
  for (let tau = 1; tau <= maxPeriod; tau++) {
    let sum = 0;
    const limit = N - tau;
    for (let i = 0; i < limit; i++) {
      const diff = buf[i] - buf[i + tau];
      sum += diff * diff;
    }
    d[tau] = sum;
  }

  // Step 2 — cumulative mean normalised difference
  const cmnd = new Float32Array(maxPeriod + 1);
  cmnd[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau <= maxPeriod; tau++) {
    runningSum += d[tau];
    cmnd[tau] = runningSum > 0 ? d[tau] * tau / runningSum : 1;
  }

  // Step 3 — absolute threshold with local-minimum requirement
  let bestTau = -1;
  for (let tau = minPeriod; tau < maxPeriod; tau++) {
    if (cmnd[tau] < threshold) {
      // Walk to the bottom of the dip
      while (tau + 1 < maxPeriod && cmnd[tau + 1] < cmnd[tau]) tau++;
      bestTau = tau;
      break;
    }
  }
  if (bestTau === -1) {
    // Fallback: global minimum within the search band
    let minVal = Infinity;
    for (let tau = minPeriod; tau <= maxPeriod; tau++) {
      if (cmnd[tau] < minVal) { minVal = cmnd[tau]; bestTau = tau; }
    }
    if (bestTau === -1 || minVal > unvoicedCutoff) return 0;
  }

  // Step 4 — parabolic interpolation for sub-sample lag precision
  let refinedTau = bestTau;
  if (bestTau > minPeriod && bestTau < maxPeriod) {
    const s0 = cmnd[bestTau - 1];
    const s1 = cmnd[bestTau];
    const s2 = cmnd[bestTau + 1];
    const denom = 2 * (2 * s1 - s2 - s0);
    if (denom !== 0) {
      const shift = (s2 - s0) / denom;
      if (shift > -1 && shift < 1) refinedTau = bestTau + shift;
    }
  }

  return refinedTau > 0 ? sampleRate / refinedTau : 0;
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
