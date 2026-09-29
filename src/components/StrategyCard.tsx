import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LANGUAGE_LABELS } from "../lib/languages";
import type { Strategy } from "../types/strategy";
import DifficultyBadge from "./DifficultyBadge";
import StrategyIcon from "./StrategyIcon";
import Tag from "./Tag";

interface StrategyCardProps {
  strategy: Strategy;
  index?: number;
}

export default function StrategyCard({ strategy, index = 0 }: StrategyCardProps) {
  const detailPath = `/strategies/${strategy.id}`;

  return (
    <article
      className="animate-fade-up group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <StrategyIcon icon={strategy.icon} />
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
          {strategy.category}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        <Link to={detailPath} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-brand-500">
          {strategy.name}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{strategy.description}</p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {strategy.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4 text-xs">
        <div>
          <dt className="text-slate-500">Difficulty</dt>
          <dd className="mt-1">
            <DifficultyBadge difficulty={strategy.difficulty} />
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Market</dt>
          <dd className="mt-1 font-medium text-slate-700">{strategy.market}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-slate-500">Languages</dt>
          <dd className="mt-1 font-medium text-slate-700">
            {strategy.languages.map((l) => LANGUAGE_LABELS[l]).join(" · ")}
          </dd>
        </div>
      </dl>

      {/* Real link above the card's stretched-link overlay, so clicking the button always navigates. */}
      <Link
        to={detailPath}
        aria-label={`View ${strategy.name} template`}
        className="btn-secondary relative z-10 mt-5 w-full group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white"
      >
        View Template
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </article>
  );
}
