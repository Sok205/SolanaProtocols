use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, MintTo, Burn};

declare_id!("BRN4S8XoMF9qHFm5pLNKrudr9dY2ZssXKfzpTofZvNED");

// Integer square root using Babylonian method
fn integer_sqrt_u128(n: u128) -> u64 {
    if n == 0 {
        return 0;
    }
    let mut x = n;
    let mut y = (x + 1) / 2;
    while y < x {
        x = y;
        y = (x + n / x) / 2;
    }
    x as u64
}

#[program]
pub mod cpmm {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        pool.pool_creator = ctx.accounts.creator.key();
        pool.pool_authority = ctx.accounts.pool_authority.key();
        pool.token_a_mint_address = ctx.accounts.token_a_mint.key();
        pool.token_b_mint_address = ctx.accounts.token_b_mint.key();
        pool.token_a_vault_address = ctx.accounts.token_a_vault.key();
        pool.token_b_vault_address = ctx.accounts.token_b_vault.key();
        pool.lp_token_mint_address = ctx.accounts.lp_token_mint.key();
        pool.pool_authority_bump = ctx.bumps.pool_authority;

        Ok(())
    }

    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        amount_a: u64,
        amount_b: u64,
    ) -> Result<()> {
        let reserve_a = ctx.accounts.vault_a.amount;
        let reserve_b = ctx.accounts.vault_b.amount;
        let lp_supply = ctx.accounts.lp_mint.supply;

        let lp_to_mint = if lp_supply == 0 {
            integer_sqrt_u128((amount_a as u128).checked_mul(amount_b as u128).unwrap())
        } else {
            let lp_for_a = (amount_a as u128)
                .checked_mul(lp_supply as u128).unwrap()
                .checked_div(reserve_a as u128).unwrap() as u64;
            let lp_for_b = (amount_b as u128)
                .checked_mul(lp_supply as u128).unwrap()
                .checked_div(reserve_b as u128).unwrap() as u64;
            std::cmp::min(lp_for_a, lp_for_b)
        };

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_a.to_account_info(),
                    to: ctx.accounts.vault_a.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount_a,
        )?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_b.to_account_info(),
                    to: ctx.accounts.vault_b.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount_b,
        )?;
        
        let pool_key = ctx.accounts.pool.key();
        let seeds = &[
            b"authority",
            pool_key.as_ref(),
            &[ctx.accounts.pool.pool_authority_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.lp_mint.to_account_info(),
                    to: ctx.accounts.user_lp_account.to_account_info(),
                    authority: ctx.accounts.pool_authority.to_account_info(),
                },
                signer_seeds,
            ),
            lp_to_mint,
        )?;

        Ok(())
    }

    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        lp_amount: u64,
    ) -> Result<()> {
        let reserve_a = ctx.accounts.vault_a.amount;
        let reserve_b = ctx.accounts.vault_b.amount;
        let lp_supply = ctx.accounts.lp_mint.supply;
        
        let amount_a = (lp_amount as u128)
            .checked_mul(reserve_a as u128).unwrap()
            .checked_div(lp_supply as u128).unwrap() as u64;
        let amount_b = (lp_amount as u128)
            .checked_mul(reserve_b as u128).unwrap()
            .checked_div(lp_supply as u128).unwrap() as u64;

        let pool_key = ctx.accounts.pool.key();
        let seeds = &[
            b"authority",
            pool_key.as_ref(),
            &[ctx.accounts.pool.pool_authority_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.lp_mint.to_account_info(),
                    from: ctx.accounts.user_lp_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            lp_amount,
        )?;

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_a.to_account_info(),
                    to: ctx.accounts.user_token_a.to_account_info(),
                    authority: ctx.accounts.pool_authority.to_account_info(),
                },
                signer_seeds,
            ),
            amount_a,
        )?;

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_b.to_account_info(),
                    to: ctx.accounts.user_token_b.to_account_info(),
                    authority: ctx.accounts.pool_authority.to_account_info(),
                },
                signer_seeds,
            ),
            amount_b,
        )?;

        Ok(())
    }

    pub fn swap(
        ctx: Context<Swap>,
        amount_in: u64,
        a_to_b: bool,
    ) -> Result<()> {
        let reserve_a = ctx.accounts.vault_a.amount;
        let reserve_b = ctx.accounts.vault_b.amount;
        
        let (reserve_in, reserve_out) = if a_to_b {
            (reserve_a, reserve_b)
        } else {
            (reserve_b, reserve_a)
        };

        let amount_out = (amount_in as u128)
            .checked_mul(reserve_out as u128).unwrap()
            .checked_div((reserve_in as u128).checked_add(amount_in as u128).unwrap()).unwrap() as u64;

        let pool_key = ctx.accounts.pool.key();
        let seeds = &[
            b"authority",
            pool_key.as_ref(),
            &[ctx.accounts.pool.pool_authority_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        if a_to_b {
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.user_token_a.to_account_info(),
                        to: ctx.accounts.vault_a.to_account_info(),
                        authority: ctx.accounts.user.to_account_info(),
                    },
                ),
                amount_in,
            )?;

            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.vault_b.to_account_info(),
                        to: ctx.accounts.user_token_b.to_account_info(),
                        authority: ctx.accounts.pool_authority.to_account_info(),
                    },
                    signer_seeds,
                ),
                amount_out,
            )?;
        } else {
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.user_token_b.to_account_info(),
                        to: ctx.accounts.vault_b.to_account_info(),
                        authority: ctx.accounts.user.to_account_info(),
                    },
                ),
                amount_in,
            )?;
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.vault_a.to_account_info(),
                        to: ctx.accounts.user_token_a.to_account_info(),
                        authority: ctx.accounts.pool_authority.to_account_info(),
                    },
                    signer_seeds,
                ),
                amount_out,
            )?;
        }

        Ok(())
    }
}

#[account]
pub struct Pool {
    pub pool_creator: Pubkey,
    pub pool_authority: Pubkey,
    pub token_a_mint_address: Pubkey,
    pub token_b_mint_address: Pubkey,
    pub token_a_vault_address: Pubkey,
    pub token_b_vault_address: Pubkey,
    pub lp_token_mint_address: Pubkey,
    pub pool_authority_bump: u8,
}

impl Pool {
    // discriminator (8) + 7 Pubkeys (7 * 32) + 1 bump (1)
    pub const LEN: usize = 8 + (7 * 32) + 1;
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = creator, space = Pool::LEN)]
    pub pool: Account<'info, Pool>,

    /// CHECK: PDA that will be the authority for vaults and LP mint
    #[account(
        seeds = [b"authority", pool.key().as_ref()],
        bump,
    )]
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

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,

    /// CHECK: PDA authority for the pool
    #[account(
        seeds = [b"authority", pool.key().as_ref()],
        bump = pool.pool_authority_bump,
    )]
    pub pool_authority: AccountInfo<'info>,

    #[account(mut)]
    pub user_token_a: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_b: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_a: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_b: Account<'info, TokenAccount>,

    #[account(mut)]
    pub lp_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user_lp_account: Account<'info, TokenAccount>,

    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,

    /// CHECK: PDA authority for the pool
    #[account(
        seeds = [b"authority", pool.key().as_ref()],
        bump = pool.pool_authority_bump,
    )]
    pub pool_authority: AccountInfo<'info>,

    #[account(mut)]
    pub user_token_a: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_b: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_a: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_b: Account<'info, TokenAccount>,

    #[account(mut)]
    pub lp_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user_lp_account: Account<'info, TokenAccount>,

    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
}


#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,

    /// CHECK: PDA authority for the pool
    #[account(
        seeds = [b"authority", pool.key().as_ref()],
        bump = pool.pool_authority_bump,
    )]
    pub pool_authority: AccountInfo<'info>,

    #[account(mut)]
    pub user_token_a: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_b: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_a: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_b: Account<'info, TokenAccount>,

    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
}