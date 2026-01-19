import BN from "bn.js";

/**
 * Calculate swap output using constant product formula
 * output = (amountIn * reserveOut) / (reserveIn + amountIn)
 */
export function calculateSwapOutput(
  amountIn: BN,
  reserveIn: BN,
  reserveOut: BN
): BN {
  if (amountIn.isZero() || reserveIn.isZero() || reserveOut.isZero()) {
    return new BN(0);
  }
  const numerator = amountIn.mul(reserveOut);
  const denominator = reserveIn.add(amountIn);
  return numerator.div(denominator);
}

/**
 * Calculate initial LP tokens using geometric mean
 * lpTokens = sqrt(amountA * amountB)
 */
export function calculateInitialLpTokens(amountA: BN, amountB: BN): BN {
  const product = amountA.mul(amountB);
  return sqrt(product);
}

/**
 * Calculate proportional LP tokens for subsequent deposits
 * lpTokens = min((amountA * lpSupply) / reserveA, (amountB * lpSupply) / reserveB)
 */
export function calculateProportionalLpTokens(
  amountA: BN,
  amountB: BN,
  reserveA: BN,
  reserveB: BN,
  lpSupply: BN
): BN {
  if (lpSupply.isZero()) {
    return calculateInitialLpTokens(amountA, amountB);
  }
  const lpForA = amountA.mul(lpSupply).div(reserveA);
  const lpForB = amountB.mul(lpSupply).div(reserveB);
  return BN.min(lpForA, lpForB);
}

/**
 * Calculate tokens received when removing liquidity
 * amountA = (lpAmount * reserveA) / lpSupply
 * amountB = (lpAmount * reserveB) / lpSupply
 */
export function calculateRemoveLiquidityAmounts(
  lpAmount: BN,
  reserveA: BN,
  reserveB: BN,
  lpSupply: BN
): { amountA: BN; amountB: BN } {
  if (lpSupply.isZero()) {
    return { amountA: new BN(0), amountB: new BN(0) };
  }
  const amountA = lpAmount.mul(reserveA).div(lpSupply);
  const amountB = lpAmount.mul(reserveB).div(lpSupply);
  return { amountA, amountB };
}

/**
 * Calculate price impact percentage
 */
export function calculatePriceImpact(
  amountIn: BN,
  reserveIn: BN,
  reserveOut: BN
): number {
  if (reserveIn.isZero() || reserveOut.isZero()) return 0;

  const spotPrice = reserveOut.mul(new BN(1e9)).div(reserveIn);
  const output = calculateSwapOutput(amountIn, reserveIn, reserveOut);
  const executionPrice = output.mul(new BN(1e9)).div(amountIn);

  const impact = spotPrice.sub(executionPrice).mul(new BN(10000)).div(spotPrice);
  return impact.toNumber() / 100;
}

/**
 * Integer square root using Babylonian method
 */
function sqrt(n: BN): BN {
  if (n.isZero()) return new BN(0);

  let x = n;
  let y = x.add(new BN(1)).div(new BN(2));

  while (y.lt(x)) {
    x = y;
    y = x.add(n.div(x)).div(new BN(2));
  }

  return x;
}

/**
 * Format token amount for display (assumes 9 decimals)
 */
export function formatTokenAmount(amount: BN, decimals = 9): string {
  const divisor = new BN(10).pow(new BN(decimals));
  const whole = amount.div(divisor);
  const remainder = amount.mod(divisor);
  const remainderStr = remainder.toString().padStart(decimals, "0").slice(0, 4);
  return `${whole.toString()}.${remainderStr}`;
}

/**
 * Parse token amount from string (assumes 9 decimals)
 */
export function parseTokenAmount(amount: string, decimals = 9): BN {
  const [whole, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return new BN(whole + paddedFraction);
}
