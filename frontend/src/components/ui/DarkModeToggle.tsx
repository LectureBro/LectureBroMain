import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

interface DarkModeToggleProps {
  onToggle: (isDarkMode: boolean) => void;
}

const DarkModeToggle = ({ onToggle }: DarkModeToggleProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load the user's preference from local storage or default to light mode
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedMode);
    onToggle(savedMode); // Call the parent function to set the theme
  }, []);

  const handleToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    onToggle(newMode); // Notify parent component
  };

  return (
    <div className="flex items-center">
      <label htmlFor="dark-mode" className="text-sm font-medium mr-2">
        Dark Mode
      </label>
      <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={handleToggle} />
    </div>
  );
};

export default DarkModeToggle;
