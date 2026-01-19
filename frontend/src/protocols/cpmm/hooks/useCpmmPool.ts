"use client";

import { useEffect, useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { useCpmmClient } from "./useCpmmClient";
import { PoolData } from "../lib/client";

export function useCpmmPool(poolId: string | null) {
  const { client } = useCpmmClient();
  const [pool, setPool] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!client || !poolId) {
      setPool(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const pubkey = new PublicKey(poolId);
      const fetchedPool = await client.fetchPool(pubkey);
      setPool(fetchedPool);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch pool");
    } finally {
      setLoading(false);
    }
  }, [client, poolId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { pool, loading, error, refresh };
}
