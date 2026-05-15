import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useSpeakerProfile,
  type SpeakerFingerprint,
  DEFAULT_GATE_SETTINGS,
} from "@/hooks/useSpeakerProfile";

const SR = 44100;
const FRAME = 2048;

function sineFrame(freqHz: number, amp = 0.5): Float32Array {
  const buf = new Float32Array(FRAME);
  for (let i = 0; i < FRAME; i++) buf[i] = amp * Math.sin((2 * Math.PI * freqHz * i) / SR);
  return buf;
}
function noiseFrame(amp: number, seed = 9): Float32Array {
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

describe("useSpeakerProfile — persistence across simulated reload", () => {
  it("restores per-child settings after unmount/remount and gates immediately", () => {
    seedFingerprint("kidA"); // band 200–320

    // First "session" — tighten margin and raise energy headroom
    const first = renderHook(() => useSpeakerProfile({ childId: "kidA", sampleRate: SR }));
    act(() => {
      first.result.current.updateSettings({ f0MarginHz: 5, energyHeadroom: 3.0 });
    });
    expect(first.result.current.settings).toEqual({ f0MarginHz: 5, energyHeadroom: 3.0 });
    first.unmount(); // simulate page reload

    // Confirm raw localStorage row for this child
    expect(JSON.parse(localStorage.getItem("stammerly_speaker_settings_kidA")!))
      .toEqual({ f0MarginHz: 5, energyHeadroom: 3.0 });

    // Second "session" — fresh hook, same childId
    const second = renderHook(() => useSpeakerProfile({ childId: "kidA", sampleRate: SR }));
    expect(second.result.current.isEnrolled).toBe(true);
    expect(second.result.current.settings).toEqual({ f0MarginHz: 5, energyHeadroom: 3.0 });

    // Gate must use restored values on the very first call (no extra updates)
    // Tight margin (±5) → 195–325. 190 Hz must be rejected, 250 Hz accepted.
    expect(second.result.current.scoreFrame(sineFrame(190), 190)).toBe(false);
    expect(second.result.current.scoreFrame(sineFrame(250), 250)).toBe(true);
    // Raised headroom (×3 → cutoff 0.15) → moderately loud noise now passes
    expect(second.result.current.scoreFrame(noiseFrame(0.18), 0)).toBe(true);
  });

  it("keeps settings isolated per child across reloads", () => {
    seedFingerprint("kidLoose");
    seedFingerprint("kidStrict");

    // Configure two different children in separate sessions
    const a = renderHook(() => useSpeakerProfile({ childId: "kidLoose", sampleRate: SR }));
    act(() => { a.result.current.updateSettings({ f0MarginHz: 100, energyHeadroom: 4.0 }); });
    a.unmount();

    const b = renderHook(() => useSpeakerProfile({ childId: "kidStrict", sampleRate: SR }));
    act(() => { b.result.current.updateSettings({ f0MarginHz: 0, energyHeadroom: 1.0 }); });
    b.unmount();

    // Reload kidLoose → should still be loose, kidStrict untouched
    const a2 = renderHook(() => useSpeakerProfile({ childId: "kidLoose", sampleRate: SR }));
    expect(a2.result.current.settings).toEqual({ f0MarginHz: 100, energyHeadroom: 4.0 });
    expect(a2.result.current.scoreFrame(sineFrame(400), 400)).toBe(true); // wide margin

    const b2 = renderHook(() => useSpeakerProfile({ childId: "kidStrict", sampleRate: SR }));
    expect(b2.result.current.settings).toEqual({ f0MarginHz: 0, energyHeadroom: 1.0 });
    expect(b2.result.current.scoreFrame(sineFrame(199), 199)).toBe(false); // strict band
  });

  it("switching childId on a live hook swaps in that child's persisted settings", () => {
    seedFingerprint("kidX");
    seedFingerprint("kidY");
    localStorage.setItem(
      "stammerly_speaker_settings_kidX",
      JSON.stringify({ f0MarginHz: 80, energyHeadroom: 2.5 }),
    );
    localStorage.setItem(
      "stammerly_speaker_settings_kidY",
      JSON.stringify({ f0MarginHz: 10, energyHeadroom: 1.2 }),
    );

    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useSpeakerProfile({ childId: id, sampleRate: SR }),
      { initialProps: { id: "kidX" } },
    );
    expect(result.current.settings).toEqual({ f0MarginHz: 80, energyHeadroom: 2.5 });

    rerender({ id: "kidY" });
    expect(result.current.settings).toEqual({ f0MarginHz: 10, energyHeadroom: 1.2 });
    // Gate immediately reflects kidY's strict margin (band 200–320, ±10 → 190–330)
    expect(result.current.scoreFrame(sineFrame(180), 180)).toBe(false);
    expect(result.current.scoreFrame(sineFrame(250), 250)).toBe(true);
  });

  it("falls back to defaults on reload when no settings row exists for the child", () => {
    seedFingerprint("kidNew");
    const { result } = renderHook(() => useSpeakerProfile({ childId: "kidNew", sampleRate: SR }));
    expect(result.current.settings).toEqual(DEFAULT_GATE_SETTINGS);
    expect(localStorage.getItem("stammerly_speaker_settings_kidNew")).toBeNull();
  });
});
