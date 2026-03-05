import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, RefreshCw, Loader2, CheckCircle, XCircle, Battery, HardDrive } from "lucide-react";
import { useSyncHistory } from "@/hooks/useSyncHistory";
import { formatDistanceToNow, format } from "date-fns";

interface SyncHistoryLogProps {
  variant?: "parent" | "kid";
}

export const SyncHistoryLog = ({ variant = "parent" }: SyncHistoryLogProps) => {
  const { entries, loading, refresh } = useSyncHistory(8);
  const isKid = variant === "kid";

  return (
    <Card className={`glass-card-strong ${isKid ? "rounded-kids" : ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            {isKid ? "📡 Sync History" : "Pendant Sync History"}
          </span>
          <Button variant="ghost" size="icon" onClick={refresh} className="h-8 w-8">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isKid ? "When your pendant talked to the app" : "Audio sync events — no transcripts stored"}
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {isKid ? "No syncs yet! Connect your pendant to start." : "No sync events recorded yet."}
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50"
              >
                {entry.sync_status === "success" ? (
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {entry.device_name}
                    </span>
                    <Badge
                      variant={entry.sync_status === "success" ? "success" : "destructive"}
                      className="shrink-0 text-[10px]"
                    >
                      {entry.sync_status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {entry.battery_level !== null && (
                      <span className="flex items-center gap-1">
                        <Battery className="w-3 h-3" />
                        {entry.battery_level}%
                      </span>
                    )}
                    {entry.storage_used_mb !== null && entry.storage_total_mb !== null && (
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {entry.storage_used_mb}/{entry.storage_total_mb} MB
                      </span>
                    )}
                    {entry.sync_duration_seconds !== null && (
                      <span>{Number(entry.sync_duration_seconds).toFixed(1)}s</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(entry.synced_at), { addSuffix: true })}
                    {" · "}
                    {format(new Date(entry.synced_at), "MMM d, HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
