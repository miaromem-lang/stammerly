import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSpeakerProfile, type SpeakerFingerprint } from "@/hooks/useSpeakerProfile";

const SR = 44100;
const FRAME = 2048;

function sineFrame(freqHz: number, amp = 0.5): Float32Array {
  const buf = new Float32Array(FRAME);
  for (let i = 0; i < FRAME; i++) buf[i] = amp * Math.sin((2 * Math.PI * freqHz * i) / SR);
  return buf;
}

function silentFrame(): Float32Array { return new Float32Array(FRAME); }

function loudNoiseFrame(amp = 0.4, seed = 11): Float32Array {
  let s = seed;
  const buf = new Float32Array(FRAME);
  for (let i = 0; i < FRAME; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    buf[i] = ((s / 0xffffffff) * 2 - 1) * amp;
  }
  return buf;
}

function seedFingerprint(childId: string, fp: Partial<SpeakerFingerprint> = {}): SpeakerFingerprint {
  const full: SpeakerFingerprint = {
    childId,
    enrolledAt: new Date().toISOString(),
    f0Median: 250,
    f0P10: 200,
    f0P90: 320,
    energyP75: 0.05,
    voicedFrameCount: 100,
    totalFrameCount: 200,
    sampleRate: SR,
    ...fp,
  };
  localStorage.setItem(`stammerly_speaker_${childId}`, JSON.stringify(full));
  return full;
}

beforeEach(() => { localStorage.clear(); });

describe("useSpeakerProfile.scoreFrame", () => {
  it("fails open (accepts everything) when no profile is enrolled", () => {
    const { result } = renderHook(() => useSpeakerProfile({ childId: "no-profile-kid", sampleRate: SR }));
    expect(result.current.isEnrolled).toBe(false);

    // Voiced frame in any band
    expect(result.current.scoreFrame(sineFrame(440), 440)).toBe(true);
    // Voiced frame far outside any band
    expect(result.current.scoreFrame(sineFrame(80), 80)).toBe(true);
    // Loud noise unvoiced
    expect(result.current.scoreFrame(loudNoiseFrame(), 0)).toBe(true);
    // Silence
    expect(result.current.scoreFrame(silentFrame(), 0)).toBe(true);
  });

  it("accepts voiced frames inside the child's pitch band (with ±30 Hz margin)", () => {
    seedFingerprint("kid-A"); // band 200–320 Hz, margin → 170–350
    const { result } = renderHook(() => useSpeakerProfile({ childId: "kid-A", sampleRate: SR }));
    expect(result.current.isEnrolled).toBe(true);

    // Squarely in band
    expect(result.current.scoreFrame(sineFrame(250), 250)).toBe(true);
    // At the lower edge (P10 - margin)
    expect(result.current.scoreFrame(sineFrame(170), 170)).toBe(true);
    // At the upper edge (P90 + margin)
    expect(result.current.scoreFrame(sineFrame(350), 350)).toBe(true);
  });

  it("rejects voiced frames outside the child's pitch band", () => {
    seedFingerprint("kid-B"); // band 200–320, margin → 170–350
    const { result } = renderHook(() => useSpeakerProfile({ childId: "kid-B", sampleRate: SR }));

    // Adult-male F0 well below band
    expect(result.current.scoreFrame(sineFrame(110), 110)).toBe(false);
    // Just below the lower margin
    expect(result.current.scoreFrame(sineFrame(169), 169)).toBe(false);
    // Just above the upper margin
    expect(result.current.scoreFrame(sineFrame(351), 351)).toBe(false);
    // Far above (e.g. baby cry)
    expect(result.current.scoreFrame(sineFrame(600), 600)).toBe(false);
  });

  it("accepts quiet unvoiced frames (ambient room noise) below energy threshold", () => {
    seedFingerprint("kid-C", { energyP75: 0.05 }); // headroom ×1.5 → 0.075
    const { result } = renderHook(() => useSpeakerProfile({ childId: "kid-C", sampleRate: SR }));

    expect(result.current.scoreFrame(silentFrame(), 0)).toBe(true);
    // Low-amplitude noise well under cutoff
    expect(result.current.scoreFrame(loudNoiseFrame(0.02), 0)).toBe(true);
  });

  it("rejects loud unvoiced frames (other voices, doors, claps) above energy threshold", () => {
    seedFingerprint("kid-D", { energyP75: 0.05 }); // cutoff ≈ 0.075
    const { result } = renderHook(() => useSpeakerProfile({ childId: "kid-D", sampleRate: SR }));

    expect(result.current.scoreFrame(loudNoiseFrame(0.4), 0)).toBe(false);
    expect(result.current.scoreFrame(loudNoiseFrame(0.15), 0)).toBe(false);
  });

  it("flips from fail-open to gating after clearProfile / reset cycle", () => {
    seedFingerprint("kid-E");
    const { result } = renderHook(() => useSpeakerProfile({ childId: "kid-E", sampleRate: SR }));
    expect(result.current.isEnrolled).toBe(true);
    expect(result.current.scoreFrame(sineFrame(110), 110)).toBe(false);

    act(() => { result.current.clearProfile(); });
    expect(result.current.isEnrolled).toBe(false);
    // Fail-open after clear
    expect(result.current.scoreFrame(sineFrame(110), 110)).toBe(true);
  });

  it("treats f0Hz=0 as 'unvoiced' even on otherwise tonal buffers (gates by energy only)", () => {
    seedFingerprint("kid-F", { energyP75: 0.05 });
    const { result } = renderHook(() => useSpeakerProfile({ childId: "kid-F", sampleRate: SR }));
    // A loud sine but f0Hz=0 (caller signalled unvoiced) → energy gate kicks in
    expect(result.current.scoreFrame(sineFrame(250, 0.6), 0)).toBe(false);
    // The same sine with f0Hz set correctly → in-band, accepted
    expect(result.current.scoreFrame(sineFrame(250, 0.6), 250)).toBe(true);
  });
});
