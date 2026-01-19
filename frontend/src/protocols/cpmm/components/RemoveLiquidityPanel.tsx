"use client";

import { useState, useMemo } from "react";
import BN from "bn.js";
import { FormulaBreakdown, FormulaStep } from "@/components/shared";
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
      { label: "Formula", formula: "A_{out} = \\frac{LP \\times R_A}{S}" },
      { label: "Token A", formula: `\\frac{${formatTokenAmount(lpAmount)} \\times ${formatTokenAmount(reserveA)}}{${formatTokenAmount(lpSupply)}}`, value: `${formatTokenAmount(amountA)} ${symbolA}` },
      { label: "Token B", formula: `\\frac{${formatTokenAmount(lpAmount)} \\times ${formatTokenAmount(reserveB)}}{${formatTokenAmount(lpSupply)}}`, value: `${formatTokenAmount(amountB)} ${symbolB}`, highlight: true },
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

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-lg p-4">
        <span className="text-sm text-gray-400">Your LP Balance</span>
        <div className="text-xl font-mono mt-1">{formatTokenAmount(userLpBalance)} LP</div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Amount to remove</span>
          <span className="font-mono">{percentage}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between gap-2">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              onClick={() => setPercentage(p)}
              className={`flex-1 py-1 rounded text-sm ${
                percentage === p ? "bg-purple-600" : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
      </div>

      {calculation && (
        <>
          <div className="bg-gray-900 rounded-lg p-4 space-y-2">
            <span className="text-sm text-gray-400">You will receive</span>
            <div className="flex justify-between">
              <span>{symbolA}</span>
              <span className="font-mono">{formatTokenAmount(calculation.amountA)}</span>
            </div>
            <div className="flex justify-between">
              <span>{symbolB}</span>
              <span className="font-mono">{formatTokenAmount(calculation.amountB)}</span>
            </div>
          </div>

          <FormulaBreakdown title="Remove Liquidity Calculation" steps={calculation.steps} />
        </>
      )}

      <button
        onClick={handleRemove}
        disabled={!calculation || loading}
        className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
      >
        {loading ? "Removing..." : "Remove Liquidity"}
      </button>
    </div>
  );
}
