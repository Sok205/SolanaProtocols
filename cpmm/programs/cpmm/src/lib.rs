use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("9ksBfnBknijV8Tz5ejGPL8gJUSAFfody2UoueaLHmnw8");

//instructions will be defined here
#[program]
pub mod cpmm {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let mut pool = &mut ctx.accounts.pool;
        pool.pool_creator = ctx.accounts.creator.key();
        pool.pool_authority = ctx.accounts.pool_authority.key();
        pool.token_a_mint_address = ctx.accounts.token_a_mint.key();
        pool.token_b_mint_address = ctx.accounts.token_b_mint.key();
        pool.token_a_vault_address = ctx.accounts.token_a_vault.key();
        pool.token_b_vault_address = ctx.accounts.token_b_vault.key();
        pool.lp_token_mint_address = ctx.accounts.lp_token_mint.key();
        Ok(())
    }
}

#[account]
pub struct Pool{
    pool_creator: Pubkey,
    pool_authority: Pubkey,
    token_a_mint_address: Pubkey,
    token_b_mint_address: Pubkey,
    token_a_vault_address: Pubkey,
    token_b_vault_address: Pubkey,
    lp_token_mint_address: Pubkey,
}

impl Pool{
    // discriminator + Number of accounts * len of Pubkey
    pub const LEN: usize = 8 + (7 * 32);
}

#[derive(Accounts)]
pub struct Initialize<'info>{
    #[account(init, payer = creator, space = Pool::LEN)]
    pub pool: Account<'info, Pool>,
    pub pool_authority: AccountInfo<'info>,
    pub token_a_mint: Account<'info, Mint>,
    pub token_b_mint: Account<'info, Mint>,
    #[account(
      init,
      payer = creator,
      token::mint = token_a_mint,
      token::authority = pool_authority,
    )]
    pub token_a_vault: Account<'info, TokenAccount>,
    #[account(
      init,
      payer = creator,
      token::mint = token_b_mint,
      token::authority = pool_authority,
    )]
    pub token_b_vault: Account<'info, TokenAccount>,
    #[account(
      init,
      payer = creator,
      mint::decimals = 9,
      mint::authority = pool_authority,
    )]
    pub lp_token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

