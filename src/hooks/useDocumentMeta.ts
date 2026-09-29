import { useEffect } from "react";

const DEFAULT_TITLE = "TradeSmart API Strategy Templates | Ready-to-Use Trading Code";
const DEFAULT_DESCRIPTION =
  "Explore ready-made trading strategy code templates for TradeSmart API, including EMA Crossover, RSI, VWAP, Straddle, Strangle, Momentum and Breakout strategies.";

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

/** Keeps the document title and description / Open Graph tags in sync with the current page. */
export function useDocumentMeta(title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION) {
  useEffect(() => {
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
  }, [title, description]);
}
