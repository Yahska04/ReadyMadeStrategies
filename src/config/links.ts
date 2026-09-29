/**
 * External links used across the site.
 *
 * TODO(TradeSmart): the URLs below are PLACEHOLDERS. Replace them with the
 * official TradeSmart URLs before publishing. The API documentation URL can
 * also be supplied at build time via VITE_TRADESMART_API_DOCS_URL.
 */
const PLACEHOLDER_BASE = "https://example.com/tradesmart";

export const LINKS = {
  apiDocs:
    import.meta.env.VITE_TRADESMART_API_DOCS_URL || `${PLACEHOLDER_BASE}/api-docs`,
  apiAccess: `${PLACEHOLDER_BASE}/api-access`,
  sdks: `${PLACEHOLDER_BASE}/sdks`,
  support: `${PLACEHOLDER_BASE}/support`,
  contact: `${PLACEHOLDER_BASE}/contact`,
  terms: `${PLACEHOLDER_BASE}/terms`,
  privacy: `${PLACEHOLDER_BASE}/privacy`,
} as const;

/** True while the docs link still points at the placeholder domain. */
export const DOCS_URL_IS_PLACEHOLDER = LINKS.apiDocs.startsWith(PLACEHOLDER_BASE);

export const DISCLAIMER =
  "These templates are provided as development examples. Users should independently test and validate strategy logic before deploying it in live markets.";
