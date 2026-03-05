/// <reference types="web-bluetooth" />
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PendantStatus {
  connected: boolean;
  connecting: boolean;
  batteryLevel: number | null;
  storageUsedMB: number | null;
  storageTotalMB: number | null;
  lastSyncTimestamp: Date | null;
  deviceName: string | null;
  error: string | null;
}

const PENDANT_SERVICE_UUID = "0000180f-0000-1000-8000-00805f9b34fb";
const BATTERY_CHAR_UUID = "00002a19-0000-1000-8000-00805f9b34fb";
const STAMMERLY_SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const STORAGE_CHAR_UUID = "12345678-1234-5678-1234-56789abcdef1";
const SYNC_TIME_CHAR_UUID = "12345678-1234-5678-1234-56789abcdef2";

const STORAGE_KEY = "stammerly_pendant_status";
const LOW_BATTERY_THRESHOLD = 15;
const LOW_BATTERY_COOLDOWN_KEY = "stammerly_low_battery_alert_time";

function loadCachedStatus(): Partial<PendantStatus> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        batteryLevel: parsed.batteryLevel ?? null,
        storageUsedMB: parsed.storageUsedMB ?? null,
        storageTotalMB: parsed.storageTotalMB ?? null,
        lastSyncTimestamp: parsed.lastSyncTimestamp ? new Date(parsed.lastSyncTimestamp) : null,
        deviceName: parsed.deviceName ?? null,
      };
    }
  } catch {}
  return {};
}

function saveCachedStatus(status: PendantStatus) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      batteryLevel: status.batteryLevel,
      storageUsedMB: status.storageUsedMB,
      storageTotalMB: status.storageTotalMB,
      lastSyncTimestamp: status.lastSyncTimestamp?.toISOString() ?? null,
      deviceName: status.deviceName,
    }));
  } catch {}
}

/** Returns true if we haven't alerted in the last 4 hours */
function shouldAlertLowBattery(): boolean {
  try {
    const last = localStorage.getItem(LOW_BATTERY_COOLDOWN_KEY);
    if (!last) return true;
    const elapsed = Date.now() - Number(last);
    return elapsed > 4 * 60 * 60 * 1000; // 4 hours
  } catch {
    return true;
  }
}

function markLowBatteryAlerted() {
  try {
    localStorage.setItem(LOW_BATTERY_COOLDOWN_KEY, String(Date.now()));
  } catch {}
}

async function triggerLowBatteryAlert(batteryLevel: number, deviceName: string) {
  if (!shouldAlertLowBattery()) return;

  // Show toast immediately
  toast.warning(`⚠️ Pendant battery is at ${batteryLevel}%! Please charge soon.`, {
    duration: 10000,
  });

  markLowBatteryAlerted();

  // Log to database
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("low_battery_alerts").insert({
        user_id: user.id,
        battery_level: batteryLevel,
        device_name: deviceName,
      });
    }
  } catch {}
}

async function logSyncEvent(params: {
  batteryLevel: number | null;
  storageUsedMB: number | null;
  storageTotalMB: number | null;
  deviceName: string;
  syncStatus: string;
  syncDurationSeconds?: number;
  filesTransferred?: number;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("pendant_sync_history").insert({
      user_id: user.id,
      device_name: params.deviceName,
      battery_level: params.batteryLevel,
      storage_used_mb: params.storageUsedMB,
      storage_total_mb: params.storageTotalMB,
      sync_status: params.syncStatus,
      sync_duration_seconds: params.syncDurationSeconds ?? null,
      files_transferred: params.filesTransferred ?? 0,
    });
  } catch {}
}

export function useBluetoothPendant() {
  const cached = loadCachedStatus();
  const [status, setStatus] = useState<PendantStatus>({
    connected: false,
    connecting: false,
    batteryLevel: cached.batteryLevel ?? null,
    storageUsedMB: cached.storageUsedMB ?? null,
    storageTotalMB: cached.storageTotalMB ?? null,
    lastSyncTimestamp: cached.lastSyncTimestamp ?? null,
    deviceName: cached.deviceName ?? null,
    error: null,
  });

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const serverRef = useRef<BluetoothRemoteGATTServer | null>(null);
  const connectStartRef = useRef<number>(0);

  const isSupported = typeof navigator !== "undefined" && "bluetooth" in navigator;

  const updateStatus = useCallback((partial: Partial<PendantStatus>) => {
    setStatus(prev => {
      const next = { ...prev, ...partial };
      saveCachedStatus(next);
      return next;
    });
  }, []);

  const checkLowBattery = useCallback((battery: number | null, deviceName: string | null) => {
    if (battery !== null && battery <= LOW_BATTERY_THRESHOLD) {
      triggerLowBatteryAlert(battery, deviceName ?? "Stammerly Pendant");
    }
  }, []);

  const readBatteryLevel = useCallback(async (server: BluetoothRemoteGATTServer) => {
    try {
      const service = await server.getPrimaryService(PENDANT_SERVICE_UUID);
      const char = await service.getCharacteristic(BATTERY_CHAR_UUID);
      const value = await char.readValue();
      return value.getUint8(0);
    } catch {
      return null;
    }
  }, []);

  const readStorageInfo = useCallback(async (server: BluetoothRemoteGATTServer) => {
    try {
      const service = await server.getPrimaryService(STAMMERLY_SERVICE_UUID);
      const char = await service.getCharacteristic(STORAGE_CHAR_UUID);
      const value = await char.readValue();
      const usedMB = value.getUint16(0, true);
      const totalMB = value.getUint16(2, true);
      return { usedMB, totalMB };
    } catch {
      return null;
    }
  }, []);

  const readLastSync = useCallback(async (server: BluetoothRemoteGATTServer) => {
    try {
      const service = await server.getPrimaryService(STAMMERLY_SERVICE_UUID);
      const char = await service.getCharacteristic(SYNC_TIME_CHAR_UUID);
      const value = await char.readValue();
      const timestamp = value.getUint32(0, true);
      return new Date(timestamp * 1000);
    } catch {
      return null;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!isSupported) {
      updateStatus({ error: "Web Bluetooth is not supported in this browser." });
      return;
    }

    updateStatus({ connecting: true, error: null });
    connectStartRef.current = Date.now();

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "Stammerly" }],
        optionalServices: [PENDANT_SERVICE_UUID, STAMMERLY_SERVICE_UUID],
      });

      deviceRef.current = device;

      device.addEventListener("gattserverdisconnected", () => {
        updateStatus({ connected: false });
      });

      const server = await device.gatt!.connect();
      serverRef.current = server;

      const [battery, storage, lastSync] = await Promise.all([
        readBatteryLevel(server),
        readStorageInfo(server),
        readLastSync(server),
      ]);

      const dName = device.name ?? "Stammerly Pendant";
      const syncDuration = (Date.now() - connectStartRef.current) / 1000;

      updateStatus({
        connected: true,
        connecting: false,
        batteryLevel: battery,
        storageUsedMB: storage?.usedMB ?? null,
        storageTotalMB: storage?.totalMB ?? null,
        lastSyncTimestamp: lastSync ?? new Date(),
        deviceName: dName,
      });

      // Check low battery
      checkLowBattery(battery, dName);

      // Log sync event (no transcripts)
      logSyncEvent({
        batteryLevel: battery,
        storageUsedMB: storage?.usedMB ?? null,
        storageTotalMB: storage?.totalMB ?? null,
        deviceName: dName,
        syncStatus: "success",
        syncDurationSeconds: syncDuration,
      });
    } catch (err: any) {
      const message = err?.message || "Failed to connect to pendant.";
      if (message.includes("cancelled") || message.includes("canceled")) {
        updateStatus({ connecting: false, error: null });
      } else {
        updateStatus({ connecting: false, error: message });
        logSyncEvent({
          batteryLevel: null,
          storageUsedMB: null,
          storageTotalMB: null,
          deviceName: "Stammerly Pendant",
          syncStatus: "failed",
        });
      }
    }
  }, [isSupported, updateStatus, readBatteryLevel, readStorageInfo, readLastSync, checkLowBattery]);

  const disconnect = useCallback(() => {
    if (serverRef.current?.connected) {
      serverRef.current.disconnect();
    }
    deviceRef.current = null;
    serverRef.current = null;
    updateStatus({ connected: false });
  }, [updateStatus]);

  const refresh = useCallback(async () => {
    const server = serverRef.current;
    if (!server?.connected) return;

    const refreshStart = Date.now();
    const [battery, storage, lastSync] = await Promise.all([
      readBatteryLevel(server),
      readStorageInfo(server),
      readLastSync(server),
    ]);

    const newBattery = battery ?? status.batteryLevel;
    const newStorageUsed = storage?.usedMB ?? status.storageUsedMB;
    const newStorageTotal = storage?.totalMB ?? status.storageTotalMB;
    const dName = status.deviceName ?? "Stammerly Pendant";

    updateStatus({
      batteryLevel: newBattery,
      storageUsedMB: newStorageUsed,
      storageTotalMB: newStorageTotal,
      lastSyncTimestamp: lastSync ?? status.lastSyncTimestamp,
    });

    checkLowBattery(newBattery, dName);

    logSyncEvent({
      batteryLevel: newBattery,
      storageUsedMB: newStorageUsed,
      storageTotalMB: newStorageTotal,
      deviceName: dName,
      syncStatus: "success",
      syncDurationSeconds: (Date.now() - refreshStart) / 1000,
    });
  }, [status, updateStatus, readBatteryLevel, readStorageInfo, readLastSync, checkLowBattery]);

  useEffect(() => {
    return () => {
      if (serverRef.current?.connected) {
        serverRef.current.disconnect();
      }
    };
  }, []);

  return {
    status,
    isSupported,
    connect,
    disconnect,
    refresh,
  };
}
