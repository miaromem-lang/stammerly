import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useSpeakerProfile,
  type SpeakerFingerprint,
  DEFAULT_GATE_SETTINGS,
  F0_MARGIN_MIN_HZ,
  F0_MARGIN_MAX_HZ,
  ENERGY_HEADROOM_MIN,
  ENERGY_HEADROOM_MAX,
} from "@/hooks/useSpeakerProfile";

const SR = 44100;
const FRAME = 2048;

function sineFrame(freqHz: number, amp = 0.5): Float32Array {
  const buf = new Float32Array(FRAME);
  for (let i = 0; i < FRAME; i++) buf[i] = amp * Math.sin((2 * Math.PI * freqHz * i) / SR);
  return buf;
}
function noiseFrame(amp: number, seed = 7): Float32Array {
  let s = seed;
  const buf = new Float32Array(FRAME);
  for (let i = 0; i < FRAME; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    buf[i] = ((s / 0xffffffff) * 2 - 1) * amp;
  }
  return buf;
}
function seedFingerprint(childId: string, fp: Partial<SpeakerFingerprint> = {}) {
  const full: SpeakerFingerprint = {
    childId,
    enrolledAt: new Date().toISOString(),
    f0Median: 250, f0P10: 200, f0P90: 320,
    energyP75: 0.05,
    voicedFrameCount: 100, totalFrameCount: 200,
    sampleRate: SR,
    ...fp,
  };
  localStorage.setItem(`stammerly_speaker_${childId}`, JSON.stringify(full));
  return full;
}

beforeEach(() => { localStorage.clear(); });

describe("useSpeakerProfile settings — per-child gate strictness", () => {
  it("loads default settings when none persisted", () => {
    const { result } = renderHook(() => useSpeakerProfile({ childId: "k1", sampleRate: SR }));
    expect(result.current.settings).toEqual(DEFAULT_GATE_SETTINGS);
  });

  it("persists settings per child in localStorage", () => {
    const { result } = renderHook(() => useSpeakerProfile({ childId: "k2", sampleRate: SR }));
    act(() => { result.current.updateSettings({ f0MarginHz: 50, energyHeadroom: 2.0 }); });
    expect(result.current.settings).toEqual({ f0MarginHz: 50, energyHeadroom: 2.0 });
    const raw = localStorage.getItem("stammerly_speaker_settings_k2");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual({ f0MarginHz: 50, energyHeadroom: 2.0 });
  });

  it("clamps out-of-range values via updateSettings", () => {
    const { result } = renderHook(() => useSpeakerProfile({ childId: "k3", sampleRate: SR }));
    act(() => { result.current.updateSettings({ f0MarginHz: 9999, energyHeadroom: 99 }); });
    expect(result.current.settings.f0MarginHz).toBe(F0_MARGIN_MAX_HZ);
    expect(result.current.settings.energyHeadroom).toBe(ENERGY_HEADROOM_MAX);

    act(() => { result.current.updateSettings({ f0MarginHz: -50, energyHeadroom: 0.1 }); });
    expect(result.current.settings.f0MarginHz).toBe(F0_MARGIN_MIN_HZ);
    expect(result.current.settings.energyHeadroom).toBe(ENERGY_HEADROOM_MIN);
  });

  it("clamps invalid persisted values on load", () => {
    localStorage.setItem(
      "stammerly_speaker_settings_k4",
      JSON.stringify({ f0MarginHz: 10000, energyHeadroom: -3 }),
    );
    const { result } = renderHook(() => useSpeakerProfile({ childId: "k4", sampleRate: SR }));
    expect(result.current.settings.f0MarginHz).toBe(F0_MARGIN_MAX_HZ);
    expect(result.current.settings.energyHeadroom).toBe(ENERGY_HEADROOM_MIN);
  });

  it("resetSettings clears the per-child override and snaps to global defaults", () => {
    const { result } = renderHook(() => useSpeakerProfile({ childId: "k5", sampleRate: SR }));
    act(() => { result.current.updateSettings({ f0MarginHz: 80, energyHeadroom: 3 }); });
    act(() => { result.current.resetSettings(); });
    expect(result.current.settings).toEqual(DEFAULT_GATE_SETTINGS);
    // The per-child row is removed so future loads inherit globals
    expect(localStorage.getItem("stammerly_speaker_settings_k5")).toBeNull();
  });

  it("scoreFrame fails open regardless of settings when un-enrolled", () => {
    const { result } = renderHook(() => useSpeakerProfile({ childId: "k6", sampleRate: SR }));
    act(() => { result.current.updateSettings({ f0MarginHz: 0, energyHeadroom: 1.0 }); });
    expect(result.current.isEnrolled).toBe(false);
    expect(result.current.scoreFrame(sineFrame(50), 50)).toBe(true);
    expect(result.current.scoreFrame(sineFrame(900), 900)).toBe(true);
    expect(result.current.scoreFrame(noiseFrame(0.9), 0)).toBe(true);
  });

  it("widening f0MarginHz turns previously-rejected pitches into accepted ones", () => {
    seedFingerprint("k7"); // band 200–320
    const { result } = renderHook(() => useSpeakerProfile({ childId: "k7", sampleRate: SR }));
    // Default ±30 → 170–350. 400 Hz rejected.
    expect(result.current.scoreFrame(sineFrame(400), 400)).toBe(false);
    act(() => { result.current.updateSettings({ f0MarginHz: 100 }); }); // → 100–420
    expect(result.current.scoreFrame(sineFrame(400), 400)).toBe(true);
  });

  it("narrowing f0MarginHz to 0 enforces strict P10/P90 band", () => {
    seedFingerprint("k8"); // band 200–320
    const { result } = renderHook(() => useSpeakerProfile({ childId: "k8", sampleRate: SR }));
    // 180 Hz is within default ±30 margin (170–350) → accepted
    expect(result.current.scoreFrame(sineFrame(180), 180)).toBe(true);
    act(() => { result.current.updateSettings({ f0MarginHz: 0 }); });
    // Now strictly 200–320 → 180 rejected, 250 still accepted
    expect(result.current.scoreFrame(sineFrame(180), 180)).toBe(false);
    expect(result.current.scoreFrame(sineFrame(250), 250)).toBe(true);
  });

  it("raising energyHeadroom lets previously-rejected loud noise through", () => {
    seedFingerprint("k9", { energyP75: 0.05 }); // default cutoff 0.075
    const { result } = renderHook(() => useSpeakerProfile({ childId: "k9", sampleRate: SR }));
    const loud = noiseFrame(0.15);
    expect(result.current.scoreFrame(loud, 0)).toBe(false);
    act(() => { result.current.updateSettings({ energyHeadroom: 4.0 }); }); // cutoff = 0.20
    expect(result.current.scoreFrame(loud, 0)).toBe(true);
  });

  it("lowering energyHeadroom to 1.0 rejects noise just above energyP75", () => {
    seedFingerprint("k10", { energyP75: 0.05 });
    const { result } = renderHook(() => useSpeakerProfile({ childId: "k10", sampleRate: SR }));
    const mid = noiseFrame(0.06); // RMS ~0.035 — below default 0.075
    expect(result.current.scoreFrame(mid, 0)).toBe(true);
    act(() => { result.current.updateSettings({ energyHeadroom: 1.0 }); }); // cutoff = 0.05
    // A frame with RMS clearly above 0.05
    const louder = noiseFrame(0.2);
    expect(result.current.scoreFrame(louder, 0)).toBe(false);
  });

  it("settings only affect their own dimension (f0 margin vs energy)", () => {
    seedFingerprint("k11", { energyP75: 0.05 });
    const { result } = renderHook(() => useSpeakerProfile({ childId: "k11", sampleRate: SR }));
    // Tighten pitch margin; energy gate should be unaffected
    act(() => { result.current.updateSettings({ f0MarginHz: 0 }); });
    expect(result.current.scoreFrame(noiseFrame(0.02), 0)).toBe(true);  // quiet → still pass
    expect(result.current.scoreFrame(noiseFrame(0.4), 0)).toBe(false); // loud → still fail
    // Loosen energy; pitch gate should still strictly enforce band
    act(() => { result.current.updateSettings({ energyHeadroom: 4.0 }); });
    expect(result.current.scoreFrame(sineFrame(180), 180)).toBe(false); // out of band, voiced
  });
});
