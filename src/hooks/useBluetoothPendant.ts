/// <reference types="web-bluetooth" />
import { useState, useCallback, useEffect, useRef } from "react";

export interface PendantStatus {
  connected: boolean;
  connecting: boolean;
  batteryLevel: number | null;       // 0-100
  storageUsedMB: number | null;      // MB used
  storageTotalMB: number | null;     // MB total
  lastSyncTimestamp: Date | null;
  deviceName: string | null;
  error: string | null;
}

const PENDANT_SERVICE_UUID = "0000180f-0000-1000-8000-00805f9b34fb"; // Battery Service
const BATTERY_CHAR_UUID = "00002a19-0000-1000-8000-00805f9b34fb";   // Battery Level

// Custom service UUIDs for Stammerly pendant (placeholder for real hardware)
const STAMMERLY_SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const STORAGE_CHAR_UUID = "12345678-1234-5678-1234-56789abcdef1";
const SYNC_TIME_CHAR_UUID = "12345678-1234-5678-1234-56789abcdef2";

const STORAGE_KEY = "stammerly_pendant_status";

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

  const isSupported = typeof navigator !== "undefined" && "bluetooth" in navigator;

  const updateStatus = useCallback((partial: Partial<PendantStatus>) => {
    setStatus(prev => {
      const next = { ...prev, ...partial };
      saveCachedStatus(next);
      return next;
    });
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
      // Protocol: 2 bytes used (MB), 2 bytes total (MB)
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
      // Protocol: 4-byte Unix timestamp
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

      // Read all pendant data
      const [battery, storage, lastSync] = await Promise.all([
        readBatteryLevel(server),
        readStorageInfo(server),
        readLastSync(server),
      ]);

      updateStatus({
        connected: true,
        connecting: false,
        batteryLevel: battery,
        storageUsedMB: storage?.usedMB ?? null,
        storageTotalMB: storage?.totalMB ?? null,
        lastSyncTimestamp: lastSync ?? new Date(),
        deviceName: device.name ?? "Stammerly Pendant",
      });
    } catch (err: any) {
      const message = err?.message || "Failed to connect to pendant.";
      // User cancelled the Bluetooth picker
      if (message.includes("cancelled") || message.includes("canceled")) {
        updateStatus({ connecting: false, error: null });
      } else {
        updateStatus({ connecting: false, error: message });
      }
    }
  }, [isSupported, updateStatus, readBatteryLevel, readStorageInfo, readLastSync]);

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

    const [battery, storage, lastSync] = await Promise.all([
      readBatteryLevel(server),
      readStorageInfo(server),
      readLastSync(server),
    ]);

    updateStatus({
      batteryLevel: battery ?? status.batteryLevel,
      storageUsedMB: storage?.usedMB ?? status.storageUsedMB,
      storageTotalMB: storage?.totalMB ?? status.storageTotalMB,
      lastSyncTimestamp: lastSync ?? status.lastSyncTimestamp,
    });
  }, [status, updateStatus, readBatteryLevel, readStorageInfo, readLastSync]);

  // Clean up on unmount
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
