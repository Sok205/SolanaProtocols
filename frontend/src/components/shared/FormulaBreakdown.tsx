// src/components/shared/FormulaBreakdown.tsx
"use client";

import { MathDisplay } from "./MathDisplay";

export interface FormulaStep {
  label: string;
  formula: string;
  value?: string;
  highlight?: boolean;
}

interface FormulaBreakdownProps {
  title: string;
  steps: FormulaStep[];
}

export function FormulaBreakdown({ title, steps }: FormulaBreakdownProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-4 space-y-3">
      <h4 className="text-sm font-medium text-gray-400">{title}</h4>
      {steps.map((step, i) => (
        <div
          key={i}
          className={
            step.highlight
              ? "bg-purple-900/30 -mx-2 px-2 py-1 rounded"
              : ""
          }
        >
          <span className="text-gray-500 text-sm">{step.label}:</span>
          <div className="flex items-center gap-3 mt-1">
            <MathDisplay formula={step.formula} />
            {step.value && (
              <span className="text-green-400 font-mono">= {step.value}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
