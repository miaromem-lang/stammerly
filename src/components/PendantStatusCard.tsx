import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Bluetooth, BluetoothOff, Battery, HardDrive, Clock, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { useBluetoothPendant } from "@/hooks/useBluetoothPendant";
import { formatDistanceToNow } from "date-fns";

interface PendantStatusCardProps {
  variant?: "parent" | "kid";
}

function getBatteryColor(level: number | null): string {
  if (level === null) return "text-muted-foreground";
  if (level > 60) return "text-success";
  if (level > 20) return "text-gold";
  return "text-destructive";
}

function getBatteryIcon(level: number | null) {
  return <Battery className={`w-5 h-5 ${getBatteryColor(level)}`} />;
}

export const PendantStatusCard = ({ variant = "parent" }: PendantStatusCardProps) => {
  const { status, isSupported, connect, disconnect, refresh } = useBluetoothPendant();
  const isKid = variant === "kid";

  const storagePercent = status.storageTotalMB && status.storageUsedMB
    ? Math.round((status.storageUsedMB / status.storageTotalMB) * 100)
    : null;

  const lastSyncLabel = status.lastSyncTimestamp
    ? formatDistanceToNow(status.lastSyncTimestamp, { addSuffix: true })
    : "Never synced";

  return (
    <Card className={`glass-card-strong ${isKid ? "rounded-kids border-accent-orange/30" : ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center justify-between ${isKid ? "text-lg" : ""}`}>
          <span className="flex items-center gap-2">
            {status.connected ? (
              <Bluetooth className="w-5 h-5 text-primary" />
            ) : (
              <BluetoothOff className="w-5 h-5 text-muted-foreground" />
            )}
            {isKid ? "🎙️ My Pendant" : "Pendant Status"}
          </span>
          <Badge variant={status.connected ? "success" : "secondary"}>
            {status.connected ? "Connected" : "Offline"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSupported && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">
              {isKid
                ? "Bluetooth isn't available in this browser. Ask a grown-up to try Chrome!"
                : "Web Bluetooth is not supported in this browser. Please use Chrome or Edge."}
            </p>
          </div>
        )}

        {status.error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">{status.error}</p>
          </div>
        )}

        {/* Battery */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              {getBatteryIcon(status.batteryLevel)}
              {isKid ? "Battery Power" : "Battery"}
            </span>
            <span className={`font-semibold ${getBatteryColor(status.batteryLevel)}`}>
              {status.batteryLevel !== null ? `${status.batteryLevel}%` : "—"}
            </span>
          </div>
          <Progress
            value={status.batteryLevel ?? 0}
            className="h-2"
          />
        </div>

        {/* Storage */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <HardDrive className="w-5 h-5" />
              {isKid ? "Space Left" : "Storage"}
            </span>
            <span className="font-semibold text-foreground">
              {status.storageUsedMB !== null && status.storageTotalMB !== null
                ? `${status.storageUsedMB} / ${status.storageTotalMB} MB`
                : "—"}
            </span>
          </div>
          <Progress
            value={storagePercent ?? 0}
            className="h-2"
          />
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-5 h-5" />
            {isKid ? "Last Upload" : "Last Sync"}
          </span>
          <span className="font-medium text-foreground">{lastSyncLabel}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {status.connected ? (
            <>
              <Button
                onClick={refresh}
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </Button>
              <Button
                onClick={disconnect}
                variant="ghost"
                size="sm"
                className="flex-1 gap-1.5 text-destructive hover:text-destructive"
              >
                <BluetoothOff className="w-3.5 h-3.5" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              onClick={connect}
              variant={isKid ? "orange" : "navy"}
              size="sm"
              className="w-full gap-1.5"
              disabled={status.connecting || !isSupported}
            >
              {status.connecting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Bluetooth className="w-3.5 h-3.5" />
              )}
              {isKid ? "Connect My Pendant! 🎙️" : "Connect Pendant"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
