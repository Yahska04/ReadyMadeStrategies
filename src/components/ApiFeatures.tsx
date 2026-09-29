import { ArrowUpRight, Briefcase, ChartCandlestick, SquareTerminal, TriangleAlert, Workflow } from "lucide-react";
import { DOCS_URL_IS_PLACEHOLDER, LINKS } from "../config/links";
import ExternalLink from "./ExternalLink";

const FEATURES = [
  { title: "Order Management", description: "Place and manage orders programmatically.", icon: SquareTerminal },
  { title: "Market Data", description: "Access market data required for strategy logic.", icon: ChartCandlestick },
  { title: "Portfolio", description: "Access positions, holdings and order information.", icon: Briefcase },
  { title: "Automation", description: "Build automated trading workflows around your strategy.", icon: Workflow },
];

export default function ApiFeatures() {
  return (
    <section id="api" className="border-t border-slate-200 bg-slate-50/70 py-20 sm:py-24" aria-labelledby="api-title">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">API integration</p>
          <h2 id="api-title" className="section-title mt-3">
            Built for TradeSmart API
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Each template separates strategy logic from a small placeholder client, so you can connect it to the
            TradeSmart API functions you use.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ title, description, icon: Icon }) => (
            <li key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-600">For exact endpoints, request formats and limits, refer to the</p>
          <ExternalLink
            href={LINKS.apiDocs}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            TradeSmart API Documentation
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </ExternalLink>
        </div>

        {import.meta.env.DEV && DOCS_URL_IS_PLACEHOLDER && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <TriangleAlert className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
            Dev notice: the documentation URL is a placeholder. Replace it in src/config/links.ts.
          </p>
        )}
      </div>
    </section>
  );
}
