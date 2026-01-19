import { ProtocolManifest } from "../types";
import { CpmmRoot } from "./pages/CpmmRoot";

export const cpmm: ProtocolManifest = {
  id: "cpmm",
  name: "Constant Product AMM",
  description: "Learn x*y=k liquidity pools and automated market making",
  icon: "🔄",
  concepts: ["liquidity pools", "constant product", "slippage", "impermanent loss", "LP tokens"],
  difficulty: "beginner",
  prerequisites: [],
  RootComponent: CpmmRoot,
};
