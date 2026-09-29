# TradeSmart API Strategy Templates

A developer portal page that lets algo traders browse popular trading strategies and grab
ready-to-adapt code templates for the TradeSmart API.

Built with React, Vite, TypeScript and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
npm run typecheck  # TypeScript checks
npm run build      # production build -> dist/
npm run preview    # serve the production build locally
```

## Features

- 7 strategy templates: EMA Crossover, RSI, VWAP, Straddle, Strangle, Momentum, Breakout
- Search and category filters (state kept in the URL)
- Detail pages at `/strategies/<id>` with an overview, editable parameters and a code viewer
- Python, Node.js, Java and C# templates, with syntax highlighting, line numbers, Copy Code and Download Template

## Project structure

```
src/
  components/   UI building blocks (Header, Hero, StrategyCard, CodeViewer, ...)
  pages/        Home, StrategyDetail, NotFound
  data/         strategies.ts (metadata) + templates/ (per-strategy code)
  lib/          template scaffold, parameter substitution, clipboard/download helpers
  config/       external links (placeholders) and disclaimer text
  types/        shared TypeScript types
```

### Adding a strategy

1. Create `src/data/templates/<name>.ts` using `buildTemplates()` and provide `config` + `logic`
   for each language. Use `{{PARAMETER_KEY}}` placeholders for configurable values.
2. Add an entry to `strategies` in `src/data/strategies.ts` with the matching parameters.

## Important: placeholders to replace

- **URLs:** every external link in `src/config/links.ts` points at `https://example.com/...`.
  Replace them with the official TradeSmart URLs (the docs URL can also be set through
  `VITE_TRADESMART_API_DOCS_URL`, see `.env.example`).
- **API client:** every template contains a `TradeSmartClient` class whose methods are
  **placeholders** (marked `TODO`). They aren't official TradeSmart SDK calls. Wire them up
  using the official TradeSmart API documentation.
- **Branding:** the logo mark and brand colour scale (`src/index.css`) are stand-ins.
- **SEO:** `og:url` and `og:image` in `index.html` are placeholders.

## Deployment note

The site uses client-side routing (`/strategies/...`). Configure your host to serve
`index.html` for unknown paths (SPA fallback).

## Disclaimer

These templates are provided as development examples. Users should independently test and
validate strategy logic before deploying it in live markets. They aren't investment advice.
