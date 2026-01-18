import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Cpmm } from "../target/types/cpmm";
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("cpmm", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.cpmm as Program<Cpmm>;
  const payer = (provider.wallet as anchor.Wallet).payer;

  let tokenAMint: PublicKey;
  let tokenBMint: PublicKey;
  let pool: Keypair;
  let poolAuthority: PublicKey;
  let poolAuthorityBump: number;
  let tokenAVault: Keypair;
  let tokenBVault: Keypair;
  let lpMint: Keypair;

  let userTokenA: PublicKey;
  let userTokenB: PublicKey;
  let userLpAccount: PublicKey;

  const DECIMALS = 9;
  const INITIAL_MINT_AMOUNT = 1_000_000 * 10 ** DECIMALS;

  before(async () => {
    tokenAMint = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      null,
      DECIMALS
    );

    tokenBMint = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      null,
      DECIMALS
    );

    userTokenA = await createAccount(
      provider.connection,
      payer,
      tokenAMint,
      payer.publicKey
    );

    userTokenB = await createAccount(
      provider.connection,
      payer,
      tokenBMint,
      payer.publicKey
    );

    await mintTo(
      provider.connection,
      payer,
      tokenAMint,
      userTokenA,
      payer,
      INITIAL_MINT_AMOUNT
    );

    await mintTo(
      provider.connection,
      payer,
      tokenBMint,
      userTokenB,
      payer,
      INITIAL_MINT_AMOUNT
    );

    pool = Keypair.generate();
    tokenAVault = Keypair.generate();
    tokenBVault = Keypair.generate();
    lpMint = Keypair.generate();

    // Derive pool authority PDA
    [poolAuthority, poolAuthorityBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("authority"), pool.publicKey.toBuffer()],
      program.programId
    );
  });

  it("initializes the pool", async () => {
    await program.methods
      .initialize()
      .accounts({
        pool: pool.publicKey,
        poolAuthority: poolAuthority,
        tokenAMint: tokenAMint,
        tokenBMint: tokenBMint,
        tokenAVault: tokenAVault.publicKey,
        tokenBVault: tokenBVault.publicKey,
        lpTokenMint: lpMint.publicKey,
        creator: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([pool, tokenAVault, tokenBVault, lpMint])
      .rpc();

    const poolAccount = await program.account.pool.fetch(pool.publicKey);
    assert.ok(poolAccount.poolCreator.equals(payer.publicKey));
    assert.ok(poolAccount.tokenAMintAddress.equals(tokenAMint));
    assert.ok(poolAccount.tokenBMintAddress.equals(tokenBMint));

    console.log("Pool initialized successfully!");
  });

  it("adds liquidity", async () => {
    userLpAccount = await createAccount(
      provider.connection,
      payer,
      lpMint.publicKey,
      payer.publicKey
    );

    const amountA = 100_000 * 10 ** DECIMALS;
    const amountB = 100_000 * 10 ** DECIMALS;

    await program.methods
      .addLiquidity(new anchor.BN(amountA), new anchor.BN(amountB))
      .accounts({
        pool: pool.publicKey,
        poolAuthority: poolAuthority,
        userTokenA: userTokenA,
        userTokenB: userTokenB,
        vaultA: tokenAVault.publicKey,
        vaultB: tokenBVault.publicKey,
        lpMint: lpMint.publicKey,
        userLpAccount: userLpAccount,
        user: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const vaultAAccount = await getAccount(provider.connection, tokenAVault.publicKey);
    const vaultBAccount = await getAccount(provider.connection, tokenBVault.publicKey);

    assert.equal(vaultAAccount.amount.toString(), amountA.toString());
    assert.equal(vaultBAccount.amount.toString(), amountB.toString());

    const lpAccount = await getAccount(provider.connection, userLpAccount);
    console.log(`LP tokens minted: ${lpAccount.amount}`);
    assert.ok(lpAccount.amount > 0n);

    console.log("Liquidity added successfully!");
  });

  it("swaps A for B", async () => {
    const swapAmount = 1_000 * 10 ** DECIMALS;

    const userBBefore = await getAccount(provider.connection, userTokenB);
    const vaultABefore = await getAccount(provider.connection, tokenAVault.publicKey);
    const vaultBBefore = await getAccount(provider.connection, tokenBVault.publicKey);

    await program.methods
      .swap(new anchor.BN(swapAmount), true)
      .accounts({
        pool: pool.publicKey,
        poolAuthority: poolAuthority,
        userTokenA: userTokenA,
        userTokenB: userTokenB,
        vaultA: tokenAVault.publicKey,
        vaultB: tokenBVault.publicKey,
        user: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const userBAfter = await getAccount(provider.connection, userTokenB);
    const vaultAAfter = await getAccount(provider.connection, tokenAVault.publicKey);
    const vaultBAfter = await getAccount(provider.connection, tokenBVault.publicKey);

    assert.ok(vaultAAfter.amount > vaultABefore.amount);
    assert.ok(vaultBAfter.amount < vaultBBefore.amount);
    assert.ok(userBAfter.amount > userBBefore.amount);

    const amountReceived = userBAfter.amount - userBBefore.amount;
    console.log(`Swapped ${swapAmount / 10 ** DECIMALS} Token A for ${Number(amountReceived) / 10 ** DECIMALS} Token B`);

    const kBefore = Number(vaultABefore.amount) * Number(vaultBBefore.amount);
    const kAfter = Number(vaultAAfter.amount) * Number(vaultBAfter.amount);
    console.log(`K before: ${kBefore}, K after: ${kAfter}`);

    console.log("Swap executed successfully!");
  });

  it("removes liquidity", async () => {
    const lpAccountBefore = await getAccount(provider.connection, userLpAccount);
    const lpAmount = lpAccountBefore.amount / 2n;

    const userABefore = await getAccount(provider.connection, userTokenA);
    const userBBefore = await getAccount(provider.connection, userTokenB);

    await program.methods
      .removeLiquidity(new anchor.BN(lpAmount.toString()))
      .accounts({
        pool: pool.publicKey,
        poolAuthority: poolAuthority,
        userTokenA: userTokenA,
        userTokenB: userTokenB,
        vaultA: tokenAVault.publicKey,
        vaultB: tokenBVault.publicKey,
        lpMint: lpMint.publicKey,
        userLpAccount: userLpAccount,
        user: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const userAAfter = await getAccount(provider.connection, userTokenA);
    const userBAfter = await getAccount(provider.connection, userTokenB);
    const lpAccountAfter = await getAccount(provider.connection, userLpAccount);

    assert.ok(lpAccountAfter.amount < lpAccountBefore.amount);
    assert.ok(userAAfter.amount > userABefore.amount);
    assert.ok(userBAfter.amount > userBBefore.amount);

    console.log(`Removed liquidity: ${lpAmount} LP tokens`);
    console.log(`Received: ${(userAAfter.amount - userABefore.amount)} Token A`);
    console.log(`Received: ${(userBAfter.amount - userBBefore.amount)} Token B`);

    console.log("Liquidity removed successfully!");
  });
});
