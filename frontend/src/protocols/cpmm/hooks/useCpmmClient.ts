"use client";

import { useMemo } from "react";
import { useAnchorProgram } from "@/hooks/useAnchorProgram";
import { CpmmClient } from "../lib/client";

export function useCpmmClient() {
  const { program, connected, publicKey } = useAnchorProgram();

  const client = useMemo(() => {
    if (!program) return null;
    return new CpmmClient(program);
  }, [program]);

  return { client, connected, publicKey };
}
