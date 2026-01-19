"use client";

import Link from "next/link";
import { TerminalWindow, TerminalButton, FormulaBreakdown } from "@/components/shared";

export function LearnCpmm() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <Link href="/protocols/cpmm" className="text-terminal-muted hover:text-terminal text-sm">
          &lt; cd ../pools
        </Link>
        <h1 className="text-xl uppercase glow mt-2">CPMM TUTORIAL</h1>
        <p className="text-terminal-muted text-sm mt-1">
          // constant product market maker fundamentals
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: The Formula */}
        <TerminalWindow title="LESSON 1: THE CORE FORMULA" status="ok">
          <div className="space-y-4">
            <div className="text-terminal-muted text-sm">
              // A CPMM maintains a constant product of two token reserves.
              // This simple invariant enables automated price discovery.
            </div>

            <div className="border border-terminal p-4 text-center">
              <div className="text-2xl text-terminal glow-strong">
                x × y = k
              </div>
            </div>

            <div className="text-sm space-y-1">
              <div className="text-terminal-muted">// where:</div>
              <div className="pl-3">
                <span className="text-terminal">x</span>
                <span className="text-terminal-muted"> = reserve of token A</span>
              </div>
              <div className="pl-3">
                <span className="text-terminal">y</span>
                <span className="text-terminal-muted"> = reserve of token B</span>
              </div>
              <div className="pl-3">
                <span className="text-terminal">k</span>
                <span className="text-terminal-muted"> = constant product (invariant)</span>
              </div>
            </div>
          </div>
        </TerminalWindow>

        {/* Section 2: Swap Math */}
        <TerminalWindow title="LESSON 2: SWAP CALCULATION" status="ok">
          <div className="space-y-4">
            <div className="text-terminal-muted text-sm">
              // When swapping, we calculate output tokens while preserving k.
            </div>

            <FormulaBreakdown
              title="SWAP FORMULA DERIVATION"
              steps={[
                { label: "Constant product", formula: "x × y = k" },
                { label: "After swap", formula: "(x + Δx)(y - Δy) = k" },
                { label: "Solve for output", formula: "Δy = (Δx × y) / (x + Δx)", highlight: true },
              ]}
            />

            <div className="text-terminal-muted text-sm">
              // example: swap 100 A when reserves are 1000 A / 2000 B
            </div>
            <div className="border border-terminal p-3 text-sm space-y-1">
              <div><span className="text-terminal-muted">&gt;</span> <span className="text-terminal">Δy = (100 × 2000) / (1000 + 100)</span></div>
              <div><span className="text-terminal-muted">&gt;</span> <span className="text-terminal">Δy = 200000 / 1100</span></div>
              <div><span className="text-terminal-muted">&gt;</span> <span className="text-terminal glow">Δy = 181.82 B</span></div>
            </div>
          </div>
        </TerminalWindow>

        {/* Section 3: LP Tokens */}
        <TerminalWindow title="LESSON 3: LIQUIDITY PROVIDER TOKENS" status="ok">
          <div className="space-y-4">
            <div className="text-terminal-muted text-sm">
              // LP tokens represent your share of the pool.
              // Initial depositors set the price; subsequent deposits match the ratio.
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-terminal p-3">
                <div className="text-terminal-muted text-xs uppercase mb-2">// initial deposit</div>
                <div className="text-terminal glow">LP = sqrt(A × B)</div>
              </div>
              <div className="border border-terminal p-3">
                <div className="text-terminal-muted text-xs uppercase mb-2">// subsequent deposits</div>
                <div className="text-terminal glow text-sm">LP = min((A×S)/R_A, (B×S)/R_B)</div>
              </div>
            </div>

            <div className="text-terminal-muted text-sm">
              // S = total LP supply, R_A and R_B = current reserves
            </div>
          </div>
        </TerminalWindow>

        {/* Section 4: Price Impact */}
        <TerminalWindow title="LESSON 4: PRICE IMPACT" status="ok">
          <div className="space-y-4">
            <div className="text-terminal-muted text-sm">
              // Larger trades relative to pool size cause more price impact.
              // The curve shape means infinite liquidity at increasingly worse prices.
            </div>

            <div className="border border-terminal p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-terminal-muted">SPOT_PRICE:</span>
                <span className="text-terminal">P = y / x</span>
              </div>
              <div className="text-terminal-muted text-xs">
                // price after trade differs from spot - this is price impact
              </div>
            </div>

            <div className="text-sm space-y-1">
              <div className="text-terminal-muted">// impact visualization:</div>
              <div className="pl-3 text-terminal">Small trade (1%):  [■░░░░░░░░░] ~0.5% impact</div>
              <div className="pl-3 text-terminal-amber">Medium trade (10%): [■■■░░░░░░░] ~5% impact</div>
              <div className="pl-3 text-terminal-error">Large trade (50%):  [■■■■■■■░░░] ~33% impact</div>
            </div>
          </div>
        </TerminalWindow>

        {/* CTA */}
        <div className="text-center py-4">
          <div className="text-terminal-muted mb-4">
            &gt; ready to experiment?
          </div>
          <Link href="/protocols/cpmm">
            <TerminalButton>TRY IT WITH REAL POOLS</TerminalButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
