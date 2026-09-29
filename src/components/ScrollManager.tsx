import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Scrolls to the top on page changes and to #hash targets for in-page links.
 * REPLACE navigations (e.g. search/filter query updates) never move the page.
 */
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();
  const previousPath = useRef(pathname);

  useEffect(() => {
    const pageChanged = previousPath.current !== pathname;
    previousPath.current = pathname;
    if (navigationType === "REPLACE") return;

    if (hash) {
      const frame = requestAnimationFrame(() => {
        document
          .getElementById(decodeURIComponent(hash.slice(1)))
          ?.scrollIntoView({ behavior: pageChanged ? "auto" : "smooth", block: "start" });
      });
      return () => cancelAnimationFrame(frame);
    }
    if (pageChanged) window.scrollTo(0, 0);
  }, [pathname, hash, key, navigationType]);

  return null;
}
