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

        {/* Pool table */}
        {!loading && pools.length > 0 && (
          <div className="overflow-x-auto">
            {/* Header row */}
            <div className="grid grid-cols-[120px_1fr_1fr_100px_60px] gap-2 text-terminal-muted text-xs uppercase border-b border-terminal pb-2 mb-2 min-w-[500px]">
              <span>POOL_ID</span>
              <span>RESERVE_A</span>
              <span>RESERVE_B</span>
              <span>K_VALUE</span>
              <span>STATUS</span>
            </div>

            {/* Pool rows */}
            <div className="space-y-1 min-w-[500px]">
              {pools.map((pool) => (
                <Link
                  key={pool.publicKey.toBase58()}
                  href={`/protocols/cpmm/pool/${pool.publicKey.toBase58()}`}
                  className="grid grid-cols-[120px_1fr_1fr_100px_60px] gap-2 py-2 hover:bg-[#33ff00] hover:bg-opacity-10 transition-colors group hover:no-underline"
                >
                  <span className="text-terminal-amber text-sm truncate">
                    {pool.publicKey.toBase58().slice(0, 8)}...
                  </span>
                  <span className="text-terminal glow text-sm">
                    {formatTokenAmount(pool.reserveA)}
                  </span>
                  <span className="text-terminal glow text-sm">
                    {formatTokenAmount(pool.reserveB)}
                  </span>
                  <span className="text-terminal-muted text-sm truncate">
                    {formatK(pool.reserveA, pool.reserveB)}
                  </span>
                  <span className="text-terminal group-hover:glow text-sm">
                    [OK]
                  </span>
                </Link>
              ))}
            </div>
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
