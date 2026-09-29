import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LINKS } from "../config/links";
import ExternalLink from "./ExternalLink";
import Logo from "./Logo";

const NAV_EXTERNAL = [
  { label: "API Documentation", href: LINKS.apiDocs },
  { label: "SDKs", href: LINKS.sdks },
  { label: "Support", href: LINKS.support },
];

const navLinkClass =
  "rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink";

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          <Link to={{ pathname: "/", hash: "#templates" }} className={navLinkClass}>
            Strategy Templates
          </Link>
          {NAV_EXTERNAL.map((item) => (
            <ExternalLink key={item.label} href={item.href} className={navLinkClass}>
              {item.label}
            </ExternalLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ExternalLink href={LINKS.apiDocs} className="btn-secondary py-2">
            API Docs
          </ExternalLink>
          <ExternalLink href={LINKS.apiAccess} className="btn-primary py-2">
            Get API Access
          </ExternalLink>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="animate-fade-in border-t border-slate-200 bg-white lg:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-4">
            <Link
              to={{ pathname: "/", hash: "#templates" }}
              className="rounded-lg px-3 py-2.5 text-base font-medium text-ink hover:bg-slate-100"
              onClick={() => setOpen(false)}
            >
              Strategy Templates
            </Link>
            {NAV_EXTERNAL.map((item) => (
              <ExternalLink
                key={item.label}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-ink hover:bg-slate-100"
              >
                {item.label}
              </ExternalLink>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200 pt-4">
              <ExternalLink href={LINKS.apiDocs} className="btn-secondary">
                API Docs
              </ExternalLink>
              <ExternalLink href={LINKS.apiAccess} className="btn-primary">
                Get API Access
              </ExternalLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
