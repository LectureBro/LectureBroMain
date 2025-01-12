import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

interface DarkModeToggleProps {
  readonly onToggle: (isDark: boolean) => void;
  readonly initialState?: boolean;
}

export default function DarkModeToggle({ onToggle, initialState = false }: DarkModeToggleProps) {
  const [isDark, setIsDark] = useState(initialState);

  useEffect(() => {
    setIsDark(initialState);
  }, [initialState]);

  const handleToggle = () => {
    const newState = !isDark;
    setIsDark(newState);
    onToggle(newState);
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch id="dark-mode" checked={isDark} onCheckedChange={handleToggle} />
      <label htmlFor="dark-mode" className="text-sm font-medium">
        Dark Mode
      </label>
    </div>
  );
}
