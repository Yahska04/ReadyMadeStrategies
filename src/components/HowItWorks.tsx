import { MousePointerClick, Plug, SlidersHorizontal } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Choose a strategy",
    description: "Select a ready-made strategy template.",
    icon: MousePointerClick,
  },
  {
    number: "02",
    title: "Customize the code",
    description: "Modify parameters and trading logic according to your requirements.",
    icon: SlidersHorizontal,
  },
  {
    number: "03",
    title: "Connect with TradeSmart API",
    description: "Integrate the strategy with your TradeSmart API application and deploy it according to your setup.",
    icon: Plug,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24" aria-labelledby="how-title">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">How it works</p>
          <h2 id="how-title" className="section-title mt-3">
            From template to your own strategy in three steps
          </h2>
        </div>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Connector line between steps on desktop */}
          <div
            className="absolute top-7 right-[16.66%] left-[16.66%] hidden h-px bg-gradient-to-r from-brand-200 via-slate-200 to-brand-200 md:block"
            aria-hidden="true"
          />
          {STEPS.map(({ number, title, description, icon: Icon }) => (
            <li key={number} className="relative flex flex-col items-center text-center">
              <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-brand-600 shadow-sm">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="mt-5 font-mono text-sm font-semibold text-brand-600">{number}</span>
              <h3 className="mt-1 text-lg font-semibold">{title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-600">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
