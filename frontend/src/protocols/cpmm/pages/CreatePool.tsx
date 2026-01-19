"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { PublicKey } from "@solana/web3.js";
import { useCpmmClient } from "../hooks/useCpmmClient";
import { useCreateDemoPool } from "../hooks/useCreateDemoPool";
import { WalletButton } from "@/components/wallet/WalletButton";
import { TerminalWindow, TerminalButton, StatusIndicator } from "@/components/shared";
import Link from "next/link";

function TerminalInput({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`py-2 cursor-text ${disabled ? "opacity-50" : ""}`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2">
        <span className="text-terminal-muted">&gt;</span>
        <span className="text-terminal uppercase">{label}:</span>
        <div className="flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-terminal glow outline-none disabled:text-terminal-muted min-w-0 text-sm"
          />
          {isFocused && (
            <span className="w-2 h-4 bg-terminal animate-blink ml-0.5" />
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/protocols/cpmm"
          className="text-terminal-muted hover:text-terminal text-sm"
        >
          &lt; cd ../pools
        </Link>
        <h1 className="text-xl uppercase glow">CREATE POOL</h1>
      </div>

      {/* Quick Start Section */}
      <TerminalWindow title="QUICK START" status={demoPool.loading ? "wait" : demoPool.result ? "ok" : "none"}>
        <div className="text-terminal-muted text-sm mb-4">
          // create a demo pool with test tokens for experimentation
        </div>

        <div className="text-terminal text-sm mb-4">
          &gt; ./create-demo-pool --tokens ALPHA,BETA --liquidity 1000
        </div>

        {/* Loading State */}
        {demoPool.loading && demoPool.progress && (
          <div className="border border-terminal p-3 mb-4 space-y-2">
            <div className="flex items-center gap-2">
              <StatusIndicator status="wait" />
              <span className="text-terminal-amber">{demoPool.progress.step}</span>
            </div>
            {demoPool.progress.completed.length > 0 && (
              <div className="space-y-1 text-sm">
                {demoPool.progress.completed.map((step, index) => (
                  <div key={index} className="text-terminal">
                    [OK] {step}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {demoPool.error && (
          <div className="border border-terminal-error p-3 mb-4">
            <div className="text-terminal-error glow-error">
              [ERR] {demoPool.error}
            </div>
          </div>
        )}

        {/* Success State */}
        {demoPool.result && (
          <div className="border border-terminal p-3 mb-4 space-y-3">
            <div className="text-terminal glow">[OK] Demo pool created successfully!</div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-terminal-muted">TOKEN_A:</div>
              <div className="text-terminal">{demoPool.result.tokenA.symbol}</div>

              <div className="text-terminal-muted">TOKEN_B:</div>
              <div className="text-terminal">{demoPool.result.tokenB.symbol}</div>

              <div className="text-terminal-muted">POOL_RESERVES:</div>
              <div className="text-terminal">
                {formatTokenAmount(demoPool.result.poolReserveA)} / {formatTokenAmount(demoPool.result.poolReserveB)}
              </div>

              <div className="text-terminal-muted">YOUR_BALANCE:</div>
              <div className="text-terminal">
                {formatTokenAmount(demoPool.result.userBalanceA)} / {formatTokenAmount(demoPool.result.userBalanceB)}
              </div>

              <div className="text-terminal-muted">LP_TOKENS:</div>
              <div className="text-terminal glow">{formatTokenAmount(demoPool.result.lpTokens)}</div>
            </div>

            <div className="flex gap-2 pt-2">
              <Link
                href={`/protocols/cpmm/pool/${demoPool.result.pool.publicKey.toBase58()}`}
                className="flex-1"
              >
                <TerminalButton className="w-full">GO TO POOL</TerminalButton>
              </Link>
              <TerminalButton variant="secondary" onClick={demoPool.reset}>
                CREATE ANOTHER
              </TerminalButton>
            </div>
          </div>
        )}

        {/* Idle State */}
        {!demoPool.loading && !demoPool.result && (
          <>
            {!connected ? (
              <div className="py-4 text-center">
                <div className="text-terminal-muted mb-4">// wallet not connected</div>
                <WalletButton />
              </div>
            ) : (
              <TerminalButton onClick={demoPool.create} className="w-full">
                EXECUTE DEMO
              </TerminalButton>
            )}
          </>
        )}
      </TerminalWindow>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 border-t border-terminal-muted"></div>
        <span className="text-terminal-muted text-xs">═══════════ OR ═══════════</span>
        <div className="flex-1 border-t border-terminal-muted"></div>
      </div>

      {/* Manual Creation */}
      <TerminalWindow title="MANUAL CONFIGURATION" status={result ? "ok" : error ? "error" : "none"}>
        <div className="text-terminal-muted text-sm mb-4">
          // initialize pool with existing SPL token mints
        </div>

        <TerminalInput
          label="TOKEN_A_MINT"
          value={tokenAMint}
          onChange={setTokenAMint}
          placeholder="So11111111111111111111111111111111111111112"
          disabled={loading}
        />

        <TerminalInput
          label="TOKEN_B_MINT"
          value={tokenBMint}
          onChange={setTokenBMint}
          placeholder="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
          disabled={loading}
        />

        {/* Error */}
        {error && (
          <div className="border border-terminal-error p-3 my-4">
            <div className="text-terminal-error glow-error">[ERR] {error}</div>
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="border border-terminal p-3 my-4 space-y-2">
            <div className="text-terminal glow">[OK] Pool created successfully!</div>
            <div className="text-sm">
              <div className="flex gap-2">
                <span className="text-terminal-muted">POOL_ID:</span>
                <span className="text-terminal break-all">{result.poolId}</span>
              </div>
              <div className="flex gap-2 mt-1">
                <span className="text-terminal-muted">TX_SIG:</span>
                <span className="text-terminal-amber break-all">{result.signature.slice(0, 32)}...</span>
              </div>
            </div>
            <Link
              href={`/protocols/cpmm/pool/${result.poolId}`}
              className="text-terminal hover:underline text-sm mt-2 inline-block"
            >
              &gt; ./pool/{result.poolId.slice(0, 8)}...
            </Link>
          </div>
        )}

        {/* Submit */}
        {!connected ? (
          <div className="py-4 text-center">
            <div className="text-terminal-muted mb-4">// wallet not connected</div>
            <WalletButton />
          </div>
        ) : (
          <TerminalButton
            onClick={handleCreate}
            disabled={!isValid}
            loading={loading}
            className="w-full mt-4"
          >
            INITIALIZE POOL
          </TerminalButton>
        )}

        {/* Info */}
        <div className="mt-6 pt-4 border-t border-terminal space-y-2 text-sm text-terminal-muted">
          <div>// what happens when you create a pool:</div>
          <div className="pl-3">1. Pool account initialized on-chain</div>
          <div className="pl-3">2. Token vaults created for both tokens</div>
          <div className="pl-3">3. LP token mint created</div>
          <div className="pl-3">4. Pool starts with zero liquidity</div>
        </div>
      </TerminalWindow>
    </div>
  );
}
