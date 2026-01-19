"use client";

import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useCpmmClient } from "../hooks/useCpmmClient";
import { WalletButton } from "@/components/wallet/WalletButton";
import Link from "next/link";

export function CreatePool() {
  const { client, connected } = useCpmmClient();

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
