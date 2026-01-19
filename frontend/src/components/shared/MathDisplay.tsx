// src/components/shared/MathDisplay.tsx
"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface MathDisplayProps {
  formula: string;
  block?: boolean;
  className?: string;
}

export function MathDisplay({ formula, block = false, className }: MathDisplayProps) {
  const Component = block ? BlockMath : InlineMath;
  return (
    <span className={className}>
      <Component math={formula} />
    </span>
  );
}
