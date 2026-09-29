import type { LanguageKey } from "../types/strategy";

export const LANGUAGES: { key: LanguageKey; label: string; prism: string }[] = [
  { key: "python", label: "Python", prism: "python" },
  { key: "node", label: "Node.js", prism: "javascript" },
  { key: "java", label: "Java", prism: "java" },
  { key: "csharp", label: "C#", prism: "csharp" },
];

export const LANGUAGE_LABELS = Object.fromEntries(
  LANGUAGES.map((l) => [l.key, l.label]),
) as Record<LanguageKey, string>;

export function isLanguageKey(value: string | null): value is LanguageKey {
  return LANGUAGES.some((l) => l.key === value);
}
