"use client";

import { useState, useMemo } from "react";
import BN from "bn.js";
import { TokenInput, FormulaBreakdown, FormulaStep, TerminalButton, StatusIndicator } from "@/components/shared";
import { KValueMonitor } from "./KValueMonitor";
import { calculateSwapOutput, calculatePriceImpact, parseTokenAmount, formatTokenAmount } from "../lib/math";
import { PoolData } from "../lib/client";

interface Props {
  pool: PoolData;
  onSwap: (amountIn: BN, aToB: boolean) => Promise<void>;
  symbolA?: string;
  symbolB?: string;
  balanceA?: string;
  balanceB?: string;
}

export function SwapPanel({ pool, onSwap, symbolA = "A", symbolB = "B", balanceA, balanceB }: Props) {
  const [amountIn, setAmountIn] = useState("");
  const [aToB, setAToB] = useState(true);
  const [loading, setLoading] = useState(false);

  const { reserveA, reserveB } = pool;
  const [reserveIn, reserveOut] = aToB ? [reserveA, reserveB] : [reserveB, reserveA];
  const [symbolIn, symbolOut] = aToB ? [symbolA, symbolB] : [symbolB, symbolA];
  const balanceIn = aToB ? balanceA : balanceB;

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
        formula: "out = (in × R_out) / (R_in + in)"
      },
      {
        label: "Values",
        formula: `(${amountIn} × ${formatTokenAmount(reserveOut)}) / (${formatTokenAmount(reserveIn)} + ${amountIn})`
      },
      {
        label: "Result",
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
      {/* Direction indicator */}
      <div className="text-terminal-muted text-xs">
        // swap direction: {symbolIn} → {symbolOut}
      </div>

      {/* Input */}
      <TokenInput
        label={`FROM (${symbolIn})`}
        value={amountIn}
        onChange={setAmountIn}
        symbol={symbolIn}
        balance={balanceIn}
      />

      {/* Flip button */}
      <button
        onClick={handleFlip}
        className="w-full py-2 text-terminal-muted hover:text-terminal transition-colors text-sm border border-terminal-muted hover:border-terminal"
      >
        [ ↕ FLIP DIRECTION ]
      </button>

      {/* Output display */}
      <div className="border border-terminal p-3">
        <div className="text-terminal-muted text-xs mb-1">&gt; TO ({symbolOut}):</div>
        <div className="text-xl text-terminal glow">
          {calculation ? formatTokenAmount(calculation.output) : "0.0"} {symbolOut}
        </div>
      </div>

      {/* Calculation details */}
      {calculation && (
        <div className="space-y-3">
          <FormulaBreakdown title="SWAP CALCULATION" steps={calculation.steps} />

          <KValueMonitor kBefore={calculation.kBefore} kAfter={calculation.kAfter} />

          {calculation.priceImpact > 1 && (
            <div className="border border-terminal-amber p-3 flex items-center justify-between">
              <span className="text-terminal-amber">PRICE_IMPACT:</span>
              <span className="text-terminal-amber glow-amber">
                {calculation.priceImpact.toFixed(2)}% <StatusIndicator status="info" />
              </span>
            </div>
          )}
        </div>
      )}

      {/* Execute button */}
      <TerminalButton
        onClick={handleSwap}
        disabled={!calculation}
        loading={loading}
        className="w-full"
      >
        EXECUTE SWAP
      </TerminalButton>
    </div>
  );
}
