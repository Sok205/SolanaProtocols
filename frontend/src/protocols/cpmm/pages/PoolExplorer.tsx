"use client";

import Link from "next/link";
import { useCpmmPools } from "../hooks/useCpmmPools";
import { WalletButton } from "@/components/wallet/WalletButton";
import { TerminalButton, TerminalWindow, StatusIndicator } from "@/components/shared";
import { formatTokenAmount } from "../lib/math";

export function PoolExplorer() {
  const { pools, loading, error, refresh } = useCpmmPools();

  const formatK = (reserveA: { mul: (b: unknown) => { toString: () => string } }, reserveB: unknown) => {
    const k = reserveA.mul(reserveB);
    const kStr = k.toString();
    if (kStr.length > 12) {
      return `${kStr.slice(0, 3)}...${kStr.slice(-3)} (${kStr.length} digits)`;
    }
    return Number(kStr).toLocaleString();
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl uppercase glow">CPMM POOLS</h1>
          <p className="text-terminal-muted text-sm mt-1">
            Constant Product Market Maker pools on devnet
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/protocols/cpmm/learn">
            <TerminalButton variant="secondary">LEARN</TerminalButton>
          </Link>
          <Link href="/protocols/cpmm/create">
            <TerminalButton variant="primary">CREATE POOL</TerminalButton>
          </Link>
          <WalletButton />
        </div>
      </div>

      {/* Main content */}
      <TerminalWindow
        title={`POOLS ${pools.length > 0 ? `[${pools.length} FOUND]` : ""}`}
        status={loading ? "wait" : error ? "error" : "ok"}
      >
        {/* Command prompt */}
        <div className="text-terminal-muted mb-4">
          &gt; ls -la ./pools
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-8 text-center">
            <StatusIndicator status="wait" message="Fetching pools from devnet..." />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="py-4">
            <div className="text-terminal-error glow-error mb-2">
              [ERR] {error}
            </div>
            <button
              onClick={refresh}
              className="text-terminal hover:underline text-sm"
            >
              &gt; retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && pools.length === 0 && (
          <div className="py-8 text-center text-terminal-muted">
            <div className="mb-2">[...] No pools found on devnet</div>
            <div className="text-sm">Create one to get started</div>
          </div>
        )}

        {/* Pool list */}
        {!loading && pools.length > 0 && (
          <div className="space-y-4">
            {pools.map((pool, index) => (
              <Link
                key={pool.publicKey.toBase58()}
                href={`/protocols/cpmm/pool/${pool.publicKey.toBase58()}`}
                className="block border border-terminal p-3 hover:bg-[#33ff00] hover:bg-opacity-10 transition-colors group"
              >
                {/* Pool header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-terminal-muted text-xs">POOL_{index + 1}</span>
                  <span className="text-terminal text-xs group-hover:glow">[OK]</span>
                </div>

                {/* Full Pool ID */}
                <div className="mb-3">
                  <span className="text-terminal-amber text-xs font-mono break-all">
                    {pool.publicKey.toBase58()}
                  </span>
                </div>

                {/* Reserves */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-terminal-muted text-xs">RESERVE_A: </span>
                    <span className="text-terminal glow">{formatTokenAmount(pool.reserveA)}</span>
                  </div>
                  <div>
                    <span className="text-terminal-muted text-xs">RESERVE_B: </span>
                    <span className="text-terminal glow">{formatTokenAmount(pool.reserveB)}</span>
                  </div>
                </div>

                {/* K Value */}
                <div className="mt-2 text-xs">
                  <span className="text-terminal-muted">K = </span>
                  <span className="text-terminal-muted">{formatK(pool.reserveA, pool.reserveB)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Refresh button */}
        {!loading && (
          <div className="mt-4 pt-4 border-t border-terminal">
            <button
              onClick={refresh}
              className="text-terminal-muted hover:text-terminal text-sm transition-colors"
            >
              &gt; refresh
            </button>
          </div>
        )}
      </TerminalWindow>
    </div>
  );
}
