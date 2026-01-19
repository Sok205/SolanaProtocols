"use client";

import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCpmmClient } from "./useCpmmClient";
import {
  createDemoPool,
  DemoPoolResult,
  DemoPoolProgress,
} from "../lib/demo-pool";

export interface UseCreateDemoPoolReturn {
  create: () => Promise<void>;
  loading: boolean;
  progress: DemoPoolProgress | null;
  error: string | null;
  result: DemoPoolResult | null;
  reset: () => void;
}

export function useCreateDemoPool(): UseCreateDemoPoolReturn {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { client } = useCpmmClient();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<DemoPoolProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DemoPoolResult | null>(null);

  const reset = useCallback(() => {
    setLoading(false);
    setProgress(null);
    setError(null);
    setResult(null);
  }, []);

  const create = useCallback(async () => {
    // Validate wallet and client
    if (!client) {
      setError("CPMM client not available");
      return;
    }

    if (!wallet.publicKey) {
      setError("Wallet not connected");
      return;
    }

    if (!wallet.signTransaction) {
      setError("Wallet does not support signing transactions");
      return;
    }

    if (!wallet.signAllTransactions) {
      setError("Wallet does not support signing multiple transactions");
      return;
    }

    // Clear previous state and start loading
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(null);

    try {
      const demoResult = await createDemoPool(
        client,
        connection,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
          signAllTransactions: wallet.signAllTransactions,
        },
        setProgress
      );

      setResult(demoResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [client, connection, wallet]);

  return {
    create,
    loading,
    progress,
    error,
    result,
    reset,
  };
}
