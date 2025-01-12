import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useCallback, useMemo } from "react";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Language } from "@/constants/languages";
import { useAudioProcessing } from "@/hooks/useAudioProcessing";
import { ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph } from "docx";
import { FileNameDialog } from "@/components/FileNameDialog";
import { usePreferences } from "@/hooks/usePreferences";
import { useSubtitles } from "@/hooks/useSubtitles";

export default function App() {
  const { preferences, updatePreference } = usePreferences();
  const [isRecording, setIsRecording] = useState(false);
  const { subtitles, addSubtitle, clearSubtitles } = useSubtitles();
  const [loading, setLoading] = useState(false);
  const [isFileNameDialogOpen, setIsFileNameDialogOpen] = useState(false);
  const [pendingSaveFormat, setPendingSaveFormat] = useState<"txt" | "pdf" | "docx" | null>(null);

  const sendMessageToAllTabs = useCallback((action: string, payload?: { [key: string]: unknown }) => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { action, ...payload });
        }
      });
    });
  }, []);

  const handleSetLanguage = useCallback(
    (newLanguage: Language) => {
      updatePreference("language", newLanguage);
    },
    [updatePreference]
  );

  const toggleDarkMode = useCallback(() => {
    updatePreference("darkMode", !preferences.darkMode);
  }, [preferences.darkMode, updatePreference]);

  const BASE_URL = "http://localhost:5001";

  const processAudio = useCallback(async () => {
    if (!isRecording) return;

    try {
      const response = await fetch(`${BASE_URL}/api/transcription/process`, {
        method: "POST",
      });
      const data = await response.json();
      console.log("Audio processed:", data);
      addSubtitle(data.text);
      if (preferences.showSubtitles) {
        sendMessageToAllTabs("updateSubtitles", { subtitles: [...subtitles, data.text] });
      }
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  }, [isRecording, sendMessageToAllTabs, addSubtitle, subtitles, preferences.showSubtitles]);

  const { startProcessing, stopProcessing } = useAudioProcessing(isRecording, processAudio);

  const startTranscription = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/transcription/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: preferences.language }),
      });
      const data = await response.json();
      console.log("Transcription started:", data);
      setIsRecording(true);
      clearSubtitles();
      startProcessing();
    } catch (error) {
      console.error("Error starting transcription:", error);
    } finally {
      setLoading(false);
    }
  }, [preferences.language, startProcessing, clearSubtitles]);

  const endTranscription = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/transcription/end`, {
        method: "POST",
      });
      const data = await response.json();
      console.log("Transcription ended:", data);
      setIsRecording(false);
      stopProcessing();
      sendMessageToAllTabs("hideOverlay");
    } catch (error) {
      console.error("Error ending transcription:", error);
    } finally {
      setLoading(false);
    }
  }, [sendMessageToAllTabs, stopProcessing]);

  const handleCopyText = useCallback(() => {
    navigator.clipboard.writeText(subtitles.join("\n"));
  }, [subtitles]);

  const handleSaveNotes = useCallback((format: "txt" | "pdf" | "docx") => {
    setPendingSaveFormat(format);
    setIsFileNameDialogOpen(true);
  }, []);

  const saveNotesWithFileName = useCallback(
    async (fileName: string) => {
      if (!pendingSaveFormat) return;

      let blob: Blob;

      switch (pendingSaveFormat) {
        case "pdf": {
          const pdf = new jsPDF();
          subtitles.forEach((subtitle, index) => {
            pdf.text(subtitle, 10, 10 + index * 10);
          });
          blob = pdf.output("blob");
          break;
        }

        case "docx": {
          const doc = new Document({
            sections: [
              {
                properties: {},
                children: subtitles.map((subtitle) => new Paragraph({ text: subtitle })),
              },
            ],
          });
          blob = await Packer.toBlob(doc);
          break;
        }

        default: // txt
          blob = new Blob([subtitles.join("\n")], { type: "text/plain" });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.${pendingSaveFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setPendingSaveFormat(null);
    },
    [pendingSaveFormat, subtitles]
  );

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await endTranscription();
    } else {
      await startTranscription();
    }
  }, [isRecording, endTranscription, startTranscription]);

  const toggleOverlay = useCallback(() => {
    const newShowSubtitles = !preferences.showSubtitles;
    updatePreference("showSubtitles", newShowSubtitles);
    chrome.storage.sync.set({ showSubtitles: newShowSubtitles }, () => {
      if (newShowSubtitles) {
        sendMessageToAllTabs("showOverlay", { subtitles });
      } else {
        sendMessageToAllTabs("hideOverlay");
      }
      // Send a message to update the background script
      chrome.runtime.sendMessage({ action: "updateOverlayState", isVisible: newShowSubtitles });
    });
  }, [preferences.showSubtitles, sendMessageToAllTabs, updatePreference, subtitles]);

  const cardContent = useMemo(
    () => (
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-2">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{isRecording ? "Recording" : "Ready"}</p>
            <p className="text-xs text-muted-foreground">{isRecording ? "Listening to audio..." : "Press record to start"}</p>
          </div>
          <Button variant={isRecording ? "destructive" : "default"} onClick={toggleRecording} disabled={loading}>
            {isRecording ? "Stop" : "Record"}
          </Button>
        </div>
        <Separator className="my-2" />
        <div className="flex items-center space-x-2">
          <Switch id="overlay-switch" checked={preferences.showSubtitles} onCheckedChange={toggleOverlay} />
          <label htmlFor="overlay-switch" className="text-sm font-medium">
            Show Overlay
          </label>
        </div>

        <Separator className="my-2 flex-shrink-0" />
        <div className="flex flex-col flex-grow min-h-0">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h3 className="text-sm font-medium">Live Subtitles</h3>
            <div className="flex items-center space-x-2">
              <label htmlFor="auto-scroll" className="text-xs text-muted-foreground">
                Auto-scroll
              </label>
              <Switch id="auto-scroll" checked={preferences.autoScroll} onCheckedChange={(checked) => updatePreference("autoScroll", checked)} />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto rounded-md border bg-muted/50 p-4">
            {subtitles.length > 0 ? (
              subtitles.map((subtitle, index) => (
                <p key={`subtitle-${index}-${subtitle[index]}`} className="text-sm mb-2">
                  {subtitle}
                </p>
              ))
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-sm text-muted-foreground">{isRecording ? "Listening for speech..." : "Press record to begin transcription"}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    ),
    [isRecording, loading, preferences.showSubtitles, preferences.autoScroll, subtitles, toggleRecording, toggleOverlay, updatePreference]
  );

  return (
    <div className={`h-[600px] w-[400px] bg-background p-4 ${preferences.darkMode ? "dark" : ""}`}>
      <Card className="h-full">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>LectureBro</CardTitle>
              <CardDescription>Live Lecture Assistant</CardDescription>
            </div>
            <SettingsDialog language={preferences.language} setLanguage={handleSetLanguage} darkMode={preferences.darkMode} toggleDarkMode={toggleDarkMode} />
          </div>
        </CardHeader>
        {cardContent}
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleCopyText} disabled={subtitles.length === 0}>
            Copy Text
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={subtitles.length === 0}>
                Save Notes <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSaveNotes("txt")}>Save as TXT</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSaveNotes("pdf")}>Save as PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSaveNotes("docx")}>Save as DOCX</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
      <FileNameDialog isOpen={isFileNameDialogOpen} onClose={() => setIsFileNameDialogOpen(false)} onSave={saveNotesWithFileName} defaultFileName="lecture_notes" />
    </div>
  );
}
