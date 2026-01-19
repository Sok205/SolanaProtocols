"use client";

import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useCpmmClient } from "../hooks/useCpmmClient";
import { useCreateDemoPool } from "../hooks/useCreateDemoPool";
import { WalletButton } from "@/components/wallet/WalletButton";
import Link from "next/link";

export function CreatePool() {
  const { client, connected } = useCpmmClient();
  const demoPool = useCreateDemoPool();

  const [tokenAMint, setTokenAMint] = useState("");
  const [tokenBMint, setTokenBMint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ poolId: string; signature: string } | null>(null);

  const handleCreate = async () => {
    if (!client) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const mintA = new PublicKey(tokenAMint.trim());
      const mintB = new PublicKey(tokenBMint.trim());

      const { pool, signature } = await client.initializePool(mintA, mintB);

      setResult({
        poolId: pool.publicKey.toBase58(),
        signature,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create pool");
    } finally {
      setLoading(false);
    }
  };

  const isValid = tokenAMint.length > 0 && tokenBMint.length > 0;

  // Format BN values for display (divide by 10^9 for decimals)
  const formatTokenAmount = (amount: { toString: () => string }) => {
    const str = amount.toString();
    if (str.length <= 9) {
      return "0." + str.padStart(9, "0").replace(/0+$/, "") || "0";
    }
    const intPart = str.slice(0, -9);
    const decPart = str.slice(-9).replace(/0+$/, "");
    return decPart ? `${intPart}.${decPart}` : intPart;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/protocols/cpmm"
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold">Create Pool</h1>
      </div>

      {/* Quick Start Section */}
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-800/50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Quick Start</h2>
        <p className="text-gray-400 mb-4">
          New to CPMM? Create a demo pool with test tokens to start experimenting immediately.
        </p>

        {/* Loading State with Progress */}
        {demoPool.loading && demoPool.progress && (
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-blue-400">{demoPool.progress.step}</span>
            </div>
            {demoPool.progress.completed.length > 0 && (
              <div className="space-y-1">
                {demoPool.progress.completed.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-green-400">
                    <span>✓</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {demoPool.error && (
          <div className="bg-red-900/20 text-red-400 rounded-lg p-4 mb-4">
            {demoPool.error}
          </div>
        )}

        {/* Success State */}
        {demoPool.result && (
          <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4 mb-4">
            <p className="font-semibold text-green-400 mb-3">Demo pool created successfully!</p>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-400">Token A:</span>
                <span className="ml-2 text-white">{demoPool.result.tokenA.symbol}</span>
              </div>
              <div>
                <span className="text-gray-400">Token B:</span>
                <span className="ml-2 text-white">{demoPool.result.tokenB.symbol}</span>
              </div>
              <div>
                <span className="text-gray-400">Pool Reserves:</span>
                <span className="ml-2 text-white">
                  {formatTokenAmount(demoPool.result.poolReserveA)} / {formatTokenAmount(demoPool.result.poolReserveB)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Your Balance:</span>
                <span className="ml-2 text-white">
                  {formatTokenAmount(demoPool.result.userBalanceA)} / {formatTokenAmount(demoPool.result.userBalanceB)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">LP Tokens Received:</span>
                <span className="ml-2 text-white">{formatTokenAmount(demoPool.result.lpTokens)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/protocols/cpmm/pool/${demoPool.result.pool.publicKey.toBase58()}`}
                className="flex-1 text-center py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
              >
                Go to Pool →
              </Link>
              <button
                onClick={demoPool.reset}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        )}

        {/* Idle State - Show Button or Connect Wallet */}
        {!demoPool.loading && !demoPool.result && (
          <>
            {!connected ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <p className="text-gray-400">Connect your wallet to create a demo pool</p>
                <WalletButton />
              </div>
            ) : (
              <button
                onClick={demoPool.create}
                disabled={demoPool.loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 rounded-lg font-semibold transition-all"
              >
                🎲 Create Demo Pool
              </button>
            )}
          </>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 border-t border-gray-700"></div>
        <span className="text-gray-500 text-sm">or enter existing token mints</span>
        <div className="flex-1 border-t border-gray-700"></div>
      </div>

      {/* Existing Manual Creation Form */}
      <div className="bg-gray-900 rounded-lg p-6">
        <p className="text-gray-400 mb-6">
          Initialize a new CPMM pool with two SPL tokens. You&apos;ll need the mint
          addresses for both tokens.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Token A Mint Address
            </label>
            <input
              type="text"
              value={tokenAMint}
              onChange={(e) => setTokenAMint(e.target.value)}
              placeholder="e.g., So11111111111111111111111111111111111111112"
              className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Token B Mint Address
            </label>
            <input
              type="text"
              value={tokenBMint}
              onChange={(e) => setTokenBMint(e.target.value)}
              placeholder="e.g., EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
              className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-900/20 text-red-400 rounded-lg p-4">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-green-900/20 text-green-400 rounded-lg p-4">
              <p className="font-semibold mb-2">Pool created successfully!</p>
              <p className="text-sm font-mono break-all">
                Pool ID: {result.poolId}
              </p>
              <p className="text-sm font-mono break-all mt-1">
                Signature: {result.signature}
              </p>
              <Link
                href={`/protocols/cpmm/pool/${result.poolId}`}
                className="inline-block mt-4 text-blue-400 hover:text-blue-300"
              >
                View Pool →
              </Link>
            </div>
          )}

          {!connected ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-gray-400">Connect your wallet to create a pool</p>
              <WalletButton />
            </div>
          ) : (
            <button
              onClick={handleCreate}
              disabled={!isValid || loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-semibold transition-colors"
            >
              {loading ? "Creating..." : "Create Pool"}
            </button>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <h3 className="font-semibold mb-3">What happens when you create a pool:</h3>
          <ol className="list-decimal list-inside text-gray-400 space-y-2 text-sm">
            <li>A new Pool account is created on-chain</li>
            <li>Token vaults are initialized for both tokens</li>
            <li>An LP token mint is created (you&apos;ll receive LP tokens when adding liquidity)</li>
            <li>The pool starts with zero liquidity - add tokens to enable trading</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
