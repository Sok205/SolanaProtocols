"use client";

import BN from "bn.js";
import { StatusIndicator } from "@/components/shared";

interface Props {
  kBefore: BN;
  kAfter: BN;
}

export function KValueMonitor({ kBefore, kAfter }: Props) {
  const preserved = kAfter.gte(kBefore);
  const change = kAfter.sub(kBefore);
  const changePercent = kBefore.isZero()
    ? 0
    : change.mul(new BN(10000)).div(kBefore).toNumber() / 100;

  const formatK = (k: BN) => {
    const str = k.toString();
    if (str.length > 12) {
      return `${str.slice(0, 4)}...${str.slice(-4)}`;
    }
    return Number(str).toLocaleString();
  };

  return (
    <div className={`border p-3 ${preserved ? "border-terminal" : "border-terminal-error"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-terminal-muted text-xs uppercase">
          // K invariant check
        </span>
        <StatusIndicator status={preserved ? "ok" : "error"} />
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-terminal-muted">K_BEFORE:</span>
          <span className="text-terminal">{formatK(kBefore)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-terminal-muted">K_AFTER:</span>
          <span className={preserved ? "text-terminal glow" : "text-terminal-error glow-error"}>
            {formatK(kAfter)}
          </span>
        </div>
        <div className="flex justify-between pt-1 border-t border-terminal mt-2">
          <span className="text-terminal-muted">STATUS:</span>
          <span className={preserved ? "text-terminal" : "text-terminal-error"}>
            {preserved ? "INVARIANT PRESERVED" : "WARNING: K DECREASED"}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-terminal-muted">CHANGE:</span>
          <span className={preserved ? "text-terminal-muted" : "text-terminal-error"}>
            {changePercent >= 0 ? "+" : ""}{changePercent.toFixed(4)}%
          </span>
        </div>
      </div>
    </div>
  );
}
