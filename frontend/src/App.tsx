import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useCallback } from "react";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Language } from "@/constants/languages";
import { useAudioProcessing } from "@/hooks/useAudioProcessing";
import { ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph } from "docx";
import { FileNameDialog } from "@/components/FileNameDialog";

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [subtitles, setSubtitles] = useState<string[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [language, setLanguage] = useState<Language>("en-US");
  const [loading, setLoading] = useState(false);

  const [isFileNameDialogOpen, setIsFileNameDialogOpen] = useState(false);
  const [pendingSaveFormat, setPendingSaveFormat] = useState<"txt" | "pdf" | "docx" | null>(null);

  const BASE_URL = "http://localhost:5001";

  const processAudio = useCallback(async () => {
    if (!isRecording) return;

    try {
      const response = await fetch(`${BASE_URL}/api/transcription/process`, {
        method: "POST",
      });
      const data = await response.json();
      console.log("Audio processed:", data);
      setSubtitles((prev) => [...prev, data.text]);
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  }, [isRecording]);

  const { startProcessing, stopProcessing } = useAudioProcessing(isRecording, processAudio);

  const startTranscription = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/transcription/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      const data = await response.json();
      console.log("Transcription started:", data);
      setIsRecording(true);
      setSubtitles([]);
      startProcessing();
    } catch (error) {
      console.error("Error starting transcription:", error);
    } finally {
      setLoading(false);
    }
  };

  const endTranscription = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/transcription/end`, {
        method: "POST",
      });
      const data = await response.json();
      console.log("Transcription ended:", data);
      setIsRecording(false);
      stopProcessing();
    } catch (error) {
      console.error("Error ending transcription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(subtitles.join("\n"));
  };

  const handleSaveNotes = (format: "txt" | "pdf" | "docx") => {
    setPendingSaveFormat(format);
    setIsFileNameDialogOpen(true);
  };

  const saveNotesWithFileName = async (fileName: string) => {
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
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await endTranscription();
    } else {
      await startTranscription();
    }
  };

  return (
    <div className="h-[600px] w-[400px] bg-background p-4">
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>LectureBro</CardTitle>
              <CardDescription>Live Lecture Assistant</CardDescription>
            </div>
            <SettingsDialog language={language} setLanguage={setLanguage} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{isRecording ? "Recording" : "Ready"}</p>
              <p className="text-xs text-muted-foreground">{isRecording ? "Listening to audio..." : "Press record to start"}</p>
            </div>
            <Button variant={isRecording ? "destructive" : "default"} onClick={toggleRecording} disabled={loading}>
              {isRecording ? "Stop" : "Record"}
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Live Subtitles</h3>
              <div className="flex items-center space-x-2">
                <label htmlFor="auto-scroll" className="text-xs text-muted-foreground">
                  Auto-scroll
                </label>
                <Switch id="auto-scroll" checked={autoScroll} onCheckedChange={setAutoScroll} />
              </div>
            </div>
            <div className="h-[280px] space-y-2 overflow-y-auto rounded-md border bg-muted/50 p-4">
              {subtitles.length > 0 ? (
                subtitles.map((subtitle, index) => (
                  <p key={`subtitle-${subtitle}-${index}`} className="text-sm">
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
        <CardFooter className="justify-end space-x-2 pt-2">
          <Button variant="outline" size="sm" disabled={subtitles.length === 0} onClick={handleCopyText}>
            Copy
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" disabled={subtitles.length === 0}>
                Save Notes <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleSaveNotes("txt")}>Save as TXT</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleSaveNotes("pdf")}>Save as PDF</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleSaveNotes("docx")}>Save as DOCX</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
      <FileNameDialog isOpen={isFileNameDialogOpen} onClose={() => setIsFileNameDialogOpen(false)} onSave={saveNotesWithFileName} defaultFileName="lecture-notes" />
    </div>
  );
}
