"use client";

import Link from "next/link";
import { MathDisplay, FormulaBreakdown } from "@/components/shared";

export function LearnCpmm() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/protocols/cpmm" className="text-purple-400 hover:underline text-sm">
        ← Back to pools
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-6">Learn: Constant Product Market Maker</h1>

      <div className="space-y-8">
        {/* Section 1: The Formula */}
        <section className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">The Core Formula</h2>
          <p className="text-gray-300 mb-4">
            A CPMM maintains a constant product of two token reserves. This simple
            invariant enables automated price discovery.
          </p>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <MathDisplay formula="x \times y = k" block />
          </div>
          <p className="text-gray-400 mt-4 text-sm">
            Where <MathDisplay formula="x" /> and <MathDisplay formula="y" /> are
            token reserves, and <MathDisplay formula="k" /> is the constant product.
          </p>
        </section>

        {/* Section 2: Swap Math */}
        <section className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Swap Calculation</h2>
          <p className="text-gray-300 mb-4">
            When swapping, we calculate how many output tokens to give while
            preserving the constant product.
          </p>
          <FormulaBreakdown
            title="Swap Formula Derivation"
            steps={[
              { label: "Constant product", formula: "x \\times y = k" },
              { label: "After swap", formula: "(x + \\Delta x)(y - \\Delta y) = k" },
              { label: "Solving for output", formula: "\\Delta y = \\frac{\\Delta x \\times y}{x + \\Delta x}", highlight: true },
            ]}
          />
        </section>

        {/* Section 3: LP Tokens */}
        <section className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Liquidity Provider Tokens</h2>
          <p className="text-gray-300 mb-4">
            LP tokens represent your share of the pool. Initial depositors set the
            price; subsequent deposits must match the ratio.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <FormulaBreakdown
              title="Initial Deposit"
              steps={[
                { label: "LP tokens", formula: "LP = \\sqrt{A \\times B}", highlight: true },
              ]}
            />
            <FormulaBreakdown
              title="Subsequent Deposits"
              steps={[
                { label: "LP tokens", formula: "LP = \\min\\left(\\frac{A \\times S}{R_A}, \\frac{B \\times S}{R_B}\\right)", highlight: true },
              ]}
            />
          </div>
        </section>

        {/* Section 4: Price Impact */}
        <section className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Price Impact & Slippage</h2>
          <p className="text-gray-300 mb-4">
            Larger trades relative to pool size cause more price impact. The curve
            shape means infinite liquidity at increasingly worse prices.
          </p>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400">
              Spot price: <MathDisplay formula="P = \frac{y}{x}" />
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Price after trade differs from spot price - this difference is the
              price impact.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-4">
          <Link
            href="/protocols/cpmm"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
          >
            Try it with real pools →
          </Link>
        </div>
      </div>
    </div>
  );
}
