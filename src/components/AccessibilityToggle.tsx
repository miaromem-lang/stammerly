import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Accessibility, Eye, Type, MonitorCog, Zap } from "lucide-react";
import { useAccessibility } from "@/hooks/useAccessibility";

export const AccessibilityToggle = () => {
  const { settings, toggle } = useAccessibility();
  const [open, setOpen] = useState(false);

  const activeCount = Object.values(settings).filter(Boolean).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Accessibility settings"
        >
          <Accessibility className="w-5 h-5" />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-sky text-[10px] font-bold flex items-center justify-center text-accent-sky-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 bg-card border-border text-foreground"
        role="region"
        aria-label="Accessibility preferences"
      >
        <div className="space-y-1 mb-4">
          <h3 className="font-display font-semibold text-sm text-foreground">Accessibility</h3>
          <p className="text-xs text-muted-foreground">WCAG 2.2 AA compliant display options</p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-accent-sky shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">High Contrast</p>
                <p className="text-[11px] text-muted-foreground">Enhanced colour contrast ratios</p>
              </div>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={() => toggle("highContrast")}
              aria-label="Toggle high contrast mode"
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Type className="w-4 h-4 text-gold shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Dyslexia-Friendly Font</p>
                <p className="text-[11px] text-muted-foreground">OpenDyslexic typeface</p>
              </div>
            </div>
            <Switch
              checked={settings.dyslexiaFont}
              onCheckedChange={() => toggle("dyslexiaFont")}
              aria-label="Toggle dyslexia-friendly font"
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-accent-orange shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Reduce Motion</p>
                <p className="text-[11px] text-muted-foreground">Minimise animations</p>
              </div>
            </div>
            <Switch
              checked={settings.reducedMotion}
              onCheckedChange={() => toggle("reducedMotion")}
              aria-label="Toggle reduced motion"
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <MonitorCog className="w-4 h-4 text-success shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Large Text</p>
                <p className="text-[11px] text-muted-foreground">Increase base font size</p>
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
            Settings are saved locally. Compliant with WCAG 2.2 AA and UK Public Sector Bodies Accessibility Regulations 2018.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
