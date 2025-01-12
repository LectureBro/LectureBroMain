export const LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Spanish" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
  { value: "pl-PL", label: "Polish" },
] as const;

export type Language = (typeof LANGUAGES)[number]["value"];
