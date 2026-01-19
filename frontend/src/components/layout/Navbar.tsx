"use client";

import Link from "next/link";
import { WalletButton } from "@/components/wallet/WalletButton";

export function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Solana Protocol Economics
        </Link>
        <WalletButton />
      </div>
    </nav>
  );
}
