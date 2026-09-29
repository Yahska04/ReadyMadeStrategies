import { Link } from "react-router-dom";

interface LogoProps {
  inverted?: boolean;
}

/** TODO(TradeSmart): replace the mark below with the official TradeSmart logo asset. */
export default function Logo({ inverted = false }: LogoProps) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5" aria-label="TradeSmart API Strategy Templates - home">
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-brand-600" />
        <path d="M7 21l6-6 4 4 8-8" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 11h5v5" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="flex items-baseline gap-1.5">
        <span className={`text-lg font-bold tracking-tight ${inverted ? "text-white" : "text-ink"}`}>TradeSmart</span>
        <span className={`hidden text-sm font-medium sm:inline ${inverted ? "text-slate-400" : "text-slate-500"}`}>
          API Templates
        </span>
      </span>
    </Link>
  );
}
