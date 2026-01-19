"use client";

import { useState, useMemo } from "react";
import BN from "bn.js";
import { TokenInput, FormulaBreakdown, FormulaStep } from "@/components/shared";
import { KValueMonitor } from "./KValueMonitor";
import { calculateSwapOutput, calculatePriceImpact, parseTokenAmount, formatTokenAmount } from "../lib/math";
import { PoolData } from "../lib/client";

interface Props {
  pool: PoolData;
  onSwap: (amountIn: BN, aToB: boolean) => Promise<void>;
  symbolA?: string;
  symbolB?: string;
}

export function SwapPanel({ pool, onSwap, symbolA = "A", symbolB = "B" }: Props) {
  const [amountIn, setAmountIn] = useState("");
  const [aToB, setAToB] = useState(true);
  const [loading, setLoading] = useState(false);

  const { reserveA, reserveB } = pool;
  const [reserveIn, reserveOut] = aToB ? [reserveA, reserveB] : [reserveB, reserveA];
  const [symbolIn, symbolOut] = aToB ? [symbolA, symbolB] : [symbolB, symbolA];

  const calculation = useMemo(() => {
    if (!amountIn || parseFloat(amountIn) === 0) return null;

    const input = parseTokenAmount(amountIn);
    const output = calculateSwapOutput(input, reserveIn, reserveOut);
    const priceImpact = calculatePriceImpact(input, reserveIn, reserveOut);

    const kBefore = reserveA.mul(reserveB);
    const newReserveIn = reserveIn.add(input);
    const newReserveOut = reserveOut.sub(output);
    const kAfter = aToB
      ? newReserveIn.mul(newReserveOut)
      : newReserveOut.mul(newReserveIn);

    const steps: FormulaStep[] = [
      {
        label: "Formula",
        formula: "\\text{out} = \\frac{\\text{in} \\times R_{out}}{R_{in} + \\text{in}}"
      },
      {
        label: "Values",
        formula: `\\frac{${amountIn} \\times ${formatTokenAmount(reserveOut)}}{${formatTokenAmount(reserveIn)} + ${amountIn}}`
      },
      {
        label: "Output",
        formula: formatTokenAmount(output),
        value: `${formatTokenAmount(output)} ${symbolOut}`,
        highlight: true
      },
    ];

    return { output, priceImpact, kBefore, kAfter, steps };
  }, [amountIn, reserveIn, reserveOut, reserveA, reserveB, aToB, symbolOut]);

  const handleSwap = async () => {
    if (!amountIn || !calculation) return;
    setLoading(true);
    try {
      const input = parseTokenAmount(amountIn);
      await onSwap(input, aToB);
      setAmountIn("");
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setAToB(!aToB);
    setAmountIn("");
  };

  return (
    <div className="space-y-4">
      <TokenInput
        label={`You pay (${symbolIn})`}
        value={amountIn}
        onChange={setAmountIn}
        symbol={symbolIn}
      />

      <button
        onClick={handleFlip}
        className="w-full py-2 text-gray-400 hover:text-white transition-colors"
      >
        ↕ Flip direction
      </button>

      <div className="bg-gray-900 rounded-lg p-4">
        <span className="text-sm text-gray-400">You receive ({symbolOut})</span>
        <div className="text-2xl font-mono mt-1">
          {calculation ? formatTokenAmount(calculation.output) : "0.0"} {symbolOut}
        </div>
      </div>

      {calculation && (
        <>
          <FormulaBreakdown title="Swap Calculation" steps={calculation.steps} />

          <KValueMonitor kBefore={calculation.kBefore} kAfter={calculation.kAfter} />

          {calculation.priceImpact > 1 && (
            <div className="bg-yellow-900/20 text-yellow-400 rounded-lg p-3 text-sm">
              Price impact: {calculation.priceImpact.toFixed(2)}%
            </div>
          )}
        </>
      )}

      <button
        onClick={handleSwap}
        disabled={!calculation || loading}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
      >
        {loading ? "Swapping..." : "Swap"}
      </button>
    </div>
  );
}
