import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { LINKS } from "../config/links";
import ExternalLink from "./ExternalLink";

export default function CTA() {
  return (
    <section className="pb-20 sm:pb-24" aria-labelledby="cta-title">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center sm:px-12 sm:py-16">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand-600/25 blur-3xl"
            aria-hidden="true"
          />
          <h2 id="cta-title" className="relative text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
            Ready to build your trading strategy?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-slate-300">
            Start with a ready-made template and connect your strategy to TradeSmart API.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={{ pathname: "/", hash: "#templates" }} className="btn-primary px-5 py-3">
              Explore Templates
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <ExternalLink
              href={LINKS.apiDocs}
              className="btn border border-white/20 bg-white/5 px-5 py-3 text-white hover:bg-white/10"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Read API Documentation
            </ExternalLink>
          </div>
        </div>
      </div>
    </section>
  );
}
