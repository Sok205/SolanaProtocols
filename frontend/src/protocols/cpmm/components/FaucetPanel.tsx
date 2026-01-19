"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getMint } from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
import BN from "bn.js";
import { TerminalButton, StatusIndicator } from "@/components/shared";
import { PoolData } from "../lib/client";
import { buildMintToTransaction } from "@/lib/solana/token-factory";
import { formatTokenAmount } from "../lib/math";

interface Props {
  pool: PoolData;
  balanceA: BN;
  balanceB: BN;
  onMinted: () => Promise<void>;
}

const FAUCET_AMOUNT = 100; // 100 tokens per request
const DECIMALS = 9;

export function FaucetPanel({ pool, balanceA, balanceB, onMinted }: Props) {
  const { connection } = useConnection();
  const { publicKey, signAllTransactions } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isMintAuthority, setIsMintAuthority] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkMintAuthority = async () => {
    if (!publicKey) return;

    setChecking(true);
    try {
      const [mintA, mintB] = await Promise.all([
        getMint(connection, pool.tokenAMint),
        getMint(connection, pool.tokenBMint),
      ]);

      const isAuthorityA = mintA.mintAuthority?.equals(publicKey) ?? false;
      const isAuthorityB = mintB.mintAuthority?.equals(publicKey) ?? false;

      setIsMintAuthority(isAuthorityA && isAuthorityB);
    } catch (err) {
      console.error("Failed to check mint authority:", err);
      setIsMintAuthority(false);
    } finally {
      setChecking(false);
    }
  };

  const handleMint = async () => {
    if (!publicKey || !signAllTransactions) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const amount = BigInt(FAUCET_AMOUNT) * BigInt(10 ** DECIMALS);

      const [txA, txB] = await Promise.all([
        buildMintToTransaction(connection, publicKey, pool.tokenAMint, amount),
        buildMintToTransaction(connection, publicKey, pool.tokenBMint, amount),
      ]);

      const signedTxs = await signAllTransactions([txA, txB]);

      const [sigA, sigB] = await Promise.all([
        connection.sendRawTransaction(signedTxs[0].serialize()),
        connection.sendRawTransaction(signedTxs[1].serialize()),
      ]);

      await Promise.all([
        connection.confirmTransaction(sigA, "confirmed"),
        connection.confirmTransaction(sigB, "confirmed"),
      ]);

      setSuccess(true);
      await onMinted();
    } catch (err: any) {
      console.error("Faucet failed:", err);
      setError(err.message || "Failed to mint tokens");
    } finally {
      setLoading(false);
    }
  };

  // Check authority on mount
  if (isMintAuthority === null && !checking && publicKey) {
    checkMintAuthority();
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-terminal-muted text-xs">
        // faucet: request test tokens
      </div>

      {/* Current balances */}
      <div className="border border-terminal p-3 space-y-2">
        <div className="text-terminal-muted text-xs mb-2">&gt; YOUR_BALANCES:</div>
        <div className="flex justify-between">
          <span className="text-terminal-muted">Token A:</span>
          <span className="text-terminal glow">{formatTokenAmount(balanceA)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-terminal-muted">Token B:</span>
          <span className="text-terminal glow">{formatTokenAmount(balanceB)}</span>
        </div>
      </div>

      {/* Authority check */}
      {checking && (
        <div className="flex items-center gap-2">
          <StatusIndicator status="wait" />
          <span className="text-terminal-muted text-sm">Checking mint authority...</span>
        </div>
      )}

      {isMintAuthority === false && (
        <div className="border border-terminal-error p-3">
          <div className="text-terminal-error text-sm">
            [ERR] You are not the mint authority for these tokens.
          </div>
          <div className="text-terminal-muted text-xs mt-2">
            Only the wallet that created this pool can mint tokens.
          </div>
        </div>
      )}

      {isMintAuthority === true && (
        <>
          {/* Mint info */}
          <div className="border border-terminal-amber p-3">
            <div className="flex items-center gap-2 mb-2">
              <StatusIndicator status="info" />
              <span className="text-terminal-amber text-sm">FAUCET_AMOUNT: {FAUCET_AMOUNT} tokens each</span>
            </div>
            <div className="text-terminal-muted text-xs">
              You are the mint authority. Click below to mint test tokens.
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="border border-terminal-error p-3">
              <span className="text-terminal-error text-sm">[ERR] {error}</span>
            </div>
          )}

          {/* Success display */}
          {success && (
            <div className="border border-terminal p-3">
              <span className="text-terminal text-sm">[OK] Minted {FAUCET_AMOUNT} tokens of each!</span>
            </div>
          )}

          {/* Mint button */}
          <TerminalButton
            onClick={handleMint}
            loading={loading}
            className="w-full"
          >
            MINT {FAUCET_AMOUNT} TOKENS EACH
          </TerminalButton>
        </>
      )}
    </div>
  );
}
