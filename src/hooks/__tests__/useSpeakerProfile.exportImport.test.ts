import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useSpeakerProfile,
  SETTINGS_EXPORT_TYPE,
  SETTINGS_EXPORT_VERSION,
  F0_MARGIN_MAX_HZ,
  ENERGY_HEADROOM_MIN,
} from "@/hooks/useSpeakerProfile";

const SR = 44100;
beforeEach(() => { localStorage.clear(); });

describe("useSpeakerProfile — export / import settings", () => {
  it("exportSettings returns a typed, versioned JSON envelope with current values", () => {
    const { result } = renderHook(() => useSpeakerProfile({ childId: "kidExp", sampleRate: SR }));
    act(() => { result.current.updateSettings({ f0MarginHz: 42, energyHeadroom: 2.25 }); });

    const json = result.current.exportSettings();
    const obj = JSON.parse(json);
    expect(obj.type).toBe(SETTINGS_EXPORT_TYPE);
    expect(obj.version).toBe(SETTINGS_EXPORT_VERSION);
    expect(obj.childId).toBe("kidExp");
    expect(obj.settings).toEqual({ f0MarginHz: 42, energyHeadroom: 2.25 });
    expect(typeof obj.exportedAt).toBe("string");
    expect(() => new Date(obj.exportedAt).toISOString()).not.toThrow();
  });

  it("importSettings round-trips an exported payload between two children", () => {
    const a = renderHook(() => useSpeakerProfile({ childId: "kidA", sampleRate: SR }));
    act(() => { a.result.current.updateSettings({ f0MarginHz: 70, energyHeadroom: 3.0 }); });
    const exported = a.result.current.exportSettings();

    const b = renderHook(() => useSpeakerProfile({ childId: "kidB", sampleRate: SR }));
    let res!: ReturnType<typeof b.result.current.importSettings>;
    act(() => { res = b.result.current.importSettings(exported); });

    expect(res).toEqual({ ok: true, settings: { f0MarginHz: 70, energyHeadroom: 3.0 } });
    expect(b.result.current.settings).toEqual({ f0MarginHz: 70, energyHeadroom: 3.0 });
    // Persisted under kidB, NOT kidA's slot
    expect(JSON.parse(localStorage.getItem("stammerly_speaker_settings_kidB")!))
      .toEqual({ f0MarginHz: 70, energyHeadroom: 3.0 });
  });

  it("importSettings clamps out-of-range values from a payload", () => {
    const { result } = renderHook(() => useSpeakerProfile({ childId: "kidClamp", sampleRate: SR }));
    let res!: ReturnType<typeof result.current.importSettings>;
    act(() => {
      res = result.current.importSettings({
        type: SETTINGS_EXPORT_TYPE, version: 1, childId: "anyone", exportedAt: new Date().toISOString(),
        settings: { f0MarginHz: 9999, energyHeadroom: -50 },
      });
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.settings.f0MarginHz).toBe(F0_MARGIN_MAX_HZ);
      expect(res.settings.energyHeadroom).toBe(ENERGY_HEADROOM_MIN);
    }
  });

  it("importSettings accepts a raw {f0MarginHz,energyHeadroom} object (no envelope)", () => {
    const { result } = renderHook(() => useSpeakerProfile({ childId: "kidRaw", sampleRate: SR }));
    let res!: ReturnType<typeof result.current.importSettings>;
    act(() => { res = result.current.importSettings({ f0MarginHz: 15, energyHeadroom: 1.8 }); });
    expect(res).toEqual({ ok: true, settings: { f0MarginHz: 15, energyHeadroom: 1.8 } });
  });

  it("importSettings rejects invalid JSON, wrong type, future version, missing fields", () => {
    const { result } = renderHook(() => useSpeakerProfile({ childId: "kidBad", sampleRate: SR }));
    const before = result.current.settings;

    let r1!: ReturnType<typeof result.current.importSettings>;
    let r2!: ReturnType<typeof result.current.importSettings>;
    let r3!: ReturnType<typeof result.current.importSettings>;
    let r4!: ReturnType<typeof result.current.importSettings>;
    act(() => {
      r1 = result.current.importSettings("{not-json");
      r2 = result.current.importSettings({ type: "something.else", settings: { f0MarginHz: 10, energyHeadroom: 1.5 } });
      r3 = result.current.importSettings({ type: SETTINGS_EXPORT_TYPE, version: 999, settings: { f0MarginHz: 10, energyHeadroom: 1.5 } });
      r4 = result.current.importSettings({ type: SETTINGS_EXPORT_TYPE, version: 1, settings: { f0MarginHz: "nope" } });
    });
    expect(r1.ok).toBe(false);
    expect(r2.ok).toBe(false);
    expect(r3.ok).toBe(false);
    expect(r4.ok).toBe(false);
    // Settings unchanged after every failed import
    expect(result.current.settings).toEqual(before);
  });
});
