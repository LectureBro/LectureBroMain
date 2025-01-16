import { useState, useEffect, useCallback } from "react";

export function useSubtitles() {
  const [subtitles, setSubtitles] = useState<string[]>([]);

  useEffect(() => {
    // Load initial subtitles from chrome.storage.local
    chrome.storage.local.get(["subtitles"], (result) => {
      setSubtitles(result.subtitles || []);
    });

    // Listen for subtitle updates from the background script
    const messageListener = (request: { action: string; subtitles?: string[] }) => {
      if (request.action === "updateSubtitles") {
        setSubtitles(request.subtitles || []);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const addSubtitle = useCallback((newSubtitle: string) => {
    setSubtitles((prevSubtitles) => {
      const updatedSubtitles = [...prevSubtitles, newSubtitle];
      chrome.storage.local.set({ subtitles: updatedSubtitles });
      chrome.runtime.sendMessage({ action: "updateSubtitles", subtitles: updatedSubtitles });
      return updatedSubtitles;
    });
  }, []);

  const clearSubtitles = useCallback(() => {
    setSubtitles([]);
    chrome.storage.local.set({ subtitles: [] });
    chrome.runtime.sendMessage({ action: "updateSubtitles", subtitles: [] });
  }, []);

  return { subtitles, addSubtitle, clearSubtitles };
}
