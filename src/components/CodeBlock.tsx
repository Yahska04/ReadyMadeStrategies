import { Highlight, themes, type PrismTheme } from "prism-react-renderer";

const codeTheme: PrismTheme = {
  ...themes.vsDark,
  plain: { ...themes.vsDark.plain, backgroundColor: "transparent", color: "#d6deeb" },
};

interface CodeBlockProps {
  code: string;
  /** Prism language id, e.g. "python", "javascript", "java", "csharp". */
  language: string;
  showLineNumbers?: boolean;
  className?: string;
  label?: string;
}

export default function CodeBlock({ code, language, showLineNumbers = true, className = "", label }: CodeBlockProps) {
  return (
    <Highlight theme={codeTheme} code={code.replace(/\n$/, "")} language={language}>
      {({ className: prismClass, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${prismClass} code-scroll overflow-auto font-mono text-[13px] leading-6 ${className}`}
          style={style}
          tabIndex={0}
          aria-label={label}
        >
          <code className="table min-w-full">
            {tokens.map((line, lineIndex) => {
              const lineProps = getLineProps({ line });
              return (
                <span key={lineIndex} {...lineProps} className={`${lineProps.className} table-row`}>
                  {showLineNumbers && (
                    <span className="table-cell w-10 pr-4 text-right text-slate-500/70 select-none" aria-hidden="true">
                      {lineIndex + 1}
                    </span>
                  )}
                  <span className="table-cell pr-4 whitespace-pre">
                    {line.map((token, tokenIndex) => (
                      <span key={tokenIndex} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </span>
              );
            })}
          </code>
        </pre>
      )}
    </Highlight>
  );
}
