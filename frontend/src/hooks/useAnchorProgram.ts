"use client";

import { useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "@/protocols/cpmm/lib/idl.json";
import { Cpmm } from "@/protocols/cpmm/lib/types";
import { PROGRAM_ID } from "@/lib/solana/connection";

export function useAnchorProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }
    return new AnchorProvider(
      connection,
      wallet as unknown as Wallet,
      AnchorProvider.defaultOptions()
    );
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program<Cpmm>(
      idl as Cpmm,
      provider
    );
  }, [provider]);

  return {
    program,
    provider,
    programId: new PublicKey(PROGRAM_ID),
    connected: wallet.connected,
    publicKey: wallet.publicKey,
  };
}
