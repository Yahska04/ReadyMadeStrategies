import {
  ArrowLeft,
  CircleCheck,
  CircleStop,
  Lightbulb,
  ListChecks,
  SlidersHorizontal,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import CodeViewer from "../components/CodeViewer";
import DifficultyBadge from "../components/DifficultyBadge";
import Disclaimer from "../components/Disclaimer";
import ParameterTable from "../components/ParameterTable";
import StrategyCard from "../components/StrategyCard";
import StrategyIcon from "../components/StrategyIcon";
import Tag from "../components/Tag";
import { getStrategy, strategies } from "../data/strategies";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { isLanguageKey, LANGUAGE_LABELS } from "../lib/languages";
import { defaultValues, renderTemplate } from "../lib/parameters";
import type { LanguageKey, ParameterValues, Strategy } from "../types/strategy";
import NotFound from "./NotFound";

export default function StrategyDetail() {
  const { strategyId } = useParams();
  const strategy = getStrategy(strategyId);
  if (!strategy) return <NotFound />;
  // Keyed so parameter state resets when navigating between strategies.
  return <StrategyDetailContent key={strategy.id} strategy={strategy} />;
}

function OverviewCard({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-base font-semibold">
        <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
        {title}
      </h3>
      <div className="mt-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StrategyDetailContent({ strategy }: { strategy: Strategy }) {
  const [searchParams, setSearchParams] = useSearchParams();
  // Local state is the source of truth so the code updates synchronously on tab
  // clicks; the URL (?lang=) mirrors it for shareable links.
  const [language, setLanguageState] = useState<LanguageKey>(() => {
    const langParam = searchParams.get("lang");
    return isLanguageKey(langParam) && strategy.languages.includes(langParam) ? langParam : "python";
  });
  const [values, setValues] = useState<ParameterValues>(() => defaultValues(strategy.parameters));

  useDocumentMeta(`${strategy.name} Template | TradeSmart API Strategy Templates`, strategy.description);

  const code = useMemo(
    () => renderTemplate(strategy.code[language], strategy, values),
    [strategy, language, values],
  );

  const setLanguage = (next: LanguageKey) => {
    setLanguageState(next);
    const params = new URLSearchParams(searchParams);
    if (next === "python") params.delete("lang");
    else params.set("lang", next);
    setSearchParams(params, { replace: true, preventScrollReset: true });
  };

  const related = strategies.filter((s) => s.id !== strategy.id).slice(0, 3);
  const { overview } = strategy;

  return (
    <article>
      <header className="border-b border-slate-200 bg-slate-50/60">
        <div className="container-page animate-fade-up py-10 sm:py-12">
          <Link
            to={{ pathname: "/", hash: "#templates" }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to templates
          </Link>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
            <StrategyIcon icon={strategy.icon} size="lg" />
            <div className="min-w-0">
              <p className="eyebrow">{strategy.category} template</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{strategy.name}</h1>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">{strategy.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {strategy.tags.map((tag) => (
                  <Tag key={tag} tone="brand">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-slate-500">Category</dt>
              <dd className="mt-1 font-medium text-ink">{strategy.category}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Difficulty</dt>
              <dd className="mt-1">
                <DifficultyBadge difficulty={strategy.difficulty} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Market</dt>
              <dd className="mt-1 font-medium text-ink">{strategy.market}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Languages</dt>
              <dd className="mt-1 font-medium text-ink">
                {strategy.languages.map((l) => LANGUAGE_LABELS[l]).join(", ")}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="container-page py-14" aria-labelledby="overview-title">
        <p className="eyebrow">Learn the logic</p>
        <h2 id="overview-title" className="section-title mt-2">
          Strategy overview
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2 lg:col-span-3">
            <OverviewCard title="What it does" icon={Lightbulb}>
              <p className="max-w-4xl">{overview.summary}</p>
            </OverviewCard>
          </div>
          <OverviewCard title="Entry conditions" icon={CircleCheck}>
            <BulletList items={overview.entryConditions} />
          </OverviewCard>
          <OverviewCard title="Exit conditions" icon={CircleStop}>
            <BulletList items={overview.exitConditions} />
          </OverviewCard>
          <OverviewCard title="Important parameters" icon={SlidersHorizontal}>
            <BulletList items={overview.keyParameters} />
          </OverviewCard>
          <OverviewCard title="Suitable use cases" icon={ListChecks}>
            <BulletList items={overview.useCases} />
          </OverviewCard>
          <div className="md:col-span-1 lg:col-span-2">
            <OverviewCard title="Things to consider" icon={TriangleAlert}>
              <BulletList items={overview.considerations} />
            </OverviewCard>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50/60 py-14" aria-labelledby="code-title" id="code">
        <div className="container-page">
          <p className="eyebrow">Template</p>
          <h2 id="code-title" className="section-title mt-2">
            Configure &amp; get the code
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Adjust the parameters, pick a language, then copy or download the template. Placeholder API methods are
            clearly marked so you can connect them to the official TradeSmart API.
          </p>

          <div className="mt-8 grid items-start gap-6 lg:grid-cols-12">
            <div className="lg:sticky lg:top-20 lg:col-span-4">
              <ParameterTable
                parameters={strategy.parameters}
                values={values}
                onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
                onReset={() => setValues(defaultValues(strategy.parameters))}
              />
            </div>
            <div className="min-w-0 lg:col-span-8">
              <CodeViewer strategy={strategy} language={language} onLanguageChange={setLanguage} code={code} />
            </div>
          </div>

          <Disclaimer className="mt-8" />
        </div>
      </section>

      <section className="container-page py-14" aria-labelledby="more-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="more-title" className="section-title">
            More templates
          </h2>
          <Link to={{ pathname: "/", hash: "#templates" }} className="btn-secondary">
            View all templates
          </Link>
        </div>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {related.map((s, index) => (
            <li key={s.id}>
              <StrategyCard strategy={s} index={index} />
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
