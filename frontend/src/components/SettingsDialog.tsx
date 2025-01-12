import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import { LANGUAGES, Language } from "@/constants/languages";

interface SettingsDialogProps {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
}

export function SettingsDialog({ language, setLanguage }: SettingsDialogProps) {
  return (
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
          <DarkModeToggle
            onToggle={(isDark) => {
              document.body.classList.toggle("dark", isDark);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
