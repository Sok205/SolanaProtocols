"use client";

import BN from "bn.js";
import { MathDisplay } from "@/components/shared";

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

  return (
    <div className={`rounded-lg p-3 ${preserved ? "bg-green-900/20" : "bg-red-900/20"}`}>
      <div className="flex items-center gap-2 text-sm">
        <MathDisplay formula="k = x \times y" />
        <span className={preserved ? "text-green-400" : "text-red-400"}>
          {preserved ? "Preserved" : "Warning: k decreased"}
        </span>
      </div>
      <div className="text-xs text-gray-400 mt-1">
        Change: {changePercent >= 0 ? "+" : ""}{changePercent.toFixed(4)}%
      </div>
    </div>
  );
}
