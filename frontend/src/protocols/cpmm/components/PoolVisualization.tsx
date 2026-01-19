"use client";

import BN from "bn.js";
import { TerminalWindow, AsciiProgressBar } from "@/components/shared";
import { formatTokenAmount } from "../lib/math";

interface Props {
  reserveA: BN;
  reserveB: BN;
  symbolA?: string;
  symbolB?: string;
}

export function PoolVisualization({ reserveA, reserveB, symbolA = "A", symbolB = "B" }: Props) {
  const total = reserveA.add(reserveB);
  const maxReserve = BN.max(reserveA, reserveB);

  const k = reserveA.mul(reserveB);
  const kStr = k.toString();
  const kDisplay = kStr.length > 15
    ? `${kStr.slice(0, 6)}...${kStr.slice(-6)}`
    : Number(kStr).toLocaleString();

  const price = reserveB.isZero() ? "0" : (reserveA.mul(new BN(1e9)).div(reserveB).toNumber() / 1e9).toFixed(4);

  // Convert BN to number for display (divide by 10^9 for decimals)
  const reserveANum = parseFloat(formatTokenAmount(reserveA));
  const reserveBNum = parseFloat(formatTokenAmount(reserveB));
  const maxNum = Math.max(reserveANum, reserveBNum) || 1;

  return (
    <TerminalWindow title="RESERVES" status="ok">
      {/* ASCII Reserve Bars */}
      <div className="space-y-3 mb-4">
        <AsciiProgressBar
          label={symbolA}
          value={reserveANum}
          max={maxNum}
          width={16}
          showPercentage={false}
        />
        <AsciiProgressBar
          label={symbolB}
          value={reserveBNum}
          max={maxNum}
          width={16}
          showPercentage={false}
        />
      </div>

      {/* Divider */}
      <div className="text-terminal-muted text-xs my-4">
        ────────────────────────────────────
      </div>

      {/* K Value and Price */}
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-terminal-muted">// invariant:</span>
          <span className="text-terminal">K = {symbolA} × {symbolB}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-terminal-muted">// K =</span>
          <span className="text-terminal glow">{kDisplay}</span>
        </div>
        <div className="flex items-start gap-2 mt-3">
          <span className="text-terminal-muted">// price:</span>
          <span className="text-terminal">1 {symbolA} = {price} {symbolB}</span>
        </div>
      </div>
    </TerminalWindow>
  );
}
