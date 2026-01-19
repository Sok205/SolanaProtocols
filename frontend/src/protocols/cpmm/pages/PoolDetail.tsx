"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import BN from "bn.js";
import { getAssociatedTokenAddressSync, getAccount } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { useCpmmPool } from "../hooks/useCpmmPool";
import { useCpmmClient } from "../hooks/useCpmmClient";
import { PoolVisualization } from "../components/PoolVisualization";
import { SwapPanel } from "../components/SwapPanel";
import { AddLiquidityPanel } from "../components/AddLiquidityPanel";
import { RemoveLiquidityPanel } from "../components/RemoveLiquidityPanel";
import { WalletButton } from "@/components/wallet/WalletButton";
import { TerminalWindow, StatusIndicator } from "@/components/shared";
import { formatTokenAmount } from "../lib/math";

interface Props {
  poolId: string;
}

type Tab = "swap" | "add" | "remove";

interface TxResult {
  signature: string;
  type: "swap" | "add" | "remove";
}

const getSolscanUrl = (signature: string) =>
  `https://solscan.io/tx/${signature}?cluster=devnet`;

export function PoolDetail({ poolId }: Props) {
  const { pool, loading, error, refresh } = useCpmmPool(poolId);
  const { client, connected, publicKey } = useCpmmClient();
  const { connection } = useConnection();
  const [activeTab, setActiveTab] = useState<Tab>("swap");
  const [balanceA, setBalanceA] = useState<BN>(new BN(0));
  const [balanceB, setBalanceB] = useState<BN>(new BN(0));
  const [userLpBalance, setUserLpBalance] = useState<BN>(new BN(0));
  const [lastTx, setLastTx] = useState<TxResult | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!pool || !publicKey) return;

    try {
      const userTokenA = getAssociatedTokenAddressSync(pool.tokenAMint, publicKey);
      const userTokenB = getAssociatedTokenAddressSync(pool.tokenBMint, publicKey);
      const userLpAccount = getAssociatedTokenAddressSync(pool.lpTokenMint, publicKey);

      const [accA, accB, accLp] = await Promise.allSettled([
        getAccount(connection, userTokenA),
        getAccount(connection, userTokenB),
        getAccount(connection, userLpAccount),
      ]);

      setBalanceA(accA.status === "fulfilled" ? new BN(accA.value.amount.toString()) : new BN(0));
      setBalanceB(accB.status === "fulfilled" ? new BN(accB.value.amount.toString()) : new BN(0));
      setUserLpBalance(accLp.status === "fulfilled" ? new BN(accLp.value.amount.toString()) : new BN(0));
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    }
  }, [pool, publicKey, connection]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const handleSwap = async (amountIn: BN, aToB: boolean) => {
    if (!client || !pool || !publicKey) return;

    const userTokenA = getAssociatedTokenAddressSync(pool.tokenAMint, publicKey);
    const userTokenB = getAssociatedTokenAddressSync(pool.tokenBMint, publicKey);

    try {
      const sig = await client.swap(pool, amountIn, aToB, userTokenA, userTokenB);
      console.log("Swap successful:", sig);
      setLastTx({ signature: sig, type: "swap" });
      await Promise.all([refresh(), fetchBalances()]);
    } catch (err) {
      console.error("Swap failed:", err);
      setLastTx(null);
    }
  };

  const handleAddLiquidity = async (amountA: BN, amountB: BN) => {
    if (!client || !pool || !publicKey) return;

    const userTokenA = getAssociatedTokenAddressSync(pool.tokenAMint, publicKey);
    const userTokenB = getAssociatedTokenAddressSync(pool.tokenBMint, publicKey);
    const userLpAccount = getAssociatedTokenAddressSync(pool.lpTokenMint, publicKey);

    try {
      const sig = await client.addLiquidity(pool, amountA, amountB, userTokenA, userTokenB, userLpAccount);
      console.log("Add liquidity successful:", sig);
      setLastTx({ signature: sig, type: "add" });
      await Promise.all([refresh(), fetchBalances()]);
    } catch (err) {
      console.error("Add liquidity failed:", err);
      setLastTx(null);
    }
  };

  const handleRemoveLiquidity = async (lpAmount: BN) => {
    if (!client || !pool || !publicKey) return;

    const userTokenA = getAssociatedTokenAddressSync(pool.tokenAMint, publicKey);
    const userTokenB = getAssociatedTokenAddressSync(pool.tokenBMint, publicKey);
    const userLpAccount = getAssociatedTokenAddressSync(pool.lpTokenMint, publicKey);

    try {
      const sig = await client.removeLiquidity(pool, lpAmount, userTokenA, userTokenB, userLpAccount);
      console.log("Remove liquidity successful:", sig);
      setLastTx({ signature: sig, type: "remove" });
      await Promise.all([refresh(), fetchBalances()]);
    } catch (err) {
      console.error("Remove liquidity failed:", err);
      setLastTx(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="py-12 text-center">
          <StatusIndicator status="wait" message="Loading pool data..." />
        </div>
      </div>
    );
  }

  if (error || !pool) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <TerminalWindow title="ERROR" status="error">
          <div className="text-terminal-error glow-error mb-4">
            [ERR] {error || "Pool not found"}
          </div>
          <Link href="/protocols/cpmm" className="text-terminal hover:underline">
            &lt; cd ../pools
          </Link>
        </TerminalWindow>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "swap", label: "--swap" },
    { id: "add", label: "--add" },
    { id: "remove", label: "--remove" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <Link href="/protocols/cpmm" className="text-terminal-muted hover:text-terminal text-sm">
            &lt; cd ../pools
          </Link>
          <h1 className="text-lg uppercase glow mt-2">POOL DETAIL</h1>
          <p className="text-terminal-amber text-sm font-mono">
            {poolId.slice(0, 16)}...
          </p>
        </div>
        <WalletButton />
      </div>

      {/* Main split pane layout */}
      <div className="border border-terminal">
        {/* Title bar */}
        <div className="border-b border-terminal px-4 py-2 flex items-center justify-between">
          <span className="text-terminal uppercase text-sm glow">
            +--- POOL {poolId.slice(0, 8)}... [ACTIVE] ---+
          </span>
          <StatusIndicator status="ok" />
        </div>

        {/* Split content */}
        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#1a4d1a]">
          {/* Left pane: Pool visualization */}
          <div className="p-4">
            <PoolVisualization reserveA={pool.reserveA} reserveB={pool.reserveB} />
          </div>

          {/* Right pane: Actions */}
          <div className="p-4">
            {!connected ? (
              <div className="py-8 text-center">
                <div className="text-terminal-muted mb-4">
                  // wallet not connected
                </div>
                <div className="text-terminal-amber glow-amber">
                  Connect wallet to interact with pool
                </div>
              </div>
            ) : (
              <>
                {/* Terminal-style tabs */}
                <div className="flex gap-4 mb-4 border-b border-terminal pb-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`text-sm transition-colors ${
                        activeTab === tab.id
                          ? "text-terminal glow border-b-2 border-terminal"
                          : "text-terminal-muted hover:text-terminal"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                {activeTab === "swap" && (
                  <SwapPanel
                    pool={pool}
                    onSwap={handleSwap}
                    balanceA={formatTokenAmount(balanceA)}
                    balanceB={formatTokenAmount(balanceB)}
                  />
                )}
                {activeTab === "add" && (
                  <AddLiquidityPanel
                    pool={pool}
                    onAddLiquidity={handleAddLiquidity}
                    balanceA={formatTokenAmount(balanceA)}
                    balanceB={formatTokenAmount(balanceB)}
                  />
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

        {/* Transaction result */}
        {lastTx && (
          <div className="border-t border-terminal px-4 py-2 flex items-center justify-between">
            <span className="text-terminal text-xs">
              [OK] {lastTx.type.toUpperCase()} TX: {lastTx.signature.slice(0, 8)}...
            </span>
            <a
              href={getSolscanUrl(lastTx.signature)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-amber hover:underline text-xs glow-amber"
            >
              [ VIEW ON SOLSCAN → ]
            </a>
          </div>
        )}

        {/* Status bar */}
        <div className="border-t border-terminal px-4 py-2 flex items-center justify-between text-xs text-terminal-muted">
          <span>&lt; cd ../pools</span>
          <span>
            {connected ? (
              <span className="text-terminal">[CONNECTED]</span>
            ) : (
              <span className="text-terminal-muted">[DISCONNECTED]</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
