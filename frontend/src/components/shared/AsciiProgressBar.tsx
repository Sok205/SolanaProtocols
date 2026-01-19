"use client";

interface AsciiProgressBarProps {
  value: number;
  max: number;
  width?: number;
  label?: string;
  showPercentage?: boolean;
  showValue?: boolean;
  className?: string;
}

export function AsciiProgressBar({
  value,
  max,
  width = 20,
  label,
  showPercentage = true,
  showValue = true,
  className = "",
}: AsciiProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const filledChars = Math.round((percentage / 100) * width);
  const emptyChars = width - filledChars;

  const filled = "█".repeat(filledChars);
  const empty = "░".repeat(emptyChars);

  const formattedValue = typeof value === "number"
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : value;

  return (
    <div className={`font-mono ${className}`}>
      <div className="flex items-center gap-3">
        {label && (
          <span className="text-terminal-muted uppercase text-sm min-w-[80px]">
            {label}
          </span>
        )}
        <span className="text-terminal glow">
          [{filled}{empty}]
        </span>
        {showPercentage && (
          <span className="text-terminal-muted text-sm w-12 text-right">
            {percentage.toFixed(0)}%
          </span>
        )}
        {showValue && (
          <span className="text-terminal glow">
            {formattedValue}
          </span>
        )}
      </div>
    </div>
  );
}
