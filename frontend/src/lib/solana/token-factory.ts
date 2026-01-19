import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getAccount,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface TokenInfo {
  name: string;
  symbol: string;
}

export interface TokenPair {
  a: TokenInfo;
  b: TokenInfo;
}

export interface CreatedToken {
  mint: PublicKey;
  name: string;
  symbol: string;
}

// ============================================================================
// Token Pairs Constant
// ============================================================================

export const TOKEN_PAIRS: TokenPair[] = [
  { a: { name: "Coffee", symbol: "COFFEE" }, b: { name: "Donut", symbol: "DONUT" } },
  { a: { name: "Moon", symbol: "MOON" }, b: { name: "Lambo", symbol: "LAMBO" } },
  { a: { name: "Pizza", symbol: "PIZZA" }, b: { name: "Beer", symbol: "BEER" } },
  { a: { name: "Cats", symbol: "CATS" }, b: { name: "Dogs", symbol: "DOGS" } },
  { a: { name: "Fire", symbol: "FIRE" }, b: { name: "Ice", symbol: "ICE" } },
  { a: { name: "Gold", symbol: "GOLD" }, b: { name: "Silver", symbol: "SILVER" } },
  { a: { name: "Sun", symbol: "SUN" }, b: { name: "Stars", symbol: "STARS" } },
  { a: { name: "Taco", symbol: "TACO" }, b: { name: "Burrito", symbol: "BURRITO" } },
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Pick a random token pair from the predefined list
 */
export function pickRandomPair(): TokenPair {
  const index = Math.floor(Math.random() * TOKEN_PAIRS.length);
  return TOKEN_PAIRS[index];
}

// ============================================================================
// Transaction Builders
// ============================================================================

/**
 * Build a transaction to create a new SPL token mint.
 * Returns the transaction and the mint keypair (caller must sign with mint keypair).
 *
 * @param connection - Solana connection
 * @param payer - PublicKey of the fee payer and mint authority
 * @param decimals - Number of decimals for the token (default: 9)
 */
export async function buildCreateTokenTransaction(
  connection: Connection,
  payer: PublicKey,
  decimals: number = 9
): Promise<{ transaction: Transaction; mint: Keypair }> {
  const mint = Keypair.generate();

  // Get minimum lamports for rent exemption
  const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: payer,
    blockhash,
    lastValidBlockHeight,
  });

  // Create the mint account
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  // Initialize the mint
  transaction.add(
    createInitializeMintInstruction(
      mint.publicKey,
      decimals,
      payer, // mint authority
      payer // freeze authority (can be null if not needed)
    )
  );

  return { transaction, mint };
}

/**
 * Build a transaction to mint tokens to a recipient.
 * Creates the ATA if it doesn't exist.
 *
 * @param connection - Solana connection
 * @param payer - PublicKey of the fee payer and mint authority
 * @param mint - PublicKey of the token mint
 * @param amount - Amount of tokens to mint (in base units)
 */
export async function buildMintToTransaction(
  connection: Connection,
  payer: PublicKey,
  mint: PublicKey,
  amount: bigint
): Promise<Transaction> {
  // Get or create the ATA for the payer
  const { address: ata, instruction: createAtaIx } = await getOrCreateATA(
    connection,
    payer,
    mint
  );

  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: payer,
    blockhash,
    lastValidBlockHeight,
  });

  // Add create ATA instruction if needed
  if (createAtaIx) {
    transaction.add(createAtaIx);
  }

  // Add mint-to instruction
  transaction.add(
    createMintToInstruction(
      mint,
      ata,
      payer, // mint authority
      amount
    )
  );

  return transaction;
}

/**
 * Get the Associated Token Account address for a given mint and owner.
 * Returns the ATA address and an instruction to create it if it doesn't exist.
 *
 * @param connection - Solana connection
 * @param payer - PublicKey of the fee payer (for creating ATA if needed)
 * @param mint - PublicKey of the token mint
 * @param owner - PublicKey of the token account owner (defaults to payer)
 */
export async function getOrCreateATA(
  connection: Connection,
  payer: PublicKey,
  mint: PublicKey,
  owner?: PublicKey
): Promise<{ address: PublicKey; instruction: TransactionInstruction | null }> {
  const ownerPubkey = owner ?? payer;

  // Derive the ATA address
  const ata = await getAssociatedTokenAddress(
    mint,
    ownerPubkey,
    false, // allowOwnerOffCurve
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Check if the ATA already exists
  try {
    await getAccount(connection, ata);
    // Account exists, no instruction needed
    return { address: ata, instruction: null };
  } catch {
    // Account doesn't exist, create instruction
    const instruction = createAssociatedTokenAccountInstruction(
      payer,
      ata,
      ownerPubkey,
      mint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    return { address: ata, instruction };
  }
}
