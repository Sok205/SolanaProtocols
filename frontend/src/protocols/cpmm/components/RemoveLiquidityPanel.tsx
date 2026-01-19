"use client";

import { useState, useMemo } from "react";
import BN from "bn.js";
import { FormulaBreakdown, FormulaStep, TerminalButton } from "@/components/shared";
import { calculateRemoveLiquidityAmounts, formatTokenAmount } from "../lib/math";
import { PoolData } from "../lib/client";

interface Props {
  pool: PoolData;
  userLpBalance: BN;
  onRemoveLiquidity: (lpAmount: BN) => Promise<void>;
  symbolA?: string;
  symbolB?: string;
}

export function RemoveLiquidityPanel({
  pool,
  userLpBalance,
  onRemoveLiquidity,
  symbolA = "A",
  symbolB = "B"
}: Props) {
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(false);

  const { reserveA, reserveB, lpSupply } = pool;

  const calculation = useMemo(() => {
    if (percentage === 0 || userLpBalance.isZero()) return null;

    const lpAmount = userLpBalance.mul(new BN(percentage)).div(new BN(100));
    const { amountA, amountB } = calculateRemoveLiquidityAmounts(lpAmount, reserveA, reserveB, lpSupply);

    const steps: FormulaStep[] = [
      { label: "Formula", formula: "A_out = (LP × R_A) / S" },
      { label: "Token A", formula: `(${formatTokenAmount(lpAmount)} × ${formatTokenAmount(reserveA)}) / ${formatTokenAmount(lpSupply)}`, value: `${formatTokenAmount(amountA)} ${symbolA}` },
      { label: "Token B", formula: `(${formatTokenAmount(lpAmount)} × ${formatTokenAmount(reserveB)}) / ${formatTokenAmount(lpSupply)}`, value: `${formatTokenAmount(amountB)} ${symbolB}`, highlight: true },
    ];

    return { lpAmount, amountA, amountB, steps };
  }, [percentage, userLpBalance, reserveA, reserveB, lpSupply, symbolA, symbolB]);

  const handleRemove = async () => {
    if (!calculation) return;
    setLoading(true);
    try {
      await onRemoveLiquidity(calculation.lpAmount);
      setPercentage(0);
    } finally {
      setLoading(false);
    }
  };

  // Build ASCII progress bar for percentage
  const barWidth = 20;
  const filledWidth = Math.round((percentage / 100) * barWidth);
  const progressBar = "█".repeat(filledWidth) + "░".repeat(barWidth - filledWidth);

  return (
    <div className="space-y-4">
      {/* Comment */}
      <div className="text-terminal-muted text-xs">
        // remove liquidity: LP → {symbolA} + {symbolB}
      </div>

      {/* LP Balance */}
      <div className="border border-terminal p-3">
        <div className="text-terminal-muted text-xs mb-1">&gt; YOUR_LP_BALANCE:</div>
        <div className="text-xl text-terminal glow">{formatTokenAmount(userLpBalance)} LP</div>
      </div>

      {/* Percentage selector */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-terminal-muted">&gt; AMOUNT_TO_REMOVE:</span>
          <span className="text-terminal glow">{percentage}%</span>
        </div>

        {/* ASCII progress bar */}
        <div className="text-terminal glow text-center">
          [{progressBar}]
        </div>

        {/* Slider */}
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
          className="w-full accent-[#33ff00] bg-terminal-muted"
        />

        {/* Quick select buttons */}
        <div className="flex justify-between gap-2">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              onClick={() => setPercentage(p)}
              className={`flex-1 py-2 text-sm border transition-colors ${
                percentage === p
                  ? "border-terminal text-terminal glow bg-[#33ff00] bg-opacity-10"
                  : "border-terminal-muted text-terminal-muted hover:border-terminal hover:text-terminal"
              }`}
            >
              [ {p}% ]
            </button>
          ))}
        </div>
      </div>

      {/* Output */}
      {calculation && (
        <div className="space-y-3">
          <div className="border border-terminal p-3 space-y-2">
            <div className="text-terminal-muted text-xs">&gt; YOU_WILL_RECEIVE:</div>
            <div className="flex justify-between">
              <span className="text-terminal-muted">{symbolA}:</span>
              <span className="text-terminal glow">{formatTokenAmount(calculation.amountA)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-muted">{symbolB}:</span>
              <span className="text-terminal glow">{formatTokenAmount(calculation.amountB)}</span>
            </div>
          </div>

          <FormulaBreakdown title="REMOVE LIQUIDITY CALCULATION" steps={calculation.steps} />
        </div>
      )}

      <TerminalButton
        variant="destructive"
        onClick={handleRemove}
        disabled={!calculation}
        loading={loading}
        className="w-full"
      >
        REMOVE LIQUIDITY
      </TerminalButton>
    </div>
  );
}
