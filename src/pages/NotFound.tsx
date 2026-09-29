import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function NotFound() {
  useDocumentMeta("Page not found | TradeSmart API Strategy Templates");

  return (
    <section className="container-page flex flex-col items-center py-28 text-center" aria-labelledby="not-found-title">
      <p className="font-mono text-sm font-semibold text-brand-600">404</p>
      <h1 id="not-found-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-slate-600">
        The page you are looking for does not exist or may have moved.
      </p>
      <Link to={{ pathname: "/", hash: "#templates" }} className="btn-primary mt-8">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to templates
      </Link>
    </section>
  );
}
