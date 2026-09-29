export type LanguageKey = "python" | "node" | "java" | "csharp";

export type StrategyCategory = "Technical Analysis" | "Options";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type StrategyIcon =
  | "ema"
  | "rsi"
  | "vwap"
  | "straddle"
  | "strangle"
  | "momentum"
  | "breakout";

export type ParameterType = "integer" | "decimal" | "text" | "time" | "select";

export interface Parameter {
  /** Placeholder key used inside code templates, e.g. {{FAST_PERIOD}}. */
  key: string;
  label: string;
  type: ParameterType;
  defaultValue: string;
  description: string;
  unit?: string;
  options?: string[];
  min?: number;
  max?: number;
}

export interface StrategyOverview {
  summary: string;
  entryConditions: string[];
  exitConditions: string[];
  keyParameters: string[];
  useCases: string[];
  considerations: string[];
}

export interface Strategy {
  id: string;
  name: string;
  icon: StrategyIcon;
  category: StrategyCategory;
  description: string;
  difficulty: Difficulty;
  market: string;
  tags: string[];
  languages: LanguageKey[];
  overview: StrategyOverview;
  parameters: Parameter[];
  /** File names used when downloading each language template. */
  fileNames: Record<LanguageKey, string>;
  /** Raw templates containing {{PARAMETER_KEY}} placeholders. */
  code: Record<LanguageKey, string>;
}

export type ParameterValues = Record<string, string>;
