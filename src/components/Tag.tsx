import type { ReactNode } from "react";

interface TagProps {
  children: ReactNode;
  tone?: "neutral" | "brand";
}

const TONES = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-100",
};

export default function Tag({ children, tone = "neutral" }: TagProps) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}>
      {children}
    </span>
  );
}
