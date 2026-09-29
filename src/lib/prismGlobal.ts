import { Prism } from "prism-react-renderer";

// Prism language components expect a global `Prism` object to extend.
(globalThis as unknown as { Prism: typeof Prism }).Prism = Prism;
