"use client";

import { PoolExplorer } from "./PoolExplorer";
import { PoolDetail } from "./PoolDetail";
import { LearnCpmm } from "./LearnCpmm";

interface Props {
  slug: string[];
}

export function CpmmRoot({ slug }: Props) {
  const [section, id] = slug;

  if (!section) return <PoolExplorer />;
  if (section === "learn") return <LearnCpmm />;
  if (section === "pool" && id) return <PoolDetail poolId={id} />;

  return <PoolExplorer />;
}
