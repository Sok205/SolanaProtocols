"use client";

import { useState, useMemo } from "react";
import BN from "bn.js";
import { TokenInput, FormulaBreakdown, FormulaStep } from "@/components/shared";
import { calculateProportionalLpTokens, parseTokenAmount, formatTokenAmount } from "../lib/math";
import { PoolData } from "../lib/client";

interface Props {
  pool: PoolData;
  onAddLiquidity: (amountA: BN, amountB: BN) => Promise<void>;
  symbolA?: string;
  symbolB?: string;
}

export function AddLiquidityPanel({ pool, onAddLiquidity, symbolA = "A", symbolB = "B" }: Props) {
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [loading, setLoading] = useState(false);

  const { reserveA, reserveB, lpSupply } = pool;
  const isInitialDeposit = lpSupply.isZero();

  const calculation = useMemo(() => {
    if (!amountA || !amountB) return null;

    const inputA = parseTokenAmount(amountA);
    const inputB = parseTokenAmount(amountB);
    const lpTokens = calculateProportionalLpTokens(inputA, inputB, reserveA, reserveB, lpSupply);

    const steps: FormulaStep[] = isInitialDeposit
      ? [
          { label: "Initial deposit formula", formula: "LP = \\sqrt{A \\times B}" },
          { label: "Values", formula: `\\sqrt{${amountA} \\times ${amountB}}` },
          { label: "LP Tokens", formula: formatTokenAmount(lpTokens), value: formatTokenAmount(lpTokens), highlight: true },
        ]
      : [
          { label: "Proportional formula", formula: "LP = \\min\\left(\\frac{A \\times S}{R_A}, \\frac{B \\times S}{R_B}\\right)" },
          { label: "For token A", formula: `\\frac{${amountA} \\times ${formatTokenAmount(lpSupply)}}{${formatTokenAmount(reserveA)}}` },
          { label: "For token B", formula: `\\frac{${amountB} \\times ${formatTokenAmount(lpSupply)}}{${formatTokenAmount(reserveB)}}` },
          { label: "LP Tokens (min)", formula: formatTokenAmount(lpTokens), value: formatTokenAmount(lpTokens), highlight: true },
        ];

    return { lpTokens, steps };
  }, [amountA, amountB, reserveA, reserveB, lpSupply, isInitialDeposit]);

  // Auto-adjust ratio for non-initial deposits
  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    if (!isInitialDeposit && value && !reserveA.isZero()) {
      const inputA = parseTokenAmount(value);
      const proportionalB = inputA.mul(reserveB).div(reserveA);
      setAmountB(formatTokenAmount(proportionalB));
    }
  };

  const handleAmountBChange = (value: string) => {
    setAmountB(value);
    if (!isInitialDeposit && value && !reserveB.isZero()) {
      const inputB = parseTokenAmount(value);
      const proportionalA = inputB.mul(reserveA).div(reserveB);
      setAmountA(formatTokenAmount(proportionalA));
    }
  };

  const handleAdd = async () => {
    if (!amountA || !amountB) return;
    setLoading(true);
    try {
      await onAddLiquidity(parseTokenAmount(amountA), parseTokenAmount(amountB));
      setAmountA("");
      setAmountB("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {isInitialDeposit && (
        <div className="bg-blue-900/20 text-blue-400 rounded-lg p-3 text-sm">
          Initial deposit: you set the price ratio
        </div>
      )}

      <TokenInput
        label={`Token ${symbolA}`}
        value={amountA}
        onChange={handleAmountAChange}
        symbol={symbolA}
      />

      <TokenInput
        label={`Token ${symbolB}`}
        value={amountB}
        onChange={handleAmountBChange}
        symbol={symbolB}
      />

      {calculation && (
        <>
          <div className="bg-gray-900 rounded-lg p-4">
            <span className="text-sm text-gray-400">You will receive</span>
            <div className="text-2xl font-mono mt-1">
              {formatTokenAmount(calculation.lpTokens)} LP
            </div>
          </div>

          <FormulaBreakdown
            title={isInitialDeposit ? "Initial LP Calculation" : "Proportional LP Calculation"}
            steps={calculation.steps}
          />
        </>
      )}

      <button
        onClick={handleAdd}
        disabled={!calculation || loading}
        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
      >
        {loading ? "Adding..." : "Add Liquidity"}
      </button>
    </div>
  );
}
