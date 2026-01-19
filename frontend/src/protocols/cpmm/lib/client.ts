import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";
import { Cpmm } from "./types";

export interface PoolData {
  publicKey: PublicKey;
  poolCreator: PublicKey;
  poolAuthority: PublicKey;
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  tokenAVault: PublicKey;
  tokenBVault: PublicKey;
  lpTokenMint: PublicKey;
  poolAuthorityBump: number;
  reserveA: BN;
  reserveB: BN;
  lpSupply: BN;
}

export class CpmmClient {
  constructor(private program: Program<Cpmm>) {}

  /**
   * Derive pool authority PDA
   */
  getPoolAuthority(poolPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("authority"), poolPubkey.toBuffer()],
      this.program.programId
    );
  }

  /**
   * Fetch all pools
   */
  async fetchAllPools(): Promise<PoolData[]> {
    const pools = await this.program.account.pool.all();
    const poolsWithReserves = await Promise.all(
      pools.map(async (pool) => {
        const [reserveA, reserveB, lpSupply] = await this.fetchPoolReserves(
          pool.account.tokenAVaultAddress,
          pool.account.tokenBVaultAddress,
          pool.account.lpTokenMintAddress
        );
        return {
          publicKey: pool.publicKey,
          poolCreator: pool.account.poolCreator,
          poolAuthority: pool.account.poolAuthority,
          tokenAMint: pool.account.tokenAMintAddress,
          tokenBMint: pool.account.tokenBMintAddress,
          tokenAVault: pool.account.tokenAVaultAddress,
          tokenBVault: pool.account.tokenBVaultAddress,
          lpTokenMint: pool.account.lpTokenMintAddress,
          poolAuthorityBump: pool.account.poolAuthorityBump,
          reserveA,
          reserveB,
          lpSupply,
        };
      })
    );
    return poolsWithReserves;
  }

  /**
   * Fetch single pool by public key
   */
  async fetchPool(poolPubkey: PublicKey): Promise<PoolData | null> {
    try {
      const pool = await this.program.account.pool.fetch(poolPubkey);
      const [reserveA, reserveB, lpSupply] = await this.fetchPoolReserves(
        pool.tokenAVaultAddress,
        pool.tokenBVaultAddress,
        pool.lpTokenMintAddress
      );
      return {
        publicKey: poolPubkey,
        poolCreator: pool.poolCreator,
        poolAuthority: pool.poolAuthority,
        tokenAMint: pool.tokenAMintAddress,
        tokenBMint: pool.tokenBMintAddress,
        tokenAVault: pool.tokenAVaultAddress,
        tokenBVault: pool.tokenBVaultAddress,
        lpTokenMint: pool.lpTokenMintAddress,
        poolAuthorityBump: pool.poolAuthorityBump,
        reserveA,
        reserveB,
        lpSupply,
      };
    } catch {
      return null;
    }
  }

  /**
   * Initialize a new pool
   */
  async initializePool(
    tokenAMint: PublicKey,
    tokenBMint: PublicKey
  ): Promise<{ pool: Keypair; signature: string }> {
    const pool = Keypair.generate();
    const tokenAVault = Keypair.generate();
    const tokenBVault = Keypair.generate();
    const lpMint = Keypair.generate();

    const signature = await this.program.methods
      .initialize()
      .accounts({
        pool: pool.publicKey,
        tokenAMint: tokenAMint,
        tokenBMint: tokenBMint,
        tokenAVault: tokenAVault.publicKey,
        tokenBVault: tokenBVault.publicKey,
        lpTokenMint: lpMint.publicKey,
        creator: this.program.provider.publicKey!,
      })
      .signers([pool, tokenAVault, tokenBVault, lpMint])
      .rpc();

    return { pool, signature };
  }

  /**
   * Add liquidity to pool
   */
  async addLiquidity(
    pool: PoolData,
    amountA: BN,
    amountB: BN,
    userTokenA: PublicKey,
    userTokenB: PublicKey,
    userLpAccount: PublicKey
  ): Promise<string> {
    return this.program.methods
      .addLiquidity(amountA, amountB)
      .accounts({
        pool: pool.publicKey,
        userTokenA: userTokenA,
        userTokenB: userTokenB,
        vaultA: pool.tokenAVault,
        vaultB: pool.tokenBVault,
        lpMint: pool.lpTokenMint,
        userLpAccount: userLpAccount,
        user: this.program.provider.publicKey!,
      })
      .rpc();
  }

  /**
   * Remove liquidity from pool
   */
  async removeLiquidity(
    pool: PoolData,
    lpAmount: BN,
    userTokenA: PublicKey,
    userTokenB: PublicKey,
    userLpAccount: PublicKey
  ): Promise<string> {
    return this.program.methods
      .removeLiquidity(lpAmount)
      .accounts({
        pool: pool.publicKey,
        userTokenA: userTokenA,
        userTokenB: userTokenB,
        vaultA: pool.tokenAVault,
        vaultB: pool.tokenBVault,
        lpMint: pool.lpTokenMint,
        userLpAccount: userLpAccount,
        user: this.program.provider.publicKey!,
      })
      .rpc();
  }

  /**
   * Swap tokens
   */
  async swap(
    pool: PoolData,
    amountIn: BN,
    aToB: boolean,
    userTokenA: PublicKey,
    userTokenB: PublicKey
  ): Promise<string> {
    return this.program.methods
      .swap(amountIn, aToB)
      .accounts({
        pool: pool.publicKey,
        userTokenA: userTokenA,
        userTokenB: userTokenB,
        vaultA: pool.tokenAVault,
        vaultB: pool.tokenBVault,
        user: this.program.provider.publicKey!,
      })
      .rpc();
  }

  private async fetchPoolReserves(
    vaultA: PublicKey,
    vaultB: PublicKey,
    lpMint: PublicKey
  ): Promise<[BN, BN, BN]> {
    const connection = this.program.provider.connection;
    const [vaultAInfo, vaultBInfo, lpMintInfo] = await Promise.all([
      getAccount(connection, vaultA),
      getAccount(connection, vaultB),
      connection.getTokenSupply(lpMint),
    ]);
    return [
      new BN(vaultAInfo.amount.toString()),
      new BN(vaultBInfo.amount.toString()),
      new BN(lpMintInfo.value.amount),
    ];
  }
}
