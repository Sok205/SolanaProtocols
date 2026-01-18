# Constant Product Formula
- A pool holds two tokens: Token A (x) and Token B (y)
- The product ___x*y=k___ must remain the same after transaction
- When you add Token A, you must remove Token B (and vice versa) to keep k constant

# Example 
- Pool starts with: 100 SOL x 10,000 USDC = 1,000,000 (k)

- We want to buy SOL with 1000 USDC:
    - Pool now has: 11,000 USDC
    - To maintain k: x = 1,000,000 / 11,000 = 90.91 SOL
    - We receive 100 - 90.91 = 9.09 SOL

We paid 110 USDC per SOL, not. This is called slippage, because larger prices move the price more

# Price Discover:
- Price A in terms of B = reserve_b / reserve_a

# We do not trade at a fixed price. We trade along the curve, and each unit we buy pushes the price higher for the next unit


# How to build our own protocol?
- We are going to be implementing these instructions:
┌──────────────────┬─────────────────────────────────────┐
│   Instruction    │            What it does             │
├──────────────────┼─────────────────────────────────────┤
│ initialize       │ Create pool, set token mints        │
├──────────────────┼─────────────────────────────────────┤
│ add_liquidity    │ Deposit tokens A+B, mint LP tokens  │
├──────────────────┼─────────────────────────────────────┤
│ remove_liquidity │ Burn LP tokens, withdraw tokens A+B │
├──────────────────┼─────────────────────────────────────┤
│ swap             │ Trade A↔B using x*y=k               │
└──────────────────┴─────────────────────────────────────┘

## Start
- initialize anchor project
  - anchor init <name_name_of_the_project>

## Structure of anchor project 
