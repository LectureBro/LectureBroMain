import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";

const LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Spanish" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
  { value: "pl-PL", label: "Polish" },
] as const;

const DUMMY_SENTENCES = [
  "Welcome to today's lecture on advanced mathematics.",
  "We'll be covering complex algorithms and their applications.",
  "First, let's review the basic concepts from last week.",
  "The key principle to remember is the relationship between variables.",
  "This formula demonstrates the core concept we're discussing.",
  "Let's move on to some practical examples.",
  "Can anyone tell me what they observe in this pattern?",
  "Remember to take notes on these important points.",
  "This will be crucial for your upcoming assignments.",
  "Let's pause here for any questions you might have.",
];

type Language = (typeof LANGUAGES)[number]["value"];

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [subtitles, setSubtitles] = useState<string[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [language, setLanguage] = useState<Language>("en-US");

  useEffect(() => {
    let interval: number | undefined;

    if (isRecording) {
      let index = 0;
      interval = window.setInterval(() => {
        setSubtitles((prev) => [...prev, DUMMY_SENTENCES[index % DUMMY_SENTENCES.length]]);
        index++;
      }, 2000);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [isRecording]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(subtitles.join("\n"));
  };

  const handleSaveNotes = () => {
    const blob = new Blob([subtitles.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lecture-notes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStartRecording = () => {
    if (!isRecording) {
      setSubtitles([]);
    }
    setIsRecording(!isRecording);
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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                  <DialogDescription>Configure your recording preferences</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="language-select" className="text-sm font-medium">
                      Recognition Language
                    </label>
                    <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                      <SelectTrigger id="language-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{isRecording ? "Recording" : "Ready"}</p>
              <p className="text-xs text-muted-foreground">{isRecording ? "Listening to audio..." : "Press record to start"}</p>
            </div>
            <Button variant={isRecording ? "destructive" : "default"} onClick={handleStartRecording}>
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
          <Button size="sm" disabled={subtitles.length === 0} onClick={handleSaveNotes}>
            Save Notes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
