"use client";

import BN from "bn.js";
import { MathDisplay } from "@/components/shared";
import { formatTokenAmount } from "../lib/math";

interface Props {
  reserveA: BN;
  reserveB: BN;
  symbolA?: string;
  symbolB?: string;
}

export function PoolVisualization({ reserveA, reserveB, symbolA = "A", symbolB = "B" }: Props) {
  const total = reserveA.add(reserveB);
  const percentA = total.isZero() ? 50 : reserveA.mul(new BN(100)).div(total).toNumber();
  const percentB = 100 - percentA;

  const k = reserveA.mul(reserveB);
  const price = reserveB.isZero() ? "0" : (reserveA.mul(new BN(1e9)).div(reserveB).toNumber() / 1e9).toFixed(4);

  return (
    <div className="bg-gray-900 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-medium">Pool Reserves</h3>

      {/* Reserve bars */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{symbolA}</span>
          <span className="font-mono">{formatTokenAmount(reserveA)}</span>
        </div>
        <div className="h-4 bg-gray-800 rounded overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${percentA}%` }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span>{symbolB}</span>
          <span className="font-mono">{formatTokenAmount(reserveB)}</span>
        </div>
        <div className="h-4 bg-gray-800 rounded overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${percentB}%` }}
          />
        </div>
      </div>

      {/* K value and price */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800">
        <div>
          <span className="text-gray-400 text-sm">Constant k</span>
          <div className="flex items-center gap-2">
            <MathDisplay formula="x \times y = k" />
          </div>
          <span className="font-mono text-xs text-gray-500 break-all">
            {k.toString().slice(0, 20)}...
          </span>
        </div>
        <div>
          <span className="text-gray-400 text-sm">Price</span>
          <div className="font-mono">
            1 {symbolA} = {price} {symbolB}
          </div>
        </div>
      </div>
    </div>
  );
}
