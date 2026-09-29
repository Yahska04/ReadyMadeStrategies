import { LINKS } from "../config/links";
import type { Parameter, ParameterValues, Strategy } from "../types/strategy";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const TEXT_PATTERN = /^[A-Za-z0-9 _.:&\-]+$/;

export function defaultValues(parameters: Parameter[]): ParameterValues {
  return Object.fromEntries(parameters.map((p) => [p.key, p.defaultValue]));
}

/** Returns an error message, or null when the value is valid. */
export function validateParameter(parameter: Parameter, raw: string): string | null {
  const value = raw.trim();
  if (value === "") return "Required";

  switch (parameter.type) {
    case "integer":
    case "decimal": {
      const pattern = parameter.type === "integer" ? /^-?\d+$/ : /^-?\d+(\.\d+)?$/;
      if (!pattern.test(value)) {
        return parameter.type === "integer" ? "Enter a whole number" : "Enter a number";
      }
      const numeric = Number(value);
      if (parameter.min !== undefined && numeric < parameter.min) return `Minimum ${parameter.min}`;
      if (parameter.max !== undefined && numeric > parameter.max) return `Maximum ${parameter.max}`;
      return null;
    }
    case "time":
      return TIME_PATTERN.test(value) ? null : "Use 24h HH:MM";
    case "select":
      return parameter.options?.includes(value) ? null : "Choose an option";
    case "text":
      return TEXT_PATTERN.test(value) && value.length <= 40
        ? null
        : "Letters, numbers, spaces and - _ . : & only";
  }
}

/** Converts a parameter value to a code literal valid in Python, JS, Java and C#. */
function toLiteral(parameter: Parameter, value: string): string {
  if (parameter.type === "integer" || parameter.type === "decimal") {
    return String(Number(value));
  }
  return JSON.stringify(value);
}

/**
 * Replaces {{KEY}} placeholders in a template with parameter values.
 * Invalid values fall back to the parameter's default so the generated code
 * always stays syntactically valid.
 */
export function renderTemplate(
  template: string,
  strategy: Pick<Strategy, "parameters">,
  values: ParameterValues,
): string {
  let output = template.replaceAll("{{DOCS_URL}}", LINKS.apiDocs);
  for (const parameter of strategy.parameters) {
    const candidate = (values[parameter.key] ?? parameter.defaultValue).trim();
    const value = validateParameter(parameter, candidate) === null ? candidate : parameter.defaultValue;
    output = output.replaceAll(`{{${parameter.key}}}`, toLiteral(parameter, value));
  }
  return output;
}
