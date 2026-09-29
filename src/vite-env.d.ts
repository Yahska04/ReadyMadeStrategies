/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRADESMART_API_DOCS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Prism language components are side-effect scripts without type declarations.
declare module "prismjs/components/*";
