import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, BatteryLow, Target, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface NotificationPrefs {
  dailyReminder: boolean;
  lowBattery: boolean;
  newQuest: boolean;
  weeklyReport: boolean;
  victoryBell: boolean;
}

const STORAGE_KEY = "stammerly_notification_prefs";

const defaultPrefs: NotificationPrefs = {
  dailyReminder: true,
  lowBattery: true,
  newQuest: true,
  weeklyReport: true,
  victoryBell: true,
};

export const NotificationPreferences = () => {
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultPrefs, ...JSON.parse(saved) } : defaultPrefs;
    } catch {
      return defaultPrefs;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const handleToggle = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(
        next[key] ? "Notification enabled" : "Notification disabled",
        { duration: 1500 }
      );
      return next;
    });
  };

  const notifications = [
    {
      key: "dailyReminder" as const,
      label: "Daily Practice Reminder",
      description: "Remind your child to practice at their usual time",
      icon: <Clock className="w-4 h-4 text-primary" />,
    },
    {
      key: "lowBattery" as const,
      label: "Low Battery Warning",
      description: "Alert when pendant battery drops below 20%",
      icon: <BatteryLow className="w-4 h-4 text-destructive" />,
    },
    {
      key: "newQuest" as const,
      label: "New Therapist Quest",
      description: "Notify when the therapist assigns a new priority quest",
      icon: <Target className="w-4 h-4 text-accent-orange" />,
    },
    {
      key: "weeklyReport" as const,
      label: "Weekly Progress Report",
      description: "Summary of your child's weekly practice and improvements",
      icon: <Sparkles className="w-4 h-4 text-gold" />,
    },
    {
      key: "victoryBell" as const,
      label: "Victory Bell Alerts",
      description: "When a teacher or therapist logs a victory moment",
      icon: <Bell className="w-4 h-4 text-success" />,
    },
  ];

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Bell className="w-5 h-5 text-primary" />
          Notification Preferences
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose which alerts you'd like to receive
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.map((notif) => (
          <label
            key={notif.key}
            className="flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="shrink-0">{notif.icon}</div>
              <div>
                <p className="text-sm font-medium text-foreground">{notif.label}</p>
                <p className="text-[11px] text-muted-foreground">{notif.description}</p>
              </div>
            </div>
            <Switch
              checked={prefs[notif.key]}
              onCheckedChange={() => handleToggle(notif.key)}
              aria-label={`Toggle ${notif.label}`}
            />
          </label>
        ))}
      </CardContent>
    </Card>
  );
};
