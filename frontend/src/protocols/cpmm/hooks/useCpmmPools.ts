"use client";

import { useEffect, useState, useCallback } from "react";
import { useCpmmClient } from "./useCpmmClient";
import { PoolData } from "../lib/client";

export function useCpmmPools() {
  const { client } = useCpmmClient();
  const [pools, setPools] = useState<PoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!client) {
      setPools([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedPools = await client.fetchAllPools();
      setPools(fetchedPools);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch pools");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { pools, loading, error, refresh };
}
