"use client";

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
    <div className="border border-terminal p-3 space-y-2">
      <div className="text-terminal-muted text-xs uppercase">
        // {title}
      </div>
      <div className="text-terminal-muted text-xs">
        // ────────────────────────────────
      </div>
      {steps.map((step, i) => (
        <div
          key={i}
          className={`text-sm ${step.highlight ? "text-terminal glow" : "text-terminal-muted"}`}
        >
          <span className="text-terminal-muted">// {step.label.toLowerCase()}:</span>
          <div className="pl-3 mt-0.5">
            <span className={step.highlight ? "text-terminal glow" : "text-terminal"}>
              {step.formula}
            </span>
            {step.value && (
              <span className="text-terminal glow ml-2">
                = {step.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
