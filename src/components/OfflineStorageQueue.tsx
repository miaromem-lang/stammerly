import { motion } from "framer-motion";
import { HardDrive, Wifi, WifiOff, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OfflineStorageQueueProps {
  connected?: boolean;
  storageTotalMB?: number;
  storageUsedMB?: number;
  pendingFiles?: number;
  estimatedHours?: number;
  onReconnect?: () => void;
}

export const OfflineStorageQueue = ({
  connected = false,
  storageTotalMB = 256,
  storageUsedMB = 87,
  pendingFiles = 14,
  estimatedHours = 3.2,
  onReconnect,
}: OfflineStorageQueueProps) => {
  const usedPercent = Math.round((storageUsedMB / storageTotalMB) * 100);
  const isWarning = usedPercent > 75;
  const isCritical = usedPercent > 90;

  return (
    <Card className={`glass-card-strong border ${isCritical ? "border-destructive/40" : isWarning ? "border-accent-orange/40" : "border-border/40"}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-primary" />
            Local Storage Queue
          </span>
          <Badge variant={connected ? "success" : "destructive"}>
            {connected ? (
              <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> Online</span>
            ) : (
              <span className="flex items-center gap-1"><WifiOff className="w-3 h-3" /> Offline</span>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Pendant Storage</span>
            <span className={`font-mono font-medium ${isCritical ? "text-destructive" : isWarning ? "text-accent-orange" : "text-foreground"}`}>
              {storageUsedMB} MB / {storageTotalMB} MB
            </span>
          </div>
          <Progress
            value={usedPercent}
            className={`h-3 ${isCritical ? "[&>div]:bg-destructive" : isWarning ? "[&>div]:bg-accent-orange" : ""}`}
          />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border/40 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{pendingFiles}</p>
            <p className="text-xs text-muted-foreground">Pending Files</p>
          </div>
          <div className="bg-card border border-border/40 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {estimatedHours.toFixed(1)}h
            </p>
            <p className="text-xs text-muted-foreground">Audio Stored</p>
          </div>
        </div>

        {/* Warning message */}
        {!connected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 flex items-start gap-3 ${isCritical ? "bg-destructive/10" : "bg-accent-orange/10"}`}
          >
            <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${isCritical ? "text-destructive" : "text-accent-orange"}`} />
            <div>
              <p className={`text-sm font-semibold ${isCritical ? "text-destructive" : "text-accent-orange"}`}>
                {isCritical ? "Storage Almost Full" : "Sync Required"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isCritical
                  ? `Only ${storageTotalMB - storageUsedMB} MB remaining. The pendant will stop recording when storage is full. Please reconnect to sync data.`
                  : `${pendingFiles} recordings (${estimatedHours.toFixed(1)} hours) are waiting to sync. Connect to Wi-Fi to prevent data loss.`}
              </p>
            </div>
          </motion.div>
        )}

        {!connected && (
          <Button variant="hero" className="w-full rounded-xl" onClick={onReconnect}>
            <Wifi className="w-4 h-4 mr-2" /> Reconnect Now
          </Button>
        )}

        {connected && (
          <p className="text-sm text-success text-center font-medium">
            ✓ All recordings are syncing automatically.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
