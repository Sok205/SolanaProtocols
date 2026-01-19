"use client";

import { useState } from "react";
import Link from "next/link";
import BN from "bn.js";
import { useCpmmPool } from "../hooks/useCpmmPool";
import { useCpmmClient } from "../hooks/useCpmmClient";
import { PoolVisualization } from "../components/PoolVisualization";
import { SwapPanel } from "../components/SwapPanel";
import { AddLiquidityPanel } from "../components/AddLiquidityPanel";
import { RemoveLiquidityPanel } from "../components/RemoveLiquidityPanel";
import { WalletButton } from "@/components/wallet/WalletButton";

interface Props {
  poolId: string;
}

type Tab = "swap" | "add" | "remove";

export function PoolDetail({ poolId }: Props) {
  const { pool, loading, error, refresh } = useCpmmPool(poolId);
  const { client, connected } = useCpmmClient();
  const [activeTab, setActiveTab] = useState<Tab>("swap");

  // Placeholder - in real app, fetch from user's token accounts
  const userLpBalance = new BN(0);

  const handleSwap = async (amountIn: BN, aToB: boolean) => {
    if (!client || !pool) return;
    // In real app: get user token accounts, execute swap
    console.log("Swap:", amountIn.toString(), aToB);
    await refresh();
  };

  const handleAddLiquidity = async (amountA: BN, amountB: BN) => {
    if (!client || !pool) return;
    // In real app: get user token accounts, execute add liquidity
    console.log("Add liquidity:", amountA.toString(), amountB.toString());
    await refresh();
  };

  const handleRemoveLiquidity = async (lpAmount: BN) => {
    if (!client || !pool) return;
    // In real app: get user token accounts, execute remove liquidity
    console.log("Remove liquidity:", lpAmount.toString());
    await refresh();
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading pool...</div>;
  }

  if (error || !pool) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-900/20 text-red-400 rounded-lg p-4">
          {error || "Pool not found"}
        </div>
        <Link href="/protocols/cpmm" className="text-purple-400 hover:underline mt-4 inline-block">
          ← Back to pools
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/protocols/cpmm" className="text-purple-400 hover:underline text-sm">
            ← Back to pools
          </Link>
          <h1 className="text-2xl font-bold mt-2">Pool Detail</h1>
          <p className="text-gray-400 font-mono text-sm">{poolId.slice(0, 16)}...</p>
        </div>
        <WalletButton />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Pool visualization */}
        <div>
          <PoolVisualization reserveA={pool.reserveA} reserveB={pool.reserveB} />
        </div>

        {/* Right: Action panels */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          {!connected ? (
            <div className="text-center py-8 text-gray-400">
              Connect wallet to interact with pool
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                {(["swap", "add", "remove"] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-lg capitalize transition-colors ${
                      activeTab === tab
                        ? "bg-purple-600"
                        : "bg-gray-800 hover:bg-gray-700"
                    }`}
                  >
                    {tab === "add" ? "Add Liquidity" : tab === "remove" ? "Remove" : tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === "swap" && (
                <SwapPanel pool={pool} onSwap={handleSwap} />
              )}
              {activeTab === "add" && (
                <AddLiquidityPanel pool={pool} onAddLiquidity={handleAddLiquidity} />
              )}
              {activeTab === "remove" && (
                <RemoveLiquidityPanel
                  pool={pool}
                  userLpBalance={userLpBalance}
                  onRemoveLiquidity={handleRemoveLiquidity}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
