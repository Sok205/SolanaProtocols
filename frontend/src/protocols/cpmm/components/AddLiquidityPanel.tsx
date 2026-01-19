"use client";

import { useState, useMemo } from "react";
import BN from "bn.js";
import { TokenInput, FormulaBreakdown, FormulaStep, TerminalButton, StatusIndicator } from "@/components/shared";
import { calculateProportionalLpTokens, parseTokenAmount, formatTokenAmount } from "../lib/math";
import { PoolData } from "../lib/client";

interface Props {
  pool: PoolData;
  onAddLiquidity: (amountA: BN, amountB: BN) => Promise<void>;
  symbolA?: string;
  symbolB?: string;
  balanceA?: string;
  balanceB?: string;
}

export function AddLiquidityPanel({ pool, onAddLiquidity, symbolA = "A", symbolB = "B", balanceA, balanceB }: Props) {
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
          { label: "Initial deposit", formula: "LP = sqrt(A × B)" },
          { label: "Values", formula: `sqrt(${amountA} × ${amountB})` },
          { label: "LP Tokens", formula: formatTokenAmount(lpTokens), value: formatTokenAmount(lpTokens), highlight: true },
        ]
      : [
          { label: "Formula", formula: "LP = min((A × S) / R_A, (B × S) / R_B)" },
          { label: "For A", formula: `(${amountA} × ${formatTokenAmount(lpSupply)}) / ${formatTokenAmount(reserveA)}` },
          { label: "For B", formula: `(${amountB} × ${formatTokenAmount(lpSupply)}) / ${formatTokenAmount(reserveB)}` },
          { label: "LP Tokens", formula: formatTokenAmount(lpTokens), value: formatTokenAmount(lpTokens), highlight: true },
        ];

    return { lpTokens, steps };
  }, [amountA, amountB, reserveA, reserveB, lpSupply, isInitialDeposit]);

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
      {/* Initial deposit notice */}
      {isInitialDeposit && (
        <div className="border border-terminal-amber p-3 flex items-center gap-2">
          <StatusIndicator status="info" />
          <span className="text-terminal-amber text-sm">
            Initial deposit: you set the price ratio
          </span>
        </div>
      )}

      {/* Comment */}
      <div className="text-terminal-muted text-xs">
        // add liquidity: {symbolA} + {symbolB} → LP
      </div>

      {/* Inputs */}
      <TokenInput
        label={`DEPOSIT ${symbolA}`}
        value={amountA}
        onChange={handleAmountAChange}
        symbol={symbolA}
        balance={balanceA}
      />

      <TokenInput
        label={`DEPOSIT ${symbolB}`}
        value={amountB}
        onChange={handleAmountBChange}
        symbol={symbolB}
        balance={balanceB}
      />

      {/* Output */}
      {calculation && (
        <div className="space-y-3">
          <div className="border border-terminal p-3">
            <div className="text-terminal-muted text-xs mb-1">&gt; LP_TOKENS_OUT:</div>
            <div className="text-xl text-terminal glow">
              {formatTokenAmount(calculation.lpTokens)} LP
            </div>
          </div>

          <FormulaBreakdown
            title={isInitialDeposit ? "INITIAL LP CALCULATION" : "PROPORTIONAL LP CALCULATION"}
            steps={calculation.steps}
          />
        </div>
      )}

      <TerminalButton
        onClick={handleAdd}
        disabled={!calculation}
        loading={loading}
        className="w-full"
      >
        ADD LIQUIDITY
      </TerminalButton>
    </div>
  );
}
