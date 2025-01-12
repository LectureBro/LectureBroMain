import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Settings } from "lucide-react";
import { Language, LANGUAGES } from "@/constants/languages";
import { Switch } from "./ui/switch";

interface SettingsDialogProps {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
  readonly darkMode: boolean;
  readonly toggleDarkMode: () => void;
}

export function SettingsDialog({ language, setLanguage, darkMode, toggleDarkMode }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className={`bg-background text-foreground ${darkMode ? "dark" : ""}`}>
        <DialogHeader>
          <DialogTitle className="text-foreground">Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-foreground">Language</span>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="bg-background text-foreground">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent className="bg-background text-foreground">
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value} className="text-foreground">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Dark Mode</span>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
