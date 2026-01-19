import { Connection, PublicKey, Transaction, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import {
  pickRandomPair,
  buildCreateTokenTransaction,
  buildMintToTransaction,
  getOrCreateATA,
} from "@/lib/solana/token-factory";
import { CpmmClient, PoolData } from "./client";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface DemoPoolResult {
  pool: PoolData;
  tokenA: { mint: PublicKey; symbol: string };
  tokenB: { mint: PublicKey; symbol: string };
  userBalanceA: BN;
  userBalanceB: BN;
  poolReserveA: BN;
  poolReserveB: BN;
  lpTokens: BN;
}

export interface DemoPoolProgress {
  step: string;
  completed: string[];
}

export type ProgressCallback = (progress: DemoPoolProgress) => void;

export interface WalletAdapter {
  publicKey: PublicKey;
  signTransaction: <T extends Transaction>(transaction: T) => Promise<T>;
  signAllTransactions: <T extends Transaction>(transactions: T[]) => Promise<T[]>;
}

// ============================================================================
// Constants
// ============================================================================

export const POOL_INITIAL_AMOUNT = 1000;
export const USER_INITIAL_AMOUNT = 100;
export const DECIMALS = 9;

// ============================================================================
// Demo Pool Creation
// ============================================================================

/**
 * Create a demo pool with random token pair.
 * Orchestrates: create tokens -> mint tokens -> create pool -> add liquidity
 */
export async function createDemoPool(
  client: CpmmClient,
  connection: Connection,
  wallet: WalletAdapter,
  onProgress?: ProgressCallback
): Promise<DemoPoolResult> {
  const completedSteps: string[] = [];

  const reportProgress = (step: string) => {
    if (onProgress) {
      onProgress({ step, completed: [...completedSteps] });
    }
  };

  // Step 1: Pick random token pair
  reportProgress("Picking random token pair");
  const tokenPair = pickRandomPair();
  completedSteps.push("Picked token pair");

  // Step 2: Build and sign transactions to create both token mints
  reportProgress("Creating token mints");
  const [createTokenATx, createTokenBTx] = await Promise.all([
    buildCreateTokenTransaction(connection, wallet.publicKey, DECIMALS),
    buildCreateTokenTransaction(connection, wallet.publicKey, DECIMALS),
  ]);

  const mintAKeypair = createTokenATx.mint;
  const mintBKeypair = createTokenBTx.mint;

  // Partial sign with mint keypairs
  createTokenATx.transaction.partialSign(mintAKeypair);
  createTokenBTx.transaction.partialSign(mintBKeypair);

  // Wallet signs both transactions
  const signedCreateTxs = await wallet.signAllTransactions([
    createTokenATx.transaction,
    createTokenBTx.transaction,
  ]);

  // Step 3: Send create token transactions
  reportProgress("Sending create token transactions");
  const [sigA, sigB] = await Promise.all([
    connection.sendRawTransaction(signedCreateTxs[0].serialize()),
    connection.sendRawTransaction(signedCreateTxs[1].serialize()),
  ]);

  // Wait for confirmations
  await Promise.all([
    connection.confirmTransaction(sigA, "confirmed"),
    connection.confirmTransaction(sigB, "confirmed"),
  ]);
  completedSteps.push("Created token mints");

  // Step 4: Build and sign transactions to mint tokens
  // Total amount: POOL_INITIAL_AMOUNT + USER_INITIAL_AMOUNT for each token
  reportProgress("Minting tokens");
  const totalAmount = BigInt(POOL_INITIAL_AMOUNT + USER_INITIAL_AMOUNT) * BigInt(10 ** DECIMALS);

  const [mintToATx, mintToBTx] = await Promise.all([
    buildMintToTransaction(connection, wallet.publicKey, mintAKeypair.publicKey, totalAmount, DECIMALS),
    buildMintToTransaction(connection, wallet.publicKey, mintBKeypair.publicKey, totalAmount, DECIMALS),
  ]);

  const signedMintTxs = await wallet.signAllTransactions([mintToATx, mintToBTx]);

  const [mintSigA, mintSigB] = await Promise.all([
    connection.sendRawTransaction(signedMintTxs[0].serialize()),
    connection.sendRawTransaction(signedMintTxs[1].serialize()),
  ]);

  await Promise.all([
    connection.confirmTransaction(mintSigA, "confirmed"),
    connection.confirmTransaction(mintSigB, "confirmed"),
  ]);
  completedSteps.push("Minted tokens");

  // Step 5: Initialize pool
  reportProgress("Initializing pool");
  const { pool: poolKeypair } = await client.initializePool(
    mintAKeypair.publicKey,
    mintBKeypair.publicKey
  );
  completedSteps.push("Initialized pool");

  // Fetch pool data
  const poolData = await client.fetchPool(poolKeypair.publicKey);
  if (!poolData) {
    throw new Error("Failed to fetch pool after initialization");
  }

  // Step 6: Create LP token account if needed
  reportProgress("Creating LP token account");
  const { address: userLpAccount, instruction: createLpAtaIx } = await getOrCreateATA(
    connection,
    wallet.publicKey,
    poolData.lpTokenMint
  );

  if (createLpAtaIx) {
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const createLpAtaTx = new Transaction({
      feePayer: wallet.publicKey,
      blockhash,
      lastValidBlockHeight,
    });
    createLpAtaTx.add(createLpAtaIx);

    const signedLpAtaTx = await wallet.signTransaction(createLpAtaTx);
    const lpAtaSig = await connection.sendRawTransaction(signedLpAtaTx.serialize());
    await connection.confirmTransaction(lpAtaSig, "confirmed");
  }
  completedSteps.push("Created LP token account");

  // Step 7: Add liquidity with POOL_INITIAL_AMOUNT each
  reportProgress("Adding liquidity");
  const poolAmount = new BN(POOL_INITIAL_AMOUNT).mul(new BN(10 ** DECIMALS));

  // Get user token accounts
  const [userTokenA, userTokenB] = await Promise.all([
    getAssociatedTokenAddress(mintAKeypair.publicKey, wallet.publicKey),
    getAssociatedTokenAddress(mintBKeypair.publicKey, wallet.publicKey),
  ]);

  await client.addLiquidity(poolData, poolAmount, poolAmount, userTokenA, userTokenB, userLpAccount);
  completedSteps.push("Added liquidity");

  // Step 8: Fetch final pool state and return result
  reportProgress("Fetching final state");
  const finalPool = await client.fetchPool(poolKeypair.publicKey);
  if (!finalPool) {
    throw new Error("Failed to fetch pool after adding liquidity");
  }

  // Calculate user balances (USER_INITIAL_AMOUNT remaining after adding to pool)
  const userBalanceAmount = new BN(USER_INITIAL_AMOUNT).mul(new BN(10 ** DECIMALS));

  completedSteps.push("Demo pool created");

  return {
    pool: finalPool,
    tokenA: { mint: mintAKeypair.publicKey, symbol: tokenPair.a.symbol },
    tokenB: { mint: mintBKeypair.publicKey, symbol: tokenPair.b.symbol },
    userBalanceA: userBalanceAmount,
    userBalanceB: userBalanceAmount,
    poolReserveA: finalPool.reserveA,
    poolReserveB: finalPool.reserveB,
    lpTokens: finalPool.lpSupply,
  };
}
