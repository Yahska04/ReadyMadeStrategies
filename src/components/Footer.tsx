import { Link } from "react-router-dom";
import { DISCLAIMER, LINKS } from "../config/links";
import ExternalLink from "./ExternalLink";
import Logo from "./Logo";

const linkClass = "text-sm text-slate-400 transition-colors hover:text-white";

const DEVELOPER_LINKS = [
  { label: "API Documentation", href: LINKS.apiDocs },
  { label: "SDKs", href: LINKS.sdks },
  { label: "Support", href: LINKS.support },
];

const COMPANY_LINKS = [
  { label: "Contact Us", href: LINKS.contact },
  { label: "Terms & Conditions", href: LINKS.terms },
  { label: "Privacy Policy", href: LINKS.privacy },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-slate-300">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo inverted />
            <p className="mt-4 text-sm font-medium text-white">TradeSmart API Strategy Templates</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">{DISCLAIMER}</p>
          </div>

          <nav aria-label="Developer links">
            <h2 className="text-sm font-semibold text-white">Developers</h2>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to={{ pathname: "/", hash: "#templates" }} className={linkClass}>
                  Strategy Templates
                </Link>
              </li>
              {DEVELOPER_LINKS.map((item) => (
                <li key={item.label}>
                  <ExternalLink href={item.href} className={linkClass}>
                    {item.label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company links">
            <h2 className="text-sm font-semibold text-white">Company</h2>
            <ul className="mt-4 space-y-3">
              {COMPANY_LINKS.map((item) => (
                <li key={item.label}>
                  <ExternalLink href={item.href} className={linkClass}>
                    {item.label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-slate-500">
          © {year} TradeSmart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
