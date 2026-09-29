import { Check, Copy, Download, FileCode, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { copyToClipboard, downloadTextFile } from "../lib/browser";
import { LANGUAGES } from "../lib/languages";
import type { LanguageKey, Strategy } from "../types/strategy";
import CodeBlock from "./CodeBlock";

interface CodeViewerProps {
  strategy: Strategy;
  language: LanguageKey;
  onLanguageChange: (language: LanguageKey) => void;
  code: string;
}

type CopyState = "idle" | "copied" | "failed";

export default function CodeViewer({ strategy, language, onLanguageChange, code }: CodeViewerProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);
  const fileName = strategy.fileNames[language];
  const prismLanguage = LANGUAGES.find((l) => l.key === language)?.prism ?? "python";
  const available = LANGUAGES.filter((l) => strategy.languages.includes(l.key));

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    setCopyState(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopyState("idle"), 2000);
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-code shadow-xl ring-1 shadow-slate-900/10 ring-slate-900/10">
      <div className="flex flex-col gap-3 border-b border-white/5 bg-code-bar px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div role="tablist" aria-label="Code language" className="code-scroll flex gap-1 overflow-x-auto">
          {available.map((l) => {
            const active = l.key === language;
            return (
              <button
                key={l.key}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="code-panel"
                onClick={() => onLanguageChange(l.key)}
                className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`btn flex-1 py-2 sm:flex-none ${
              copyState === "copied"
                ? "bg-emerald-500 text-white"
                : copyState === "failed"
                  ? "bg-red-500 text-white"
                  : "bg-brand-600 text-white hover:bg-brand-500"
            }`}
            aria-live="polite"
          >
            {copyState === "copied" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copyState === "copied" ? "Copied!" : copyState === "failed" ? "Copy failed" : "Copy Code"}
          </button>
          <button
            type="button"
            onClick={() => downloadTextFile(fileName, code)}
            className="btn flex-1 border border-white/15 px-3 py-2 whitespace-nowrap text-slate-100 hover:bg-white/10 sm:flex-none"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download Template
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-2 text-xs text-slate-400">
        <span className="inline-flex min-w-0 items-center gap-1.5 font-mono">
          <FileCode className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{fileName}</span>
        </span>
        <span className="shrink-0">{code.split("\n").length} lines</span>
      </div>

      <div id="code-panel" role="tabpanel">
        <CodeBlock
          code={code}
          language={prismLanguage}
          className="max-h-[70vh] px-2 py-4"
          label={`${strategy.name} template code (${fileName})`}
        />
      </div>

      <p className="flex gap-2 border-t border-white/5 px-4 py-3 text-xs leading-relaxed text-slate-400">
        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden="true" />
        <span>
          Template code. <code className="font-mono text-slate-300">TradeSmartClient</code> methods are placeholders
          marked <code className="font-mono text-amber-300">TODO</code> - connect them to the official TradeSmart API
          before use. Orders run in DRY_RUN mode by default.
        </span>
      </p>
    </div>
  );
}
