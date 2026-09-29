import {
  Activity,
  ChartColumnBig,
  ChartLine,
  GitFork,
  Rocket,
  Split,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { StrategyIcon as StrategyIconKey } from "../types/strategy";

const ICONS: Record<StrategyIconKey, LucideIcon> = {
  ema: ChartLine,
  rsi: Activity,
  vwap: ChartColumnBig,
  straddle: GitFork,
  strangle: Split,
  momentum: Rocket,
  breakout: TrendingUp,
};

interface StrategyIconProps {
  icon: StrategyIconKey;
  size?: "md" | "lg";
}

export default function StrategyIcon({ icon, size = "md" }: StrategyIconProps) {
  const Icon = ICONS[icon];
  const box = size === "lg" ? "h-14 w-14 rounded-xl" : "h-11 w-11 rounded-lg";
  const glyph = size === "lg" ? "h-7 w-7" : "h-5 w-5";
  return (
    <span className={`inline-flex shrink-0 items-center justify-center bg-brand-50 text-brand-600 ring-1 ring-brand-100 ${box}`}>
      <Icon className={glyph} aria-hidden="true" />
    </span>
  );
}
