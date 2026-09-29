import { ArrowRight, BookOpen, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { LINKS } from "../config/links";
import { strategies } from "../data/strategies";
import CodeBlock from "./CodeBlock";
import ExternalLink from "./ExternalLink";

const SAMPLE_CODE = `# Illustrative sample - not an official TradeSmart SDK
from tradesmart import TradeSmart

api = TradeSmart(
    api_key="YOUR_API_KEY"
)

strategy = EMACrossover(
    fast_period=9,
    slow_period=21
)

strategy.run(api)`;

const HIGHLIGHTS = [
  `${strategies.length} strategy templates`,
  "Python, Node.js, Java & C#",
  "Copy or download instantly",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200" aria-labelledby="hero-title">
      {/* Subtle grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_right,black_30%,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(226 232 240 / 0.7) 1px, transparent 1px), linear-gradient(to bottom, rgb(226 232 240 / 0.7) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="container-page relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            TradeSmart API Strategy Template Library
          </p>
          <h1 id="hero-title" className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
            Ready-to-Use Trading Strategy Templates
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            Build, test and automate popular trading strategies with TradeSmart API. Start with ready-made code
            templates and customize them for your trading logic.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={{ pathname: "/", hash: "#templates" }} className="btn-primary px-5 py-3">
              Explore Templates
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <ExternalLink href={LINKS.apiDocs} className="btn-secondary px-5 py-3">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              View API Documentation
            </ExternalLink>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-brand-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-up min-w-0 [animation-delay:120ms]">
          <figure className="overflow-hidden rounded-2xl bg-code shadow-2xl ring-1 shadow-slate-900/15 ring-slate-900/10">
            <div className="flex items-center justify-between border-b border-white/5 bg-code-bar px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="h-3 w-3 rounded-full bg-slate-600" />
                  <span className="h-3 w-3 rounded-full bg-slate-600" />
                  <span className="h-3 w-3 rounded-full bg-slate-600" />
                </span>
                <span className="ml-2 font-mono text-xs text-slate-400">strategy.py</span>
              </div>
              <span className="rounded bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300 ring-1 ring-amber-400/20">
                Illustrative sample
              </span>
            </div>
            <CodeBlock code={SAMPLE_CODE} language="python" className="px-2 py-4" label="Illustrative sample code" />
            <figcaption className="border-t border-white/5 px-4 py-2.5 text-xs text-slate-400">
              Conceptual example only. See each template for placeholder methods you connect to the official API.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
