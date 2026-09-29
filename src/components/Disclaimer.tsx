import { Info } from "lucide-react";
import { DISCLAIMER } from "../config/links";

export default function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 ${className}`}
      aria-label="Important note"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
      <p>
        <span className="font-semibold">Development examples only. </span>
        {DISCLAIMER} They are not investment advice or recommendations.
      </p>
    </aside>
  );
}
