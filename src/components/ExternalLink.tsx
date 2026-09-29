import type { AnchorHTMLAttributes } from "react";

/** Opens external (currently placeholder) TradeSmart URLs in a new tab. */
export default function ExternalLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}
