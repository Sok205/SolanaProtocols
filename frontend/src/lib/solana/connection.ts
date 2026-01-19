import { clusterApiUrl, Connection } from "@solana/web3.js";

export const DEVNET_RPC_URL = clusterApiUrl("devnet");

export const connection = new Connection(DEVNET_RPC_URL, "confirmed");

export const PROGRAM_ID = "BRN4S8XoMF9qHFm5pLNKrudr9dY2ZssXKfzpTofZvNED";
