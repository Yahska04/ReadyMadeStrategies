import type { Difficulty } from "../types/strategy";

const LEVEL: Record<Difficulty, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const level = LEVEL[difficulty];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={`w-1 rounded-sm ${bar <= level ? "bg-brand-500" : "bg-slate-200"}`}
            style={{ height: `${4 + bar * 3}px` }}
          />
        ))}
      </span>
      {difficulty}
    </span>
  );
}
