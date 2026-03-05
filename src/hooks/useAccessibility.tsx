import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AccessibilitySettings {
  highContrast: boolean;
  dyslexiaFont: boolean;
  reducedMotion: boolean;
  largeText: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  toggle: (key: keyof AccessibilitySettings) => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  dyslexiaFont: false,
  reducedMotion: false,
  largeText: false,
};

const STORAGE_KEY = "stammerly_a11y";

const AccessibilityContext = createContext<AccessibilityContextType>({
  settings: defaultSettings,
  toggle: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    const root = document.documentElement;
    root.classList.toggle("a11y-high-contrast", settings.highContrast);
    root.classList.toggle("a11y-dyslexia-font", settings.dyslexiaFont);
    root.classList.toggle("a11y-reduced-motion", settings.reducedMotion);
    root.classList.toggle("a11y-large-text", settings.largeText);
  }, [settings]);

  const toggle = (key: keyof AccessibilitySettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AccessibilityContext.Provider value={{ settings, toggle }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
