"use client";

import Link from "next/link";
import { useCpmmPools } from "../hooks/useCpmmPools";
import { PoolVisualization } from "../components/PoolVisualization";
import { WalletButton } from "@/components/wallet/WalletButton";

export function PoolExplorer() {
  const { pools, loading, error, refresh } = useCpmmPools();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">CPMM Pools</h1>
          <p className="text-gray-400 mt-1">Explore constant product liquidity pools</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/protocols/cpmm/learn"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Learn CPMM
          </Link>
          <WalletButton />
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400">Loading pools...</div>
      )}

      {error && (
        <div className="bg-red-900/20 text-red-400 rounded-lg p-4 mb-4">
          {error}
          <button onClick={refresh} className="ml-4 underline">
            Retry
          </button>
        </div>
      )}

      {!loading && pools.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No pools found on devnet. Create one to get started!
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {pools.map((pool) => (
          <Link
            key={pool.publicKey.toBase58()}
            href={`/protocols/cpmm/pool/${pool.publicKey.toBase58()}`}
            className="block bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors"
          >
            <div className="text-sm text-gray-400 mb-2 font-mono">
              {pool.publicKey.toBase58().slice(0, 8)}...
            </div>
            <PoolVisualization
              reserveA={pool.reserveA}
              reserveB={pool.reserveB}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
