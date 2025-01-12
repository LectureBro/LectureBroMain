import { useState, useEffect } from "react";
import { Language } from "@/constants/languages";

interface Preferences {
  autoScroll: boolean;
  language: Language;
  darkMode: boolean;
  subtitles: string[];
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>({
    autoScroll: true,
    language: "en-US",
    darkMode: false,
    subtitles: [],
  });

  useEffect(() => {
    chrome.storage.sync.get(["autoScroll", "language", "darkMode", "subtitles"], (result) => {
      setPreferences((prev) => ({
        ...prev,
        autoScroll: result.autoScroll ?? prev.autoScroll,
        language: result.language ?? prev.language,
        darkMode: result.darkMode ?? prev.darkMode,
        subtitles: result.subtitles ?? prev.subtitles,
      }));
    });
  }, []);

  const updatePreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    chrome.storage.sync.set({ [key]: value });
  };

  return { preferences, updatePreference };
}
