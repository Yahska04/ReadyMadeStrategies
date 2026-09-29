import { SearchX } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FILTERS, matchesFilter, matchesSearch, strategies, type Filter } from "../data/strategies";
import StrategyCard from "./StrategyCard";
import StrategyFilters from "./StrategyFilters";

function parseFilter(value: string | null): Filter {
  return (FILTERS as readonly string[]).includes(value ?? "") ? (value as Filter) : "All";
}

export default function StrategyGrid() {
  // Search and filter live in the URL so results are shareable and survive navigation.
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const activeFilter = parseFilter(searchParams.get("category"));

  const updateParams = (next: { q?: string; category?: Filter }) => {
    const params = new URLSearchParams(searchParams);
    const q = next.q ?? query;
    const category = next.category ?? activeFilter;
    if (q) params.set("q", q);
    else params.delete("q");
    if (category !== "All") params.set("category", category);
    else params.delete("category");
    setSearchParams(params, { replace: true, preventScrollReset: true });
  };

  const searchResults = useMemo(() => strategies.filter((s) => matchesSearch(s, query)), [query]);

  const counts = useMemo(
    () =>
      Object.fromEntries(FILTERS.map((f) => [f, searchResults.filter((s) => matchesFilter(s, f)).length])) as Record<
        Filter,
        number
      >,
    [searchResults],
  );

  const visible = searchResults.filter((s) => matchesFilter(s, activeFilter));

  return (
    <div>
      <StrategyFilters
        query={query}
        onQueryChange={(q) => updateParams({ q })}
        filters={FILTERS}
        activeFilter={activeFilter}
        onFilterChange={(category) => updateParams({ category })}
        counts={counts}
      />

      <p className="mt-6 text-sm text-slate-500" aria-live="polite">
        Showing <span className="font-semibold text-slate-700">{visible.length}</span> of {strategies.length} templates
        {activeFilter !== "All" && (
          <>
            {" "}
            in <span className="font-semibold text-slate-700">{activeFilter}</span>
          </>
        )}
        {query && (
          <>
            {" "}
            matching <span className="font-semibold text-slate-700">“{query}”</span>
          </>
        )}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((strategy, index) => (
            <li key={`${strategy.id}-${activeFilter}-${query}`}>
              <StrategyCard strategy={strategy} index={index} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-16 text-center">
          <SearchX className="h-10 w-10 text-slate-400" aria-hidden="true" />
          <h3 className="mt-4 text-base font-semibold">No templates match your search</h3>
          <p className="mt-1 text-sm text-slate-600">Try a different keyword or clear the filters.</p>
          <button type="button" className="btn-secondary mt-5" onClick={() => setSearchParams({}, { replace: true })}>
            Clear search and filters
          </button>
        </div>
      )}
    </div>
  );
}
