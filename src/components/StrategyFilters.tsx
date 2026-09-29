import { Search, X } from "lucide-react";
import type { Filter } from "../data/strategies";

interface StrategyFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  filters: readonly Filter[];
  activeFilter: Filter;
  onFilterChange: (filter: Filter) => void;
  counts: Record<Filter, number>;
}

export default function StrategyFilters({
  query,
  onQueryChange,
  filters,
  activeFilter,
  onFilterChange,
  counts,
}: StrategyFiltersProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-sm">
        <label htmlFor="strategy-search" className="sr-only">
          Search strategies
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          id="strategy-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search strategies..."
          autoComplete="off"
          className="h-11 w-full rounded-xl border border-slate-300 bg-white pr-10 pl-10 text-sm text-ink shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="absolute top-1/2 right-2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div
        role="group"
        aria-label="Filter strategies by category"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
      >
        {filters.map((filter) => {
          const active = filter === activeFilter;
          return (
            <button
              key={filter}
              type="button"
              aria-pressed={active}
              onClick={() => onFilterChange(filter)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-ink bg-ink text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {filter}
              <span className={`text-xs tabular-nums ${active ? "text-slate-300" : "text-slate-400"}`}>{counts[filter]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
