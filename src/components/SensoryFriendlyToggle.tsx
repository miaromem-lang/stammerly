import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Eye, Volume2, Sparkles, Sun } from "lucide-react";
import { useAccessibility } from "@/hooks/useAccessibility";

export const SensoryFriendlyToggle = () => {
  const { settings, toggle } = useAccessibility();
  const [open, setOpen] = useState(false);

  const sensoryActive = settings.reducedMotion || settings.highContrast;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative rounded-kids gap-2 text-sm"
          aria-label="Sensory-friendly settings"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Comfort Mode</span>
          {sensoryActive && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 bg-card border-border text-foreground rounded-kids"
        role="region"
        aria-label="Sensory-friendly preferences"
      >
        <div className="space-y-1 mb-5">
          <h3 className="font-display font-semibold text-base text-foreground flex items-center gap-2">
            🌈 Comfort Mode
          </h3>
          <p className="text-xs text-muted-foreground">
            Make things calmer and easier on the eyes
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-accent-sky shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Calm Animations</p>
                <p className="text-[11px] text-muted-foreground">Stop bouncing and flashing things</p>
              </div>
            </div>
            <Switch
              checked={settings.reducedMotion}
              onCheckedChange={() => toggle("reducedMotion")}
              aria-label="Toggle calm animations"
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-gold shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Softer Colours</p>
                <p className="text-[11px] text-muted-foreground">Reduce bright, intense colours</p>
              </div>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={() => toggle("highContrast")}
              aria-label="Toggle softer colours"
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-success shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Large Text</p>
                <p className="text-[11px] text-muted-foreground">Make words bigger and easier to read</p>
              </div>
            </div>
            <Switch
              checked={settings.largeText}
              onCheckedChange={() => toggle("largeText")}
              aria-label="Toggle large text"
            />
          </label>
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground">
            These settings help make things more comfortable. You can change them any time! 💚
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
