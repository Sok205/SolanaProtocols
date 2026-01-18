use anchor_lang::prelude::*;

declare_id!("9ksBfnBknijV8Tz5ejGPL8gJUSAFfody2UoueaLHmnw8");

#[program]
pub mod cpmm {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
