import { describe, it, expect } from "vitest";
import { estimateF0, rms } from "@/hooks/useSpeakerProfile";

const SR = 44100;

function sine(freq: number, n: number, sampleRate = SR, amp = 0.8): Float32Array {
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) buf[i] = amp * Math.sin((2 * Math.PI * freq * i) / sampleRate);
  return buf;
}

function noise(n: number, amp = 0.05, seed = 1): Float32Array {
  // Deterministic LCG so tests are reproducible
  let s = seed;
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    buf[i] = ((s / 0xffffffff) * 2 - 1) * amp;
  }
  return buf;
}

function silence(n: number): Float32Array { return new Float32Array(n); }

describe("estimateF0 (YIN)", () => {
  it("recovers a 220 Hz pure tone within 1 Hz", () => {
    const f0 = estimateF0(sine(220, 2048), SR);
    expect(f0).toBeGreaterThan(219);
    expect(f0).toBeLessThan(221);
  });

  it("recovers a 440 Hz pure tone within 1 Hz", () => {
    const f0 = estimateF0(sine(440, 2048), SR);
    expect(f0).toBeGreaterThan(439);
    expect(f0).toBeLessThan(441);
  });

  it("recovers a low 100 Hz tone within 1 Hz (child-male boundary)", () => {
    const f0 = estimateF0(sine(100, 2048), SR);
    expect(f0).toBeGreaterThan(99);
    expect(f0).toBeLessThan(101);
  });

  it("recovers a high 480 Hz tone within 2 Hz (high child voice)", () => {
    const f0 = estimateF0(sine(480, 2048), SR);
    expect(f0).toBeGreaterThan(478);
    expect(f0).toBeLessThan(482);
  });

  it("returns 0 for digital silence", () => {
    expect(estimateF0(silence(2048), SR)).toBe(0);
  });

  it("returns 0 for low-amplitude white noise (no periodicity)", () => {
    expect(estimateF0(noise(2048, 0.03), SR)).toBe(0);
  });

  it("octave-aliases a 700 Hz tone to its in-band sub-harmonic (~350 Hz)", () => {
    // Documented YIN behaviour: tones above fMax are detected at 1/2 period.
    // The speaker gate copes because it only cares about the in-band pitch envelope.
    const f0 = estimateF0(sine(700, 2048), SR);
    expect(f0).toBeGreaterThan(345);
    expect(f0).toBeLessThan(355);
  });

  it("returns 0 for a tone below the search band (50 Hz)", () => {
    expect(estimateF0(sine(50, 2048), SR)).toBe(0);
  });

  it("is robust to additive noise at SNR ≈ 14 dB", () => {
    const tone = sine(200, 2048, SR, 0.6);
    const n = noise(2048, 0.12, 7);
    const mixed = new Float32Array(2048);
    for (let i = 0; i < 2048; i++) mixed[i] = tone[i] + n[i];
    const f0 = estimateF0(mixed, SR);
    expect(f0).toBeGreaterThan(197);
    expect(f0).toBeLessThan(203);
  });

  it("does not octave-halve a 200 Hz tone (avoids reporting 100 Hz)", () => {
    const f0 = estimateF0(sine(200, 2048), SR);
    expect(Math.abs(f0 - 100)).toBeGreaterThan(50);
    expect(Math.abs(f0 - 200)).toBeLessThan(2);
  });

  it("handles a complex tone (fundamental + 2nd + 3rd harmonic) and locks to fundamental", () => {
    const N = 2048;
    const buf = new Float32Array(N);
    const f = 180;
    for (let i = 0; i < N; i++) {
      const t = i / SR;
      buf[i] =
        0.6 * Math.sin(2 * Math.PI * f * t) +
        0.3 * Math.sin(2 * Math.PI * 2 * f * t) +
        0.15 * Math.sin(2 * Math.PI * 3 * f * t);
    }
    const f0 = estimateF0(buf, SR);
    expect(f0).toBeGreaterThan(178);
    expect(f0).toBeLessThan(182);
  });

  it("returns 0 on absurdly short buffers", () => {
    expect(estimateF0(new Float32Array(8), SR)).toBe(0);
  });

  it("respects custom fMin/fMax bounds (aliases out-of-band fundamentals)", () => {
    // 440 Hz fundamental restricted to 70–300 Hz: YIN locks onto 220 Hz sub-harmonic.
    const f0 = estimateF0(sine(440, 2048), SR, { fMin: 70, fMax: 300 });
    expect(f0).toBeGreaterThan(218);
    expect(f0).toBeLessThan(222);
  });

  it("rms helper computes correctly for a pure sine", () => {
    const r = rms(sine(440, 2048, SR, 1.0));
    // RMS of unit-amplitude sine ≈ 1/√2 ≈ 0.707
    expect(r).toBeGreaterThan(0.7);
    expect(r).toBeLessThan(0.72);
  });
});
