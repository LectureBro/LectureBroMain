import { useState, useEffect } from "react";
import { Language } from "@/constants/languages";

interface Preferences {
  autoScroll: boolean;
  language: Language;
  darkMode: boolean;
  subtitles: string[];
  showSubtitles: boolean;
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>({
    autoScroll: true,
    language: "en-US",
    darkMode: false,
    subtitles: [],
    showSubtitles: false,
  });

  useEffect(() => {
    // Load initial preferences
    chrome.storage.sync.get(["autoScroll", "language", "darkMode", "subtitles", "showSubtitles"], (result) => {
      setPreferences((prev) => ({
        ...prev,
        autoScroll: result.autoScroll ?? prev.autoScroll,
        language: result.language ?? prev.language,
        darkMode: result.darkMode ?? prev.darkMode,
        subtitles: result.subtitles ?? prev.subtitles,
        showSubtitles: result.showSubtitles ?? prev.showSubtitles,
      }));
    });

    // Listen for changes in Chrome storage
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      const newPreferences: Partial<Preferences> = {};
      let hasChanges = false;

      for (const [key, { newValue }] of Object.entries(changes)) {
        if (key in preferences) {
          newPreferences[key as keyof Preferences] = newValue;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        setPreferences((prev) => ({ ...prev, ...newPreferences }));
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, [preferences]);

  const updatePreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    chrome.storage.sync.set({ [key]: value });
  };

  return { preferences, updatePreference };
}
