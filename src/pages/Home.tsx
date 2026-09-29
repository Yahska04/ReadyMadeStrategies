import ApiFeatures from "../components/ApiFeatures";
import CTA from "../components/CTA";
import Disclaimer from "../components/Disclaimer";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import StrategyGrid from "../components/StrategyGrid";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function Home() {
  useDocumentMeta();

  return (
    <>
      <Hero />

      <section id="templates" className="py-20 sm:py-24" aria-labelledby="templates-title">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">Template library</p>
            <h2 id="templates-title" className="section-title mt-3">
              Popular Strategy Templates
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Start with a ready-made implementation and customize it to your trading requirements.
            </p>
          </div>

          <div className="mt-10">
            <StrategyGrid />
          </div>

          <Disclaimer className="mt-10" />
        </div>
      </section>

      <ApiFeatures />
      <HowItWorks />
      <CTA />
    </>
  );
}
