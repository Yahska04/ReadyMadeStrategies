import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { validateParameter } from "../lib/parameters";
import type { Parameter, ParameterValues } from "../types/strategy";

interface ParameterTableProps {
  parameters: Parameter[];
  values: ParameterValues;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}

const inputClass =
  "h-10 w-full rounded-lg border bg-white px-3 text-sm text-ink shadow-sm transition focus:ring-4 focus:outline-none";

export default function ParameterTable({ parameters, values, onChange, onReset }: ParameterTableProps) {
  const modifiedCount = parameters.filter((p) => (values[p.key] ?? p.defaultValue) !== p.defaultValue).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-600" aria-hidden="true" />
          <h3 className="text-base font-semibold">Parameters</h3>
          {modifiedCount > 0 && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
              {modifiedCount} changed
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={modifiedCount === 0}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset to defaults
        </button>
      </div>

      <ul className="divide-y divide-slate-100">
        {parameters.map((parameter) => {
          const value = values[parameter.key] ?? parameter.defaultValue;
          const error = validateParameter(parameter, value);
          const modified = value !== parameter.defaultValue;
          const id = `param-${parameter.key}`;
          const border = error
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : modified
              ? "border-brand-400 focus:border-brand-500 focus:ring-brand-100"
              : "border-slate-300 focus:border-brand-500 focus:ring-brand-100";

          return (
            <li key={parameter.key} className={`px-5 py-4 ${modified ? "bg-brand-50/40" : ""}`}>
              <div className="flex items-baseline justify-between gap-2">
                <label htmlFor={id} className="text-sm font-medium text-ink">
                  {parameter.label}
                </label>
                <code className="font-mono text-[11px] text-slate-400">{parameter.key}</code>
              </div>

              <div className="mt-2 flex items-center gap-2">
                {parameter.type === "select" ? (
                  <select
                    id={id}
                    value={value}
                    onChange={(event) => onChange(parameter.key, event.target.value)}
                    className={`${inputClass} ${border}`}
                  >
                    {parameter.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={id}
                    type={parameter.type === "time" ? "time" : "text"}
                    inputMode={
                      parameter.type === "integer" ? "numeric" : parameter.type === "decimal" ? "decimal" : undefined
                    }
                    value={value}
                    onChange={(event) => onChange(parameter.key, event.target.value)}
                    aria-invalid={error !== null}
                    aria-describedby={`${id}-help`}
                    autoComplete="off"
                    spellCheck={false}
                    className={`${inputClass} ${border}`}
                  />
                )}
                {parameter.unit && <span className="shrink-0 text-xs text-slate-500">{parameter.unit}</span>}
              </div>

              <p id={`${id}-help`} className="mt-1.5 text-xs leading-relaxed text-slate-500">
                {error ? (
                  <span className="font-medium text-red-600">
                    {error} - using default ({parameter.defaultValue}) in code.
                  </span>
                ) : (
                  parameter.description
                )}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
        Changes update the code instantly. Invalid values fall back to their defaults in the generated code.
      </p>
    </div>
  );
}
