import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useSpeakerProfile,
  GLOBAL_SETTINGS_KEY,
  DEFAULT_GATE_SETTINGS,
  F0_MARGIN_MAX_HZ,
  ENERGY_HEADROOM_MAX,
} from "@/hooks/useSpeakerProfile";

const SR = 44100;
beforeEach(() => { localStorage.clear(); });

describe("useSpeakerProfile — global default settings", () => {
  it("new children inherit the saved global defaults instead of factory defaults", () => {
    localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify({ f0MarginHz: 55, energyHeadroom: 2.5 }));
    const { result } = renderHook(() => useSpeakerProfile({ childId: "newKid", sampleRate: SR }));
    expect(result.current.settings).toEqual({ f0MarginHz: 55, energyHeadroom: 2.5 });
    expect(result.current.globalSettings).toEqual({ f0MarginHz: 55, energyHeadroom: 2.5 });
    expect(result.current.hasCustomSettings).toBe(false);
  });

  it("falls back to factory defaults when no global settings exist", () => {
    const { result } = renderHook(() => useSpeakerProfile({ childId: "factoryKid", sampleRate: SR }));
    expect(result.current.settings).toEqual(DEFAULT_GATE_SETTINGS);
    expect(result.current.globalSettings).toEqual(DEFAULT_GATE_SETTINGS);
  });

  it("per-child customisation wins over globals and is flagged hasCustomSettings", () => {
    localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify({ f0MarginHz: 55, energyHeadroom: 2.5 }));
    const { result } = renderHook(() => useSpeakerProfile({ childId: "customKid", sampleRate: SR }));
    act(() => { result.current.updateSettings({ f0MarginHz: 10 }); });
    expect(result.current.settings.f0MarginHz).toBe(10);
    expect(result.current.settings.energyHeadroom).toBe(2.5); // inherited start
    expect(result.current.hasCustomSettings).toBe(true);
  });

  it("saveCurrentAsGlobalDefaults persists current values for future children", () => {
    const a = renderHook(() => useSpeakerProfile({ childId: "kidA", sampleRate: SR }));
    act(() => { a.result.current.updateSettings({ f0MarginHz: 80, energyHeadroom: 3.0 }); });
    act(() => { a.result.current.saveCurrentAsGlobalDefaults(); });
    expect(JSON.parse(localStorage.getItem(GLOBAL_SETTINGS_KEY)!))
      .toEqual({ f0MarginHz: 80, energyHeadroom: 3.0 });

    // Brand new child picks up those globals
    const b = renderHook(() => useSpeakerProfile({ childId: "kidB", sampleRate: SR }));
    expect(b.result.current.settings).toEqual({ f0MarginHz: 80, energyHeadroom: 3.0 });
    expect(b.result.current.hasCustomSettings).toBe(false);
  });

  it("setGlobalDefaults clamps and live-updates children without overrides", () => {
    const a = renderHook(() => useSpeakerProfile({ childId: "noCustom", sampleRate: SR }));
    const b = renderHook(() => useSpeakerProfile({ childId: "hasCustom", sampleRate: SR }));
    act(() => { b.result.current.updateSettings({ f0MarginHz: 5, energyHeadroom: 1.1 }); });

    act(() => { a.result.current.setGlobalDefaults({ f0MarginHz: 9999, energyHeadroom: 99 }); });

    // Globals clamped
    expect(a.result.current.globalSettings.f0MarginHz).toBe(F0_MARGIN_MAX_HZ);
    expect(a.result.current.globalSettings.energyHeadroom).toBe(ENERGY_HEADROOM_MAX);
    // 'noCustom' followed the change live
    expect(a.result.current.settings.f0MarginHz).toBe(F0_MARGIN_MAX_HZ);
    // 'hasCustom' was unaffected
    expect(b.result.current.settings).toEqual({ f0MarginHz: 5, energyHeadroom: 1.1 });
  });

  it("resetSettings drops the per-child override and snaps to current globals", () => {
    localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify({ f0MarginHz: 70, energyHeadroom: 2.0 }));
    const { result } = renderHook(() => useSpeakerProfile({ childId: "kidR", sampleRate: SR }));
    act(() => { result.current.updateSettings({ f0MarginHz: 12, energyHeadroom: 1.2 }); });
    expect(result.current.hasCustomSettings).toBe(true);

    act(() => { result.current.resetSettings(); });
    expect(result.current.settings).toEqual({ f0MarginHz: 70, energyHeadroom: 2.0 });
    expect(result.current.hasCustomSettings).toBe(false);
    expect(localStorage.getItem("stammerly_speaker_settings_kidR")).toBeNull();
  });

  it("resetGlobalDefaults restores factory globals and re-applies them to non-custom children", () => {
    localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify({ f0MarginHz: 90, energyHeadroom: 3.5 }));
    const { result } = renderHook(() => useSpeakerProfile({ childId: "kidG", sampleRate: SR }));
    expect(result.current.settings).toEqual({ f0MarginHz: 90, energyHeadroom: 3.5 });

    act(() => { result.current.resetGlobalDefaults(); });
    expect(localStorage.getItem(GLOBAL_SETTINGS_KEY)).toBeNull();
    expect(result.current.globalSettings).toEqual(DEFAULT_GATE_SETTINGS);
    expect(result.current.settings).toEqual(DEFAULT_GATE_SETTINGS);
  });
});
